import { AxiosError } from "axios"
import { http } from "@/api/client"
import type { EmergencyContact, EmergencyContactInput } from "@/api/types"

/**
 * NOTE on `id`: as verified directly against EmergencyContactsService.java,
 * EContactsDTO currently only serializes {name, relationship, phoneNumber} —
 * no id. Per the backend owner, an `id` field is being added to that DTO
 * (and to the objects returned by create/getContacts) as a small backend
 * change made separately from this frontend. This file is written against
 * that corrected contract — every EmergencyContact here is expected to
 * carry its `id`. If the backend change hasn't landed yet, edit/delete
 * actions will fail until it does.
 */

/** GET /api/contacts — the backend throws a 404 (ResourceNotFoundException)
 * when the list is empty rather than returning `200 []`. That 404 is
 * treated here as "no contacts yet", not an error. */
export async function listContacts(): Promise<EmergencyContact[]> {
  try {
    const { data } = await http.get<EmergencyContact[]>("/contacts")
    return data
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      return []
    }
    throw err
  }
}

/** POST /api/contacts — returns a plain confirmation string, not the created
 * object, so callers must refetch the list afterward. */
export async function createContact(payload: EmergencyContactInput): Promise<void> {
  await http.post<string>("/contacts", payload)
}

/** PUT /api/contacts/{id} — server-side ownership check; a 401 here should
 * never actually be reachable from this UI since the id always comes from
 * the user's own fetched list. */
export async function updateContact(id: number, payload: EmergencyContactInput): Promise<void> {
  await http.put<string>(`/contacts/${id}`, payload)
}

export async function deleteContact(id: number): Promise<void> {
  await http.delete<string>(`/contacts/${id}`)
}
