import { useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { getSupabaseConfigStatus } from '../lib/supabaseClient.js'

function AuthPanel({ auth: providedAuth }) {
  const contextAuth = useAuth()
  const auth = providedAuth ?? contextAuth
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const isSignUp = mode === 'sign-up'
  const passwordInputType = passwordVisible ? 'text' : 'password'
  const passwordVisibilityLabel = passwordVisible
    ? 'Passwort verbergen'
    : 'Passwort anzeigen'

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    setSuccessMessage('')

    if (isSignUp && password !== passwordConfirmation) {
      setLocalError('Die Passwörter stimmen nicht überein.')
      return
    }

    const result = isSignUp
      ? await auth.signUp(email, password)
      : await auth.signIn(email, password)

    if (result.error) {
      setLocalError(result.error.message)
      return
    }

    if (isSignUp) {
      setSuccessMessage('Prüfe ggf. deine E-Mails zur Bestätigung.')
    }
  }

  async function handleSignOut() {
    setLocalError('')
    setSuccessMessage('')
    const result = await auth.signOut()

    if (result.error) {
      setLocalError(result.error.message)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setPasswordConfirmation('')
    setLocalError('')
    setSuccessMessage('')
  }

  if (!auth.isAuthAvailable) {
    return <UnavailableAuthNotice configStatus={auth.configStatus} />
  }

  if (auth.isAuthenticated) {
    return (
      <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Angemeldet als
        </p>
        <p className="mt-1 break-all text-base font-extrabold text-slate-950 dark:text-white">
          {auth.user?.email}
        </p>
        {(localError || auth.authError) && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-400/10 dark:text-red-100">
            {localError || auth.authError}
          </p>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={auth.isLoading}
          className="mt-4 min-h-11 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:text-slate-200"
        >
          {auth.isLoading ? 'Bitte warten ...' : 'Abmelden'}
        </button>
      </div>
    )
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
        Melde dich an, damit Plus später deinem Konto zugeordnet werden kann.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Konto-Modus">
        <button
          type="button"
          aria-pressed={!isSignUp}
          onClick={() => switchMode('sign-in')}
          className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
            !isSignUp
              ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          aria-pressed={isSignUp}
          onClick={() => switchMode('sign-up')}
          className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
            isSignUp
              ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
          }`}
        >
          Konto erstellen
        </button>
      </div>

      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
        E-Mail
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </label>

      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
        Passwort
        <span className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type={passwordInputType}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={6}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button
            type="button"
            aria-label={passwordVisibilityLabel}
            onClick={() => setPasswordVisible((current) => !current)}
            className="min-h-11 shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
          >
            {passwordVisibilityLabel}
          </button>
        </span>
      </label>

      {isSignUp && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Passwort bestätigen
          <input
            type={passwordInputType}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </label>
      )}

      {(localError || auth.authError) && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-400/10 dark:text-red-100">
          {localError || auth.authError}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-100">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={auth.isLoading}
        className="min-h-11 rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] disabled:cursor-wait disabled:opacity-70"
      >
        {auth.isLoading
          ? 'Bitte warten ...'
          : isSignUp
            ? 'Konto erstellen'
            : 'Anmelden'}
      </button>
    </form>
  )
}

function UnavailableAuthNotice({ configStatus }) {
  const safeConfigStatus = configStatus ?? getSupabaseConfigStatus()
  const missingKeys = safeConfigStatus.missingKeys ?? []

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
        Melde dich an, damit Plus später deinem Konto zugeordnet werden kann.
      </p>
      <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <p className="font-extrabold text-slate-700 dark:text-slate-200">
          Auth ist noch nicht konfiguriert.
        </p>
        {missingKeys.length > 0 && (
          <p className="mt-1">
            {missingKeys.length === 1
              ? 'Fehlende Variable: '
              : 'Fehlende Variablen: '}
            {missingKeys.map((missingKey, index) => (
              <span key={missingKey}>
                {index > 0 ? ', ' : ''}
                <code>{missingKey}</code>
              </span>
            ))}
          </p>
        )}
        <p className="mt-1">
          Prüfe deine <code>.env.local</code> im Projektordner und starte den Dev-Server neu.
        </p>
      </div>
    </div>
  )
}

export default AuthPanel
