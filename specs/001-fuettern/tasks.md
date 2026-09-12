# Aufgaben – 001 Fütterung erfassen und Logbuch ansehen

Bezüge: [Spezifikation](spec.md) · [Technischer Plan](plan.md)

## Aktueller Stand

- Fortschritt: Erste Version implementiert und lokal mit echter Supabase-Instanz geprüft. Fachliche Antworten übernommen: Stillen als Startauswahl, 15/30 Minuten, unbekannte Dauer, Stillbeginn/-ende per Klick.
- Offen: Produktives Supabase-Free-Projekt mit zwei Konten, erstes Pages-Deployment und Abnahme auf den echten Smartphones. Keine offenen fachlichen Blocker für den lokalen MVP.
- Veröffentlichung: Quellcode gepusht; Repository auf ausdrücklichen Nutzerwunsch öffentlich und GitHub Pages aktiviert. Der Workflow wartet auf die produktiven Supabase-Variablen.
- Nächster Schritt: Supabase-Free-Projekt anhand von `docs/setup.md` einrichten.

## Aufgaben

- [x] Angenommene Ergänzungen und Akzeptanzkriterien festhalten.
- [x] Technischen Plan und Validierungsstrategie erstellen.
- [x] T-001: Eingabe, Historie, letzter Eintrag, Korrektur und Löschen (AC-001 bis AC-007).
- [x] T-002: Auth, SQL-Migration, RLS und sichere Wiederholung (AC-005, AC-007, AC-009).
- [x] T-003: CSV-Export, Entwurfserhalt und PWA-Manifest/Symbole (AC-008, AC-010).
- [x] T-004: Automatisierte Prüfungen und Browserprüfung dokumentieren.
- [x] T-005: Einrichtung und manuellen Pages-Workflow vorbereiten.
- [x] T-006: Stillbeginn/-ende per Klick mit Fortsetzung nach Neuladen (AC-011).
- [ ] T-007: Produktive Einrichtung, Smartphone-Installation und gemeinsame Abnahme.

## Prüfnachweise vom 12. September 2026

| Prüfung | Ergebnis |
| --- | --- |
| `npm run check` | 12 Fachlogiktests bestanden, TypeScript und Produktionsbuild erfolgreich. AC-002 bis AC-005, AC-008, AC-011. |
| `node scripts/test-local-supabase.mjs` | Echte lokale Supabase-API: Julia/Christian erlaubt; anonym/unbekannt gesperrt; öffentliche Registrierung und Selbstfreischaltung abgewiesen; Constraints, gemeinsame Korrektur/Löschung, Versionskonflikte und tatsächliche Wiederholung derselben UUID geprüft. Export über 505 zusätzliche Einträge vollständig. Testeinträge wieder entfernt. AC-005 bis AC-009. |
| `npm run build -- --base=/phililog/` | Pages-Unterpfad erfolgreich gebaut. |
| Browser-Harness, isolierter Chromium, `http://127.0.0.1:5173/` | Anmeldung, Startansicht, Stillseite, Start/Ende, Neuladen während laufendem Stillen, Speicherung, Historie, Entwurf bei Ansichtswechsel, Offline-Fehler und Wiederholung, Mengen-Korrektur, Abbrechen/Bestätigen des Löschdialogs, CSV-Download und Entwurfsbereinigung bei Abmeldung geprüft. AC-001, AC-005 bis AC-011. |
| Layout | 320, 390 und 1280 px ohne horizontalen Überlauf; Smartphone- und Desktop-Screenshots visuell geprüft. |

Die Browserprüfungen verwenden ausschließlich synthetische Konten und echte lokale Datenbankzugriffe, keine gemockten Feature-Daten. Die Netzverbindung wurde für den Fehlerfall per Browser-Emulation ausgeschaltet. Die erste Korrektur-Testeingabe wurde nach einer fehlerhaften Tastaturauswahl wiederholt und auf den tatsächlich eingegebenen Wert geprüft.

Lokale Screenshot-Artefakte: `/private/tmp/phililog-screenshots/eingabe.png`, `/private/tmp/phililog-screenshots/historie.png`, `/private/tmp/phililog-screenshots/desktop.png`.

Nicht behauptet: produktive Supabase-Prüfung, tatsächliche iOS-/Android-Installation, Ende-zu-Ende-Verschlüsselung oder vollständige Offline-Synchronisation. Die laufende Stillmessung ist bis zum Speichern nur auf dem eigenen Gerät vorhanden. Feature bleibt bis zur Einrichtung und Abnahme in Umsetzung.
