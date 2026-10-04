# Aufgaben und Nachweise

- [x] Auftrag, fachlichen Umfang und Referenzentscheidung dokumentieren.
- [x] WHO-Originaldaten reproduzierbar extrahieren und Fachlogik implementieren (AC-001–005).
- [x] Profil, optionale Länge und Verlauf mit Intervallwahl implementieren (AC-001–007).
- [x] Fach-/DOM-/lokale Supabase-/Restore- und mobile Browserprüfung durchführen (AC-001–008).
- [ ] Produktive Migration, Commit/Push/CI und Veröffentlichung nachweisen (AC-008).

## Prüfung am 04.10.2026

- `npm run check`: 112 Tests bestanden, TypeScript und Produktionsbuild erfolgreich.
- `node scripts/test-local-supabase.mjs`: erfolgreich gegen lokale Docker-Supabase. Familien-/Fremd-/Anonymrechte, Grenzen, Nullable-Felder, Versionskonflikte sowie vollständige gefilterte Historie mit 512 erfundenen Gewichtseinträgen über die 500er-Seitengrenze geprüft.
- `node scripts/test-restore.mjs`: synthetischer vollständiger Restore über alle 21 Migrationen erfolgreich, einschließlich neuer Profil- und Längenfelder.
- Echter Browser mit ausschließlich erfundenen Daten bei 320×760 und 390×844: WHO/KiGGS-Umschaltung, Diagramme, Intervallwechsel und zugängliche Messwerttabelle geprüft. Kein Dokumentüberlauf; breite Tabelle besitzt eigenen horizontalen Scrollbereich. Screenshot außerhalb des Repositories: `/tmp/phililog-growth-screenshots/zunahme-390.jpg`.
- Fachtests prüfen WHO-LMS-Stützwerte und Extremwerte, veröffentlichte Zunahmeintervalle/-gruppen, fehlende Perzentilen, Tages-/Monatsgrenzen, gleiche Messzeiten und Länge. DOM-Tests prüfen vollständige Historie bei unabhängiger Kartenpagination, Fehler/Abmeldung, Referenzwahl, Entwürfe und Profilkonflikte.
- Keine echten Baby-/Familiendaten in Quellcode, Tests oder Nachweisen. Kein ET gespeichert und keine persönliche Sollkurve/Diagnose abgeleitet.

## Produktive Migration

Migration 021 am 04.10.2026 transaktional angewandt. SHA-256: `7af0c1752b3ac21f7b93537decb15c7fce6e86c70fd646e7656471f8ca8abbb6`. Geschützte interne Sicherung beider betroffener Tabellen, exakter Bestandsvergleich, unveränderte Policies/RLS und keine Browserrechte auf Sicherungen bestätigt. Receipt ausschließlich in `private.growth_rollout_receipt`; keine produktiven Testeinträge oder angenommenen Profilwerte.

Nächster Schritt: Geprüften Client committen, pushen und mit erfolgreichen GitHub-Prüfungen veröffentlichen.
