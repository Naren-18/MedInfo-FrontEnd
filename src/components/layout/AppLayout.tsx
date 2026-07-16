import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { Navbar } from "@/components/layout/Navbar"

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="no-print border-t border-border py-6 text-center text-xs text-muted-foreground">
        MedInfo — emergency medical information, available instantly, no login required.
      </footer>
    </>
  )
}
