# 011 – Logbuchfilter und Gewichtsvergleich

Status: Abgeschlossen und veröffentlicht am 4. Oktober 2026. Abgestimmt durch ausdrücklichen Planungs-, Umsetzungs-, Migrations- und Veröffentlichungsauftrag vom 4. Oktober 2026. Der Auftrag erlaubt Commit, Push und Pages-Veröffentlichung.

## Anforderungen und Akzeptanzkriterien

- REQ-001 / AC-001: Das Logbuch lässt sich nach jeder vorhandenen Ereignisart oder „Alle Ereignisse“ filtern. Der Filter gilt bereits in der Datenbankabfrage einschließlich weiterer Seiten; ältere Gewichte dürfen nicht durch die erste gemischte Seite verloren gehen. CSV bleibt ein vollständiger Export aller Ereignisse.
- REQ-002 / AC-002: Eine eigene Hauptansicht „Gewicht“ zeigt je Gewichtsmessung eine Karte, neueste zuerst, mit Datum, Uhrzeit, Gramm und Alter am Messtag. Weitere Seiten sind erreichbar. Bearbeitung verwendet den vorhandenen Ablauf.
- REQ-003 / AC-003: Jede geeignete Karte zeigt eine lineare Gewichtsskala mit P10 als linker Bande, P90 als rechter Bande, P50 (Median) als mittlerer Referenz und dem Messwert als Punkt. Auch Werte außerhalb P10–P90 sind sichtbar und ausdrücklich beschriftet. Die tatsächliche Lage des Medians berücksichtigt die asymmetrische Verteilung.
- REQ-004 / AC-004: Altersberechnung anhand des gemeinsamen Geburtsdatums und des Messtages in Europe/Berlin, Geburtstag = Tag 0, unabhängig von Zeitzone und Sommerzeit des Endgeräts. Verwendung der taggenauen WHO-Referenz für Mädchen, Tag 0–1856. Keine Extrapolation vor Geburt oder außerhalb des Referenzbereichs; fehlendes Geburtsdatum wird erklärt. Zukunftsmessungen erhalten keine statistische Einordnung.
- REQ-005 / AC-005: Geburtsdatum in geschützten gemeinsamen Einstellungen, änderbar mit bestehendem Versionsschutz. Das vom Nutzer mitgeteilte Datum wird ausschließlich produktiv gesetzt; es erscheint weder in Migration, Beispielen, Tests noch öffentlicher Dokumentation. Vorhandene Messwerte bleiben unverändert.
- REQ-006 / AC-006: WHO-Quelle und Bedeutung von P10/P50/P90 in der Ansicht erklären. P10–P90 ist ein Referenzbereich, keine medizinische Gesund-/Krankbewertung. Keine automatische Frühgeburtskorrektur, da Schwangerschaftsalter nicht erfasst wird.
- REQ-007 / AC-007: Filter, Gewichtsansicht und Einstellungen funktionieren mit Tastatur und bei 320/390 px Breite. Wechsel erhält Eingabeentwürfe; Abmeldung entfernt private Ansichts- und Profildaten. Lade-, Leer- und Fehlerzustände sind verständlich; überholte Antworten dürfen keinen neuen Filter überschreiben.
- REQ-008 / AC-008: `npm run check`, lokale Supabase-Prüfung einschließlich Profil-RLS, Bestands-/Kompatibilitätsprüfung der Migration und tatsächliche UI-Prüfung mit erfundenen Daten. Datenbank vor Frontend veröffentlichen und Deployment nachweisen.

## Referenzentscheidung

[WHO Child Growth Standards – Weight-for-age](https://www.who.int/tools/child-growth-standards/standards/weight-for-age), Mädchen, taggenaue erweiterte Perzentiltabelle. Internationaler Standard ab Geburt; keine behauptete Niedersachsen-Stichprobe. [KiGGS](https://edoc.rki.de/handle/176904/3271?show=full) beginnt für diese Referenz bei drei Monaten und deckt den benötigten frühen Säuglingsbereich nicht vollständig ab. WHO verwendet eine altersabhängige schiefe Gewichtsverteilung; keine erfundene Normalverteilung. P50 ist der Median, kein arithmetischer Mittelwert. Hinweise auf nicht erfasste Körperlänge und Schwangerschaftsalter helfen bei der Interpretation.
