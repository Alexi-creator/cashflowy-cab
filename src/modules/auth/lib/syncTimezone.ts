import { updateMe } from "../api/requests"
import { useAuthStore } from "../hooks/useAuthStore"
import type { User } from "../model"
import { getBrowserTimezone } from "./getBrowserTimezone"

/**
 * Silently syncs the user's timezone with the browser's current zone. If the zone from /me
 * differs from the `Intl` zone — sends PATCH /auth/me { timezone } and updates the user
 * in the store. Fire-and-forget: errors are swallowed so they do not disrupt the main flow.
 */
export function syncTimezone(user: User): void {
  const tz = getBrowserTimezone()
  if (!tz || tz === user.timezone) return

  updateMe({ timezone: tz })
    .then((updated) => useAuthStore.getState().setUser(updated))
    .catch(() => {})
}
