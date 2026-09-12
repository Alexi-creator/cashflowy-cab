import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { formatPnl, formatQty, formatUsd, pnlColor } from "../../lib/format"
import type { Holding } from "../../model"
import { CoinIcon } from "../CoinIcon"
import { HoldingDetails } from "./HoldingDetails"

/**
 * The portfolio below the `sm` breakpoint, in place of the table: one asset per card, with
 * amount and price under the ticker and value/PnL anchored right. Location, note and the
 * edit/delete actions move into the details sheet a tap away — same pattern as the journal and
 * the transactions list.
 */
export function HoldingsMobileList({ holdings }: { holdings: Holding[] }) {
  const { t, i18n } = useTranslation()
  const openModal = useModalStore((s) => s.open)

  const openDetails = (holding: Holding) =>
    openModal({
      centered: true,
      title: (
        <Group gap={8} wrap="nowrap">
          <CoinIcon ticker={holding.asset} size={22} />
          <Text fw={600} size="md">
            {holding.asset}
          </Text>
        </Group>
      ),
      children: <HoldingDetails holding={holding} />,
    })

  return (
    <Box>
      {holdings.map((holding) => (
        <UnstyledButton
          key={holding.id}
          onClick={() => openDetails(holding)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px var(--mantine-spacing-md)",
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <Group wrap="nowrap" gap={10} align="flex-start">
            <CoinIcon ticker={holding.asset} size={30} />

            <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} truncate style={{ textAlign: "left" }}>
                {holding.asset}
              </Text>
              <Text size="xs" c="dimmed" truncate style={{ textAlign: "left" }}>
                {formatQty(holding.amount, i18n.language)}
                {holding.price == null
                  ? ` · ${t("investments.hold_no_price")}`
                  : ` · ${formatUsd(holding.price, i18n.language)}`}
              </Text>
            </Stack>

            <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
              <Text
                ff="monospace"
                size="sm"
                fw={600}
                c={holding.value == null ? "dimmed" : undefined}
                style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
              >
                {holding.value == null ? "—" : formatUsd(holding.value, i18n.language)}
              </Text>
              <Text
                ff="monospace"
                size="xs"
                c={holding.pnlUsd == null ? "dimmed" : pnlColor(holding.pnlUsd)}
                style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
              >
                {holding.pnlUsd == null ? "—" : formatPnl(holding.pnlUsd, i18n.language)}
              </Text>
            </Stack>
          </Group>
        </UnstyledButton>
      ))}
    </Box>
  )
}
