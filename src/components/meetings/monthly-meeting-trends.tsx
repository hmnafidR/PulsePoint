"use client"

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Monthly meeting statistics
const monthlyStats = [
  { month: "Jan", meetings: 42, avgSentiment: 72, avgEngagement: 68 },
  { month: "Feb", meetings: 38, avgSentiment: 74, avgEngagement: 70 },
  { month: "Mar", meetings: 45, avgSentiment: 76, avgEngagement: 72 },
  { month: "Apr", meetings: 36, avgSentiment: 70, avgEngagement: 65 },
  { month: "May", meetings: 40, avgSentiment: 75, avgEngagement: 69 },
  { month: "Jun", meetings: 44, avgSentiment: 78, avgEngagement: 74 },
]

const meetingsChartConfig = {
  meetings: {
    label: "Meetings",
    color: "#4F46E5", // Indigo-600
  },
}

const sentimentChartConfig = {
  avgSentiment: {
    label: "Average Sentiment",
    color: "#0EA5E9", // Sky-500
  },
  avgEngagement: {
    label: "Average Engagement",
    color: "#10B981", // Emerald-500
  },
}

export function MonthlyMeetingTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Meeting Trends</CardTitle>
        <CardDescription>Meeting statistics over the past 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meetings">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="meetings">Number of Meetings</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment & Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings">
            <div className="h-[350px]">
              <ChartContainer className="h-full" config={meetingsChartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <Tooltip content={<MeetingsTooltip />} />
                    <Bar
                      dataKey="meetings"
                      fill="var(--color-meetings)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      name="Meetings"
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="sentiment">
            <div className="h-[350px]">
              <ChartContainer className="h-full" config={sentimentChartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <Tooltip content={<SentimentTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avgSentiment"
                      stroke="var(--color-avgSentiment)"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Average Sentiment"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgEngagement"
                      stroke="var(--color-avgEngagement)"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Average Engagement"
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function MeetingsTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const content = [
    {
      label: "Meetings",
      value: payload[0]?.value || 0,
      color: "#4F46E5", // Indigo-600
    },
  ]

  return (
    <ChartTooltip>
      <ChartTooltipContent title={`${label} 2025`} content={content} />
    </ChartTooltip>
  )
}

function SentimentTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const content = [
    {
      label: "Sentiment",
      value: `${payload[0]?.value || 0}%`,
      color: "#0EA5E9", // Sky-500
    },
    {
      label: "Engagement",
      value: `${payload[1]?.value || 0}%`,
      color: "#10B981", // Emerald-500
    },
  ]

  return (
    <ChartTooltip>
      <ChartTooltipContent title={`${label} 2025`} content={content} />
    </ChartTooltip>
  )
}

