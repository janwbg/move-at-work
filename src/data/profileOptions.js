export const workplaceIds = ['office', 'homeoffice']

export const defaultProfile = {
  goal: 'habit',
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
    label: 'Buero',
    description:
      'Ich arbeite regelmaessig im Buero oder an einem festen Arbeitsplatz im Unternehmen.',
  },
  {
    id: 'homeoffice',
    label: 'Homeoffice',
    description: 'Ich arbeite regelmaessig von zuhause.',
  },
]

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
  'Weniger RÃƒÂ¼ckenschmerzen': 'back-neck',
  'Weniger sitzen': 'sit-less',
  'gegen Verspannungen': 'back-neck',
  'mehr Bewegung': 'sit-less',
  'mehr Energie': 'more-energy',
}

const setupAliases = {
  'Balance Board': 'small-equipment',
  Boden: 'exercise-space',
  'BÃƒÂ¼rostuhl': 'no-equipment',
  Buerostuhl: 'no-equipment',
  'BÃ¼rostuhl': 'no-equipment',
  Ergometer: 'small-equipment',
  Gymnastikball: 'small-equipment',
  'Hoehenverstellbarer Schreibtisch': 'standing-desk',
  'HÃƒÂ¶henverstellbarer Schreibtisch': 'standing-desk',
  'HÃ¶henverstellbarer Schreibtisch': 'standing-desk',
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
