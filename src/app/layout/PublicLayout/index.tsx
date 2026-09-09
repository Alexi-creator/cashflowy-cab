import { AppShell, Box, Group, LoadingOverlay, Text } from "@mantine/core"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"
import { usePageTracking } from "@/shared/hooks/usePageTracking"
import { LangSwitcher } from "@/shared/ui/LangSwitcher"
import { ThemeToggle } from "@/shared/ui/ThemeToggle"

/**
 * Layout for public pages (login, registration).
 * Shows a minimalist header with the app name and the language and theme toggles.
 * Takes no props.
 */
export function PublicLayout() {
  const { t } = useTranslation()
  usePageTracking()

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Box
              w={26}
              h={26}
              bg="lime.4"
              c="var(--app-logo-ink)"
              ff="monospace"
              fw={600}
              fz={14}
              style={{ borderRadius: 8, display: "grid", placeItems: "center" }}
            >
              L
            </Box>
            <Text fw={700} size="lg">
              {t("app.name")}
            </Text>
          </Group>
          <Group>
            <LangSwitcher />
            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Suspense fallback={<LoadingOverlay visible />}>
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  )
}
