# Phililog

Ein geplantes Logbuch für den Alltag mit einem neugeborenen Baby. Es soll später unter anderem das Stillen, Fläschchen sowie Urin- und Stuhlausscheidungen erfassen können.

## Projektstatus

Das Repository enthält zunächst nur die Grundlage für **Spec Driven Development**. Die Architektur ist abgestimmt; es gibt noch keine Anwendung. Als Nächstes folgt die fachliche Beschreibung. Die genannten Anwendungsfälle sind eine erste Orientierung, keine ausgearbeitete oder zur Umsetzung freigegebene Produktspezifikation.

## Entwicklung

Wir beschreiben das gewünschte Verhalten vor der Implementierung und leiten daraus einen technischen Plan, Aufgaben und überprüfbare Akzeptanzkriterien ab.

- [SDD-Ablauf und Spezifikationsübersicht](specs/README.md)
- [Vorlage für eine Spezifikation](specs/templates/spec.md)
- [Vorlage für einen technischen Plan](specs/templates/plan.md)
- [Vorlage für Aufgaben und Prüfnachweise](specs/templates/tasks.md)
- [Regeln für Coding-Agenten](AGENTS.md)

## Einrichtung und lokaler Start

Noch offen. Voraussetzungen und Startbefehle werden ergänzt, sobald die technische Grundlage feststeht. Aktuell ist keine Installation nötig.

## Tests

Noch keine Anwendungstests vorhanden. Testbefehle werden mit der ersten Implementierung ergänzt; die Prüfkriterien werden zuvor in deren Spezifikation beschrieben.

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

Frontend-Framework, Datenmodell, genaue Anmeldemethode und fachlicher Umfang bleiben offen. Offline-Erfassung und Synchronisationsverhalten sind noch nicht festgelegt; eine PWA allein garantiert diese Funktionen nicht.

Der kostenlose Supabase-Tarif bietet zum Zeitpunkt der Entscheidung 500 MB Datenbankplatz, kann bei geringer Aktivität pausiert werden und enthält keine automatischen Backups. Export und Datensicherung sind deshalb bei der fachlichen Beschreibung zu klären. Tarifbedingungen vor der Einrichtung erneut prüfen: [Supabase-Preise](https://supabase.com/pricing).

## Veröffentlichung

GitHub Pages ist als Ziel gewählt. GitHub-Veröffentlichung und Supabase-Projekt sind noch nicht eingerichtet.

## Lizenz

Noch nicht festgelegt.
