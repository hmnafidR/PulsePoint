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
import { analysisExists, getAnalysisResults } from '@/lib/analysis';

/**
 * API route to process meeting recordings and generate analysis files
 * POST: Triggers the analysis processing for a meeting
 * GET: Returns the current status of the analysis
 */

// Define the backend endpoint URL (ensure this matches your backend setup)
// Use environment variable or configuration for flexibility
const BACKEND_ANALYZE_URL = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/meetings/analyze-dataset` : 'http://localhost:8000/api/meetings/analyze-dataset'; // Default if not set

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const logicalMeetingId = params.meetingId;
  console.log(`[API - POST /analyze] Received request for meetingId: ${logicalMeetingId}`);
  
  if (!logicalMeetingId) {
    return NextResponse.json(
      { error: 'Meeting ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Call the new backend endpoint to trigger analysis
    console.log(`[API - POST /analyze] Triggering backend analysis at: ${BACKEND_ANALYZE_URL}`);
    const backendResponse = await fetch(BACKEND_ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meetingId: logicalMeetingId }),
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error(`[API - POST /analyze] Backend analysis failed for ${logicalMeetingId}:`, backendResult);
      return NextResponse.json(
        { 
          error: 'Backend analysis failed', 
          details: backendResult.detail || 'Unknown backend error'
        },
        { status: backendResponse.status || 500 }
      );
    }

    console.log(`[API - POST /analyze] Backend analysis successful for ${logicalMeetingId}. Result:`, backendResult);
    
    // Backend now saves files directly. We just need to confirm success.
    // The frontend will fetch the actual data via the GET request later.
    return NextResponse.json({
      success: true,
      message: backendResult.message || 'Analysis triggered successfully.',
      meetingId: logicalMeetingId,
      // Optionally include paths if needed by frontend immediately
      // outputPath: backendResult.output_directory, 
      // mainAnalysisFile: backendResult.main_analysis_file
    });

  } catch (error) {
    console.error(`[API - POST /analyze] Error triggering backend analysis for ${logicalMeetingId}:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger backend analysis', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const logicalMeetingId = params.meetingId;
  console.log(`[API - GET /analyze] Received request for meetingId: ${logicalMeetingId}`);
  
  if (!logicalMeetingId) {
    return NextResponse.json(
      { error: 'Meeting ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Define the expected output directory and main analysis file path
    // Use the logical meeting ID directly in the path
    const outputDir = path.join(process.cwd(), 'public', 'analysis-data', logicalMeetingId);
    const mainAnalysisFilePath = path.join(outputDir, `meeting-analysis-${logicalMeetingId}.json`);
    
    console.log(`[API - GET /analyze] Checking for analysis file at: ${mainAnalysisFilePath}`);

    // Check if the main analysis file exists
    const analysisProcessed = fs.existsSync(mainAnalysisFilePath);
    
    if (analysisProcessed) {
      console.log(`[API - GET /analyze] Analysis file found for ${logicalMeetingId}. Reading content.`);
      // Read the main analysis file content
      const fileContent = fs.readFileSync(mainAnalysisFilePath, 'utf-8');
      const analysisData = JSON.parse(fileContent);
      
      // --- Read Component Files (Comments & Reactions) ---
      // Read comments if file exists
      let commentsData = null;
      const commentsFilePath = path.join(outputDir, `comments-analysis-${logicalMeetingId}.json`);
      if (fs.existsSync(commentsFilePath)) {
        try {
          const commentsContent = fs.readFileSync(commentsFilePath, 'utf-8');
          commentsData = JSON.parse(commentsContent).comments; // Assuming structure { "comments": [...] }
          console.log(`[API - GET /analyze] Comments file found and parsed for ${logicalMeetingId}.`);
        } catch (e) {
          console.warn(`[API - GET /analyze] Error reading/parsing comments file ${commentsFilePath}:`, e);
        }
      } else {
        console.log(`[API - GET /analyze] Comments file not found for ${logicalMeetingId}.`);
      }

      // Read reactions if file exists
      let reactionsData = null;
      const reactionsFilePath = path.join(outputDir, `reactions-analysis-${logicalMeetingId}.json`);
      if (fs.existsSync(reactionsFilePath)) {
        try {
          const reactionsContent = fs.readFileSync(reactionsFilePath, 'utf-8');
          reactionsData = JSON.parse(reactionsContent); // Assuming structure { "reactions": [...], "speakerReactions": {...} }
          console.log(`[API - GET /analyze] Reactions file found and parsed for ${logicalMeetingId}.`);
        } catch (e) {
          console.warn(`[API - GET /analyze] Error reading/parsing reactions file ${reactionsFilePath}:`, e);
        }
      } else {
        console.log(`[API - GET /analyze] Reactions file not found for ${logicalMeetingId}.`);
      }

      // Read participants if file exists
      let participantsData = null;
      const participantsFilePath = path.join(outputDir, `participants-analysis-${logicalMeetingId}.json`);
      if (fs.existsSync(participantsFilePath)) {
        try {
          const participantsContent = fs.readFileSync(participantsFilePath, 'utf-8');
          const rawParticipantsData = JSON.parse(participantsContent);
          
          // Map snake_case field names to camelCase for the frontend
          participantsData = {
            totalParticipants: rawParticipantsData.total_participants,
            activeParticipants: rawParticipantsData.active_participants,
            speakingParticipants: rawParticipantsData.speaking_participants,
            reactingParticipants: rawParticipantsData.reacting_participants
          };
          console.log(`[API - GET /analyze] Participants file found and parsed for ${logicalMeetingId}.`);
          console.log(`[API - GET /analyze] Mapped participants data: `, participantsData);
        } catch (e) {
          console.warn(`[API - GET /analyze] Error reading/parsing participants file ${participantsFilePath}:`, e);
        }
      } else {
        console.log(`[API - GET /analyze] Participants file not found for ${logicalMeetingId}.`);
      }
      
      // Read timeline data if file exists (consistent naming format)
      let timelineData = null;
      const timelineFilePath = path.join(outputDir, `timeline-${logicalMeetingId}.json`);
      if (fs.existsSync(timelineFilePath)) {
        try {
          const timelineContent = fs.readFileSync(timelineFilePath, 'utf-8');
          timelineData = JSON.parse(timelineContent).timeline; // Assuming structure { "timeline": [...] }
          console.log(`[API - GET /analyze] Timeline file found and parsed for ${logicalMeetingId}.`);
        } catch (e) {
          console.warn(`[API - GET /analyze] Error reading/parsing timeline file ${timelineFilePath}:`, e);
        }
      } else {
        console.log(`[API - GET /analyze] Timeline file not found for ${logicalMeetingId}.`);
      }
      
      // Read comments from standardized comments file if it exists
      if (!commentsData) {
        const standardCommentsFilePath = path.join(outputDir, `comments-analysis-${logicalMeetingId}.json`);
        if (fs.existsSync(standardCommentsFilePath)) {
          try {
            const standardCommentsContent = fs.readFileSync(standardCommentsFilePath, 'utf-8');
            commentsData = JSON.parse(standardCommentsContent).comments;
            console.log(`[API - GET /analyze] Standardized comments file found and parsed for ${logicalMeetingId}.`);
          } catch (e) {
            console.warn(`[API - GET /analyze] Error reading/parsing standardized comments file ${standardCommentsFilePath}:`, e);
          }
        } else {
          console.log(`[API - GET /analyze] Standardized comments file not found for ${logicalMeetingId}.`);
        }
      }
      // -----------------------------------------------------

      // Assemble the final analysis object for the frontend
      // Combine data from the main file and component files
      const finalAnalysisPayload = {
          // Include fields from main analysis file (analysisData)
          ...analysisData, 
          // Override/add comments and reactions from their specific files
          comments: commentsData, 
          reactions: reactionsData,
          // Override/add participants data from its component file
          participants: participantsData || analysisData.participants, 
          // Add timeline data if available
          sentiment: {
            ...analysisData.sentiment,
            // If we have timeline data from the component file, use it
            timeline: timelineData || analysisData.sentiment?.timeline
          },
          // Ensure essential fields expected by frontend are present, potentially add defaults
          meetingId: logicalMeetingId,
          // Add engagement score if available in metadata
          engagementScore: analysisData.metadata?.engagement_score, 
          // Add last speaker if available
          lastSpeaker: analysisData.last_speaker 
      };
      
      return NextResponse.json({
        success: true,
        processed: true,
        meetingId: logicalMeetingId,
        analysis: finalAnalysisPayload // Return the combined data
      });

    } else {
      console.log(`[API - GET /analyze] Analysis file NOT found for ${logicalMeetingId}.`);
      return NextResponse.json({
        success: true,
        processed: false,
        meetingId: logicalMeetingId,
        analysis: null
      });
    }
  } catch (error) {
    console.error(`[API - GET /analyze] Error checking analysis status for ${logicalMeetingId}:`, error);
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