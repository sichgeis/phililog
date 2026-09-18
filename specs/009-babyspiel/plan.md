# Technischer Plan – 009 Babyspiel

Bezug: [Spezifikation](spec.md), Version 1 vom 18. September 2026.

## Status und Ausgangslage

Implementierung vorbereitet, nicht begonnen und derzeit ausdrücklich nicht beauftragt. Bestehende Architektur: Vite, Vanilla TypeScript, CSS, Supabase Auth/PostgreSQL; `src/main.ts` verwaltet Ansichten und Entwürfe. Der Plan erweitert diese Struktur ohne neues Framework, Spielengine oder Dienst.

## Modul und Integration

- `src/game/` enthält Einstieg/Lebenszyklus, reine Spielregeln, Regelkatalog, Darstellung, eigene Styles und Spielstand-API. Aufteilung nach tatsächlicher Verantwortung, keine vorab angelegte allgemeine Spieleplattform.
- Ein dynamischer Import lädt das Modul beim Spieleinstieg. Eine kleine Schnittstelle erhält Container, bestehenden Supabase-Client, Konto-ID und Rückkehr-Callback; sie stellt Pause, Wiederaufnahme und Dispose bereit.
- Die App behält die Hoheit über Auth, Logbuchentwürfe und Stilltimer. Ansichtswechsel dürfen deren Zustand nicht initialisieren oder überschreiben. Bestehende `busy`-Zustände gelten weiterhin; der Einstieg wird während einer laufenden Logbuchübermittlung gesperrt.
- Globale Logbuch-Refreshes dürfen die aktive Spieloberfläche nicht ersetzen. Spielzustand bleibt außerhalb kurzlebiger DOM-Knoten; Animationen aktualisieren nur die nötigen Elemente.
- CSS bleibt unter einer Spielwurzel begrenzt. DOM, CSS und einfache eigene SVG-Illustrationen reichen für die drei definierten Mechaniken; externe Assets oder eine Engine sind nicht erforderlich.
- Spielstatus: Übersicht, Anleitung, laufende Runde, pausiert, Ergebnis ausstehend, Ergebnis bestätigt und Skill-Tree. Zustandstransitionen explizit modellieren; Rewardberechnung bleibt unabhängig von Darstellung und Uhr.
- `visibilitychange` pausiert; Rückkehr setzt nicht automatisch fort. Timing verwendet aktive monotone Zeit und eingefrorene Markerposition statt der während der Pause vergangenen Echtzeit. Stillzeit bleibt separat zeitstempelbasiert.
- Listener und Animationsschleifen beim Verlassen stoppen, den Rundenzustand innerhalb der Sitzung behalten. Beim Abmelden Spielzustand aus dem Speicher entfernen; vorgemerkte Schreibvorgänge kontogebunden erhalten.

## Datenmodell

Neue Tabellen ausschließlich für das Spiel. Da die App genau eine freigeschaltete Familie bedient, genügt ein gemeinsamer Singleton; keine Mehrmandantenplattform ergänzen.

| Tabelle | Wesentliche Felder / Zweck |
| --- | --- |
| `game_state` | Feste Spielstand-ID, `schema_version`, `revision`, `xp_total`, `xp_balance`, Aktualisierungszeitpunkt. Nichtnegative Ganzzahlen, Guthaben ≤ Gesamterfahrung. |
| `game_unlocks` | Spielstand-ID, stabile `skill_id`, Erwerbszeitpunkt und damals gezahlter Preis; eindeutiger Schlüssel pro Fähigkeit. |
| `game_stats` | Spielstand-ID, stabile `game_id`, abgeschlossene Runden und bester Bonus; eindeutiger Schlüssel pro Spiel. |
| `game_operations` | UUID des Vorgangs, Konto-ID, Spielstand-ID, Typ, Regelversion, kanonischer Payload und ursprüngliches Ergebnis als dauerhafter Wiederholungsnachweis. |

Stabile Spiel-IDs: `pacifier`, `baby_talk`, `grasp`. Fähigkeits-IDs aus `spec.md` unverändert übernehmen. Anzeigeetiketten niemals als Datenbankschlüssel verwenden. Vorgangsdaten beschränken sich auf Spielwerte; keine Bewegungsverläufe, Familienereignisse oder Analyse-Telemetrie speichern.

