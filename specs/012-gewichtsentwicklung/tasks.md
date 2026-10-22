# Aufgaben und Nachweise

- [x] Auftrag, fachlichen Umfang und Referenzentscheidung dokumentieren.
- [x] WHO-Originaldaten reproduzierbar extrahieren und Fachlogik implementieren (AC-001–005).
- [x] Profil, optionale Länge und Verlauf mit Intervallwahl implementieren (AC-001–007).
- [x] Fach-/DOM-/lokale Supabase-/Restore- und mobile Browserprüfung durchführen (AC-001–008).
- [x] Produktive Migration, Commit/Push/CI und Veröffentlichung nachweisen (AC-008).

## Prüfung am [Betriebsdatum privat]

- `npm run check`: 112 Tests bestanden, TypeScript und Produktionsbuild erfolgreich.
- `node scripts/test-local-supabase.mjs`: erfolgreich gegen lokale Docker-Supabase. Familien-/Fremd-/Anonymrechte, Grenzen, Nullable-Felder, Versionskonflikte sowie vollständige gefilterte Historie mit 512 erfundenen Gewichtseinträgen über die 500er-Seitengrenze geprüft.
- `node scripts/test-restore.mjs`: synthetischer vollständiger Restore über alle 21 Migrationen erfolgreich, einschließlich neuer Profil- und Längenfelder.
- Echter Browser mit ausschließlich erfundenen Daten bei 320×760 und 390×844: WHO/KiGGS-Umschaltung, Diagramme, Intervallwechsel und zugängliche Messwerttabelle geprüft. Kein Dokumentüberlauf; breite Tabelle besitzt eigenen horizontalen Scrollbereich. Screenshot außerhalb des Repositories: `/tmp/phililog-growth-screenshots/zunahme-390.jpg`.
- Fachtests prüfen WHO-LMS-Stützwerte und Extremwerte, veröffentlichte Zunahmeintervalle/-gruppen, fehlende Perzentilen, Tages-/Monatsgrenzen, gleiche Messzeiten und Länge. DOM-Tests prüfen vollständige Historie bei unabhängiger Kartenpagination, Fehler/Abmeldung, Referenzwahl, Entwürfe und Profilkonflikte.
- Keine echten Baby-/Familiendaten in Quellcode, Tests oder Nachweisen. Kein ET gespeichert und keine persönliche Sollkurve/Diagnose abgeleitet.

## Produktive Migration

Migration 021 am [Betriebsdatum privat] transaktional angewandt. SHA-256: `7af0c1752b3ac21f7b93537decb15c7fce6e86c70fd646e7656471f8ca8abbb6`. Geschützte interne Sicherung beider betroffener Tabellen, exakter Bestandsvergleich, unveränderte Policies/RLS und keine Browserrechte auf Sicherungen bestätigt. Receipt ausschließlich in eine separat dokumentierte private Sicherung bzw. Ausführungsquittung; keine produktiven Testeinträge oder angenommenen Profilwerte.

## Veröffentlichung und Abschluss

- Implementierungscommit: (historischer Commit), auf `main` gepusht.
- GitHub-Prüfung (historischer Prüfnachweis): erfolgreich, einschließlich App, isolierter Datenbank und Restore.
- GitHub-Pages-Veröffentlichung (historischer Prüfnachweis): erfolgreich für denselben Commit.
- Produktions-HTML und tatsächliches Bundle `/phililog/assets/index-D-7zI_Ok.js`: HTTP 200; neue Verlauf-/Zunahmeansicht und beide neuen Felder enthalten. Anonyme REST-Zugriffe auf beide betroffenen Tabellen nach Migration weiterhin HTTP 401, ohne Familiendaten zu lesen.
- Eigene temporäre Browsermessungen entfernt, vorheriges lokales Testprofil wiederhergestellt, Testtab geschlossen, Viewport zurückgesetzt und eigener Entwicklungsserver beendet.

