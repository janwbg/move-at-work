export const defaultProfile = {
  goal: 'habit',
  setup: ['no-equipment'],
  fitnessLevel: 'balanced',
  situation: 'mixed-day',
}

export const goalOptions = [
  {
    id: 'sit-less',
    label: 'Weniger sitzen',
    description:
      'Lange Sitzphasen unterbrechen und oefter die Position wechseln.',
  },
  {
    id: 'more-energy',
    label: 'Mehr Energie im Arbeitstag',
    description: 'Dich wacher, aktiver und weniger traege fuehlen.',
  },
  {
    id: 'back-neck',
    label: 'Ruecken & Nacken entlasten',
    description: 'Schultern, Nacken und Ruecken regelmaessig mobilisieren.',
  },
  {
    id: 'focus',
    label: 'Konzentration halten',
    description:
      'Kurze Bewegung nutzen, ohne aus dem Arbeitsfluss zu kommen.',
  },
  {
    id: 'habit',
    label: 'Bewegung zur Gewohnheit machen',
    description: 'Mit kleinen Schritten regelmaessig aktiver werden.',
  },
]

export const setupOptions = [
  {
    id: 'no-equipment',
    label: 'Kein besonderes Equipment',
    description: 'Normaler Schreibtisch und Stuhl reichen aus.',
  },
  {
    id: 'standing-desk',
    label: 'Hoehenverstellbarer Schreibtisch',
    description: 'Fuer Sitz-Steh-Wechsel und kurze Stehphasen.',
  },
  {
    id: 'walking-pad',
    label: 'Walking Pad',
    description: 'Fuer langsames Gehen waehrend geeigneter Aufgaben.',
  },
  {
    id: 'exercise-space',
    label: 'Platz fuer kurze Uebungen',
    description:
      'Fuer Mobilisation und kurze Bewegungspausen neben dem Schreibtisch.',
  },
  {
    id: 'small-equipment',
    label: 'Kleines Bewegungsequipment',
    description:
      'Zum Beispiel Widerstandsband, Balancekissen oder Gymnastikball.',
  },
  {
    id: 'stairs-hallway',
    label: 'Treppe oder Flur in der Naehe',
    description: 'Fuer kurze Gehimpulse und Mini-Pausen.',
  },
  {
    id: 'ergonomic-support',
    label: 'Ergonomische Sitz- oder Stehhilfe',
    description: 'Zum Beispiel Stehhocker, Aktivstuhl oder Stehmatte.',
  },
]

export const intensityOptions = [
  {
    id: 'gentle',
    label: 'Sanft',
    description: 'Sehr einfache Bewegungen mit wenig Anstrengung.',
  },
  {
    id: 'balanced',
    label: 'Ausgeglichen',
    description:
      'Alltagstaugliche Bewegung, die aktiviert, aber nicht ueberfordert.',
  },
  {
    id: 'active',
    label: 'Aktiv',
    description:
      'Dynamischere Impulse, laengere Gehphasen und etwas mehr Intensitaet.',
  },
]

export const fitnessLevelOptions = intensityOptions

export const workdayOptions = [
  {
    id: 'focus-heavy',
    label: 'Viel Fokusarbeit',
    description: 'Du arbeitest haeufig laengere Zeit konzentriert an Aufgaben.',
  },
  {
    id: 'meeting-heavy',
    label: 'Viele Meetings',
    description:
      'Dein Tag besteht oft aus Terminen, Abstimmungen oder Calls.',
  },
  {
    id: 'mixed-day',
    label: 'Gemischter Arbeitstag',
    description:
      'Dein Tag wechselt zwischen Fokusarbeit, Meetings und Pausen.',
  },
]

export const workPhaseOptions = [
  {
    id: 'focus',
    label: 'Fokusarbeit',
    description:
      'Fuer konzentriertes Arbeiten mit moeglichst wenig Unterbrechung.',
  },
  {
    id: 'meeting',
    label: 'Meeting',
    description: 'Fuer Termine, Calls oder Abstimmungen.',
  },
  {
    id: 'phone',
    label: 'Telefonat',
    description: 'Fuer Gespraeche, bei denen du dich nebenbei bewegen kannst.',
  },
  {
    id: 'break',
    label: 'Pause',
    description: 'Fuer kurze aktive Erholung weg vom Schreibtisch.',
  },
  {
    id: 'between-tasks',
    label: 'Zwischen zwei Aufgaben',
    description: 'Fuer einen kurzen Reset, bevor du weitermachst.',
  },
]

const goalAliases = {
  'Bessere Haltung': 'back-neck',
  'Bessere Konzentration': 'focus',
  'Kraft aufbauen': 'habit',
  'Mehr Bewegung im Arbeitsalltag': 'sit-less',
  'Ruecken & Nacken entlasten': 'back-neck',
  'Weniger Rueckenschmerzen': 'back-neck',
  'Weniger RÃ¼ckenschmerzen': 'back-neck',
  'Weniger sitzen': 'sit-less',
  'gegen Verspannungen': 'back-neck',
  'mehr Bewegung': 'sit-less',
  'mehr Energie': 'more-energy',
}

