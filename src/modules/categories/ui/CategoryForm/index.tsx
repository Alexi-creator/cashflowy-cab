import { zodResolver } from "@hookform/resolvers/zod"
import {
  ActionIcon,
  Box,
  Button,
  Group,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { useUsage } from "@/modules/subscription/api/useUsage"
import { isLimitBlocked } from "@/modules/subscription/lib/plan"
import { LimitAlert } from "@/modules/subscription/ui"
import { useModalStore } from "@/shared/store/modalStore"
import { useCategories } from "../../api/useCategories"
import { useSaveCategory } from "../../api/useSaveCategory"
import { EMOJI_PALETTE } from "../../config"
import type { Category } from "../../model"

const FOOTER_STYLE = { borderTop: "1px solid var(--mantine-color-default-border)" }

const NAME_MAX = 32

// from arbitrary input/paste we keep exactly one grapheme cluster (emojis may
// consist of several code units); we take the last one — so a new character replaces the old
function lastGrapheme(input: string): string {
  const graphemes = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(input)]
  return graphemes.at(-1)?.segment ?? ""
}

interface Props {
  /** If provided — edit mode (PATCH); the category type cannot be changed then. */
  category?: Category
  /** Category type; in create mode — the toggle's initial value. */
  defaultType: "expense" | "income"
}

/**
 * Category create/edit form (react-hook-form + zod). Validates a non-empty
 * name, length, and duplicates among categories of the selected type; on success invalidates the list,
 * category stats, and transactions (in case of a rename).
 */
export function CategoryForm({ category, defaultType }: Props) {
  const { t } = useTranslation()
  const isEdit = !!category
  const close = useModalStore((s) => s.close)
  const { data: usage } = useUsage()

  // only creation counts against the categories limit — editing an existing one never does
  const limitReached = !isEdit && isLimitBlocked(usage?.categories)

  const [type, setType] = useState(defaultType)
  const isExpense = type === "expense"

  // existing categories of the selected type — for the duplicate check (taken from the cache)
  const { data: existing } = useCategories(isExpense)

  // duplicates are checked case- and whitespace-insensitively, excluding the edited category itself
  const schema = useMemo(() => {
    const taken = new Set(
      (existing ?? []).filter((c) => c.id !== category?.id).map((c) => c.name.trim().toLowerCase()),
    )
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, t("form.name_required"))
        .max(NAME_MAX, t("form.name_too_long", { max: NAME_MAX }))
        .refine((v) => !taken.has(v.toLowerCase()), t("categories.name_taken")),
      emoji: z.string(),
    })
  }, [existing, category?.id, t])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      emoji: category?.emoji ?? "",
    },
  })

  const emoji = watch("emoji")

  // we keep the manual input field separate: empty by default so the placeholder is visible
  // "Custom"; when editing we show the current emoji only if it is not from the palette
  const [custom, setCustom] = useState(
    category?.emoji && !EMOJI_PALETTE.includes(category.emoji) ? category.emoji : "",
  )

  const mutation = useSaveCategory({
    isExpense,
    categoryId: category?.id,
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: isEdit ? t("categories.update_success") : t("categories.create_success"),
      })
      close()
    },
  })

  const onSubmit = handleSubmit((values) =>
    mutation.mutate({ name: values.name.trim(), emoji: values.emoji || undefined }),
  )

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="lg">
        {limitReached && <LimitAlert usage={usage?.categories} kind="categories" />}

        {!isEdit && (
          <SegmentedControl
            fullWidth
            value={type}
            onChange={(v) => setType(v as "expense" | "income")}
            data={[
              { value: "expense", label: t("common.type_expense") },
              { value: "income", label: t("common.type_income") },
            ]}
          />
        )}

        <TextInput
          {...register("name")}
          label={t("categories.name_label")}
          autoFocus
          placeholder={
            isExpense
              ? t("categories.name_placeholder_expense")
              : t("categories.name_placeholder_income")
          }
          maxLength={NAME_MAX}
          error={errors.name?.message}
        />

        <Box>
          <Group justify="space-between" align="center" mb={6}>
            <Text size="sm" fw={500}>
              {t("categories.emoji_label")}
            </Text>
            <TextInput
              size="xs"
              w={64}
              placeholder={t("categories.emoji_custom")}
              value={custom}
              onChange={(e) => {
                const v = lastGrapheme(e.currentTarget.value)
                setCustom(v)
                setValue("emoji", v)
              }}
              styles={{ input: { textAlign: "center" } }}
            />
          </Group>
          <ScrollArea h={132} type="auto">
            <SimpleGrid cols={8} spacing={6}>
              {EMOJI_PALETTE.map((e) => (
                <ActionIcon
                  key={e}
                  type="button"
                  size="lg"
                  radius="sm"
                  variant={emoji === e ? "light" : "default"}
                  color={emoji === e ? "lime" : "gray"}
                  onClick={() => {
                    setCustom("")
                    setValue("emoji", emoji === e ? "" : e)
                  }}
                >
                  <Text size="md">{e}</Text>
                </ActionIcon>
              ))}
            </SimpleGrid>
          </ScrollArea>
        </Box>

        <Group justify="flex-end" pt="sm" style={FOOTER_STYLE}>
          <Button variant="default" onClick={close} disabled={mutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={limitReached}>
            {isEdit ? t("common.save") : t("categories.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
