# 009 – Babyspiel: Kleine Schritte

## Abstimmungsstand

- Stand: Abgestimmt im Grundumfang; für die Umsetzung ausgearbeitete Spezifikation, Version 1.
- Auftraggeberentscheidung vom 18. September 2026: gemütlich und humorvoll, ein gemeinsames Baby, Start mit Schnuller und Babygespräch wie vorgeschlagen. Fortschritt muss über den Prototyp hinaus erhalten bleiben.
- Auftrag: Spezifikation fertigstellen und committen. **Keine Implementierung, kein Push und keine Veröffentlichung in diesem Auftrag.**
- Die konkreten Spielregeln, Zahlen und technischen Details unten sind Ausarbeitungen dieses Auftrags, keine bereits erprobten Spaß- oder Balancingwerte. Sie bilden die Ausgangsbasis für die spätere Umsetzung.
- Das Paket beschreibt ausschließlich das optionale Spiel, getrennt von den Spezifikationen des Logbuchs.

## Ziel und Umfang

Ein gemütliches, humorvolles Smartphone-Spiel für kurze Pausen beim Stillen oder Flaschegeben. Ein fiktives Baby entwickelt sich durch Minispiele und freigeschaltete Fähigkeiten. Der vollständige erste Entwicklungsbogen lautet: **spielen → XP verdienen → Fähigkeit wählen → verändertes Spiel erleben → neues Minispiel entdecken**.

Enthalten sind zwei sofort spielbare Minispiele, ein freischaltbares Greifspiel, fünf Fähigkeiten in zwei Zweigen, ein gemeinsamer dauerhafter Spielstand und Wiederholbarkeit nach allen Freischaltungen. Die Entwicklung ist eine Spielabstraktion ohne reale Altersangaben, Entwicklungsbewertungen oder Bezug auf echte Gesundheitsdaten.

Nicht enthalten: Füttern, Wickeln, Bauchlage, Krabbeln, Laufen, Sprechen, Pflegebedürfnisse, Offline-Erträge, tägliche Pflichten, Bestenlisten, Echtgeld, Laufzeit-KI, Mikrofon, Fotos oder frei eingegebene Namen. Diese Eingrenzung reduziert den ersten Umfang, ohne spätere Erweiterungen auszuschließen. KI wird zunächst für die Entwicklung eingesetzt.

## Anforderungen

| ID | Anforderung |
| --- | --- |
| REQ-001 | Smartphone-Hochformat, große einhändig erreichbare Tippflächen und jederzeitige Unterbrechbarkeit. |
| REQ-002 | Kurze wiederholbare Minispiele vergeben nach Abschluss XP; Fehlversuche verursachen keine Strafe oder Rückentwicklung. |
| REQ-003 | Ein Skill-Tree mit sichtbaren Kosten und Voraussetzungen ermöglicht freie Wahl zwischen verfügbaren Fähigkeiten. |
| REQ-004 | Fähigkeiten erleichtern Aktionen, automatisieren einen Handgriff und schalten ein neues Spiel frei. |
| REQ-005 | Eigenes entfernbares Modul ohne fachliche Kopplung an Logbucheinträge, Berichte oder echte Babydaten. |
| REQ-006 | Beide freigeschalteten Konten spielen dasselbe fiktive Baby über die vorhandene Supabase-Anmeldung. |
| REQ-007 | Verdiente XP, gekaufte Fähigkeiten und Spielstatistik bleiben über neue Spielversionen erhalten; kein Neustart beim Verlassen des Prototypstadiums. |
| REQ-008 | Gleichzeitige Aktionen und Speicherwiederholungen dürfen Fortschritt weder verlieren noch doppelt vergeben. |
| REQ-009 | Alle verfügbaren Spiele bleiben nach dem letzten Kauf wiederholbar und vergeben weiter XP. |

## Einstieg und Gestaltung

Arbeitstitel: „Kleine Schritte“. Eine freundliche stilisierte Babyfigur mit wenigen klaren Ausdrücken: neugierig, konzentriert, zufrieden und lächelnd. Warme Farben, ruhige Animationen und kurze humorvolle Rückmeldungen wie „Schnuller erfolgreich wieder angedockt“. Keine Beschämung bei Fehlern, keine leidende Figur, kein Schreien. Die erste Version benötigt weder Ton noch Vibration.

Der dezente Einstieg „Kleine Schritte · Spiel“ liegt im Footer neben den vorhandenen Zusatzansichten; kein neuer Hauptnavigationseintrag, kein automatisches Öffnen. Diese Platzierung interpretiert die diktierte Formulierung „Futter verstecken“ als „im Footer verstecken“; Rückfrage zur Bestätigung ist gestellt. Bis zur Antwort gilt sie als ausdrücklich dokumentierte Annahme.

