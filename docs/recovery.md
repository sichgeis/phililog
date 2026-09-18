# Sicherung und Wiederherstellung

CSV enthält lesbare Ereignisse, aber keine UUIDs, Ersteller-/Versionsmetadaten, Einstellungen, Zugriffszuordnungen oder Auth-Konten. CSV ist daher kein vollständiges Backup. Die private historische Originalsicherung aus Migration 008 allein ist ebenfalls kein Backup des Logbuchs.

## Vollständiger Sicherungssatz

Außerhalb des Repositorys verschlüsselt und zugriffsbeschränkt aufbewahren:

- Konsistente Daten und Schema von `public`, `private` und Auth, einschließlich Benutzer-UUIDs/Identitäten, Settings, UUID-Nachweisen und historischer Originalsicherung. Constraints, Trigger, Funktionen, Rechte und RLS gehören dazu.
- Migrationshistorie (`supabase_migrations`, soweit verwendet) sowie Nachweis manuell ausgeführter Migrationen mit Dateiname, SHA-256, Zeitpunkt und Ergebnis. Der CLI-Verlauf allein beweist keine manuell ausgeführte SQL-Datei.
- Git-Commit, PostgreSQL-/Supabase-Versionen und Projektkonfiguration: ausgeschaltete Registrierung/anonyme Anmeldung, Site URL, öffentliche Browservariablen und sichere administrative Zugangswiederherstellung. Keine administrativen Schlüssel im Frontend.

Vor Schema-/Datenkorrekturen eine neue Sicherung anlegen; zusätzlich regelmäßig nach dem gewünschten maximalen Datenverlust. Erfolg bedeutet einen überprüften Wiederherstellungssatz, nicht nur eine vorhandene Datei. Das Wartungspaket erzeugt keine produktiven Exporte.

## Geprüfter lokaler Ablauf

```sh
npx --yes supabase@2.117.0 start
node scripts/test-restore.mjs
```

Das Skript legt zwei leere kurzlebige Datenbanken im lokalen Container an. Es übernimmt ausschließlich die Auth-Schemadefinition, führt alle Repository-Migrationen auf dem leeren Quellschema aus und erzeugt erfundene Konten und Ereignisse. Ein konsistenter `pg_dump -Fc` sichert `public`, `private`, `auth` und `supabase_migrations` einschließlich Schema und Daten. `pg_restore --exit-on-error --single-transaction` lädt den Dump in das leere Ziel. Trigger werden erst nach den Daten eingerichtet; UUID-Nachweise werden deshalb nicht doppelt erzeugt.

Der synthetische Sicherungssatz enthält alle acht Ereignisarten einschließlich Temperatur, Sonnenbad, Massage und Babygymnastik. Verglichen werden alle Ereignisse, Settings, Mitgliedschaften, Auth-Benutzer/Identitäten, private Originalsicherung einschließlich der drei Layout-Sicherungstabellen, UUID-Nachweise und Migrationszeilen einschließlich Zeitstempeln und Versionen. Anschließend werden Familien-/Fremdzugriff, anonyme Rechte, Versionskonflikte und die Wiederholung einer gelöschten UUID geprüft. Beide Datenbanken werden auch bei Fehlern entfernt; der Dump bleibt nur im Speicher. Es werden keine vorhandenen Ereignisse exportiert.

Dieser Nachweis betrifft PostgreSQL-Daten und Zugriffsregeln in einer kompatiblen lokalen Supabase-Umgebung. Er behauptet weder eine produktive Wiederherstellung noch einen getesteten Auth-Login nach Projektwechsel. Das lokale Administrationskonto des Testcontainers ist im verwalteten Dienst nicht verfügbar.

## Wiederherstellung in einem Supabase-Projekt

Für ein verwaltetes Ziel die [offizielle Supabase-Anleitung für CLI-Backup und Restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) verwenden: Rollen, Anwendungsschema und Daten sichern, Migrationshistorie separat mitnehmen und transaktional mit Abbruch bei SQL-Fehlern laden. Während getrennter Dumps Schreibzugriffe pausieren. Die Anleitung berücksichtigt die bereits vorhandenen Plattform-Schemas und Rechte im Ziel; den lokalen Komplettschema-Restore nicht blind darauf übertragen.

PhiliLog-spezifische Abnahme:

1. Leeres kompatibles Ziel vorbereiten. Öffentliche und anonyme Registrierung ausschalten. Sicherungssatz und Migrationsnachweis prüfen; Auth-UUIDs müssen zu `private.members` und `feedings.created_by` passen.
2. Den vollständigen Sicherungssatz einschließlich `private` und Auth-Daten laden. Bei Datenimport mit bereits vorhandenen Triggern die dokumentierte Transaktion mit `session_replication_role = replica` verwenden; danach normale Triggerwirkung verifizieren.
3. Wiederhergestellte Schema-/Migrationsversion mit dem gesicherten Git-Commit vergleichen. **Migration 008 nicht erneut ausführen.** Bei fehlender CLI-Historie zunächst anhand Schema, Originalnachweis und Prüfsummen abgleichen; keine pauschale Wiederholung aller Migrationen. Nur tatsächlich neue Migrationen anschließend anwenden.
4. Zeilenzahlen und gesicherte Metadaten, Settings, genau zwei Mitgliedschaften, private Sicherung und UUID-Nachweise vergleichen. RLS aktiv, private Tabellen unzugänglich, Versionsschutz und Lösch-Nachweise wirksam prüfen. Keine neuen Testereignisse zwischen echte Familiendaten schreiben.
5. Site URL und neue öffentliche Projektkonfiguration setzen; Zugang beider Personen und Ausschluss fremder Zugänge prüfen. Browser nach Projektwechsel neu anmelden. Frontend vom passenden Commit bauen und nach gesonderter Freigabe manuell veröffentlichen.
6. Alte Sicherung behalten, bis Daten und Zugriff auf beiden Geräten bestätigt sind. Bei Fehlern nicht weiter migrieren oder Quellbestand löschen, sondern das leere Ziel erneut aus der Sicherung aufbauen.

Der Wechsel zu einem neuen verwalteten Projekt und die gerätespezifische Anmeldung bleiben eine gesonderte Betriebsabnahme.


## Spielstand ab Migration 017

Der vollständige Sicherungssatz umfasst zusätzlich `public.game_state`, `public.game_unlocks`, `public.game_stats` und `public.game_operations`. Die Vorgangsnachweise sind notwendig, damit die Wiederholung einer alten Speicherung keine doppelten XP vergibt. Ein Logbuch-CSV enthält keinen Spielstand.

`test-restore.mjs` vergleicht alle vier Tabellen nach dem Dump/Restore und einer erneuten verlustfreien Spielinstallation. Der historische synthetische V1-Stand enthält 203 Gesamt-XP, 23 verfügbares XP, fünf Fähigkeiten, Statistik und einen verarbeiteten Vorgang. Eine vorgemerkte V1-Runde wird nach Restore zweimal angefragt und genau einmal hinzugefügt. Fixtures bei zukünftigen Versionen ergänzen, nicht überschreiben.

Nur lokal vorgemerkte, noch nicht bestätigte Vorgänge sind nicht in einer Datenbanksicherung enthalten. Sie verbleiben kontogebunden auf dem jeweiligen Gerät. Nach Wiederherstellung erst Identitäten und Spielversionen prüfen; keine Spieltabellen als vermeintliche Reparatur leeren.
