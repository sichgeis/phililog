# 001 – Fütterung erfassen und Logbuch ansehen

## Abstimmungsstand

- Stand: MVP-Umsetzung am 12. September 2026 ausdrücklich beauftragt.
- Zustimmung: Der Auftraggeber hat die Ergänzungsvorschläge angenommen und eine erste Version angefordert.
- Antworten des Auftraggebers: Stillen als Startauswahl; 15/30 Minuten und „nicht bekannt“ angenommen. Beim Stillen sollen Beginn und Ende durch einfache Klicks dokumentiert werden. Noch kein Supabase-Projekt vorhanden; Einrichtung vorbereiten.

## Ziel und Grenzen

Julia und Christian dokumentieren gemeinsam Fütterungen auf ihren Smartphones mit wenigen Eingaben. Es gibt eine Web-App mit zwei Hauptansichten. Architektur und Budget von 0 € stehen im [README](../../README.md#architektur-und-datenhaltung).

Nicht enthalten: Urin/Stuhl, Erinnerungstimer, Diagramme, Erinnerungen, dauerhafte persönliche Einstellungen und vollständige Offline-Synchronisation. Fehlende Verbindung darf nicht als erfolgreiche Speicherung erscheinen.

## Anforderungen

| ID | Anforderung |
| --- | --- |
| REQ-001 | Nach Anmeldung öffnet sich direkt die Eingabe. Die Historie ist separat erreichbar. |
| REQ-002 | Fütterungsart: Flasche oder Stillen. Dauer wird je Art vorbelegt und kann für diesen Eintrag geändert werden. Änderungen werden nicht als neue Standards gespeichert. |
| REQ-003 | Startwerte: Stillen, 15 Minuten für Flasche, 30 Minuten für Stillen. Dauer optional über „nicht bekannt“. Positive ganze Minuten, keine medizinisch begründete Obergrenze. |
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

## Noch zu klären / Veröffentlichung

- Supabase-Projekt und öffentliche Browser-Konfiguration bereitstellen, zwei Konten anlegen und freischalten.
- Kostenloses GitHub-Pages-Hosting benötigt bei GitHub Free ein öffentliches Quellcode-Repository. Das derzeit private Repository wird nicht ohne ausdrücklichen Auftrag öffentlich gestellt.
- Produktive Anmeldung, Zugriffsregeln und PWA-Verhalten auf den tatsächlichen Smartphones vor Veröffentlichung prüfen.

## Namensschreibweise

Am 12. September 2026 ausdrücklich korrigiert: Der Name lautet **Philine**. Organisation und Supabase-Projekt heißen **Philine-Log**. Der bereits mit PH geschriebene App- und Repositoryname **Phililog** bleibt bestehen.

## Kompakte Eingabe und Projektinfo – beauftragt am 12. September 2026

- REQ-018: Angemeldete Ansichten beginnen direkt mit der Navigation, ohne Marken-Kopfbereich oder dekorativen Eingabetitel. Abmelden steht im Footer. Touch-Ziele bleiben mindestens 44 px hoch.
- REQ-019: Eine über den Footer erreichbare Ansicht „Über das Projekt“ beschreibt Phililog als von Christian und Julia für Philine vibe-gecodetes Projekt, mit Liebe in Göttingen entstanden. Der Eingabeentwurf bleibt beim Wechsel erhalten.
- REQ-020: Dezente Aquarellflächen liegen im gesamten Hintergrund; Formularfelder bleiben gut lesbar. Abstände und Stillzeitbereich werden kompakter.
- AC-012: Bei 390 × 844 px sind die normale Still-Eingabe und der Speichern-Knopf ohne Scrollen erreichbar. Bei 320 px Breite entsteht kein horizontaler Überlauf.
- AC-013: Projektinfo öffnen und zurück erhält Art, Menge und laufende Stillzeit; Abmelden bleibt im Footer erreichbar.
