# Private Bezugspersonen: Veröffentlichung und Grenzen

Produktionsrollout und koordinierte Historienbereinigung am 24.10.2026 ausdrücklich freigegeben und erfolgreich ausgeführt; tatsächliche Ergebnisse stehen in den Feature-Aufgaben. [Anforderungen](../specs/013-private-bezugspersonen/spec.md).

## Vor Freigabe

Patch basiert auf dem bereits bereinigten main. Keine Rückkehr zum alten lokalen main, kein Push alter Referenzen, kein Force-Push. Bestehende produktive Migrationen bleiben unverändert; die historischen Installationsvorlagen im Repository werden separat und ausdrücklich autorisiert neutralisiert. Änderungen an Produktionsdaten oder Zugang sind nicht Teil dieses Patches.

Prüfen: `npm run check`, `node scripts/test-local-supabase.mjs`, `node scripts/test-restore.mjs` und `node scripts/test-restore.mjs --legacy-identities`. Bei einer bestehenden lokalen Testdatenbank mit alten Rollen `node scripts/test-local-supabase.mjs --existing-local-identities` verwenden. Bestehende lokale Testinstanzen erhalten ausschließlich 023 über `node scripts/apply-local-caregiver-migration.mjs`; neue Instanzen laden alle Migrationen automatisch. Keine echten Familienwerte in Tests, Protokollen oder Screenshots.

## Freigegebener Ablauf

1. Aktuellen vollständigen privaten Sicherungssatz nach [Wiederherstellung](recovery.md) und veröffentlichte Clientversion bereithalten. Administrativ nur Schema/Migrationsstand und die zwei Mitgliedschaftszuordnungen abgleichen; keine Gesundheitsdaten abrufen. 023 darf nicht vorhanden sein; abweichendes Schema zuerst klären.
2. Nur `202610240023_caregiver_presentation.sql` transaktional anwenden und Dateiprüfsumme/Ergebnis privat protokollieren. Keine historischen Korrekturen erneut ausführen, kein pauschales `db push`. Danach PostgREST-Schemacache aktualisieren (`NOTIFY pgrst, 'reload schema';`). Der bisherige Client läuft unverändert weiter.
3. Die zwei bestehenden Benutzer-UUIDs privat der bisherigen violetten Aquarell-Darstellung (A) und türkisfarbenen Sternendarstellung (B) zuordnen. Mit diesen UUIDs `scripts/configure-caregivers.sql` administrativ ausführen; psql-Variablen `caregiver_a_user_id` und `caregiver_b_user_id` privat setzen. Das Skript liest ausschließlich vorhandene Mitgliedschaften und übernimmt deren bisherigen Text als Anzeigename. Keine UUIDs/Namen in öffentliche Skripte einsetzen. Fehler rollen die Konfiguration zurück; bei bestehender Konfiguration erst prüfen statt überschreiben.
4. Administrativ bestätigen: genau zwei korrekt zugeordnete Profile, keine Browserrechte auf private Tabellen, Familienprüfung der neuen RPC. Alten Client und bestehende Sitzungen weiterlaufen lassen. Profilwerte nur privat beurteilen. Keine produktiven Testeinträge anlegen.
5. Erst nach vollständiger Konfigurationsprüfung den neuen Client über den manuellen Pages-Workflow veröffentlichen. Supabase-Projekt, Browser-Origin, Auth-Einstellungen und Session-Speicher unverändert lassen. Mit vorhandenen Sitzungen Darstellung und Entwurfserhalt prüfen; ein normaler privater Login kann zusätzlich geprüft werden, ohne Passwörter zu ändern oder Sitzungen zurückzusetzen. Bei Problemen sofort Client zurückrollen.

## Rückfall

Vor Veröffentlichung bleibt der alte Client aktiv; eine fehlgeschlagene Migration wird transaktional zurückgenommen. Bei fehlgeschlagener Konfiguration bleibt die additive Migration unschädlich stehen. Nach Veröffentlichung die vorherige Clientversion wieder bereitstellen. Nicht beliebige historische Commits aus der neu geschriebenen Historie veröffentlichen: deren frühere Clients erwarten neutrale Testrollen und passen nicht zum unveränderten Produktionsvertrag. Für den Rückfall ausschließlich das gesicherte tatsächlich veröffentlichte Frontend-Artefakt oder einen separat geprüften aktuellen kompatiblen Client verwenden. Alte produktive RPCs, Constraints und Daten wurden nicht verändert; Profile dürfen stehen bleiben. Keine Datenrückschreibung, kein Auth-Reset und keine Löschung von Sitzungen oder Ereignissen. Die neue RPC kann vorübergehend ausfallen: Der neue Client bleibt beim Logbuch nutzbar, persönliche Farben/Effekte und vollständige Auswahl sind dann eingeschränkt.

## Öffentlich verbleibend / koordinierter Nachlauf

Dies entfernt persönliche Literale aus dem neuen Laufzeitcode und verlagert Anzeige in eine nur für Mitglieder lesbare Laufzeitkonfiguration. Alte private Identitätswerte bleiben absichtlich erhalten; das ist keine vollständige Datenbankanonymisierung.

Die geprüften Ersatzhistorien entfernen persönliche Literale aus allen erreichbaren Dateiversionen einschließlich 001/005/008, Laufzeitquellen, Tests und HTML-Galerien. Originale Git-Autorenzuordnung bleibt ausdrücklich akzeptiert. Die frühere Produktions-App und alte GitHub-Caches/Actions-/Pages-Artefakte können bis zur Ablösung bzw. GitHub-seitigen Bereinigung noch Altinhalte enthalten. Nicht mehr referenzierte alte Commits sind durch Force-Push allein nicht gelöscht.

Für die konsolidierte GitHub-Support-Anfrage: nach der ausdrücklich abgestimmten Historienbereinigung die alten Commit-/Blob-Referenzen dieser Pfade, historische Actions-Artefakte und alte Pages-Artefakte aufnehmen. Keinen vollständigen Purge behaupten, solange die derzeit erreichbaren SQL-/Git-Quellen dieselben Werte noch enthalten. Der bestehende Support-Vorgang bleibt beim übergeordneten Bereinigungschat; keine Nachricht wurde gesendet. Eine weitere Historienumschreibung muss mit beiden bereinigten Branches und bestehenden Klonen koordiniert werden. Originale Git-Autorenzuordnung bleibt ausdrücklich akzeptiert.
