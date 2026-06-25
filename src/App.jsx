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
    fitnessLevel: '',
    situation: '',
    workplaces: [],
    defaultWorkplace: '',
    currentWorkplace: '',
    workplaceSetups: {
      office: [],
      homeoffice: [],
    },
  }
}

function hasAnyAnswer(answers) {
  return Boolean(
    answers?.goal ||
      answers?.fitnessLevel ||
      answers?.situation ||
      answers?.workplaces?.length ||
      answers?.workplaceSetups?.office?.length ||
      answers?.workplaceSetups?.homeoffice?.length,
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
      answers?.fitnessLevel &&
      answers?.situation &&
      answers?.workplaces?.length &&
      answers.workplaces.every(
        (workplace) => answers.workplaceSetups?.[workplace]?.length,
      ) &&
      answers?.defaultWorkplace,
  )
}

function App() {
  const [step, setStep] = useState(() => {
    const storedAnswers = getStoredAnswers()
    return hasCompletedOnboarding(storedAnswers) ? 'result' : 'start'
  })
  const [resultActiveTab, setResultActiveTab] = useState('today')
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

  const hideHeader =
    step === 'result' && ['today', 'progress', 'settings'].includes(resultActiveTab)

  return (
    <main className="min-h-svh bg-[#f5f8f7] text-slate-950 transition-colors dark:bg-[#0f1413] dark:text-white">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        {!hideHeader && (
          <AppHeader
            isDark={isDark}
            onToggleTheme={() => setIsDark((current) => !current)}
          />
        )}

        <div
          className={`flex flex-1 justify-center ${
            hideHeader
              ? 'items-start pb-8 pt-0 sm:pb-12'
              : 'items-center py-8 sm:py-12'
          }`}
        >
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
            <ResultScreen
              answers={answers}
              isDark={isDark}
              onActiveTabChange={setResultActiveTab}
              onChangeAnswers={setAnswers}
              onRestartOnboarding={() => setStep('onboarding')}
              onToggleTheme={() => setIsDark((current) => !current)}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default App
