import { Button, Divider, Group, Stack, Text } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { format, type Locale } from "date-fns"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { formatTxAmount } from "../../lib/helpers"
import type { Transaction } from "../../model"
import { DeleteTransactionConfirm } from "../DeleteTransactionConfirm"
import { EditTransactionForm } from "../EditTransactionForm"

interface Props {
  transaction: Transaction
  locale: Locale
  emoji?: string
}

/** One labelled field of the details sheet. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      {children}
    </Stack>
  )
}

/**
 * Details of a single transaction, opened by tapping its row in the mobile list.
 *
 * This is what replaces the pinned actions column: on a phone those two icons cost 90px of a
 * 375px screen, and the full description had nowhere to go. Both actions reopen the shared modal
 * with the existing edit/delete content.
 */
export function TransactionDetails({ transaction, locale, emoji }: Props) {
  const { t, i18n } = useTranslation()
  const open = useModalStore((s) => s.open)

  const openEdit = () =>
    open({
      size: "lg",
      centered: true,
      title: t("transactions.edit_title"),
      children: <EditTransactionForm transaction={transaction} />,
    })

  const openDelete = () =>
    open({
      centered: true,
      title: t("transactions.delete_title"),
      children: <DeleteTransactionConfirm transaction={transaction} />,
    })

  return (
    <Stack gap="md">
      <Text
        ff="monospace"
        size="28px"
        fw={600}
        c={transaction.type === "income" ? "green.5" : "red.5"}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatTxAmount(transaction, i18n.language)}
      </Text>

      <Divider />

      <Field label={t("common.category")}>
        <Group gap={6} wrap="nowrap">
          {emoji && <Text size="sm">{emoji}</Text>}
          <Text size="sm">{transaction.categoryName ?? "—"}</Text>
        </Group>
      </Field>

      <Field label={t("common.date")}>
        <Text size="sm">{format(transaction.date, "d MMMM yyyy", { locale })}</Text>
      </Field>

      <Field label={t("common.note")}>
        <Text size="sm" style={{ overflowWrap: "anywhere" }}>
          {transaction.description || "—"}
        </Text>
      </Field>

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
