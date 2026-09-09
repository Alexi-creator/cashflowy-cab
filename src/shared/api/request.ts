import { ApiError } from "./apiError"
import { API_URLS } from "./apiUrls"
import type { RequestOptions } from "./commonRequest"
import { commonRequest } from "./commonRequest"
import { HttpMethods } from "./httpMethods"
import { HttpStatus } from "./httpStatus"
import { queryClient } from "./queryClient"
import { notifySessionExpired } from "./session"
import { getStub, STUBS_ENABLED } from "./stubs"

let pendingRefresh: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = commonRequest(API_URLS.auth.refresh, { method: HttpMethods.POST })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        pendingRefresh = null
      })
  }
  return pendingRefresh
}

function redirectToLogin(): void {
  notifySessionExpired()
  // the session expired — drop the cache so signing in under another account does not show someone else's data
  queryClient.clear()
}

export async function request<T>(
  url: string,
  options: RequestOptions<T> & { skipRedirect?: boolean } = {},
): Promise<T> {
  if (STUBS_ENABLED) {
    const stub = getStub(url, options.method ?? "GET")
    if (stub !== undefined) {
      return options.schema ? options.schema.parse(stub) : (stub as T)
    }
  }

  try {
    return await commonRequest(url, options)
  } catch (err) {
    if (err instanceof ApiError && err.status === HttpStatus.UNAUTHORIZED) {
      const refreshed = await refreshTokens()

      if (refreshed) {
        return commonRequest(url, options)
      }

      if (!options.skipRedirect) {
        redirectToLogin()
      }
    }

    throw err
  }
}
