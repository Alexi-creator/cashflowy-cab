import { useMutation } from "@tanstack/react-query"
import { resendEmailConfirmation } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: () => void
}

/** Re-sends the confirmation letter. Nothing to cache — the caller reports the outcome. */
export function useResendEmailConfirmation({ onSuccess, onError }: Options = {}) {
  return useMutation({
    mutationFn: resendEmailConfirmation,
    onSuccess: () => onSuccess?.(),
    onError: () => onError?.(),
  })
}
