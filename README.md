# Phililog

Ein gemeinsames Logbuch für den Alltag mit Philine. Die Smartphone-Web-App erfasst Stillen, Fläschchen, Wickeln, Gewicht, Körpertemperatur und Sonnenbad.

[App öffnen](https://sichgeis.github.io/phililog/) · [Einrichtung und Betrieb](docs/setup.md) · [Spezifikationen](specs/README.md)

## Aktueller Stand

Die App läuft auf GitHub Pages mit Supabase für Anmeldung und gemeinsame Datenhaltung. Zwei persönliche Konten für Julia und Christian greifen auf dasselbe geschützte Logbuch zu. Sonnenbad und Migration 014 sind seit dem 15. September 2026 veröffentlicht. Abgeschlossene Veröffentlichungen und tatsächliche Prüfnachweise stehen in den jeweiligen `tasks.md`.

## Eintragen und nachschlagen

- **Stillen:** Start/Ende per Klick oder Nachtrag; optionale Seite und Schätzung. Ein laufender Entwurf bleibt bis zum Speichern auf dem eigenen Gerät.
- **Flasche:** Menge in 5-ml-Schritten, Milchart und Dauer.
- **Wickeln:** Urin, Stuhl und erfolgreiches Abhalten unabhängig auswählen.
- **Unter „Mehr“:** Wiegen in Gramm, Temperatur in °C und Sonnenbad mit optionaler Dauer. Leere Sonnenbad-Dauer oder 0 bedeutet unbekannt; es gibt keinen voreingestellten Wert.
- **Befinden danach:** Bei Stillen, Flasche und Wickeln optional Quengelig, Schläfrig, Ruhig, Aufmerksam, Zornig oder Eingeschlafen. Eine Auswahl ersetzt die vorherige; erneutes Tippen entfernt sie.

Alle Ereignisse erscheinen im gemeinsamen Logbuch und lassen sich bearbeiten, löschen und als CSV exportieren. Neue Einträge werden dem angemeldeten Konto zugeordnet. Versionsprüfungen verhindern das Überschreiben neuerer Änderungen. Nach erfolgreichem Speichern erhält Julia Aquarellkonfetti, Christian Sterne und Regenbogen; reduzierte Bewegung wird berücksichtigt.

## Tagesbericht und Einstellungen

Der Tagesbericht zeigt Kalenderwochen in deutscher Zeit: Flaschenmenge, geschätzte Stillmenge und Wickelzahlen. Fehlende Schätzungen werden kenntlich gemacht. Wiegen, Temperatur und Sonnenbad verändern diese Summen nicht.

Einstellungen sind im Footer erreichbar. Die Still-Schätzung wird getrennt für links und rechts festgelegt, anfangs jeweils 25 ml; „Beide“ addiert die Werte. Eigene Mengen und fehlende Schätzungen sind möglich. Neue Standards ändern gespeicherte Ereignisse oder begonnene Entwürfe nicht rückwirkend. „Aktuellen Standard verwenden“ übernimmt sie ausdrücklich.

## Entwicklung

Wir beschreiben das gewünschte Verhalten vor der Implementierung und leiten daraus einen technischen Plan, Aufgaben und überprüfbare Akzeptanzkriterien ab.

- [SDD-Ablauf und Spezifikationsübersicht](specs/README.md)
- [Vorlage für eine Spezifikation](specs/templates/spec.md)
- [Vorlage für einen technischen Plan](specs/templates/plan.md)
- [Vorlage für Aufgaben und Prüfnachweise](specs/templates/tasks.md)
- [Regeln für Coding-Agenten](AGENTS.md)
- [Aktuelle Gestaltung und historische Entwürfe](docs/design.md)

## Einrichtung und lokaler Start

Voraussetzung: Node.js ab 22.12.

```sh
npm ci
cp .env.example .env.local
# Öffentliche Supabase-Projekt-URL und Publishable-/Anon-Key in .env.local einsetzen.
npm run dev
```

Die App läuft unter `http://127.0.0.1:5173`. Ohne Supabase-Konfiguration zeigt sie eine Einrichtungsseite. [Vollständige Einrichtung, lokale Testdatenbank und Deployment](docs/setup.md).

```sh
npm run build
npm run preview
```

## Tests

```sh
npm run check
```

Dies führt Fachlogik- und DOM-Regressionstests sowie TypeScript-Prüfung und Produktionsbuild aus. Push und PR starten dieselben Checks automatisch. Die tatsächlichen Supabase-Zugriffsregeln werden zusätzlich gegen eine lokale Docker-Instanz geprüft:

```sh
node scripts/start-test-supabase.mjs # erstmalige leere lokale Testdatenbank
node scripts/test-local-supabase.mjs
node scripts/test-restore.mjs
```

Die Einrichtung und Testkonten sind in der [Anleitung](docs/setup.md) beschrieben. Produktive Anmeldung und PWA-Installation auf euren echten Smartphones bleiben separate Abnahmeprüfungen.

## Architektur und Datenhaltung

Am 12. September 2026 vom Auftraggeber bestätigt:

- **Eine Smartphone-Web-App als PWA:** vom Startbildschirm aus schnell zugänglich, keine separaten nativen Apps.
- **GitHub Pages:** Hosting der statischen Oberfläche.
- **Supabase Free:** verwaltete PostgreSQL-Datenbank, Benutzeranmeldung und direkter Datenzugriff über die Supabase-API. Kein zusätzlich selbst gehostetes Backend.
- **Zwei persönliche Zugänge:** ausschließlich Julia und Christian erhalten Zugriff auf das gemeinsame Logbuch. Öffentliche Registrierung bleibt deaktiviert.
- **Anmeldung merken:** Sitzungen bleiben auf den Smartphones über einzelne App-Aufrufe hinaus erhalten. Eine erneute Anmeldung kann etwa nach Abmeldung oder gelöschten Browserdaten nötig werden.
- **Zugriffsschutz in der Datenbank:** Row Level Security muss Lese- und Schreibzugriffe ausschließlich für die beiden freigeschalteten Benutzer erlauben. Die Anmeldeseite und der App-Code dürfen öffentlich sein; die Logbucheinträge sind geschützt. Administrative Supabase-Schlüssel gehören niemals in die Web-App oder ins Repository.
- **Budget: 0 €:** ausschließlich kostenlose Tarife und Funktionen, keine kostenpflichtigen Upgrades oder Zusatzdienste.
- **Datensparsamkeit:** nur für das Logbuch nötige Daten erfassen, keine Werbe- oder Analyse-Tracker.

Die Umsetzung verwendet Vite, TypeScript, CSS und Supabase Auth mit E-Mail/Passwort. Stillen ist die Startauswahl. Beginn und Ende lassen sich per Klick erfassen; alternativ sind Nachträge möglich. Ungespeicherte Entwürfe bleiben auf dem eigenen Gerät erhalten. Eine laufende Stillzeit wird erst beim Speichern mit dem anderen Gerät geteilt. Vollständige Offline-Synchronisation ist nicht Teil des MVP.

Der kostenlose Supabase-Tarif bietet zum Zeitpunkt der Entscheidung 500 MB Datenbankplatz, kann bei geringer Aktivität pausiert werden und enthält keine automatischen Backups. Export und Datensicherung sind deshalb bei der fachlichen Beschreibung zu klären. Tarifbedingungen vor der Einrichtung erneut prüfen: [Supabase-Preise](https://supabase.com/pricing).

## Betrieb und Veröffentlichungen

[Architektur](docs/architecture.md), [Gestaltung](docs/design.md), [Migrationen und Deployment](docs/setup.md) und [Sicherung/Wiederherstellung](docs/recovery.md) beschreiben den aktuellen Betrieb. CSV ist ein lesbarer Export, kein vollständiges Backup. Produktive interne Sicherungskopien werden niemals ins Repository übernommen.

Das [GitHub-Repository](https://github.com/sichgeis/phililog) ist öffentlich; die Logbucheinträge bleiben geschützt in Supabase. Push und Pull Request starten automatische Prüfungen. Veröffentlichungen erfolgen über den manuellen Workflow „Publish GitHub Pages“ nach Freigabe; ein Push allein veröffentlicht nichts.

Die physische Smartphone-/PWA-Abnahme bleibt in [Feature 001](specs/001-fuettern/tasks.md) gesondert dokumentiert. Eine vollständige Offline-Synchronisation ist nicht enthalten.

## Lizenz

Noch nicht festgelegt.
