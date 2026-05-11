export function confirmRestartOnboarding(onRestartOnboarding, confirm = window.confirm) {
  const confirmed = confirm(
    'Möchtest du das Onboarding erneut starten? Dein Fortschritt bleibt erhalten.',
  )

  if (confirmed) {
    onRestartOnboarding()
  }

  return confirmed
}
