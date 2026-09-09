import { useMutation } from "@tanstack/react-query"
import type { Transaction } from "../model"
import { deleteTransactionsBulk } from "./requests"
import { useInvalidateTransactionData } from "./useInvalidateTransactionData"

interface Options {
  transactions: Transaction[]
  onSuccess?: () => void
}

/** Deletes a selection in one round trip per kind. */
export function useDeleteTransactionsBulk({ transactions, onSuccess }: Options) {
  const invalidate = useInvalidateTransactionData()
  const expenseIds = transactions.filter((t) => t.type === "expense").map((t) => t.id)
  const incomeIds = transactions.filter((t) => t.type === "income").map((t) => t.id)

  return useMutation({
    mutationFn: () =>
      Promise.all([
        ...(expenseIds.length ? [deleteTransactionsBulk("expense", expenseIds)] : []),
        ...(incomeIds.length ? [deleteTransactionsBulk("income", incomeIds)] : []),
      ]),
    onSuccess: () => {
      invalidate(transactions.map((t) => t.type))
      onSuccess?.()
    },
  })
}
