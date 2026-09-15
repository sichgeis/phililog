# Technischer Plan

Nullable Textspalte `mood_after` mit sechs zugelassenen Werten und Typbeschränkung auf breast/bottle/diaper. Spaltenrechte ergänzen; bestehende RLS, Versionsprüfung und Ersteller bleiben unverändert. Alte Datensätze NULL.

Einzelwert im Entwurf, native Buttons mit aria-pressed in beschrifteter Gruppe. Aktivierung ersetzt/entfernt den Wert; Fokus bleibt nach Aktualisierung auf dem gewählten Button. Text plus Emoji, Aquarell und Kontur; drei Spalten, bei sehr schmalen Geräten zwei Spalten. Historie und CSV ergänzen. Beim Typwechsel zu Wiegen, Temperatur oder Sonnenbad entfernen. Alte gespeicherte Entwürfe und Wiederholungen ohne Feld behandeln wie NULL.

Prüfung: Fachlogik zu optionalem Wert, Bearbeiten, Export und Wiederholung; lokale Supabase zu Constraints, Zugriffen und Versionskonflikten; Browser mit synthetischen Daten zu Auswahl/Abwahl, Neuladen, Speichern und Bearbeiten bei 320/390 px. Danach Migration und Pages-Veröffentlichung.

## Erweiterung 14. September 2026

Zentrale Mood-Tabelle um angry (Zornig) und asleep (Eingeschlafen) erweitern. Migration 013 ersetzt ausschließlich den Check-Constraint durch die sechs zulässigen Werte; keine Datenkorrektur oder Rechteänderung. Fach-/DOM-Tests und lokale Supabase-Prüfung um beide Werte ergänzen. Migration vor dem neuen Frontend ausrollen.

## Erweiterung 15. September 2026

Die bisherigen Aktivitätsausschlüsse in Formular, Artwechsel und Speicherpayload entfernen. Messereignisse bleiben ausgeschlossen. Migration 016 erweitert ausschließlich `feeding_mood_after` um sunbath/massage/gymnastics, ohne Daten- oder Rechteänderungen. Bestehende Anzeige-/CSV-/Entwurfslogik wiederverwenden. AC-008–009 durch Fach-/DOM-Tests und mobile Browserprüfung, AC-010 durch lokale Supabase und Restore prüfen. Produktiv Schema abgleichen, interne private Sicherung, transaktionale Migration und exakten Bestandsvergleich durchführen; dann Commit/Push, CI und Pages-Veröffentlichung.
