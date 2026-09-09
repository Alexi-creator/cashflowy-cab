import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { deleteHolding } from "./requests"

interface Options {
  holdingId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Removes a holding. */
export function useDeleteHolding({ holdingId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteHolding(holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.holdings })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
