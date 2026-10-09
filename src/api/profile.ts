import { AxiosError } from "axios"
import { http } from "@/api/client"
import type {
  MedicalProfile,
  MedicalProfileInput,
  MedicalProfileResponse,
  MedicalReportUpload,
} from "@/api/types"

/** GET /api/profile — 404 if the user hasn't created one yet; that case is
 * represented as `null` here rather than a thrown error, since "no profile
 * yet" is a normal, expected state for the UI, not a failure. Returns
 * MedicalProfileResponseDTO, including publicProfileId. */
export async function getProfile(): Promise<MedicalProfileResponse | null> {
  try {
    const { data } = await http.get<MedicalProfileResponse>("/profile")
    return data
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

/** POST /api/profile — 409 if one already exists (one per user). Returns
 * the full persisted entity, including publicProfileId — the only response
 * in the whole API that ever exposes it. */
export async function createProfile(payload: MedicalProfileInput): Promise<MedicalProfile> {
  const { data } = await http.post<MedicalProfile>("/profile", payload)
  return data
}

/** PUT /api/profile — also returns the full entity (incl. publicProfileId),
 * and evicts the Redis-cached emergency response server-side. */
export async function updateProfile(payload: MedicalProfileInput): Promise<MedicalProfile> {
  const { data } = await http.put<MedicalProfile>("/profile", payload)
  return data
}

/** DELETE /api/profile — returns a plain confirmation string. */
export async function deleteProfile(): Promise<void> {
  await http.delete<string>("/profile")
}

/** POST /api/profile/reports — multipart upload of one PDF in the "file"
 * field. 202 means accepted only; the AI summary on GET /api/profile
 * updates later, in the background. The JSON default Content-Type on `http`
 * must be overridden here: with it, axios would serialize the FormData to
 * JSON. With "multipart/form-data", axios drops the header in the browser
 * and lets it set its own, including the boundary. */
export async function uploadReport(
  file: File,
  onProgress?: (percent: number) => void
): Promise<MedicalReportUpload> {
  const form = new FormData()
  form.append("file", file)

  const { data } = await http.post<MedicalReportUpload>("/profile/reports", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    },
  })
  return data
}
