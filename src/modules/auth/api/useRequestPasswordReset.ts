import { useMutation } from "@tanstack/react-query"
import { forgotPassword } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: () => void
}

/** Sends the password-reset letter to the given address. */
export function useRequestPasswordReset({ onSuccess, onError }: Options = {}) {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => onSuccess?.(),
    onError: () => onError?.(),
  })
}