Die Spielübersicht zeigt Baby, verfügbares XP-Guthaben, Gesamt-XP, Spielkarten und den Zugang zu „Fähigkeiten“. Dort stehen beide Zweige mit Kosten, Voraussetzungen und einer Beschreibung des Effekts vor dem Kauf. Gesperrte Spiele erklären ihre Freischaltung. Ein ständig erreichbarer Rückweg „Zum Logbuch“ führt zur vorherigen Ansicht.

Bedienelemente mindestens 48 × 48 CSS-Pixel, keine Mehrfinger-Gesten, kein präzises Ziehen, kein notwendiger Ton und keine ausschließlich farbliche Information. Hauptaktionen liegen im unteren Bildschirmbereich. Kein horizontaler Überlauf bei 320–430 CSS-Pixel Breite. Größere Bildschirme dürfen dieselbe schmale Ansicht anzeigen; es gibt keinen separaten Desktopmodus. Reduzierte Bewegung entfernt dekorative Animationen; der für das Timing nötige Marker bleibt, alternativ wird die unten beschriebene ruhige Schnullervariante angeboten.

## Verbindliche Regeln der ersten Spielversion

Jede Runde besteht aus fünf abgeschlossenen Aktionen. Es gibt keine Gesamtablaufzeit. Ziel sind etwa 15–40 Sekunden bei ununterbrochenem Spielen, ohne Zwang, diese Dauer einzuhalten. Vor jeder Runde steht eine kurze Erklärung. Zwischen Aktionen startet die nächste Aufgabe erst nach einem bewussten Tipp auf „Weiter“; dieser Tipp darf nicht gleichzeitig als Antwort zählen.

### Schnuller-Moment

Ein Marker läuft gleichmäßig zwischen den Enden einer Leiste hin und her; eine einfache Strecke dauert 2,5 Sekunden. Die mittlere Trefferzone umfasst zunächst 40 % der Leiste. Ein großer Knopf „Schnuller zurück“ wertet die Position beim Tipp aus, einschließlich der Zonengrenzen. Treffen schließt die Aktion ab und zählt einen Bonuspunkt. Verfehlen gibt eine freundliche Rückmeldung und wiederholt dieselbe Aktion, ohne Punkteabzug oder Wiederholungslimit. Jeder Aktion gelingt dadurch irgendwann der Abschluss.

Eine jederzeit vor dem Versuch wählbare „Ohne Timing“-Alternative ersetzt die Leiste durch einen ruhenden Schnuller und einen einfachen Tipp. Diese Aktion zählt als abgeschlossen, jedoch ohne Timingbonus. Sie erlaubt entspanntes Weiterkommen auch bei eingeschränkter Aufmerksamkeit oder Bewegungsempfindlichkeit.

### Babygespräch

Eine sichtbare Sprechblase zeigt „Ah“ oder „Oh“. Zwei große Antwortflächen tragen dieselben Silben. Die passende Silbe auszuwählen lässt das Baby zufrieden reagieren und schließt die Aktion ab. Ein erster richtiger Versuch bringt einen Bonuspunkt. Bei einer anderen Antwort wackelt die passende Fläche kurz beziehungsweise wird ohne Bewegung hervorgehoben; weitere Versuche bleiben möglich, für diese Aktion entfällt nur der Bonus. Kein Zeitlimit, keine Spracherkennung und keine Erinnerung an unsichtbare Folgen nötig.

Mit „Gegenüber fixieren“ kommt „Da“ als dritte mögliche Silbe und Antwortfläche dazu. Mit „Bewusst lächeln“ werden die Aktionen 2 und 4 jeder Gesprächsrunde durch „Das Baby lächelt“ mit einer großen Antwort „Zurücklächeln“ ersetzt. Diese Antwort gelingt immer und zählt als Bonuspunkt. So ändert die Fähigkeit tatsächlich die Runde und nicht nur die Illustration.

### Greifspiel

Nach „Schnuller selbst holen“ verfügbar. In einem festen 2×2-Raster erscheint ein großes Spielzeug. Antippen schließt die Aktion ab; der nächste Platz unterscheidet sich vom vorherigen. Jede Aktion lässt sich ohne Zeitlimit spielen. Wer beim ersten Tipp das Spielzeug trifft, erhält einen Bonuspunkt; ein Tipp in eine leere Rasterfläche lässt die Aufgabe bestehen und nimmt nur den Bonus dieser Aktion. Andere Bedienelemente zählen nicht als Fehlversuch. Keine bewegten Ziele und keine Timing-Leiste: Beobachten und räumliches Antippen ersetzen das Rhythmusspiel.

