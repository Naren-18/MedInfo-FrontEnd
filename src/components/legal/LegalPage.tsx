import type * as React from "react"
import { Link } from "react-router-dom"

import { LEGAL_LAST_UPDATED } from "@/lib/legal"

/** Readable long-form layout shared by the Privacy Policy and Terms of Service. */
export function LegalPage({ title, intro, children }: { title: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="container max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>
      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">{intro}</div>
      <div className="mt-8 space-y-8 text-sm leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        See also: <Link to="/privacy" className="underline">Privacy Policy</Link> ·{" "}
        <Link to="/terms" className="underline">Terms of Service</Link>
      </p>
    </article>
  )
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}
