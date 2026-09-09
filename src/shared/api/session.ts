/**
 * The inversion point. A 401 has to clear the user from the auth store, but the layer rules
 * forbid `shared` from importing a module. So `auth` registers a handler at startup
 * (`app/main.tsx`) and `shared/api/request` only fires it.
 */
type SessionExpiredHandler = () => void

let handler: SessionExpiredHandler | null = null

/** Registers what to do when the session expires. Called once, at startup. */
export function onSessionExpired(fn: SessionExpiredHandler): void {
  handler = fn
}

/** Reports an expired session. A no-op until a handler is registered. */
export function notifySessionExpired(): void {
  handler?.()
}
