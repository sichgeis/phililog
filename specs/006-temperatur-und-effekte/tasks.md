# Aufgaben und Prüfnachweise

Stand: Lokal abgeschlossen am 14. September 2026. Produktive Migration und Veröffentlichung anschließend ausdrücklich beauftragt.

- [x] Nutzerauftrag als abgestimmten Umfang dokumentiert; technische Entscheidungen im Plan festgehalten.
- [x] AC-001: Oberes Zahnrad entfernt, Footer-Einstellungen erhalten. DOM-Test und Browser bei 390/320 px bestätigt.
- [x] AC-002: Temperatur mit Dezimalkomma/-punkt, Entwurf, Bearbeitung, Logbuch, CSV und Eingabevalidierung umgesetzt. Fachtests prüfen Grenzen, unzulässige Formate, Roundtrip und Wiederholungsvergleich. DOM prüft Menü, Hintergrundaktualisierung, fehlende Dauer/Befinden und Speicherpayload.
- [x] AC-003: DOM-Tests bestätigen 72 Sterne und Regenbogen für Christian bei Flasche/Wickeln, Julias 24 Konfettiteile, keinen Effekt bei Validierungs-/API-Fehlern und ruhige Variante bei reduzierter Bewegung. Browser bestätigt tatsächlichen Effekt nach erfolgreichem lokalem Wickeln; Screenshot visuell geprüft.
- [x] AC-004: `npm run check` erfolgreich: 38 Tests, TypeScript und Produktionsbuild. `node scripts/test-local-supabase.mjs` nach Migration 012 und lokalem Schemacache-Reload erfolgreich. Temperatur-CRUD beider Mitglieder, Versionsfilter, Fremdzugriff, Werte-/Detailconstraints sowie bestehende Zugriffs-, Duplikat- und Exportprüfungen bestanden.
- [x] Browser-Harness gegen lokale App und echte lokale Supabase, synthetisches Konto christian@phililog.test. Menü bei 390 × 844 px ohne überlappende Optionen; Temperatur bei 320 × 740 px ohne horizontalen Überlauf. Dezimalkomma 37,2 über native Eingabe gespeichert; Erfolg bestätigt. Keine API-Mocks in der Browserprüfung; DOM-Tests ersetzen ausschließlich ihre API. Screenshots unter /private/tmp visuell geprüft.
- [x] README und bestehende Spezifikationen aktualisiert. `git diff --check` erfolgreich.

Grenzen: Keine physische Smartphone-/PWA-Abnahme. Keine offene Implementierungsarbeit. Veröffentlichung läuft; nächster Schritt: GitHub-Pages-Deployment und produktive Oberfläche prüfen.


## Produktive Migration und Veröffentlichung

- [x] 14. September 2026: `npm run check` (38 Tests, TypeScript, Build) und lokale Supabase-Prüfungen erneut erfolgreich.
- [x] Produktives Projekt aiyjwwbdfjtflehtvedt geprüft: 011 und 012 fehlten, RLS aktiv. Nur diese beiden Migrationen ausgeführt.
- [x] Eine Transaktion mit kurzen Schreibsperren sicherte Einträge, Einstellungen, Mitgliedschaften und bestehende Ereignisconstraints in `private.*_before_20260914_temperature`. Sämtliche Rechte für public/anon/authenticated entzogen. Keine Familiendaten exportiert. Dies ist eine interne Sicherung der betroffenen Daten, kein vollständiger externer Wiederherstellungssatz.
- [x] Migrationen erfolgreich; bidirektionaler Vergleich aller Originalzeilen bestätigte unveränderte Daten. UUID-Nachweise vollständig. Temperaturrechte, RLS und Schutz von Sicherung/UUID-Tabelle/RPC anschließend geprüft.
- Migration 011 SHA-256: `f0dd23b884a03d3e178e0a353c4e78a2797f58aac1479dd9ceab9c7f49bc3b42`.
- Migration 012 SHA-256: `f3224deefe6d243450539b13cfe9993373bee630efbab63e102e907a3db4cec4`.
