"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TranscriptEntry {
  id: number
  speaker: string
  text: string
  timestamp: string
  sentiment: number
}

export function LiveTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: 1,
      speaker: "Sarah Johnson",
      text: "Good morning everyone. Today we'll be discussing our Q3 marketing strategy, with a focus on digital campaigns and social media presence.",
      timestamp: "00:00:15",
      sentiment: 82,
    },
    {
      id: 2,
      speaker: "Michael Chen",
      text: "Thanks Sarah. Before we dive into that, I'd like to share some exciting news about our sales figures. We've seen a 15% increase in new customer acquisition this quarter.",
      timestamp: "00:01:30",
      sentiment: 88,
    },
    {
      id: 3,
      speaker: "Sarah Johnson",
      text: "That's great news, Michael! This will definitely inform our marketing approach for Q3.",
      timestamp: "00:02:10",
      sentiment: 85,
    },
    {
      id: 4,
      speaker: "David Wilson",
      text: "I'm concerned about resource allocation for the upcoming product launch. We're spreading ourselves too thin across too many initiatives.",
      timestamp: "00:03:45",
      sentiment: 62,
    },
    {
      id: 5,
      speaker: "Emily Rodriguez",
      text: "I understand your concerns, David. I've been working on a new approach to customer onboarding that might help us focus our resources more effectively.",
      timestamp: "00:04:30",
      sentiment: 76,
    },
    {
      id: 6,
      speaker: "David Wilson",
      text: "I appreciate that, Emily, but we need to reconsider our approach to resource allocation for the upcoming product launch. The current timeline doesn't seem realistic given our constraints.",
      timestamp: "00:05:15",
      sentiment: 58,
    },
  ])

  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Simulate new transcript entries being added
  useEffect(() => {
    const newEntries = [
      {
        id: 7,
        speaker: "Emily Rodriguez",
        text: "Let me share my screen to show you the new customer onboarding flow we've designed. I think this will address some of your concerns about resource allocation.",
        timestamp: "00:06:00",
        sentiment: 84,
      },
      {
        id: 8,
        speaker: "Sarah Johnson",
        text: "This looks really promising, Emily. How does this tie into our digital marketing campaigns?",
        timestamp: "00:07:30",
        sentiment: 80,
      },
      {
        id: 9,
        speaker: "Michael Chen",
        text: "I can see how this would improve our conversion rates. Our sales team has been asking for a more streamlined onboarding process.",
        timestamp: "00:08:15",
        sentiment: 82,
      },
      {
        id: 10,
        speaker: "James Taylor",
        text: "Let's make sure we document these action items and assign responsibilities before we wrap up.",
        timestamp: "00:09:00",
        sentiment: 75,
      },
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < newEntries.length) {
        setTranscript((prev) => [...prev, newEntries[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (isAutoScrolling && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [transcript, isAutoScrolling])

  // Get sentiment color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 75) return "text-green-500"
    if (sentiment >= 50) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="relative h-[400px]">
      <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {transcript.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{entry.speaker}</span>
                  <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                </div>
                <span className={`text-sm ${getSentimentColor(entry.sentiment)}`}>Sentiment: {entry.sentiment}%</span>
              </div>
              <p className="mt-2 text-sm">{entry.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className="flex items-center gap-1"
        >
          <ArrowDown className="h-4 w-4" />
          {isAutoScrolling ? "Auto-scrolling" : "Scroll to bottom"}
        </Button>
      </div>
    </div>
  )
}

