export const workplaceIds = ['office', 'homeoffice']

export const defaultProfile = {
  goal: 'sit-less',
  setup: ['no-equipment'],
  fitnessLevel: 'balanced',
  situation: 'mixed-day',
  workplaces: ['office'],
  defaultWorkplace: 'office',
  currentWorkplace: 'office',
  workplaceSetups: {
    office: ['no-equipment'],
    homeoffice: ['no-equipment'],
  },
}

export const workplaceOptions = [
  {
    id: 'office',
    label: 'Büro',
    icon: 'workplace-office',
    description:
      'Für Arbeitsplätze mit Kolleginnen, Meetings und gemeinsam genutzten Bereichen.',
  },
  {
    id: 'homeoffice',
    label: 'Homeoffice',
    icon: 'workplace-homeoffice',
    description: 'Für Tage zuhause mit etwas mehr Flexibilität.',
  },
]

export const goalOptions = [
  {
    id: 'sit-less',
    label: 'Weniger sitzen',
    icon: 'goal-sit-less',
    description:
      'Sitzphasen regelmäßiger unterbrechen.',
  },
  {
    id: 'more-energy',
    label: 'Mehr Bewegung',
    icon: 'goal-motion',
    description: 'Kleine Bewegungsimpulse in deinen Tag bringen.',
  },
  {
    id: 'back-neck',
    label: 'Rücken & Haltung',
    icon: 'goal-back',
    description:
      'Verspannungen vorbeugen und den Körper zwischendurch lockern.',
  },
  {
    id: 'focus',
    label: 'Fokus & Energie',
    icon: 'goal-focus',
    description:
      'Kurze Resets für lange Arbeits- oder Lernphasen.',
  },
]

export const setupOptions = [
  {
    id: 'no-equipment',
    label: 'Kein besonderes Equipment',
    icon: 'setup-none',
    description: 'Normaler Schreibtisch und Stuhl reichen aus.',
  },
  {
    id: 'standing-desk',
    label: 'Höhenverstellbarer Schreibtisch',
    icon: 'setup-desk',
    description: 'Für Sitz-Steh-Wechsel und kurze Stehphasen.',
  },
  {
    id: 'walking-pad',
    label: 'Walking Pad',
    icon: 'setup-walking-pad',
    description: 'Für langsames Gehen während geeigneter Aufgaben.',
  },
  {
    id: 'space',
    label: 'Platz für kurze Übungen',
    icon: 'setup-space',
    description:
      'Für Mobilisation und kurze Bewegungspausen neben dem Schreibtisch.',
  },
  {
    id: 'hallway',
    label: 'Flur in der Nähe',
    icon: 'setup-hallway',
    description:
      'Du kannst kurze Gehpausen oder Wege im Büro/Homeoffice nutzen.',
  },
  {
    id: 'stairs',
    label: 'Treppe in der Nähe',
    icon: 'setup-stairs',
    description:
      'Du kannst Treppen für kurze aktivierende Bewegungsimpulse nutzen.',
  },
  {
    id: 'resistance_band',
    label: 'Widerstandsband',
    icon: 'setup-band',
    description:
      'Für kurze Zug- und Mobilisationsimpulse am Arbeitsplatz.',
  },
  {
    id: 'balance_cushion',
    label: 'Balancekissen',
    icon: 'setup-cushion',
    description: 'Für kleine Sitz- und Stabilitätswechsel.',
  },
  {
    id: 'exercise_ball',
    label: 'Gymnastikball',
    icon: 'setup-ball',
    description: 'Für sanfte Mobilisation und kurze Lockerungsimpulse.',
  },
  {
    id: 'ergonomic-support',
    label: 'Ergonomische Sitz- oder Stehhilfe',
    icon: 'setup-ergonomic',
    description:
      'Fuer kurze Sitz-, Steh- und Gewichtswechsel mit vorhandener Unterstuetzung.',
  },
]

