import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import type { Category } from "@/modules/categories/model"
import { useInvalidateUsage } from "@/modules/subscription/api/useUsage"
import { ApiError } from "@/shared/api/apiError"
import { HttpStatus } from "@/shared/api/httpStatus"
import { expenseKeys, incomeKeys } from "./queries"
import { type CreateExpensePayload, createExpense, createIncome } from "./requests"
import { useInvalidateTransactionData } from "./useInvalidateTransactionData"

interface Options {
  isExpense: boolean
  /** Categories already in the cache — used to build the optimistic row. */
  categories?: Category[]
  onSuccess?: () => void
  /** `blocked` is true when the server rejected the create against the monthly plan limit. */
  onError?: (blocked: boolean) => void
}

/** Creates a transaction and reconciles every cache the new row shows up in. */
export function useCreateTransaction({ isExpense, categories, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateTransactionData()
  const invalidateUsage = useInvalidateUsage()

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      isExpense ? createExpense(payload) : createIncome(payload),
    onSuccess: (created) => {
      const keys = isExpense ? expenseKeys : incomeKeys
      const monthKey = format(created.date, "yyyy-MM")
      const category = categories?.find((c) => c.id === created.categoryId) ?? {
        id: created.categoryId,
        name: "",
      }
      const item = { ...created, category }

      // put the transaction into the cached list for its month (if it is in the cache); the rest
      // — list, category stats, summaries — cannot be recomputed here and is refetched instead
      queryClient.setQueryData<(typeof item)[]>(keys.month(monthKey), (old) =>
        old ? [item, ...old] : old,
      )
      invalidate([isExpense ? "expense" : "income"])

      // a created transaction moves the monthly limit counter — refresh it
      invalidateUsage()
      onSuccess?.()
    },
    onError: (error) => {
      // the server enforces the monthly limit too (in case our counter was stale) — resync it
      const blocked = error instanceof ApiError && error.status === HttpStatus.FORBIDDEN
      if (blocked) invalidateUsage()
      onError?.(blocked)
    },
  })
}
