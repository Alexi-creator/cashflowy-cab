import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useAuthStore } from "@/modules/auth/hooks/useAuthStore"
import { subscriptionKeys, USAGE_STALE_TIME } from "../api/queries"
import { getUsage } from "../api/requests"
import { planHasLimits } from "../lib/plan"

/**
 * Current plan usage (categories / transactions) for limit warnings.
 * Shared cache key, so every consumer reads the same counter.
 *
 * Only fetched on plans that actually cap something — unlimited (paid) plans have nothing
 * to warn about, so we skip the request entirely. When disabled, `data` stays undefined,
 * which {@link limitLevel}/{@link isLimitBlocked} already treat as "unlimited".
 */
export function useUsage() {
  const enabled = useAuthStore((s) => planHasLimits(s.user))
  return useQuery({
    queryKey: subscriptionKeys.usage,
    queryFn: getUsage,
    staleTime: USAGE_STALE_TIME,
    enabled,
  })
}

/**
 * Returns a callback that refreshes the usage counter. Call it after a category/transaction
 * is created (or a 403 reveals the counter is stale) so warnings/blocking stay in sync.
 */
export function useInvalidateUsage() {
  const queryClient = useQueryClient()
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage }),
    [queryClient],
  )
}