export const intensityOptions = [
  {
    id: 'gentle',
    label: 'Sanft',
    description: 'Ruhige Impulse mit niedriger Hürde.',
  },
  {
    id: 'balanced',
    label: 'Normal',
    description:
      'Eine ausgewogene Mischung für deinen Schreibtischtag.',
  },
  {
    id: 'active',
    label: 'Aktiver',
    description:
      'Mehr Bewegung, wenn du bewusst öfter rauskommen willst.',
  },
]

export const fitnessLevelOptions = intensityOptions

export const workdayOptions = [
  {
    id: 'focus-heavy',
    label: 'Fokusarbeit',
    icon: 'workday-focus',
    description: 'Für längere konzentrierte Arbeitsphasen.',
  },
  {
    id: 'meeting-heavy',
    label: 'Meetingtag',
    icon: 'workday-meeting',
    description:
      'Für Tage mit vielen Terminen und wenig Raum.',
  },
  {
    id: 'mixed-day',
    label: 'Gemischt',
    icon: 'workday-mixed',
    description:
      'Wenn dein Tag aus Fokus, Meetings und kurzen Pausen besteht.',
  },
  {
    id: 'study-day',
    label: 'Lern- oder Studientag',
    icon: 'workday-study',
    description:
      'Für lange Schreib-, Lern- oder Bibliothekstage.',
  },
  {
    id: 'tight-schedule',
    label: 'Wenig Zeit',
    icon: 'workday-tight',
    description:
      'Für enge Tage, an denen kurze Impulse besonders wichtig sind.',
  },
]

export const workPhaseOptions = [
  {
    id: 'focus',
    label: 'Fokusarbeit',
    description:
      'Für konzentriertes Arbeiten mit möglichst wenig Unterbrechung.',
  },
  {
    id: 'meeting',
    label: 'Meeting',
    description: 'Für Termine, Calls oder Abstimmungen.',
  },
  {
    id: 'phone',
    label: 'Telefonat',
    description: 'Für Gespräche, bei denen du dich nebenbei bewegen kannst.',
  },
  {
    id: 'break',
    label: 'Pause',
    description: 'Für kurze aktive Erholung weg vom Schreibtisch.',
  },
  {
    id: 'between-tasks',
    label: 'Zwischen zwei Aufgaben',
    description: 'Für einen kurzen Reset, bevor du weitermachst.',
  },
]

const goalAliases = {
  'Bessere Haltung': 'back-neck',
  'Bessere Konzentration': 'focus',
  'Bewegung zur Gewohnheit machen': 'sit-less',
  'Kraft aufbauen': 'sit-less',
  'Mehr Bewegung im Arbeitsalltag': 'sit-less',
  'Ruecken & Nacken entlasten': 'back-neck',
  'Weniger Rueckenschmerzen': 'back-neck',
  'Weniger Rückenschmerzen': 'back-neck',
  'Weniger sitzen': 'sit-less',
  'gegen Verspannungen': 'back-neck',
  habit: 'sit-less',
  routine: 'sit-less',
  Routine: 'sit-less',
  'mehr Bewegung': 'sit-less',
  'mehr Energie': 'more-energy',
}

