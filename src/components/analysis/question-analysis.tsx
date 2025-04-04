"use client"

import { useState } from "react"
import { Search, Filter, ArrowUpDown } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface Question {
  id: string
  text: string
  speaker: string
  askedBy: string
  timestamp: string
  topic: string
  sentiment: number
  answered: boolean
  category: "clarification" | "challenge" | "extension" | "procedural"
}

const questions: Question[] = [
  {
    id: "q1",
    text: "Could you explain how the new onboarding process will affect existing customers?",
    speaker: "Emily Rodriguez",
    askedBy: "Michael Chen",
    timestamp: "00:12:45",
    topic: "Customer Onboarding",
    sentiment: 65,
    answered: true,
    category: "clarification",
  },
  {
    id: "q2",
    text: "I'm not sure the timeline is realistic given our current resources. Have we considered extending the deadline?",
    speaker: "David Wilson",
    askedBy: "Sarah Johnson",
    timestamp: "00:24:30",
    topic: "Resource Allocation",
    sentiment: 45,
    answered: true,
    category: "challenge",
  },
  {
    id: "q3",
    text: "How does this marketing strategy align with our Q4 sales targets?",
    speaker: "Sarah Johnson",
    askedBy: "James Taylor",
    timestamp: "00:08:15",
    topic: "Marketing Strategy",
    sentiment: 70,
    answered: true,
    category: "clarification",
  },
  {
    id: "q4",
    text: "Could we apply this approach to our enterprise clients as well?",
    speaker: "Michael Chen",
    askedBy: "Emily Rodriguez",
    timestamp: "00:35:20",
    topic: "Sales Figures",
    sentiment: 85,
    answered: true,
    category: "extension",
  },
  {
    id: "q5",
    text: "When will the team receive training on the new system?",
    speaker: "James Taylor",
    askedBy: "David Wilson",
    timestamp: "00:42:10",
    topic: "Action Items",
    sentiment: 60,
    answered: false,
    category: "procedural",
  },
  {
    id: "q6",
    text: "I'm concerned about the security implications of this approach. Have we consulted with the IT team?",
    speaker: "David Wilson",
    askedBy: "Michael Chen",
    timestamp: "00:27:45",
    topic: "Resource Allocation",
    sentiment: 40,
    answered: true,
    category: "challenge",
  },
  {
    id: "q7",
    text: "Could you share more details about how this affected customer retention in the pilot?",
    speaker: "Emily Rodriguez",
    askedBy: "Sarah Johnson",
    timestamp: "00:15:30",
    topic: "Customer Onboarding",
    sentiment: 75,
    answered: true,
    category: "extension",
  },
  {
    id: "q8",
    text: "What metrics will we use to measure the success of this initiative?",
    speaker: "Sarah Johnson",
    askedBy: "James Taylor",
    timestamp: "00:10:15",
    topic: "Marketing Strategy",
    sentiment: 80,
    answered: true,
    category: "clarification",
  },
  {
    id: "q9",
    text: "Do we need to schedule a follow-up meeting to discuss these action items in more detail?",
    speaker: "James Taylor",
    askedBy: "Emily Rodriguez",
    timestamp: "00:44:30",
    topic: "Action Items",
    sentiment: 65,
    answered: false,
    category: "procedural",
  },
  {
    id: "q10",
    text: "I'm not convinced this approach will work for our international markets. What data do we have to support this?",
    speaker: "David Wilson",
    askedBy: "Michael Chen",
    timestamp: "00:29:15",
    topic: "Resource Allocation",
    sentiment: 35,
    answered: true,
    category: "challenge",
  },
]

const categoryDescriptions = {
  clarification: "Questions seeking to better understand information presented",
  challenge: "Questions that express doubt or concern about an approach",
  extension: "Questions that build upon or extend the current topic",
  procedural: "Questions about process, timing, or next steps",
}

const categoryColors = {
  clarification: "bg-blue-500",
  challenge: "bg-amber-500",
  extension: "bg-green-500",
  procedural: "bg-purple-500",
}

