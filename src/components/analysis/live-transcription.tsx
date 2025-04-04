import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from 'uuid';

export function LiveTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<{speaker: string, text: string, sentiment?: number}[]>([]);
  const [meetingId, setMeetingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Generate a unique meeting ID when component loads
    setMeetingId(uuidv4());
    
    // Clean up on unmount
    return () => {
      stopRecording();
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      setError(null);
      
      // Set up periodic processing of audio
      processingIntervalRef.current = setInterval(processAudioChunks, 10000); // Process every 10 seconds
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Permission to use microphone was denied or an error occurred.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Process any remaining audio
      processAudioChunks();
      
      // Clear the processing interval
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
    }
  };
  
  const processAudioChunks = async () => {
    // Skip if no audio chunks or already processing
    if (audioChunksRef.current.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Take current chunks and reset the array
      const chunksToProcess = [...audioChunksRef.current];
      audioChunksRef.current = [];
      
      // Create audio blob from chunks
      const audioBlob = new Blob(chunksToProcess, { type: 'audio/webm' });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('meetingId', meetingId);
      
      // Send to API for processing
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to process audio');
      }
      
      const data = await response.json();
      
      // Update transcript with new segments
      if (data.transcript && Array.isArray(data.transcript)) {
        setTranscript(prev => [...prev, ...data.transcript]);
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Mock function to generate sentiment score
  const getSentimentColor = (sentiment: number = 75) => {
    if (sentiment >= 75) return "text-green-500";
    if (sentiment >= 50) return "text-amber-500";
    return "text-red-500";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            size="sm"
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Start Recording
              </>
            )}
          </Button>
          
          {isRecording && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Recording
            </span>
          )}
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Processing audio...</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      <div className="relative h-[400px] overflow-auto rounded-md border p-4">
        {transcript.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              {isRecording
                ? "Recording... Speech will appear here."
                : "Start recording to see speech transcription."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcript.map((entry, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{entry.speaker}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`text-sm ${getSentimentColor(entry.sentiment)}`}>
                    Sentiment: {entry.sentiment || 75}%
                  </span>
                </div>
                <p className="mt-2 text-sm">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 