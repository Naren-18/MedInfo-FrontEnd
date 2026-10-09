import type { TimelineEvent } from "@/api/types"
import { TimelineEventDot, TimelineEventMeta } from "@/components/profile/TimelineEventMeta"

/** Read-only vertical timeline of AI-extracted events, oldest first. */
export function MedicalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-4">
      <ol className="relative ml-3.5 space-y-5 border-l border-border pl-6">
        {events.map((event, index) => (
          <li key={`${event.date}-${event.type}-${index}`} className="relative">
            <TimelineEventDot event={event} className="absolute -left-[39px] top-0" />
            <TimelineEventMeta event={event} />
            <p className="mt-0.5 text-sm font-medium">{event.title}</p>
            {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
          </li>
        ))}
      </ol>
      <TimelineDisclaimer />
    </div>
  )
}

export function TimelineDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground">
      Extracted by AI from uploaded reports. Verify with a medical professional.
    </p>
  )
}
