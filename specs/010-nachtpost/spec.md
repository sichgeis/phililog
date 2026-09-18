# 010 – Nachtpost: Das Amt für verlorene Morgen

## Auftrag und Status

Abgestimmt durch den Umsetzungsauftrag vom 18.09.2026: mutiger Pivot zum eigenständigen Action-Adventure in der Tradition von A Link to the Past, mit Skilltree, Minispielen, Geschichte und mindestens vier Stunden Spielumfang. Der Nutzer überträgt die kreative Ausarbeitung; Spielen neben dem Stillen ist keine Vorgabe mehr. Smartphone bleibt unterstützt; zusätzlich Tastatur. Eigenständige Figuren, Welt, Grafik und Musik, keine übernommenen Zelda-Assets oder Handlung.

Status: In Umsetzung. Vier Stunden sind ein verbindliches Inhalts-/Abnahmeziel, keine bereits gemessene Spielzeit. Veröffentlichung und Qualitätsaussage benötigen tatsächliche Prüfnachweise; künstliche Wartezeiten oder Grind zählen nicht als Inhalt.

## Spielversprechen

**Nachtpost – Das Amt für verlorene Morgen.** Die Postbotin Mara und der kleine Stern Pipp liefern einen Brief aus, der erst morgen geschrieben wird. Aber morgen kommt nicht: Nachtwächter Nox hat sechs Morgenlichter beschlagnahmt. Er will einen einzigen vollkommenen Augenblick bewahren. Aus einer komischen Verwaltungsposse wird eine Geschichte darüber, dass man Menschen nicht festhalten kann, indem man ihre Zukunft anhält. Schlussentscheidung: Nox helfen, seinen Dienst abzugeben, oder die Maschine abschalten; beide Wege bringen einen Morgen, unterschiedliche Epiloge und freies Weiterspielen.

Wiederholung: Erkunden → Hindernis verstehen → kämpfen/rätseln → Werkzeug, Wissen oder Fähigkeit gewinnen → neue Wege und Rückkehrmöglichkeiten → Geschichte voranbringen. Keine Pflegepflichten, Echtgeld, täglichen Aufgaben oder Telemetrie.

## Anforderungen

- REQ-001: Top-down-Welt mit direkter kontinuierlicher Bewegung, Kollisionen, Nahkampf, Ausweichrolle, Fernwerkzeug, Gegnertelegraphen, Trefferfeedback, Checkpoints und Bossen. Touch-Steuerkreuz/Joystick plus große Aktionstasten, WASD/Pfeile, Angriff J/Leertaste, Rolle K, Werkzeug L, Interaktion E.
- REQ-002: Sechs Regionen mit eigenem visuellen Thema, fortschreitenden Werkzeugen, benannten Räumen, Begegnungen, Rätseln und Boss. Dorf als Hub, Abkürzungen und Karte. Licht-/Traumebene eröffnet zusätzliche Wege und Geheimnisse.
- REQ-003: Werkzeuge werden durch Abenteuerfortschritt erworben, nicht durch Grinding. Skilltree mit drei Zweigen (Mut, Bewegung, Sternenmagie), tatsächlichen Fähigkeiten, sichtbaren Voraussetzungen und Kosten. Erkundungsbelohnungen und Nebenaufgaben ermöglichen unterschiedliche Builds.
- REQ-004: Eigenständige Geschichte von Auftakt bis Finale, optionale Briefe und sechs Nebenaufgaben mit Rückmeldungen. Kurze Begleiterkommentare reagieren auf Fortschritt; Journal enthält Ziele, Werkzeugregeln und gesammelte Briefe. Gespräch pausiert das Spiel.
- REQ-005: In die Welt eingebundene Minispiele: Silben-/Sternenfolge merken, Schaltkreis logisch drehen, Timing am Postsortierer. Fortschreitende Varianten, verständliche Regeln, Wiederholen ohne Ressourcenstrafe, gestufte Hinweise und freiwillige Vereinfachung.
- REQ-006: Kampagnenziel mindestens 240 Minuten beim ersten normalen Durchspielen einschließlich Erkundung und Nebenaufgaben. Umfangsplanung: sechs Kapitel à 30–40 Minuten, Prolog/Finale 20–30 Minuten, optionale Aufträge/Geheimnisse 30–50 Minuten. Dies ist eine Schätzung; ein vollständiger menschlicher Test muss Dauer, Abwechslung und Schwachstellen nachweisen. Keine Behauptung einer ausgereiften Vierstundenkampagne allein aufgrund der Anzahl von Räumen.
- REQ-007: Gemeinsamer Supabase-Spielstand, additive versionierte Speicherung, lokale Wiederholungsnachweise, Konflikterkennung statt stiller Überschreibung. Alte XP, Fähigkeiten, Schnuller-Rekorde und Minispiele bleiben in der „Spielstube“ erreichbar. Neuer Abenteuerfortschritt ist ein eigenständiger Spielstand, kein Reset des Altstands.
- REQ-008: Pause, Hintergrund und Wechsel zum Logbuch halten Simulation und Ton an. Niederlage verliert keine bleibenden Entdeckungen; Wiederbeginn am Raumeingang mit voller Gesundheit. Normale und gemütliche Schwierigkeit frei umschaltbar; Fortschrittsbelohnungen identisch.
- REQ-009: Eigene Canvas-Grafik, regionale Farbwelten, lesbare Silhouetten, dezente Partikel und Schatten. Optionaler synthetisierter Soundtrack und Effekte erst nach bewusster Aktivierung, dauerhaft abschaltbar. Spiel läuft ohne Ton. Reduzierte Bewegung ohne Bildschirmwackeln.
- REQ-010: Getrenntes dynamisch geladenes Modul; keine Logbuchdaten im Abenteuer, keine neuen externen Dienste/Frameworks. Entfernbarer Einstieg bleibt bestehen.

