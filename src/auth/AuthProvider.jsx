import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { AuthContext, unavailableAuthMessage } from './authContext.js'

export function AuthProvider({ children, client = supabase }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(client))
  const [authError, setAuthError] = useState('')
  const isAuthAvailable = Boolean(client)

  useEffect(() => {
    if (!client) {
      return undefined
    }

    let isActive = true

    client.auth.getSession().then(({ data, error }) => {
      if (!isActive) {
        return
      }

      if (error) {
        setAuthError(error.message)
      }

      setSession(data?.session ?? null)
      setIsLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthError('')
      setIsLoading(false)
    })

    return () => {
      isActive = false
      data?.subscription?.unsubscribe()
    }
  }, [client])

  const runAuthAction = useCallback(
    async (action) => {
      if (!client) {
        const error = new Error(unavailableAuthMessage)
        setAuthError(error.message)
        return { data: null, error }
      }

      setIsLoading(true)
      setAuthError('')

      const result = await action(client)

      if (result.error) {
        setAuthError(result.error.message)
      }

      setIsLoading(false)
      return result
    },
    [client],
  )

  const signUp = useCallback(
    (email, password) =>
      runAuthAction((activeClient) =>
        activeClient.auth.signUp({
          email,
          password,
        }),
      ),
    [runAuthAction],
  )

  const signIn = useCallback(
    (email, password) =>
      runAuthAction((activeClient) =>
        activeClient.auth.signInWithPassword({
          email,
          password,
        }),
      ),
    [runAuthAction],
  )

  const signOut = useCallback(
    () => runAuthAction((activeClient) => activeClient.auth.signOut()),
    [runAuthAction],
  )

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(session?.user),
      isAuthAvailable,
      isLoading,
      session,
      signIn,
      signOut,
      signUp,
      user: session?.user ?? null,
    }),
    [
      authError,
      isAuthAvailable,
      isLoading,
      session,
      signIn,
      signOut,
      signUp,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
