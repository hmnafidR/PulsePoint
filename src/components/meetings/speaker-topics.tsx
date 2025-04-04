"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Updated colors to match the theme
const COLORS = ["#4F46E5", "#0EA5E9", "#6366F1", "#818CF8", "#38BDF8"]

const sarahData = [
  { name: "Marketing Strategy", value: 45 },
  { name: "Social Media", value: 25 },
  { name: "Digital Campaigns", value: 20 },
  { name: "Brand Awareness", value: 10 },
]

const michaelData = [
  { name: "Sales Figures", value: 40 },
  { name: "Customer Acquisition", value: 30 },
  { name: "Revenue Growth", value: 20 },
  { name: "Market Share", value: 10 },
]

const davidData = [
  { name: "Resource Allocation", value: 35 },
  { name: "Product Launch", value: 30 },
  { name: "Timeline Concerns", value: 25 },
  { name: "Budget Constraints", value: 10 },
]

const emilyData = [
  { name: "Customer Onboarding", value: 50 },
  { name: "User Experience", value: 25 },
  { name: "Retention Strategies", value: 15 },
  { name: "Feedback Implementation", value: 10 },
]

const jamesData = [
  { name: "Action Items", value: 40 },
  { name: "Team Responsibilities", value: 30 },
  { name: "Follow-up Plans", value: 20 },
  { name: "Project Timeline", value: 10 },
]

const chartConfig = {
  topics: {
    label: "Topics",
    color: "#4F46E5", // Indigo-600
  },
}

export function SpeakerTopics() {
  return (
    <Card className="p-4">
      <Tabs defaultValue="sarah">
        <TabsList className="mb-4 grid grid-cols-5">
          <TabsTrigger value="sarah">Sarah</TabsTrigger>
          <TabsTrigger value="michael">Michael</TabsTrigger>
          <TabsTrigger value="david">David</TabsTrigger>
          <TabsTrigger value="emily">Emily</TabsTrigger>
          <TabsTrigger value="james">James</TabsTrigger>
        </TabsList>
        <TabsContent value="sarah">
          <TopicPieChart data={sarahData} speaker="Sarah Johnson" />
        </TabsContent>
        <TabsContent value="michael">
          <TopicPieChart data={michaelData} speaker="Michael Chen" />
        </TabsContent>
        <TabsContent value="david">
          <TopicPieChart data={davidData} speaker="David Wilson" />
        </TabsContent>
        <TabsContent value="emily">
          <TopicPieChart data={emilyData} speaker="Emily Rodriguez" />
        </TabsContent>
        <TabsContent value="james">
          <TopicPieChart data={jamesData} speaker="James Taylor" />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

interface TopicPieChartProps {
  data: Array<{ name: string; value: number }>
  speaker: string
}

function TopicPieChart({ data, speaker }: TopicPieChartProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{speaker}'s Discussion Topics</p>
      <ChartContainer className="aspect-[4/3]" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#4F46E5" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: 20 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const name = payload[0]?.name || ""
  const value = payload[0]?.value || 0
  const fill = payload[0]?.payload?.fill || "#4F46E5"

  const content = [
    {
      label: "Mentions",
      value: `${value}%`,
      color: fill,
    },
  ]

  return (
    <ChartTooltip>
      <ChartTooltipContent title={name} content={content} />
    </ChartTooltip>
  )
}

