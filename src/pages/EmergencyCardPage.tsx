import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { AlertTriangle, Copy, Download, HeartPulse, Printer, QrCode } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useProfileQuery } from "@/hooks/useMedicalProfile"
import { cachePublicProfileId, getCachedPublicProfileId } from "@/lib/public-profile-cache"
import { getErrorMessage } from "@/lib/errors"

import { PageLoader } from "@/components/layout/PageLoader"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EmergencyCardPage() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError, error } = useProfileQuery()
  const qrRef = React.useRef<HTMLDivElement>(null)

  const publicProfileId = profile?.publicProfileId ?? (user ? getCachedPublicProfileId(user.userId) : null)
  const emergencyUrl = publicProfileId
    ? `${window.location.origin}/emergency/${publicProfileId}`
    : null

  React.useEffect(() => {
    if (user && profile?.publicProfileId) {
      cachePublicProfileId(user.userId, profile.publicProfileId)
    }
  }, [user, profile?.publicProfileId])

  if (isLoading) {
    return <PageLoader label="Loading your emergency card…" />
  }

  if (isError) {
    return (
      <div className="container max-w-lg py-12">
        <Alert variant="destructive">
          <AlertTitle>Couldn't load your emergency card</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container max-w-lg py-12 text-center">
        <Card>
          <CardHeader className="items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <CardTitle>Create a medical profile first</CardTitle>
            <CardDescription>Your emergency QR code is generated automatically once you do.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/profile">Create medical profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!emergencyUrl) {
    return (
      <div className="container max-w-lg py-12">
        <Alert variant="emergency">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Your QR code isn't available on this device</AlertTitle>
          <AlertDescription>
            Your emergency link is generated once, when your profile is first created or updated, and
            kept only on the device you were using at the time. If you're on a new device or cleared your
            browser data, updating your medical profile will generate and store a fresh one here.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" asChild>
          <Link to="/profile">Go to medical profile</Link>
        </Button>
      </div>
    )
  }

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const size = 512
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
      }
      URL.revokeObjectURL(url)
      const pngUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = pngUrl
      link.download = "medinfo-emergency-qr.png"
      link.click()
    }
    img.src = url
  }

  async function handleCopyLink() {
    if (!emergencyUrl) return
    try {
      await navigator.clipboard.writeText(emergencyUrl)
      toast.success("Emergency link copied.")
    } catch {
      toast.error("Couldn't copy the link — you can select and copy it manually.")
    }
  }

  return (
    <div className="container max-w-lg py-10">
      <PageHeader
        icon={QrCode}
        title="Your Emergency Card"
        description="Print this, save it as a photo, or add it to your phone's lock screen. Anyone who scans it sees your emergency medical information instantly — no login required."
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card id="emergency-card-print" className="mx-auto max-w-sm">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex items-center gap-2 text-emergency">
              <HeartPulse className="h-5 w-5" />
              <span className="font-semibold">MedInfo Emergency Card</span>
            </div>
            <div ref={qrRef} className="rounded-lg border border-border p-4">
              <QRCodeSVG value={emergencyUrl} size={220} level="M" marginSize={2} />
            </div>
            <p className="text-xs text-muted-foreground">Scan for emergency medical information</p>
            <p className="break-all rounded bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
              {emergencyUrl}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="no-print mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
      </div>
    </div>
  )
}
