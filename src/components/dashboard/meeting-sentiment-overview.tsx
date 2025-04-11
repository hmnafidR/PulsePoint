"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    label: "Overall Sentiment",
    color: "#4F46E5", // Indigo-600
  },
  engagement: {
    label: "Average Engagement",
    color: "#0EA5E9", // Sky-500
  },
}

// Define the expected structure for the data prop
interface SentimentTimelineItem {
  timestamp: number | string; // Or the appropriate type for your timestamps
  sentiment: number; // Assuming 0-1 range
}

interface MeetingSentimentOverviewProps {
  data?: { // Make data optional in case it's loading
    timeline?: SentimentTimelineItem[];
  };
}

// Helper to format timestamp (adjust as needed)
const formatTimestamp = (timestamp: number | string) => {
  // Assuming timestamp is seconds from start or a comparable numeric value
  if (typeof timestamp === 'number') {
      const minutes = Math.floor(timestamp / 60);
      const seconds = Math.floor(timestamp % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  // Add formatting for other types if necessary
  return String(timestamp);
};

export function MeetingSentimentOverview({ data }: MeetingSentimentOverviewProps) {
  const [chartData, setChartData] = useState<any[]>([]); // State to hold formatted data for chart
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Process the data prop when it's available
    if (data && data.timeline && data.timeline.length > 0) {
      console.log("[MeetingSentimentOverview] Processing timeline data:", data.timeline);
      setIsLoading(true); // Show loading while processing

      try {
        // Sort timeline by timestamp to ensure correct ordering
        const sortedTimeline = [...data.timeline].sort((a, b) => {
          const timeA = typeof a.timestamp === 'string' ? parseFloat(a.timestamp) : a.timestamp;
          const timeB = typeof b.timestamp === 'string' ? parseFloat(b.timestamp) : b.timestamp;
          return timeA - timeB;
        });

        // Find min and max timestamps to determine range
        const minTime = sortedTimeline[0].timestamp;
        const maxTime = sortedTimeline[sortedTimeline.length - 1].timestamp;
        
        // Ensure we have enough data points for a smooth line
        const intervalMinutes = 15; // 15-minute intervals
        const intervalSeconds = intervalMinutes * 60;
        
        // Create a map of all expected intervals
        const formattedData: Array<{
          timestamp: string;
          sentiment: number;
          engagement: number;
        }> = [];
        let minTimeNum = typeof minTime === 'string' ? parseFloat(minTime) : minTime;
        let maxTimeNum = typeof maxTime === 'string' ? parseFloat(maxTime) : maxTime;
        
        // Create data points for each interval
        for (let i = 0; i <= Math.ceil((maxTimeNum - minTimeNum) / intervalSeconds); i++) {
          const intervalStart = minTimeNum + (i * intervalSeconds);
          const intervalEnd = intervalStart + intervalSeconds;
          const intervalLabel = `${Math.floor(intervalStart / 60)} min`;
          
          // Find items in this interval
          const itemsInInterval = sortedTimeline.filter(item => {
            const itemTime = typeof item.timestamp === 'string' ? parseFloat(item.timestamp) : item.timestamp;
            return itemTime >= intervalStart && itemTime < intervalEnd;
          });
          
          // Calculate average sentiment for the interval
          let sentimentSum = 0;
          let engagementSum = 0;
          
          itemsInInterval.forEach(item => {
            sentimentSum += item.sentiment || 0;
            // Use sentiment as a fallback for engagement
            engagementSum += (item as any).engagement || item.sentiment || 0;
          });
          
          const sentimentAvg = itemsInInterval.length > 0 
            ? Math.round((sentimentSum / itemsInInterval.length) * 100) 
            : null;
            
          const engagementAvg = itemsInInterval.length > 0 
            ? Math.round((engagementSum / itemsInInterval.length) * 100) 
            : null;
          
          // Add data point even if there's no data (to ensure continuous line)
          formattedData.push({
            timestamp: intervalLabel,
            sentiment: sentimentAvg !== null ? sentimentAvg : (formattedData.length > 0 ? formattedData[formattedData.length-1].sentiment : 50),
            engagement: engagementAvg !== null ? engagementAvg : (formattedData.length > 0 ? formattedData[formattedData.length-1].engagement : 50)
          });
        }
        
        console.log("[MeetingSentimentOverview] Formatted data:", formattedData);
        setChartData(formattedData);
      } catch (error) {
        console.error("Error processing timeline data:", error);
        // Use default data on error
        setChartData(defaultData);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle case where no data is provided or timeline is empty
      console.log("No sentiment timeline data provided to MeetingSentimentOverview.");
      setChartData(defaultData); // Use default data instead of empty array
      setIsLoading(false); // Stop loading if no data
    }    
  }, [data]); // Rerun effect when data prop changes

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!chartData || chartData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No sentiment data available to display chart.
        </div>
      );
  }

  return (
    <div className="h-[300px] bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 0 }} >
          <YAxis 
            tickLine={true}
            axisLine={true}
            tickMargin={10}
            width={40}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <XAxis 
            dataKey="timestamp" 
            tickLine={false} 
            axisLine={true}
            tickMargin={10} 
          />
          {/* Add CartesianGrid for better readability */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          TIME
                        </span>
                        <span className="font-bold">
                          {payload[0].payload.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          SENTIMENT
                        </span>
                        <span className="font-bold text-green-600">
                          {payload[0].value}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          ENGAGEMENT
                        </span>
                        <span className="font-bold text-blue-600">
                          {payload[1]?.value || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotoneX" 
            dataKey="sentiment" 
            strokeWidth={3}
            stroke="#22c55e" // Brighter green
            dot={{ r: 4, strokeWidth: 1, fill: "#22c55e", stroke: "#22c55e" }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={500}
            name="Sentiment"
          />
          {/* Add Line for Engagement */}
          <Line 
            type="monotoneX" 
            dataKey="engagement"
            stroke="#2563eb" // Brighter blue
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 1, fill: "#2563eb", stroke: "#2563eb" }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={500}
            name="Engagement"
          />
          {/* Add Legend */}
          <Legend iconType="circle" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
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
          <span>Overall Sentiment: {payload[0]?.value || 0}%</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: "#0EA5E9" }}></div>
          <span>Average Engagement: {payload[1]?.value || 0}%</span>
        </div>
      </div>
    </div>
  )
}

