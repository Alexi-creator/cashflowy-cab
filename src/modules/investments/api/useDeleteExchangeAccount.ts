import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { deleteExchangeAccount } from "./requests"

interface Options {
  accountId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Disconnects an account together with everything pulled from it. */
export function useDeleteExchangeAccount({ accountId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteExchangeAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.all })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
