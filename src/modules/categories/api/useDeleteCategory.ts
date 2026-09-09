import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionKeys } from "@/modules/transactions/api/queries"
import { expenseCategoryKeys, incomeCategoryKeys } from "./queries"
import { deleteExpenseCategory, deleteIncomeCategory } from "./requests"

interface Options {
  isExpense: boolean
  categoryId: string
  onSuccess?: () => void
}

/** Deletes a category; its transactions go with it, so the list is refreshed too. */
export function useDeleteCategory({ isExpense, categoryId, onSuccess }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      isExpense ? deleteExpenseCategory(categoryId) : deleteIncomeCategory(categoryId),
    onSuccess: () => {
      const keys = isExpense ? expenseCategoryKeys : incomeCategoryKeys
      queryClient.invalidateQueries({ queryKey: keys.stats })
      queryClient.invalidateQueries({ queryKey: keys.all, exact: true })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      onSuccess?.()
    },
  })
}
