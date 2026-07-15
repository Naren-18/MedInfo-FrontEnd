import { AxiosError } from "axios"
import type { ApiErrorResponse } from "@/api/types"

/**
 * Every backend service returns the same {status, error, message} shape from
 * its GlobalExceptionHandler. This normalizes any thrown error — including
 * network failures where the backend never responded at all — into one
 * user-facing string.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorResponse | undefined

    if (data?.message) {
      return data.message
    }

    if (err.response?.status === 503) {
      return "A required service is temporarily unavailable. Please try again shortly."
    }

    if (!err.response) {
      return "Can't reach the server. Check your connection and try again."
    }

    return fallback
  }

  if (err instanceof Error) {
    return err.message || fallback
  }

  return fallback
}

export function getErrorStatus(err: unknown): number | undefined {
  if (err instanceof AxiosError) {
    return err.response?.status
  }
  return undefined
}
