from transformers import pipeline
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import nltk
import time

# Import the model needed for type hinting
from models.meeting import SentimentTimelineItem

# --- Model Loading ---
# Similar to Whisper, load this during application startup via lifespan
_sentiment_pipeline = None

def load_sentiment_model(model_name="distilbert-base-uncased-finetuned-sst-2-english"):
    """Loads the Hugging Face sentiment analysis pipeline."""
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        try:
            print(f"Loading sentiment analysis model: {model_name}...")
            # Specify device=0 for GPU if available and configured, otherwise uses CPU
            _sentiment_pipeline = pipeline("sentiment-analysis", model=model_name)
            print("Sentiment analysis model loaded successfully.")
            
            # Download NLTK sentence tokenizer data (needed for splitting text)
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                print("NLTK 'punkt' tokenizer not found. Downloading...")
                nltk.download('punkt', quiet=True)
                print("NLTK 'punkt' downloaded.")
                
        except Exception as e:
            print(f"Error loading sentiment analysis model '{model_name}': {e}")
            raise RuntimeError(f"Failed to load sentiment model: {e}")
    return _sentiment_pipeline

# --- Sentiment Analysis Service ---

class SentenceSentiment(BaseModel):
    text: str
    label: str # e.g., "POSITIVE", "NEGATIVE"
    score: float # Confidence score (0-1)

class SentimentResult(BaseModel):
    overall_label: Optional[str] = None
    overall_score: Optional[float] = None # Average score, potentially weighted
    positive_ratio: Optional[float] = None
    negative_ratio: Optional[float] = None
    neutral_ratio: Optional[float] = None # Note: This specific model is binary (POS/NEG)
    sentences: Optional[List[SentenceSentiment]] = None
    timeline: Optional[List[Dict[str, Any]]] = None # e.g., [{'interval': 60, 'sentiment': 0.7}] 

def analyze_sentiment(transcript: str) -> SentimentResult:
    """Analyzes the sentiment of the provided transcript.
    
    Splits the transcript into sentences and analyzes each one.
    Calculates an overall sentiment based on sentence results.
    """
    sentiment_pipeline = load_sentiment_model() # Ensure model is loaded
    if sentiment_pipeline is None:
        raise RuntimeError("Sentiment analysis pipeline is not available.")
        
    if not transcript:
        return SentimentResult() # Return empty result if no transcript

    try:
        print("Starting sentiment analysis...")
        start_time = time.time()
        
        # Split transcript into sentences using NLTK
        sentences = nltk.sent_tokenize(transcript)
        if not sentences:
             return SentimentResult()
             
        print(f"Analyzing {len(sentences)} sentences...")
        
        # Run pipeline on sentences (handle potential truncation for long sentences if needed)
        # The pipeline handles batching internally to some extent.
        results = sentiment_pipeline(sentences)
        
        sentence_sentiments: List[SentenceSentiment] = []
        positive_count = 0
        negative_count = 0
        total_score = 0.0
        
        for i, result in enumerate(results):
            sentence_sentiments.append(SentenceSentiment(
                text=sentences[i],
                label=result['label'],
                score=result['score']
            ))
            if result['label'] == 'POSITIVE':
                positive_count += 1
                total_score += result['score']
            elif result['label'] == 'NEGATIVE':
                negative_count += 1
                total_score -= result['score'] # Subtract negative score for a simple overall metric

        total_sentences = len(sentences)
        overall_label = "NEUTRAL" # Default if counts are equal or zero
        if positive_count > negative_count:
            overall_label = "POSITIVE"
        elif negative_count > positive_count:
            overall_label = "NEGATIVE"
        
        # Calculate ratios
        positive_ratio = positive_count / total_sentences if total_sentences > 0 else 0
        negative_ratio = negative_count / total_sentences if total_sentences > 0 else 0
        # This model doesn't explicitly output NEUTRAL, so it's 0 unless calculated differently
        neutral_ratio = 0.0 
        
        # Calculate a simple overall score (average difference)
        # Normalize score: Closer to 1 is positive, closer to -1 is negative
        overall_score = total_score / total_sentences if total_sentences > 0 else 0
        # Scale overall_score to be between 0 and 1 for consistency if desired
        # Example scaling: (overall_score + 1) / 2
        # scaled_overall_score = (overall_score + 1) / 2 
        
        # Alternative Overall Score: Percentage of positive sentences
        overall_positive_percentage = positive_ratio 

        # --- Remove Old Timeline Calculation ---
        # timeline_data: List[Dict[str, Any]] = []
        # interval_size = 10 # Aggregate every 10 sentences (adjust as needed)
        # ... (rest of old timeline logic removed) ...
        # ---------------------------------------

        end_time = time.time()
        print(f"Sentiment analysis completed in {end_time - start_time:.2f} seconds.")

        return SentimentResult(
            overall_label=overall_label,
            overall_score=overall_positive_percentage, # Return positive ratio (0-1)
            positive_ratio=positive_ratio,
            negative_ratio=negative_ratio,
            neutral_ratio=neutral_ratio,
            sentences=sentence_sentiments,
            timeline=None # Timeline is now generated separately
        )

    except Exception as e:
        print(f"Error during sentiment analysis: {e}")
        # Depending on the error, might return partial results or raise
        raise RuntimeError(f"Sentiment analysis failed: {e}")

