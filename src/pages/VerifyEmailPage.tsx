import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import { verifyEmail } from "@/api/auth"
import { getErrorMessage } from "@/lib/errors"
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Status = "verifying" | "verified" | "failed"

/** Opened from the link in the verification email:
 * /verify-email?token=... */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [status, setStatus] = React.useState<Status>(token ? "verifying" : "failed")
  const [error, setError] = React.useState(token ? "" : "This verification link is incomplete.")
  const [email, setEmail] = React.useState("")

  // A token works only once, and React's StrictMode runs effects twice in
  // development — without this guard the second call would report failure.
  const requested = React.useRef(false)

  React.useEffect(() => {
    if (!token || requested.current) return
    requested.current = true

    verifyEmail(token)
      .then(() => setStatus("verified"))
      .catch((err) => {
        setError(getErrorMessage(err, "This link is invalid or has expired."))
        setStatus("failed")
      })
  }, [token])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {status === "verifying" && (
          <CardHeader className="items-center text-center">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <CardTitle>Verifying your email…</CardTitle>
          </CardHeader>
        )}

        {status === "verified" && (
          <>
            <CardHeader className="items-center text-center">
              <CheckCircle2 className="mb-2 h-10 w-10 text-green-600" />
              <CardTitle>Email verified</CardTitle>
              <CardDescription>Your account is active. You can log in now.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/login">Log in</Link>
              </Button>
            </CardContent>
          </>
        )}

        {status === "failed" && (
          <>
            <CardHeader className="items-center text-center">
              <XCircle className="mb-2 h-10 w-10 text-destructive" />
              <CardTitle>We couldn't verify this link</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Links expire after 24 hours and work only once. Enter your email to get a new one.
              </p>
              <div className="space-y-2">
                <Label htmlFor="verify-resend-email">Email</Label>
                <Input
                  id="verify-resend-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                />
              </div>
              <ResendVerificationButton email={email} className="w-full" />
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Back to log in</Link>
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
