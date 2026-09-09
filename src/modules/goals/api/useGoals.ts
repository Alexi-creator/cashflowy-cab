import { useQuery } from "@tanstack/react-query"
import { GOALS_STALE_TIME, goalKeys } from "./queries"
import { getGoals } from "./requests"

/** The user's savings goals. */
export function useGoals() {
  return useQuery({ queryKey: goalKeys.all, queryFn: getGoals, staleTime: GOALS_STALE_TIME })
}
