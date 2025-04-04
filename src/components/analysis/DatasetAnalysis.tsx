"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, MessageSquare, Users } from "lucide-react"

interface DatasetAnalysisProps {
  dataset: "common_voice" | "librispeech"
  onAnalysisComplete: (data: any) => void
}

export function DatasetAnalysis({ dataset, onAnalysisComplete }: DatasetAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisData, setAnalysisData] = useState<any>(null)

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)
    try {
      const response = await fetch("/api/analyze-dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataset }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze dataset")
      }

      const data = await response.json()
      setAnalysisData(data)
      onAnalysisComplete(data)
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
      setProgress(100)
    }
  }

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-md dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40">
        <CardHeader className="border-b border-blue-100/50 dark:border-blue-800/20 pb-3">
          <CardTitle className="text-blue-700 dark:text-blue-300">Dataset Analysis</CardTitle>
          <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
            Analyzing {dataset === "common_voice" ? "Common Voice" : "LibriSpeech"} dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Analysis Progress</h4>
                <p className="text-sm text-muted-foreground">
                  {isAnalyzing ? "Processing audio files..." : "Ready to analyze"}
                </p>
              </div>
              <Progress value={progress} className="w-[60%]" />
            </div>
            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-indigo-600/90 shadow-md dark:from-blue-600 dark:to-indigo-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Overall Sentiment</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">
                {analysisData.overallSentiment}%
              </div>
              <p className="mt-2 text-xs text-white/80">Average sentiment score</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-cyan-500/90 to-blue-600/90 shadow-md dark:from-cyan-600 dark:to-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Samples</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">
                {analysisData.totalSamples}
              </div>
              <p className="mt-2 text-xs text-white/80">Audio files analyzed</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-500/90 to-purple-600/90 shadow-md dark:from-indigo-600 dark:to-purple-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Positive Sentiment</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">
                {analysisData.positiveSentiment}%
              </div>
              <p className="mt-2 text-xs text-white/80">Positive samples</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-500/90 to-sky-600/90 shadow-md dark:from-blue-600 dark:to-sky-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Negative Sentiment</CardTitle>
              <div className="rounded-full bg-white/20 p-1.5">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-white">
                {analysisData.negativeSentiment}%
              </div>
              <p className="mt-2 text-xs text-white/80">Negative samples</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 