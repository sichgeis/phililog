# Arbeitsregeln

## Einstieg

- Lies zuerst `README.md`, `specs/README.md` und die Dokumente des betroffenen Features.
- Prüfe vor Änderungen den Git-Status. Bewahre vorhandene Änderungen anderer Arbeiten.
- Projektsprache für Dokumentation und Spezifikationen ist Deutsch.

## Spec Driven Development

- Der verbindliche Ablauf steht in `specs/README.md`. Feature-Verhalten gehört in die jeweilige `spec.md`, technische Entscheidungen in `plan.md`, Fortschritt und Prüfnachweise in `tasks.md`.
- Implementiere Produktverhalten erst auf Grundlage einer abgestimmten Spezifikation. Ein Entwurf oder eine Vorlage ist keine Freigabe.
- Explizite Nutzeranweisungen haben Vorrang. Dokumentiere daraus entstehende Änderungen an Spezifikation und Umfang, damit das Repository aktuell bleibt.
- Triff reversible technische Detailentscheidungen innerhalb des beauftragten Umfangs selbstständig. Kläre offene Fragen, die Produktverhalten oder wesentliche technische Grenzen verändern.
- Halte die Grundlage schlank. Wähle keine Plattform, Frameworks oder Dienste allein wegen dieser Vorlagen.

## Umsetzung und Abschluss

- Arbeite in zusammenhängenden Schritten: umsetzen, angemessen prüfen, Fortschritt und Nachweise aktualisieren, fortsetzen.
- Leite Tests aus Akzeptanzkriterien und relevanten Fehlerfällen ab. Behaupte keine erfolgreichen Prüfungen, die nicht ausgeführt wurden.
- Es gibt aktuell weder Build- noch Testbefehle. Ergänze tatsächlich funktionierende Befehle im README, sobald Anwendungscode hinzukommt.
- Verwende für Beispiele und Tests ausschließlich erfundene Daten; keine echten Baby- oder Familiendaten im Repository.
- Bleibe für kleine sequenzielle Arbeiten auf dem aktuellen Branch. Nutze Isolation bei konkretem Bedarf; neue Branches heißen standardmäßig `codex/<thema>`.
- Erstelle Commits, Pushes und Veröffentlichungen nur im Rahmen der jeweiligen Nutzerautorisierung.
- Hinterlasse bei offener Arbeit in `tasks.md` den Stand, relevante Blocker und genau einen nächsten Schritt. Berichte zum Abschluss Änderungen, Prüfung und verbleibende Einschränkungen.
