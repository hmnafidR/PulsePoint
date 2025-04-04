import os
import json
import shutil
import numpy as np
import soundfile as sf
from datasets import load_dataset, concatenate_datasets

def download_and_process_ami():
    print("Downloading AMI dataset...")
    
    # Create demo directory if it doesn't exist
    os.makedirs("data/meeting_recordings/demo", exist_ok=True)
    
    # Download the AMI dataset
    dataset = load_dataset("edinburghcstr/ami", "ihm", split="test[:100]")
    
    # Get unique meeting IDs
    meeting_ids = set(dataset["meeting_id"])
    print(f"Found {len(meeting_ids)} unique meeting IDs")
    
    # If not enough unique meeting IDs, get more from training set
    if len(meeting_ids) < 2:
        print("Not enough unique meeting IDs found. Downloading more samples...")
        additional_dataset = load_dataset("edinburghcstr/ami", "ihm", split="train[:100]")
        # Combine datasets using concatenate_datasets
        dataset = concatenate_datasets([dataset, additional_dataset])
        meeting_ids = set(dataset["meeting_id"])
        print(f"Now have {len(meeting_ids)} unique meeting IDs")
    
    # Sort unique meeting IDs to ensure consistent selection
    sorted_meeting_ids = sorted(list(meeting_ids))
    
    # Process first meeting (business meeting)
    business_meeting_id = sorted_meeting_ids[0]
    business_segments = dataset.filter(lambda x: x["meeting_id"] == business_meeting_id)
    
    # Collect audio segments
    business_audio = []
    for segment in business_segments:
        audio_array = segment["audio"]["array"]
        business_audio.append(audio_array)
    
    # Concatenate audio segments
    if business_audio:
        business_audio_concat = np.concatenate(business_audio)
        business_audio_path = "data/meeting_recordings/demo/business-meeting-1.wav"
        sf.write(business_audio_path, business_audio_concat, 16000)
        print(f"Saved business meeting audio to {business_audio_path}")
    else:
        print("No audio segments found for business meeting")
    
    # Process second meeting (team discussion)
    if len(sorted_meeting_ids) > 1:
        team_discussion_id = sorted_meeting_ids[1]
        team_segments = dataset.filter(lambda x: x["meeting_id"] == team_discussion_id)
        
        # Collect audio segments
        team_audio = []
        for segment in team_segments:
            audio_array = segment["audio"]["array"]
            team_audio.append(audio_array)
        
        # Concatenate audio segments
        if team_audio:
            team_audio_concat = np.concatenate(team_audio)
            team_audio_path = "data/meeting_recordings/demo/team-discussion-1.wav"
            sf.write(team_audio_path, team_audio_concat, 16000)
            print(f"Saved team discussion audio to {team_audio_path}")
        else:
            print("No audio segments found for team discussion")
            # Use business meeting audio as fallback
            if os.path.exists(business_audio_path):
                shutil.copy(business_audio_path, "data/meeting_recordings/demo/team-discussion-1.wav")
                print("Copied business meeting audio as fallback for team discussion")
    
    # Create or update metadata file
    metadata_file = "data/meeting_recordings/demo/meetings-metadata.json"
    metadata = []
    
    # Try to load existing metadata
    try:
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                # Filter out entries with same meeting IDs
                metadata = [m for m in metadata if m.get('id') != 'business-meeting-1' and m.get('id') != 'team-discussion-1']
    except Exception as e:
        print(f"Error reading metadata file: {e}")
        metadata = []
    
    # Add new metadata
    metadata.append({
        "id": "business-meeting-1",
        "name": "Quarterly Business Review",
        "date": "2023-05-15T10:00:00",
        "duration": "00:45:32",
        "participants": [
            {"id": "P1", "name": "Alex Johnson", "role": "Project Manager"},
            {"id": "P2", "name": "Jamie Smith", "role": "Business Analyst"},
            {"id": "P3", "name": "Taylor Wilson", "role": "Product Owner"},
            {"id": "P4", "name": "Morgan Lee", "role": "Developer"}
        ],
        "topics": ["Q2 Results", "Project Updates", "Resource Allocation", "Future Planning"]
    })
    
    metadata.append({
        "id": "team-discussion-1",
        "name": "Development Team Sync",
        "date": "2023-05-16T14:30:00",
        "duration": "00:32:15",
        "participants": [
            {"id": "P1", "name": "Robin Chen", "role": "Team Lead"},
            {"id": "P2", "name": "Sam Patel", "role": "Frontend Developer"},
            {"id": "P3", "name": "Jordan Kim", "role": "Backend Developer"},
            {"id": "P4", "name": "Casey Brown", "role": "QA Engineer"}
        ],
        "topics": ["Sprint Planning", "Technical Debt", "Feature Prioritization", "Testing Strategy"]
    })
    
    # Save metadata
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Created metadata file at {metadata_file}")
    print("AMI dataset downloaded successfully")

if __name__ == "__main__":
    download_and_process_ami() 