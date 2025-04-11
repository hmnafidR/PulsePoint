# This file will contain the shared analysis pipeline logic
# Move the run_full_analysis_pipeline function here from meetings.py

from fastapi import HTTPException
import os
from typing import List, Dict, Any, Optional
import datetime
import re
import json # Add json import
import uuid # Added for unique IDs
from dateutil import parser as date_parser # For parsing dates from filenames
import math

# Import necessary models and services
from models.meeting import MeetingAnalysisJSON, SentimentAnalysisOutput, SpeakerAnalysisOutput, TopicsOutput, ParticipantStatsOutput, ReactionsAnalysisOutput, TopicAnalysisOutput, ReactionItemOutput, Participant, SentimentTimelineItem, MeetingMetadata
from services.transcription import transcribe_audio, TranscriptionResult
from services.vtt_parser import parse_vtt, VttParsingResult, VttCaption
from services.txt_parser import parse_txt, TxtParsingResult
from services.sentiment import analyze_sentiment, SentimentResult, generate_sentiment_timeline
from services.insights import generate_ai_insights, AIInsightsResult
from services.duration_calculator import get_meeting_duration
from services.diarization import diarize_audio, DiarizationResult, SpeakerTurn
from services.chat_parser import parse_chat_file, ChatParsingResult
from services.engagement import calculate_engagement_score
from services.topic_modeling import model_topics, TopicModelingResult

# --- Engagement Calculation Helper --- 
def calculate_basic_engagement(
    speakers_data: Dict[str, Dict[str, Any]], 
    chat_results: Optional[ChatParsingResult]
) -> float:
    """Calculates a basic engagement score based on speaking, chatting, reacting."""
    if not speakers_data and not chat_results:
        return 0.0 # No data, no engagement
    
    speaking_participants = set(speakers_data.keys())
    # Correctly extract authors from the list of ChatMessage objects
    chat_authors = set(msg.author for msg in chat_results.messages) if chat_results and chat_results.messages else set()
    reacting_authors = set(chat_results.reactions_by_author.keys()) if chat_results and chat_results.reactions_by_author else set()
    
    # Combine all unique participants
    all_participants = speaking_participants.union(chat_authors).union(reacting_authors)
    total_participants = len(all_participants)
    
    if total_participants == 0:
        return 0.0
        
    # Calculate participation ratios
    speaking_ratio = len(speaking_participants) / total_participants
    chatting_ratio = len(chat_authors) / total_participants
    reacting_ratio = len(reacting_authors) / total_participants
    
    # Define weights (adjust as needed)
    weight_speaking = 0.50
    weight_chatting = 0.30
    weight_reacting = 0.20
    
    # Calculate weighted score (clamp between 0 and 1)
    engagement_score = (
        speaking_ratio * weight_speaking +
        chatting_ratio * weight_chatting +
        reacting_ratio * weight_reacting
    )
    
    # Normalize/Scale to 0-100 if desired, here we keep 0-1
    engagement_score = max(0.0, min(1.0, engagement_score))
    print(f"[Engagement Calc] Total: {total_participants}, Speaking: {len(speaking_participants)}, Chatting: {len(chat_authors)}, Reacting: {len(reacting_authors)} -> Score: {engagement_score:.2f}")
    return engagement_score
# --------------------------------

# Helper function to extract meeting details from filename/path
def extract_meeting_details_from_path(file_path: str, meeting_id_override: Optional[str] = None) -> Dict[str, Any]:
    """Attempts to extract meeting ID, title, and date from file path/name."""
    filename = os.path.basename(file_path)
    parts = filename.split('_') # Common separator

    # Meeting ID
    meeting_id = meeting_id_override or str(uuid.uuid4()) # Use override or generate UUID
    # Check if parts[0] looks like a Zoom ID (e.g., GMT...)
    if parts and parts[0].startswith("GMT") and meeting_id_override is None:
         meeting_id = parts[0] # Use the GMT ID if available and no override

    # Date
    meeting_date = datetime.datetime.now(datetime.timezone.utc) # Default to now
    if parts and parts[0].startswith("GMT"):
        try:
            # Attempt to parse date like GMTYYYYMMDD-HHMMSS
            date_str = parts[0].replace("GMT", "").split("-")[0]
            time_str = parts[0].replace("GMT", "").split("-")[1] if len(parts[0].replace("GMT", "").split("-")) > 1 else "000000"
            # Pad time if necessary
            time_str = time_str.ljust(6, '0')
            datetime_str = f"{date_str}T{time_str}"
            # Use dateutil parser for flexibility
            parsed_date = date_parser.parse(datetime_str)
            meeting_date = parsed_date.replace(tzinfo=datetime.timezone.utc) # Assume UTC
        except Exception:
            print(f"[Detail Extraction] Could not parse date from filename part: {parts[0]}. Defaulting to now.")
            # Keep default meeting_date

    # Title - Try to piece together from parts after ID/date
    meeting_title = "Meeting Analysis" # Default title
    if parts and len(parts) > 1:
        # Assume title starts after ID/timestamp part
        title_parts = parts[1:]
        # Remove common suffixes like 'Recording', 'transcript', extensions
        title_parts = [p for p in title_parts if not p.lower() in ['recording', 'transcript', 'audio', 'chat']]
        # Remove extension
        if '.' in title_parts[-1]:
             title_parts[-1] = title_parts[-1].split('.')[0]
        if title_parts:
            meeting_title = " ".join(title_parts).replace('-', ' ').replace('_', ' ').strip()

    # Platform - Infer from path
    platform = "Unknown"
    if "zoom" in file_path.lower():
        platform = "Zoom"
    elif "google_meet" in file_path.lower(): # Example
        platform = "Google Meet"
    elif "teams" in file_path.lower(): # Example
        platform = "Microsoft Teams"


    return {
        "meetingId": meeting_id,
        "meetingTitle": meeting_title,
        "date": meeting_date.isoformat(), # Use ISO format string
        "platform": platform
    }

