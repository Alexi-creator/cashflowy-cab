import { create } from "zustand"
import type { User } from "../model"

interface AuthState {
  user: User | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setInitialized: () => set({ isInitialized: true }),
}))
