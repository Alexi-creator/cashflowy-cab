import { useQuery } from "@tanstack/react-query"
import { investingKeys, POSITION_SYMBOLS_STALE_TIME } from "../api/queries"
import { getPositionSymbols } from "../api/requests"

/**
 * Every symbol the user has ever traded (bybit-synced or manual) — powers the trade journal's
 * Pair filter autocomplete. Changes rarely, so cached long; no invalidation wired up for it.
 */
export function usePositionSymbols() {
  return useQuery({
    queryKey: investingKeys.positionSymbols,
    queryFn: getPositionSymbols,
    staleTime: POSITION_SYMBOLS_STALE_TIME,
  })
}
