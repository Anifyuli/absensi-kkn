// src/store/index.ts
// Simple reactive store using Preact useState + context

import { createContext } from 'preact'
import { useContext, useState, useCallback } from 'preact/hooks'
import type { Mahasiswa } from '@/db/mahasiswa'
import { getSession, setSession, clearSession } from '@/lib/auth'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export interface AppState {
  user: Mahasiswa | null
  toasts: Toast[]
  login: (m: Mahasiswa) => void
  logout: () => void
  addToast: (msg: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const AppContext = createContext<AppState>({
  user: null,
  toasts: [],
  login: () => {},
  logout: () => {},
  addToast: () => {},
  removeToast: () => {},
})

export function useAppState(): AppState {
  const [user, setUser] = useState<Mahasiswa | null>(getSession)
  const [toasts, setToasts] = useState<Toast[]>([])

  const login = useCallback((m: Mahasiswa) => {
    setSession(m)
    setUser(m)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { user, toasts, login, logout, addToast, removeToast }
}

export function useApp(): AppState {
  return useContext(AppContext)
}
