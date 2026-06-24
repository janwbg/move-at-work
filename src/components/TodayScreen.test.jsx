// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TodayScreen from './TodayScreen.jsx'
import { getActiveScheduleIndex } from './todayScheduleHelpers.js'
import {
  applyReminderBannerAction,
  getReminderCopy,
} from './reminderBannerHelpers.js'
import { maybeShowDueReminderNotification } from './reminderNotificationHelpers.js'
import { getDueReminder } from '../utils/reminderScheduler.js'
import { createDailyReminderState } from '../utils/reminderStorage.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const baseSections = [
  {
    description: 'Kurz aufstehen und Schultern bewegen.',
    duration: '2 Minuten',
    id: 'morning-reset',
    instructionSteps: ['Aufrecht sitzen.', 'Schultern kreisen.'],
    intensity: 'Leicht',
    movementType: 'mobilize',
    reason: 'Passt gerade zu Fokusarbeit.',
    setup: 'Kein besonderes Equipment',
    slotId: 'morning',
    slotLabel: 'Vormittag',
    slotWindowMeta: {
      startTime: '09:30',
      endTime: '10:30',
    },
    timeLabel: 'Vormittag',
    title: 'Schulter-Reset',
  },
  {
    description: 'Ruhig atmen.',
    duration: '2 Minuten',
    id: 'breathing-reset',
    instructionSteps: ['Einatmen.', 'Ausatmen.'],
    intensity: 'Leicht',
    movementType: 'breathing',
    reason: 'Ruhiger Fokusimpuls.',
    setup: 'Kein besonderes Equipment',
    slotId: 'afternoon',
    slotLabel: 'Nachmittag',
    slotWindowMeta: {
      startTime: '14:00',
      endTime: '15:15',
    },
    timeLabel: 'Nachmittag',
    title: 'Atem-Reset',
  },
]

const plan = {
  dailySchedule: baseSections,
  movements: [
    {
      id: 'extra-movement',
      title: 'Zusätzlicher Impuls',
    },
  ],
  rhythm: 'Kurze, ruhige Microbreaks.',
  summary: 'Ein ruhiger Tagesplan.',
}

function createPlan(total) {
  return {
    ...plan,
    dailySchedule: Array.from({ length: total }, (_, index) => ({
      ...baseSections[index % baseSections.length],
      id: `section-${index + 1}`,
      title: `Empfehlung ${index + 1}`,
    })),
  }
}

function createTimedPlan() {
  return {
    ...plan,
    dailySchedule: createTimedSections(),
  }
}

function createTimedSections() {
  return [
    createTimedSection({
      id: 'start-reset',
      movementType: 'mini_reset',
      reason: 'Startgrund',
      slotId: 'start',
      slotLabel: 'Start in den Arbeitstag',
      startTime: '08:00',
      title: 'Start-Reset',
    }),
    createTimedSection({
      id: 'morning-reset',
      movementType: 'mobilize',
      reason: 'Vormittagsgrund',
      slotId: 'morning',
      slotLabel: 'Vormittag',
      startTime: '09:30',
      title: 'Vormittag-Reset',
    }),
    createTimedSection({
      id: 'lunch-reset',
      movementType: 'stand',
      reason: 'Mittagsgrund',
      slotId: 'lunch_transition',
      slotLabel: 'Mittagswechsel',
      startTime: '12:00',
      title: 'Mittags-Reset',
    }),
    createTimedSection({
      id: 'afternoon-reset',
      movementType: 'sit_reset',
      reason: 'Nachmittagsgrund',
      slotId: 'afternoon',
      slotLabel: 'Nachmittag',
      startTime: '14:00',
      title: 'Nachmittag-Reset',
    }),
    createTimedSection({
      id: 'wrap-up-reset',
      movementType: 'breathing',
      reason: 'Abschlussgrund',
      slotId: 'wrap_up',
      slotLabel: 'Tagesabschluss',
      startTime: '16:15',
      title: 'Abschluss-Reset',
    }),
  ]
}

