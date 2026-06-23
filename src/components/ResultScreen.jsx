import { useMemo, useState } from 'react'
import BottomNavigation from './BottomNavigation.jsx'
import ProgressScreen from './ProgressScreen.jsx'
import {
  createRecommendationFeedbackContext,
  preserveCompletedSections,
} from './resultScreenHelpers.js'
import SettingsScreen from './SettingsScreen.jsx'
import TodayScreen from './TodayScreen.jsx'
import { FEEDBACK_URL } from '../data/feedback.js'
import {
  deriveWorkPhaseFromWorkday,
  normalizeWorkdayType,
  normalizeProfileAnswers,
} from '../data/profileOptions.js'
import { loadDailyContext, saveDailyContext } from '../utils/dailyContextStorage.js'
import { generatePlan, replaceRecommendationInPlan } from '../utils/generatePlan.js'
import { loadPremiumStatus } from '../utils/premiumStatus.js'
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
} from '../utils/recommendationFeedbackStorage.js'
import {
  canUseReplacement,
  loadReplacementUsage,
  recordReplacementUsage,
} from '../utils/replacementUsageStorage.js'

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
  const [selectedWorkdayType, setSelectedWorkdayType] = useState(
    () => loadDailyContext()?.currentWorkdayType ?? normalizedAnswers.situation,
  )
  const activeWorkdayType = normalizeWorkdayType(selectedWorkdayType)
  const activeWorkPhase = deriveWorkPhaseFromWorkday(activeWorkdayType)
  const defaultWorkplace = normalizedAnswers.defaultWorkplace
  const [selectedWorkplace, setSelectedWorkplace] = useState(defaultWorkplace)
  const [workplaceWasChanged, setWorkplaceWasChanged] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())
  const [premiumStatus] = useState(() => loadPremiumStatus())
  const [replacementUsage, setReplacementUsage] = useState(() =>
    loadReplacementUsage(),
  )
  const [, setRecommendationFeedback] = useState(() =>
    loadRecommendationFeedback(),
  )
  const [successState, setSuccessState] = useState(null)
  const [planOverride, setPlanOverride] = useState(null)
  const [replacementMessage, setReplacementMessage] = useState(null)
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
        currentWorkdayType: activeWorkdayType,
      }),
    [activeWorkPhase, activeWorkdayType, activeWorkplace, normalizedAnswers],
  )
  const planContextKey = createPlanContextKey({
    activeWorkPhase,
    activeWorkdayType,
    activeWorkplace,
    normalizedAnswers,
  })
  const plan = planOverride?.contextKey === planContextKey ? planOverride.plan : basePlan
  const currentReplacementMessage =
    replacementMessage?.contextKey === planContextKey ? replacementMessage.message : ''
  const canReplaceRecommendation = canUseReplacement({
    premiumStatus,
    usage: replacementUsage,
  })
  const completedIds = useMemo(() => getCompletedIdsForDate(progress), [progress])
  const progressSummary = useMemo(
    () => calculateProgressSummary(progress),
    [progress],
  )
  function handleWorkplaceChange(workplace) {
    setSelectedWorkplace(workplace)
    setWorkplaceWasChanged(true)
  }

  function handleWorkdayTypeChange(workdayType) {
    const nextWorkdayType = normalizeWorkdayType(workdayType)
    const nextWorkPhase = deriveWorkPhaseFromWorkday(nextWorkdayType)
    const nextPlan = generatePlan({
      ...normalizedAnswers,
      currentPhase: nextWorkPhase,
      currentWorkplace: activeWorkplace,
      currentWorkdayType: nextWorkdayType,
    })
    const nextContextKey = createPlanContextKey({
      activeWorkPhase: nextWorkPhase,
      activeWorkdayType: nextWorkdayType,
      activeWorkplace,
      normalizedAnswers,
    })

    setSelectedWorkdayType(nextWorkdayType)
    saveDailyContext({ currentWorkdayType: nextWorkdayType })
    setReplacementMessage(null)

    if (!completedIds.length) {
      setPlanOverride(null)
      return
    }

    setPlanOverride({
      contextKey: nextContextKey,
      plan: preserveCompletedSections(plan, nextPlan, completedIds),
    })
  }

  function handleReplaceRecommendation(indexToReplace, reason) {
    const originalSection = plan.dailySchedule[indexToReplace]
    const result = replaceRecommendationInPlan({
      plan,
      indexToReplace,
      profile: normalizedAnswers,
      currentWorkplace: activeWorkplace,
      currentPhase: activeWorkPhase,
      currentWorkdayType: activeWorkdayType,
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
    setReplacementUsage(recordReplacementUsage())
    setRecommendationFeedback(
      recordRecommendationFeedback({
        ...createRecommendationFeedbackContext({
          activeWorkPhase,
          activeWorkdayType,
          activeWorkplace,
          fallbackIntensity: normalizedAnswers.fitnessLevel,
          section: originalSection,
        }),
        replacementRecommendationId:
          result.replacement.ruleId ?? result.replacement.id,
        slotId: originalSection.slotId,
        feedback: 'not-fit',
        reason,
        replacementReason: reason,
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
      feedbackContext: createRecommendationFeedbackContext({
        activeWorkPhase,
        activeWorkdayType,
        activeWorkplace,
        fallbackIntensity: normalizedAnswers.fitnessLevel,
        section,
      }),
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
          activeWorkdayType={activeWorkdayType}
          canReplaceRecommendation={canReplaceRecommendation}
          onReplaceRecommendation={handleReplaceRecommendation}
          onWorkplaceChange={handleWorkplaceChange}
          onWorkdayTypeChange={handleWorkdayTypeChange}
          replacementMessage={currentReplacementMessage}
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
          feedbackUrl={FEEDBACK_URL}
          onChangeAnswers={onChangeAnswers}
          onRestartOnboarding={onRestartOnboarding}
        />
      )}

      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />

      {successState && (
        <SuccessDialog
          feedbackContext={successState.feedbackContext}
          feedbackUrl={FEEDBACK_URL}
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

function createPlanContextKey({
  activeWorkPhase,
  activeWorkdayType,
  activeWorkplace,
  normalizedAnswers,
}) {
  return `${activeWorkPhase}:${activeWorkdayType}:${activeWorkplace}:${JSON.stringify(normalizedAnswers)}`
}

export function SuccessDialog({
  feedbackContext = {},
  feedbackUrl = FEEDBACK_URL,
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

        <section className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            War die Empfehlung hilfreich? Du testest gerade eine frühe Version
            von Move at work. Dein Feedback hilft dabei, die Empfehlungen
            verständlicher, passender und alltagstauglicher zu machen.
          </p>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#2563eb]/40 hover:text-[#2563eb] dark:border-white/10 dark:text-slate-200"
          >
            Feedback geben
          </a>
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
