import type { ComponentType } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import {
  AlertTriangle,
  ChevronDown,
  Droplet,
  HeartPulse,
  History,
  Phone,
  Pill,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react"

import { getEmergencyProfile } from "@/api/emergency"
import type { TimelineEvent } from "@/api/types"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { getErrorMessage, getErrorStatus } from "@/lib/errors"
import { isNoneValue } from "@/lib/none-value"
import { formatServerDateTime } from "@/lib/server-time"
import { AiSummaryText } from "@/components/profile/AiSummaryText"
import { MedicalTimeline, TimelineDisclaimer } from "@/components/profile/MedicalTimeline"
import { SnakeTimeline } from "@/components/profile/SnakeTimeline"

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
        <div className="container flex max-w-6xl items-center gap-2 py-4">
          <HeartPulse className="h-6 w-6" />
          <div>
            <p className="font-semibold leading-none">MedInfo Emergency Profile</p>
            <p className="text-xs opacity-90">No login required</p>
          </div>
        </div>
      </header>

      <main className="container flex max-w-6xl flex-1 flex-col items-center py-8">
        {isLoading && (
          <div className="w-full space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {isError && <EmergencyErrorState error={error} />}

        {!isLoading && !isError && profile && (
          <div className="w-full space-y-4">
            {/* Who, blood group, then what a responder must know — side by side from tablet up. */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emergency/30">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.age} years old · {profile.gender}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between rounded-lg bg-emergency p-4 text-emergency-foreground">
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex h-full flex-col justify-center gap-4 p-6">
                  <InfoBlock
                    icon={ShieldAlert}
                    label="Allergies"
                    value={profile.allergies}
                    noneLabel="No known allergies"
                    highlight
                  />
                  <InfoBlock
                    icon={AlertTriangle}
                    label="Medical conditions"
                    value={profile.medicalConditions}
                    noneLabel="No known conditions"
                  />
                  <InfoBlock
                    icon={Pill}
                    label="Current medications"
                    value={profile.currentMedications}
                    noneLabel="Not currently on medication"
                  />
                </CardContent>
              </Card>
            </div>

            {profile.timeline && profile.timeline.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <History className="h-4 w-4 text-primary" />
                    Medical Timeline
                  </p>
                  <ResponsiveTimeline events={profile.timeline} />
                </CardContent>
              </Card>
            )}

            {profile.aiSummary && (
              <Card>
                {/* Closed by default so the critical details above stay in view. */}
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Medical Summary
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {formatServerDateTime(profile.summaryGeneratedAt) && (
                        <span className="hidden sm:inline">
                          Updated {formatServerDateTime(profile.summaryGeneratedAt)}
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <CardContent className="p-6 pt-0">
                    <AiSummaryText summary={profile.aiSummary} generatedAt={profile.summaryGeneratedAt} />
                  </CardContent>
                </details>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Emergency Contacts</p>
                {profile.emergencyContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No emergency contacts on file.</p>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
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

// Phones: vertical list. Tablets: snake with 2 per row; desktops: 4 per row.
function ResponsiveTimeline({ events }: { events: TimelineEvent[] }) {
  const isTablet = useMediaQuery("(min-width: 768px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (!isTablet) {
    return <MedicalTimeline events={events} />
  }

  return (
    <div className="space-y-6">
      <SnakeTimeline events={events} columns={isDesktop ? 4 : 2} />
      <TimelineDisclaimer />
    </div>
  )
}

function InfoBlock({
  icon: Icon,
  label,
  value,
  noneLabel,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  noneLabel: string
  highlight?: boolean
}) {
  const none = isNoneValue(value)
  // A red, bolded "No known allergies" would read as an alert when it's
  // actually the reassuring case — highlight styling only applies when
  // there's something a responder actually needs to notice.
  const emphasize = highlight && !none

  return (
    <div className="flex items-start gap-3">
      <Icon className={emphasize ? "mt-0.5 h-5 w-5 shrink-0 text-emergency" : "mt-0.5 h-5 w-5 shrink-0 text-primary"} />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={emphasize ? "font-semibold" : none ? "italic text-muted-foreground" : ""}>
          {none ? noneLabel : value}
        </p>
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
