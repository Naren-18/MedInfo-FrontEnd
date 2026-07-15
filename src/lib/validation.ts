import { z } from "zod"

// Every rule here mirrors the backend's @NotBlank/@Email/@Size/@Min/@Max/
// @Positive/@Pattern annotations exactly (see Architecture.md), so a
// submission that passes client-side validation practically never bounces
// off a 400 from the server.

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const medicalProfileSchema = z.object({
  age: z.coerce
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or less"),
  gender: z.string().trim().min(1, "Gender is required"),
  bloodGroup: z.string().trim().min(1, "Blood group is required"),
  height: z.coerce.number({ error: "Height is required" }).positive("Height must be greater than 0"),
  weight: z.coerce.number({ error: "Weight is required" }).positive("Weight must be greater than 0"),
  allergies: z.string().trim().min(1, "Enter allergies, or \"None\" if not applicable"),
  medicalConditions: z.string().trim().min(1, "Enter medical conditions, or \"None\" if not applicable"),
  currentMedications: z.string().trim().min(1, "Enter current medications, or \"None\" if not applicable"),
  organDonor: z.boolean(),
})
// z.coerce.number() has a different input type (unknown, pre-coercion) than
// output type (number, post-coercion) — react-hook-form needs both to type
// the form correctly: the form manages the input shape, onSubmit receives
// the coerced output shape.
export type MedicalProfileFormInput = z.input<typeof medicalProfileSchema>
export type MedicalProfileFormValues = z.output<typeof medicalProfileSchema>

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  relationship: z.string().trim().min(1, "Relationship is required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number, digits only"),
})
export type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const
export const GENDERS = ["Male", "Female", "Other"] as const
export const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Relative",
  "Other",
] as const
