import { useQuery } from "@tanstack/react-query"
import { EXPENSE_STALE_TIME, INCOME_STALE_TIME } from "@/modules/analytics/api/queries"
import { expenseCategoryKeys, incomeCategoryKeys } from "./queries"
import { getExpenseCategoriesStats, getIncomeCategoriesStats } from "./requests"

/** Categories with totals and transaction counts, for the categories screen. */
export function useCategoriesStats(isExpense: boolean) {
  return useQuery({
    queryKey: isExpense ? expenseCategoryKeys.stats : incomeCategoryKeys.stats,
    queryFn: isExpense ? () => getExpenseCategoriesStats() : () => getIncomeCategoriesStats(),
    staleTime: isExpense ? EXPENSE_STALE_TIME : INCOME_STALE_TIME,
  })
}
