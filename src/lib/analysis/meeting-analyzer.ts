/**
 * This is the main meeting analyzer module that integrates all analysis components.
 * It coordinates the processing of meeting recordings, transcripts, and metadata
 * to generate comprehensive analysis results.
 */

import path from 'path';
import fs from 'fs';
import { processAudioFile, AudioAnalysisResult, SpeechSegment } from './audio-processor';
import { analyzeMeetingTranscript, SentimentAnalysisResult } from './sentiment-analyzer';
import { extractTopics, extractKeyPhrases, TopicExtractionResult } from './topic-extractor';

// Meeting analysis result type definition
export interface MeetingAnalysis {
  // Meeting metadata
  meetingId: string;
  meetingTitle: string;
  date: string;
  duration: number; // in seconds
  
  // Participant data
  totalParticipants: number;
  activeParticipants: number;
  inactiveParticipants: number[];
  
  // Speaker analysis
  speakers: {
    id: string;
    name: string;
    speakingTime: number;
    speakingPercentage: number;
    sentiment: number; // average sentiment score
  }[];
  
  // Content analysis
  topics: {
    name: string;
    percentage: number;
    keywords: string[];
  }[];
  keyPhrases: string[];
  
  // Sentiment analysis
  overallSentiment: number;
  sentimentTrend: Array<{ time: number; value: number }>;
  
  // Timeline with speakers and topics
  timeline: Array<{
    time: number;
    duration: number;
    speaker: string;
    text: string;
    sentiment: number;
    topics: string[];
  }>;
}

// Type for partial analysis results
export type PartialAnalysis = Partial<MeetingAnalysis>;

// Define transcript segment type
interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

/**
 * Analyze a meeting using its recordings, transcript, and metadata
 * @param meetingId Unique identifier for the meeting
 * @param dataPath Path to the directory containing meeting data files
 */
