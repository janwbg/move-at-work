import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import Onboarding from './components/Onboarding.jsx'
import ResultScreen from './components/ResultScreen.jsx'
import StartScreen from './components/StartScreen.jsx'
import { normalizeProfileAnswers } from './data/profileOptions.js'

const storageKey = 'move-at-work-onboarding'

function createDefaultAnswers() {
  return {
    goal: '',
    setup: [],
    fitnessLevel: '',
    situation: '',
  }
}

function hasAnyAnswer(answers) {
  return Boolean(
    answers?.goal ||
      answers?.setup?.length ||
      answers?.fitnessLevel ||
      answers?.situation,
  )
}

function getStoredAnswers() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedAnswers = window.localStorage.getItem(storageKey)
    return storedAnswers ? normalizeStoredAnswers(JSON.parse(storedAnswers)) : null
  } catch {
    return null
  }
}

function normalizeStoredAnswers(answers) {
  if (!answers) {
    return null
  }

  return normalizeProfileAnswers(answers)
}

function hasCompletedOnboarding(answers) {
  return Boolean(
    answers?.goal &&
      answers?.setup?.length &&
      answers?.fitnessLevel &&
      answers?.situation,
  )
}

function App() {
  const [step, setStep] = useState(() => {
    const storedAnswers = getStoredAnswers()
    return hasCompletedOnboarding(storedAnswers) ? 'result' : 'start'
  })
  const [answers, setAnswers] = useState(() => getStoredAnswers() ?? createDefaultAnswers())
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    if (!hasAnyAnswer(answers)) {
      window.localStorage.removeItem(storageKey)
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(answers))
  }, [answers])

  return (
    <main className="min-h-svh bg-[#f7f8fb] text-slate-950 transition-colors dark:bg-[#121212] dark:text-white">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark((current) => !current)}
        />

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          {step === 'start' && (
            <StartScreen onStart={() => setStep('onboarding')} />
          )}

          {step === 'onboarding' && (
            <Onboarding
              answers={answers}
              onChange={setAnswers}
              onComplete={() => setStep('result')}
            />
          )}

          {step === 'result' && (
            <ResultScreen answers={answers} onChangeAnswers={setAnswers} />
          )}
        </div>
      </div>
    </main>
  )
}

export default App
