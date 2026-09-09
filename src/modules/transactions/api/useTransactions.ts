import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TRANSACTIONS_STALE_TIME, transactionKeys } from "./queries"
import { type GetTransactionsParams, getTransactions } from "./requests"

/** The combined, paginated and filtered transactions list. */
export function useTransactions(params: GetTransactionsParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: TRANSACTIONS_STALE_TIME,
  })
}
