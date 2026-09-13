# Technischer Plan

Nullable `estimated_ml` nur für Stillen. Entwurf hält geladenen Standard als Momentaufnahme und eine automatische/manuelle Auswahl. Bearbeitete Ereignisse erhalten keine neue automatische Schätzung. Gemeinsame Singleton-Tabelle mit RLS, 25 ml Initialwert und Versionsprüfung für Einstellungen.

SQL-Aggregation als SECURITY INVOKER RPC mit festem Europe/Berlin-Kalender und maximal 31 Tagen je Aufruf. So werden auch Ereignisse außerhalb der geladenen Historienseite berücksichtigt, ohne das ganze Logbuch herunterzuladen. Sieben Tage je Ansicht, weitere Wochen per Navigation. Eigene Ansichten für Bericht (Hauptnavigation) und Einstellungen (Footer). Keine Chart-Bibliothek.

Fachlogiktests für Momentaufnahme, Mengen und CSV; lokale Supabase für Zugriffe, Settings-Konflikte, Summen und Tagesgrenzen. Browser-Harness mit synthetischen Daten für Formular, Einstellungen und Tagesbericht. `npm run check` und lokale Supabase-Prüfung vor Migration und Pages-Veröffentlichung.

## Getrennte Standards

Zwei positive Integer-Spalten `breast_left_ml`/`breast_right_ml`, aus bisherigem Standard initialisiert. Atomare gemeinsame Speicherung mit bestehender Version/RLS. Altes Feld für während des Rollouts geöffnete Clients erhalten; ein Legacy-UPDATE setzt beide neuen Werte. Entwurf speichert ein Paar; alte numerische Entwurfswerte werden auf beide Seiten kopiert. Separate einmalige Bestandsmigration mit privater Sicherung und kurzen Schreibsperren; regulärer Ersteller-/Versionsschutz bleibt wirksam.

## Wartung

Settings-Entwürfe speichern die ursprüngliche Version gemeinsam mit beiden Werten. Hintergrundaktualisierungen ändern nur den Serverstand. Konfliktauflösung und Nachweise stehen in [004](../004-wartung/plan.md).