### XP und Fähigkeiten

Eine vollständige Runde vergibt **10 Grund-XP plus 0–5 Bonus-XP**. Unvollständige Runden vergeben keine XP. Ein Fähigkeitserwerb zieht seinen Preis vom Guthaben ab; die insgesamt verdienten XP bleiben separat erhalten. Guthaben und Gesamterfahrung beginnen bei 0. XP sind ganze Zahlen, niemals negativ. Es gibt keine zweite Währung und keine Levelschranke.

| Stabile ID | Fähigkeit | Voraussetzung | Kosten | Wirkung |
| --- | --- | --- | --- | --- |
| `hands_discovered` | Hände entdeckt | Keine | 20 XP | Trefferzone im Schnullerspiel wächst von 40 % auf 60 %. |
| `targeted_grasp` | Gezielt greifen | Hände entdeckt | 40 XP | Der erste Timing-Fehlversuch jeder Schnullerrunde wird automatisch zum Treffer, einschließlich Bonuspunkt. |
| `self_pacifier` | Schnuller selbst holen | Gezielt greifen | 60 XP | Das Baby holt in der Übersicht seinen Schnuller selbst; das Greifspiel wird dauerhaft verfügbar. |
| `eye_contact` | Gegenüber fixieren | Keine | 20 XP | Babygespräch erhält die dritte Silbe „Da“. |
| `social_smile` | Bewusst lächeln | Gegenüber fixieren | 40 XP | Zwei Gesprächsaktionen werden durch gemeinsames Lächeln ersetzt. |

Die Automatisierung bei „Schnuller selbst holen“ ist eine kurze Darstellung beim Öffnen der Übersicht; sie erzeugt keine passiven XP und keine wiederkehrende Pflicht. Das Schnullerspiel bleibt als freiwilliges „Zum Spaß üben“ mit den bisherigen Erleichterungen spielbar. In der ruhigen Variante greift die automatische Timing-Rettung nicht, da kein Timingversuch stattfindet.

Der erste Kauf ist nach zwei Runden möglich. Alle fünf Fähigkeiten kosten zusammen 180 XP, also ohne Abbrüche 12–18 Runden. Beide Zweige können in beliebiger zulässiger Reihenfolge gekauft werden. Das ist die erste Balancingbasis, keine Zusage zur tatsächlichen Sitzungsdauer.

Nach allen Käufen bleiben die drei Spiele, XP-Zuwachs, Anzahl abgeschlossener Runden und Bestwert je Spiel (0–5 Bonuspunkte) erhalten. Die Übersicht zeigt „Alle ersten Fähigkeiten entdeckt“ statt eines Endbildschirms. Es gibt keinen Reset- oder Prestigezwang. Gesammeltes Restguthaben bleibt für spätere Erweiterungen nutzbar; deren Preise werden in einer eigenen Spezifikation festgelegt.

## Unterbrechung und Logbuch

Manuelles Pausieren, App-Hintergrund, Bildschirmwechsel und Sperren halten die Spielrunde an. Nach Rückkehr startet sie erst mit „Weiter spielen“. Bereits abgeschlossene Aktionen, Bonuspunkte und die Markerposition bleiben im Arbeitsspeicher erhalten. Zeit im Hintergrund beeinflusst die Runde nicht.

Beim Wechsel zum Logbuch wird pausiert, nicht abgebrochen. Ein vollständiges Neuladen oder Schließen kann eine noch unvollständige Runde verwerfen; bestätigte XP und bereits abgeschlossene, zur Speicherung vorgemerkte Runden bleiben erhalten. „Runde beenden“ erklärt, dass die unvollständige Runde keine XP bringt. Fähigkeiten werden ausschließlich zwischen Runden gekauft; auf dem zweiten Gerät erworbene Effekte gelten ab der nächsten Runde.

Laufende Stillzeiten laufen im Logbuch weiterhin anhand ihrer Zeitstempel; Logbuchentwürfe und Einstellungen bleiben beim Ansichtswechsel erhalten. Spielpausen dürfen den Stilltimer nicht pausieren.

## Gemeinsamer Spielstand und Speicherung

Es gibt genau einen gemeinsamen Spielstand für die bereits freigeschalteten Familienkonten. Ein neues oder nicht freigeschaltetes Auth-Konto hat keinen Zugriff. Beide können gleichzeitig getrennte Runden spielen und zu demselben Guthaben beitragen. Es handelt sich nicht um ein synchrones Mehrspielerspiel.

