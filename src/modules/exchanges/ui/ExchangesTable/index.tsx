import { Group, Text } from "@mantine/core"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { DataTable } from "mantine-datatable"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useExchanges } from "../../api/useExchanges"
import type { Exchange } from "../../model"
import { RowActions } from "./RowActions"

/**
 * Exchanges table, a sibling of the transactions table rather than part of it.
 *
 * No filters, no totals and no pagination on purpose: an exchange has no category and no amount
 * that could be summed (its two sides are in different currencies), and the list is short by
 * nature — you only record one when you actually convert money.
 */
export function ExchangesTable() {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const { data, isLoading, isError } = useExchanges()

  return (
    <DataTable<Exchange>
      records={isError ? [] : (data ?? [])}
      idAccessor="id"
      fetching={isLoading}
      noRecordsText={isError ? t("transactions.load_error") : t("exchanges.empty")}
      striped
      highlightOnHover
      verticalSpacing="sm"
      minHeight={160}
      pinLastColumn
      style={{ flex: 1, minHeight: 0 }}
      columns={[
        {
          accessor: "date",
          title: t("common.date"),
          width: 140,
          render: (x) => format(x.date, "dd MMM yyyy", { locale }),
        },
        {
          accessor: "fromAmount",
          title: t("exchanges.gave"),
          width: 200,
          render: (x) => (
            <Group gap="xs" wrap="nowrap">
              <Text ff="monospace" size="sm" style={{ whiteSpace: "nowrap" }}>
                {formatCurrency(x.fromAmount, i18n.language, x.fromCurrency)}
              </Text>
              <IconArrowNarrowRight size={14} opacity={0.5} />
            </Group>
          ),
        },
        {
          accessor: "toAmount",
          title: t("exchanges.got"),
          width: 200,
          render: (x) => (
            <Text ff="monospace" size="sm" fw={500} style={{ whiteSpace: "nowrap" }}>
              {formatCurrency(x.toAmount, i18n.language, x.toCurrency)}
            </Text>
          ),
        },
        {
          accessor: "description",
          title: t("common.note"),
          render: (x) => (
            <Text size="sm" truncate c={x.description ? undefined : "dimmed"}>
              {x.description || "—"}
            </Text>
          ),
        },
        {
          accessor: "actions",
          title: "",
          width: 90,
          textAlign: "center",
          render: (x) => <RowActions exchange={x} />,
        },
      ]}
    />
  )
}
