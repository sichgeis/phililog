# 006 – Temperatur und persönliche Speichereffekte

Status: Lokal abgeschlossen. Abgestimmt am 14. September 2026 durch ausdrücklichen Umsetzungsauftrag für die folgenden drei Änderungen.

- REQ-001 / AC-001: Das obere Einstellungszahnrad entfällt; Einstellungen bleiben im Footer erreichbar.
- REQ-002 / AC-002: Unter „Mehr“ steht neben Wiegen „Temperatur“. Körpertemperatur in °C mit einer Nachkommastelle, Komma oder Punkt, Zeitpunkt und bestehender Personenzuordnung erfassen. Kein vorausgefüllter Messwert, keine Dauer oder Befinden. Entwurf, Logbuch, Bearbeiten, Löschen und CSV unterstützen die neue Art. Leere, nicht numerische oder außerhalb der technischen Eingabegrenzen 25,0–45,0 liegende Werte werden abgelehnt. Diese Grenzen dienen ausschließlich der Eingabeprüfung, nicht medizinischer Bewertung.
- REQ-003 / AC-003: Nach erfolgreichem Speichern erhält das angemeldete Christian-Konto einen auffälligen Sternenregen mit Regenbogen, auch für Flasche und Wickeln. Julias Aquarellkonfetti bleibt erhalten. Fehler lösen keinen Effekt aus. Reduzierte Bewegung zeigt Christian eine ruhige, kurz sichtbare Regenbogen-/Sternengrafik. Keine blinkenden Effekte und keine blockierten Bedienelemente.
- AC-004: Fachlogik, DOM, Build und lokale Datenbank prüfen; keine echten Familiendaten für Tests.

Keine medizinische Einordnung oder Auswertungsänderung. Commit, Push, produktive Migration und Veröffentlichung am 14. September 2026 ausdrücklich beauftragt.
