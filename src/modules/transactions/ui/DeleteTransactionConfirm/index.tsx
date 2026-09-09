import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteTransaction } from "../../api/useDeleteTransaction"
import { formatTxAmount } from "../../lib/helpers"
import type { Transaction } from "../../model"

interface Props {
  transaction: Transaction
}

/** Transaction deletion confirmation that shows its data. On success refreshes the list and summaries. */
export function DeleteTransactionConfirm({ transaction }: Props) {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteTransaction({
    transaction,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("transactions.delete_success") })
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("transactions.delete_confirm")}</Text>

      <Paper withBorder p="sm" bg="var(--mantine-color-default)">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text size="sm" truncate="end">
            {transaction.description}
          </Text>
          <Text
            ff="monospace"
            size="sm"
            fw={500}
            c={transaction.type === "income" ? "green.5" : undefined}
            style={{ whiteSpace: "nowrap" }}
          >
            {formatTxAmount(transaction, i18n.language)}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>
          {format(transaction.date, "dd MMM yyyy", { locale })}
          {transaction.categoryName ? ` · ${transaction.categoryName}` : ""}
        </Text>
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
