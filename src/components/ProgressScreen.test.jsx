import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProgressScreen from './ProgressScreen.jsx'

describe('ProgressScreen', () => {
  it('shows the workday progress values from the provided summary without duplicates', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday: 3,
          completedThisWeek: 12,
          routineWeek: {
            completedDays: 3,
            plannedDays: 4,
          },
          streak: 4,
          todayStatus: {
            id: 'strong',
            label: 'Starker Tag',
          },
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain('Fortschritt')
    expect(html).toContain('3/5')
    expect(html).toContain('3 von 5 Microbreaks erledigt')
    expect(html).toContain('12')
    expect(html).toContain('4 Arbeitstage in Folge')
    expect(html).toContain('Starker Tag.')
    expect(html).toContain('<svg')
    expect(html).toContain('Arbeits-/Lernroutine')
    expect(html).toContain('Aktive Woche')
    expect(html).toContain(
      'Diese Woche hast du 3 von 4 aktiven Arbeits-/Lerntagen geschafft.',
    )
    expect(html).toContain('Pausentage brechen deine Routine nicht.')
    expect(html).not.toContain('Tagesstreak')
    expect(countOccurrences(html, 'Heute erledigt')).toBe(1)
    expect(countOccurrences(html, 'Aktive Woche')).toBe(1)
    expect(countOccurrences(html, 'Arbeits-/Lernroutine')).toBe(1)
  })

  it.each([
    [0, 5, '0/5'],
    [1, 5, '1/5'],
    [5, 5, '5/5'],
    [0, 0, 'Noch kein Tagesplan verfügbar'],
  ])('renders the progress ring safely for %i of %i', (completedToday, totalToday, expectedText) => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday,
          completedThisWeek: completedToday,
          routineWeek: {
            completedDays: completedToday > 0 ? 1 : 0,
            plannedDays: 1,
          },
          streak: completedToday > 0 ? 1 : 0,
        }}
        totalToday={totalToday}
      />,
    )

    expect(html).toContain('<svg')
    expect(html).toContain(expectedText)
  })

  it.each([
    [0, 'open', 'Start'],
    [1, 'held', 'Routine'],
    [3, 'strong', 'Starker Tag'],
    [5, 'complete', 'Kompletter Tag'],
  ])('shows the progress ring state for %i completed', (completedToday, statusId, label) => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday,
          completedThisWeek: completedToday,
          routineWeek: {
            completedDays: completedToday > 0 ? 1 : 0,
            plannedDays: 1,
          },
          streak: completedToday > 0 ? 1 : 0,
          todayStatus: {
            id: statusId,
            label,
          },
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain(`${completedToday}/5`)
    expect(html).toContain(label)

    if (statusId === 'complete') {
      expect(html).toContain('✓')
    }
  })

  it('does not show the recommendation feedback summary', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        feedbackSummary={{
          total: 4,
          fit: 3,
          notFit: 1,
          mostCommonReason: 'Keine Zeit',
        }}
        summary={{
          completedToday: 2,
          completedThisWeek: 5,
          routineWeek: {
            completedDays: 2,
            plannedDays: 3,
          },
          streak: 2,
        }}
        totalToday={5}
      />,
    )

    expect(html).not.toContain('Empfehlungsfeedback')
    expect(html).not.toContain('Gespeichert')
    expect(html).not.toContain('Hat gepasst')
    expect(html).not.toContain('Eher nicht')
    expect(html).not.toContain('Häufigster Grund')
    expect(html).toContain('Heute erledigt')
    expect(html).toContain('Aktive Woche')
    expect(html).toContain('Arbeits-/Lernroutine')
  })

  it('shows a subtle progress message with benefit feedback', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        feedbackSummary={{
          total: 4,
          fit: 2,
          notFit: 1,
          mostCommonReason: '',
          benefitTotal: 3,
          positiveBenefitCount: 3,
        }}
        summary={{
          completedToday: 2,
          completedThisWeek: 6,
          routineWeek: {
            completedDays: 3,
            plannedDays: 4,
          },
          streak: 2,
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain('Diese Woche hast du 6 kurze Resets abgeschlossen.')
    expect(html).toContain(
      '3x hast du dich danach wacher, entspannter, fokussierter oder lockerer gefühlt.',
    )
    expect(html).not.toContain('100 %')
    expect(html).not.toContain('Sitzzeit vermieden')
  })

  it('shows a compact 28-day routine calendar with all routine statuses', () => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday: 5,
          completedThisWeek: 9,
          routineCalendar: createRoutineCalendar(),
          routineWeek: {
            completedDays: 3,
            plannedDays: 4,
          },
          streak: 3,
          todayStatus: {
            id: 'complete',
            label: 'Kompletter Tag',
          },
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain('Routine-Kalender')
    expect(html).toContain('Letzte 28 Tage')
    expect(html).toContain(
      'Nur aktive Arbeits-/Lerntage zählen. Pausentage bleiben neutral.',
    )
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
    expect(html).toContain('data-routine-status="held"')
    expect(html).toContain('data-routine-status="strong"')
    expect(html).toContain('data-routine-status="complete"')
    expect(html).toContain('data-routine-status="pause"')
    expect(html).toContain('data-routine-status="neutral"')
    expect(html).toContain('data-routine-status="missed"')
    expect(html).toContain('Routine')
    expect(html).toContain('Nicht geschafft')
    expect(html).not.toContain('Verpasst')
  })

  it('shows a gentle progress message without benefit feedback', () => {
    const html = renderToStaticMarkup(
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
          routineWeek: {
            completedDays: 0,
            plannedDays: 1,
          },
          streak: 0,
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain(
      'Jeder kurze Reset zählt - auch ohne perfekte Routine.',
    )
  })

  it.each([
    ['held', 'Routine gehalten.'],
    ['strong', 'Starker Tag.'],
    ['complete', 'Kompletter Tag.'],
    ['pause', 'Heute ist Pausentag. Deine Routine bleibt erhalten.'],
    ['open', 'Ein kurzer Reset reicht, um deine Routine heute zu halten.'],
  ])('shows the %s day status message', (statusId, message) => {
    const html = renderToStaticMarkup(
      <ProgressScreen
        summary={{
          completedToday: statusId === 'open' || statusId === 'pause' ? 0 : 1,
          completedThisWeek: 1,
          routineWeek: {
            completedDays: 1,
            plannedDays: 1,
          },
          streak: 1,
          todayStatus: {
            id: statusId,
            label: message,
          },
        }}
        totalToday={5}
      />,
    )

    expect(html).toContain(message)
  })
})

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
