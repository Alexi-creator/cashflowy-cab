import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { transactionKeys } from "@/modules/transactions/api/queries"
import { exchangeKeys } from "./queries"

/**
 * Everything an exchange change makes stale. An exchange moves money between currencies, so the
 * balance shifts — but no income or expense is touched, which is why no transaction list or
 * category stat is invalidated here.
 */
export function useInvalidateExchangeData() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: exchangeKeys.all })
    queryClient.invalidateQueries({ queryKey: transactionKeys.balance })
  }, [queryClient])
}
