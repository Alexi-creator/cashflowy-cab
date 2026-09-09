import type { GetTransactionsParams } from "./requests"
export const transactionKeys = {
  all: ["transactions"] as const,
  list: (params: GetTransactionsParams) => ["transactions", "list", params] as const,
  recent: (limit: number) => ["transactions", "recent", limit] as const,
  balance: ["transactions", "balance"] as const,
}

export const TRANSACTIONS_STALE_TIME = 5 * 60 * 1000

/**
 * Namespaces of the raw expense/income records. `all` is the `["expenses"]` prefix, which
 * deliberately clears EVERYTHING under it, the keys of `categories`
 * (`["expenses","categories",…]`) and `analytics` (`["expenses","summary",…]`) included:
 * deleting transactions in bulk changes both the category stats and the aggregates.
 */
export const expenseKeys = {
  all: ["expenses"] as const,
  month: (month: string) => ["expenses", "month", month] as const,
  range: (from: string, to: string) => ["expenses", "range", from, to] as const,
}

export const incomeKeys = {
  all: ["incomes"] as const,
  month: (month: string) => ["incomes", "month", month] as const,
  range: (from: string, to: string) => ["incomes", "range", from, to] as const,
}
