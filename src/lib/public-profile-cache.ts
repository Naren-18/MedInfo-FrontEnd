/**
 * `publicProfileId` is served by the backend on GET/POST/PUT /api/profile
 * and is the source of truth. This local, per-user cache is only a
 * fast-path fallback (e.g. for a brief moment before the profile query
 * resolves) — it must never be the sole source of the id.
 */

const KEY_PREFIX = "medinfo_public_profile_id_"

export function cachePublicProfileId(userId: number, publicProfileId: string): void {
  localStorage.setItem(`${KEY_PREFIX}${userId}`, publicProfileId)
}

export function getCachedPublicProfileId(userId: number): string | null {
  return localStorage.getItem(`${KEY_PREFIX}${userId}`)
}

export function clearCachedPublicProfileId(userId: number): void {
  localStorage.removeItem(`${KEY_PREFIX}${userId}`)
}
