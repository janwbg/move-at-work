import { describe, expect, it } from 'vitest'
import { getOnboardingSteps } from './onboardingSteps.js'

describe('Onboarding', () => {
  it('contains the workplace selection step', () => {
    const steps = getOnboardingSteps({})

    expect(steps.map((step) => step.question)).toContain(
      'Wo arbeitest du regelmaessig?',
    )
    expect(
      steps.find((step) => step.question === 'Wo arbeitest du regelmaessig?')
        ?.helper,
    ).toContain('beiden Orten')
  })

  it('adds setup steps for every selected workplace and a default step for both', () => {
    const steps = getOnboardingSteps({
      workplaces: ['office', 'homeoffice'],
    })

    expect(steps.map((step) => step.question)).toContain(
      'Welches Setup steht dir im Buero zur Verfuegung?',
    )
    expect(steps.map((step) => step.question)).toContain(
      'Welches Setup steht dir im Homeoffice zur Verfuegung?',
    )
    expect(steps.map((step) => step.question)).toContain(
      'Welcher Arbeitsort soll standardmaessig fuer deinen Tagesplan verwendet werden?',
    )
  })
})
