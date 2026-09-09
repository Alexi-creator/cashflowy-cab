import { AppShell } from "@mantine/core"
import type { ReactNode } from "react"
import { useLastVisitedPage } from "@/app/hooks/useLastVisitedPage"
import { Header } from "@/app/layout/Header"
import { Main } from "@/app/layout/Main"
import { NavBar } from "@/app/layout/NavBar"
import { usePageTracking } from "@/shared/hooks/usePageTracking"
import { useSidebarStore } from "@/shared/store/sidebarStore"

/**
 * Wrapper around AppShell — the only subscriber to the mobile menu state.
 * On toggle only it re-renders, while `children` (Header/NavBar/Main)
 * stay referentially stable and do not re-render.
 */
function AppShellFrame({ children }: { children: ReactNode }) {
  const opened = useSidebarStore((s) => s.opened)

  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
      style={{ height: "100dvh" }}
    >
      {children}
    </AppShell>
  )
}

/**
 * Root layout for an authenticated user.
 * Static composition of Header, NavBar, and Main; the mobile menu state lives
 * in `sidebarStore`, so the Layout itself does not re-render when it toggles.
 * Takes no props.
 *
 * `usePageTracking` lives here (not just on `PublicLayout`) — without it, GA4 never sees
 * anything past the login screen, since a returning user's persisted session skips the
 * public routes entirely and lands straight in the authenticated app.
 */
export function Layout() {
  usePageTracking()
  useLastVisitedPage()

  return (
    <AppShellFrame>
      <Header />
      <NavBar />
      <Main />
    </AppShellFrame>
  )
}
