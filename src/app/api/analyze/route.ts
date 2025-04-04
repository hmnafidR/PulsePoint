import { NextResponse } from 'next/server';
import { DatasetService } from '@/lib/dataset-service';
import { WhisperService } from '@/lib/whisper-service';
import { HuggingFaceService } from '@/lib/huggingface-service';

export async function POST(req: Request) {
  try {
    const { fileIndex } = await req.json();
    
    // Get test file
    const datasetService = new DatasetService();
    const files = await datasetService.getTestFiles();
    const file = files[fileIndex];

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Transcribe audio
    const whisperService = new WhisperService();
    const transcript = await whisperService.transcribe(file.path);

    // Analyze text
    const hfService = new HuggingFaceService();
    const [sentiment, questionAnalysis, speakerEmotion] = await Promise.all([
      hfService.analyzeSentiment(transcript),
      hfService.detectQuestion(transcript),
      hfService.analyzeSpeakerEmotion(transcript)
    ]);

    return NextResponse.json({
      transcript,
      analysis: {
        sentiment,
        isQuestion: questionAnalysis.label === 'QUESTION',
        speakerEmotion
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
} 