import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteExchange } from "../../api/useDeleteExchange"
import type { Exchange } from "../../model"

interface Props {
  exchange: Exchange
}

/** Deletion confirmation — the money goes back to the currency it came from. */
export function DeleteExchangeConfirm({ exchange }: Props) {
  const { t, i18n } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteExchange({
    exchangeId: exchange.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("exchanges.delete_success") })
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("exchanges.delete_confirm")}</Text>

      <Paper withBorder p="sm" bg="var(--mantine-color-default)">
        <Group justify="center" wrap="nowrap" gap="xs">
          <Text ff="monospace" size="sm" fw={500}>
            {formatCurrency(exchange.fromAmount, i18n.language, exchange.fromCurrency)}
          </Text>
          <Text c="dimmed">→</Text>
          <Text ff="monospace" size="sm" fw={500}>
            {formatCurrency(exchange.toAmount, i18n.language, exchange.toCurrency)}
          </Text>
        </Group>
      </Paper>

      <Group justify="flex-end">
        <Button variant="default" onClick={close} disabled={mutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button color="red" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          {t("common.delete")}
        </Button>
      </Group>
    </Stack>
  )
}
