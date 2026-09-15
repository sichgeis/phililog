# Umsetzung und Prüfnachweise

- [x] Vier Zustände und optionale Einfachauswahl mit Abwahl abgestimmt.
- [x] SQL, Formular, Entwurfserhalt, Logbuch, Bearbeiten und CSV implementiert.
- [x] `npm run check`: 22 Tests, TypeScript und Build erfolgreich.
- [x] Lokale Supabase: alle Werte/NULL, gemeinsame Bearbeitung, Versionskonflikte, ungültiger Wert, Wiegen und Fremdzugriffe geprüft; bestehende CRUD-/Exportprüfungen erfolgreich.
- [x] Browser-Harness mit synthetischem Konto: Wechsel/Abwahl, Neuladen, Speicherung, Rücksetzen beim neuen Eintrag, nachträgliches Entfernen und Typwechsel zu Wiegen geprüft. Native Leertaste aktiviert Button und erhält Fokus. Teils DOM-Klicks/Formularaktionen verwendet.
- [x] Layout 390/320 px visuell geprüft, kein horizontaler Überlauf. Screenshots `/private/tmp/phililog-mood390.png`, `/private/tmp/phililog-mood320.png`.
- [x] Migration 009 produktiv erfolgreich: „Success. No rows returned“. Bestehende Einträge unverändert.
- [x] [Pages-Veröffentlichung 34773135229](https://github.com/sichgeis/phililog/actions/runs/34773135229) erfolgreich, App-Code `30a6270`.

Abgeschlossen; keine offenen Implementierungsaufgaben.

## Wartung

Gemeinsamer Entwurfs- und Fokuserhalt einschließlich Befinden: [Wartungspaket](../005-wartung/tasks.md).

## Erweiterung 14. September 2026

Stand: Abgeschlossen und veröffentlicht.

- [x] Zornig (angry, 😠) und Eingeschlafen (asleep, 💤) in zentraler Wertetabelle ergänzt. Bestehende Anzeige-, Bearbeitungs- und Exportwege verwenden dieselben Werte.
- [x] Migration 013 erweitert ausschließlich den Befinden-Constraint. Zuerst lokal transaktional angewendet; produktive Ausführung siehe Veröffentlichungsnachweis unten.
- [x] `npm run check`: 42 Tests, TypeScript und Produktionsbuild erfolgreich. Neue Fachtests prüfen beide Werte bei Bearbeitung, CSV, Wiederholungsvergleich, Abwahl und Ausschluss für Wiegen/Temperatur. DOM-Tests prüfen sechs Optionen, Wechsel, Abwahl, Entwurfserhalt und erfolgreichen Speicherpayload.
- [x] `node scripts/test-local-supabase.mjs` erfolgreich: Beide Werte über echte API gespeichert/gelesen und durch das andere Mitglied geändert; bestehende Prüfungen für NULL, ungültige Werte, Versionskonflikte und Fremdzugriffe bestanden.
- [x] Browser-Harness gegen lokale App mit synthetischem Testkonto: 390 × 844 px mit drei Spalten und 320 × 740 px mit zwei Spalten. Beide neuen Labels sichtbar, kein horizontaler Überlauf, Touch-Ziele mindestens 73 px hoch. Screenshots unter `/private/tmp/phililog-six-moods390.png` und `/private/tmp/phililog-six-moods320.png` visuell geprüft. Keine API-Mocks in der Browserprüfung.
- [x] `git diff --check` erfolgreich.

Grenzen: Keine physische Smartphone-Abnahme. Migration 013, Deployment und produktive Leseprüfung abgeschlossen. Keine offenen Aufgaben.


## Veröffentlichung der Erweiterung

- [x] Veröffentlichung ausdrücklich beauftragt; Remote-Stand unverändert. `npm run check` erneut erfolgreich: 42 Tests, TypeScript und Build.
- [x] Migration 013 produktiv mit interner Sicherung von Einträgen und ursprünglichem Constraint in `private.*_before_20260914_more_moods`. Rechte für public/anon/authenticated entzogen, kurze transaktionale Schreibsperre. Keine produktiven Daten exportiert.
- [x] Nach einer Meldung über die bereits vorhandene Sicherung keine erneute Migration ausgeführt. Separate SELECT-Prüfung bestätigt committed Zustand: Constraint enthält angry/asleep, RLS aktiv, Sicherung für anon/authenticated unzugänglich, bidirektionaler Vergleich aller Eintragszeilen unverändert.
- Migration 013 SHA-256: `5c811f8a5d7a5deeadb31a4c5409488a40b593d649b7583dd62200f798bb1a5d`.

- [x] Anwendungscommit `d6bd7283e1d20ff85e9ab6f77e61c418b6838cc1` auf main gepusht. [Pages-Deployment 34884944077](https://github.com/sichgeis/phililog/actions/runs/34884944077) mit 42 Tests, Build und Veröffentlichung erfolgreich.
- [x] Live-Leseprüfung: neues Asset `/phililog/assets/index-B-Q1_D7_.js`; alle sechs Befinden-Labels einschließlich Zornig und Eingeschlafen vorhanden, keine sichtbaren Fehler. Mitgliedschaft, Personenzuordnung, Einträge und Einstellungen mit HTTP 200. Keine produktiven Testeinträge angelegt.
- [x] Abschlussdokumentation separat gepusht; veröffentlichte Anwendungsartefakte unverändert.

## Erweiterung 15. September 2026 – Befinden bei Aktivitäten

Stand: Abgeschlossen und veröffentlicht am 15. September 2026. Umfang und Produktion ausdrücklich beauftragt.

- [x] Spezifikation und technischer Plan aktualisiert.
- [x] Formular, Speicherung, Migration und Regressionstests erweitert.
- [x] `npm run check`: 58 Tests, TypeScript und Produktionsbuild erfolgreich. AC-008–009: sechs Optionen, Abwahl, Entwurf, Speicherreset, Bearbeiten, CSV und Wiederholung geprüft.
- [x] `node scripts/test-local-supabase.mjs --configure-preview`: AC-010 mit echten API-Zugriffen, allen Werten/NULL, gemeinsamer Bearbeitung, Versionsschutz, Fremdzugriffen und unveränderten Berichtssummen bestanden.
- [x] `node scripts/test-restore.mjs`: alle 16 Migrationen auf leerer Datenbank und synthetischer Dump/Restore einschließlich Aktivitätsbefinden bestanden.
- [x] Browser-Harness gegen lokale Supabase mit synthetischem Konto: Sonnenbad/Ruhig, Massage/Eingeschlafen, Babygymnastik/Aufmerksam über echte App-Handler gespeichert. Keine Feature-Mocks. CDP-Mausklick wirkungslos; DOM click/requestSubmit verwendet. 390×844 und 320×740 visuell geprüft, kein horizontaler Überlauf, Touch-Ziele mindestens 73 px. Screenshots `/private/tmp/phililog-activity-mood390.png` und `/private/tmp/phililog-activity-mood320.png`. Keine physische Smartphone-Abnahme.
- [x] Migration 016 produktiv nach Schemaabgleich transaktional angewendet. Private Sicherung der Einträge/des vorherigen Constraints, exakter Bestandsvergleich und RLS-/Sicherungsschutz erfolgreich. Committed Schema separat bestätigt. Keine produktiven Testeinträge. SHA-256: `c625741254a30777aa7af802f55dc238d6a700b68f58032f5a8c93adf67f20a6`.
- [x] Anwendungscommit `45113e783c63af87ab08acf48d24a3e4e328282d` auf main gepusht. [CI 35020303606](https://github.com/sichgeis/phililog/actions/runs/35020303606) vollständig erfolgreich, einschließlich frischer isolierter Datenbank und Restore.
- [x] [Pages-Veröffentlichung 35020303159](https://github.com/sichgeis/phililog/actions/runs/35020303159) erfolgreich. Live-HTML und `index-BIqaq8fT.js` mit HTTP 200; veröffentlichter Speicherpfad schließt nur Wiegen/Temperatur vom Befinden aus. Produktionsprüfung ausschließlich lesend.
- [x] Lokales Logbuch zeigt alle drei Testereignisse mit richtigem Befinden. Eigener Testtab und Entwicklungsserver geschlossen. README, Betriebsdokumentation und SDD aktualisiert; `git diff --check` erfolgreich.

Keine offene Implementierungs- oder Veröffentlichungsaufgabe. Physische Smartphone-Abnahme bleibt separat in Feature 001.
