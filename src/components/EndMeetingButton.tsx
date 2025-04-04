'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EndMeetingButton() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Check if analysis is in progress
    const analyzing = localStorage.getItem('isAnalyzing') === 'true';
    setIsAnalyzing(analyzing);
  }, []);

  const handleEndMeeting = () => {
    localStorage.removeItem('analysisResults');
    localStorage.removeItem('isAnalyzing');
    setIsAnalyzing(false);
    router.refresh();
  };

  if (!isAnalyzing) return null;

  return (
    <button
      onClick={handleEndMeeting}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      End Analysis
    </button>
  );
} 