"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CommunicationPattern {
  pattern: string
  impact: string
  sentiment: number
  examples: string[]
  recommendations: string[]
}

const communicationPatterns: CommunicationPattern[] = [
  {
    pattern: "Solution-Focused Language",
    impact: "Increases sentiment by 15-20%",
    sentiment: 85,
    examples: [
      '"Here\'s an approach we could take to solve this..."',
      '"I\'ve identified three potential solutions we could explore..."',
      '"While this is challenging, we have several options available..."',
    ],
    recommendations: [
      "Present problems alongside potential solutions",
      "Use collaborative language like 'we' and 'together'",
      "Frame challenges as opportunities for innovation",
      "Provide specific, actionable next steps",
    ],
  },
  {
    pattern: "Problem-Focused Language",
    impact: "Decreases sentiment by 10-15%",
    sentiment: 62,
    examples: [
      '"This won\'t work because..."',
      '"We don\'t have enough resources to..."',
      '"The timeline is unrealistic and will fail..."',
    ],
    recommendations: [
      "Balance problem statements with potential solutions",
      "Use 'yes, and...' instead of 'no, but...'",
      "Acknowledge constraints while focusing on what's possible",
      "Suggest specific alternatives when identifying issues",
    ],
  },
  {
    pattern: "Inclusive Language",
    impact: "Increases sentiment by 12-18%",
    sentiment: 82,
    examples: [
      '"What are your thoughts on this approach?"',
      "\"I'd like to hear everyone's perspective on this...\"",
      '"Let\'s build on that idea together..."',
    ],
    recommendations: [
      "Actively invite input from all team members",
      "Acknowledge and build upon others' contributions",
      "Use 'we' language rather than 'I' or 'you'",
      "Create space for diverse perspectives",
    ],
  },
  {
    pattern: "Technical Jargon",
    impact: "Varies by audience (-5% to +10%)",
    sentiment: 68,
    examples: [
      "Using specialized terminology without explanation",
      "Acronyms that aren't universally understood",
      "Complex concepts without simplified analogies",
    ],
    recommendations: [
      "Gauge audience familiarity before using specialized terms",
      "Define technical terms when first introduced",
      "Use analogies to explain complex concepts",
      "Balance technical depth with accessibility",
    ],
  },
  {
    pattern: "Storytelling",
    impact: "Increases sentiment by 20-25%",
    sentiment: 88,
    examples: [
      "Using relevant case studies or examples",
      "Framing information as a narrative with context",
      "Connecting data points into a coherent story",
    ],
    recommendations: [
      "Structure key points as a narrative with beginning, middle, and end",
      "Use concrete examples that resonate with the audience",
      "Connect data to real-world impact through stories",
      "Include relevant context that makes information meaningful",
    ],
  },
]

export function CommunicationPatterns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Patterns & Sentiment Impact</CardTitle>
        <CardDescription>How different communication styles affect team sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="solution">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="solution">Solution-Focused</TabsTrigger>
            <TabsTrigger value="problem">Problem-Focused</TabsTrigger>
            <TabsTrigger value="inclusive">Inclusive</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="storytelling">Storytelling</TabsTrigger>
          </TabsList>

          {communicationPatterns.map((pattern) => (
            <TabsContent
              key={pattern.pattern.toLowerCase().replace(/\s+/g, "-")}
              value={pattern.pattern.toLowerCase().split(" ")[0]}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{pattern.pattern}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sentiment Impact:</span>
                    <span
                      className={`font-medium ${
                        pattern.sentiment >= 80
                          ? "text-green-500"
                          : pattern.sentiment >= 70
                            ? "text-emerald-500"
                            : pattern.sentiment >= 60
                              ? "text-amber-500"
                              : "text-red-500"
                      }`}
                    >
                      {pattern.sentiment}%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Impact on Team Sentiment</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{pattern.impact}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Examples</h4>
                    <ul className="mt-2 space-y-2">
                      {pattern.examples.map((example, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="mt-2 space-y-2">
                      {pattern.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium">Why This Matters</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pattern.pattern === "Solution-Focused Language"
                      ? "Solution-focused language creates psychological safety and empowers team members. When speakers present solutions alongside problems, it signals competence and forward thinking, leading to higher engagement and more productive discussions."
                      : pattern.pattern === "Problem-Focused Language"
                        ? "Problem-focused language without solutions can create anxiety and disengagement. While identifying issues is important, doing so without offering alternatives can lower team morale and reduce creative thinking about possible solutions."
                        : pattern.pattern === "Inclusive Language"
                          ? "Inclusive language signals respect and values diverse perspectives. When team members feel their input is welcomed, they engage more deeply with the discussion and develop stronger commitment to outcomes and decisions."
                          : pattern.pattern === "Technical Jargon"
                            ? "Technical language can demonstrate expertise but may create barriers to understanding. The impact varies significantly based on audience knowledge - with technical audiences, appropriate jargon builds credibility, while with mixed audiences, it can create confusion."
                            : "Storytelling creates emotional connection and improves information retention. The human brain is wired to process and remember narratives more effectively than isolated facts, making storytelling one of the most powerful tools for persuasive communication."}
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

