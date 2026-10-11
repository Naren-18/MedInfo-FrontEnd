import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { MailOpen } from "lucide-react"

import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LocationState {
  email?: string
}

/** Shown right after registration: the account exists but can't log in
 * until the link in the verification email is opened. */
export default function CheckEmailPage() {
  const location = useLocation()
  const stateEmail = (location.state as LocationState | null)?.email ?? ""
  // If the page was opened without the registration state (e.g. a bookmark),
  // let the user type the address so "resend" still works.
  const [email, setEmail] = React.useState(stateEmail)

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailOpen className="h-5 w-5" />
          </div>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            {stateEmail ? (
              <>
                We sent a verification link to <span className="font-medium text-foreground">{stateEmail}</span>.
              </>
            ) : (
              "We sent a verification link to your email address."
            )}{" "}
            Open it to activate your account. The link is valid for 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't get it? Check your spam or promotions folder, or send a new link.
          </p>

          {!stateEmail && (
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>
          )}

          <ResendVerificationButton email={email} className="w-full" startCoolingDown={Boolean(stateEmail)} />

          <Button asChild variant="ghost" className="w-full">
            <Link to="/login" state={{ prefillEmail: email }}>
              Back to log in
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
