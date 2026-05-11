import { describe, expect, it } from 'vitest'
import { getOnboardingSteps } from './onboardingSteps.js'

describe('Onboarding', () => {
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
})
