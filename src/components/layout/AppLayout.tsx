import { Outlet } from "react-router-dom"

import { Navbar } from "@/components/layout/Navbar"

export function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <footer className="no-print border-t border-border py-6 text-center text-xs text-muted-foreground">
        MedInfo — emergency medical information, available instantly, no login required.
      </footer>
    </>
  )
}
