# Aufgaben und Prüfnachweise

Stand: Lokal implementiert, mobile Sichtprüfung offen. Nicht veröffentlicht.

- [x] Umfang aus Nutzerauftrag dokumentiert.
- [x] Sonnenbad unter Mehr mit Sonnensymbol, Zeitpunkt und eigener optionaler Dauer. Keine fachfremden Felder. Wiederherstellung älterer Entwürfe bleibt durch newDraft-Defaults möglich.
- [x] Migration 014 lokal transaktional angewendet: nur Arten-/Detailconstraints erweitert, keine neuen Spalten oder Rechte.
- [x] `npm run check`: 45 Tests, TypeScript und Produktionsbuild erfolgreich. Neue Fachtests prüfen optionale und ungültige Dauer, getrennte Fütterungsdauern, exakten Nachtrag bei Korrektur, Person, CSV und Wiederholungsvergleich. DOM prüft Menü, Entwurf inklusive Session-Wiederherstellung, Artwechsel, Speicherung, Rücksetzen und Still-Sperre.
- [x] `node scripts/test-local-supabase.mjs` erfolgreich mit synthetischen Daten: Erstellen, gemeinsame Korrektur, leere Dauer, veraltete Version, Löschen, Fremdzugriff und fachfremde Werte geprüft. Berichtstest auf fachliche Summen präzisiert: Milch- und Wickelsummen bleiben gleich; allgemeine Ereigniszahl steigt um eins.
- [x] `git diff --check` erfolgreich.
- [ ] Mobile Browser-Sichtprüfung: Browser-Harness konnte keine Verbindung herstellen. Diagnose bestätigt deaktiviertes Chrome Remote Debugging. Keine Browserprüfung oder Screenshots für dieses Feature behauptet. Lokaler Testserver nach Prüfung beendet.

Nächster Schritt: Chrome Remote Debugging aktivieren und Sonnenbad bei 320/390 px mit lokalem synthetischem Konto visuell prüfen.

Grenzen: Keine physische Smartphone-Abnahme; Commit und Push abgeschlossen; produktive Migration und Veröffentlichung warten auf Browserzugang. Für Veröffentlichung zuerst Migration 014 anwenden.


## Veröffentlichungsauftrag und Projektpflege – 15. September 2026

- [x] Gesamten Remote-/Arbeitsstand geprüft, keine fremden Änderungen gefunden. Anwendung (45 Tests, TypeScript, Build), lokale Supabase und Restore erfolgreich.
- [x] README konsolidiert; Architektur, Gestaltung, Betrieb und Wiederherstellung aktualisiert. Feature-Status und historische Nachweise getrennt, veraltete Angaben zu bereits veröffentlichten Migrationen korrigiert. Offene physische Geräteabnahme in Feature 001 erhalten.
- [x] Restore-Test um Temperatur, Sonnenbad und neuen Befindenwert erweitert. Alle 14 Migrationen auf leerer lokaler Datenbank und kompletter synthetischer Dump/Restore erfolgreich. Migrationszahl wird aus den vorhandenen Dateien ermittelt.
- [ ] Chrome-Zugang wiederherstellen; danach mobile Prüfung, Migration 014 und Deployment abschließen.

- [x] Commit `40551e215db20030cfdbf90b8889dec46f956792` auf main gepusht. [CI 34972773232](https://github.com/sichgeis/phililog/actions/runs/34972773232) erfolgreich: App sowie isolierte Datenbank mit allen Migrationen, API/RLS-Tests und Restore.
- [ ] Veröffentlichung noch nicht gestartet: Chrome Remote Debugging deaktiviert; Nutzer um Aktivierung gebeten. Migration 014 ist vorbereitet, aber nicht produktiv ausgeführt. Bestehende Live-Version bleibt erhalten.
