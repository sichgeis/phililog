# 007 – Sonnenbad im Logbuch

Status: Implementiert und geprüft; Veröffentlichung läuft. Abgestimmt durch ausdrücklichen Implementierungsauftrag am 15. September 2026.

- REQ-001 / AC-001: „Sonnenbad“ mit Sonnensymbol unter „Mehr“ neben Wiegen und Temperatur. Keine weitere Hauptkategorie. Während einer laufenden Stillmessung bleibt der Wechsel gesperrt.
- REQ-002 / AC-002: Zeitpunkt (gerade eben oder Nachtrag) und optionale Dauer in ganzen Minuten erfassen. Keine voreingestellte Dauer; leer oder 0 bedeutet unbekannt, negative/gebrochene Werte werden abgewiesen. Keine Still-, Milch-, Wickel-, Gewichts-, Temperatur- oder Befindenfelder. Personenzuordnung wie bei anderen Ereignissen.
- REQ-003 / AC-003: Entwurfserhalt, Logbuchanzeige, Bearbeiten, Löschen, CSV, Versionsschutz und sichere Wiederholung unterstützen Sonnenbad. Dauer ist von Fütterungsdauern unabhängig. Neue Einträge starten ohne übernommene Dauer.
- REQ-004 / AC-004: Sonnenbad zählt nicht als Mahlzeit oder Wickeln und verändert deren Tagesberichtssummen nicht. Bestehende Daten bleiben unverändert; RLS und Speichereffekte gelten unverändert.

Kein Timer, keine automatische Dauer oder medizinische Bewertung. Veröffentlichung, produktive Migration, Commit/Push und Bereinigung der Projekt-/SDD-Dokumentation wurden am 15. September 2026 ausdrücklich beauftragt.
