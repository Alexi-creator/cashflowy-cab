import {
  Anchor,
  Box,
  Button,
  Group,
  HoverCard,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useCategories } from "@/modules/categories/api/useCategories"
import { useUsage } from "@/modules/subscription/api/useUsage"
import { isLimitBlocked } from "@/modules/subscription/lib/plan"
import { LimitAlert } from "@/modules/subscription/ui"
import type { Transaction } from "@/modules/transactions"
import { useTransactions } from "@/modules/transactions/api/useTransactions"
import { transactionsParamsSchema } from "@/modules/transactions/config"
import { useTransactionsTour } from "@/modules/transactions/hooks/useTransactionsTour"
import { buildFilterChipGroups } from "@/modules/transactions/lib/filterChips"
import {
  ActiveFilterChips,
  BulkDeleteModal,
  TransactionFormModal,
  TransactionsFilters,
  TransactionsTable,
  TransactionsToolbar,
} from "@/modules/transactions/ui"
import { RouteNames } from "@/shared/config/routeNames"
import { useUrlParams } from "@/shared/hooks/useUrlParams"
import { useModalStore } from "@/shared/store/modalStore"
import { TourTriggerButton } from "@/shared/ui/TourTriggerButton"

export function TransactionsPage() {
  const { t } = useTranslation()
  const theme = useMantineTheme()
  // below `md` the filters live in a bottom drawer whose handle is fixed to the viewport
  // edge — reserve space so it never covers the table footer/pagination.
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`, true, {
    getInitialValueInEffect: false,
  })
  const [params, setParams] = useUrlParams(transactionsParamsSchema)
  const openModal = useModalStore((s) => s.open)
  const { startTour } = useTransactionsTour()

  const apiParams = {
    type: params.type,
    categoryId: params.categoryId,
    currency: params.currency,
    search: params.search,
    from: params.from,
    to: params.to,
    page: params.page,
    limit: params.limit,
  }

  const { data, isLoading, isError, isPlaceholderData } = useTransactions(apiParams)

  // categories are needed to determine whether a transaction can be added at all
  const { data: expenseCategories } = useCategories(true)
  const { data: incomeCategories } = useCategories(false)

  // union of both sets — used to resolve selected category ids into names/emoji for the chips
  const allCategories = [...(expenseCategories ?? []), ...(incomeCategories ?? [])]

  // both lists are loaded and empty — there is nowhere to add a transaction
  const hasNoCategories =
    !!expenseCategories &&
    !!incomeCategories &&
    expenseCategories.length === 0 &&
    incomeCategories.length === 0

  // monthly transaction limit reached on the current plan — block creating more
  const { data: usage } = useUsage()
  const transactionsBlocked = isLimitBlocked(usage?.transactions)

  const [selectedRecords, setSelectedRecords] = useState<Transaction[]>([])

  const openAddModal = () =>
    openModal({ size: "lg", centered: true, children: <TransactionFormModal /> })

  const openBulkDelete = () =>
    openModal({
      centered: true,
      title: (
        <Text fw={600} size="md">
          {t("transactions.bulk_delete_title")}
        </Text>
      ),
      children: (
        <BulkDeleteModal transactions={selectedRecords} onSuccess={() => setSelectedRecords([])} />
      ),
    })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  // The footer totals come from the route already computed in the base currency and for the
  // current page's slice (the backend converts currencies at the exchange rate). Refetching on
  // a page/page-size change updates the query key → the totals are recomputed for the visible rows.
  const summary = items.length > 0 ? data?.summary : undefined

  return (
    <Stack gap="md" style={{ flex: 1, minHeight: 0, paddingBottom: isDesktop ? 0 : 64 }}>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={4}>
          <Title order={2} size="h3">
            {t("transactions.title")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("transactions.count_label", { count: total })}
          </Text>
        </Stack>
        <Group gap="xs">
          {/* Hidden until the export API is ready
          <Button variant="default" size="sm" leftSection={<IconDownload size={14} />}>
            CSV
          </Button>
          */}
          <Box data-tour="tx-add">
            {transactionsBlocked ? (
              // a disabled button swallows hover, so the tooltip listens on the wrapping Box
              <Tooltip label={t("limits.blocked_button_tooltip")} position="bottom-end" withArrow>
                <Box>
                  <Button
                    size="sm"
                    leftSection={<IconPlus size={14} />}
                    disabled
                    style={{
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--mantine-color-default-border)",
                    }}
                  >
                    {t("transactions.add")}
                  </Button>
                </Box>
              </Tooltip>
            ) : hasNoCategories ? (
              <HoverCard width={240} shadow="md" withArrow position="bottom-end" openDelay={100}>
                <HoverCard.Target>
                  {/* muted green (variant light) instead of gray data-disabled —
                    so it does not blend in; it stays a hover target for the tooltip, but
                    we suppress the click and mark aria-disabled */}
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    aria-disabled
                    onClick={(e) => e.preventDefault()}
                    style={{ cursor: "default" }}
                  >
                    {t("transactions.add")}
                  </Button>
                </HoverCard.Target>

                <HoverCard.Dropdown>
                  <Text size="sm">
                    {t("transactions.no_categories")}{" "}
                    <Anchor component={Link} to={RouteNames.Categories}>
                      {t("transactions.add_group_link")}
                    </Anchor>
                  </Text>
                </HoverCard.Dropdown>
              </HoverCard>
            ) : (
              <Button size="sm" leftSection={<IconPlus size={14} />} onClick={openAddModal}>
                {t("transactions.add")}
              </Button>
            )}
          </Box>
          <TourTriggerButton onClick={startTour} />
        </Group>
      </Group>

      <LimitAlert usage={usage?.transactions} kind="transactions" />

      <Paper
        data-tour="tx-list"
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // Floor for the card so the table never collapses to nothing on a short screen.
          // On a tall screen flex:1 grows past this and the table owns its internal scroll;
          // on a short screen the card holds this height and Main scrolls to reach it.
          // Below `md` the controls move out to the bottom drawer, so the card can sit lower.
          minHeight: isDesktop ? 420 : 320,
        }}
      >
        <TransactionsFilters params={params} setParams={setParams} />

        <ActiveFilterChips
          groups={buildFilterChipGroups({ params, categories: allCategories, t, setParams })}
        />

        <TransactionsToolbar
          selectedCount={selectedRecords.length}
          onClearSelection={() => setSelectedRecords([])}
          onBulkDelete={openBulkDelete}
        />

        <TransactionsTable
          transactions={items}
          total={total}
          page={params.page}
          onPageChange={(page) => {
            setSelectedRecords([])
            setParams({ page })
          }}
          recordsPerPage={params.limit}
          onRecordsPerPageChange={(limit) => setParams({ limit, page: 1 })}
          fetching={isLoading || isPlaceholderData}
          isError={isError}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
          summary={summary}
          type={params.type}
        />
      </Paper>
    </Stack>
  )
}
