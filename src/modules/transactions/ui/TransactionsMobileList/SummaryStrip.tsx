import { Group, Stack, Text } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import type { TransactionsSummary, TransactionType } from "../../model"

interface Props {
  summary: TransactionsSummary
  /** Active type filter: with `income`/`expense` only the relevant amount is shown. */
  type?: TransactionType
}

/**
 * Page totals as a strip above the mobile list.
 *
 * On desktop these live in the table footer, drawn as an absolutely positioned layer over the
 * empty footer cells — a trick that needs spare width to the right and has none on a phone.
 * Here they get their own row, stacked label-over-value so three amounts fit on one line.
 */
export function SummaryStrip({ summary, type }: Props) {
  const { t, i18n } = useTranslation()

  const fmt = (v: number | null | undefined) =>
    v == null ? "—" : formatCurrency(v, i18n.language, summary.baseCurrency)

  const stat = (label: string, value: string, color?: string) => (
    <Stack gap={0} style={{ minWidth: 0 }}>
      <Text size="xs" c="dimmed" truncate>
        {label}
      </Text>
      <Text
        ff="monospace"
        size="sm"
        fw={600}
        c={color}
        truncate
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
    </Stack>
  )

  return (
    <Group
      px="md"
      py={8}
      gap="sm"
      justify="space-between"
      wrap="nowrap"
      style={{
        flexShrink: 0,
        borderBottom: "1px solid var(--mantine-color-default-border)",
      }}
    >
      {type !== "income" && stat(t("common.expense"), fmt(summary.expense), "red.6")}
      {type !== "expense" && stat(t("common.income"), fmt(summary.income), "teal.6")}
      {/* the net only says something new when both sides are in the list */}
      {!type && stat(t("transactions.summary_total"), fmt(summary.net))}
    </Group>
  )
}