## Abnahmekriterien

- AC-001: Alle Regionen und das Finale sind mit regulären Mechaniken erreichbar; kein Schlüssel, Werkzeug oder lösbares Pflichtpuzzle liegt hinter seiner eigenen Sperre. Inhaltsgraph und Rätsel haben automatisierte Erreichbarkeits-/Lösbarkeitsnachweise.
- AC-002: Kampf, Rolle, Verwundbarkeit, Bossphasen, Tod/Checkpoint, Skillkosten und Werkzeugbedingungen sind getestet. Normal und gemütlich sind spielbar.
- AC-003: Jede Minispielart ist über UI bedienbar, erklärbar und abbrechbar; Erfolg vergibt den einmaligen Raumfortschritt, Wiederholung keine doppelten Belohnungen.
- AC-004: Save/Reload, Antwortverlust, parallele Geräte, fremde Konten und unbekannte Version sind geprüft; V1/V2-Bestand und historische Fixtures unverändert.
- AC-005: Reale Browserprobe in Hoch-/Querformat mit Touch sowie Tastatur; keine abgeschnittenen Bedienelemente, Pause bei Hintergrund, keinerlei Logbuchregression.
- AC-006: Menschlicher vollständiger Kampagnentest >= 240 Minuten ohne erzwungenen Leerlauf, mit dokumentiertem Spielspaßfeedback. Bis dahin ausdrücklich offen, keine automatische Gleichsetzung von Contentmenge mit vier Stunden Spaß.

## Konkretisierung während der Umsetzung

- 98 benannte Orte: Sternhafen, sechs Regionen à 16 Räume, Morgenmaschine. Sechs Hüter, sechs Werkzeuge, zwölf Fähigkeiten, 24 Fundbriefe und sechs Zustellaufträge. Die Karten verwenden sechs geometrische Grundlayouts mit regionalen Paletten und unterschiedlichen Begegnungen; dies sind keine 98 individuell gezeichneten Großlevel.
- Drei verpflichtende Prüfungen je Region und das regionale Werkzeug öffnen die Hüterkammer. Angriffe der Hüter haben Vorwarnung, Ausführung und Verwundbarkeitsfenster; das passende Werkzeug kann die Vorwarnung kontern. Arena-Ausgänge bleiben während des Kampfes geschlossen; ausdrücklicher Rückzug zur Poststation ist jederzeit im Pausenmenü möglich.
- Spätere Gedächtnisprüfungen verlangen die zweite Folge rückwärts. Leitungsrätsel haben unterschiedliche deterministische Pfade und wachsen von 3×3 über 4×4 auf 5×5. In späteren Sortierprüfungen müssen markierte Rücksendungen bewusst ohne Tipp vorbeiziehen. Jedes neue Verhalten wird vor der Prüfung erklärt.
- Im Hochformat folgt die Kamera der Figur; Querformat zeigt einen breiteren Ausschnitt. Ein eigener Werkzeugwechsel ist direkt auf dem Spielfeld erreichbar.
- Ein Speicherauftrag wird bei Verbindungsproblemen unverändert wiederholt. Zwischenzeitliche Änderungen werden als Folgeauftrag automatisch abgearbeitet. Bei konkurrierenden Geräten bleibt zusätzlich eine archivierte Konfliktsicherung nach dem Laden des gemeinsamen Stands exportierbar.
- Die Hauptgeschichte kann im Reisebuch erneut gelesen werden. Eine Unterbrechung während eines Dialogs löscht keine erreichten Geschichteinhalte.

Die Anzahl von Orten ist ausdrücklich kein Nachweis von vier Stunden qualitativ gutem Spiel. AC-006 bleibt bis zu einer gemessenen Erstspielprobe offen.
