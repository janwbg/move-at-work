// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthPanel from './AuthPanel.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('AuthPanel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the logged-out auth modes', async () => {
    await renderAuthPanel()

    expect(document.body.textContent).toContain('Anmelden')
    expect(document.body.textContent).toContain('Konto erstellen')
    expect(document.body.textContent).toContain(
      'Melde dich an, damit Plus später deinem Konto zugeordnet werden kann.',
    )
  })

  it('shows missing env names without exposing configured values', async () => {
    await renderAuthPanel({
      configStatus: {
        isConfigured: false,
        missingKeys: ['VITE_SUPABASE_ANON_KEY'],
      },
      isAuthAvailable: false,
    })

    expect(document.body.textContent).toContain(
      'Auth ist noch nicht konfiguriert.',
    )
    expect(document.body.textContent).toContain(
      'Fehlende Variable: VITE_SUPABASE_ANON_KEY',
    )
    expect(document.body.textContent).toContain('.env.local')
    expect(document.body.textContent).toContain('Dev-Server neu')
    expect(document.body.textContent).not.toContain('configured-anon-token')
  })

  it('updates email and password inputs', async () => {
    await renderAuthPanel()
    const [emailInput, passwordInput] = document.querySelectorAll('input')

    await changeInput(emailInput, 'test@example.com')
    await changeInput(passwordInput, 'secret123')

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('secret123')
  })

  it('toggles the password field from password to text', async () => {
    await renderAuthPanel()
    const passwordInput = getPasswordInputs()[0]

    expect(passwordInput.type).toBe('password')
    expect(document.body.textContent).toContain('Passwort anzeigen')

    await clickButton('Passwort anzeigen')

    expect(passwordInput.type).toBe('text')
    expect(document.body.textContent).toContain('Passwort verbergen')

    await clickButton('Passwort verbergen')

    expect(passwordInput.type).toBe('password')
    expect(document.body.textContent).toContain('Passwort anzeigen')
  })

  it('shows password confirmation only in register mode', async () => {
    await renderAuthPanel()

    expect(document.body.textContent).not.toContain('Passwort bestätigen')

    await clickButton('Konto erstellen')

    expect(document.body.textContent).toContain('Passwort bestätigen')

    await clickButton('Anmelden')

    expect(document.body.textContent).not.toContain('Passwort bestätigen')
  })

  it('calls signIn with the entered credentials', async () => {
    const signIn = vi.fn().mockResolvedValue({ data: {}, error: null })

    await renderAuthPanel({ signIn })
    const [emailInput, passwordInput] = document.querySelectorAll('input')

    await changeInput(emailInput, 'login@example.com')
    await changeInput(passwordInput, 'secret123')
    await submitForm()

    expect(signIn).toHaveBeenCalledWith('login@example.com', 'secret123')
  })

  it('calls signUp and shows the confirmation hint', async () => {
    const signUp = vi.fn().mockResolvedValue({ data: {}, error: null })

    await renderAuthPanel({ signUp })
    await clickButton('Konto erstellen')
    const [emailInput, passwordInput, passwordConfirmationInput] =
      document.querySelectorAll('input')

    await changeInput(emailInput, 'new@example.com')
    await changeInput(passwordInput, 'secret123')
    await changeInput(passwordConfirmationInput, 'secret123')
    await submitForm()

    expect(signUp).toHaveBeenCalledWith('new@example.com', 'secret123')
    expect(document.body.textContent).toContain(
      'Prüfe ggf. deine E-Mails zur Bestätigung.',
    )
  })

  it('does not call signUp when password confirmation differs', async () => {
    const signUp = vi.fn().mockResolvedValue({ data: {}, error: null })

    await renderAuthPanel({ signUp })
    await clickButton('Konto erstellen')
    const [emailInput, passwordInput, passwordConfirmationInput] =
      document.querySelectorAll('input')

    await changeInput(emailInput, 'new@example.com')
    await changeInput(passwordInput, 'secret123')
    await changeInput(passwordConfirmationInput, 'different123')
    await submitForm()

    expect(signUp).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain(
      'Die Passwörter stimmen nicht überein.',
    )
  })

  it('calls signOut for authenticated users', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })

    await renderAuthPanel({
      isAuthenticated: true,
      signOut,
      user: { email: 'plus@example.com' },
    })
    await clickButton('Abmelden')

    expect(document.body.textContent).toContain('plus@example.com')
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('shows auth errors', async () => {
    await renderAuthPanel({
      signIn: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Ungültige Zugangsdaten'),
      }),
    })

    await submitForm()

    expect(document.body.textContent).toContain('Ungültige Zugangsdaten')
  })
})

async function renderAuthPanel(authOverrides = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(<AuthPanel auth={createAuth(authOverrides)} />)
  })

  return { container, root }
}

function createAuth(overrides = {}) {
  return {
    authError: '',
    configStatus: {
      isConfigured: true,
      missingKeys: [],
    },
    isAuthenticated: false,
    isAuthAvailable: true,
    isLoading: false,
    session: null,
    signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    user: null,
    ...overrides,
  }
}

async function changeInput(input, value) {
  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    ).set
    valueSetter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function submitForm() {
  await act(async () => {
    document.querySelector('form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    )
  })
}

async function clickButton(label) {
  const button = [...document.querySelectorAll('button')].find(
    (element) => element.textContent === label,
  )

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function getPasswordInputs() {
  return [...document.querySelectorAll('input')].filter(
    (input) =>
      input.autocomplete === 'current-password' ||
      input.autocomplete === 'new-password',
  )
}
