import { Camera } from "lucide-react"

import type { TimelineEvent } from "@/api/types"
import { formatEventDate, isUpcoming, timelineTypeMeta } from "@/lib/timeline"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/** Date, type and status badges for one timeline event. */
export function TimelineEventMeta({ event, className }: { event: TimelineEvent; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <time dateTime={event.date} className="text-xs font-medium text-muted-foreground">
        {formatEventDate(event)}
      </time>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">· {timelineTypeMeta(event).label}</span>
      {isUpcoming(event) && <Badge variant="warning">Upcoming</Badge>}
      {event.fromPhoto && (
        <Badge
          variant="outline"
          className="gap-1 font-normal text-muted-foreground"
          title="Read by AI from a photo of the report. Check the date against the original."
        >
          <Camera className="h-3 w-3" />
          From photo, verify
        </Badge>
      )}
    </div>
  )
}

/** The round icon marking an event on either timeline layout. */
export function TimelineEventDot({ event, className }: { event: TimelineEvent; className?: string }) {
  const Icon = timelineTypeMeta(event).icon
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border bg-card ring-4 ring-card",
        isUpcoming(event) ? "border-amber-500/60 text-amber-600" : "border-border text-primary",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}
