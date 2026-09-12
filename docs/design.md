# Gestaltung – Aquarellfarben der Geburtskarte

## Gestaltungsauftrag

Am 12. September 2026 gewünscht: Die App soll die Blau-, Türkis- und Violetttöne sowie den Aquarellcharakter der Geburtskarte aufgreifen. Ein privates Referenzfoto wurde dazu angesehen. Das Foto und der individuelle Fußabdruck werden nicht als App-Asset verwendet und nicht ins Repository übernommen.

## Gemeinsame Leitlinien

- Warmes Papierweiß als ruhige Grundfläche.
- Transparente, leicht unregelmäßige Farbflächen vor allem im Kopfbereich; klare, nahezu weiße Eingabeflächen.
- Dunkle Schrift und kräftige Aktionsfarben aus derselben Farbfamilie, damit Pastellflächen die Lesbarkeit nicht beeinträchtigen.
- Zurückhaltende Serifenschrift in Überschriften; vertraute Systemschrift für Eingaben.
- Auswahlzustände zusätzlich durch Kontur, Beschriftung und Symbole erkennbar.
- Keine zusätzlichen Bilddownloads, externen Schriftarten oder Tracking-Dienste. Der Aquarelleindruck lässt sich aus CSS-Farbschichten und einem kleinen SVG-Filter erzeugen.

## Drei Vorschläge zur Auswahl

| Richtung | Papier | Aktionsfarbe | Türkis | Blau | Violett | Charakter |
| --- | --- | --- | --- | --- | --- | --- |
| Aquarell – empfohlen | `#FAF9F6` | `#4B579A` | `#83CED9` | `#85B6DF` | `#B1A4D6` | Nahe an der Karte: Indigo als Halt, durchscheinende kühle Farbtöne auf warmem Papier. |
| Meereslicht | `#F7FBFB` | `#237987` | `#79CBD0` | `#A1CCE7` | `#C3BAE1` | Heller und frischer, Türkis führt; Violett bleibt Nebenfarbe. |
| Lavendel | `#FBF9FD` | `#765A99` | `#A0D5DC` | `#A6BFE0` | `#BDA5D8` | Weicher und stärker violett, mit hellblauen und türkisfarbenen Übergängen. |

## Stand

Für den anschließenden autonomen Veröffentlichungsauftrag wurde die empfohlene Richtung Aquarell als erste Gestaltung umgesetzt. Die beiden anderen Varianten bleiben Alternativen. Die Vorschau zeigt eine verkürzte Eingabe mit erfundenen Beispieldaten; sie dient dem Farb- und Stilvergleich und speichert keine Daten.

Die Aquarellfarben sind konsistent in Eingabe, Historie, Anmeldung, Dialogen und App-Symbolen übernommen. Die bestehenden fachlichen Anforderungen bleiben maßgeblich.

## Prüfung der Vorschläge

Alle drei Farbrichtungen wurden im Browser gerendert und visuell geprüft. Die Vorschau passt bei 320 px Inhaltsbreite ohne horizontalen Überlauf. Weißer Text auf den drei Aktionsfarben erreicht rechnerisch Kontrastverhältnisse von 6,71:1, 5,05:1 und 5,69:1. Begleittext auf dem jeweiligen Papierhintergrund liegt zwischen 4,83:1 und 5,04:1. Das ist keine vollständige Barrierefreiheitsprüfung; diese folgt für die ausgewählte echte App-Gestaltung.

## Neue Icon-Vorschläge

[Fünf Aquarell-Entwürfe](icon-proposals/index.html): Herz, io-Monogramm (Empfehlung), Tropfen, Geborgenheit und Blüte. Alle als eigene SVG-Dateien mit Papierweiß und transparenten Blau-/Türkis-/Violettflächen. Die Galerie zeigt zusätzlich Größen von 64 und 32 Pixeln. Die spätere Auswahl ist unten dokumentiert.

## Icon-Iteration: IO und Blütenfarben

Auf Wunsch kombiniert [Entwurf 6](icon-proposals/io-bluete.html) das Monogramm mit großem I mit den fünf überlappenden Farbschichten der Blüte. Breitere transparente Blätter schaffen eine ruhige Mitte für die weißen, als Vektorpfade gezeichneten Buchstaben IO. Diese Blüteniteration bleibt ein ungewählter Entwurf.

## Gewähltes App-Icon

Ausdrücklich ausgewählt wurde der ursprüngliche große Aquarell-Klecks aus Entwurf 2: ein Farbverlauf mit weißem **Io**, großem I und kleinem o. `public/icon.svg` ist die Vektorquelle; daraus wurden die PNGs für PWA und Apple gerendert und visuell geprüft. Neue Icon-Dateinamen helfen bei der Aktualisierung bestehender Browser-Caches.

## Schriftvarianten auf dem Aquarell-Klecks

Erneuter Gestaltungsauftrag: drei Varianten mit serifenlosem I im Io-/IO-Schriftzug sowie je fünf Phi- und P-Varianten. Die [Vergleichsgalerie](icon-proposals/lettering/index.html) zeigt den identischen bestehenden Klecks mit weißen oder indigofarbenen Vektorzeichen in großen und kleinen Größen. Alle Zeichen sind als Pfade angelegt, ohne externe Schriftdateien. Die Auswahl ist offen; dies sind Entwürfe, keine Änderung des produktiven Icons.

## Finale Auswahl: Φ 1 · Klar

Das erste Phi der zweiten Galeriezeile wurde zur direkten Veröffentlichung ausgewählt. Weißes großes Phi mit rundem Abschluss auf dem bisherigen Aquarell-Klecks, unverändert aus `lettering/phi-1.svg` übernommen. Browser-, PWA- und Apple-Icons erhalten neue Phi-Dateinamen zur Cache-Aktualisierung.
