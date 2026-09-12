import { Box, Group, LoadingOverlay, Pagination, Text } from "@mantine/core"
import { enUS } from "date-fns/locale"
import { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useCategories } from "@/modules/categories/api/useCategories"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { useModalStore } from "@/shared/store/modalStore"
import { groupTransactionsByDay } from "../../lib/groupByDay"
import type { Transaction, TransactionsSummary, TransactionType } from "../../model"
import { SummaryStrip } from "./SummaryStrip"
import { TransactionCard } from "./TransactionCard"
import { TransactionDetails } from "./TransactionDetails"

interface Props {
  transactions: Transaction[]
  total: number
  page: number
  onPageChange: (page: number) => void
  recordsPerPage: number
  fetching: boolean
  isError: boolean
  selectedRecords: Transaction[]
  onSelectedRecordsChange: (records: Transaction[]) => void
  /** Selection mode is driven from the toolbar: without it a tap opens the details instead. */
  selectionMode: boolean
  summary?: TransactionsSummary
  type?: TransactionType
}

/** Same identity the table uses — ids are only unique within a type. */
const rowKey = (t: Transaction) => `${t.type}-${t.id}`

/**
 * The transactions list below the `sm` breakpoint, in place of the table.
 *
 * The table's five columns want ~1000px; a phone has ~375. Rather than scroll that sideways, the
 * date becomes a group header, the category collapses to its emoji, the row actions move into a
 * details sheet behind a tap, and only description/category/amount stay on screen.
 */
export function TransactionsMobileList({
  transactions,
  total,
  page,
  onPageChange,
  recordsPerPage,
  fetching,
  isError,
  selectedRecords,
  onSelectedRecordsChange,
  selectionMode,
  summary,
  type,
}: Props) {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const openModal = useModalStore((s) => s.open)

  const rootRef = useRef<HTMLDivElement>(null)

  const { data: expenseCategories } = useCategories(true)
  const { data: incomeCategories } = useCategories(false)

  const emojiByCategoryId = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of [...(expenseCategories ?? []), ...(incomeCategories ?? [])]) {
      if (c.emoji) map.set(c.id, c.emoji)
    }
    return map
  }, [expenseCategories, incomeCategories])

  const records = isError ? [] : transactions
  const groups = useMemo(() => groupTransactionsByDay(records, t, locale), [records, t, locale])

  const selectedKeys = useMemo(() => new Set(selectedRecords.map(rowKey)), [selectedRecords])

  const toggle = (transaction: Transaction) => {
    const key = rowKey(transaction)
    onSelectedRecordsChange(
      selectedKeys.has(key)
        ? selectedRecords.filter((r) => rowKey(r) !== key)
        : [...selectedRecords, transaction],
    )
  }

  const openDetails = (transaction: Transaction) =>
    openModal({
      centered: true,
      title: (
        <Text fw={600} size="md">
          {t("transactions.details_title")}
        </Text>
      ),
      children: (
        <TransactionDetails
          transaction={transaction}
          locale={locale}
          emoji={emojiByCategoryId.get(transaction.categoryId)}
        />
      ),
    })

  const totalPages = Math.max(1, Math.ceil(total / recordsPerPage))

  // the pager sits at the bottom of a page-height list, so a page change would otherwise drop
  // the reader into the middle of the new one — send the page scroller back to the top
  const changePage = (next: number) => {
    onPageChange(next)
    rootRef.current?.closest("main")?.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Box ref={rootRef} style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <LoadingOverlay visible={fetching} zIndex={2} overlayProps={{ blur: 1 }} />

      {summary && records.length > 0 && <SummaryStrip summary={summary} type={type} />}

      {records.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py={48}>
          {isError ? t("transactions.load_error") : t("common.nothing_found")}
        </Text>
      ) : (
        groups.map((group) => (
          <Box key={group.key}>
            {/* the header sticks to the top of the scrolling area (Main on mobile), so the day
                being read is always named */}
            <Box
              px="md"
              py={6}
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "var(--mantine-color-body)",
                borderBottom: "1px solid var(--mantine-color-default-border)",
              }}
            >
              <Text
                size="xs"
                fw={600}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: "0.04em" }}
              >
                {group.label}
              </Text>
            </Box>

            {group.items.map((transaction) => (
              <TransactionCard
                key={rowKey(transaction)}
                transaction={transaction}
                language={i18n.language}
                emoji={emojiByCategoryId.get(transaction.categoryId)}
                selectionMode={selectionMode}
                selected={selectedKeys.has(rowKey(transaction))}
                onPress={() => (selectionMode ? toggle(transaction) : openDetails(transaction))}
              />
            ))}
          </Box>
        ))
      )}

      {totalPages > 1 && (
        <Group px="md" py="sm" justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {t("transactions.page_indicator", { page, total: totalPages })}
          </Text>
          {/* siblings/boundaries at 0: on a phone the numbers in between are unreachable
              anyway — prev/next plus the current page is the whole usable control */}
          <Pagination
            size="sm"
            siblings={0}
            boundaries={0}
            total={totalPages}
            value={page}
            onChange={changePage}
          />
        </Group>
      )}
    </Box>
  )
}
