import { StreamingTextResponse } from 'ai';
import { StreamingService } from '@/lib/streaming-service';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const streamingService = new StreamingService();
    return await streamingService.createStream(text);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Streaming failed' }), 
      { status: 500 }
    );
  }
} 