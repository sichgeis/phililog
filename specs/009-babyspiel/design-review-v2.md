# Designreview und Verbesserungsvorschlag für „Kleine Schritte“

Stand: 18. September 2026. **Erster Schritt freigegeben:** Der Nutzer hat anschließend die empfohlene Schnuller-Überarbeitung mit zwei Musterstufen zur Umsetzung und Veröffentlichung beauftragt. Verbindliche Regeln stehen im V2-Zusatz von `spec.md`; Baby-Echo, Greifpuzzle und weitere Muster bleiben Vorschläge. Die folgende Diagnose beschreibt die ursprüngliche V1. Grundlage sind das Nutzerfeedback „langweilig / überhaupt nicht herausfordernd“, die tatsächlichen Regeln in `src/game/rules.ts` und `src/game/index.ts` sowie die unten verlinkten Primärquellen.

## Diagnose

Der erste Prototyp erfüllt technische Kriterien, aber seine Aufgaben verlangen kaum Übung, Entscheidungen oder Aufmerksamkeit. „Gemütlich“ wurde im Entwurf zu stark als garantierter Erfolg ausgelegt. Freundliche Stimmung und jederzeitiges Pausieren können bleiben, während eine einzelne Runde durchaus schwierig werden darf.

| Aktuelle Regel | Folge für das Spielen |
| --- | --- |
| Schnuller: 2,5 Sekunden pro Strecke, Trefferzone 40 %, später 60 %. | Das Trefferfenster beträgt bei gleichförmiger Bewegung ungefähr 1 bzw. 1,5 Sekunden pro Durchgang. Präzision spielt kaum eine Rolle. |
| Schnuller: unbegrenzt wiederholen; jeder spätere Timingtreffer gibt weiterhin den vollen Bonus. | Langfristig erreicht auch eine fehlerreiche Runde 15 XP und 5/5 Bonus. Der Bestwert trennt Können und bloßes Wiederholen praktisch nicht. |
| Babygespräch: eine dauerhaft sichtbare Silbe aus zwei bzw. drei beschrifteten Antworten auswählen. | Die Lösung ist gleichzeitig sichtbar. Es fehlen Gedächtnis, Interpretation, Rhythmus oder ein anderes Problem, das man meistern könnte. |
| Greifspiel: ein einzelnes ruhendes Ziel in vier Feldern, ohne Zeitdruck. | Die zufällige Position verändert den Fingerweg, aber kaum die Entscheidung. |
| Nach fast jeder Aktion ein zusätzlicher „Weiter“-Knopf. | Die kurzen Rückkopplungen werden ständig durch eine Bestätigung unterbrochen. Es entsteht wenig zusammenhängendes Spielgefühl. |
| Upgrades vergrößern Fenster, retten Fehler und ersetzen zwei von fünf Gesprächsaktionen durch garantierte Erfolge. | Die wenigen Anforderungen verschwinden mit der Entwicklung weiter. Das neue Greifspiel schafft dafür keinen ausreichenden Ersatz. |
| Fünf Käufe kosten zusammen 180 XP, danach bleibt vor allem das weitere Sammeln. | Ein zunächst kurzer Freischaltweg endet ohne neue Regelprobleme oder anspruchsvolle Leistungsziele. Höhere Preise allein würden denselben Inhalt strecken. |

Das ist eine Diagnose des Codes und eine Erklärungshypothese für das Feedback, kein Ergebnis einer großen Nutzerstudie. Die bisherigen automatisierten Tests belegen Korrektheit, nicht Spielspaß.

## Was sich aus der Recherche ableiten lässt

### 1. Jede kurze Schleife braucht etwas, das man lernen kann

