# Aufgaben und Prüfnachweise

Status: In Umsetzung; lokale Implementierung und Prüfung abgeschlossen, GitHub-CI nach Push noch zu bestätigen.

- [x] Freigegebenen Umfang und Fehlerfälle spezifiziert.
- [x] Settings, Wiederholung und Entwurfs-/Fokuserhalt umgesetzt und geprüft.
- [x] CI für Push/PR und Actions aktualisiert; Deployment bleibt manuell.
- [x] Dokumentation konsolidiert und synthetischen Restore abgeschlossen.
- [ ] Commit, Push und erster GitHub-CI-Lauf bestätigt.

## Nachweise am 13. September 2026

- AC-001: Reale Formularhandler in Happy DOM: Entwurf mit Version 1, Serveränderung auf Version 2, Hintergrundrefresh, Speichern sendet weiterhin Version 1 und meldet Konflikt. Ausdrückliche Übernahme erlaubt anschließendes Speichern mit Version 2. Eingabe und Fokus bleiben erhalten.
- AC-002: Lokale Supabase mit tatsächlicher `api.ts`: Erstinsert, Wiederholung, zwischenzeitliche Korrektur auf 70 ml, erneute Wiederholung erhält die Korrektur; Löschen und Wiederholen ergibt keine Wiederanlage. Eigener Nachweis lesbar nur über geschützte Bool-RPC, fremde/andere Person ohne Nachweis, anonym abgewiesen. Zurückgewiesener Insert hinterlässt keinen Nachweis. DOM-Test bestätigt dieselbe UUID nach Netzwerkfehler sowie entsperrtes Formular nach Korrektur/Löschung.
- AC-003: Fachlogiktest umfasst Art, Windelangaben, Milchart, Seite, beide Dauern, Zeitpunkt, Befinden, Schätzung, Menge, Gewicht, Person und Stillstart. DOM-Prüfung für Verwerf-/Logoutdialog, Eingabe/Fokus, offene Details und Summary-Fokus. Zusätzlich korrigiert: manuelle Zeit für Wickeln/Wiegen wurde bisher beim Einlesen übersprungen.
- AC-004: `npm run check` bestanden: 27 Tests, TypeScript und Produktionsbuild, Bundle 256,25 kB / gzip 68,96 kB. `node scripts/test-local-supabase.mjs` bestanden einschließlich bisheriger RLS-/CRUD-/Export-/Berichts-/DST-/Settings-/Befinden-Prüfungen. Keine bestehenden npm-Produktabhängigkeiten aktualisiert; Happy DOM als reine Testabhängigkeit ergänzt, Installation meldet keine bekannten Schwachstellen.
- AC-005: `node scripts/test-restore.mjs` bestanden. Alle zehn unveränderten bzw. additiven Migrationen auf leerem Schema, synthetische Daten/Identität, vollständiger Schema-/Daten-Dump und Restore in separater Datenbank. Exakter Vergleich von acht Tabellen einschließlich Auth/Metadaten, anschließend RLS/Versionsschutz/gelöschte UUID geprüft. Testdatenbanken danach entfernt. Kein produktiver Export oder Zugriff.
- Browser-Harness, lokale Supabase und synthetisches Konto: Windel-Toggle und Fokus überleben Hintergrundrefresh; manuelle Zeit `2026-09-12T12:34` bleibt mit Fokus erhalten. Logout fragt nach Verwerfen. 390/320 px ohne horizontalen Überlauf; 320-px-Screenshot visuell geprüft. CDP-Maus-/Tastaturaktivierung war teilweise wirkungslos; entsprechende Abläufe mit DOM-Aktionen geprüft. Screenshots lokal: `/private/tmp/phililog-maintenance-390.png`, `/private/tmp/phililog-maintenance-320.png`.

## Grenzen

Migration 010 ist nur lokal angewandt; Produktion und Pages wurden nicht verändert. Vor dem späteren Deployment zuerst 010 transaktional anwenden. Schon vor 010 gelöschte IDs können nicht rekonstruiert werden. Wiederherstellung in einem neuen verwalteten Projekt und echte Smartphone-/Auth-Abnahme sind nicht als getestet behauptet.

Die bestehende lokale Testinstanz hatte unvollständige CLI-Metadaten; `migration up --local` stoppte an einer bereits vorhandenen Spalte. Danach ausschließlich 010 direkt transaktional angewandt. Die frische komplette Migrationsfolge wurde unabhängig im Restore-Test erfolgreich geprüft; 001–009 bleiben unverändert.

Nächster Schritt: Commit und Push erstellen und den GitHub-CI-Lauf prüfen.
