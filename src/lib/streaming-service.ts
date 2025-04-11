import { HuggingFaceStream } from './huggingface-stream';
import { createClient } from '@supabase/supabase-js';

type TranscriptSegment = {
  speaker: string;
  text: string;
  start?: number;
  end?: number;
};

export class StreamingService {
  private huggingFaceStream: HuggingFaceStream;
  private supabase;
  private isTestMode: boolean;

  constructor() {
    this.huggingFaceStream = new HuggingFaceStream();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    // Enable test mode if explicitly set or if API key is not available
    this.isTestMode = process.env.USE_TEST_MODE === 'true' || !process.env.HUGGINGFACE_API_KEY;
    
    if (this.isTestMode) {
      console.log('Test mode enabled - using mock data for transcription and diarization');
    }
  }

  async processAudio(audioBlob: Blob, meetingId: string): Promise<TranscriptSegment[]> {
    try {
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Check if we're in test mode
      if (this.isTestMode) {
        console.log("Running in test mode with simulated responses");
        // Return mock data for testing
        const mockTranscript = this.getMockTranscript();
        
        // Save transcript to database
        try {
          await this.saveTranscript(meetingId, mockTranscript);
        } catch (error) {
          console.error("Error saving to Supabase:", error);
          // Continue even if saving fails
        }
        
        return mockTranscript;
      }
      
      // Transcribe audio
      console.log("Transcribing audio...");
      const transcription = await this.transcribeAudio(arrayBuffer);
      
      // If transcription is empty, return early
      if (!transcription || !transcription.trim()) {
        console.log("Transcription is empty, skipping further processing");
        return [{ speaker: "Unknown", text: "" }];
      }
      
      // Diarize speakers
      console.log("Diarizing speakers...");
      let diarizedTranscript: TranscriptSegment[] = [];
      
      try {
        diarizedTranscript = await this.diarizeSpeakers(arrayBuffer, transcription);
      } catch (error) {
        console.error("Diarization error:", error);
        // Fall back to non-diarized transcript if diarization fails
        diarizedTranscript = [{ speaker: "Unknown", text: transcription }];
      }
      
      // Save transcript to database
      try {
        await this.saveTranscript(meetingId, diarizedTranscript);
      } catch (error) {
        console.error("Error saving to Supabase:", error);
        // Continue even if saving fails
      }
      
      return diarizedTranscript;
    } catch (error) {
      console.error("Audio processing error:", error);
      // Return mock data in case of error for testing
      if (this.isTestMode) {
        return this.getMockTranscript();
      }
      return [{ speaker: "Unknown", text: `Error processing audio: ${error instanceof Error ? error.message : String(error)}` }];
    }
  }

  private getMockTranscript(): TranscriptSegment[] {
    // Simulated transcript data for testing
    return [
      { 
        speaker: "Speaker 1", 
        text: "Welcome everyone to our team meeting. Today we'll discuss the quarterly results and our plans for the next quarter.",
        start: 0,
        end: 6.5
      },
      { 
        speaker: "Speaker 2", 
        text: "Thanks for organizing this. I have prepared a short presentation about our performance so far.",
        start: 6.5,
        end: 11.2
      },
      { 
        speaker: "Speaker 1", 
        text: "Great, let's start with the financial overview. We've exceeded our targets by 12%.",
        start: 11.2,
        end: 16.8
      },
      { 
        speaker: "Speaker 3", 
        text: "That's impressive. What were the main drivers behind this success?",
        start: 16.8,
        end: 20.5
      },
      { 
        speaker: "Speaker 2", 
        text: "The new product line performed extremely well, and our cost-cutting measures were also effective.",
        start: 20.5,
        end: 25.2
      }
    ];
  }

  private async transcribeAudio(audioData: ArrayBuffer): Promise<string> {
    try {
      // Call Whisper model for transcription
      const result = await this.huggingFaceStream.transcribeAudio(audioData);
      return result.text || '';
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : '500'}`);
    }
  }

  private async diarizeSpeakers(audioData: ArrayBuffer, transcript: string): Promise<TranscriptSegment[]> {
    try {
      // Call speaker diarization model
      const result = await this.huggingFaceStream.diarizeAudio(audioData);
      
      if (!result || !Array.isArray(result.segments)) {
        console.warn("Diarization returned unexpected format:", result);
        return [{ speaker: "Unknown", text: transcript }];
      }
      
      // Map segments to transcript format
      return result.segments.map((segment: { speaker: string; text: string; start?: number; end?: number }) => ({
        speaker: `Speaker ${segment.speaker || 'Unknown'}`,
        text: segment.text || '',
        start: segment.start,
        end: segment.end
      })) || [{ speaker: "Unknown", text: transcript }];
    } catch (error) {
      console.error("Diarization error:", error);
      // Instead of throwing, return a fallback
      return [{ speaker: "Unknown", text: transcript }];
    }
  }

  private async saveTranscript(meetingId: string, transcript: TranscriptSegment[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('meetings')
        .upsert({
          id: meetingId,
          transcript: JSON.stringify(transcript),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error("Error saving to Supabase:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      throw error;
    }
  }
} 