# Öffentliche Dokumentation und private Betriebsnotizen

Die öffentliche Dokumentation verwendet neutrale Familienrollen. Persönliche Familienzuordnungen, konkrete Projektkennungen, interne Sicherungsnamen und Verwaltungsnachweise gehören in getrennte private Betriebsnotizen. Beispiele und lokale Prüfungen verwenden ausschließlich erfundene Daten.

Diese Bereinigung verändert weder bestehende Rollenwerte der Datenbank/API noch Produktionsdaten, Zugriffsschutz, Anmeldung oder das veröffentlichte Frontend. Die historischen technischen Rollenwerte bleiben aus Kompatibilitätsgründen in Quellcode, Migrationen und Tests erhalten; sie sind keine anonymisierten Werte. Eine Änderung dieser Werte benötigt einen eigenen Migrations- und Kompatibilitätsplan.

Das lokale Administrationshilfsprogramm benötigt die separat verwaltete Zielkennung in `PHILILOG_SUPABASE_PROJECT`. Ohne gültige Kennung bricht es vor Tokenzugriff und API-Aufruf ab. Beispielbefehle mit `PROJECT_REF` müssen vor Verwendung durch die eigene Kennung ersetzt werden. Geheimnisse weiterhin ausschließlich außerhalb von Git verwalten.

Nach einer Git-Historienbereinigung frische Klone verwenden. Alte Klone oder historische GitHub-Kopien können die ursprünglichen Dokumente weiterhin enthalten; eine Veröffentlichung alter Branches würde sie wieder einführen. GitHub-Supportanfragen werden separat gesammelt.
