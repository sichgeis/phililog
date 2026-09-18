# Technischer Plan – Nachtpost

- Eigenes Untermodul `src/game/adventure`: Inhalt, reine Zustands-/Kampfregeln, Rätselregeln, Canvas-Renderer, Audio, Supabase-Speicherung und DOM-Oberfläche getrennt. Vorhandenes Spiel bleibt als Spielstube erhalten; gemeinsame Einstiegsschnittstelle unverändert.
- Weltkoordinaten 640×448; Canvas mit mitlaufendem, zum Seitenverhältnis passenden Kameraausschnitt und CSS-Skalierung; mobile Bedienelemente außerhalb des Canvas, keine präzisen Pixelklicks für Weltinteraktion. DOM für Dialog, Karte, Fähigkeiten und Minispiele. Bewegung zeitbasiert mit begrenztem Delta; Sichtbarkeit pausiert explizit.
- Kuratierte Raum-/Auftragsdaten, deterministische Raumgeometrie aus bewusst gewählten Layouts. Keine Laufzeit-KI und keine zufällige Kampagne. Dungeons kombinieren Kämpfe, Schalter, Ebenenwechsel, Werkzeuge und Minispiele; Raumzustand wiederherstellbar, dauerhafte Abschlüsse einmalig.
- Migration 019: separater Abenteuerstand + UUID-Speichernachweise. Revision-basierte Compare-and-swap-Speicherung, idempotente Wiederholung, Auth-/Familienprüfung, RLS und eingeschränkte RPCs. JSON-Format versioniert und begrenzt, alte unbekannte Felder bleiben beim Laden erhalten. Keine Veränderung der Migrationen 017/018.
- Fortschritt lokal vor Versand sichern. Ein ausstehender Snapshot behält UUID und Basisrevision; nach Bestätigung folgt gegebenenfalls ein weiterer Snapshot. Konflikt stoppt das Spiel und bietet Laden des gemeinsamen Stands an; lokale Sicherung bleibt erhalten. Keine automatische Last-writer-wins-Überschreibung zwischen Geräten.
- Neue Restore-Fixture und echte lokale API-Tests, `npm run check`, Browserprobe, Inhaltssolver. Mindestspielzeit und subjektive Qualität bleiben menschliche Abnahme.

## Inspiration, recherchiert am 18.09.2026

- [Nintendo: Echoes of Wisdom, Entwicklerinterview](https://www.nintendo.com/en-gb/News/2024/September/Ask-the-Developer-Vol-13-The-Legend-of-Zelda-Echoes-of-Wisdom-Chapter-1-2659909.html): Erkundung und Rätsel als Grundlage, zusätzliche Freiheit im Lösungsweg. Eigene Anwendung: Werkzeuge wirken in Kampf und Umgebung, offene Nebenpfade.
- [TUNIC, offizielle Spielseite](https://tunicgame.com/): kleines Wesen auf großem Abenteuer, verlorene Legenden und Kräfte. Eigene Anwendung: verletzliche Figur, Geheimnisse und ein wachsendes Reisebuch; keine Kopie der Welt oder Rätsel.
- [Supergiant: Writing Bastion](https://www.supergiantgames.com/blog/in-depth-writing-bastion/): kurze reaktive Erzählung, an Handlungen gebundene Bedeutung, sparsame Wiederholung. Eigene Anwendung: einmalige Begleiterkommentare und freiwillige Fundbriefe statt langer obligatorischer Textblöcke.

Die Quellen begründen Gestaltungsentscheidungen, keine Erfolgsgarantie oder bestimmte Spielzeit. Alle konkreten Inhalte und Balancingwerte sind eigene Entwürfe.

## Tatsächliche Struktur

`content.ts` enthält Weltgraph, Figuren, Briefe, Werkzeuge und Skillkatalog. `model.ts` kapselt Kollisionen, Gegnerzustände, Wegfindung, Bosskonter und Fortschritt. `puzzles.ts` generiert deterministische Leitungswege und enthält einen unabhängigen Lösbarkeitssucher. `render.ts` zeichnet eigene Canvas-Vektoren mit Kamera, regionalen Farben und lesbaren Silhouetten; keine fremden Assets. `audio.ts` synthetisiert optionale Musik und Effekte. `storage.ts` hält die unveränderlichen Speicheraufträge und Konfliktsicherungen. `index.ts` bindet Simulation, DOM-Menüs und Eingaben zusammen.

Das bisherige `src/game/index.ts` wurde zu `arcade.ts`; ein neuer gleichnamiger Einstieg koordiniert Abenteuer und Spielstube bei unveränderter Logbuch-Schnittstelle. Keine fachlichen Änderungen an `src/main.ts`.