Alle AC-001–008 erfüllt; veröffentlicht am [Betriebsdatum privat]. Grenzen: WHO-Zunahmevergleiche ausschließlich bei vorhandenen Tabellenintervallen; frühe Geburtsgewichtsgruppen benötigen das optionale tatsächliche Geburtsgewicht. Ohne konkrete Angabe bleibt dieses Feld leer. Smartphone-Viewportprüfung ersetzt keine physische PWA-/Geräteabnahme (separat Feature 001).

## Änderung Standardzeitraum am [Betriebsdatum privat]

- [x] Nutzerauftrag in Spezifikation und Plan übernommen.
- [x] Standard erste bis letzte geeignete Messung implementiert; manuelle Auswahl innerhalb der Ansicht erhalten.
- [x] `npm run check`: 112 Tests bestanden, TypeScript und Produktionsbuild erfolgreich. Fachtest prüft erste/letzte Messung sowie leere Historie, Einzelmessung und gleiche Zeitpunkte. DOM-Test prüft vollständige Historie trotz Kartenpagination, manuelle Auswahl mit Aktualisierung/Referenzwechsel, erneutes Öffnen und neue letzte Messung.
- [x] Implementierungscommit (historischer Commit) auf `main` hochgeladen. CI 39851480913 (historischer Prüfnachweis) erfolgreich: App sowie isolierte Supabase-/Restore-Prüfungen.
- [x] GitHub Pages 39851491854 (historischer Prüfnachweis) erfolgreich für denselben Commit. Produktions-HTML und `/phililog/assets/index-BmN99dZL.js` liefern HTTP 200; erste/früheste bis letzte Messung im ausgelieferten Bundle bestätigt.

Keine Datenbank- oder Zugriffsänderung; keine Migration erforderlich. Ausschließlich erfundene Testdaten verwendet.

Änderung abgeschlossen und am [Betriebsdatum privat] veröffentlicht. Keine offenen Aufgaben für diesen Änderungsauftrag.

## Erneute Prüfung der Altersgrundlage – [Betriebsdatum privat]

Auftrag: Altersgrundlage aller gewichtsbezogenen Auswertungen bei Geburt nach dem errechneten Termin prüfen. Private Schwangerschafts-/Termindaten werden nicht ins Repository übernommen.

