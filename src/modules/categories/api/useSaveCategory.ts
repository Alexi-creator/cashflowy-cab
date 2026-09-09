import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useInvalidateUsage } from "@/modules/subscription/api/useUsage"
import { transactionKeys } from "@/modules/transactions/api/queries"
import type { CategoryPayload } from "../model"
import { expenseCategoryKeys, incomeCategoryKeys } from "./queries"
import {
  createExpenseCategory,
  createIncomeCategory,
  updateExpenseCategory,
  updateIncomeCategory,
} from "./requests"

interface Options {
  isExpense: boolean
  /** Id of the category being edited; absent when creating a new one. */
  categoryId?: string
  onSuccess?: () => void
}

/** Creates or updates a category and refreshes everything the change is visible in. */
export function useSaveCategory({ isExpense, categoryId, onSuccess }: Options) {
  const queryClient = useQueryClient()
  const invalidateUsage = useInvalidateUsage()

  return useMutation({
    mutationFn: (payload: CategoryPayload) => {
      if (categoryId) {
        return isExpense
          ? updateExpenseCategory(categoryId, payload)
          : updateIncomeCategory(categoryId, payload)
      }
      return isExpense ? createExpenseCategory(payload) : createIncomeCategory(payload)
    },
    onSuccess: () => {
      const keys = isExpense ? expenseCategoryKeys : incomeCategoryKeys
      queryClient.invalidateQueries({ queryKey: keys.stats })
      queryClient.invalidateQueries({ queryKey: keys.all })
      // the category name/emoji are visible in the transactions list — update it too
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      // a created category moves the limit counter — refresh it so warnings/blocking stay in sync
      if (!categoryId) invalidateUsage()
      onSuccess?.()
    },
  })
}
