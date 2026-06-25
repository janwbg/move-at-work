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
import {
  loadRoutineSettings,
  routineWeekdayOptions,
  saveRoutineSettings,
} from '../utils/progressStorage.js'
import {
  getDefaultReminderSettings,
  loadReminderSettings,
  normalizeReminderSettings,
  saveReminderSettings,
} from '../utils/reminderStorage.js'
import OptionCard from './OptionCard.jsx'
import { getOnboardingSteps } from './onboardingSteps.js'

const reminderOptions = [
  {
    id: 'none',
    label: 'Keine Erinnerungen',
    description: 'Du startest ohne Reminder und kannst sie später aktivieren.',
  },
  {
    id: 'gentle',
    label: 'Sanft',
    description: 'Wenige, zurückhaltende Impulse.',
  },
  {
    id: 'normal',
    label: 'Normal',
    description: 'Ausgewogene Erinnerungen im Tagesverlauf.',
  },
  {
    id: 'active',
    label: 'Aktiv',
    description: 'Etwas häufigere Impulse innerhalb deiner aktiven Fenster.',
  },
]

const landingBenefits = [
  {
    icon: '✓',
    title: 'Ohne Workout.',
    text: 'Ohne Umziehen. Ohne Extra-Termin.',
  },
]

function Onboarding({
  answers,
  initialCurrentIndex = 0,
  initialLoading = false,
  onChange,
  onComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialCurrentIndex)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [routineSettings, setRoutineSettings] = useState(() =>
    loadRoutineSettings(),
  )
  const [reminderSettings, setReminderSettings] = useState(() =>
    loadReminderSettings(),
  )
  const [reminderChoice, setReminderChoice] = useState(() =>
    getReminderChoice(loadReminderSettings()),
  )
  const onboardingSteps = getOnboardingSteps(answers)
  const safeCurrentIndex = Math.min(currentIndex, onboardingSteps.length - 1)
  const currentStep = onboardingSteps[safeCurrentIndex]
  const canContinue = isStepComplete(currentStep, answers, {
    reminderChoice,
    routineSettings,
  })
  const progressPercent = ((safeCurrentIndex + 1) / onboardingSteps.length) * 100

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

  function toggleRoutineWeekday(weekday) {
    setRoutineSettings((current) => {
      const activeWeekdays = current.activeWeekdays.includes(weekday)
        ? current.activeWeekdays.filter((activeWeekday) => activeWeekday !== weekday)
        : [...current.activeWeekdays, weekday]
      const nextSettings = activeWeekdays.length ? { activeWeekdays } : current

      saveRoutineSettings(nextSettings)
      return nextSettings
    })
  }

  function selectReminderChoice(choice) {
    const mode = choice === 'none' ? 'normal' : choice
    const nextSettings = normalizeReminderSettings({
      ...reminderSettings,
      enabled: choice !== 'none',
      mode,
    })

    setReminderChoice(choice)
    setReminderSettings(nextSettings)
    saveReminderSettings(nextSettings)
  }

  function handleNext() {
    if (!canContinue) {
      return
    }

    if (safeCurrentIndex === onboardingSteps.length - 1) {
      setIsLoading(true)
      window.setTimeout(onComplete, 1700)
      return
    }

    setCurrentIndex((index) => index + 1)
  }

  if (isLoading) {
    return <OnboardingLoading />
  }

  return (
    <section
      className={`w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 sm:p-8 ${
        currentStep.kind === 'landing' ? 'max-w-4xl' : 'max-w-3xl'
      }`}
    >
      <div className="mb-6">
        {currentStep.kind !== 'landing' && (
          <div
            aria-label="Onboarding-Fortschritt"
            aria-valuemax={onboardingSteps.length}
            aria-valuemin="1"
            aria-valuenow={safeCurrentIndex + 1}
            className="mb-5 h-2 rounded-full bg-slate-100 dark:bg-white/10"
            role="progressbar"
          >
            <div
              className="h-2 rounded-full bg-teal-700 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        <p className="text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
          {getSelectionLabel(currentStep)}
        </p>
        {currentStep.kind !== 'setup-confirmation' && !isSetupStep(currentStep) && (
          <>
            <h1 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
              {getStepQuestion(currentStep, answers)}
            </h1>
            {getStepHelper(currentStep, answers) && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                {getStepHelper(currentStep, answers)}
              </p>
            )}
          </>
        )}
      </div>

      {currentStep.kind === 'landing' && (
        <div className="grid gap-3">
          {landingBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-teal-700 shadow-sm shadow-slate-200/70 dark:bg-white/10 dark:text-teal-200 dark:shadow-none">
                {benefit.icon}
              </div>
              <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
                {benefit.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      )}

      {currentStep.kind === 'workplaces' && (
        <div className="space-y-3">
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
          <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Büro & Homeoffice: Wähle beide Orte aus, wenn du regelmäßig
            wechselst.
          </p>
        </div>
      )}

      {currentStep.kind.startsWith('setup-') && currentStep.workplace && (
        <div className="space-y-4">
          <SetupWorkplaceContext answers={answers} step={currentStep} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {setupOptions.map((option) => (
              <OptionCard
                key={option.id}
                active={getWorkplaceSetup(answers, currentStep.workplace).includes(
                  option.id,
                )}
                description={option.description}
                icon={option.icon}
                label={option.label}
                onClick={() => toggleWorkplaceSetup(currentStep.workplace, option.id)}
                type="checkbox"
              />
            ))}
          </div>
        </div>
      )}

      {currentStep.kind === 'setup-confirmation' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-teal-700 shadow-sm shadow-slate-200/70 dark:bg-white/10 dark:text-teal-200 dark:shadow-none">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
            {getSetupConfirmationCopy(answers).title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            {getSetupConfirmationCopy(answers).body}
          </p>
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
              icon={goal.icon}
              label={goal.label}
              onClick={() => updateAnswer({ goal: goal.id })}
            />
          ))}
        </div>
      )}

      {currentStep.kind === 'routine' && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {routineWeekdayOptions.map((weekday) => (
            <button
              key={weekday.id}
              type="button"
              aria-pressed={routineSettings.activeWeekdays.includes(weekday.id)}
              onClick={() => toggleRoutineWeekday(weekday.id)}
              className={`min-h-12 rounded-lg border px-3 py-2 text-sm font-extrabold transition ${
                routineSettings.activeWeekdays.includes(weekday.id)
                  ? 'border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-700/50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'
              }`}
            >
              {weekday.label}
            </button>
          ))}
        </div>
      )}

      {currentStep.kind === 'reminder' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {reminderOptions.map((option) => (
            <OptionCard
              key={option.id}
              active={reminderChoice === option.id}
              description={option.description}
              label={option.label}
              onClick={() => selectReminderChoice(option.id)}
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

      {currentStep.kind === 'final' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Du bekommst kurze Empfehlungen, die zu deinem Schreibtischtag passen
          — damit Bewegung nicht noch ein zusätzlicher Termin wird.
        </div>
      )}

      <div
        className={`mt-7 flex flex-col-reverse gap-3 sm:flex-row ${
          safeCurrentIndex === 0 ? 'sm:justify-end' : 'sm:justify-between'
        }`}
      >
        {safeCurrentIndex > 0 && (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            className="min-h-12 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-teal-700/40 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
          >
            Zurück
          </button>
        )}

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="min-h-12 rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {canContinue ? getNextButtonLabel(currentStep) : 'Bitte auswählen'}
        </button>
      </div>
    </section>
  )
}

function OnboardingLoading() {
  return (
    <section className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 sm:p-8">
      <div
        aria-hidden="true"
        className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        data-loading-plan-visual="true"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="grid gap-2">
            {[
              ['Arbeitsort', 'Büro/Homeoffice'],
              ['Setup', 'passt dazu'],
              ['Intensität', 'realistisch'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="animate-pulse rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-950/40 dark:shadow-none"
              >
                <p className="text-[11px] font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
                  {label}
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="mx-auto hidden h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-extrabold text-white shadow-lg shadow-teal-700/20 sm:flex">
            →
          </div>
          <div className="rounded-xl border border-teal-700/30 bg-white p-3 shadow-sm shadow-teal-700/10 dark:border-teal-300/30 dark:bg-slate-950/40">
            <p className="text-[11px] font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
              Tagesplan
            </p>
            <div className="mt-3 grid gap-2">
              <span className="h-2 rounded-full bg-teal-700/80" />
              <span className="h-2 w-4/5 rounded-full bg-slate-300 dark:bg-white/20" />
              <span className="h-2 w-3/5 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm font-bold uppercase tracking-normal text-teal-700 dark:text-teal-300">
        Einen Moment
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
        Dein persönlicher Tagesplan wird generiert.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
        Wir stimmen Arbeitsort, Setup und Intensität aufeinander ab.
      </p>
    </section>
  )
}

function SetupWorkplaceContext({ answers, step }) {
  const selectedWorkplaces = getOrderedSelectedWorkplaces(answers)
  const setupSteps = selectedWorkplaces.length
  const workplaceIndex = selectedWorkplaces.indexOf(step.workplace)
  const workplaceLabel = getWorkplaceLabel(step.workplace)
  const stepLabel = `Schritt ${workplaceIndex + 1} von ${setupSteps} · ${workplaceLabel}`

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-teal-700 shadow-sm shadow-slate-200/70 dark:bg-white/10 dark:text-teal-200 dark:shadow-none">
          {step.workplace === 'homeoffice' ? '⌂' : '▦'}
        </div>
        <div>
          {setupSteps > 1 && (
            <p className="text-xs font-extrabold uppercase tracking-normal text-teal-700 dark:text-teal-300">
              {stepLabel}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
            Was hast du {step.workplace === 'homeoffice' ? 'im Homeoffice' : 'im Büro'} zur Verfügung?
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Wähle alles aus, was für kurze Bewegungsimpulse realistisch nutzbar
            ist.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-teal-700 dark:text-teal-200">
            Keine Sorge: Move at work schlägt dir nur Übungen vor, die zu
            deinem Umfeld passen.
          </p>
        </div>
      </div>
    </div>
  )
}

function isSetupStep(step) {
  return step.kind.startsWith('setup-') && Boolean(step.workplace)
}

function getSelectionLabel(step) {
  if (step.kind === 'landing') {
    return 'Willkommen'
  }

  if (step.kind === 'setup-confirmation' || step.kind === 'final') {
    return step.eyebrow
  }

  if (step.kind === 'workplaces' || step.kind.startsWith('setup-')) {
    return 'Mehrfachauswahl möglich'
  }

  return 'Eine Auswahl'
}

function getStepQuestion(step, answers) {
  if (step.kind === 'setup-confirmation') {
    return getSetupConfirmationCopy(answers).title
  }

  return step.question
}

function getStepHelper(step, answers) {
  if (step.kind === 'setup-confirmation') {
    return getSetupConfirmationCopy(answers).body
  }

  return step.helper
}

function getNextButtonLabel(step) {
  if (step.kind === 'landing') {
    return 'Loslegen'
  }

  if (step.kind === 'final') {
    return 'Tagesplan ansehen'
  }

  return 'Weiter'
}

function isStepComplete(step, answers, localState) {
  if (step.kind === 'landing' || step.kind === 'setup-confirmation' || step.kind === 'final') {
    return true
  }

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

  if (step.kind === 'routine') {
    return localState.routineSettings.activeWeekdays.length > 0
  }

  if (step.kind === 'reminder') {
    return reminderOptions.some((option) => option.id === localState.reminderChoice)
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

function getOrderedSelectedWorkplaces(answers) {
  const selectedWorkplaces = getSelectedWorkplaces(answers)

  return workplaceOptions
    .map((workplace) => workplace.id)
    .filter((workplace) => selectedWorkplaces.includes(workplace))
}

function getWorkplaceLabel(workplaceId) {
  return workplaceId === 'homeoffice' ? 'Homeoffice' : 'Büro'
}

function getReminderChoice(settings = getDefaultReminderSettings()) {
  const normalized = normalizeReminderSettings(settings)
  return normalized.enabled ? normalized.mode : 'none'
}

function getSetupConfirmationCopy(answers) {
  const normalized = normalizeProfileAnswers(answers)
  const selectedWorkplaces = getSelectedWorkplaces(normalized)
  const selectedSetups = selectedWorkplaces.map(
    (workplace) => normalized.workplaceSetups[workplace] ?? ['no-equipment'],
  )
  const hasSpecialSetup = selectedSetups.some((setup) =>
    setup.some((item) => item !== 'no-equipment'),
  )
  const differsBetweenWorkplaces =
    selectedSetups.length > 1 &&
    new Set(selectedSetups.map((setup) => [...setup].sort().join('|'))).size > 1

  if (differsBetweenWorkplaces) {
    return {
      title: 'Alles klar, wir merken uns deine Unterschiede.',
      body:
        'Move at work berücksichtigt, ob du heute im Büro oder im Homeoffice bist.',
    }
  }

  if (hasSpecialSetup) {
    return {
      title: 'Perfekt, wir berücksichtigen dein Setup.',
      body:
        'Move at work schlägt dir Impulse vor, die zu deinem Arbeitsort und deinen Möglichkeiten passen.',
    }
  }

  return {
    title: 'Kein Equipment? Kein Problem.',
    body:
      'Move at work funktioniert auch ohne Zubehör, ohne Sportkleidung und ohne großen Platzbedarf.',
  }
}

export default Onboarding
