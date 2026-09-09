import { useQuery } from "@tanstack/react-query"
import { TRANSACTIONS_STALE_TIME, transactionKeys } from "./queries"
import { getBalance } from "./requests"

/** Total balance in the base currency and USD. */
export function useBalance() {
  return useQuery({
    queryKey: transactionKeys.balance,
    queryFn: getBalance,
    staleTime: TRANSACTIONS_STALE_TIME,
  })
}
