# Technischer Plan

## Befund

`private.members.person`, `feedings.performed_by`, die Insert-Zuordnung, `current_family_person`, Bearbeitungsentwürfe und CSV nutzen denselben historischen Textwert. Zugriff beruht dagegen auf `auth.uid()` und dem Vorhandensein der Mitgliedschaft. Keine Ableitung aus E-Mail-Adresse oder Anzeigename. `created_by` bleibt eine unveränderliche Benutzer-UUID. Spiel und Abenteuer verwenden Benutzer-UUIDs und Familienmitgliedschaft.

Ein direktes Ersetzen der Texte würde Constraints, Zuordnungen und ältere Clients brechen. Vite-Variablen wären im öffentlichen Bundle lesbar. Deshalb: additive geschützte Präsentation statt Datenumschreibung.

## Umsetzung

- `Person` wird ein opaker String. Keine Konvertierung historischer Werte beim Lesen, Schreiben oder Wiederherstellen.
- Migration 023 ergänzt nur `private.caregiver_profiles` und die Familien-RPC `family_caregivers`. Profile tragen neutrale IDs, historische Identität, Anzeigename, Farbe und Effekt. Tabelle bleibt ohne Browserrechte; RPC prüft Mitgliedschaft. Keine neue Fremdschlüsselabhängigkeit zu Mitgliedschaften: deren Entzug bleibt unabhängig von Darstellungszeilen möglich.
- Konfiguration separat und administrativ: vorhandene Benutzer-UUIDs privat den bisherigen beiden Darstellungen zuordnen. Keine automatische Ableitung aus Namen, E-Mail, Ereignisart oder UUID-Sortierung. Das geprüfte Skript übernimmt den bisherigen Identitätswert als vertrauten Anzeigenamen; eine bestehende Konfiguration oder ungültige Mitgliedschaft bricht ab.
- Oberfläche lädt Profile nach Zugriffsprüfung, maskiert Texte und verwendet erlaubte CSS-/Effektwerte. Bei Fehlern bleiben rohe historische Labels verfügbar; Auswahl enthält konfigurierte und bereits bekannte Identitäten. Im Fehlerfall können Farbzuordnung und persönlicher Effekt fehlen und die Auswahl auf bekannte Personen begrenzt sein. Darum kein reguläres Deployment ohne vollständig geprüfte Konfiguration.
- Auth-Konfiguration, Speicherkeys, Session-Lebensdauer, bestehende RPCs, Feedings-Verträge und CSV bleiben erhalten. Abmeldung leert auch private Profile. Neuer Netzwerkabruf hat ein 3-Sekunden-Abbruchsignal; ein noch laufender Benutzerwechsel darf keine alten Profile übernehmen.
- Integrationstests verwenden neutrale Variablennamen und synthetische E-Mails. Ein Fixture-Helfer liest die zwei alten Identitätswerte aus der unveränderten historischen Migration, um echte Altvertragskompatibilität zu prüfen, ohne sie erneut in Tests zu veröffentlichen.

## Prüfung

AC-001/004: DOM-Regressionen und Quelltextprüfung, einschließlich fremder Anzeigenamen mit HTML-Zeichen, Darstellungsausfall und restauriertem Bearbeitungsentwurf. Bestehende Effektprüfungen bleiben bestehen. AC-002: Migration 023 nach befülltem Altbestand, exakter Tabellenvergleich einschließlich Auth-Sitzung und Refresh-Token sowie Vollrestore. AC-003: echte lokale API-/RLS-/Auth-Prüfung mit erfundenen Konten. AC-005: vollständiger Projektcheck und separater Betriebsplan.

## Restoffenlegung

Auf ausdrücklichen Folgeauftrag werden die historischen Installationsvorlagen einschließlich 001, 005 und 008 in beiden Branch-Historien neutralisiert. Neue leere Installationen erhalten caregiver_a/caregiver_b. Bestehende Datenbanken behalten ihren alten Vertragsstand; niemals historische Migrationen erneut ausführen oder deren produktive Receipts umschreiben. Der neue Client und 023 akzeptieren beide opaken Identitätsformen. Vollständiger Restore wird für neutrale Neuinstallation und einen abweichenden synthetischen Altvertrag geprüft. Zusätzliche Familiennamen in zwei historischen HTML-Icon-Galerien werden im aktuellen Baum neutralisiert. Die alten Versionen der Laufzeitdateien, Tests und Galerien bleiben möglicherweise in GitHub-Caches und nicht mehr referenzierten Objekten erreichbar. Autorennamen/-E-Mails sind ausdrücklich akzeptiert.
