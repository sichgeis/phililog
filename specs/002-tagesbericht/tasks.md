# Aufgaben und Prüfnachweise

- [x] Umfang und technische Entscheidungen dokumentiert.
- [x] Datenbank, Einstellungen, Schätzungen und Tagesbericht implementiert.
- [x] Fachlogik, lokale Datenbank und mobile Browseransichten geprüft.
- [x] Migration 006 produktiv ausgeführt: „Success. No rows returned“. Keine bestehenden Ereignisse verändert.
- [x] Pages-Veröffentlichung erfolgreich: [Workflow 34750264479](https://github.com/sichgeis/phililog/actions/runs/34750264479), App-Code `dc43655`.

## Prüfung am 13. September 2026

- `npm run check`: 20 Tests, TypeScript und Produktionsbuild erfolgreich. Standard 25/50 und 35/70, manuelle/fehlende/Null-Schätzung, Bearbeitung ohne rückwirkenden Standardwechsel, CSV und Wiederholvergleich. Deutsche Kalendertage einschließlich Zeitumstellung.
- `node scripts/test-local-supabase.mjs`: Zugriff beider Eltern, Fremdzugriff auf Einstellungen/Report, ungültige Einstellungen und Mengen, konkurrierende Settings-Änderung, RLS, gemeinsame CRUD und Export erfolgreich. Bericht umfasst mehr als 505 Einträge. SQL-Test über einen 23-Stunden-Tag: 60 ml Flasche, 50 ml Stillen, eine fehlende Schätzung, zwei Wickelereignisse davon einmal Urin und Stuhl; Grenzereignis korrekt am Folgetag. Bericht aktualisiert nach Korrektur und Löschung.
- Browser-Harness ausschließlich lokal mit synthetischen Daten: 25 ml links, 50 ml beide, Neuladen erhält Entwurf; Speicherung 50 ml, Standard auf 35, neuer Eintrag 70 ml; alter Eintrag bleibt 50 ml. Bearbeitung auf 45 ml führt zum Bericht mit 115 ml Still-Schätzung. Fehlende Altschätzungen markiert. Frühere Siebentage-Spanne korrekt geladen. Standard nach Prüfung lokal wieder auf 25 gesetzt.
- Darstellung bei 390 px und 320 px ohne horizontalen Überlauf geprüft. Screenshots `/private/tmp/phililog-report.png`, `/private/tmp/phililog-report-320.png`, `/private/tmp/phililog-settings-320.png`. Teilweise DOM-Formularaktionen nach zuvor wirkungslosen CDP-Klicks; keine echte Smartphone-Installation behauptet.

Abgeschlossen. Keine offenen Implementierungsaufgaben; tatsächliche Bedienung auf euren Smartphones bleibt euer Praxisfeedback.

## Getrennte Standards und Bestandskorrektur

21 Fachlogiktests und Build erfolgreich. Lokale Supabase prüft getrennte Werte, atomare Validierung, Fremdzugriff und Versionskonflikte. Die Bestandsmigration wurde mit synthetischen Ereignissen innerhalb einer zurückgerollten Transaktion geprüft: Zuordnung, 50 ml bei beiden, NULL bei offener Seite, Erhalt anderer Felder und geschützte Originalsicherung. Mobile Browserprüfung bei 320 px: links 20, rechts 35, beide 55 ml; Settings ohne horizontalen Überlauf, Screenshot `/private/tmp/phililog-separate-settings.png`.

Migrationen 007/008 produktiv in einer Transaktion erfolgreich. Anschließende reine Ergebniskontrolle bestätigt `correction_complete=true` und `backup_protected=true`. Keine Familiendaten ins Repository exportiert; Originale ausschließlich im privaten Datenbankschema. Neue Einträge behalten die normale Kontozuordnung.

Abgeschlossen: [Pages-Workflow 34750629555](https://github.com/sichgeis/phililog/actions/runs/34750629555) erfolgreich; veröffentlichter App-Code `1aa993d`.
