"use client"

import { Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SpeakerInsight {
  speaker: string
  sentiment: number
  insights: string[]
  recommendations: string[]
  communicationStyle: string
  teamImpact: string
}

const speakerInsights: SpeakerInsight[] = [
  {
    speaker: "Sarah Johnson",
    sentiment: 82,
    insights: [
      "Consistently generates positive sentiment when discussing marketing strategy",
      "Uses inclusive language that resonates well with the team",
      "Balances optimism with realistic expectations",
      "Effectively uses visual aids to support key points",
    ],
    recommendations: [
      "Continue using inclusive language and visual aids",
      "Share presentation techniques with other team members",
      "Consider leading more discussions on strategic initiatives",
    ],
    communicationStyle:
      "Sarah uses a collaborative communication style with frequent check-ins for team input. Her presentations are well-structured with clear objectives and visual support. She maintains a positive tone while acknowledging challenges, which creates a balanced perspective that resonates with listeners.",
    teamImpact:
      "Sarah's communication style creates a 15% higher engagement rate compared to average. Team members are more likely to contribute ideas following her presentations, and follow-up actions have a 22% higher completion rate.",
  },
  {
    speaker: "Michael Chen",
    sentiment: 76,
    insights: [
      "Data-driven approach generates confidence in sales projections",
      "Technical explanations sometimes reduce engagement from non-technical team members",
      "Enthusiasm about results positively impacts overall sentiment",
      "Uses concrete examples that resonate with the team",
    ],
    recommendations: [
      "Simplify technical explanations for broader audience understanding",
      "Continue using concrete examples and success stories",
      "Consider incorporating more visual elements in presentations",
    ],
    communicationStyle:
      "Michael employs a direct, data-focused communication style that emphasizes results and metrics. He uses specific examples to illustrate points and speaks with authority on sales topics. His enthusiasm is evident when sharing positive results, which elevates team sentiment.",
    teamImpact:
      "Michael's data-driven approach builds credibility but can create engagement gaps with non-technical team members. When he simplifies complex information, team comprehension increases by approximately 30%. His positive delivery of results creates momentum for subsequent discussions.",
  },
  {
    speaker: "David Wilson",
    sentiment: 68,
    insights: [
      "Raises important concerns that need addressing",
      "Delivery style sometimes perceived as overly critical",
      "Technical expertise is respected but presentation could be more solution-oriented",
      "Sentiment drops when discussing resource constraints",
    ],
    recommendations: [
      "Balance concerns with potential solutions",
      "Use more collaborative language when discussing challenges",
      "Consider framing constraints as opportunities for innovation",
      "Provide advance materials before raising complex concerns",
    ],
    communicationStyle:
      "David employs a direct, analytical communication style focused on identifying potential issues and constraints. He prioritizes accuracy and thoroughness over emotional appeal, often challenging assumptions with detailed analysis. His communication tends to be problem-focused rather than solution-oriented.",
    teamImpact:
      "When David raises concerns, team sentiment typically drops by 12-15%. However, addressing his points has prevented project issues in 68% of cases. Team members value his perspective but would prefer a more balanced approach that includes potential solutions alongside identified problems.",
  },
  {
    speaker: "Emily Rodriguez",
    sentiment: 84,
    insights: [
      "Highest sentiment scores across all speakers",
      "Effectively balances technical details with accessible explanations",
      "Uses storytelling techniques that engage the entire team",
      "Proactively addresses concerns with solution-focused approaches",
    ],
    recommendations: [
      "Share communication techniques with the broader team",
      "Consider leading communication training sessions",
      "Continue using storytelling and solution-focused approaches",
    ],
    communicationStyle:
      "Emily uses a highly engaging communication style that combines storytelling with clear technical explanations. She anticipates questions and addresses them proactively, creating a sense of thoroughness. Her approach is solution-oriented, presenting challenges alongside practical recommendations.",
    teamImpact:
      "Emily's communication generates the highest engagement levels, with team sentiment increasing by an average of 18% during her presentations. Follow-up discussions are 35% more productive, and implementation of her suggestions has a 78% success rate due to clear understanding and team buy-in.",
  },
  {
    speaker: "James Taylor",
    sentiment: 72,
    insights: [
      "Effectively summarizes complex discussions",
      "Creates clarity around action items and responsibilities",
      "Sometimes perceived as too process-focused",
      "Sentiment is highest when providing structure to ambiguous topics",
    ],
    recommendations: [
      "Continue providing clear summaries and action items",
      "Balance process focus with acknowledgment of team creativity",
      "Consider more interactive approaches when assigning tasks",
    ],
    communicationStyle:
      "James employs a structured, process-oriented communication style that excels at summarizing discussions and clarifying next steps. He is concise and focused on outcomes, preferring definitive statements over open-ended questions. His delivery is consistent and measured, maintaining an even tone throughout presentations.",
    teamImpact:
      "James's communication style increases team clarity by approximately 40% following complex discussions. His structured approach to action items improves follow-through rates by 25%. Team members appreciate his summaries but occasionally find his process focus constraining for creative discussions.",
  },
]

export function SpeakerSentimentInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Speaker Sentiment Insights</CardTitle>
        <CardDescription>Detailed analysis of how speaker communication affects team sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sarah">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sarah">Sarah</TabsTrigger>
            <TabsTrigger value="michael">Michael</TabsTrigger>
            <TabsTrigger value="david">David</TabsTrigger>
            <TabsTrigger value="emily">Emily</TabsTrigger>
            <TabsTrigger value="james">James</TabsTrigger>
          </TabsList>

          {speakerInsights.map((speaker) => (
            <TabsContent key={speaker.speaker.toLowerCase()} value={speaker.speaker.split(" ")[0].toLowerCase()}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{speaker.speaker}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sentiment Score:</span>
                    <span
                      className={`font-medium ${
                        speaker.sentiment >= 80
                          ? "text-green-500"
                          : speaker.sentiment >= 70
                            ? "text-emerald-500"
                            : speaker.sentiment >= 60
                              ? "text-amber-500"
                              : "text-red-500"
                      }`}
                    >
                      {speaker.sentiment}%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <Info className="h-4 w-4 text-blue-500" />
                    Communication Style
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">{speaker.communicationStyle}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <Info className="h-4 w-4 text-purple-500" />
                    Team Impact
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">{speaker.teamImpact}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Key Insights</h4>
                    <ul className="mt-2 space-y-2">
                      {speaker.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="mt-2 space-y-2">
                      {speaker.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium">What This Sentiment Score Means</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {speaker.sentiment >= 80
                      ? "An excellent sentiment score (80%+) indicates highly effective communication that resonates strongly with the team. This speaker creates engagement, clarity, and positive momentum."
                      : speaker.sentiment >= 70
                        ? "A good sentiment score (70-79%) shows effective communication with room for minor improvements. This speaker generally connects well with the audience but may have specific areas to enhance."
                        : speaker.sentiment >= 60
                          ? "A moderate sentiment score (60-69%) indicates communication that meets basic needs but has significant room for improvement. Some aspects may create disconnection or confusion."
                          : "A low sentiment score (below 60%) suggests communication challenges that need immediate attention. This may be creating team friction, confusion, or disengagement."}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

