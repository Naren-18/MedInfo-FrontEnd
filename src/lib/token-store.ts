import { jwtDecode } from "jwt-decode"
import type { DecodedToken } from "@/api/types"

const STORAGE_KEY = "medinfo_token"

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}

/** True if the token is missing, malformed, or past its exp claim. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const decoded = decodeToken(token)
  if (!decoded?.exp) return true
  // exp is seconds since epoch; Date.now() is ms.
  return decoded.exp * 1000 <= Date.now()
}
