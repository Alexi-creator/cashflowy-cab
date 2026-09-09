import { useMutation } from "@tanstack/react-query"
import type { Transaction } from "../model"
import { type UpdateTransactionPayload, updateTransaction } from "./requests"
import { useInvalidateTransactionData } from "./useInvalidateTransactionData"

interface Options {
  transaction: Transaction
  onSuccess?: () => void
  onError?: () => void
}

/** Edits one transaction; the row may re-sort, so the list is refetched with current filters. */
export function useUpdateTransaction({ transaction, onSuccess, onError }: Options) {
  const invalidate = useInvalidateTransactionData()

  return useMutation({
    mutationFn: (payload: UpdateTransactionPayload) =>
      updateTransaction(transaction.type, transaction.id, payload),
    onSuccess: () => {
      invalidate([transaction.type])
      onSuccess?.()
    },
    onError: () => onError?.(),
  })
}
