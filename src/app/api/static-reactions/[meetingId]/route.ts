import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * API route to fetch data directly from a reactions-analysis.json file.
 * UPDATED: Determines the base directory (Zoom or ZoomW3ML) based on the 
 * meetingId parameter (e.g., GMT...) and reads the reactions-analysis.json file
 * directly within that directory.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const meetingId = params.meetingId; 

  if (!meetingId) {
    return NextResponse.json(
      { error: 'Meeting directory ID (e.g., GMT...) is required' },
      { status: 400 }
    );
  }
  console.log(`[API - static-reactions] Received request for meetingId: ${meetingId}`);

  // **NEW**: Determine base directory based on meeting ID prefix
  let baseDirectory = 'Zoom'; // Default
  if (meetingId.startsWith('GMT20250325')) { // Assuming W3ML IDs start with this
    baseDirectory = 'ZoomW3ML';
  } else if (meetingId.startsWith('GMT20250327')) { // Assuming regular Zoom IDs start with this
    baseDirectory = 'Zoom';
  } else {
    // Optional: Handle other cases or default
    console.warn(`[API - static-reactions] Unrecognized meetingId prefix: ${meetingId}. Defaulting to 'Zoom' directory.`);
  }
  console.log(`[API - static-reactions] Determined base directory: ${baseDirectory} for meetingId: ${meetingId}`);

  // Construct the path to the reactions file within the determined base directory
  const reactionsFilePath = path.join(process.cwd(), 'data', 'meeting_recordings', baseDirectory, 'reactions-analysis.json');
  console.log(`[API - static-reactions] Attempting to read path: ${reactionsFilePath}`);

  if (!fs.existsSync(reactionsFilePath)) {
    console.error(`[API - static-reactions] CRITICAL: File not found at path: ${reactionsFilePath}`);
    // Return a 404 as the specific file for this dataset type is missing
    return NextResponse.json(
        { error: `Reactions file not found for dataset type ${baseDirectory}` },
        { status: 404 } 
      );
  }

  try {
    const fileContent = fs.readFileSync(reactionsFilePath, 'utf-8');
    const parsedData = JSON.parse(fileContent);
    console.log(`[API - static-reactions] Successfully read and parsed ${reactionsFilePath}`);

    if (!parsedData || typeof parsedData !== 'object') {
        throw new Error("Parsed data is not a valid object.");
    }

    // Return the parsed data directly
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error(`[API - static-reactions] Error reading or parsing ${reactionsFilePath}:`, error);
    return NextResponse.json(
      { error: 'Failed to read or parse reactions file', details: String(error) },
      { status: 500 }
    );
  }
} 