"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Interface matching the data passed from parent
interface TopicAnalysisDataItem {
  name: string;
  percentage: number;
  sentiment: "positive" | "neutral" | "negative";
  keywords?: string[];
  // Duration is calculated within this component
}

// Interface for the prop structure
interface TopicAnalysisData {
  topics: TopicAnalysisDataItem[];
}

// Internal Topic state interface (includes calculated duration and active state)
interface Topic extends TopicAnalysisDataItem {
  duration: string; // Calculated duration string (e.g., "15:30")
  active: boolean;
}

interface LiveTopicAnalysisProps {
  isLive?: boolean;
  data?: TopicAnalysisData; // Use the type passed from parent
  totalDurationSeconds?: number; // Accept total duration in seconds
  insightsText?: string | null; // Add prop for raw insights text
  actionItems?: string[]; // Add prop for action items
  summary?: string; // Add prop for meeting summary
}

export function LiveTopicAnalysis({ 
  isLive = false, 
  data, 
  totalDurationSeconds = 0,
  insightsText = null, // Destructure new prop
  actionItems = [], // Default to an empty array
  summary = "" // Default to an empty string
}: LiveTopicAnalysisProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [topicInsights, setTopicInsights] = useState<Record<string, string[]>>({})

  // Process incoming data from props
  useEffect(() => {
    if (data?.topics && data.topics.length > 0 && totalDurationSeconds > 0) {
      const formattedTopics = data.topics.map((topic: TopicAnalysisDataItem) => {
        // Calculate minutes and seconds based on percentage and total duration
        const topicDurationSeconds = (topic.percentage / 100) * totalDurationSeconds;
        const minutes = Math.floor(topicDurationSeconds / 60);
        const seconds = Math.floor(topicDurationSeconds % 60);
        
        return {
          ...topic,
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`, // Format duration
          active: false // Default active state
        };
      });
      
      // Sort by percentage (descending)
      const sortedTopics = formattedTopics.sort((a, b) => b.percentage - a.percentage);
      
      setTopics(sortedTopics);
      generateTopicInsights(sortedTopics);
      
      // Select the top topic initially if there are any topics
      // Check if the previously selected topic still exists in the new data
      const currentSelectedExists = sortedTopics.some(t => t.name === selectedTopic?.name);
      if (!currentSelectedExists) {
        setSelectedTopic(sortedTopics.length > 0 ? sortedTopics[0] : null);
      } else {
         // If it still exists, update the selectedTopic object instance to the one from the new sorted list
         // This ensures the selectedTopic state holds the latest duration/percentage if it changed
         const updatedSelectedTopic = sortedTopics.find(t => t.name === selectedTopic?.name);
         if (updatedSelectedTopic) {
           setSelectedTopic(updatedSelectedTopic);
         }
      }

    } else {
      // Handle case where data is empty or duration is zero
      setTopics([]);
      setSelectedTopic(null);
      setTopicInsights({});
    }
  // Dependencies: data prop and total duration
  // selectedTopic is added to handle re-selection logic correctly when data changes
  }, [data, totalDurationSeconds, selectedTopic?.name]); 

  // Removed: Internal fetchTopicData useEffect
  // Removed: generateDefaultTopics function

  // Generate insights for each topic - keep this logic as it works on the Topic[] state
  function generateTopicInsights(topicList: Topic[]) {
    const insights: Record<string, string[]> = {}
    
    topicList.forEach(topic => {
      let topicSpecificInsights: string[] = []
      
      // Generate insights based on topic name and sentiment
      // Keep the existing switch statement or adapt based on expected topic names
      switch(topic.name) {
        // Example cases - keep or modify based on actual expected topic names from analysis
        case "Vibe Coding":
          topicSpecificInsights = [
            "Discussions centered around using AI tools like Cursor for rapid development",
            "Participants expressed both excitement and challenges with this approach",
            "Several strategies were shared for prompting Cursor effectively"
          ]
          break
        case "Project Organization":
           topicSpecificInsights = [
            "Oren shared techniques using 'gitingest' for codebase analysis",
            "Participants discussed strategies for managing complex project structures",
            "File organization was identified as a common challenge"
          ]
          break
        case "AI Tools for Development":
           topicSpecificInsights = [
            "Several AI tools including Gemini Pro 2.5 and Gemma 3 were discussed",
            "Participants shared experiences with different platforms and models",
            "Integration of AI tools into development workflows was a key theme"
          ]
          break
        // Add more cases based on expected analysis output
        default:
          // Generic insights for topics not specifically handled
          topicSpecificInsights = [
            `This topic represented ${Math.round(topic.percentage)}% of the meeting time (${topic.duration})`,
            `The overall sentiment for this topic was ${topic.sentiment}.`,
            `Key keywords included: ${topic.keywords?.join(', ') || 'N/A'}.`
          ]
      }
      
      insights[topic.name] = topicSpecificInsights
    })
    
    setTopicInsights(insights)
  }

  // Simulate topic changes when isLive is true
  useEffect(() => {
    // Only run simulation if isLive is true AND no static data is provided
    if (!isLive || (data?.topics && data.topics.length > 0)) return;

    // If we reach here, isLive is true and no data was passed. 
    // Simulation logic is currently commented out as it requires default data generation.
    // console.log("Skipping live simulation as static data is present or isLive is false.")
    
  // Corrected Dependency Array: Removed 'topics'
  }, [isLive, data, totalDurationSeconds]) 

  // Determine color for sentiment
  function getSentimentColor(sentiment: string) {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Helper function to parse topic analysis from insights text
  const parseTopicAnalysis = (text: string | null): string[] => {
    if (!text) return [];
    
    // Try to extract the Topic Analysis section
    const topicStart = text.indexOf("Topic Analysis:");
    if (topicStart === -1) return [];
    
    let topicEnd = text.indexOf("\n\nFeedback/Insights:");
    if (topicEnd === -1) topicEnd = text.length;
    
    const topicSection = text.substring(topicStart + "Topic Analysis:".length, topicEnd).trim();
    return topicSection.split('\n').map(line => line.trim()).filter(line => line.startsWith('-')).map(line => line.substring(2).trim());
  };
  
  // Helper function to parse feedback/insights from insights text
  const parseFeedbackInsights = (text: string | null): string[] => {
    if (!text) return [];
    
    const insightsStart = text.indexOf("Feedback/Insights:");
    if (insightsStart === -1) return [];
    
    const insightsSection = text.substring(insightsStart + "Feedback/Insights:".length).trim();
    return insightsSection.split('\n').map(line => line.trim()).filter(line => line.startsWith('-')).map(line => line.substring(2).trim());
  };
  
  // Parse the topics and insights from the insightsText
  const topicList = parseTopicAnalysis(insightsText);
  const feedbackList = parseFeedbackInsights(insightsText);

  // Check if there is any data to display
  if (!insightsText && (!topics || topics.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>AI-powered analysis, insights, and feedback.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          No topic or insights data available for this meeting.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>AI-powered analysis, insights, and feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Meeting Summary Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Meeting Summary</h3>
            <p className="text-sm text-muted-foreground">
              {summary || "No summary available for this meeting."}
            </p>
          </div>
          
          {/* Topic Analysis Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Topic Analysis</h3>
            {topicList && topicList.length > 0 ? (
              <ul className="space-y-1 list-disc pl-5">
                {topicList.map((topic, index) => (
                  <li key={index} className="text-sm">{topic}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No topics available.</p>
            )}
          </div>

          {/* Meeting Insights Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Meeting Insights</h3>
            {feedbackList && feedbackList.length > 0 ? (
              <ul className="space-y-1 list-disc pl-5">
                {feedbackList.map((insight, index) => (
                  <li key={index} className="text-sm">{insight}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No insights available.</p>
            )}
          </div>
          
          {/* Action Items Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Action Items</h3>
            {actionItems && actionItems.length > 0 ? (
              <ul className="space-y-1 list-disc pl-5">
                {actionItems.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No action items available.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}