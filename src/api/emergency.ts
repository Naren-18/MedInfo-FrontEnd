import { publicHttp } from "@/api/client"
import type { EmergencyProfile } from "@/api/types"

/** GET /api/emergency/{publicProfileId} — public, no auth header, no login
 * required. This is the endpoint a first responder's QR scan hits. */
export async function getEmergencyProfile(publicProfileId: string): Promise<EmergencyProfile> {
  const { data } = await publicHttp.get<EmergencyProfile>(`/emergency/${publicProfileId}`)
  return data
}
