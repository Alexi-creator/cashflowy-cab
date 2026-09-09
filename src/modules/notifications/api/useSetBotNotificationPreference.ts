import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { BotNotificationPreference } from "../model"
import { notificationKeys } from "./queries"
import { setBotNotificationPreference } from "./requests"

interface Options {
  /** Called after the cache is rolled back, so the caller can surface the failure its own way. */
  onError?: () => void
}

/** Flips one bot-push opt-in, optimistically and reversibly. */
export function useSetBotNotificationPreference({ onError }: Options = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type, enabled }: { type: string; enabled: boolean }) =>
      setBotNotificationPreference(type, enabled),
    onMutate: async ({ type, enabled }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.preferences })
      const previous = queryClient.getQueryData<BotNotificationPreference[]>(
        notificationKeys.preferences,
      )
      queryClient.setQueryData<BotNotificationPreference[]>(notificationKeys.preferences, (old) =>
        old?.map((pref) => (pref.type === type ? { ...pref, enabled } : pref)),
      )
      return { previous }
    },
    // On success the optimistic state from onMutate IS the new truth (PATCH answers with an
    // empty body, nothing to reconcile with) — only roll it back on failure.
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.preferences, context.previous)
      }
      onError?.()
    },
  })
}
