import { NextResponse } from 'next/server';
import { DatasetService } from '@/lib/dataset-service';

// This API route is used for testing analysis functionality
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { datasetId } = body;

    if (!datasetId) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would process the audio file
    // For testing, we return mock data
    
    const mockTranscript = [
      {
        text: "I think we should focus on improving our customer experience for Q2.",
        speaker: "Alex Johnson",
        startTime: 0,
        endTime: 5.2,
        sentiment: 0.8
      },
      {
        text: "I agree. Our NPS scores have been declining over the last quarter.",
        speaker: "Maria Garcia",
        startTime: 5.5,
        endTime: 9.8,
        sentiment: -0.2
      },
      {
        text: "What specifically should we prioritize? The mobile app has the most complaints.",
        speaker: "David Kim",
        startTime: 10.1,
        endTime: 15.6,
        sentiment: 0.1
      },
      {
        text: "Yes, but don't forget about our checkout process. That's causing a lot of cart abandonment.",
        speaker: "Sarah Chen",
        startTime: 16.0,
        endTime: 22.3,
        sentiment: -0.3
      },
      {
        text: "I think we should allocate budget to both, but prioritize the mobile app redesign first.",
        speaker: "Alex Johnson",
        startTime: 22.8,
        endTime: 28.4,
        sentiment: 0.6
      }
    ];

    const mockAnalysis = {
      sentiment: {
        overall: 0.2, // on a scale from -1 to 1
        byTopic: {
          "Customer Experience": 0.5,
          "Product Development": 0.3,
          "Mobile App": -0.2,
          "Checkout Process": -0.3
        },
        bySpeaker: {
          "Alex Johnson": 0.7,
          "Maria Garcia": -0.1,
          "David Kim": 0.2,
          "Sarah Chen": -0.2
        }
      },
      topics: [
        { name: "Customer Experience", weight: 0.35, sentiment: 0.5 },
        { name: "Mobile App", weight: 0.25, sentiment: -0.2 },
        { name: "Checkout Process", weight: 0.2, sentiment: -0.3 },
        { name: "Budget Allocation", weight: 0.15, sentiment: 0.4 },
        { name: "Product Development", weight: 0.05, sentiment: 0.3 }
      ],
      speakerStats: [
        { name: "Alex Johnson", speakingTime: 240, sentiment: 0.7, topicsFocus: ["Budget Allocation", "Customer Experience"] },
        { name: "Maria Garcia", speakingTime: 180, sentiment: -0.1, topicsFocus: ["Product Development", "Customer Experience"] },
        { name: "David Kim", speakingTime: 150, sentiment: 0.2, topicsFocus: ["Mobile App", "Product Development"] },
        { name: "Sarah Chen", speakingTime: 130, sentiment: -0.2, topicsFocus: ["Checkout Process", "Mobile App"] }
      ],
      actionItems: [
        "Prioritize mobile app redesign for Q2",
        "Allocate budget for checkout process improvements",
        "Schedule follow-up meeting to review NPS feedback",
        "Create timeline for mobile app development"
      ],
      insights: [
        "Team is aligned on prioritizing customer experience",
        "Mobile app and checkout process are the main pain points",
        "Budget allocation discussions were positive",
        "Overall sentiment declined when discussing current problems"
      ]
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      datasetId,
      transcript: mockTranscript,
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Error in test analysis:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis' },
      { status: 500 }
    );
  }
} 