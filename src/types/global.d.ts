declare module 'openai-whisper' {
  export interface WhisperConfig {
    model: string;
    language?: string;
  }

  export function transcribe(
    audio: Buffer | string,
    config?: WhisperConfig
  ): Promise<string>;
} 