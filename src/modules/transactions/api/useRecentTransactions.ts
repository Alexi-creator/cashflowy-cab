import { useQuery } from "@tanstack/react-query"
import { TRANSACTIONS_STALE_TIME, transactionKeys } from "./queries"
import { getTransactions } from "./requests"

/** The newest transactions, for the overview snippet. */
export function useRecentTransactions(limit: number) {
  return useQuery({
    queryKey: transactionKeys.recent(limit),
    queryFn: () => getTransactions({ page: 1, limit }),
    staleTime: TRANSACTIONS_STALE_TIME,
  })
}
