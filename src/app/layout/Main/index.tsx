import { AppShell, Box, LoadingOverlay } from "@mantine/core"
import clsx from "clsx"
import { Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AccountAlert, EmailVerifyAlert, TelegramConnectAlert } from "@/modules/auth/ui"
import { RouteNames } from "@/shared/config/routeNames"

import classes from "./styles.module.css"

const FILL_HEIGHT_ROUTES = new Set<string>([RouteNames.Transactions])

/**
 * Main content area of the app (AppShell.Main).
 * Shows the account alerts and renders child routes via `<Outlet />`, with a LoadingOverlay
 * while a lazy route chunk is still loading.
 * On the transactions page it disables scrolling (overflow: hidden) for the fixed-height table.
 * Takes no props.
 */
export function Main() {
  const { pathname } = useLocation()
  const isFillHeight = FILL_HEIGHT_ROUTES.has(pathname)

  return (
    <AppShell.Main classNames={{ main: clsx(classes.root, isFillHeight && classes.fill) }}>
      <AccountAlert />
      <EmailVerifyAlert />
      <TelegramConnectAlert />

      <Suspense fallback={<LoadingOverlay visible />}>
        {isFillHeight ? (
          <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Outlet />
          </Box>
        ) : (
          <Outlet />
        )}
      </Suspense>
    </AppShell.Main>
  )
}
