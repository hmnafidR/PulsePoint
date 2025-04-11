/**
 * Analysis Module Index
 * 
 * This file serves as the main entry point for the analysis module.
 * It exports all the necessary components and provides a simplified interface
 * for the UI to use when processing meeting data.
 */

// Export analysis components
export * from './audio-processor';
export * from './sentiment-analyzer';
export * from './topic-extractor';
export { analyzeMeeting, saveAnalysisResults, type MeetingAnalysis, type PartialAnalysis } from './meeting-analyzer';

// Import dependencies
import fs from 'fs';
import path from 'path';
import { processTranscript, TranscriptAnalysis } from './transcript-processor';

// Types for analysis outputs
export interface SpeakerAnalysis {
  id: string;
  name: string;
  role?: string;
  speakingTime: number;
  speakingTimePercentage: number;
  segments: number;
  wordsPerMinute: number;
  sentiment: number;
  topics?: string[];
  engagementScore?: number;
}

export interface SentimentAnalysis {
  overall: number;
  timeline: Array<{
    time: number;
    sentiment: number;
  }>;
  positive: string[];
  negative: string[];
  neutral: string[];
}

export interface TopicAnalysis {
  topics: Array<{
    name: string;
    keywords: string[];
    frequency: number;
    sentiment: number;
  }>;
  keyPhrases: string[];
}

export interface ReactionAnalysis {
  reactions: Array<{
    name: string;
    count: number;
    sentiment: number;
  }>;
  speakerReactions: Record<string, Array<{
    name: string;
    count: number;
  }>>;
}

export interface ParticipantAnalysis {
  totalParticipants: number;
  activeParticipants: number;
  speakingParticipants: number;
  reactingParticipants: number;
  participantInfo: Record<string, {
    name: string;
    role?: string;
    joinTime: string;
    leaveTime: string;
    active: boolean;
    speaking: boolean;
    reacting: boolean;
  }>;
}

export interface MeetingAnalysis {
  meetingId: string;
  meetingTitle: string;
  date: string;
  duration: number;
  platform: string;
  participants: ParticipantAnalysis;
  speakers: SpeakerAnalysis[];
  sentiment: SentimentAnalysis;
  topics: TopicAnalysis;
  reactions: ReactionAnalysis;
}

/**
 * Process and analyze a Zoom meeting
 * 
 * @param meetingId - Unique identifier for the meeting
 * @param meetingDataPath - Path to the meeting data directory
 * @param outputPath - Path where analysis results will be stored
 * @returns Promise resolving to the path where analysis results are stored
 */
export async function processZoomMeeting(
  meetingId: string,
  meetingDataPath: string,
  outputPath: string
): Promise<string> {
  console.log(`Processing meeting ${meetingId} from ${meetingDataPath}`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  try {
    // Read meeting metadata
    const metadataPath = path.join(meetingDataPath, 'meeting-metadata.json');
    const transcriptPath = path.join(meetingDataPath, 'transcript.json');
    
    // Check if files exist
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }
    
    if (!fs.existsSync(transcriptPath)) {
      throw new Error(`Transcript file not found at ${transcriptPath}`);
    }
    
    // Analyze the meeting using transcript and metadata
    const analysis = await analyzeTranscriptData(metadataPath, transcriptPath);
    
    // Save analysis results
    const analysisOutputPath = path.join(outputPath, `meeting-analysis-${meetingId}.json`);
    fs.writeFileSync(analysisOutputPath, JSON.stringify(analysis, null, 2));
    
    // Save individual analysis components
    fs.writeFileSync(
      path.join(outputPath, `speakers-analysis-${meetingId}.json`),
      JSON.stringify({ speakers: analysis.speakers }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputPath, `sentiment-analysis-${meetingId}.json`),
      JSON.stringify({ sentiment: analysis.sentiment }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputPath, `topics-analysis-${meetingId}.json`),
      JSON.stringify({ topics: analysis.topics }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputPath, `timeline-${meetingId}.json`),
      JSON.stringify({ timeline: analysis.sentiment.timeline }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputPath, `participants-analysis-${meetingId}.json`),
      JSON.stringify({ participants: analysis.participants }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputPath, `reactions-analysis-${meetingId}.json`),
      JSON.stringify({ reactions: analysis.reactions }, null, 2)
    );
    
    // Copy the main analysis file to public directory if outputPath is not already public
    if (!outputPath.includes('public')) {
      const publicDir = path.join(process.cwd(), 'public', 'analysis-data');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.copyFileSync(
        analysisOutputPath,
        path.join(publicDir, `meeting-analysis-${meetingId}.json`)
      );
    }
    
    return outputPath;
  } catch (error) {
    console.error('Error processing Zoom meeting:', error);
    throw error;
  }
}

/**
 * Analyze meeting data using the transcript and metadata
 */
