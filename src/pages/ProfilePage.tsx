import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { HeartPulse, User } from "lucide-react"

import {
  useCreateProfile,
  useDeleteProfile,
  useProfileQuery,
  useUpdateProfile,
} from "@/hooks/useMedicalProfile"
import { getErrorMessage } from "@/lib/errors"
import type { MedicalProfileInput } from "@/api/types"

import { ProfileForm } from "@/components/profile/ProfileForm"
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard"
import { PageLoader } from "@/components/layout/PageLoader"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, isError, error, refetch } = useProfileQuery()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const deleteProfile = useDeleteProfile()

  const [isEditing, setIsEditing] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  if (isLoading) {
    return <PageLoader label="Loading your medical profile…" />
  }

  if (isError) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertTitle>Couldn't load your profile</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  async function handleCreate(values: MedicalProfileInput) {
    try {
      await createProfile.mutateAsync(values)
      toast.success("Medical profile created. Your emergency QR code is ready.")
      navigate("/emergency-card")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleUpdate(values: MedicalProfileInput) {
    try {
      await updateProfile.mutateAsync(values)
      toast.success("Medical profile updated.")
      setIsEditing(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    try {
      await deleteProfile.mutateAsync()
      toast.success("Medical profile deleted.")
      setConfirmDeleteOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setConfirmDeleteOpen(false)
    }
  }

  const hasProfile = Boolean(profile)

  return (
    <div className="container max-w-2xl py-10">
      <PageHeader
        icon={User}
        title="Medical Profile"
        description="What first responders see when they scan your emergency QR code."
      />

      <AnimatePresence mode="wait">
        {!hasProfile && !isEditing && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <CardTitle>Create your medical profile</CardTitle>
                <CardDescription>
                  This is what first responders see when they scan your emergency QR code. It only takes a
                  minute.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  onSubmit={handleCreate}
                  isSubmitting={createProfile.isPending}
                  submitLabel="Create profile"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {hasProfile && !isEditing && profile && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileSummaryCard
              profile={profile}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setConfirmDeleteOpen(true)}
            />
          </motion.div>
        )}

        {hasProfile && isEditing && profile && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Edit your medical profile</CardTitle>
                <CardDescription>Changes take effect immediately on your public emergency card.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  defaultValues={profile}
                  onSubmit={handleUpdate}
                  isSubmitting={updateProfile.isPending}
                  submitLabel="Save changes"
                  onCancel={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your medical profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your medical information and deactivates your emergency QR code
              immediately. Your emergency contacts are not affected. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProfile.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteProfile.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
