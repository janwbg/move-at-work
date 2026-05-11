import { useState } from 'react'
import {
  goalOptions,
  intensityOptions,
  setupOptions,
  toggleSetupSelection,
  workdayOptions,
} from '../data/profileOptions.js'
import OptionCard from './OptionCard.jsx'

const steps = [
  {
    eyebrow: 'Schritt 1 von 4',
    helper:
      'Waehle dein wichtigstes Ziel. Du kannst es spaeter in den Einstellungen aendern.',
    question: 'Was moechtest du mit Move at work erreichen?',
  },
  {
    eyebrow: 'Schritt 2 von 4',
    helper:
      'Waehle alles aus, was du regelmaessig nutzen kannst. Du kannst deine Auswahl spaeter in den Einstellungen aendern.',
    question: 'Was steht dir an deinem Arbeitsplatz zur Verfuegung?',
  },
  {
    eyebrow: 'Schritt 3 von 4',
    helper:
      'Waehle, was sich fuer dich im Arbeitsalltag realistisch anfuehlt. Du kannst es spaeter in den Einstellungen aendern.',
    question: 'Wie aktiv sollen deine Bewegungsempfehlungen sein?',
  },
  {
    eyebrow: 'Schritt 4 von 4',
    helper:
      'Diese Auswahl hilft Move at work, deinen Tagesplan grob zu strukturieren.',
    question: 'Wie sieht dein Arbeitstag meistens aus?',
  },
]

function Onboarding({ answers, onChange, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentStep = steps[currentIndex]
  const canContinue = isStepComplete(currentIndex, answers)
  const progressPercent = ((currentIndex + 1) / steps.length) * 100

  function updateAnswer(nextAnswer) {
    onChange((current) => ({ ...current, ...nextAnswer }))
  }

  function toggleSetup(optionId) {
    onChange((current) => ({
      ...current,
      setup: toggleSetupSelection(current.setup, optionId),
    }))
  }

  function handleNext() {
    if (!canContinue) {
      return
    }

    if (currentIndex === steps.length - 1) {
      onComplete()
      return
    }

    setCurrentIndex((index) => index + 1)
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-8">
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
          <span>{currentStep.eyebrow}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div
          aria-label={currentStep.eyebrow}
          aria-valuemax={steps.length}
          aria-valuemin="1"
          aria-valuenow={currentIndex + 1}
          className="mb-5 h-2 rounded-full bg-slate-100 dark:bg-white/10"
          role="progressbar"
        >
          <div
            className="h-2 rounded-full bg-[#2563eb] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
          {currentIndex === 1 ? 'Mehrfachauswahl moeglich' : 'Eine Auswahl'}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
          {currentStep.question}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
          {currentStep.helper}
        </p>
      </div>

      {currentIndex === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {goalOptions.map((goal) => (
            <OptionCard
              key={goal.id}
              active={answers.goal === goal.id}
              description={goal.description}
              label={goal.label}
              onClick={() => updateAnswer({ goal: goal.id })}
            />
          ))}
        </div>
      )}

      {currentIndex === 1 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {setupOptions.map((option) => (
            <OptionCard
              key={option.id}
              active={answers.setup.includes(option.id)}
              description={option.description}
              label={option.label}
              onClick={() => toggleSetup(option.id)}
              type="checkbox"
            />
          ))}
        </div>
      )}

      {currentIndex === 2 && (
        <div className="grid gap-3">
          {intensityOptions.map((level) => (
            <OptionCard
              key={level.id}
              active={answers.fitnessLevel === level.id}
              description={level.description}
              label={level.label}
              onClick={() => updateAnswer({ fitnessLevel: level.id })}
            />
          ))}
        </div>
      )}

      {currentIndex === 3 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {workdayOptions.map((situation) => (
            <OptionCard
              key={situation.id}
              active={answers.situation === situation.id}
              description={situation.description}
              label={situation.label}
              onClick={() => updateAnswer({ situation: situation.id })}
            />
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
          className="min-h-12 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-[#2563eb]/40 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
        >
          Zurueck
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="min-h-12 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {canContinue
            ? currentIndex === steps.length - 1
              ? 'Plan anzeigen'
              : 'Weiter'
            : 'Bitte auswaehlen'}
        </button>
      </div>
    </section>
  )
}

function isStepComplete(index, answers) {
  if (index === 0) {
    return Boolean(answers.goal)
  }

  if (index === 1) {
    return answers.setup.length > 0
  }

  if (index === 2) {
    return Boolean(answers.fitnessLevel)
  }

  return Boolean(answers.situation)
}

export default Onboarding
