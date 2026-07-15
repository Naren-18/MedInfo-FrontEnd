/**
 * `GET /api/profile` intentionally omits `publicProfileId` (see
 * MedicalProfileResponseDTO) — only the POST/PUT responses ever include it.
 * To let the Emergency Card page still work after a page reload without a
 * backend change, the id is cached locally, scoped per user, the moment
 * it's returned by create/update.
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
