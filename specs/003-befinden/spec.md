# 003 – Befinden nach einem Ereignis

## Abstimmungsstand

- Stand: Abgeschlossen, 13. September 2026.
- Auftrag: Vier Optionen einschließlich Abwahl am 13. September 2026 bestätigt; Umsetzung und Veröffentlichung ausdrücklich beauftragt.

## Ziel und Umfang

Julia und Christian können optional festhalten, wie Philine unmittelbar nach Stillen, Flasche oder Wickeln wirkte. Die Angabe beschreibt die vorherrschende Beobachtung zu diesem Ereignis, keinen fortlaufenden Zustand.

Vorschlag: vier Optionen unter „Wie war Philine danach? · Optional“:

| Option | Icon-Idee | Gemeinte Beobachtung |
| --- | --- | --- |
| Quengelig | Unzufriedenes Gesicht | Unruhig, unzufrieden, quengelt. |
| Schläfrig | Gesicht mit geschlossenen Augen und Z | Wird müde, döst ein. |
| Ruhig | Entspanntes Gesicht | Wirkt entspannt und zufrieden. |
| Aufmerksam | Gesicht mit offenen Augen / kleiner Stern | Wach und interessiert, schaut umher. |

Die Icon-Ideen sind Gestaltungsvorschläge; sichtbare Textlabels bleiben verbindlich. „Ruhig“ und „Aufmerksam“ können sich im Alltag überschneiden; gewählt wird, was den Eindruck am besten beschreibt. Ein fünfter Zustand „Schläft“ wäre eine spätere sinnvolle Ergänzung, wenn Einschlafen getrennt von Müdigkeit erfasst werden soll. Für den ersten Wurf werden vier Optionen empfohlen.

## Anforderungen

| ID | Anforderung |
| --- | --- |
| REQ-001 | Optionale Angabe für Stillen, Flasche und Wickeln; keine Vorauswahl, keine Übernahme vom vorherigen Ereignis. |
| REQ-002 | Höchstens eine Option ist aktiv. Klick auf eine andere Option ersetzt die Auswahl. Erneuter Klick auf die aktive Option entfernt sie. |
| REQ-003 | Vier Icon-Buttons mit Text, klarer Kontur und dezentem Aquarellhintergrund bei Auswahl. Zustand auch ohne Farberkennung und per Tastatur/Screenreader verständlich. Touch-Ziele mindestens 44 px. Kompakt nahe dem Speichern-Knopf; bei Platzmangel zweizeilig statt zu kleiner Ziele. |
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

Vier Zustände und erneutes Tippen zum Abwählen bestätigt. Gilt für Stillen, Flasche und Wickeln.

## Bedienlayout – 13. September 2026

[Feature 004](../004-bedienlayout/spec.md) ergänzt eine ausdrückliche Abwahl und bündelt optionale Angaben. Die vier Optionen, Entwurfserhalt und Speichersemantik bleiben unverändert.