Daniel Cook beschreibt eine Interaktionsschleife aus Entscheidung, Handlung, Simulation, Rückmeldung und dem daraus entstehenden Verständnis. Sein Modell hilft zu prüfen, welche Fähigkeit eine Wiederholung tatsächlich trainiert. Bei unserem Babygespräch gibt es nach dem ersten Verstehen kaum noch etwas zu lernen. Anwendung: Für jedes Minispiel zuerst benennen, worin ein geübter Spieler besser wird. [Daniel Cook, The Chemistry of Game Design, ursprünglich 2007, wiederveröffentlicht 2021](https://lostgarden.com/2021/03/13/the-chemistry-of-game-design-2/).

### 2. Wiederholung wird durch veränderte Situationen interessant

Raph Koster unterscheidet die unmittelbare Handlungsschleife von der fortschreitenden Folge neuer Problemsituationen. Verständliche Rückmeldung und Variation ermöglichen, Vermutungen zu prüfen und Vorgehensweisen zu verbessern. Anwendung: Dieselbe einfache Eingabe bekommt andere lesbare Muster und Entscheidungen; bloß neue Farben oder immer höhere Zahlen reichen für unseren Anspruch nicht. [Raph Koster, Game design is simple, actually, 2025](https://www.raphkoster.com/2025/11/03/game-design-is-simple-actually/).

### 3. Leichter Einstieg und anspruchsvolle Ziele können zusammenpassen

Die Entwickler von HarmoKnight beschreiben optionale, schwieriger platzierte Ziele, die geübte Spieler für höhere Punktzahlen ansteuern können. Einfachere Wege bleiben spielbar. Anwendung: Ein normaler Treffer soll erreichbar sein; eine perfekte Serie soll Präzision verlangen. So können gemütliche Atmosphäre und freiwillige Herausforderung nebeneinander bestehen. [Nintendo / GAME FREAK, Iwata Asks: Simple Controls, Deep Gameplay](https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-HarmoKnight/HarmoKnight/2-Simple-Controls-Deep-Gameplay/2-Simple-Controls-Deep-Gameplay-722796.html).

### 4. Gefühltes Können und eigene Wahl sind relevant

Ryan, Rigby und Przybylski berichten in vier Studien Zusammenhänge zwischen wahrgenommener Kompetenz, Autonomie und Spielvergnügen; in der untersuchten Mehrspielergruppe auch sozialer Verbundenheit. Daraus folgt keine garantierte Rezeptur und insbesondere kein optimales Zeitfenster. Anwendung als Designhypothese: Verbesserung muss erkennbar sein, und die Spieler sollten passende Aufgaben und Schwierigkeitsstufen wählen können. Ausgewertet wurde der frei zugängliche Abstract, nicht der vollständige kostenpflichtige Artikel. [The Motivational Pull of Video Games, 2006](https://link.springer.com/article/10.1007/s11031-006-9051-8).

### 5. Kurze Spiele brauchen besonders klare Signale

Die WarioWare-Entwickler schildern die Schwierigkeit, eine Aufgabe innerhalb weniger Sekunden verständlich zu machen. Anwendung: Anforderungen eindeutig zeigen, eine neue Regel kurz vormachen und sie erst danach kombinieren. Schwierigkeit soll aus dem Spielen entstehen; unklare Symbole und überraschende Regelwechsel wären vermeidbare Hürden. [Nintendo, Iwata Asks: WarioWare – „This is ridiculous“ is the best compliment](https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Wii/Iwata-Asks-WarioWare-Smooth-Moves/2-This-is-ridiculous-is-the-best-compliment/2-This-is-ridiculous-is-the-best-compliment-228514.html).

Die Entwicklertexte sind begründete Erfahrungsmodelle und Beispiele. Gemeinsam mit der Studie liefern sie gute Entwurfswerkzeuge, aber keinen Beweis, dass unser nächster Entwurf automatisch Spaß macht. Sämtliche konkreten Zahlen und Mechaniken im Folgenden sind eigene, noch zu erprobende Vorschläge.

## Empfohlene Richtung

**Freundliches Babythema, kurze anspruchsvolle Spielrunden und nachvollziehbare Entwicklung.** Einhändige Bedienung und jederzeitiges Pausieren bleiben. Ein Fehlschlag darf eine Serie kosten; erworbene Fähigkeiten, angesparte XP und das Wohlergehen der Spielfigur stehen dabei nicht auf dem Spiel.

Drei unterschiedliche Formen von Herausforderung:

- Schnuller: Timing und vorausschauendes Erkennen kurzer Muster.
- Babygespräch: Folgen merken und korrekt wiedergeben.
- Greifspiel: Reihenfolge planen und Folgen eigener Züge berücksichtigen.

Damit entsteht eine Auswahl für unterschiedliche Aufmerksamkeit und Tagesform. Wir müssen nicht jedes Spiel zu einem Reaktionstest machen.

## Vorschlag A: Schnuller als zusammenhängende kurze Herausforderung

Dies ist der **empfohlene erste Umbau**, weil die bestehende Mechanik dafür den kürzesten Weg bietet.

### Ablauf

Eine Runde hat zwölf Gelegenheiten und dauert grob 30–45 Sekunden. Nach jeder Gelegenheit folgt die nächste automatisch mit kurzer Reaktion; kein „Weiter“ zwischen einzelnen Treffern. Der erste Tipp innerhalb einer aktiven Gelegenheit entscheidet. Zu früh, zu spät oder gar nicht tippen kann einen Fehlschlag ergeben; dieselbe Gelegenheit wird nicht bis zum Erfolg wiederholt. Außerhalb der klar angezeigten Eingabephase werden versehentliche Berührungen nicht gewertet.

Der bekannte Marker kann zunächst bleiben. Im Mittelpunkt stehen lesbare Vorankündigung, ein normales und ein kleineres perfektes Trefferfenster sowie sofortige Rückmeldung: „zu früh“, „genau richtig“, „zu spät“. Später kann dieselbe Regel als sichtbares Schnuller-Andocken in der Babyillustration dargestellt werden.

### Leistungsunterschiede und Spannung

- Normaler Treffer: 100 Rundenpunkte; perfekter Treffer: 200.
- Nach drei aufeinanderfolgenden erfolgreichen Gelegenheiten steigt der Multiplikator für die nächste Gelegenheit auf 1,5; nach sechs auf 2. Ein Fehler setzt nur den Multiplikator zurück. Bereits erreichte Rundenpunkte bleiben.
- Als erste Testwerte: normales Zeitfenster ±250 ms, perfektes Fenster ±90 ms. Diese Zahlen sind keine recherchierte Empfehlung; wir kalibrieren sie auf euren iPhones.
- Ein früher sicherer Tipp kann die Serie erhalten; wer die Mitte anpeilt, riskiert einen schlechteren Ausgang für mehr Punkte. Der perfekte Bereich muss sichtbar sein.
- Nicht jeder Fehler beendet die Runde. Die Runde kann mit geringer Bewertung abgeschlossen werden und sofort erneut gespielt werden.

### Variation statt bloßer Beschleunigung

Drei auswählbare Musterstufen: gleichmäßiges Andocken; klar angekündigter Wechsel zwischen langsam und schnell; anschließend eine angekündigte Niespause, bei der bewusst nicht getippt werden soll. Korrektes Abwarten zählt als normaler Erfolg. Jede neue Regel wird zuerst isoliert vorgemacht. Keine unvorhersehbare Beschleunigung unmittelbar vor dem Treffer.

Muster sind für eine Stufe kuratiert und bei „Noch einmal“ wiederholbar. Dadurch kann man üben. Varianten folgen innerhalb nachvollziehbarer Grenzen, damit Auswendiglernen nicht die einzige Fähigkeit bleibt. Eine höhere Stufe wird angeboten, nicht ungefragt aktiviert.

### Feedback und Humor

Ein Treffer dockt sichtbar an; ein perfekter Treffer erzeugt eine kurze besondere Babyreaktion. Bei einem Fehlversuch landet der Schnuller beispielsweise auf der Mütze. Diese Rückmeldung zeigt die Wirkung der Handlung. Zusätzlicher Text kann sparsam variieren. Dekorative Effekte dürfen das nächste Signal nicht verdecken.

## Vorschlag B: Babygespräch als „Baby-Echo“

Das Baby zeigt nacheinander eine kurze Silbenfolge, etwa **Ah – Oh – Ah**. Danach verschwindet die Folge, und man antwortet mit den großen, räumlich stabilen Silbentasten. Die Leistung liegt im Merken und Wiedergeben; es braucht dafür zunächst keinen Eingabe-Zeitdruck und keinen Ton.

Eine Runde umfasst drei Phrasen. Die Einstiegsstufe verwendet drei Silben pro Phrase, spätere Stufen vier bis sechs. Zunächst zwei unterschiedliche Silben, durch „Gegenüber fixieren“ optional drei. Bei einer falschen Eingabe endet die Phrase mit einer freundlichen Reaktion; die nächste beginnt nach kurzer klarer Vorschau. Keine Endlosschleife bis zur garantiert richtigen Antwort.

Eine Wiederholhilfe pro Runde lässt die Phrase noch einmal zeigen; die Phrase kann danach normal abgeschlossen werden, erhält aber keine Perfektwertung. „Bewusst lächeln“ könnte diese Hilfe freischalten, statt zwei Aufgaben ersatzlos zu entfernen. Das wäre eine ausdrücklich abzustimmende Änderung des bisherigen Fähigkeitseffekts.

Später kann ein separater Rhythmusmodus dazukommen. Für den ersten Umbau ist Merken allein genug; Reihenfolge, Länge und Rhythmus gleichzeitig einzuführen wäre unnötig schwer zu diagnostizieren.

## Vorschlag C: Greifspiel als kleines Reihenfolge-Puzzle

Ein 3×3-Feld zeigt mehrere Spielzeuge statt eines einzelnen Sterns. Oben steht eine Wunschfolge, etwa **Stern – Ring – Stern**. Mit drei Griffen soll man sie erfüllen. Nach jedem Griff rutschen Spielzeuge derselben Spalte nach unten; der obere Platz bleibt für dieses Puzzle leer. Alle nötigen Informationen sind von Beginn an sichtbar, und während des Puzzles kommen keine zufälligen neuen Teile hinzu.

Die Entscheidung lautet: **Welchen passenden Stern nehme ich zuerst, damit Ring und zweiter Stern danach erreichbar bleiben?** Für einen ersten Regelentwurf sind nur Spielzeuge in der untersten belegten Position einer Spalte greifbar. Jedes Startbrett wird auf mindestens einen Lösungsweg geprüft. Ein Zug lässt sich zur Übung zurücknehmen; eine perfekte Wertung verlangt eine Lösung ohne Rücknahme.

Ein kleines prüfbares Beispiel, von oben nach unten gelesen:

| Reihe | Linke Spalte | Mitte | Rechts |
| --- | --- | --- | --- |
| Oben | leer | leer | leer |
| Mitte | Ring | Mond | Mond |
| Unten | Stern | Stern | Wolke |

Für „Stern – Ring – Stern“ muss zuerst der linke Stern genommen werden: Dadurch wird der Ring greifbar, anschließend passt der mittlere Stern. Wer zuerst den mittleren Stern nimmt, hat als zweiten Zug keinen erreichbaren Ring. Die Aufgabe enthält damit eine echte Entscheidung, obwohl die Eingabe weiterhin nur ein Tipp ist.

Das ist ein stärkerer Umbau als beim Schnuller. Vor Umsetzung sind mehrere Beispielbretter von Hand durchzuspielen. Ein Boardgenerator ist zunächst unnötig; eine kleine kuratierte Sammlung mit Spiegelungen und Farb-/Symbolvarianten reicht zur Spielprobe. Diese Mechanik ist ein Kandidat, keine bewiesene Verbesserung.

## Gameplay-Loop und Progression

Die Wiederholung sollte auf drei Zeitskalen tragen:

| Zeitraum | Spielerfrage | Gestaltung |
| --- | --- | --- |
| Sekunden | „Wie löse ich diesen Moment besser?“ | Eindeutige Aufgabe, eigene Handlung, unmittelbare informative Rückmeldung. |
| Eine Runde | „Schaffe ich diese Serie oder dieses Muster?“ | Endlicher Versuch, Rundenpunkte, nachvollziehbare Wertung und schneller Neustart. |
| Mehrere Sitzungen | „Welche neue Möglichkeit probieren wir als Nächstes?“ | Neue Muster, optionale Stufen, Fähigkeiten und sichtbare gemeinsame Entwicklung. |

Vorgeschlagene Schleife: **Spiel und Stufe wählen → zusammenhängende Runde → konkrete Leistung sehen → erneut versuchen oder neue Möglichkeit freischalten.** Nach der Runde stehen zunächst „Noch einmal“ und „Andere Herausforderung“ im Vordergrund. Ein Skill-Tree-Besuch ist nicht nach jeder Runde nötig.

### XP und Spielkönnen getrennt ausdrücken

XP bleiben gemeinsame Fortschrittswährung. Rundenpunkte und Abzeichen zeigen die Leistung eines konkreten Spiels auf einer konkreten Stufe. Tausend Rundenpunkte müssen nicht tausend XP bedeuten. Als Ausgangspunkt behalten wir 10 Grund-XP pro vollständig durchgespielter Runde und höchstens 5 Leistungs-XP bei; die Bonusberechnung wird anhand der neuen Regeln festgelegt. Fehlversuche können Teil einer abgeschlossenen Runde sein, aber bloßes Starten und sofortiges Abbrechen erzeugt keine Belohnung.

Gold, Silber und Bronze erhalten transparente Bedingungen. Für den ersten Schnullertest könnten beispielsweise normale Treffer und perfekte Treffer getrennt zählen. Die Schwellen sollen nach wenigen Probeversuchen kalibriert werden; eine Runde mit Fehlern darf weiter als Fortschritt zählen, ohne automatisch den Bestwert zu erreichen.

Für den ersten Umbau keine neue Währung, keine Tagespflichten und keinen viel größeren XP-Baum einführen. Mehr Kaufpreise würden die fehlende Herausforderung nicht beheben. Nach allen bisherigen Käufen tragen zunächst unterschiedliche Musterstufen und erreichbare Leistungsziele die Wiederholbarkeit. Ob das längerfristig reicht, muss die Spielprobe zeigen.

### Fähigkeiten sollen Möglichkeiten hinzufügen

| Vorhandene Fähigkeit | Vorgeschlagene Weiterentwicklung |
| --- | --- |
| Hände entdeckt | Normales Trefferfenster bleibt relativ großzügiger, perfektes Fenster wächst nicht mit. Erfolg wird leichter, Meisterschaft bleibt anspruchsvoll. |
| Gezielt greifen | Ein Fehler kann weiterhin aufgefangen werden, zählt aber als normaler geretteter Treffer und nicht als perfekte Leistung. |
| Schnuller selbst holen | Greifspiel bleibt freigeschaltet; Schnullerspiel freiwillig weiter verfügbar. Automatisierung bleibt ein Übergang zu anderer Beschäftigung. |
| Gegenüber fixieren | Öffnet Varianten mit einer dritten Silbe. Spieler wählen den komplexeren Modus selbst. |
| Bewusst lächeln | Kandidat: einmalige Wiederholungshilfe im Baby-Echo; keine zwei garantierten Antworten mehr. |

Die Effekte werden damit teilweise neu ausbalanciert. **Besitz erhalten bedeutet nicht, geänderte Effekte stillschweigend als unverändert auszugeben.** Die konkreten Umdeutungen gehören vor Umsetzung in die abgestimmte V2-Spezifikation und später sichtbar in die Änderungsinformation.

Eine spätere Erweiterung des Baums sollte pro Kauf beantworten: Welche neue Handlung, Entscheidung oder Aufgabe wird dadurch interessant? Rein kosmetische Entdeckungen können ergänzen; sie ersetzen die spielerische Entwicklung nicht.

## Smartphone, Unterbrechungen und Bestandsschutz

- Pausen bleiben jederzeit möglich; Hintergrundwechsel pausiert sofort. Wiederaufnahme mit kurzem sichtbarem Countdown, nicht mitten in einem Wertungsfenster.
- Während einer Pause läuft keine gewertete Zeit. Ein unterbrochener Echo-Vortrag startet bei Fortsetzung erneut. Während der eigenen Antwort bleiben Eingaben erhalten; eine ausdrücklich gewählte Wiederholung zählt wie sonst als Hilfe. Pausieren allein reduziert keine Wertung, aber Pausieren erzeugt auch keinen unbegrenzten kostenlosen Lösungsblick.
- Timing wird gegen die tatsächliche Eingabezeit ausgewertet, nicht gegen einen möglicherweise verspäteten Animationsframe. Eingaben, Touch-Latenz und 60-/120-Hz-Anzeigen auf den Zielgeräten prüfen.
- Alle Signale funktionieren visuell, ohne Ton. Tastenpositionen bleiben stabil, mindestens 48 × 48 Pixel. Höhere Schwierigkeit darf nicht aus kleineren Tippflächen entstehen.
- Der bisherige ruhige Modus bleibt als Übungs-/Entspannungsoption zugänglich. Seine Ergebnisse sind getrennt von anspruchsvollen Wertungen; ein Moduswechsel mitten in einer gewerteten Runde darf keinen Bewertungswechsel ausnutzen.
- Gemeinsames Baby, XP-Guthaben, Gesamt-XP, bisherige Fähigkeits-IDs und Erwerbe bleiben erhalten. Keine erneuten Käufe derselben Fähigkeiten und kein Reset.
- V1-Bestwerte 0–5 bleiben als historische Ergebnisse erhalten. Neue Rundenwerte getrennt nach Regelversion, Spiel, Stufe und relevanten Hilfen speichern; alte Werte nicht in neue Punkte umdeuten.
- Alte vorgemerkte Runden weiterhin nach V1 genau einmal verbuchen. Die neue Version benötigt eine additive Migration und versionsabhängige Serverregeln, keine Änderung der veröffentlichten Migration 017.

## Empfohlene nächste Iteration

1. **Zunächst nur Schnuller V2 spielbar machen:** zusammenhängende Runde, begrenzte Chancen, zwei Trefferqualitäten, Serie, präzise Rückmeldung und zwei Musterstufen. Keine zusätzlichen Minispiele oder neue XP-Ökonomie gleichzeitig entwickeln.
2. **Kurze direkte Vergleichsprobe:** je Person wenige Runden V1 und V2, Reihenfolge zwischen Personen wechseln. Zuerst V2 auch ohne angezeigte XP spielen lassen. Beobachten, ob die Runde selbst einen erneuten Versuch auslöst.
3. **Erst bei positivem Ergebnis übertragen:** Baby-Echo ausarbeiten, danach den Greifpuzzle-Kandidaten prüfen. Erweiterte Progression folgt aus den Mechaniken, die tatsächlich tragen.

Fragen für die Spielprobe: Könnt ihr erklären, warum ein Versuch misslang? Lässt sich ein konkreter besserer nächster Versuch planen? Unterscheiden sich erste und spätere Versuche? Wird Gold nicht sofort verschenkt, bleibt aber erreichbar? Möchtet ihr auch ohne nächsten Kauf noch einmal spielen? Lässt sich das Ganze einhändig unterbrechen und fortsetzen?

Mit zwei Testpersonen sind das qualitative Hinweise, keine statistischen Belege. Wenn nur die Belohnung zum Weiterspielen motiviert oder Fehler willkürlich wirken, wird die Mechanik erneut geändert, bevor weitere Inhalte gebaut werden.

## Ursprüngliche Empfehlung zur Abstimmung

Empfehlung: zuerst Schnuller V2 wie oben. Zu entscheiden ist vor allem, ob zeitliche Präzision plus Serien eure gewünschte Herausforderung trifft oder ob ihr lieber zuerst Gedächtnis/kleine Rätsel vertiefen möchtet. Danach werden die ausgewählten Regeln und Bestandsmigration in `spec.md`, `plan.md` und `tasks.md` konkret freigegeben.
