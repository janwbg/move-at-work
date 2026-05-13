import { useMemo, useState } from 'react'
import BottomNavigation from './BottomNavigation.jsx'
import ProgressScreen from './ProgressScreen.jsx'
import SettingsScreen from './SettingsScreen.jsx'
import TodayScreen from './TodayScreen.jsx'
import {
  deriveWorkPhaseFromWorkday,
  normalizeProfileAnswers,
} from '../data/profileOptions.js'
import { generatePlan, replaceRecommendationInPlan } from '../utils/generatePlan.js'
import {
  calculateProgressSummary,
  getCompletedIdsForDate,
  loadProgress,
  recordCompletion,
  saveProgress,
} from '../utils/progressStorage.js'
import {
  loadRecommendationFeedback,
  recordRecommendationFeedback,
  summarizeRecommendationFeedback,
} from '../utils/recommendationFeedbackStorage.js'

const FEEDBACK_URL =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=_skZ9LD3h02-6OjfshkMq0iBY0yGNnBAlYv4W7o8vNRUNVVEV0JYSVYzRlZFSUpXWVVHVUVNNktMTS4u'

const feedbackReasons = [
  'Zu auffällig',
  'Keine Zeit',
  'Zu anstrengend',
  'Zu leicht',
  'Setup hat nicht gepasst',
  'Hat mich nicht angesprochen',
]

function ResultScreen({ answers, onChangeAnswers, onRestartOnboarding }) {
  const normalizedAnswers = useMemo(() => normalizeProfileAnswers(answers), [answers])
  const [activeTab, setActiveTab] = useState('today')
  const defaultWorkPhase = deriveWorkPhaseFromWorkday(normalizedAnswers.situation)
  const defaultWorkplace = normalizedAnswers.defaultWorkplace
  const [selectedWorkplace, setSelectedWorkplace] = useState(defaultWorkplace)
  const [workplaceWasChanged, setWorkplaceWasChanged] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())
  const [recommendationFeedback, setRecommendationFeedback] = useState(() =>
    loadRecommendationFeedback(),
  )
  const [successState, setSuccessState] = useState(null)
  const [planOverride, setPlanOverride] = useState(null)
  const [replacementMessage, setReplacementMessage] = useState(null)
  const activeWorkPhase = defaultWorkPhase
  const activeWorkplace =
    workplaceWasChanged && normalizedAnswers.workplaces.includes(selectedWorkplace)
      ? selectedWorkplace
      : defaultWorkplace
  const basePlan = useMemo(
    () =>
      generatePlan({
        ...normalizedAnswers,
        currentPhase: activeWorkPhase,
        currentWorkplace: activeWorkplace,
      }),
    [activeWorkPhase, activeWorkplace, normalizedAnswers],
  )
  const planContextKey = `${activeWorkPhase}:${activeWorkplace}:${JSON.stringify(normalizedAnswers)}`
  const plan = planOverride?.contextKey === planContextKey ? planOverride.plan : basePlan
  const currentReplacementMessage =
    replacementMessage?.contextKey === planContextKey ? replacementMessage.message : ''
  const completedIds = useMemo(() => getCompletedIdsForDate(progress), [progress])
  const progressSummary = useMemo(
    () => calculateProgressSummary(progress),
    [progress],
  )
  const feedbackSummary = useMemo(
    () => summarizeRecommendationFeedback(recommendationFeedback),
    [recommendationFeedback],
  )

  function handleWorkplaceChange(workplace) {
    setSelectedWorkplace(workplace)
    setWorkplaceWasChanged(true)
  }

  function handleReplaceRecommendation(indexToReplace, reason) {
    const originalSection = plan.dailySchedule[indexToReplace]
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace,
      profile: normalizedAnswers,
      currentWorkplace: activeWorkplace,
      currentPhase: activeWorkPhase,
      reason,
    })

    if (!result.replaced) {
      setReplacementMessage({
        contextKey: planContextKey,
        message: 'Ich habe gerade keine passendere Alternative gefunden.',
      })
      return
    }

    setPlanOverride({ contextKey: planContextKey, plan: result.plan })
    setReplacementMessage(null)
    setRecommendationFeedback(
      recordRecommendationFeedback({
        recommendationId: originalSection.ruleId ?? originalSection.id,
        scheduleSectionId: originalSection.id,
        workplace: activeWorkplace,
        currentWorkplace: activeWorkplace,
        phase: activeWorkPhase,
        currentPhase: activeWorkPhase,
        workdayType: normalizedAnswers.situation,
        intensity: originalSection.intensity ?? normalizedAnswers.fitnessLevel,
        feedback: 'not-fit',
        reason,
        action: 'replaced',
      }),
    )
  }

  function handleComplete(section) {
    const exerciseId = section.id

    if (completedIds.includes(exerciseId)) {
      return
    }

    const nextProgress = recordCompletion(progress, exerciseId)
    const nextSummary = calculateProgressSummary(nextProgress)

    setProgress(nextProgress)
    saveProgress(nextProgress)
    setSuccessState({
      feedbackContext: {
        recommendationId: section.ruleId ?? section.id,
        scheduleSectionId: section.id,
        workplace: activeWorkplace,
        currentWorkplace: activeWorkplace,
        phase: activeWorkPhase,
        currentPhase: activeWorkPhase,
        workdayType: normalizedAnswers.situation,
        intensity: section.intensity ?? normalizedAnswers.fitnessLevel,
      },
      summary: nextSummary,
      title: section.title,
      totalToday: plan.dailySchedule.length,
    })
  }

  function handleRecommendationFeedback(feedbackEntry) {
    setRecommendationFeedback(recordRecommendationFeedback(feedbackEntry))
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
          activeWorkplace={activeWorkplace}
          onReplaceRecommendation={handleReplaceRecommendation}
          onWorkplaceChange={handleWorkplaceChange}
          replacementMessage={currentReplacementMessage}
          workplaces={normalizedAnswers.workplaces}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressScreen
          feedbackSummary={feedbackSummary}
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
          feedbackContext={successState.feedbackContext}
          onFeedback={handleRecommendationFeedback}
          summary={successState.summary}
          title={successState.title}
          totalToday={successState.totalToday}
          onClose={() => setSuccessState(null)}
        />
      )}
    </section>
  )
}

