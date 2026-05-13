import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import TodayScreen from './TodayScreen.jsx'

const plan = {
  dailySchedule: [
    {
      description: 'Kurz aufstehen und Schultern bewegen.',
      duration: '2 Minuten',
      id: 'morning-reset',
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
      intensity: 'Leicht',
      movementType: 'breathing',
      reason: 'Ruhiger Fokusimpuls.',
      setup: 'Kein besonderes Equipment',
      timeLabel: 'Nachmittag',
      title: 'Atem-Reset',
    },
  ],
  movements: [],
  rhythm: 'Kurze, ruhige Microbreaks.',
  summary: 'Ein ruhiger Tagesplan.',
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

  it('keeps the daily schedule visible', () => {
    const html = renderTodayScreen()

    expect(html).toContain('Tagesplan')
    expect(html).toContain('Deine Empfehlungen')
    expect(html).toContain('Schulter-Reset')
    expect(html).toContain('Atem-Reset')
  })

  it('shows completed recommendations as completed while other cards remain open', () => {
    const html = renderTodayScreen({
      completedIds: ['morning-reset'],
      progressSummary: { completedToday: 1, completedThisWeek: 1, streak: 1 },
    })

    expect(html).toContain('1 offen')
    expect(html).toContain('1 erledigt')
    expect(html).toContain('✓ Erledigt')
    expect(html).toContain('Offen')
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
})
