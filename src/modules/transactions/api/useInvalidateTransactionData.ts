import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { expenseCategoryKeys, incomeCategoryKeys } from "@/modules/categories/api/queries"
import type { TransactionType } from "../model"
import { expenseKeys, incomeKeys, transactionKeys } from "./queries"

/**
 * Everything a changed transaction makes stale: the combined list, the category stats of the
 * kinds touched, and their summaries (multi-currency, converted server-side by rates we do not
 * have — so they can only be refetched, never recomputed here).
 */
export function useInvalidateTransactionData() {
  const queryClient = useQueryClient()

  return useCallback(
    (kinds: TransactionType[]) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      for (const kind of new Set(kinds)) {
        const isExpense = kind === "expense"
        const categoryKeys = isExpense ? expenseCategoryKeys : incomeCategoryKeys
        const keys = isExpense ? expenseKeys : incomeKeys
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats })
        queryClient.invalidateQueries({ queryKey: [keys.all[0], "summary"] })
      }
    },
    [queryClient],
  )
}
