import { useMutation } from "@tanstack/react-query"
import type { Transaction } from "../model"
import { deleteTransaction } from "./requests"
import { useInvalidateTransactionData } from "./useInvalidateTransactionData"

interface Options {
  transaction: Transaction
  onSuccess?: () => void
}

/** Deletes one transaction. */
export function useDeleteTransaction({ transaction, onSuccess }: Options) {
  const invalidate = useInvalidateTransactionData()

  return useMutation({
    mutationFn: () => deleteTransaction(transaction.type, transaction.id),
    onSuccess: () => {
      invalidate([transaction.type])
      onSuccess?.()
    },
  })
}
