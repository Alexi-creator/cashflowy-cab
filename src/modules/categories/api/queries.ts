/**
 * Category keys sit in the `["expenses"]` / `["incomes"]` namespaces — that is how the backend
 * routes are shaped (`/expense-categories`, `/income-categories`). The `transactions`
 * (`expenseKeys.all`) and `analytics` (summary/stat) modules use the same root, so invalidating
 * the `["expenses"]` prefix from transactions deliberately clears these keys too — deleting
 * transactions changes the category stats.
 */
export const expenseCategoryKeys = {
  all: ["expenses", "categories"] as const,
  /** Prefix for invalidating every category stat. */
  stats: ["expenses", "categories", "stats"] as const,
  /** Stats key for a period (+ an optional previous period for comparison). */
  statsRange: (from: string, to: string, compareFrom?: string, compareTo?: string) =>
    ["expenses", "categories", "stats", from, to, compareFrom ?? null, compareTo ?? null] as const,
}

export const incomeCategoryKeys = {
  all: ["incomes", "categories"] as const,
  stats: ["incomes", "categories", "stats"] as const,
  statsRange: (from: string, to: string, compareFrom?: string, compareTo?: string) =>
    ["incomes", "categories", "stats", from, to, compareFrom ?? null, compareTo ?? null] as const,
}

/**
 * Categories rarely change — we load them once per session and do not refetch.
 * Refresh manually by invalidating the categories key when they change.
 */
export const CATEGORY_STALE_TIME = Number.POSITIVE_INFINITY
