# Aufgaben – 009 Babyspiel

Bezüge: [Spezifikation](spec.md) · [Technischer Plan](plan.md)

## Aktueller Stand

- Fortschritt: T-005–T-011 lokal umgesetzt und technisch geprüft. Drei Spiele, fünf Fähigkeiten, gemeinsamer versionierter Spielstand, mobile Oberfläche und entfernbarer Einstieg sind vorhanden. Noch nicht produktiv veröffentlicht.
- Blocker: Keine bekannten technischen Blocker. Echte Smartphone-/PWA-Abnahme und subjektive Spielspaßbewertung durch beide Nutzer stehen aus; Browseremulation ersetzt diese nicht.
- Nächster Schritt: T-012 – gemeinsame Geräte- und Spielspaßabnahme der beschriebenen Version durchführen.

## Spezifikationsarbeit

- [x] T-001: Nutzeridee als getrenntes Spielpaket dokumentieren.
- [x] T-002: Gemütliches Spielgefühl, gemeinsames Baby und vorgeschlagene Startspiele übernehmen.
- [x] T-003: Minispiele, XP, Fähigkeiten, Wiederholbarkeit und updatebeständigen Fortschritt konkretisieren.
- [x] T-004: Modulgrenze, Datenhaltung, Konfliktregeln und Validierung planen; Umsetzungsaufgaben ableiten.

## Implementierungsaufgaben

- [x] T-005: Versionierten Regelkatalog und reine Rundenzustände für drei Spiele, XP und fünf Fähigkeiten implementieren; Grenzen und beide Entwicklungspfade prüfen. Bezug: REQ-002–004, REQ-009 / AC-002, AC-003, AC-012, AC-013.
- [x] T-006: Separate Spieltabellen, RLS und transaktionale Lese-/Schreib-RPCs mit Idempotenz und Versionsprüfung erstellen. Lokale Supabase-Tests einschließlich paralleler Runden/Käufe ausführen. Bezug: REQ-006–008 / AC-005, AC-008–011.
- [x] T-007: Spielstand-API und kontogebundene lokale Vormerkung mit Wiederholung, Netzfehlern und Statusanzeige implementieren. Bezug: REQ-007, REQ-008 / AC-008, AC-011, AC-014.
- [x] T-008: Eigenes dynamisch geladenes Modul, dezenter Einstieg, Rückweg, Übersicht und Skill-Tree integrieren; Logbuchentwürfe, Stillzeit und Fehlerisolation prüfen. Bezug: REQ-005 / AC-004, AC-007.
- [x] T-009: Drei mobile Minispieloberflächen, Babyillustration, Humor, Pause und ruhige Alternative umsetzen. Bezug: REQ-001–004 / AC-001–003, AC-006, AC-013.
- [x] T-010: Historische synthetische Spielstandfixtures sowie Versions-, Migrations- und Restore-Prüfungen ergänzen; Setup, Sicherung und Ausbau dokumentieren. Bezug: REQ-005, REQ-007 / AC-004, AC-010, AC-011.
- [x] T-011: Gesamte technische Prüfung ausführen, Fehler beheben und Nachweise den Akzeptanzkriterien zuordnen. Bezug: AC-001–014.
- [ ] T-012: Auf echten Ziel-Smartphones einhändig spielen, gemeinsam Spaß und Progression bewerten; Ergebnis dokumentieren und gegebenenfalls abgestimmte Anpassungen vornehmen. Bezug: AC-001, AC-003, AC-006, AC-012, AC-013.

## Prüfnachweise

- 18. September 2026, Erstentwurf: README, SDD-Ablauf, Architektur und Vorlagen gelesen; Git-Arbeitsstand vor Erstellung sauber.
- 18. September 2026, Erstentwurf: `npm run check` erfolgreich (58 Tests, TypeScript und Produktionsbuild); `git diff --check` ohne Befund.
- Zum Zeitpunkt des Spezifikationscommits: Produktkriterien noch nicht geprüft; die nachfolgenden Nachweise dokumentieren die spätere Umsetzung.
- 18. September 2026, ausgearbeitetes Paket: `npm run check` erneut erfolgreich (58 Tests, TypeScript und Produktionsbuild); `git diff --check` ohne Befund. Anforderungen und Akzeptanzkriterien mit dem Plan und T-005–T-012 abgeglichen. Keine Datenbank- oder Produktdateien geändert; daher keine lokalen Supabase-Tests ausgeführt.

### Umsetzung am 18. September 2026

