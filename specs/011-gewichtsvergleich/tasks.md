# Aufgaben und Prüfnachweise

- [x] Repository, Vorgaben und WHO-Referenz prüfen; Auftrag in Spezifikation und Plan dokumentieren.
- [x] Filter, Kartenansicht, Referenzdaten und Profil-Einstellung implementieren.
- [x] Fach-/DOM-/API-Tests, `npm run check`, lokale Supabase und UI mit erfundenen Daten prüfen.
- [x] Migration und privates Geburtsdatum produktiv anwenden; Bestanderhalt bestätigen.
- [x] Commit, Push, CI und Pages-Veröffentlichung prüfen; Dokumentation abschließen.

## Nachweise vom 04.10.2026

- `npm run check`: 96 Fach-/DOM-Tests, TypeScript und Produktionsbuild bestanden. Filterwechsel mit verspäteter Antwort, Pagination, Bearbeitung, Geburtstagskonflikt, Entwurfserhalt und Abmeldung geprüft (AC-001–007).
- `node scripts/test-local-supabase.mjs`: bestanden mit ausschließlich erfundenen Konten/Daten. 35 ältere Gewichte bei gleichen Zeitpunkten hinter neuerer gemischter Historie vollständig ohne Überlappung paginiert; Profil-Familienzugriff, anonyme/Fremdzugriffe, Datumvalidierung und Versionskonflikte geprüft.
- `node scripts/test-restore.mjs`: alle 20 Migrationen sowie vollständiger synthetischer Dump/Restore bestanden.
- Echte lokale UI unter `http://127.0.0.1:5173/` im Codex In-app Browser, synthetisches Testkonto, keine API-Mocks: Gewichtsansicht, Alter 0/7/14 Tage, Punkte beim Median/unter P10/über P90, Logbuchfilter und Einstellungen geprüft. 320 × 844 und 390 × 844 ohne horizontalen Überlauf; Speichern der normalen Still-Eingabe bei 390 px innerhalb des Viewports. Visueller Nachweis außerhalb des Repositories: `/private/tmp/phililog-weight-screenshots/gewicht-390.jpg` (erfundene Daten). Physische Smartphone-Abnahme nicht ausgeführt.
- WHO-Referenz: 1857 tägliche Zeilen, Grammwerte P10/P50/P90, Quelle und XLSX-SHA-256 in `src/data/who-weight-girls.ts`; Extraktion reproduzierbar über `scripts/extract-who-weight.py`. Alter folgt Berliner Kalendertagen inklusive Sommerzeit; ungültige/fehlende, vorgeburtliche, zukünftige und zu alte Messungen erhalten keine erfundene Referenz (AC-003/004/006).
- Produktion: Migration 020 mit SHA-256 `b0e6efff6a10bda6c43742d02273f7ad007646f515a960ca7299cac4fdf22f34` angewandt; Logbuch unverändert, bisherige Einstellungen erhalten, privates Geburtsdatum gesetzt, RLS/Policies unverändert. Sicherung und Ausführungsnachweis im privaten Datenbankschema; keine echten Familiendaten exportiert (AC-005/008).

