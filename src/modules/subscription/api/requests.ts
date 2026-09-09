import { API_URLS } from "@/shared/api/apiUrls"
import { request } from "@/shared/api/request"
import { usageSchema } from "../model"

/**
 * Current plan usage and remaining limits — categories (lifetime total) and transactions
 * (current calendar month). Refetch (invalidate) after creating a category/transaction.
 */
export function getUsage() {
  return request(API_URLS.subscriptions.usage, { schema: usageSchema })
}
