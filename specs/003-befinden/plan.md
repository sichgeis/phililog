# Technischer Plan

Nullable Textspalte `mood_after` mit vier zugelassenen Werten und Typbeschränkung auf breast/bottle/diaper. Spaltenrechte ergänzen; bestehende RLS, Versionsprüfung und Ersteller bleiben unverändert. Alte Datensätze NULL.

Einzelwert im Entwurf, native Buttons mit aria-pressed in beschrifteter Gruppe. Aktivierung ersetzt/entfernt den Wert; Fokus bleibt nach Aktualisierung auf dem gewählten Button. Text plus Emoji, Aquarell und Kontur; 2×2 bei sehr schmalen Geräten. Historie und CSV ergänzen. Beim Typwechsel zu Wiegen entfernen. Alte gespeicherte Entwürfe und Wiederholungen ohne Feld behandeln wie NULL.

Prüfung: Fachlogik zu optionalem Wert, Bearbeiten, Export und Wiederholung; lokale Supabase zu Constraints, Zugriffen und Versionskonflikten; Browser mit synthetischen Daten zu Auswahl/Abwahl, Neuladen, Speichern und Bearbeiten bei 320/390 px. Danach Migration und Pages-Veröffentlichung.
