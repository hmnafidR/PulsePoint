"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Clock, Download, Users, Video } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SpeakerSentimentComparison } from "@/components/meetings/speaker-sentiment-comparison"

// Sample meeting data
const meetingData = {
  id: "m1",
  title: "Weekly All-Hands Meeting",
  date: "2025-03-15T10:00:00",
  duration: 55,
  participants: 24,
  platform: "Zoom",
  sentiment: 76,
  engagement: 68,
  topics: ["Company Updates", "Q1 Results", "Product Roadmap"],
  tags: ["all-hands", "company-wide"],
  description: "Weekly company-wide meeting to discuss updates, progress, and upcoming initiatives.",
  organizer: "Sarah Johnson",
  location: "Virtual (Zoom)",
  speakers: [
    { name: "Sarah Johnson", role: "CEO", speakingTime: 15, sentiment: 82 },
    { name: "Michael Chen", role: "CTO", speakingTime: 12, sentiment: 76 },
    { name: "Emily Rodriguez", role: "Head of Product", speakingTime: 10, sentiment: 84 },
    { name: "David Wilson", role: "CFO", speakingTime: 8, sentiment: 68 },
    { name: "James Taylor", role: "Head of Sales", speakingTime: 10, sentiment: 72 },
  ],
  keyInsights: [
    "Q1 revenue exceeded targets by 15%",
    "New product launch scheduled for next month",
    "Engineering team completed major infrastructure upgrade",
    "Customer satisfaction scores improved by 8% this quarter",
    "New hiring plan approved for Q2",
  ],
  actionItems: [
    { task: "Finalize Q2 roadmap", assignee: "Emily Rodriguez", dueDate: "2025-03-22" },
    { task: "Prepare marketing materials for product launch", assignee: "James Taylor", dueDate: "2025-03-25" },
    { task: "Complete budget review for Q2", assignee: "David Wilson", dueDate: "2025-03-20" },
    { task: "Schedule customer feedback sessions", assignee: "Michael Chen", dueDate: "2025-03-28" },
  ],
}

interface MeetingDetailViewProps {
  meetingId?: string
  onBack?: () => void
}

export function MeetingDetailView({ meetingId = "m1", onBack }: MeetingDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Function to generate a PDF report
  const generateReport = () => {
    console.log(`Generating PDF report for meeting ${meetingId}`)
    // In a real app, this would trigger a PDF generation process
    alert(`Generating PDF report for meeting ${meetingId}. The report will be downloaded shortly.`)
  }

  // In a real app, you would fetch the meeting data based on the meetingId
  const meeting = meetingData

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-2xl font-bold tracking-tight">{meeting.title}</h2>
          <div className="flex flex-wrap gap-2">
            {meeting.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateReport}>
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Date & Time</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(meeting.date), "MMMM d, yyyy • h:mm a")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">{meeting.duration} minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Platform</div>
                <div className="text-sm text-muted-foreground">{meeting.platform}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{meeting.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Organizer</h3>
                    <p className="text-sm text-muted-foreground">{meeting.organizer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm text-muted-foreground">{meeting.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Participants</h3>
                    <p className="text-sm text-muted-foreground">{meeting.participants} attendees</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Speakers</h3>
                    <p className="text-sm text-muted-foreground">{meeting.speakers.length} speakers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment & Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Overall Sentiment</h3>
                    <span className="text-sm font-medium">{meeting.sentiment}%</span>
                  </div>
                  <Progress
                    value={meeting.sentiment}
                    className="h-2"
                    indicatorColor={
                      meeting.sentiment >= 75 ? "bg-green-500" : meeting.sentiment >= 60 ? "bg-amber-500" : "bg-red-500"
                    }
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Engagement Score</h3>
                    <span className="text-sm font-medium">{meeting.engagement}%</span>
                  </div>
                  <Progress
                    value={meeting.engagement}
                    className="h-2"
                    indicatorColor={
                      meeting.engagement >= 75
                        ? "bg-green-500"
                        : meeting.engagement >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Participation</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {meeting.participants} participants, {Math.round(meeting.participants * 0.75)} active speakers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="speakers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speaker Analysis</CardTitle>
                <CardDescription>Sentiment and speaking time by speaker</CardDescription>
              </CardHeader>
              <CardContent>
                <SpeakerSentimentComparison />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Speaker Details</CardTitle>
                <CardDescription>Individual speaker metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {meeting.speakers.map((speaker, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">{speaker.name}</h3>
                          <p className="text-sm text-muted-foreground">{speaker.role}</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Speaking Time</div>
                            <div className="font-medium">{speaker.speakingTime} min</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Sentiment</div>
                            <div className="font-medium">{speaker.sentiment}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Participation</div>
                            <div className="font-medium">
                              {Math.round((speaker.speakingTime / meeting.duration) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

