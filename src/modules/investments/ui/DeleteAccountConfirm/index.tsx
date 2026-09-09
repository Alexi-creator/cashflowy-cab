import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteExchangeAccount } from "../../api/useDeleteExchangeAccount"
import type { ExchangeAccount } from "../../model"

interface Props {
  account: ExchangeAccount
}

/** Deleting an exchange account also removes every position synced from it. */
export function DeleteAccountConfirm({ account }: Props) {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteExchangeAccount({
    accountId: account.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("investments.acc_delete_success") })
      close()
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("investments.acc_delete_confirm")}</Text>

      <Paper withBorder p="sm" bg="var(--mantine-color-default)">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text size="sm" truncate="end">
            {account.label}
          </Text>
          {account.apiKeyMasked && (
            <Text ff="monospace" size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              {account.apiKeyMasked}
            </Text>
          )}
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
