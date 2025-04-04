"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for past meetings
const pastMeetings = [
  {
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
  },
  {
    id: "m2",
    title: "Product Team Standup",
    date: "2025-03-14T09:00:00",
    duration: 25,
    participants: 12,
    platform: "Microsoft Teams",
    sentiment: 82,
    engagement: 74,
    topics: ["Sprint Progress", "Blockers", "Next Steps"],
    tags: ["standup", "product"],
  },
  {
    id: "m3",
    title: "Sales Pipeline Review",
    date: "2025-03-13T14:00:00",
    duration: 45,
    participants: 8,
    platform: "Zoom",
    sentiment: 68,
    engagement: 72,
    topics: ["Q1 Targets", "Deal Status", "Sales Strategy"],
    tags: ["sales", "quarterly"],
  },
  {
    id: "m4",
    title: "Marketing Campaign Planning",
    date: "2025-03-12T11:00:00",
    duration: 60,
    participants: 10,
    platform: "Google Meet",
    sentiment: 80,
    engagement: 76,
    topics: ["Campaign Strategy", "Budget Allocation", "Timeline"],
    tags: ["marketing", "planning"],
  },
  {
    id: "m5",
    title: "Engineering Architecture Review",
    date: "2025-03-11T15:30:00",
    duration: 90,
    participants: 15,
    platform: "Microsoft Teams",
    sentiment: 72,
    engagement: 65,
    topics: ["System Design", "Technical Debt", "Scalability"],
    tags: ["engineering", "technical"],
  },
  {
    id: "m6",
    title: "Customer Success Quarterly Review",
    date: "2025-03-10T13:00:00",
    duration: 75,
    participants: 18,
    platform: "Zoom",
    sentiment: 78,
    engagement: 70,
    topics: ["Customer Satisfaction", "Churn Rate", "Success Stories"],
    tags: ["customer-success", "quarterly"],
  },
  {
    id: "m7",
    title: "HR Policy Update",
    date: "2025-03-09T10:00:00",
    duration: 40,
    participants: 30,
    platform: "Zoom",
    sentiment: 65,
    engagement: 58,
    topics: ["Policy Changes", "Benefits Update", "Q&A"],
    tags: ["hr", "company-wide"],
  },
  {
    id: "m8",
    title: "Executive Strategy Session",
    date: "2025-03-08T09:00:00",
    duration: 120,
    participants: 7,
    platform: "Microsoft Teams",
    sentiment: 74,
    engagement: 80,
    topics: ["Annual Goals", "Market Analysis", "Resource Planning"],
    tags: ["executive", "strategy"],
  },
]

// Monthly meeting statistics
const monthlyStats = [
  { month: "Jan", meetings: 42, avgSentiment: 72, avgEngagement: 68 },
  { month: "Feb", meetings: 38, avgSentiment: 74, avgEngagement: 70 },
  { month: "Mar", meetings: 45, avgSentiment: 76, avgEngagement: 72 },
  { month: "Apr", meetings: 36, avgSentiment: 70, avgEngagement: 65 },
  { month: "May", meetings: 40, avgSentiment: 75, avgEngagement: 69 },
  { month: "Jun", meetings: 44, avgSentiment: 78, avgEngagement: 74 },
]

interface PastMeetingsViewProps {
  onViewDetails?: (meetingId: string) => void
}

