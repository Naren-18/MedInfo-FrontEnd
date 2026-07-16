import { Droplet, Pencil, Pill, Ruler, ShieldAlert, Trash2, Weight } from "lucide-react"

import type { MedicalProfileResponse } from "@/api/types"
import { isNoneValue } from "@/lib/none-value"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ProfileSummaryCardProps {
  profile: MedicalProfileResponse
  onEdit: () => void
  onDelete: () => void
}

// Shows the raw value when there's something specific to report; when it's
// a "none" value (however it was originally typed — "None", "none", "n/a"
// all still land here for anyone whose profile predates the toggle in
// ProfileForm), shows a quiet, explicit negative statement instead of the
// literal word sitting there looking unfinished.
function Field({ label, value, noneLabel }: { label: string; value: string; noneLabel: string }) {
  const none = isNoneValue(value)
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm ${none ? "italic text-muted-foreground" : ""}`}>
        {none ? noneLabel : value}
      </p>
    </div>
  )
}

export function ProfileSummaryCard({ profile, onEdit, onDelete }: ProfileSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Your Medical Profile</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.age} years old · {profile.gender}
          </p>
        </div>
        <Badge variant="default" className="flex items-center gap-1 text-sm">
          <Droplet className="h-3.5 w-3.5" />
          {profile.bloodGroup}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <Ruler className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Height</p>
              <p className="text-sm font-medium">{profile.height} cm</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <Weight className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-medium">{profile.weight} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Organ donor</p>
              <p className="text-sm font-medium">{profile.organDonor ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Allergies" value={profile.allergies} noneLabel="No known allergies" />
          <Field
            label="Medical conditions"
            value={profile.medicalConditions}
            noneLabel="No known conditions"
          />
          <div className="flex items-start gap-2">
            <Pill className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <Field
              label="Current medications"
              value={profile.currentMedications}
              noneLabel="Not currently on medication"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit profile
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
