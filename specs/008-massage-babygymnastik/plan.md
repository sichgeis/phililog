# Technischer Plan

Arten massage und gymnastics ergänzen. Eigene Entwurfsfelder massageDuration und gymnasticsDuration verhindern die Übernahme anderer Dauern. Bestehende Zeitpunkt-, Speicher-, Anzeige- und CSV-Pfade verwenden.

Migration 015 erweitert ausschließlich Arten-/Detailconstraints; keine neuen Spalten, Rechte oder RPCs. Produktiv transaktional nach geschützter interner Sicherung und Bestandsvergleich vor dem Frontend ausrollen.

Prüfung: Fach-/DOM-Tests für AC-001–003; lokale Supabase-CRUD-, RLS-, Constraint- und Berichtstests sowie Restore für AC-003–004; mobile Browserprüfung mit synthetischen Daten. npm run check, CI und Pages-Nachweis für AC-005.
