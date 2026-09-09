import { useQuery } from "@tanstack/react-query"
import { notificationKeys } from "./queries"
import { getBotNotificationPreferences } from "./requests"

/**
 * The user's opt-ins for proactive Telegram pushes.
 *
 * Nothing else changes these server-side — {@link useSetBotNotificationPreference} keeps the
 * cache in sync via optimistic updates, so there is no need to ever refetch in the background.
 */
export function useBotNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: getBotNotificationPreferences,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