- Feature-Commit `302c95c7e82c1584dd941fd82d5e441d7b949cdd` auf main gepusht. [Check 37221997043](https://github.com/sichgeis/phililog/actions/runs/37221997043) erfolgreich einschließlich App-, Datenbank- und Restore-Job.
- [Publish GitHub Pages 37222044548](https://github.com/sichgeis/phililog/actions/runs/37222044548) aus genau diesem Commit erfolgreich. Produktionsseite, JavaScript mit Gewichtsansicht/Filter/Profil sowie Karten-CSS jeweils HTTP 200 geprüft. Anonyme REST-Zugriffe auf `family_settings.birth_date` und Logbuch jeweils HTTP 401 (AC-008).
- Eigene drei UI-Testmessungen entfernt, vorheriges lokales Profil wiederhergestellt, temporäre Testansicht und eigener Vite-Server beendet. Bestehende lokale Supabase-Instanz weiterlaufen gelassen.

Alle beauftragten Aufgaben abgeschlossen. Physische Smartphone-/PWA-Abnahme bleibt die bestehende separate Geräteabnahme aus Feature 001; keine medizinische Bewertung oder Frühgeburtskorrektur enthalten.


## Crosscheck Deutschland und Niedersachsen – 04.10.2026

Auf ergänzenden Nutzerauftrag deutsche und niedersächsische Referenzen mit der implementierten WHO-Referenz verglichen. Keine Änderung von Produktverhalten, Referenzdaten oder privaten Profilwerten; Recherche und Korrektur der früheren KiGGS-Begründung.

- [RKI, Referenzperzentile, zweite erweiterte Ausgabe](https://edoc.rki.de/bitstream/handle/176904/3254/28jWMa04ZjppM.pdf?sequence=), Kapitel Körpergewicht, gedruckte Seiten 21–22 und 31: KiGGS 2003–2006 plus Geburtsdaten 1995–2000; Werte für ein und zwei Monate interpoliert. Beide Datensätze enthalten Werte ab Geburt. Die deutschen Werte bilden keine taggenau beobachtete Säuglingsstichprobe in den ersten Wochen ab.
- Medianvergleich für Mädchen, in Gramm, WHO auf 10 g gerundet. WHO-Werte aus der implementierten täglichen Originaltabelle bei `Monate × 30,4375` Tagen, bei gebrochenem Tag ausschließlich für diesen Tabellenvergleich linear interpoliert; App verwendet unverändert ganze Berliner Alterstage. RKI-Werte aus der veröffentlichten Tabelle.

| Alter | WHO P50 | Deutschland: KiGGS/Perinatal P50 |
| --- | ---: | ---: |
| Geburt | 3230 | 3390 |
| 1 Monat | 4190 | 4200 |
| 2 Monate | 5130 | 5000 |
| 3 Monate | 5850 | 5610 |
| 4 Monate | 6420 | 6250 |
| 6 Monate | 7300 | 7300 |
| 12 Monate | 8950 | 9340 |

- Beispiel Banden bei zwei Monaten: WHO P10/P90 ca. 4340/6050 g, deutsche Referenz 4240/5840 g. Der Unterschied betrifft also auch die Darstellung eines identischen Messwerts, nicht allein den Median. Es gibt keine über alle Alter gleichbleibende regionale Gewichtskorrektur.
- [WHO-Hintergrund zur MGRS](https://www.who.int/news/item/27-04-2006-world-health-organization-releases-new-child-growth-standards): ausgewählte günstige Wachstumsbedingungen und Stillen als Norm, sechs Länder einschließlich Norwegen. Keine unselektierte Durchschnittsverteilung sämtlicher Kinder der Welt. Unterschied zu deutschen Daten hängt auch mit Studienauswahl und Ernährung zusammen; eine alleinige regionale Ursache lässt sich daraus nicht ableiten.
- Für Niedersachsen keine öffentlich dokumentierte, etablierte eigene Gewichts-für-Alter-Referenz für Mädchen im Säuglingsalter gefunden. Das [NLGA-Geburtsgewichtsmonitoring](https://www.apps.nlga.niedersachsen.de/05_gue/gesundheitsindikatoren2/indikator/3.50) betrifft Geburtsgewichte, die [Schuleingangsuntersuchungen](https://www.nlga.niedersachsen.de/seu/seu-200115.html) Schulkinder. Beides ersetzt keine Säuglings-Wachstumsreferenz. Suchergebnis, kein Nachweis der Nichtexistenz regionaler Studien.
- Einordnung: WHO ist ein vertretbarer Wachstumsstandard. Für die ausdrückliche Frage nach der Verteilung unter deutschen Mädchen passt KiGGS als zusätzliche, klar getrennt beschriftete Referenz. Kein automatischer Wechsel und keine Mischung beider Datensätze im bestehenden Vergleich.

## Erweiterung: Referenzumschaltung

- [x] Nutzerauftrag und Original-RKI-Tabelle in Spezifikation und Plan festhalten.
- [x] Auswahl und KiGGS-Referenz implementieren und prüfen.
- [ ] Autorisierten Rollout und Produktionsnachweis abschließen.

Nachweise AC-009–011: `npm run check` mit 100 erfolgreichen Tests, TypeScript und Produktionsbuild. Original-PDF gedruckte Seite 31 visuell geprüft; Extraktion reproduzierbar über `scripts/extract-kiggs-weight.py`, SHA-256 und Quelle in Referenzdatei. Stützwerte, Zwischenwerte, Bereich, abweichende Einordnung und Speicherausfälle geprüft. DOM: kein zusätzlicher API-Aufruf/Profil-Schreibvorgang beim Wechsel, 31 geladene Karten, Fokus, Erklärung, Entwurf und Quellenwechsel erhalten. Gemerkte sowie ungültige Präferenz beim Start geprüft.

Echte lokale Browseransicht mit synthetischem Konto und drei eigenen erfundenen Messungen bei 320/390 × 844 ohne horizontalen Überlauf geprüft. KiGGS-Auswahl nach tatsächlichem Neuladen erhalten; abweichende Einordnung am Geburtstag sichtbar. Screenshot `/private/tmp/phililog-weight-screenshots/kiggs-390.jpg`. Eigene Messungen entfernt, vorheriges lokales Geburtsdatum wiederhergestellt, Testtab und eigener Server beendet. Keine Datenbank-/Zugriffsschutzänderungen; keine zusätzliche Migration notwendig. Physische Geräteabnahme bleibt offen wie bisher.

Nächster Schritt: Geprüfte Version veröffentlichen und Produktion verifizieren.
