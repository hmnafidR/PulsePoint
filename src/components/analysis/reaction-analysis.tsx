"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { ThumbsUp, ThumbsDown, Heart, Laugh, Lightbulb, HelpCircle, Smile, Frown } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types consistent with page.tsx state
interface ReactionItem {
  name: string;
  count: number;
  sentiment?: number; // Optional as per page.tsx state
}

// Interface from page.tsx for speakerReactions state
// Ensure this matches the structure provided by chat_parser/analysis_pipeline
interface SpeakerReactionData {
  [speaker: string]: { name: string; count: number }[];
}

interface ReactionAnalysisProps {
  reactions?: ReactionItem[]; // Accept reactions data
  speakerReactions?: SpeakerReactionData; // Accept speaker reactions data
  isLoading?: boolean;
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

export function ReactionAnalysis({ 
    reactions = [], 
    speakerReactions = {}, 
    isLoading = false 
}: ReactionAnalysisProps) {
  const [displayMode, setDisplayMode] = useState<"overall" | "bySpeaker">("overall")
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
      console.log("[ReactionAnalysis] Received props:", { reactions, speakerReactions, isLoading });
      // Process data when props change
      if (isLoading) return; // Don't process if parent indicates loading
      
      if (displayMode === "overall") {
          // Format reactions for the overall chart
          const formatted = reactions
              .sort((a, b) => b.count - a.count) // Sort by count desc
              .slice(0, 10); // Limit to top 10 reactions for clarity
          console.log("[ReactionAnalysis] Setting chartData (Overall):", formatted); // Log data being set
          setChartData(formatted);
      } else {
          // Format speaker reactions for the by-speaker chart
          // Aggregate total reactions per speaker
          const speakerTotals = Object.entries(speakerReactions).map(([speaker, speakerData]) => ({
              name: speaker,
              totalReactions: speakerData.reduce((sum, reaction) => sum + reaction.count, 0)
          }));
          const formatted = speakerTotals
              .sort((a, b) => b.totalReactions - a.totalReactions)
              .slice(0, 10); // Limit to top 10 reacting speakers
          setChartData(formatted);
      }
  // Rerun when props or display mode change
  }, [reactions, speakerReactions, isLoading, displayMode]);

  // Get available speakers
  const speakers = Object.keys(speakerReactions);

  // Check if there's any data to display
  const hasOverallData = reactions.length > 0;
  const hasSpeakerData = speakers.length > 0;

  // Determine default tab
  const defaultTab = hasOverallData ? "overall" : (speakers[0] || "");

  // When displaying speaker tabs, render a more informative visualization
  const renderSpeakerTabContent = (speaker: string, reactions: { name: string; count: number }[]) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Reactions Analysis</CardTitle>
        <CardDescription>Analysis of emoji reactions and their sentiment impact</CardDescription>
      </CardHeader>
      <CardContent>
        {(!hasOverallData && !hasSpeakerData) ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No reaction data available.</p>
          </div>
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-4">
              {/* Conditionally render Overall tab trigger */} 
              {hasOverallData && <TabsTrigger value="overall">Overall</TabsTrigger>}
              {/* Conditionally render speaker tab triggers */} 
              {speakers.slice(0, 5).map((speaker) => (
                <TabsTrigger key={speaker} value={speaker}>
                  {speaker.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Conditionally render Overall tab content */} 
            {hasOverallData && (
              <TabsContent value="overall">
                <div className="space-y-6">
                  <div> {/* Distribution container */} 
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Reaction Distribution</h3>
                      <p className="text-sm text-muted-foreground">Count of different reactions across the meeting</p>
                    </div>
                    <div className="aspect-[4/3]"> {/* Chart container */} 
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
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
                          <Bar 
                            dataKey={displayMode === 'overall' ? "count" : "totalReactions"} 
                            fill="#8884d8" 
                            radius={[4, 4, 0, 0]}
                          />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4"> {/* Sentiment impact */} 
                    <h3 className="font-semibold">Reaction Sentiment Impact</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Reactions provide immediate feedback on content and delivery. Positive reactions (thumbs up, heart,
                      laugh) correlate with 25% higher engagement. Questions indicate interest but may signal a need for
                      clarification. A high ratio of confused reactions to total reactions is a strong indicator that
                      content needs to be simplified.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2"> {/* Triggers */} 
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
                          • <span className="font-medium">�� Thumbs Down:</span> Perceived criticism, unrealistic
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
            )}

            {/* Render speaker tabs content */} 
            {speakers.map((speaker) => (
              <TabsContent key={speaker} value={speaker}>
                {renderSpeakerTabContent(speaker, speakerReactions[speaker] || [])}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

