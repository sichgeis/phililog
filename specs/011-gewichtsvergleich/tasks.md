# Aufgaben und Prüfnachweise

- [x] Repository, Vorgaben und WHO-Referenz prüfen; Auftrag in Spezifikation und Plan dokumentieren.
- [x] Filter, Kartenansicht, Referenzdaten und Profil-Einstellung implementieren.
- [x] Fach-/DOM-/API-Tests, `npm run check`, lokale Supabase und UI mit erfundenen Daten prüfen.
- [x] Migration und privates Geburtsdatum produktiv anwenden; Bestanderhalt bestätigen.
- [ ] Commit, Push, CI und Pages-Veröffentlichung prüfen; Dokumentation abschließen.

## Nachweise vom 04.10.2026

- `npm run check`: Fach-/DOM-Tests, TypeScript und Produktionsbuild bestanden. Filterwechsel mit verspäteter Antwort, Pagination, Bearbeitung, Geburtstagskonflikt, Entwurfserhalt und Abmeldung geprüft (AC-001–007).
- `node scripts/test-local-supabase.mjs`: bestanden mit ausschließlich erfundenen Konten/Daten. 35 ältere Gewichte bei gleichen Zeitpunkten hinter neuerer gemischter Historie vollständig ohne Überlappung paginiert; Profil-Familienzugriff, anonyme/Fremdzugriffe, Datumvalidierung und Versionskonflikte geprüft.
- `node scripts/test-restore.mjs`: alle 20 Migrationen sowie vollständiger synthetischer Dump/Restore bestanden.
- Echte lokale UI unter `http://127.0.0.1:5173/` im Codex In-app Browser, synthetisches Testkonto, keine API-Mocks: Gewichtsansicht, Alter 0/7/14 Tage, Punkte beim Median/unter P10/über P90, Logbuchfilter und Einstellungen geprüft. 320 × 844 und 390 × 844 ohne horizontalen Überlauf; Speichern der normalen Still-Eingabe bei 390 px innerhalb des Viewports. Visueller Nachweis außerhalb des Repositories: `/private/tmp/phililog-weight-screenshots/gewicht-390.jpg` (erfundene Daten). Physische Smartphone-Abnahme nicht ausgeführt.
- WHO-Referenz: 1857 tägliche Zeilen, Grammwerte P10/P50/P90, Quelle und XLSX-SHA-256 in `src/data/who-weight-girls.ts`; Extraktion reproduzierbar über `scripts/extract-who-weight.py`. Alter folgt Berliner Kalendertagen inklusive Sommerzeit; ungültige/fehlende, vorgeburtliche, zukünftige und zu alte Messungen erhalten keine erfundene Referenz (AC-003/004/006).
- Produktion: Migration 020 mit SHA-256 `b0e6efff6a10bda6c43742d02273f7ad007646f515a960ca7299cac4fdf22f34` angewandt; Logbuch unverändert, bisherige Einstellungen erhalten, privates Geburtsdatum gesetzt, RLS/Policies unverändert. Sicherung und Ausführungsnachweis im privaten Datenbankschema; keine echten Familiendaten exportiert (AC-005/008).

Nächster Schritt: Geprüften Commit pushen, CI und Pages-Veröffentlichung abschließen.
