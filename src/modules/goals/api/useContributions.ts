import { useQuery } from "@tanstack/react-query"
import { GOALS_STALE_TIME, goalKeys } from "./queries"
import { getContributions } from "./requests"

/** Contribution history of one goal. */
export function useContributions(goalId: string) {
  return useQuery({
    queryKey: goalKeys.contributions(goalId),
    queryFn: () => getContributions(goalId),
    staleTime: GOALS_STALE_TIME,
  })
}