- Der Server ist maßgeblich für XP, Käufe und Freischaltungen. Gespeichert wird pro vollständiger Runde und pro Fähigkeitserwerb, nicht bei jedem Animationstakt.
- Nach Rundenende wird das Ergebnis vor der Anfrage auf dem Gerät vorgemerkt und mit einer stabilen Vorgangs-ID übertragen. Erst die Serverbestätigung zeigt „Gespeichert“ und schaltet die nächste belohnte Runde frei.
- Bei Netzverlust bleibt das Ergebnis als „Noch nicht gespeichert“ sichtbar. Ein erneuter Versuch nutzt dieselbe Vorgangs-ID; auch nach Neuladen darf dieselbe Runde nur einmal XP bringen. Falls lokales Vormerken scheitert, bleibt das Ergebnis im Speicher, und die Oberfläche warnt ausdrücklich vor dem Schließen.
- Neue Runden und Käufe benötigen eine funktionierende Verbindung. Es gibt keine unbeschränkte Offline-Warteschlange. Eine gestartete Runde darf bei Netzverlust beendet werden.
- Ein vorgemerkter Vorgang wird ausschließlich mit dem ursprünglich zugehörigen Konto erneut gesendet. Bei Abmeldung bleibt er lokal getrennt gespeichert, wird anderen Konten weder angezeigt noch mit deren Sitzung übertragen.
- Zwei parallele Runden werden beide genau einmal addiert. Ein gleichzeitig doppelt angeforderter Kauf kostet nur einmal XP. Bei verschiedenen Käufen mit unzureichendem Gesamtguthaben gelingt nur der zuerst serverseitig ausführbare Kauf; die andere Ansicht zeigt den aktuellen Stand und eine verständliche Erklärung.
- Die Ansicht aktualisiert sich beim Einstieg, Rückkehr in den Vordergrund, nach eigenen Schreibaktionen und alle 15 Sekunden, während die Übersicht oder der Skill-Tree sichtbar ist. Laufende Runden werden dadurch nicht neu aufgebaut.

## Fortschritt über neue Versionen

Spielstände besitzen eine eigene Formatversion. Fähigkeiten und Spiele verwenden dauerhaft stabile IDs unabhängig von Text, Illustration, Preis und Anzeigereihenfolge. Runde und Kauf besitzen zusätzlich eine Regelversion.

Neue Inhalte ergänzen bestehende Spielstände mit sinnvollen Standardwerten. Sie dürfen bestätigte Gesamt-XP, vorhandenes Guthaben, erworbene Fähigkeiten und Statistik nicht auf null setzen. Spätere Preisänderungen führen weder zu Nachzahlungen für gekaufte Fähigkeiten noch zu rückwirkenden Änderungen abgeschlossener Belohnungen. Entfernte Fähigkeiten bleiben als erworbener Fortschritt nachvollziehbar oder werden durch eine dokumentierte gleichwertige Nachfolgefähigkeit ersetzt.

Ein Client mit unbekannter neuer Spielstandversion schreibt nichts und fordert zum Aktualisieren auf. Unbekannte Fähigkeits-IDs werden niemals durch einen alten Client entfernt. Ein fehlerhafter Spielstand führt zu einer erklärten Fehlermeldung, nicht zur automatischen Neuanlage. Vorgemerkte ältere Runden müssen auch nach Updates mit ihrer ursprünglichen Regelversion genau einmal abrechenbar bleiben. Kompatible Regeldefinitionen bleiben dafür erhalten.

Vor jedem späteren Release mit Datenänderungen sind Migration und Wiederholung anhand gespeicherter synthetischer Altstände zu prüfen. Die hier verlangte Weiterverwendbarkeit gilt für bestätigten Fortschritt; ein Geräteverlust vor erfolgreicher Übertragung kann ein nur lokal vorgemerktes Ergebnis verlieren.

## Modulgrenze und Randbedingungen

Eigenes Spielmodul, eigene Styles, eigene Spieltabellen und expliziter Integrationseinstieg. Wiederverwendet werden Anmeldung und bestehende Zulassungsprüfung. Keine Spielaktionen erzeugen Logbucheinträge; keine Logbuchereignisse bringen XP. Spielstand enthält keine echten Baby- oder Gesundheitsdaten.

Das Modul darf deaktiviert oder ausgebaut werden, ohne Logbuch, Bericht, Einstellungen oder deren Daten zu verändern. Ein Ladefehler im Modul zeigt einen Rückweg zum Logbuch. Spieltabellen werden beim Ausbau nicht automatisch gelöscht. Bestehende PWA, Hosting und Budget 0 € bleiben erhalten.

