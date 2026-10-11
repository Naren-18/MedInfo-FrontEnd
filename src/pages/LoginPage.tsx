import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HeartPulse, Loader2, MailWarning } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { loginSchema, type LoginFormValues } from "@/lib/validation"
import { getErrorMessage, getErrorStatus } from "@/lib/errors"

import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface LocationState {
  from?: { pathname: string }
  prefillEmail?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  // Set when the password was right but the email isn't verified yet (403).
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null)

  const state = (location.state as LocationState | null) ?? null

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: state?.prefillEmail ?? "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    setUnverifiedEmail(null)
    try {
      await login(values)
      toast.success("Welcome back.")
      const redirectTo = state?.from?.pathname ?? "/dashboard"
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const status = getErrorStatus(err)
      if (status === 401) {
        form.setError("password", { message: getErrorMessage(err, "Invalid email or password.") })
      } else if (status === 403) {
        setUnverifiedEmail(values.email)
      } else {
        toast.error(getErrorMessage(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HeartPulse className="h-5 w-5" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Log in to manage your medical profile and emergency contacts.</CardDescription>
        </CardHeader>
        <CardContent>
          {unverifiedEmail && (
            <Alert className="mb-4">
              <MailWarning className="h-4 w-4" />
              <AlertTitle>Please verify your email</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  Open the link we sent to <span className="font-medium">{unverifiedEmail}</span> to activate
                  your account, then log in again.
                </p>
                <ResendVerificationButton email={unverifiedEmail} />
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Log in
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
