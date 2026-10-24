import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"

import { deleteAccount } from "@/api/auth"
import { useAuth } from "@/context/AuthContext"
import { clearCachedPublicProfileId } from "@/lib/public-profile-cache"
import { getErrorMessage } from "@/lib/errors"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Permanently deletes the account and all of its data (profile, reports,
 * timeline, contacts). The password is asked again so an open session alone
 * can't do it. The server deletes the medical data first and keeps the account
 * if that fails, so a failed attempt can simply be retried.
 */
export function DeleteAccountCard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  function onOpenChange(next: boolean) {
    if (isDeleting) return
    setOpen(next)
    setPassword("")
    setError(null)
  }

  async function onConfirm(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsDeleting(true)
    try {
      const message = await deleteAccount(password)
      if (user) clearCachedPublicProfileId(user.userId)
      logout()
      toast.success(message)
      navigate("/", { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Delete account</p>
          <p className="text-sm text-muted-foreground">
            Permanently deletes your account, medical profile, reports, timeline and emergency contacts. Your QR code
            stops working immediately.
          </p>
        </div>
        <Button variant="destructive" className="shrink-0" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete account
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form onSubmit={onConfirm} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently deletes your account and everything in it. It can't be undone. Backups are erased
                within 7 days.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="delete-account-password">Enter your password to confirm</Label>
              <Input
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDeleting}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isDeleting || password.length === 0}>
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete everything
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
