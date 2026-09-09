import { Button, Group, Stack, TextInput } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { useRenameExchangeAccount } from "../../api/useRenameExchangeAccount"
import type { ExchangeAccount } from "../../model"

interface Props {
  account: ExchangeAccount
}

/** Renames a connected account — label only, key/sync status/history are untouched. */
export function RenameAccountForm({ account }: Props) {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)
  const [label, setLabel] = useState(account.label)

  const mutation = useRenameExchangeAccount({
    accountId: account.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("investments.acc_rename_success") })
      close()
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    mutation.mutate(label.trim())
  }

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <TextInput
          label={t("investments.acc_label")}
          required
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
          maxLength={50}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={mutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={!label.trim()}>
            {t("common.save")}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
