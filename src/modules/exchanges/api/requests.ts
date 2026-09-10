import { API_URLS } from "@/shared/api/apiUrls"
import { HttpMethods } from "@/shared/api/httpMethods"
import { request } from "@/shared/api/request"
import { exchangeSchema, exchangesResponseSchema } from "../model"

/** Every recorded exchange, newest first. */
export function getExchanges() {
  return request(API_URLS.exchanges.exchanges, { schema: exchangesResponseSchema })
}

export interface CreateExchangePayload {
  /** ISO 4217, 3 uppercase letters. */
  fromCurrency: string
  /** > 0, up to 2 decimals. */
  fromAmount: number
  toCurrency: string
  /** What was actually received, after the counter's spread and fees. */
  toAmount: number
  /** `YYYY-MM-DD` — the backend stores it in @db.Date without time. */
  date: string
  description?: string
}

export function createExchange(payload: CreateExchangePayload) {
  return request(API_URLS.exchanges.exchanges, {
    method: HttpMethods.POST,
    body: JSON.stringify(payload),
    schema: exchangeSchema,
  })
}

export type UpdateExchangePayload = Partial<CreateExchangePayload>

export function updateExchange(id: string, payload: UpdateExchangePayload) {
  return request(`${API_URLS.exchanges.exchanges}/${id}`, {
    method: HttpMethods.PATCH,
    body: JSON.stringify(payload),
    schema: exchangeSchema,
  })
}

export function deleteExchange(id: string) {
  return request(`${API_URLS.exchanges.exchanges}/${id}`, { method: HttpMethods.DELETE })
}
