/**
 * This component provides a button to process a meeting recording
 * using our analysis pipeline. It's intended to be used in the dashboard
 * to allow users to manually trigger analysis of meeting recordings.
 */
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProcessMeetingButtonProps {
  meetingId: string;
  onComplete?: (success: boolean) => void;
}

export function ProcessMeetingButton({ meetingId, onComplete }: ProcessMeetingButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleProcessMeeting = async () => {
    setIsProcessing(true);
    
    try {
      // Make a request to an API route that will invoke our analysis pipeline
      const response = await fetch(`/api/meetings/${meetingId}/analyze`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process meeting');
      }
      
      toast.success('Meeting successfully processed');
      
      if (onComplete) {
        onComplete(true);
      }
    } catch (error) {
      console.error('Error processing meeting:', error);
      toast.error(`Failed to process meeting: ${(error as Error).message}`);
      
      if (onComplete) {
        onComplete(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleProcessMeeting} 
      disabled={isProcessing}
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : 'Analyze Meeting'}
    </Button>
  );
} 