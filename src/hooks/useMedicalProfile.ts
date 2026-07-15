import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createProfile, deleteProfile, getProfile, updateProfile } from "@/api/profile"
import type { MedicalProfileInput } from "@/api/types"
import { useAuth } from "@/context/AuthContext"
import { cachePublicProfileId, clearCachedPublicProfileId } from "@/lib/public-profile-cache"

export const PROFILE_QUERY_KEY = ["profile"] as const

export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: MedicalProfileInput) => createProfile(payload),
    onSuccess: (created) => {
      if (user) {
        cachePublicProfileId(user.userId, created.publicProfileId)
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: MedicalProfileInput) => updateProfile(payload),
    onSuccess: (updated) => {
      if (user && updated?.publicProfileId) {
        cachePublicProfileId(user.userId, updated.publicProfileId)
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => deleteProfile(),
    onSuccess: () => {
      if (user) {
        clearCachedPublicProfileId(user.userId)
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}
