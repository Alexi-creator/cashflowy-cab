import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconEdit, IconInfoCircle, IconPlus, IconTrash } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { useHoldings } from "../../api/useHoldings"
import { formatPnl, formatQty, formatUsd, pnlColor } from "../../lib/format"
import type { Holding } from "../../model"
import { CoinIcon } from "../CoinIcon"
import { DeleteHoldingConfirm } from "../DeleteHoldingConfirm"
import { HoldingForm } from "../HoldingForm"
import { HoldingsMobileList } from "../HoldingsMobileList"

import classes from "./styles.module.css"

/**
 * Portfolio (holdings) valued with live Bybit spot prices (cached a minute on the
 * backend). Rows without a price stay visible but are excluded from totalValue;
 * rows without a buy price have a value but no PnL.
 */
export function HoldingsSection() {
  const { t, i18n } = useTranslation()
  const open = useModalStore((s) => s.open)
  const theme = useMantineTheme()
  // Below `sm` the seven columns don't fit a phone — the portfolio becomes a card list, same
  // as the journal and the transactions table. Resolved synchronously (no SSR) to avoid
  // rendering the wrong one first.
  const isTableView = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`, true, {
    getInitialValueInEffect: false,
  })

  const { data, isLoading, error } = useHoldings()

  const items = data?.items ?? []

  const openCreate = () =>
    open({
      size: "lg",
      centered: true,
      title: t("investments.hold_add_title"),
      children: <HoldingForm />,
    })

  const openEdit = (holding: Holding) =>
    open({
      size: "lg",
      centered: true,
      title: t("investments.hold_edit_title"),
      children: <HoldingForm holding={holding} />,
    })

  const openDelete = (holding: Holding) =>
    open({
      centered: true,
      title: t("investments.hold_delete_title"),
      children: <DeleteHoldingConfirm holding={holding} />,
    })

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    )
  }

  if (error) {
    return <Alert color="red">{error.message}</Alert>
  }

  return (
    <Stack gap="md">
      <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
        {t("investments.hold_intro")}
      </Alert>

      <Paper p="lg">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              {t("investments.hold_total")}
            </Text>
            <Text ff="monospace" fz={32} fw={500} style={{ letterSpacing: "-0.02em" }}>
              {formatUsd(data?.totalValue ?? 0, i18n.language)}
            </Text>
          </Stack>
          <Button size="sm" leftSection={<IconPlus size={14} />} onClick={openCreate}>
            {t("investments.hold_add")}
          </Button>
        </Group>
      </Paper>

      <Paper className={classes.card}>
        {items.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t("investments.hold_empty")}
          </Text>
        ) : !isTableView ? (
          <HoldingsMobileList holdings={items} />
        ) : (
          <Box style={{ overflowX: "auto" }}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("investments.col_asset")}</Table.Th>
                  <Table.Th ta="right">{t("common.amount")}</Table.Th>
                  <Table.Th ta="right">{t("investments.col_price")}</Table.Th>
                  <Table.Th ta="right">{t("investments.col_value")}</Table.Th>
                  <Table.Th ta="right">PnL</Table.Th>
                  <Table.Th>{t("investments.hold_location")}</Table.Th>
                  <Table.Th w={90} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((h) => (
                  <Table.Tr key={h.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <CoinIcon ticker={h.asset} />
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {h.asset}
                          </Text>
                          {h.note && (
                            <Text size="xs" c="dimmed" truncate="end" maw={200}>
                              {h.note}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text ff="monospace" size="sm">
                        {formatQty(h.amount, i18n.language)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      {h.price == null ? (
                        <Tooltip label={t("investments.hold_no_price_hint")} multiline maw={260}>
                          <Text size="xs" c="dimmed" style={{ cursor: "help" }}>
                            {t("investments.hold_no_price")}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text ff="monospace" size="sm" c="dimmed">
                          {formatUsd(h.price, i18n.language)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text ff="monospace" size="sm" fw={500}>
                        {h.value == null ? "—" : formatUsd(h.value, i18n.language)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      {h.pnlUsd == null ? (
                        <Tooltip label={t("investments.hold_no_pnl_hint")} multiline maw={260}>
                          <Text size="sm" c="dimmed" style={{ cursor: "help" }}>
                            —
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text ff="monospace" size="sm" c={pnlColor(h.pnlUsd)}>
                          {formatPnl(h.pnlUsd, i18n.language)}
                          {h.pnlPct != null && (
                            <Text component="span" size="xs" c="dimmed">
                              {" "}
                              ({h.pnlPct > 0 ? "+" : ""}
                              {h.pnlPct.toFixed(2)}%)
                            </Text>
                          )}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {h.location}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Tooltip label={t("common.change")}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="gray"
                            aria-label={t("common.change")}
                            onClick={() => openEdit(h)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("common.delete")}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="gray"
                            aria-label={t("common.delete")}
                            onClick={() => openDelete(h)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Paper>
    </Stack>
  )
}
