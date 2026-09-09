import { z } from "zod"
import { categorySchema } from "@/modules/categories"
import { wallClockDate } from "@/shared/lib/wallClock"

export const transactionTypeSchema = z.enum(["income", "expense"])
export type TransactionType = z.infer<typeof transactionTypeSchema>

/** A single transaction from the combined /transactions route (category is flat). */
export const transactionSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  categoryName: z.string().nullable(),
  amount: z.coerce.number(),
  /** Transaction currency code (ISO 4217); may be missing on old records. */
  currency: z.string().nullish(),
  description: z.string(),
  date: wallClockDate(),
  type: transactionTypeSchema,
})
export type Transaction = z.infer<typeof transactionSchema>

/**
 * Monetary total for the transactions on the current page (respecting filters),
 * converted to the user's base currency. Amounts are null if exchange rates are unavailable.
 */
export const transactionsSummarySchema = z.object({
  baseCurrency: z.string(),
  income: z.coerce.number().nullable(),
  expense: z.coerce.number().nullable(),
  net: z.coerce.number().nullable(),
})
export type TransactionsSummary = z.infer<typeof transactionsSummarySchema>

/**
 * User's total balance. `balance` — in the base currency, `balanceUsd` — in USD.
 * Either amount is null if exchange rates are unavailable (we show "—").
 */
export const balanceSchema = z.object({
  baseCurrency: z.string(),
  /** Free balance (income − expense − money reserved in goals), in USD. */
  balanceUsd: z.coerce.number().nullable(),
  /** Free balance, in the base currency. */
  balance: z.coerce.number().nullable(),
  /** Reserved in active goals, base currency; null without rates. May be absent on old backends. */
  inGoals: z.coerce.number().nullable().optional(),
  /** Reserved in active goals, USD; null without rates. */
  inGoalsUsd: z.coerce.number().nullable().optional(),
})
export type Balance = z.infer<typeof balanceSchema>

/** Paginated /transactions response. */
export const transactionsResponseSchema = z.object({
  items: z.array(transactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  summary: transactionsSummarySchema,
})
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>

/** A raw expense row from /expenses (category nested). */
export const expenseSchema = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  description: z.string(),
  date: wallClockDate(),
  createdAt: z.coerce.date(),
  category: categorySchema,
})

/** A raw income row from /incomes (category nested). */
export const incomeSchema = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  description: z.string(),
  date: wallClockDate(),
  createdAt: z.coerce.date(),
  category: categorySchema,
})

/** POST /expenses response: the created row without a nested category (only `categoryId`). */
export const createdExpenseSchema = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  description: z.string(),
  date: wallClockDate(),
  createdAt: z.coerce.date(),
  categoryId: z.string(),
})

/** POST /incomes response: the created row without a nested category (only `categoryId`). */
export const createdIncomeSchema = z.object({
  id: z.string(),
  amount: z.coerce.number(),
  description: z.string(),
  date: wallClockDate(),
  createdAt: z.coerce.date(),
  categoryId: z.string(),
})

export type Expense = z.infer<typeof expenseSchema>
export type Income = z.infer<typeof incomeSchema>
export type CreatedExpense = z.infer<typeof createdExpenseSchema>
export type CreatedIncome = z.infer<typeof createdIncomeSchema>
