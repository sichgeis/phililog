# Phililog

Ein gemeinsames Logbuch für den Alltag mit einem neugeborenen Baby. Es erfasst Stillen, Fläschchen und Wickeln mit Urin, Stuhl und erfolgreichem Abhalten sowie Gewichtsmessungen.

## Projektstatus

Die erste Web-App-Version ist implementiert und wurde lokal mit synthetischen Daten geprüft. Sie enthält kompakte Fütterungs- und Wickeleingabe, Wiegen unter „Weitere Ereignisse“, Stillstart/-ende, Personenzuordnung zu Julia/Christian, Historie, Korrekturen, Löschen, CSV-Export, einen Tagesbericht, gemeinsame Einstellungen für Still-Schätzungen und eine Projektinfo. Die App ist auf [GitHub Pages](https://sichgeis.github.io/phililog/) veröffentlicht und mit dem Supabase-Free-Projekt Philine-Log in Europa verbunden. Beide Elternkonten und der gemeinsame Datenzugriff wurden produktiv geprüft. [MVP-Spezifikation](specs/001-fuettern/spec.md).

## Befinden danach

Bei Stillen, Flasche und Wickeln könnt ihr optional Quengelig, Schläfrig, Ruhig oder Aufmerksam auswählen. Ein anderer Button ersetzt die Auswahl; erneutes Tippen entfernt sie. Die Angabe bleibt beim Ereignis, erscheint im Logbuch und CSV und kann später geändert werden. Jeder neue Eintrag startet ohne Vorauswahl. [Spezifikation](specs/003-befinden/spec.md).

## Tagesbericht und Still-Schätzung

„Tagesbericht“ zeigt sieben Kalendertage in deutscher Zeit: Flaschenmenge, geschätzte Stillmenge, erfasste Summe sowie Wickeln/Urin/Stuhl. Fehlende Schätzungen werden kenntlich gemacht. Die Navigation zeigt die Kalenderwoche samt Jahr, Wochenpfeile, das heutige Datum und „Heute“. Wochen beginnen montags; die laufende Woche reicht bis heute. Eine freie Datumsauswahl entfällt.

Unter „Einstellungen“ über das Zahnrad oder im Footer lassen sich linke und rechte Brust separat einstellen, anfangs jeweils 25 ml. Bei „Beide“ werden die Werte addiert; offene Seite bleibt ohne automatische Menge. Die aufklappbare Stillmenge erlaubt eine eigene Gesamtmenge oder eine leere Angabe. Jeder Eintrag behält seine Schätzung; ein neuer Standard ändert gespeicherte Werte nicht. Bereits begonnene Entwürfe behalten ihren Standard; „Aktuellen Standard verwenden“ übernimmt ihn ausdrücklich. [Spezifikation](specs/002-tagesbericht/spec.md).

## Überarbeitetes Bedienlayout

Letzte Mahlzeit oberhalb der Eingabe, kompakte Zusatzangaben, erreichbare Speicherleiste, einheitliche Auswahlzustände und größere Personenauswahl. Das Logbuch hebt Menge und Dauer hervor. Hauptnavigation und Einstellungen bleiben beim Scrollen erreichbar. Der Stillablauf bleibt unverändert. [Spezifikation und Prüfnachweise](specs/004-bedienlayout/spec.md). Die Oberfläche ist auf GitHub Pages veröffentlicht. Migration 010 ist nach Sicherung der App-Daten produktiv eingespielt.

## Entwicklung

Wir beschreiben das gewünschte Verhalten vor der Implementierung und leiten daraus einen technischen Plan, Aufgaben und überprüfbare Akzeptanzkriterien ab.

- [SDD-Ablauf und Spezifikationsübersicht](specs/README.md)
- [Vorlage für eine Spezifikation](specs/templates/spec.md)
- [Vorlage für einen technischen Plan](specs/templates/plan.md)
- [Vorlage für Aufgaben und Prüfnachweise](specs/templates/tasks.md)
- [Regeln für Coding-Agenten](AGENTS.md)
- [Gestaltungsvorschläge zur Geburtskarte](docs/design.md)

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

Dies führt die Fachlogiktests sowie TypeScript-Prüfung und Produktionsbuild aus. Die tatsächlichen Supabase-Zugriffsregeln werden zusätzlich gegen eine lokale Docker-Instanz geprüft:

```sh
npx supabase@2.117.0 start
node scripts/test-local-supabase.mjs
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

## Veröffentlichung

Die erste App-Version liegt im öffentlichen [GitHub-Repository](https://github.com/sichgeis/phililog). GitHub Pages ist mit GitHub Actions als Quelle aktiviert. Das [erste Deployment](https://github.com/sichgeis/phililog/actions/runs/34689824057) war erfolgreich. [App öffnen](https://sichgeis.github.io/phililog/).

## Lizenz

Noch nicht festgelegt.

Am 13. September 2026 wurde der damalige Bestand auf ausdrücklichen Wunsch korrigiert: Flasche/Wickeln Christian, Stillen Julia; Still-Schätzung 25 ml je ausgewählter Brust (beide 50 ml, offen leer). Diese einmalige Korrektur verändert die automatische Zuordnung künftiger Einträge nicht.
