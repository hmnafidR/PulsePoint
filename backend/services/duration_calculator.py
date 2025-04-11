import os
from mutagen.mp4 import MP4
from mutagen import MutagenError
from typing import List, Optional
import datetime

# Assuming VttCaption model is defined elsewhere or here
from pydantic import BaseModel
class VttCaption(BaseModel):
    start: str
    end: str
    text: str
    raw_text: str

def get_meeting_duration(file_path: str, file_type: str, captions: Optional[List[VttCaption]] = None) -> Optional[float]:
    """Calculates the duration of the meeting in seconds.
    
    Uses mutagen for M4A files, or estimates from VTT captions.
    Returns duration in seconds, or None if calculation fails.
    """
    duration_seconds: Optional[float] = None
    
    if file_type == "m4a":
        try:
            if os.path.exists(file_path):
                audio = MP4(file_path)
                duration_seconds = audio.info.length
                print(f"Calculated M4A duration: {duration_seconds:.2f} seconds")
            else:
                print("M4A file not found for duration calculation.")
        except MutagenError as e:
            print(f"Error reading M4A metadata for duration: {e}")
        except Exception as e:
            print(f"Unexpected error getting M4A duration: {e}")
            
    elif file_type == "vtt":
        if captions and len(captions) > 0:
            try:
                # Get the end time of the last caption
                last_caption_end_str = captions[-1].end
                # Parse the VTT timestamp (HH:MM:SS.fff)
                parts = last_caption_end_str.split('.')
                time_parts = parts[0].split(':')
                milliseconds = int(parts[1]) if len(parts) > 1 else 0
                hours = int(time_parts[0])
                minutes = int(time_parts[1])
                seconds = int(time_parts[2])
                
                duration_td = datetime.timedelta(hours=hours, minutes=minutes, seconds=seconds, milliseconds=milliseconds)
                duration_seconds = duration_td.total_seconds()
                print(f"Estimated VTT duration from last caption: {duration_seconds:.2f} seconds")
            except Exception as e:
                print(f"Error parsing VTT end time for duration: {e}")
        else:
             print("No VTT captions provided to estimate duration.")
             
    elif file_type == "txt":
        # Duration calculation for plain text is difficult/unreliable
        print("Duration calculation not supported for TXT files.")
        
    if duration_seconds is None:
         print("Could not determine meeting duration.")
         
    return duration_seconds

# Example Usage:
# if __name__ == "__main__":
#     # Test with M4A
#     m4a_file = "path/to/your/test_audio.m4a"
#     if os.path.exists(m4a_file):
#         duration_m4a = get_meeting_duration(m4a_file, "m4a")
#         print(f"M4A Test Duration: {duration_m4a}")
#     else:
#         print(f"M4A test file not found: {m4a_file}")

#     # Test with VTT (requires dummy captions or a real file + parser)
#     dummy_captions = [
#         VttCaption(start="00:00:01.000", end="00:00:05.500", text="Hello", raw_text="Hello"),
#         VttCaption(start="00:00:06.000", end="00:00:10.123", text="World", raw_text="World")
#     ]
#     duration_vtt = get_meeting_duration("dummy.vtt", "vtt", captions=dummy_captions)
#     print(f"VTT Test Duration: {duration_vtt}")

#     # Test with TXT
#     duration_txt = get_meeting_duration("dummy.txt", "txt")
#     print(f"TXT Test Duration: {duration_txt}") 