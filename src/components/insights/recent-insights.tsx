import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RecentInsights() {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Speaker Effectiveness Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No Real-Time Insights data available for this meeting.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground"></div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Meeting Length Optimization</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No Real-Time Insights data available for this meeting.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground"></div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Topic Sentiment Analysis</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No Real-Time Insights data available for this meeting.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground"></div>
          <Button variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

