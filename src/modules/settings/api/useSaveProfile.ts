import { useQueryClient } from "@tanstack/react-query"
import { useUpdateMe } from "@/modules/auth/api/useUpdateMe"
import { goalKeys } from "@/modules/goals/api/queries"
import { notificationKeys } from "@/modules/notifications/api/queries"
import { expenseKeys, incomeKeys, transactionKeys } from "@/modules/transactions/api/queries"

interface Options {
  /** Currency before the edit — switching it invalidates every cached amount. */
  previousCurrency: string
  onSuccess?: () => void
  onError?: () => void
}

/**
 * Profile save from the settings screen. Wraps auth's `useUpdateMe` because saving here has a
 * cross-module effect: every total is converted to the base currency server-side, so changing
 * the currency makes each cached amount stale — the balance, the summaries, the category stats,
 * the goal aggregates and the notification digests alike. Cached data is only marked stale here,
 * so the screens that are not mounted (the home page among them) refetch on their next visit
 * instead of showing the old currency.
 *
 * Investing amounts are left alone: they are USD/USDT and never converted (see
 * `modules/investments/model`); so are exchange records, which carry their own pair of currencies.
 */
export function useSaveProfile({ previousCurrency, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useUpdateMe({
    onSuccess: (updated) => {
      if (updated.currency !== previousCurrency) {
        // the `["expenses"]` / `["incomes"]` prefixes deliberately sweep the category and
        // analytics keys living under them too — see the comment in `transactions/api/queries`
        queryClient.invalidateQueries({ queryKey: transactionKeys.all })
        queryClient.invalidateQueries({ queryKey: expenseKeys.all })
        queryClient.invalidateQueries({ queryKey: incomeKeys.all })
        queryClient.invalidateQueries({ queryKey: goalKeys.all })
        queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      }
      onSuccess?.()
    },
    onError,
  })
}
