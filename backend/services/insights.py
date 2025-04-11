import requests
import json
from pydantic import BaseModel
from typing import List, Optional
import os
import time
import hashlib
import pickle
from pathlib import Path

# --- Ollama Configuration ---
# Default URL for Ollama API
OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434/api/generate")
# Default model to use
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "mistral:7b-instruct")

# Create a cache directory if it doesn't exist
CACHE_DIR = Path(os.environ.get("CACHE_DIR", "backend/cache/insights"))
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# --- AI Insights Service ---

class AIInsightsResult(BaseModel):
    summary: Optional[str] = None
    action_items: Optional[List[str]] = None
    other_insights: Optional[str] = None # For general insights if requested

def hash_transcript(transcript: str) -> str:
    """Create a deterministic hash of the transcript for caching."""
    return hashlib.md5(transcript.encode()).hexdigest()

def get_cache_path(transcript_hash: str) -> Path:
    """Get the path to the cache file for a given transcript hash."""
    return CACHE_DIR / f"{transcript_hash}.pkl"

def check_cache(transcript_hash: str) -> Optional[AIInsightsResult]:
    """Check if a cached result exists for the given transcript hash."""
    cache_path = get_cache_path(transcript_hash)
    if cache_path.exists():
        try:
            with open(cache_path, 'rb') as f:
                cached_result = pickle.load(f)
                print(f"Using cached insights for transcript hash: {transcript_hash}")
                return cached_result
        except Exception as e:
            print(f"Error loading cache: {e}")
    return None

def save_to_cache(transcript_hash: str, result: AIInsightsResult) -> None:
    """Save a result to cache."""
    cache_path = get_cache_path(transcript_hash)
    try:
        with open(cache_path, 'wb') as f:
            pickle.dump(result, f)
        print(f"Saved insights to cache: {transcript_hash}")
    except Exception as e:
        print(f"Error saving to cache: {e}")

