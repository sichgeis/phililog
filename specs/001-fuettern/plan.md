# Technischer Plan – 001 Fütterung erfassen und Logbuch ansehen

Bezug: [Spezifikation](spec.md)

## Ansatz

Vite, TypeScript und CSS liefern eine statische, mobil optimierte Web-App. Zwei Ansichten ohne zusätzliche Router-Abhängigkeit; Supabase-JavaScript-Client für Auth und CRUD. Kein selbst gehostetes Produktionsbackend. Öffentliche Konfiguration über Vite-Umgebungsvariablen. Ohne Konfiguration erscheint eine Einrichtungsseite, keine vorgetäuschte erfolgreiche Speicherung.

## Daten und Schutz

- `feedings`: UUID, Art, Zeitpunkt als `timestamptz`, optionaler Stillbeginn, optionale Dauer/Stillseite, Flaschenmenge, Ersteller, Änderungszeit und Versionsnummer.
- Private Zulassungstabelle mit genau zwei möglichen Rollen (Julia/Christian), administrativ befüllt; App darf sie nicht ändern.
- RLS prüft Mitgliedschaft bei SELECT/INSERT/UPDATE/DELETE. SQL-Constraints validieren Eingaben unabhängig vom Browser. Trigger schützt Ersteller und verwaltet Version.
- Client-generierte UUID als Idempotenzschlüssel; ein fehlgeschlagener Versuch behält seinen Payload zur sicheren Wiederholung. Konfliktkontrolle bei Korrektur/Löschen über Version.
- Sitzung über Supabase Auth; Formularentwurf benutzergebunden in localStorage. Keine Familiendaten in URLs, Logs oder Quellcode.

## Oberfläche und PWA

Warme, ruhige Gestaltung mit großen Bedienelementen. Listenweise Historie mit Nachladen, letzter Eintrag auf der Eingabeansicht. Lokale Datumseingabe, Speicherung in UTC. Stillen mit Start-/End-Klicks, Zeitstempel statt Hintergrund-Intervall. Manifest und App-Symbole; kein Offline-API-Cache. CSV wird nur auf ausdrücklichen Export heruntergeladen.

## Validierung

- `npm test`: Fachlogik, Zeitvorbelegung, Validierung, CSV und idempotente Übermittlung.
- `npm run build`: strikter TypeScript-Check und statischer Produktionsbuild.
- Lokale Supabase-Instanz mit synthetischen Konten: direkte erlaubte/verbotene CRUD-Zugriffe, Constraints, Versionskonflikte und Duplikatschutz.
- Browser-Harness: reale lokale App, Anmeldung, Smartphone-Layout, Erstellen, Historie, Korrigieren, Löschen, Entwurf und Export. Keine echten Familiendaten.

## Bereitstellung

GitHub-Actions-Workflow zum manuellen Pages-Deployment vorbereiten. Kein automatisches Deployment allein durch Push. Supabase-SQL-Migration und Einrichtungsanleitung gehören ins Repository. Kostenloser Betrieb und bestehende private Repository-Sichtbarkeit begrenzen die spätere Pages-Veröffentlichung; diese Entscheidung bleibt beim Auftraggeber.