Ein Lese-RPC liefert einen konsistenten Snapshot aus Zustand, Freischaltungen und Statistik. Die zulässige Client-/Schema-/Regelversion wird dabei mitgeliefert. Snapshot nicht über mehrere unkoordinierte Leseabfragen zusammensetzen.

## Schreiben, Wiederholung und Parallelität

Zwei Schreib-RPCs: abgeschlossene Runde verbuchen und Fähigkeit kaufen. Beide prüfen die bestehende Familienzulassung, Auth-Identität, kompatible Versionen und typisierte Eingaben. Server entscheidet Belohnung und Preis anhand seines versionierten Katalogs; niemals einen vom Client gelieferten XP-Betrag oder Kontostand übernehmen.

Jeder Schreibvorgang läuft in einer Transaktion:

1. Gemeinsame Zustandszeile sperren; alle Schreibpfade verwenden dieselbe Reihenfolge.
2. Vorgangs-ID auf bereits erfolgte Verarbeitung prüfen. Gleiche ID mit identischem Konto und Payload liefert das ursprüngliche Ergebnis; abweichender Payload wird abgelehnt.
3. Bei Runden Spielberechtigung, fünf abgeschlossene Aktionen und Bonusbereich 0–5 validieren. Bei Käufen Voraussetzung und Guthaben prüfen; bereits gekaufte Fähigkeit als kostenfreies „bereits vorhanden“ beantworten.
4. XP/Statistik oder Kauf atomar anwenden, Revision erhöhen und Wiederholungsnachweis in derselben Transaktion speichern.
5. Nach Commit Ergebnis zurückgeben; Client lädt einen frischen konsistenten Snapshot. Ein alter Snapshot darf keinen Zustand mit höherer Revision ersetzen.

Die Rundenleistung wird bei diesem privaten Spiel vom Client gemeldet. Der Server verhindert ungültige Belohnungsbeträge, unberechtigte Spiele und Doppelvergabe, bietet aber keinen Nachweis menschlichen Spielens. Wettbewerbs-/Anti-Cheat-Infrastruktur gehört nicht zum Umfang.

Ein abgeschlossenes Ergebnis wird vor Versand unter Konto-ID und Spielstand-ID lokal gespeichert. Maximal ein unbestätigter Abschluss je Gerät blockiert weitere belohnte Runden dort. Für Käufe wird ebenfalls vor Versand eine feste Vorgangs-ID vorgemerkt; weitere Käufe bleiben bis zur Auflösung gesperrt. Kontowechsel darf keine fremden lokalen Vorgänge absenden. Eine verlorene Antwort wird ausschließlich durch Wiederholung derselben ID aufgelöst, nicht durch Neuberechnung mit einer neuen ID.

Bei fehlgeschlagenem localStorage-Schreiben bleibt der Abschluss im Arbeitsspeicher und wird zur direkten Übertragung angeboten; vor möglichem Verlust durch Schließen klar warnen. Ein Onlineindikator allein gilt nicht als Speichernachweis. Keine allgemeine Offline-Synchronisation implementieren.

## Zugriffsschutz

Neue Tabellen mit RLS und expliziten Grants absichern. Lesezugriff ausschließlich für bestehende zugelassene Mitglieder; keine direkten Schreibrechte für Browserrollen. Schreib-RPCs prüfen Mitgliedschaft intern. SECURITY-DEFINER-Funktionen verwenden leeren festen `search_path`, vollständig qualifizierte Namen und eingeschränkte Execute-Rechte. Anonyme und bloß angemeldete, aber nicht freigeschaltete Konten bleiben ausgeschlossen. Keine administrativen Schlüssel im Client.

## Updatevertrag und Migration

Drei unterschiedliche Versionen verwenden: Datenformat (`schema_version`), Spielregeln (`rules_version`) und Revision für konkurrierende Änderungen. Eine neue Inhaltsversion ist kein neuer Spielstand.

