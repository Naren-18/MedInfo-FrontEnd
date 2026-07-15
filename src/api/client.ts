import axios from "axios"
import { clearToken, getToken } from "@/lib/token-store"

/** Dispatched whenever an authenticated request comes back 401 — a previously
 * valid session is no longer valid (expired token, most likely, since the
 * JWT is short-lived and there's no refresh endpoint). AuthContext listens
 * for this and clears state; components then redirect to /login via the
 * normal ProtectedRoute check, no direct router dependency needed here. */
export const SESSION_EXPIRED_EVENT = "medinfo:session-expired"

/**
 * baseURL is always the relative "/api" — in dev, Vite's server.proxy
 * forwards this to the Gateway; in production, nginx does the same. The
 * browser never makes a cross-origin request, so no CORS handling is
 * needed anywhere, including in the backend.
 */
export const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && hadAuthHeader) {
      clearToken()
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  }
)

/**
 * A separate instance for the public emergency lookup — it must never
 * attach an Authorization header, even if the visitor happens to have a
 * valid session in another tab. First responders using this endpoint are
 * never logged in.
 */
export const publicHttp = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})
