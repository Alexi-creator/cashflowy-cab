import { z } from "zod"
import { wallClockDate } from "@/shared/lib/wallClock"

/** A single transaction in the detailed stat — amount in its original currency (as in the bot). */
export const statItemSchema = z.object({
  date: wallClockDate(),
  amount: z.coerce.number(),
  currency: z.string(),
  description: z.string(),
})

/** Category block: total in the base currency + the underlying transactions. */
export const statCategorySchema = z.object({
  category: z.string(),
  /** Category emoji; the backend may omit it — then the frontend uses a fallback from the palette. */
  emoji: z.string().nullish(),
  /** Category total in the base currency; null if exchange rates are unavailable. */
  total: z.coerce.number().nullable(),
  items: z.array(statItemSchema),
})

/**
 * GET /expenses/stat | /incomes/stat — everything in one response: the overall total and
 * per-category totals (in `baseCurrency`) plus the transaction details for the period.
 */
export const detailedStatSchema = z.object({
  baseCurrency: z.string(),
  total: z.coerce.number().nullable(),
  categories: z.array(statCategorySchema),
})

export type StatItem = z.infer<typeof statItemSchema>
export type StatCategory = z.infer<typeof statCategorySchema>
export type DetailedStat = z.infer<typeof detailedStatSchema>

/** Granularity of summary buckets. */
export type SummaryGranularity = "day" | "week" | "month"

/** Total for a period in a single currency (currencies are not summed together). */
export const summaryCurrencyTotalSchema = z.object({
  currency: z.string(),
  total: z.coerce.number(),
  count: z.coerce.number(),
})

/**
 * Summary bucket: breakdown by currency + approx. total in the base currency. `bucket` —
 * interval label: `YYYY-MM-DD` for day/week (week = Monday's date), `YYYY-MM`
 * for month. The backend returns empty buckets with empty `totals` and `approxTotal` (we draw 0).
 */
export const bucketSummarySchema = z.object({
  bucket: z.string(),
  totals: z.array(summaryCurrencyTotalSchema).default([]),
  /** Approx. total for the bucket in the base currency; null if exchange rates are unavailable. */
  approxTotal: z.coerce.number().nullable(),
})

/**
 * Expense summary for a period broken down into buckets of the chosen granularity. Transactions
 * may be in different currencies: per bucket — `totals` (breakdown by currency) and
 * `approxTotal` (converted to `baseCurrency`); `total` — approx. total for the whole period.
 */
export const expensesSummarySchema = z.object({
  baseCurrency: z.string(),
  granularity: z.enum(["day", "week", "month"]),
  total: z.coerce.number().nullable(),
  buckets: z.array(bucketSummarySchema),
})

/** Income summary — same shape as {@link expensesSummarySchema}, for the /incomes/summary route. */
export const incomesSummarySchema = z.object({
  baseCurrency: z.string(),
  granularity: z.enum(["day", "week", "month"]),
  total: z.coerce.number().nullable(),
  buckets: z.array(bucketSummarySchema),
})

export type BucketSummary = z.infer<typeof bucketSummarySchema>
export type ExpensesSummary = z.infer<typeof expensesSummarySchema>
export type IncomesSummary = z.infer<typeof incomesSummarySchema>
