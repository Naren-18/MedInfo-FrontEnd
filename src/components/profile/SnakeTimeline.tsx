import type { ComponentType, CSSProperties } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import type { TimelineEvent } from "@/api/types"
import { TimelineEventDot, TimelineEventMeta } from "@/components/profile/TimelineEventMeta"

// Dot is h-7 (28px): lines run through its centre. Must match ROW_GAP_CLASS.
const DOT_CENTER_PX = 14
const ROW_GAP_PX = 40
const ROW_GAP_CLASS = "gap-10"

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

// How far the row-to-row turn sits outside the event columns. Event text has
// px-3 (12px) of padding, and the card has 24px, so this clears both.
const TURN_OUTSET_PX = 12

const pct = (columns: number, value: number) => `${(value / columns) * 100}%`

function TimelineArrow({
  icon: Icon,
  className = "",
  style,
}: {
  icon: ComponentType<{ className?: string }>
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={`absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ${className}`}
      style={style}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}

/**
 * Timeline laid out as a snake for wide screens: the first row runs left to
 * right, turns down at the end, the next runs right to left, and so on.
 * DOM order stays chronological (only grid placement is reversed), so
 * screen readers and copy-paste read events oldest first.
 */
export function SnakeTimeline({ events, columns }: { events: TimelineEvent[]; columns: number }) {
  const rows = chunk(events, columns)

  return (
    <div className={`flex flex-col ${ROW_GAP_CLASS}`} aria-label="Medical timeline, oldest first">
      {rows.map((row, rowIndex) => {
        const reversed = rowIndex % 2 === 1
        const isLastRow = rowIndex === rows.length - 1
        // 1-based grid column of the k-th event in this row.
        const columnOf = (k: number) => (reversed ? columns - k : k + 1)
        const firstColumn = columnOf(0)
        const endColumn = columnOf(row.length - 1)
        const leftColumn = Math.min(firstColumn, endColumn)
        const rightColumn = Math.max(firstColumn, endColumn)
        const Arrow = reversed ? ChevronLeft : ChevronRight

        return (
          <ol
            key={rowIndex}
            start={rowIndex * columns + 1}
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {/* Line through this row's dots */}
            {row.length > 1 && (
              <div
                aria-hidden
                className="absolute h-0.5 -translate-y-1/2 bg-primary/40"
                style={{
                  top: DOT_CENTER_PX,
                  left: pct(columns, leftColumn - 0.5),
                  width: pct(columns, rightColumn - leftColumn),
                }}
              />
            )}

            {/* Direction arrows between neighbouring events */}
            {row.slice(1).map((_, k) => (
              <TimelineArrow
                key={`arrow-${k}`}
                icon={Arrow}
                style={{ top: DOT_CENTER_PX, left: pct(columns, reversed ? columns - k - 1 : k + 1) }}
              />
            ))}

            {/* The turn to the next row, around the outside edge so it never
                crosses an event's text: out from this row's last dot, down,
                and back in to the next row's first dot (same column). */}
            {!isLastRow && (
              <div
                aria-hidden
                className={`absolute border-y-2 border-primary/40 ${
                  reversed ? "rounded-l-2xl border-l-2" : "rounded-r-2xl border-r-2"
                }`}
                style={{
                  top: DOT_CENTER_PX - 1,
                  bottom: -(ROW_GAP_PX + DOT_CENTER_PX + 1),
                  ...(reversed
                    ? { left: -TURN_OUTSET_PX, right: `calc(100% - ${pct(columns, endColumn - 0.5)})` }
                    : { left: pct(columns, endColumn - 0.5), right: -TURN_OUTSET_PX }),
                }}
              >
                <TimelineArrow
                  icon={ChevronDown}
                  className={reversed ? "-left-px" : "left-[calc(100%+1px)]"}
                  style={{ top: "50%" }}
                />
              </div>
            )}

            {row.map((event, k) => (
              <li
                key={`${event.date}-${event.type}-${k}`}
                className="flex flex-col items-center px-3 text-center"
                style={{ gridColumnStart: columnOf(k), gridRowStart: 1 }}
              >
                <TimelineEventDot event={event} className="relative z-10" />
                <TimelineEventMeta event={event} className="mt-2 justify-center" />
                <p className="mt-1 text-sm font-medium">{event.title}</p>
                {event.details && <p className="mt-0.5 text-sm text-muted-foreground">{event.details}</p>}
              </li>
            ))}
          </ol>
        )
      })}
    </div>
  )
}
