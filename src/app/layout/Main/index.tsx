import { AppShell, Box, LoadingOverlay } from "@mantine/core"
import clsx from "clsx"
import { Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AccountAlert, EmailVerifyAlert, TelegramConnectAlert } from "@/modules/auth/ui"
import { RouteNames } from "@/shared/config/routeNames"
import { useLoaderStore } from "@/shared/store/loaderStore"

import classes from "./styles.module.css"

const FILL_HEIGHT_ROUTES = new Set<string>([RouteNames.Transactions])

/**
 * Main content area of the app (AppShell.Main).
 * Shows the global LoadingOverlay, AccountAlert, and renders child routes via `<Outlet />`.
 * On the transactions page it disables scrolling (overflow: hidden) for the fixed-height table.
 * Takes no props.
 */
export function Main() {
  const { pathname } = useLocation()
  const { isLoading } = useLoaderStore()
  const isFillHeight = FILL_HEIGHT_ROUTES.has(pathname)

  return (
    <AppShell.Main classNames={{ main: clsx(classes.root, isFillHeight && classes.fill) }}>
      <LoadingOverlay visible={isLoading} />

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
