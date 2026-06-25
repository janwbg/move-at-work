import { useEffect, useMemo, useState } from 'react'
import BottomNavigation from './BottomNavigation.jsx'
import ProgressScreen from './ProgressScreen.jsx'
import {
  createRecommendationFeedbackContext,
  loadCompletedSectionSnapshots,
  preserveCompletedSections,
  preserveCompletedSectionsFromSnapshots,
  recordCompletedSectionSnapshot,
  recordVisiblePlanHistory,
  saveCompletedSectionSnapshots,
  shouldShowCompleteDaySuccess,
} from './resultScreenHelpers.js'
import SettingsScreen from './SettingsScreen.jsx'
import TodayScreen from './TodayScreen.jsx'
import UpgradeScreen from './UpgradeScreen.jsx'
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
  getLocalDateKey,
  getRoutineDayStatus,
  isRoutineActiveDay,
  loadProgress,
  loadRoutineSettings,
  markCompleteDayCelebration,
  recordCompletion,
  saveProgress,
  saveRoutineSettings,
  setActiveDay,
  setPauseDay,
} from '../utils/progressStorage.js'
import {
  loadRecommendationFeedback,
  recordRecommendationFeedback,
  summarizeRecommendationFeedback,
} from '../utils/recommendationFeedbackStorage.js'
import {
  canUseReplacement,
  loadReplacementUsage,
  recordReplacementUsage,
} from '../utils/replacementUsageStorage.js'

