import { useQuery } from "@tanstack/react-query"
import { ApiError } from "@/shared/api/apiError"
import { HttpStatus } from "@/shared/api/httpStatus"
import { ACCOUNTS_FIRST_SYNC_POLL_MS, investingKeys } from "./queries"
import { getExchangeAccounts } from "./requests"

/** Connected exchange accounts. A 403 here means the plan gate, not a failure. */
export function useExchangeAccounts() {
  return useQuery({
    queryKey: investingKeys.accounts,
    queryFn: getExchangeAccounts,
    // 403 is a plan gate, not a flake — retrying it only delays the paywall.
    retry: (failureCount, err) =>
      !(err instanceof ApiError && err.status === HttpStatus.FORBIDDEN) && failureCount < 2,
    // The backend pulls exchange history in the background (cron every 2 min);
    // while some account hasn't finished its first sync, poll for the status.
    refetchInterval: (query) =>
      query.state.data?.some((a) => a.lastSyncAt === null) ? ACCOUNTS_FIRST_SYNC_POLL_MS : false,
  })
}
