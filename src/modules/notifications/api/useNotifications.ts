import { useQuery } from "@tanstack/react-query"
import { NOTIFICATIONS_STALE_TIME, notificationKeys } from "./queries"
import { getNotifications } from "./requests"

/**
 * In-app notifications for the header bell.
 *
 * No refetch on open: data is refreshed by invalidation when goals change, and otherwise only
 * goes stale once per half-day (see NOTIFICATIONS_STALE_TIME) to avoid hitting the server's
 * expensive summary recompute on every interaction.
 */
export function useNotifications() {
  const { data } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: getNotifications,
    staleTime: NOTIFICATIONS_STALE_TIME,
  })

  return { notifications: data?.items ?? [], unreadCount: data?.unreadCount ?? 0 }
}
