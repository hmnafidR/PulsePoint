"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

// Interface for the chart data
interface ChartReactionItem {
  name: string;
  count: number;
}

// For the structure within reaction_types in JSON
interface ReactionTypeDetail {
    count: number;
    percentage?: number;
}

// Overall structure expected from the API (simplified)
interface ReactionsFileStructure {
    reaction_types?: { [key: string]: ReactionTypeDetail };
}

// Props for the component
interface StaticReactionChartProps {
  meetingDirectoryId: string | null;
}

// Custom tooltip 
function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">{payload[0].payload?.name}:</div>
            <div className="text-right">{payload[0].value}</div> 
          </div>
        </div>
      );
    }
    return null;
  }

export function StaticReactionAnalysisChart({ meetingDirectoryId }: StaticReactionChartProps) {
  const [chartData, setChartData] = useState<ChartReactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial state: No ID provided
    if (!meetingDirectoryId) {
        setChartData([]);
        // Set error to null for the initial state
        setError(null); 
        setIsLoading(false);
        console.log("[StaticChart] No meetingDirectoryId provided.");
        return;
    }

    // Fetch and process data when ID is provided
    async function fetchAndProcessReactionData() {
      setIsLoading(true);
      setError(null);
      setChartData([]);
      console.log(`[StaticChart] Fetching reactions for directory: ${meetingDirectoryId}`);
      
      try {
        const response = await fetch(`/api/static-reactions/${meetingDirectoryId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP error: ${response.status}` }));
          throw new Error(errorData.error || `Failed to fetch static reactions: ${response.status}`);
        }
        
        const rawData: ReactionsFileStructure = await response.json(); 

        // Process ONLY overall reactions
        let transformedOverallData: ChartReactionItem[] = [];
        if (rawData?.reaction_types && typeof rawData.reaction_types === 'object') {
            transformedOverallData = Object.entries(rawData.reaction_types).map(([name, details]) => ({ name, count: details.count }));
            // Check if data was actually transformed
             if(transformedOverallData.length === 0) {
                console.warn("[StaticChart] 'reaction_types' object was empty.");
                setError("No reaction data found in the file.");
             }
        } else {
            console.warn("[StaticChart] Received data lacks valid 'reaction_types'.");
            setError("No valid reaction data (reaction_types) found in the file.");
        }
        setChartData(transformedOverallData);
        
      } catch (err) { 
        // Handle actual fetch/parse errors
        console.error('[StaticChart] Error fetching or processing reaction data:', err);
        setError(err instanceof Error ? err.message : String(err));
        toast.error("Could not load reaction chart data.");
        setChartData([]); 
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAndProcessReactionData();
  }, [meetingDirectoryId]);

  // Simplified check for data presence
  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Reactions Analysis (Static)</CardTitle> 
        <CardDescription>Overall reaction counts from the dataset</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]"> 
        <div> 
             {/* 1. Check for initial state (no ID) */}
             {!meetingDirectoryId ? (
                 <div className="flex items-center justify-center h-60">
                    <p className="text-muted-foreground text-center font-medium">Please select a Dataset <br/> to analyze the reactions.</p>
                 </div>
             /* 2. Check for loading state */
             ) : isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
             /* 3. Check for actual errors during fetch/process */
             ) : error ? (
                <div className="flex items-center justify-center h-60">
                    <p className="text-destructive text-center font-medium">Error loading chart data: <br/> <span className="font-normal text-sm">{error}</span></p>
                </div>
             /* 4. Check if data fetch succeeded but no data was found/processed */
             ) : !hasData ? (
                <div className="flex items-center justify-center h-60">
                    <p className="text-muted-foreground text-center font-medium">No reaction data found or processed <br/> for the selected dataset.</p>
                </div>
             /* 5. Render Chart if data is valid */
             ) : ( 
                <div className="aspect-[4/3]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 0 }}>
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} name="Count" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
} 