"use client"

import { useEffect, useState } from "react"
import { Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface LiveSpeakerAnalysisProps {
  isLive?: boolean
}

interface Speaker {
  name: string;
  speakingTime: number;
  sentiment: number;
  lastActive: boolean;
}

// Helper function to get sentiment color
function getSentimentColor(sentiment: number): string {
  if (sentiment >= 70) return "text-green-600"; // Positive
  if (sentiment >= 40 && sentiment < 70) return "text-yellow-600"; // Neutral
  return "text-red-600"; // Negative
}

// Helper function to get sentiment badge
function getSentimentBadge(sentiment: number): { label: string; bgColor: string; textColor: string } {
  if (sentiment >= 70) {
    return { 
      label: "Positive", 
      bgColor: "bg-green-100", 
      textColor: "text-green-800" 
    };
  }
  if (sentiment >= 40 && sentiment < 70) {
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

export function LiveSpeakerAnalysis({ isLive = false }: LiveSpeakerAnalysisProps) {
  // Default speaker data
  const defaultSpeakers = [
    { name: "Meri Nova", speakingTime: 1125, sentiment: 88, lastActive: false },
    { name: "Frederick Z", speakingTime: 675, sentiment: 80, lastActive: false },
    { name: "Oren", speakingTime: 630, sentiment: 82, lastActive: true },
    { name: "Autumn Hicks", speakingTime: 540, sentiment: 78, lastActive: false },
    { name: "Gil", speakingTime: 450, sentiment: 75, lastActive: false },
    { name: "kelseydilullo", speakingTime: 405, sentiment: 83, lastActive: false },
    { name: "Tamilarasee S", speakingTime: 360, sentiment: 65, lastActive: false },
    { name: "Hai", speakingTime: 315, sentiment: 68, lastActive: false },
  ];

  const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSpeakerData() {
      try {
        // Fetch data for the current meeting
        const response = await fetch('/api/meetings/zoom-dataset-1/analyze');
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting data');
        }
        
        const data = await response.json();
        
        if (data.success && data.analysis && data.analysis.speakers && Array.isArray(data.analysis.speakers)) {
          // Transform speaker data
          const realSpeakers = data.analysis.speakers.map((speaker: any, index: number) => {
            return {
              name: speaker.name,
              speakingTime: speaker.speakingTime || 0,
              sentiment: Math.round(speaker.sentiment * 100) || 75,
              lastActive: index === 0 // Set first speaker as active initially
            };
          });
          
          // Sort by speaking time (descending)
          realSpeakers.sort((a, b) => b.speakingTime - a.speakingTime);
          
          // Use real data if we have it
          if (realSpeakers.length > 0) {
            setSpeakers(realSpeakers);
          }
        }
      } catch (error) {
        console.error('Error fetching speaker data:', error);
        // Keep using default data
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSpeakerData();
  }, []);

  useEffect(() => {
    if (!isLive) return;

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
  }, [isLive]);

  // Calculate total speaking time
  const totalSpeakingTime = speakers.reduce((sum, speaker) => sum + speaker.speakingTime, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
                      <span>{Math.round((speaker.speakingTime / totalSpeakingTime) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center">
                  <span className={`font-medium text-sm ${sentimentColor}`}>{speaker.sentiment.toFixed(0)}%</span>
                  <span className={`ml-2 text-xs ${sentimentBadge.bgColor} ${sentimentBadge.textColor} px-1.5 py-0.5 rounded-full`}>
                    {sentimentBadge.label}
                  </span>
                </div>
              </div>
              <Progress 
                value={(speaker.speakingTime / totalSpeakingTime) * 100} 
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

