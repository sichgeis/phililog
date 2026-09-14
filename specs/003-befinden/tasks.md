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
- [x] Migration 013 erweitert ausschließlich den Befinden-Constraint. Lokal transaktional angewendet; keine produktive Migration durchgeführt.
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
