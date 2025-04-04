"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    date: "Jan",
    sentiment: 65,
  },
  {
    date: "Feb",
    sentiment: 68,
  },
  {
    date: "Mar",
    sentiment: 70,
  },
  {
    date: "Apr",
    sentiment: 72,
  },
  {
    date: "May",
    sentiment: 68,
  },
  {
    date: "Jun",
    sentiment: 72,
  },
  {
    date: "Jul",
    sentiment: 76,
  },
  {
    date: "Aug",
    sentiment: 78,
  },
  {
    date: "Sep",
    sentiment: 76,
  },
  {
    date: "Oct",
    sentiment: 74,
  },
  {
    date: "Nov",
    sentiment: 76,
  },
  {
    date: "Dec",
    sentiment: 78,
  },
]

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "#8884d8",
  },
}

export function SentimentTrends() {
  return (
    <Card className="p-4">
      <ChartContainer
        className="aspect-[4/3]"
        title="Sentiment Trends"
        description="Historical sentiment data"
        config={chartConfig}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 0,
            }}
          >
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Sentiment"
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
          </LineChart>
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
      label: "Sentiment",
      value: `${payload[0]?.value || 0}%`,
      color: "#8884d8",
    },
  ]

  return (
    <ChartTooltip>
      <ChartTooltipContent title={label || ""} content={content} />
    </ChartTooltip>
  )
}