export function PastMeetingsView({ onViewDetails }: PastMeetingsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("month")

  // Filter meetings based on search query and platform
  const filteredMeetings = pastMeetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meeting.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPlatform =
      selectedPlatform === "all" || meeting.platform.toLowerCase() === selectedPlatform.toLowerCase()

    return matchesSearch && matchesPlatform
  })

  // Function to generate a PDF report
  const generateReport = (meetingId: string) => {
    console.log(`Generating PDF report for meeting ${meetingId}`)
    // In a real app, this would trigger a PDF generation process that includes all analytics and meeting details
    alert(
      `Generating comprehensive PDF report for meeting ${meetingId}. The report will include all analytics and meeting details. The report will be downloaded shortly.`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="grid flex-1 gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search meetings by title, topic, or tag..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="microsoft teams">Microsoft Teams</SelectItem>
              <SelectItem value="google meet">Google Meet</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Meeting</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{meeting.title}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {meeting.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(meeting.date), "MMM d, yyyy • h:mm a")}</TableCell>
                      <TableCell>{meeting.duration} min</TableCell>
                      <TableCell>{meeting.platform}</TableCell>
                      <TableCell>{meeting.participants}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={meeting.sentiment}
                            className="h-2 w-[60px]"
                            indicatorColor={
                              meeting.sentiment >= 75
                                ? "bg-green-500"
                                : meeting.sentiment >= 60
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }
                          />
                          <span>{meeting.sentiment}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={meeting.engagement}
                            className="h-2 w-[60px]"
                            indicatorColor={
                              meeting.engagement >= 75
                                ? "bg-green-500"
                                : meeting.engagement >= 60
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }
                          />
                          <span>{meeting.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span>Actions</span>
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onViewDetails?.(meeting.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateReport(meeting.id)}>
                              Generate Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Meeting Trends</CardTitle>
              <CardDescription>Meeting statistics over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-sm font-medium">Number of Meetings</h3>
                    <div className="relative h-[100px]">
                      <div className="absolute inset-0 flex items-end justify-between">
                        {monthlyStats.map((stat, index) => (
                          <div key={index} className="flex w-1/6 flex-col items-center">
                            <div
                              className="w-12 bg-primary rounded-t-sm"
                              style={{ height: `${(stat.meetings / 50) * 100}px` }}
                            ></div>
                            <div className="mt-2 text-xs">{stat.month}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Average Sentiment</h3>
                    <div className="relative h-[100px]">
                      <div className="absolute inset-0 flex items-end justify-between">
                        {monthlyStats.map((stat, index) => (
                          <div key={index} className="flex w-1/6 flex-col items-center">
                            <div
                              className="w-12 bg-blue-500 rounded-t-sm"
                              style={{ height: `${stat.avgSentiment}px` }}
                            ></div>
                            <div className="mt-2 text-xs">{stat.month}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Average Engagement</h3>
                    <div className="relative h-[100px]">
                      <div className="absolute inset-0 flex items-end justify-between">
                        {monthlyStats.map((stat, index) => (
                          <div key={index} className="flex w-1/6 flex-col items-center">
                            <div
                              className="w-12 bg-green-500 rounded-t-sm"
                              style={{ height: `${stat.avgEngagement}px` }}
                            ></div>
                            <div className="mt-2 text-xs">{stat.month}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment by Meeting Type</CardTitle>
                <CardDescription>Average sentiment scores by meeting category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">All-Hands</div>
                      <div className="text-sm font-medium">72%</div>
                    </div>
                    <Progress value={72} className="h-2" indicatorColor="bg-blue-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Standup</div>
                      <div className="text-sm font-medium">82%</div>
                    </div>
                    <Progress value={82} className="h-2" indicatorColor="bg-green-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Planning</div>
                      <div className="text-sm font-medium">78%</div>
                    </div>
                    <Progress value={78} className="h-2" indicatorColor="bg-green-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Review</div>
                      <div className="text-sm font-medium">68%</div>
                    </div>
                    <Progress value={68} className="h-2" indicatorColor="bg-amber-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Strategy</div>
                      <div className="text-sm font-medium">74%</div>
                    </div>
                    <Progress value={74} className="h-2" indicatorColor="bg-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement by Meeting Type</CardTitle>
                <CardDescription>Average engagement scores by meeting category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">All-Hands</div>
                      <div className="text-sm font-medium">68%</div>
                    </div>
                    <Progress value={68} className="h-2" indicatorColor="bg-amber-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Standup</div>
                      <div className="text-sm font-medium">74%</div>
                    </div>
                    <Progress value={74} className="h-2" indicatorColor="bg-blue-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Planning</div>
                      <div className="text-sm font-medium">76%</div>
                    </div>
                    <Progress value={76} className="h-2" indicatorColor="bg-green-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Review</div>
                      <div className="text-sm font-medium">72%</div>
                    </div>
                    <Progress value={72} className="h-2" indicatorColor="bg-blue-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm">Strategy</div>
                      <div className="text-sm font-medium">80%</div>
                    </div>
                    <Progress value={80} className="h-2" indicatorColor="bg-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

