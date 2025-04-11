from typing import Optional, List
from models.meeting import Participant # Import the Participant model

def calculate_engagement_score(
    word_count: Optional[int],
    speaking_time: Optional[float],
    total_meeting_words: Optional[int],
    # Add other relevant metrics like reactions, chat messages sent, etc. later
) -> float:
    """
    Calculates an engagement score for a participant based on available metrics.
    This is a basic placeholder and needs refinement based on desired engagement definition.
    """
    score = 0.0
    weight_word_count = 0.5
    weight_speaking_time = 0.5

    # Normalize metrics (example: contribution to total words)
    normalized_word_contribution = 0.0
    if total_meeting_words and total_meeting_words > 0 and word_count is not None:
        # Avoid division by zero if word_count is 0
        if word_count > 0:
             normalized_word_contribution = word_count / total_meeting_words
        # else: normalized_word_contribution remains 0.0

    # Placeholder: Use raw speaking time scaled arbitrarily for now
    # Consider speaking time relative to meeting duration or total speaking time
    normalized_speaking_time = (speaking_time / 60) if speaking_time else 0.0 # Example scaling (time in minutes)

    # Combine scores (simple weighted average for now)
    # Ensure word_count and speaking_time are not None before using them
    if word_count is not None and speaking_time is not None:
        # Using min(..., 1.0) to cap the contribution of speaking time
        score = (weight_word_count * normalized_word_contribution) + \
                (weight_speaking_time * min(normalized_speaking_time / 10, 1.0)) # Further scale time score, capping at 1

    # Scale score to 0-100
    return min(max(score * 100, 0), 100)

# Example function for overall meeting engagement (placeholder)
def calculate_overall_engagement(participants: List[Participant], total_meeting_words: int, meeting_duration: float) -> float:
    """Calculates an overall engagement score for the meeting."""
    if not participants:
        return 0.0

    total_score = 0.0
    active_participants = 0

    for p in participants:
        # Ensure required fields are not None before calculation
        if p.word_count is not None and p.speaking_time is not None:
             individual_score = calculate_engagement_score(
                p.word_count,
                p.speaking_time,
                total_meeting_words
             )
             total_score += individual_score
             # Define threshold for 'active' based on score (e.g., score > 10)
             # This threshold might need tuning
             if individual_score > 10:
                active_participants += 1

    # Example: Average score of active participants
    # Alternative: Could be based on percentage of active participants, total interaction counts etc.
    if active_participants > 0:
         overall_engagement = total_score / len(participants) # Average over ALL participants might be better
    else:
         overall_engagement = 0.0 # No active participants means low engagement

    # Consider meeting duration, total reactions, total comments etc. for a more robust score

    return min(max(overall_engagement, 0), 100) # Ensure score is within 0-100 range
