"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { ThumbsUp, ThumbsDown, Heart, Laugh, Lightbulb, HelpCircle, Smile, Frown } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Add interfaces for props
interface ReactionItem {
  name: string;
  count: number;
  sentiment: number;
}

interface SpeakerReactionItem {
  name: string;
  count: number;
}

interface SpeakerReactionData {
  [speaker: string]: SpeakerReactionItem[];
}

interface ReactionAnalysisProps {
  data?: ReactionItem[];
  speakerData?: SpeakerReactionData;
}

// Default data
const defaultReactionData: ReactionItem[] = [
  {
    name: "👍 Thumbs Up",
    count: 87,
    sentiment: 95,
  },
  {
    name: "❤️ Heart",
    count: 64,
    sentiment: 98,
  },
  {
    name: "👏 Clapping",
    count: 72,
    sentiment: 96,
  },
  {
    name: "🎉 Celebration",
    count: 45,
    sentiment: 99,
  },
  {
    name: "😄 Laugh",
    count: 52,
    sentiment: 90,
  },
  {
    name: "💡 Idea",
    count: 38,
    sentiment: 85,
  },
  {
    name: "❓ Question",
    count: 45,
    sentiment: 65,
  },
  {
    name: "🙂 Smile",
    count: 32,
    sentiment: 80,
  },
  {
    name: "👎 Thumbs Down",
    count: 18,
    sentiment: 20,
  },
  {
    name: "😕 Confused",
    count: 24,
    sentiment: 40,
  },
]

// Default speaker reaction data
const defaultSpeakerReactionData: SpeakerReactionData = {
  "Sarah Johnson": [
    { name: "👍 Thumbs Up", count: 28 },
    { name: "❤️ Heart", count: 22 },
    { name: "👏 Clapping", count: 25 },
    { name: "🎉 Celebration", count: 12 },
    { name: "😄 Laugh", count: 15 },
    { name: "💡 Idea", count: 8 },
    { name: "❓ Question", count: 12 },
    { name: "🙂 Smile", count: 10 },
    { name: "👎 Thumbs Down", count: 3 },
    { name: "😕 Confused", count: 5 },
  ],
  "Michael Chen": [
    { name: "👍 Thumbs Up", count: 18 },
    { name: "❤️ Heart", count: 12 },
    { name: "👏 Clapping", count: 14 },
    { name: "🎉 Celebration", count: 8 },
    { name: "😄 Laugh", count: 8 },
    { name: "💡 Idea", count: 15 },
    { name: "❓ Question", count: 10 },
    { name: "🙂 Smile", count: 7 },
    { name: "👎 Thumbs Down", count: 4 },
    { name: "😕 Confused", count: 6 },
  ],
  "David Wilson": [
    { name: "👍 Thumbs Up", count: 12 },
    { name: "❤️ Heart", count: 5 },
    { name: "👏 Clapping", count: 8 },
    { name: "🎉 Celebration", count: 3 },
    { name: "😄 Laugh", count: 4 },
    { name: "💡 Idea", count: 6 },
    { name: "❓ Question", count: 14 },
    { name: "🙂 Smile", count: 3 },
    { name: "👎 Thumbs Down", count: 8 },
    { name: "😕 Confused", count: 9 },
  ],
  "Emily Rodriguez": [
    { name: "👍 Thumbs Up", count: 24 },
    { name: "❤️ Heart", count: 20 },
    { name: "👏 Clapping", count: 22 },
    { name: "🎉 Celebration", count: 18 },
    { name: "😄 Laugh", count: 18 },
    { name: "💡 Idea", count: 7 },
    { name: "❓ Question", count: 5 },
    { name: "🙂 Smile", count: 10 },
    { name: "👎 Thumbs Down", count: 1 },
    { name: "😕 Confused", count: 2 },
  ],
  "James Taylor": [
    { name: "👍 Thumbs Up", count: 5 },
    { name: "❤️ Heart", count: 5 },
    { name: "👏 Clapping", count: 3 },
    { name: "🎉 Celebration", count: 4 },
    { name: "😄 Laugh", count: 7 },
    { name: "💡 Idea", count: 2 },
    { name: "❓ Question", count: 4 },
    { name: "🙂 Smile", count: 2 },
    { name: "👎 Thumbs Down", count: 2 },
    { name: "😕 Confused", count: 2 },
  ],
}

// Custom tooltip for charts
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">{payload[0].name}:</div>
          <div className="text-right">{payload[0].value}</div>
        </div>
      </div>
    );
  }
  return null;
}

