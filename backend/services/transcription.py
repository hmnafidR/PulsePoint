import whisper
import os
from pydantic import BaseModel, Field

# --- Whisper Model Loading ---
# Consider loading the model once when the application starts
# for better performance, rather than on each request.
# You might manage this in main.py or using FastAPI's lifespan events.

_whisper_model = None

def load_whisper_model(model_size="small"):
    """Loads the specified Whisper model. Default is 'small'."""
    global _whisper_model
    if _whisper_model is None:
        try:
            print(f"Loading Whisper model: {model_size}...")
            # Specify download_root if needed, e.g., to store models in a specific backend/models dir
            # model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'whisper')
            # os.makedirs(model_path, exist_ok=True)
            _whisper_model = whisper.load_model(model_size) #, download_root=model_path)
            print("Whisper model loaded successfully.")
        except Exception as e:
            print(f"Error loading Whisper model '{model_size}': {e}")
            # Optionally raise the error or handle it depending on desired app behavior
            raise RuntimeError(f"Failed to load Whisper model: {e}")
    return _whisper_model

# Ensure the model is loaded when the module is imported (or use lifespan)
# load_whisper_model() # Uncomment if loading here, or manage in main.py

# --- Transcription Service ---

class TranscriptionResult(BaseModel):
    text: str
    language: str
    segments: list = Field(default_factory=list) # List of segment dictionaries
    # Add other relevant fields from Whisper output if needed

# Make function synchronous for BackgroundTasks compatibility
# async def transcribe_audio(file_path: str) -> TranscriptionResult:
def transcribe_audio(file_path: str) -> TranscriptionResult:
    """Transcribes an audio file using the loaded Whisper model."""
    model = load_whisper_model() # Ensure model is loaded (or get pre-loaded instance)
    if model is None:
         raise RuntimeError("Whisper model is not available.")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found at: {file_path}")

    try:
        print(f"Starting transcription for: {file_path}")
        # Use verbose=False unless debugging, add language detection/setting if needed
        # No await needed for model.transcribe
        result = model.transcribe(file_path, verbose=False) 
        print("Transcription completed.")
        
        # Extract relevant data
        transcription_data = TranscriptionResult(
            text=result.get("text", ""),
            language=result.get("language", "unknown"),
            segments=result.get("segments", [])
        )
        return transcription_data
        
    except Exception as e:
        print(f"Error during Whisper transcription: {e}")
        # Re-raise or handle specific exceptions as needed
        raise RuntimeError(f"Transcription failed: {e}")

# Example usage (for testing):
# if __name__ == "__main__":
#     import asyncio
#     async def test_transcription():
#         # Create a dummy m4a file or use a real one
#         dummy_file = "path/to/your/test_audio.m4a"
#         if os.path.exists(dummy_file):
#             try:
#                 result = await transcribe_audio(dummy_file)
#                 print("\nTranscription Result:")
#                 print(f"Language: {result.language}")
#                 print(f"Text: {result.text[:200]}...") # Print first 200 chars
#                 print(f"Number of segments: {len(result.segments)}")
#             except Exception as e:
#                 print(f"Test failed: {e}")
#         else:
#             print(f"Test audio file not found: {dummy_file}")
#     asyncio.run(test_transcription()) 