const setupAliases = {
  'Balance Board': 'balance_cushion',
  Boden: 'space',
  'Bürostuhl': 'no-equipment',
  Buerostuhl: 'no-equipment',
  Ergometer: 'exercise_ball',
  'exercise-space': 'space',
  Gymnastikball: 'exercise_ball',
  'Hoehenverstellbarer Schreibtisch': 'standing-desk',
  'Höhenverstellbarer Schreibtisch': 'standing-desk',
  Kniestuhl: [],
  'Kein Equipment': 'no-equipment',
  'Kein besonderes Equipment': 'no-equipment',
  'Kein spezielles Equipment': 'no-equipment',
  'Kleines Bewegungsequipment': [
    'resistance_band',
    'balance_cushion',
    'exercise_ball',
  ],
  'Platz fuer kurze Uebungen': 'space',
  'Platz für kurze Übungen': 'space',
  'Resistance Band': 'resistance_band',
  Widerstandsband: 'resistance_band',
  Balancekissen: 'balance_cushion',
  Sitzschreibtisch: 'no-equipment',
  'Sofa/Lounge': [],
  Stehschreibtisch: 'standing-desk',
  Stehhocker: [],
  hallway: 'hallway',
  Flur: 'hallway',
  'Flur in der Nähe': 'hallway',
  'Flur oder kurzer Weg in der Nähe': 'hallway',
  stairs: 'stairs',
  Treppenstufen: 'stairs',
  'Treppe in der Nähe': 'stairs',
  'stairs-hallway': ['hallway', 'stairs'],
  'Treppe oder Flur in der Naehe': ['hallway', 'stairs'],
  'Treppe oder Flur in der Nähe': ['hallway', 'stairs'],
  'Walking Pad': 'walking-pad',
  'ergonomic-support': 'ergonomic-support',
  'small-equipment': [
    'resistance_band',
    'balance_cushion',
    'exercise_ball',
  ],
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
  Lernen: 'study-day',
  'Lern- oder Studientag': 'study-day',
  Lerntag: 'study-day',
  'Langer Arbeitstag': 'mixed-day',
  Meeting: 'meeting-heavy',
  'Meeting Kamera an': 'meeting-heavy',
  'Meeting Kamera aus': 'meeting-heavy',
  Meetingtag: 'meeting-heavy',
  'Mixed Day': 'mixed-day',
  Pause: 'mixed-day',
  Studientag: 'study-day',
  Telefonat: 'meeting-heavy',
  'Viel Fokusarbeit': 'focus-heavy',
  'Viele Meetings': 'meeting-heavy',
  'Wenig Zeit': 'tight-schedule',
  'Wenig Zeit / enge Taktung': 'tight-schedule',
  'enge Taktung': 'tight-schedule',
}

const workplaceAliases = {
  Buero: 'office',
  Gemischt: 'mixed',
  Homeoffice: 'homeoffice',
  office: 'office',
  mixed: 'mixed',
  homeoffice: 'homeoffice',
}

const validGoalIds = new Set(goalOptions.map((option) => option.id))
const validSetupIds = new Set(setupOptions.map((option) => option.id))
const validIntensityIds = new Set(intensityOptions.map((option) => option.id))
const validWorkdayIds = new Set(workdayOptions.map((option) => option.id))
const validWorkplaceIds = new Set(workplaceIds)

