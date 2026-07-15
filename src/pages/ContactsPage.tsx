import * as React from "react"
import { toast } from "sonner"
import { Pencil, Phone, Plus, Trash2, Users } from "lucide-react"

import {
  useContactsQuery,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from "@/hooks/useEmergencyContacts"
import { getErrorMessage } from "@/lib/errors"
import type { EmergencyContact, EmergencyContactInput } from "@/api/types"

import { ContactForm } from "@/components/contacts/ContactForm"
import { PageLoader } from "@/components/layout/PageLoader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export default function ContactsPage() {
  const { data: contacts, isLoading, isError, error, refetch } = useContactsQuery()
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingContact, setEditingContact] = React.useState<EmergencyContact | null>(null)
  const [deletingContact, setDeletingContact] = React.useState<EmergencyContact | null>(null)

  function openCreateDialog() {
    setEditingContact(null)
    setFormOpen(true)
  }

  function openEditDialog(contact: EmergencyContact) {
    setEditingContact(contact)
    setFormOpen(true)
  }

  async function handleSubmit(values: EmergencyContactInput) {
    try {
      if (editingContact) {
        await updateContact.mutateAsync({ id: editingContact.id, payload: values })
        toast.success("Contact updated.")
      } else {
        await createContact.mutateAsync(values)
        toast.success("Contact added.")
      }
      setFormOpen(false)
      setEditingContact(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!deletingContact) return
    try {
      await deleteContact.mutateAsync(deletingContact.id)
      toast.success("Contact removed.")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeletingContact(null)
    }
  }

  const isMutating = createContact.isPending || updateContact.isPending

  if (isLoading) {
    return <PageLoader label="Loading your emergency contacts…" />
  }

  if (isError) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertTitle>Couldn't load your contacts</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const hasContacts = (contacts?.length ?? 0) > 0

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Emergency Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Shown to first responders alongside your medical profile.
          </p>
        </div>
        {hasContacts && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add contact
          </Button>
        )}
      </div>

      {!hasContacts && (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle>No emergency contacts yet</CardTitle>
            <CardDescription>
              Add at least one person a responder can call on your behalf.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add your first contact
            </Button>
          </CardContent>
        </Card>
      )}

      {hasContacts && (
        <div className="space-y-3">
          {contacts!.map((contact, index) => (
            // Falls back to a composite key if `id` isn't present yet (see the
            // note in api/contacts.ts) — avoids a duplicate/missing-key React
            // warning without masking the underlying edit/delete limitation.
            <Card key={contact.id ?? `${contact.phoneNumber}-${contact.name}-${index}`}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{contact.name}</p>
                    <Badge variant="secondary">{contact.relationship}</Badge>
                  </div>
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phoneNumber}
                  </a>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(contact)} aria-label="Edit contact">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingContact(contact)}
                    aria-label="Delete contact"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingContact(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit contact" : "Add emergency contact"}</DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update this contact's details."
                : "Anyone scanning your emergency card will be able to call this number."}
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            defaultValues={editingContact ?? undefined}
            onSubmit={handleSubmit}
            isSubmitting={isMutating}
            submitLabel={editingContact ? "Save changes" : "Add contact"}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingContact)} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deletingContact?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This contact will no longer appear on your emergency card. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContact.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteContact.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
