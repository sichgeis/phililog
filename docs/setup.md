# Einrichtung

Die Anwendung benötigt GitHub Pages für die Oberfläche und ein Supabase-Free-Projekt für Datenbank und Anmeldung. Es wird kein zusätzliches Produktionsbackend betrieben. Die lokale Docker-Instanz dient ausschließlich der Entwicklung.

## Supabase Free vorbereiten

1. Im Supabase-Dashboard eine **Free-Organisation** und ein Free-Projekt anlegen. Keinen Pro-Tarif oder kostenpflichtige Zusatzfunktionen wählen. Eine verfügbare EU-Region wählen. Das Datenbankpasswort sicher aufbewahren.
2. Den Inhalt von [202609120001_feedings.sql](../supabase/migrations/202609120001_feedings.sql) im SQL-Editor des neuen, leeren Projekts einmal ausführen. Die Migration legt Tabellen, Constraints und Zugriffsregeln an.
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

Wenn das Hosting geklärt ist:

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
npx supabase@2.117.0 start
node scripts/test-local-supabase.mjs --configure-preview
npm run dev
```

Das Testskript erstellt ausschließlich in der lokalen Instanz synthetische Konten, prüft erlaubte/verbotene API-Zugriffe und schreibt auf Wunsch eine ignorierte `.env.local` mit öffentlicher lokaler Konfiguration. Der lokale Testzugang wird im Terminal genannt und ist ausschließlich für erfundene Testdaten vorgesehen. Keine echten Baby-Daten in der lokalen Testinstanz erfassen.

```sh
npm run check
node scripts/test-local-supabase.mjs
npx supabase@2.117.0 stop
```

Die Testdatenbank wird beim Stoppen nicht automatisch gelöscht. `supabase db reset` würde lokale Daten löschen und ist kein normaler Startschritt.

## Datensicherung und Grenzen

- CSV-Export aufrufen und die Datei selbst sicher aufbewahren. CSV ist ein Datenexport; eine Importfunktion gibt es noch nicht.
- Supabase Free kann bei geringer Aktivität pausieren und bietet keine automatischen Backups. Vor produktiver Einrichtung die [aktuellen Tarifbedingungen](https://supabase.com/pricing) prüfen.
- Auth-Sitzung und ungespeicherter Entwurf liegen auf dem eigenen Gerät. Entwürfe werden bei Abmeldung entfernt. Browserdatenlöschung kann sie verlieren. Laufende Stillzeiten werden erst beim Speichern gemeinsam sichtbar, nicht bereits beim Start auf dem anderen Handy.
- Für einen Stillnachtrag werden Beginn und Ende aus Endzeit und Dauer abgeleitet. Nach einer Start-/Endmessung bleiben die genauen Zeitstempel erhalten; für eine manuelle Korrektur „Zeiten manuell angeben“ wählen.

## Produktiver Stand

Seit 12. September 2026: [App](https://sichgeis.github.io/phililog/) und [Supabase-Projekt Philine-Log](https://supabase.com/dashboard/project/aiyjwwbdfjtflehtvedt) sind eingerichtet. Die eigene Organisation nutzt Free, das Projekt liegt in Europa. Beide Elternkonten sind administrativ erstellt und freigeschaltet. Öffentliche Registrierung und anonyme Anmeldung sind deaktiviert. GitHub-Variablen enthalten ausschließlich Projekt-URL und Publishable-Key. Der bestehende Masch-Tech-Bestand blieb erhalten, da für das neue Projekt keine Löschung nötig war.