- Schemaänderungen sind additive oder explizite verlustfreie Transformationen in neuen Migrationen. Keine produktiven Resets und keine überschreibenden Initialdaten.
- Initialisierung legt nur den wirklich noch nicht vorhandenen Singleton an. Lesefehler oder unbekannte Version dürfen keine Neuanlage auslösen.
- Alte Fähigkeits-IDs und bereits bezahlte Preise erhalten; Kostenänderungen gelten für neue Käufe. Ein späterer Ersatz benötigt eine dokumentierte Zuordnung und Migration.
- Regelkataloge für bereits unterstützte Vorgänge erhalten. Ein vorgemerkter Abschluss oder Kauf mit alter Regelversion wird mit dieser Version validiert. Bereits verarbeitete Vorgänge liefern immer ihr ursprüngliches Ergebnis.
- Bei nicht kompatiblem Datenformat alte Clients zum Aktualisieren auffordern und neue Schreibaktionen sperren. Der getrennte Wiederholungspfad darf bekannte alte ausstehende Vorgänge weiterhin verarbeiten, ohne einen alten Zustand zurückzuschreiben.
- Unbekannte IDs bleiben serverseitig erhalten. Clients senden Befehle, niemals einen vollständigen ersetzenden Spielstand.
- Deploymentreihenfolge: kompatible Datenbankmigration zuerst, dann Client. Vor späteren inkompatiblen Änderungen Kompatibilitätsmatrix und Rückfallweg dokumentieren. Ein Client-Rollback darf nicht durch Zurücksetzen der Datenbank erzwungen werden.
- Historische synthetische Fixtures mit XP, Restguthaben, allen Fähigkeiten, Statistik und offenen Vorgängen ab der ersten Version aufbewahren. Migration, wiederholte Migration, alte Clientanfrage und ausstehender alter Abschluss gehören zu den Freigabeprüfungen.

Spieltabellen und Vorgangsnachweise in das bestehende Sicherungs-/Wiederherstellungskonzept aufnehmen. Bei der Implementierung vorhandene Restore-Skripte auf explizite Tabellenlisten prüfen und erweitern. Eine Sicherung allein ersetzt die Versionsverträglichkeit nicht.

## Ausbau und Fehlerisolation

Ein zentraler Integrationsschalter kann Einstieg und dynamischen Import deaktivieren. Ein Modul-Ladefehler wird lokal angezeigt; Rückweg und Logbuchzustände bleiben nutzbar. Für einen vollständigen Ausbau nur Integration, Modul und Spieltests entfernen; keine fachlichen Logbuchänderungen rückgängig machen. Spieltabellen bleiben ohne aktiven Client bestehen. Datenlöschung ist ein gesonderter Auftrag.

## Validierungsplan

| Kriterien | Verfahren |
| --- | --- |
| AC-001, AC-006, AC-013 | DOM-Tests für Eingaben und Pause; manuelle Smartphone-Probe bei 320–430 CSS-Pixeln, einhändig, ohne Ton und mit reduzierter Bewegung. |
| AC-002, AC-003, AC-012 | Reine Regeltests: 0/5 Bonus, Fehlerwiederholung, Grenzen der Trefferzone, Rettung genau einmal, alle Kosten/Voraussetzungen, beide Zweigreihenfolgen und Spielen nach allen Käufen. |
| AC-004, AC-007 | DOM-Integration mit bestehenden Entwürfen, laufendem Stilltimer und Ladefehler; deaktiviertes Modul bauen und Logbuchtests ausführen. |
| AC-005, AC-008, AC-009 | Lokale Supabase: beide zugelassenen Konten, fremdes Konto, anon, entzogene Mitgliedschaft, direkte Schreibversuche, doppelte und parallele RPCs. |
| AC-010, AC-011 | Migration mit historischen synthetischen Fixtures, Wiederholung und Restore; unbekannte Version/ID sowie alter vorgemerkter Vorgang. |
| AC-008, AC-011, AC-014 | Verlorene Antwort nach Commit, Neuladen, Kontowechsel, gesperrter lokaler Speicher, Sessionablauf und Verbindungsabbruch gezielt simulieren. |

Pflichtprüfungen bei Umsetzung: `npm run check` und `node scripts/test-local-supabase.mjs` gegen lokale Supabase; für die Spielstandkontinuität zusätzlich `node scripts/test-restore.mjs` und die neuen Migrationsfixtures. Tests ausschließlich mit erfundenen Daten. Tatsächliche Smartphone-Spielprobe bleibt gesondert nachzuweisen.

## Grenzen

Spaß und Lesbarkeit sind erst am spielbaren Ergebnis prüfbar. Die Anfangswerte sind bewusst konkret, aber anpassbar. Noch keine Aussage über bestandene Spieltests, veröffentlichte Datenbankmigrationen oder auf echten Geräten bestätigte Bedienbarkeit.
