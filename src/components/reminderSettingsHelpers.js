export function getPauseStatus(quietUntil, now = new Date()) {
  if (!quietUntil) {
    return ''
  }

  const quietUntilDate = new Date(quietUntil)

  if (Number.isNaN(quietUntilDate.getTime()) || quietUntilDate <= now) {
    return ''
  }

  if (isTomorrowMorning(quietUntilDate, now)) {
    return 'Erinnerungen pausiert bis morgen.'
  }

  if (isSameDay(quietUntilDate, now) && quietUntilDate.getHours() >= 23) {
    return 'Erinnerungen pausiert für heute.'
  }

  return `Erinnerungen pausiert bis ${quietUntilDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })} Uhr.`
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function isTomorrowMorning(quietUntilDate, now) {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    isSameDay(quietUntilDate, tomorrow) &&
    quietUntilDate.getHours() === 8 &&
    quietUntilDate.getMinutes() === 0
  )
}
