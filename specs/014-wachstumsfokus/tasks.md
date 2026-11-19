# Aufgaben und Nachweise

- [x] Bereiche, Referenzen und Datenschutzgrenzen festlegen (AC-001–004).
- [x] Datenschutz und Wartung auf `main` verifizieren, integrierte Feature-Branches schließen. GitHub zeigte keine offenen Pull Requests, die letzten Checks für `main` und Wartung waren erfolgreich.
- [x] Eingabe, Navigation und vorhandene Funktionen prüfen (AC-001, AC-004).
- [x] Eigenständige und vorhandene Längen erfassen und im Verlauf vergleichen (AC-002–004).
- [x] Fachlogik, DOM, lokale Datenbank, Wiederherstellung und mobile Ansicht prüfen (AC-001–004).
- [x] Datenschutzprüfung, CI, Migration und Veröffentlichung nachweisen (AC-004).

## Lokale Nachweise

- `npm run check` mit 130 bestandenen Tests, TypeScript und Produktionsbuild.
- `node scripts/test-local-supabase.mjs --existing-local-identities` bestätigt Zugriff beider Mitglieder, Ausschluss von Fremden und anonymen Anfragen, erlaubte Messkombinationen, Versionskonflikte und Abruf alter und eigenständiger Längen aus der Ereignistabelle.
- `node scripts/test-restore.mjs` und `node scripts/test-restore.mjs --legacy-identities` bestanden. Der synthetische Bestand bleibt beim Upgrade auf 024 erhalten und enthält nach dem Restore die eigenständige Länge samt Messart.
- Die lokale App und Supabase-Auth antworteten mit HTTP 200. Playwright mit Chrome bei 320 und 390 px prüfte mit synthetischen Testkonten den Start, eigenständige und kombinierte Speicherung über die lokale API, WHO-/KiGGS-Wechsel, Bearbeiten einer Länge, Logbuchfilter, Tagesbericht und Stillen. Die Beschriftungen passen bei beiden Breiten.
- Gitleaks prüfte den vorgemerkten Patch und die erreichbare `main`-Historie ohne Fund. Referenzdaten stammen aus den öffentlichen Originaltabellen. Konfigurationsdateien, private Ablage und Builds bleiben Git-ignoriert.

## Veröffentlichung

- Migration 024 transaktional angewandt. Der serverseitige Vergleich bestätigte alle bestehenden Logbuchzeilen, RLS und Zugriffspolicies. Privater Sicherungsstand und Prüfsumme bestätigt. Die Rollout-Transaktion wurde vorher mit synthetischen Daten ausgeführt. Die interne Sicherung liegt in derselben Datenbank.
- [Check](https://github.com/sichgeis/phililog/actions/runs/44529872952) und [Publish GitHub Pages](https://github.com/sichgeis/phililog/actions/runs/44530311866) liefen erfolgreich für `56f436f`.
- Öffentlich ausgelieferte Seite und neuer JavaScript-Build antworteten mit HTTP 200. Das Build verwendet den öffentlichen Supabase-Browserschlüssel. Der anonyme Logbuchabruf ohne Datenanforderung erhielt HTTP 401. Die Bedienprüfung erfolgte lokal in Smartphone-Größen mit synthetischem Bestand.
