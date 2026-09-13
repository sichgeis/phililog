# Technischer Plan

Nullable `estimated_ml` nur für Stillen. Entwurf hält geladenen Standard als Momentaufnahme und eine automatische/manuelle Auswahl. Bearbeitete Ereignisse erhalten keine neue automatische Schätzung. Gemeinsame Singleton-Tabelle mit RLS, 25 ml Initialwert und Versionsprüfung für Einstellungen.

SQL-Aggregation als SECURITY INVOKER RPC mit festem Europe/Berlin-Kalender und maximal 31 Tagen je Aufruf. So werden auch Ereignisse außerhalb der geladenen Historienseite berücksichtigt, ohne das ganze Logbuch herunterzuladen. Sieben Tage je Ansicht, weitere Wochen per Navigation. Eigene Ansichten für Bericht (Hauptnavigation) und Einstellungen (Footer). Keine Chart-Bibliothek.

Fachlogiktests für Momentaufnahme, Mengen und CSV; lokale Supabase für Zugriffe, Settings-Konflikte, Summen und Tagesgrenzen. Browser-Harness mit synthetischen Daten für Formular, Einstellungen und Tagesbericht. `npm run check` und lokale Supabase-Prüfung vor Migration und Pages-Veröffentlichung.
