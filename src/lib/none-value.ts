// Canonical value sent to the backend when a user has nothing to report for
// allergies / medical conditions / current medications. The backend requires
// these fields non-blank (@NotBlank), so "optional" isn't available without
// a backend change — this keeps the field required but replaces free-typed
// "None"/"none"/"n/a" (inconsistent casing, unusable for filtering later)
// with a single canonical string chosen via a toggle, not typed by hand.
export const NONE_VALUE = "None"

const NONE_PATTERNS = new Set([
  "none",
  "n/a",
  "na",
  "nil",
  "nothing",
  "not applicable",
])

// Treats blank as "none" too, so existing profiles created before this
// change (or any data with an unexpected empty value) still land in the
// toggle-on state instead of an empty, seemingly-broken textarea.
export function isNoneValue(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return true
  return NONE_PATTERNS.has(value.trim().toLowerCase())
}