const categoryBadgeVariants = {
  clarification: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  challenge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  extension: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  procedural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export function QuestionAnalysis() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredQuestions = questions.filter(
    (question) =>
      question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.askedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate statistics
  const totalQuestions = questions.length
  const clarificationCount = questions.filter((q) => q.category === "clarification").length
  const challengeCount = questions.filter((q) => q.category === "challenge").length
  const extensionCount = questions.filter((q) => q.category === "extension").length
  const proceduralCount = questions.filter((q) => q.category === "procedural").length

  const averageSentiment = Math.round(questions.reduce((sum, q) => sum + q.sentiment, 0) / totalQuestions)

  const questionsBySpeaker = {
    "Sarah Johnson": questions.filter((q) => q.speaker === "Sarah Johnson"),
    "Michael Chen": questions.filter((q) => q.speaker === "Michael Chen"),
    "David Wilson": questions.filter((q) => q.speaker === "David Wilson"),
    "Emily Rodriguez": questions.filter((q) => q.speaker === "Emily Rodriguez"),
    "James Taylor": questions.filter((q) => q.speaker === "James Taylor"),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Analysis</CardTitle>
        <CardDescription>Analysis of questions asked during meetings and their sentiment impact</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">All Questions</TabsTrigger>
            <TabsTrigger value="speakers">By Speaker</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Questions</div>
                  <div className="mt-1 text-2xl font-bold">{totalQuestions}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Average Sentiment</div>
                  <div className="mt-1 text-2xl font-bold">{averageSentiment}%</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Answered</div>
                  <div className="mt-1 text-2xl font-bold">
                    {questions.filter((q) => q.answered).length}/{totalQuestions}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Challenge Questions</div>
                  <div className="mt-1 text-2xl font-bold">{challengeCount}</div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Question Categories</h3>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryBadgeVariants.clarification}>Clarification</Badge>
                        <span className="text-sm">{clarificationCount} questions</span>
                      </div>
                      <span className="text-sm">{Math.round((clarificationCount / totalQuestions) * 100)}%</span>
                    </div>
                    <Progress
                      value={(clarificationCount / totalQuestions) * 100}
                      className="h-2"
                      indicatorColor="bg-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryBadgeVariants.challenge}>Challenge</Badge>
                        <span className="text-sm">{challengeCount} questions</span>
                      </div>
                      <span className="text-sm">{Math.round((challengeCount / totalQuestions) * 100)}%</span>
                    </div>
                    <Progress
                      value={(challengeCount / totalQuestions) * 100}
                      className="h-2"
                      indicatorColor="bg-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryBadgeVariants.extension}>Extension</Badge>
                        <span className="text-sm">{extensionCount} questions</span>
                      </div>
                      <span className="text-sm">{Math.round((extensionCount / totalQuestions) * 100)}%</span>
                    </div>
                    <Progress
                      value={(extensionCount / totalQuestions) * 100}
                      className="h-2"
                      indicatorColor="bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={categoryBadgeVariants.procedural}>Procedural</Badge>
                        <span className="text-sm">{proceduralCount} questions</span>
                      </div>
                      <span className="text-sm">{Math.round((proceduralCount / totalQuestions) * 100)}%</span>
                    </div>
                    <Progress
                      value={(proceduralCount / totalQuestions) * 100}
                      className="h-2"
                      indicatorColor="bg-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Question Sentiment Impact</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Questions provide valuable insight into audience engagement and understanding. High sentiment
                    questions (extension questions) indicate engagement and interest. Low sentiment questions (challenge
                    questions) may indicate concerns that need addressing but also show critical thinking.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Question Categories Explained</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <span className="font-medium">Clarification:</span> {categoryDescriptions.clarification}
                    </li>
                    <li>
                      • <span className="font-medium">Challenge:</span> {categoryDescriptions.challenge}
                    </li>
                    <li>
                      • <span className="font-medium">Extension:</span> {categoryDescriptions.extension}
                    </li>
                    <li>
                      • <span className="font-medium">Procedural:</span> {categoryDescriptions.procedural}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search questions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                      <TableHead className="w-[400px]">
                        <Button variant="ghost" className="p-0 font-medium">
                          Question
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium">
                          Speaker
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium">
                          Asked By
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-medium">
                          Sentiment
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.text}</TableCell>
                        <TableCell>{question.speaker}</TableCell>
                        <TableCell>{question.askedBy}</TableCell>
                        <TableCell>
                          <Badge className={categoryBadgeVariants[question.category]}>
                            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={question.sentiment}
                              className="h-2 w-[60px]"
                              indicatorColor={
                                question.sentiment >= 75
                                  ? "bg-green-500"
                                  : question.sentiment >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }
                            />
                            <span>{question.sentiment}%</span>
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
              {Object.entries(questionsBySpeaker).map(([speaker, speakerQuestions]) => (
                <div key={speaker} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{speaker}</h3>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Questions Received</div>
                        <div className="mt-1 text-xl font-bold">{speakerQuestions.length}</div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <div className="text-sm font-medium text-muted-foreground">Avg. Sentiment</div>
                        <div className="mt-1 text-xl font-bold">
                          {speakerQuestions.length > 0
                            ? Math.round(
                                speakerQuestions.reduce((sum, q) => sum + q.sentiment, 0) / speakerQuestions.length,
                              )
                            : 0}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Question Categories</div>
                      <div className="grid grid-cols-2 gap-2">
                        {["clarification", "challenge", "extension", "procedural"].map((category) => {
                          const count = speakerQuestions.filter((q) => q.category === category).length
                          const percentage =
                            speakerQuestions.length > 0 ? Math.round((count / speakerQuestions.length) * 100) : 0

                          return (
                            <div key={category} className="flex items-center gap-2">
                              <div
                                className={`h-3 w-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`}
                              />
                              <span className="text-xs">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                              <span className="ml-auto text-xs">{percentage}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {speakerQuestions.length > 0
                        ? speaker === "David Wilson"
                          ? "David receives the highest proportion of challenge questions (50%), indicating his topics may be controversial or need more supporting evidence. Consider providing more data upfront."
                          : speaker === "Emily Rodriguez"
                            ? "Emily receives the highest proportion of extension questions (50%), showing her content inspires further thinking. Her clarification questions are minimal, indicating exceptional clarity."
                            : speaker === "Sarah Johnson"
                              ? "Sarah's questions are primarily clarification-based (50%), suggesting her topics may benefit from more detailed explanations or examples. Her content generates positive engagement."
                              : speaker === "Michael Chen"
                                ? "Michael receives a balanced mix of question types, with extension questions slightly higher (50%). This indicates his content is clear but inspires further exploration."
                                : "James receives mostly procedural questions (50%), suggesting his role in defining next steps and action items. Consider providing more detailed implementation plans."
                        : "No questions recorded for this speaker."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

