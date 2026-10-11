import * as React from "react"
import { toast } from "sonner"
import { Loader2, MailCheck } from "lucide-react"

import { resendVerification } from "@/api/auth"
import { getErrorMessage } from "@/lib/errors"
import { Button, type ButtonProps } from "@/components/ui/button"

// Matches the server's own per-account limit, so the button never invites
// a click the server would ignore.
const COOLDOWN_SECONDS = 60

interface ResendVerificationButtonProps {
  email: string
  variant?: ButtonProps["variant"]
  className?: string
  /** Start already cooling down, e.g. right after registration sent one. */
  startCoolingDown?: boolean
}

/**
 * Asks the backend to send a new verification email. The server answers the
 * same way whether or not the address is registered, so the message here is
 * deliberately generic.
 */
export function ResendVerificationButton({
  email,
  variant = "outline",
  className,
  startCoolingDown = false,
}: ResendVerificationButtonProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(startCoolingDown ? COOLDOWN_SECONDS : 0)
  const [isSending, setIsSending] = React.useState(false)

  React.useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  async function handleClick() {
    setIsSending(true)
    try {
      await resendVerification(email)
      toast.success("If that account still needs verifying, a new link is on its way.")
      setSecondsLeft(COOLDOWN_SECONDS)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const disabled = !email || isSending || secondsLeft > 0

  return (
    <Button type="button" variant={variant} className={className} disabled={disabled} onClick={handleClick}>
      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
      {secondsLeft > 0 ? `Resend email (${secondsLeft}s)` : "Resend verification email"}
    </Button>
  )
}
