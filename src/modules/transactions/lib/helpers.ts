import { formatCurrency } from "@/shared/lib/formatCurrency"
import type { Transaction } from "../model"

/** Signed transaction amount: `+` for income, `−` for expense. */
export function formatTxAmount(transaction: Transaction, language: string): string {
  const sign = transaction.type === "income" ? "+" : "−"
  return `${sign}${formatCurrency(transaction.amount, language, transaction.currency)}`
}
