# Aufgaben und Prüfnachweise

Stand: 24.10.2026. Umsetzung, Commit/Push, Produktionsrollout und koordinierte Historienbereinigung sind ausdrücklich freigegeben. Additive Migration und private Profile sind produktiv eingerichtet; Veröffentlichung und abschließende Remote-Prüfung laufen noch.

## Umsetzung

- [x] Opake bestehende Identitäten statt persönlicher Literale im neuen Laufzeitcode. Private Profile liefern vertraute Labels, beide bisherigen Farben und Effekte erst nach Familienprüfung.
- [x] Historische Entwürfe, offene Speicherungen, Ersteller-UUIDs, Versionen, CSV und Session-Speicher behalten ihr Format. Fehlende Darstellung blockiert Logbuch oder Speicherung nicht; zusätzlicher Abruf endet nach drei Sekunden.
- [x] Additive 023 und privates Konfigurationsskript; keine Änderung bestehender Mitgliedschaften, Ereignisse oder Auth-Konfiguration.
- [x] Neutrale Installationsvorlagen und Historienersatz für beide Remote-Branches vorbereitet. 58 bisherige Commits, 5.945 Dateiversionen exakt gegen die festgelegte Transformation geprüft; Autoren-/Committerangaben und Zeitstempel erhalten. Originale Autorenzuordnung bleibt ausdrücklich akzeptiert.
- [x] Beide HTML-Icon-Galerien ebenfalls ohne Familiennamen. Keine persönlichen Build-Variablen.

## Tatsächliche Prüfungen

- `npm run check`: **126 Tests bestanden**, TypeScript und Produktionsbuild erfolgreich. DOM prüft private Labels mit HTML-Zeichen, beide Farben/Effekte, reduzierte Bewegung, Konfigurationsausfall, Speicherung, restaurierte Bearbeitungsentwürfe und Leeren privater Profile bei Abmeldung.
- `node scripts/test-local-supabase.mjs --existing-local-identities`: bestanden gegen die bestehende lokale Testdatenbank, einschließlich älterer Identitätswerte, Login, bestehendem Zugriffstoken, Token-Erneuerung, Mitgliederentzug, RLS, CRUD und Spiel/Abenteuer. Ausschließlich synthetische Daten.
- `node scripts/test-restore.mjs`: bestanden, alle 23 neutralen Installationsmigrationen auf leeren kurzlebigen lokalen Datenbanken, vollständiger Dump/Restore und unveränderte Auth-/Sitzungsdaten.
- `node scripts/test-restore.mjs --legacy-identities`: derselbe Upgrade-/Restore-Nachweis mit abweichenden synthetischen Altidentitäten; alte Daten und neue private Profile bleiben kompatibel. CI enthält beide Varianten.
- Historische Korrektur 008 wird nur innerhalb des lokalen Rollback-Fixtures ausgeführt, an dessen synthetischen Vertragsstand angepasst. Niemals produktiv wiederholen.
- Vollständiger produktiver Dump von `public`, `private`, `auth` und Migrationsschema sowie Rollenmetadaten ohne Rollenpasswörter außerhalb des Repositorys AES-256-verschlüsselt gespeichert. Separater lokaler Schlüssel; Archivstruktur, Verschlüsselungsrundlauf und SHA-256 geprüft. Keine Klartextdatei und keine Wiederherstellung echter Daten als Testbestand. Private Pfade und Quittungen bleiben außerhalb des Repositorys.
- Produktive 023 und Profilkonfiguration transaktional angewandt: **60 bestehende Tabellen** einschließlich Auth und historischer Sicherungen exakt unverändert; bestehende RLS, Policies und Tabellenrechte unverändert. Zwei vertraute Profile administrativ aus vorhandenen Mitgliedschaften konfiguriert. Keine echten Testeinträge und kein Session-Reset.
- 023 SHA-256: `cae01bf410e32e5692d85429f7dedf1fbc80bfa51dd61c13cdc34aec43129dd6`.
- Konfigurationsskript SHA-256: `b3e907f17d7645934aa34a43c44628ccfc909781e47f735ab84f224247559b2c`.

## Grenzen und nächster Schritt

Alte, nicht mehr referenzierte Git-/Actions-/Pages-Objekte können trotz Force-Push bis zur GitHub-seitigen Bereinigung zugänglich bleiben. Der ursprüngliche Bereinigungschat koordiniert dies im bestehenden Support-Vorgang. Keine eigenen Support-Nachrichten. Historische Ersatz-Clients sind kein Rückfallziel für die unveränderte Produktion; die tatsächlich ausgelieferte alte statische App wird privat gesichert.

Kein manueller Smartphone-/PWA-Test und kein Login mit echten Familienpasswörtern. Der Produktionsvergleich schützt bestehende Sitzungsdaten; die Geräteabnahme bleibt eine separate Prüfung. Ein produktiver Vollrestore des Dumps wird nicht behauptet.

**Genau ein nächster Schritt:** Bereinigte Branches mit expliziten Leases atomar veröffentlichen, ihre CI abwarten und anschließend den neuen kompatiblen Client über den freigegebenen manuellen Pages-Workflow veröffentlichen.