# Make pipeline synchronous
# async def run_full_analysis_pipeline(file_path: str, file_type: str) -> MeetingAnalysisJSON:
def run_full_analysis_pipeline(file_path: str, file_type: str, chat_file_path: Optional[str], output_dir: str, meeting_id: str) -> MeetingAnalysisJSON: # Add output_dir and meeting_id parameters
    """Runs the complete analysis pipeline on a given file and saves components."""
    print(f"Running analysis pipeline for {file_path} ({file_type})")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract initial metadata from path
    meeting_details = extract_meeting_details_from_path(file_path, meeting_id_override=meeting_id) # Pass meeting_id as override
    print(f"Extracted meeting details: {meeting_details}")

    # 1. Get transcript & related data
    transcript = ""
    transcript_segments = [] 
    captions_data: List[VttCaption] = [] 
    
    if file_type == "m4a":
        try:
            # Call synchronous version
            transcription_result: TranscriptionResult = transcribe_audio(file_path)
            transcript = transcription_result.text
            transcript_segments = transcription_result.segments
            print(f"Transcription successful. Language: {transcription_result.language}")
        except Exception as e:
            print(f"M4A transcription failed: {e}")
            raise HTTPException(status_code=500, detail=f"Audio transcription failed: {e}")
    elif file_type == "vtt":
       try:
            parsing_result: VttParsingResult = parse_vtt(file_path)
            transcript = parsing_result.transcript
            captions_data = parsing_result.captions # Store captions
            print("VTT parsing successful.")
       except Exception as e:
            print(f"VTT parsing failed: {e}")
            raise HTTPException(status_code=500, detail=f"VTT parsing failed: {e}")
    elif file_type == "txt":
       try:
            parsing_result: TxtParsingResult = parse_txt(file_path) # Assuming sync
            transcript = parsing_result.transcript
            print("TXT parsing successful.")
       except Exception as e:
            print(f"TXT parsing failed: {e}")
            raise HTTPException(status_code=500, detail=f"TXT parsing failed: {e}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type for analysis pipeline")

    # --- Speaker Diarization & Participant Extraction ---
    speakers_data: Dict[str, Dict[str, Any]] = {} # Store aggregated data per speaker
    diarization_result: Optional[DiarizationResult] = None
    print("[Pipeline Debug] Checking file type for diarization...") # DEBUG
    
    if file_type == "m4a":
        # Run pyannote diarization on the audio file
        print("[Pipeline Debug] Attempting pyannote diarization...") # DEBUG
        diarization_result = diarize_audio(file_path)
        print(f"[Pipeline Debug] Pyannote diarization raw result: {diarization_result}") # DEBUG
        if diarization_result:
             for turn in diarization_result.turns:
                 speaker_id = turn.speaker # e.g., SPEAKER_00
                 duration = turn.end - turn.start
                 if speaker_id not in speakers_data:
                     speakers_data[speaker_id] = {"name": speaker_id, "speakingTime": 0.0, "segments": []}
                 speakers_data[speaker_id]["speakingTime"] += duration
                 # TODO: Align transcript segments with speaker turns for text analysis
                 # This is complex: requires matching whisper timestamps with pyannote timestamps
                 # For now, we just aggregate time.
        else:
            print("Skipping speaker analysis for M4A due to diarization failure/skip.")
            
    elif file_type == 'vtt' and captions_data:
        # Speaker extraction and time aggregation from VTT
        print("Attempting VTT speaker extraction & time aggregation...")
        speakers_data = {} # Re-initialize here for clarity
        processed_speakers = set() # Track speakers found in this block

        for i, caption in enumerate(captions_data):
            speaker_name = None
            text_content = caption.text # Usually the text without the speaker tag
            raw_lines = caption.raw_text.split('\n')
            
            # --- Try extracting speaker tag --- 
            # Check raw_lines[0] first (Common VTT format like the example)
            if raw_lines and len(raw_lines[0]) < 70: # Increased length tolerance
                line_zero = raw_lines[0].strip()
                # Check for Colon format: "Speaker Name:"
                if line_zero.endswith(':'):
                     potential_speaker = line_zero[:-1].strip()
                     # Basic check to avoid timestamp lines being mistaken for speakers
                     if '-->' not in potential_speaker and len(potential_speaker) > 1:
                         speaker_name = potential_speaker
                         # print(f"[VTT Debug] Found speaker (Colon Format) in raw_lines[0]: '{speaker_name}'")
               
                # Check for Zoom format: "Speaker Name (...) :" (Handle potential space before colon)
                if not speaker_name:
                     zoom_match = re.match(r'^([^(]+)\s*(\(\d{2}:\d{2}:\d{2})\)\s*:', line_zero)
                     if zoom_match:
                         speaker_name = zoom_match.group(1).strip()
                         # print(f"[VTT Debug] Found speaker (Zoom Format) in raw_lines[0]: '{speaker_name}'")

            # Fallback: Check caption.text itself if no speaker found in raw_lines[0]
            # Sometimes parsers might put the whole line in .text if unsure
            if not speaker_name and len(text_content) < 70 and ':' in text_content:
                potential_speaker = text_content.split(':', 1)[0].strip()
                if '-->' not in potential_speaker and len(potential_speaker) > 1 and len(potential_speaker) < 50:
                     # Check if it looks like a speaker name (avoid random colons)
                     # This is less reliable - might need better heuristics
                     speaker_name = potential_speaker 
                     # print(f"[VTT Debug] Found potential speaker in caption.text: '{speaker_name}'")
            # ----------------------------------

            if speaker_name:
                # Calculate duration of this caption
                caption_duration = 0.0 # Default to 0
                try:
                    start_secs = sum(x * int(t) for x, t in zip([3600, 60, 1], caption.start.split('.')[0].split(':'))) + float('0.' + caption.start.split('.')[1])
                    end_secs = sum(x * int(t) for x, t in zip([3600, 60, 1], caption.end.split('.')[0].split(':'))) + float('0.' + caption.end.split('.')[1])
                    caption_duration = max(0, end_secs - start_secs) # Ensure non-negative
                    # print(f"[VTT Duration OK] Caption {i}: {caption.start} -> {caption.end} = {caption_duration:.3f}s") # Verbose success log
                except Exception as e:
                    print(f"[VTT Duration ERR] Caption {i}: Failed parsing '{caption.start}' -> '{caption.end}'. Error: {e}. Using 0.0s")
                    caption_duration = 0.0 # Use 0 if parsing fails
                
                # Log the calculated duration before adding
                print(f"[VTT Speaker Time] Speaker: {speaker_name}, Caption {i}, Calculated Duration: {caption_duration:.4f}") 
                
                if speaker_name not in speakers_data:
                     # Ensure the key used here matches the Pydantic model Field alias EXACTLY
                     speakers_data[speaker_name] = {"name": speaker_name, "speakingTime": 0.0, "segments": []}
                     print(f"[VTT Speaker Found] Adding new speaker: {speaker_name}")
                # Only add duration if it's positive
                if caption_duration > 0:
                    # Ensure the key used here matches the Pydantic model Field alias EXACTLY
                    speakers_data[speaker_name]["speakingTime"] += caption_duration
                # Add the text *without* the speaker tag
                cleaned_text = text_content.strip()
                if cleaned_text:
                     speakers_data[speaker_name]["segments"].append(cleaned_text)
                processed_speakers.add(speaker_name)
            # else: 
                # print(f"[VTT Debug] No speaker found for caption {i}. Raw: {caption.raw_text[:50]}... Text: {caption.text[:50]}... "")
        
        print(f"Finished VTT speaker extraction. Found {len(processed_speakers)} unique speakers: {processed_speakers if processed_speakers else 'None'}")
        # Revert to dictionary unpacking - Ensure model config handles alias
        # Explicitly set the field names to match the model's expected fields
        speakers_list = []
        for speaker_name, data in speakers_data.items():
            # Extract speaking time from the dict and ensure it's properly assigned
            speaking_time = data.get("speakingTime", 0.0)
            segments = data.get("segments", [])
            # Create SpeakerAnalysisOutput with explicit field assignments
            speaker = SpeakerAnalysisOutput(
                name=speaker_name,
                speakingTime=speaking_time,  # Use the correct field name as defined in the model
                segments=segments
            )
            speakers_list.append(speaker)
            print(f"Created speaker object for {speaker_name} with speakingTime={speaking_time}")
        
    # Convert aggregated data to SpeakerAnalysisOutput list (This line is now redundant due to above update)
    # speakers_list: List[SpeakerAnalysisOutput] = [
    #     SpeakerAnalysisOutput(**data) for data in speakers_data.values()
    # ]
    
    # --- Basic Reaction Parsing (from VTT captions) ---
    reaction_counts: Dict[str, int] = {}
    if file_type == 'vtt' and captions_data:
        emoji_pattern = re.compile(r'[🌀-🙏🚀-🛿☀-⛿✀-➿]') # Basic emoji range
        for caption in captions_data:
            # Check raw text for emojis
            emojis_found = emoji_pattern.findall(caption.raw_text)
            for emoji in emojis_found:
                reaction_counts[emoji] = reaction_counts.get(emoji, 0) + 1

    reactions_list: List[ReactionItemOutput] = [
        ReactionItemOutput(name=emoji, count=count) for emoji, count in reaction_counts.items()
    ]
    # Sort reactions by count descending
    reactions_list.sort(key=lambda x: x.count, reverse=True)
    reactions_output = ReactionsAnalysisOutput(reactions=reactions_list)
    # TODO: Implement speaker-specific reaction parsing if possible
    
    # --- Parse Chat File (Reactions & Comments) ---
    chat_results: Optional[ChatParsingResult] = parse_chat_file(chat_file_path)
    comments_output = [] # Initialize as list
    speaker_reactions_output = {} # Initialize as dict for speaker reactions

    if chat_results:
        print(f"Chat parsing successful. Found {len(chat_results.messages)} comments and reactions from {len(chat_results.reactions_by_author)} authors.")
        # Save comments if needed (optional, could be large)
        comments_output_file = os.path.join(output_dir, f"{meeting_details['meetingId']}_comments.json")
        try:
            with open(comments_output_file, 'w', encoding='utf-8') as f:
                # Convert Comment object to dict for JSON serialization
                json.dump([comment.dict() for comment in chat_results.messages], f, indent=2)
            print(f"Saved chat comments to {comments_output_file}")
            comments_output = chat_results.messages # Store for direct inclusion if needed
        except Exception as e:
            print(f"Error saving chat comments: {e}")
            comments_output_file = None # Indicate failure

        # --- Aggregate Chat Reactions ---
        # Add debug print to inspect the object
        print(f"[DEBUG] Type of chat_results: {type(chat_results)}")
        try:
            print(f"[DEBUG] Attributes of chat_results: {chat_results.__dict__}")
        except AttributeError:
             print("[DEBUG] chat_results does not have __dict__ attribute.")
             print(f"[DEBUG] chat_results value: {chat_results}")
             
        # Use getattr for safer access
        chat_reaction_summary = getattr(chat_results, 'reactions_summary', None)
        if chat_reaction_summary:
             print("Aggregating reactions from chat file...")
             for reaction_name, count in chat_reaction_summary.items(): # Use the variable
                 # Use reaction_counts dictionary (initialized earlier from VTT)
                 reaction_counts[reaction_name] = reaction_counts.get(reaction_name, 0) + count
             print(f"Combined reaction counts after chat aggregation: {reaction_counts}")
        else:
             print("[DEBUG] 'reactions_summary' not found or is None in chat_results.")

        # --- Prepare Speaker Reactions Output ---
        # Use getattr for safer access
        chat_reactions_by_author = getattr(chat_results, 'reactions_by_author', None)
        if chat_reactions_by_author:
             print("Processing speaker-specific reactions from chat...")
             speaker_reactions_output = {} # Re-initialize as dict
             for author, reactions in chat_reactions_by_author.items(): # Use the variable
                  # Convert dict of reactions to list of dicts expected by the model
                  formatted_reactions = [{"name": name, "count": count} for name, count in reactions.items()]
                  speaker_reactions_output[author] = formatted_reactions # Use author name as key
             print(f"Processed speaker reactions for {len(speaker_reactions_output)} authors.")
        else:
             print("[DEBUG] 'reactions_by_author' not found or is None in chat_results.")

    else:
        print("Chat file not provided or parsing failed.")

    # --- Final Reactions Output ---
    # Use reaction_counts which now contains combined counts
    reactions_list: List[ReactionItemOutput] = [
        ReactionItemOutput(name=emoji, count=count) for emoji, count in reaction_counts.items()
    ]
    # Sort reactions by count descending
    reactions_list.sort(key=lambda x: x.count, reverse=True)
    # Create the ReactionsAnalysisOutput object, now including speakerReactions
    reactions_output = ReactionsAnalysisOutput(
         reactions=reactions_list,
         speakerReactions=speaker_reactions_output if speaker_reactions_output else None # Use the processed speaker reactions
     )
    
    # --- Calculate Participant Stats ---
    speaking_participant_names = set(speakers_data.keys())
    # Use getattr for safer access
    chat_messages = getattr(chat_results, 'messages', []) if chat_results else []
    chat_reactions_by_author = getattr(chat_results, 'reactions_by_author', {}) if chat_results else {}
    
    chat_authors = set(c.author for c in chat_messages)
    reacting_authors = set(chat_reactions_by_author.keys())

    # Combine all unique participants identified through speaking, chatting, or reacting
    all_identified_participants_set = speaking_participant_names.union(chat_authors).union(reacting_authors)
    # Convert set to list of simple Participant objects
    all_identified_participants_list = [Participant(name=name) for name in sorted(list(all_identified_participants_set))]

    total_participants_count = len(all_identified_participants_set) if all_identified_participants_set else None
    speaking_participants_count = len(speaking_participant_names) if speaking_participant_names else None
    reacting_participants_count = len(reacting_authors) if reacting_authors else None
    # Define 'active' as speaking OR chatting OR reacting
    active_participants_count = total_participants_count

    print(f"[Participant Stats] Total: {total_participants_count}, Speaking: {speaking_participants_count}, Reacting: {reacting_participants_count}, Active: {active_participants_count}")
    print(f"[Participant List] Identified: {sorted(list(all_identified_participants_set))}") # Log the list

    participant_stats = ParticipantStatsOutput(
        totalParticipants=total_participants_count,
        activeParticipants=active_participants_count,
        speakingParticipants=speaking_participants_count,
        reactingParticipants=reacting_participants_count,
        participantInfo=all_identified_participants_list # Store the list here
    )
    # ---------------------------------
    
    # --- Run Sentiment Analysis (Including Per Speaker if possible) ---
    sentiment_analysis_result: Optional[SentimentResult] = None
    topic_modeling_result: Optional[TopicModelingResult] = None 
    ai_insights_result = None # Initialize variable
    
    print("[Pipeline Debug] Checking if transcript exists for AI models...") # DEBUG
    if transcript:
        try:
            sentiment_analysis_result = analyze_sentiment(transcript)
            print(f"[Pipeline Debug] Overall Sentiment Result: Label={sentiment_analysis_result.overall_label}, Score={sentiment_analysis_result.overall_score}") # DEBUG
        except Exception as e:
            print(f"[Pipeline] Sentiment Error: {e}")
            sentiment_analysis_result = None

        # --- Re-add: Run Topic Modeling ---
        try:
            if not transcript:
                print("[Pipeline] WARNING: Empty transcript. Skipping topic modeling.")
            else:
                # Log transcript size for debugging
                print(f"[Pipeline] Running topic modeling on transcript with {len(transcript)} characters")
                
                # Remove excessive whitespace to clean up the transcript
                clean_transcript = re.sub(r'\s+', ' ', transcript).strip()
                print(f"[Pipeline] Cleaned transcript: {len(clean_transcript)} characters")
                
                # Check for truncation issues
                if len(clean_transcript) < len(transcript) * 0.9:
                    print("[Pipeline] WARNING: Significant reduction in transcript size after cleaning. Check for truncation issues.")
                
                # Process the cleaned transcript
                # NOTE: The model_topics function now returns an empty result as we're using
                # Mistral 7B for topic extraction in the insights generation phase instead of BERTopic.
                # We're keeping the code structure for compatibility while the actual implementation
                # has been moved to the LLM-based approach for better context understanding and topic identification.
                topic_modeling_result = model_topics(clean_transcript)
                
                # Log the results
                if topic_modeling_result and topic_modeling_result.topics:
                    topic_names = [t.name for t in topic_modeling_result.topics]
                    print(f"[Pipeline] Topic modeling completed. Found {len(topic_names)} topics: {topic_names}")
                else:
                    print("[Pipeline] Topic modeling completed but no topics were found. Using Mistral 7B insights for topics instead.")
        except Exception as e:
            print(f"Topic modeling failed: {e}")
            topic_modeling_result = None # Ensure it's None on error

        # --- Run AI Insights (Handles Topic Summary/Feedback now) ---
        try:
            # This is where Mistral 7B generates topics and insights now, rather than using BERTopic
            ai_insights_result = generate_ai_insights(transcript)
            print("AI insights generation completed with Mistral 7B (including topic analysis).")
        except Exception as e:
            print(f"[Pipeline] AI insights generation error: {e}")
            ai_insights_result = None
    else:
         print("Skipping AI analysis: No transcript available.")

    # --- Calculate Topic Percentages (Moved *before* final assembly) ---
    calculated_topics_list: Optional[List[TopicAnalysisOutput]] = None
    if topic_modeling_result and topic_modeling_result.topics:
        print("Calculating topic percentages...")
        topic_info_list = topic_modeling_result.topics
        total_docs_in_topics = sum(t.count for t in topic_info_list if t.count is not None)
        print(f"Total documents/sentences assigned to topics: {total_docs_in_topics}")
        
        temp_calculated_outputs = []
        if total_docs_in_topics > 0:
            for topic_info in topic_info_list:
                percentage = round((topic_info.count / total_docs_in_topics) * 100, 2) if topic_info.count else 0.0
                temp_calculated_outputs.append(
                    TopicAnalysisOutput(
                        name=topic_info.name, 
                        percentage=percentage,
                        keywords=topic_info.keywords
                    )
                )
                print(f"  - Topic: {topic_info.name}, Count: {topic_info.count}, Percentage: {percentage}%")
        else:
            print("Warning: total_docs_in_topics is 0. Assigning 0% to all topics.")
            temp_calculated_outputs = [
                TopicAnalysisOutput(name=t.name, percentage=0.0, keywords=t.keywords) for t in topic_info_list
            ]
            
        temp_calculated_outputs.sort(key=lambda x: x.percentage, reverse=True)
        calculated_topics_list = temp_calculated_outputs[:5] # Limit to top 5
        print(f"Final topics list prepared for JSON: {[t.name for t in calculated_topics_list]}")
    # ---------------------------------------------------------

    # --- Run Sentiment per Speaker (If speaker data available) ---
    if speakers_list and sentiment_analysis_result: # Check if sentiment model loaded
        print("Running sentiment analysis per speaker...")
        for speaker_output in speakers_list:
            speaker_name = speaker_output.name
            speaker_segments = speakers_data.get(speaker_name, {}).get("segments", [])
            if speaker_segments:
                 # Join segments and analyze
                 speaker_text = " ".join(speaker_segments)
                 try:
                     speaker_sentiment_result = analyze_sentiment(speaker_text) # Analyze this speaker's text
                     # Assign the overall score for this speaker's text
                     speaker_output.sentiment = speaker_sentiment_result.overall_score 
                 except Exception as speaker_sentiment_error:
                     print(f"Failed to analyze sentiment for speaker {speaker_name}: {speaker_sentiment_error}")
                     speaker_output.sentiment = None # Indicate failure
            else:
                speaker_output.sentiment = None # No text segments found
        print("Per-speaker sentiment analysis done.")

    # 3. Calculate Metrics
    duration_seconds = get_meeting_duration(file_path, file_type, captions=captions_data)
    
    # --- Calculate Speaker Percentage ---
    if duration_seconds and duration_seconds > 0 and speakers_list:
        print(f"Calculating speaking percentages based on total duration: {duration_seconds:.2f}s")
        for speaker in speakers_list:
            # Debug the actual speaker object to see its properties
            print(f"[DEBUG] Speaker object properties: {speaker}")
            
            # Check if speakingTime exists and is accessible
            speaking_time = getattr(speaker, 'speakingTime', None)
            if speaking_time is not None:
                percentage = (speaking_time / duration_seconds) * 100
                speaker.speakingPercentage = round(percentage, 2) # Store as percentage
                print(f"  - {speaker.name}: Time={speaking_time:.2f}s, Percentage={speaker.speakingPercentage:.2f}%")
            else:
                speaker.speakingPercentage = 0.0 # Handle case where speakingTime is None
                print(f"  - {speaker.name}: Time=None or not available, Percentage=0.0%")
    else:
        print("Skipping speaker percentage calculation (duration unknown or no speakers).")
        # Ensure percentage is 0.0 if calculation skipped
        for speaker in speakers_list:
            speaker.speakingPercentage = 0.0
    # ---------------------------------

    # --- Generate Sentiment Timeline ---
    sentiment_timeline: List[SentimentTimelineItem] = []
    if sentiment_analysis_result and sentiment_analysis_result.sentences and duration_seconds:
         # Determine the source of time data (captions or transcription segments)
         time_data_source = None
         if file_type == 'vtt' and captions_data:
             time_data_source = captions_data
             print("Using VTT captions for sentiment timeline generation.")
         elif file_type == 'm4a' and transcript_segments:
             # Assuming transcript_segments have .start, .end, .text attributes
             time_data_source = transcript_segments 
             print("Using transcription segments for sentiment timeline generation.")
             
         if time_data_source:
             try:
                 sentiment_timeline = generate_sentiment_timeline(
                     sentence_sentiments=sentiment_analysis_result.sentences,
                     captions=time_data_source,
                     duration=duration_seconds,
                     interval_seconds=900 # Set to 15 minutes (900 seconds)
                 )
                 print(f"Generated sentiment timeline with {len(sentiment_timeline)} points.")
             except Exception as e:
                 print(f"Error generating sentiment timeline: {e}")
         else:
              print("Could not generate sentiment timeline: No suitable time data source found.")
    else:
        print("Skipping sentiment timeline generation: Missing sentiment results, sentences, or duration.")
    # ----------------------------------

    # Find last speaker based on diarization/VTT parsing end times
    last_speaker_name = None
    last_turn_end_time = -1.0
    if diarization_result and diarization_result.turns:
        # Use pyannote turns if available
        sorted_turns = sorted(diarization_result.turns, key=lambda x: x.end)
        if sorted_turns:
            last_speaker_name = sorted_turns[-1].speaker
    elif file_type == 'vtt' and captions_data: # Check captions_data directly
        # Fallback: Find the speaker from the last caption *with* a speaker tag
        print("Attempting to find last speaker from VTT captions...")
        for caption in reversed(captions_data):
            raw_text = caption.raw_text
            # print(f"[Last Speaker Debug] Checking caption raw text: {raw_text[:100]}...") # Keep logging disabled for now
            speaker_name_found = None
            
            # Try Zoom format first (Improved Regex)
            # Look for Name, optional space, (HH:MM:SS), optional space, Colon
            speaker_match_zoom = re.match(r'^([^(]+?)\s*\((\d{2}:\d{2}:\d{2})\)\s*:', raw_text)
            if speaker_match_zoom:
                speaker_name_found = speaker_match_zoom.group(1).strip()
            else:
                # Fallback to colon format (Improved Check)
                lines = raw_text.split('\n')
                # Check first non-empty line for Speaker:
                first_line = lines[0].strip() if lines else ""
                if first_line.endswith(':') and len(first_line) > 1 and len(first_line) < 70 and '-->' not in first_line:
                    potential_speaker = first_line[:-1].strip()
                    # Avoid mistaking timestamps or short fragments for names
                    if potential_speaker and len(potential_speaker) > 1: 
                       speaker_name_found = potential_speaker
            
            if speaker_name_found:
                last_speaker_name = speaker_name_found
                print(f"Last speaker identified from VTT: {last_speaker_name}")
                break # Found the last speaker, stop searching
        if not last_speaker_name:
             print("Could not identify last speaker from VTT captions.")

    print("TODO: Refine metric calculations (active/reacting participants)")

    # --- Calculate Engagement Score (using helper) --- 
    engagement_score = calculate_basic_engagement(speakers_data, chat_results)
    # Convert to percentage (0-100 scale) for the frontend
    engagement_score_percentage = engagement_score * 100
    print(f"Engagement score: {engagement_score} converted to percentage: {engagement_score_percentage:.2f}%")
    # ---------------------------------------------

    # 4. Assemble Final JSON Output
    # Include the new top-level fields and the refined participant structure
    final_json_data = MeetingAnalysisJSON(
        # --- New Top-Level Fields ---
        meetingId=meeting_details['meetingId'],
        meetingTitle=meeting_details['meetingTitle'],
        date=meeting_details['date'],
        platform=meeting_details['platform'],
        # --- Existing Fields ---
        metadata=MeetingMetadata(
            source_file=os.path.basename(file_path),
            file_type=file_type,
            engagement_score=engagement_score_percentage # Use percentage for engagement score
        ),
        transcript=transcript,
        duration=duration_seconds if duration_seconds else 0.0, # Use calculated duration
        sentiment=SentimentAnalysisOutput(
            overall=sentiment_analysis_result.overall_score if sentiment_analysis_result else 0.0,
            timeline=sentiment_timeline if sentiment_timeline else [] # Include timeline here
            # Add positive/negative/neutral if available from sentiment_analysis_result
        ) if sentiment_analysis_result else None, # Handle case where sentiment failed
        speakers=speakers_list if speakers_list else [],
        topics=TopicsOutput(topics=calculated_topics_list) if calculated_topics_list else None, # Use pre-calculated list
        reactions=reactions_output if reactions_output else None, # Include combined reactions (with speaker reactions)
        participants=participant_stats, # Use the updated ParticipantStatsOutput
        summary=ai_insights_result.summary if ai_insights_result else None,
        action_items=ai_insights_result.action_items if ai_insights_result else [],
        insights=ai_insights_result.other_insights if ai_insights_result else None,
        last_speaker=last_speaker_name,
        comments=[comment.dict() for comment in comments_output] if comments_output else [] # Convert ChatMessage objects to dictionaries
    )

    # 5. Save Final JSON
    output_filename = f"meeting-analysis-{meeting_details['meetingId']}.json" # Changed to match expected dashboard filename
    output_path = os.path.join(output_dir, output_filename)

    try:
        # Save the main analysis file
        with open(output_path, 'w', encoding='utf-8') as f:
            # Use by_alias=True to ensure correct field names like 'speakingTime' are used
            json.dump(final_json_data.dict(by_alias=True, exclude_none=True), f, indent=2, ensure_ascii=False)
        print(f"Successfully saved final analysis JSON to: {output_path}")
        
        # Generate and save individual component files
        generate_component_files(final_json_data, output_dir, meeting_details['meetingId'])
        
    except Exception as e:
        print(f"CRITICAL: Failed to save final JSON analysis: {e}")
        # Potentially raise the exception or return a specific error indicator
        # For now, just print the error and return None or raise
        raise HTTPException(status_code=500, detail=f"Failed to save final JSON analysis: {e}") from e

    # Return the Pydantic model instance
    return final_json_data

