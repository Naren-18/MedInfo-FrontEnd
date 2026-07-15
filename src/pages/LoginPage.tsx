import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HeartPulse, Loader2 } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { loginSchema, type LoginFormValues } from "@/lib/validation"
import { getErrorMessage, getErrorStatus } from "@/lib/errors"

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

  const state = (location.state as LocationState | null) ?? null

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: state?.prefillEmail ?? "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await login(values)
      toast.success("Welcome back.")
      const redirectTo = state?.from?.pathname ?? "/dashboard"
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (getErrorStatus(err) === 401) {
        form.setError("password", { message: getErrorMessage(err, "Invalid email or password.") })
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
