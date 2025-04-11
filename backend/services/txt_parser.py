from pydantic import BaseModel
from typing import Dict, Any
import os

class TxtParsingResult(BaseModel):
    transcript: str
    metadata: Dict[str, Any] = {}

def parse_txt(file_path: str) -> TxtParsingResult:
    """Parses a plain TXT file to extract the transcript."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"TXT file not found at: {file_path}")

    try:
        print(f"Parsing TXT file: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            transcript = f.read()
        
        print("TXT parsing completed.")
        return TxtParsingResult(transcript=transcript)

    except Exception as e:
        print(f"Error parsing TXT file {file_path}: {e}")
        raise RuntimeError(f"TXT parsing failed: {e}")

# Example Usage:
# if __name__ == "__main__":
#     test_txt_file = "path/to/your/test_meeting.txt" # Replace with a real TXT file path
#     if os.path.exists(test_txt_file):
#         try:
#             result = parse_txt(test_txt_file)
#             print("\nTXT Parsing Result:")
#             print(f"Transcript (first 500 chars):\n{result.transcript[:500]}...")
#         except Exception as e:
#             print(f"Test failed: {e}")
#     else:
#         print(f"Test TXT file not found: {test_txt_file}") 