- [x] Rechenpfade für WHO-/KiGGS-Karten, Perzentilen, Gewichtskurve, WHO-z-Score/-Änderung, Gramm/g pro Tag, WHO-Zunahmeintervalle und Gewicht zur Länge geprüft. Alle altersbezogenen bestehenden Referenzen verwenden das tatsächliche Geburtsdatum; Gramm/g pro Tag verwenden die exakten Messzeitpunkte; Gewicht zur Länge die erfasste Länge mit Altersgrenze am zweiten tatsächlichen Geburtstag.
- [x] Quellen geprüft: [AAP Term Infant Growth Tools](https://www.aap.org/en/patient-care/newborn-infant-and-early-childhood-nutrition/newborn-and-infant-nutrition-assessment-tools/term-infant-growth-tools/) beschreibt korrigiertes Alter bei Frühgeburt; [WHO-Glossar](https://www.ncbi.nlm.nih.gov/sites/books/NBK586708/) definiert dieselbe Korrektur. [RCPCH](https://growth.rcpch.ac.uk/clinician/date-age-calculations/) berücksichtigt im eigenen digitalen Verfahren auch termingerechte Geburten; dies ist eine zusätzliche Methode mit eigener Referenzlogik. Eine pauschale Verschiebung der vorhandenen WHO-/KiGGS-Auswertung ist daraus nicht abzuleiten.
- [x] Zusätzliche Konsistenztests für Karten/Verlauf/z-Score auf mehreren synthetischen Altersstufen, identische WHO-LMS-Mediane, tatsächlichen 28-Tage-Zeitraum samt WHO-Zunahmetabelle und längenbezogenen Vergleich einschließlich zweitem Geburtstag. `npm run check`: 118 Tests erfolgreich, TypeScript und Produktionsbuild erfolgreich.
- [x] Methodenwahl geklärt: separate gestationsbezogene Geburtskarte und spätere Altersreferenz, einschließlich getrennter Anfangsphase.


## Umsetzung Geburtseinordnung

- [x] Spezifikation und Plan anhand ausdrücklicher Zustimmung aktualisiert.
- [x] 70 taggenaue INTERGROWTH-21st-Zeilen für Mädchen reproduzierbar extrahiert; Geburtseinordnung, Anfangsphase und geschütztes Profilfeld implementiert (AC-009–012).
- [x] `npm run check`: 122 Tests, TypeScript und Produktionsbuild erfolgreich. Fachtests prüfen sämtliche sieben Perzentilstützpunkte aller 70 Geburtszeilen, Interpolation/Grenzen, vollständige Schwangerschaftsaltereingabe, tatsächliche Geburtgewichtsänderung und Ausschluss früher z-Änderungen. DOM: Geburtkarte bleibt bei WHO-/KiGGS-Wechsel gleich, frühe Karten ohne Altersperzentilen, drei Rohpunkte/ein später z-Punkt, Profilvalidierung/-konflikt und Logout.
- [x] `node scripts/test-local-supabase.mjs`: erfolgreich gegen lokale Docker-Supabase; neues Profilfeld mit Familien-/Fremd-/Anonymrechten, Wertebereich, Versionskonflikt und Erhalt beim Schreiben alter Clients geprüft. `node scripts/test-restore.mjs`: alle 22 Migrationen und vollständiger synthetischer Restore erfolgreich.
- [x] Echter Codex-In-app-Browser unter `http://127.0.0.1:5173/`, reale lokale API, synthetisches Konto/Profil und vier eigene erfundene Messungen: Geburtskarte, Anfangsphase, Roh-/z-Kurve, Quellenwechsel und Profileingaben geprüft. Bei 320×844 und 390×844 kein Dokumentüberlauf; Tastatur erreicht Speichern nach dem Tagefeld. Screenshots außerhalb des Repositorys: `/private/tmp/phililog-birth-screenshots/geburtskarte-390.png`, `/private/tmp/phililog-birth-screenshots/verlauf-320.png`. Keine API-Mocks. Eigene Messungen entfernt, vorheriges lokales Profil wiederhergestellt, Viewport zurückgesetzt, eigener Testtab und Server beendet.
- [x] Migration 022 produktiv transaktional angewandt; SHA-256 `3c5eca006e9f7c43058bd88f250200a5a7cd64daac75a8d00b463f9ebcc2abb5`. Private Sicherung eine separat dokumentierte private Sicherung bzw. Ausführungsquittung, Receipt eine separat dokumentierte private Sicherung bzw. Ausführungsquittung; Logbuchbestand und bestehende Profilfelder unverändert, Policies/RLS unverändert, Sicherung für Browserrollen gesperrt. Mitgeteiltes Schwangerschaftsalter ausschließlich geschützt initialisiert. Das Geburtsgewicht ist noch unbekannt; nicht aus der ältesten Messung angenommen.
- [x] Implementierungscommit (historischer Commit) auf `main` gepusht. Check 39855590364 (historischer Prüfnachweis) vollständig erfolgreich einschließlich isolierter Supabase-/Restore-Prüfungen.
- [x] Pages 39855589039 (historischer Prüfnachweis) erfolgreich für denselben Commit. Produktions-HTML und `/phililog/assets/index-U69WDYkw.js` HTTP 200; Geburtskarte, neues Profilfeld und getrennte Anfangsphase im ausgelieferten Bundle bestätigt. Anonyme REST-Zugriffe auf Profil (einschließlich neuem Feld) und Logbuch weiterhin HTTP 401.

Funktion am [Betriebsdatum privat] abgeschlossen und veröffentlicht. Einschränkung: Im produktiven Profil fehlt das ausdrücklich bestätigte Geburtsgewicht; die neue Karte zeigt dafür die Eingabeaufforderung. Mitgeteiltes Schwangerschaftsalter ist bereits hinterlegt. Physische Smartphone-/PWA-Abnahme bleibt separat Feature 001.

Nächster Schritt: Nach Bestätigung des Geburtsgewichts dieses ausschließlich im geschützten Profil ergänzen.
