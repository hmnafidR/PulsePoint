"use client"

import { useEffect, useState } from "react"
import { Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

// Define type matching the data passed from the parent
interface SpeakerAnalysisDataItem {
  name: string;
  speakingTime: number;
  sentiment: number; // Expected in 0-1 format from props
  // Add other relevant speaker fields if available from API
}

interface LiveSpeakerAnalysisProps {
  isLive?: boolean
  speakersData?: SpeakerAnalysisDataItem[]; // Accept speakers data as prop
}

interface Speaker extends SpeakerAnalysisDataItem {
  // Extend with any UI-specific state if needed in the future
  // For now, it's the same as SpeakerAnalysisDataItem
  // Keep lastActive for potential live simulation logic (though currently unused when data is passed)
  lastActive: boolean; 
}

// Helper function to get sentiment color (adjust input scaling)
function getSentimentColor(sentimentFraction: number): string {
  const sentimentPercent = Math.round(sentimentFraction * 100);
  if (sentimentPercent >= 70) return "text-green-600"; // Positive
  if (sentimentPercent >= 40 && sentimentPercent < 70) return "text-yellow-600"; // Neutral
  return "text-red-600"; // Negative
}

// Helper function to get sentiment badge (adjust input scaling)
function getSentimentBadge(sentimentFraction: number): { label: string; bgColor: string; textColor: string } {
  const sentimentPercent = Math.round(sentimentFraction * 100);
  if (sentimentPercent >= 70) {
    return { 
      label: "Positive", 
      bgColor: "bg-green-100", 
      textColor: "text-green-800" 
    };
  }
  if (sentimentPercent >= 40 && sentimentPercent < 70) {
    return { 
      label: "Neutral", 
      bgColor: "bg-yellow-100", 
      textColor: "text-yellow-800" 
    };
  }
  return { 
    label: "Negative", 
    bgColor: "bg-red-100", 
    textColor: "text-red-800" 
  };
}

export function LiveSpeakerAnalysis({ isLive = false, speakersData }: LiveSpeakerAnalysisProps) {
  // State is now derived primarily from props when available
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    // If speakersData is provided, use it directly
    if (speakersData && speakersData.length > 0) {
      // Sort by speaking time and add default lastActive state (e.g., set first as active if needed)
      const processedSpeakers = speakersData
        .sort((a, b) => b.speakingTime - a.speakingTime)
        .map((speaker, index) => ({ 
          ...speaker, 
          // Set a default 'lastActive' state, though it might not be used if isLive is false
          lastActive: index === 0 
        }));
      setSpeakers(processedSpeakers);
    } else {
      // Fallback or handle empty data case - could show a message or use defaults if desired
      // For now, just set to empty array or potentially keep default logic if needed
      // console.log("No speaker data provided, using empty or default.");
      setSpeakers([]); // Set to empty if no data is passed
    }
    // We don't fetch data inside this component anymore
    // setIsLoading(false); // isLoading state is removed
    
  // Dependency array includes speakersData to react to prop changes
  }, [speakersData]);


  // Removed the internal data fetching useEffect

  // Live simulation effect (only runs if isLive is true AND no data is passed? TBD)
  // This might need adjustment depending on how 'live' mode should work now
  useEffect(() => {
    // Only run live simulation if isLive is true AND maybe if speakersData is initially empty/null?
    if (!isLive || (speakersData && speakersData.length > 0)) return;

    // Simulate speaker changes for live updates
    const interval = setInterval(() => {
      setSpeakers(prev => {
        const updated = [...prev];
        
        // Randomly select a speaker to be active
        const currentActiveIndex = updated.findIndex(s => s.lastActive);
        if (currentActiveIndex >= 0) {
          updated[currentActiveIndex].lastActive = false;
        }
        
        const newActiveIndex = Math.floor(Math.random() * updated.length);
        updated[newActiveIndex].lastActive = true;
        
        // Update speaking times slightly for live effect
        return updated.map(speaker => ({
          ...speaker,
          speakingTime: speaker.lastActive 
            ? speaker.speakingTime + Math.floor(Math.random() * 5) + 1
            : speaker.speakingTime
        }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, speakersData]);

  // Calculate total speaking time
  const totalSpeakingTime = speakers.reduce((sum, speaker) => sum + speaker.speakingTime, 0);

  // Handle case where there's no speaker data
  if (!speakers || speakers.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No speaker data available for this meeting.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Speaker Analysis - Vibecamp Bootcamp Q&A</span>
        {isLive && (
          <div className="flex items-center">
            <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse mr-2" />
            <span className="text-sm">Live</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {speakers.map((speaker, index) => {
          const sentimentColor = getSentimentColor(speaker.sentiment);
          const sentimentBadge = getSentimentBadge(speaker.sentiment);
          // Calculate percentage, handling totalSpeakingTime === 0
          const speakingPercentage = totalSpeakingTime > 0 
            ? Math.round((speaker.speakingTime / totalSpeakingTime) * 100) 
            : 0;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarFallback className={speaker.lastActive ? "bg-primary text-primary-foreground" : ""}>
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-sm">{speaker.name}</span>
                      {speaker.lastActive && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          Speaking
                        </span>
                      )}
                    </div>
                    <div className="flex text-xs text-muted-foreground">
                      <span>{formatTime(speaker.speakingTime)}</span>
                      <span className="mx-1">•</span>
                      <span>{speakingPercentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center">
                  <span className={`font-medium text-sm ${sentimentColor}`}>{(speaker.sentiment * 100).toFixed(0)}%</span>
                  <span className={`ml-2 text-xs ${sentimentBadge.bgColor} ${sentimentBadge.textColor} px-1.5 py-0.5 rounded-full`}>
                    {sentimentBadge.label}
                  </span>
                </div>
              </div>
              <Progress 
                value={speakingPercentage} 
                className="h-1.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

