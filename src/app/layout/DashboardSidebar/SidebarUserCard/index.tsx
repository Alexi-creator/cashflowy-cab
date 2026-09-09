import { ActionIcon, Avatar, Box, Group, Paper, Text, Tooltip } from "@mantine/core"
import { IconLogout } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useLogout } from "@/modules/auth/api/useLogout"
import { useAuthStore } from "@/modules/auth/hooks/useAuthStore"
import { RouteNames } from "@/shared/config/routeNames"

/**
 * Current user card with a logout button. Locally subscribed to authStore
 * via selectors, so it re-renders only when the user changes, not on navigation.
 */
export function SidebarUserCard() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const handleLogout = useLogout()

  const initials = (user?.name || user?.email)?.[0]?.toUpperCase() ?? "Y"
  const displayName = user?.name || user?.email || "You"
  const planName = user?.subscription?.plan.name
  const planLabel = planName ? planName.charAt(0).toUpperCase() + planName.slice(1) : null

  return (
    <Paper p="xs" mt={6} withBorder>
      <Group gap="xs" wrap="nowrap">
        <Tooltip label={t("nav.settings")} position="right">
          <Avatar
            component={Link}
            to={RouteNames.Settings}
            size="md"
            radius="xl"
            color="lime"
            style={{ cursor: "pointer" }}
          >
            {initials}
          </Avatar>
        </Tooltip>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" truncate>
            {displayName}
          </Text>
          {planLabel && (
            <Text size="xs" c="dimmed">
              {planLabel}
            </Text>
          )}
        </Box>
        <Tooltip label={t("nav.logout")} position="right">
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleLogout}>
            <IconLogout size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  )
}