- `npm run check`: 71 Tests erfolgreich, TypeScript und Produktionsbuild erfolgreich. Die Spieloberfläche wird als eigener JS-/CSS-Chunk geladen (ca. 16,7 kB JS und 6,3 kB CSS vor Kompression).
- `node scripts/test-local-supabase.mjs`: erfolgreich gegen `http://127.0.0.1:54321`; bestehende Logbuchtests plus echte Spiel-RPCs, explizite Rechteprüfung, Familien-/Fremdzugriff, Parallelität, Idempotenz, Kosten und Versionsschutz. Migration 017 nur lokal angewandt. Bereits vorhandene lokale Migrationshistorie ist unvollständig; tatsächliches Schema bis 016 geprüft, keine historischen Logbuchmigrationen wiederholt.
- `node scripts/test-restore.mjs`: alle 17 Migrationen auf leerer temporärer Datenbank, kompletter synthetischer Dump/Restore und identische Spieltabellen. V1-Fixture mit 203 Gesamt-XP, 23 Rest-XP, fünf Fähigkeiten und Statistik erhalten; offene V1-Runde nach Wiederholung genau einmal verbucht.
- Abschaltprobe mit `GAME_ENABLED = false`: 58 bestehende Logbuchtests sowie Build erfolgreich. Danach wieder aktiviert.
- Ausbauprobe in einer temporären Kopie: gesamtes Spielmodul und Integration entfernt, Spieltests aus der Kopie entfernt; 58 Logbuchtests, TypeScript und Build erfolgreich. Originaldateien blieben erhalten.
- Echte Browserprüfung mit isoliertem Headless-Chromium und synthetischem lokalen Konto; keine API-Mocks oder Request-Interception. Browser-Harness wurde zuerst versucht und scheiterte an fehlender macOS-Bedienungshilfe-Freigabe. Ersatzverfahren gemäß UI-Prüfskill verwendet.
- Browser: beide Startspiele abgeschlossen, XP und erster Kauf gespeichert, Fähigkeit nach Neuladen erhalten, Stilltimer nach Rückkehr unverändert. Anschließend zwölf weitere echte Gesprächsrunden, alle übrigen Käufe und das Greifspiel durchgespielt. Alle drei Spiele bleiben verfügbar; Trefferzone nach Upgrade 60 %. 31 Sekunden manuelle Pause ohne Rundenfortschritt. 320/390/430 CSS-Pixel ohne horizontalen Überlauf; Tippflächen im kleinsten Spielbildschirm mindestens 48 × 48 Pixel.
- Sechs Screenshots unter `/private/tmp/phililog-game-screenshots/` visuell geprüft: Übersicht, ruhiger Schnuller, Fähigkeitsbaum, Babygespräch, Greifspiel und Timingvariante. Diese Bilder sind lokale Prüfarbelege, keine echte Smartphoneabnahme.
- `git diff --check`: ohne Befund. Keine produktiven Familienereignisse gelesen oder für Tests verwendet.

| Kriterien | Tatsächlicher Nachweis / Grenze |
| --- | --- |
| AC-001 | Browserbreiten und Tippflächen geprüft; echte einhändige Smartphoneabnahme offen. |
| AC-002, AC-003 | `game-rules.test.ts`, lokale RPC-Tests, vollständiger Browser-Entwicklungspfad. |
| AC-004 | Getrennte Tabellen, Integrationsprüfung sowie bestandene Abschalt- und Ausbauprobe. |
| AC-005 | Echte lokale Auth-/RLS-Prüfung mit beiden Familienrollen, Fremdkonto, anon und entzogener Mitgliedschaft. |
| AC-006 | DOM-Hintergrundwechsel und explizite Wiederaufnahme; Browserpause 31 Sekunden; ruhige Variante durchgespielt. Echter Gerätesperrbildschirm offen. |
| AC-007 | DOM-Integration für Stillzeit, Settings und Modulladefehler; echte Browserrückkehr bei laufender Stillzeit. |
| AC-008, AC-009 | Lokale parallele RPCs und Wiederholungen; Oberflächentest verlorene Antwort/Neuladen mit derselben ID. |
| AC-010, AC-011 | Historische Fixture, Restore, wiederholte Installation, unbekannte Version/ID, alter Nachweis und offener V1-Abschluss; kontogebundene lokale Vorgänge. Zukünftige V2-Migrationen sind erst bei ihrer Entwicklung prüfbar. |
| AC-012 | Alle fünf Käufe, wiederholtes Spielen, Greifspiel und gespeicherte Statistik lokal geprüft. |
| AC-013 | Regel- und DOM-Tests für Fehler, Boni und ruhige Variante; Browserrunde ohne Timing. |
| AC-014 | DOM-Simulation von Netz-/Speicherfehlern und unbekannter Version; Auth-/Zugriffssperren in lokalen API-Tests. |

## Abschlussbedingungen für das Feature

- [ ] Implementierung ausdrücklich beauftragt und T-005–T-012 erledigt.
- [ ] Alle Akzeptanzkriterien mit tatsächlichen Nachweisen belegt.
- [ ] Updatebeständigkeit inklusive Altstand und ausstehendem Vorgang geprüft.
- [ ] Dokumentation aktuell; Veröffentlichung nur bei gesonderter Autorisierung.
- [ ] Feature-Status erst nach erfüllten Kriterien auf `Abgeschlossen` gesetzt.


## Veröffentlichung am 18. September 2026

- Nutzerauftrag: „bitte Committe und veröffentliche diesen Stand“, um produktiv auf dem iPhone zu testen.
- Freigabeprüfung: `npm run check` erneut erfolgreich (71 Tests, TypeScript und Build); Remote enthält keine zwischenzeitlichen Änderungen.
- Migration 017 produktiv über projektgebundene Management API transaktional angewandt. Vorher: Spieltabellen noch nicht vorhanden, Schema bis 016 bestätigt. Nachher: vier RLS-geschützte Spieltabellen, nur Mitglieder dürfen RPCs ausführen; direkte Browser-Schreibrechte fehlen.
- Logbuchereignisse, Settings und Mitgliedschaften innerhalb der Transaktion exakt über serverinterne Prüfsummen verglichen: unverändert. Keine produktiven Testeinträge oder Spielrunden angelegt.
- Migrationsdatei SHA-256: `c2932e41ae26c2bb895ea0ff98d9d9576624ec965c9e26f0fec2d9ecc8075af3`. Privates Ausführungsprotokoll außerhalb des Git-Bestands unter `.private/game-migration-017-release.json`.
- Frontend-Veröffentlichung: wird nach Commit/Push über „Publish GitHub Pages“ ausgeführt; Nachweis folgt.
