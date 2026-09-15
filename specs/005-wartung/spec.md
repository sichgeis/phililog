# 005 – Wartung und zuverlässige Speicherung

Status: Abgeschlossen; Nachweise in [tasks.md](tasks.md).

Abgestimmt am 13. September 2026: Wartungspaket nach Maintenance-Review ausdrücklich zur Umsetzung einschließlich Tests, Commit und Push freigegeben. Produktionsdeployment wurde später mit Feature 006 beauftragt und am 14. September 2026 abgeschlossen. Architektur, Aquarellgestaltung und Produktumfang bleiben erhalten.

- REQ-001 / AC-001: Ein Einstellungsentwurf behält seine Ausgangsversion auch bei Hintergrundaktualisierung. Eine fremde Änderung wird als Konflikt angezeigt. Eigene Werte bleiben sichtbar; „Serverwerte übernehmen“ verwirft sie ausdrücklich und startet mit der aktuellen Version.
- REQ-002 / AC-002: Nach verlorener Speicherantwort erkennt dieselbe UUID den bereits erstellten Eintrag auch nach fremder Korrektur. Die Korrektur bleibt erhalten und wird benannt. Nach zwischenzeitlicher Löschung wird der Eintrag nicht wieder angelegt; die Oberfläche erklärt dies und gibt das Formular frei. Ungewisse Netzwerkfehler behalten die Wiederholungs-ID.
- REQ-003 / AC-003: Alle abweichenden Eingaben einschließlich Windel, Milchart, Seite, Dauer, Zeitpunkt und Settings werden vor Verwerfen/Abmelden geschützt. Hintergrundaktualisierungen erhalten Eingaben, Fokus und geöffnete Formularbereiche.
- REQ-004 / AC-004: Push und PR führen Fachlogik-, UI- und isolierte lokale Datenbankprüfungen aus. Deployment bleibt ausschließlich manuell.
- REQ-005 / AC-005: Dokumentation beschreibt aktuellen Aufbau, Gestaltung, Migrationsnachweis und vollständige Wiederherstellung. Restore wird ausschließlich mit synthetischen Daten geprüft; historische produktive Migrationen werden weder geändert noch erneut angewandt.

Grenze: Vor Einführung des UUID-Nachweises bereits gelöschte Einträge lassen sich nachträglich nicht erkennen. CSV ersetzt keine vollständige Sicherung.

## Integration mit dem veröffentlichten Bedienlayout

Am 13. September 2026 ausdrücklich beauftragt: Wartungspaket mit aktuellem `main` zusammenführen, prüfen und auf `main` pushen. Feature 004 und Migration 010 sind durch das bereits veröffentlichte Layout belegt. Wartung wird daher Feature 005 und der zu diesem Zeitpunkt noch unveröffentlichte UUID-Nachweis Migration 011. Layout, Kalenderwochen und geschützte Personenzuordnung bleiben erhalten. Offene Formularbereiche werden anhand ihrer stabilen IDs erhalten, auch wenn sich die Reihenfolge durch einen Artwechsel ändert.
