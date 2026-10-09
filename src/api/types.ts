// Types mirror the backend DTOs exactly (see MedInfo-Backend-Microservices/Architecture.md).

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

/** Decoded from the JWT payload (sub, userId, role, iat, exp). Display-only. */
export interface DecodedToken {
  sub: string
  userId: number
  role: string
  iat: number
  exp: number
}

export interface MedicalProfileInput {
  age: number
  gender: string
  bloodGroup: string
  height: number
  weight: number
  allergies: string
  medicalConditions: string
  currentMedications: string
  organDonor: boolean
}

/** Returned by POST /api/profile — includes the identifiers the input doesn't have. */
export interface MedicalProfile extends MedicalProfileInput {
  id?: number
  userId?: number
  publicProfileId: string
}

/** AI summary fields on both GET /api/profile and GET /api/emergency/{id}.
 * Null until the first uploaded report has been processed. summaryGeneratedAt
 * is an ISO-8601 LocalDateTime with no zone — server time, which is UTC. */
export interface AiSummaryFields {
  aiSummary: string | null
  summaryGeneratedAt: string | null
  /** Oldest first. May be null in an emergency response cached before the
   * timeline existed — treat as empty. */
  timeline: TimelineEvent[] | null
}

export type TimelineEventType =
  | "ADMISSION"
  | "DIAGNOSIS"
  | "PROCEDURE"
  | "CHEMOTHERAPY"
  | "RADIATION"
  | "TEST"
  | "MEDICATION_CHANGE"
  | "DISCHARGE"
  | "FOLLOW_UP"

export type DatePrecision = "DAY" | "MONTH" | "YEAR"

/** One dated event extracted by AI from an uploaded report. */
export interface TimelineEvent {
  /** "YYYY-MM-DD", "YYYY-MM" or "YYYY", matching datePrecision. */
  date: string
  datePrecision: DatePrecision
  type: TimelineEventType
  title: string
  details: string | null
  /** Read by AI from a photographed/scanned page — shown with a "verify" label. */
  fromPhoto: boolean
}

/** Returned by GET /api/profile — includes publicProfileId per MedicalProfileResponseDTO. */
export interface MedicalProfileResponse extends MedicalProfileInput, AiSummaryFields {
  publicProfileId: string
}

/** Returned by POST /api/profile/reports (202) — the file was accepted, not
 * yet summarized. */
export interface MedicalReportUpload {
  id: number
  fileName: string
  status: string
  uploadedAt: string
}

export interface EmergencyContactInput {
  name: string
  relationship: string
  phoneNumber: string
}

export interface EmergencyContact extends EmergencyContactInput {
  id: number
}

export interface EmergencyProfile extends AiSummaryFields {
  fullName: string
  age: number
  gender: string
  bloodGroup: string
  allergies: string
  medicalConditions: string
  currentMedications: string
  organDonor: boolean
  emergencyContacts: EmergencyContact[]
}

/** Consistent shape returned by every service's GlobalExceptionHandler. */
export interface ApiErrorResponse {
  timestamp?: string
  status: number
  error: string
  message: string
  path?: string
}
