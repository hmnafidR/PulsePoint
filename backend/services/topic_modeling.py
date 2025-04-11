"""
Topic Modeling Service using natural language processing to identify key topics in meetings.

NOTE: BERTopic model has been commented out as we're currently using Mistral 7B for topic modeling.
The BERTopic implementation is preserved for potential future use and feature comparison.

BERTopic advantages:
- Unsupervised topic modeling that doesn't require predefined topics
- Works well with smaller datasets and provides statistical topic representation
- Lower resource requirements compared to large language models
- Good for extracting specific keyword clusters

Mistral 7B advantages (current approach):
- More contextual understanding of topics and their relationships
- Better alignment with natural language and human intuition when identifying topics
- Can identify more abstract or conceptual topics beyond keyword-based clusters
- Integrates better with our insight generation flow for consistent results

Future work may implement a hybrid approach or allow users to choose between methods.
"""

# from bertopic import BERTopic
from pydantic import BaseModel
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Set
import nltk
import time
import re

# --- Model Loading ---
# BERTopic model is commented out as we're using Mistral 7B for topic modeling
# Load BERTopic model during application startup via lifespan.
# BERTopic relies on an embedding model (Sentence Transformer).
_topic_model = None

def load_topic_model(embedding_model="all-MiniLM-L6-v2", min_topic_size=10, low_memory=True):
    """
    Loads the BERTopic model with a specified embedding model.
    
    NOTE: This function is currently not used as we've switched to Mistral 7B for topic modeling.
    It is preserved for potential future use as it provides a different approach to topic modeling
    that could be valuable in specific use cases.
    """
    global _topic_model
    if _topic_model is None:
        try:
            print(f"Loading BERTopic model with embedding: {embedding_model}...")
            # Ensure NLTK tokenizer is available (BERTopic might use it indirectly or for preprocessing)
            try:
                nltk.data.find('tokenizers/punkt')
            except nltk.downloader.DownloadError:
                print("NLTK 'punkt' tokenizer not found. Downloading...")
                nltk.download('punkt', quiet=True)
                print("NLTK 'punkt' downloaded.")
                
            # Initialize BERTopic - Currently commented out as we're using Mistral 7B
            # Consider adjusting parameters like nr_topics, calculate_probabilities, etc.
            """
            _topic_model = BERTopic(
                embedding_model=embedding_model, 
                min_topic_size=min_topic_size, 
                low_memory=low_memory,
                verbose=True # Set to False for less console output
            )
            """
            _topic_model = None  # Not initializing BERTopic
            print("BERTopic model initialization skipped - using Mistral 7B for topic modeling instead.")
        except Exception as e:
            print(f"Error initializing BERTopic model: {e}")
            # We're not raising an error as we're not using BERTopic currently
            # raise RuntimeError(f"Failed to initialize BERTopic: {e}")
    return _topic_model

# --- Topic Modeling Service ---

class TopicInfo(BaseModel):
    topic_id: int = Field(..., alias="Topic")
    count: int = Field(..., alias="Count") # Number of documents/sentences in topic
    name: str = Field(..., alias="Name") # Auto-generated name (e.g., "0_word1_word2")
    keywords: Optional[List[str]] = None # Top keywords for the topic
    # Add representation/representative_docs if needed
    
    class Config:
        populate_by_name = True

class TopicModelingResult(BaseModel):
    topics: Optional[List[TopicInfo]] = None
    # Add topic probabilities per document/sentence if needed

def filter_common_words(keywords: List[str], common_words: Set[str]) -> List[str]:
    """Filter out common words and speaker names from keywords."""
    return [word for word in keywords if word.lower() not in common_words]

def generate_topic_name(keywords: List[str], idx: int) -> str:
    """Generate a more meaningful topic name from keywords."""
    if not keywords:
        return f"Topic_{idx}"
    return " & ".join(keywords[:3])

