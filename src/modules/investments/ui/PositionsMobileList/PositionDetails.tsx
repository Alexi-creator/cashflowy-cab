import { Badge, Button, Divider, Group, Stack, Text } from "@mantine/core"
import { IconBolt, IconNotes, IconPencil, IconTrash } from "@tabler/icons-react"
import { format, type Locale } from "date-fns"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { formatPct, formatPnl, formatQty, formatUsd, pnlColor } from "../../lib/format"
import {
  type ExchangeAccount,
  holdingDays,
  type Position,
  positionDirection,
  positionPnl,
  positionRoi,
  stopLossPnl,
  takeProfitPnl,
  unleveragedQty,
} from "../../model"
import { CategoryBadge } from "../CategoryBadge"
import { DeletePositionConfirm } from "../DeletePositionConfirm"
import { PositionForm } from "../PositionForm"
import { PositionNotes } from "../PositionNotes"

interface Props {
  position: Position
  locale: Locale
  account?: ExchangeAccount
}

/** One label/value line of the sheet: label left, value right — twelve of these stacked read
 *  far shorter than twelve label-over-value blocks. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Stack gap={0} align="flex-end" style={{ minWidth: 0 }}>
        {children}
      </Stack>
    </Group>
  )
}

/** Plain right-aligned monospace value, dimmed when there is nothing to show. */
function Value({
  children,
  dimmed,
  color,
}: {
  children: React.ReactNode
  dimmed?: boolean
  color?: string
}) {
  return (
    <Text
      ff="monospace"
      size="sm"
      c={color ?? (dimmed ? "dimmed" : undefined)}
      ta="right"
      style={{ overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </Text>
  )
}

/**
 * Everything the journal's table columns hold for one trade, opened by tapping its row in the
 * mobile list — the fifteen columns that didn't fit on a phone, plus the actions that lived in
 * the pinned column. Notes work for every trade; edit/delete only for manual ones, exactly as
 * in the table.
 */
export function PositionDetails({ position, locale, account }: Props) {
  const { t, i18n } = useTranslation()
  const open = useModalStore((s) => s.open)

  const long = positionDirection(position) === "long"
  const isOpen = position.status === "OPEN"
  const pnl = positionPnl(position)
  const roi = positionRoi(position)
  const isManual = position.source === "manual"

  const openNotes = () =>
    open({
      size: "lg",
      centered: true,
      title: t("investments.note_title", { symbol: position.symbol }),
      children: <PositionNotes position={position} />,
    })

  const openEdit = () =>
    open({
      size: "lg",
      centered: true,
      title: t("investments.pos_edit_title"),
      children: <PositionForm position={position} />,
    })

  const openDelete = () =>
    open({
      centered: true,
      title: t("investments.pos_delete_title"),
      children: <DeletePositionConfirm position={position} />,
    })

  const date = (value: Date | null) => (value ? format(value, "d MMM yyyy", { locale }) : "—")

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Group gap={6} wrap="nowrap" align="center">
          {isOpen && pnl != null && (
            <IconBolt size={16} className="pulse-live" color="var(--mantine-color-yellow-6)" />
          )}
          <Text
            ff="monospace"
            size="28px"
            fw={600}
            c={pnl == null ? "dimmed" : pnlColor(pnl)}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {pnl == null ? "—" : formatPnl(pnl, i18n.language)}
          </Text>
          <Text ff="monospace" size="sm" c={roi == null ? "dimmed" : pnlColor(roi)}>
            {roi == null ? "" : formatPct(roi, i18n.language)}
          </Text>
        </Group>

        <Group gap={4} wrap="wrap">
          <Badge variant="light" color={long ? "green" : "red"} size="sm">
            {t(long ? "investments.pos_long" : "investments.pos_short")}
          </Badge>
          <CategoryBadge category={position.category} />
          <Badge variant="light" color={isOpen ? "green" : "gray"} size="sm">
            {t(isOpen ? "investments.pos_status_open" : "investments.pos_status_closed")}
          </Badge>
        </Group>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Row label={t("investments.col_entry_exit")}>
          <Value>
            {formatUsd(position.avgEntryPrice, i18n.language)} →{" "}
            {position.avgExitPrice == null
              ? t("investments.pos_in_trade")
              : formatUsd(position.avgExitPrice, i18n.language)}
          </Value>
        </Row>

        {isOpen && (
          <Row label={t("investments.col_current_price")}>
            <Value dimmed={position.currentPrice == null}>
              {position.currentPrice == null
                ? "—"
                : formatUsd(position.currentPrice, i18n.language)}
            </Value>
          </Row>
        )}

        <Row label={t("investments.col_tp_sl")}>
          {position.takeProfitPrice == null && position.stopLossPrice == null ? (
            <Value dimmed>—</Value>
          ) : (
            <>
              <Value color="green.6">
                {position.takeProfitPrice == null
                  ? "—"
                  : `${formatUsd(position.takeProfitPrice, i18n.language)} (${formatPnl(takeProfitPnl(position)!, i18n.language)})`}
              </Value>
              <Value color="red.6">
                {position.stopLossPrice == null
                  ? "—"
                  : `${formatUsd(position.stopLossPrice, i18n.language)} (${formatPnl(stopLossPnl(position)!, i18n.language)})`}
              </Value>
            </>
          )}
        </Row>

        <Row label={t("investments.col_volume")}>
          <Value>{formatUsd(position.entryVolumeUsd, i18n.language)}</Value>
        </Row>

        <Row label={t("investments.col_qty")}>
          <Value>{formatQty(unleveragedQty(position), i18n.language)}</Value>
        </Row>

        <Row label={t("investments.col_leverage")}>
          <Value dimmed={position.leverage == null}>
            {position.leverage == null ? "—" : `${position.leverage}x`}
          </Value>
        </Row>

        <Row label={t("investments.col_fee")}>
          {/* Fee sign is flipped for display: paying (positive fee) reads as a loss, a rebate
              (negative fee) as a gain — same convention as PnL, same as the table. */}
          <Value color={pnlColor(position.totalFeeUsd == null ? null : -position.totalFeeUsd)}>
            {position.totalFeeUsd == null ? "—" : formatPnl(-position.totalFeeUsd, i18n.language)}
          </Value>
        </Row>

        <Row label={t("investments.col_opened_at")}>
          <Value dimmed={!position.openedAt}>{date(position.openedAt)}</Value>
        </Row>

        <Row label={t("investments.col_closed_at")}>
          <Value dimmed={!position.closedAt}>{date(position.closedAt)}</Value>
        </Row>

        <Row label={t("investments.col_days")}>
          <Value dimmed>{holdingDays(position) ?? "—"}</Value>
        </Row>

        <Row label={t("investments.col_account")}>
          {account ? (
            <Group gap={4} wrap="nowrap">
              <Text size="sm" truncate>
                {account.label}
              </Text>
              <Badge variant="light" color="gray" size="xs" tt="none">
                {account.exchange}
              </Badge>
            </Group>
          ) : (
            <Value dimmed>—</Value>
          )}
        </Row>
      </Stack>

      <Stack gap="xs" mt={4}>
        <Button variant="default" leftSection={<IconNotes size={15} />} onClick={openNotes}>
          {t("common.note")}
          {position.notes.length > 0 ? ` (${position.notes.length})` : ""}
        </Button>
        {/* Exchange-owned trades are read-only — the sync owns them, same as in the table. */}
        {isManual && (
          <Group grow gap="xs">
            <Button variant="default" leftSection={<IconPencil size={15} />} onClick={openEdit}>
              {t("common.edit")}
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={15} />}
              onClick={openDelete}
            >
              {t("common.delete")}
            </Button>
          </Group>
        )}
      </Stack>
    </Stack>
  )
}
