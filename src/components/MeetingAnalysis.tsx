'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import AnalysisVisualizer from './AnalysisVisualizer';
import ProgressTracker from './ProgressTracker';

interface AnalysisState {
  transcript: string;
  sentiment: {
    label: string;
    score: number;
    timestamp: number;
  }[];
  questions: string[];
  speakerEmotions: {
    speaker: string;
    emotion: string;
  }[];
}

export default function MeetingAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [error, setError] = useState<string | null>(null);

  const { complete: streamAnalysis, isLoading } = useCompletion({
    api: '/api/stream-analysis',
    onFinish: (result) => {
      const parsedResult = JSON.parse(result);
      setAnalysis(prev => ({
        ...prev!,
        sentiment: [...prev!.sentiment, parsedResult.sentiment]
      }));
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalysis = async () => {
    if (!file) return;

    try {
      setProgress({ current: 0, total: 100, status: 'Starting analysis...' });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Start analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        await streamAnalysis(chunk);
        
        // Update progress
        setProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + 10, 90),
          status: 'Processing...'
        }));
      }

      setProgress({ current: 100, total: 100, status: 'Complete!' });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <input 
          type="file" 
          accept="audio/*"
          onChange={handleFileUpload}
          className="mb-4"
        />
        
        <button
          onClick={handleAnalysis}
          disabled={!file || isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Audio'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {progress.current > 0 && (
        <div className="mb-6">
          <ProgressTracker {...progress} />
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">Sentiment Over Time</h3>
            <AnalysisVisualizer sentiment={analysis.sentiment} />
          </div>

          <div>
            <h3 className="font-bold mb-2">Transcript</h3>
            <p className="whitespace-pre-wrap">{analysis.transcript}</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Questions Detected</h3>
            <ul className="list-disc pl-5">
              {analysis.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">Speaker Emotions</h3>
            <div className="grid grid-cols-2 gap-4">
              {analysis.speakerEmotions.map((se, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{se.speaker}</p>
                  <p>{se.emotion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 