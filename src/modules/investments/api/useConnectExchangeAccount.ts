import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { type ConnectAccountPayload, connectExchangeAccount } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Connects an exchange API key; the first sync starts server-side right after. */
export function useConnectExchangeAccount({ onSuccess, onError }: Options = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ConnectAccountPayload) => connectExchangeAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.accounts })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
