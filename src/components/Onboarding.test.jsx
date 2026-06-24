// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routineSettingsStorageKey } from '../utils/progressStorage.js'
import { reminderSettingsStorageKey } from '../utils/reminderStorage.js'
import Onboarding from './Onboarding.jsx'
import { getOnboardingSteps } from './onboardingSteps.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Onboarding', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    window.localStorage.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts with the landing screen before goal and workplace selection', () => {
    const steps = getOnboardingSteps({})

    expect(steps[0]).toMatchObject({
      kind: 'landing',
      question:
        'Bewegung, die in deinen Tag passt — ohne dass du sie planen musst.',
    })
    expect(steps[1]).toMatchObject({
      kind: 'goal',
      question: 'Was möchtest du mit Move at work erreichen?',
    })
    expect(steps[2]).toMatchObject({
      kind: 'workplaces',
      question: 'Wo arbeitest du regelmäßig?',
    })
  })

  it('shows a polished landing page with three benefit cards and no back button', () => {
    const html = renderOnboarding({
      answers: { goal: 'sit-less' },
      initialCurrentIndex: 0,
    })

    expect(html).toContain(
      'Bewegung, die in deinen Tag passt — ohne dass du sie planen musst.',
    )
    expect(html).toContain('Passt in deinen Arbeitstag')
    expect(html).toContain('Keine Planung nötig')
    expect(html).toContain('Kleine Pausen, großer Unterschied')
    expect(html).not.toContain('Zurück')
  })

  it('keeps the back button on later onboarding screens', () => {
    const html = renderOnboarding({
      answers: { goal: 'sit-less' },
      initialCurrentIndex: 1,
    })

    expect(html).toContain('Zurück')
  })

  it('contains the workplace selection without a combined both option', () => {
    const html = renderOnboarding({
      answers: { goal: 'sit-less' },
      initialCurrentIndex: 2,
    })

    expect(html).toContain('Wo arbeitest du regelmäßig?')
    expect(html).toContain('Büro')
    expect(html).toContain('Homeoffice')
    expect(html).not.toContain('Beides')
  })

  it('adds setup, confirmation, default, routine, reminder, workday, intensity and final steps', () => {
    const steps = getOnboardingSteps({
      workplaces: ['homeoffice', 'office'],
    })

    expect(steps.map((step) => step.kind)).toEqual([
      'landing',
      'goal',
      'workplaces',
      'setup-office',
      'setup-homeoffice',
      'setup-confirmation',
      'default-workplace',
      'routine',
      'reminder',
      'workday',
      'intensity',
      'final',
    ])
    expect(steps.map((step) => step.question)).toContain(
      'Was steht dir im Büro zur Verfügung?',
    )
    expect(steps.map((step) => step.question)).toContain(
      'Wo startest du meistens in den Tag?',
    )
  })

  it('keeps the progress bar after the landing screen but hides step count labels', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'sit-less',
        workplaces: ['office', 'homeoffice'],
      },
      initialCurrentIndex: 1,
    })

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-label="Onboarding-Fortschritt"')
    expect(html).not.toContain('Schritt 2 von')
    expect(html).not.toContain('%</span>')
  })

  it('shows the updated goal cards without the habit goal', () => {
    const html = renderOnboarding({
      answers: { goal: 'sit-less' },
      initialCurrentIndex: 1,
    })

    expect(html).toContain('Weniger sitzen')
    expect(html).toContain('Mehr Energie im Arbeitstag')
    expect(html).toContain('Rücken &amp; Nacken entlasten')
    expect(html).toContain('Konzentration verbessern')
    expect(html).toContain(
      'Kleine Unterbrechungen statt stundenlangem Durchsitzen.',
    )
    expect(html).not.toContain('Bewegung zur Gewohnheit machen')
  })

  it('keeps goal cards clickable and accessible', async () => {
    await renderInteractiveOnboarding({
      answers: { goal: 'sit-less' },
      initialCurrentIndex: 1,
    })

    await clickButton('Mehr Energie im Arbeitstag')

    expect(getButtonByText('Mehr Energie im Arbeitstag').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(getButtonByText('Weniger sitzen').getAttribute('aria-pressed')).toBe(
      'false',
    )
  })

  it('distinguishes office and homeoffice setup screens clearly', async () => {
    await renderInteractiveOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['office', 'homeoffice'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 3,
    })

    expect(document.body.textContent).toContain('Dein Büro-Setup')
    expect(document.body.textContent).toContain('Was steht dir im Büro zur Verfügung?')
    expect(document.body.textContent).toContain('Schritt 1 von 2 · Büro')

    await clickButton('Weiter')

    expect(document.body.textContent).toContain('Dein Homeoffice-Setup')
    expect(document.body.textContent).toContain(
      'Was steht dir im Homeoffice zur Verfügung?',
    )
    expect(document.body.textContent).toContain('Schritt 2 von 2 · Homeoffice')
  })

  it('keeps office before homeoffice even when homeoffice was selected first', () => {
    const steps = getOnboardingSteps({
      workplaces: ['homeoffice', 'office'],
    })

    expect(steps.map((step) => step.kind).slice(3, 5)).toEqual([
      'setup-office',
      'setup-homeoffice',
    ])

    const officeHtml = renderOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['homeoffice', 'office'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 3,
    })
    const homeofficeHtml = renderOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['homeoffice', 'office'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 4,
    })

    expect(officeHtml).toContain('Dein Büro-Setup')
    expect(officeHtml).toContain('Schritt 1 von 2 · Büro')
    expect(homeofficeHtml).toContain('Dein Homeoffice-Setup')
    expect(homeofficeHtml).toContain('Schritt 2 von 2 · Homeoffice')
  })

  it('does not show artificial step counts for a single selected workplace', () => {
    const officeHtml = renderOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 3,
    })
    const homeofficeHtml = renderOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['homeoffice'],
        defaultWorkplace: 'homeoffice',
        currentWorkplace: 'homeoffice',
      },
      initialCurrentIndex: 3,
    })

    expect(officeHtml).toContain('Dein Büro-Setup')
    expect(officeHtml).not.toContain('Schritt 1 von 2')
    expect(homeofficeHtml).toContain('Dein Homeoffice-Setup')
    expect(homeofficeHtml).not.toContain('Schritt 1 von 2')
  })

  it('shows concrete setup options and removes ergonomic onboarding setup', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'sit-less',
        workplaces: ['office'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 3,
    })

    expect(html).toContain('Widerstandsband')
    expect(html).toContain('Balancekissen')
    expect(html).toContain('Gymnastikball')
    expect(html).toContain('Flur in der Nähe')
    expect(html).not.toContain('Kleines Bewegungsequipment')
    expect(html).not.toContain('Ergonomische Sitz- oder Stehhilfe')
  })

  it('replaces special setup selections directly with no-equipment without a dialog', async () => {
    await renderInteractiveOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaceSetups: {
          office: ['walking-pad', 'standing-desk'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 3,
    })

    await clickButton('Kein besonderes Equipment')

    expect(document.body.textContent).not.toContain('Auswahl ersetzen?')
    expect(document.body.innerHTML).not.toContain('role="dialog"')
    expect(document.body.textContent).not.toContain('Auswahl ersetzen?')
    expect(getButtonByText('Kein besonderes Equipment').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(getButtonByText('Walking Pad').getAttribute('aria-pressed')).toBe('false')
    expect(getButtonByText('Höhenverstellbarer Schreibtisch').getAttribute('aria-pressed')).toBe(
      'false',
    )
  })

  it('removes no-equipment automatically when another setup option is selected', async () => {
    await renderInteractiveOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 3,
    })

    await clickButton('Walking Pad')

    expect(document.body.textContent).not.toContain('Auswahl ersetzen?')
    expect(getButtonByText('Kein besonderes Equipment').getAttribute('aria-pressed')).toBe(
      'false',
    )
    expect(getButtonByText('Walking Pad').getAttribute('aria-pressed')).toBe('true')
  })

  it('selects no-equipment directly when no special setup option is selected', async () => {
    await renderInteractiveOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 3,
    })

    await clickButton('Kein besonderes Equipment')

    expect(document.body.textContent).not.toContain('Auswahl ersetzen?')
    expect(getButtonByText('Kein besonderes Equipment').getAttribute('aria-pressed')).toBe(
      'true',
    )
  })

  it('uses the same direct no-equipment replacement for the homeoffice setup step', async () => {
    await renderInteractiveOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['office', 'homeoffice'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['walking-pad'],
        },
      },
      initialCurrentIndex: 4,
    })

    await clickButton('Kein besonderes Equipment')

    expect(document.body.textContent).not.toContain('Auswahl ersetzen?')
    expect(getButtonByText('Kein besonderes Equipment').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(getButtonByText('Walking Pad').getAttribute('aria-pressed')).toBe('false')
  })

  it('shows dynamic setup confirmation copy for no equipment, special setup and mixed setup', () => {
    const noEquipmentHtml = renderOnboarding({
      answers: {
        workplaces: ['office'],
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 4,
    })

    expect(noEquipmentHtml).toContain('Kein Equipment? Kein Problem.')

    expect(
      renderOnboarding({
        answers: {
          workplaces: ['office'],
          workplaceSetups: {
            office: ['standing-desk'],
            homeoffice: ['no-equipment'],
          },
        },
        initialCurrentIndex: 4,
      }),
    ).toContain('Perfekt, wir berücksichtigen dein Setup.')

    expect(
      renderOnboarding({
        answers: {
          workplaces: ['office', 'homeoffice'],
          workplaceSetups: {
            office: ['standing-desk'],
            homeoffice: ['no-equipment'],
          },
        },
        initialCurrentIndex: 5,
      }),
    ).toContain('Alles klar, wir merken uns deine Unterschiede.')
  })

  it('renders setup confirmation as its own screen without setup option cards', () => {
    const html = renderOnboarding({
      answers: {
        workplaces: ['office', 'homeoffice'],
        workplaceSetups: {
          office: ['standing-desk'],
          homeoffice: ['walking-pad'],
        },
      },
      initialCurrentIndex: 5,
    })

    expect(html).toContain('Alles klar, wir merken uns deine Unterschiede.')
    expect(html).not.toContain('Kein besonderes Equipment')
    expect(html).not.toContain('Höhenverstellbarer Schreibtisch')
    expect(html).not.toContain('Walking Pad')
    expect(html).not.toContain('Widerstandsband')
    expect(html).not.toContain('Balancekissen')
    expect(html).not.toContain('Gymnastikball')
  })

  it('continues from setup confirmation to the next logical onboarding step', async () => {
    await renderInteractiveOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 4,
    })

    await clickButton('Weiter')

    expect(document.body.textContent).toContain(
      'An welchen Tagen möchtest du Move at work normalerweise nutzen?',
    )
  })

  it('continues from mixed setup confirmation to the default workplace step', async () => {
    await renderInteractiveOnboarding({
      answers: {
        ...officeOnlyAnswers(),
        workplaces: ['office', 'homeoffice'],
        workplaceSetups: {
          office: ['standing-desk'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 5,
    })

    await clickButton('Weiter')

    expect(document.body.textContent).toContain('Wo startest du meistens in den Tag?')
  })

  it('shows office before homeoffice in the default workplace step', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'sit-less',
        workplaces: ['homeoffice', 'office'],
        defaultWorkplace: 'office',
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 6,
    })

    expect(html.indexOf('Büro')).toBeLessThan(html.indexOf('Homeoffice'))
  })

  it('shows routine days with Monday to Friday selected by default', () => {
    const html = renderOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 5,
    })

    expect(html).toContain(
      'An welchen Tagen möchtest du Move at work normalerweise nutzen?',
    )
    expect(html).toMatch(/aria-pressed="true"[^>]*>Mo<\/button>/)
    expect(html).toMatch(/aria-pressed="true"[^>]*>Fr<\/button>/)
    expect(html).toMatch(/aria-pressed="false"[^>]*>Sa<\/button>/)
    expect(html).toMatch(/aria-pressed="false"[^>]*>So<\/button>/)
  })

  it('stores changed routine days locally and keeps one selected', async () => {
    await renderInteractiveOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 5,
    })

    await clickButton('Sa')
    expect(JSON.parse(window.localStorage.getItem(routineSettingsStorageKey))).toEqual({
      activeWeekdays: [1, 2, 3, 4, 5, 6],
    })
  })

  it('shows reminder choices without requesting browser notification permission', async () => {
    const requestPermission = vi.fn()
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission },
    })

    await renderInteractiveOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: 6,
    })

    expect(document.body.textContent).toContain('Soll Move at work dich erinnern?')
    expect(document.body.textContent).toContain('Keine Erinnerungen')
    expect(document.body.textContent).toContain('Sanft')
    expect(document.body.textContent).toContain('Normal')
    expect(document.body.textContent).toContain('Aktiv')

    await clickButton('Aktiv')

    expect(JSON.parse(window.localStorage.getItem(reminderSettingsStorageKey))).toMatchObject({
      enabled: true,
      mode: 'active',
    })
    expect(requestPermission).not.toHaveBeenCalled()
  })

  it('asks for workday before intensity and includes the updated intensity hint', () => {
    const steps = getOnboardingSteps(officeOnlyAnswers())
    const workdayIndex = steps.findIndex((step) => step.kind === 'workday')
    const intensityIndex = steps.findIndex((step) => step.kind === 'intensity')
    const html = renderOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: intensityIndex,
    })

    expect(workdayIndex).toBeLessThan(intensityIndex)
    expect(html).toContain(
      'Wenn dein Tag mal anders läuft, kannst du das direkt im Tagesplan ändern.',
    )
  })

  it('shows the final generation button without upgrade copy', () => {
    const steps = getOnboardingSteps(officeOnlyAnswers())
    const html = renderOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: steps.length - 1,
    })

    expect(html).toContain('Meinen Plan generieren')
    expect(html).not.toContain('Move at work Plus')
  })

  it('shows a short loading screen before completing onboarding', async () => {
    vi.useFakeTimers()
    const complete = vi.fn()
    const steps = getOnboardingSteps(officeOnlyAnswers())

    await renderInteractiveOnboarding({
      answers: officeOnlyAnswers(),
      initialCurrentIndex: steps.length - 1,
      onComplete: complete,
    })
    await clickButton('Meinen Plan generieren')

    expect(document.body.textContent).toContain(
      'Dein persönlicher Tagesplan wird generiert.',
    )
    expect(document.body.textContent).toContain(
      'Wir stimmen Arbeitsort, Setup und Intensität aufeinander ab.',
    )
    expect(document.body.innerHTML).toContain('data-loading-plan-visual="true"')
    expect(document.body.textContent).toContain('Tagesplan')
    expect(document.body.textContent).not.toContain('Arbeitsort prüfen')
    expect(document.body.textContent).not.toContain('Setup berücksichtigen')
    expect(document.body.textContent).not.toContain('passende Impulse auswählen')
    expect(document.body.textContent).not.toContain('Tagesplan sortieren')
    expect(document.body.textContent).not.toContain('Move at work Plus')

    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    expect(document.body.textContent).toContain(
      'Dein persönlicher Tagesplan wird generiert.',
    )
    expect(complete).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    expect(complete).toHaveBeenCalledTimes(1)
  })
})

