import { useQuery } from "@tanstack/react-query"
import { EXCHANGES_STALE_TIME, exchangeKeys } from "./queries"
import { getExchanges } from "./requests"

/** Recorded currency exchanges, newest first. */
export function useExchanges() {
  return useQuery({
    queryKey: exchangeKeys.all,
    queryFn: getExchanges,
    staleTime: EXCHANGES_STALE_TIME,
  })
}
