import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { investingKeys, POSITIONS_STALE_TIME } from "./queries"
import { getPositions, getPositionsSummary, type PositionsParams } from "./requests"

/** A page of the trade journal. */
export function usePositions(params: PositionsParams) {
  return useQuery({
    queryKey: investingKeys.positions(params),
    queryFn: () => getPositions(params),
    placeholderData: keepPreviousData,
    staleTime: POSITIONS_STALE_TIME,
  })
}

/** Totals for the whole filtered selection, not just the page on screen. */
export function usePositionsSummary(params: PositionsParams) {
  return useQuery({
    queryKey: investingKeys.positionsSummary(params),
    queryFn: () => getPositionsSummary(params),
    placeholderData: keepPreviousData,
    staleTime: POSITIONS_STALE_TIME,
  })
}
