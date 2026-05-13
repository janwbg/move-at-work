import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Onboarding from './Onboarding.jsx'
import { getOnboardingSteps } from './onboardingSteps.js'

describe('Onboarding', () => {
  it('shows the goal selection as the first onboarding step', () => {
    const steps = getOnboardingSteps({})

    expect(steps[0]).toMatchObject({
      kind: 'goal',
      question: 'Was möchtest du mit Move at work erreichen?',
    })
    expect(steps[1]).toMatchObject({
      kind: 'workplaces',
      question: 'Wo arbeitest du regelmäßig?',
    })
  })

  it('contains the workplace selection step', () => {
    const steps = getOnboardingSteps({})

    expect(steps.map((step) => step.question)).toContain(
      'Wo arbeitest du regelmäßig?',
    )
    expect(
      steps.find((step) => step.question === 'Wo arbeitest du regelmäßig?')
        ?.helper,
    ).toContain('beiden Orten')
  })

  it('adds setup steps for every selected workplace and a default step for both', () => {
    const steps = getOnboardingSteps({
      workplaces: ['office', 'homeoffice'],
    })

    expect(steps.map((step) => step.question)).toContain(
      'Welches Setup steht dir im Büro zur Verfügung?',
    )
    expect(steps.map((step) => step.question)).toContain(
      'Welches Setup steht dir im Homeoffice zur Verfügung?',
    )
    expect(steps.map((step) => step.question)).toContain(
      'Welcher Arbeitsort soll standardmäßig für deinen Tagesplan verwendet werden?',
    )
  })

  it('keeps the progress bar but hides step count and percentage labels', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'habit',
        workplaces: ['office', 'homeoffice'],
      },
      initialCurrentIndex: 1,
    })

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-label="Onboarding-Fortschritt"')
    expect(html).not.toContain('Schritt 2 von')
    expect(html).not.toContain('%</span>')
  })

  it('keeps the workplace step visible after workplace answers change', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'back-neck',
        workplaces: ['office', 'homeoffice'],
      },
      initialCurrentIndex: 1,
    })

    expect(html).toContain('Wo arbeitest du regelmäßig?')
    expect(html).toContain('Büro')
    expect(html).toContain('Homeoffice')
    expect(html).not.toContain('Was möchtest du mit Move at work erreichen?')
  })

  it('shows office before homeoffice in the default workplace step', () => {
    const html = renderOnboarding({
      answers: {
        goal: 'habit',
        workplaces: ['homeoffice', 'office'],
        defaultWorkplace: 'office',
        workplaceSetups: {
          office: ['no-equipment'],
          homeoffice: ['no-equipment'],
        },
      },
      initialCurrentIndex: 4,
    })

    expect(html.indexOf('Büro')).toBeLessThan(html.indexOf('Homeoffice'))
  })
})

function renderOnboarding({ answers, initialCurrentIndex = 0 }) {
  return renderToStaticMarkup(
    <Onboarding
      answers={answers}
      initialCurrentIndex={initialCurrentIndex}
      onChange={() => {}}
      onComplete={() => {}}
    />,
  )
}
