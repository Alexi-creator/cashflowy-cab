import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteGoal } from "../../api/useDeleteGoal"
import type { Goal } from "../../model"

interface Props {
  goal: Goal
}

/** Goal deletion confirmation — removes the goal with all contributions and releases the balance. */
export function DeleteGoalConfirm({ goal }: Props) {
  const { t, i18n } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteGoal({
    goalId: goal.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("goals.delete_success") })
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("goals.delete_confirm")}</Text>

      <Paper withBorder p="sm" bg="var(--mantine-color-default)">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text size="sm" truncate="end">
            {goal.emoji ? `${goal.emoji} ` : ""}
            {goal.name}
          </Text>
          <Text ff="monospace" size="sm" fw={500} style={{ whiteSpace: "nowrap" }}>
            {formatCurrency(goal.currentAmount, i18n.language, goal.currency)}
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