function createTimedSection({
  id,
  movementType,
  reason,
  slotId,
  slotLabel,
  startTime,
  title,
}) {
  return {
    description: `${title} Beschreibung.`,
    duration: '2 Minuten',
    id,
    instructionSteps: ['Ruhig starten.'],
    intensity: 'Leicht',
    movementType,
    reason,
    setup: 'Kein besonderes Equipment',
    slotId,
    slotLabel,
    slotWindowMeta: {
      startTime,
      endTime: '17:00',
    },
    timeLabel: slotLabel,
    title,
  }
}

function renderTodayScreen(props = {}) {
  return renderToStaticMarkup(
    <TodayScreen
      activeWorkplace="office"
      completedIds={[]}
      currentDate={new Date(2026, 5, 24, 9, 30)}
      feedbackUrl="https://example.com"
      onComplete={() => {}}
      onReplaceRecommendation={() => {}}
      onWorkplaceChange={() => {}}
      onWorkdayTypeChange={() => {}}
      plan={plan}
      progressSummary={{ completedToday: 0, completedThisWeek: 0, streak: 0 }}
      workplaces={['office']}
      {...props}
    />,
  )
}

describe('TodayScreen', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows weekday, date and active day status in the compact header', () => {
    const html = renderTodayScreen()

    expect(html).toContain('Mittwoch, 24. Juni')
    expect(html).toContain('Move-at-work-Tag')
    expect(html).toContain('Heute pausieren')
  })

  it('shows pause day status and hides due reminders', () => {
    const html = renderTodayScreen(
      withDueReminder({
        isPauseDay: true,
      }),
    )

    expect(html).toContain('Mittwoch, 17. Juni')
    expect(html).toContain('Pausentag')
    expect(html).toContain('Heute aktivieren')
    expect(html).not.toContain('Kleiner Wechselmoment?')
  })

  it.each([
    [[], '0/5'],
    [['section-1', 'section-2'], '2/5'],
    [
      ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'],
      '5/5',
    ],
  ])('shows compact header progress for %s', (completedIds, ringText) => {
    const html = renderTodayScreen({
      completedIds,
      plan: createPlan(5),
      progressSummary: {
        completedToday: completedIds.length,
        completedThisWeek: completedIds.length,
        streak: completedIds.length ? 1 : 0,
      },
    })

    expect(html).toContain('<svg')
    expect(html).toContain(ringText)
    expect(html).not.toContain('Heute erledigt')
    expect(html).not.toContain('Arbeitsstreak')
  })

  it('shows the compact rocket streak safely', () => {
    const html = renderTodayScreen({
      progressSummary: { completedToday: 0, completedThisWeek: 0, streak: 3 },
    })
    const emptyHtml = renderTodayScreen({
      progressSummary: undefined,
    })

    expect(html).toContain('🚀 3')
    expect(emptyHtml).toContain('🚀 0')
  })

  it('removes the old hero, medical notice and feedback box from Today', () => {
    const html = renderTodayScreen({
      feedbackUrl: 'https://example.com/feedback',
    })

    expect(html).not.toContain('Dein Tagesplan für mehr Bewegung.')
    expect(html).not.toContain(
      'Hinweis: Move at work ersetzt keine medizinische Beratung.',
    )
    expect(html).not.toContain('medizinisches Fachpersonal')
    expect(html).not.toContain('Du testest gerade eine frühe Version')
    expect(html).not.toContain('Feedback geben')
    expect(html).not.toContain('href="https://example.com/feedback"')
  })

  it('keeps the daily schedule focused on the individual plan', () => {
    const html = renderTodayScreen()

    expect(html).toContain('Dein individueller Tagesplan')
    expect(html).toContain('Du arbeitest heute im Büro')
    expect(html).toContain('Art des heutigen Arbeitstags')
    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('Atem-Reset')
  })

  it('uses slot labels instead of prominent number circles for orientation', () => {
    const html = renderTodayScreen({
      plan: createTimedPlan(),
    })

    expect(html).toContain('Start in den Arbeitstag')
    expect(html).toContain('Vormittag')
    expect(html).toContain('Mittagswechsel')
    expect(html).toContain('Nachmittag')
    expect(html).toContain('Tagesabschluss')
    expect(html).not.toContain('>1</span>')
    expect(html).not.toContain('>2</span>')
    expect(html).not.toContain('>3</span>')
    expect(html).not.toContain('>4</span>')
    expect(html).not.toContain('>5</span>')
  })

  it('highlights the latest open slot whose start time has been reached', () => {
    expect(
      getActiveScheduleIndex({
        completedIds: [],
        now: new Date(2026, 5, 24, 12, 15),
        sections: createTimedSections(),
      }),
    ).toBe(2)
  })

  it('highlights the day wrap-up when the late window has been reached', () => {
    expect(
      getActiveScheduleIndex({
        completedIds: [],
        now: new Date(2026, 5, 24, 17, 30),
        sections: createTimedSections(),
      }),
    ).toBe(4)
  })

  it('highlights the next coming open slot when none is due yet', () => {
    expect(
      getActiveScheduleIndex({
        completedIds: ['start-reset'],
        now: new Date(2026, 5, 24, 8, 50),
        sections: createTimedSections(),
      }),
    ).toBe(1)
  })

  it('keeps earlier open slots visible but highlights the later due slot', () => {
    const html = renderTodayScreen({
      currentDate: new Date(2026, 5, 24, 12, 15),
      plan: createTimedPlan(),
    })

    expect(html).toContain('Start-Reset')
    expect(html).toContain('Vormittag-Reset')
    expect(html.indexOf('Mittagswechsel')).toBeLessThan(
      html.indexOf('Jetzt passend'),
    )
    expect(html.indexOf('Jetzt passend')).toBeLessThan(
      html.indexOf('Mittags-Reset'),
    )
    expect(html).not.toContain('Startgrund')
    expect(html).not.toContain('Vormittagsgrund')
    expect(html).toContain('Mittagsgrund')
  })

  it('skips completed slots when calculating the active exercise', () => {
    expect(
      getActiveScheduleIndex({
        completedIds: ['start-reset', 'morning-reset', 'lunch-reset'],
        now: new Date(2026, 5, 24, 13, 0),
        sections: createTimedSections(),
      }),
    ).toBe(3)
  })

  it('does not render additional matching exercises outside the daily schedule', () => {
    const html = renderTodayScreen({
      plan: createPlan(5),
    })

    expect(html).not.toContain('Weitere passende')
    expect(html).not.toContain('Zusätzlicher Impuls')
    expect(countOccurrences(html, 'Öffnen')).toBe(4)
    expect(countOccurrences(html, 'Übung starten')).toBe(1)
  })

  it('keeps five recommendations visible for Free users', () => {
    const html = renderTodayScreen({
      canReplaceRecommendation: false,
      plan: createPlan(5),
    })

    expect(html).toContain('0/5')
    expect(countOccurrences(html, 'Öffnen')).toBe(4)
    expect(countOccurrences(html, 'Übung starten')).toBe(1)
  })

  it('shows the prepared Plus hint after a blocked Free replacement attempt', () => {
    const html = renderTodayScreen({
      canReplaceRecommendation: false,
      initialReplacementLimitNoticeVisible: true,
      plan: createPlan(5),
    })

    expect(html).toContain('Heute schon gewechselt')
    expect(html).toContain(
      'In Free ist 1 Wechsel pro Tag enthalten. Mit Move at work Plus kannst du Empfehlungen unbegrenzt austauschen.',
    )
    expect(html).toContain('Plus ansehen')
    expect(html).not.toContain('Warum möchtest du diese Empfehlung wechseln?')
  })

  it('renders one chronological list and highlights the active exercise inside it', () => {
    const html = renderTodayScreen()

    expect(html).not.toContain('Als Nächstes')
    expect(html).not.toContain('Später heute')
    expect(html).toContain('Jetzt passend')
    expect(html).toContain('Übung starten')
    expect(html.indexOf('Schulter-Reset')).toBeLessThan(html.indexOf('Atem-Reset'))
  })

  it('shows later open exercises as compact rows without long reasons', () => {
    const html = renderTodayScreen()

    expect(html).toContain('Atem-Reset')
    expect(html).toContain('2 Minuten · Atmen')
    expect(html).toContain('Öffnen')
    expect(html).not.toContain('Ruhiger Fokusimpuls.')
  })

  it('shows completed recommendations quietly while open cards remain usable', () => {
    const html = renderTodayScreen({
      completedIds: ['morning-reset'],
      progressSummary: { completedToday: 1, completedThisWeek: 1, streak: 1 },
    })

    expect(html).toContain('aria-label="Erledigte Übung öffnen: Schulter-Reset"')
    expect(html).toContain('Erledigt')
    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('Atem-Reset')
    expect(html).not.toContain('>Übung öffnen<')
    expect(html).not.toContain('Als erledigt markieren')
    expect(html).not.toContain('Offen')
  })

  it('shows the completed-day variant when no exercise is open', () => {
    const html = renderTodayScreen({
      completedIds: ['morning-reset', 'breathing-reset'],
      progressSummary: { completedToday: 2, completedThisWeek: 2, streak: 1 },
    })

    expect(html).toContain('Alles erledigt für heute.')
    expect(html).not.toContain('offen ·')
  })

  it('shows the workplace switch inside the daily schedule context', () => {
    const html = renderTodayScreen({
      workplaces: ['office', 'homeoffice'],
    })

    expect(html).toContain('aria-label="Arbeitsort heute auswählen"')
    expect(html).toContain('Büro</button>')
    expect(html).toContain('Homeoffice</button>')
    expect(html.indexOf('Dein individueller Tagesplan')).toBeLessThan(
      html.indexOf('Arbeitsort heute auswählen'),
    )
  })

  it('marks the active workplace semantically', () => {
    const officeHtml = renderTodayScreen({
      activeWorkplace: 'office',
      workplaces: ['office', 'homeoffice'],
    })
    const homeofficeHtml = renderTodayScreen({
      activeWorkplace: 'homeoffice',
      workplaces: ['office', 'homeoffice'],
    })

    expect(officeHtml).toMatch(/aria-pressed="true"[^>]*>Büro<\/button>/)
    expect(officeHtml).toMatch(/aria-pressed="false"[^>]*>Homeoffice<\/button>/)
    expect(homeofficeHtml).toMatch(/aria-pressed="false"[^>]*>Büro<\/button>/)
    expect(homeofficeHtml).toMatch(
      /aria-pressed="true"[^>]*>Homeoffice<\/button>/,
    )
  })

  it('does not show an unnecessary workplace switch for one active workplace', () => {
    const html = renderTodayScreen()

    expect(html).not.toContain('aria-label="Arbeitsort heute auswählen"')
    expect(html).not.toContain('Homeoffice</button>')
  })

  it('shows the current work or study day as a real dropdown', () => {
    const html = renderTodayScreen({
      activeWorkdayType: 'study-day',
    })

    expect(html).toContain('Art des heutigen Arbeitstags')
    expect(html).toContain('aria-label="Art des heutigen Arbeitstags auswählen"')
    expect(html).toContain('<select')
    expect(html).toContain('<option value="focus-heavy">Fokusarbeit</option>')
    expect(html).toContain('<option value="meeting-heavy">Meetings</option>')
    expect(html).toContain('<option value="mixed-day">Gemischt</option>')
    expect(html).toContain('<option value="study-day" selected="">Lernen</option>')
    expect(html).toContain('<option value="tight-schedule">Wenig Zeit</option>')
  })

  it('can render the exercise detail view for a selected schedule item', () => {
    const html = renderTodayScreen({ initialDetailIndex: 0 })

    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('So geht')
    expect(html).toContain('Aufrecht sitzen.')
    expect(html).toContain('Zurück')
  })

  it('keeps a completed exercise openable from the compact row', async () => {
    await renderInteractiveTodayScreen({
      completedIds: ['morning-reset'],
      progressSummary: { completedToday: 1, completedThisWeek: 1, streak: 1 },
    })

    await clickButtonContaining('Schulter-Reset')

    expect(document.body.textContent).toContain('Diese Übung ist erledigt.')
    expect(document.body.textContent).toContain('So geht')
    expect(document.body.textContent).not.toContain('Timer starten')
    expect(document.body.textContent).not.toContain('Andere Empfehlung')
    expect(document.body.textContent).not.toContain('Als erledigt markieren')
  })

  it('pauses only today through the compact header action', async () => {
    const onPauseDayChange = vi.fn()
    await renderInteractiveTodayScreen({ onPauseDayChange })

    await clickButtonContaining('Heute pausieren')

    expect(onPauseDayChange).toHaveBeenCalledWith(true)
  })

  it('reactivates only today through the compact header action', async () => {
    const onPauseDayChange = vi.fn()
    await renderInteractiveTodayScreen({
      isPauseDay: true,
      onPauseDayChange,
    })

    await clickButtonContaining('Heute aktivieren')

    expect(onPauseDayChange).toHaveBeenCalledWith(false)
  })

  it('keeps the workplace switch interactive for the current day plan', async () => {
    const onWorkplaceChange = vi.fn()
    await renderInteractiveTodayScreen({
      onWorkplaceChange,
      workplaces: ['office', 'homeoffice'],
    })

    await clickButtonContaining('Homeoffice')

    expect(onWorkplaceChange).toHaveBeenCalledWith('homeoffice')
  })

  it('keeps the workday dropdown interactive for the current day context', async () => {
    const onWorkdayTypeChange = vi.fn()
    await renderInteractiveTodayScreen({ onWorkdayTypeChange })
    const select = document.querySelector(
      'select[aria-label="Art des heutigen Arbeitstags auswählen"]',
    )

    await act(async () => {
      select.value = 'study-day'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onWorkdayTypeChange).toHaveBeenCalledWith('study-day')
  })

  it('shows the reminder banner compactly for a due open slot', () => {
    const html = renderTodayScreen(withDueReminder())

    expect(html).toContain('Kleiner Wechselmoment?')
    expect(html).toContain(
      'Dein Vormittagsimpuls ist noch offen, wenn es gerade reinpasst.',
    )
    expect(html.indexOf('Als Nächstes')).toBeLessThan(
      html.indexOf('Kleiner Wechselmoment?'),
    )
    expect(html.indexOf('Kleiner Wechselmoment?')).toBeLessThan(
      html.indexOf('Schulter-Reset'),
    )
    expect(html).toContain('Übung öffnen')
    expect(html).toContain('15 Min. später')
    expect(html).toContain('Heute nicht mehr')
  })

  it.each([
    ['focus-heavy', 'Passt gerade ein kurzer Reset?'],
    ['meeting-heavy', 'Zwischen zwei Terminen?'],
    ['study-day', 'Kurzer Lern-Reset?'],
    ['tight-schedule', 'Nur kurz, falls es passt.'],
  ])('shows fitting reminder copy for %s', (activeWorkdayType, title) => {
    const html = renderTodayScreen(withDueReminder({ activeWorkdayType }))

    expect(html).toContain(title)
  })

  it('opens the due recommendation from the reminder action', () => {
    const actionResult = applyReminderBannerAction({
      action: 'open',
      now: morningNow(),
      reminder: createDueReminder(),
      settings: enabledReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })

    expect(actionResult.detailIndex).toBe(0)
    expect(actionResult.state.lastReminderShownAt.morning).toBe(
      morningNow().toISOString(),
    )
  })

  it('snoozes for 15 minutes and hides the banner', () => {
    const actionResult = applyReminderBannerAction({
      action: 'snooze-15',
      now: morningNow(),
      reminder: createDueReminder(),
      settings: enabledReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })
    const html = renderTodayScreen(
      withDueReminder({ initialReminderState: actionResult.state }),
    )

    expect(actionResult.state.snoozedSlots.morning).toBe(
      new Date(2026, 5, 17, 10, 0).toISOString(),
    )
    expect(html).not.toContain('Kleiner Wechselmoment?')
  })

  it('snoozes for 30 minutes and hides the banner', () => {
    const actionResult = applyReminderBannerAction({
      action: 'snooze-30',
      now: morningNow(),
      reminder: createDueReminder(),
      settings: enabledReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })
    const html = renderTodayScreen(
      withDueReminder({ initialReminderState: actionResult.state }),
    )

    expect(actionResult.state.snoozedSlots.morning).toBe(
      new Date(2026, 5, 17, 10, 15).toISOString(),
    )
    expect(html).not.toContain('Kleiner Wechselmoment?')
  })

  it('skips the reminder slot for today', () => {
    const actionResult = applyReminderBannerAction({
      action: 'skip-today',
      now: morningNow(),
      reminder: createDueReminder(),
      settings: enabledReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })
    const html = renderTodayScreen(
      withDueReminder({ initialReminderState: actionResult.state }),
    )

    expect(actionResult.state.skippedSlots).toContain('morning')
    expect(actionResult.state.pausedForDay).toBe(true)
    expect(html).not.toContain('Kleiner Wechselmoment?')
  })

  it('moves the reminder to a later enabled window today', () => {
    const actionResult = applyReminderBannerAction({
      action: 'later-today',
      now: morningNow(),
      reminder: createDueReminder(),
      settings: enabledReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })

    expect(actionResult.state.snoozedSlots.morning).toBe(
      new Date(2026, 5, 17, 14, 0).toISOString(),
    )
  })

  it('does not show reminders for completed slots', () => {
    const html = renderTodayScreen(
      withDueReminder({ completedIds: ['morning-reset'] }),
    )

    expect(html).not.toContain('Kleiner Wechselmoment?')
  })

  it('creates compact reminder copy for office and homeoffice', () => {
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'office',
        reminder: createDueReminder(),
      }).contextHint,
    ).toBe('Diskret am Arbeitsplatz möglich.')
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'homeoffice',
        reminder: createDueReminder(),
      }).contextHint,
    ).toBe('Im Homeoffice darf der Wechsel etwas freier sein.')
  })

  it('uses setup-specific reminder hints when a due impulse has context', () => {
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'office',
        reminder: createDueReminder({
          section: {
            ...baseSections[0],
            requiredSetup: ['standing-desk'],
          },
        }),
      }).contextHint,
    ).toContain('Sitz-Steh-Wechsel')
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'homeoffice',
        reminder: createDueReminder({
          section: {
            ...baseSections[0],
            requiredSetup: ['walking-pad'],
          },
        }),
      }).contextHint,
    ).toContain('Walking Pad')
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'office',
        reminder: createDueReminder({
          section: {
            ...baseSections[0],
            requiredSetup: ['hallway'],
          },
        }),
      }).contextHint,
    ).toContain('kurzer Weg')
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'office',
        reminder: createDueReminder({
          section: {
            ...baseSections[0],
            requiredSetup: ['stairs'],
          },
        }),
      }).contextHint,
    ).toContain('Treppenimpuls')
  })

  it('uses only the in-app banner when the app is visible', () => {
    const NotificationApi = vi.fn()

    expect(
      maybeShowDueReminderNotification({
        activeWorkdayType: 'mixed-day',
        documentRef: { visibilityState: 'visible' },
        dueReminder: createDueReminder(),
        notificationApi: NotificationApi,
        now: morningNow(),
        permission: 'granted',
        settings: enabledSystemReminderSettings(),
        state: createDailyReminderState(morningNow()),
      }),
    ).toBeNull()
    expect(NotificationApi).not.toHaveBeenCalled()
  })

  it('shows a system notification for a due reminder while the app is hidden', () => {
    const NotificationApi = vi.fn(function NotificationMock(title, options) {
      this.title = title
      this.options = options
    })
    const nextState = maybeShowDueReminderNotification({
      activeWorkdayType: 'focus-heavy',
      documentRef: { visibilityState: 'hidden' },
      dueReminder: createDueReminder(),
      notificationApi: NotificationApi,
      now: morningNow(),
      permission: 'granted',
      settings: enabledSystemReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })

    expect(NotificationApi).toHaveBeenCalledWith('Passt gerade ein kurzer Reset?', {
      body: 'Nur 60 Sekunden, falls es gerade reinpasst.',
      tag: 'move-at-work-2026-06-17-morning',
    })
    expect(nextState.lastReminderShownAt.morning).toBe(morningNow().toISOString())
  })

  it.each([
    ['denied permission', 'denied', enabledSystemReminderSettings()],
    [
      'disabled reminders',
      'granted',
      { ...enabledSystemReminderSettings(), enabled: false },
    ],
    [
      'disabled system notifications',
      'granted',
      { ...enabledSystemReminderSettings(), systemNotificationsEnabled: false },
    ],
  ])('does not show system notifications for %s', (_, permission, settings) => {
    const NotificationApi = vi.fn()

    expect(
      maybeShowDueReminderNotification({
        activeWorkdayType: 'mixed-day',
        documentRef: { visibilityState: 'hidden' },
        dueReminder: createDueReminder(),
        notificationApi: NotificationApi,
        now: morningNow(),
        permission,
        settings,
        state: createDailyReminderState(morningNow()),
      }),
    ).toBeNull()
    expect(NotificationApi).not.toHaveBeenCalled()
  })

  it('does not create a system notification while do-not-disturb is active', () => {
    const settings = {
      ...enabledSystemReminderSettings(),
      quietUntil: new Date(2026, 5, 17, 11, 0).toISOString(),
    }
    const dueReminder = getDueReminder({
      completedIds: [],
      now: morningNow(),
      plan,
      settings,
      state: createDailyReminderState(morningNow()),
    })

    expect(dueReminder).toBeNull()
  })

  it('does not create a system notification for completed slots', () => {
    const dueReminder = getDueReminder({
      completedIds: ['morning-reset'],
      now: morningNow(),
      plan,
      settings: enabledSystemReminderSettings(),
      state: createDailyReminderState(morningNow()),
    })

    expect(dueReminder).toBeNull()
  })

  it('does not create duplicate system notifications for a recently shown slot', () => {
    const state = {
      ...createDailyReminderState(morningNow()),
      lastReminderShownAt: {
        morning: new Date(2026, 5, 17, 9, 40).toISOString(),
      },
    }
    const dueReminder = getDueReminder({
      completedIds: [],
      now: morningNow(),
      plan,
      settings: enabledSystemReminderSettings(),
      state,
    })

    expect(dueReminder).toBeNull()
  })
})

