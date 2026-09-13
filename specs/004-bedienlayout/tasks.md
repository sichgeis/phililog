# Umsetzung und Prüfnachweise

Stand: Lokal abgeschlossen am 13. September 2026; produktive Migration anschließend beauftragt und abgeschlossen; Veröffentlichung abgeschlossen.

- [x] Umfang samt Ausnahme Stillablauf und KW-Navigation abgestimmt.
- [x] Formular, Navigation, Logbuch, Bearbeitung und Auswahlzustände umgesetzt.
- [x] ISO-Wochenlogik, heutiges Datum und geschützte aktuelle Person umgesetzt.
- [x] `npm run check`: 25 Tests, TypeScript und Produktionsbuild erfolgreich. Neue Tests: KW 53/Jahreswechsel, KW 1 im Vorjahr, Montag/Sonntag, Sommerzeit, laufende Woche, Zukunftsbegrenzung, unvollständige und geschätzte Summen. `git diff --check` erfolgreich.
- [x] Migration 010 ausschließlich lokal eingespielt. `node scripts/test-local-supabase.mjs` erfolgreich: Mitglieder Julia/Christian bekommen eigene Rolle, Außenstehende NULL, anonymer Zugriff verweigert; bestehende CRUD-/Versions-/Exportprüfungen ebenfalls erfolgreich.
- [x] AC-001 und REQ-007: Browser-Harness, lokale App `http://127.0.0.1:5173`, 390 × 844, 320 × 740 und 1440 × 900. Kein horizontaler Überlauf; normaler Still-Speicherknopf endet bei y≈746, letzte Mahlzeit steht oberhalb. Desktop zeigt Dauer/Zeit nebeneinander; Navigation sticky, Einstellungen direkt erreichbar.
- [x] AC-002: Flasche mit erfundenen 65 ml und Befinden gespeichert, Erfolg und frischer Zustand ohne Befinden bestätigt. Wechsel/Abwahl des Befindens, Wickel-Toggle an/aus, Wiegen-Eingabe und manuelle Zeitansicht geprüft. Stillstart, Speichersperre, Wiederherstellung nach Neuladen, Ende und bestätigte Rückkehr zu manuellen Zeiten geprüft.
- [x] AC-003: Logbuch visuell geprüft; Menge/Dauer hervorgehoben. Testeintrag bearbeitet, Personenauswahl 48 px hoch, Änderung Julia→Christian gespeichert und im Logbuch bestätigt; Abbrechen oben geprüft. Fokus bleibt bei Art-/Toggle-/Befindenauswahl erhalten; ausdrückliche Abwahl fokussiert die Zusammenfassung. Testeintrag anschließend über Löschdialog entfernt und Entfernung bestätigt.
- [x] AC-004: KW 37→36→37, beide Pfeile und Heute-Sprung geprüft, Zukunftspfeil in aktueller Woche gesperrt, keine Datumseingabe. Sieben Tage in abgeschlossener Woche, fehlende Stillmengen unmittelbar als unvollständig ausgewiesen. Jahresgrenzen und verkürzte aktuelle Woche zusätzlich fachlich getestet.
- [x] AC-005/006: Reale lokale API-Aufrufe erfolgreich, einschließlich Rollenabfrage, Einträgen und Bericht; keine Mocks oder Request-Interception. Native Klicks und Tastatureingaben; ein pausierender Hintergrundtab wurde zur zuverlässigen Eingabeverarbeitung aktiviert.
- [x] Barrierefreiheitsstichprobe: Schrift ausschließlich im Browser auf doppelte berechnete Größe gesetzt (kein horizontaler Überlauf bei 390 px), danach Neuladen. Bei 390 × 420 als Tastatur-Viewport-Simulation blieb das fokussierte Gewichtsfeld frei, Speicherleiste war statisch. Aufklappbares Befinden bei 320 px in zwei Reihen.

Grenzen: Keine vollständige Barrierefreiheitszertifizierung und keine physische iOS-/Android-PWA-/Tastaturprüfung. Diese Browser-Simulationen ersetzen keine Geräteabnahme. Migration 010 ist bereits produktiv eingespielt; siehe docs/setup.md.

## Veröffentlichung

- [x] Erneute Prüfung: 25 Tests, TypeScript, Build und `git diff --check` erfolgreich.
- [x] Vor Migration konsistente Sicherungen von Einträgen, Einstellungen und Mitgliedszuordnung unter `private.*_before_20260913_layout` erstellt; sämtliche Rechte für public/anon/authenticated entzogen. Keine Familiendaten ins Repository exportiert.
- [x] Migration 010 gezielt produktiv ausgeführt, ohne frühere Migrationen erneut anzuwenden. Transaktion mit kurzen Schreibsperren und Vorher-/Nachher-Prüfsummen bestätigt unveränderte Originaltabellen. Ablauf zuvor lokal mit Rollback erprobt. Funktionsrechte nach Migration geprüft.
- [x] App-Commit `a723d3c` auf main integriert; [GitHub-Pages-Deployment 34784106523](https://github.com/sichgeis/phililog/actions/runs/34784106523) erfolgreich. CI-Tests und Build erfolgreich. Produktive Leseprüfung: neues Layout, Speicherbeschriftung und Personenzuordnung sichtbar; Rollen-, Eintrags- und Einstellungsabfragen mit HTTP 200 und ohne UI-Fehler. KW-Navigation und Heute-Button sichtbar, produktiver Tagesbericht mit HTTP 200. Keine produktiven Testeinträge angelegt.

Keine offenen Implementierungsaufgaben. Der abschließende Dokumentationsstand wird ebenfalls auf main gepusht und ausgerollt; Anwendungsartefakte bleiben identisch.