def remove_names_from_text(text: str, names: Set[str]) -> str:
    """Remove all occurrences of names from the text."""
    # Create a regex pattern with word boundaries for all names
    if not names:
        return text
        
    pattern = r'\b(' + '|'.join(re.escape(name) for name in names) + r')\b'
    return re.sub(pattern, '', text, flags=re.IGNORECASE)

def model_topics(transcript: str) -> TopicModelingResult:
    """
    Performs topic modeling on the transcript.
    
    NOTE: Previously used BERTopic, but now returns an empty result as we're using
    Mistral 7B LLM for topic extraction in the insights generation phase instead.
    
    This function now acts as a compatibility layer, allowing the pipeline to function
    while topic modeling is handled by the LLM component in insights.py.
    """
    # Return empty result - topics will be extracted from Mistral 7B insights
    return TopicModelingResult()
    
    # Legacy BERTopic implementation below - commented out
    """
    topic_model = load_topic_model() # Ensure model is initialized
    if topic_model is None:
        raise RuntimeError("BERTopic model is not available.")
        
    if not transcript:
        return TopicModelingResult() # Return empty if no transcript

    try:
        print("Starting topic modeling...")
        start_time = time.time()
        
        # Extract all potential speaker names
        speaker_names = set()
        # Extract potential speaker names using regex patterns
        name_patterns = [
            r'\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b',  # First Last pattern
            r'\b([A-Z][a-z]+):'  # Name followed by colon
        ]
        
        for pattern in name_patterns:
            for match in re.finditer(pattern, transcript):
                if match.group(1):
                    speaker_names.add(match.group(1).lower())
                if len(match.groups()) > 1 and match.group(2):
                    speaker_names.add(match.group(2).lower())
        
        # Known speaker names from logs
        known_speakers = {'meri', 'nova', 'autumn', 'hicks', 'frederick', 'oren', 
                          'hai', 'kelseydilullo', 'dwayne', 'joseph', 'sarthak', 
                          'ekta', 'melissa', 'praveena', 'suresh', 'gil', 'asiah', 
                          'maryam', 'tamilarasee', 'kasia', 'swiech'}
        
        # Add known speakers to our set
        speaker_names.update(known_speakers)
        
        # Common words that don't contribute to meaningful topics
        common_stopwords = {'yeah', 'um', 'uh', 'like', 'know', 'just', 'think', 'going', 
                           'okay', 'right', 'well', 'good', 'very', 'really', 'want', 
                           'need', 'sure', 'great', 'nice', 'lot', 'thing', 'things', 
                           'maybe', 'much', 'actually', 'pretty', 'see', 'look', 'yes',
                           'the', 'and', 'but', 'so', 'for', 'with', 'about', 'from', 'by',
                           'at', 'on', 'in', 'out', 'up', 'down', 'some', 'that', 'this',
                           'these', 'those', 'there', 'here', 'when', 'where', 'what', 
                           'why', 'how', 'which', 'who', 'whom'}
        
        # Combined filtering set
        filter_words = speaker_names.union(common_stopwords)
        print(f"Identified {len(filter_words)} words to filter: {sorted(list(filter_words))[:20]}...")
        
        # Clean transcript by removing names - this is more aggressive than filtering after
        cleaned_transcript = remove_names_from_text(transcript, speaker_names)
        
        # Split transcript into sentences
        documents = nltk.sent_tokenize(cleaned_transcript)
        if not documents or len(documents) < topic_model.min_topic_size:
            print(f"Skipping topic modeling: Not enough sentences ({len(documents)}) for min_topic_size ({topic_model.min_topic_size}).")
            return TopicModelingResult()

        print(f"Fitting BERTopic on {len(documents)} sentences after name cleaning...")
        
        # Fit the model and transform the documents
        topics, probs = topic_model.fit_transform(documents)
        
        # Explicitly reduce to a fixed number of topics
        nr_topics = 10  # Fixed number of topics 
        topic_model.reduce_topics(documents, nr_topics=nr_topics)
        print(f"Reduced topics to {nr_topics}. New count: {len(topic_model.get_topic_info()) - 1}")  # -1 for outlier topic

        print("BERTopic fitting completed. Getting topic info...")
        # Get information about the discovered topics
        topic_info_df = topic_model.get_topic_info()
        
        # Get top N keywords for each topic
        top_n_keywords = 20  # Increased to get more keywords to choose from after filtering
        topic_keywords = topic_model.get_topics()

        # Create custom topic labels with filtered keywords
        topic_labels = {}
        for topic_id in set(topics):
            if topic_id != -1:  # Skip outlier topic
                # Get keywords for this topic
                if topic_id in topic_keywords:
                    keywords = [kw[0] for kw in topic_keywords[topic_id][:top_n_keywords]]
                    # Filter out names and common words
                    filtered_keywords = filter_common_words(keywords, filter_words)
                    if filtered_keywords:
                        # Create topic name from filtered keywords
                        topic_labels[topic_id] = generate_topic_name(filtered_keywords, topic_id)
                    else:
                        # Fallback if all keywords were filtered
                        topic_labels[topic_id] = f"Topic_{topic_id}"
        
        # Apply custom labels if we have any
        if topic_labels:
            topic_model.set_topic_labels(topic_labels)
            print(f"Applied custom topic labels: {topic_labels}")
        
        # Get updated topic info with new labels
        topic_info_df = topic_model.get_topic_info()

        formatted_topics: List[TopicInfo] = []
        total_docs_in_topics = 0
        # Iterate through the topic info DataFrame (skip outlier topic -1)
        for _, row in topic_info_df[topic_info_df.Topic != -1].iterrows():
            topic_id = row['Topic']
            topic_name = row['Name'] 
            count = row['Count']
            total_docs_in_topics += count
            
            # Get keywords for this topic_id
            raw_keywords = [kw[0] for kw in topic_keywords.get(topic_id, [])[:top_n_keywords]]
            # Filter out names and common words from keywords
            filtered_keywords = filter_common_words(raw_keywords, filter_words)
            
            # Use descriptive names instead of default
            if not topic_name.startswith("Topic_") and "_" in topic_name:
                # Replace default naming convention with custom name
                parts = topic_name.split("_")
                if len(parts) > 1:
                    # Skip the first part (which is the topic id)
                    name_parts = [part for part in parts[1:] if part.lower() not in filter_words]
                    if name_parts:
                        topic_name = " & ".join(name_parts)
                    else:
                        topic_name = f"Topic {topic_id}"
            
            formatted_topics.append(TopicInfo(
                Topic=topic_id,
                Count=count,
                Name=topic_name,
                keywords=filtered_keywords if filtered_keywords else ["general discussion"]  # Fallback if all filtered
            ))
            
        end_time = time.time()
        print(f"Topic modeling completed in {end_time - start_time:.2f} seconds. Found {len(formatted_topics)} topics.")

        return TopicModelingResult(topics=formatted_topics)

    except Exception as e:
        print(f"Error during topic modeling: {e}")
        # Consider returning empty results or raising depending on robustness needs
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Topic modeling failed: {e}")
    """

# Example usage:
# if __name__ == "__main__":
#     load_topic_model() # Pre-initialize
#     test_transcript = (
#         "Machine learning is fascinating. Deep learning models show great promise. "
#         "However, deploying machine learning models can be challenging. "
#         "We need better tools for MLOps. Data preprocessing is also crucial. "
#         "Natural language processing helps analyze text data. "
#         "Understanding customer feedback is important for product development. "
#         "Let's discuss the project timeline and resource allocation. "
#         "Budget constraints need careful consideration. The team meeting is next week."
#     )
#     results = model_topics(test_transcript)
#     print("\nTopic Modeling Result:")
#     if results.topics:
#         for topic in results.topics:
#             print(f" - Topic {topic.topic_id}: {topic.name} (Count: {topic.count}) Keywords: {topic.keywords}")
#     else:
#         print("No topics were modeled.") 