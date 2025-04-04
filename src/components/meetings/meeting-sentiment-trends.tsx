"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { name: 'Mar 1', sentiment: 72, engagement: 65 },
  { name: 'Mar 5', sentiment: 68, engagement: 59 },
  { name: 'Mar 8', sentiment: 74, engagement: 68 },
  { name: 'Mar 12', sentiment: 80, engagement: 72 },
  { name: 'Mar 15', sentiment: 85, engagement: 78 },
  { name: 'Mar 19', sentiment: 82, engagement: 75 },
  { name: 'Mar 22', sentiment: 76, engagement: 70 },
]

export function MeetingSentimentTrends() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} />
          <YAxis stroke="#888888" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4, fill: '#4f46e5' }}
            activeDot={{ r: 6 }}
            name="Sentiment"
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 4, fill: '#06b6d4' }}
            activeDot={{ r: 6 }}
            name="Engagement"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

