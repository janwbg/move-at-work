import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import TodayScreen from './TodayScreen.jsx'

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
})

function countOccurrences(value, search) {
  return value.split(search).length - 1
}
