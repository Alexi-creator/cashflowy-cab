import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useAuthStore } from "../hooks/useAuthStore"
import { logout } from "./requests"

/**
 * Ends the session. The request is best-effort — the local sign-out must happen either way —
 * and the whole cache is dropped so a new login never sees the previous user's data.
 */
export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useCallback(async () => {
    await logout().catch(() => {})
    setUser(null)
    queryClient.clear()
  }, [setUser, queryClient])
}
