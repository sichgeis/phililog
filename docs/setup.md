# Einrichtung

Die Anwendung benötigt GitHub Pages für die Oberfläche und ein Supabase-Free-Projekt für Datenbank und Anmeldung. Es wird kein zusätzliches Produktionsbackend betrieben. Die lokale Docker-Instanz dient ausschließlich der Entwicklung.

## Supabase Free vorbereiten

1. Im Supabase-Dashboard eine **Free-Organisation** und ein Free-Projekt anlegen. Keinen Pro-Tarif oder kostenpflichtige Zusatzfunktionen wählen. Eine verfügbare EU-Region wählen. Das Datenbankpasswort sicher aufbewahren.
2. Die SQL-Dateien unter `supabase/migrations/` in aufsteigender Reihenfolge im SQL-Editor des neuen Projekts jeweils einmal ausführen. Bei bestehenden Installationen nur die noch fehlenden Migrationen anwenden. Die Migration legt Tabellen, Constraints und Zugriffsregeln an.
3. In Authentication die öffentliche Registrierung („Allow new users to sign up“) und anonyme Anmeldung deaktivieren.
4. Unter Authentication → Users zwei Benutzer mit den tatsächlichen E-Mail-Adressen von Julia und Christian und jeweils eigenem sicheren Passwort administrativ erstellen. Bei dieser manuellen Einrichtung die E-Mail bestätigen. Dadurch ist für den MVP kein eigener E-Mail-Versand nötig. Zugangsdaten nicht im Repository speichern.
5. Die beiden Benutzer-UUIDs kopieren und im SQL-Editor einsetzen:

```sql
insert into private.members (user_id, person) values
  ('UUID-VON-JULIA', 'Julia'),
  ('UUID-VON-CHRISTIAN', 'Christian');
```

Die Zulassungstabelle erlaubt höchstens eine Person je Rolle, insgesamt zwei. Sie ist nicht über die Browser-API veränderbar. Das bloße Anlegen eines weiteren Auth-Benutzers gewährt keinen Zugriff.

6. Projekt-URL und **Publishable-Key** (alternativ Legacy-`anon`-Key) unter den API-Einstellungen ablesen. Niemals `service_role`, `sb_secret_…` oder Datenbankpasswörter in Vite-Variablen verwenden.
7. Lokal `.env.example` nach `.env.local` kopieren und nur URL und öffentlichen Schlüssel einsetzen. `npm ci` und `npm run dev` starten.
8. Mit beiden Konten prüfen: Einträge erstellen, gemeinsam lesen, korrigieren, löschen, Anmeldung nach Neuladen behalten. Mit einem nicht freigeschalteten Testkonto und ohne Anmeldung Zugriff verifizieren, bevor echte Daten erfasst werden.

Für ein neues oder verlorenes Passwort kann ein Projektadministrator den Zugang administrativ zurücksetzen. Ein automatischer E-Mail-Recovery-Prozess ist im MVP nicht eingerichtet. Bei verlorenem Smartphone die betroffene Sitzung bzw. den Zugang administrativ sperren; eine entfernte Mitgliedschaft entzieht Datenzugriff auch bei noch gültigem Token.

## GitHub Pages

