# Move at work

Move at work ist ein React/Vite-MVP für kurze Bewegungsimpulse im Arbeitsalltag. Die App hilft dabei, mehr Bewegung in den Arbeitstag zu bringen und erstellt aus Ziel, Arbeitsplatz, Fitnesslevel und typischem Arbeitstag einen flexiblen Tagesplan.

## Lokal starten

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
```

## Aktueller MVP

- 4-stufiges Onboarding
- Auswahl von Ziel, Setup, Fitnesslevel und typischem Arbeitstag
- datengetriebene Bewegungsregeln
- flexibler Tagesplan ohne feste Uhrzeiten
- kompakte Übungskarten mit Details, Timer und Erledigt-Status
- Fortschritt für Tag, Woche und Tagesstreak
- einfache Reminder-Funktion, solange die App geöffnet ist
- Bewegungsprofil in den Einstellungen anpassbar
- Speicherung von Profil, Fortschritt und Reminder-Einstellungen in localStorage
- Tests für Regelmatrix, Plan-Generator, Profiloptionen und Fortschrittslogik

## MVP-Test

Ziel des Tests ist herauszufinden, ob Nutzer den Onboarding-Flow verstehen und ob die empfohlenen Bewegungsimpulse alltagstauglich wirken.

Getestet werden sollen:

- Verständlichkeit der Fragen und Antwortoptionen
- Qualität und Nachvollziehbarkeit des Tagesplans
- Lesbarkeit auf Smartphone und Desktop
- Vertrauen in Hinweise, Begründungen und Einschränkungen

Bekannte Einschränkungen:

- Empfehlungen basieren aktuell auf einer ersten Regelmatrix.
- Move at work ersetzt keine medizinische Beratung.
- Es gibt noch keine echte Kalenderintegration.
- Die Auswahl wird nur lokal im Browser per localStorage gespeichert.
- Es gibt keinen Login, keine Nutzerkonten und kein Backend.