export async function analyzeMeeting(meetingId: string, dataPath: string): Promise<MeetingAnalysis> {
  console.log(`Analyzing meeting ${meetingId} from path: ${dataPath}`);
  
  try {
    // Validate that the data path exists
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Meeting data path does not exist: ${dataPath}`);
    }
    
    // Read meeting metadata
    const metadataPath = path.join(dataPath, 'meeting-metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Meeting metadata file not found: ${metadataPath}`);
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Find audio recording file
    const recordingFiles = fs.readdirSync(dataPath).filter(file => 
      file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.wav')
    );
    
    if (recordingFiles.length === 0) {
      console.log('No audio recording file found, using transcript data only');
    }
    
    // Process audio file if available
    let audioAnalysis: AudioAnalysisResult | null = null;
    if (recordingFiles.length > 0) {
      const audioPath = path.join(dataPath, recordingFiles[0]);
      audioAnalysis = await processAudioFile(audioPath, meetingId);
    }
    
    // Process transcript directly if no audio analysis
    const transcriptFiles = fs.readdirSync(dataPath).filter(file => 
      file.includes('transcript') && (file.endsWith('.vtt') || file.endsWith('.srt') || file.endsWith('.json'))
    );
    
    if (transcriptFiles.length === 0) {
      throw new Error('No transcript files found for analysis');
    }
    
    // Get transcript segments
    let transcriptSegments: TranscriptSegment[] = [];
    if (audioAnalysis) {
      transcriptSegments = audioAnalysis.transcriptSegments.map(segment => ({
        text: segment.text,
        start: segment.start,
        end: segment.end
      }));
    } else {
      // Read transcript directly if we don't have audio analysis
      const transcriptPath = path.join(dataPath, transcriptFiles[0]);
      if (transcriptPath.endsWith('.json')) {
        const transcriptData = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'));
        transcriptSegments = transcriptData.segments || [];
      } else {
        // For VTT/SRT, we would parse them here
        // Using a simpler approach for now
        const transcriptText = fs.readFileSync(transcriptPath, 'utf8');
        const lines = transcriptText.split('\n').filter(line => 
          !!line.trim() && !line.includes('-->') && !line.match(/^\d+$/) && line !== 'WEBVTT'
        );
        
        transcriptSegments = lines.map((line, i) => ({
          text: line,
          start: i * 10, // Simulate 10-second segments as a fallback
          end: (i + 1) * 10
        }));
      }
    }
    
    // Perform sentiment analysis
    const sentimentAnalysis = analyzeMeetingTranscript(transcriptSegments);
    
    // Perform topic extraction
    const topicAnalysis = extractTopics(transcriptSegments);
    
    // Get speakers data
    const speakersData = metadata.participants || [];
    
    // Process participant activity data
    // In a real implementation, we would use more sophisticated analysis
    let activeParticipants = speakersData.length;
    let inactiveParticipantIds: number[] = [];
    
    if (metadata.totalParticipants > activeParticipants) {
      // Assume participants listed in metadata but not speaking are inactive
      inactiveParticipantIds = metadata.participants
        .filter((p: any) => {
          // Check if this participant is in the speakers list from audio analysis
          const foundSpeaker = audioAnalysis?.speakers.find(s => s === p.name);
          return !foundSpeaker;
        })
        .map((p: any) => p.id);
    }
    
    // Extract key phrases from the entire transcript text
    const fullTranscriptText = transcriptSegments.map(s => s.text).join(' ');
    const keyPhrases = extractKeyPhrases(fullTranscriptText);
    
    // Calculate speaking time per participant
    const speakerTimes: Record<string, number> = {};
    if (audioAnalysis) {
      audioAnalysis.transcriptSegments.forEach(segment => {
        speakerTimes[segment.speaker] = (speakerTimes[segment.speaker] || 0) + (segment.end - segment.start);
      });
    } else {
      // Simulate speaking time
      speakersData.forEach((speaker: any) => {
        // Random speaking time between 30 seconds and 5 minutes
        speakerTimes[speaker.name] = Math.floor(Math.random() * 270) + 30;
      });
    }
    
    // Calculate total speaking time
    const totalSpeakingTime = Object.values(speakerTimes).reduce((sum, time) => sum + time, 0);
    
    // Create a timeline of the meeting
    const timeline = transcriptSegments.map((segment: TranscriptSegment, i: number) => {
      // Determine speaker
      let speaker = 'Unknown';
      if (audioAnalysis) {
        const matchingSegment = audioAnalysis.transcriptSegments.find(
          s => s.start === segment.start && s.end === segment.end
        );
        if (matchingSegment) {
          speaker = matchingSegment.speaker;
        }
      } else if (i < speakersData.length) {
        // Randomly assign speakers as a fallback
        speaker = speakersData[i % speakersData.length].name;
      }
      
      // Find topics for this segment
      const segmentTopics = topicAnalysis.topics
        .filter(topic => topic.segments.includes(i))
        .map(topic => topic.name);
      
      // Get sentiment for this segment
      const sentimentScore = sentimentAnalysis.segmentSentiments[`segment_${i}`]?.compound || 0;
      
      return {
        time: segment.start,
        duration: segment.end - segment.start,
        speaker,
        text: segment.text,
        sentiment: sentimentScore,
        topics: segmentTopics
      };
    });
    
    // Build the complete analysis result
    const analysis: MeetingAnalysis = {
      meetingId,
      meetingTitle: metadata.title || 'Untitled Meeting',
      date: metadata.date || new Date().toISOString(),
      duration: audioAnalysis?.duration || totalSpeakingTime || metadata.duration || 0,
      
      totalParticipants: metadata.totalParticipants || speakersData.length,
      activeParticipants,
      inactiveParticipants: inactiveParticipantIds,
      
      speakers: Object.entries(speakerTimes).map(([name, time]) => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        speakingTime: time,
        speakingPercentage: totalSpeakingTime > 0 ? (time / totalSpeakingTime) * 100 : 0,
        sentiment: sentimentAnalysis.overallSentiment.compound
      })),
      
      topics: topicAnalysis.topics.map(topic => ({
        name: topic.name,
        percentage: topic.percentage || 0,
        keywords: topic.keywords
      })),
      
      keyPhrases,
      
      overallSentiment: sentimentAnalysis.overallSentiment.compound,
      sentimentTrend: sentimentAnalysis.emotionalArcs.timestamps.map((time, i) => ({
        time,
        value: sentimentAnalysis.emotionalArcs.sentimentValues[i]
      })),
      
      timeline
    };
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing meeting:', error);
    throw new Error(`Failed to analyze meeting ${meetingId}: ${(error as Error).message}`);
  }
}

/**
 * Save analysis results to a JSON file
 * Can save either complete MeetingAnalysis or partial results
 */
export function saveAnalysisResults(analysis: PartialAnalysis, outputPath: string): void {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`Analysis results saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving analysis results:', error);
    throw new Error(`Failed to save analysis results: ${(error as Error).message}`);
  }
} 