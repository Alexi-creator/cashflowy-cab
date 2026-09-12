import { Button, Divider, Group, Stack, Text } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { formatPnl, formatQty, formatUsd, pnlColor } from "../../lib/format"
import type { Holding } from "../../model"
import { DeleteHoldingConfirm } from "../DeleteHoldingConfirm"
import { HoldingForm } from "../HoldingForm"

/** One label/value line of the sheet — label left, value right. */
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

/**
 * One holding's full row, opened by tapping its card in the mobile list: the columns the card
 * leaves out plus the edit/delete actions that lived in the table's last column.
 */
export function HoldingDetails({ holding }: { holding: Holding }) {
  const { t, i18n } = useTranslation()
  const open = useModalStore((s) => s.open)

  const openEdit = () =>
    open({
      size: "lg",
      centered: true,
      title: t("investments.hold_edit_title"),
      children: <HoldingForm holding={holding} />,
    })

  const openDelete = () =>
    open({
      centered: true,
      title: t("investments.hold_delete_title"),
      children: <DeleteHoldingConfirm holding={holding} />,
    })

  const value = (children: React.ReactNode, dimmed?: boolean) => (
    <Text
      ff="monospace"
      size="sm"
      c={dimmed ? "dimmed" : undefined}
      ta="right"
      style={{ overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </Text>
  )

  return (
    <Stack gap="md">
      <Text
        ff="monospace"
        size="28px"
        fw={600}
        c={holding.value == null ? "dimmed" : undefined}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {holding.value == null ? "—" : formatUsd(holding.value, i18n.language)}
      </Text>

      <Divider />

      <Stack gap="xs">
        <Row label={t("common.amount")}>{value(formatQty(holding.amount, i18n.language))}</Row>

        <Row label={t("investments.col_price")}>
          {holding.price == null
            ? value(t("investments.hold_no_price"), true)
            : value(formatUsd(holding.price, i18n.language))}
        </Row>

        <Row label="PnL">
          {holding.pnlUsd == null ? (
            // the table explains the dash in a tooltip — unreachable on touch, so it says it
            <Text size="xs" c="dimmed" ta="right">
              {t("investments.hold_no_pnl_hint")}
            </Text>
          ) : (
            <Text
              ff="monospace"
              size="sm"
              c={pnlColor(holding.pnlUsd)}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatPnl(holding.pnlUsd, i18n.language)}
              {holding.pnlPct != null && (
                <Text component="span" size="xs" c="dimmed">
                  {" "}
                  ({holding.pnlPct > 0 ? "+" : ""}
                  {holding.pnlPct.toFixed(2)}%)
                </Text>
              )}
            </Text>
          )}
        </Row>

        <Row label={t("investments.hold_location")}>
          <Text size="sm" ta="right" style={{ overflowWrap: "anywhere" }}>
            {holding.location}
          </Text>
        </Row>

        {holding.note && (
          <Row label={t("common.note")}>
            <Text size="sm" ta="right" style={{ overflowWrap: "anywhere" }}>
              {holding.note}
            </Text>
          </Row>
        )}
      </Stack>

      <Group grow gap="xs" mt={4}>
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
    </Stack>
  )
}
