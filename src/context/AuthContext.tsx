import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { login as apiLogin, register as apiRegister } from "@/api/auth"
import { SESSION_EXPIRED_EVENT } from "@/api/client"
import type { LoginRequest, RegisterRequest, DecodedToken } from "@/api/types"
import { clearToken, decodeToken, getToken, isTokenExpired, setToken } from "@/lib/token-store"

interface AuthContextValue {
  user: DecodedToken | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<DecodedToken | null>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const queryClient = useQueryClient()

  const applyToken = React.useCallback((token: string) => {
    setToken(token)
    setUser(decodeToken(token))
  }, [])

  const clearSession = React.useCallback(() => {
    clearToken()
    setUser(null)
    // Wipe any cached profile/contacts data from the previous session so a
    // subsequent login by a different user never briefly shows stale data.
    queryClient.clear()
  }, [queryClient])

  // Restore session on load, and treat an already-expired stored token the
  // same as no session at all.
  React.useEffect(() => {
    const existing = getToken()
    if (existing && !isTokenExpired(existing)) {
      setUser(decodeToken(existing))
    } else if (existing) {
      clearToken()
    }
    setIsInitializing(false)
  }, [])

  // The axios response interceptor dispatches this when an authenticated
  // request comes back 401 — the token is already cleared at that point,
  // this just syncs React state and tells the user why they were logged out.
  React.useEffect(() => {
    const handler = () => {
      setUser(null)
      queryClient.clear()
      toast.error("Your session has expired. Please log in again.")
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  }, [queryClient])

  const login = React.useCallback(
    async (payload: LoginRequest) => {
      const token = await apiLogin(payload)
      applyToken(token)
    },
    [applyToken]
  )

  const register = React.useCallback(async (payload: RegisterRequest) => {
    await apiRegister(payload)
  }, [])

  const logout = React.useCallback(() => {
    clearSession()
  }, [clearSession])

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
