# Aufgaben – 009 Babyspiel

Bezüge: [Spezifikation](spec.md) · [Technischer Plan](plan.md)

## Aktueller Stand

- Fortschritt: Grundumfang abgestimmt, Spielregeln und technischer Plan für die erste Umsetzung ausgearbeitet. Ausschließlich Dokumentation geändert.
- Blocker: Keine technischen Blocker bekannt. Nutzer hat die Implementierung für diesen Auftrag ausdrücklich ausgeschlossen. Footer-Platzierung ist bis zur Rückmeldung als Annahme markiert.
- Nächster Schritt: Nach ausdrücklichem Implementierungsauftrag T-005 beginnen.

## Spezifikationsarbeit

- [x] T-001: Nutzeridee als getrenntes Spielpaket dokumentieren.
- [x] T-002: Gemütliches Spielgefühl, gemeinsames Baby und vorgeschlagene Startspiele übernehmen.
- [x] T-003: Minispiele, XP, Fähigkeiten, Wiederholbarkeit und updatebeständigen Fortschritt konkretisieren.
- [x] T-004: Modulgrenze, Datenhaltung, Konfliktregeln und Validierung planen; Umsetzungsaufgaben ableiten.

## Vorbereitete Implementierungsaufgaben – noch nicht begonnen

- [ ] T-005: Versionierten Regelkatalog und reine Rundenzustände für drei Spiele, XP und fünf Fähigkeiten implementieren; Grenzen und beide Entwicklungspfade prüfen. Bezug: REQ-002–004, REQ-009 / AC-002, AC-003, AC-012, AC-013.
- [ ] T-006: Separate Spieltabellen, RLS und transaktionale Lese-/Schreib-RPCs mit Idempotenz und Versionsprüfung erstellen. Lokale Supabase-Tests einschließlich paralleler Runden/Käufe ausführen. Bezug: REQ-006–008 / AC-005, AC-008–011.
- [ ] T-007: Spielstand-API und kontogebundene lokale Vormerkung mit Wiederholung, Netzfehlern und Statusanzeige implementieren. Bezug: REQ-007, REQ-008 / AC-008, AC-011, AC-014.
- [ ] T-008: Eigenes dynamisch geladenes Modul, dezenter Einstieg, Rückweg, Übersicht und Skill-Tree integrieren; Logbuchentwürfe, Stillzeit und Fehlerisolation prüfen. Bezug: REQ-005 / AC-004, AC-007.
- [ ] T-009: Drei mobile Minispieloberflächen, Babyillustration, Humor, Pause und ruhige Alternative umsetzen. Bezug: REQ-001–004 / AC-001–003, AC-006, AC-013.
- [ ] T-010: Historische synthetische Spielstandfixtures sowie Versions-, Migrations- und Restore-Prüfungen ergänzen; Setup, Sicherung und Ausbau dokumentieren. Bezug: REQ-005, REQ-007 / AC-004, AC-010, AC-011.
- [ ] T-011: Gesamte technische Prüfung ausführen, Fehler beheben und Nachweise den Akzeptanzkriterien zuordnen. Bezug: AC-001–014.
- [ ] T-012: Auf echten Ziel-Smartphones einhändig spielen, gemeinsam Spaß und Progression bewerten; Ergebnis dokumentieren und gegebenenfalls abgestimmte Anpassungen vornehmen. Bezug: AC-001, AC-003, AC-006, AC-012, AC-013.

## Prüfnachweise

- 18. September 2026, Erstentwurf: README, SDD-Ablauf, Architektur und Vorlagen gelesen; Git-Arbeitsstand vor Erstellung sauber.
- 18. September 2026, Erstentwurf: `npm run check` erfolgreich (58 Tests, TypeScript und Produktionsbuild); `git diff --check` ohne Befund.
- Produktkriterien AC-001–014: nicht geprüft, da keine Spielimplementierung vorliegt.
- 18. September 2026, ausgearbeitetes Paket: `npm run check` erneut erfolgreich (58 Tests, TypeScript und Produktionsbuild); `git diff --check` ohne Befund. Anforderungen und Akzeptanzkriterien mit dem Plan und T-005–T-012 abgeglichen. Keine Datenbank- oder Produktdateien geändert; daher keine lokalen Supabase-Tests ausgeführt.

## Abschlussbedingungen für das Feature

- [ ] Implementierung ausdrücklich beauftragt und T-005–T-012 erledigt.
- [ ] Alle Akzeptanzkriterien mit tatsächlichen Nachweisen belegt.
- [ ] Updatebeständigkeit inklusive Altstand und ausstehendem Vorgang geprüft.
- [ ] Dokumentation aktuell; Veröffentlichung nur bei gesonderter Autorisierung.
- [ ] Feature-Status erst nach erfüllten Kriterien auf `Abgeschlossen` gesetzt.
