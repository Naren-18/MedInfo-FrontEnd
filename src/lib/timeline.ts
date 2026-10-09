import type { ComponentType } from "react"
import {
  CalendarClock,
  DoorOpen,
  FlaskConical,
  Hospital,
  Pill,
  Radiation,
  Scissors,
  Stethoscope,
  Syringe,
} from "lucide-react"

import type { TimelineEvent, TimelineEventType } from "@/api/types"

export const TIMELINE_TYPE_META: Record<
  TimelineEventType,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  ADMISSION: { label: "Admission", icon: Hospital },
  DIAGNOSIS: { label: "Diagnosis", icon: Stethoscope },
  PROCEDURE: { label: "Procedure", icon: Scissors },
  CHEMOTHERAPY: { label: "Chemotherapy", icon: Syringe },
  RADIATION: { label: "Radiation", icon: Radiation },
  TEST: { label: "Test", icon: FlaskConical },
  MEDICATION_CHANGE: { label: "Medication", icon: Pill },
  DISCHARGE: { label: "Discharge", icon: DoorOpen },
  FOLLOW_UP: { label: "Follow-up", icon: CalendarClock },
}

export function timelineTypeMeta(event: TimelineEvent) {
  return TIMELINE_TYPE_META[event.type] ?? TIMELINE_TYPE_META.TEST
}

// Event dates are calendar dates, not instants, so they're built in local
// time — parsing "2026-03-21" with Date() would read it as UTC midnight and
// can show the previous day west of UTC.
export function formatEventDate(event: TimelineEvent): string {
  const [year, month = 1, day = 1] = event.date.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  switch (event.datePrecision) {
    case "DAY":
      return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    case "MONTH":
      return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
    default:
      return String(year)
  }
}

// Compared only to the precision the report gave: a "2026-11" follow-up is
// upcoming until November 2026 is over, and a dated one through that day.
export function isUpcoming(event: TimelineEvent): boolean {
  if (event.type !== "FOLLOW_UP") return false

  const now = new Date()
  const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  const parts = event.date.split("-").map(Number)

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== today[i]) return parts[i] > today[i]
  }
  return true
}
