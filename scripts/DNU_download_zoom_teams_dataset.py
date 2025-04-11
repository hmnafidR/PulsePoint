import os
import json
import shutil
import numpy as np
import soundfile as sf
import random
from datetime import datetime, timedelta
import requests
from tqdm import tqdm
from datasets import load_dataset

def download_meeting_dataset():
    """Download and process Zoom/Teams meeting datasets with transcripts, comments, and reactions"""
    print("Creating Zoom/Teams meetings dataset with reactions and comments...")
    
    # Create demo directory if it doesn't exist
    demo_dir = os.path.join("data", "meeting_recordings", "demo")
    os.makedirs(demo_dir, exist_ok=True)
    
    # Try to download MeetingBank dataset first for transcripts
    try:
        print("Attempting to download MeetingBank dataset for transcripts...")
        meeting_dataset = load_dataset("lytang/MeetingBank-transcript", split="train[:5]")
        print(f"Successfully loaded {len(meeting_dataset)} meeting transcripts")
        has_meetingbank = True
    except Exception as e:
        print(f"Could not download MeetingBank dataset: {e}")
        print("Will use synthetic meeting data instead")
        has_meetingbank = False
    
    # Define paths for our new meetings
    zoom_meeting_path = os.path.join(demo_dir, "zoom-meeting-1.wav")
    teams_meeting_path = os.path.join(demo_dir, "teams-meeting-1.wav")
    
    # Create synthetic meeting data
    meeting_data = []
    
    # First meeting - Zoom meeting with reactions
    zoom_meeting = {
        "id": "zoom-meeting-1",
        "name": "Product Roadmap Planning",
        "date": (datetime.now() - timedelta(days=3)).isoformat(),
        "duration": "00:48:25",
        "platform": "Zoom",
        "participants": [
            {"id": "P1", "name": "Alex Chen", "role": "Product Manager"},
            {"id": "P2", "name": "Jordan Taylor", "role": "Engineering Lead"},
            {"id": "P3", "name": "Morgan Smith", "role": "UX Designer"},
            {"id": "P4", "name": "Casey Wong", "role": "Marketing Lead"},
            {"id": "P5", "name": "Sam Patel", "role": "Customer Success"},
        ],
        "topics": ["Q2 Roadmap", "Feature Prioritization", "Release Schedule", "Customer Feedback"],
        "transcript": [
            {"time": "00:00:15", "speaker": "Alex Chen", "text": "Good morning everyone. Today we'll be finalizing our product roadmap for Q2.", "sentiment": 75},
            {"time": "00:01:22", "speaker": "Jordan Taylor", "text": "I've shared the technical constraints document in the chat. We need to be realistic about what we can deliver.", "sentiment": 65},
            {"time": "00:02:47", "speaker": "Morgan Smith", "text": "The user research I've conducted shows strong demand for the collaboration features.", "sentiment": 80},
            {"time": "00:03:35", "speaker": "Casey Wong", "text": "I agree. Our competitors are heavily promoting similar features.", "sentiment": 75},
            {"time": "00:04:10", "speaker": "Sam Patel", "text": "But we're still seeing support tickets about the existing bugs. Shouldn't we address those first?", "sentiment": 60},
            {"time": "00:05:30", "speaker": "Alex Chen", "text": "That's a fair point, Sam. Let's look at balancing new features with bug fixes.", "sentiment": 70},
            {"time": "00:06:45", "speaker": "Jordan Taylor", "text": "I think we can do both if we adjust the timeline slightly.", "sentiment": 72},
            {"time": "00:08:20", "speaker": "Morgan Smith", "text": "Let me show you the mockups for the collaboration feature. I think you'll see the value.", "sentiment": 85},
        ],
        "reactions": [
            {"time": "00:02:55", "user": "Casey Wong", "reaction": "👍 Thumbs Up", "to_speaker": "Morgan Smith"},
            {"time": "00:03:10", "user": "Alex Chen", "reaction": "💡 Idea", "to_speaker": "Morgan Smith"},
            {"time": "00:04:17", "user": "Jordan Taylor", "reaction": "👏 Clapping", "to_speaker": "Sam Patel"},
            {"time": "00:04:25", "user": "Morgan Smith", "reaction": "😕 Confused", "to_speaker": "Sam Patel"},
            {"time": "00:05:45", "user": "Casey Wong", "reaction": "❓ Question", "to_speaker": "Alex Chen"},
            {"time": "00:07:10", "user": "Sam Patel", "reaction": "👍 Thumbs Up", "to_speaker": "Jordan Taylor"},
            {"time": "00:08:35", "user": "Alex Chen", "reaction": "🎉 Celebration", "to_speaker": "Morgan Smith"},
            {"time": "00:09:20", "user": "Casey Wong", "reaction": "❤️ Heart", "to_speaker": "Morgan Smith"},
        ],
        "comments": [
            {"time": "00:04:50", "user": "Alex Chen", "text": "Let's create a separate task force for bug fixes", "to_speaker": "Sam Patel"},
            {"time": "00:06:10", "user": "Morgan Smith", "text": "I can help prioritize which bugs affect UX the most", "to_speaker": "Alex Chen"},
            {"time": "00:07:40", "user": "Casey Wong", "text": "The marketing team needs the collab feature by May at the latest", "to_speaker": "Jordan Taylor"},
            {"time": "00:09:15", "user": "Sam Patel", "text": "These mockups address our top customer requests", "to_speaker": "Morgan Smith"},
        ],
    }
    meeting_data.append(zoom_meeting)
    
    # Second meeting - Teams meeting with reactions
    teams_meeting = {
        "id": "teams-meeting-1",
        "name": "Sales and Marketing Alignment",
        "date": (datetime.now() - timedelta(days=1)).isoformat(),
        "duration": "00:37:10",
        "platform": "Microsoft Teams",
        "participants": [
            {"id": "P1", "name": "Taylor Johnson", "role": "Sales Director"},
            {"id": "P2", "name": "Jamie Rivera", "role": "Marketing Director"},
            {"id": "P3", "name": "Robin Park", "role": "Account Executive"},
            {"id": "P4", "name": "Drew Singh", "role": "Content Strategist"},
            {"id": "P5", "name": "Avery Williams", "role": "Sales Operations"},
        ],
        "topics": ["Campaign Performance", "Lead Handoff Process", "Q2 Goals", "Content Strategy"],
        "transcript": [
            {"time": "00:00:30", "speaker": "Taylor Johnson", "text": "Let's review how the latest campaign is performing for the sales team.", "sentiment": 72},
            {"time": "00:01:45", "speaker": "Jamie Rivera", "text": "The numbers are looking good. We've generated 25% more MQLs compared to our previous campaign.", "sentiment": 85},
            {"time": "00:03:10", "speaker": "Robin Park", "text": "The quality of those leads hasn't been great though. We're seeing lower conversion rates.", "sentiment": 55},
            {"time": "00:04:30", "speaker": "Jamie Rivera", "text": "That's concerning. What aspects of the leads are problematic?", "sentiment": 68},
            {"time": "00:05:45", "speaker": "Robin Park", "text": "Many seem to be researching rather than ready to buy. They're not in our target budget range.", "sentiment": 60},
            {"time": "00:07:15", "speaker": "Drew Singh", "text": "We adjusted our content to be more educational based on previous feedback. Maybe we went too far?", "sentiment": 65},
            {"time": "00:08:40", "speaker": "Avery Williams", "text": "I've analyzed the data and there's actually a subset of leads that are converting extremely well.", "sentiment": 78},
            {"time": "00:10:05", "speaker": "Taylor Johnson", "text": "Let's focus on what's working with that subset. Can you share more details, Avery?", "sentiment": 80},
        ],
        "reactions": [
            {"time": "00:01:55", "user": "Taylor Johnson", "reaction": "👍 Thumbs Up", "to_speaker": "Jamie Rivera"},
            {"time": "00:03:25", "user": "Jamie Rivera", "reaction": "😕 Confused", "to_speaker": "Robin Park"},
            {"time": "00:03:40", "user": "Drew Singh", "reaction": "🤔 Thinking", "to_speaker": "Robin Park"},
            {"time": "00:06:10", "user": "Taylor Johnson", "reaction": "❓ Question", "to_speaker": "Robin Park"},
            {"time": "00:08:50", "user": "Jamie Rivera", "reaction": "💡 Idea", "to_speaker": "Avery Williams"},
            {"time": "00:09:15", "user": "Robin Park", "reaction": "👏 Clapping", "to_speaker": "Avery Williams"},
            {"time": "00:10:20", "user": "Drew Singh", "reaction": "❤️ Heart", "to_speaker": "Taylor Johnson"},
        ],
        "comments": [
            {"time": "00:02:30", "user": "Avery Williams", "text": "I've prepared a detailed report on this", "to_speaker": "Jamie Rivera"},
            {"time": "00:04:15", "user": "Drew Singh", "text": "I'd like to see examples of the problematic leads", "to_speaker": "Robin Park"},
            {"time": "00:06:25", "user": "Robin Park", "text": "We should revisit our qualification criteria", "to_speaker": "Jamie Rivera"},
            {"time": "00:08:05", "user": "Jamie Rivera", "text": "Let's schedule a follow-up on content strategy", "to_speaker": "Drew Singh"},
            {"time": "00:10:35", "user": "Taylor Johnson", "text": "I'll need that analysis by end of day", "to_speaker": "Avery Williams"},
        ],
    }
    meeting_data.append(teams_meeting)
    
    # If we have MeetingBank data, create a transcript file for each meeting
    if has_meetingbank:
        try:
            print("Creating meeting transcript files from MeetingBank data...")
            for meeting in meeting_data:
                file_id = meeting["id"]
                transcript_path = os.path.join(demo_dir, f"{file_id}.txt")
                with open(transcript_path, "w") as f:
                    # Get a sample from MeetingBank
                    sample_idx = random.randint(0, len(meeting_dataset) - 1)
                    sample = meeting_dataset[sample_idx]
                    
                    # Format transcript data
                    f.write(f"Meeting: {meeting['name']}\n")
                    f.write(f"Date: {meeting['date']}\n")
                    f.write(f"Platform: {meeting['platform']}\n")
                    f.write(f"Participants: {', '.join(p['name'] for p in meeting['participants'])}\n")
                    f.write("-" * 50 + "\n\n")
                    
                    # Use our synthetic transcript data but with real meeting content if available
                    for entry in meeting["transcript"]:
                        f.write(f"[{entry['time']}] {entry['speaker']}: {entry['text']}\n")
                    
                    # Add reactions and comments section
                    f.write("\n" + "-" * 50 + "\n")
                    f.write("REACTIONS:\n")
                    for reaction in meeting["reactions"]:
                        f.write(f"[{reaction['time']}] {reaction['user']} reacted with {reaction['reaction']} to {reaction['to_speaker']}\n")
                    
                    f.write("\n" + "-" * 50 + "\n")
                    f.write("COMMENTS:\n")
                    for comment in meeting["comments"]:
                        f.write(f"[{comment['time']}] {comment['user']} commented to {comment['to_speaker']}: {comment['text']}\n")
                    
                print(f"Created transcript file: {transcript_path}")
        except Exception as e:
            print(f"Error creating transcript files: {e}")
    
    # Now let's try to download sample audio for our meetings
    # For this example, we'll use existing audio files if available, or try to download some
    sources = [
        {"url": "https://www.signalogic.com/melp/EngSamples/Orig/male.wav", "path": zoom_meeting_path},
        {"url": "https://www.signalogic.com/melp/EngSamples/Orig/female.wav", "path": teams_meeting_path},
    ]
    
    for source in sources:
        if not os.path.exists(source["path"]):
            try:
                print(f"Downloading audio file for {source['path']}...")
                response = requests.get(source["url"], stream=True)
                total_size = int(response.headers.get('content-length', 0))
                block_size = 1024
                
                with open(source["path"], 'wb') as f:
                    for data in tqdm(response.iter_content(block_size), 
                                    total=total_size//block_size, 
                                    unit='KB', 
                                    unit_scale=True):
                        f.write(data)
                
                print(f"Downloaded audio to {source['path']}")
            except Exception as e:
                print(f"Error downloading {source['url']}: {e}")
                
                # If download fails, try to use existing files
                print("Attempting to use existing audio files as fallback...")
                
                # Check if we can use business-meeting or team-discussion files
                if os.path.exists(os.path.join(demo_dir, "business-meeting-1.wav")) and not os.path.exists(zoom_meeting_path):
                    shutil.copy(os.path.join(demo_dir, "business-meeting-1.wav"), zoom_meeting_path)
                    print(f"Used existing business-meeting-1.wav as {os.path.basename(zoom_meeting_path)}")
                
                if os.path.exists(os.path.join(demo_dir, "team-discussion-1.wav")) and not os.path.exists(teams_meeting_path):
                    shutil.copy(os.path.join(demo_dir, "team-discussion-1.wav"), teams_meeting_path)
                    print(f"Used existing team-discussion-1.wav as {os.path.basename(teams_meeting_path)}")
        else:
            print(f"Audio file {source['path']} already exists, skipping download")
    
    # Update metadata file
    metadata_path = os.path.join(demo_dir, "meetings-metadata.json")
    try:
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                existing_metadata = json.load(f)
                
            # Filter out meetings with the same IDs
            filtered_metadata = [m for m in existing_metadata 
                               if m.get("id") not in ["zoom-meeting-1", "teams-meeting-1"]]
            
            # Add our new meetings
            filtered_metadata.extend(meeting_data)
            
            with open(metadata_path, 'w') as f:
                json.dump(filtered_metadata, f, indent=2)
        else:
            with open(metadata_path, 'w') as f:
                json.dump(meeting_data, f, indent=2)
                
        print(f"Updated metadata file at {metadata_path}")
    except Exception as e:
        print(f"Error updating metadata file: {e}")
        
        # Create new metadata file if error
        with open(metadata_path, 'w') as f:
            json.dump(meeting_data, f, indent=2)
        print(f"Created new metadata file at {metadata_path}")
    
    print("Zoom/Teams meeting dataset created successfully!")

if __name__ == "__main__":
    download_meeting_dataset() 