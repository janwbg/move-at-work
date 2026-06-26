import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProgressScreen from './ProgressScreen.jsx'
import { ProgressRing } from './ProgressSummary.jsx'

describe('ProgressScreen', () => {
  it('renders the quiet screen title without the old blue banner', () => {
    const html = renderProgressScreen()

    expect(html).toContain('Deine Routine')
    expect(html).toContain(
      'Sieh, wie du Sitzphasen unterbrichst',
    )
    expect(html).not.toContain('Jede kurze Bewegung')
    expect(html).not.toContain('Dein Fortschritt bleibt lokal')
    expect(html).not.toContain('shadow-[#2563eb]/20')
  })

  it('renders the three compact KPI cards', () => {
    const html = renderProgressScreen({
      completedToday: 3,
      completedThisWeek: 12,
      streak: 4,
      todayStatus: {
        id: 'strong',
        label: 'Starker Tag',
      },
    })

    expect(html).toContain('Heute erledigt')
    expect(html).toContain('Aktive Woche')
    expect(html).toContain('Arbeits-/Lernroutine')
    expect(html).toContain('Starker Tag')
    expect(html).toContain('Impulse')
    expect(html).toContain('Arbeitsstreak')
    expect(html).toContain('Freie Tage bleiben neutral.')
  })

  it('shows the today progress ring without duplicate Microbreak copy', () => {
    const html = renderProgressScreen({
      completedToday: 5,
      completedThisWeek: 9,
      streak: 3,
      todayStatus: {
        id: 'complete',
        label: 'Kompletter Tag',
      },
    })

    expect(html).toContain('<svg')
    expect(html).toContain('5/5')
    expect(html).toContain('Kompletter Tag')
    expect(html).toContain('5 von 5 Impulse erledigt')
    expect(html).not.toContain('5 von 5 Microbreaks erledigt')
    expect(html).not.toContain('Microbreaks')
  })

  it('shows the active streak with the rocket icon', () => {
    const html = renderProgressScreen({
      completedToday: 1,
      completedThisWeek: 4,
      streak: 1,
    })

    expect(html).toContain('🚀')
    expect(html).toContain('aktiver Tag')
  })

  it.each([
    [0, 'Offen'],
    [1, 'Routine gehalten'],
    [2, 'Routine gehalten'],
    [3, 'Starker Tag'],
    [4, 'Starker Tag'],
    [5, 'Kompletter Tag'],
  ])('uses the requested today status for %i completed impulses', (completedToday, label) => {
    const html = renderProgressScreen({
      completedToday,
      completedThisWeek: completedToday,
      streak: completedToday > 0 ? 1 : 0,
      todayStatus: {
        id: getStatusId(completedToday),
        label,
      },
    })

    expect(html).toContain(`${completedToday}/5`)
    expect(html).toContain(label)
  })

  it.each([
    [0, 5, '0/5'],
    [1, 5, '1/5'],
    [5, 5, '5/5'],
    [0, 0, '0/0'],
  ])('renders the progress ring safely for %i of %i', (completedToday, totalToday, expectedText) => {
    const html = renderProgressScreen(
      {
        completedToday,
        completedThisWeek: completedToday,
        streak: completedToday > 0 ? 1 : 0,
      },
      totalToday,
    )

    expect(html).toContain('<svg')
    expect(html).toContain(expectedText)
  })

  it('keeps status labels outside the progress ring', () => {
    const html = renderToStaticMarkup(
      <ProgressRing
        completedToday={2}
        status={{ id: 'held', label: 'Routine gehalten' }}
        totalToday={5}
      />,
    )

    expect(html).toContain('2/5')
    expect(html).not.toContain('Routine gehalten')
    expect(html).not.toContain('Kompletter Tag')
  })

  it('shows the activity calendar without weekly quota text', () => {
    const html = renderProgressScreen({
      completedToday: 5,
      completedThisWeek: 9,
      routineCalendar: createRoutineCalendar(),
      streak: 3,
      todayStatus: {
        id: 'complete',
        label: 'Kompletter Tag',
      },
    })

    expect(html).toContain('Aktive Woche')
    expect(html).toContain('Freie Tage und Pausentage bleiben neutral.')
    expect(html).toContain('data-routine-weekday="Mo"')
    expect(html).toContain('data-routine-weekday="Di"')
    expect(html).toContain('data-routine-weekday="Mi"')
    expect(html).toContain('data-routine-weekday="Do"')
    expect(html).toContain('data-routine-weekday="Fr"')
    expect(html).toContain('data-routine-weekday="Sa"')
    expect(html).toContain('data-routine-weekday="So"')
    expect(countOccurrences(html, 'data-routine-calendar-placeholder=')).toBe(2)
    expect(countOccurrences(html, 'data-routine-calendar-day=')).toBe(28)
    expect(html).toContain('data-routine-calendar-today="true"')
    expect(html).toContain('Heute')
    expect(html).not.toContain('Diese Woche: 1 von 3 geplanten Tagen aktiv')
    expect(html).not.toContain('geplanten Tagen aktiv')
    expect(html).not.toContain('aktiven Arbeits-/Lerntagen')
  })

  it('reduces the calendar legend to complete, active, open, and neutral', () => {
    const html = renderProgressScreen({
      completedToday: 5,
      completedThisWeek: 9,
      routineCalendar: createRoutineCalendar(),
      streak: 3,
    })

    expect(html).toContain('Komplett')
    expect(html).toContain('Aktiv')
    expect(html).toContain('Offen')
    expect(html).toContain('Neutral')
    expect(html.indexOf('Komplett')).toBeLessThan(html.indexOf('Aktiv'))
    expect(html.indexOf('Aktiv')).toBeLessThan(html.indexOf('Offen'))
    expect(html.indexOf('Offen')).toBeLessThan(html.indexOf('Neutral'))
    expect(html).toContain('data-routine-status="complete"')
    expect(html).toContain('data-routine-status="active"')
    expect(html).toContain('data-routine-status="neutral"')
    expect(html).toContain('data-routine-status="open"')
    expect(html).not.toContain('Nicht geschafft')
    expect(html).not.toContain('Verpasst')
    expect(html).not.toContain('data-routine-status="missed"')
    expect(html).not.toContain('data-routine-status="strong"')
    expect(html).not.toContain('data-routine-status="held"')
  })

  it('does not show the recommendation feedback summary', () => {
    const html = renderProgressScreen({
      completedToday: 2,
      completedThisWeek: 5,
      streak: 2,
    })

    expect(html).not.toContain('Empfehlungsfeedback')
    expect(html).not.toContain('Gespeichert')
    expect(html).not.toContain('Hat gepasst')
    expect(html).not.toContain('Eher nicht')
    expect(html).not.toContain('Häufigster Grund')
  })
})

