import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { PageLoader } from "@/components/layout/PageLoader"

/** Guards authenticated-only routes. Redirects to /login, remembering where
 * the user was headed so they land back there after signing in. */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

/** Guards /login and /register — an already-authenticated user shouldn't
 * see them; send them to the dashboard instead. */
export function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
