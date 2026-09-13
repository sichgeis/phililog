# 001 – Fütterung erfassen und Logbuch ansehen

## Abstimmungsstand

- Stand: MVP-Umsetzung am 12. September 2026 ausdrücklich beauftragt.
- Zustimmung: Der Auftraggeber hat die Ergänzungsvorschläge angenommen und eine erste Version angefordert.
- Antworten des Auftraggebers: Stillen als Startauswahl; 15/30 Minuten und „nicht bekannt“ angenommen. Beim Stillen sollen Beginn und Ende durch einfache Klicks dokumentiert werden. Noch kein Supabase-Projekt vorhanden; Einrichtung vorbereiten.

## Ziel und Grenzen

Julia und Christian dokumentieren gemeinsam Fütterungen auf ihren Smartphones mit wenigen Eingaben. Es gibt eine Web-App mit zwei Hauptansichten und einer Projektinfo. Architektur und Budget von 0 € stehen im [README](../../README.md#architektur-und-datenhaltung).

Nicht enthalten: Erinnerungstimer, Diagramme, Erinnerungen, dauerhafte persönliche Einstellungen und vollständige Offline-Synchronisation. Fehlende Verbindung darf nicht als erfolgreiche Speicherung erscheinen.

## Anforderungen

| ID | Anforderung |
| --- | --- |
| REQ-001 | Nach Anmeldung öffnet sich direkt die Eingabe. Die Historie ist separat erreichbar. |
| REQ-002 | Fütterungsart: Flasche oder Stillen. Dauer wird je Art vorbelegt und kann für diesen Eintrag geändert werden. Änderungen werden nicht als neue Standards gespeichert. |
| REQ-003 | Startwerte: Stillen, 15 Minuten für Flasche, 30 Minuten für Stillen. Dauer unbekannt über 0 Minuten (keine Checkbox). Sonst positive ganze Minuten, keine medizinisch begründete Obergrenze. |
| REQ-004 | Zeitpunkt standardmäßig „jetzt“ beim Absenden; ausdrücklich geänderte lokale Datums-/Zeitangaben bleiben erhalten. Die gespeicherte Zeit bezeichnet das Ende; bei Stillen wird zusätzlich der Beginn erfasst. |
| REQ-005 | Bei Flasche ist eine positive Menge in ganzen 5-ml-Schritten erforderlich, ohne Vorbelegung. Beim Stillen ist die Menge ausgeblendet und wird nicht gespeichert. |
| REQ-006 | Beim Stillen kann optional links, rechts oder beide gewählt werden. |
| REQ-007 | Während eines Formularentwurfs bleiben eigene Werte je Fütterungsart beim Hin- und Herwechsel erhalten; gespeichert werden nur die Angaben der ausgewählten Art. |
| REQ-008 | Nach bestätigtem Speichern erscheint eine Erfolgsmeldung, eine frische Eingabe mit Startwerten und darunter der letzte Eintrag. |
| REQ-009 | Bei Speicherfehlern bleiben Eingaben erhalten. Während einer Übermittlung ist erneutes Absenden gesperrt. Wiederholung nach ungewissem Ergebnis erzeugt keinen zweiten Eintrag. |
| REQ-010 | Historie: neueste Fütterungen zuerst, nach lokalem Kalendertag gruppiert, kompakte Liste. Alle Einträge sind über Nachladen erreichbar. |
| REQ-011 | Beide Personen dürfen gemeinsame Einträge korrigieren und nach ausdrücklicher Rückfrage löschen. Änderungen dürfen parallele Änderungen nicht still überschreiben. |
| REQ-012 | Startansicht zeigt den zeitlich letzten gespeicherten Eintrag. Bei Rückkehr aus dem Hintergrund oder Wechsel zur Historie werden Daten aktualisiert. |
| REQ-013 | CSV-Export enthält alle gespeicherten Einträge mit eindeutigem Zeitpunkt inklusive Zeitzone, Art, Dauer, Menge und Stillseite. Keine Kontodaten im Export. |
| REQ-014 | Ausschließlich zwei administrativ freigeschaltete Konten dürfen lesen und schreiben. Keine öffentliche Registrierung, keine administrativen Schlüssel im Browser. Anmeldung bleibt auf dem Gerät gespeichert. |
| REQ-015 | Ungespeicherte Eingaben bleiben bei Ansichtswechsel und App-Hintergrund erhalten. Beim Neuladen kann ein benutzergebundener lokaler Entwurf wiederhergestellt werden. Nach Abmeldung wird er entfernt. Bei Geräte-/Browserdatenverlust besteht keine Wiederherstellungsgarantie. |
| REQ-016 | Die App ist auf schmalen Smartphones bedienbar, mit beschrifteten Feldern, großen Touch-Zielen, Tastaturzugang und verständlichen Fehlermeldungen. Sie ist als PWA installierbar; sensible API-Antworten werden nicht durch einen Service Worker gecacht. |

| REQ-017 | Stillen per Klick starten und beenden; sekundengenaue Zeitpunkte erfassen, Dauer auf ganze Minuten gerundet (mindestens eine) anzeigen. Erst „Eintrag speichern“ legt den gemeinsamen Eintrag an. Eine laufende Messung bleibt auf diesem Gerät bei Hintergrund/Neuladen erhalten. Nachträge verwenden Endzeit und Dauer zur Berechnung des Beginns; bei unbekannter Dauer bleibt der Beginn leer. |

## Akzeptanzkriterien

| ID | Bezug | Erwartetes Verhalten |
| --- | --- | --- |
| AC-001 | REQ-001, REQ-016 | Nach Anmeldung erscheint die Eingabe; Historie und zurück sind ohne Seitenverlust erreichbar. Bei 390 px Breite entsteht kein horizontaler Überlauf. |
| AC-002 | REQ-002, REQ-003, REQ-007 | Auswahl der Art zeigt passende Dauer und Felder; eigene Werte bleiben innerhalb des Entwurfs pro Art erhalten und gelten nicht für neue Einträge. |
| AC-003 | REQ-004 | Öffnen um 10:38 und Absenden um 10:45 im Modus „jetzt“ speichert 10:45; ein manueller Nachtrag bleibt unverändert. |
| AC-004 | REQ-005, REQ-006 | 60/65 ml werden akzeptiert; leere, negative und nicht durch 5 teilbare Flaschenmengen abgewiesen. Stillen speichert keine Menge und optional eine Seite. |
| AC-005 | REQ-008, REQ-009 | Erfolg erst nach Datenbankbestätigung; danach Formular zurückgesetzt. Bei Fehlern bleibt der Entwurf. Doppelklick und Wiederholung derselben Übermittlung ergeben höchstens einen Eintrag. |
| AC-006 | REQ-010, REQ-012 | Liste ist nach Fütterungszeitpunkt absteigend gruppiert; Nachträge werden entsprechend eingeordnet. Weitere Seiten sind erreichbar; letzter Eintrag aktualisiert sich bei Rückkehr. |
| AC-007 | REQ-011 | Korrekturen erscheinen in der Historie; Abbrechen einer Löschrückfrage erhält den Eintrag, Bestätigen entfernt ihn. Veraltete Korrekturen melden einen Konflikt. |
| AC-008 | REQ-013 | Export enthält auch Einträge außerhalb der ersten Listenseite und bildet unbekannte Dauer/Stillseite als leere Werte ab. |
| AC-009 | REQ-014 | Nicht angemeldete und nicht freigeschaltete Konten können weder lesen noch schreiben, auch über direkte API-Zugriffe. Julia und Christian können dieselben Einträge verwalten. Selbstfreischaltung ist ausgeschlossen. |
| AC-010 | REQ-015 | Wechsel zur Historie und zurück sowie ein Neuladen erhält den Entwurf; Abmeldung löscht Entwurf und angezeigte private Daten. |

| AC-011 | REQ-017 | Klick auf Start hält den Beginn fest, Ende hält den Endzeitpunkt fest. Speichern ist während einer laufenden Messung gesperrt. Nach Beenden werden beide Zeitpunkte und die berechnete Dauer gespeichert; ein App-Neuladen während der Messung setzt den Beginn nicht zurück. |

## Veröffentlichung und verbleibende Geräteabnahme

- Supabase-Projekt, öffentliche Browser-Konfiguration und beide freigeschalteten Konten sind eingerichtet.
- Repository und GitHub Pages wurden am 12. September 2026 auf ausdrücklichen Wunsch veröffentlicht.
- Anmeldung und Zugriffsregeln wurden geprüft; vollständige PWA-Installationsabnahme auf den tatsächlichen Smartphones bleibt gesondert.

## Namensschreibweise

Am 12. September 2026 ausdrücklich korrigiert: Der Name lautet **Philine**. Organisation und Supabase-Projekt heißen **Philine-Log**. Der bereits mit PH geschriebene App- und Repositoryname **Phililog** bleibt bestehen.

## Kompakte Eingabe und Projektinfo – beauftragt am 12. September 2026

- REQ-018: Angemeldete Ansichten beginnen direkt mit der Navigation, ohne Marken-Kopfbereich oder dekorativen Eingabetitel. Abmelden steht im Footer. Touch-Ziele bleiben mindestens 44 px hoch.
- REQ-019: Eine über den Footer erreichbare Ansicht „Über das Projekt“ beschreibt Phililog als von Christian und Julia für Philine vibe-gecodetes Projekt, mit Liebe in Göttingen entstanden. Der Eingabeentwurf bleibt beim Wechsel erhalten.
- REQ-020: Dezente Aquarellflächen liegen im gesamten Hintergrund; Formularfelder bleiben gut lesbar. Abstände und Stillzeitbereich werden kompakter.
- AC-012: Bei 390 × 844 px sind die normale Still-Eingabe und der Speichern-Knopf ohne Scrollen erreichbar. Bei 320 px Breite entsteht kein horizontaler Überlauf.
- AC-013: Projektinfo öffnen und zurück erhält Art, Menge und laufende Stillzeit; Abmelden bleibt im Footer erreichbar.

## Dauer und Flascheninhalt – beauftragt am 12. September 2026

0 Minuten bedeutet unbekannte Dauer (Datenbank weiterhin NULL); die Checkbox entfällt. Minus endet bei 0, Plus von 0 führt zu 1. Start-/Endmessungen bleiben unverändert. Flaschen enthalten standardmäßig Pre-Nahrung, alternativ Muttermilch. Bestehende Einträge ohne Milchart bleiben nicht angegeben. Milchart erscheint in Historie, Bearbeitung und CSV; beim Stillen ist sie leer. Negative oder gebrochene Minuten bleiben unzulässig.

## Wickeln und Speicherfreude – zweiter beauftragter Commit, 12. September 2026

Dritter Eintragstyp Wickeln mit unabhängig schaltbaren, beschrifteten Toggles für Urin und Stuhl sowie Abhalten erfolgreich. Ohne Inhaltsauswahl ist die Windel trocken; ausgeschaltetes Abhalten bedeutet kein bestätigter Erfolg, nicht zwingend einen Versuch. Zeitpunkt wie bisher jetzt beim Speichern oder manueller Nachtrag. Wickeleinträge haben keine Fütterungsmenge, Stillseite, Dauer oder Milchart. Gemeinsame Historie, Bearbeitung, Löschung, CSV und Duplikatschutz gelten für alle Typen. Neue Einträge tragen die Schaltflächenbeschriftung „io triumphe“. Ein kurzer Aquarell-Konfettieffekt erscheint nur bei bestätigter Speicherung, blockiert keine Eingabe und respektiert reduzierte Bewegung. Fehler, Ansichtswechsel und reine Aktualisierung lösen keinen Effekt aus.

Abnahme: gemischte Historie und CSV, Wickeln bearbeiten, alle Toggle-Kombinationen inklusive trockener Windel; 0-Minuten-Schritte und Muttermilch; drei Arten bei 320/390 px bedienbar; Effekt nur bei Erfolg, bei reduzierter Bewegung aus.

## Zeit seit Mahlzeit und laufende Stillzeit – beauftragt am 12. September 2026

- Neue Speicherung heißt „Io triumphe“ (großes I).
- Bei Stillen und Flasche ersetzt „Letzte Mahlzeit“ den letzten allgemeinen Eintrag. Maßgeblich ist das Ende der neuesten gespeicherten Flaschen- oder Stillmahlzeit, unabhängig von neueren Wickeleinträgen und Historienseiten. Anzeige in Stunden/Minuten, unter einer Minute „gerade eben“. Zukunftseinträge werden als solche benannt. Ohne Mahlzeit erscheint ein verständlicher Leerzustand.
- Nach Stillstart erscheint die laufende Dauer in Minuten/Sekunden, ab einer Stunde zusätzlich Stunden. Berechnung aus dem gespeicherten Startzeitpunkt, auch nach Hintergrund und Neuladen. Stop hält die Anzeige an. Tick aktualisiert nur die Zeitanzeigen und verliert weder Fokus noch Eingaben.
- Wickeln behält den letzten allgemeinen Eintrag. Icons werden als fünf Entwürfe vorgelegt; das installierte App-Icon wird erst nach Auswahl ersetzt.

## Weitere Ereignisse: Wiegen – beauftragt am 12. September 2026

Unter einem dezenten aufklappbaren Bereich „Weitere Ereignisse“ liegt Wiegen. Die drei häufigen Arten bleiben unverändert prominent. Gewicht ist eine positive ganze Grammzahl ohne Vorbelegung; Zeitpunkt jetzt beim Speichern oder manuell wie bei anderen Ereignissen. Wiegen erscheint in der gemeinsamen Historie, kann korrigiert/gelöscht werden und wird in CSV exportiert. Keine Dauer, Milchart, Fütterungsmenge oder Wickelangaben für Wiegen. Gewichte beeinflussen die letzte Mahlzeit nicht. Entwurfserhalt, RLS und Versionsschutz gelten unverändert.

Icon-Auswahl: ursprünglicher großer Aquarell-Klecks aus Entwurf 2 mit großem I und kleinem o. Als SVG, PWA- und Apple-Icon übernehmen; Blüteniteration bleibt nur ein Entwurf.

## Finale Icon-Auswahl – 12. September 2026

Ausdrücklich zur Umsetzung und Veröffentlichung ausgewählt: **Φ 1 · Klar**, erstes Icon der zweiten Zeile der Schriftgalerie. Dieses große weiße Phi ersetzt das Io auf dem unveränderten Aquarell-Klecks als Browser-, PWA- und Apple-Icon.

## Aufgaben einer Person zuordnen – 13. September 2026

Beauftragt: Neue Einträge aller Arten werden automatisch der angemeldeten Person zugeordnet. Historie und letzter Eintrag zeigen Namen sowie eine dezente Aquarellmarkierung: Julia violett, Christian türkis. Bearbeiten erlaubt die nachträgliche Auswahl beider Personen; Ersteller bleibt unverändert. Altbestand ist zunächst nicht zugeordnet, weil Ersteller und ausführende Person verschieden sein können. Zuordnung wird im Entwurf und CSV erhalten; Zugriffsschutz und Versionskonflikte gelten auch bei Personenwechsel.

## Wartung – 13. September 2026

Ergänzende verbindliche Fehlerfälle und Akzeptanzkriterien: [freigegebenes Wartungspaket](../004-wartung/spec.md).
