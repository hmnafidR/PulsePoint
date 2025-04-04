import { AlertTriangle } from "lucide-react"

import { Progress } from "@/components/ui/progress"

export function SentimentAlerts() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-medium">Engineering</span>
          </div>
          <span className="text-sm text-muted-foreground">58%</span>
        </div>
        <Progress value={58} className="h-2" indicatorColor="bg-destructive" />
        <p className="text-xs text-muted-foreground">15% decrease in the last 30 days. Work-life balance concerns.</p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-medium">Sales</span>
          </div>
          <span className="text-sm text-muted-foreground">62%</span>
        </div>
        <Progress value={62} className="h-2" indicatorColor="bg-destructive" />
        <p className="text-xs text-muted-foreground">
          8% decrease in the last 30 days. Concerns about targets and compensation.
        </p>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Finance</span>
          </div>
          <span className="text-sm text-muted-foreground">68%</span>
        </div>
        <Progress value={68} className="h-2" indicatorColor="bg-amber-500" />
        <p className="text-xs text-muted-foreground">5% decrease in the last 30 days. Workload concerns.</p>
      </div>
    </div>
  )
}

