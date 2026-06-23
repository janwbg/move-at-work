import { useCallback, useEffect, useRef, useState } from 'react'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import ExerciseDetailView from './ExerciseDetailView.jsx'
import { ProgressRing } from './ProgressSummary.jsx'
import {
  applyReminderBannerAction,
  getReminderCopy,
} from './reminderBannerHelpers.js'
import { maybeShowDueReminderNotification } from './reminderNotificationHelpers.js'
import { FEEDBACK_URL } from '../data/feedback.js'
import { workplaceOptions } from '../data/profileOptions.js'
import { getDueReminder } from '../utils/reminderScheduler.js'
import {
  loadDailyReminderState,
  loadReminderSettings,
  saveDailyReminderState,
} from '../utils/reminderStorage.js'

const todayWorkdayOptions = [
  { id: 'focus-heavy', label: 'Fokusarbeit' },
  { id: 'meeting-heavy', label: 'Meetings' },
  { id: 'mixed-day', label: 'Gemischt' },
  { id: 'study-day', label: 'Lernen' },
  { id: 'tight-schedule', label: 'Wenig Zeit' },
]

function TodayScreen({
  activeWorkdayType = 'mixed-day',
  activeWorkplace,
  canReplaceRecommendation = true,
  completedIds,
  currentDate,
  feedbackUrl = FEEDBACK_URL,
  initialDetailIndex = null,
  initialReplacementLimitNoticeVisible = false,
  initialReminderSettings,
  initialReminderState,
  onComplete,
  onReplacementBlocked = () => {},
  onReplaceRecommendation = () => {},
  onWorkplaceChange,
  onWorkdayTypeChange = () => {},
  plan,
  progressSummary,
  replacementMessage = '',
  workplaces,
}) {
  const [selectedDetailIndex, setSelectedDetailIndex] = useState(initialDetailIndex)
  const [
    replacementLimitNoticeVisible,
    setReplacementLimitNoticeVisible,
  ] = useState(initialReplacementLimitNoticeVisible)
  const [liveNow, setLiveNow] = useState(() => new Date())
  const now = currentDate ?? liveNow
  const [reminderSettings] = useState(
    () => initialReminderSettings ?? loadReminderSettings(),
  )
  const [reminderState, setReminderState] = useState(
    () => initialReminderState ?? loadDailyReminderState(now),
  )
  const shownSystemNotificationKeysRef = useRef(new Set())
  const openSections = plan.dailySchedule.filter(
    (section) => !completedIds.includes(section.id),
  )
  const completedSections = plan.dailySchedule.filter((section) =>
    completedIds.includes(section.id),
  )
  const openCount = openSections.length
  const completedCount = completedSections.length
  const canSwitchWorkplace = workplaces?.length > 1
  const selectedDetailSection =
    selectedDetailIndex === null ? null : plan.dailySchedule[selectedDetailIndex]
  const dueReminder = getDueReminder({
    completedIds,
    now,
    plan,
    settings: reminderSettings,
    state: reminderState,
  })
  const updateReminderState = useCallback((nextState) => {
    setReminderState(nextState)
    saveDailyReminderState(nextState, now)
  }, [now])

  useEffect(() => {
    if (currentDate) {
      return undefined
    }

    const interval = window.setInterval(() => setLiveNow(new Date()), 60 * 1000)

    return () => window.clearInterval(interval)
  }, [currentDate])

  useEffect(() => {
    const notificationKey = dueReminder
      ? `${now.toDateString()}:${dueReminder.slotId}`
      : ''

    if (
      notificationKey &&
      shownSystemNotificationKeysRef.current.has(notificationKey)
    ) {
      return undefined
    }

    const nextReminderState = maybeShowDueReminderNotification({
      activeWorkdayType,
      documentRef: typeof document === 'undefined' ? undefined : document,
      dueReminder,
      now,
      settings: reminderSettings,
      state: reminderState,
    })

    if (nextReminderState) {
      shownSystemNotificationKeysRef.current.add(notificationKey)
      const timeout = window.setTimeout(() => {
        updateReminderState(nextReminderState)
      }, 0)

      return () => window.clearTimeout(timeout)
    }

    return undefined
  }, [
    activeWorkdayType,
    dueReminder,
    now,
    reminderSettings,
    reminderState,
    updateReminderState,
  ])

  function completeFromDetail(section) {
    setSelectedDetailIndex(null)
    onComplete(section)
  }

  function handleReplacementBlocked() {
    setReplacementLimitNoticeVisible(true)
    onReplacementBlocked()
  }

  function replaceRecommendation(index, reason) {
    setReplacementLimitNoticeVisible(false)
    onReplaceRecommendation(index, reason)
  }

  function handleReminderAction(action) {
    const result = applyReminderBannerAction({
      action,
      now,
      reminder: dueReminder,
      settings: reminderSettings,
      state: reminderState,
    })

    if (!result) {
      return
    }

    updateReminderState(result.state)

    if (typeof result.detailIndex === 'number') {
      setSelectedDetailIndex(result.detailIndex)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl shadow-[#2563eb]/20 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-100">
          Heute
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
          Dein Tagesplan für mehr Bewegung.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-blue-50">
          {openCount === 0
            ? 'Alles erledigt für heute. Stark gemacht.'
            : 'Kleine Bewegungsimpulse helfen dir, lange Sitzphasen bewusster zu unterbrechen.'}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <TodayProgressCard
          completedToday={completedCount}
          totalToday={plan.dailySchedule.length}
        />
        <StreakCard streak={progressSummary?.streak ?? 0} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
              Tagesplan
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              Deine Empfehlungen
            </h2>
            {canSwitchWorkplace && (
              <WorkplaceSwitcher
                activeWorkplace={activeWorkplace}
                onWorkplaceChange={onWorkplaceChange}
                workplaces={workplaces}
              />
            )}
            <WorkdayTypeSwitcher
              activeWorkdayType={activeWorkdayType}
              onWorkdayTypeChange={onWorkdayTypeChange}
            />
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {openCount} offen · {completedSections.length} erledigt
          </p>
        </div>

        {replacementMessage && (
          <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-200">
            {replacementMessage}
          </p>
        )}

        {replacementLimitNoticeVisible && <ReplacementLimitNotice />}

        {dueReminder && (
          <ReminderBanner
            activeWorkdayType={activeWorkdayType}
            activeWorkplace={activeWorkplace}
            onAction={handleReminderAction}
            reminder={dueReminder}
          />
        )}

        <div className="grid gap-4">
          {plan.dailySchedule.map((section, index) => (
            <DailyScheduleCard
              canReplace={canReplaceRecommendation}
              completed={completedIds.includes(section.id)}
              key={section.id}
              onComplete={() => onComplete(section)}
              onOpenDetails={() => setSelectedDetailIndex(index)}
              onReplace={(reason) => replaceRecommendation(index, reason)}
              onReplaceBlocked={handleReplacementBlocked}
              section={section}
              stepNumber={index + 1}
            />
          ))}
        </div>
      </section>

      <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 sm:p-5">
        Hinweis: Move at work ersetzt keine medizinische Beratung. Führe
        Bewegungen nur aus, wenn sie sich für dich sicher und angenehm anfühlen.
        Bei Schmerzen, Verletzungen oder gesundheitlichen Einschränkungen brich
        die Übung ab oder frage medizinisches Fachpersonal.
      </p>

      <section className="rounded-2xl border border-dashed border-[#2563eb]/30 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10 sm:p-5">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Du testest gerade eine frühe Version von Move at work. Dein Feedback
          hilft dabei, die Empfehlungen verständlicher, passender und
          alltagstauglicher zu machen.
        </p>
        <a
          href={feedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/15 transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
        >
          Feedback geben
        </a>
      </section>

      {selectedDetailSection && (
        <ExerciseDetailView
          canReplace={canReplaceRecommendation}
          completed={completedIds.includes(selectedDetailSection.id)}
          key={selectedDetailSection.id}
          onBack={() => setSelectedDetailIndex(null)}
          onComplete={() => completeFromDetail(selectedDetailSection)}
          onReplace={(reason) => replaceRecommendation(selectedDetailIndex, reason)}
          onReplaceBlocked={handleReplacementBlocked}
          replacementLimitNotice={
            replacementLimitNoticeVisible ? <ReplacementLimitNotice /> : null
          }
          section={selectedDetailSection}
        />
      )}
    </div>
  )
}

function ReplacementLimitNotice() {
  return (
    <aside className="mb-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10">
      <p className="text-sm font-extrabold text-slate-950 dark:text-white">
        Heute schon gewechselt
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-200">
        In Free ist 1 Wechsel pro Tag enthalten. Mit Move at work Plus kannst du Empfehlungen unbegrenzt austauschen.
      </p>
      <p className="mt-3 w-fit rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1d4ed8] dark:bg-white/10 dark:text-blue-100">
        Plus wird vorbereitet
      </p>
    </aside>
  )
}

function ReminderBanner({
  activeWorkdayType,
  activeWorkplace,
  onAction,
  reminder,
}) {
  const copy = getReminderCopy({
    activeWorkdayType,
    activeWorkplace,
    reminder,
  })

  return (
    <aside className="mb-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 p-4 dark:bg-[#2563eb]/15">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-base font-extrabold text-slate-950 dark:text-white">
            {copy.title}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-200">
            {copy.text}
          </p>
          {copy.contextHint && (
            <p className="mt-1 text-sm font-semibold text-[#1d4ed8] dark:text-blue-100">
              {copy.contextHint}
            </p>
          )}
        </div>
        <p className="w-fit rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1d4ed8] dark:bg-white/10 dark:text-blue-100">
          {reminder.slotLabel}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ReminderActionButton
          primary
          onClick={() => onAction('open')}
        >
          Übung öffnen
        </ReminderActionButton>
        <ReminderActionButton onClick={() => onAction('snooze-15')}>
          15 Min. später
        </ReminderActionButton>
        <ReminderActionButton onClick={() => onAction('snooze-30')}>
          30 Min. später
        </ReminderActionButton>
        <ReminderActionButton onClick={() => onAction('later-today')}>
          Heute später
        </ReminderActionButton>
        <ReminderActionButton onClick={() => onAction('skip-today')}>
          Heute nicht mehr
        </ReminderActionButton>
      </div>
    </aside>
  )
}

function ReminderActionButton({ children, onClick, primary = false }) {
  return (
    <button
      className={`min-h-10 rounded-full px-4 py-2 text-sm font-bold transition ${
        primary
          ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/15 hover:bg-[#1d4ed8]'
          : 'bg-white text-slate-700 hover:text-[#2563eb] dark:bg-white/10 dark:text-slate-200'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function WorkdayTypeSwitcher({ activeWorkdayType, onWorkdayTypeChange }) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Heute eher
      </p>
      <div
        aria-label="Arbeits- oder Lerntag heute auswählen"
        className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
        role="group"
      >
        {todayWorkdayOptions.map((workdayType) => {
          const isActive = activeWorkdayType === workdayType.id

          return (
            <button
              key={workdayType.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onWorkdayTypeChange(workdayType.id)}
              className={`min-h-9 shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
              }`}
            >
              {workdayType.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WorkplaceSwitcher({ activeWorkplace, onWorkplaceChange, workplaces }) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Arbeitsort heute
      </p>
      <div
        aria-label="Arbeitsort heute auswählen"
        className="flex flex-wrap gap-2"
        role="group"
      >
        {workplaceOptions
          .filter((workplace) => workplaces.includes(workplace.id))
          .map((workplace) => {
            const isActive = activeWorkplace === workplace.id

            return (
              <button
                key={workplace.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onWorkplaceChange(workplace.id)}
                className={`min-h-9 rounded-full px-3 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                }`}
              >
                {workplace.label}
              </button>
            )
          })}
      </div>
    </div>
  )
}

function TodayProgressCard({ completedToday, totalToday }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-4">
        <ProgressRing
          compact
          completedToday={completedToday}
          totalToday={totalToday}
        />
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-[#2563eb]">
            Heute erledigt
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            {completedToday} von {totalToday}
          </p>
        </div>
      </div>
    </article>
  )
}

function StreakCard({ streak }) {
  const safeStreak = Math.max(streak, 0)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-xl"
        >
          🚀
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Arbeitsstreak
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
            {safeStreak} {safeStreak === 1 ? 'Arbeitstag' : 'Arbeitstage'}
          </p>
        </div>
      </div>
    </article>
  )
}

export default TodayScreen
