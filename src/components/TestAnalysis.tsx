'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatasetService } from '@/lib/dataset-service';

export default function TestAnalysis() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async (dataset: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
      localStorage.setItem('analysisResults', JSON.stringify(data));
      localStorage.setItem('isAnalyzing', 'true');
    } catch (err) {
      setError('Failed to run analysis. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={() => handleRunAnalysis('common_voice')}
              disabled={isLoading}
            >
              Run Common Voice Analysis
            </Button>
            <Button
              onClick={() => handleRunAnalysis('librispeech')}
              disabled={isLoading}
            >
              Run LibriSpeech Analysis
            </Button>
          </div>
          
          {isLoading && <p>Running analysis...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {results && (
            <div className="space-y-4">
              <h3 className="font-semibold">Analysis Results:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 