export function getTimerActionLabel(timerState) {
  if (timerState === 'running') {
    return 'Pause'
  }

  if (timerState === 'paused') {
    return 'Fortsetzen'
  }

  if (timerState === 'idle') {
    return 'Timer starten'
  }

  return null
}

export function shouldAdvanceTimer({ completed, timerState }) {
  return !completed && timerState === 'running'
}
