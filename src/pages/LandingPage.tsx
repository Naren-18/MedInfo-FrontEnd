import { Link } from "react-router-dom"
import { HeartPulse, QrCode, ShieldCheck, Siren, UserPlus, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your profile",
    description: "Register and fill in your medical details — blood group, allergies, conditions, medications.",
  },
  {
    icon: QrCode,
    title: "Get your QR code",
    description: "MedInfo generates a unique, unguessable code for you. Print it, save it, or carry it on your phone.",
  },
  {
    icon: Siren,
    title: "Responders scan it",
    description: "In an emergency, anyone can scan the code and instantly see what they need — no login, no delay.",
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: "Instant access",
    description: "Critical information loads in an instant, exactly when seconds matter most.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Your public link reveals only what a responder needs — nothing else about your account.",
  },
  {
    icon: HeartPulse,
    title: "Always up to date",
    description: "Update your profile any time — your emergency card reflects the change immediately.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container flex flex-col items-center gap-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <HeartPulse className="h-3.5 w-3.5" />
            Emergency medical information, instantly
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            When every second counts, your medical history shouldn't be locked away.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            MedInfo puts your blood group, allergies, medications, and emergency contacts one QR scan away —
            for anyone, anywhere, with no login required.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register">Create your emergency profile</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="relative">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-xs font-normal text-muted-foreground">Step {i + 1}</span>
                </CardTitle>
                <p className="font-semibold">{step.title}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
              <feature.icon className="h-5 w-5 text-primary" />
              <p className="font-semibold">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16 text-center">
        <h2 className="text-2xl font-semibold">A few minutes now could save critical time later.</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          It's free, it takes less than five minutes, and you can update it any time.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link to="/register">Get started</Link>
        </Button>
      </section>
    </div>
  )
}
