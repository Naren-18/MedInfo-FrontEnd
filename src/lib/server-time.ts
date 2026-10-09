/**
 * The backend serializes LocalDateTime as ISO-8601 with no zone (e.g.
 * "2026-10-04T09:16:10.123456"), in server time — UTC in Docker. Parsing it
 * as-is would read it as the viewer's local time, so a "Z" is appended.
 * Fractional seconds are trimmed to milliseconds since not every browser
 * accepts microsecond precision in Date parsing.
 */
export function parseServerDateTime(value: string | null | undefined): Date | null {
  if (!value) return null

  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value)
  const normalized = value.replace(/(\.\d{3})\d+/, "$1")
  const date = new Date(hasZone ? normalized : `${normalized}Z`)

  return Number.isNaN(date.getTime()) ? null : date
}

/** "4 Oct 2026, 2:46 pm" in the viewer's locale and timezone. */
export function formatServerDateTime(value: string | null | undefined): string | null {
  const date = parseServerDateTime(value)
  if (!date) return null

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
