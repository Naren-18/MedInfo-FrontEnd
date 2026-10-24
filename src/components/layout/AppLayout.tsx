import { Suspense } from "react"
import { Link, Outlet } from "react-router-dom"

import { Navbar } from "@/components/layout/Navbar"
import { PageLoader } from "@/components/layout/PageLoader"

export function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        {/* No wrapper enter animation here — each page already animates its
            own content in on mount. Adding one at this level double-applies
            the same fade/slide (page wrapper, then page content again),
            which reads as the page "loading twice". */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="no-print space-y-2 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>MedInfo — emergency medical information, available instantly, no login required.</p>
        <p>
          <Link to="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link to="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </Link>
          {" · "}Not medical advice
        </p>
      </footer>
    </>
  )
}