export function normalizeProfileAnswers(answers = {}) {
  const rawAnswers = answers
  const normalized = {
    ...defaultProfile,
    ...answers,
  }
  const workplaces = normalizeWorkplaces(rawAnswers)
  const defaultWorkplace = normalizeDefaultWorkplace(
    normalized.defaultWorkplace,
    workplaces,
  )
  const currentWorkplace = normalizeCurrentWorkplace(
    normalized.currentWorkplace,
    workplaces,
    defaultWorkplace,
  )
  const workplaceSetups = normalizeWorkplaceSetups(
    rawAnswers.workplaceSetups,
    workplaces,
    rawAnswers.setup,
    defaultWorkplace,
  )

  return {
    goal: normalizeGoal(normalized.goal),
    setup: workplaceSetups[defaultWorkplace],
    fitnessLevel: normalizeIntensity(normalized.fitnessLevel),
    situation: normalizeWorkday(normalized.situation),
    workplaces,
    defaultWorkplace,
    currentWorkplace,
    workplaceSetups,
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

export function toggleWorkplaceSelection(profile, workplaceId) {
  const currentWorkplaces = getSelectedWorkplaces(profile, true)
  const exists = currentWorkplaces.includes(workplaceId)
  const nextWorkplaces = exists
    ? currentWorkplaces.filter((workplace) => workplace !== workplaceId)
    : [...currentWorkplaces, workplaceId]
  const workplaces = nextWorkplaces.length ? nextWorkplaces : currentWorkplaces

  return normalizeProfileAnswers({
    ...profile,
    workplaces,
  })
}

export function updateWorkplaceSetup(profile, workplaceId, setupId) {
  const normalized = normalizeProfileAnswers(profile)

  return normalizeProfileAnswers({
    ...normalized,
    workplaceSetups: {
      ...normalized.workplaceSetups,
      [workplaceId]: toggleSetupSelection(
        normalized.workplaceSetups[workplaceId],
        setupId,
      ),
    },
  })
}

export function updateDefaultWorkplace(profile, workplaceId) {
  return normalizeProfileAnswers({
    ...profile,
    defaultWorkplace: workplaceId,
    currentWorkplace: workplaceId,
  })
}

export function deriveWorkPhaseFromWorkday(workday) {
  const normalizedWorkday = normalizeWorkday(workday)

  if (['focus-heavy', 'study-day'].includes(normalizedWorkday)) {
    return 'focus'
  }

  if (normalizedWorkday === 'meeting-heavy') {
    return 'meeting'
  }

  return 'between-tasks'
}

export function isValidWorkdayType(workdayType) {
  return validWorkdayIds.has(workdayType)
}

export function getOptionLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id
}

export function normalizeWorkdayType(workdayType) {
  return normalizeWorkday(workdayType)
}

export function getEffectiveWorkplace(profileOrWorkplace) {
  if (typeof profileOrWorkplace === 'string') {
    return workplaceAliases[profileOrWorkplace] === 'homeoffice'
      ? 'homeoffice'
      : 'office'
  }

  return normalizeProfileAnswers(profileOrWorkplace).currentWorkplace
}

export function getSelectedWorkplaces(profile, allowEmpty = false) {
  const rawWorkplaces = Array.isArray(profile?.workplaces)
    ? profile.workplaces
    : workplacesFromLegacyProfile(profile?.workplaceProfile ?? profile?.workplace)
  const workplaces = rawWorkplaces.filter((workplace) =>
    validWorkplaceIds.has(workplace),
  )

  if (workplaces.length || allowEmpty) {
    return [...new Set(workplaces)]
  }

  return defaultProfile.workplaces
}

export function getWorkplaceTodayLabel(profile, currentWorkplace) {
  const normalized = normalizeProfileAnswers({
    ...profile,
    currentWorkplace,
  })
  return getOptionLabel(workplaceOptions, normalized.currentWorkplace)
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
    .flatMap((item) => {
      if (validSetupIds.has(item)) {
        return item
      }

      return setupAliases[item] ?? []
    })
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

function normalizeWorkplaces(profile) {
  const workplaces = getSelectedWorkplaces(profile)
  return workplaces.length ? workplaces : defaultProfile.workplaces
}

function normalizeDefaultWorkplace(defaultWorkplace, workplaces) {
  if (workplaces.includes(defaultWorkplace)) {
    return defaultWorkplace
  }

  return workplaces[0] ?? defaultProfile.defaultWorkplace
}

function normalizeCurrentWorkplace(
  currentWorkplace,
  workplaces,
  defaultWorkplace,
) {
  if (workplaces.includes(currentWorkplace)) {
    return currentWorkplace
  }

  return defaultWorkplace
}

function normalizeWorkplaceSetups(
  workplaceSetups,
  workplaces,
  legacySetup,
  defaultWorkplace,
) {
  const normalizedSetups = {
    office: normalizeSetup(workplaceSetups?.office),
    homeoffice: normalizeSetup(workplaceSetups?.homeoffice),
  }

  if (!workplaceSetups && legacySetup?.length) {
    normalizedSetups[defaultWorkplace] = normalizeSetup(legacySetup)
  }

  for (const workplace of workplaces) {
    normalizedSetups[workplace] = normalizeSetup(normalizedSetups[workplace])
  }

  return normalizedSetups
}

function workplacesFromLegacyProfile(workplaceProfile) {
  const normalizedWorkplace = workplaceAliases[workplaceProfile]

  if (normalizedWorkplace === 'mixed') {
    return ['office', 'homeoffice']
  }

  if (normalizedWorkplace === 'homeoffice') {
    return ['homeoffice']
  }

  if (normalizedWorkplace === 'office') {
    return ['office']
  }

  return []
}
