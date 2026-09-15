# Architektur

Stand: September 2026. Kleine statische PWA aus Vite, Vanilla TypeScript und CSS; Veröffentlichung auf GitHub Pages. Supabase Auth und PostgreSQL übernehmen Anmeldung und Datenzugriff. Kein eigener Produktionsserver, Frameworkwechsel oder zusätzlicher Dienst.

## Datenfluss

`main.ts` verwaltet Sitzung, Ansichten und Formularzustand. `domain.ts` validiert Ereignisse, erkennt Entwürfe und erzeugt CSV; `report.ts` behandelt Schätzungen und deutsche Berichtstage. `api.ts` kapselt Supabase-Aufrufe. `render-state.ts` erhält Fokus, Textauswahl und offene Formularbereiche beim synchronen Neuaufbau. Der Sekunden-Timer aktualisiert nur die beiden Zeitanzeigen.

Die Ereignisse heißen aus historischen Gründen `public.feedings`, enthalten auch Wickeln, Wiegen, Temperatur, Sonnenbad, Massage und Babygymnastik. `family_settings` hält gemeinsame Standards. RLS prüft `private.members`; Versionsfilter schützen Ereignisse und Settings vor konkurrierendem Überschreiben. Private SECURITY-DEFINER-Funktionen haben einen festen leeren Suchpfad und eng begrenzte Aufgaben.

Neue Einträge behalten bis zur eindeutigen Auflösung UUID und Payload im benutzergebundenen localStorage. Die produktiv eingespielte Migration 011 ergänzt einen dauerhaften minimalen Nachweis aus UUID und Ersteller; Ereignislöschung entfernt diesen Nachweis nicht. Wiederholungen lesen die aktuelle Fassung oder bestätigen eine zwischenzeitliche Löschung. Dadurch bleiben fremde Korrekturen erhalten. Vor Migration 011 bereits gelöschte IDs sind nicht rekonstruierbar.

Settings-Entwürfe behalten ihre ursprüngliche Version im Arbeitsspeicher. Hintergrundaktualisierungen dürfen diese Version nicht ersetzen. Bei Konflikt werden Serverwerte ausdrücklich übernommen und Änderungen neu eingegeben. Settings-Entwürfe überstehen Ansichtswechsel, jedoch keinen vollständigen Browser-Neustart; Ereignisentwürfe werden lokal gespeichert.

## Ereignisse

| Art | Fachliche Werte |
| --- | --- |
| bottle | Flaschenmenge, Milchart, optionale Dauer und Befinden |
| breast | Stillseite, Beginn/Ende bzw. Dauer, optionale Schätzung und Befinden |
| diaper | Urin, Stuhl, erfolgreiches Abhalten und optionales Befinden |
| weight | Gewicht in Gramm |
| temperature | Körpertemperatur in °C |
| sunbath | Optionale Dauer in Minuten und Befinden |
| massage | Optionale Dauer in Minuten und Befinden |
| gymnastics | Optionale Dauer in Minuten und Befinden |

Alle Arten nutzen Zeitpunkt, Person und gemeinsame CRUD-/Versions-/UUID-Logik. Sonnenbad, Massage und Babygymnastik haben jeweils ein eigenes leeres Dauerfeld im Entwurf; Still- und Flaschendauern werden nicht übernommen. Letzte Mahlzeit und Berichtssummen filtern ausdrücklich ihre Ereignisarten; die allgemeine Ereigniszahl berücksichtigt auch zusätzliche Ereignisse. Eine Schemaerweiterung muss vor der dazugehörigen Oberfläche produktiv verfügbar sein. Migrationsstand und Nachweise stehen in [setup.md](setup.md).

## Grenzen und Prüfung

Kein Service Worker speichert API-Antworten; keine vollständige Offline-Synchronisation. Ungespeicherte Stillzeiten sind nur auf dem eigenen Gerät verfügbar. Datenbankzugriffe benötigen Internet. CSV ist ein lesbarer Export, kein Backup.

`npm run check` prüft Fachlogik, echte Formularhandler in Happy DOM (API kontrolliert ersetzt), TypeScript und Build. Die DOM-Tests prüfen Interaktionen, ersetzen aber keine reale Layoutprüfung. `test-local-supabase.mjs` prüft echte API/RLS/Constraints. `test-restore.mjs` prüft frische Migrationen und vollständigen synthetischen Restore in separaten lokalen Datenbanken. [Betrieb](setup.md), [Wiederherstellung](recovery.md), [Gestaltung](design.md).
