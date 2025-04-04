'use client';

import { useAnalysis } from '@/lib/AnalysisContext';
import AnalysisVisualizer from './AnalysisVisualizer';

export default function Dashboard() {
  const { analysisResults, isAnalyzing } = useAnalysis();

  return (
    <div className="p-6">
      {isAnalyzing && analysisResults && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">Sentiment Distribution</h3>
            <AnalysisVisualizer data={analysisResults.sentiments} />
          </div>
          {/* Add other visualizations */}
        </div>
      )}
    </div>
  );
} 