/**
 * API Route for processing meeting recordings
 * 
 * This route invokes our analysis pipeline to process a meeting recording
 * and generate analysis files. It's intended to be called from the frontend
 * when a user wants to analyze a meeting.
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { 
  processZoomMeeting, 
  getAnalysisResults, 
  analysisExists, 
  getSpecificAnalysis 
} from '@/lib/analysis';

/**
 * API route to process meeting recordings and generate analysis files
 * POST: Triggers the analysis processing for a meeting
 * GET: Returns the current status of the analysis
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const meetingId = params.meetingId;
  
  if (!meetingId) {
    return NextResponse.json(
      { error: 'Meeting ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Define the paths for meeting data and output
    const meetingDataPath = path.join(process.cwd(), 'data', 'meeting_recordings', 'zoom');
    const outputPath = path.join(process.cwd(), 'public', 'analysis-data');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Process the meeting
    await processZoomMeeting(meetingId, meetingDataPath, outputPath);
    
    // Get the analysis results to return to the frontend
    const analysis = getAnalysisResults(meetingId, outputPath);
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to process meeting', meetingId },
        { status: 500 }
      );
    }
    
    // Extract the specific data needed by the frontend
    const response = {
      success: true,
      meetingId,
      outputPath,
      analysis: {
        speakers: analysis.speakers,
        overallSentiment: analysis.sentiment.overall,
        sentiment: {
          overall: analysis.sentiment.overall,
          timeline: analysis.sentiment.timeline,
          positive: analysis.sentiment.positive,
          negative: analysis.sentiment.negative,
          neutral: analysis.sentiment.neutral
        },
        topics: analysis.topics.topics,
        keyPhrases: analysis.topics.keyPhrases,
        totalParticipants: analysis.participants.totalParticipants,
        activeParticipants: analysis.participants.activeParticipants,
        speakingParticipants: analysis.participants.speakingParticipants,
        reactingParticipants: analysis.participants.reactingParticipants,
        duration: analysis.duration,
        date: analysis.date,
        platform: analysis.platform,
        meetingTitle: analysis.meetingTitle,
        reactions: analysis.reactions
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing meeting:', error);
    return NextResponse.json(
      { error: 'Failed to process meeting', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const meetingId = params.meetingId;
  
  if (!meetingId) {
    return NextResponse.json(
      { error: 'Meeting ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Check if analysis exists for this meeting
    const outputPath = path.join(process.cwd(), 'public', 'analysis-data');
    const analysisProcessed = analysisExists(meetingId, outputPath);
    
    if (analysisProcessed) {
      // Get the analysis data
      const analysis = getAnalysisResults(meetingId, outputPath);
      
      return NextResponse.json({
        success: true,
        processed: true,
        meetingId,
        analysis: analysis ? {
          speakers: analysis.speakers,
          overallSentiment: analysis.sentiment.overall,
          sentiment: {
            overall: analysis.sentiment.overall,
            timeline: analysis.sentiment.timeline,
            positive: analysis.sentiment.positive,
            negative: analysis.sentiment.negative,
            neutral: analysis.sentiment.neutral
          },
          topics: analysis.topics.topics,
          keyPhrases: analysis.topics.keyPhrases,
          totalParticipants: analysis.participants.totalParticipants,
          activeParticipants: analysis.participants.activeParticipants,
          speakingParticipants: analysis.participants.speakingParticipants,
          reactingParticipants: analysis.participants.reactingParticipants,
          duration: analysis.duration,
          date: analysis.date,
          platform: analysis.platform,
          meetingTitle: analysis.meetingTitle,
          reactions: analysis.reactions
        } : null
      });
    } else {
      return NextResponse.json({
        success: true,
        processed: false,
        meetingId,
        analysis: null
      });
    }
  } catch (error) {
    console.error('Error checking analysis status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check analysis status', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get a specific analysis file
 */
function getSpecificAnalysisFile(meetingId: string, prefix: string) {
  const outputPath = path.join(process.cwd(), 'public', 'analysis-data');
  return getSpecificAnalysis(meetingId, outputPath, prefix);
} 