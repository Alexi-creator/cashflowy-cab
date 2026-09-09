import { SimpleGrid, Skeleton } from "@mantine/core"
import { endOfMonth, startOfMonth } from "date-fns"
import { useTranslation } from "react-i18next"
import { useSummaries } from "@/modules/analytics/api/useSummaries"
import { useBalance } from "@/modules/transactions/api/useBalance"
import { KpiCard } from "@/shared/ui/KpiCard"
import { buildKpis } from "./helpers"

/**
 * Row of KPI cards on the home page. Fetches the total balance (/transactions/balance) and
 * income/expense summaries for the current month (granularity=day — deduplicated with the chart
 * by the same keys), then builds the cards via `buildKpis`.
 */
export function HomeKpis() {
  const { t, i18n } = useTranslation()
  const now = new Date()
  const from = startOfMonth(now)
  // whole month (to=end of month) — shared key/range with the chart; future days are empty
  const to = endOfMonth(now)
  const balanceQuery = useBalance()
  const { expenses: expensesQuery, incomes: incomesQuery } = useSummaries({
    from,
    to,
    granularity: "day",
  })

  // whether there is at least one transaction in the period (for the "no data" caption)
  const incomeHasData = (incomesQuery.data?.buckets ?? []).some((b) => b.totals.length > 0)
  const expenseHasData = (expensesQuery.data?.buckets ?? []).some((b) => b.totals.length > 0)

  // user's base currency — the summary approxTotal/total come in it
  const baseCurrency = incomesQuery.data?.baseCurrency ?? expensesQuery.data?.baseCurrency

  const kpis = buildKpis({
    t,
    language: i18n.language,
    baseCurrency,
    balance: {
      total: balanceQuery.data?.balance ?? null,
      usd: balanceQuery.data?.balanceUsd ?? null,
      baseCurrency: balanceQuery.data?.baseCurrency,
      loading: balanceQuery.isLoading,
    },
    income: {
      total: incomesQuery.data?.total ?? 0,
      hasData: incomeHasData,
      loading: incomesQuery.isLoading,
      isFetching: incomesQuery.isFetching,
      refetch: incomesQuery.refetch,
    },
    expense: {
      total: expensesQuery.data?.total ?? 0,
      hasData: expenseHasData,
      loading: expensesQuery.isLoading,
      isFetching: expensesQuery.isFetching,
      refetch: expensesQuery.refetch,
    },
  })

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" data-tour="kpis">
      {kpis.map(({ key, loading, ...card }) => (
        <Skeleton key={key} visible={loading ?? false} radius="md">
          <KpiCard {...card} />
        </Skeleton>
      ))}
    </SimpleGrid>
  )
}
