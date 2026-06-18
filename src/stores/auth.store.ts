import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

function setAuthCookie(value: boolean) {
  if (typeof document === 'undefined') return
  if (value) {
    document.cookie = 'nexus-authed=1; path=/; max-age=2592000; SameSite=Lax'
  } else {
    document.cookie = 'nexus-authed=; path=/; max-age=0'
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        setAuthCookie(true)
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        setAuthCookie(false)
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
