import { Link } from "react-router-dom"
import { Droplet, HeartPulse, Pencil, Plus, QrCode, Users } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useProfileQuery } from "@/hooks/useMedicalProfile"
import { useContactsQuery } from "@/hooks/useEmergencyContacts"
import { getCachedPublicProfileId } from "@/lib/public-profile-cache"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfileQuery()
  const { data: contacts, isLoading: contactsLoading } = useContactsQuery()

  const hasProfile = Boolean(profile)
  const contactCount = contacts?.length ?? 0
  const publicProfileId = user ? getCachedPublicProfileId(user.userId) : null

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Welcome back{user ? `, ${user.sub}` : ""}</h1>
      <p className="mt-1 text-muted-foreground">Here's the state of your emergency profile.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Medical profile card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartPulse className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Medical Profile</CardTitle>
            </div>
            {profileLoading ? null : (
              <Badge variant={hasProfile ? "default" : "outline"}>{hasProfile ? "Complete" : "Missing"}</Badge>
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

        {/* Contacts card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Emergency Contacts</CardTitle>
            </div>
            {!contactsLoading && <Badge variant={contactCount > 0 ? "default" : "outline"}>{contactCount}</Badge>}
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
      </div>

      {/* Emergency card CTA */}
      <Card className="mt-6 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
            <Button asChild>
              <Link to="/emergency-card">View emergency card</Link>
            </Button>
          ) : (
            <Button disabled>View emergency card</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
