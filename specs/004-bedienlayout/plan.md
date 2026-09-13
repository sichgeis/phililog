# Technischer Plan

Bestehendes Vite/TypeScript/CSS beibehalten. Formulare in semantischen Gruppen, ergänzende Angaben über native details; offener Zustand und Fokus bleiben bei render() erhalten. Speicherleiste sticky innerhalb des Formulars; bei Eingabefokus statisch, damit Tastatur/fokussierte Felder frei bleiben. Hauptnavigation sticky, ohne weitere feste Fußnavigation.

Reine Kalenderfunktionen in report.ts bestimmen Montag, ISO-KW/Jahr und begrenzten Berichtsschluss. Vorhandene daily_report-RPC unverändert weiterverwenden. Geschützte read-only RPC current_family_person liefert nur die eigene Mitgliedsrolle für die sichtbare Zuordnung. Keine Änderung der Zuordnungs- oder Speicherlogik.

Tests für Wochen/Jahresgrenzen und Berichtsstatus. Lokale Supabase prüft die neue RPC für Mitglieder, Außenstehende und anonym. Browser-Harness prüft reale lokale Ansichten bei 320/390 px und Desktop, Tastaturfokus, Speichern/Korrektur, Timer und Bericht. Keine Mocks oder produktiven Daten.
