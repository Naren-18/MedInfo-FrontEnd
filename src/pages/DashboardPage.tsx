import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Droplet, HeartPulse, LayoutDashboard, Pencil, Plus, QrCode, Users } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useProfileQuery } from "@/hooks/useMedicalProfile"
import { useContactsQuery } from "@/hooks/useEmergencyContacts"
import { getCachedPublicProfileId } from "@/lib/public-profile-cache"

import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.05 * i, ease: "easeOut" as const },
  }),
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfileQuery()
  const { data: contacts, isLoading: contactsLoading } = useContactsQuery()

  const hasProfile = Boolean(profile)
  const contactCount = contacts?.length ?? 0
  const publicProfileId = user ? getCachedPublicProfileId(user.userId) : null

  return (
    <div className="container max-w-3xl py-10">
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome back${user ? `, ${user.sub}` : ""}`}
        description="Here's the state of your emergency profile."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Medical profile card */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Medical Profile</CardTitle>
              </div>
              {profileLoading ? null : (
                <Badge variant={hasProfile ? "success" : "warning"}>{hasProfile ? "Complete" : "Missing"}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : hasProfile && profile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Droplet className="h-4 w-4 text-primary" />
                    Blood group <span className="font-semibold">{profile.bloodGroup}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile">
                      <Pencil className="h-4 w-4" />
                      Edit profile
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <CardDescription>
                    You haven't created a medical profile yet — this is required before you can generate an
                    emergency QR code.
                  </CardDescription>
                  <Button size="sm" asChild>
                    <Link to="/profile">
                      <Plus className="h-4 w-4" />
                      Create profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contacts card */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-violet-500/30" />
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Emergency Contacts</CardTitle>
              </div>
              {!contactsLoading && (
                <Badge variant={contactCount > 0 ? "success" : "warning"}>{contactCount}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : contactCount > 0 ? (
                <div className="space-y-3">
                  <CardDescription>
                    {contactCount} {contactCount === 1 ? "contact" : "contacts"} will be shown to first responders.
                  </CardDescription>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contacts">Manage contacts</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <CardDescription>
                    Add at least one person a responder can call on your behalf.
                  </CardDescription>
                  <Button size="sm" asChild>
                    <Link to="/contacts">
                      <Plus className="h-4 w-4" />
                      Add contact
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emergency card CTA */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="mt-6 overflow-hidden border-emergency/20 bg-gradient-to-br from-emergency/[0.07] via-transparent to-primary/[0.05]">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emergency text-emergency-foreground shadow-sm">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Your Emergency QR Card</p>
                <p className="text-sm text-muted-foreground">
                  {hasProfile
                    ? publicProfileId
                      ? "Ready — print it or save it to your phone."
                      : "Your profile is ready, but this device doesn't have your QR code cached — open it below."
                    : "Create your medical profile to generate this."}
                </p>
              </div>
            </div>
            {hasProfile ? (
              <Button variant="emergency" asChild>
                <Link to="/emergency-card">View emergency card</Link>
              </Button>
            ) : (
              <Button variant="emergency" disabled>
                View emergency card
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
