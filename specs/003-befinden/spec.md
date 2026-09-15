# 003 – Befinden nach einem Ereignis

## Abstimmungsstand

- Stand: Erweiterungen abgeschlossen und veröffentlicht, zuletzt 15. September 2026.
- Auftrag: Vier Optionen einschließlich Abwahl am 13. September 2026 bestätigt; Umsetzung und Veröffentlichung ausdrücklich beauftragt.

## Ziel und Umfang

Julia und Christian können optional festhalten, wie Philine unmittelbar nach Stillen, Flasche, Wickeln, Sonnenbad, Massage oder Babygymnastik wirkte. Die Angabe beschreibt die vorherrschende Beobachtung zu diesem Ereignis, keinen fortlaufenden Zustand.

Sechs Optionen unter „Befinden danach · Optional“:

| Option | Icon-Idee | Gemeinte Beobachtung |
| --- | --- | --- |
| Quengelig | Unzufriedenes Gesicht | Unruhig, unzufrieden, quengelt. |
| Schläfrig | Gesicht mit geschlossenen Augen und Z | Wird müde, döst ein. |
| Ruhig | Entspanntes Gesicht | Wirkt entspannt und zufrieden. |
| Aufmerksam | Gesicht mit offenen Augen / kleiner Stern | Wach und interessiert, schaut umher. |
| Zornig | Zorniges Gesicht 😠 | Wirkt zornig. |
| Eingeschlafen | Schlafzeichen 💤 | Ist eingeschlafen; von bloßer Schläfrigkeit getrennt. |

Die Icon-Ideen sind Gestaltungsvorschläge; sichtbare Textlabels bleiben verbindlich. „Ruhig“ und „Aufmerksam“ können sich im Alltag überschneiden; gewählt wird, was den Eindruck am besten beschreibt.

## Anforderungen

| ID | Anforderung |
| --- | --- |
| REQ-001 | Optionale Angabe für Stillen, Flasche, Wickeln, Sonnenbad, Massage und Babygymnastik; keine Vorauswahl, keine Übernahme vom vorherigen Ereignis. |
| REQ-002 | Höchstens eine Option ist aktiv. Klick auf eine andere Option ersetzt die Auswahl. Erneuter Klick auf die aktive Option entfernt sie. |
| REQ-003 | Sechs Icon-Buttons mit Text, klarer Kontur und dezentem Aquarellhintergrund bei Auswahl. Zustand auch ohne Farberkennung und per Tastatur/Screenreader verständlich. Touch-Ziele mindestens 44 px. Kompakt nahe dem Speichern-Knopf; bei Platzmangel über mehrere Reihen statt zu kleiner Ziele. |
| REQ-004 | Der Zustand gehört zum gespeicherten Ereignis und ist im Logbuch dezent als Icon und Text sichtbar. Ohne Angabe entfällt die Markierung. Beide Eltern können ihn beim Bearbeiten ändern oder entfernen. |
| REQ-005 | Entwurfserhalt, Zugriffsschutz, Versionsprüfung und sichere Wiederholung gelten auch für diese Angabe. Nach erfolgreichem Speichern beginnt der nächste Eintrag wieder ohne Zustand. |
| REQ-006 | Alte Ereignisse bleiben ohne Zustand. CSV erhält eine eigene Spalte „Befinden danach“. Ein Zustand ist für Wiegen nicht zulässig und wird beim Wechsel zu Wiegen aus dem Entwurf entfernt. |

## Akzeptanzkriterien

- AC-001: Neuer Eintrag ist ohne Vorauswahl speicherbar; ein älterer Eintrag wird ohne erfundene Zustandsangabe angezeigt.
- AC-002: Quengelig wählen, dann Schläfrig: nur Schläfrig aktiv und gespeichert. Schläfrig erneut klicken: keine Auswahl.
- AC-003: Auswahl bleibt bei Ansichtswechsel und Neuladen erhalten, wird nach erfolgreichem Speichern zurückgesetzt.
- AC-004: Beide Eltern können die Angabe ändern/entfernen; gleichzeitige veraltete Bearbeitungen überschreiben keine neuere Fassung.
- AC-005: Historie und CSV geben den gespeicherten Zustand korrekt wieder. Auswahl ist mit Tastatur bedienbar und auf 320/390 px lesbar.
- AC-006: Bei Wiegen wird kein Zustand gespeichert; Datenbank weist ungültige Werte und Fremdzugriffe ab.

## Nicht-Ziele dieses Vorschlags

Kein eigener Ereignistyp „Quengeln“, keine automatische Ableitung aus anderen Angaben, kein historischer Backfill und keine Erweiterung der Tagesstatistik. Diese Punkte können später separat beauftragt werden.

## Entscheidung

Zunächst vier Zustände bestätigt; seit 14. September 2026 sind es sechs. Erneutes Tippen wählt ab. Gilt für Stillen, Flasche und Wickeln.

## Wartung – 13. September 2026

Ergänzende verbindliche Fehlerfälle und Akzeptanzkriterien: [freigegebenes Wartungspaket](../005-wartung/spec.md).

## Bedienlayout – 13. September 2026

[Feature 004](../004-bedienlayout/spec.md) ergänzt eine ausdrückliche Abwahl und bündelt optionale Angaben. Entwurfserhalt und Speichersemantik bleiben unverändert.

## Erweiterung – 14. September 2026

„Zornig“ und „Eingeschlafen“ zusätzlich zu den vier bestehenden Optionen ausdrücklich zur Umsetzung beauftragt. AC-007: Beide neuen Werte lassen sich auswählen, gegeneinander austauschen, abwählen, speichern, nachträglich bearbeiten und im Logbuch/CSV lesen. Entwürfe und sichere Wiederholungen berücksichtigen sie. Bei Wiegen, Temperatur und Sonnenbad ist weiterhin kein Befinden zulässig. Keine Vorauswahl oder Änderung bestehender Einträge.

Commit, Push und Veröffentlichung einschließlich der erforderlichen produktiven Migration 013 am 14. September 2026 ausdrücklich beauftragt.

## Erweiterung – 15. September 2026

Abgestimmt durch ausdrücklichen Implementierungs- und Produktionsauftrag einschließlich nötiger Migration. Die bisherigen Ausschlüsse für Sonnenbad, Massage und Babygymnastik entfallen. Wiegen und Temperatur bleiben reine Messereignisse ohne „Befinden danach“.

- REQ-007 / AC-008: Alle sechs Optionen einschließlich Wechsel und Abwahl auch bei Sonnenbad, Massage und Babygymnastik anbieten. Ohne Vorauswahl und unabhängig von einer optionalen Dauer speichern.
- REQ-008 / AC-009: Entwurf und Bearbeitung erhalten das Befinden; Logbuch, CSV und sichere Wiederholung berücksichtigen es. Nach dem Speichern zurücksetzen. Bei Wechsel innerhalb unterstützter Arten Auswahl erhalten, beim Wechsel zu Wiegen/Temperatur entfernen.
- REQ-009 / AC-010: Datenbank erlaubt die sechs Werte und NULL bei allen drei Aktivitäten; ungültige Werte, veraltete Änderungen und Fremdzugriffe bleiben abgewiesen. Bestehende Einträge unverändert lassen. Migration vor Frontend veröffentlichen.
