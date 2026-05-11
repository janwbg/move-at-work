import { useMemo, useState } from 'react'
import BottomNavigation from './BottomNavigation.jsx'
import ProgressScreen from './ProgressScreen.jsx'
import SettingsScreen from './SettingsScreen.jsx'
import TodayScreen from './TodayScreen.jsx'
import {
  deriveWorkPhaseFromWorkday,
  normalizeProfileAnswers,
} from '../data/profileOptions.js'
import { generatePlan } from '../utils/generatePlan.js'
import {
  calculateProgressSummary,
  getCompletedIdsForDate,
  loadProgress,
  recordCompletion,
  saveProgress,
} from '../utils/progressStorage.js'

const FEEDBACK_URL =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=_skZ9LD3h02-6OjfshkMq0iBY0yGNnBAlYv4W7o8vNRUNVVEV0JYSVYzRlZFSUpXWVVHVUVNNktMTS4u'

function ResultScreen({ answers, onChangeAnswers, onRestartOnboarding }) {
  const normalizedAnswers = normalizeProfileAnswers(answers)
  const [activeTab, setActiveTab] = useState('today')
  const defaultWorkPhase = deriveWorkPhaseFromWorkday(normalizedAnswers.situation)
  const defaultWorkplace = normalizedAnswers.defaultWorkplace
  const [selectedWorkPhase, setSelectedWorkPhase] = useState(defaultWorkPhase)
  const [selectedWorkplace, setSelectedWorkplace] = useState(defaultWorkplace)
  const [phaseWasChanged, setPhaseWasChanged] = useState(false)
  const [workplaceWasChanged, setWorkplaceWasChanged] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())
  const [successState, setSuccessState] = useState(null)
  const activeWorkPhase = phaseWasChanged ? selectedWorkPhase : defaultWorkPhase
  const activeWorkplace =
    workplaceWasChanged && normalizedAnswers.workplaces.includes(selectedWorkplace)
      ? selectedWorkplace
      : defaultWorkplace
  const plan = useMemo(
    () =>
      generatePlan({
        ...normalizedAnswers,
        currentPhase: activeWorkPhase,
        currentWorkplace: activeWorkplace,
      }),
    [activeWorkPhase, activeWorkplace, normalizedAnswers],
  )
  const completedIds = useMemo(() => getCompletedIdsForDate(progress), [progress])
  const progressSummary = useMemo(
    () => calculateProgressSummary(progress),
    [progress],
  )

  function handleWorkPhaseChange(workPhase) {
    setSelectedWorkPhase(workPhase)
    setPhaseWasChanged(true)
  }

  function handleWorkplaceChange(workplace) {
    setSelectedWorkplace(workplace)
    setWorkplaceWasChanged(true)
  }

  function handleComplete(exerciseId, exerciseTitle) {
    if (completedIds.includes(exerciseId)) {
      return
    }

    const nextProgress = recordCompletion(progress, exerciseId)
    const nextSummary = calculateProgressSummary(nextProgress)

    setProgress(nextProgress)
    saveProgress(nextProgress)
    setSuccessState({
      summary: nextSummary,
      title: exerciseTitle,
      totalToday: plan.dailySchedule.length,
    })
  }

  return (
    <section className="w-full max-w-6xl pb-24">
      {activeTab === 'today' && (
        <TodayScreen
          completedIds={completedIds}
          feedbackUrl={FEEDBACK_URL}
          onComplete={handleComplete}
          plan={plan}
          progressSummary={progressSummary}
          activeWorkPhase={activeWorkPhase}
          activeWorkplace={activeWorkplace}
          onWorkPhaseChange={handleWorkPhaseChange}
          onWorkplaceChange={handleWorkplaceChange}
          workplaces={normalizedAnswers.workplaces}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressScreen
          summary={progressSummary}
          totalToday={plan.dailySchedule.length}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsScreen
          answers={normalizedAnswers}
          onChangeAnswers={onChangeAnswers}
          onRestartOnboarding={onRestartOnboarding}
        />
      )}

      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />

      {successState && (
        <SuccessDialog
          summary={successState.summary}
          title={successState.title}
          totalToday={successState.totalToday}
          onClose={() => setSuccessState(null)}
        />
      )}
    </section>
  )
}

function SuccessDialog({ onClose, summary, title, totalToday }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 px-4 py-5 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl shadow-slate-950/20 dark:border-emerald-400/20 dark:bg-[#1b1b1b] sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-extrabold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
            ✓
          </span>
          <div>
            <p
              id="success-title"
              className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white"
            >
              Stark, Übung erledigt!
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {title} ist abgehakt. Du hast heute {summary.completedToday} von{' '}
              {totalToday} Übungen geschafft.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
          Aktueller Tagesstreak: {summary.streak} Tage. Jede kurze Bewegung
          zählt.
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
        >
          Zurück zum Tagesplan
        </button>
      </div>
    </div>
  )
}

export default ResultScreen
