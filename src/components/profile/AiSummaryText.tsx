import { Info } from "lucide-react"

import { formatServerDateTime } from "@/lib/server-time"

interface AiSummaryTextProps {
  summary: string
  generatedAt: string | null
}

/** The AI summary body shared by the owner's Profile page and the public
 * Emergency page. The summary is plain text from the model, so it is
 * rendered as text (never as HTML), with pre-line to keep paragraph breaks. */
export function AiSummaryText({ summary, generatedAt }: AiSummaryTextProps) {
  const lastUpdated = formatServerDateTime(generatedAt)

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-line text-sm leading-relaxed">{summary}</p>
      <div className="space-y-1 text-xs text-muted-foreground">
        {lastUpdated && <p>Last updated: {lastUpdated}</p>}
        <p className="flex items-start gap-1.5">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          AI-generated from uploaded reports. Verify with a medical professional.
        </p>
      </div>
    </div>
  )
}