function countOccurrences(value, search) {
  return value.split(search).length - 1
}

async function renderInteractiveTodayScreen(props = {}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  document.body.append(container)

  await act(async () => {
    root.render(
      <TodayScreen
        activeWorkplace="office"
        completedIds={[]}
        currentDate={new Date(2026, 5, 24, 9, 30)}
        onComplete={() => {}}
        onReplaceRecommendation={() => {}}
        onWorkplaceChange={() => {}}
        onWorkdayTypeChange={() => {}}
        plan={plan}
        progressSummary={{ completedToday: 0, completedThisWeek: 0, streak: 0 }}
        workplaces={['office']}
        {...props}
      />,
    )
  })

  return { container, root }
}

async function clickButtonContaining(label) {
  const button = [...document.querySelectorAll('button')].find((element) =>
    element.textContent.includes(label),
  )

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function withDueReminder(props = {}) {
  return {
    currentDate: morningNow(),
    initialReminderSettings: enabledReminderSettings(),
    initialReminderState: createDailyReminderState(morningNow()),
    ...props,
  }
}

function enabledReminderSettings() {
  return {
    enabled: true,
    mode: 'normal',
    enabledWindows: ['morning', 'afternoon'],
    quietUntil: null,
    systemNotificationsEnabled: false,
  }
}

function enabledSystemReminderSettings() {
  return {
    ...enabledReminderSettings(),
    systemNotificationsEnabled: true,
  }
}

function createDueReminder(overrides = {}) {
  return {
    index: 0,
    section: baseSections[0],
    slotId: 'morning',
    slotLabel: 'Vormittag',
    ...overrides,
  }
}

function morningNow() {
  return new Date(2026, 5, 17, 9, 45)
}
