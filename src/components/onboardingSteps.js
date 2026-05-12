import { getSelectedWorkplaces, getOptionLabel, workplaceOptions } from '../data/profileOptions.js'

export function getOnboardingSteps(answers) {
  const workplaces = getSelectedWorkplaces(answers, true)
  const steps = [
    {
      eyebrow: 'Ziel',
      helper:
        'Wähle dein wichtigstes Ziel. Du kannst es später in den Einstellungen ändern.',
      kind: 'goal',
      question: 'Was möchtest du mit Move at work erreichen?',
    },
    {
      eyebrow: 'Arbeitsort',
      helper:
        'Wähle aus, ob du im Büro, im Homeoffice oder an beiden Orten arbeitest. Du kannst das später jederzeit in den Einstellungen anpassen.',
      kind: 'workplaces',
      question: 'Wo arbeitest du regelmäßig?',
    },
  ]

  for (const workplace of workplaces) {
    steps.push({
      eyebrow: 'Setup',
      helper:
        'Wähle alles aus, was du an diesem Arbeitsort regelmäßig nutzen kannst.',
      kind: `setup-${workplace}`,
      question: `Welches Setup steht dir ${getSetupQuestionPlace(workplace)} zur Verfügung?`,
      workplace,
    })
  }

  if (workplaces.length > 1) {
    steps.push({
      eyebrow: 'Standard',
      helper:
        'Du kannst den Arbeitsort für einzelne Tage später direkt im Heute-Bereich wechseln.',
      kind: 'default-workplace',
      question:
        'Welcher Arbeitsort soll standardmäßig für deinen Tagesplan verwendet werden?',
    })
  }

  return [
    ...steps,
    {
      eyebrow: 'Intensität',
      helper:
        'Wähle, was sich für dich im Arbeitsalltag realistisch anfühlt. Du kannst es später in den Einstellungen ändern.',
      kind: 'intensity',
      question: 'Wie aktiv sollen deine Bewegungsempfehlungen sein?',
    },
    {
      eyebrow: 'Arbeitstag',
      helper:
        'Diese Auswahl hilft Move at work, deinen Tagesplan grob zu strukturieren.',
      kind: 'workday',
      question: 'Wie sieht dein Arbeitstag meistens aus?',
    },
  ].map((step, index, list) => ({
    ...step,
    eyebrow: `Schritt ${index + 1} von ${list.length}`,
  }))
}

function getSetupQuestionPlace(workplace) {
  return workplace === 'homeoffice'
    ? 'im Homeoffice'
    : `im ${getOptionLabel(workplaceOptions, workplace)}`
}
