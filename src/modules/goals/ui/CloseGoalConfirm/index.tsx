import { Button, Group, Paper, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useModalStore } from "@/shared/store/modalStore"
import { useCloseGoal } from "../../api/useCloseGoal"
import type { Goal } from "../../model"

interface Props {
  goal: Goal
  /** Reframes the copy as "goal reached — close it?" when offered right after a completing deposit. */
  completed?: boolean
}

/**
 * Closes a goal ahead of schedule by archiving it. The goal leaves the active list and its saved
 * money is released back into the free balance (unlike deletion, the contributions are kept).
 */
export function CloseGoalConfirm({ goal, completed = false }: Props) {
  const { t, i18n } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useCloseGoal({
    goalId: goal.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("goals.close_success") })
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{completed ? t("goals.completed_confirm") : t("goals.close_confirm")}</Text>

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
          {completed ? t("goals.completed_keep") : t("common.cancel")}
        </Button>
        <Button color="green" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          {t("goals.close_early")}
        </Button>
      </Group>
    </Stack>
  )
}
