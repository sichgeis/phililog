# Aufgaben und Prüfnachweise

Stand: Implementiert und lokal geprüft; Migration 015 produktiv angewendet. Veröffentlichung läuft.

- [x] AC-001–003: Massage und Babygymnastik unter Mehr, eigene optionale Dauern, Zeitpunkt, Entwurfserhalt, Anzeige, Korrektur, CSV und Still-Sperre umgesetzt.
- [x] `npm run check`: 52 Tests, TypeScript und Produktionsbuild erfolgreich. Fachtests prüfen gültige/ungültige/leere Dauern, Korrektur und CSV; DOM-Tests prüfen Speicherung, Wiederherstellung, Sperre und getrennte Dauern beim Artwechsel.
- [x] AC-003–004: `node scripts/test-local-supabase.mjs --configure-preview` bestanden. Synthetische CRUD-, Versions-, Fremdzugriffs-, Constraint- und Berichtstests für alle drei Aktivitäten.
- [x] `node scripts/test-restore.mjs`: alle 15 Migrationen auf leerer Datenbank, synthetischer Dump/Restore mit beiden neuen Arten und erhaltener RLS-/Versionsprüfung erfolgreich.
- [x] Browser-Harness mit echter lokaler Supabase und synthetischem Konto: Massage bei 390×844, Babygymnastik bei 320×740 visuell geprüft. Massage mit 7 Minuten und Babygymnastik mit unbekannter Dauer gespeichert. Keine Feature-Mocks. Wegen wirkungsloser CDP-Maus-/Enter-Eingaben Formularaktionen über DOM click/requestSubmit ausgelöst; echte App-Handler und API verwendet. Kein physischer Smartphone-Test.
- [x] AC-004–005: Migration 015 per Management API am 15.09.2026 produktiv angewendet. Schema vorher abgeglichen, private interne Sicherung angelegt, Bestandsvergleich in derselben Transaktion erfolgreich, RLS und fehlende Browserrechte auf Sicherung geprüft. Keine produktiven Testeinträge.
- [x] Migrations-SHA256: `c1ceaddb4ce6ed6b39737e0fa26edef95e9af4de1f32554a81301e20a0ad3856`.
- [ ] Commit auf main, CI und Pages-Veröffentlichung nachweisen.

Nächster Schritt: Geprüften Stand auf main pushen und Pages-Veröffentlichung abschließen.
