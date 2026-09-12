import { format, isSameYear, isToday, isYesterday, type Locale } from "date-fns"
import type { TFunction } from "i18next"
import type { Transaction } from "../model"

/** One calendar day of transactions, rendered under a sticky header in the mobile list. */
export interface DayGroup {
  /** `yyyy-MM-dd` — stable React key. */
  key: string
  /** Header text: "Today"/"Yesterday" or the formatted date. */
  label: string
  items: Transaction[]
}

/**
 * Header for a day: the two most recent days get a word instead of a date, and the year is
 * dropped while it is the current one — on a phone the date is context, not data, so it should
 * take as few characters as it can.
 */
function dayLabel(date: Date, t: TFunction, locale: Locale): string {
  if (isToday(date)) return t("common.today")
  if (isYesterday(date)) return t("common.yesterday")
  return format(date, isSameYear(date, new Date()) ? "d MMMM" : "d MMMM yyyy", { locale })
}

/**
 * Groups the page's transactions into calendar days, preserving the order the backend sent
 * (already sorted by date) instead of re-sorting.
 *
 * The mobile list shows the date as a group header rather than a column: it frees the width of a
 * whole column and reads better — a phone list is scanned top-down, so the date is a divider.
 */
export function groupTransactionsByDay(
  transactions: Transaction[],
  t: TFunction,
  locale: Locale,
): DayGroup[] {
  const groups: DayGroup[] = []

  for (const transaction of transactions) {
    const key = format(transaction.date, "yyyy-MM-dd")
    const last = groups.at(-1)

    // the list arrives sorted, so a day is closed as soon as the next key differs — but a
    // repeated key later in the list would simply open a new group rather than corrupt one
    if (last?.key === key) last.items.push(transaction)
    else groups.push({ key, label: dayLabel(transaction.date, t, locale), items: [transaction] })
  }

  return groups
}
