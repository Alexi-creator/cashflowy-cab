import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { NotificationsResponse } from "../model"
import { notificationKeys } from "./queries"
import { markAllNotificationsRead } from "./requests"

/** Marks every notification read, applied to the cache first and rolled back on failure. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const prev = queryClient.getQueryData<NotificationsResponse>(notificationKeys.all)
      queryClient.setQueryData<NotificationsResponse>(notificationKeys.all, (old) =>
        old ? { items: old.items.map((n) => ({ ...n, isRead: true })), unreadCount: 0 } : old,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(notificationKeys.all, ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
