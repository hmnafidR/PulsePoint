"use client"

import Link from "next/link"
import { Settings, Download, LogOut } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveSentimentAnalysis } from "@/components/analysis/live-sentiment-analysis"
import { LiveTranscription } from "@/components/analysis/live-transcription"
import { LiveTopicAnalysis } from "@/components/analysis/live-topic-analysis"
import { QuestionAnalysis } from "@/components/analysis/question-analysis"
import { MeetingEndModal } from "@/components/modals/meeting-end-modal"
import { RecentInsights } from "@/components/insights/recent-insights"

export default function LiveAnalysisPage() {
  const [isEndModalOpen, setIsEndModalOpen] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const router = useRouter()
  
  const handleEndMeeting = () => {
    // Here you would typically save meeting data to Supabase
    // For this implementation, just redirect to meetings page
    router.push('/meetings')
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">PulsePoint</h1>
          <span className="hidden text-sm text-muted-foreground md:inline-block">Where data meets emotion</span>
        </div>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/live-analysis">Live Analysis</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/meetings">Archive</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Open settings menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  General Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Live Meeting Analysis</h1>
              <p className="text-muted-foreground">Real-time sentiment analysis of the current meeting</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isLive ? "default" : "outline"} 
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? "Live Mode: ON" : "Live Mode: OFF"}
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="destructive" onClick={() => setIsEndModalOpen(true)}>
                End Meeting
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-6">
            <Card className="col-span-6 md:col-span-4">
              <CardHeader>
                <CardTitle>Live Transcript</CardTitle>
                <CardDescription>Real-time transcription with speaker identification</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveTranscription />
              </CardContent>
            </Card>
            <Card className="col-span-6 md:col-span-2">
              <CardHeader>
                <CardTitle>Live Sentiment</CardTitle>
                <CardDescription>Real-time sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveSentimentAnalysis isLive={isLive} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Topic Analysis</CardTitle>
                <CardDescription>Real-time topic extraction and sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                <LiveTopicAnalysis isLive={isLive} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Insights</CardTitle>
                <CardDescription>AI-generated insights for the current meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentInsights />
              </CardContent>
            </Card>
          </div>

          <QuestionAnalysis />

          <Card>
            <CardHeader>
              <CardTitle>Meeting Summary</CardTitle>
              <CardDescription>AI-generated summary of the meeting</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="action-items">Action Items</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="summary">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm">
                      No summary data available for this meeting.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="action-items">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Marketing Team</h3>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        <li>No action items data available for this meeting.</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Product Team</h3>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        <li>No action items data available for this meeting.</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="insights">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Sentiment Analysis</h3>
                      <p className="mt-2 text-sm">
                        No Sentiment Analysis data available for this meeting.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Engagement Analysis</h3>
                      <p className="mt-2 text-sm">
                        No Engagement Analysis data available for this meeting.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <MeetingEndModal 
        isOpen={isEndModalOpen} 
        onClose={() => setIsEndModalOpen(false)} 
        onConfirm={handleEndMeeting}
      />
    </div>
  )
}

