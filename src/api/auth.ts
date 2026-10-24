import { http } from "@/api/client"
import type { LoginRequest, RegisterRequest } from "@/api/types"

/** POST /api/auth/register — 200 returns a plain confirmation string, 409 on duplicate email. */
export async function register(payload: RegisterRequest): Promise<string> {
  const { data } = await http.post<string>("/auth/register", payload)
  return data
}

/** POST /api/auth/login — 200 returns the raw JWT string, 401 on bad
 * credentials, 403 when the password is right but the email isn't verified. */
export async function login(payload: LoginRequest): Promise<string> {
  const { data } = await http.post<string>("/auth/login", payload)
  return data
}

/** POST /api/auth/verify-email — the token comes from the link in the
 * verification email. 200 on success, 400 if invalid, used or expired. */
export async function verifyEmail(token: string): Promise<string> {
  const { data } = await http.post<string>("/auth/verify-email", { token })
  return data
}

/** POST /api/auth/delete-account — deletes the logged-in user's account and
 * all of its medical data. 400 if the password is wrong, 503 if the medical
 * data couldn't be deleted (the account is then kept and can be retried). */
export async function deleteAccount(password: string): Promise<string> {
  const { data } = await http.post<string>("/auth/delete-account", { password })
  return data
}

/** POST /api/auth/resend-verification — always 200 with the same message,
 * whether or not the email is registered (so it can't be used to look up
 * accounts). The server also limits how often it actually sends. */
export async function resendVerification(email: string): Promise<string> {
  const { data } = await http.post<string>("/auth/resend-verification", { email })
  return data
}
