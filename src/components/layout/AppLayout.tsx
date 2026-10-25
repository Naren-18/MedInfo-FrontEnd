import { Suspense } from "react"
import { ArrowUpRight } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

import { Navbar } from "@/components/layout/Navbar"
import { PageLoader } from "@/components/layout/PageLoader"

const CREATOR_NAME = "Narendra Kumar Vetapalem"
const CREATOR_PORTFOLIO_URL = "https://narendra-kumar.vercel.app/"

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
        <p className="pt-2">
          <a
            href={CREATOR_PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Designed &amp; built by
            <span className="font-semibold text-foreground group-hover:text-primary">{CREATOR_NAME}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </p>
      </footer>
    </>
  )
}
