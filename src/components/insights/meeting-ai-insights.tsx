"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpeakerSentimentInsights } from "@/components/insights/speaker-sentiment-insights"
import { CommunicationPatterns } from "@/components/insights/communication-patterns"
import { QuestionAnalysis } from "@/components/analysis/question-analysis"
import { EngagementGaps } from "@/components/analysis/engagement-gaps"

export function MeetingAIInsights() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Summary Insights</CardTitle>
          <CardDescription>AI-generated insights from meeting analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="action-items">Action Items</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <div className="rounded-lg border p-4">
                <p className="text-sm">
                  The meeting began with Sarah discussing the Q3 marketing strategy, focusing on digital campaigns and
                  social media presence. Michael then presented the sales figures, highlighting a 15% increase in new
                  customer acquisition. David raised concerns about resource allocation for the upcoming product launch,
                  which led to a discussion about priorities and timeline adjustments. Emily proposed a new approach to
                  customer onboarding that received positive feedback from the team. The meeting concluded with James
                  summarizing action items and assigning responsibilities.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Key Takeaways</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li>• Q1 revenue exceeded targets by 15%</li>
                    <li>• New product launch scheduled for next month</li>
                    <li>• Engineering team completed major infrastructure upgrade</li>
                    <li>• Customer satisfaction scores improved by 8% this quarter</li>
                    <li>• New hiring plan approved for Q2</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Sentiment Analysis</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Overall meeting sentiment was positive (76%). Emily's presentation on customer onboarding generated
                    the most positive reactions (84%). There was a noticeable drop in sentiment (62%) during the
                    resource allocation discussion, indicating this is an area of concern for the team.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="action-items">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Marketing Team</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    <li>Finalize Q3 digital campaign strategy by Friday</li>
                    <li>Coordinate with Sales on lead generation targets</li>
                    <li>Prepare social media content calendar for review</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Product Team</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    <li>Revise product launch timeline based on resource allocation discussion</li>
                    <li>Implement Emily's customer onboarding improvements</li>
                    <li>Schedule follow-up meeting to review progress next week</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Engineering Team</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    <li>Complete infrastructure upgrade documentation</li>
                    <li>Provide resource estimates for new product features</li>
                    <li>Address technical debt items identified during the meeting</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="recommendations">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Meeting Structure</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Consider restructuring meetings to keep them under 45 minutes, as engagement dropped significantly
                    after this point. Break longer topics into separate focused meetings with clear agendas.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Presentation Improvements</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Visual aids with data visualization received 30% more positive reactions than text-heavy slides.
                    Encourage all presenters to use more visual elements in their presentations.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Discussion Facilitation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Resource allocation discussions consistently generate lower sentiment scores. Consider using a
                    structured decision-making framework and providing materials in advance to make these discussions
                    more productive.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Speaker Effectiveness</CardTitle>
            <CardDescription>Analysis of speaker impact and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Top Performing Speaker</h3>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Emily Rodriguez</span> - Generated the highest engagement (84%) with her
                  customer onboarding presentation. Her use of visual aids and interactive questions kept audience
                  attention.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Areas for Improvement</h3>
                <p className="mt-2 text-sm">
                  <span className="font-medium">David Wilson</span> - Technical explanations about resource allocation
                  generated lower engagement (62%). Consider simplifying complex topics and providing more context.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Analysis</CardTitle>
            <CardDescription>Sentiment by discussion topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">High Engagement Topics</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Customer Onboarding (84% sentiment)</li>
                  <li>• Sales Results (78% sentiment)</li>
                  <li>• Product Roadmap (76% sentiment)</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Low Engagement Topics</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Resource Allocation (62% sentiment)</li>
                  <li>• Budget Constraints (65% sentiment)</li>
                  <li>• Technical Debt (68% sentiment)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SpeakerSentimentInsights />
      <CommunicationPatterns />
      <QuestionAnalysis />
      <EngagementGaps />
    </div>
  )
}

