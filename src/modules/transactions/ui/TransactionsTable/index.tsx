import { enUS } from "date-fns/locale"
import { DataTable } from "mantine-datatable"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useCategories } from "@/modules/categories/api/useCategories"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { PAGE_SIZE_OPTIONS } from "../../config"
import type { Transaction, TransactionsSummary, TransactionType } from "../../model"
import { getTransactionColumns } from "./settings"

interface Props {
  transactions: Transaction[]
  /** Total records under the filters (for pagination). */
  total: number
  page: number
  onPageChange: (page: number) => void
  /** Current page size and its change (20/50/100 selector). */
  recordsPerPage: number
  onRecordsPerPageChange: (limit: number) => void
  /** Loading/page change in progress — an overlay is shown. */
  fetching: boolean
  isError: boolean
  selectedRecords: Transaction[]
  onSelectedRecordsChange: (records: Transaction[]) => void
  /** Selection totals (in the base currency) — shown in the table footer. */
  summary?: TransactionsSummary
  /** Active type filter — affects which amounts appear in the footer. */
  type?: TransactionType
}

/** Transactions table on `mantine-datatable`: server-side pagination, loading/empty states. */
export function TransactionsTable({
  transactions,
  total,
  page,
  onPageChange,
  recordsPerPage,
  onRecordsPerPageChange,
  fetching,
  isError,
  selectedRecords,
  onSelectedRecordsChange,
  summary,
  type,
}: Props) {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS

  // we pull category emojis from the cache (lists are already loaded) — id → emoji for the "Category" column
  const { data: expenseCategories } = useCategories(true)
  const { data: incomeCategories } = useCategories(false)

  const emojiByCategoryId = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of [...(expenseCategories ?? []), ...(incomeCategories ?? [])]) {
      if (c.emoji) map.set(c.id, c.emoji)
    }
    return map
  }, [expenseCategories, incomeCategories])

  return (
    <DataTable<Transaction>
      records={isError ? [] : transactions}
      columns={getTransactionColumns(t, locale, i18n.language, emojiByCategoryId, summary, type)}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={onSelectedRecordsChange}
      pinLastColumn
      idAccessor={(t) => `${t.type}-${t.id}`}
      fetching={fetching}
      page={page}
      onPageChange={onPageChange}
      totalRecords={total}
      recordsPerPage={recordsPerPage}
      recordsPerPageOptions={PAGE_SIZE_OPTIONS}
      onRecordsPerPageChange={onRecordsPerPageChange}
      recordsPerPageLabel={t("transactions.records_per_page")}
      noRecordsText={isError ? t("transactions.load_error") : t("common.nothing_found")}
      striped
      highlightOnHover
      verticalSpacing="sm"
      minHeight={160}
      style={{ flex: 1, minHeight: 0 }}
    />
  )
}