def parse_vtt_time(time_str: str) -> float:
    """Converts VTT time string (HH:MM:SS.fff) to seconds."""
    try:
        parts = time_str.split('.')
        time_parts = parts[0].split(':')
        seconds = int(time_parts[0]) * 3600 + int(time_parts[1]) * 60 + int(time_parts[2])
        if len(parts) > 1:
            seconds += float('0.' + parts[1])
        return seconds
    except Exception as e:
        print(f"Error parsing VTT time '{time_str}': {e}")
        return 0.0 # Fallback

def generate_sentiment_timeline(
    sentence_sentiments: List[SentenceSentiment],
    captions: List[Any], # List[VttCaption] ideally, but need transcription segments too
    duration: float, 
    interval_seconds: int = 60 
) -> List[SentimentTimelineItem]:
    """Generates a sentiment timeline based on sentence sentiments and time information.

    Args:
        sentence_sentiments: List of sentences with their sentiment labels and scores.
        captions: List of VttCaption objects or similar Transcription Segments 
                  (must have 'start', 'end' attributes as strings/floats in seconds 
                  and 'text' attribute).
        duration: Total duration of the meeting in seconds.
        interval_seconds: The time window size for aggregation (in seconds).

    Returns:
        A list of SentimentTimelineItem objects.
    """
    print(f"Generating sentiment timeline with {interval_seconds}s intervals for duration {duration:.2f}s...")
    timeline: List[SentimentTimelineItem] = []
    if not sentence_sentiments or not captions or duration <= 0 or interval_seconds <= 0:
        print("Cannot generate timeline: Missing data, zero duration, or invalid interval.")
        return timeline

    # Create a mapping of sentence text to sentiment for quick lookup
    sentiment_map = {s.text.strip(): (s.label, s.score) for s in sentence_sentiments}

    # Helper to get sentiment score (Positive=1, Negative=0, Neutral=0.5)
    def get_normalized_sentiment(label: str) -> float:
        if label == 'POSITIVE':
            return 1.0
        elif label == 'NEGATIVE':
            return 0.0
        else:
            return 0.5 # Treat NEUTRAL/other as 0.5

    num_intervals = int(duration // interval_seconds) + 1

    for i in range(num_intervals):
        interval_start = i * interval_seconds
        interval_end = (i + 1) * interval_seconds
        interval_sentiments = []

        # Iterate through captions/segments to find sentences within this time interval
        for caption in captions:
            try:
                # Handle both VTT string format and potential float format from transcription
                cap_start = parse_vtt_time(caption.start) if isinstance(caption.start, str) else float(caption.start)
                cap_end = parse_vtt_time(caption.end) if isinstance(caption.end, str) else float(caption.end)
            except (ValueError, AttributeError) as e:
                # print(f"Skipping caption due to time parsing error: {e}")
                continue # Skip captions with invalid time formats or missing attributes

            # Check if caption overlaps with the current interval
            if max(interval_start, cap_start) < min(interval_end, cap_end):
                # Split caption text into sentences and check sentiment map
                try:
                    sentences_in_caption = nltk.sent_tokenize(caption.text)
                    for sentence_text in sentences_in_caption:
                        clean_sentence = sentence_text.strip()
                        if clean_sentence in sentiment_map:
                             label, score = sentiment_map[clean_sentence]
                             interval_sentiments.append(get_normalized_sentiment(label))
                             # Optimization: Remove used sentence to avoid double counting if sentences span captions
                             # Be cautious with this if sentences *can* legitimately span VTT blocks
                             # del sentiment_map[clean_sentence]
                except AttributeError:
                     # print(f"Skipping caption - missing 'text' attribute?")
                     continue # Skip if caption object doesn't have text
                except Exception as e:
                    print(f"Error processing sentences in caption: {e}")
                    continue

        # Calculate average sentiment for the interval
        if interval_sentiments:
            avg_sentiment = sum(interval_sentiments) / len(interval_sentiments)
        else:
            # If no sentences found, decide on a default (e.g., neutral 0.5 or skip)
            # Let's skip intervals with no data for now to avoid flat lines
            continue 
            # avg_sentiment = 0.5 # Neutral fallback
            
        timeline.append(SentimentTimelineItem(
            timestamp=interval_start, # Timestamp represents the start of the interval
            sentiment=avg_sentiment,
            engagement=avg_sentiment # Placeholder: Use sentiment value for now
        ))

    print(f"Generated {len(timeline)} timeline points.")
    return timeline

# Example usage:
# if __name__ == "__main__":
#     load_sentiment_model() # Preload model
#     test_transcript = "This is a great meeting. I am very happy with the progress. However, the budget discussion was quite disappointing and worrying."
#     analysis = analyze_sentiment(test_transcript)
#     print("\nSentiment Analysis Result:")
#     print(f"Overall Label: {analysis.overall_label}")
#     print(f"Overall Score (0-1): {analysis.overall_score:.4f}")
#     print(f"Positive Ratio: {analysis.positive_ratio:.2%}")
#     print(f"Negative Ratio: {analysis.negative_ratio:.2%}")
#     print("\nSentence Sentiments:")
#     if analysis.sentences:
#         for s in analysis.sentences:
#             print(f" - [{s.label} ({s.score:.2f})] {s.text}") 