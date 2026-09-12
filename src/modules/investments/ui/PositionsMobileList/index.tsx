import { Box, Group, Text } from "@mantine/core"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { useModalStore } from "@/shared/store/modalStore"
import { baseAssetFromSymbol, type ExchangeAccount, type Position } from "../../model"
import { CoinIcon } from "../CoinIcon"
import { PositionCard } from "./PositionCard"
import { PositionDetails } from "./PositionDetails"

interface Props {
  positions: Position[]
  accounts: ExchangeAccount[]
}

/**
 * The trade journal below the `sm` breakpoint, in place of the table.
 *
 * The table's seventeen columns want well past 1500px; a phone has ~375, and panning that
 * sideways is how the journal became unreadable on mobile. Here a trade is one card — pair,
 * direction, PnL, ROI — and everything else waits in a details sheet behind a tap.
 *
 * Loading/empty/error states and the pagination footer stay with the section: they're the same
 * for both views.
 */
export function PositionsMobileList({ positions, accounts }: Props) {
  const { i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const openModal = useModalStore((s) => s.open)

  const accountById = new Map(accounts.map((a) => [a.id, a]))

  const openDetails = (position: Position) =>
    openModal({
      centered: true,
      title: (
        <Group gap={8} wrap="nowrap">
          <CoinIcon ticker={baseAssetFromSymbol(position.symbol)} size={22} />
          <Text ff="monospace" fw={600} size="md">
            {position.symbol}
          </Text>
        </Group>
      ),
      children: (
        <PositionDetails
          position={position}
          locale={locale}
          account={position.accountId ? accountById.get(position.accountId) : undefined}
        />
      ),
    })

  return (
    <Box>
      {positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          locale={locale}
          onPress={() => openDetails(position)}
        />
      ))}
    </Box>
  )
}
