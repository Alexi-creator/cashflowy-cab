import type { TFunction } from "i18next"
import type { ReactNode } from "react"
import { formatCurrency } from "@/shared/lib/formatCurrency"

export interface Kpi {
  /** Stable key for the list. */
  key: string
  label: string
  value: string
  sub?: string
  /** Rendered among the card's top-right controls — used for the "an exchange looks unrecorded"
   *  marker, which must not make the card taller than its neighbours. */
  alert?: ReactNode
  trend?: number
  accent?: string
  /** Shows a skeleton instead of the card while data is loading. */
  loading?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

/** Dynamic metric (income/expense for the current month) for building KPIs. */
export interface KpiMetric {
  /** Total for the current month. */
  total: number
  /** Whether there is a record for the current month in the summary. */
  hasData: boolean
  loading: boolean
  isFetching: boolean
  refetch: () => void
}

/** Total balance across all accounts (from GET /transactions/balance). */
export interface BalanceMetric {
  /** Balance in the base currency; null if exchange rates are unavailable — we show "—". */
  total: number | null
  /** The same balance in USD (for the caption under the value); null if exchange rates are unavailable. */
  usd: number | null
  /** Base currency of the balance (may differ from the summaries' currency). */
  baseCurrency?: string
  /** Exact per-currency figures behind `total` — no conversion involved in any of them. */
  byCurrency?: { currency: string; amount: number }[]
  /** Whether `total` required converting a foreign holding at today's rate. */
  isApproximate?: boolean
  loading: boolean
}

interface BuildKpisParams {
  t: TFunction
  language: string
  /** User's base currency — we show income/expense in it (approxTotal). */
  baseCurrency?: string
  balance: BalanceMetric
  income: KpiMetric
  expense: KpiMetric
  /** Marker for the balance card when something about the balance needs explaining. */
  balanceAlert?: ReactNode
}

/**
 * The currency whose balance looks impossible, or null when nothing is off.
 *
 * A per-currency balance cannot genuinely go negative — you can't spend more of a currency than
 * ever came in. Negative here, next to a positive balance in another currency, is the signature
 * of money that was converted without the exchange being recorded.
 */
export function findUnrecordedExchange(
  byCurrency: { currency: string; amount: number }[] | undefined,
): string | null {
  const rows = byCurrency ?? []
  const negative = rows.filter((c) => c.amount < 0)
  if (negative.length === 0 || !rows.some((c) => c.amount > 0)) return null
  // Name the currency furthest into the red — the one actually being spent.
  return negative.reduce((worst, c) => (c.amount < worst.amount ? c : worst)).currency
}

/**
 * Value color by sign: negative — red, otherwise green. Read off the number rather than the
 * formatted string, which carries prefixes ("≈ ") and locale-dependent symbol placement.
 */
function colorBySign(value: number): string {
  return value < 0 ? "var(--mantine-color-red-5)" : "var(--mantine-color-green-5)"
}

/** Builds the home KPI card array from static values and income/expense metrics. */
export function buildKpis({
  t,
  language,
  baseCurrency,
  balance,
  income,
  expense,
  balanceAlert,
}: BuildKpisParams): Kpi[] {
  // saved for the month = income − expense (in the base currency)
  const savedLoading = income.loading || expense.loading
  const savedTotal = income.total - expense.total
  const savedValue = savedLoading
    ? "—"
    : `${savedTotal >= 0 ? "+" : "−"}${formatCurrency(Math.abs(savedTotal), language, baseCurrency)}`

  // The balance comes in its own base currency; null (no rates) → "—". A total that had to
  // convert a foreign holding is an estimate and says so.
  const balanceValue =
    balance.loading || balance.total == null
      ? "—"
      : `${balance.isApproximate ? "≈ " : ""}${formatCurrency(balance.total, language, balance.baseCurrency)}`

  // Under the value: what is actually held in each currency — the figures that answer "how much
  // have I not converted yet". Shown only while every bucket is plausible; a negative one means
  // some of that foreign money is already spent and the split would be fiction, so the card falls
  // back to the USD equivalent and the hint below explains what to record.
  const held = (balance.byCurrency ?? []).filter((c) => c.amount !== 0)
  const splitIsTrustworthy = held.length > 1 && findUnrecordedExchange(balance.byCurrency) === null
  const balanceSub = balance.loading
    ? t("home.kpi_balance_sub_all")
    : splitIsTrustworthy
      ? held.map((c) => formatCurrency(c.amount, language, c.currency)).join("  +  ")
      : balance.usd != null
        ? `≈ ${formatCurrency(balance.usd, language, "USD")}`
        : t("home.kpi_balance_sub_all")

  return [
    {
      key: "balance",
      label: t("home.kpi_balance"),
      value: balanceValue,
      sub: balanceSub,
      alert: balanceAlert,
      accent: balance.total != null ? colorBySign(balance.total) : undefined,
      loading: balance.loading,
    },
    {
      key: "income",
      label: t("home.kpi_income"),
      value: income.loading ? "—" : formatCurrency(income.total, language, baseCurrency),
      sub: income.hasData ? t("home.kpi_this_month") : t("home.kpi_no_data"),
      accent: "var(--mantine-color-green-5)",
      loading: income.loading,
      onRefresh: income.refetch,
      isRefreshing: income.isFetching,
    },
    {
      key: "expense",
      label: t("home.kpi_expense"),
      value: expense.loading ? "—" : formatCurrency(-expense.total, language, baseCurrency),
      sub: expense.hasData ? t("home.kpi_this_month") : t("home.kpi_no_data"),
      accent: "var(--mantine-color-red-5)",
      loading: expense.loading,
      onRefresh: expense.refetch,
      isRefreshing: expense.isFetching,
    },
    {
      key: "saved",
      label: t("home.kpi_saved"),
      value: savedValue,
      sub: t("home.kpi_saved_sub"),
      accent: savedLoading ? undefined : colorBySign(savedTotal),
      loading: savedLoading,
    },
  ]
}
