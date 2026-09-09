import { ActionIcon, Group, Loader, Paper, ScrollArea, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { dateFnsLocales } from "@/shared/i18n/languages.ts"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useModalStore } from "@/shared/store/modalStore"
import { useContributions } from "../../api/useContributions"
import { useDeleteContribution } from "../../api/useDeleteContribution"
import type { Contribution, Goal } from "../../model"
import { ContributionForm } from "../ContributionForm"

interface Props {
  goal: Goal
}

/** Contribution history for a goal with per-item editing and deletion. Both refetch the goal and balance. */
export function ContributionsHistory({ goal }: Props) {
  const { t, i18n } = useTranslation()
  const locale = dateFnsLocales[i18n.language] ?? enUS
  const open = useModalStore((s) => s.open)

  const openEdit = (contribution: Contribution) =>
    open({
      centered: true,
      title: t("goals.edit_contribution_title"),
      children: <ContributionForm goal={goal} contribution={contribution} />,
    })

  const { data, isLoading } = useContributions(goal.id)

  const remove = useDeleteContribution({
    goalId: goal.id,
    onSuccess: () =>
      notifications.show({ color: "green", message: t("goals.contribution_deleted") }),
  })

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
      </Group>
    )
  }

  const items = data ?? []

  if (items.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="xl">
        {t("goals.history_empty")}
      </Text>
    )
  }

  return (
    <ScrollArea.Autosize mah={400}>
      <Stack gap="xs">
        {items.map((c) => {
          const negative = c.amount < 0
          return (
            <Paper key={c.id} withBorder p="sm" bg="var(--mantine-color-default)">
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed">
                    {format(c.date, "dd MMM yyyy", { locale })}
                  </Text>
                  {c.note && (
                    <Text size="sm" truncate="end">
                      {c.note}
                    </Text>
                  )}
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <Text
                    ff="monospace"
                    size="sm"
                    fw={500}
                    c={negative ? "red.5" : "green.5"}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {negative ? "−" : "+"}
                    {formatCurrency(Math.abs(c.amount), i18n.language, goal.currency)}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={t("common.edit")}
                    onClick={() => openEdit(c)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={t("common.delete")}
                    loading={remove.isPending && remove.variables === c.id}
                    onClick={() => remove.mutate(c.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          )
        })}
      </Stack>
    </ScrollArea.Autosize>
  )
}
