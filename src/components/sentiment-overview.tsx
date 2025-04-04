"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    date: "Jan",
    "Survey Sentiment": 65,
    "Meeting Sentiment": 68,
  },
  {
    date: "Feb",
    "Survey Sentiment": 68,
    "Meeting Sentiment": 72,
  },
  {
    date: "Mar",
    "Survey Sentiment": 70,
    "Meeting Sentiment": 69,
  },
  {
    date: "Apr",
    "Survey Sentiment": 72,
    "Meeting Sentiment": 70,
  },
  {
    date: "May",
    "Survey Sentiment": 68,
    "Meeting Sentiment": 74,
  },
  {
    date: "Jun",
    "Survey Sentiment": 72,
    "Meeting Sentiment": 76,
  },
  {
    date: "Jul",
    "Survey Sentiment": 76,
    "Meeting Sentiment": 74,
  },
  {
    date: "Aug",
    "Survey Sentiment": 78,
    "Meeting Sentiment": 76,
  },
  {
    date: "Sep",
    "Survey Sentiment": 76,
    "Meeting Sentiment": 78,
  },
  {
    date: "Oct",
    "Survey Sentiment": 74,
    "Meeting Sentiment": 76,
  },
  {
    date: "Nov",
    "Survey Sentiment": 76,
    "Meeting Sentiment": 74,
  },
  {
    date: "Dec",
    "Survey Sentiment": 78,
    "Meeting Sentiment": 76,
  },
]

const chartConfig = {
  "Survey Sentiment": {
    label: "Survey Sentiment",
    color: "#8884d8",
  },
  "Meeting Sentiment": {
    label: "Meeting Sentiment",
    color: "#82ca9d",
  },
}

export function SentimentOverview() {
  return (
    <Card className="p-4">
      <ChartContainer
        className="aspect-[4/3] sm:aspect-[16/9]"
        title="Sentiment Overview"
        description="Sentiment trends across surveys and meetings"
        config={chartConfig}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Survey Sentiment"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              activeDot={{ r: 8 }}
              name="Survey Sentiment"
            />
            <Area
              type="monotone"
              dataKey="Meeting Sentiment"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              activeDot={{ r: 8 }}
              name="Meeting Sentiment"
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
          </AreaChart>
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
      label: "Survey Sentiment",
      value: `${payload[0]?.value || 0}%`,
      color: "#8884d8",
    },
    {
      label: "Meeting Sentiment",
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

