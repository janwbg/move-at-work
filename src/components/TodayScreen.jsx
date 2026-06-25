import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DailyScheduleCard from './DailyScheduleCard.jsx'
import ExerciseDetailView from './ExerciseDetailView.jsx'
import { ProgressRing } from './ProgressSummary.jsx'
import {
  applyReminderBannerAction,
  getReminderCopy,
} from './reminderBannerHelpers.js'
import { maybeShowDueReminderNotification } from './reminderNotificationHelpers.js'
import { getActiveScheduleIndex } from './todayScheduleHelpers.js'
import { workplaceOptions } from '../data/profileOptions.js'
import { getDueReminder } from '../utils/reminderScheduler.js'
import {
  loadDailyReminderState,
  loadReminderSettings,
  markExerciseCompleted,
  normalizeDailyReminderState,
  pauseRemindersForDay,
  resumeRemindersForDay,
  saveDailyReminderState,
} from '../utils/reminderStorage.js'

const todayWorkdayOptions = [
  { id: 'focus-heavy', label: 'Fokusarbeit' },
  { id: 'meeting-heavy', label: 'Meetings' },
  { id: 'mixed-day', label: 'Gemischt' },
  { id: 'study-day', label: 'Lernen' },
  { id: 'tight-schedule', label: 'Wenig Zeit' },
]

const weekdayLabels = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
]

const monthLabels = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