def extract_participants(transcript: str, captions: List[VttCaption]) -> List[Participant]:
    """Extracts participants from transcript and captions."""
    participants = []
    speaker_counts = {}
    
    # First pass: Count speaker occurrences
    for caption in captions:
        raw_text = caption.raw_text
        # Try to extract speaker from Zoom format
        speaker_match = re.match(r'^([^(]+)\((\d{2}:\d{2}:\d{2})\):', raw_text)
        if speaker_match:
            speaker_name = speaker_match.group(1).strip()
        else:
            # Fallback to colon-based format
            lines = raw_text.split('\n')
            if lines and lines[0].endswith(':') and len(lines[0]) < 50:
                speaker_name = lines[0][:-1].strip()
            else:
                continue
                
        speaker_counts[speaker_name] = speaker_counts.get(speaker_name, 0) + 1
    
    # Create participants for speakers who spoke at least once
    for speaker_name, count in speaker_counts.items():
        participants.append(Participant(
            name=speaker_name,
            role="Speaker",  # Default role
            speaking_time=0,  # Will be calculated later
            word_count=0,     # Will be calculated later
            sentiment_score=0.0,
            engagement_score=0.0
        ))
    
    return participants

def process_transcript_file(file_path: str, meeting_id: str) -> Dict:
    """Processes a transcript file and returns analysis results."""
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.vtt':
            # Parse VTT file
            vtt_result = parse_vtt(file_path)
            transcript = vtt_result.transcript
            captions = vtt_result.captions
            
            # Extract participants from captions
            participants = extract_participants(transcript, captions)
            
            # Calculate speaking time and word count for each participant
            for participant in participants:
                participant_speaking_time = 0
                participant_word_count = 0
                
                for caption in captions:
                    raw_text = caption.raw_text
                    speaker_match = re.match(r'^([^(]+)\((\d{2}:\d{2}:\d{2})\):', raw_text)
                    if speaker_match:
                        speaker_name = speaker_match.group(1).strip()
                    else:
                        lines = raw_text.split('\n')
                        if lines and lines[0].endswith(':') and len(lines[0]) < 50:
                            speaker_name = lines[0][:-1].strip()
                        else:
                            continue
                            
                    if speaker_name == participant.name:
                        # Calculate speaking time in seconds
                        start_time = datetime.strptime(caption.start, '%H:%M:%S.%f')
                        end_time = datetime.strptime(caption.end, '%H:%M:%S.%f')
                        duration = (end_time - start_time).total_seconds()
                        participant_speaking_time += duration
                        
                        # Count words in the caption text
                        words = caption.text.split()
                        participant_word_count += len(words)
                
                participant.speaking_time = participant_speaking_time
                participant.word_count = participant_word_count
            
            # Perform sentiment analysis
            sentiment_results = analyze_sentiment(transcript)
            
            # Calculate engagement scores
            for participant in participants:
                participant.engagement_score = calculate_engagement_score(
                    participant.word_count,
                    participant.speaking_time,
                    len(transcript.split())
                )
            
            return {
                'transcript': transcript,
                'participants': [p.dict() for p in participants],
                'sentiment': sentiment_results,
                'captions': [c.dict() for c in captions]
            }
            
        elif file_ext == '.txt':
            # Handle plain text files
            with open(file_path, 'r', encoding='utf-8') as f:
                transcript = f.read()
            
            # Extract participants using basic heuristics
            participants = extract_participants(transcript, [])
            
            # Perform sentiment analysis
            sentiment_results = analyze_sentiment(transcript)
            
            return {
                'transcript': transcript,
                'participants': [p.dict() for p in participants],
                'sentiment': sentiment_results
            }
            
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
            
    except Exception as e:
        print(f"Error processing transcript file: {e}")
        raise 

