import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RecentInsights() {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Speaker Effectiveness Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Emily's presentation style generates 15% higher engagement than other speakers. Her use of visual aids and
          interactive questions keeps audience attention. Consider having Emily conduct a presentation skills workshop
          for the team.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Based on analysis of 12 meetings</div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Meeting Length Optimization</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Engagement drops significantly after 45 minutes. Consider shorter, more focused meetings with clear agendas.
          Meetings with visual aids receive 30% more positive reactions.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Based on meeting data from the last 60 days</div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Topic Sentiment Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Discussions about resource allocation consistently generate negative sentiment (62% average). Consider
          restructuring how these topics are presented and discussed, possibly with pre-meeting materials and more
          collaborative decision-making processes.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Based on analysis of 8 recent meetings</div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

