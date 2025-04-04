'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'sources' | 'datasets' | 'confirm'>('sources');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectSource = (source: string) => {
    setSelectedSource(source);
    if (source === 'dataset') {
      setStep('datasets');
    } else {
      // Handle Zoom/Teams
      console.log(`Selected ${source}`);
    }
  };

  const handleSelectDataset = (dataset: string) => {
    setSelectedDataset(dataset);
    setStep('confirm');
  };

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/test-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset: selectedDataset }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      
      // Store results in localStorage to share between pages
      localStorage.setItem('analysisResults', JSON.stringify(data));
      localStorage.setItem('isAnalyzing', 'true');
      
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to run analysis. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    if (step === 'datasets') {
      setStep('sources');
    } else if (step === 'confirm') {
      setStep('datasets');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Connect to Meeting</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        {step === 'sources' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSelectSource('zoom')}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              Zoom
            </button>
            <button
              onClick={() => handleSelectSource('teams')}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              Microsoft Teams
            </button>
            <button
              onClick={() => handleSelectSource('dataset')}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              Dataset
            </button>
          </div>
        )}
        
        {step === 'datasets' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSelectDataset('common_voice')}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              Common Voice Dataset
            </button>
            <button
              onClick={() => handleSelectDataset('librispeech')}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              LibriSpeech Dataset
            </button>
            <button onClick={goBack} className="mt-4 text-sm text-gray-600 hover:text-gray-800">
              ← Back
            </button>
          </div>
        )}
        
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3 border rounded bg-gray-50">
              Selected: {selectedDataset} Dataset
            </div>
            
            <button
              onClick={handleRunAnalysis}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isProcessing ? 'Processing...' : 'Run Analysis'}
            </button>
            
            <button onClick={goBack} className="w-full text-sm text-gray-600 hover:text-gray-800">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 