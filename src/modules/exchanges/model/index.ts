import { z } from "zod"
import { wallClockDate } from "@/shared/lib/wallClock"

/**
 * A recorded currency exchange: what was handed over and what was actually received.
 *
 * Deliberately neither an income nor an expense — net worth barely changes, money just moves
 * between the user's own currencies.
 *
 * The backend also returns the derived rate figures (`effectiveRate`, `midMarketRate`,
 * `costPct`). They are not parsed here on purpose: this app tracks where money is, not how good
 * a deal the exchange was.
 */
export const exchangeSchema = z.object({
  id: z.string(),
  fromCurrency: z.string(),
  fromAmount: z.coerce.number(),
  toCurrency: z.string(),
  toAmount: z.coerce.number(),
  description: z.string(),
  date: wallClockDate(),
})
export type Exchange = z.infer<typeof exchangeSchema>

export const exchangesResponseSchema = z.array(exchangeSchema)
