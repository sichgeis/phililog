# Spec Driven Development

## Grundsatz

Zuerst klären wir **was** erreicht werden soll und woran wir den Erfolg erkennen. Danach planen wir **wie** es umgesetzt wird und zerlegen die Arbeit in prüfbare Schritte. Spezifikationen bleiben auch nach der Implementierung aktuell.

Dieser Ablauf ist bewusst werkzeugunabhängig. Es ist kein SDD-Framework und keine zusätzliche CLI erforderlich.

Die abgestimmte Architektur und das Budget von 0 € stehen im [README](../README.md#architektur-und-datenhaltung). Sie bilden die Randbedingungen für die folgenden Spezifikationen; die einzelnen Feature-Spezifikationen konkretisieren sie.

## Ablage

Jedes Feature erhält einen Ordner `specs/NNN-kurzer-name/` mit einer fortlaufenden dreistelligen Nummer. Kopiere dafür die drei Dateien aus [templates](templates/). Ersetze deren Platzhalter; kennzeichne ungeklärte Inhalte als offen, statt Anforderungen zu erfinden.

| Datei | Verantwortung |
| --- | --- |
| `spec.md` | Problem, Ziel, Umfang, Anforderungen, Akzeptanzkriterien und offene fachliche Fragen |
| `plan.md` | Technischer Ansatz, Entscheidungen, Alternativen und Validierungsstrategie |
| `tasks.md` | Umsetzungsschritte, aktueller Arbeitsstand und Prüfnachweise |

## Ablauf

1. **Spezifizieren:** `spec.md` als Entwurf erstellen. Anforderungen mit `REQ-001` usw. und Akzeptanzkriterien mit `AC-001` usw. innerhalb des Features eindeutig benennen. Umfang und Nicht-Ziele abgrenzen.
2. **Abstimmen:** Offene Fragen klären, die die Umsetzung beeinflussen. Die Zustimmung des Auftraggebers zum Umfang mit Datum und Bezug in `spec.md` festhalten; erst dann auf `Abgestimmt` setzen. Eine ausdrückliche Umsetzungsanweisung für den beschriebenen Umfang zählt als Zustimmung.
3. **Planen:** `plan.md` aus der Spezifikation ableiten. Relevante technische Entscheidungen begründen und Prüfungen den Akzeptanzkriterien zuordnen. Neue fachliche Fragen zurück in die Spezifikation tragen.
4. **Aufgaben ableiten:** In `tasks.md` kleine zusammenhängende Schritte mit Bezug auf Anforderungen oder Akzeptanzkriterien anlegen. Ein Implementierungsauftrag erlaubt die selbstständige Bearbeitung innerhalb seines Umfangs.
5. **Umsetzen und prüfen:** Aufgaben bearbeiten, geeignete Tests ausführen und deren Ergebnisse dokumentieren. Bei geändertem Verhalten zuerst die Spezifikation anpassen; wesentliche Umfangsänderungen erneut abstimmen.
6. **Abschließen:** Jedes Akzeptanzkriterium mit einem tatsächlichen Prüfnachweis belegen. Erst wenn alle Kriterien erfüllt und alle nötigen Aufgaben abgeschlossen sind, das Feature auf `Abgeschlossen` setzen. README bei Bedarf aktualisieren.

## Status und Fortschritt

Die folgende Übersicht ist die zentrale Quelle für den Feature-Status. `tasks.md` enthält den detaillierten Fortschritt; der Abstimmungsstand in `spec.md` dokumentiert die Zustimmung zur Spezifikation.

Statusfolge: `Entwurf` → `Abgestimmt` → `In Umsetzung` → `Abgeschlossen`. Bei `Blockiert` den Grund und den vorherigen Status in `tasks.md` notieren.

## Spezifikationsübersicht

Die Übersicht trennt Implementierung von noch offener Geräteabnahme. Historische Prüfnachweise bleiben in den jeweiligen Aufgaben erhalten; abgeschlossene Teilaufgaben werden nicht durch spätere Erweiterungen ungültig.

| ID | Feature / Link | Status |
| --- | --- | --- |
| 001 | [Fütterung erfassen und Logbuch ansehen](001-fuettern/spec.md) | In Umsetzung (Geräteabnahme offen) |
| 002 | [Tagesbericht und Still-Schätzung](002-tagesbericht/spec.md) | Abgeschlossen |
| 003 | [Befinden nach einem Ereignis](003-befinden/spec.md) | Abgeschlossen |
| 004 | [Anordnung und Bedienbarkeit](004-bedienlayout/spec.md) | Abgeschlossen |
| 005 | [Wartung und zuverlässige Speicherung](005-wartung/spec.md) | Abgeschlossen |
| 006 | [Temperatur und persönliche Speichereffekte](006-temperatur-und-effekte/spec.md) | Abgeschlossen |
| 008 | [Massage und Babygymnastik](008-massage-babygymnastik/spec.md) | In Umsetzung |
| 007 | [Sonnenbad im Logbuch](007-sonnenbad/spec.md) | Abgeschlossen |

Der nächste konkrete Schritt und der Fortschritt stehen in den [Aufgaben zu Feature 001](001-fuettern/tasks.md).
