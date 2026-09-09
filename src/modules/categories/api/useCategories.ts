import { useQuery } from "@tanstack/react-query"
import { CATEGORY_STALE_TIME, expenseCategoryKeys, incomeCategoryKeys } from "./queries"
import { getExpenseCategories, getIncomeCategories } from "./requests"

/** Plain category list of one kind — the lookup table behind pickers and duplicate checks. */
export function useCategories(isExpense: boolean) {
  return useQuery({
    queryKey: isExpense ? expenseCategoryKeys.all : incomeCategoryKeys.all,
    queryFn: isExpense ? getExpenseCategories : getIncomeCategories,
    staleTime: CATEGORY_STALE_TIME,
  })
}
