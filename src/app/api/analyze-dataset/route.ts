import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { DatasetService } from '@/lib/dataset-service'
import { WhisperService } from '@/lib/whisper-service'
import { HuggingFaceService } from '@/lib/huggingface-service'

export async function POST(req: Request) {
  try {
    const { dataset } = await req.json()

    // Initialize services
    const datasetService = new DatasetService()
    const whisperService = new WhisperService()
    const hfService = new HuggingFaceService()

    // Get dataset files
    const files = await datasetService.getTestFiles(dataset)
    
    // Process each audio file and analyze sentiment
    const results = []
    for (const file of files) {
      // Transcribe audio
      const transcript = await whisperService.transcribe(file.path)

      // Analyze text
      const [sentiment, questionAnalysis, speakerEmotion] = await Promise.all([
        hfService.analyzeSentiment(transcript),
        hfService.detectQuestion(transcript),
        hfService.analyzeSpeakerEmotion(transcript)
      ])

      // Get the first result from each analysis
      const sentimentResult = sentiment[0]
      const questionResult = questionAnalysis[0]
      const emotionResult = speakerEmotion[0]

      // Convert sentiment score to percentage (0-100)
      const sentimentScore = sentimentResult.score * 100

      results.push({
        file: file.name,
        transcript,
        sentiment: sentimentScore,
        isPositive: sentimentScore > 50,
        isQuestion: questionResult.label === 'QUESTION',
        speakerEmotion: emotionResult.label
      })
    }

    // Calculate statistics
    const totalSamples = results.length
    const positiveSamples = results.filter(r => r.isPositive).length
    const negativeSamples = totalSamples - positiveSamples
    const overallSentiment = results.reduce((acc, r) => acc + r.sentiment, 0) / totalSamples

    // Create the response data
    const responseData = {
      overallSentiment: Math.round(overallSentiment),
      totalSamples,
      positiveSentiment: Math.round((positiveSamples / totalSamples) * 100),
      negativeSentiment: Math.round((negativeSamples / totalSamples) * 100),
      results
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Dataset analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze dataset" },
      { status: 500 }
    )
  }
} 