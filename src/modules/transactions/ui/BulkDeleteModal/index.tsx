import { Alert, Button, Group, ScrollArea, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconAlertTriangle } from "@tabler/icons-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteTransactionsBulk } from "../../api/useDeleteTransactionsBulk"
import { formatTxAmount } from "../../lib/helpers"
import type { Transaction } from "../../model"

interface Props {
  transactions: Transaction[]
  onSuccess: () => void
}

export function BulkDeleteModal({ transactions, onSuccess }: Props) {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteTransactionsBulk({
    transactions,
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("transactions.bulk_delete_success", { count: transactions.length }),
      })
      onSuccess()
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("transactions.bulk_delete_confirm", { count: transactions.length })}</Text>

      <ScrollArea.Autosize
        mah={260}
        type="always"
        scrollbarSize={8}
        offsetScrollbars
        style={{
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "var(--mantine-radius-md)",
        }}
      >
        <Stack gap={0}>
          {transactions.map((t, i) => (
            <Group
              key={`${t.type}-${t.id}`}
              justify="space-between"
              wrap="nowrap"
              gap="sm"
              px="xs"
              py={6}
              style={{
                borderTop: i === 0 ? undefined : "1px solid var(--mantine-color-default-border)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Text size="sm" truncate="end">
                  {t.description || "—"}
                </Text>
                <Text size="xs" c="dimmed">
                  {format(t.date, "dd MMM yyyy", { locale })}
                  {t.categoryName ? ` · ${t.categoryName}` : ""}
                </Text>
              </div>
              <Text
                ff="monospace"
                size="sm"
                fw={500}
                c={t.type === "income" ? "green.5" : undefined}
                style={{ whiteSpace: "nowrap" }}
              >
                {formatTxAmount(t, i18n.language)}
              </Text>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>

      <Alert variant="light" color="orange" icon={<IconAlertTriangle size={16} />} radius="md">
        {t("transactions.bulk_delete_warning")}
      </Alert>

      {mutation.isError && (
        <Alert variant="light" color="red" radius="md">
          {t("transactions.bulk_delete_error")}
        </Alert>
      )}

      <Group justify="flex-end">
        <Button variant="default" onClick={close} disabled={mutation.isPending}>
          {t("common.cancel")}
        </Button>
        <Button color="red" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          {t("common.delete")} {transactions.length}
        </Button>
      </Group>
    </Stack>
  )
}