const setupAliases = {
  'Balance Board': 'small-equipment',
  Boden: 'exercise-space',
  'BÃ¼rostuhl': 'no-equipment',
  Buerostuhl: 'no-equipment',
  'Bürostuhl': 'no-equipment',
  Ergometer: 'small-equipment',
  Gymnastikball: 'small-equipment',
  'Hoehenverstellbarer Schreibtisch': 'standing-desk',
  'HÃ¶henverstellbarer Schreibtisch': 'standing-desk',
  'Höhenverstellbarer Schreibtisch': 'standing-desk',
  Kniestuhl: 'ergonomic-support',
  'Kein Equipment': 'no-equipment',
  'Kein besonderes Equipment': 'no-equipment',
  'Kein spezielles Equipment': 'no-equipment',
  'Kleines Bewegungsequipment': 'small-equipment',
  'Platz fuer kurze Uebungen': 'exercise-space',
  Sitzschreibtisch: 'no-equipment',
  'Sofa/Lounge': 'ergonomic-support',
  Stehschreibtisch: 'standing-desk',
  Stehhocker: 'ergonomic-support',
  Treppenstufen: 'stairs-hallway',
  'Treppe oder Flur in der Naehe': 'stairs-hallway',
  'Walking Pad': 'walking-pad',
}

const intensityAliases = {
  Aktiv: 'active',
  Ausgeglichen: 'balanced',
  Einsteiger: 'gentle',
  Fortgeschritten: 'active',
  'Level 1': 'gentle',
  'Level 2': 'gentle',
  'Level 3': 'balanced',
  'Level 4': 'active',
  'Level 5': 'active',
  Sanft: 'gentle',
}

const workdayAliases = {
  Brainstorming: 'mixed-day',
  'Deep Work': 'focus-heavy',
  'E-Mails': 'mixed-day',
  Fokusarbeit: 'focus-heavy',
  Fokustag: 'focus-heavy',
  Kreativarbeit: 'mixed-day',
  Lesen: 'focus-heavy',
  Lernen: 'focus-heavy',
  'Langer Arbeitstag': 'mixed-day',
  Meeting: 'meeting-heavy',
  'Meeting Kamera an': 'meeting-heavy',
  'Meeting Kamera aus': 'meeting-heavy',
  Meetingtag: 'meeting-heavy',
  'Mixed Day': 'mixed-day',
  Pause: 'mixed-day',
  Telefonat: 'meeting-heavy',
  'Viel Fokusarbeit': 'focus-heavy',
  'Viele Meetings': 'meeting-heavy',
}

const validGoalIds = new Set(goalOptions.map((option) => option.id))
const validSetupIds = new Set(setupOptions.map((option) => option.id))
const validIntensityIds = new Set(intensityOptions.map((option) => option.id))
const validWorkdayIds = new Set(workdayOptions.map((option) => option.id))

export function normalizeProfileAnswers(answers) {
  const normalized = {
    ...defaultProfile,
    ...answers,
  }

  return {
    goal: normalizeGoal(normalized.goal),
    setup: normalizeSetup(normalized.setup),
    fitnessLevel: normalizeIntensity(normalized.fitnessLevel),
    situation: normalizeWorkday(normalized.situation),
  }
}

export function toggleSetupSelection(currentSetup, setupId) {
  const setup = normalizeSetup(currentSetup)

  if (setupId === 'no-equipment') {
    return ['no-equipment']
  }

  const withoutFallback = setup.filter((item) => item !== 'no-equipment')
  const exists = withoutFallback.includes(setupId)
  const nextSetup = exists
    ? withoutFallback.filter((item) => item !== setupId)
    : [...withoutFallback, setupId]

  return nextSetup.length ? nextSetup : ['no-equipment']
}

export function deriveWorkPhaseFromWorkday(workday) {
  const normalizedWorkday = normalizeWorkday(workday)

  if (normalizedWorkday === 'focus-heavy') {
    return 'focus'
  }

  if (normalizedWorkday === 'meeting-heavy') {
    return 'meeting'
  }

  return 'between-tasks'
}

export function getOptionLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id
}

function normalizeGoal(goal) {
  if (validGoalIds.has(goal)) {
    return goal
  }

  return goalAliases[goal] ?? defaultProfile.goal
}

function normalizeSetup(setup) {
  const rawSetup = Array.isArray(setup) ? setup : [setup].filter(Boolean)
  const normalizedSetup = rawSetup
    .map((item) => (validSetupIds.has(item) ? item : setupAliases[item]))
    .filter(Boolean)

  if (!normalizedSetup.length) {
    return defaultProfile.setup
  }

  const uniqueSetup = [...new Set(normalizedSetup)]

  if (uniqueSetup.length > 1) {
    return uniqueSetup.filter((item) => item !== 'no-equipment')
  }

  return uniqueSetup
}

function normalizeIntensity(fitnessLevel) {
  if (validIntensityIds.has(fitnessLevel)) {
    return fitnessLevel
  }

  return intensityAliases[fitnessLevel] ?? defaultProfile.fitnessLevel
}

function normalizeWorkday(situation) {
  if (validWorkdayIds.has(situation)) {
    return situation
  }

  return workdayAliases[situation] ?? defaultProfile.situation
}
