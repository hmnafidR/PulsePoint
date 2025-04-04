import { NextResponse } from 'next/server';
import { DatasetService } from '@/lib/dataset-service';

export async function GET() {
  try {
    const datasetService = new DatasetService();
    let meetings = await datasetService.getMeetingRecordings();
    
    // If no meetings found, create demo files
    if (meetings.length === 0) {
      await datasetService.createDemoFiles();
      meetings = await datasetService.getMeetingRecordings();
    }
    
    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// Create a new meeting recording
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const meetingName = formData.get('name') as string;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    if (!meetingName) {
      return NextResponse.json(
        { error: 'No meeting name provided' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Save the audio file to storage
    // 2. Process the audio with Whisper and diarization
    // 3. Save the meeting details to database
    
    // For now, return a successful response
    return NextResponse.json({ 
      success: true,
      meeting: {
        id: `meeting-${Date.now()}`,
        name: meetingName,
        date: new Date().toISOString(),
        participants: ['System User'],
        duration: 0
      }
    });
    
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
} 