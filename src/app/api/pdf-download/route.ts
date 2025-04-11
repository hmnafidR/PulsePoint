import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';

// Define types for the API
interface SentimentTimelineItem {
  timestamp: number;
  sentiment: number;
}

interface SpeakerAnalysisDataItem {
  name: string;
  speakingTime: number;
  sentiment: number;
}

interface TopicAnalysisDataItem {
  name: string;
  percentage: number;
  sentiment?: "positive" | "neutral" | "negative";
  keywords?: string[];
}

// Define the API route to generate and download PDFs
export async function POST(request: NextRequest) {
  try {
    // Get the meeting ID and version from the request body
    const body = await request.json();
    const { meetingId, version } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Add version parameter if specified
    const versionParam = version ? `?version=${version}` : '';
    
    // Fetch meeting data from backend API
    const apiUrl = `/api/meetings/${meetingId}/analyze`;
    const response = await fetch(new URL(apiUrl, request.nextUrl.origin).toString());

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch meeting data' }, { status: response.status });
    }

    const meetingData = await response.json();
    
    if (!meetingData.success || !meetingData.analysis) {
      return NextResponse.json({ error: 'No analysis data available' }, { status: 404 });
    }

    // Call the backend PDF generation endpoint
    const backendPdfUrl = new URL(
      `/api/meetings/download-pdf/${meetingId}${versionParam}`, 
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    );
    
    try {
      const pdfResponse = await fetch(backendPdfUrl.toString());
      
      if (!pdfResponse.ok) {
        let errorText = await pdfResponse.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.detail || errorText;
        } catch (e) {
          // Not JSON, use as is
        }
        throw new Error(`Backend PDF generation failed: ${errorText}`);
      }
      
      const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
      
      // Get filename from content-disposition header if available
      const disposition = pdfResponse.headers.get('content-disposition');
      let filename = `meeting_${meetingId}_analysis${version ? `_v${version}` : ''}.pdf`;
      if (disposition) {
        const filenameMatch = disposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Return the PDF as a response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (pdfError: any) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json({ 
        error: `PDF generation failed: ${pdfError.message || 'Unknown error'}` 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ 
      error: `Failed to generate PDF: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Helper function to format duration in HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}