import { AppShell } from "@mantine/core"
import { DashboardSidebar } from "@/app/layout/DashboardSidebar"
import classes from "./styles.module.css"

/**
 * Navigation bar wrapper (AppShell.Navbar).
 * Renders `DashboardSidebar` inside `AppShell.Navbar`. Takes no props.
 */
export function NavBar() {
  return (
    <AppShell.Navbar p="md" className={classes.root} data-tour="nav">
      <DashboardSidebar />
    </AppShell.Navbar>
  )
}