async function analyzeTranscriptData(metadataPath: string, transcriptPath: string): Promise<MeetingAnalysis> {
  try {
    // Process the transcript to extract speakers, sentiment, and topics
    const transcriptAnalysis = await processTranscript(metadataPath, transcriptPath);
    
    // Extract emoji reactions from the transcript
    const reactions = generateReactionsAnalysis(transcriptAnalysis);
    
    // Create the complete meeting analysis
    const meetingAnalysis: MeetingAnalysis = {
      meetingId: transcriptAnalysis.meetingId,
      meetingTitle: transcriptAnalysis.meetingTitle,
      date: transcriptAnalysis.date,
      duration: transcriptAnalysis.duration,
      platform: String(transcriptAnalysis.meetingId).includes('zoom') ? 'Zoom' : 'Teams',
      participants: {
        totalParticipants: transcriptAnalysis.totalParticipants,
        activeParticipants: transcriptAnalysis.activeParticipants,
        speakingParticipants: transcriptAnalysis.speakingParticipants,
        reactingParticipants: transcriptAnalysis.reactingParticipants,
        participantInfo: transcriptAnalysis.participantInfo
      },
      speakers: transcriptAnalysis.speakers.map(speaker => ({
        id: speaker.id,
        name: speaker.name,
        role: speaker.role,
        speakingTime: speaker.speakingTime,
        speakingTimePercentage: (speaker.speakingTime / transcriptAnalysis.duration) * 100,
        segments: speaker.segments.length,
        wordsPerMinute: calculateWordsPerMinute(speaker),
        sentiment: speaker.sentiment,
        topics: speaker.topics
      })),
      sentiment: {
        overall: transcriptAnalysis.overallSentiment,
        timeline: transcriptAnalysis.sentimentTimeline,
        positive: transcriptAnalysis.positiveStatements,
        negative: transcriptAnalysis.negativeStatements,
        neutral: transcriptAnalysis.neutralStatements
      },
      topics: {
        topics: transcriptAnalysis.topics,
        keyPhrases: transcriptAnalysis.keyPhrases
      },
      reactions: reactions
    };
    
    return meetingAnalysis;
  } catch (error) {
    console.error('Error analyzing meeting:', error);
    throw error;
  }
}

/**
 * Extract emoji reactions from transcript and calculate statistics
 */
function generateReactionsAnalysis(analysis: TranscriptAnalysis): ReactionAnalysis {
  // Extract emoji reactions from text using regex
  const emojiRegex = /[\p{Emoji}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  
  // Common emojis and their names
  const emojiMap: Record<string, string> = {
    '👍': '👍 Thumbs Up',
    '❤️': '❤️ Heart',
    '👏': '👏 Clapping',
    '🎉': '🎉 Celebration',
    '😄': '😄 Laugh',
    '🙏': '🙏 Thank You',
    '💯': '💯 Perfect',
    '🔥': '🔥 Fire',
    '✅': '✅ Check',
    '🤔': '🤔 Thinking'
  };
  
  // Count reactions by speaker
  const reactionsBySpeaker: Record<string, Record<string, number>> = {};
  const allReactions: Record<string, { count: number, sentiment: number }> = {};
  
  // Process all transcript segments
  analysis.speakers.forEach((speaker) => {
    speaker.segments.forEach((segment) => {
      const text = segment.text;
      const emojis = text.match(emojiRegex) || [];
      
      emojis.forEach((emoji: string) => {
        const emojiName = emojiMap[emoji] || `${emoji} Emoji`;
        
        // Count by speaker
        if (!reactionsBySpeaker[speaker.name]) {
          reactionsBySpeaker[speaker.name] = {};
        }
        reactionsBySpeaker[speaker.name][emojiName] = (reactionsBySpeaker[speaker.name][emojiName] || 0) + 1;
        
        // Count overall
        if (!allReactions[emojiName]) {
          // Assign a sentiment value between 50-100 for each emoji (simulated)
          const sentimentValue = Math.round(70 + Math.random() * 30);
          allReactions[emojiName] = { count: 1, sentiment: sentimentValue };
        } else {
          allReactions[emojiName].count += 1;
        }
      });
    });
  });
  
  // Format for output
  const reactions = Object.entries(allReactions).map(([name, data]) => ({
    name,
    count: data.count,
    sentiment: data.sentiment
  })).sort((a, b) => b.count - a.count);
  
  // Format speaker reactions
  const speakerReactions: Record<string, Array<{ name: string, count: number }>> = {};
  
  Object.entries(reactionsBySpeaker).forEach(([speaker, counts]) => {
    speakerReactions[speaker] = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });
  
  return {
    reactions,
    speakerReactions
  };
}

/**
 * Calculate words per minute for a speaker
 */
function calculateWordsPerMinute(speaker: any): number {
  if (!speaker.segments.length || speaker.speakingTime < 10) {
    return 0;
  }
  
  const totalWords = speaker.segments.reduce((sum: number, segment: any) => {
    const wordCount = segment.text.split(/\s+/).length;
    return sum + wordCount;
  }, 0);
  
  // Calculate speaking time in minutes
  const speakingTimeMinutes = speaker.speakingTime / 60;
  
  return Math.round(totalWords / speakingTimeMinutes);
}

/**
 * Check if analysis results exist for a meeting
 */
export function analysisExists(meetingId: string, outputPath: string): boolean {
  const analysisPath = path.join(outputPath, `meeting-analysis-${meetingId}.json`);
  return fs.existsSync(analysisPath);
}

/**
 * Get analysis results for a meeting
 */
export function getAnalysisResults(meetingId: string, outputPath: string): MeetingAnalysis | null {
  try {
    const analysisPath = path.join(outputPath, `meeting-analysis-${meetingId}.json`);
    
    if (fs.existsSync(analysisPath)) {
      const data = fs.readFileSync(analysisPath, 'utf8');
      return JSON.parse(data) as MeetingAnalysis;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting analysis results for meeting ${meetingId}:`, error);
    return null;
  }
}

/**
 * Get specific analysis file for a meeting
 */
export function getSpecificAnalysis(meetingId: string, outputPath: string, filePrefix: string): any {
  try {
    const analysisPath = path.join(outputPath, `${filePrefix}-${meetingId}.json`);
    
    if (fs.existsSync(analysisPath)) {
      const data = fs.readFileSync(analysisPath, 'utf8');
      return JSON.parse(data);
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting ${filePrefix} analysis for meeting ${meetingId}:`, error);
    return null;
  }
} 