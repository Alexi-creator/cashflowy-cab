import { useQueryClient } from "@tanstack/react-query"
import { useUpdateMe } from "@/modules/auth/api/useUpdateMe"
import { expenseCategoryKeys, incomeCategoryKeys } from "@/modules/categories/api/queries"

interface Options {
  /** Currency before the edit — switching it invalidates category stats. */
  previousCurrency: string
  onSuccess?: () => void
  onError?: () => void
}

/**
 * Profile save from the settings screen. Wraps auth's `useUpdateMe` because saving here has a
 * cross-module effect: category stats are recomputed in the base currency server-side, so
 * changing the currency makes every cached stat stale.
 */
export function useSaveProfile({ previousCurrency, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useUpdateMe({
    onSuccess: (updated) => {
      if (updated.currency !== previousCurrency) {
        queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.stats })
        queryClient.invalidateQueries({ queryKey: incomeCategoryKeys.stats })
      }
      onSuccess?.()
    },
    onError,
  })
}