export function ReactionAnalysis({ data = [], speakerData = {} }: ReactionAnalysisProps) {
  const [loadedData, setLoadedData] = useState<ReactionItem[]>([]);
  const [loadedSpeakerData, setLoadedSpeakerData] = useState<SpeakerReactionData>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real data if no data is provided
  useEffect(() => {
    async function fetchReactionData() {
      try {
        // If data was already provided as props, use that
        if (data && data.length > 0) {
          setLoadedData(data);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        setIsLoading(true);
        const response = await fetch('/api/meetings/zoom-dataset-1/analyze');
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting data');
        }
        
        const responseData = await response.json();
        
        if (responseData.success && 
            responseData.analysis && 
            responseData.analysis.reactions) {
              
          console.log("Fetched reaction data:", responseData.analysis.reactions);
          
          // Load reaction data if available
          if (responseData.analysis.reactions.reactions && 
              Array.isArray(responseData.analysis.reactions.reactions)) {
            setLoadedData(responseData.analysis.reactions.reactions);
          }
          
          // Load speaker reaction data if available
          if (responseData.analysis.reactions.speakerReactions && 
              typeof responseData.analysis.reactions.speakerReactions === 'object') {
            setLoadedSpeakerData(responseData.analysis.reactions.speakerReactions);
          }
        }
      } catch (error) {
        console.error('Error fetching reaction data:', error);
        // Fall back to default data if fetch fails
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReactionData();
  }, [data]);
  
  // Use provided data, loaded data, or default if none available
  const displayData = data.length > 0 
    ? data
    : loadedData.length > 0
      ? loadedData
      : defaultReactionData;
  
  // Use provided speaker data, loaded data, or default if none available
  const displaySpeakerData = Object.keys(speakerData).length > 0 
    ? speakerData 
    : Object.keys(loadedSpeakerData).length > 0
      ? loadedSpeakerData
      : defaultSpeakerReactionData;
  
  // Get available speakers
  const speakers = Object.keys(displaySpeakerData);
  
  // When displaying speaker tabs, render a more informative visualization
  const renderSpeakerTabContent = (speaker: string, reactions: SpeakerReactionItem[]) => {
    // Sort reactions by count (descending)
    const sortedReactions = [...reactions].sort((a, b) => b.count - a.count);
    
    // Calculate total reactions for this speaker
    const totalReactions = sortedReactions.reduce((sum, item) => sum + item.count, 0);
    
    // Find most used reaction 
    const topReaction = sortedReactions.length > 0 ? sortedReactions[0].name : "None";
    
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{speaker}'s Reactions</h3>
            <p className="text-sm text-muted-foreground">
              Total reactions: {totalReactions} | Most used: {topReaction}
            </p>
          </div>
          <div className="aspect-[4/3]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedReactions}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 40,
                  left: 0,
                }}
              >
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} name="Count" />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Reaction Pattern Analysis</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {speaker} most frequently uses {topReaction} reactions, representing {sortedReactions.length > 0 ? Math.round((sortedReactions[0].count / totalReactions) * 100) : 0}% 
            of their total reactions. This indicates a tendency toward {getReactionSentiment(topReaction)} responses.
          </p>
          {totalReactions > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Reaction Distribution</h4>
              <div className="space-y-2">
                {sortedReactions.slice(0, 3).map((reaction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{reaction.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(reaction.count / totalReactions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round((reaction.count / totalReactions) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No reactions recorded for this participant.</p>
          )}
        </div>
      </div>
    );
  };

  // Helper function to describe sentiment
  function getReactionSentiment(reactionName: string): string {
    if (reactionName.includes('Thumbs Up') || 
        reactionName.includes('Heart') || 
        reactionName.includes('Clap') || 
        reactionName.includes('Celebration') || 
        reactionName.includes('Laugh') || 
        reactionName.includes('Smile')) {
      return 'positive';
    } else if (reactionName.includes('Thumbs Down') || 
               reactionName.includes('Confused')) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Reactions Analysis</CardTitle>
          <CardDescription>Analysis of emoji reactions and their sentiment impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Reactions Analysis</CardTitle>
        <CardDescription>Analysis of emoji reactions and their sentiment impact</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="mb-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            {Object.keys(displaySpeakerData).slice(0, 5).map((speaker) => (
              <TabsTrigger key={speaker} value={speaker}>
                {speaker.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overall">
            <div className="space-y-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Reaction Distribution</h3>
                  <p className="text-sm text-muted-foreground">Count of different reactions across all meetings</p>
                </div>
                <div className="aspect-[4/3]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                      data={displayData}
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 40,
                      left: 0,
                    }}
                  >
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} name="Count" />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Reaction Sentiment Impact</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reactions provide immediate feedback on content and delivery. Positive reactions (thumbs up, heart,
                  laugh) correlate with 25% higher engagement. Questions indicate interest but may signal a need for
                  clarification. A high ratio of confused reactions to total reactions is a strong indicator that
                  content needs to be simplified.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Top Reaction Triggers</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <span className="font-medium">👍 Thumbs Up:</span> Clear explanations, practical solutions
                    </li>
                    <li>
                      • <span className="font-medium">❤️ Heart:</span> Personal stories, team recognition
                    </li>
                    <li>
                      • <span className="font-medium">👏 Clapping:</span> Achievements, successful outcomes, impressive
                      results
                    </li>
                    <li>
                      • <span className="font-medium">🎉 Celebration:</span> Major milestones, exceeding targets,
                      project completions
                    </li>
                    <li>
                      • <span className="font-medium">😄 Laugh:</span> Appropriate humor, relatable examples
                    </li>
                    <li>
                      • <span className="font-medium">💡 Idea:</span> Innovative suggestions, creative approaches
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Negative Reaction Triggers</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <span className="font-medium">👎 Thumbs Down:</span> Perceived criticism, unrealistic
                      expectations
                    </li>
                    <li>
                      • <span className="font-medium">😕 Confused:</span> Complex jargon, unclear explanations
                    </li>
                    <li>
                      • <span className="font-medium">❓ Question (excessive):</span> Lack of preparation, ambiguous
                      direction
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Render participant-specific tabs */}
          {Object.keys(displaySpeakerData).map((speaker) => (
            <TabsContent key={speaker} value={speaker}>
              {renderSpeakerTabContent(speaker, displaySpeakerData[speaker])}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

