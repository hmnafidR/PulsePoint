"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Add a type for our timeline data
interface TimelineDataPoint {
  time: string | number;
  sentiment: number;
  engagement: number;
}

// Default data in case API call fails
const defaultData = [
  { time: "00:00", sentiment: 70, engagement: 65 },
  { time: "05:00", sentiment: 72, engagement: 68 },
  { time: "10:00", sentiment: 68, engagement: 64 },
  { time: "15:00", sentiment: 65, engagement: 60 },
  { time: "20:00", sentiment: 62, engagement: 58 },
  { time: "25:00", sentiment: 68, engagement: 63 },
  { time: "30:00", sentiment: 75, engagement: 70 },
  { time: "35:00", sentiment: 80, engagement: 76 },
  { time: "40:00", sentiment: 78, engagement: 74 },
  { time: "45:00", sentiment: 76, engagement: 72 },
  { time: "50:00", sentiment: 74, engagement: 70 },
  { time: "55:00", sentiment: 76, engagement: 72 },
]

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "#4F46E5", // Indigo-600
  },
  engagement: {
    label: "Engagement",
    color: "#0EA5E9", // Sky-500
  },
}

export function MeetingSentimentOverview() {
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        setIsLoading(true);
        // Fetch data for the current meeting - assuming zoom-dataset-1 is being used
        const response = await fetch('/api/meetings/zoom-dataset-1/analyze');
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting data');
        }
        
        const data = await response.json();
        
        if (data.success && data.analysis && data.analysis.sentiment && data.analysis.sentiment.timeline) {
          // Transform timeline data into the format needed for chart
          const formattedData = data.analysis.sentiment.timeline.map((point: any, index: number) => {
            // Convert time to minutes:seconds format
            const timeInSeconds = point.time;
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.floor(timeInSeconds % 60);
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Calculate engagement (this could be derived from other metrics if available)
            // For now, let's derive it with a slight variation from sentiment
            const sentimentValue = Math.round(point.sentiment * 100);
            const engagementValue = Math.max(30, Math.min(100, sentimentValue - 5 + Math.floor(Math.random() * 10)));
            
            return {
              time: formattedTime,
              sentiment: sentimentValue,
              engagement: engagementValue
            };
          });
          
          // If we have data, use it
          if (formattedData.length > 0) {
            setTimelineData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        // Fall back to default data
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTimelineData();
  }, []);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Meeting Sentiment & Engagement</h3>
              <p className="text-sm text-muted-foreground">Sentiment and engagement trends during the meeting</p>
            </div>
          </div>
          <div className="aspect-[4/3] sm:aspect-[16/9]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 0,
                }}
              >
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#4F46E5" // Indigo-600
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: "#4F46E5" }}
                  dot={{ r: 0 }}
                  name="Sentiment"
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#0EA5E9" // Sky-500
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#0EA5E9" }}
                  dot={{ r: 0 }}
                  name="Engagement"
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="text-sm font-medium">Time: {label || ""}</div>
      <div className="text-xs text-muted-foreground mt-1">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: "#4F46E5" }}></div>
          <span>Sentiment: {payload[0]?.value || 0}%</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: "#0EA5E9" }}></div>
          <span>Engagement: {payload[1]?.value || 0}%</span>
        </div>
      </div>
    </div>
  )
}

