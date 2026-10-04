# Technischer Plan

- Ereignisfilter als optionale `kind`-Bedingung in `listFeedings`, unveränderte Cursorreihenfolge aus Zeitpunkt und UUID. Dieselbe paginierte Abfrage für die separate Gewichtsansicht. Ungefilterten letzten Eintrag separat laden, damit Eingabekontext erhalten bleibt. Refresh-Generation und Sitzungs-Epoche verwerfen veraltete Antworten.
- Taggenaue WHO-P10/P50/P90 in Gramm aus offizieller XLSX extrahieren und als TypeScript-Referenz mit Quellen-/Prüfsummennachweis ausliefern. Keine Netzabfrage mit Messwerten. Fachmodul berechnet Alter in Berliner Kalendertagen und lineare Positionen, erweitert Skala bei äußeren Messwerten.
- Migration 020 ergänzt nullable `birth_date` an `family_settings` und eingeschränktes UPDATE-Recht. Bestehende RLS und Versionstrigger bleiben wirksam, alte Clients kompatibel. Keine privaten Standardwerte im Repository. Geschütztes Geburtsdatum erst nach überprüfter Produktionsmigration initialisieren; Logbuchbestand in Transaktion vergleichen.
- Bestehendes Einstellungsformular um Geburtsdatum ergänzen, gemeinsame atomare Speicherung mit Originalversion des Entwurfs. Keine Veränderung gespeicherter Messungen, Alter und Referenz stets abgeleitet.
- Fachtests: Berliner Tagesgrenzen, Sommerzeit, Tag 0, ungültige/fehlende Daten, vor Geburt, Zukunft, Referenzende, WHO-Stützwerte und äußere Messpunkte. DOM-Tests: Filterwechsel/überholte Antwort, weitere Seiten, Editieren, Entwurfserhalt, Profilkonflikt und Abmeldung. Lokale echte API: Filterpagination, Profil-RLS, Versionsschutz und Kompatibilität. UI visuell mit synthetischen Messungen bei 320/390 px prüfen; Gesamtcheck und Restore vor Rollout.

## Referenzumschaltung

- KiGGS-Tabelle reproduzierbar aus Original-PDF Seite 33 (gedruckte Seite 31) extrahieren; Quelle, Prüfsumme, 24 Altersstützpunkte bis 66 Monate und Grammwerte dokumentieren. Originalseite visuell prüfen.
- Fachmodul um explizite Referenz und lineare Perzentilinterpolation ergänzen; WHO unverändert. Obergrenze 1856 Tage für beide Quellen.
- Auswahl direkt auf der Gewichtsseite, nicht personenbezogene Gerätepräferenz in localStorage mit Fehlerbehandlung. Keine Datenbankmigration. Quellen und Interpolationshinweis dynamisch; keine neuen Datenabfragen beim Wechsel.
- Stützwerte, Interpolation, Grenzfälle und Speicherausfälle fachlich prüfen; DOM prüft sofortigen Wechsel, Fokus, Pagination, Entwürfe und Quelle. Gesamtcheck, echte mobile Browseransicht mit synthetischen Daten, anschließend bestehender autorisierter Pages-Rollout.
