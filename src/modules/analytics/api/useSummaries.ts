import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  EXPENSE_STALE_TIME,
  expenseSummaryKeys,
  INCOME_STALE_TIME,
  incomeSummaryKeys,
} from "./queries"
import { getExpensesSummary, getIncomesSummary, type SummaryParams } from "./requests"

/**
 * The expense/income summary pair for one interval, already converted to the base currency.
 * Keys are derived from the params, so blocks asking for the same interval and granularity
 * share a cache entry and react-query deduplicates the requests.
 */
export function useSummaries(params: SummaryParams) {
  const fromKey = format(params.from, "yyyy-MM-dd")
  const toKey = format(params.to, "yyyy-MM-dd")

  const expenses = useQuery({
    queryKey: expenseSummaryKeys.summary(fromKey, toKey, params.granularity),
    queryFn: () => getExpensesSummary(params),
    staleTime: EXPENSE_STALE_TIME,
  })

  const incomes = useQuery({
    queryKey: incomeSummaryKeys.summary(fromKey, toKey, params.granularity),
    queryFn: () => getIncomesSummary(params),
    staleTime: INCOME_STALE_TIME,
  })

  return { expenses, incomes }
}
