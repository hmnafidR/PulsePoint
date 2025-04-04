"use client"

import { useState } from "react"
import { Clock, Filter, ArrowUpDown, AlertTriangle, Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EngagementGap {
  id: string
  speaker: string
  topic: string
  startTime: string
  duration: number // in seconds
  precedingReaction: string | null
  followingReaction: string | null
  meetingId: string
  meetingDate: string
  engagementScore: number
}

const engagementGaps: EngagementGap[] = [
  {
    id: "gap1",
    speaker: "David Wilson",
    topic: "Resource Allocation",
    startTime: "00:15:30",
    duration: 180, // 3 minutes
    precedingReaction: "❓ Question",
    followingReaction: "👎 Thumbs Down",
    meetingId: "M-2023-12-10",
    meetingDate: "Dec 10, 2023",
    engagementScore: 35,
  },
  {
    id: "gap2",
    speaker: "Michael Chen",
    topic: "Sales Figures",
    startTime: "00:32:15",
    duration: 120, // 2 minutes
    precedingReaction: "💡 Idea",
    followingReaction: "❓ Question",
    meetingId: "M-2023-12-10",
    meetingDate: "Dec 10, 2023",
    engagementScore: 45,
  },
  {
    id: "gap3",
    speaker: "James Taylor",
    topic: "Action Items",
    startTime: "00:48:20",
    duration: 240, // 4 minutes
    precedingReaction: null,
    followingReaction: "😕 Confused",
    meetingId: "M-2023-12-15",
    meetingDate: "Dec 15, 2023",
    engagementScore: 30,
  },
  {
    id: "gap4",
    speaker: "Sarah Johnson",
    topic: "Marketing Strategy",
    startTime: "00:22:10",
    duration: 90, // 1.5 minutes
    precedingReaction: "👍 Thumbs Up",
    followingReaction: "❓ Question",
    meetingId: "M-2023-12-15",
    meetingDate: "Dec 15, 2023",
    engagementScore: 60,
  },
  {
    id: "gap5",
    speaker: "Emily Rodriguez",
    topic: "Customer Onboarding",
    startTime: "00:10:45",
    duration: 60, // 1 minute
    precedingReaction: "👏 Clapping",
    followingReaction: "👍 Thumbs Up",
    meetingId: "M-2023-12-18",
    meetingDate: "Dec 18, 2023",
    engagementScore: 75,
  },
  {
    id: "gap6",
    speaker: "David Wilson",
    topic: "Budget Constraints",
    startTime: "00:35:20",
    duration: 210, // 3.5 minutes
    precedingReaction: "😕 Confused",
    followingReaction: "❓ Question",
    meetingId: "M-2023-12-18",
    meetingDate: "Dec 18, 2023",
    engagementScore: 25,
  },
  {
    id: "gap7",
    speaker: "Michael Chen",
    topic: "Customer Acquisition",
    startTime: "00:18:30",
    duration: 150, // 2.5 minutes
    precedingReaction: "💡 Idea",
    followingReaction: null,
    meetingId: "M-2023-12-18",
    meetingDate: "Dec 18, 2023",
    engagementScore: 50,
  },
  {
    id: "gap8",
    speaker: "Sarah Johnson",
    topic: "Social Media Strategy",
    startTime: "00:28:15",
    duration: 75, // 1.25 minutes
    precedingReaction: "👍 Thumbs Up",
    followingReaction: "🎉 Celebration",
    meetingId: "M-2023-12-20",
    meetingDate: "Dec 20, 2023",
    engagementScore: 70,
  },
]

// Group gaps by speaker
const gapsBySpeaker = engagementGaps.reduce(
  (acc, gap) => {
    if (!acc[gap.speaker]) {
      acc[gap.speaker] = []
    }
    acc[gap.speaker].push(gap)
    return acc
  },
  {} as Record<string, EngagementGap[]>,
)

// Group gaps by topic
const gapsByTopic = engagementGaps.reduce(
  (acc, gap) => {
    if (!acc[gap.topic]) {
      acc[gap.topic] = []
    }
    acc[gap.topic].push(gap)
    return acc
  },
  {} as Record<string, EngagementGap[]>,
)

// Calculate average engagement score by speaker
const speakerEngagementScores = Object.entries(gapsBySpeaker).map(([speaker, gaps]) => {
  const avgScore = gaps.reduce((sum, gap) => sum + gap.engagementScore, 0) / gaps.length
  const avgDuration = gaps.reduce((sum, gap) => sum + gap.duration, 0) / gaps.length
  return { speaker, avgScore, avgDuration, count: gaps.length }
})

// Calculate average engagement score by topic
const topicEngagementScores = Object.entries(gapsByTopic).map(([topic, gaps]) => {
  const avgScore = gaps.reduce((sum, gap) => sum + gap.engagementScore, 0) / gaps.length
  const avgDuration = gaps.reduce((sum, gap) => sum + gap.duration, 0) / gaps.length
  return { topic, avgScore, avgDuration, count: gaps.length }
})

// Format seconds to mm:ss
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function EngagementGaps() {
  const [sortField, setSortField] = useState<string>("duration")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedGaps = [...engagementGaps].sort((a, b) => {
    if (sortField === "duration") {
      return sortDirection === "asc" ? a.duration - b.duration : b.duration - a.duration
    } else if (sortField === "engagementScore") {
      return sortDirection === "asc" ? a.engagementScore - b.engagementScore : b.engagementScore - a.engagementScore
    } else if (sortField === "speaker") {
      return sortDirection === "asc" ? a.speaker.localeCompare(b.speaker) : b.speaker.localeCompare(a.speaker)
    } else if (sortField === "topic") {
      return sortDirection === "asc" ? a.topic.localeCompare(b.topic) : b.topic.localeCompare(a.topic)
    }
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getEngagementBadge = (score: number) => {
    if (score >= 70)
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">High</Badge>
    if (score >= 50)
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Moderate</Badge>
    if (score >= 30)
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Low</Badge>
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Very Low</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Gap Analysis</CardTitle>
        <CardDescription>Periods with no reactions or engagement during meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gaps">
          <TabsList className="mb-4">
            <TabsTrigger value="gaps">All Gaps</TabsTrigger>
            <TabsTrigger value="speakers">By Speaker</TabsTrigger>
            <TabsTrigger value="topics">By Topic</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">{engagementGaps.length} periods with no reactions detected</span>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("speaker")}>
                          Speaker
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("topic")}>
                          Topic
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("duration")}>
                          Duration
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="p-0 font-medium"
                          onClick={() => handleSort("engagementScore")}
                        >
                          Engagement
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedGaps.map((gap) => (
                      <TableRow key={gap.id}>
                        <TableCell className="font-medium">{gap.speaker}</TableCell>
                        <TableCell>{gap.topic}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDuration(gap.duration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{gap.startTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={gap.engagementScore}
                              className="h-2 w-[60px]"
                              indicatorColor={
                                gap.engagementScore >= 70
                                  ? "bg-green-500"
                                  : gap.engagementScore >= 50
                                    ? "bg-blue-500"
                                    : gap.engagementScore >= 30
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                              }
                            />
                            <span>{gap.engagementScore}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="speakers">
            <div className="space-y-6">
              {speakerEngagementScores.map((data) => (
                <div key={data.speaker} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{data.speaker}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Avg. Engagement:</span>
                      {getEngagementBadge(data.avgScore)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Engagement Score</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress
                          value={data.avgScore}
                          className="h-2 w-[60px]"
                          indicatorColor={
                            data.avgScore >= 70
                              ? "bg-green-500"
                              : data.avgScore >= 50
                                ? "bg-blue-500"
                                : data.avgScore >= 30
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                          }
                        />
                        <span className="text-xl font-bold">{Math.round(data.avgScore)}%</span>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Avg. Gap Duration</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xl font-bold">{formatDuration(Math.round(data.avgDuration))}</span>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Number of Gaps</div>
                      <div className="mt-1 text-xl font-bold">{data.count}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {data.speaker === "David Wilson"
                      ? "David has the longest average gap duration and lowest engagement scores. His technical explanations of resource allocation and budget constraints may be too detailed for the audience."
                      : data.speaker === "Emily Rodriguez"
                        ? "Emily has the shortest average gap duration and highest engagement scores. Her presentations maintain audience interest even during periods without reactions."
                        : data.speaker === "Sarah Johnson"
                          ? "Sarah's engagement scores are above average, with relatively short gap durations. Her marketing topics generally maintain good audience interest."
                          : data.speaker === "Michael Chen"
                            ? "Michael has moderate engagement scores with medium gap durations. His sales presentations could benefit from more interactive elements to reduce non-reactive periods."
                            : "James has below average engagement scores with long gap durations. His procedural topics may benefit from more engaging presentation techniques."}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <div className="space-y-6">
              {topicEngagementScores.map((data) => (
                <div key={data.topic} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{data.topic}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Avg. Engagement:</span>
                      {getEngagementBadge(data.avgScore)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Engagement Score</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress
                          value={data.avgScore}
                          className="h-2 w-[60px]"
                          indicatorColor={
                            data.avgScore >= 70
                              ? "bg-green-500"
                              : data.avgScore >= 50
                                ? "bg-blue-500"
                                : data.avgScore >= 30
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                          }
                        />
                        <span className="text-xl font-bold">{Math.round(data.avgScore)}%</span>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Avg. Gap Duration</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xl font-bold">{formatDuration(Math.round(data.avgDuration))}</span>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted p-3">
                      <div className="text-sm font-medium text-muted-foreground">Number of Gaps</div>
                      <div className="mt-1 text-xl font-bold">{data.count}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {data.topic === "Resource Allocation" || data.topic === "Budget Constraints"
                      ? "Financial and resource topics consistently show the lowest engagement scores and longest gap durations. Consider using more visual aids and real-world examples to make these topics more engaging."
                      : data.topic === "Customer Onboarding" || data.topic === "Social Media Strategy"
                        ? "Customer-focused topics show the highest engagement scores with shorter gap durations. These topics resonate well with the audience and maintain interest."
                        : data.topic === "Marketing Strategy"
                          ? "Marketing topics show above-average engagement with moderate gap durations. These topics generally maintain good audience interest but could benefit from more interactive elements."
                          : data.topic === "Sales Figures" || data.topic === "Customer Acquisition"
                            ? "Sales-related topics show moderate engagement scores. Consider breaking up data-heavy sections with discussion points to reduce non-reactive periods."
                            : "Procedural topics like action items show below-average engagement. Consider making these sections more interactive by assigning responsibilities in real-time with audience input."}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">What Engagement Gaps Mean</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Engagement gaps are periods during meetings where no reactions or interactions are recorded. While not
                  all silence indicates disengagement (participants may be listening intently), extended periods without
                  any reactions often signal reduced audience interest or comprehension difficulties.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Key Findings</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Gaps exceeding 3 minutes correlate with a 40% drop in subsequent participation</li>
                  <li>
                    • Technical and financial topics generate 65% longer engagement gaps than customer-focused topics
                  </li>
                  <li>• Speakers who use visual aids experience 30% shorter engagement gaps</li>
                  <li>• Engagement gaps are 45% more likely to occur after a confused reaction or question</li>
                  <li>• Meetings with regular check-in questions reduce average gap duration by 50%</li>
                </ul>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Recommendations for Speakers</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• Break up presentations into 2-3 minute segments followed by check-in questions</li>
                    <li>• Use visual aids, especially for technical or financial topics</li>
                    <li>• Monitor audience for signs of confusion and proactively clarify</li>
                    <li>• Incorporate interactive elements every 5 minutes</li>
                    <li>• Follow up confused reactions with simplified explanations</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Recommendations for Meeting Organizers</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• Schedule complex topics earlier in meetings when engagement is typically higher</li>
                    <li>• Limit technical presentations to 10 minutes before incorporating discussion</li>
                    <li>• Provide pre-meeting materials for complex topics</li>
                    <li>• Assign a moderator to prompt discussion during potential gap periods</li>
                    <li>• Schedule short breaks after topics that typically generate long gaps</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

