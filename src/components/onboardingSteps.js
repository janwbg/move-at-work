import { getSelectedWorkplaces, getOptionLabel, workplaceOptions } from '../data/profileOptions.js'

export function getOnboardingSteps(answers) {
  const selectedWorkplaces = getSelectedWorkplaces(answers, true)
  const workplaces = workplaceOptions
    .map((workplace) => workplace.id)
    .filter((workplace) => selectedWorkplaces.includes(workplace))
  const steps = [
    {
      eyebrow: 'Start',
      helper:
        'Move at work gibt dir kurze Bewegungsimpulse für lange Schreibtischtage — passend zu deinem Tag, deiner Umgebung und deiner Zeit.',
      kind: 'landing',
      question:
        'Sitzphasen unterbrechen, ohne aus dem Arbeitstag rauszukommen.',
    },
    {
      eyebrow: 'Ziel',
      helper:
        'Wähle, worauf dein Tagesplan besonders achten soll. Du kannst deine Auswahl später anpassen.',
      kind: 'goal',
      question: 'Wobei soll dich Move at work unterstützen?',
    },
    {
      eyebrow: 'Arbeitsort',
      helper:
        'Move at work passt deine Empfehlungen daran an, ob du im Büro, im Homeoffice oder an beiden Orten arbeitest.',
      kind: 'workplaces',
      question: 'Wo findet dein Schreibtischtag meistens statt?',
    },
  ]

  for (const workplace of workplaces) {
    steps.push({
      eyebrow: 'Setup',
      helper:
        'Wähle alles aus, was für kurze Bewegungsimpulse realistisch nutzbar ist.',
      kind: `setup-${workplace}`,
      question: `Was hast du ${getSetupQuestionPlace(workplace)} zur Verfügung?`,
      workplace,
    })
  }

  if (workplaces.length > 0) {
    steps.push({
      eyebrow: 'Setup',
      helper: '',
      kind: 'setup-confirmation',
      question: '',
    })
  }

  if (workplaces.length > 1) {
    steps.push({
      eyebrow: 'Standard',
      helper:
        'Damit startet dein Tagesplan. Für einzelne Tage kannst du später einfach umschalten.',
      kind: 'default-workplace',
      question: 'Welcher Ort ist dein Standard?',
    })
  }

  return [
    ...steps,
    {
      eyebrow: 'Routine',
      helper:
        'Diese Tage nutzt Move at work für deine Routine, deinen Fortschritt und deine Erinnerungen.',
      kind: 'routine',
      question: 'An welchen Tagen möchtest du Move at work normalerweise nutzen?',
    },
    {
      eyebrow: 'Reminder',
      helper:
        'Du kannst auch ohne Erinnerungen starten. Wenn du sie aktivierst, bleiben sie lokal, ruhig und anpassbar.',
      kind: 'reminder',
      question: 'Soll Move at work dich erinnern?',
    },
    {
      eyebrow: 'Arbeitstag',
      helper:
        'Move at work nutzt das, um passende Empfehlungen für deinen Tagesplan auszuwählen.',
      kind: 'workday',
      question: 'Wie sieht dein typischer Tag aus?',
    },
    {
      eyebrow: 'Intensität',
      helper:
        'Wähle, was sich für deinen Alltag realistisch anfühlt. Lieber klein starten als gar nicht.',
      kind: 'intensity',
      question: 'Wie aktiv darf dein Bewegungsplan sein?',
    },
    {
      eyebrow: 'Bereit',
      helper:
        'Du bekommst kurze Empfehlungen, die zu deinem Schreibtischtag passen.',
      kind: 'final',
      question: 'Dein Bewegungsplan kann nun generiert werden.',
    },
  ]
}

function getSetupQuestionPlace(workplace) {
  return workplace === 'homeoffice'
    ? 'im Homeoffice'
    : `im ${getOptionLabel(workplaceOptions, workplace)}`
}
