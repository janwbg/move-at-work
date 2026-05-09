import { useState } from 'react'
import OptionCard from './OptionCard.jsx'

const goals = [
  'mehr Bewegung',
  'gegen Verspannungen',
  'Kraft aufbauen',
  'mehr Energie',
]

const setupOptions = [
  'Bürostuhl',
  'Sitzschreibtisch',
  'Kein Equipment',
  'Boden',
  'Stehschreibtisch',
  'Walking Pad',
  'Kniestuhl',
  'Sofa/Lounge',
  'Balance Board',
  'Gymnastikball',
  'Ergometer',
  'Treppenstufen',
]

const fitnessLevels = [
  {
    label: 'Level 1 – Anfänger',
    value: 'Level 1',
    description: 'Ich bewege mich aktuell kaum und Sport fällt mir schwer.',
  },
  {
    label: 'Level 2 – Einsteiger',
    value: 'Level 2',
    description: 'Ich bewege mich ab und zu, aber habe keine feste Routine.',
  },
  {
    label: 'Level 3 – Aktiv',
    value: 'Level 3',
    description: 'Ich bin regelmäßig aktiv und fühle mich grundsätzlich fit.',
  },
  {
    label: 'Level 4 – Sportlich',
    value: 'Level 4',
    description: 'Ich trainiere regelmäßig und fordere meinen Körper bewusst.',
  },
  {
    label: 'Level 5 – Sehr sportlich',
    value: 'Level 5',
    description: 'Ich trainiere intensiv und suche gezielte Herausforderungen.',
  },
]

const situationOptions = [
  'Fokusarbeit',
  'Meeting',
  'Telefonat',
  'Kreativarbeit',
  'Pause',
  'Langer Arbeitstag',
]

const steps = [
  {
    eyebrow: 'Schritt 1 von 4',
    question: 'Bevor wir einsteigen - Warum bist du hier?',
  },
  {
    eyebrow: 'Schritt 2 von 4',
    question: 'Welches Setup steht dir zur Verfügung?',
  },
  {
    eyebrow: 'Schritt 3 von 4',
    question: 'Wie schätzt du dein Fitnesslevel ein?',
  },
  {
    eyebrow: 'Schritt 4 von 4',
    question: 'Wie sieht dein normaler Arbeitstag aus?',
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

  function toggleSetup(option) {
    onChange((current) => {
      const exists = current.setup.includes(option)
      return {
        ...current,
        setup: exists
          ? current.setup.filter((item) => item !== option)
          : [...current.setup, option],
      }
    })
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
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-8">
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
          {currentIndex === 1 ? 'Mehrfachauswahl möglich' : 'Eine Auswahl'}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
          {currentStep.question}
        </h1>
      </div>

      {currentIndex === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <OptionCard
              key={goal}
              active={answers.goal === goal}
              label={goal}
              onClick={() => updateAnswer({ goal })}
            />
          ))}
        </div>
      )}

      {currentIndex === 1 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {setupOptions.map((option) => (
            <OptionCard
              key={option}
              active={answers.setup.includes(option)}
              label={option}
              onClick={() => toggleSetup(option)}
              type="checkbox"
            />
          ))}
        </div>
      )}

      {currentIndex === 2 && (
        <div className="grid gap-3">
          {fitnessLevels.map((level) => (
            <OptionCard
              key={level.value}
              active={answers.fitnessLevel === level.value}
              description={level.description}
              label={level.label}
              onClick={() => updateAnswer({ fitnessLevel: level.value })}
            />
          ))}
        </div>
      )}

      {currentIndex === 3 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {situationOptions.map((situation) => (
            <OptionCard
              key={situation}
              active={answers.situation === situation}
              label={situation}
              onClick={() => updateAnswer({ situation })}
            />
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
          className="rounded-full px-5 py-3 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:text-white"
        >
          Zurück
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700"
        >
          {currentIndex === steps.length - 1 ? 'Plan anzeigen' : 'Weiter'}
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
