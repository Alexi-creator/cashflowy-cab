import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { renameExchangeAccount } from "./requests"

interface Options {
  accountId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Renames a connected account. */
export function useRenameExchangeAccount({ accountId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (label: string) => renameExchangeAccount(accountId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.all })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
