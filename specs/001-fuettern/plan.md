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

## Kompakte Oberfläche

Dritte interne Ansicht `about` ohne Router-Abhängigkeit. Gemeinsamer Footer für Projektinfo und Abmeldung; keine Kopfzeile im angemeldeten Bereich. Semantische, visuell verborgene Eingabeüberschrift. Kompakte Abstände mit mindestens 44 px hohen Touch-Zielen und seitenweitem CSS-Aquarellhintergrund. Browserprüfung mit lokaler Supabase und synthetischen Konten: 320/390 px, Entwurf bei About-Wechsel, Stillstart/-ende und Footer-Abmeldung.

## Dauer und Milchart

0 wird im UI als unbekannte Dauer verwendet, in SQL bleibt NULL. Bestehende lokale Checkbox-Entwürfe werden beim Laden auf 0 umgestellt. Nullable Spalte `milk_type` mit Werten `pre`/`breast_milk`, nur für Flaschen; Altbestand bleibt NULL. Spaltenrechte für Familien-CRUD erweitern.

## Wickeln und Rückmeldung

Bestehende Tabelle `feedings` wird aus Kompatibilitätsgründen um `diaper` und nullable Bool-Spalten `urine`, `stool`, `held_success` ergänzt. Typabhängige Constraints verhindern Vermischung; bisherige RLS und Versionskontrolle gelten unverändert. CSV wird um diese Felder erweitert. DOM-Konfetti außerhalb der gerenderten App überlebt das anschließende Datenrefresh und entfernt sich nach 1,6 Sekunden.

## Zeitanzeigen

Separate limitierte Supabase-Abfrage mit Filter `kind in (bottle, breast)` liefert die letzte Mahlzeit über alle Datensätze. Gemeinsames Refresh aktualisiert Liste und Mahlzeit; bestehende RLS gilt weiter. Ein Sekundenintervall aktualisiert nur Textknoten aus Zeitstempeln, keine sekündlichen API-Aufrufe oder Formular-Neurenderings.
