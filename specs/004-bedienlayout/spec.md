# 004 – Anordnung und Bedienbarkeit

Status: Abgeschlossen und veröffentlicht; Prüfnachweise in tasks.md. Abgestimmt am 13. September 2026 durch ausdrücklichen Umsetzungsauftrag zum Designreview, ausgenommen dessen Punkt 2 (Trennung Stillen/Nachtragen).

## Umfang und Anforderungen

- REQ-001: Letzte Mahlzeit vor der Eingabe; kompakte Kernfelder und beim Scrollen erreichbares Speichern. Keine verdeckten Felder durch Speicherleiste oder Tastatur. Beschriftung „Speichern · Io triumphe“.
- REQ-002: Flaschenmenge vor Milchart; weitere Ereignisse direkt an der Artenauswahl. Zeitpunkt kompakt, Details aufklappbar; angemeldete Person namentlich sichtbar. Neue Einträge werden weiterhin serverseitig zugeordnet, nur Bearbeitung erlaubt Personenwechsel.
- REQ-003: Bestehenden Stillablauf einschließlich Timer, manueller Dauer und Schätzung erhalten. Keine getrennten Modi einführen; keine Änderung der fachlichen Berechnung.
- REQ-004: Einheitliche Auswahlzustände, Haken nur bei aktiver Mehrfachauswahl, explizite Befinden-Abwahl. Touch-Ziele mindestens 44 px, lesbare Hinweise und einheitliche Feldtitel. Fokus bei Neudarstellung erhalten.
- REQ-005: Bearbeitung mit Kontext, Abbrechen oben und gestalteter Personenauswahl. Löschen getrennt von Speichern. Logbuch mit hervorgehobenen Hauptwerten, dezenten Metadaten und eindeutigem Bearbeitungssymbol.
- REQ-006: Tagesbericht mit ISO-Kalenderwoche und Wochenjahr, Wochenpfeilen, heutigem Datum und „Heute“. Keine freie Datumsauswahl. Montag bis Sonntag, aktuelle Woche nur bis heute; zukünftige Wochen nicht erreichbar. Neueste Tage zuerst. Unvollständige Summe unmittelbar am Ergebnis markieren; reine Flaschenmengen nicht als geschätzt kennzeichnen.
- REQ-007: Hauptnavigation beim Scrollen erreichbar, Einstellungen direkt erreichbar. Desktop nutzt Breite für zusammengehörige Felder; Aquarellstil erhalten.

## Akzeptanzkriterien

- AC-001: Bei 390 × 844 px normale Still-Kernfelder und Speichern erreichbar, letzte Mahlzeit vor dem Formular; 320 px ohne horizontalen Überlauf. Erweiterte Angaben dürfen scrollen. Verkleinerter Viewport und vergrößerte Schrift verdecken keine fokussierten Felder.
- AC-002: Flasche, Wickeln, Wiegen und manuelle Zeitangaben bedienbar; Entwürfe und Stillstart/-ende bleiben erhalten. Speichern ohne Befinden möglich, Abwahl möglich.
- AC-003: Bearbeiten/Abbrechen und Personenauswahl mit mindestens 44 px; Logbuch zeigt Menge/Dauer vor Metadaten. Tastaturfokus bleibt nach Auswahl erhalten.
- AC-004: Wochenwechsel, ISO-Jahresgrenzen, Sommerzeit, „Heute“ und Begrenzung auf aktuelle Woche korrekt. Unvollständige Summen klar benannt.
- AC-005: Aktuelle Person kommt aus geschützter Datenbankzuordnung, keine Ableitung aus E-Mail/Namen oder früheren Einträgen. Fremde und anonyme Konten erhalten keine Person.
- AC-006: `npm run check`, lokale Supabase-Prüfung und Browserprüfung mit erfundenen Daten erfolgreich.

## Grenzen

Umsetzung und produktive Migration am 13. September 2026 nach Screenshot-Abnahme beauftragt; vorher nach Möglichkeit Sicherung. Commit, Push auf main und Veröffentlichung anschließend ausdrücklich freigegeben. Keine Datenkorrektur. Physische Smartphone-/PWA-Abnahme bleibt gesondert.
