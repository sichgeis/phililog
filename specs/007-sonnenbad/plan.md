# Technischer Plan

Ereignisart sunbath ergänzen; vorhandene occurred_at und duration_minutes verwenden. Eigene leere sunbathDuration im Entwurf verhindert Übernahme von Still-/Flaschendauern. Separates optionales Minutenfeld, gemeinsamer Zeitpunkt-/Personenablauf. Anzeige über Sonnensymbol und Dauer; CSV verwendet bestehende Art-/Dauerspalten.

Migration 014 erweitert nur Arten- und Detailconstraint. Keine neuen Spalten, Rechte, Trigger oder RPCs. Bestehende Befinden-/Schätzungsconstraints schließen fachfremde Werte aus. Mahlzeitabfrage und Tagesbericht filtern bereits explizit ihre Arten.

Prüfung: Fachtests für leere/positive/ungültige Dauer, Bearbeitungs-Roundtrip und CSV; DOM für Menü, Auswahl, Entwurf und Speicherpayload; echte lokale Supabase für CRUD, Versionsschutz, Fremdzugriffe, Constraints und unveränderte Berichtssummen. Browserprüfung bei 320/390 px mit synthetischen Daten.