## Akzeptanzkriterien

| ID | Bezug | Prüfbares Ergebnis |
| --- | --- | --- |
| AC-001 | REQ-001 | Beide Startspiele und ein Kauf sind auf echten Smartphones einhändig im Hochformat spielbar; 320–430 CSS-Pixel erzeugen keinen horizontalen Überlauf. |
| AC-002 | REQ-002, REQ-003 | Fünf abgeschlossene Aktionen ergeben genau 10 plus Bonus-XP; abgebrochene Runden ergeben 0. Käufe prüfen Preis und Voraussetzung und reduzieren nur das Guthaben. |
| AC-003 | REQ-004 | Alle fünf Effekte entsprechen der Tabelle; Greifspiel wird genau nach `self_pacifier` verfügbar, Schnullerspiel bleibt spielbar. |
| AC-004 | REQ-005 | Spielaktionen verändern keine Logbuchdaten. Deaktivierter Einstieg und entferntes Modul lassen Logbuchtests und Build erfolgreich laufen. |
| AC-005 | REQ-006 | Zwei erlaubte synthetische Konten sehen nach Anmeldung denselben bestätigten Fortschritt; anonyme und fremde Konten können weder lesen noch schreiben. |
| AC-006 | REQ-001 | Hintergrundwechsel für mindestens 30 Sekunden hält Spielposition und Fortschritt an; nur explizites Fortsetzen startet die Runde. Ohne-Timing-Variante bleibt vollständig spielbar. |
| AC-007 | REQ-005 | Laufende Stillzeit und ungespeicherte Ereignis- sowie Einstellungsentwürfe bleiben bei Einstieg, Rückkehr und Spiel-Ladefehler erhalten. |
| AC-008 | REQ-008 | Wiederholung derselben Runde nach verlorener Antwort und Neuladen vergibt einmal XP; zwei verschiedene parallele Runden werden beide addiert. |
| AC-009 | REQ-008 | Parallele gleiche Käufe kosten einmal; konkurrierende verschiedene Käufe erzeugen kein negatives Guthaben und löschen keine Freischaltung. |
| AC-010 | REQ-007 | Synthetischer Altstand mit XP, Restguthaben, Fähigkeiten und Statistik bleibt nach Migration erhalten. Zweite Migration ändert ihn nicht erneut; unbekannte Version verhindert Schreiben. |
| AC-011 | REQ-007, REQ-008 | Vorgemerkte alte Runde wird nach Versionswechsel nach ihren ursprünglichen Regeln genau einmal verbucht; Kontoänderung überträgt keinen fremden lokalen Vorgang. |
| AC-012 | REQ-009 | Nach allen fünf Käufen lassen sich alle drei Spiele wiederholen, zusätzliche XP und Bestwerte bleiben über Neuanmeldung erhalten. |
| AC-013 | REQ-001, REQ-002 | Gespräch und Greifspiel erlauben unbegrenzt Zeit und Wiederholungen. Falsche Antworten beeinflussen nur den Bonus der betroffenen Aktion; kein XP-Abzug. |
| AC-014 | REQ-008 | Netzverlust, fehlgeschlagenes lokales Vormerken und abgelaufene Anmeldung zeigen den tatsächlichen Speicherstand; es wird kein bestätigter Erfolg vorgetäuscht. |

## Spielprobe und spätere Entscheidungen

Vor der ersten Veröffentlichung je eine kurze Spielprobe mit beiden Nutzern: Beide Startspiele spielen, erste Fähigkeit kaufen und deren Effekt erleben; anschließend den Übergang zum Greifspiel ausprobieren. Auf echten Zielgeräten Bedienung und Lesbarkeit prüfen. Ohne Tracking gemeinsam beantworten: War die Bedienung entspannt? War die neue Fähigkeit spürbar? Wollten wir freiwillig noch eine Runde spielen?

Wenn die Antwort negativ ausfällt, Mechanik oder Balancing gezielt überarbeiten und dokumentieren. Spaß ist durch Tests allein nicht nachweisbar. Weitere Fähigkeiten, Minispiele und ein längerer Entwicklungsbogen folgen erst nach dieser Rückmeldung; vorhandener Fortschritt bleibt dabei erhalten.

## Wesentliche Änderungen

- 18. September 2026: Erste Idee und Vorschläge separat aufgenommen.
- 18. September 2026: Nutzerentscheidungen übernommen; Regeln, Wiederholbarkeit, gemeinsame Speicherung und Updatebeständigkeit ausgearbeitet. Nutzer hat abschließend ausdrücklich nur Spezifikation und Commit beauftragt.
