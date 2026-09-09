import { Alert, Button, Group, Stack, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconAlertTriangle } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import { useDeleteCategory } from "../../api/useDeleteCategory"
import type { CategoryStats } from "../../model"

interface Props {
  category: CategoryStats
  isExpense: boolean
}

/** Category deletion confirmation. On success refreshes the list, stats, and transactions. */
export function DeleteCategoryConfirm({ category, isExpense }: Props) {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)

  const mutation = useDeleteCategory({
    isExpense,
    categoryId: category.id,
    onSuccess: () => {
      notifications.show({ color: "green", message: t("categories.delete_success") })
      close()
    },
  })

  return (
    <Stack gap="md">
      <Text size="sm">{t("categories.delete_confirm", { name: category.name })}</Text>

      {category.count > 0 && (
        <Alert variant="light" color="red" icon={<IconAlertTriangle size={16} />} radius="md">
          {t("categories.delete_warning", { count: category.count })}
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="light" color="red" radius="md">
          {t("categories.delete_error")}
        </Alert>
      )}

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
