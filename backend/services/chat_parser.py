import re
from pydantic import BaseModel
from typing import List, Optional, Dict
import os

class ChatMessage(BaseModel):
    timestamp: Optional[str] = None # e.g., "00:05:32" or raw line value
    author: str
    message: str
    reactions: List[str] = [] # Emojis found associated with this message

class ChatParsingResult(BaseModel):
    messages: List[ChatMessage] = []
    reactions_summary: Dict[str, int] = {} # Overall emoji counts
    reactions_by_author: Dict[str, Dict[str, int]] = {} # Emoji counts per author

def parse_chat_file(file_path: Optional[str]) -> Optional[ChatParsingResult]:
    """Parses a Zoom chat file (.txt) to extract messages, authors, timestamps, and reactions."""
    if not file_path or not os.path.exists(file_path):
        print(f"Chat file not found or path is invalid: {file_path}. Skipping chat parsing.")
        return None

    messages: List[ChatMessage] = []
    reactions_summary: Dict[str, int] = {}
    reactions_by_author: Dict[str, Dict[str, int]] = {}
    # Regex to capture timestamp, author, and message content based on TAB separation
    line_pattern = re.compile(r"^(\d{2}:\d{2}:\d{2})\t(.*?):\t(.*)$") # New pattern
    
    # Reaction message pattern
    reaction_pattern = re.compile(r"^Reacted to \".*?\" with (.*)$")
    
    # More comprehensive emoji pattern (includes more ranges)
    emoji_pattern = re.compile(
        "["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F700-\U0001F77F"  # alchemical symbols
        u"\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
        u"\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        u"\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        u"\U00002702-\U000027B0"  # Dingbats
        u"\U000024C2-\U0001F251" 
        "]+")

    try:
        print(f"Parsing chat file: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                match = line_pattern.match(line)
                if match:
                    timestamp, author, message_text = match.groups()
                    author = author.strip()
                    message_text = message_text.strip()
                    
                    # Check if this line is a reaction notification
                    reaction_match = reaction_pattern.match(message_text)
                    if reaction_match:
                        reaction_emoji = reaction_match.group(1).strip()
                        # print(f"[Chat Parse] Detected Reaction: Author='{author}', Emoji='{reaction_emoji}'") # Debug
                        # Update reaction counts
                        if author not in reactions_by_author:
                            reactions_by_author[author] = {}
                        # Use the single extracted emoji
                        if reaction_emoji: # Ensure emoji exists
                            reactions_summary[reaction_emoji] = reactions_summary.get(reaction_emoji, 0) + 1
                            reactions_by_author[author][reaction_emoji] = reactions_by_author[author].get(reaction_emoji, 0) + 1
                        # Skip adding reaction notifications as regular messages
                        continue 
                        
                    # Check if this line is a reply notification (and skip for now)
                    if message_text.startswith("Replying to "):
                        # print(f"[Chat Parse] Detected Reply line, skipping as message: Author='{author}', Text='{message_text[:50]}...'") # Debug
                        continue
                        
                    # --- Process as a regular message --- 
                    # Extract emojis *from within* the regular message text
                    emojis_in_message = emoji_pattern.findall(message_text)
                    cleaned_message = emoji_pattern.sub('', message_text).strip() # Remove emojis from message text
                    
                    messages.append(ChatMessage(
                        timestamp=timestamp,
                        author=author,
                        message=cleaned_message,
                        reactions=emojis_in_message # Store emojis found *in* the message
                    ))
                    
                    # print(f"[Chat Parse] Parsed Message: Author='{author}', Emojis: {emojis_in_message}, Msg: {cleaned_message[:50]}...") # Debug
                    
                    # Update reaction counts for emojis *found within the message text*
                    if emojis_in_message:
                         if author not in reactions_by_author:
                             reactions_by_author[author] = {}
                         for emoji in emojis_in_message:
                             reactions_summary[emoji] = reactions_summary.get(emoji, 0) + 1
                             reactions_by_author[author][emoji] = reactions_by_author[author].get(emoji, 0) + 1
                         
                # else: # DEBUG: Log lines that didn't match the main pattern
                    # if line: # Avoid logging blank lines
                    #      print(f"[Chat Parse] Line did not match expected format: '{line}'")

                # TODO: Handle potential multi-line messages if format allows (more complex)

        print(f"Chat parsing completed. Found {len(messages)} messages and {len(reactions_summary)} unique reactions.")
        return ChatParsingResult(
            messages=messages,
            reactions_summary=reactions_summary,
            reactions_by_author=reactions_by_author
        )

    except Exception as e:
        print(f"Error parsing chat file {file_path}: {e}")
        return None # Return None on error, allow pipeline to continue 