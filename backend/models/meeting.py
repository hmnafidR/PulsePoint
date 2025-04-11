from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime

# --- Data Structures matching JSON output from analysis scripts ---

class SentimentTimelineItem(BaseModel):
    timestamp: float # Or str, depending on source
    sentiment: float # Typically 0-1

class SentimentAnalysisOutput(BaseModel):
    overall: Optional[float] = None
    timeline: Optional[List[SentimentTimelineItem]] = None

class SpeakerAnalysisOutput(BaseModel):
    name: str
    speakingTime: Optional[float] = Field(None, alias="speaking_time") # In seconds
    speakingPercentage: Optional[float] = Field(None, alias="speaking_percentage") # Add percentage field
    sentiment: Optional[float] = None # Overall sentiment for the speaker
    # Add other speaker metrics if available

class TopicAnalysisOutput(BaseModel):
    name: str
    percentage: Optional[float] = None
    sentiment: Optional[str] = None # "positive", "negative", "neutral"
    keywords: Optional[List[str]] = None
    # Add duration if calculated separately

class TopicsOutput(BaseModel):
    topics: Optional[List[TopicAnalysisOutput]] = None

class ReactionItemOutput(BaseModel):
    name: str
    count: int
    sentiment: Optional[float] = None

class ReactionsAnalysisOutput(BaseModel):
    reactions: Optional[List[ReactionItemOutput]] = None
    speakerReactions: Optional[Dict[str, List[Dict]]] = Field(None, alias="speaker_reactions")

class ParticipantStatsOutput(BaseModel):
    totalParticipants: Optional[int] = Field(None, alias="total_participants")
    activeParticipants: Optional[int] = Field(None, alias="active_participants")
    speakingParticipants: Optional[int] = Field(None, alias="speaking_participants")
    reactingParticipants: Optional[int] = Field(None, alias="reacting_participants")
    # Add other participant metrics if available
    
    class Config:
        populate_by_name = True  # Allow using alias names

class MeetingMetadata(BaseModel):
    """Metadata about the meeting source and processing."""
    source_file: Optional[str] = None
    file_type: Optional[str] = None
    engagement_score: Optional[float] = None # Can be float or int, use float for flexibility

class MeetingAnalysisJSON(BaseModel):
    """Defines the overall structure for the final meeting analysis JSON output."""
    meetingId: Optional[str] = Field(None, alias="meeting_id")
    meetingTitle: Optional[str] = Field(None, alias="meeting_title")
    date: Optional[str] = None # ISO format string
    platform: Optional[str] = None
    metadata: MeetingMetadata # Use the defined MeetingMetadata model
    transcript: Optional[str] = None
    duration: Optional[float] = None # Duration in seconds
    sentiment: Optional[SentimentAnalysisOutput] = None
    speakers: Optional[List[SpeakerAnalysisOutput]] = None
    topics: Optional[TopicsOutput] = None
    reactions: Optional[ReactionsAnalysisOutput] = None
    participants: Optional[ParticipantStatsOutput] = None
    summary: Optional[str] = None # AI generated summary
    action_items: Optional[List[str]] = Field(None, alias="actionItems") # AI generated action items
    insights: Optional[str] = None # Other AI insights
    last_speaker: Optional[str] = None # Add last speaker field
    # Add field for parsed chat messages
    comments: Optional[List[Dict[str, Any]]] = None # Store parsed ChatMessage data
    # Add fields for transcript summary, comments analysis etc. if needed
    # Ensure keys match the actual JSON output from your Python scripts/pipeline
    class Config:
        populate_by_name = True # Allow using alias names

class Participant(BaseModel):
    """Represents a meeting participant with their metrics."""
    name: str
    role: Optional[str] = None
    speaking_time: Optional[float] = None
    word_count: Optional[int] = None
    sentiment_score: Optional[float] = None
    engagement_score: Optional[float] = None

    class Config:
        populate_by_name = True

# --- Model for Supabase Table Row --- 

class MeetingRecord(BaseModel):
    """Represents a row in the 'meetings' table."""
    id: Optional[uuid.UUID] = None
    # Change user_id to created_by (text/email)
    # user_id: Optional[uuid.UUID] = None # Assuming user auth is implemented
    created_by: Optional[str] = None # Matches schema: text/email
    file_name: Optional[str] = None
    # Remove potentially redundant fields from base model if not needed
    # duration: Optional[int] = None 
    # participants: Optional[int] = None
    # transcript: Optional[str] = None 
    analysis_json: Optional[MeetingAnalysisJSON] = None
    created_at: Optional[datetime] = None
    # Add other fields from your schema if needed by the model
    title: Optional[str] = None 
    description: Optional[str] = None
    date: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        # orm_mode = True # Deprecated in Pydantic v2
        from_attributes = True # Use this for Pydantic v2+
        populate_by_name = True 