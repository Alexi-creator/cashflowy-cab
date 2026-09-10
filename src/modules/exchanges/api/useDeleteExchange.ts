import { useMutation } from "@tanstack/react-query"
import { deleteExchange } from "./requests"
import { useInvalidateExchangeData } from "./useInvalidateExchangeData"

interface Options {
  exchangeId: string
  onSuccess?: () => void
}

/** Deletes an exchange — the money goes back to the currency it came from. */
export function useDeleteExchange({ exchangeId, onSuccess }: Options) {
  const invalidate = useInvalidateExchangeData()

  return useMutation({
    mutationFn: () => deleteExchange(exchangeId),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
  })
}
