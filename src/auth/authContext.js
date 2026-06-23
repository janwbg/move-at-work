import { createContext } from 'react'

export const unavailableAuthMessage =
  'Konto-Funktionen sind aktuell nicht konfiguriert.'

export const defaultAuthContext = {
  authError: '',
  isAuthenticated: false,
  isAuthAvailable: false,
  isLoading: false,
  session: null,
  signIn: async () => ({
    data: null,
    error: new Error(unavailableAuthMessage),
  }),
  signOut: async () => ({ error: new Error(unavailableAuthMessage) }),
  signUp: async () => ({
    data: null,
    error: new Error(unavailableAuthMessage),
  }),
  user: null,
}

export const AuthContext = createContext(defaultAuthContext)