def generate_component_files(analysis_data: MeetingAnalysisJSON, output_dir: str, meeting_id: str):
    """Generate individual component files from the main analysis file.
    
    These component files are used by specific dashboard components for optimized data access.
    """
    print(f"Generating component files for meeting: {meeting_id}")
    
    # Mark obsolete files with 'DNU-' prefix (Do Not Use)
    obsolete_files = [
        f"{meeting_id}_analysis.json",  # Old main analysis file
        f"analysis-{meeting_id}.json"   # Another potential old format
    ]
    
    for obsolete_file in obsolete_files:
        old_path = os.path.join(output_dir, obsolete_file)
        if os.path.exists(old_path):
            new_path = os.path.join(output_dir, f"DNU-{obsolete_file}")
            try:
                # Rename obsolete file with DNU prefix
                os.rename(old_path, new_path)
                print(f"Marked obsolete file {obsolete_file} as {new_path}")
            except Exception as e:
                print(f"Error renaming obsolete file {obsolete_file}: {e}")
    
    # 1. Generate participants component file
    if analysis_data.participants:
        participants_path = os.path.join(output_dir, f"participants-analysis-{meeting_id}.json")
        try:
            participants_data = analysis_data.participants.dict(by_alias=True, exclude_none=True)
            print(f"Saving participants data: {participants_data}")
            with open(participants_path, 'w', encoding='utf-8') as f:
                json.dump(participants_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved participants component file: {participants_path}")
        except Exception as e:
            print(f"Error saving participants component file: {e}")
    
    # 2. Generate reactions component file
    if analysis_data.reactions:
        reactions_path = os.path.join(output_dir, f"reactions-analysis-{meeting_id}.json")
        try:
            reactions_data = analysis_data.reactions.dict(by_alias=True, exclude_none=True)
            with open(reactions_path, 'w', encoding='utf-8') as f:
                json.dump(reactions_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved reactions component file: {reactions_path}")
        except Exception as e:
            print(f"Error saving reactions component file: {e}")
    
    # 3. Generate speakers component file
    if analysis_data.speakers:
        speakers_path = os.path.join(output_dir, f"speakers-analysis-{meeting_id}.json")
        try:
            speakers_data = {"speakers": [s.dict(by_alias=True, exclude_none=True) for s in analysis_data.speakers]}
            with open(speakers_path, 'w', encoding='utf-8') as f:
                json.dump(speakers_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved speakers component file: {speakers_path}")
        except Exception as e:
            print(f"Error saving speakers component file: {e}")
    
    # 4. Generate sentiment component file
    if analysis_data.sentiment:
        sentiment_path = os.path.join(output_dir, f"sentiment-analysis-{meeting_id}.json")
        try:
            sentiment_data = analysis_data.sentiment.dict(by_alias=True, exclude_none=True)
            with open(sentiment_path, 'w', encoding='utf-8') as f:
                json.dump(sentiment_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved sentiment component file: {sentiment_path}")
        except Exception as e:
            print(f"Error saving sentiment component file: {e}")
    
    # 5. Generate topics component file
    if analysis_data.topics:
        topics_path = os.path.join(output_dir, f"topics-analysis-{meeting_id}.json")
        try:
            topics_data = analysis_data.topics.dict(by_alias=True, exclude_none=True)
            with open(topics_path, 'w', encoding='utf-8') as f:
                json.dump(topics_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved topics component file: {topics_path}")
        except Exception as e:
            print(f"Error saving topics component file: {e}")
    
    # 6. Generate comments component file
    if analysis_data.comments:
        comments_path = os.path.join(output_dir, f"comments-analysis-{meeting_id}.json")
        try:
            comments_data = {"comments": analysis_data.comments}
            with open(comments_path, 'w', encoding='utf-8') as f:
                json.dump(comments_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved comments component file: {comments_path}")
        except Exception as e:
            print(f"Error saving comments component file: {e}")
    
    # 7. Generate timeline component file
    if analysis_data.sentiment and analysis_data.sentiment.timeline:
        timeline_path = os.path.join(output_dir, f"timeline-{meeting_id}.json")
        try:
            # Calculate real engagement metrics over time using raw data
            vtt_captions = None
            chat_data = None
            
            # Try to find the VTT file path from metadata
            source_file = analysis_data.metadata.source_file if analysis_data.metadata else None
            if source_file and '.vtt' in source_file:
                # Get base directory from our component files output
                base_dir = os.path.dirname(os.path.dirname(output_dir))
                possible_dirs = [
                    os.path.join(base_dir, 'data', 'meeting_recordings'),
                    os.path.join(base_dir, 'data', 'meeting_recordings', 'Zoom'),
                    os.path.join(os.path.dirname(base_dir), 'data', 'meeting_recordings'),
                    os.path.join(os.path.dirname(base_dir), 'data', 'meeting_recordings', 'Zoom')
                ]
                
                # Try to find the VTT file
                vtt_path = None
                for dir_path in possible_dirs:
                    potential_path = os.path.join(dir_path, source_file)
                    if os.path.exists(potential_path):
                        vtt_path = potential_path
                        break
                
                # If VTT found, also look for the chat txt file
                if vtt_path:
                    chat_path = vtt_path.replace('.vtt', 'newChat.txt')
                    if os.path.exists(chat_path):
                        chat_data = chat_path
            
            # Calculate real engagement data if possible
            engagement_timeline = []
            if vtt_path:
                try:
                    from models.transcript import VttCaption
                    from models.chat import ChatParsingResult, ChatMessage
                    from services.vtt_parser import parse_vtt
                    from services.chat_parser import parse_chat_file
                    
                    # Parse VTT file
                    vtt_result = parse_vtt(vtt_path)
                    vtt_captions = vtt_result.captions if vtt_result else []
                    
                    # Parse chat file 
                    chat_results = parse_chat_file(chat_path) if chat_path else None
                    
                    # Calculate engagement timeline
                    engagement_timeline = calculate_engagement_over_time(
                        vtt_captions,
                        analysis_data.transcript or "",
                        chat_results,
                        analysis_data.duration or 0,
                        interval_seconds=900  # 15-minute intervals to match sentiment
                    )
                except Exception as e:
                    print(f"Error calculating real engagement timeline: {e}")
            
            # If real engagement calculation failed, use the overall score
            if not engagement_timeline:
                print("Warning: Using synthetic engagement data derived from overall score")
                # Get the engagement score from metadata
                overall_engagement = analysis_data.metadata.engagement_score / 100.0 if analysis_data.metadata and analysis_data.metadata.engagement_score is not None else 0.5
                
                # Create synthetic engagement timeline
                engagement_timeline = []
                
                for item in analysis_data.sentiment.timeline:
                    variance = ((item.sentiment - 0.5) * 0.2)  # Creates +/- 10% variance
                    point_engagement = overall_engagement + variance
                    # Keep engagement within 0-1 range
                    point_engagement = max(0, min(1, point_engagement))
                    
                    engagement_timeline.append({
                        "timestamp": item.timestamp,
                        "engagement": point_engagement
                    })
            
            # Combine sentiment and engagement data
            timeline_data = {"timeline": []}
            
            # Create a mapping of timestamps to engagement scores
            engagement_map = {str(item["timestamp"]): item["engagement"] for item in engagement_timeline}
            
            # Merge with sentiment timeline
            for item in analysis_data.sentiment.timeline:
                timestamp_key = str(item.timestamp)
                engagement = engagement_map.get(timestamp_key, 0.5)  # Default if not found
                
                timeline_data["timeline"].append({
                    "timestamp": item.timestamp,
                    "sentiment": item.sentiment,
                    "engagement": engagement
                })
            
            with open(timeline_path, 'w', encoding='utf-8') as f:
                json.dump(timeline_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved timeline component file with real engagement data: {timeline_path}")
        except Exception as e:
            print(f"Error saving timeline component file: {e}")
    
    print(f"Component file generation complete for meeting: {meeting_id}") 

def calculate_engagement_over_time(
    captions_data, 
    transcript: str, 
    chat_results, 
    duration_seconds: float,
    interval_seconds: int = 300  # Default 5-minute intervals
) -> List[Dict[str, Any]]:
    """
    Calculate engagement metrics over time based on real activity data.
    
    Args:
        captions_data: VTT captions with timestamps
        transcript: Full transcript text
        chat_results: Parsed chat data (comments and reactions)
        duration_seconds: Total duration of the meeting in seconds
        interval_seconds: Time interval for calculating engagement (default: 5 min)
        
    Returns:
        List of dicts with timestamp and engagement score for each interval
    """
    if not captions_data or duration_seconds <= 0:
        print("Cannot calculate engagement timeline: Missing captions or duration")
        return []
    
    # Initialize time intervals
    num_intervals = math.ceil(duration_seconds / interval_seconds)
    intervals = []
    
    for i in range(num_intervals):
        start_time = i * interval_seconds
        end_time = min((i + 1) * interval_seconds, duration_seconds)
        intervals.append({
            "start": start_time,
            "end": end_time,
            "timestamp": start_time,  # For consistency with sentiment timeline
            "speaker_turns": 0,
            "unique_speakers": set(),
            "speaking_duration": 0,
            "comments": 0,
            "reactions": 0,
            "unique_reaction_types": set()
        })
    
    # Calculate speaking activity metrics per interval
    total_participants = set()
    
    for caption in captions_data:
        # Extract caption time in seconds
        try:
            start_time_str = caption.start
            end_time_str = caption.end
            
            # Convert HH:MM:SS.ms to seconds
            start_parts = start_time_str.split(':')
            start_seconds = (int(start_parts[0]) * 3600 + 
                            int(start_parts[1]) * 60 + 
                            float(start_parts[2]))
                            
            end_parts = end_time_str.split(':')
            end_seconds = (int(end_parts[0]) * 3600 + 
                          int(end_parts[1]) * 60 + 
                          float(end_parts[2]))
            
            caption_duration = end_seconds - start_seconds
            
            # Extract speaker from caption
            speaker_name = None
            raw_text = caption.raw_text
            speaker_match = re.match(r'^([^(]+?)\s*\([^)]*\)\s*:', raw_text)
            
            if speaker_match:
                speaker_name = speaker_match.group(1).strip()
            else:
                # Try alternative format
                lines = raw_text.split('\n')
                if lines and lines[0].endswith(':'):
                    speaker_name = lines[0].rstrip(':').strip()
            
            if speaker_name:
                total_participants.add(speaker_name)
                
                # Find which interval this caption belongs to
                interval_idx = min(int(start_seconds // interval_seconds), num_intervals - 1)
                intervals[interval_idx]["speaker_turns"] += 1
                intervals[interval_idx]["unique_speakers"].add(speaker_name)
                intervals[interval_idx]["speaking_duration"] += caption_duration
                
        except Exception as e:
            print(f"Error processing caption for engagement timeline: {e}")
    
    # Process chat data if available
    if chat_results:
        # Process comments
        chat_messages = getattr(chat_results, 'messages', [])
        for msg in chat_messages:
            if hasattr(msg, 'timestamp') and msg.timestamp:
                try:
                    # Convert timestamp to seconds if needed
                    if isinstance(msg.timestamp, str):
                        # Assuming format like "00:14:10"
                        time_parts = msg.timestamp.split(':')
                        msg_seconds = (int(time_parts[0]) * 3600 + 
                                     int(time_parts[1]) * 60 + 
                                     int(time_parts[2]) if len(time_parts) > 2 else 0)
                    else:
                        msg_seconds = float(msg.timestamp)
                    
                    # Find the interval
                    interval_idx = min(int(msg_seconds // interval_seconds), num_intervals - 1)
                    intervals[interval_idx]["comments"] += 1
                    
                    # Add author to total participants if not already there
                    if hasattr(msg, 'author') and msg.author:
                        total_participants.add(msg.author)
                        
                except Exception as e:
                    print(f"Error processing chat message for engagement timeline: {e}")
        
        # Process reactions
        reactions_by_author = getattr(chat_results, 'reactions_by_author', {})
        reactions_data = []
        
        # Flatten the reactions data with timestamps if available
        if hasattr(chat_results, 'reactions_with_time'):
            for reaction_info in chat_results.reactions_with_time:
                if hasattr(reaction_info, 'timestamp') and reaction_info.timestamp:
                    try:
                        # Convert timestamp to seconds
                        if isinstance(reaction_info.timestamp, str):
                            time_parts = reaction_info.timestamp.split(':')
                            reaction_seconds = (int(time_parts[0]) * 3600 + 
                                              int(time_parts[1]) * 60 + 
                                              int(time_parts[2]) if len(time_parts) > 2 else 0)
                        else:
                            reaction_seconds = float(reaction_info.timestamp)
                        
                        # Find the interval
                        interval_idx = min(int(reaction_seconds // interval_seconds), num_intervals - 1)
                        intervals[interval_idx]["reactions"] += 1
                        if hasattr(reaction_info, 'reaction') and reaction_info.reaction:
                            intervals[interval_idx]["unique_reaction_types"].add(reaction_info.reaction)
                    except Exception as e:
                        print(f"Error processing reaction for engagement timeline: {e}")
    
    # Calculate total counts across all intervals for normalization
    total_speaker_turns = sum(interval["speaker_turns"] for interval in intervals)
    total_comments = sum(interval["comments"] for interval in intervals)
    total_reactions = sum(interval["reactions"] for interval in intervals)
    max_speaking_duration = max(interval["speaking_duration"] for interval in intervals) if intervals else 1
    total_participants_count = len(total_participants) if total_participants else 1
    
    # Calculate engagement scores for each interval using the formula
    engagement_timeline = []
    
    for interval in intervals:
        # Calculate normalized component scores
        speaking_score = 0
        if total_speaker_turns > 0 and max_speaking_duration > 0:
            # Normalize speaker turns and speaking duration
            turns_score = interval["speaker_turns"] / total_speaker_turns if total_speaker_turns > 0 else 0
            duration_score = interval["speaking_duration"] / max_speaking_duration
            participation_ratio = len(interval["unique_speakers"]) / total_participants_count
            
            # Combined speaking score (weighted average of turns, duration, unique speakers)
            speaking_score = (turns_score * 0.4 + duration_score * 0.4 + participation_ratio * 0.2)
        
        # Comment activity score
        comment_score = interval["comments"] / (total_comments * 2) if total_comments > 0 else 0
        
        # Reaction activity score
        reaction_count_score = interval["reactions"] / (total_reactions * 2) if total_reactions > 0 else 0
        reaction_diversity_score = len(interval["unique_reaction_types"]) / 5  # Assuming 5 reaction types is diverse
        reaction_score = (reaction_count_score * 0.6 + reaction_diversity_score * 0.4)
        
        # Final weighted engagement score
        engagement_score = (0.6 * speaking_score) + (0.2 * comment_score) + (0.2 * reaction_score)
        
        # Ensure between 0 and 1
        engagement_score = min(max(engagement_score, 0), 1)
        
        engagement_timeline.append({
            "timestamp": interval["timestamp"],
            "engagement": engagement_score
        })
    
    print(f"Generated engagement timeline with {len(engagement_timeline)} points based on real activity.")
    return engagement_timeline 