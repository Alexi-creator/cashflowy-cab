import { useMutation } from "@tanstack/react-query"
import type { CreateExchangePayload } from "./requests"
import { createExchange, updateExchange } from "./requests"
import { useInvalidateExchangeData } from "./useInvalidateExchangeData"

interface Options {
  /** Id of the exchange being edited; absent when recording a new one. */
  exchangeId?: string
  onSuccess?: () => void
  onError?: () => void
}

/** Creates or updates an exchange. */
export function useSaveExchange({ exchangeId, onSuccess, onError }: Options) {
  const invalidate = useInvalidateExchangeData()

  return useMutation({
    mutationFn: (payload: CreateExchangePayload) =>
      exchangeId ? updateExchange(exchangeId, payload) : createExchange(payload),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
    onError: () => onError?.(),
  })
}
