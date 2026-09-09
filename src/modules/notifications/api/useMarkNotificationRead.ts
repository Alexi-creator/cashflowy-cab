import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { NotificationsResponse } from "../model"
import { notificationKeys } from "./queries"
import { markNotificationRead } from "./requests"

/** Marks one notification read, flipping it in the cache first and rolling back on failure. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const prev = queryClient.getQueryData<NotificationsResponse>(notificationKeys.all)
      queryClient.setQueryData<NotificationsResponse>(notificationKeys.all, (old) =>
        old
          ? {
              items: old.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
              unreadCount: old.items.find((n) => n.id === id && !n.isRead)
                ? Math.max(0, old.unreadCount - 1)
                : old.unreadCount,
            }
          : old,
      )
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(notificationKeys.all, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
