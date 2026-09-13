# Aufgaben und Prüfnachweise

Status: Abgeschlossen. Umsetzung, lokale Prüfung und GitHub-CI erfolgreich.

- [x] Freigegebenen Umfang und Fehlerfälle spezifiziert.
- [x] Settings, Wiederholung und Entwurfs-/Fokuserhalt umgesetzt und geprüft.
- [x] CI für Push/PR und Actions aktualisiert; Deployment bleibt manuell.
- [x] Dokumentation konsolidiert und synthetischen Restore abgeschlossen.
- [x] Commits und Push auf `codex/maintenance-reliability`; GitHub-CI erfolgreich.

## Nachweise am 13. September 2026

- AC-001: Reale Formularhandler in Happy DOM: Entwurf mit Version 1, Serveränderung auf Version 2, Hintergrundrefresh, Speichern sendet weiterhin Version 1 und meldet Konflikt. Ausdrückliche Übernahme erlaubt anschließendes Speichern mit Version 2. Eingabe und Fokus bleiben erhalten.
- AC-002: Lokale Supabase mit tatsächlicher `api.ts`: Erstinsert, Wiederholung, zwischenzeitliche Korrektur auf 70 ml, erneute Wiederholung erhält die Korrektur; Löschen und Wiederholen ergibt keine Wiederanlage. Eigener Nachweis lesbar nur über geschützte Bool-RPC, fremde/andere Person ohne Nachweis, anonym abgewiesen. Zurückgewiesener Insert hinterlässt keinen Nachweis. DOM-Test bestätigt dieselbe UUID nach Netzwerkfehler sowie entsperrtes Formular nach Korrektur/Löschung.
- AC-003: Fachlogiktest umfasst Art, Windelangaben, Milchart, Seite, beide Dauern, Zeitpunkt, Befinden, Schätzung, Menge, Gewicht, Person und Stillstart. DOM-Prüfung für Verwerf-/Logoutdialog, Eingabe/Fokus, offene Details und Summary-Fokus. Zusätzlich korrigiert: manuelle Zeit für Wickeln/Wiegen wurde bisher beim Einlesen übersprungen.
- AC-004: `npm run check` bestanden: 27 Tests, TypeScript und Produktionsbuild, Bundle 256,25 kB / gzip 68,96 kB. `node scripts/test-local-supabase.mjs` bestanden einschließlich bisheriger RLS-/CRUD-/Export-/Berichts-/DST-/Settings-/Befinden-Prüfungen. Keine bestehenden npm-Produktabhängigkeiten aktualisiert; Happy DOM als reine Testabhängigkeit ergänzt, Installation meldet keine bekannten Schwachstellen.
- AC-005: `node scripts/test-restore.mjs` bestanden. Alle zehn unveränderten bzw. additiven Migrationen auf leerem Schema, synthetische Daten/Identität, vollständiger Schema-/Daten-Dump und Restore in separater Datenbank. Exakter Vergleich von acht Tabellen einschließlich Auth/Metadaten, anschließend RLS/Versionsschutz/gelöschte UUID geprüft. Testdatenbanken danach entfernt. Kein produktiver Export oder Zugriff.
- Browser-Harness, lokale Supabase und synthetisches Konto: Windel-Toggle und Fokus überleben Hintergrundrefresh; manuelle Zeit `2026-09-12T12:34` bleibt mit Fokus erhalten. Logout fragt nach Verwerfen. 390/320 px ohne horizontalen Überlauf; 320-px-Screenshot visuell geprüft. CDP-Maus-/Tastaturaktivierung war teilweise wirkungslos; entsprechende Abläufe mit DOM-Aktionen geprüft. Screenshots lokal: `/private/tmp/phililog-maintenance-390.png`, `/private/tmp/phililog-maintenance-320.png`.

## Grenzen des ursprünglichen Branchstands (vor Main-Integration)

Migration 010 ist nur lokal angewandt; Produktion und Pages wurden nicht verändert. Vor dem späteren Deployment zuerst 010 transaktional anwenden. Schon vor 010 gelöschte IDs können nicht rekonstruiert werden. Wiederherstellung in einem neuen verwalteten Projekt und echte Smartphone-/Auth-Abnahme sind nicht als getestet behauptet.

