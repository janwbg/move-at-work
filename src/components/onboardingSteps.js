import { getSelectedWorkplaces, getOptionLabel, workplaceOptions } from '../data/profileOptions.js'

export function getOnboardingSteps(answers) {
  const workplaces = getSelectedWorkplaces(answers, true)
  const steps = [
    {
      eyebrow: 'Arbeitsort',
      helper:
        'Waehle aus, ob du im Buero, im Homeoffice oder an beiden Orten arbeitest. Du kannst das spaeter jederzeit in den Einstellungen anpassen.',
      kind: 'workplaces',
      question: 'Wo arbeitest du regelmaessig?',
    },
  ]

  for (const workplace of workplaces) {
    steps.push({
      eyebrow: 'Setup',
      helper:
        'Waehle alles aus, was du an diesem Arbeitsort regelmaessig nutzen kannst.',
      kind: `setup-${workplace}`,
      question: `Welches Setup steht dir ${getSetupQuestionPlace(workplace)} zur Verfuegung?`,
      workplace,
    })
  }

  if (workplaces.length > 1) {
    steps.push({
      eyebrow: 'Standard',
      helper:
        'Du kannst den Arbeitsort fuer einzelne Tage spaeter direkt im Heute-Bereich wechseln.',
      kind: 'default-workplace',
      question:
        'Welcher Arbeitsort soll standardmaessig fuer deinen Tagesplan verwendet werden?',
    })
  }

  return [
    ...steps,
    {
      eyebrow: 'Ziel',
      helper:
        'Waehle dein wichtigstes Ziel. Du kannst es spaeter in den Einstellungen aendern.',
      kind: 'goal',
      question: 'Was moechtest du mit Move at work erreichen?',
    },
    {
      eyebrow: 'Intensitaet',
      helper:
        'Waehle, was sich fuer dich im Arbeitsalltag realistisch anfuehlt. Du kannst es spaeter in den Einstellungen aendern.',
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
