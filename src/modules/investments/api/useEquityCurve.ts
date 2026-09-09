import { useQuery } from "@tanstack/react-query"
import { investingKeys, POSITIONS_STALE_TIME } from "./queries"
import { getEquityCurve, type PositionsParams } from "./requests"

/** Cumulative PnL over time for the filtered selection. */
export function useEquityCurve(params: Omit<PositionsParams, "status" | "limit" | "offset">) {
  return useQuery({
    queryKey: investingKeys.equityCurve(params),
    queryFn: () => getEquityCurve(params),
    staleTime: POSITIONS_STALE_TIME,
  })
}