function renderProgressScreen(summaryOverrides = {}, totalToday = 5) {
  return renderToStaticMarkup(
    <ProgressScreen
      feedbackSummary={{
        total: 0,
        fit: 0,
        notFit: 0,
        mostCommonReason: '',
        benefitTotal: 0,
        positiveBenefitCount: 0,
      }}
      summary={{
        completedToday: 0,
        completedThisWeek: 0,
        routineCalendar: [],
        routineWeek: {
          completedDays: 0,
          plannedDays: 0,
        },
        streak: 0,
        todayStatus: {
          id: 'open',
          label: 'Offen',
        },
        ...summaryOverrides,
      }}
      totalToday={totalToday}
    />,
  )
}

function getStatusId(completedToday) {
  if (completedToday >= 5) {
    return 'complete'
  }

  if (completedToday >= 3) {
    return 'strong'
  }

  if (completedToday >= 1) {
    return 'held'
  }

  return 'open'
}

function countOccurrences(value, search) {
  return value.split(search).length - 1
}

function createRoutineCalendar() {
  const statuses = [
    'held',
    'strong',
    'complete',
    'pause',
    'neutral',
    'missed',
    'open',
  ]

  return Array.from({ length: 28 }, (_, index) => {
    const statusId = statuses[index % statuses.length]

    return {
      date: `2026-06-${String(index + 1).padStart(2, '0')}`,
      dayLabel: String(index + 1),
      isToday: index === 27,
      status: {
        id: statusId,
      },
      weekday: (index + 3) % 7,
    }
  })
}
