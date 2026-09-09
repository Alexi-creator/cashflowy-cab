import { endOfMonth, startOfMonth, subMonths } from "date-fns"
import type { SummaryParams } from "@/modules/analytics/api/requests"
import { useSummaries } from "@/modules/analytics/api/useSummaries"

/** Summary interval and granularity for the selected chart period. */
function periodToParams(period: string): SummaryParams {
  const now = new Date()
  if (period === "1m") {
    // the whole current month by day: the backend returns future days empty (we draw 0)
    return { from: startOfMonth(now), to: endOfMonth(now), granularity: "day" }
  }
  // 6m / 1y — monthly for the last N months including the current one
  const count = period === "1y" ? 12 : 6
  return { from: startOfMonth(subMonths(now, count - 1)), to: now, granularity: "month" }
}

/**
 * Cash flow chart data for the selected period from the `/summary` summaries
 * (already in the base currency). 1m — by day, 6m/1y — by month. Query keys are shared
 * with other home blocks (same granularity) — react-query deduplicates.
 */
export function useCashflowData(period: string) {
  const { expenses, incomes } = useSummaries(periodToParams(period))

  return { expensesSummary: expenses.data, incomesSummary: incomes.data }
}
