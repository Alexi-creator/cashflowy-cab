import { Box, Group, LoadingOverlay, Stack, Text } from "@mantine/core"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useExchanges } from "../../api/useExchanges"
import { RowActions } from "../ExchangesTable/RowActions"

/**
 * Exchanges as cards, below the `sm` breakpoint — the table's four columns plus a pinned
 * actions column do not fit a phone.
 *
 * Unlike the transactions list this one keeps its actions inline: there are only two of them and
 * an exchange has no extra fields worth a details sheet — what was given and what came back is
 * the whole record.
 */
export function ExchangesMobileList() {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const { data, isLoading, isError } = useExchanges()

  const records = isError ? [] : (data ?? [])

  return (
    <Box style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <LoadingOverlay visible={isLoading} zIndex={2} overlayProps={{ blur: 1 }} />

      {records.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py={48}>
          {isError ? t("transactions.load_error") : t("exchanges.empty")}
        </Text>
      ) : (
        records.map((exchange) => (
          <Group
            key={exchange.id}
            px="md"
            py={10}
            gap="sm"
            wrap="nowrap"
            align="flex-start"
            style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
          >
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              {/* the two sides are the record — they stay on one line and never wrap */}
              <Group gap={6} wrap="nowrap" style={{ overflowX: "auto" }}>
                <Text
                  ff="monospace"
                  size="sm"
                  style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(exchange.fromAmount, i18n.language, exchange.fromCurrency)}
                </Text>
                <IconArrowNarrowRight size={14} opacity={0.5} style={{ flexShrink: 0 }} />
                <Text
                  ff="monospace"
                  size="sm"
                  fw={600}
                  style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(exchange.toAmount, i18n.language, exchange.toCurrency)}
                </Text>
              </Group>

              <Text size="xs" c="dimmed" truncate>
                {format(exchange.date, "d MMM yyyy", { locale })}
                {exchange.description ? ` · ${exchange.description}` : ""}
              </Text>
            </Stack>

            <RowActions exchange={exchange} />
          </Group>
        ))
      )}
    </Box>
  )
}