function ResultScreen({
  answers,
  initialActiveTab = 'today',
  isDark = false,
  onActiveTabChange = () => {},
  onChangeAnswers,
  onRestartOnboarding,
  onToggleTheme = () => {},
}) {
  const normalizedAnswers = useMemo(() => normalizeProfileAnswers(answers), [answers])
  const [activeTab, setActiveTab] = useState(initialActiveTab)
  const [upgradeReturnTab, setUpgradeReturnTab] = useState('settings')
  const [selectedWorkdayType, setSelectedWorkdayType] = useState(
    () => loadDailyContext()?.currentWorkdayType ?? normalizedAnswers.situation,
  )
  const activeWorkdayType = normalizeWorkdayType(selectedWorkdayType)
  const activeWorkPhase = deriveWorkPhaseFromWorkday(activeWorkdayType)
  const defaultWorkplace = normalizedAnswers.defaultWorkplace
  const [selectedWorkplace, setSelectedWorkplace] = useState(defaultWorkplace)
  const [workplaceWasChanged, setWorkplaceWasChanged] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())
  const [routineSettings, setRoutineSettings] = useState(() =>
    loadRoutineSettings(),
  )
  const [planDate, setPlanDate] = useState(() => new Date())
  const completedIds = useMemo(
    () => getCompletedIdsForDate(progress, planDate),
    [planDate, progress],
  )
  const [completedSectionSnapshots, setCompletedSectionSnapshots] = useState(
    () => loadCompletedSectionSnapshots(),
  )
  const [premiumStatus] = useState(() => loadPremiumStatus())
  const [replacementUsage, setReplacementUsage] = useState(() =>
    loadReplacementUsage(),
  )
  const [recommendationFeedback, setRecommendationFeedback] = useState(() =>
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
        currentDate: planDate,
      }),
    [activeWorkPhase, activeWorkdayType, activeWorkplace, normalizedAnswers, planDate],
  )
  const basePlanWithCompletedSections = useMemo(
    () =>
      preserveCompletedSectionsFromSnapshots(
        basePlan,
        completedIds,
        completedSectionSnapshots,
      ),
    [basePlan, completedIds, completedSectionSnapshots],
  )
  const planContextKey = createPlanContextKey({
    activeWorkPhase,
    activeWorkdayType,
    activeWorkplace,
    normalizedAnswers,
  })
  const plan =
    planOverride?.contextKey === planContextKey
      ? planOverride.plan
      : basePlanWithCompletedSections
  const currentReplacementMessage =
    replacementMessage?.contextKey === planContextKey ? replacementMessage.message : ''
  const canReplaceRecommendation = canUseReplacement({
    premiumStatus,
    usage: replacementUsage,
  })
  const progressSummary = useMemo(
    () => calculateProgressSummary(progress, planDate, routineSettings),
    [planDate, progress, routineSettings],
  )
  const planCompletedToday = useMemo(
    () => getPlanCompletedCount({ completedIds, plan }),
    [completedIds, plan],
  )
  const todayStatus = useMemo(
    () =>
      getRoutineDayStatus({
        date: planDate,
        progress,
        referenceDate: planDate,
        routineSettings,
        treatInactiveAsPause: true,
      }),
    [planDate, progress, routineSettings],
  )
  const displayProgressSummary = useMemo(
    () => ({
      ...progressSummary,
      completedToday: planCompletedToday,
      todayStatus: getStatusForCompletedCount(todayStatus, planCompletedToday),
    }),
    [planCompletedToday, progressSummary, todayStatus],
  )
  const todayIsPaused = todayStatus.id === 'pause'
  const feedbackSummary = useMemo(
    () => summarizeRecommendationFeedback(recommendationFeedback),
    [recommendationFeedback],
  )

  useEffect(() => {
    onActiveTabChange(activeTab)
  }, [activeTab, onActiveTabChange])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextDate = new Date()

      if (getLocalDateKey(nextDate) !== getLocalDateKey(planDate)) {
        setPlanDate(nextDate)
        setSelectedWorkdayType(
          loadDailyContext(nextDate)?.currentWorkdayType ??
            normalizedAnswers.situation,
        )
        setPlanOverride(null)
        setReplacementMessage(null)
      }
    }, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [normalizedAnswers.situation, planDate])

  useEffect(() => {
    recordVisiblePlanHistory(plan, planDate)
  }, [plan, planDate])

  function handleWorkplaceChange(workplace) {
    const nextWorkplace = normalizedAnswers.workplaces.includes(workplace)
      ? workplace
      : defaultWorkplace
    const nextPlan = generatePlan({
      ...normalizedAnswers,
      currentPhase: activeWorkPhase,
      currentWorkplace: nextWorkplace,
      currentWorkdayType: activeWorkdayType,
      currentDate: planDate,
    })
    const nextContextKey = createPlanContextKey({
      activeWorkPhase,
      activeWorkdayType,
      activeWorkplace: nextWorkplace,
      normalizedAnswers,
    })

    setSelectedWorkplace(workplace)
    setWorkplaceWasChanged(true)
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

  function handleWorkdayTypeChange(workdayType) {
    const nextWorkdayType = normalizeWorkdayType(workdayType)
    const nextWorkPhase = deriveWorkPhaseFromWorkday(nextWorkdayType)
    const nextPlan = generatePlan({
      ...normalizedAnswers,
      currentPhase: nextWorkPhase,
      currentWorkplace: activeWorkplace,
      currentWorkdayType: nextWorkdayType,
      currentDate: planDate,
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

  function handleProfileAnswersChange(nextAnswersOrUpdater) {
    const nextAnswers = normalizeProfileAnswers(
      typeof nextAnswersOrUpdater === 'function'
        ? nextAnswersOrUpdater(normalizedAnswers)
        : nextAnswersOrUpdater,
    )
    const selectedWorkplaceStillAvailable =
      nextAnswers.workplaces.includes(selectedWorkplace)
    const nextWorkplaceWasChanged =
      workplaceWasChanged && selectedWorkplaceStillAvailable
    const nextActiveWorkplace = nextWorkplaceWasChanged
      ? selectedWorkplace
      : nextAnswers.defaultWorkplace
    const nextPlan = generatePlan({
      ...nextAnswers,
      currentPhase: activeWorkPhase,
      currentWorkplace: nextActiveWorkplace,
      currentWorkdayType: activeWorkdayType,
      currentDate: planDate,
    })
    const nextContextKey = createPlanContextKey({
      activeWorkPhase,
      activeWorkdayType,
      activeWorkplace: nextActiveWorkplace,
      normalizedAnswers: nextAnswers,
    })

    if (!nextWorkplaceWasChanged) {
      setSelectedWorkplace(nextAnswers.defaultWorkplace)
      setWorkplaceWasChanged(false)
    }

    setReplacementMessage(null)

    if (completedIds.length) {
      setPlanOverride({
        contextKey: nextContextKey,
        plan: preserveCompletedSections(plan, nextPlan, completedIds),
      })
    } else {
      setPlanOverride(null)
    }

    onChangeAnswers(nextAnswers)
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
      currentDate: planDate,
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

    const completionDate = new Date()
    const completedSectionIndex = plan.dailySchedule.findIndex(
      (currentSection) => currentSection.id === section.id,
    )
    const nextCompletedSectionSnapshots = recordCompletedSectionSnapshot(
      completedSectionSnapshots,
      {
        index: completedSectionIndex,
        section,
      },
    )
    const nextProgress = recordCompletion(progress, exerciseId, completionDate)
    const nextSummary = calculateProgressSummary(
      nextProgress,
      completionDate,
      routineSettings,
    )
    const showCompleteDaySuccess = shouldShowCompleteDaySuccess({
      completedBefore: completedIds.length,
      date: completionDate,
      progress,
      totalToday: plan.dailySchedule.length,
    })
    const progressToSave = showCompleteDaySuccess
      ? markCompleteDayCelebration(nextProgress, completionDate)
      : nextProgress

    setCompletedSectionSnapshots(nextCompletedSectionSnapshots)
    saveCompletedSectionSnapshots(nextCompletedSectionSnapshots, completionDate)
    setProgress(progressToSave)
    saveProgress(progressToSave)
    setSuccessState({
      isCompleteDaySuccess: showCompleteDaySuccess,
      section,
      summary: nextSummary,
      title: section.title,
      totalToday: plan.dailySchedule.length,
    })
  }

  function handleRoutineSettingsChange(nextRoutineSettings) {
    setRoutineSettings(nextRoutineSettings)
    saveRoutineSettings(nextRoutineSettings)
  }

  function handlePauseDayChange(paused) {
    const today = new Date()
    const nextProgress = paused
      ? setPauseDay(progress, today, true)
      : isRoutineActiveDay(today, routineSettings)
        ? setPauseDay(progress, today, false)
        : setActiveDay(progress, today, true)

    setProgress(nextProgress)
    saveProgress(nextProgress)
  }

  function handleOpenUpgrade() {
    setUpgradeReturnTab(activeTab === 'upgrade' ? 'settings' : activeTab)
    setActiveTab('upgrade')
  }

  function handleCloseUpgrade() {
    setActiveTab(upgradeReturnTab)
  }

  function handleCompletionFeedback(feedback) {
    const section = successState?.section

    if (!section) {
      return
    }

    setRecommendationFeedback(
      recordRecommendationFeedback({
        ...createRecommendationFeedbackContext({
          activeWorkPhase,
          activeWorkdayType,
          activeWorkplace,
          fallbackIntensity: normalizedAnswers.fitnessLevel,
          section,
        }),
        feedback,
        action: 'completed',
      }),
    )
  }

  return (
    <section className="w-full max-w-6xl self-start pb-24">
      {activeTab === 'today' && (
        <TodayScreen
          completedIds={completedIds}
          feedbackUrl={FEEDBACK_URL}
          isPauseDay={todayIsPaused}
          onComplete={handleComplete}
          onPauseDayChange={handlePauseDayChange}
          plan={plan}
          progressSummary={displayProgressSummary}
          activeWorkplace={activeWorkplace}
          activeWorkdayType={activeWorkdayType}
          canReplaceRecommendation={canReplaceRecommendation}
          onOpenUpgrade={handleOpenUpgrade}
          onReplaceRecommendation={handleReplaceRecommendation}
          onWorkplaceChange={handleWorkplaceChange}
          onWorkdayTypeChange={handleWorkdayTypeChange}
          replacementMessage={currentReplacementMessage}
          workplaces={normalizedAnswers.workplaces}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressScreen
          feedbackSummary={feedbackSummary}
          summary={displayProgressSummary}
          totalToday={plan.dailySchedule.length}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsScreen
          answers={normalizedAnswers}
          feedbackUrl={FEEDBACK_URL}
          isDark={isDark}
          onChangeAnswers={handleProfileAnswersChange}
          onOpenUpgrade={handleOpenUpgrade}
          onRoutineSettingsChange={handleRoutineSettingsChange}
          onRestartOnboarding={onRestartOnboarding}
          onToggleTheme={onToggleTheme}
          routineSettings={routineSettings}
        />
      )}

      {activeTab === 'upgrade' && (
        <UpgradeScreen
          onBack={handleCloseUpgrade}
          premiumStatus={premiumStatus}
        />
      )}

      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />

      {successState && (
        <SuccessDialog
          feedbackUrl={FEEDBACK_URL}
          isCompleteDaySuccess={successState.isCompleteDaySuccess}
          onFeedback={handleCompletionFeedback}
          summary={successState.summary}
          title={successState.title}
          totalToday={successState.totalToday}
          onClose={() => setSuccessState(null)}
          onOpenProgress={() => {
            setSuccessState(null)
            setActiveTab('progress')
          }}
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

function getPlanCompletedCount({ completedIds, plan }) {
  const completedIdSet = new Set(completedIds)

  return plan.dailySchedule.filter((section) => completedIdSet.has(section.id))
    .length
}

function getStatusForCompletedCount(todayStatus, completedToday) {
  if (todayStatus.id === 'pause') {
    return {
      ...todayStatus,
      completedCount: completedToday,
    }
  }

  if (completedToday >= 5) {
    return { id: 'complete', completedCount: completedToday, label: 'Kompletter Tag' }
  }

  if (completedToday >= 3) {
    return { id: 'strong', completedCount: completedToday, label: 'Starker Tag' }
  }

  if (completedToday >= 1) {
    return { id: 'held', completedCount: completedToday, label: 'Routine gehalten' }
  }

  return {
    ...todayStatus,
    completedCount: completedToday,
    id: todayStatus.id === 'neutral' ? 'pause' : todayStatus.id,
    label: todayStatus.id === 'neutral' ? 'Pausentag' : todayStatus.label,
    neutral: todayStatus.id === 'neutral' ? true : todayStatus.neutral,
  }
}

export function SuccessDialog({
  feedbackUrl,
  isCompleteDaySuccess = false,
  onClose,
  onFeedback = () => {},
  onOpenProgress = () => {},
  summary,
  title,
  totalToday,
}) {
  const [feedbackState, setFeedbackState] = useState('')
  const completedToday = Math.min(summary.completedToday, totalToday)

  function submitFeedback(feedback) {
    setFeedbackState(feedback)
    onFeedback(feedback)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 px-4 py-5 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-2xl shadow-slate-950/20 dark:border-emerald-400/20 dark:bg-[#1b1b1b] sm:p-6"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-extrabold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
          ✓
        </span>
        <p
          id="success-title"
          className="mt-4 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white"
        >
          Sitzphase unterbrochen.
        </p>
        {!isCompleteDaySuccess && (
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            {title} ist erledigt.
          </p>
        )}
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
          Gut gemacht — du bleibst dran.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <ProgressStatCard label="Heute" value={`${completedToday}/${totalToday}`} />
          <ProgressStatCard
            label="Arbeitsstreak"
            value={String(Math.max(summary.streak, 0))}
          />
        </div>

        <section className="mt-5 rounded-lg bg-slate-50 p-3 text-left dark:bg-white/5">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            Hat diese Empfehlung gerade gepasst?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submitFeedback('fit')}
              className="min-h-9 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ja, hat gepasst
            </button>
            <button
              type="button"
              onClick={() => submitFeedback('not-fit')}
              className="min-h-9 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              Eher nicht
            </button>
          </div>
          {feedbackState === 'fit' && (
            <p className="mt-3 text-sm font-semibold leading-6 text-emerald-700 dark:text-emerald-200">
              Danke dir. Das hilft Move at work, Empfehlungen weiter zu
              verbessern.
            </p>
          )}
          {feedbackState === 'not-fit' && (
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              Danke für dein Feedback. Was hat nicht gepasst?
            </p>
          )}
          {feedbackUrl && (
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-bold text-teal-700 underline-offset-4 hover:underline dark:text-teal-200"
            >
              Mehr Feedback geben
            </a>
          )}
        </section>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Zurück zum Tagesplan
          </button>
          <button
            type="button"
            onClick={onOpenProgress}
            className="min-h-11 w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-700/40 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-white/10 dark:text-slate-200"
          >
            Routine ansehen
          </button>
        </div>
      </div>
    </div>
  )
}

function ProgressStatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  )
}

export default ResultScreen
