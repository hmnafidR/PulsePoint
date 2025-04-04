"use client"

import { useEffect, useState } from "react"
import { Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LiveSentimentAnalysisProps {
  isLive?: boolean
}

export function LiveSentimentAnalysis({ isLive = false }: LiveSentimentAnalysisProps) {
  const [sentiment, setSentiment] = useState(75)
  const [trend, setTrend] = useState("stable")

  useEffect(() => {
    if (!isLive) return

    // Simulate sentiment changes for demo
    const interval = setInterval(() => {
      setSentiment((prev) => {
        // Random walk algorithm to simulate real-time changes
        const change = Math.random() * 4 - 2 // -2 to +2
        const newValue = Math.max(0, Math.min(100, prev + change))
        
        // Update trend
        if (change > 0.5) setTrend("rising")
        else if (change < -0.5) setTrend("falling")
        else setTrend("stable")
        
        return newValue
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  // Determine the sentiment color and label
  const getSentimentColor = () => {
    if (sentiment >= 80) return "bg-green-500"
    if (sentiment >= 60) return "bg-blue-500"
    if (sentiment >= 40) return "bg-yellow-500"
    if (sentiment >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  const getSentimentLabel = () => {
    if (sentiment >= 80) return "Very Positive"
    if (sentiment >= 60) return "Positive"
    if (sentiment >= 40) return "Neutral"
    if (sentiment >= 20) return "Negative"
    return "Very Negative"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{sentiment.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">{getSentimentLabel()}</div>
        </div>
        <div className="flex items-center">
          {isLive && (
            <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse mr-2" />
          )}
          <span className="text-sm font-medium">
            {isLive ? "Live" : "Static"}
          </span>
        </div>
      </div>
      
      <Progress value={sentiment} className="h-2" />
      
      <div className="flex items-center justify-between text-sm">
        <span className={trend === "rising" ? "text-green-500" : trend === "falling" ? "text-red-500" : ""}>
          {trend === "rising" ? "↑ Rising" : trend === "falling" ? "↓ Falling" : "→ Stable"}
        </span>
        <span className="text-muted-foreground">
          {isLive ? "Updated just now" : "Last updated 5m ago"}
        </span>
      </div>
    </div>
  )
}