export function SuccessDialog({
  feedbackContext = {},
  initialFeedback = '',
  initialReason = '',
  onClose,
  onFeedback = () => {},
  summary,
  title,
  totalToday,
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(initialFeedback)
  const [selectedReason, setSelectedReason] = useState(initialReason)

  function submitFeedback(feedback, reason = '') {
    setSelectedFeedback(feedback)
    setSelectedReason(reason)
    onFeedback({
      ...feedbackContext,
      feedback,
      reason: reason || undefined,
    })
  }

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
          Aktueller Arbeitsstreak: {summary.streak}{' '}
          {summary.streak === 1 ? 'Arbeitstag' : 'Arbeitstage'} in Folge.
          Jede kurze Bewegung zählt.
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-white/10">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            Hat diese Empfehlung gerade gepasst?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <FeedbackButton
              active={selectedFeedback === 'fit'}
              onClick={() => submitFeedback('fit')}
            >
              Ja, hat gepasst
            </FeedbackButton>
            <FeedbackButton
              active={selectedFeedback === 'not-fit'}
              onClick={() => submitFeedback('not-fit')}
            >
              Eher nicht
            </FeedbackButton>
          </div>

          {selectedFeedback === 'not-fit' && (
            <div className="mt-3 flex flex-wrap gap-2">
              {feedbackReasons.map((reason) => (
                <FeedbackButton
                  active={selectedReason === reason}
                  key={reason}
                  onClick={() => submitFeedback('not-fit', reason)}
                >
                  {reason}
                </FeedbackButton>
              ))}
            </div>
          )}
        </section>

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

function FeedbackButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
      }`}
    >
      {children}
    </button>
  )
}

export default ResultScreen
