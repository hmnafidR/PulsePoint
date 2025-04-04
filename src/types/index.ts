export interface AnalysisResult {
  sentiment: {
    label: string;
    score: number;
    timestamp: number;
  };
  isQuestion: boolean;
  speakerEmotion: string;
}

export interface AudioFile {
  path: string;
  transcript?: string;
}

export interface ProgressState {
  current: number;
  total: number;
  status: string;
} 