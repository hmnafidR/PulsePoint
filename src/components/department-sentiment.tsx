"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    department: "Engineering",
    sentiment: 72,
  },
  {
    department: "Sales",
    sentiment: 68,
  },
  {
    department: "Marketing",
    sentiment: 82,
  },
  {
    department: "HR",
    sentiment: 86,
  },
  {
    department: "Finance",
    sentiment: 74,
  },
  {
    department: "Product",
    sentiment: 78,
  },
  {
    department: "Customer Support",
    sentiment: 76,
  },
]

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "#8884d8",
  },
}

export function DepartmentSentiment() {
  return (
    <Card className="p-4">
      <ChartContainer
        className="aspect-[4/3]"
        title="Department Sentiment"
        description="Sentiment by department"
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
          >
            <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sentiment" fill="#8884d8" radius={[4, 4, 0, 0]} name="Sentiment" />
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

