# Technischer Plan

Settings-Entwurf hält Werte und Version. Gemeinsame Entwurfserkennung vergleicht sämtliche fachlichen Felder mit Startwerten; die reine Standard-Momentaufnahme zählt nicht als Eingabe. DOM-Aktualisierung erhält Fokus, Textauswahl und Details-Zustand über stabile Selektoren.

Additive Migration 010 hält verwendete UUIDs und Ersteller im privaten Schema. Ein transaktionaler INSERT-Trigger verhindert Wiederverwendung auch nach Löschen. Eine geschützte RPC beantwortet ausschließlich, ob die eigene UUID bereits gespeichert wurde. Keine Ereignisinhalte im Nachweis; keine Browser-Schreibrechte. Bestehende IDs werden einmalig übernommen. API-Wiederholung liest aktuelle Inhalte, statt diese mit dem alten Payload zu überschreiben.

Fachlogik- und DOM-Regressionen, echte lokale Supabase-Prüfungen einschließlich RLS und Löschfall sowie Restore in separater leerer Datenbank. CI verwendet Node 24 und dieselben Skripte. Historische Migration 008 bleibt unverändert. Wiederherstellung lädt Schema und Daten aus einem konsistenten Dump, ohne historische Datenkorrekturen erneut auszuführen.
