import webvtt
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import os
import re

class VttCaption(BaseModel):
    start: str
    end: str
    text: str
    raw_text: str # Keep original text for potential speaker/reaction parsing

class VttParsingResult(BaseModel):
    transcript: str
    captions: List[VttCaption]
    metadata: Dict[str, Any] = {}

def parse_vtt(file_path: str) -> VttParsingResult:
    """Parses a VTT file to extract transcript, captions, and metadata."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"VTT file not found at: {file_path}")

    transcript_parts = []
    parsed_captions: List[VttCaption] = []
    metadata = {}

    try:
        print(f"Parsing VTT file: {file_path}")
        vtt = webvtt.read(file_path)
        
        for caption in vtt:
            raw_text = caption.text.strip()
            # Zoom VTT format: Look for speaker info in the raw text
            # Example: "Speaker Name (00:00:00): Text"
            speaker_match = re.match(r'^([^(]+)\((\d{2}:\d{2}:\d{2})\):', raw_text)
            if speaker_match:
                speaker_name = speaker_match.group(1).strip()
                cleaned_text = raw_text[speaker_match.end():].strip()
            else:
                # Fallback: Look for colon-based speaker tags
                lines = raw_text.split('\n')
                if lines and lines[0].endswith(':') and len(lines[0]) < 50:
                    speaker_name = lines[0][:-1].strip()
                    cleaned_text = '\n'.join(lines[1:]).strip()
                else:
                    speaker_name = None
                    cleaned_text = raw_text
            
            # Only add non-empty cleaned text to the main transcript parts
            if cleaned_text:
                transcript_parts.append(cleaned_text)
            
            parsed_captions.append(VttCaption(
                start=caption.start,
                end=caption.end,
                text=cleaned_text,
                raw_text=raw_text
            ))

        # Join parts with space for a more readable transcript
        full_transcript = " ".join(transcript_parts)
        print(f"VTT parsing completed. Found {len(parsed_captions)} captions.")
        
        return VttParsingResult(
            transcript=full_transcript,
            captions=parsed_captions,
            metadata=metadata
        )

    except webvtt.errors.MalformedFileError as e:
        print(f"Malformed VTT file {file_path}: {e}")
        raise ValueError(f"Invalid VTT file format: {e}")
    except Exception as e:
        print(f"Error parsing VTT file {file_path}: {e}")
        raise RuntimeError(f"VTT parsing failed: {e}")

# Example Usage (add to bottom of file for testing):
# if __name__ == "__main__":
#     test_vtt_file = "path/to/your/test_meeting.vtt" # Replace with a real VTT file path
#     if os.path.exists(test_vtt_file):
#         try:
#             result = parse_vtt(test_vtt_file)
#             print("\nVTT Parsing Result:")
#             print(f"Metadata: {result.metadata}")
#             print(f"Transcript (first 500 chars):\n{result.transcript[:500]}...")
#             print(f"\nFirst 3 Captions:")
#             for cap in result.captions[:3]:
#                 print(f" - {cap.start} --> {cap.end}: Raw: '{cap.raw_text}' | Cleaned: '{cap.text}'")
#         except Exception as e:
#             print(f"Test failed: {e}")
#     else:
#         print(f"Test VTT file not found: {test_vtt_file}") 