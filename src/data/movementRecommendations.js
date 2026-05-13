export const movementRecommendations = [
  {
    id: "neck-mobility-focus",
    title: "Nacken kurz mobilisieren",
    description: "Löse Schultern und Nacken mit einer kurzen Mobilisation direkt am Arbeitsplatz.",
    durationMinutes: 2,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "neck",
      "shoulders"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und stelle beide Füße stabil auf den Boden.",
      "Lasse die Schultern locker nach unten sinken.",
      "Neige den Kopf langsam zur rechten und danach zur linken Seite.",
      "Drehe den Kopf anschließend langsam nach rechts und links.",
      "Wiederhole jede Richtung ruhig und kontrolliert."
    ],
    reason: "Gut nach längerer Bildschirmarbeit.",
    explanation: "Diese Empfehlung hilft dir, Nacken und Schultern nach Fokusphasen kurz zu entlasten.",
    similarityGroup: "neck-shoulder",
    priority: 92
  },
  {
    id: "shoulder-circles-desk",
    title: "Schultern kreisen lassen",
    description: "Kreise die Schultern langsam nach hinten und vorne, ohne den Arbeitsfluss stark zu unterbrechen.",
    durationMinutes: 2,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "upper-back"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin oder stelle dich locker an den Schreibtisch.",
      "Lasse die Arme entspannt neben dem Körper hängen.",
      "Kreise beide Schultern langsam nach hinten.",
      "Wechsle danach die Richtung und kreise langsam nach vorne.",
      "Halte die Bewegung klein, ruhig und gleichmäßig."
    ],
    reason: "Diskret und gut am Arbeitsplatz machbar.",
    explanation: "Der Impuls passt, wenn Schultern und Haltung nach sitzender Arbeit kurz Aufmerksamkeit brauchen.",
    similarityGroup: "neck-shoulder",
    priority: 88
  },
  {
    id: "seated-posture-reset",
    title: "Sitzhaltung neu ausrichten",
    description: "Rücke kurz vom Tisch weg, stelle beide Füße stabil auf und richte dich neu aus.",
    durationMinutes: 2,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "lower-back",
      "hips"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Rücke ein kleines Stück vom Tisch weg.",
      "Stelle beide Füße stabil und etwa hüftbreit auf den Boden.",
      "Richte Becken, Rücken und Kopf bewusst neu aus.",
      "Lasse die Schultern locker sinken.",
      "Setze dich danach bewusst in einer leicht veränderten Position wieder an den Tisch."
    ],
    reason: "Hilft dir, langes Sitzen kurz zu unterbrechen.",
    explanation: "Ein ruhiger Sitz-Reset bringt Bewegung in die Haltung, ohne dass du deinen Arbeitsplatz verlassen musst.",
    similarityGroup: "sit-reset",
    priority: 90
  },
  {
    id: "breathing-reset",
    title: "Atem-Reset im Stand",
    description: "Stehe kurz auf, atme drei Mal ruhig ein und aus und öffne dabei sanft den Brustkorb.",
    durationMinutes: 2,
    movementType: "breathing",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "breathing",
      "chest",
      "shoulders"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe ruhig auf und stelle beide Füße stabil auf den Boden.",
      "Richte den Oberkörper auf und öffne den Brustkorb leicht.",
      "Atme langsam durch die Nase ein.",
      "Atme ruhig und vollständig wieder aus.",
      "Wiederhole drei bewusste Atemzüge und setze dich danach bewusst neu hin."
    ],
    reason: "Kurz, ruhig und passend nach Fokusphasen.",
    explanation: "Der Atem-Reset schafft einen kleinen Wechsel, ohne aus dem Arbeitsmodus zu reißen.",
    similarityGroup: "calm-reset",
    priority: 86
  },
  {
    id: "eyes-screen-break",
    title: "Augenpause am Fenster",
    description: "Blicke für kurze Zeit in die Ferne und löse den Blick bewusst vom Bildschirm.",
    durationMinutes: 2,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "eyes"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Löse den Blick bewusst vom Bildschirm.",
      "Blicke aus dem Fenster oder auf einen entfernten Punkt im Raum.",
      "Entspanne Stirn, Kiefer und Schultern.",
      "Blinke einige Male langsam und bewusst.",
      "Kehre danach mit frischem Blick zur Aufgabe zurück."
    ],
    reason: "Gut nach längerer Bildschirmarbeit.",
    explanation: "Die Empfehlung ist unaufdringlich und passt besonders, wenn du konzentriert am Bildschirm gearbeitet hast.",
    similarityGroup: "screen-reset",
    priority: 89
  },
  {
    id: "standing-reset-no-equipment",
    title: "Kurzer Stand-Reset",
    description: "Stehe auf, lockere die Beine und setze dich danach bewusst wieder anders hin.",
    durationMinutes: 2,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "habit",
      "more-energy"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "hips",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe ruhig vom Stuhl auf.",
      "Stelle beide Füße stabil auf den Boden und lockere die Beine.",
      "Verlagere das Gewicht langsam von einem Fuß auf den anderen.",
      "Lasse die Schultern kurz locker kreisen.",
      "Setze dich danach bewusst in einer leicht anderen Haltung wieder hin."
    ],
    reason: "Unterbricht eine Sitzphase ohne großen Aufwand.",
    explanation: "Ein kurzer Standwechsel reicht oft, um aus statischem Sitzen herauszukommen.",
    similarityGroup: "stand-reset",
    priority: 87
  },
  {
    id: "seated-spine-mobility",
    title: "Mobilisation im Sitzen",
    description: "Drehe den Oberkörper langsam nach rechts und links und bleibe dabei locker im Atem.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "upper-back",
      "lower-back"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und stelle beide Füße stabil auf.",
      "Lege die Hände locker auf die Oberschenkel.",
      "Drehe den Oberkörper langsam nach rechts.",
      "Kehre zur Mitte zurück und drehe langsam nach links.",
      "Wiederhole die Rotation ruhig mehrere Male."
    ],
    reason: "Passt gut, wenn du am Platz bleiben möchtest.",
    explanation: "Die Bewegung bringt sanfte Rotation in den Oberkörper, ohne auffällig zu sein.",
    similarityGroup: "spine-mobility",
    priority: 84
  },
  {
    id: "office-hallway-loop",
    title: "Kurzer Weg durch den Flur",
    description: "Nutze einen kurzen Weg im Büro, zum Drucker oder einmal durch den Flur.",
    durationMinutes: 4,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "between-tasks",
      "phone",
      "break"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe vom Arbeitsplatz auf.",
      "Gehe in ruhigem Tempo einmal durch den Flur oder zu einem passenden Ziel.",
      "Halte die Schultern locker und atme gleichmäßig.",
      "Nutze den Weg bewusst als kurze Sitzunterbrechung.",
      "Kehre anschließend ruhig an den Arbeitsplatz zurück."
    ],
    reason: "Nutze einen kurzen Weg im Büro, um eine längere Sitzphase zu unterbrechen.",
    explanation: "Der Flur-Gang schafft Bewegung, ohne dass daraus eine lange Pause werden muss.",
    similarityGroup: "hallway-walk",
    priority: 93
  },
  {
    id: "office-kitchen-printer-walk",
    title: "Kleiner Büro-Weg",
    description: "Verbinde einen ohnehin passenden Anlass mit ein paar ruhigen Schritten.",
    durationMinutes: 3,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wähle einen ohnehin passenden kurzen Anlass, zum Beispiel Küche oder Drucker.",
      "Stehe auf und gehe in normalem, ruhigem Tempo los.",
      "Bleibe nicht am Platz stehen, sondern nutze den Weg bewusst als Bewegung.",
      "Gehe ohne Eile zurück.",
      "Starte danach wieder mit einer aufgerichteten Haltung."
    ],
    reason: "Kurze Wege lassen sich im Büro gut als Microbreak nutzen.",
    explanation: "Ein kleiner Gang zur Küche, zum Drucker oder durch den Flur unterbricht Sitzen niedrigschwellig.",
    similarityGroup: "hallway-walk",
    priority: 86
  },
  {
    id: "office-stairs-light",
    title: "Kurzer Treppenimpuls",
    description: "Gehe ein paar Treppenstufen in ruhigem Tempo und beende den Impuls, bevor er anstrengend wird.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "break",
      "between-tasks",
      "phone"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Gehe zur nächstgelegenen Treppe.",
      "Steige einige Stufen in ruhigem Tempo hoch oder runter.",
      "Halte das Tempo so, dass du nicht außer Atem kommst.",
      "Beende den Impuls bewusst frühzeitig.",
      "Gehe ruhig zurück an den Arbeitsplatz."
    ],
    reason: "Ein kurzer Treppenimpuls aktiviert, ohne dass daraus ein Training werden muss.",
    explanation: "Die Treppe eignet sich für einen kurzen Energieimpuls, wenn sie an deinem aktuellen Arbeitsort verfügbar ist.",
    similarityGroup: "stairs",
    priority: 94
  },
  {
    id: "stairs-step-reset",
    title: "Ruhige Step-ups",
    description: "Steige kontrolliert auf eine niedrige Stufe und wieder herunter. Halte das Tempo ruhig.",
    durationMinutes: 5,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich vor eine niedrige Stufe.",
      "Steige kontrolliert mit einem Fuß auf die Stufe.",
      "Setze den zweiten Fuß kurz dazu.",
      "Steige langsam wieder herunter.",
      "Wiederhole die Bewegung ruhig und ohne Tempo."
    ],
    reason: "Passt in eine aktive Pause, wenn du etwas mehr Bewegung möchtest.",
    explanation: "Die Übung ist ein kurzer Aktivierungsimpuls und bleibt bewusst arbeitsalltagstauglich.",
    similarityGroup: "stairs",
    priority: 78
  },
  {
    id: "walking-call-hallway",
    title: "Walking Call",
    description: "Gehe während eines Telefonats langsam einen kurzen Weg und halte das Tempo entspannt.",
    durationMinutes: 8,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "phone"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe kurz, ob das Telefonat für langsames Gehen geeignet ist.",
      "Stehe auf und gehe in sehr ruhigem Tempo los.",
      "Wähle einen kurzen, störungsarmen Weg.",
      "Halte das Tempo so niedrig, dass deine Stimme ruhig bleibt.",
      "Setze dich nach dem Call oder nach einigen Minuten bewusst wieder hin."
    ],
    reason: "Passt gut zu Telefonaten, weil du dich dabei leicht bewegen kannst.",
    explanation: "Wenn ein kurzer Weg verfügbar ist, kann ein Telefonat zu einer ruhigen Gehphase werden.",
    similarityGroup: "walking-call",
    priority: 95
  },
  {
    id: "meeting-posture-switch",
    title: "Diskreter Haltungswechsel",
    description: "Wechsle im Meeting leise die Sitzposition, löse die Schultern und stelle beide Füße neu auf.",
    durationMinutes: 2,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "shoulders",
      "hips"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Bleibe im Meeting ruhig sitzen.",
      "Stelle beide Füße bewusst stabil auf den Boden.",
      "Richte den Oberkörper leicht auf.",
      "Löse die Schultern und verändere die Sitzposition minimal.",
      "Halte die neue Position für einige Atemzüge."
    ],
    reason: "Für Meetings geeignet, weil der Impuls sehr unauffällig bleibt.",
    explanation: "Du kannst die Haltung verändern, ohne den Termin oder Call zu unterbrechen.",
    similarityGroup: "meeting-discreet",
    priority: 91
  },
  {
    id: "home-window-reset",
    title: "Fenster-Reset im Homeoffice",
    description: "Stehe kurz auf, gehe zum Fenster und nimm ein paar ruhige Atemzüge.",
    durationMinutes: 3,
    movementType: "breathing",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "habit",
      "back-neck"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "breathing",
      "eyes",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe vom Arbeitsplatz auf.",
      "Gehe ruhig zum Fenster oder zu einem helleren Punkt im Raum.",
      "Blicke kurz in die Ferne.",
      "Nimm einige ruhige Atemzüge.",
      "Gehe bewusst zurück und starte neu in die Aufgabe."
    ],
    reason: "Im Homeoffice fehlen oft natürliche Wege.",
    explanation: "Diese Empfehlung schafft bewusst einen kurzen Bewegungsanlass zwischen Bildschirmphasen.",
    similarityGroup: "home-reset",
    priority: 91
  },
  {
    id: "home-apartment-loop",
    title: "Kurze Wohnungsrunde",
    description: "Gehe eine ruhige Runde durch die Wohnung und kehre bewusst an den Arbeitsplatz zurück.",
    durationMinutes: 4,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks",
      "break",
      "phone"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe auf und verlasse kurz den direkten Arbeitsplatz.",
      "Gehe eine ruhige Runde durch die Wohnung.",
      "Lasse Arme und Schultern locker mitschwingen.",
      "Kehre nach wenigen Minuten bewusst zurück.",
      "Setze dich mit neu ausgerichteter Haltung wieder hin."
    ],
    reason: "Schafft im Homeoffice einen kurzen Bewegungsanlass.",
    explanation: "Die Runde ersetzt einen kleinen Weg, der im Büro oft automatisch entstehen würde.",
    similarityGroup: "home-walk",
    priority: 88
  },
  {
    id: "home-focus-block-reset",
    title: "Reset zwischen Fokusblöcken",
    description: "Stehe auf, bewege Arme und Schultern locker und starte danach bewusst in den nächsten Block.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks",
      "focus"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "upper-back",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe zwischen zwei Aufgaben bewusst auf.",
      "Lockere Arme und Schultern für einige Sekunden.",
      "Richte den Oberkörper auf und atme ruhig.",
      "Bewege die Schultern langsam nach hinten unten.",
      "Starte danach bewusst in den nächsten Fokusblock."
    ],
    reason: "Ideal zwischen zwei Aufgaben, um den nächsten Fokusblock klar zu beginnen.",
    explanation: "Der kurze Reset verbindet Bewegung mit einem sauberen Übergang im Arbeitstag.",
    similarityGroup: "home-reset",
    priority: 85
  },
  {
    id: "home-active-break-start",
    title: "Aktiver Pausenstart",
    description: "Beginne die Pause mit lockeren Schritten und einer einfachen Mobilisation von Schultern und Hüfte.",
    durationMinutes: 5,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "shoulders",
      "hips",
      "legs",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "visible",
    instructionSteps: [
      "Beginne die Pause im Stehen.",
      "Gehe einige lockere Schritte im Raum.",
      "Mobilisiere Schultern mit kleinen Kreisen.",
      "Bewege die Hüfte locker von Seite zu Seite.",
      "Starte danach in deine eigentliche Pause."
    ],
    reason: "In der Pause darf der Impuls etwas aktiver sein.",
    explanation: "Der Pausenstart bringt Bewegung in den Tag, ohne nach Sportprogramm zu wirken.",
    similarityGroup: "active-break",
    priority: 83
  },
  {
    id: "home-end-of-day-reset",
    title: "Feierabend-Reset",
    description: "Stehe auf, lockere Nacken und Schultern und räume den Arbeitsplatz mit ein paar Schritten bewusst ab.",
    durationMinutes: 4,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "habit",
      "focus",
      "back-neck"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day",
      "meeting-heavy"
    ],
    bodyArea: [
      "neck",
      "shoulders",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe zum Abschluss des Arbeitstags bewusst auf.",
      "Lockere Nacken und Schultern mit kleinen Bewegungen.",
      "Räume den Arbeitsplatz mit ein paar ruhigen Schritten auf.",
      "Atme einmal bewusst tief ein und aus.",
      "Verlasse den Arbeitsplatz körperlich und gedanklich."
    ],
    reason: "Hilft, den Arbeitstag körperlich abzuschließen.",
    explanation: "Gerade im Homeoffice kann ein kurzer Reset den Übergang aus dem Arbeitsmodus unterstützen.",
    similarityGroup: "closing-reset",
    priority: 76
  },
  {
    id: "standing-desk-position-change",
    title: "Sitz-Steh-Wechsel",
    description: "Wechsle vom Sitzen ins Stehen oder zurück und richte Bildschirm, Schultern und Stand neu aus.",
    durationMinutes: 3,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "focus",
      "between-tasks",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "shoulders",
      "legs"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wechsle vom Sitzen ins Stehen oder vom Stehen zurück ins Sitzen.",
      "Richte die Höhe von Tisch oder Bildschirm passend aus.",
      "Stelle beide Füße stabil auf oder setze dich bewusst aufrecht hin.",
      "Lasse die Schultern locker.",
      "Bleibe nicht zu lange statisch in einer Position."
    ],
    reason: "Unterbricht Sitzen, ohne direkt in weiteres statisches Stehen zu kippen.",
    explanation: "Der Wechsel ist sinnvoll, wenn dein aktueller Arbeitsort einen höhenverstellbaren Schreibtisch hat.",
    similarityGroup: "stand-desk",
    priority: 94
  },
  {
    id: "standing-desk-calf-pump",
    title: "Wadenpumpe im Stand",
    description: "Hebe und senke die Fersen langsam, während du kurz im Stehen arbeitest.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "gentle",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "meeting",
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "calves",
      "legs"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich stabil an den höhenverstellbaren Schreibtisch.",
      "Hebe beide Fersen langsam vom Boden ab.",
      "Senke die Fersen kontrolliert wieder ab.",
      "Wiederhole die Bewegung ruhig mehrere Male.",
      "Arbeite danach nur weiter im Stand, wenn es sich angenehm anfühlt."
    ],
    reason: "Macht eine Stehphase etwas aktiver.",
    explanation: "So ersetzt du Sitzen nicht nur durch statisches Stehen, sondern bringst kurz Bewegung hinein.",
    similarityGroup: "stand-desk",
    priority: 82
  },
  {
    id: "walking-pad-meeting-light",
    title: "Leichte Walking-Phase",
    description: "Gehe langsam während eines passenden Calls oder einer einfachen Arbeitsphase.",
    durationMinutes: 12,
    movementType: "walking_meeting",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "meeting",
      "phone"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob der Call für langsames Gehen geeignet ist.",
      "Starte das Walking Pad auf sehr niedriger Geschwindigkeit.",
      "Gehe so langsam, dass du ruhig sprechen und zuhören kannst.",
      "Halte Oberkörper und Blick entspannt.",
      "Beende die Walking-Phase, sobald sie dich ablenkt."
    ],
    reason: "Passt gut zu Calls, weil du dich dabei leicht bewegen kannst.",
    explanation: "Das Walking Pad wird nur empfohlen, wenn es am aktuellen Arbeitsort verfügbar ist.",
    similarityGroup: "walking-pad",
    priority: 96
  },
  {
    id: "walking-pad-focus-walk",
    title: "Ruhige Fokus-Walking-Phase",
    description: "Gehe sehr langsam bei leichter Fokusarbeit und wechsle zurück, sobald es ablenkt.",
    durationMinutes: 10,
    movementType: "walk",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "focus"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wähle eine einfache Aufgabe, die langsames Gehen zulässt.",
      "Starte das Walking Pad sehr langsam.",
      "Halte Hände, Blick und Arbeitstempo entspannt.",
      "Prüfe nach kurzer Zeit, ob die Konzentration stabil bleibt.",
      "Wechsle zurück ins Sitzen oder Stehen, wenn es ablenkt."
    ],
    reason: "Nur für Aufgaben geeignet, bei denen langsames Gehen nicht stört.",
    explanation: "Die Empfehlung bleibt bewusst optional und passt nur, wenn Walking Pad und Aufgabe zusammenpassen.",
    similarityGroup: "walking-pad",
    priority: 80
  },
  {
    id: "exercise-space-mobility-flow",
    title: "Kurzer Mobilisationsflow",
    description: "Nutze den Platz neben dem Schreibtisch für einfache Bewegungen von Schultern, Hüfte und Rücken.",
    durationMinutes: 5,
    movementType: "mobilize",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "shoulders",
      "hips",
      "spine",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich neben den Schreibtisch und schaffe etwas Platz.",
      "Kreise die Schultern ruhig nach hinten.",
      "Bewege die Hüfte locker von Seite zu Seite.",
      "Runde und strecke den Rücken sanft im Wechsel.",
      "Kehre nach dem Flow bewusst an den Arbeitsplatz zurück."
    ],
    reason: "Mit etwas Platz darf der Microbreak aktiver werden.",
    explanation: "Der Flow nutzt vorhandenen Raum, bleibt aber kurz und arbeitsalltagstauglich.",
    similarityGroup: "exercise-space",
    priority: 87
  },
  {
    id: "exercise-space-active-reset",
    title: "Aktiver Reset neben dem Tisch",
    description: "Mache lockere Kniebeugen ohne Tempo oder einen einfachen Seit-Schritt-Reset.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "hips",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit etwas Abstand zum Schreibtisch auf.",
      "Mache einige langsame, kleine Kniebeugen oder seitliche Schritte.",
      "Halte das Tempo ruhig und kontrolliert.",
      "Lasse die Atmung gleichmäßig weiterlaufen.",
      "Beende den Impuls, bevor er sich wie Training anfühlt."
    ],
    reason: "Ideal zwischen zwei Aufgaben, um neue Energie aufzubauen.",
    explanation: "Der Impuls ist etwas dynamischer, bleibt aber kurz genug für den Arbeitstag.",
    similarityGroup: "exercise-space",
    priority: 79
  },
  {
    id: "small-equipment-band-pull",
    title: "Leichte Band-Aktivierung",
    description: "Nutze ein kleines Band oder ähnliches Equipment für ruhige Zugbewegungen auf Schulterhöhe.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "shoulders",
      "upper-back",
      "chest"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Nimm das Band oder kleine Equipment auf Schulterhöhe vor den Körper.",
      "Stelle dich stabil und aufrecht hin.",
      "Ziehe das Band langsam auseinander oder führe eine ruhige Zugbewegung aus.",
      "Löse die Spannung kontrolliert.",
      "Wiederhole die Bewegung langsam und ohne Schwung."
    ],
    reason: "Kleines Equipment eignet sich für kurze gezielte Aktivierung.",
    explanation: "Die Bewegung bleibt niedrigschwellig und nutzt nur das, was am aktuellen Arbeitsort verfügbar ist.",
    similarityGroup: "small-equipment",
    priority: 82
  },
  {
    id: "small-equipment-balance-seat",
    title: "Aktives Sitzen kurz nutzen",
    description: "Nutze Balancekissen, Ball oder ähnliches kurz bewusst und wechsle danach wieder stabil zurück.",
    durationMinutes: 6,
    movementType: "sit_reset",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "hips",
      "legs"
    ],
    position: "sitting",
    visibilityLevel: "normal",
    instructionSteps: [
      "Setze dich bewusst auf das Balancekissen, den Ball oder die Sitzhilfe.",
      "Stelle beide Füße stabil auf den Boden.",
      "Richte den Oberkörper auf und finde eine aktive Sitzposition.",
      "Halte die Position nur kurz und aufmerksam.",
      "Wechsle danach wieder in eine stabile Sitzposition zurück."
    ],
    reason: "Ein kurzer Wechsel kann Sitzen aktiver machen.",
    explanation: "Die Empfehlung nutzt kleines Equipment dosiert, statt daraus eine lange Trainingsphase zu machen.",
    similarityGroup: "small-equipment",
    priority: 75
  },
  {
    id: "ergonomic-seat-reset",
    title: "Haltungswechsel mit Sitzhilfe",
    description: "Wechsle bewusst zwischen aktivem Sitzen, kurzem Stand und einer entlasteten Sitzposition.",
    durationMinutes: 3,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "ergonomic-support"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "hips",
      "lower-back"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Nutze deine Sitz- oder Stehhilfe bewusst für einen Positionswechsel.",
      "Wechsle kurz in eine aktive Sitzposition.",
      "Richte Rücken und Becken neu aus.",
      "Stehe bei Bedarf kurz auf und lockere die Beine.",
      "Kehre danach in eine stabile, entspannte Arbeitsposition zurück."
    ],
    reason: "Nutzt deine Sitz- oder Stehhilfe für einen ruhigen Positionswechsel.",
    explanation: "Der Wechsel bringt Variation in die Haltung, ohne zusätzlichen Platz oder Equipmentwechsel.",
    similarityGroup: "ergonomic-support",
    priority: 86
  },
  {
    id: "ergonomic-standing-support",
    title: "Stehhilfe bewusst nutzen",
    description: "Nutze Stehhocker oder Stehmatte kurz und wechsle danach wieder in eine andere Position.",
    durationMinutes: 5,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "ergonomic-support"
    ],
    suitablePhases: [
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "feet",
      "lower-back"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wechsle an deine Stehhilfe, Stehmatte oder ähnliche Unterstützung.",
      "Stelle beide Füße stabil auf.",
      "Verteile das Gewicht ruhig und gleichmäßig.",
      "Bleibe nur kurz in dieser Position.",
      "Wechsle danach bewusst wieder in eine andere Haltung."
    ],
    reason: "Gut für einen ruhigen Positionswechsel am Arbeitsplatz.",
    explanation: "Die Empfehlung macht vorhandene ergonomische Unterstützung nutzbar, ohne lange statisch zu stehen.",
    similarityGroup: "ergonomic-support",
    priority: 78
  },
  {
    id: "between-tasks-energy-reset",
    title: "Energie-Reset zwischen Aufgaben",
    description: "Stehe auf, gehe zehn ruhige Schritte und mobilisiere kurz Handgelenke und Schultern.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "more-energy",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "legs",
      "wrists",
      "shoulders"
    ],
    position: "mixed",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stehe zwischen zwei Aufgaben bewusst auf.",
      "Gehe etwa zehn ruhige Schritte.",
      "Lockere die Schultern kurz.",
      "Kreise Hände und Handgelenke langsam.",
      "Starte danach die nächste Aufgabe mit neuem Fokus."
    ],
    reason: "Ideal zwischen zwei Aufgaben, um kurz neu anzusetzen.",
    explanation: "Der Impuls kombiniert einen kleinen Ortswechsel mit ruhiger Mobilisation.",
    similarityGroup: "task-transition",
    priority: 89
  },
  {
    id: "focus-hand-wrist-reset",
    title: "Handgelenke lockern",
    description: "Löse Hände und Unterarme mit langsamen Kreisen und kurzem Ausschütteln.",
    durationMinutes: 2,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "wrists"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Löse die Hände kurz von Maus und Tastatur.",
      "Kreise beide Handgelenke langsam in eine Richtung.",
      "Wechsle danach die Richtung.",
      "Schüttle Hände und Finger locker aus.",
      "Lege die Hände anschließend entspannt zurück an den Arbeitsplatz."
    ],
    reason: "Gut bei viel Tippen oder längerer Bildschirmarbeit.",
    explanation: "Die Bewegung ist klein, ruhig und passt in eine kurze Fokus-Unterbrechung.",
    similarityGroup: "hands-wrists",
    priority: 80
  },
  {
    id: "meeting-standing-option",
    title: "Meeting im Stehen",
    description: "Wechsle für einen kurzen Teil des Meetings in den Stand und setze dich danach bewusst wieder.",
    durationMinutes: 5,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "spine"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob ein ruhiger Positionswechsel im Meeting passt.",
      "Stehe langsam und unauffällig auf.",
      "Stelle beide Füße stabil auf den Boden.",
      "Bleibe für einen kurzen Teil des Meetings im Stand.",
      "Setze dich danach bewusst wieder hin."
    ],
    reason: "Für Meetings geeignet, wenn ein ruhiger Positionswechsel passt.",
    explanation: "Der Wechsel unterbricht Sitzen, ohne das Meeting in eine Bewegungspause zu verwandeln.",
    similarityGroup: "meeting-stand",
    priority: 84
  },
  {
    id: "neck-side-glide-seated",
    title: "Seitliche Nacken-Dehnung im Sitzen",
    description: "Dehne den seitlichen Nacken ruhig und klein, ohne den Arbeitsplatz zu verlassen.",
    durationMinutes: 2,
    movementType: "stretch",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "neck",
      "shoulders"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und stelle beide Füße stabil auf den Boden.",
      "Lege eine Hand locker seitlich an den Stuhl oder auf den Oberschenkel.",
      "Neige den Kopf langsam zur Gegenseite, bis ein sanfter Zug entsteht.",
      "Halte die Position für einige ruhige Atemzüge.",
      "Wechsle die Seite und führe die Bewegung langsam aus."
    ],
    reason: "Entlastet den seitlichen Nacken nach langer Bildschirmarbeit.",
    explanation: "Die Übung ist sehr unauffällig und passt gut in kurze Fokus-Unterbrechungen.",
    similarityGroup: "neck-stretch",
    priority: 86
  },
  {
    id: "chin-tuck-screen-reset",
    title: "Kinn-zurück-Reset",
    description: "Richte den Kopf sanft über der Wirbelsäule aus und löse die typische Bildschirmhaltung.",
    durationMinutes: 2,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "neck",
      "spine",
      "upper-back"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und blicke geradeaus.",
      "Ziehe das Kinn langsam minimal nach hinten, als würdest du ein Doppelkinn machen.",
      "Halte den Hinterkopf lang und die Schultern locker.",
      "Löse die Position wieder ohne den Kopf nach vorne fallen zu lassen.",
      "Wiederhole die Bewegung ruhig mehrere Male."
    ],
    reason: "Hilft gegen nach vorne geschobene Kopfhaltung.",
    explanation: "Der Reset ist klein, leise und dadurch auch in Meetings oder Fokusphasen gut machbar.",
    similarityGroup: "neck-posture",
    priority: 88
  },
  {
    id: "seated-chest-opener",
    title: "Brustkorb-Öffnung am Stuhl",
    description: "Öffne den Brustkorb kurz, um die gebeugte Bildschirmhaltung auszugleichen.",
    durationMinutes: 3,
    movementType: "stretch",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "chest",
      "shoulders",
      "upper-back"
    ],
    position: "sitting",
    visibilityLevel: "normal",
    instructionSteps: [
      "Setze dich auf die vordere Stuhlkante.",
      "Richte dich auf und lasse die Schultern locker sinken.",
      "Führe die Hände locker hinter den Körper oder an die Stuhlkante.",
      "Öffne den Brustkorb sanft nach vorne oben.",
      "Atme ruhig und löse die Position langsam wieder."
    ],
    reason: "Gleicht eine runde Sitzhaltung kurz aus.",
    explanation: "Die Bewegung passt besonders nach längeren Schreib- oder Bildschirmphasen.",
    similarityGroup: "chest-opener",
    priority: 84
  },
  {
    id: "desk-forearm-stretch",
    title: "Unterarm-Stretch am Schreibtisch",
    description: "Löse Unterarme und Handgelenke nach Tippen, Mausarbeit oder längerer Bildschirmarbeit.",
    durationMinutes: 2,
    movementType: "stretch",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "wrists"
    ],
    position: "desk",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Strecke einen Arm locker nach vorne aus.",
      "Drehe die Handfläche nach oben oder unten.",
      "Ziehe die Finger mit der anderen Hand sanft zurück.",
      "Halte den Zug kurz und atme ruhig weiter.",
      "Wechsle die Seite und bewege danach beide Hände locker aus."
    ],
    reason: "Gut bei viel Tastatur- und Mausarbeit.",
    explanation: "Der Stretch ist kurz, klein und direkt am Schreibtisch umsetzbar.",
    similarityGroup: "hands-wrists",
    priority: 83
  },
  {
    id: "ankle-circles-under-desk",
    title: "Fußgelenke unter dem Tisch kreisen",
    description: "Bringe Bewegung in Füße und Unterschenkel, ohne sichtbar aufzustehen.",
    durationMinutes: 2,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "meeting",
      "focus"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "feet",
      "calves"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Bleibe ruhig auf dem Stuhl sitzen.",
      "Hebe einen Fuß leicht vom Boden.",
      "Kreise das Fußgelenk langsam in eine Richtung.",
      "Wechsle die Richtung und danach den Fuß.",
      "Stelle beide Füße anschließend bewusst stabil auf den Boden."
    ],
    reason: "Sehr diskrete Bewegung während langer Sitzphasen.",
    explanation: "Die Übung eignet sich besonders, wenn Aufstehen gerade nicht möglich ist.",
    similarityGroup: "feet-calf-mobility",
    priority: 82
  },
  {
    id: "seated-calf-raises",
    title: "Wadenheben im Sitzen",
    description: "Aktiviere die Waden mit kleinen Fersenbewegungen, während du am Platz bleibst.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "meeting",
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "calves",
      "legs"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und stelle beide Füße auf den Boden.",
      "Hebe beide Fersen langsam an, die Zehen bleiben am Boden.",
      "Senke die Fersen kontrolliert wieder ab.",
      "Wiederhole die Bewegung ruhig und gleichmäßig.",
      "Stelle die Füße danach bewusst neu auf."
    ],
    reason: "Bringt Bewegung in die Beine, ohne den Arbeitsplatz zu verlassen.",
    explanation: "Der Impuls ist geeignet, wenn du lange sitzt, aber nicht sichtbar aufstehen möchtest.",
    similarityGroup: "calf-activation",
    priority: 85
  },
  {
    id: "seated-glute-squeeze",
    title: "Sitzmuskel-Aktivierung",
    description: "Aktiviere Gesäß und Hüfte kurz im Sitzen, um passive Sitzphasen zu unterbrechen.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "habit",
      "back-neck"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "legs"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich stabil und aufrecht hin.",
      "Spanne beide Gesäßmuskeln kurz und kontrolliert an.",
      "Halte die Spannung für einen Atemzug.",
      "Löse vollständig und bleibe locker sitzen.",
      "Wiederhole die Anspannung einige Male ohne Pressatmung."
    ],
    reason: "Unterbricht passives Sitzen sehr unauffällig.",
    explanation: "Die Übung passt in Situationen, in denen sichtbare Bewegung gerade nicht möglich ist.",
    similarityGroup: "hip-activation",
    priority: 78
  },
  {
    id: "desk-scapula-squeeze",
    title: "Schulterblatt-Reset",
    description: "Aktiviere den oberen Rücken mit kleinen Schulterblattbewegungen am Arbeitsplatz.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "upper-back"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze oder stelle dich aufrecht hin.",
      "Lasse die Schultern locker nach unten sinken.",
      "Ziehe die Schulterblätter langsam nach hinten unten zusammen.",
      "Halte die Spannung kurz, ohne ins Hohlkreuz zu gehen.",
      "Löse wieder und wiederhole die Bewegung ruhig."
    ],
    reason: "Stärkt das Gefühl für eine aufrechte Haltung.",
    explanation: "Der Impuls ist klein genug für den Arbeitsplatz und hilfreich nach runder Sitzhaltung.",
    similarityGroup: "upper-back-activation",
    priority: 87
  },
  {
    id: "seated-hip-opener",
    title: "Hüft-Öffner im Sitzen",
    description: "Mobilisiere die Hüfte kurz, ohne den Arbeitsplatz verlassen zu müssen.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "lower-back"
    ],
    position: "sitting",
    visibilityLevel: "normal",
    instructionSteps: [
      "Setze dich aufrecht auf den Stuhl.",
      "Lege einen Fuß locker auf das andere Knie, sofern es angenehm ist.",
      "Richte den Rücken lang auf.",
      "Neige den Oberkörper minimal nach vorne, bis ein sanfter Zug entsteht.",
      "Wechsle die Seite nach einigen Atemzügen."
    ],
    reason: "Hilft, die Hüfte nach längerem Sitzen kurz zu öffnen.",
    explanation: "Die Übung passt gut zwischen Aufgaben oder in eine ruhige Fokus-Unterbrechung.",
    similarityGroup: "hip-mobility",
    priority: 82
  },
  {
    id: "standing-hip-flexor-reset",
    title: "Hüftbeuger-Reset im Stand",
    description: "Gleiche langes Sitzen mit einer kurzen Hüftstreckung im Stand aus.",
    durationMinutes: 3,
    movementType: "stretch",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "lower-back",
      "legs"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich stabil neben den Schreibtisch.",
      "Setze einen Fuß einen kleinen Schritt nach hinten.",
      "Richte das Becken auf und bleibe im Oberkörper lang.",
      "Schiebe die Hüfte sanft nach vorne, bis ein leichter Zug entsteht.",
      "Wechsle die Seite ruhig und kontrolliert."
    ],
    reason: "Gut nach langen Sitzphasen.",
    explanation: "Der kurze Stand-Stretch bringt Ausgleich in Hüfte und unteren Rücken.",
    similarityGroup: "hip-flexor-stretch",
    priority: 86
  },
  {
    id: "standing-side-bend",
    title: "Seitneigung im Stand",
    description: "Mobilisiere die Körperseiten und den oberen Rücken mit einer ruhigen Seitneigung.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "spine",
      "chest",
      "shoulders"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich hüftbreit hin.",
      "Führe einen Arm locker über den Kopf.",
      "Neige den Oberkörper langsam zur Gegenseite.",
      "Atme ruhig in die gedehnte Körperseite.",
      "Kehre zur Mitte zurück und wechsle die Seite."
    ],
    reason: "Löst Spannung in Rumpf und Schulterbereich.",
    explanation: "Die Übung bietet einen klaren Gegenpol zur starren Sitzhaltung.",
    similarityGroup: "side-body-mobility",
    priority: 81
  },
  {
    id: "standing-march-60",
    title: "60-Sekunden-Marsch am Platz",
    description: "Aktiviere Kreislauf und Beine mit einem kurzen, kontrollierten Marsch am Platz.",
    durationMinutes: 1,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit etwas Abstand zum Stuhl auf.",
      "Marschere locker auf der Stelle.",
      "Lasse die Arme natürlich mitschwingen.",
      "Halte das Tempo moderat und alltagstauglich.",
      "Beende den Impuls bewusst, bevor du ins Schwitzen kommst."
    ],
    reason: "Schneller Energieimpuls ohne Equipment.",
    explanation: "Der Marsch eignet sich vor allem in Pausen oder im Homeoffice, wenn mehr sichtbare Bewegung okay ist.",
    similarityGroup: "active-energy",
    priority: 75
  },
  {
    id: "sit-to-stand-light",
    title: "5 ruhige Sitz-Steh-Wiederholungen",
    description: "Wechsle kontrolliert zwischen Sitzen und Stehen, um eine längere Sitzphase aktiv zu unterbrechen.",
    durationMinutes: 3,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "legs",
      "hips",
      "whole-body"
    ],
    position: "mixed",
    visibilityLevel: "visible",
    instructionSteps: [
      "Setze dich auf die vordere Stuhlkante.",
      "Stelle beide Füße stabil auf den Boden.",
      "Stehe langsam und kontrolliert auf.",
      "Setze dich ebenso kontrolliert wieder hin.",
      "Wiederhole den Wechsel einige Male in ruhigem Tempo."
    ],
    reason: "Verbindet Positionswechsel mit leichter Aktivierung.",
    explanation: "Die Übung macht den Wechsel aus dem Sitzen aktiver, ohne Trainingscharakter zu stark zu betonen.",
    similarityGroup: "sit-stand-active",
    priority: 80
  },
  {
    id: "wall-shoulder-slide",
    title: "Wand-Engel light",
    description: "Nutze eine freie Wand für eine ruhige Schulter- und Rückenaktivierung.",
    durationMinutes: 4,
    movementType: "mobilize",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "upper-back",
      "chest"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit dem Rücken an eine freie Wand.",
      "Richte den Oberkörper auf und lasse die Schultern locker.",
      "Führe die Arme langsam an der Wand nach oben, soweit es angenehm ist.",
      "Senke die Arme kontrolliert wieder ab.",
      "Wiederhole die Bewegung ruhig und ohne Druck."
    ],
    reason: "Gut für Schulter- und Brustöffnung.",
    explanation: "Die Übung ist etwas sichtbarer und passt daher eher in Pausen oder ruhige Bereiche.",
    similarityGroup: "wall-mobility",
    priority: 76
  },
  {
    id: "standing-desk-weight-shift",
    title: "Gewichtsverlagerung am Stehtisch",
    description: "Mache die Stehphase dynamischer, indem du das Gewicht ruhig von Seite zu Seite verlagerst.",
    durationMinutes: 3,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "habit",
      "back-neck"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "feet",
      "legs",
      "hips"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich stabil an den höhenverstellbaren Schreibtisch.",
      "Verteile das Gewicht gleichmäßig auf beide Füße.",
      "Verlagere das Gewicht langsam auf den rechten Fuß.",
      "Wechsle ruhig auf den linken Fuß.",
      "Arbeite danach nur weiter im Stand, wenn die Haltung angenehm bleibt."
    ],
    reason: "Verhindert statisches Stehen am Stehtisch.",
    explanation: "Der Impuls macht eine Stehphase etwas lebendiger, ohne den Arbeitsfluss zu stören.",
    similarityGroup: "stand-desk",
    priority: 88
  },
  {
    id: "standing-desk-heel-toe-rock",
    title: "Fersen-Zehen-Rocker",
    description: "Aktiviere Waden und Füße während einer kurzen Stehphase am Schreibtisch.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "feet",
      "calves",
      "legs"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich stabil an den Stehtisch.",
      "Rolle langsam von den Fersen auf die Zehen.",
      "Senke die Füße kontrolliert zurück.",
      "Wechsle danach leicht auf die Fersen, wenn es stabil möglich ist.",
      "Bleibe langsam und halte dich bei Bedarf am Tisch fest."
    ],
    reason: "Bringt Bewegung in eine sonst statische Stehphase.",
    explanation: "Die Übung nutzt den Stehtisch, ohne dass du den Arbeitsplatz verlassen musst.",
    similarityGroup: "stand-desk-calf",
    priority: 84
  },
  {
    id: "standing-desk-shoulder-reset",
    title: "Schulter-Reset am Stehtisch",
    description: "Nutze den Positionswechsel am Stehtisch für eine kurze Schulter- und Brustöffnung.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "chest",
      "upper-back"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich aufrecht an den höhenverstellbaren Schreibtisch.",
      "Lasse die Arme locker hängen.",
      "Rolle die Schultern langsam nach hinten unten.",
      "Öffne den Brustkorb kurz und atme ruhig ein.",
      "Kehre danach in eine entspannte Arbeitsposition zurück."
    ],
    reason: "Kombiniert Stehen mit aktiver Haltungspflege.",
    explanation: "Die Empfehlung verhindert, dass der Stehmodus nur passiv genutzt wird.",
    similarityGroup: "stand-desk-upper-back",
    priority: 83
  },
  {
    id: "standing-desk-focus-swap",
    title: "Fokus-Wechsel: 15 Minuten Stehen",
    description: "Nutze einen überschaubaren Teil einer Fokusaufgabe im Stehen und wechsle danach bewusst zurück.",
    durationMinutes: 15,
    movementType: "stand",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "focus"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "spine",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wähle eine Aufgabe, die sich gut im Stehen bearbeiten lässt.",
      "Stelle Tisch und Bildschirm passend ein.",
      "Arbeite bewusst nur einen kurzen Abschnitt im Stehen.",
      "Prüfe zwischendurch Schultern, Füße und Konzentration.",
      "Wechsle danach wieder in eine andere Position."
    ],
    reason: "Hilft, Sitzzeit geplant zu unterbrechen.",
    explanation: "Die Empfehlung setzt Stehen dosiert ein und vermeidet zu lange statische Stehphasen.",
    similarityGroup: "stand-desk-focus",
    priority: 90
  },
  {
    id: "standing-desk-meeting-swap",
    title: "Meeting-Abschnitt im Stehen",
    description: "Verbringe einen kurzen, passenden Teil eines Meetings im Stehen und setze dich danach bewusst wieder.",
    durationMinutes: 8,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "spine"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob ein ruhiger Stehwechsel im Meeting passt.",
      "Fahre den Tisch leise hoch oder wechsle bereits vor Meetingbeginn in den Stand.",
      "Stelle beide Füße stabil auf.",
      "Bleibe nur für einen Teil des Meetings im Stehen.",
      "Wechsle danach bewusst zurück ins Sitzen oder in Bewegung."
    ],
    reason: "Meeting-tauglicher Positionswechsel mit Stehtisch.",
    explanation: "Die Empfehlung nutzt vorhandenes Setup, ohne aus einem Meeting eine Bewegungseinheit zu machen.",
    similarityGroup: "meeting-stand-desk",
    priority: 87
  },
  {
    id: "standing-desk-back-extension",
    title: "Rückenstreckung am Stehtisch",
    description: "Entlaste den Rücken mit einer kurzen, kontrollierten Streckung am Tisch.",
    durationMinutes: 3,
    movementType: "stretch",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "standing-desk"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "lower-back",
      "spine",
      "chest"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich an den Stehtisch und lege die Hände locker auf die Tischkante.",
      "Tritt einen kleinen Schritt zurück.",
      "Schiebe die Hüfte leicht nach hinten und verlängere den Rücken.",
      "Atme ruhig in die Position.",
      "Kehre langsam in den Stand zurück."
    ],
    reason: "Gut als Ausgleich nach längerer Sitzhaltung.",
    explanation: "Die Bewegung nutzt den Tisch als Orientierung und bleibt kurz dosiert.",
    similarityGroup: "stand-desk-back",
    priority: 80
  },
  {
    id: "walking-pad-email-scan",
    title: "Walking Pad für E-Mail-Sichtung",
    description: "Nutze sehr langsames Gehen für eine einfache, nicht kreative Aufgabe wie E-Mails sichten.",
    durationMinutes: 10,
    movementType: "walk",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Wähle eine einfache Aufgabe mit geringer Konzentrationsanforderung.",
      "Starte das Walking Pad langsam.",
      "Scanne E-Mails oder sortiere einfache Informationen.",
      "Halte das Gehen so ruhig, dass du nicht abgelenkt wirst.",
      "Beende die Walking-Phase nach kurzer Zeit bewusst."
    ],
    reason: "Nutzt das Walking Pad für leichte Arbeitsaufgaben.",
    explanation: "Die Empfehlung vermeidet komplexe Fokusarbeit und passt eher zu Routinetätigkeiten.",
    similarityGroup: "walking-pad",
    priority: 88
  },
  {
    id: "walking-pad-phone-pace",
    title: "Telefonat auf dem Walking Pad",
    description: "Gehe sehr langsam während eines geeigneten Telefonats und halte die Stimme ruhig.",
    durationMinutes: 12,
    movementType: "walking_meeting",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "phone",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob das Telefonat ohne Bildschirmarbeit funktioniert.",
      "Starte das Walking Pad auf sehr niedriger Geschwindigkeit.",
      "Gehe so langsam, dass Atmung und Stimme ruhig bleiben.",
      "Halte bei wichtigen Gesprächsphasen kurz an, wenn nötig.",
      "Beende den Impuls bewusst nach einigen Minuten."
    ],
    reason: "Sehr passend für Telefonate ohne intensive Bildschirmarbeit.",
    explanation: "So wird ein Call zur leichten Bewegungszeit, ohne die Gesprächsqualität zu stören.",
    similarityGroup: "walking-pad-call",
    priority: 92
  },
  {
    id: "walking-pad-after-lunch",
    title: "Ruhiges Nach-dem-Essen-Gehen",
    description: "Nutze eine sehr leichte Walking-Phase nach der Pause, um wieder in Bewegung zu kommen.",
    durationMinutes: 8,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Starte nach einer Pause mit sehr niedriger Geschwindigkeit.",
      "Gehe locker und ohne Leistungsdruck.",
      "Halte Schultern und Arme entspannt.",
      "Nutze die Zeit für einen ruhigen Übergang zurück in den Arbeitstag.",
      "Beende die Walking-Phase, bevor sie anstrengend wird."
    ],
    reason: "Sanfter Übergang nach einer Pause.",
    explanation: "Die Empfehlung bringt Energie zurück, bleibt aber sehr niedrigschwellig.",
    similarityGroup: "walking-pad-energy",
    priority: 82
  },
  {
    id: "walking-pad-admin-block",
    title: "Admin-Block im langsamen Gehen",
    description: "Kombiniere einfache administrative Aufgaben mit sehr langsamem Walking Pad.",
    durationMinutes: 15,
    movementType: "walk",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "habit",
      "more-energy"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "between-tasks",
      "focus"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Sammle einfache administrative Aufgaben für einen kurzen Block.",
      "Starte das Walking Pad langsam.",
      "Bearbeite nur Aufgaben, die wenig Feinmotorik oder hohe Konzentration brauchen.",
      "Prüfe regelmäßig, ob das Gehen weiterhin unterstützt.",
      "Wechsle danach bewusst zurück in eine andere Arbeitsposition."
    ],
    reason: "Gut für Routinetätigkeiten statt tiefer Fokusarbeit.",
    explanation: "Das Walking Pad wird gezielt für passende Aufgaben genutzt und nicht dauerhaft erzwungen.",
    similarityGroup: "walking-pad-admin",
    priority: 86
  },
  {
    id: "walking-pad-listening-meeting",
    title: "Zuhör-Meeting im Gehen",
    description: "Nutze ein Meeting mit hohem Zuhöranteil für sehr langsames Gehen.",
    durationMinutes: 10,
    movementType: "walking_meeting",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "focus"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob du im Meeting überwiegend zuhörst.",
      "Starte das Walking Pad vor oder zu Beginn des passenden Abschnitts langsam.",
      "Gehe so ruhig, dass Kamera, Ton und Aufmerksamkeit stabil bleiben.",
      "Stoppe das Walking Pad bei aktiven Beiträgen, wenn es dich stört.",
      "Wechsle nach dem Abschnitt zurück."
    ],
    reason: "Passt für Meetings mit wenig eigener Bildschirmarbeit.",
    explanation: "Die Empfehlung ist kontextabhängig und vermeidet Walking bei ungeeigneten Meetingteilen.",
    similarityGroup: "walking-pad-meeting",
    priority: 90
  },
  {
    id: "walking-pad-reset-end",
    title: "Walking-Pad-Abschlussrunde",
    description: "Schließe einen Arbeitsblock mit einer kurzen, sehr ruhigen Walking-Phase ab.",
    durationMinutes: 6,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "habit",
      "sit-less",
      "focus"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "walking-pad"
    ],
    suitablePhases: [
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Beende den aktuellen Arbeitsblock bewusst.",
      "Starte das Walking Pad sehr langsam.",
      "Gehe einige Minuten ohne neue komplexe Aufgabe.",
      "Sortiere gedanklich den nächsten Schritt.",
      "Stoppe und starte danach bewusst neu."
    ],
    reason: "Hilft beim Übergang zwischen Aufgaben.",
    explanation: "Die Bewegung verbindet einen mentalen Reset mit leichter Aktivität.",
    similarityGroup: "walking-pad-transition",
    priority: 81
  },
  {
    id: "hallway-focus-transition",
    title: "Flur-Übergang nach Fokusblock",
    description: "Nutze einen kurzen Flurweg als klare Grenze zwischen zwei Arbeitsblöcken.",
    durationMinutes: 4,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Beende den Fokusblock bewusst am Arbeitsplatz.",
      "Stehe auf und gehe einen kurzen Weg durch den Flur.",
      "Gehe ohne Handy oder neue Aufgabe.",
      "Atme ruhig und lasse Schultern locker.",
      "Kehre zurück und starte den nächsten Block bewusst."
    ],
    reason: "Macht den Übergang zwischen Aufgaben körperlich spürbar.",
    explanation: "Der Flur wird als einfacher Bewegungsanker genutzt.",
    similarityGroup: "hallway-transition",
    priority: 89
  },
  {
    id: "hallway-shoulder-walk",
    title: "Schulter-locker-Gehen im Flur",
    description: "Kombiniere einen kurzen Flurweg mit lockerem Schulterlösen.",
    durationMinutes: 4,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "shoulders",
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Gehe in ruhigem Tempo durch den Flur.",
      "Lasse die Arme locker mitschwingen.",
      "Ziehe die Schultern einmal sanft hoch und lasse sie wieder fallen.",
      "Kreise die Schultern klein, wenn der Raum es zulässt.",
      "Kehre ohne Eile an den Arbeitsplatz zurück."
    ],
    reason: "Verbindet Gehen mit Schulterentlastung.",
    explanation: "Der Impuls ist alltagstauglich und nutzt vorhandene Wege sinnvoll.",
    similarityGroup: "hallway-walk-shoulders",
    priority: 84
  },
  {
    id: "hallway-phone-pacing",
    title: "Telefonat im Flur",
    description: "Nutze ein passendes Telefonat für ruhiges Auf-und-ab-Gehen im Flur.",
    durationMinutes: 8,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "phone"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Prüfe, ob der Call nicht vertraulich oder störend für andere ist.",
      "Wähle einen ruhigen Flurabschnitt.",
      "Gehe langsam und gleichmäßig auf und ab.",
      "Halte das Tempo niedrig, damit die Stimme ruhig bleibt.",
      "Setze dich nach dem Telefonat bewusst wieder oder bleibe kurz stehen."
    ],
    reason: "Macht Telefonate zu natürlicher Bewegungszeit.",
    explanation: "Die Empfehlung passt besonders, wenn ein Flur verfügbar ist und der Call dafür geeignet ist.",
    similarityGroup: "hallway-phone",
    priority: 92
  },
  {
    id: "hallway-water-refill",
    title: "Wasserholen als Bewegungsanker",
    description: "Verknüpfe Trinken mit einem kurzen Gehimpuls durch Büro oder Wohnung.",
    durationMinutes: 4,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "habit",
      "more-energy"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Nimm eine leere Flasche oder ein Glas als Anlass.",
      "Stehe auf und gehe bewusst zum Wasserholen.",
      "Gehe ruhig und ohne nebenbei aufs Handy zu schauen.",
      "Trinke einen Schluck und richte dich kurz auf.",
      "Gehe zurück und starte bewusst neu."
    ],
    reason: "Einfacher Anker für regelmäßige Bewegung.",
    explanation: "Der Impuls nutzt eine ohnehin sinnvolle Handlung und macht Bewegung leichter zur Gewohnheit.",
    similarityGroup: "habit-water-walk",
    priority: 88
  },
  {
    id: "hallway-meeting-buffer",
    title: "Pufferweg vor dem nächsten Meeting",
    description: "Nutze zwei bis drei Minuten vor einem Meeting für einen kurzen Weg.",
    durationMinutes: 3,
    movementType: "walk",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "between-tasks",
      "meeting"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "breathing",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Beende die vorherige Aufgabe bewusst.",
      "Stehe vor dem nächsten Meeting kurz auf.",
      "Gehe einen kleinen Weg durch Flur oder Raum.",
      "Atme ruhig und sortiere den nächsten Termin gedanklich.",
      "Setze dich rechtzeitig vor Meetingbeginn wieder hin."
    ],
    reason: "Hilft, Meeting an Meeting nicht nur sitzend zu überbrücken.",
    explanation: "Der kurze Pufferweg schafft Bewegung und einen mentalen Wechsel.",
    similarityGroup: "meeting-buffer-walk",
    priority: 86
  },
  {
    id: "hallway-after-lunch-loop",
    title: "Ruhige Runde nach der Pause",
    description: "Nutze nach der Pause einen kurzen Weg, bevor du wieder länger sitzt.",
    durationMinutes: 5,
    movementType: "walk",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "hallway"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "whole-body"
    ],
    position: "walking",
    visibilityLevel: "normal",
    instructionSteps: [
      "Starte nach der Pause nicht direkt im Sitzen.",
      "Gehe eine kurze Runde durch den Flur oder geeigneten Bereich.",
      "Halte das Tempo ruhig und alltagstauglich.",
      "Atme gleichmäßig und lasse die Schultern locker.",
      "Kehre danach bewusst an den Arbeitsplatz zurück."
    ],
    reason: "Sanfter Energieimpuls nach einer Pause.",
    explanation: "Die Runde hilft, wieder in den Arbeitsmodus zu kommen, ohne zu intensiv zu werden.",
    similarityGroup: "hallway-energy",
    priority: 82
  },
  {
    id: "stairs-meeting-buffer",
    title: "Treppenpuffer zwischen Terminen",
    description: "Nutze eine kurze Treppe zwischen zwei Terminen als aktiveren Wechsel.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "between-tasks",
      "break"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Gehe zur nächstgelegenen Treppe.",
      "Steige ein bis zwei Etagen oder einige Stufen in ruhigem Tempo.",
      "Bleibe so entspannt, dass du danach normal weiterarbeiten kannst.",
      "Nutze den Rückweg ebenfalls ruhig und kontrolliert.",
      "Setze dich danach bewusst wieder oder starte in den nächsten Termin."
    ],
    reason: "Aktiver als ein normaler Flurweg, aber kurz dosiert.",
    explanation: "Die Treppe eignet sich besonders als Puffer zwischen Terminen oder Aufgaben.",
    similarityGroup: "stairs-buffer",
    priority: 86
  },
  {
    id: "stairs-calf-activation",
    title: "Wadenaktivierung an der Stufe",
    description: "Aktiviere Waden und Füße kurz an einer Stufe oder Treppenkante.",
    durationMinutes: 3,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "calves",
      "feet",
      "legs"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich stabil auf eine Stufe und halte dich bei Bedarf am Geländer fest.",
      "Hebe die Fersen langsam an.",
      "Senke sie kontrolliert wieder ab.",
      "Führe die Bewegung ruhig und ohne Schwung aus.",
      "Gehe danach langsam zurück an den Arbeitsplatz."
    ],
    reason: "Kurzer Aktivierungsimpuls für Beine und Füße.",
    explanation: "Die Übung nutzt die Treppe gezielt und bleibt zeitlich klar begrenzt.",
    similarityGroup: "stairs-calf",
    priority: 78
  },
  {
    id: "stairs-one-floor-reset",
    title: "Eine Etage bewusst gehen",
    description: "Gehe eine Etage bewusst langsam hoch oder runter und nutze sie als Sitzunterbrechung.",
    durationMinutes: 5,
    movementType: "walk",
    intensity: "balanced",
    suitableGoals: [
      "sit-less",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "meeting-heavy"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Wähle eine nahegelegene Treppe.",
      "Gehe eine Etage in ruhigem Tempo.",
      "Achte darauf, nicht außer Atem zu kommen.",
      "Nutze oben oder unten einen kurzen Moment zum Durchatmen.",
      "Kehre kontrolliert zurück."
    ],
    reason: "Einfacher, klarer Bewegungsimpuls mit Treppe.",
    explanation: "Die Empfehlung ist aktiver als ein Flurweg, bleibt aber bewusst niedrigschwellig.",
    similarityGroup: "stairs-walk",
    priority: 84
  },
  {
    id: "stairs-active-mini",
    title: "Aktive Treppen-Minute",
    description: "Nutze die Treppe für eine kurze aktive Minute, wenn du bewusst mehr Energie möchtest.",
    durationMinutes: 2,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "stairs"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "calves",
      "whole-body"
    ],
    position: "stairs",
    visibilityLevel: "visible",
    instructionSteps: [
      "Gehe zur Treppe und starte mit ruhigem Tempo.",
      "Steige für etwa eine Minute kontrolliert Stufen hoch und runter.",
      "Halte dich bei Bedarf am Geländer fest.",
      "Beende den Impuls, bevor er sich zu intensiv anfühlt.",
      "Gehe ruhig zurück und atme gleichmäßig weiter."
    ],
    reason: "Kurzer Energieimpuls für aktivere Nutzer.",
    explanation: "Die Übung ist bewusst als sichtbare Pausenoption gedacht und nicht für Meetings geeignet.",
    similarityGroup: "stairs-active",
    priority: 72
  },
  {
    id: "exercise-space-squat-light",
    title: "Mini-Kniebeugen neben dem Tisch",
    description: "Aktiviere Beine und Hüfte mit kleinen, kontrollierten Kniebeugen.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "hips",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit etwas Platz neben den Schreibtisch.",
      "Positioniere die Füße etwa hüftbreit.",
      "Beuge die Knie nur so weit, wie es kontrolliert angenehm ist.",
      "Stehe langsam wieder auf.",
      "Wiederhole die Bewegung ruhig und ohne Tempo."
    ],
    reason: "Aktiver Impuls für mehr Energie.",
    explanation: "Mit etwas Platz wird aus einer Sitzunterbrechung eine kurze Aktivierung.",
    similarityGroup: "exercise-space-legs",
    priority: 78
  },
  {
    id: "exercise-space-side-steps",
    title: "Seitliche Schritte",
    description: "Gehe einige kontrollierte Schritte nach rechts und links, um Beine und Hüfte zu aktivieren.",
    durationMinutes: 3,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "more-energy",
      "sit-less",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "legs",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit etwas freiem Platz auf.",
      "Gehe zwei bis drei kleine Schritte zur Seite.",
      "Wechsle die Richtung und gehe zurück.",
      "Halte Knie und Füße locker nach vorne ausgerichtet.",
      "Wiederhole den Ablauf ruhig mehrere Male."
    ],
    reason: "Bringt seitliche Bewegung in den Arbeitstag.",
    explanation: "Die Übung ist kurz, einfach und sorgt für Abwechslung zu Sitzen und Gehen geradeaus.",
    similarityGroup: "exercise-space-side-steps",
    priority: 80
  },
  {
    id: "exercise-space-spine-flow",
    title: "Wirbelsäulen-Flow im Stand",
    description: "Mobilisiere Rücken und Brustwirbelsäule mit einem kurzen, ruhigen Bewegungsflow.",
    durationMinutes: 5,
    movementType: "mobilize",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "spine",
      "upper-back",
      "lower-back"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit etwas Platz auf.",
      "Runde den oberen Rücken sanft und lasse den Kopf locker sinken.",
      "Richte dich Wirbel für Wirbel wieder auf.",
      "Drehe den Oberkörper langsam nach rechts und links.",
      "Schließe mit einer ruhigen aufrechten Haltung ab."
    ],
    reason: "Qualitativer Bewegungsimpuls für Rücken und Fokus.",
    explanation: "Der Flow gibt dem Rücken mehrere Bewegungsrichtungen statt nur einen Positionswechsel.",
    similarityGroup: "exercise-space-spine",
    priority: 85
  },
  {
    id: "exercise-space-lunge-reach",
    title: "Ausfallschritt mit Armreichweite light",
    description: "Kombiniere einen kleinen Ausfallschritt mit einer sanften Armbewegung.",
    durationMinutes: 4,
    movementType: "mobilize",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "legs",
      "chest",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit ausreichend Platz auf.",
      "Setze einen Fuß in einen kleinen Ausfallschritt nach hinten.",
      "Hebe den gegenüberliegenden Arm locker nach oben.",
      "Kehre kontrolliert in den Stand zurück.",
      "Wechsle die Seite und bleibe im Bewegungsradius angenehm."
    ],
    reason: "Aktiver Ganzkörperimpuls für Pausen.",
    explanation: "Die Übung bringt Hüfte, Beine und Brustkorb in Bewegung und eignet sich eher für sichtbare Pausen.",
    similarityGroup: "exercise-space-whole-body",
    priority: 73
  },
  {
    id: "exercise-space-floor-back-reset",
    title: "Rücken-Reset auf dem Boden",
    description: "Nutze freien Platz für einen kurzen Rücken-Reset in Rückenlage oder auf einer Matte.",
    durationMinutes: 6,
    movementType: "stretch",
    intensity: "gentle",
    suitableGoals: [
      "back-neck",
      "habit",
      "focus"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "lower-back",
      "spine",
      "hips"
    ],
    position: "floor",
    visibilityLevel: "visible",
    instructionSteps: [
      "Lege dich für kurze Zeit auf den Rücken, wenn der Ort dafür geeignet ist.",
      "Stelle die Füße auf und lasse den Rücken ruhig sinken.",
      "Kippe das Becken leicht vor und zurück.",
      "Ziehe bei Bedarf ein Knie sanft Richtung Brust.",
      "Setze dich langsam wieder auf und stehe ruhig auf."
    ],
    reason: "Gute Homeoffice-Option für spürbare Entlastung.",
    explanation: "Diese Übung ist bewusst sichtbar und eher für Homeoffice oder private Pausen geeignet.",
    similarityGroup: "floor-back-reset",
    priority: 77
  },
  {
    id: "exercise-space-power-reset",
    title: "Power-Reset ohne Springen",
    description: "Aktiviere dich mit dynamischen, aber leisen Bewegungen ohne Springen.",
    durationMinutes: 3,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "space"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "legs",
      "hips",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Stelle dich mit ausreichend Platz auf.",
      "Mache lockere Kniebeugen oder große Schritte am Platz.",
      "Bewege die Arme kontrolliert mit.",
      "Halte die Bewegung leise und ohne Springen.",
      "Stoppe nach kurzer Zeit und atme ruhig weiter."
    ],
    reason: "Aktiver Energieimpuls für Homeoffice-Pausen.",
    explanation: "Die Übung bringt Dynamik, bleibt aber ohne Sprünge und benötigt nur etwas Platz.",
    similarityGroup: "exercise-space-power",
    priority: 74
  },
  {
    id: "small-equipment-band-row",
    title: "Band-Rudern light",
    description: "Aktiviere oberen Rücken und Schultern mit ruhigen Zugbewegungen mit Band.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "more-energy",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "upper-back",
      "shoulders"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Nimm das Band sicher in beide Hände.",
      "Stelle dich aufrecht hin und halte die Ellbogen nah am Körper.",
      "Ziehe die Hände langsam Richtung Oberkörper.",
      "Spüre die Schulterblätter, ohne die Schultern hochzuziehen.",
      "Löse die Spannung kontrolliert und wiederhole ruhig."
    ],
    reason: "Gezielte Aktivierung für Rücken und Schulterbereich.",
    explanation: "Kleines Equipment macht den Impuls klarer und hochwertiger, bleibt aber kurz.",
    similarityGroup: "band-upper-back",
    priority: 84
  },
  {
    id: "small-equipment-ball-foot-roll",
    title: "Fußsohlen-Rollout",
    description: "Rolle mit einem kleinen Ball oder ähnlichem Hilfsmittel kurz die Fußsohle aus.",
    durationMinutes: 3,
    movementType: "mobilize",
    intensity: "gentle",
    suitableGoals: [
      "habit",
      "focus",
      "back-neck"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "focus",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "feet",
      "calves"
    ],
    position: "sitting",
    visibilityLevel: "normal",
    instructionSteps: [
      "Setze dich stabil auf den Stuhl.",
      "Lege einen kleinen Ball unter eine Fußsohle.",
      "Rolle langsam von vorne nach hinten.",
      "Verweile kurz an angenehmen Stellen.",
      "Wechsle die Seite und stelle danach beide Füße stabil auf."
    ],
    reason: "Ruhiger Reset für Füße und Körperwahrnehmung.",
    explanation: "Die Übung ist klein, aber wertvoll nach langem Sitzen oder Stehen.",
    similarityGroup: "foot-roll",
    priority: 76
  },
  {
    id: "small-equipment-mini-band-steps",
    title: "Mini-Band Seit-Schritte",
    description: "Nutze ein kleines Band für wenige seitliche Schritte in einer aktiven Pause.",
    durationMinutes: 4,
    movementType: "activate",
    intensity: "active",
    suitableGoals: [
      "more-energy",
      "habit",
      "sit-less"
    ],
    suitableWorkplaces: [
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "break"
    ],
    suitableWorkdayTypes: [
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "legs",
      "whole-body"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Lege das Mini-Band an eine geeignete Position, zum Beispiel oberhalb der Knie.",
      "Stelle dich stabil und leicht gebeugt hin.",
      "Gehe kleine kontrollierte Schritte zur Seite.",
      "Wechsle die Richtung nach wenigen Schritten.",
      "Beende die Übung nach kurzer Zeit und lockere die Beine."
    ],
    reason: "Aktiver Impuls für Hüfte und Beine.",
    explanation: "Die Übung ist eher für Homeoffice oder private Pausen geeignet, weil sie sichtbar ist.",
    similarityGroup: "mini-band-activation",
    priority: 70
  },
  {
    id: "small-equipment-mobility-stick",
    title: "Schulter-Mobilisation mit Stab oder Band",
    description: "Nutze ein leichtes Hilfsmittel für eine kontrollierte Schulter- und Brustöffnung.",
    durationMinutes: 4,
    movementType: "mobilize",
    intensity: "balanced",
    suitableGoals: [
      "back-neck",
      "focus",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "small-equipment"
    ],
    suitablePhases: [
      "break",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "mixed-day",
      "focus-heavy"
    ],
    bodyArea: [
      "shoulders",
      "chest",
      "upper-back"
    ],
    position: "standing",
    visibilityLevel: "visible",
    instructionSteps: [
      "Nimm einen Stab, ein Band oder ein ähnliches leichtes Hilfsmittel.",
      "Halte es etwas breiter als schulterbreit.",
      "Führe die Arme langsam nach vorne oben, soweit es angenehm ist.",
      "Senke sie kontrolliert wieder ab.",
      "Bleibe ruhig und vermeide ruckartige Bewegungen."
    ],
    reason: "Verbessert die Qualität der Schulter-Mobilisation.",
    explanation: "Das Equipment hilft, die Bewegung geführt und bewusst auszuführen.",
    similarityGroup: "equipment-shoulder-mobility",
    priority: 79
  },
  {
    id: "ergonomic-seat-pelvic-tilt",
    title: "Becken-Kippbewegung auf Sitzhilfe",
    description: "Nutze eine Sitzhilfe für kleine Beckenbewegungen statt statischem Sitzen.",
    durationMinutes: 3,
    movementType: "sit_reset",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "ergonomic-support"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "hips",
      "lower-back",
      "spine"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich stabil auf die ergonomische Sitzhilfe.",
      "Stelle beide Füße sicher auf den Boden.",
      "Kippe das Becken langsam minimal nach vorne und zurück.",
      "Halte Oberkörper und Atmung ruhig.",
      "Kehre anschließend in eine neutrale Sitzposition zurück."
    ],
    reason: "Macht Sitzen bewusster und beweglicher.",
    explanation: "Die Übung nutzt vorhandene Sitzunterstützung sehr unauffällig.",
    similarityGroup: "ergonomic-seat",
    priority: 84
  },
  {
    id: "ergonomic-standing-mat-shift",
    title: "Stehmatten-Wechsel",
    description: "Nutze eine Stehmatte oder Stehhilfe für kleine Gewichtswechsel statt starrem Stehen.",
    durationMinutes: 4,
    movementType: "stand",
    intensity: "gentle",
    suitableGoals: [
      "sit-less",
      "back-neck",
      "habit"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "ergonomic-support"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "feet",
      "legs",
      "lower-back"
    ],
    position: "standing",
    visibilityLevel: "normal",
    instructionSteps: [
      "Stelle dich auf die Stehmatte oder an die Stehhilfe.",
      "Verteile das Gewicht gleichmäßig.",
      "Verlagere das Gewicht langsam nach vorne, hinten und zu den Seiten.",
      "Halte Schultern und Knie locker.",
      "Wechsle danach bewusst wieder in eine andere Position."
    ],
    reason: "Verbessert die Qualität einer Stehphase.",
    explanation: "Die Unterstützung wird nicht als Dauerposition, sondern als kurzer Wechsel genutzt.",
    similarityGroup: "ergonomic-stand",
    priority: 82
  },
  {
    id: "box-breathing-focus",
    title: "Box-Breathing Fokusreset",
    description: "Nutze eine kurze, strukturierte Atmung, um nach Bildschirm- oder Meetingphasen ruhiger neu zu starten.",
    durationMinutes: 3,
    movementType: "breathing",
    intensity: "gentle",
    suitableGoals: [
      "focus",
      "habit",
      "back-neck"
    ],
    suitableWorkplaces: [
      "office",
      "homeoffice"
    ],
    requiredSetup: [
      "no-equipment"
    ],
    suitablePhases: [
      "focus",
      "meeting",
      "between-tasks"
    ],
    suitableWorkdayTypes: [
      "focus-heavy",
      "meeting-heavy",
      "mixed-day"
    ],
    bodyArea: [
      "breathing"
    ],
    position: "sitting",
    visibilityLevel: "discreet",
    instructionSteps: [
      "Setze dich aufrecht hin und lasse die Schultern locker.",
      "Atme langsam ein und zähle innerlich bis vier.",
      "Halte die Luft kurz und ruhig.",
      "Atme langsam aus und zähle wieder bis vier.",
      "Wiederhole einige ruhige Atemzyklen und starte dann bewusst neu."
    ],
    reason: "Sehr unauffälliger Fokus- und Ruheimpuls.",
    explanation: "Die strukturierte Atmung passt besonders, wenn körperlich sichtbare Bewegung gerade nicht möglich ist.",
    similarityGroup: "breathing-focus",
    priority: 86
  }
]
