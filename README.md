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

## Externer MVP-Test

Der externe MVP-Test soll zeigen, ob Move at work für echte Arbeitstage verständlich, hilfreich und wiederverwendbar ist. Feedback wird über einen Microsoft-Forms-Link gesammelt:

https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=_skZ9LD3h02-6OjfshkMq0iBY0yGNnBAlYv4W7o8vNRUNVVEV0JYSVYzRlZFSUpXWVVHVUVNNktMTS4u

Lokale Funktionen:

- Bewegungsprofil, Reminder-Einstellungen und Fortschritt werden im Browser per localStorage gespeichert.
- Es gibt keine serverseitige Speicherung und keine Synchronisierung zwischen Geräten.

Bekannte Einschränkungen:

- kein Login
- kein Backend
- keine Kalenderintegration
- keine echten Push Notifications
- keine medizinische Beratung

## Deployment

Die App ist als statische Vite-App deploybar, zum Beispiel über Vercel oder Netlify.

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`