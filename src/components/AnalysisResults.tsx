'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResult {
  sentiments?: Array<{
    label: string;
    score: number;
  }>;
  questions?: string[];
  speakerAnalysis?: Array<{
    speaker: string;
    dominantEmotion: string;
    confidence: number;
  }>;
  transcripts?: string[];
}

export default function AnalysisResults() {
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('analysisResults');
    if (storedResults) {
      try {
        setResults(JSON.parse(storedResults));
      } catch (error) {
        console.error('Error parsing analysis results:', error);
      }
    }
  }, []);

  if (!results) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.sentiments && results.sentiments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Sentiments:</h3>
              <div className="space-y-2">
                {results.sentiments.map((sentiment, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{sentiment.label}</span>
                    <span>{Math.round(sentiment.score * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.questions && results.questions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Questions:</h3>
              <ul className="list-disc list-inside">
                {results.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          {results.speakerAnalysis && results.speakerAnalysis.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Speaker Analysis:</h3>
              <div className="space-y-2">
                {results.speakerAnalysis.map((speaker, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{speaker.speaker}</span>
                    <span>{speaker.dominantEmotion} ({Math.round(speaker.confidence * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.transcripts && results.transcripts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Transcripts:</h3>
              <div className="space-y-2">
                {results.transcripts.map((transcript, index) => (
                  <p key={index} className="text-sm">{transcript}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 