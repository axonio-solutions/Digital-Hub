import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { clearAuthToken } from '../api-client'
import { storage } from '../storage'
import type { SessionUser } from '../api-client'

export type AuthState = 'checking' | 'signed-out' | 'session-loading' | 'ready'

interface UserStore {
  user: SessionUser | null
  authState: AuthState
  checkingStatus: boolean
  setUser: (user: SessionUser | null) => void
  setAuthState: (state: AuthState) => void
  setCheckingStatus: (v: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      authState: 'checking',
      checkingStatus: false,
      setUser: (user) => set({ user }),
      setAuthState: (authState) => set({ authState }),
      setCheckingStatus: (checkingStatus) => set({ checkingStatus }),
      logout: () => {
        clearAuthToken()
        set({ user: null, authState: 'signed-out' })
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        checkingStatus: state.checkingStatus,
      }),
    },
  ),
)
