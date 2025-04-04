"use client"

import { useState } from "react"
import { Filter, ArrowUpDown, AlertCircle, MessageSquare, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OffTopicInstance {
  id: string
  meetingId: string
  meetingDate: string
  meetingTopic: string
  timestamp: string
  duration: number // in seconds
  participants: string[]
  offTopicContent: string
  category: "personal" | "work-related" | "technical" | "social" | "other"
  disruptionLevel: number // 0-100
  precedingTopic: string
}

const offTopicInstances: OffTopicInstance[] = [
  {
    id: "ot1",
    meetingId: "M-2023-12-10",
    meetingDate: "Dec 10, 2023",
    meetingTopic: "Q4 Planning",
    timestamp: "00:18:45",
    duration: 90, // 1.5 minutes
    participants: ["Michael Chen", "Sarah Johnson"],
    offTopicContent: "Discussion about the company holiday party planning",
    category: "social",
    disruptionLevel: 35,
    precedingTopic: "Marketing Budget",
  },
  {
    id: "ot2",
    meetingId: "M-2023-12-10",
    meetingDate: "Dec 10, 2023",
    meetingTopic: "Q4 Planning",
    timestamp: "00:42:20",
    duration: 120, // 2 minutes
    participants: ["David Wilson", "Emily Rodriguez", "James Taylor"],
    offTopicContent: "Technical issues with the video conferencing software",
    category: "technical",
    disruptionLevel: 60,
    precedingTopic: "Resource Allocation",
  },
  {
    id: "ot3",
    meetingId: "M-2023-12-15",
    meetingDate: "Dec 15, 2023",
    meetingTopic: "Product Launch",
    timestamp: "00:25:10",
    duration: 180, // 3 minutes
    participants: ["Sarah Johnson", "Michael Chen", "Emily Rodriguez"],
    offTopicContent: "Discussion about another project's deadline",
    category: "work-related",
    disruptionLevel: 45,
    precedingTopic: "Marketing Strategy",
  },
  {
    id: "ot4",
    meetingId: "M-2023-12-15",
    meetingDate: "Dec 15, 2023",
    meetingTopic: "Product Launch",
    timestamp: "00:50:30",
    duration: 60, // 1 minute
    participants: ["James Taylor", "David Wilson"],
    offTopicContent: "Personal conversation about weekend plans",
    category: "personal",
    disruptionLevel: 25,
    precedingTopic: "Action Items",
  },
  {
    id: "ot5",
    meetingId: "M-2023-12-18",
    meetingDate: "Dec 18, 2023",
    meetingTopic: "Weekly All-Hands",
    timestamp: "00:15:45",
    duration: 150, // 2.5 minutes
    participants: ["Emily Rodriguez", "Sarah Johnson", "Michael Chen", "David Wilson"],
    offTopicContent: "Discussion about office relocation rumors",
    category: "other",
    disruptionLevel: 70,
    precedingTopic: "Company Updates",
  },
  {
    id: "ot6",
    meetingId: "M-2023-12-18",
    meetingDate: "Dec 18, 2023",
    meetingTopic: "Weekly All-Hands",
    timestamp: "00:38:20",
    duration: 120, // 2 minutes
    participants: ["Michael Chen", "David Wilson"],
    offTopicContent: "Troubleshooting a shared technical problem unrelated to the meeting",
    category: "technical",
    disruptionLevel: 50,
    precedingTopic: "Sales Figures",
  },
  {
    id: "ot7",
    meetingId: "M-2023-12-20",
    meetingDate: "Dec 20, 2023",
    meetingTopic: "Team Standup",
    timestamp: "00:08:15",
    duration: 45, // 45 seconds
    participants: ["Sarah Johnson", "Emily Rodriguez"],
    offTopicContent: "Brief chat about a shared client outside the meeting scope",
    category: "work-related",
    disruptionLevel: 20,
    precedingTopic: "Daily Updates",
  },
  {
    id: "ot8",
    meetingId: "M-2023-12-20",
    meetingDate: "Dec 20, 2023",
    meetingTopic: "Team Standup",
    timestamp: "00:12:30",
    duration: 75, // 1.25 minutes
    participants: ["James Taylor", "Michael Chen", "David Wilson"],
    offTopicContent: "Discussion about sports results from the weekend",
    category: "personal",
    disruptionLevel: 40,
    precedingTopic: "Blockers",
  },
]

// Group by category
const instancesByCategory = offTopicInstances.reduce(
  (acc, instance) => {
    if (!acc[instance.category]) {
      acc[instance.category] = []
    }
    acc[instance.category].push(instance)
    return acc
  },
  {} as Record<string, OffTopicInstance[]>,
)

// Group by participant
const instancesByParticipant = offTopicInstances.reduce(
  (acc, instance) => {
    instance.participants.forEach((participant) => {
      if (!acc[participant]) {
        acc[participant] = []
      }
      acc[participant].push(instance)
    })
    return acc
  },
  {} as Record<string, OffTopicInstance[]>,
)

// Calculate statistics
const totalOffTopicTime = offTopicInstances.reduce((sum, instance) => sum + instance.duration, 0)
const avgDisruptionLevel = Math.round(
  offTopicInstances.reduce((sum, instance) => sum + instance.disruptionLevel, 0) / offTopicInstances.length,
)

// Format seconds to mm:ss
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Get category badge
const getCategoryBadge = (category: string) => {
  switch (category) {
    case "personal":
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Personal</Badge>
    case "work-related":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Work-Related</Badge>
    case "technical":
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Technical</Badge>
    case "social":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Social</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Other</Badge>
  }
}

// Get disruption level badge
const getDisruptionBadge = (level: number) => {
  if (level >= 70) return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">High</Badge>
  if (level >= 40)
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Medium</Badge>
  return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Low</Badge>
}

export function OffTopicDetection() {
  const [sortField, setSortField] = useState<string>("disruptionLevel")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedInstances = [...offTopicInstances].sort((a, b) => {
    if (sortField === "duration") {
      return sortDirection === "asc" ? a.duration - b.duration : b.duration - a.duration
    } else if (sortField === "disruptionLevel") {
      return sortDirection === "asc" ? a.disruptionLevel - b.disruptionLevel : b.disruptionLevel - a.disruptionLevel
    } else if (sortField === "timestamp") {
      return sortDirection === "asc" ? a.timestamp.localeCompare(b.timestamp) : b.timestamp.localeCompare(a.timestamp)
    } else if (sortField === "category") {
      return sortDirection === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Off-Topic Discussion Analysis</CardTitle>
        <CardDescription>Detecting and analyzing discussions unrelated to meeting topics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instances">
          <TabsList className="mb-4">
            <TabsTrigger value="instances">All Instances</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="participants">By Participant</TabsTrigger>
            <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="instances">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">{offTopicInstances.length} off-topic discussions detected</span>
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
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("timestamp")}>
                          Time
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("duration")}>
                          Duration
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("category")}>
                          Category
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="p-0 font-medium"
                          onClick={() => handleSort("disruptionLevel")}
                        >
                          Disruption
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell>{instance.timestamp}</TableCell>
                        <TableCell>{formatDuration(instance.duration)}</TableCell>
                        <TableCell>{getCategoryBadge(instance.category)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{instance.offTopicContent}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={instance.disruptionLevel}
                              className="h-2 w-[60px]"
                              indicatorColor={
                                instance.disruptionLevel >= 70
                                  ? "bg-red-500"
                                  : instance.disruptionLevel >= 40
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }
                            />
                            <span>{instance.disruptionLevel}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-6">
              {Object.entries(instancesByCategory).map(([category, instances]) => {
                const totalTime = instances.reduce((sum, instance) => sum + instance.duration, 0)
                const avgDisruption = Math.round(
                  instances.reduce((sum, instance) => sum + instance.disruptionLevel, 0) / instances.length,
                )

                return (
                  <div key={category} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                        {getCategoryBadge(category)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Avg. Disruption:</span>
                        {getDisruptionBadge(avgDisruption)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Instances</div>
                        <div className="mt-1 text-xl font-bold">{instances.length}</div>
                      </div>

                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Total Time</div>
                        <div className="mt-1 text-xl font-bold">{formatDuration(totalTime)}</div>
                      </div>

                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Avg. Disruption</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress
                            value={avgDisruption}
                            className="h-2 w-[60px]"
                            indicatorColor={
                              avgDisruption >= 70 ? "bg-red-500" : avgDisruption >= 40 ? "bg-amber-500" : "bg-green-500"
                            }
                          />
                          <span>{avgDisruption}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      {category === "technical"
                        ? "Technical disruptions have the highest average impact on meeting flow. Consider addressing technical issues before meetings and having a backup plan for common problems."
                        : category === "work-related"
                          ? "Work-related off-topic discussions indicate potential gaps in meeting agendas. Consider adding a brief 'other business' section at the end of meetings to address these items."
                          : category === "personal"
                            ? "Personal discussions are typically brief with low disruption. They can actually improve team cohesion when kept short, but should be limited during critical decision-making segments."
                            : category === "social"
                              ? "Social discussions about company events have moderate disruption impact. Consider scheduling a brief social update at the beginning of meetings to address these topics proactively."
                              : "Other off-topic discussions often involve speculation or rumors that can significantly derail meetings. Address these directly or take them offline to maintain meeting focus."}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <div className="space-y-6">
              {Object.entries(instancesByParticipant).map(([participant, instances]) => {
                const totalTime = instances.reduce((sum, instance) => sum + instance.duration, 0)
                const avgDisruption = Math.round(
                  instances.reduce((sum, instance) => sum + instance.disruptionLevel, 0) / instances.length,
                )

                return (
                  <div key={participant} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{participant}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Participation in Off-Topic:</span>
                        <Badge>{instances.length} instances</Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Most Common Category</div>
                        <div className="mt-1">
                          {getCategoryBadge(
                            Object.entries(
                              instances.reduce(
                                (acc, instance) => {
                                  acc[instance.category] = (acc[instance.category] || 0) + 1
                                  return acc
                                },
                                {} as Record<string, number>,
                              ),
                            ).sort((a, b) => b[1] - a[1])[0][0],
                          )}
                        </div>
                      </div>

                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Total Time</div>
                        <div className="mt-1 text-xl font-bold">{formatDuration(totalTime)}</div>
                      </div>

                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Avg. Disruption</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress
                            value={avgDisruption}
                            className="h-2 w-[60px]"
                            indicatorColor={
                              avgDisruption >= 70 ? "bg-red-500" : avgDisruption >= 40 ? "bg-amber-500" : "bg-green-500"
                            }
                          />
                          <span>{avgDisruption}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      {participant === "David Wilson"
                        ? "David frequently participates in technical off-topic discussions. While his technical expertise is valuable, consider directing detailed technical troubleshooting to separate channels."
                        : participant === "Emily Rodriguez"
                          ? "Emily's off-topic discussions are typically brief and work-related. They often lead to valuable connections between projects but should be scheduled appropriately."
                          : participant === "Sarah Johnson"
                            ? "Sarah participates in a mix of work-related and social off-topic discussions. Her social discussions help team cohesion but occasionally extend longer than necessary."
                            : participant === "Michael Chen"
                              ? "Michael frequently initiates work-related off-topic discussions. Consider adding a brief time for cross-project updates to address these proactively."
                              : "James tends to participate in personal off-topic discussions. While these are typically low-disruption, they sometimes occur at critical decision points in meetings."}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Total Instances</h3>
                  </div>
                  <div className="mt-2 text-2xl font-bold">{offTopicInstances.length}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Detected across all analyzed meetings</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Total Time</h3>
                  </div>
                  <div className="mt-2 text-2xl font-bold">{formatDuration(totalOffTopicTime)}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Spent on off-topic discussions</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Avg. Disruption</h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={avgDisruptionLevel}
                      className="h-3 w-[100px]"
                      indicatorColor={
                        avgDisruptionLevel >= 70
                          ? "bg-red-500"
                          : avgDisruptionLevel >= 40
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }
                    />
                    <span className="text-2xl font-bold">{avgDisruptionLevel}%</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Impact on meeting flow and focus</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Sentiment Analysis Impact</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Off-topic discussions can significantly skew sentiment analysis results if not properly filtered. Our
                  system identifies and excludes off-topic content from sentiment calculations, resulting in a 28% more
                  accurate representation of meeting sentiment related to the actual agenda topics.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Raw Sentiment (including off-topic)</span>
                    <span className="text-sm">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Filtered Sentiment (on-topic only)</span>
                    <span className="text-sm">68%</span>
                  </div>
                  <Progress value={68} className="h-2" indicatorColor="bg-primary" />

                  <p className="mt-2 text-xs text-muted-foreground">
                    Off-topic discussions often have higher sentiment scores (especially social and personal topics),
                    which can artificially inflate overall meeting sentiment if not filtered.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Key Findings</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• Technical off-topic discussions have the highest disruption impact (avg. 55%)</li>
                    <li>• Off-topic discussions are 40% more likely to occur after complex or technical topics</li>
                    <li>
                      • Personal and social off-topic discussions typically have positive sentiment but reduce meeting
                      focus
                    </li>
                    <li>• Work-related off-topic discussions indicate potential gaps in meeting agendas</li>
                    <li>• Off-topic discussions increase by 65% in meetings longer than 45 minutes</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Recommendations</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• Add a brief "other business" section at the end of meetings</li>
                    <li>• Schedule technical troubleshooting in separate dedicated sessions</li>
                    <li>• Allow 5 minutes of social time at the beginning of meetings</li>
                    <li>• Keep meetings under 45 minutes when possible</li>
                    <li>• Use a "parking lot" for capturing off-topic but important items</li>
                    <li>• Assign a moderator to gently redirect off-topic discussions</li>
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

