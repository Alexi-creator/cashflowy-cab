import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "../hooks/useAuthStore"
import type { User } from "../model"
import { type UpdateMePayload, updateMe } from "./requests"

interface Options {
  onSuccess?: (updated: User) => void
  onError?: () => void
}

/** Saves profile fields and pushes the fresh user into the auth store. */
export function useUpdateMe({ onSuccess, onError }: Options = {}) {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => updateMe(payload),
    onSuccess: (updated) => {
      setUser(updated)
      onSuccess?.(updated)
    },
    onError: () => onError?.(),
  })
}
