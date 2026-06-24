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
        'Move at work erstellt kurze Bewegungsimpulse für Büro, Homeoffice oder Lernphasen. Ohne Sportkleidung, ohne schlechtes Gewissen und ohne komplizierte Planung.',
      kind: 'landing',
      question:
        'Bewegung, die in deinen Tag passt — ohne dass du sie planen musst.',
    },
    {
      eyebrow: 'Ziel',
      helper:
        'Wähle aus, was dir im Alltag am meisten helfen soll. Du kannst es später in den Einstellungen ändern.',
      kind: 'goal',
      question: 'Was möchtest du mit Move at work erreichen?',
    },
    {
      eyebrow: 'Arbeitsort',
      helper:
        'Wähle einen oder beide Orte aus. Du kannst das später jederzeit anpassen.',
      kind: 'workplaces',
      question: 'Wo arbeitest du regelmäßig?',
    },
  ]

  for (const workplace of workplaces) {
    steps.push({
      eyebrow: 'Setup',
      helper:
        `Jetzt richten wir dein ${getOptionLabel(workplaceOptions, workplace)}-Setup ein.`,
      kind: `setup-${workplace}`,
      question: `Was steht dir ${getSetupQuestionPlace(workplace)} zur Verfügung?`,
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
        'Du kannst den Arbeitsort für einzelne Tage später direkt im Heute-Bereich wechseln.',
      kind: 'default-workplace',
      question: 'Wo startest du meistens in den Tag?',
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
        'Diese Auswahl hilft Move at work, deinen Tagesplan grob zu strukturieren.',
      kind: 'workday',
      question: 'Was beschreibt deinen typischen Arbeits- oder Lernalltag am besten?',
    },
    {
      eyebrow: 'Intensität',
      helper:
        'Wähle, was sich für dich im Arbeitsalltag realistisch anfühlt. Wenn dein Tag mal anders läuft, kannst du das direkt im Tagesplan ändern.',
      kind: 'intensity',
      question: 'Wie aktiv sollen deine Bewegungsempfehlungen sein?',
    },
    {
      eyebrow: 'Bereit',
      helper:
        'Move at work nutzt deine Angaben lokal, um einen Tagesplan mit kurzen, passenden Impulsen zu erstellen.',
      kind: 'final',
      question: 'Bereit für deinen ersten Tagesplan?',
    },
  ]
}

function getSetupQuestionPlace(workplace) {
  return workplace === 'homeoffice'
    ? 'im Homeoffice'
    : `im ${getOptionLabel(workplaceOptions, workplace)}`
}
