import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import TodayScreen from './TodayScreen.jsx'
import {
  applyReminderBannerAction,
  getReminderCopy,
} from './reminderBannerHelpers.js'
import { createDailyReminderState } from '../utils/reminderStorage.js'

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

function renderTodayScreen(props = {}) {
  return renderToStaticMarkup(
    <TodayScreen
      activeWorkplace="office"
      completedIds={[]}
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
  it('does not render the removed next recommendation and phase sections', () => {
    const html = renderTodayScreen()

    expect(html).not.toContain('Als Nächstes')
    expect(html).not.toContain('Passt gerade nicht?')
    expect(html).not.toContain('Was passt gerade?')
    expect(html).not.toContain('Zwischen zwei Aufgaben')
  })

  it('removes the duplicate open impulse text from the blue hero card', () => {
    const html = renderTodayScreen()

    expect(html).not.toContain('Impulsen sind noch offen')
    expect(countOccurrences(html, 'offen')).toBe(1)
  })

  it('keeps the daily schedule visible', () => {
    const html = renderTodayScreen()

    expect(html).toContain('Tagesplan')
    expect(html).toContain('Deine Empfehlungen')
    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('Atem-Reset')
  })

  it('shows the finalized medical notice unobtrusively', () => {
    const html = renderTodayScreen()

    expect(html).toContain(
      'Hinweis: Move at work ersetzt keine medizinische Beratung.',
    )
    expect(html).toContain(
      'Führe Bewegungen nur aus, wenn sie sich für dich sicher und angenehm anfühlen.',
    )
    expect(html).toContain(
      'Bei Schmerzen, Verletzungen oder gesundheitlichen Einschränkungen brich die Übung ab oder frage medizinisches Fachpersonal.',
    )
    expect(html).toContain('text-sm leading-6 text-slate-500')
  })

  it('keeps the existing practice test feedback hint after the daily schedule', () => {
    const html = renderTodayScreen({
      feedbackUrl: 'https://example.com/feedback',
    })

    expect(html).toContain(
      'Du testest gerade eine frühe Version von Move at work. Dein Feedback hilft dabei, die Empfehlungen verständlicher, passender und alltagstauglicher zu machen.',
    )
    expect(html).toContain('Feedback geben')
    expect(html).toContain('href="https://example.com/feedback"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html.indexOf('Deine Empfehlungen')).toBeLessThan(
      html.indexOf('Du testest gerade eine frühe Version'),
    )
  })

  it('does not render additional matching exercises outside the daily schedule', () => {
    const html = renderTodayScreen({
      plan: createPlan(5),
    })

    expect(html).not.toContain('Weitere passende')
    expect(html).not.toContain('Zusätzlicher Impuls')
    expect(countOccurrences(html, 'Übung öffnen')).toBe(5)
  })

  it('shows completed recommendations as completed while other cards remain open internally', () => {
    const html = renderTodayScreen({
      completedIds: ['morning-reset'],
      progressSummary: { completedToday: 1, completedThisWeek: 1, streak: 1 },
    })

    expect(html).toContain('1 offen')
    expect(html).toContain('1 erledigt')
    expect(html).toContain('✓ Erledigt')
    expect(html).not.toContain('Offen')
  })

  it.each([
    [[], '0/5', '0 von 5'],
    [['section-1', 'section-2'], '2/5', '2 von 5'],
    [
      ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'],
      '5/5',
      '5 von 5',
    ],
  ])('shows the Today progress ring for %s', (completedIds, ringText, valueText) => {
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
    expect(html).toContain('Heute erledigt')
    expect(html).toContain(ringText)
    expect(html).toContain(valueText)
  })

  it('shows a compact work streak card safely', () => {
    const html = renderTodayScreen({
      progressSummary: { completedToday: 0, completedThisWeek: 0, streak: 3 },
    })
    const emptyHtml = renderTodayScreen({
      progressSummary: undefined,
    })

    expect(html).toContain('🚀')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('3 Arbeitstage')
    expect(emptyHtml).toContain('0 Arbeitstage')
  })

  it('removes the separate workplace card and helper copy', () => {
    const html = renderTodayScreen({
      workplaces: ['office', 'homeoffice'],
    })

    expect(html).not.toContain('Arbeitsort heute:')
    expect(html).not.toContain('Diese Auswahl gilt nur für den heutigen Plan.')
    expect(countOccurrences(html, 'Arbeitsort heute')).toBe(2)
  })

  it('shows the workplace switch inside the daily schedule header when both workplaces are active', () => {
    const html = renderTodayScreen({
      workplaces: ['office', 'homeoffice'],
    })

    expect(html).toContain('aria-label="Arbeitsort heute auswählen"')
    expect(html).toContain('Büro</button>')
    expect(html).toContain('Homeoffice</button>')
    expect(html.indexOf('Deine Empfehlungen')).toBeLessThan(
      html.indexOf('Arbeitsort heute'),
    )
    expect(html.indexOf('Arbeitsort heute')).toBeLessThan(
      html.indexOf('2 offen · 0 erledigt'),
    )
  })

  it('shows the current work or study day switch in the daily schedule header', () => {
    const html = renderTodayScreen({
      activeWorkdayType: 'study-day',
    })

    expect(html).toContain('Heute eher')
    expect(html).toContain('aria-label="Arbeits- oder Lerntag heute auswählen"')
    expect(html).toContain('Fokusarbeit</button>')
    expect(html).toContain('Meetings</button>')
    expect(html).toContain('Gemischt</button>')
    expect(html).toContain('Lernen</button>')
    expect(html).toContain('Wenig Zeit</button>')
    expect(html).toMatch(/aria-pressed="true"[^>]*>Lernen<\/button>/)
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

    expect(officeHtml).toContain('aria-pressed="true"')
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

  it('keeps the daily schedule summary visible', () => {
    const html = renderTodayScreen({
      completedIds: ['morning-reset'],
    })

    expect(html).toContain('1 offen · 1 erledigt')
  })

  it('can render the exercise detail view for a selected schedule item', () => {
    const html = renderTodayScreen({ initialDetailIndex: 0 })

    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('So geht')
    expect(html).toContain('Aufrecht sitzen.')
    expect(html).toContain('Zurück')
  })
  it('shows the reminder banner for a due open slot', () => {
    const html = renderTodayScreen(withDueReminder())

    expect(html).toContain('Kurzer Wechsel gefällig?')
    expect(html).toContain('Dein Vormittagsimpuls ist noch offen.')
    expect(html).toContain('Übung öffnen')
    expect(html).toContain('15 Min. später')
    expect(html).toContain('Heute nicht mehr')
  })

  it.each([
    ['focus-heavy', 'Kurzer Fokus-Reset?'],
    ['meeting-heavy', 'Zwischen zwei Terminen?'],
    ['study-day', 'Kurzer Lern-Reset?'],
    ['tight-schedule', '60 Sekunden reichen.'],
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
    expect(html).not.toContain('Kurzer Wechsel gefällig?')
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
    expect(html).not.toContain('Kurzer Wechsel gefällig?')
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
    expect(html).not.toContain('Kurzer Wechsel gefällig?')
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

    expect(html).not.toContain('Kurzer Wechsel gefällig?')
  })

  it('creates compact reminder copy for office and homeoffice', () => {
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'office',
        reminder: createDueReminder(),
      }).contextHint,
    ).toBe('Direkt am Arbeitsplatz möglich.')
    expect(
      getReminderCopy({
        activeWorkdayType: 'mixed-day',
        activeWorkplace: 'homeoffice',
        reminder: createDueReminder(),
      }).contextHint,
    ).toBe('Nutze den kurzen Raumwechsel.')
  })
})

function countOccurrences(value, search) {
  return value.split(search).length - 1
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
    mode: 'standard',
    enabledWindows: ['morning', 'afternoon'],
    quietUntil: null,
  }
}

function createDueReminder() {
  return {
    index: 0,
    section: baseSections[0],
    slotId: 'morning',
    slotLabel: 'Vormittag',
  }
}

function morningNow() {
  return new Date(2026, 5, 17, 9, 45)
}
