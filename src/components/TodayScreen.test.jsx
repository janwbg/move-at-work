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
  movements: [],
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

  it('shows the workplace used for the day', () => {
    const html = renderTodayScreen({
      workplaces: ['office', 'homeoffice'],
    })

    expect(html).toContain('Arbeitsort heute')
    expect(html).toContain('Arbeitsort heute: Büro')
    expect(html).toContain('Homeoffice')
    expect(html).toContain('Diese Auswahl gilt nur für den heutigen Plan.')
  })

  it('shows the workplace switch only when both workplaces are active', () => {
    const singleWorkplaceHtml = renderTodayScreen()
    const twoWorkplaceHtml = renderTodayScreen({
      workplaces: ['office', 'homeoffice'],
    })

    expect(singleWorkplaceHtml).not.toContain('Homeoffice</button>')
    expect(twoWorkplaceHtml).toContain('Homeoffice</button>')
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
