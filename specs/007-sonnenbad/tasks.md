# Aufgaben und Prüfnachweise

Stand: Implementiert und mobil geprüft. Migration 014 produktiv angewendet; Frontend-Veröffentlichung läuft.

- [x] Umfang aus Nutzerauftrag dokumentiert.
- [x] Sonnenbad unter Mehr mit Sonnensymbol, Zeitpunkt und eigener optionaler Dauer. Keine fachfremden Felder. Wiederherstellung älterer Entwürfe bleibt durch newDraft-Defaults möglich.
- [x] Migration 014 lokal transaktional angewendet: nur Arten-/Detailconstraints erweitert, keine neuen Spalten oder Rechte.
- [x] `npm run check`: 45 Tests, TypeScript und Produktionsbuild erfolgreich. Neue Fachtests prüfen optionale und ungültige Dauer, getrennte Fütterungsdauern, exakten Nachtrag bei Korrektur, Person, CSV und Wiederholungsvergleich. DOM prüft Menü, Entwurf inklusive Session-Wiederherstellung, Artwechsel, Speicherung, Rücksetzen und Still-Sperre.
- [x] `node scripts/test-local-supabase.mjs` erfolgreich mit synthetischen Daten: Erstellen, gemeinsame Korrektur, leere Dauer, veraltete Version, Löschen, Fremdzugriff und fachfremde Werte geprüft. Berichtstest auf fachliche Summen präzisiert: Milch- und Wickelsummen bleiben gleich; allgemeine Ereigniszahl steigt um eins.
- [x] `git diff --check` erfolgreich.
- [x] Mobile Browser-Sichtprüfung am 15.09.2026 mit Browser-Harness, echter lokaler Supabase und synthetischem Konto: Sonnenbad-Formular bei 390 × 844 und 320 × 740 ohne horizontalen Überlauf, leere optionale Dauer. Screenshots visuell geprüft. Speichern mit 3 Minuten ergibt HTTP 201; Logbuch zeigt Sonnenbad, 3 Min. und Christian. Keine Mocks.

Nächster Schritt: Pages-Veröffentlichung abschließen und ausgelieferte Oberfläche prüfen.

Grenzen: Keine physische Smartphone-Abnahme. Interne produktive Sicherung ersetzt keinen vollständigen externen Sicherungssatz.


## Veröffentlichungsauftrag und Projektpflege – 15. September 2026

- [x] Gesamten Remote-/Arbeitsstand geprüft, keine fremden Änderungen gefunden. Anwendung (45 Tests, TypeScript, Build), lokale Supabase und Restore erfolgreich.
- [x] README konsolidiert; Architektur, Gestaltung, Betrieb und Wiederherstellung aktualisiert. Feature-Status und historische Nachweise getrennt, veraltete Angaben zu bereits veröffentlichten Migrationen korrigiert. Offene physische Geräteabnahme in Feature 001 erhalten.
- [x] Restore-Test um Temperatur, Sonnenbad und neuen Befindenwert erweitert. Alle 14 Migrationen auf leerer lokaler Datenbank und kompletter synthetischer Dump/Restore erfolgreich. Migrationszahl wird aus den vorhandenen Dateien ermittelt.
- [x] Chrome-Zugang mit Nutzerfreigabe wiederhergestellt, mobile Prüfung und Migration 014 abgeschlossen.

- [x] Commit `40551e215db20030cfdbf90b8889dec46f956792` auf main gepusht. [CI 34972773232](https://github.com/sichgeis/phililog/actions/runs/34972773232) erfolgreich: App sowie isolierte Datenbank mit allen Migrationen, API/RLS-Tests und Restore.
- [x] Migration 014 am 15.09.2026 per Management API produktiv angewendet: transaktionale interne Sicherung im privaten Schema, exakter Bestandsvergleich erfolgreich; RLS und Schutz der Sicherung separat bestätigt. SHA256 der Migration: `b201434ccbf4989636c2ba5577c1616faabfb1ad5fe99d60597813dd826c9b1e`. Keine produktiven Testeinträge erzeugt.
- [ ] Pages-Veröffentlichung abschließen.

## API-Zugang statt Browseradministration

Am 15. September 2026 beauftragt. Offizielle PAT-/Management-API-Dokumentation geprüft. Projektbezogenen Token mit ausdrücklicher Nutzerfreigabe im Dashboard erstellt, ohne Tokenausgabe außerhalb Git mit Verzeichnisrechten 0700 und Dateirechten 0600 gespeichert. Reiner SELECT-1-Zugriffstest erfolgreich. Nur Database/Migrations Read-write für Philine-Log; Ablauf 14.12.2026. Ablauf in [setup.md](../../docs/setup.md#browserunabhängiger-administrationszugang).

Einrichtungshilfe mit ausschließlich synthetischen Tokens und ersetztem API-Aufruf geprüft: Dateirechte 0600/0700, keine Tokenausgabe, vorhandener Token bei API-Fehler unverändert. `npm run check` mit 45 Tests und Build erfolgreich. Reale Tokenprüfung und produktive Migration erfolgreich.
