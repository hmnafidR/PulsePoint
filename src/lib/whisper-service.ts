import { spawn } from 'child_process';
import path from 'path';

export class WhisperService {
  async transcribe(audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const whisper = spawn('whisper', [
        audioPath,
        '--model', 'base',
        '--output_dir', 'transcripts',
        '--output_format', 'txt'
      ]);

      let output = '';

      whisper.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisper.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Whisper process failed with code ${code}`));
        }
      });
    });
  }
} 