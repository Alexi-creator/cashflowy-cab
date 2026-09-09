import { Skeleton, Stack, Switch, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/modules/auth/hooks/useAuthStore"
import { useBotNotificationPreferences } from "@/modules/notifications/api/useBotNotificationPreferences"
import { useSetBotNotificationPreference } from "@/modules/notifications/api/useSetBotNotificationPreference"
import { hasInvestmentsAccess } from "@/modules/subscription/lib/plan"

// i18n label per known type; unknown types (backend added a new one) fall back to the raw string.
const TYPE_LABEL_KEYS: Record<string, string> = {
  monthly_digest: "settings.notifications.type_monthly_digest",
  trade_closed: "settings.notifications.type_trade_closed",
}

/**
 * Per-type opt-in/out for proactive Telegram bot pushes (monthly digest, trade closed, …).
 * Renders whatever `GET /notifications/preferences` returns — the list of types is open-ended,
 * so we never hardcode it. `trade_closed` is hidden for users without investing access since it
 * can never fire for them.
 */
export function BotNotificationsForm() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useBotNotificationPreferences()

  const mutation = useSetBotNotificationPreference({
    onError: () => notifications.show({ color: "red", message: t("settings.notifications.error") }),
  })

  const preferences = (data ?? []).filter(
    (pref) => pref.type !== "trade_closed" || hasInvestmentsAccess(user),
  )

  if (isLoading) {
    return (
      <Stack gap="lg">
        <Skeleton height={24} width="60%" />
        <Skeleton height={24} width="80%" />
      </Stack>
    )
  }

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Text fw={500}>{t("settings.notifications.title")}</Text>
        <Text size="sm" c="dimmed">
          {t("settings.notifications.subtitle")}
        </Text>
      </Stack>

      <Stack gap="md">
        {preferences.map((pref) => {
          const labelKey = TYPE_LABEL_KEYS[pref.type]
          return (
            <Switch
              key={pref.type}
              label={labelKey ? t(labelKey) : pref.type}
              checked={pref.enabled}
              onChange={(e) =>
                mutation.mutate({ type: pref.type, enabled: e.currentTarget.checked })
              }
            />
          )
        })}
      </Stack>
    </Stack>
  )
}
