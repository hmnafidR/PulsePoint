// src/lib/chatAnalysis.ts

// Basic interfaces
export interface ParsedChatEntry {
  timestamp: number; // Seconds from the start of the meeting
  participant: string;
  type: 'message' | 'reaction' | 'unknown';
  content: string; // The message text or reaction details
}

export interface TimelineDataPoint {
  time: string; // MM:SS format
  sentiment: number; // 0-100 score
  engagement: number; // 0-100 score (or simple count)
}

// --- Parsing Logic ---

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0; // Fallback for invalid format
}

export function parseChatFile(content: string): ParsedChatEntry[] {
  const lines = content.split(/[\r\n]+/);
  const entries: ParsedChatEntry[] = [];
  const lineRegex = /^(\d{2}:\d{2}:\d{2})\t(.*?):\t(.*)$/;
  const reactionRegex = /Reacted to ".*?" with (.*)/;

  for (const line of lines) {
    const match = line.trim().match(lineRegex);
    if (match) {
      const timestamp = timeToSeconds(match[1]);
      const participant = match[2].trim();
      const messageContent = match[3].trim();

      const reactionMatch = messageContent.match(reactionRegex);
      if (reactionMatch) {
        entries.push({
          timestamp,
          participant,
          type: 'reaction',
          content: reactionMatch[1], // The emoji/reaction text
        });
      } else if (messageContent) { // Ensure it's not an empty message after trimming
        entries.push({
          timestamp,
          participant,
          type: 'message',
          content: messageContent,
        });
      }
    } else {
       if (line.trim()) {
           // console.log(`[parseChatFile] Skipping unparsed line: ${line}`);
       }
    }
  }
  return entries;
}


// --- Sentiment Analysis (Placeholder) ---
function analyzeSentimentPlaceholder(text: string): number {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('thanks') || lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('yay') || lowerText.includes('love') || ['👍', '❤️', '😂', '😮', '👏', '🙏'].includes(text)) {
        return 75 + Math.random() * 25; // More positive
    }
    if (lowerText.includes('issue') || lowerText.includes('problem') || lowerText.includes('error') || lowerText.includes('not fun') || ['😞'].includes(text)) {
        return 25 - Math.random() * 25; // More negative
    }
    return 40 + Math.random() * 20; // Neutral default
}

// --- Engagement Calculation (Placeholder) ---
function calculateEngagementPlaceholder(messagesCount: number, reactionsCount: number): number {
  const totalInteractions = messagesCount + reactionsCount;
  const maxExpectedInteractions = 10; // Hypothetical max interactions per interval for 100%
  return Math.min(100, Math.round((totalInteractions / maxExpectedInteractions) * 100));
}


// --- Aggregation Logic ---

export function aggregateChatData(entries: ParsedChatEntry[], intervalSeconds: number): TimelineDataPoint[] {
  if (entries.length === 0) {
    return [{ time: "00:00", sentiment: 50, engagement: 0 }]; // Return a single default point if no entries
  }

  const maxTimestamp = entries.reduce((max, entry) => Math.max(max, entry.timestamp), 0);
  // Ensure at least one interval even if maxTimestamp is less than intervalSeconds
  const totalIntervals = Math.max(1, Math.ceil(maxTimestamp / intervalSeconds)); 

  const aggregatedData: TimelineDataPoint[] = [];

  for (let i = 0; i < totalIntervals; i++) {
      const intervalStart = i * intervalSeconds;
      const intervalEnd = (i + 1) * intervalSeconds;

      let intervalSentimentSum = 0;
      let intervalSentimentCount = 0;
      let intervalMessageCount = 0;
      let intervalReactionCount = 0;

      const intervalEntries = entries.filter(entry => entry.timestamp >= intervalStart && entry.timestamp < intervalEnd);

      for (const entry of intervalEntries) {
          let sentiment = analyzeSentimentPlaceholder(entry.content);
          intervalSentimentSum += sentiment;
          intervalSentimentCount++;
          if (entry.type === 'message') {
              intervalMessageCount++;
          } else if (entry.type === 'reaction') {
              intervalReactionCount++;
          }
      }

      const averageSentiment = intervalSentimentCount > 0 ? Math.round(intervalSentimentSum / intervalSentimentCount) : 50; 
      const engagementScore = calculateEngagementPlaceholder(intervalMessageCount, intervalReactionCount);

      const minutes = Math.floor(intervalStart / 60);
      const seconds = Math.floor(intervalStart % 60);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      aggregatedData.push({
          time: formattedTime,
          sentiment: Math.max(0, Math.min(100, averageSentiment)), 
          engagement: Math.max(0, Math.min(100, engagementScore)),
      });
  }

  // Ensure the first point is at 00:00 
  if (aggregatedData.length === 0) {
      // This case should theoretically not be reached due to the change above, but as a fallback:
       aggregatedData.push({ time: "00:00", sentiment: 50, engagement: 0 });
  } else if (aggregatedData[0].time !== "00:00") {
      // If the first interval didn't start at 00:00 (e.g., first message much later)
      aggregatedData.unshift({
          time: "00:00",
          sentiment: aggregatedData[0].sentiment, // Use first calculated interval's data
          engagement: aggregatedData[0].engagement 
      });
  }

  return aggregatedData;
} 