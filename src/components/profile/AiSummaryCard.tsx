import * as React from "react"
import { FileUp, Loader2, Sparkles } from "lucide-react"

import { uploadReport } from "@/api/profile"
import { useProfileQuery } from "@/hooks/useMedicalProfile"
import { getErrorMessage, getErrorStatus } from "@/lib/errors"
import { AiSummaryText } from "@/components/profile/AiSummaryText"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const MAX_FILE_BYTES = 20 * 1024 * 1024

type Phase = "idle" | "uploading" | "uploaded"

// Mirrors the server's checks, just to save a round trip — the server
// re-validates everything (including the real %PDF- header) regardless.
function validateFile(file: File): string | null {
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!looksLikePdf) return "Only PDF files are supported."
  if (file.size === 0) return "Uploaded file is empty."
  if (file.size > MAX_FILE_BYTES) return "File is too large. Maximum allowed size is 20 MB."
  return null
}

function uploadErrorMessage(err: unknown): string {
  const status = getErrorStatus(err)
  if (status === 404) return "Create your medical profile first."
  // A 413 can come from nginx before the request reaches the backend, with
  // an HTML body instead of the usual JSON error.
  if (status === 413) return "File is too large. Maximum allowed size is 20 MB."
  return getErrorMessage(err)
}

/**
 * Owner-facing AI Medical Summary: shows the combined summary and lets the
 * user upload PDF reports. A 202 only means the file was accepted — the
 * summary is generated in the background and merged into the profile, so
 * it shows up the next time the profile is loaded. Deliberately no polling.
 */
export function AiSummaryCard() {
  const { data: profile } = useProfileQuery()

  const [phase, setPhase] = React.useState<Phase>("idle")
  const [progress, setProgress] = React.useState(0)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploadError(null)

    const invalid = validateFile(file)
    if (invalid) {
      setUploadError(invalid)
      return
    }

    const previousPhase = phase
    setProgress(0)
    setPhase("uploading")

    try {
      await uploadReport(file, setProgress)
      setPhase("uploaded")
    } catch (err) {
      setUploadError(uploadErrorMessage(err))
      setPhase(previousPhase)
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so choosing the same file again still fires onChange.
    event.target.value = ""
    if (file) handleFile(file)
  }

  const isUploading = phase === "uploading"
  // Once every byte is sent, the server still reads the PDF (OCR on scanned
  // pages can take a couple of minutes) before answering 202.
  const isReading = isUploading && progress >= 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Medical Summary
        </CardTitle>
        <CardDescription>
          Upload medical reports (PDF) and MedInfo combines them into one summary, shown on your emergency
          card.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {profile?.aiSummary ? (
          <AiSummaryText summary={profile.aiSummary} generatedAt={profile.summaryGeneratedAt} />
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No AI summary yet. Upload a medical report to generate one.
          </p>
        )}

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />
          <Button variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isReading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {isReading
              ? "Reading your PDF…"
              : isUploading
                ? `Uploading… ${progress}%`
                : "Upload medical report (PDF)"}
          </Button>

          {isReading && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Scanned pages can take a couple of minutes.
            </p>
          )}

          {isUploading && !isReading && (
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {phase === "uploaded" && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Report uploaded. Your AI summary will update in a few minutes.
            </p>
          )}

          {uploadError && (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            PDF up to 20 MB. Scanned pages and phone photos are supported (up to 30 pages).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
