import type { ComponentType } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import {
  AlertTriangle,
  Droplet,
  HeartPulse,
  Phone,
  Pill,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
} from "lucide-react"

import { getEmergencyProfile } from "@/api/emergency"
import { getErrorMessage, getErrorStatus } from "@/lib/errors"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PublicEmergencyPage() {
  const { publicProfileId } = useParams<{ publicProfileId: string }>()

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["emergency", publicProfileId],
    queryFn: () => getEmergencyProfile(publicProfileId!),
    enabled: Boolean(publicProfileId),
    retry: 1,
  })

  return (
    <div className="flex min-h-svh flex-col bg-emergency/5">
      <header className="border-b border-emergency/20 bg-emergency text-emergency-foreground">
        <div className="container flex items-center gap-2 py-4">
          <HeartPulse className="h-6 w-6" />
          <div>
            <p className="font-semibold leading-none">MedInfo Emergency Profile</p>
            <p className="text-xs opacity-90">No login required</p>
          </div>
        </div>
      </header>

      <main className="container flex flex-1 flex-col items-center py-8">
        {isLoading && (
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && <EmergencyErrorState error={error} />}

        {!isLoading && !isError && profile && (
          <div className="w-full max-w-md space-y-4">
            <Card className="border-emergency/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Patient</p>
                <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.age} years old · {profile.gender}
                </p>
              </CardContent>
            </Card>

            <Card className="border-emergency bg-emergency text-emergency-foreground">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Droplet className="h-8 w-8" />
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-90">Blood Group</p>
                    <p className="text-3xl font-extrabold leading-none">{profile.bloodGroup}</p>
                  </div>
                </div>
                {profile.organDonor && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Organ donor
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <InfoBlock icon={ShieldAlert} label="Allergies" value={profile.allergies} highlight />
                <InfoBlock icon={AlertTriangle} label="Medical conditions" value={profile.medicalConditions} />
                <InfoBlock icon={Pill} label="Current medications" value={profile.currentMedications} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Emergency Contacts</p>
                {profile.emergencyContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No emergency contacts on file.</p>
                ) : (
                  <div className="space-y-2">
                    {profile.emergencyContacts.map((contact) => (
                      <a
                        key={contact.id}
                        href={`tel:${contact.phoneNumber}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-emergency hover:bg-emergency/5"
                      >
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-emergency">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm font-medium">{contact.phoneNumber}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              This information was provided by the patient via MedInfo and may not reflect their current
              condition. Always follow your own clinical judgment.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoBlock({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={highlight ? "mt-0.5 h-5 w-5 shrink-0 text-emergency" : "mt-0.5 h-5 w-5 shrink-0 text-primary"} />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={highlight ? "font-semibold" : ""}>{value}</p>
      </div>
    </div>
  )
}

function EmergencyErrorState({ error }: { error: unknown }) {
  const status = getErrorStatus(error)

  if (status === 404) {
    return (
      <div className="flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Profile not found</h1>
        <p className="text-sm text-muted-foreground">
          This emergency link doesn't match any profile. Double-check the QR code or link and try again.
        </p>
      </div>
    )
  }

  if (status === 503) {
    return (
      <div className="w-full max-w-md py-8">
        <Alert variant="emergency">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Temporarily unavailable</AlertTitle>
          <AlertDescription>
            Part of the system needed to look up this profile is temporarily down. Please try again in a
            moment — or, if this is a real emergency, contact local emergency services immediately.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        If this is a real emergency, contact local emergency services immediately rather than waiting on
        this page.
      </p>
    </div>
  )
}
