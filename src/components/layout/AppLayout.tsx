import { Suspense } from "react"
import { Outlet } from "react-router-dom"

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
      <footer className="no-print border-t border-border py-6 text-center text-xs text-muted-foreground">
        MedInfo — emergency medical information, available instantly, no login required.
      </footer>
    </>
  )
}