Die bestehende lokale Testinstanz hatte unvollständige CLI-Metadaten; `migration up --local` stoppte an einer bereits vorhandenen Spalte. Danach ausschließlich 010 direkt transaktional angewandt. Die frische komplette Migrationsfolge wurde unabhängig im Restore-Test erfolgreich geprüft; 001–009 bleiben unverändert.

Keine offenen Aufgaben im freigegebenen Wartungspaket. Veröffentlichung bleibt separat zu beauftragen.

## Erster CI-Lauf

Commit `77bfdf6` gepusht. App-Job auf Node 24 erfolgreich; frischer Supabase-Start scheiterte an `LOCK TABLE` der historischen Migration 008 ohne Transaktion. Die Datei bleibt unverändert. `start-test-supabase.mjs` startet deshalb die Plattform ohne automatische Anwendung und führt jede Migration mit Nachweis explizit transaktional aus. Er verweigert die Anwendung auf bereits vorhandene PhiliLog-Tabellen.

## Abschluss

Implementierung `77bfdf6`, transaktionaler Erststart `a0378f3`, beide auf `codex/maintenance-reliability` gepusht. [GitHub Check 34775125420](https://github.com/sichgeis/phililog/actions/runs/34775125420) vollständig erfolgreich: Node-24-App-Job mit 27 Tests und Build sowie frischer Supabase-Start, alle Migrationen, API-/RLS-Regressionen und Restore. Auch checkout/setup-node in den neuen Versionen tatsächlich ausgeführt. Pages-Actions nur anhand ihrer offiziellen Manifeste geprüft, kein Deployment ausgelöst.

Zusätzliche echte Browserprüfung: lokaler Einstellungsentwurf 21 ml, paralleler Serverwert 35 ml, Hintergrundrefresh erhält Entwurf/Fokus; Speichern meldet Konflikt. Bestätigte Übernahme zeigt 35 ml. Ursprünglichen lokalen Standard 20/35 danach wiederhergestellt und synthetisches Browserkonto abgemeldet.

## Integration auf Main – beauftragt am 13. September 2026

Basis `0cfde3d` enthält Layout und Kalenderwochen (`a723d3c`) mit bereits produktiver Migration 010. Wartungsspezifikation nach 005 und unveröffentlichte UUID-Migration nach 011 umnummeriert. Historische Prüfnachweise oben nennen noch die damalige Branch-Nummer 010; produktiv ist für den UUID-Nachweis ausschließlich 011 anzuwenden. Die bereits veröffentlichte 010 bleibt unverändert.

Die zwei Implementierungen des Fokuserhalts wurden zusammengeführt: gemeinsame Funktion mit Textauswahl sowie offenen Bereichen anhand stabiler IDs. Neue Navigations-/Formularstruktur, Personenzuordnung, Kalenderwochen, Befinden-Abwahl, Stillstart-/Endfokus und Scrollen zu Speichermeldungen erhalten. Restore umfasst zusätzlich die drei privaten Layout-Sicherungstabellen und die Rollen-RPC.

Lokale Integrationsprüfung bestanden: `npm run check` mit 32 Tests, TypeScript und Build; `test-local-supabase.mjs` einschließlich beider RPCs; `test-restore.mjs` mit elf Migrationen und exaktem Vergleich von elf Tabellen. Layout-CSS, Kalenderfunktionen und veröffentlichte Migration 010 sind gegenüber `0cfde3d` unverändert.

Browser-Harness mit synthetischem Konto auf Port 5175: neues Layout/Person/Save-Beschriftung vorhanden, 390/320 px ohne Überlauf; Windel-Toggle und Fokus über Hintergrundrefresh erhalten. Manuelle Zeit, offener Zeitbereich und Eingabefokus bleiben erhalten. DOM-Aktionen nach Accessibility-Inspektion verwendet. Screenshot `/private/tmp/phililog-integrated-320.png`.

Status der Integration: Lokale Prüfung abgeschlossen. Nächster Schritt: Integrationscommit in CI bestätigen und auf Main pushen.