function TodayScreen({
  activeWorkdayType = 'mixed-day',
  activeWorkplace,
  canReplaceRecommendation = true,
  completedIds,
  currentDate,
  initialDetailIndex = null,
  initialReplacementLimitNoticeVisible = false,
  initialReminderSettings,
  initialReminderState,
  isPauseDay = false,
  onComplete,
  onPauseDayChange = () => {},
  onReplacementBlocked = () => {},
  onOpenUpgrade = () => {},
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
  const [openReplacementSlotId, setOpenReplacementSlotId] = useState(null)
  const [liveNow, setLiveNow] = useState(() => new Date())
  const now = currentDate ?? liveNow
  const [reminderSettings] = useState(
    () => initialReminderSettings ?? loadReminderSettings(),
  )
  const [reminderState, setReminderState] = useState(
    () => initialReminderState ?? loadDailyReminderState(now),
  )
  const currentReminderState = useMemo(
    () => normalizeDailyReminderState(reminderState, now),
    [now, reminderState],
  )
  const shownSystemNotificationKeysRef = useRef(new Set())
  const scheduleEntries = plan.dailySchedule.map((section, index) => ({
    index,
    section,
  }))
  const completedSections = plan.dailySchedule.filter((section) =>
    completedIds.includes(section.id),
  )
  const completedCount = completedSections.length
  const activeScheduleIndex = isPauseDay
    ? null
    : getActiveScheduleIndex({
        completedIds,
        now,
        sections: plan.dailySchedule,
      })
  const canSwitchWorkplace = workplaces?.length > 1
  const selectedDetailSection =
    selectedDetailIndex === null ? null : plan.dailySchedule[selectedDetailIndex]
  const dueReminder = getDueReminder({
    completedIds,
    now,
    plan,
    settings: reminderSettings,
    state: isPauseDay
      ? pauseRemindersForDay(currentReminderState, now)
      : currentReminderState,
  })
  const updateReminderState = useCallback((nextState) => {
    setReminderState(nextState)
    saveDailyReminderState(nextState, now)
  }, [now])
  const activeWorkplaceLabel = getWorkplaceLabel(activeWorkplace)

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
      state: isPauseDay
        ? pauseRemindersForDay(currentReminderState, now)
        : currentReminderState,
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
    currentReminderState,
    isPauseDay,
    updateReminderState,
  ])

  function completeFromDetail(section) {
    setOpenReplacementSlotId(null)
    setSelectedDetailIndex(null)
    updateReminderState(markExerciseCompleted(currentReminderState, now))
    onComplete(section)
  }

  function completeFromSchedule(section) {
    setOpenReplacementSlotId(null)
    updateReminderState(markExerciseCompleted(currentReminderState, now))
    onComplete(section)
  }

  function handleReplacementBlocked() {
    setOpenReplacementSlotId(null)
    setReplacementLimitNoticeVisible(true)
    onReplacementBlocked()
  }

  function replaceRecommendation(index, reason) {
    setOpenReplacementSlotId(null)
    setReplacementLimitNoticeVisible(false)
    onReplaceRecommendation(index, reason)
  }

  function toggleReplacementMenu(sectionId) {
    setOpenReplacementSlotId((currentId) =>
      currentId === sectionId ? null : sectionId,
    )
  }

  function openScheduleDetail(index) {
    setOpenReplacementSlotId(null)
    setSelectedDetailIndex(index)
  }

  function handleWorkplaceChange(workplace) {
    setOpenReplacementSlotId(null)
    onWorkplaceChange?.(workplace)
  }

  function handleWorkdayTypeChange(workdayType) {
    setOpenReplacementSlotId(null)
    onWorkdayTypeChange(workdayType)
  }

  function handleReminderAction(action) {
    const result = applyReminderBannerAction({
      action,
      now,
      reminder: dueReminder,
      settings: reminderSettings,
      state: currentReminderState,
    })

    if (!result) {
      return
    }

    updateReminderState(result.state)

    if (typeof result.detailIndex === 'number') {
      setOpenReplacementSlotId(null)
      setSelectedDetailIndex(result.detailIndex)
    }
  }

  function handlePauseDayToggle() {
    const nextPauseState = !isPauseDay

    setOpenReplacementSlotId(null)
    updateReminderState(
      nextPauseState
        ? pauseRemindersForDay(currentReminderState, now)
        : resumeRemindersForDay(currentReminderState, now),
    )
    onPauseDayChange(nextPauseState)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            aria-pressed={isPauseDay}
            onClick={handlePauseDayToggle}
            className="group rounded-lg text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563eb]"
          >
            <p className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              {formatTodayDate(now)}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
              <span>{isPauseDay ? 'Pausentag' : 'Move-at-work-Tag'}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                ·
              </span>
              <span className="font-bold text-[#1d4ed8] group-hover:text-[#2563eb] dark:text-blue-200">
                {isPauseDay ? 'Heute aktivieren' : 'Heute pausieren'}
              </span>
            </p>
          </button>

          <div className="flex items-center gap-4 sm:justify-end">
            <ProgressRing
              compact
              completedToday={completedCount}
              totalToday={plan.dailySchedule.length}
            />
            <CompactStreak streak={progressSummary?.streak ?? 0} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
              Dein individueller Tagesplan
            </h2>
          </div>

          <div className="grid gap-3 border-y border-slate-200 py-3 dark:border-white/10 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                Du arbeitest heute im {activeWorkplaceLabel}
              </p>
              {canSwitchWorkplace && (
                <WorkplaceSwitcher
                  activeWorkplace={activeWorkplace}
                  onWorkplaceChange={handleWorkplaceChange}
                  workplaces={workplaces}
                />
              )}
            </div>
            <WorkdayTypeSelect
              activeWorkdayType={activeWorkdayType}
              onWorkdayTypeChange={handleWorkdayTypeChange}
            />
          </div>
        </div>

        {replacementMessage && (
          <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-200">
            {replacementMessage}
          </p>
        )}

        {replacementLimitNoticeVisible && (
          <ReplacementLimitNotice onOpenUpgrade={onOpenUpgrade} />
        )}

        <div className="space-y-3">
          {dueReminder && (
            <ReminderBanner
              activeWorkdayType={activeWorkdayType}
              activeWorkplace={activeWorkplace}
              onAction={handleReminderAction}
              reminder={dueReminder}
            />
          )}

          {isPauseDay && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Heute ist Pausentag.
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                Du kannst den Tag aktivieren, wenn du trotzdem Bewegungsimpulse machen möchtest.
              </p>
              <button
                type="button"
                onClick={handlePauseDayToggle}
                className="mt-3 min-h-10 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                Heute aktivieren
              </button>
            </div>
          )}

          {!isPauseDay && activeScheduleIndex === null && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                Alles erledigt für heute.
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800 dark:text-emerald-100">
                Dein Tagesplan ist abgeschlossen. Deine Routine bleibt sauber
                dokumentiert.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            {scheduleEntries.map(({ index, section }) => {
              const completed = completedIds.includes(section.id)
              const active = !completed && index === activeScheduleIndex

              return (
                <DailyScheduleCard
                  actionLabel="Öffnen"
                  canReplace={canReplaceRecommendation}
                  compact={!active || completed}
                  completed={completed}
                  featured={active}
                  isReplacementOpen={openReplacementSlotId === section.id}
                  key={section.id}
                  onCloseReplacement={() => setOpenReplacementSlotId(null)}
                  onComplete={() => completeFromSchedule(section)}
                  onOpenDetails={() => openScheduleDetail(index)}
                  onReplace={(reason) => replaceRecommendation(index, reason)}
                  onReplaceBlocked={handleReplacementBlocked}
                  onToggleReplacement={() => toggleReplacementMenu(section.id)}
                  paused={isPauseDay}
                  section={section}
                />
              )
            })}
          </div>
        </div>
      </section>

      {selectedDetailSection && (
        <ExerciseDetailView
          canReplace={canReplaceRecommendation}
          completed={completedIds.includes(selectedDetailSection.id)}
          key={selectedDetailSection.id}
          onBack={() => {
            setOpenReplacementSlotId(null)
            setSelectedDetailIndex(null)
          }}
          onComplete={() => completeFromDetail(selectedDetailSection)}
          onReplace={(reason) => replaceRecommendation(selectedDetailIndex, reason)}
          onReplaceBlocked={handleReplacementBlocked}
          replacementLimitNotice={
            replacementLimitNoticeVisible ? (
              <ReplacementLimitNotice onOpenUpgrade={onOpenUpgrade} />
            ) : null
          }
          section={selectedDetailSection}
        />
      )}
    </div>
  )
}

