import { Center, Checkbox, Group, Stack, Text, UnstyledButton } from "@mantine/core"
import { IconTag } from "@tabler/icons-react"
import { formatTxAmount } from "../../lib/helpers"
import type { Transaction } from "../../model"

interface Props {
  transaction: Transaction
  language: string
  /** Category emoji, resolved by the list from the loaded category lists. */
  emoji?: string
  /** Selection mode: the emoji slot becomes a checkbox and a tap toggles instead of opening. */
  selectionMode: boolean
  selected: boolean
  onPress: () => void
}

/**
 * One transaction as a two-line row: description and category on the left, signed amount on the
 * right. Replaces the five-column table below `sm`, where those columns ask for ~1000px and a
 * phone has ~375 — here nothing scrolls sideways and the amount stays a fixed anchor for the eye.
 */
export function TransactionCard({
  transaction,
  language,
  emoji,
  selectionMode,
  selected,
  onPress,
}: Props) {
  return (
    <UnstyledButton
      onClick={onPress}
      aria-pressed={selectionMode ? selected : undefined}
      style={{
        display: "block",
        width: "100%",
        // 10px vertical on a two-line row keeps the tap target above the 44px minimum
        padding: "10px var(--mantine-spacing-md)",
        borderBottom: "1px solid var(--mantine-color-default-border)",
        background: selected ? "var(--mantine-color-default-hover)" : undefined,
      }}
    >
      <Group wrap="nowrap" gap={10} align="flex-start">
        <Center
          w={30}
          h={30}
          fz={15}
          style={{
            borderRadius: 8,
            flexShrink: 0,
            background: "var(--mantine-color-body)",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          {selectionMode ? (
            // the checkbox only mirrors the row's state — the tap is handled by the row itself,
            // so the whole card stays one target instead of a 20px box to aim at
            <Checkbox checked={selected} readOnly tabIndex={-1} size="xs" aria-hidden />
          ) : (
            (emoji ?? <IconTag size={15} opacity={0.5} />)
          )}
        </Center>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          {/* two lines instead of an ellipsis: a tooltip is what the table used for the full
              text, and a tooltip is unreachable on touch */}
          <Text size="sm" fw={500} lineClamp={2} style={{ textAlign: "left" }}>
            {transaction.description}
          </Text>
          <Text size="xs" c="dimmed" truncate style={{ textAlign: "left" }}>
            {transaction.categoryName ?? "—"}
          </Text>
        </Stack>

        <Text
          ff="monospace"
          size="sm"
          fw={600}
          c={transaction.type === "income" ? "green.5" : "red.5"}
          style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
        >
          {formatTxAmount(transaction, language)}
        </Text>
      </Group>
    </UnstyledButton>
  )
}
