import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createContact, deleteContact, listContacts, updateContact } from "@/api/contacts"
import type { EmergencyContactInput } from "@/api/types"

export const CONTACTS_QUERY_KEY = ["contacts"] as const

export function useContactsQuery() {
  return useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: listContacts,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EmergencyContactInput) => createContact(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmergencyContactInput }) =>
      updateContact(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY }),
  })
}
