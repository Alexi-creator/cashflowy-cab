import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { createHolding, type HoldingPayload, updateHolding } from "./requests"

interface Options {
  /** Id of the holding being edited; absent when adding a new one. */
  holdingId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Adds or edits a holding. */
export function useSaveHolding({ holdingId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: HoldingPayload) =>
      holdingId ? updateHolding(holdingId, payload) : createHolding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.holdings })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