function CompactStreak({ streak }) {
  const safeStreak = Math.max(streak, 0)

  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center dark:bg-white/5">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Streak
      </p>
      <p className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
        🚀 {safeStreak}
      </p>
    </div>
  )
}

function formatTodayDate(date) {
  return `${weekdayLabels[date.getDay()]}, ${date.getDate()}. ${
    monthLabels[date.getMonth()]
  }`
}

function getWorkplaceLabel(workplaceId) {
  return workplaceOptions.find((workplace) => workplace.id === workplaceId)?.label ?? 'Büro'
}

function ReplacementLimitNotice({ onOpenUpgrade }) {
  return (
    <aside className="mb-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 dark:bg-[#2563eb]/10">
      <p className="text-sm font-extrabold text-slate-950 dark:text-white">
        Heute schon gewechselt
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-200">
        In Free ist 1 Wechsel pro Tag enthalten. Mit Move at work Plus kannst du Empfehlungen unbegrenzt austauschen.
      </p>
      <button
        type="button"
        onClick={onOpenUpgrade}
        className="mt-3 min-h-10 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1d4ed8] shadow-sm transition hover:bg-blue-50 dark:bg-white/10 dark:text-blue-100 dark:hover:bg-white/15"
      >
        Plus ansehen
      </button>
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
    <aside className="rounded-lg border border-[#2563eb]/15 bg-[#2563eb]/5 p-3 dark:bg-[#2563eb]/10">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-950 dark:text-white">
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
        <p className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1d4ed8] dark:bg-white/10 dark:text-blue-100">
          {reminder.slotLabel}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
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
      className={`min-h-9 rounded-full px-3 py-2 text-sm font-bold transition ${
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

function WorkdayTypeSelect({ activeWorkdayType, onWorkdayTypeChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
      Art des heutigen Arbeitstags
      <select
        aria-label="Art des heutigen Arbeitstags auswählen"
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm transition focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 dark:border-white/10 dark:bg-[#1f1f1f] dark:text-white"
        onChange={(event) => onWorkdayTypeChange(event.target.value)}
        value={activeWorkdayType}
      >
        {todayWorkdayOptions.map((workdayType) => (
          <option key={workdayType.id} value={workdayType.id}>
            {workdayType.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function WorkplaceSwitcher({ activeWorkplace, onWorkplaceChange, workplaces }) {
  return (
    <div
      aria-label="Arbeitsort heute auswählen"
      className="flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5"
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
              className={`min-h-8 px-3 py-1.5 text-sm font-bold transition ${
                isActive
                  ? 'rounded-md bg-[#2563eb] text-white shadow-sm shadow-[#2563eb]/15'
                  : 'text-slate-600 hover:text-[#2563eb] dark:text-slate-300'
              }`}
            >
              {workplace.label}
            </button>
          )
        })}
    </div>
  )
}

export default TodayScreen
