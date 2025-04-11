'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisContextType {
  analysisResults: any;
  setAnalysisResults: (results: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AnalysisContext.Provider value={{
      analysisResults,
      setAnalysisResults,
      isAnalyzing,
      setIsAnalyzing
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
} 