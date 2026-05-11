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
      movementType: 'mobility',
      reason: 'Passt gerade zu Fokusarbeit.',
      setup: 'Kein besonderes Equipment',
      timeLabel: 'Vormittag',
      title: 'Schulter-Reset',
    },
  ],
  movements: [],
  rhythm: 'Kurze, ruhige Microbreaks.',
  summary: 'Ein ruhiger Tagesplan.',
}

describe('TodayScreen', () => {
  it('renders the optional current work phase selector', () => {
    const html = renderToStaticMarkup(
      <TodayScreen
        activeWorkPhase="focus"
        activeWorkplace="office"
        completedIds={[]}
        feedbackUrl="https://example.com"
        onComplete={() => {}}
        onWorkPhaseChange={() => {}}
        onWorkplaceChange={() => {}}
        plan={plan}
        progressSummary={{ completedToday: 0, completedThisWeek: 0, streak: 0 }}
        workplaces={['office']}
      />,
    )

    expect(html).toContain('Was passt gerade?')
    expect(html).toContain('Fokusarbeit')
    expect(html).toContain('Meeting')
    expect(html).toContain('Zwischen zwei Aufgaben')
    expect(html).toContain('Passt gerade nicht?')
  })

  it('shows the workplace used for the day', () => {
    const html = renderToStaticMarkup(
      <TodayScreen
        activeWorkPhase="focus"
        activeWorkplace="office"
        completedIds={[]}
        feedbackUrl="https://example.com"
        onComplete={() => {}}
        onWorkPhaseChange={() => {}}
        onWorkplaceChange={() => {}}
        plan={plan}
        progressSummary={{ completedToday: 0, completedThisWeek: 0, streak: 0 }}
        workplaces={['office', 'homeoffice']}
      />,
    )

    expect(html).toContain('Arbeitsort heute')
    expect(html).toContain('Buero')
    expect(html).toContain('Homeoffice')
    expect(html).toContain('Diese Tagesauswahl passt nur den heutigen Plan an')
  })
})
