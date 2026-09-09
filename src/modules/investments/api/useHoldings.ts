import { useQuery } from "@tanstack/react-query"
import { HOLDINGS_STALE_TIME, investingKeys } from "./queries"
import { getHoldings } from "./requests"

/** Manually tracked holdings with their current prices. */
export function useHoldings() {
  return useQuery({
    queryKey: investingKeys.holdings,
    queryFn: getHoldings,
    staleTime: HOLDINGS_STALE_TIME,
  })
}
