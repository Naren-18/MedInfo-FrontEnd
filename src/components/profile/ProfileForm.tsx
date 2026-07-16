import * as React from "react"
import { useForm, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import {
  medicalProfileSchema,
  type MedicalProfileFormInput,
  type MedicalProfileFormValues,
  BLOOD_GROUPS,
  GENDERS,
} from "@/lib/validation"
import { NONE_VALUE, isNoneValue } from "@/lib/none-value"
import type { MedicalProfileInput } from "@/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface ProfileFormProps {
  defaultValues?: Partial<MedicalProfileFormInput>
  onSubmit: (values: MedicalProfileInput) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
  onCancel?: () => void
}

const EMPTY_DEFAULTS: MedicalProfileFormInput = {
  age: 0,
  gender: "",
  bloodGroup: "",
  height: 0,
  weight: 0,
  allergies: NONE_VALUE,
  medicalConditions: NONE_VALUE,
  currentMedications: NONE_VALUE,
  organDonor: false,
}

// The backend requires these fields non-blank (@NotBlank in
// CreateMedicalProfileDTO) — this stays frontend-only. Instead of asking
// every user with nothing to report to type "None" by hand (inconsistent
// casing — "none", "None", "n/a" — is useless data later), a toggle
// submits one canonical value, and reveals free text only when there's
// something specific to say.
function NegatableTextField({
  control,
  name,
  label,
  noneLabel,
  placeholder,
  defaultIsNone,
}: {
  control: Control<MedicalProfileFormInput>
  name: "allergies" | "medicalConditions" | "currentMedications"
  label: string
  noneLabel: string
  placeholder: string
  defaultIsNone: boolean
}) {
  const [isNone, setIsNone] = React.useState(defaultIsNone)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between gap-3">
            <FormLabel className="mb-0">{label}</FormLabel>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {noneLabel}
              <Switch
                checked={isNone}
                onCheckedChange={(checked) => {
                  setIsNone(checked)
                  field.onChange(checked ? NONE_VALUE : "")
                }}
                aria-label={`${noneLabel}, toggle off to enter details`}
              />
            </label>
          </div>
          {!isNone && (
            <FormControl>
              <Textarea placeholder={placeholder} autoFocus {...field} />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProfileForm({ defaultValues, onSubmit, isSubmitting, submitLabel, onCancel }: ProfileFormProps) {
  const form = useForm<MedicalProfileFormInput, unknown, MedicalProfileFormValues>({
    resolver: zodResolver(medicalProfileSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  })

  async function handleSubmit(values: MedicalProfileFormValues) {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    {...field}
                    value={field.value as number | string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={0.1}
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={0.1}
                      {...field}
                      value={field.value as number | string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <NegatableTextField
          control={form.control}
          name="allergies"
          label="Allergies"
          noneLabel="No known allergies"
          placeholder="e.g. Penicillin, peanuts"
          defaultIsNone={isNoneValue(defaultValues?.allergies)}
        />

        <NegatableTextField
          control={form.control}
          name="medicalConditions"
          label="Medical conditions"
          noneLabel="No known conditions"
          placeholder="e.g. Hypertension, diabetes"
          defaultIsNone={isNoneValue(defaultValues?.medicalConditions)}
        />

        <NegatableTextField
          control={form.control}
          name="currentMedications"
          label="Current medications"
          noneLabel="Not currently on medication"
          placeholder="e.g. Metformin 500mg"
          defaultIsNone={isNoneValue(defaultValues?.currentMedications)}
        />

        <FormField
          control={form.control}
          name="organDonor"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
              <div>
                <FormLabel className="text-base">Organ donor</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Shown on your public emergency card.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
