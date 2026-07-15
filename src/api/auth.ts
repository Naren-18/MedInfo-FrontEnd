import { http } from "@/api/client"
import type { LoginRequest, RegisterRequest } from "@/api/types"

/** POST /api/auth/register — 200 returns a plain confirmation string, 409 on duplicate email. */
export async function register(payload: RegisterRequest): Promise<string> {
  const { data } = await http.post<string>("/auth/register", payload)
  return data
}

/** POST /api/auth/login — 200 returns the raw JWT string, 401 on bad credentials. */
export async function login(payload: LoginRequest): Promise<string> {
  const { data } = await http.post<string>("/auth/login", payload)
  return data
}
