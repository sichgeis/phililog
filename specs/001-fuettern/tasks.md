# Aufgaben – 001 Fütterung erfassen und Logbuch ansehen

Bezüge: [Spezifikation](spec.md) · [Technischer Plan](plan.md)

## Aktueller Stand

- Fortschritt: Erste Version implementiert und lokal mit echter Supabase-Instanz geprüft. Fachliche Antworten übernommen: Stillen als Startauswahl, 15/30 Minuten, unbekannte Dauer, Stillbeginn/-ende per Klick.
- Offen: Abnahme auf den echten Smartphones. Supabase Free und Pages sind produktiv eingerichtet. Keine offenen fachlichen Blocker für den lokalen MVP.
- Veröffentlichung: Quellcode gepusht; Repository auf ausdrücklichen Nutzerwunsch öffentlich und GitHub Pages aktiviert. Workflow 34689824057 erfolgreich; App unter https://sichgeis.github.io/phililog/.
- Nächster Schritt: App mit beiden Eltern auf den echten Smartphones öffnen, zum Home-Bildschirm hinzufügen und gemeinsam abnehmen.

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

Nicht behauptet: tatsächliche iOS-/Android-Installation, Ende-zu-Ende-Verschlüsselung oder vollständige Offline-Synchronisation. Die laufende Stillmessung ist bis zum Speichern nur auf dem eigenen Gerät vorhanden. Feature bleibt bis zur Smartphone-Abnahme in Umsetzung.

## Produktive Einrichtung vom 12. September 2026

- Eigene Organisation Philine-Log im Free-Tarif, Projekt `aiyjwwbdfjtflehtvedt`, Region Europa. Bestehende Organisation Masch-Tech musste nicht gelöscht werden.
- Migration erfolgreich ausgeführt; genau Julia und Christian in der privaten Mitgliedschaftstabelle. Anmeldung und Mitgliedschaft mit beiden Konten geprüft; anonymer Datenzugriff abgewiesen.
- Ein synthetischer Produktionseintrag: Erstellen, gemeinsames Lesen, Korrektur, Versionskonflikt und Löschen erfolgreich. Testeintrag vollständig entfernt. Keine echten Familiendaten für Tests verwendet.
- Öffentliche Registrierung und anonyme Anmeldung im Dashboard nach erneutem Laden nachweislich ausgeschaltet. Site URL auf die Pages-Adresse gesetzt. Nur Publishable-Key und Projekt-URL in GitHub-Variablen.
- GitHub-Workflow: zwölf Tests, Build und Deployment erfolgreich. Produktive Browser-Anmeldung und Sitzungserhalt nach Neuladen geprüft. Aquarell-Layout bei 390 px visuell geprüft, kein horizontaler Überlauf.
- Persönliche Zugangsdaten liegen nur in einer ignorierten lokalen Datei mit Dateirechten 0600; keine Zugangsdaten im Repository.

## Namenskorrektur vom 12. September 2026

Auf ausdrücklichen Wunsch Schreibweise **Philine** in Dokumentation, Supabase-Anzeigenamen und lokaler Zugangsdaten-Datei korrigiert. App und Repository heißen weiterhin Phililog. `npm run check`: zwölf Tests und Produktionsbuild erfolgreich. Der zuvor erstellte E-Mail-Entwurf ist nicht mehr im Posteo-Entwurfsordner vorhanden und konnte nicht nachträglich geändert werden.

## Kompakte Oberfläche – 12. September 2026

- Nutzer meldet erfolgreichen ersten Smartphone-Smoke-Test. Daraufhin REQ-018 bis REQ-020 umgesetzt: Kopfbereich und dekorative Eingabeüberschrift entfernt, Abmelden im Footer, Projektinfo mit Philine und Göttingen, kompaktere Abstände und seitenweiter Aquarellhintergrund.
- `npm run check`: zwölf Tests, TypeScript und Build erfolgreich. Keine Datenbank- oder Berechtigungsänderung.
- Browser-Harness mit echter lokaler Supabase, synthetischem Konto und vorhandenen synthetischen Testeinträgen: bei 390 × 844 px endet der Speichern-Knopf auf Höhe 672 px; visuell geprüft. Bei 320 px nach Neuladen kein horizontaler Überlauf. Projektinfo-Text geprüft; laufende Stillzeit bleibt bei Wechsel zur Projektinfo und zurück sowie Neuladen erhalten. Start und Ende bedienbar. Keine Produktionseinträge verändert.

## Dauer und Milchart – 12. September 2026

Erster separater Commit: Checkbox durch 0 Minuten ersetzt, Milchart mit Pre als Startwert und Muttermilch als Alternative. Migration erhält Altbestand ohne erfundene Milchart. 13 Fachlogiktests und Build erfolgreich.

## Wickeln und io triumphe – 12. September 2026

Zweiter separater Commit: Wickeln mit unabhängigen Toggles, gemischter Historie/Bearbeitung/CSV und Aquarell-Konfetti nach bestätigter Speicherung. 14 Fachlogiktests und Build erfolgreich. Lokale Supabase-Prüfungen einschließlich Milchart, Wickel-Constraints, Fremdzugriff, gemeinsamer Korrektur/Löschung, Duplikatschutz und Export über 505 Einträge erfolgreich. Browser mit synthetischen Daten: Wickeln inklusive Urin/Stuhl/Abhalten erfolgreich gespeichert; 390 px visuell geprüft und 320 px ohne horizontalen Überlauf. Dauer: Minus von 1 nach 0, weiteres Minus bleibt 0, Plus führt zu 1; Pre vorbelegt. Ein Konfettieffekt bei Erfolg, kein Effekt bei ungültiger Menge und kein Effekt bei reduzierter Bewegung.

