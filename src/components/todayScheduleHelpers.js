export function getActiveScheduleIndex({
  completedIds = [],
  now = new Date(),
  sections = [],
} = {}) {
  const completedIdSet = new Set(completedIds)
  const openEntries = sections
    .map((section, index) => ({
      index,
      section,
      startMinutes: getStartMinutes(section),
    }))
    .filter(({ section }) => !completedIdSet.has(section.id))

  if (!openEntries.length) {
    return null
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const dueEntries = openEntries.filter(
    ({ startMinutes }) => startMinutes !== null && startMinutes <= nowMinutes,
  )

  if (dueEntries.length) {
    return dueEntries.reduce((latest, entry) =>
      entry.startMinutes >= latest.startMinutes ? entry : latest,
    ).index
  }

  const futureEntries = openEntries.filter(
    ({ startMinutes }) => startMinutes !== null && startMinutes > nowMinutes,
  )

  if (futureEntries.length) {
    return futureEntries.reduce((earliest, entry) =>
      entry.startMinutes < earliest.startMinutes ? entry : earliest,
    ).index
  }

  return openEntries[0].index
}

function getStartMinutes(section) {
  const startTime = section?.slotWindowMeta?.startTime

  if (!startTime) {
    return null
  }

  const [hours, minutes] = startTime.split(':').map(Number)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null
  }

  return hours * 60 + minutes
}
