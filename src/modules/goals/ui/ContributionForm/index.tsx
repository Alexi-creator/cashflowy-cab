import {
  Box,
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { format } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/shared/lib/formatCurrency"
import { useModalStore } from "@/shared/store/modalStore"
import { useSaveContribution } from "../../api/useSaveContribution"
import type { Contribution, Goal } from "../../model"
import { CloseGoalConfirm } from "../CloseGoalConfirm"

interface Props {
  goal: Goal
  /** Which tab is selected when the form opens. Defaults to "deposit". Ignored when editing. */
  initialMode?: "deposit" | "withdraw"
  /** When set, PATCHes this past contribution instead of creating a new one. */
  contribution?: Contribution
}

/**
 * Deposit into / withdraw from a goal, or (when `contribution` is passed) edit a past one.
 * A withdrawal is the same endpoint/payload shape with a negative amount.
 * On success the goals list, balance (money is reserved/released) and notifications (a deposit may
 * complete the goal) are invalidated.
 */
export function ContributionForm({ goal, initialMode = "deposit", contribution }: Props) {
  const { t, i18n } = useTranslation()
  const open = useModalStore((s) => s.open)
  const close = useModalStore((s) => s.close)

  const [mode, setMode] = useState<"deposit" | "withdraw">(
    contribution ? (contribution.amount < 0 ? "withdraw" : "deposit") : initialMode,
  )
  const [amount, setAmount] = useState<number | string>(
    contribution ? Math.abs(contribution.amount) : "",
  )
  const [note, setNote] = useState(contribution?.note ?? "")
  const [day, setDay] = useState<string | null>(
    contribution ? format(contribution.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
  )

  // The amount being edited already counts towards currentAmount/remaining, so it's added back
  // before checking the new value against the target/balance — otherwise editing a contribution
  // close to the target (or a large withdrawal) would be clamped tighter than it should be.
  const editedAmount = contribution?.amount ?? 0
  const maxFor = (m: "deposit" | "withdraw") =>
    m === "deposit"
      ? Math.max(goal.remaining + editedAmount, 0)
      : Math.max(goal.currentAmount - editedAmount, 0)
  const maxAmount = maxFor(mode)

  const switchMode = (v: string) => {
    const next = v as "deposit" | "withdraw"
    setMode(next)
    const nextMax = maxFor(next)
    if (Number(amount) > nextMax) setAmount(nextMax || "")
  }

  const mutation = useSaveContribution({
    goalId: goal.id,
    contributionId: contribution?.id,
    onSuccess: (updatedGoal) => {
      notifications.show({
        color: "green",
        message: contribution
          ? t("goals.contribution_updated")
          : mode === "withdraw"
            ? t("goals.withdraw_success")
            : t("goals.deposit_success"),
      })
      // A deposit that just reached the target: offer to close (archive) the goal right away.
      if (mode === "deposit" && !goal.isCompleted && updatedGoal.isCompleted) {
        open({
          centered: true,
          title: t("goals.completed_title"),
          children: <CloseGoalConfirm goal={updatedGoal} completed />,
        })
        return
      }
      close()
    },
    onError: (err) => notifications.show({ color: "red", message: err.message }),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0 || value > maxAmount) return
    mutation.mutate({
      amount: mode === "withdraw" ? -value : value,
      note: note.trim() || undefined,
      date: day ?? undefined,
    })
  }

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={switchMode}
          data={[
            { value: "deposit", label: t("goals.deposit_tab") },
            { value: "withdraw", label: t("goals.withdraw_tab") },
          ]}
        />

        <Box>
          <Text size="xs" c="dimmed">
            {goal.emoji ? `${goal.emoji} ` : ""}
            {goal.name}
          </Text>
          <Text size="sm" c="dimmed">
            {formatCurrency(goal.currentAmount, i18n.language, goal.currency)} /{" "}
            {formatCurrency(goal.targetAmount, i18n.language, goal.currency)}
          </Text>
        </Box>

        <Box>
          <NumberInput
            label={t("common.amount")}
            required
            autoFocus
            value={amount}
            onChange={setAmount}
            min={0}
            max={maxAmount}
            clampBehavior="strict"
            thousandSeparator=" "
            suffix={` ${goal.currency}`}
          />
          {maxAmount > 0 && (
            <Button
              variant="light"
              color="green"
              size="compact-xs"
              mt={6}
              onClick={() => setAmount(maxAmount)}
            >
              {t(mode === "deposit" ? "goals.fill_remaining" : "goals.fill_all", {
                amount: formatCurrency(maxAmount, i18n.language, goal.currency),
              })}
            </Button>
          )}
        </Box>

        <DatePickerInput
          label={t("common.date")}
          value={day}
          onChange={setDay}
          maxDate={format(new Date(), "yyyy-MM-dd")}
          locale={i18n.language}
          valueFormat="DD MMM YYYY"
        />

        <Textarea
          label={t("common.note")}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          maxLength={200}
          autosize
          minRows={1}
          maxRows={3}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={mutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            color={mode === "withdraw" ? "red" : undefined}
            loading={mutation.isPending}
            disabled={maxAmount <= 0}
          >
            {contribution
              ? t("common.save")
              : mode === "withdraw"
                ? t("goals.withdraw")
                : t("goals.deposit_action")}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
