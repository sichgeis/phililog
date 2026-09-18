# Aufgaben – Nachtpost

## Stand

In Umsetzung auf ausdrücklichen Nutzerauftrag. Keine behauptete Vierstunden-/Spaßabnahme.

Nächster Schritt: Einen vollständigen Erstspieltest auf dem iPhone mit Zeitmessung und Abwechslungs-/Spielspaßnotizen durchführen; danach Umfang und Balancing anhand der Befunde nacharbeiten.

- [x] Auftrag, Grenzen und recherchierte Designprinzipien festhalten.
- [x] Welt, Geschichte, Werkzeuge, sechs Kapitel und Finale ausarbeiten.
- [x] Bewegung, Kampf, Rätsel, Minispiele, Skilltree und Journal implementieren.
- [x] Darstellung, Touch-/Tastatursteuerung, Audio und Pause integrieren.
- [x] Gemeinsamen versionierten Save mit Konfliktschutz und Altbestandserhalt integrieren.
- [x] Inhaltsgraph, Kampflogik, Rätsel, Datenbank und Restore prüfen.
- [x] Browserprobe der Mechaniken und beider Enden sowie technische Erreichbarkeits-/Bossprüfungen durchführen.
- [ ] Vollständigen zusammenhängenden Kampagnendurchlauf vom frischen Stand bis zum Ende ohne Szenenfixtures durchführen.
- [ ] Vierstündigen menschlichen Erstspieltest und Qualitätsabnahme nachweisen.

## Technischer Prüflauf (18.09.2026)

- Eigenständige Kampagne implementiert: 98 Orte, sechs Regionen/Hüter/Werkzeuge, zwölf Fähigkeiten, 24 Briefe, sechs Zustellaufträge, Prolog und zwei Schlussentscheidungen. Alte Spielstube bleibt vollständig erreichbar; kein Umbuchen alter XP.
- `npm run check`: 89 Tests erfolgreich, TypeScript-Prüfung und Produktionsbuild erfolgreich.
- Reine Tests: Weltgraph, Werkzeug-/Prüfungssperren, geometrische Wege in beiden Ebenen, Skillkosten, einmalige Belohnungen, Todesrückkehr, Bossrüstung/Konter und alle sechs Bosskämpfe. Boss-Probe ist ein deterministischer Simulationsspieler, kein menschlicher Schwierigkeits-/Spaßnachweis.
- Leitungsrätsel: 100 deterministische Varianten von 3×3 bis 5×5 durch unabhängige Wegsuche und Wiederherstellung validiert. Keine Lösbarkeit lediglich aus erfolgreichem Rendern abgeleitet.
- Speichern: unveränderlicher Wiederholungsauftrag nach verlorener Antwort, Änderungen während Versand, automatische Abarbeitung folgender Aufträge, echte CAS-Konflikte, archivierte lokale Konfliktsicherung und unbekannte Formatversion getestet.
- Lokale Supabase-API: Familien-/Fremd-/anonymer Zugriff, fehlende direkte Tabellenrechte, idempotente UUID, zwei konkurrierende Geräte, ungültige Payloads, Version und wiederholte Migration 019 erfolgreich. V1/V2-Spieltests bleiben erfolgreich.
- Restore: alle 19 Migrationen, V1-/V2-Bestand und Abenteuerfixture mit Werkzeugen, Briefen, Fähigkeiten, alter Revision und offenem Save geprüft. Historische Fixture wird ergänzt, nicht ersetzt. Ein vor dem Dump erzeugter Speicherbeleg ist nach Restore identisch wiederholbar.
- Echte isolierte Chromium-Probe gegen lokale Supabase, ausschließlich synthetische Konten und Szenen. Keine API-Mocks oder Netzwerkinterception. Browser-Harness weiterhin durch fehlende macOS-Bedienungshilfe-Freigabe blockiert; Ersatzverfahren gemäß UI-Prüfskill.
- Browser: Prolog, Regionenreise, Tastaturbewegung, NPC-Dialog, Fähigkeiten, Spielstube/Rückweg, Speichern/Reload; 320×568, 390×844, 430×932 und 844×390 ohne horizontales Abschneiden und mit erreichbaren mindestens 48-Pixel-Bedienelementen.
- Alle drei Rätsel normal sowie spätere Varianten (umgekehrte Reihenfolge, 5×5-Schaltkreis, Rücksendungen ohne Tipp) über echte DOM-Eingaben gelöst und als Raumabschluss in der lokalen Datenbank bestätigt. Dafür wurden explizite synthetische Szenen-Startstände verwendet; kein behaupteter manueller Komplettdurchlauf.
- Echte Zweigeräte-Browserprüfung: Konflikt hält Schreiben an, Sicherung bleibt, gemeinsamer Stand lässt sich laden. Touch-Bewegung über Chromium-Touch-Ereignisse tatsächlich ausgeführt. Beide Endentscheidungen per Dialog und Auswahl gespeichert, Morgenwelt sichtbar. Audio bewusst ein-/ausgeschaltet, keine Browserfehler.
- Gefundene Fehler behoben: wartender zweiter Save im Pausenmenü, nicht unterscheidbare gleiche Zeichen in einer Folge, zu kleine Hochformat-Welt (mitlaufende Kamera), von Logbuch-CSS verkleinerte Titelillustration, fehlender Boss-Arenaschutz. Dialog/Puzzle bleibt auch über Pause, Fähigkeiten und Logbuchwechsel erhalten; Tastenkürzel überspringen keine Dialoge. Fliegende Werkzeuge behalten ihren Ursprung bei Werkzeugwechsel. Gegner navigieren um Hindernisse; Werkzeuge direkt wechselbar.
- Screenshots unter `/private/tmp/nachtpost-screenshots/`; kein Produktionsspielstand als Testdaten verwendet. Lokaler synthetischer Ausgangsstand nach Browser-Szenentests wiederhergestellt.

## Noch nicht nachgewiesen

- AC-006: Ein vollständiger menschlicher Erstspieltest, vier Stunden ohne Leerlauf/Grind und subjektiv ausgereifter Spielspaß. Der jetzige Stand ist ein spielbarer Kampagnenkandidat, kein nachgewiesen fertiges Vierstundenspiel.
- Tatsächliche iPhone-/Safari-Leistung, Audiogefühl und Feinabstimmung der Touchkämpfe. Chromium-Emulation ersetzt diese nicht.
