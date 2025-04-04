"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentMeetings() {
  const meetings = [
    {
      id: "1",
      title: "Weekly Team Sync",
      date: new Date(2023, 9, 15, 14, 30),
      duration: 45,
      participants: 8,
      sentiment: 85,
    },
    {
      id: "2",
      title: "Project Alpha Planning",
      date: new Date(2023, 9, 14, 10, 0),
      duration: 60,
      participants: 6,
      sentiment: 78,
    },
    {
      id: "3",
      title: "Client Onboarding",
      date: new Date(2023, 9, 12, 9, 0),
      duration: 30,
      participants: 4,
      sentiment: 92,
    },
  ]

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="flex items-center justify-between space-x-4 rounded-lg border p-4"
        >
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="text-primary">
                {meeting.title.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-none">{meeting.title}</p>
              <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{format(meeting.date, "MMM d, yyyy")}</span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{meeting.duration} min</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/meetings/${meeting.id}`}>View</Link>
          </Button>
        </div>
      ))}
      
      <Button variant="outline" className="w-full" asChild>
        <Link href="/meetings">View All Meetings</Link>
      </Button>
    </div>
  )
} 