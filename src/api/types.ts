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

/** Returned by GET /api/profile — includes publicProfileId per MedicalProfileResponseDTO. */
export interface MedicalProfileResponse extends MedicalProfileInput {
  publicProfileId: string
}

export interface EmergencyContactInput {
  name: string
  relationship: string
  phoneNumber: string
}

export interface EmergencyContact extends EmergencyContactInput {
  id: number
}

export interface EmergencyProfile {
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
