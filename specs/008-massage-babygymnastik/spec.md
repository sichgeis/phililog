# 008 – Massage und Babygymnastik

Status: Abgestimmt durch ausdrücklichen Umsetzungs- und Veröffentlichungsauftrag am 15. September 2026.

- REQ-001 / AC-001: Massage und Babygymnastik (Gymnastik-/Sportübung für das Baby) unter „Mehr“ mit eigenem Symbol auswählen. Laufendes Stillen sperrt den Wechsel wie bei anderen Ereignissen.
- REQ-002 / AC-002: Zeitpunkt und optionale Dauer in ganzen Minuten nach dem bestehenden Sonnenbad-Muster. Leer oder 0 bedeutet unbekannt; negative, gebrochene und zu große Werte ablehnen. Eigene leere Dauer je Art, keine fachfremden Felder oder Befinden.
- REQ-003 / AC-003: Entwurfserhalt, Personenzuordnung, Logbuch, Bearbeiten, Löschen, CSV und Versionsschutz unterstützen beide Arten. Neue Einträge starten ohne alte Dauer.
- REQ-004 / AC-004: Milch- und Wickelsummen bleiben unverändert; bestehende Daten und Zugriffsschutz erhalten.
- REQ-005 / AC-005: Geprüften Stand auf main integrieren und zusammen mit der nötigen Datenbankmigration veröffentlichen.

Kein Übungskatalog, Timer oder medizinische Bewertung. Technische Ausgestaltung orientiert sich an der vorhandenen optionalen Dauer; Commit, Push, Migration und Deployment sind ausdrücklich beauftragt.
