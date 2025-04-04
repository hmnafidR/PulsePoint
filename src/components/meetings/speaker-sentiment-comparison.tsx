"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    name: "Sarah Johnson",
    sentiment: 82,
    previousSentiment: 78,
  },
  {
    name: "Michael Chen",
    sentiment: 76,
    previousSentiment: 80,
  },
  {
    name: "David Wilson",
    sentiment: 68,
    previousSentiment: 72,
  },
  {
    name: "Emily Rodriguez",
    sentiment: 84,
    previousSentiment: 79,
  },
  {
    name: "James Taylor",
    sentiment: 72,
    previousSentiment: 74,
  },
]

const chartConfig = {
  sentiment: {
    label: "Current Sentiment",
    color: "#4F46E5", // Indigo-600
  },
  previousSentiment: {
    label: "Previous Sentiment",
    color: "#0EA5E9", // Sky-500
  },
}

export function SpeakerSentimentComparison() {
  return (
    <Card className="p-4">
      <ChartContainer
        className="aspect-[4/3]"
        title="Speaker Sentiment"
        description="Current vs previous sentiment by speaker"
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
            <Bar dataKey="previousSentiment" fill="#0EA5E9" name="Previous" />
            <Bar dataKey="sentiment" fill="#4F46E5" name="Current" />
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
      label: "Previous Sentiment",
      value: `${payload[0]?.value || 0}%`,
      color: "#0EA5E9", // Sky-500
    },
    {
      label: "Current Sentiment",
      value: `${payload[1]?.value || 0}%`,
      color: "#4F46E5", // Indigo-600
    },
  ]

  const difference = ((payload[1]?.value || 0) - (payload[0]?.value || 0)).toFixed(1)
  const isPositive = Number.parseFloat(difference) >= 0

  return (
    <ChartTooltip>
      <ChartTooltipContent title={label || ""} content={content} />
      <div className="mt-2 text-xs">
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {isPositive ? "+" : ""}
          {difference}% from previous
        </span>
      </div>
    </ChartTooltip>
  )
}

