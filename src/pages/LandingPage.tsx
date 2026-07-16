import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Droplet, HeartPulse, Pill, QrCode, ShieldCheck, Siren, UserPlus, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      <section className="relative overflow-hidden border-b border-border">
        {/* Decorative background glow — purely visual, sits behind all hero content */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-emergency/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
        </div>

        <div className="container grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <HeartPulse className="h-3.5 w-3.5" />
              Emergency medical information, instantly
            </span>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
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
          </motion.div>

          {/* Mockup of the actual emergency card the product generates —
              gives the abstract pitch a concrete, recognizable product shot. */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-sm"
          >
            <div className="relative rounded-[2rem] border border-border bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.35)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_24px_48px_-24px_rgba(0,0,0,0.7)]">
              <div className="rounded-[1.5rem] border border-border bg-gradient-to-b from-muted/50 to-transparent p-5">
                <div className="flex items-center gap-2 text-emergency">
                  <HeartPulse className="h-5 w-5" />
                  <span className="font-display font-semibold">MedInfo Emergency Card</span>
                </div>

                <div className="mt-4 flex items-center justify-center rounded-xl border border-border bg-background p-6">
                  <div
                    className="grid h-32 w-32 grid-cols-5 gap-1"
                    aria-hidden="true"
                  >
                    {/* Decorative QR-like grid — not a real scannable code */}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-sm ${[0, 4, 20, 24, 2, 6, 8, 12, 14, 16, 22].includes(i) ? "bg-foreground" : "bg-foreground/10"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="emergency" className="gap-1">
                    <Droplet className="h-3 w-3" /> O+
                  </Badge>
                  <Badge variant="warning" className="gap-1">
                    <Pill className="h-3 w-3" /> Penicillin allergy
                  </Badge>
                  <Badge variant="success">2 contacts</Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="relative overflow-visible pt-2">
              <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                {i + 1}
              </span>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <p className="font-display font-semibold">{feature.title}</p>
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
