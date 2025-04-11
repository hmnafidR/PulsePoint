/**
 * Sentiment analysis module for meeting transcripts
 * This file provides utility functions for sentiment analysis
 */

/**
 * Calculate sentiment score for a text segment using a simple lexicon-based approach
 * @param text The text to analyze
 * @returns A sentiment score between 0 (negative) and 1 (positive)
 */
export function analyzeSentiment(text: string): number {
  // Simplistic lexicon-based sentiment analysis for demonstration
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'happy', 'excited', 'love', 'like', 'best', 'thank', 'thanks',
    'appreciate', 'awesome', 'perfect', 'yes', 'helpful', 'impressive',
    'interesting', 'enjoy', 'enjoyed', 'glad', 'pleased', 'positive',
    'agree', 'agreed', 'excitement', 'success', 'successful'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'horrible', 'awful', 'poor', 'worst',
    'sad', 'unhappy', 'hate', 'dislike', 'problem', 'issue',
    'difficult', 'hard', 'unfortunately', 'sorry', 'no', 'not',
    'cannot', 'can\'t', 'wont', 'wouldn\'t', 'shouldn\'t',
    'failed', 'failure', 'negative', 'disagree', 'disagrees',
    'worried', 'concern', 'concerned', 'disappointing', 'disappointed'
  ];
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check for positive words
  for (const word of positiveWords) {
    // Use word boundary match when possible
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  // Check for negative words
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  // Calculate sentiment score
  if (positiveCount === 0 && negativeCount === 0) {
    return 0.5; // Neutral sentiment if no sentiment words found
  }
  
  // Calculate a weighted score between 0 and 1
  // The 0.2 baseline ensures scores don't go below 0.2 or above 0.8
  // to avoid extreme scores with limited lexicon
  return (positiveCount / (positiveCount + negativeCount)) * 0.6 + 0.2;
}

/**
 * Analyze sentiment for a collection of text segments
 * @param texts Array of text segments to analyze
 * @returns Average sentiment score
 */
export function analyzeTextCollection(texts: string[]): number {
  if (texts.length === 0) {
    return 0.5; // Default neutral sentiment
  }
  
  const total = texts.reduce((sum, text) => sum + analyzeSentiment(text), 0);
  return total / texts.length;
}

/**
 * Analyze sentiment trends over time based on transcript
 * @param segments Array of {text, timestamp} objects
 * @returns Array of {time, sentiment} points for visualization
 */
export function analyzeSentimentTrend(
  segments: Array<{ text: string; time: number }>
): Array<{ time: number; sentiment: number }> {
  if (segments.length === 0) {
    return [];
  }
  
  // Sort segments by time
  const sortedSegments = [...segments].sort((a, b) => a.time - b.time);
  
  // Calculate sentiment for each segment
  return sortedSegments.map(segment => ({
    time: segment.time,
    sentiment: analyzeSentiment(segment.text)
  }));
}

/**
 * Analyze the transcript of a meeting for sentiment analysis
 * @param segments Array of transcript segments
 * @returns Sentiment analysis result including overall sentiment and per-segment sentiment
 */
export interface SentimentAnalysisResult {
  overallSentiment: {
    compound: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  segmentSentiments: Record<string, {
    compound: number;
    positive: number;
    negative: number;
    neutral: number;
  }>;
  emotionalArcs: {
    timestamps: number[];
    sentimentValues: number[];
  };
}

export function analyzeMeetingTranscript(segments: Array<{ text: string; start: number; end: number }>): SentimentAnalysisResult {
  // Initialize the result structure
  const result: SentimentAnalysisResult = {
    overallSentiment: {
      compound: 0.5,
      positive: 0.5,
      negative: 0.5,
      neutral: 0
    },
    segmentSentiments: {},
    emotionalArcs: {
      timestamps: [],
      sentimentValues: []
    }
  };
  
  if (segments.length === 0) {
    return result;
  }
  
  // Analyze each segment
  let totalSentiment = 0;
  
  segments.forEach((segment, index) => {
    const sentiment = analyzeSentiment(segment.text);
    
    // Store per-segment sentiment
    result.segmentSentiments[`segment_${index}`] = {
      compound: sentiment,
      positive: sentiment > 0.6 ? sentiment : 0,
      negative: sentiment < 0.4 ? 1 - sentiment : 0,
      neutral: sentiment >= 0.4 && sentiment <= 0.6 ? 1 : 0
    };
    
    // Add to emotional arc timeline
    result.emotionalArcs.timestamps.push(segment.start);
    result.emotionalArcs.sentimentValues.push(sentiment);
    
    // Add to total for overall calculation
    totalSentiment += sentiment;
  });
  
  // Calculate overall sentiment
  const averageSentiment = totalSentiment / segments.length;
  result.overallSentiment = {
    compound: averageSentiment,
    positive: averageSentiment > 0.6 ? averageSentiment : 0,
    negative: averageSentiment < 0.4 ? 1 - averageSentiment : 0,
    neutral: averageSentiment >= 0.4 && averageSentiment <= 0.6 ? 1 : 0
  };
  
  return result;
}

/**
 * Identify positive and negative statements from transcript
 * @param segments Array of text segments with speaker information
 * @returns Object containing positive and negative statements with speaker attribution
 */
export function identifySignificantStatements(
  segments: Array<{ text: string; speaker: string }>
): { positive: string[]; negative: string[] } {
  const positiveStatements: string[] = [];
  const negativeStatements: string[] = [];
  
  for (const segment of segments) {
    const sentiment = analyzeSentiment(segment.text);
    const formattedStatement = `"${segment.text}" - ${segment.speaker}`;
    
    if (sentiment > 0.7) {
      positiveStatements.push(formattedStatement);
    } else if (sentiment < 0.3) {
      negativeStatements.push(formattedStatement);
    }
  }
  
  // Limit to top 5 for each category
  return {
    positive: positiveStatements.slice(0, 5),
    negative: negativeStatements.slice(0, 5)
  };
} 