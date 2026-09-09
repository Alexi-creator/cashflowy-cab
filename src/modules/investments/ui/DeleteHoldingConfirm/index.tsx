import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteHolding } from "../../api/useDeleteHolding"
import { formatQty } from "../../lib/format"
import type { Holding } from "../../model"

interface Props {
  holding: Holding
}

export function DeleteHoldingConfirm({ holding }: Props) {
  const { t, i18n } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteHolding({
    holdingId: holding.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("investments.hold_delete_success") })
      close()
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("investments.hold_delete_confirm")}</Text>

      <Paper withBorder p="sm" bg="var(--mantine-color-default)">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text ff="monospace" size="sm" fw={500}>
            {holding.asset}
          </Text>
          <Text ff="monospace" size="sm" c="dimmed">
            {formatQty(holding.amount, i18n.language)}
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