def generate_ai_insights(transcript: str, max_length_chars=80000) -> AIInsightsResult:
    """Generates meeting summary and action items using Ollama API.
    
    Sends the transcript (potentially truncated) to the Ollama API endpoint.
    Parses the response to extract summary and action items.
    """
    if not transcript:
        print("Skipping AI insights generation: No transcript provided.")
        return AIInsightsResult()
    
    # Check cache first using transcript hash
    transcript_hash = hash_transcript(transcript)
    cached_result = check_cache(transcript_hash)
    if cached_result:
        return cached_result
        
    # Truncate transcript if it's too long to avoid exceeding context limits or causing timeouts
    # Adjust max_length_chars based on model and typical meeting length
    truncated_transcript = transcript
    if len(transcript) > max_length_chars:
        print(f"Transcript length ({len(transcript)} chars) exceeds max length ({max_length_chars}). Truncating.")
        # Truncate intelligently (e.g., keep beginning and end) if needed, for now simple slice:
        truncated_transcript = transcript[:max_length_chars]

    # Define the prompt for the LLM with more explicit formatting requirements
    prompt = (
        f"You are an expert meeting analyst tasked with analyzing a meeting transcript. "
        f"Your analysis MUST include ALL of the following mandatory sections with the exact headings shown:\n\n"
        
        f"1. Overall Summary: Provide a concise summary (8-10 bullet points) of the main discussion points.\n\n"
        
        f"2. Action Items: Create a list of specific, actionable tasks that were mentioned or implied in the meeting. "
        f"Include at least 3-5 action items, even if you need to infer them from context. "
        f"Format each as a clear directive starting with a verb.\n\n"
        
        f"3. Topic Analysis: Identify 3-6 major topics discussed. For each topic:\n"
        f"   - Name the topic clearly\n"
        f"   - Provide a brief summary of what was discussed\n"
        f"   - Note the sentiment (positive/negative/neutral) expressed about this topic\n\n"
        
        f"4. Feedback/Insights: Offer 3-5 actionable pieces of feedback or insights based on the meeting. "
        f"These should be practical suggestions to improve future discussions or address issues raised.\n\n"
        
        f"Transcript:\n```\n{truncated_transcript}\n```\n\n"
        
        f"FORMAT YOUR RESPONSE EXACTLY LIKE THIS:\n\n"
        f"Overall Summary:\n- [First bullet point]\n- [Second bullet point]\n- [Continue with more bullet points]\n\n"
        f"Action Items:\n- [First action item]\n- [Second action item]\n- [Continue with more action items]\n\n"
        f"Topic Analysis:\n- [Topic 1]: [Brief description of discussion] Sentiment: [positive/negative/neutral]\n- [Topic 2]: [Brief description of discussion] Sentiment: [positive/negative/neutral]\n- [Continue with more topics]\n\n"
        f"Feedback/Insights:\n- [First insight/feedback point]\n- [Second insight/feedback point]\n- [Continue with more insights]"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False, # Get the full response at once
        # Using a moderate temperature for consistent yet natural responses
        "options": {
           "temperature": 0.2, # Lower temperature for more consistent formatting
           "seed": 42  # Fixed seed for reproducibility
        }
    }

    try:
        print(f"Sending request to Ollama API ({OLLAMA_API_URL}) for AI insights...")
        start_time = time.time()
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        
        end_time = time.time()
        print(f"Ollama API request completed in {end_time - start_time:.2f} seconds.")
        
        response_data = response.json()
        full_response_text = response_data.get("response", "").strip()
        
        # --- Parse the response text --- 
        summary = None
        action_items = []
        topic_analysis_section = None 
        feedback_section = None # Extract feedback section

        # More robust parsing might be needed
        overall_summary_marker = "Overall Summary:"
        action_items_marker = "Action Items:"
        topic_analysis_marker = "Topic Analysis:"
        feedback_marker = "Feedback/Insights:"

        os_start = full_response_text.find(overall_summary_marker)
        ai_start = full_response_text.find(action_items_marker)
        ta_start = full_response_text.find(topic_analysis_marker)
        fb_start = full_response_text.find(feedback_marker)

        if os_start != -1 and ai_start != -1:
            summary = full_response_text[os_start + len(overall_summary_marker):ai_start].strip()

        if ai_start != -1:
            end_marker = ta_start if ta_start != -1 else (fb_start if fb_start != -1 else len(full_response_text))
            action_items_text = full_response_text[ai_start + len(action_items_marker):end_marker].strip()
            action_items = [item.strip("- ").strip() for item in action_items_text.split('\n') if item.strip() and item.strip().startswith('-')]
            
        if ta_start != -1:
            end_marker = fb_start if fb_start != -1 else len(full_response_text)
            topic_analysis_section = full_response_text[ta_start + len(topic_analysis_marker):end_marker].strip()

        if fb_start != -1:
            feedback_section = full_response_text[fb_start + len(feedback_marker):].strip()

        if not summary and not action_items and not topic_analysis_section and not feedback_section:
            print("Warning: Could not parse detailed structure from Ollama response.")
            summary = full_response_text

        result = AIInsightsResult(
            summary=summary,
            action_items=action_items,
            other_insights=f"Topic Analysis:\n{topic_analysis_section}\n\nFeedback/Insights:\n{feedback_section}" if topic_analysis_section or feedback_section else None
        )
        
        # Cache the result for future use
        save_to_cache(transcript_hash, result)
        
        return result

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Ollama API at {OLLAMA_API_URL}: {e}")
        # Handle connection errors, maybe retry or return empty
        raise RuntimeError(f"Could not connect to Ollama: {e}")
    except Exception as e:
        print(f"Error processing Ollama response: {e}")
        # Handle JSON decoding errors or other issues
        raise RuntimeError(f"AI insights generation failed: {e}")

# Example Usage:
# if __name__ == "__main__":
#     test_transcript = (
#         "Team meeting notes.\nAlice: We need to finalize the Q3 report by Friday. Bob, can you handle the data analysis?"
#         "Bob: Yes, I can get that done. I'll need the sales figures from Carol though."
#         "Carol: I'll send them over this afternoon. Should we also include the marketing projections?"
#         "Alice: Good idea, Carol. Let's add those. Bob, finalize the report. Carol, send the figures."
#     )
#     try:
#         insights = generate_ai_insights(test_transcript)
#         print("\nAI Insights Result:")
#         print(f"Summary: {insights.summary}")
#         print("Action Items:")
#         if insights.action_items:
#             for item in insights.action_items:
#                 print(f" - {item}")
#         if insights.other_insights:
#             print(f"Other Insights: {insights.other_insights}")
#     except Exception as e:
#         print(f"Test failed: {e}") 