import torch
from pyannote.audio import Pipeline
from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple
import os
import time
import ffmpeg
import tempfile

# --- Model Loading ---
# Load models during application startup via lifespan
_diarization_pipeline = None

def load_diarization_model():
    """Loads the pyannote.audio diarization pipeline.
    Requires authentication with Hugging Face Hub for gated models.
    Ensure HF_TOKEN environment variable is set or user is logged in via huggingface-cli.
    """
    global _diarization_pipeline
    if _diarization_pipeline is None:
        try:
            # Check for HF_TOKEN
            hf_token = os.environ.get("HF_TOKEN")
            if not hf_token:
                print("Warning: HF_TOKEN environment variable not set. pyannote model loading might fail if not logged in.")
            
            print("Loading pyannote.audio diarization pipeline (model: pyannote/speaker-diarization-3.1)...")
            # Use pyannote/speaker-diarization-3.1 for potentially better accuracy
            # or pyannote/speaker-diarization@2.1 for a slightly older/possibly less restricted one
            # Using token is generally recommended for gated models
            _diarization_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=hf_token # Pass token if available
            )
            
            # Send pipeline to GPU if available
            if torch.cuda.is_available():
                print("Moving diarization pipeline to GPU...")
                _diarization_pipeline = _diarization_pipeline.to(torch.device("cuda"))
            else:
                print("CUDA not available, running diarization on CPU.")
                
            print("pyannote.audio diarization pipeline loaded successfully.")
        except Exception as e:
            print(f"Error loading pyannote.audio pipeline: {e}")
            print("Please ensure you have accepted the model's terms on Hugging Face Hub")
            print("and have provided an HF_TOKEN environment variable or logged in via huggingface-cli.")
            # Decide if this should be fatal or just disable diarization
            # For now, let's make it non-fatal
            _diarization_pipeline = None 
            # raise RuntimeError(f"Failed to load diarization model: {e}")
    return _diarization_pipeline

# --- Diarization Service ---

class SpeakerTurn(BaseModel):
    speaker: str # e.g., "SPEAKER_00", "SPEAKER_01"
    start: float # seconds
    end: float # seconds

class DiarizationResult(BaseModel):
    turns: List[SpeakerTurn] = []
    num_speakers: int = 0

def diarize_audio(file_path: str) -> Optional[DiarizationResult]:
    """Performs speaker diarization on an audio file."""
    pipeline = load_diarization_model()
    if pipeline is None:
        print("Diarization pipeline not available. Skipping diarization.")
        return None

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found for diarization: {file_path}")

    # Convert M4A to WAV for potentially better compatibility with pyannote
    temp_wav_file = None
    input_file_for_pipeline = file_path
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == ".m4a":
        print(f"Converting {file_path} to temporary WAV for diarization...")
        try:
            # Create a temporary file path for the WAV
            fd, temp_wav_file = tempfile.mkstemp(suffix=".wav")
            os.close(fd) # Close the file descriptor

            (ffmpeg
             .input(file_path)
             .output(temp_wav_file, acodec='pcm_s16le', ar='16000', ac=1) # Mono, 16kHz, PCM 16-bit
             .overwrite_output()
             .run(quiet=True) # Suppress ffmpeg output
            )
            input_file_for_pipeline = temp_wav_file
            print(f"Conversion successful: {temp_wav_file}")
        except Exception as conv_error:
            print(f"Error converting M4A to WAV using ffmpeg: {conv_error}")
            print("Ensure ffmpeg is installed and in system PATH.")
            # Attempt to use original file if conversion fails
            input_file_for_pipeline = file_path
            if temp_wav_file and os.path.exists(temp_wav_file):
                 os.remove(temp_wav_file) # Clean up temp file
            temp_wav_file = None

    try:
        print(f"Starting speaker diarization using: {input_file_for_pipeline}")
        start_time = time.time()
        
        # Perform diarization using the potentially converted WAV file
        diarization = pipeline(input_file_for_pipeline)
        
        end_time = time.time()
        print(f"Diarization completed in {end_time - start_time:.2f} seconds.")

        # Process the result
        speaker_turns: List[SpeakerTurn] = []
        speakers = set()
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            speaker_turns.append(SpeakerTurn(
                speaker=speaker,
                start=turn.start,
                end=turn.end
            ))
            speakers.add(speaker)
            
        print(f"Diarization identified {len(speakers)} speakers and {len(speaker_turns)} turns.")

        return DiarizationResult(
            turns=speaker_turns,
            num_speakers=len(speakers)
        )

    except Exception as e:
        print(f"Error during diarization: {e}")
        return None
    finally:
        # Clean up temporary WAV file if it was created
        if temp_wav_file and os.path.exists(temp_wav_file):
            try:
                os.remove(temp_wav_file)
                print(f"Cleaned up temporary WAV file: {temp_wav_file}")
            except Exception as cleanup_error:
                print(f"Error cleaning up temp WAV file: {cleanup_error}")

# Example Usage (Requires a .wav or compatible audio file and HF token):
# if __name__ == "__main__":
#     # Ensure HF_TOKEN is set as an environment variable or you are logged in
#     test_audio_file = "path/to/your/test_audio.wav" # Use a suitable audio file
#     if os.path.exists(test_audio_file):
#         try:
#             result = diarize_audio(test_audio_file)
#             if result:
#                 print("\nDiarization Result:")
#                 print(f"Number of Speakers: {result.num_speakers}")
#                 print("First 5 Speaker Turns:")
#                 for turn in result.turns[:5]:
#                     print(f" - {turn.speaker}: {turn.start:.2f}s - {turn.end:.2f}s")
#             else:
#                 print("Diarization could not be performed (pipeline unavailable or error).")
#         except Exception as e:
#             print(f"Test failed: {e}")
#     else:
#         print(f"Test audio file not found: {test_audio_file}") 