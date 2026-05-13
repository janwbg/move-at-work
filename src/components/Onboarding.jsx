import { useState } from 'react'
import {
  goalOptions,
  getSelectedWorkplaces,
  intensityOptions,
  normalizeProfileAnswers,
  setupOptions,
  toggleSetupSelection,
  workplaceOptions,
  workdayOptions,
} from '../data/profileOptions.js'
import OptionCard from './OptionCard.jsx'
import { getOnboardingSteps } from './onboardingSteps.js'

function Onboarding({ answers, initialCurrentIndex = 0, onChange, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(initialCurrentIndex)
  const onboardingSteps = getOnboardingSteps(answers)
  const currentStep = onboardingSteps[Math.min(currentIndex, onboardingSteps.length - 1)]
  const canContinue = isStepComplete(currentStep, answers)
  const progressPercent = ((currentIndex + 1) / onboardingSteps.length) * 100

  function updateAnswer(nextAnswer) {
    onChange((current) => ({ ...current, ...nextAnswer }))
  }

  function toggleWorkplace(workplaceId) {
    onChange((current) => {
      const currentWorkplaces = getSelectedWorkplaces(current, true)
      const exists = currentWorkplaces.includes(workplaceId)
      const nextWorkplaces = exists
        ? currentWorkplaces.filter((workplace) => workplace !== workplaceId)
        : [...currentWorkplaces, workplaceId]
      const normalizedWorkplaces = nextWorkplaces.length
        ? nextWorkplaces
        : currentWorkplaces
      const normalized = normalizeProfileAnswers({
        ...current,
        workplaces: normalizedWorkplaces,
      })

      return {
        ...current,
        workplaces: normalized.workplaces,
        defaultWorkplace: normalized.defaultWorkplace,
        currentWorkplace: normalized.currentWorkplace,
        workplaceSetups: normalized.workplaceSetups,
      }
    })
  }

  function toggleWorkplaceSetup(workplaceId, setupId) {
    onChange((current) => {
      const normalized = normalizeProfileAnswers(current)

      return {
        ...current,
        workplaces: normalized.workplaces,
        defaultWorkplace: normalized.defaultWorkplace,
        currentWorkplace: normalized.currentWorkplace,
        workplaceSetups: {
          ...normalized.workplaceSetups,
          [workplaceId]: toggleSetupSelection(
            normalized.workplaceSetups[workplaceId],
            setupId,
          ),
        },
      }
    })
  }

  function handleNext() {
    if (!canContinue) {
      return
    }

    if (currentIndex === onboardingSteps.length - 1) {
      onComplete()
      return
    }

    setCurrentIndex((index) => index + 1)
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-8">
      <div className="mb-6">
        <div
          aria-label="Onboarding-Fortschritt"
          aria-valuemax={onboardingSteps.length}
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
          {getSelectionLabel(currentStep)}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
          {currentStep.question}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
          {currentStep.helper}
        </p>
      </div>

      {currentStep.kind === 'workplaces' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {workplaceOptions.map((workplace) => (
            <OptionCard
              key={workplace.id}
              active={getSelectedWorkplaces(answers, true).includes(workplace.id)}
              description={workplace.description}
              label={workplace.label}
              onClick={() => toggleWorkplace(workplace.id)}
              type="checkbox"
            />
          ))}
        </div>
      )}

      {currentStep.kind.startsWith('setup-') && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {setupOptions.map((option) => (
            <OptionCard
              key={option.id}
              active={getWorkplaceSetup(answers, currentStep.workplace).includes(
                option.id,
              )}
              description={option.description}
              label={option.label}
              onClick={() => toggleWorkplaceSetup(currentStep.workplace, option.id)}
              type="checkbox"
            />
          ))}
        </div>
      )}

      {currentStep.kind === 'default-workplace' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {getDefaultWorkplaceOptions(answers).map((workplace) => (
            <OptionCard
              key={workplace}
              active={answers.defaultWorkplace === workplace}
              label={workplace === 'homeoffice' ? 'Homeoffice' : 'Büro'}
              onClick={() =>
                updateAnswer({
                  defaultWorkplace: workplace,
                  currentWorkplace: workplace,
                })
              }
            />
          ))}
        </div>
      )}

      {currentStep.kind === 'goal' && (
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

      {currentStep.kind === 'intensity' && (
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

      {currentStep.kind === 'workday' && (
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
          Zurück
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="min-h-12 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {canContinue
            ? currentIndex === onboardingSteps.length - 1
              ? 'Plan anzeigen'
              : 'Weiter'
            : 'Bitte auswählen'}
        </button>
      </div>
    </section>
  )
}

function getSelectionLabel(step) {
  if (step.kind === 'workplaces' || step.kind.startsWith('setup-')) {
    return 'Mehrfachauswahl möglich'
  }

  return 'Eine Auswahl'
}

function isStepComplete(step, answers) {
  if (step.kind === 'workplaces') {
    return getSelectedWorkplaces(answers, true).length > 0
  }

  if (step.kind.startsWith('setup-')) {
    return getWorkplaceSetup(answers, step.workplace).length > 0
  }

  if (step.kind === 'default-workplace') {
    return getSelectedWorkplaces(answers).includes(answers.defaultWorkplace)
  }

  if (step.kind === 'goal') {
    return Boolean(answers.goal)
  }

  if (step.kind === 'intensity') {
    return Boolean(answers.fitnessLevel)
  }

  return Boolean(answers.situation)
}

function getWorkplaceSetup(answers, workplace) {
  return normalizeProfileAnswers(answers).workplaceSetups[workplace] ?? []
}

function getDefaultWorkplaceOptions(answers) {
  const selectedWorkplaces = getSelectedWorkplaces(answers)

  return workplaceOptions
    .map((workplace) => workplace.id)
    .filter((workplace) => selectedWorkplaces.includes(workplace))
}

export default Onboarding
