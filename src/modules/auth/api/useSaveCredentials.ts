import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "../hooks/useAuthStore"
import { type CredentialsPayload, setCredentials } from "./requests"

interface Options {
  onSuccess?: () => void
  onError?: () => void
}

/** Payload plus the address being linked, when this call is an initial email linking. */
type Variables = CredentialsPayload & { linkedEmail?: string }

/** Links an email and/or sets a password, then reconciles the auth store with the answer. */
export function useSaveCredentials({ onSuccess, onError }: Options = {}) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ linkedEmail: _linked, ...payload }: Variables) => setCredentials(payload),
    onSuccess: (updated, { linkedEmail }) => {
      // Merge, do not replace: the response may be partial and wipe the name/currency.
      // On initial linking the email goes to `pendingEmail` (the backend sets `email` only after
      // the user confirms via the emailed link) — force it from the response or the sent value so
      // the banner switches to "confirm" mode. The password was just set → hasPassword: true.
      setUser({
        ...user,
        ...updated,
        ...(linkedEmail ? { pendingEmail: updated?.pendingEmail ?? linkedEmail } : {}),
        hasPassword: true,
      })
      onSuccess?.()
    },
    onError: () => onError?.(),
  })
}
