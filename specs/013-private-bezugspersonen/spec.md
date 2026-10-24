# 013 – Private Darstellung der Bezugspersonen

Status: Abgeschlossen und veröffentlicht am 24.10.2026; Nachweise in tasks.md.

## Abstimmung

Am 24.10.2026 ausdrücklich beauftragt: öffentliche Namensliterale sicher entfernen, vertraute Anzeige möglichst privat konfigurieren und bestehende Zugänge, Sitzungen, Daten und Zuordnungen vorrangig bewahren. Die lokale Implementierung und Prüfung dieses kompatiblen Umfangs ist damit abgestimmt. Produktionsmigration, private Konfiguration, Commit/Push und Veröffentlichung wurden anschließend am 24.10.2026 ausdrücklich freigegeben. Auch die weitere Historienbereinigung beider Remote-Branches per Force-Push und Rückmeldung an den auslösenden Chat ist beauftragt. Ein vollständiger privater Dump wurde zusätzlich ausdrücklich angefordert. Die weitere Historienumschreibung wurde mit dem ursprünglichen Bereinigungschat koordiniert.

## Anforderungen

- REQ-001: Öffentliche Laufzeitquellen und neue Anwendungstypen verwenden keine konkreten Familiennamen. Persönliche Anzeige, Farbmarkierung und Speichereffekt stammen aus einer geschützten Laufzeitkonfiguration mit neutralen Profil-IDs.
- REQ-002: Bestehende Datenbankidentitäten bleiben als opake Werte erhalten. Konten, Passwörter, Sitzungen, Refresh-Tokens, Ersteller, Zuordnungen, Versionen, CSV und lokale Entwürfe ändern ihr Format nicht. Keine Produktionsdatenkorrektur.
- REQ-003: Nur freigeschaltete Mitglieder dürfen die beiden Profile lesen. Browser dürfen Konfiguration und Mitgliedschaften nicht ändern. Bestehende RLS und Auth-Funktionen bleiben erhalten; ältere Clients arbeiten weiter.
- REQ-004: Fehlende Darstellung darf die Anmeldung oder Speicherung nicht verhindern. Nach höchstens drei Sekunden endet der zusätzliche Konfigurationsabruf; bekannte alte Identitäten bleiben sichtbar und auswählbar. Vollständige Profile sind Voraussetzung für die reguläre Veröffentlichung.
- REQ-005: Historische Installationsvorlagen werden auf ausdrücklichen Nutzerauftrag in allen veröffentlichten Git-Versionen neutralisiert. Bestehende Produktionsmigrationen werden dabei weder erneut ausgeführt noch umgeschrieben. Restoffenlegung und Rollout/Rollback werden ausdrücklich dokumentiert. Keine personenbezogenen Build-Variablen.

## Akzeptanz

- AC-001: Quelltextprüfung und Build enthalten keine bisherigen persönlichen Identitätsliterale im neuen Laufzeitcode; DOM zeigt synthetische private Anzeigenamen sicher maskiert, beide bisherigen Effekte und Farben bleiben konfigurierbar.
- AC-002: Ein befüllter synthetischer Altbestand bleibt vor/nach 023 einschließlich Auth-Sitzungen und Refresh-Tokens exakt gleich. Bearbeitungsentwurf behält Zuordnung, Ersteller und Version. Vollständiger Restore enthält die Profile.
- AC-003: Beide Mitglieder lesen dieselben Profile; Fremdkonto liest keine Profile, anonym fehlt RPC-Ausführungsrecht; direkte private Tabellenzugriffe scheitern. Lokale Anmeldung, vorhandenes Token und Token-Erneuerung funktionieren.
- AC-004: Bei RPC-Ausfall bleiben Logbuch, Entwurf und Speichern nutzbar; Benutzerwechsel/Abmeldung leert die privaten Profile. Ältere RPCs und Zuordnungen funktionieren ohne Profilkonfiguration.
- AC-005: `npm run check`, lokale Supabase- und Restore-Prüfung bestehen. Produktionsschritte und Restrisiken sind konkret beschrieben.

## Grenzen

Keine vollständige Anonymisierung der privaten Datenbank: Alte Identitäten werden weiterhin autorisiert übermittelt und gespeichert. Alte, nicht mehr referenzierte Git-Blobs und bisherige Veröffentlichungsartefakte können bis zur GitHub-seitigen Bereinigung noch erreichbar sein. Eine spätere Umstellung auf neutrale Speicherwerte benötigt einen eigenen Übergangsvertrag für ältere Clients, offene Vorgänge, lokale Entwürfe, CSV und Sicherungen. Namen durch Kodierung zu verschleiern zählt nicht als Anonymisierung.

Der allgemeine Passwort-Hilfetext und die Projektinfo nennen künftig keine Personen oder Orte. Die Bedienabläufe bleiben erhalten; vertraute Namen in Zuordnungen bleiben bei vollständig eingerichteten Profilen gleich.