Das Repository wurde am 12. September 2026 auf ausdrücklichen Wunsch öffentlich gemacht und GitHub Pages mit GitHub Actions als Quelle aktiviert. **GitHub Free unterstützt Pages für öffentliche Repositories.** Die Logbucheinträge bleiben in Supabase; Quellcode und Anmeldeseite dürfen öffentlich sein. [GitHub-Dokumentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Für eine ausdrücklich beauftragte Veröffentlichung:

1. In GitHub unter Settings → Secrets and variables → Actions → Variables die öffentlichen Variablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY` anlegen.
2. Unter Settings → Pages als Source „GitHub Actions“ wählen.
3. Den Workflow „Publish GitHub Pages“ manuell ausführen. Er führt Tests und Build durch und verwendet den Repositorynamen als Basispfad, hier `/phililog/`.
4. Die veröffentlichte URL bei Supabase als Site URL eintragen. Anmeldung, RLS und CRUD mit beiden Konten auf den echten Smartphones prüfen.
5. Die App auf dem Smartphone zum Home-Bildschirm hinzufügen. Es gibt keine separate native App. Die App benötigt zum Laden und Speichern Internet; eine laufende Stillzeit wird aus Zeitstempeln berechnet und läuft im Hintergrund weiter, ohne einen dauernd aktiven Timer zu benötigen.

Ein normaler Push löst kein Deployment aus. Es werden keine externen Fonts, Tracker oder Analyse-Dienste geladen.

## Lokale Entwicklung mit echter Supabase-Instanz

Voraussetzungen: Node.js ab 22.12 und Docker. Diese Schritte betreffen nur den lokalen Rechner; kein kostenpflichtiges Cloud-Projekt wird angelegt.

```sh
npm ci
node scripts/start-test-supabase.mjs # nur beim ersten Start einer leeren Testdatenbank
node scripts/test-local-supabase.mjs --configure-preview
npm run dev
```

Für eine bereits eingerichtete lokale Datenbank stattdessen `npx supabase@2.117.0 start` verwenden. Der Erststart kopiert nur die Plattformkonfiguration und wendet anschließend jede Migration samt Nachweis in einer expliziten Transaktion an. So funktionieren auch die Tabellensperren der unveränderten Migration 008. Vorhandene PhiliLog-Tabellen führen zum sicheren Abbruch; der Erststart ist kein Reset oder Reparaturwerkzeug.

Das Testskript erstellt ausschließlich in der lokalen Instanz synthetische Konten, prüft erlaubte/verbotene API-Zugriffe und schreibt auf Wunsch eine ignorierte `.env.local` mit öffentlicher lokaler Konfiguration. Der lokale Testzugang wird im Terminal genannt und ist ausschließlich für erfundene Testdaten vorgesehen. Keine echten Baby-Daten in der lokalen Testinstanz erfassen.

```sh
npm run check
node scripts/test-local-supabase.mjs
npx supabase@2.117.0 stop
```

Die Testdatenbank wird beim Stoppen nicht automatisch gelöscht. `supabase db reset` würde lokale Daten löschen und ist kein normaler Startschritt.

## Datensicherung und Grenzen

- CSV dient als lesbarer Ereignisexport. Für vollständige Sicherungen und den geprüften Restore-Ablauf siehe [Wiederherstellung](recovery.md). Eine CSV-Importfunktion gibt es nicht.
- Supabase Free kann bei geringer Aktivität pausieren und bietet keine automatischen Backups. Vor produktiver Einrichtung die [aktuellen Tarifbedingungen](https://supabase.com/pricing) prüfen.
- Auth-Sitzung und ungespeicherter Entwurf liegen auf dem eigenen Gerät. Entwürfe werden bei Abmeldung entfernt. Browserdatenlöschung kann sie verlieren. Laufende Stillzeiten werden erst beim Speichern gemeinsam sichtbar, nicht bereits beim Start auf dem anderen Handy.
- Für einen Stillnachtrag werden Beginn und Ende aus Endzeit und Dauer abgeleitet. Nach einer Start-/Endmessung bleiben die genauen Zeitstempel erhalten; für eine manuelle Korrektur „Zeiten manuell angeben“ wählen.

## Produktiver Stand

Seit 12. September 2026: [App](https://sichgeis.github.io/phililog/) und [Supabase-Projekt Philine-Log](https://supabase.com/dashboard/project/aiyjwwbdfjtflehtvedt) sind eingerichtet. Die eigene Organisation nutzt Free, das Projekt liegt in Europa. Beide Elternkonten sind administrativ erstellt und freigeschaltet. Öffentliche Registrierung und anonyme Anmeldung sind deaktiviert. GitHub-Variablen enthalten ausschließlich Projekt-URL und Publishable-Key. Der bestehende Masch-Tech-Bestand blieb erhalten, da für das neue Projekt keine Löschung nötig war.

## Erweiterung Tagesbericht

Migration `202609130006_daily_report.sql` ergänzt die optionale Still-Schätzung, gemeinsame Einstellungen mit anfangs 25 ml pro Brust sowie die geschützte Tagesaggregation. Vor der neuen Oberfläche ausrollen. Alte Stillereignisse bleiben ohne Schätzung. Berichtstage werden fest in Europe/Berlin berechnet; der Tagesbericht benötigt Internet. Änderungen des Standards wirken auf neue Entwürfe und führen zu keiner rückwirkenden Neuberechnung gespeicherter Mengen.

## Getrennte Standards und einmalige Bestandskorrektur

Migration 007 initialisiert links/rechts aus dem bisherigen gemeinsamen Standard und erhält die Kompatibilität alter Clients. Migration 008 nur einmal und innerhalb einer Transaktion ausführen: Sie sichert die betroffenen Ereignisse in `private.events_before_20260913_correction` (keine Browserrechte) und korrigiert Zuordnungen und Stillmengen nach ausdrücklichem Nutzerauftrag. Die normalen Versions-/Änderungszeitstempel werden dabei aktualisiert. Die Sicherung enthält private Familiendaten und bleibt ausschließlich in der geschützten Datenbank; nicht ins Repository exportieren.

## Wartung, Migrationen und automatische Prüfungen

Push und Pull Request starten `Check`: Fachlogik-/DOM-Regressionen, TypeScript und Build sowie eine isolierte Supabase-Instanz mit allen Migrationen, RLS-/API-Tests und synthetischem Restore. Dafür werden keine Produktionsschlüssel benötigt. `Publish GitHub Pages` bleibt ausschließlich manuell.

Migration 011 wurde am 14. September 2026 produktiv in einer Transaktion angewendet. Sie übernimmt vorhandene UUIDs in einen privaten minimalen Nachweis und verhindert ihre Wiederverwendung nach Löschen. Bereits früher gelöschte IDs können nicht nachträglich erfasst werden. Historische Migrationen 001–010 bleiben unverändert. Für jede manuelle Ausführung Dateiname, Prüfsumme, Datum und Ergebnis privat protokollieren; vorhandene CLI-Historie zusätzlich prüfen. Eine Fehlermeldung „Spalte existiert bereits“ ist Anlass zum Abgleich, nicht zum erneuten Ausführen historischer Korrekturen.

Actions-Versionen am 13. September 2026 anhand der offiziellen Action-Manifeste geprüft: [checkout 7.0.1](https://github.com/actions/checkout/blob/v7.0.1/action.yml), [setup-node 7.0.0](https://github.com/actions/setup-node/blob/v7.0.0/action.yml), [upload-pages-artifact 5.0.0](https://github.com/actions/upload-pages-artifact/blob/v5.0.0/action.yml), [deploy-pages 5.0.1](https://github.com/actions/deploy-pages/blob/v5.0.1/action.yml). JavaScript-Actions verwenden Node 24, Upload bleibt eine Composite-Action mit dem Standardartefakt `github-pages`. Die Workflows nutzen aktuelle GitHub-gehostete Ubuntu-Runner.

## Bedienlayout und aktuelle Person

Migration `202609130010_current_family_person.sql` gehört zum veröffentlichten Layout aus Feature 004. Die RPC liefert ausschließlich den Namen der eigenen freigeschalteten Rolle. Sie verändert weder Einträge noch die automatische Personenzuordnung. Die App benötigt die RPC beim Öffnen des Logbuchs; die Migration daher vor der Oberfläche veröffentlichen. Lokal mit Mitglieder-, Fremd- und anonymem Konto geprüft.

Am 13. September 2026 nach ausdrücklichem Auftrag produktiv eingespielt. Vorher wurden die App-Tabellen konsistent in `private.events_before_20260913_layout`, `private.settings_before_20260913_layout` und `private.members_before_20260913_layout` gesichert und alle Rechte für public/anon/authenticated entzogen. Die Migration wurde mit Vorher-/Nachher-Prüfsummen in einer Transaktion ausgeführt; Originaltabellen blieben unverändert. Diese Kopien sind eine Sicherung der App-Daten innerhalb derselben Datenbank, kein vollständiges externes Projektbackup einschließlich Auth.

## Temperatur-Erweiterung (veröffentlicht, 14. September 2026)

Die veröffentlichte Temperatur-Oberfläche verwendet Migration `202609140012_temperature.sql`. Sie ergänzt die Messwertspalte, Constraints und Spaltenrechte. Migrationen 011 und 012 wurden am 14. September 2026 produktiv in einer Transaktion angewendet. Interne Sicherung der betroffenen Tabellen im privaten Schema, unveränderte Originaldaten und erhaltene Rechte/RLS wurden geprüft. Anschließend den PostgREST-Schemacache bei Bedarf mit `NOTIFY pgrst, 'reload schema';` aktualisieren.


## Migrationsübersicht

Stand: 18. September 2026, einschließlich Babyspiel. Nur fehlende Migrationen ausführen; die manuelle SQL-Historie wird durch Schema und dokumentierte Prüfnachweise ergänzt.

| Migrationen | Inhalt | Produktiver Stand / Nachweis |
| --- | --- | --- |
| 001–005 | Logbuch, Milchart, Wickeln, Gewicht, Person | Eingespielt; [Feature 001](../specs/001-fuettern/tasks.md) |
| 006–008 | Bericht, getrennte Standards, einmalige Bestandskorrektur | Eingespielt; [Feature 002](../specs/002-tagesbericht/tasks.md) |
| 009 | Befinden | Eingespielt; [Feature 003](../specs/003-befinden/tasks.md) |
| 010 | Aktuelle Person | Eingespielt; [Feature 004](../specs/004-bedienlayout/tasks.md) |
| 011–012 | Dauerhafter UUID-Nachweis, Temperatur | Eingespielt; [Feature 006](../specs/006-temperatur-und-effekte/tasks.md) |
| 013 | Zornig und Eingeschlafen | Eingespielt; [Feature 003](../specs/003-befinden/tasks.md) |
| 014 | Sonnenbad | Produktiv am 15.09.2026; [Feature 007](../specs/007-sonnenbad/tasks.md) |
| 015 | Massage und Babygymnastik | Produktiv am 15.09.2026; [Feature 008](../specs/008-massage-babygymnastik/tasks.md) |
| 016 | Befinden bei Aktivitäten | Produktiv am 15.09.2026; [Feature 003](../specs/003-befinden/tasks.md) |
| 017 | Getrennter gemeinsamer Spielstand, Fähigkeiten, Statistik und Vorgangsnachweise | Produktiv am 18.09.2026; [Feature 009](../specs/009-babyspiel/tasks.md) |
| 018 | Schnuller-Herausforderung, getrennte Rekorde und V2-RPCs bei erhaltenem V1-Bestand | Produktiv am 18.09.2026; [Feature 009](../specs/009-babyspiel/tasks.md) |

Migration 014 erweitert ausschließlich Arten- und Detailconstraints; vorhandene Ereignisse, Spaltenrechte und RLS bleiben unverändert. Vor dem zugehörigen Frontend ausrollen. Interne Sicherungen vor Migrationen ersetzen keinen vollständigen externen Sicherungssatz; siehe [recovery.md](recovery.md).


## Browserunabhängiger Administrationszugang

Am 15. September 2026 mit ausdrücklicher Nutzerfreigabe eingerichtet und per API geprüft. `phililog-local-admin` ist auf Projekt `aiyjwwbdfjtflehtvedt` mit Database Read-write und Migrations Read-write begrenzt und läuft am 14. Dezember 2026 ab. Für Migrationen wird ein persönlicher Token für die [Supabase Management API](https://supabase.com/docs/reference/api/introduction) verwendet. Der Publishable-Key der App dient nicht zur Schemaadministration.

1. In [Access Tokens](https://supabase.com/dashboard/account/tokens) einen Token `phililog-local-admin` mit Ablaufdatum erstellen (z. B. 90 Tage).
2. Wenn verfügbar, auf Projekt `aiyjwwbdfjtflehtvedt` beschränken: Database Read-write und Migrations Read-write. Weitere Verwaltungsrechte sind für diesen Ablauf nicht nötig. [Scoped Tokens](https://supabase.com/docs/guides/platform/personal-access-tokens) werden noch schrittweise freigeschaltet; wenn die Eingrenzung fehlt, zunächst klären, bevor ein kontoweit berechtigter Classic-Token verwendet wird.
3. Im lokalen Projektterminal `python3 scripts/setup-supabase-access.py` starten und den Token verdeckt eingeben. Nicht in Chat, Shell-Befehlsargumente, Vite-Variablen oder GitHub-Pages-Variablen kopieren.
4. Das Skript prüft ausschließlich `SELECT 1` per Management API und speichert erst bei Erfolg unter `~/.config/phililog/supabase-access-token`, Verzeichnisrechte 0700, Dateirechte 0600. Vorhandene Tokens werden bei fehlgeschlagener Prüfung nicht ersetzt. Die Datei liegt außerhalb des Repositories; sie ist lokal zugriffsbeschränkt, nicht verschlüsselt.
5. `python3 scripts/setup-supabase-access.py --check` prüft den gespeicherten Zugang erneut. Die Leseprüfung beweist noch keine Schreibrechte.

Administrationsskripte lesen den Token direkt aus dieser Datei in den Prozessspeicher und setzen den Authorization-Header für `https://api.supabase.com`. Tokenwerte nicht ausgeben oder als Prozessargument übergeben. API-Zugriff ersetzt den SQL-Editor; Sicherung, Transaktion, Bestandsvergleich und Prüfung der tatsächlich fehlenden Migrationen bleiben erforderlich. Kein pauschales `db push` auf die unvollständige historische CLI-Migrationsliste.

Widerruf und Erneuerung erfolgen in den Access-Token-Einstellungen. Die Einrichtung allein ändert keine produktiven Daten. Migration 014 wurde am 15. September 2026 über diesen Zugang erfolgreich angewendet; die Schreibrechte sind damit ebenfalls bestätigt.

## Massage und Babygymnastik

Migration 015 erweitert nur die Arten- und Detailconstraints. Am 15.09.2026 per Management API transaktional angewendet; private interne Sicherung `private.events_before_20260915_activities`, exakter Bestandsvergleich und erhaltener RLS-/Sicherungsschutz bestätigt. Keine produktiven Testeinträge. Die interne Kopie ersetzt kein externes Backup.

## Befinden bei Aktivitäten

Migration 016 erweitert ausschließlich den Befinden-Constraint um Sonnenbad, Massage und Babygymnastik. Am 15.09.2026 produktiv über die Management API angewendet, nach Schemaabgleich und mit transaktionaler Sicherung in `private.events_before_20260915_activity_moods` sowie `private.constraint_before_20260915_activity_moods`. Exakter Bestandsvergleich, RLS und fehlende Browserrechte auf die Sicherung bestätigt. Keine produktiven Testeinträge.


## Babyspiel: Migration 017 (produktiv am 18. September 2026)

Die lokale Umsetzung benötigt `202609180017_baby_game.sql`. Erst die Datenbankmigration anwenden, danach den passenden Client veröffentlichen; produktive Migration und Veröffentlichung benötigen einen eigenen Auftrag. Bei fehlender Migration bleibt das Logbuch verfügbar, während das Spiel eine Einrichtungsmeldung zeigt.

Für die bereits eingerichtete lokale Testinstanz:

```sh
node scripts/apply-local-game-migration.mjs
node scripts/test-local-supabase.mjs
node scripts/test-restore.mjs
npm run check
```

Das lokale Migrationsskript spricht ausschließlich `supabase_db_phililog` an und trägt fehlende Migrationen 017 und 018 jeweils transaktional ein. Es wiederholt keine historischen Logbuchmigrationen. Bei einem frischen Aufbau enthält `start-test-supabase.mjs` die neue Migration automatisch.

Die Spieltests innerhalb `test-local-supabase.mjs` bewahren den bestehenden synthetischen Spielstand auf, testen mit einem leeren Zustand und stellen ihn anschließend wieder her. Während dieser Prüfung nicht parallel in der lokalen Vorschau spielen. Browser-Spielproben erzeugen hingegen normalen Fortschritt des lokalen Testkontos.

Migration 017 erhält bei einer Wiederholung vorhandene Spielzeilen; das ist ein ausdrücklicher Testfall, kein Ersatz für Migrationsverwaltung. Nach Veröffentlichung bleibt diese Migration unverändert. Jede spätere Formatänderung benötigt eine neue Migration und einen bestandenen Test mit `tests/fixtures/game-v1.json` sowie allen späteren historischen Fixtures. Neue Regelversionen müssen offene ältere Vorgänge weiterhin nach deren ursprünglichen Regeln verarbeiten können.

Am 18.09.2026 auf ausdrücklichen Veröffentlichungsauftrag transaktional produktiv angewandt. Vorhandene Logbuchdaten, Einstellungen und Mitgliedschaften unverändert; Spiel-RLS und fehlende direkte Browser-Schreibrechte geprüft. Nur leeren initialen Spielstand angelegt, keine Produktionsrunde gespielt. Prüfsumme und privates Ausführungsprotokoll siehe Feature 009.

Frontend am 18.09.2026 aus Commit `35f1f37` über [Publish GitHub Pages 35339436445](https://github.com/sichgeis/phililog/actions/runs/35339436445) veröffentlicht. App- und Datenbank-CI erfolgreich; öffentliche App und Spielchunk erreichbar, anonymer Spielstandzugriff gesperrt. Einstieg nach Anmeldung im Footer: „Kleine Schritte · Spiel“.


## Schnuller-Herausforderung: Migration 018

`202609180018_pacifier_challenge.sql` ergänzt ausschließlich `game_scores` und zwei V2-RPCs. Migration 017 und V1-RPCs bleiben unverändert. Ein V1-Client kann weiterhin lesen und schreiben; der neue Client überträgt Käufe, andere Spiele und ruhige Runden weiter nach V1. Neue Timingrunden und deren ausstehende Vorgänge verwenden `game_apply_v2`. Beide Pfade teilen Sperre und Vorgangs-IDs. Keine rückwirkende Umwertung oder Löschung.

Vor Veröffentlichung: `npm run check`, lokale Supabase-Tests und Restore mit tatsächlich befüllter V1-Datenbank vor Installation 018. Danach zuerst 018 produktiv anwenden, dann Frontend veröffentlichen. Bei einem Client-Rollback bleiben V2-Rekorde gespeichert. `game_scores` ist Bestandteil des vollständigen Dumps und Restore-Nachweises.

Migration 018 am 18.09.2026 auf ausdrücklichen Auftrag produktiv angewandt. Logbuch- und V1-Spielbestand serverintern unverändert verglichen, RLS und RPC-Rechte bestätigt. Protokoll und Prüfsumme stehen bei Feature 009.

Frontend V2 aus `fcc571c` über [Publish GitHub Pages 35343487380](https://github.com/sichgeis/phililog/actions/runs/35343487380) veröffentlicht; öffentliche Assets geprüft, anonymer V2-Zugriff HTTP 401.
