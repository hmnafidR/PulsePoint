import { NextResponse } from 'next/server';
import { StreamingService } from '@/lib/streaming-service';

export async function POST(request: Request) {
  try {
    console.log('Received audio analysis request');
    // Use formData to get the audio file and meeting ID
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const meetingId = formData.get('meetingId') as string | null;

    // Validate input
    if (!audioFile) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    if (!meetingId) {
      return NextResponse.json({ success: false, error: 'No meeting ID provided' }, { status: 400 });
    }

    console.log(`Processing audio for meeting: ${meetingId}`);
    
    // Convert to blob for processing
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    
    // Process the audio using the StreamingService
    const streamingService = new StreamingService();
    const transcript = await streamingService.processAudio(audioBlob, meetingId);
    
    console.log('Audio processing complete, returning transcript');
    
    // Return the processed transcript
    return NextResponse.json({ success: true, transcript });
  } catch (error) {
    console.error('Error in analyze-audio API:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: `Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, 
      { status: 500 }
    );
  }
} 