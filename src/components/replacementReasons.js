export const replacementReasonGroups = [
  {
    id: 'work-situation',
    label: 'Arbeitssituation',
    options: [
      { id: 'meeting', label: 'Bin im Meeting' },
      { id: 'focus-work', label: 'Bin in Fokusarbeit' },
      { id: 'phone', label: 'Telefoniere gerade' },
      { id: 'between-tasks', label: 'Bin zwischen zwei Aufgaben' },
    ],
  },
  {
    id: 'time',
    label: 'Zeit',
    options: [
      { id: 'no-time', label: 'Habe wenig Zeit' },
      { id: 'shorter', label: 'Lieber kürzer' },
    ],
  },
  {
    id: 'environment',
    label: 'Umgebung',
    options: [
      { id: 'too-visible', label: 'Im Büro zu sichtbar' },
      { id: 'no-space', label: 'Kein Platz' },
      { id: 'setup-mismatch', label: 'Passt nicht zu meinem Setup' },
    ],
  },
  {
    id: 'body-energy',
    label: 'Energie und Körper',
    options: [
      { id: 'tired', label: 'Bin müde' },
      { id: 'too-hard', label: 'Zu anstrengend' },
      { id: 'neck-shoulder', label: 'Lieber Nacken/Schulter' },
      { id: 'back', label: 'Lieber Rücken' },
      { id: 'walk', label: 'Lieber gehen' },
      { id: 'calmer', label: 'Lieber ruhiger' },
    ],
  },
]

export const replacementReasonOptions = replacementReasonGroups.flatMap(
  (group) => group.options,
)
