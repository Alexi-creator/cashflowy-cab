import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { syncExchangeAccount } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Pulls fresh history for the given accounts.
 *
 * Both outcomes invalidate: a failed manual sync still persists `lastError`/`status` on the
 * account (same as a failed background sync), so the row's error tooltip needs the refetch.
 */
export function useSyncExchangeAccounts({ onSuccess, onError }: Options = {}) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: investingKeys.all })

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => syncExchangeAccount(id)))
    },
    onSuccess: () => {
      // The sync may have brought new positions/fills along with the account status.
      invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      invalidate()
      onError?.(error)
    },
  })
}
