import { Grid, Stack } from "@mantine/core"
import { CashflowChart, HomeHeader, HomeKpis, RecentTransactions } from "@/modules/dashboard/ui"
// TODO(investments): temporarily hidden, page under development — restore the import and widget below
// import { PortfolioSnippet } from "@/modules/investments"
import { GoalsSnippet } from "@/modules/goals/ui"
export function HomePage() {
  return (
    <Stack gap="md">
      <HomeHeader />

      <HomeKpis />

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <CashflowChart />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            <GoalsSnippet />
            {/* TODO(investments): temporarily hidden, page under development — restore the widget */}
            {/* <PortfolioSnippet /> */}
          </Stack>
        </Grid.Col>
      </Grid>

      <RecentTransactions />
    </Stack>
  )
}
