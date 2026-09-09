import { useMutation } from "@tanstack/react-query"
import type { TelegramAuthData } from "@telegram-auth/react"
import { useAuthStore } from "../hooks/useAuthStore"
import { getMe, linkTelegram } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: () => void
}

/** Links a Telegram account; the link endpoint answers empty, so the user is re-read after it. */
export function useLinkTelegram({ onSuccess, onError }: Options = {}) {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (data: TelegramAuthData) => {
      await linkTelegram(data)
      return getMe()
    },
    onSuccess: (updated) => {
      setUser(updated)
      onSuccess?.()
    },
    onError: () => onError?.(),
  })
}