Beide additive Migrationen 002 und 003 in einer Transaktion im produktiven Supabase-Projekt erfolgreich ausgeführt; keine Produktionseinträge geändert.

## Zeitangaben und Icon-Vorschläge – 12. September 2026

„Io triumphe“, letzte echte Mahlzeit bei beiden Fütterungsarten und sekündliche Stilldauer umgesetzt. 15 Fachlogiktests und Produktionsbuild erfolgreich. Lokale Supabase-Prüfung: auch bei 35 neueren Wickeleinträgen wird die Mahlzeit außerhalb der ersten Historienseite gefunden. Browserprüfung mit synthetischem Konto bei 390 px: Timer zählt 00 → 02 Sekunden, übersteht Neuladen und bleibt nach Stop konstant; keine horizontalen Überläufe. Keine Produktionseinträge verändert. Fünf eigene SVG-Icon-Vorschläge unter `docs/icon-proposals/index.html`; aktuelles App-Icon bleibt bis zur Auswahl bestehen.

## Wiegen und ausgewähltes Io-Icon – 12. September 2026

- Dezent aufklappbarer Bereich „Weitere Ereignisse“ mit Wiegen, Gewicht in ganzen Gramm, Zeitpunkt, Entwurfserhalt sowie gemeinsamer Historie, Bearbeitung, Löschung und CSV umgesetzt. Letzte Mahlzeit bleibt auf Stillen/Flasche beschränkt.
- `npm run check`: 16 Fachlogiktests, TypeScript und Produktionsbuild erfolgreich. Lokale Supabase-Prüfung einschließlich Gewichtskonstraints, Fremdzugriff, gemeinsamer Korrektur/Löschung und Export über 505 Einträge erfolgreich.
- Browser-Harness mit synthetischem Konto und lokaler Supabase: Weitere Ereignisse öffnen, Wiegen wählen, 3.500 g speichern und in der Historie anzeigen erfolgreich. 390 px ohne horizontalen Überlauf und visuell geprüft; Screenshot `/private/tmp/phililog-weight.png`.
- Migration 004 in einer Transaktion im produktiven Supabase-SQL-Editor erfolgreich ausgeführt („Success. No rows returned“). Keine Produktionseinträge verändert.
- Gewählter großer Aquarell-Klecks mit weißem **Io** als SVG, PWA-PNGs und Apple-Icon übernommen und visuell geprüft. Tatsächliche Aktualisierung bereits installierter Smartphone-Icons bleibt geräteabhängig.

## Weitere Icon-Schriftvarianten – 12. September 2026

13 Entwürfe unter `docs/icon-proposals/lettering/index.html`: drei serifenlose Io-/IO-, fünf Phi- und fünf P-Zeichen auf identischem Aquarell-Klecks. Große Ansicht und 48-/32-px-Vergleich; SVG-Dateien einzeln herunterladbar. Vektoren XML-geprüft, alle 39 Vorschaubilder im Browser erfolgreich geladen, Desktopansicht visuell geprüft und bei 390 px kein horizontaler Überlauf. Übersicht: `docs/icon-proposals/lettering/overview.png`. `npm run check`: 16 Tests und Build erfolgreich. Keine Produkt- oder Datenbankänderung; Auswahl der Variante ist offen.

## Φ 1 als App-Icon – 12. September 2026

Ausgewählte Variante unverändert implementiert. SVG sowie PNGs für Browser/PWA/Apple aktualisiert, mit neuen Phi-URLs. 512-px-Rasterung visuell geprüft; PNG-Maße 192/512/180 px und Manifest-Zieldateien im Build geprüft. `npm run check`: 16 Tests, TypeScript und Build erfolgreich. Veröffentlichung beauftragt. Keine Änderung an Fachlogik oder Datenbank.

## Personenzuordnung – 13. September 2026

Neue Einträge automatisch über geschützte Kontozuordnung; Namensmarkierungen in Lavendel/Türkis, Personenauswahl beim Bearbeiten und CSV-Spalte umgesetzt. Altbestand bleibt nicht zugeordnet. 17 Fachlogiktests und Build erfolgreich. Lokale Supabase-Prüfungen: automatische Zuordnung beider Konten, gemeinsamer Personenwechsel, unveränderter Ersteller, Versionskonflikt, ungültige Person, Fremdzugriff und verbotene INSERT-Zuordnung geprüft; übrige CRUD-/Exportprüfungen erfolgreich. Browser mit synthetischem Konto: Wickeln als Julia speichern, auf Christian ändern und im Logbuch anzeigen; 390 px ohne horizontalen Überlauf, Screenshot `/private/tmp/phililog-person.png` visuell geprüft. Wegen wirkungsloser CDP-Klicks teilweise DOM-Formularaktionen verwendet. Migration 005 produktiv erfolgreich; Spaltenexistenz separat über information_schema bestätigt, keine echten Einträge für Tests verwendet.