function officeOnlyAnswers() {
  return {
    fitnessLevel: 'balanced',
    goal: 'sit-less',
    situation: 'mixed-day',
    workplaces: ['office'],
    defaultWorkplace: 'office',
    currentWorkplace: 'office',
    workplaceSetups: {
      office: ['no-equipment'],
      homeoffice: ['no-equipment'],
    },
  }
}

function renderOnboarding({
  answers,
  initialCurrentIndex = 0,
}) {
  return renderToStaticMarkup(
    <Onboarding
      answers={answers}
      initialCurrentIndex={initialCurrentIndex}
      onChange={() => {}}
      onComplete={() => {}}
    />,
  )
}

async function renderInteractiveOnboarding({
  answers,
  initialCurrentIndex = 0,
  onComplete = () => {},
}) {
  const container = document.createElement('div')
  const root = createRoot(container)
  let currentAnswers = answers

  function handleChange(updater) {
    currentAnswers =
      typeof updater === 'function' ? updater(currentAnswers) : updater
    root.render(
      <Onboarding
        answers={currentAnswers}
        initialCurrentIndex={initialCurrentIndex}
        onChange={handleChange}
        onComplete={onComplete}
      />,
    )
  }

  document.body.append(container)

  await act(async () => {
    root.render(
      <Onboarding
        answers={currentAnswers}
        initialCurrentIndex={initialCurrentIndex}
        onChange={handleChange}
        onComplete={onComplete}
      />,
    )
  })

  return { container, root }
}

async function clickButton(label) {
  const button = getButtonByText(label)

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function getButtonByText(label) {
  return [...document.querySelectorAll('button')].find((element) =>
    element.textContent.includes(label),
  )
}
