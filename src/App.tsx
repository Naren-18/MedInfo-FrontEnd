import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/layout/ProtectedRoute"
import { PageLoader } from "@/components/layout/PageLoader"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const RegisterPage = lazy(() => import("@/pages/RegisterPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const CheckEmailPage = lazy(() => import("@/pages/CheckEmailPage"))
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))
const ContactsPage = lazy(() => import("@/pages/ContactsPage"))
const EmergencyCardPage = lazy(() => import("@/pages/EmergencyCardPage"))
const PublicEmergencyPage = lazy(() => import("@/pages/PublicEmergencyPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"))
const TermsPage = lazy(() => import("@/pages/TermsPage"))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* The public emergency page intentionally has NO AppLayout (no navbar
            exposing authenticated navigation) — it's a standalone, distinct
            experience for an unauthenticated first responder. */}
        <Route path="/emergency/:publicProfileId" element={<PublicEmergencyPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />

          {/* Email verification: reachable whether or not someone is logged
              in on this browser, since the link can be opened anywhere. */}
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/emergency-card" element={<EmergencyCardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
