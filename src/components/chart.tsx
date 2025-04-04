"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// Create a simple chart container component
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  config?: ChartConfig
  children: React.ReactNode
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, title, description, className, children, config = {}, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <ChartContext.Provider value={{ config }}>
        <div className={cn("space-y-2", className)} {...props} data-chart={chartId} ref={ref}>
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          <div
            className={cn(
              "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
              className,
            )}
          >
            <ChartStyle id={chartId} config={config} />
            {children}
          </div>
        </div>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

// Create a simple chart tooltip component
export function ChartTooltip({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
      {children}
    </div>
  )
}

// Create a tooltip content component
interface ChartTooltipContentProps {
  title?: string
  content?: Array<{
    label?: string
    value?: string | number
    color?: string
  }>
  hideLabel?: boolean
}

export function ChartTooltipContent({ title, content = [], hideLabel = false }: ChartTooltipContentProps) {
  // Ensure content is an array to prevent "Cannot convert undefined or null to object" error
  const safeContent = Array.isArray(content) ? content : []

  return (
    <div className="grid gap-2">
      {title && <p className="text-sm font-medium">{title}</p>}
      {safeContent.length > 0 && (
        <div className="grid gap-1">
          {safeContent.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {item.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />}
                {!hideLabel && <span className="text-xs text-muted-foreground">{item.label}</span>}
              </div>
              <span className="text-xs font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { ChartContext, ChartStyle, useChart }

