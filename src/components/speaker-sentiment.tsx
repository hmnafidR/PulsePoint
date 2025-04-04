"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    name: "Sarah Johnson",
    sentiment: 82,
    engagement: 78,
  },
  {
    name: "Michael Chen",
    sentiment: 76,
    engagement: 72,
  },
  {
    name: "David Wilson",
    sentiment: 68,
    engagement: 64,
  },
  {
    name: "Emily Rodriguez",
    sentiment: 84,
    engagement: 80,
  },
  {
    name: "James Taylor",
    sentiment: 72,
    engagement: 68,
  },
]

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "#8884d8",
  },
  engagement: {
    label: "Engagement",
    color: "#82ca9d",
  },
}

export function SpeakerSentiment() {
  return (
    <Card className="p-4">
      <ChartContainer
        className="aspect-[4/3]"
        title="Speaker Sentiment"
        description="Audience reactions by speaker"
        config={chartConfig}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 40,
              left: 0,
            }}
            layout="vertical"
          >
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sentiment" fill="#8884d8" name="Sentiment" />
            <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const content = [
    {
      label: payload[0]?.name || "Sentiment",
      value: `${payload[0]?.value || 0}%`,
      color: "#8884d8",
    },
    {
      label: payload[1]?.name || "Engagement",
      value: `${payload[1]?.value || 0}%`,
      color: "#82ca9d",
    },
  ]

  return (
    <ChartTooltip>
      <ChartTooltipContent title={label || ""} content={content} />
    </ChartTooltip>
  )
}

