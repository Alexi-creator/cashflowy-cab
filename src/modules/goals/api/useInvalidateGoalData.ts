import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { notificationKeys } from "@/modules/notifications/api/queries"
import { transactionKeys } from "@/modules/transactions/api/queries"
import { goalKeys } from "./queries"

/**
 * Everything a goal change makes stale. Money moved into a goal is reserved, so it shows up in
 * the balance; completing a goal produces a notification — hence the two foreign namespaces.
 * Every goal mutation invalidates exactly this set, so it lives in one place.
 */
export function useInvalidateGoalData() {
  const queryClient = useQueryClient()

  return useCallback(
    (goalId?: string) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
      if (goalId) queryClient.invalidateQueries({ queryKey: goalKeys.contributions(goalId) })
      queryClient.invalidateQueries({ queryKey: transactionKeys.balance })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    [queryClient],
  )
}
