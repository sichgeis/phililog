import test from 'node:test';
import { zPercentile } from '../src/percentile.ts';
import assert from 'node:assert/strict';
import { growthPoints, defaultInterval, intervalChange, velocityComparison, velocityPosition, weightZScore, whoZScore, weightForLength, monthDay } from '../src/growth.ts';
import { WHO_WEIGHT_LMS, WHO_LENGTH_LMS, WHO_VELOCITY } from '../src/data/who-growth-girls.ts';
import { newDraft, feedingInput, draftFromFeeding, sameInput, toCsv, optionalBirthWeight } from '../src/domain.ts';
import { weightComparison } from '../src/weight.ts';
import { growthChart } from '../src/growth-view.ts';
import type { Feeding } from '../src/domain.ts';
const birth = '2025-01-01';
const entry = (days: number, weight = 3500, length: number | null = null, id = `w${days}`) => ({ id, kind:'weight', occurred_at: new Date(Date.parse('2025-01-01T12:00:00Z')+days*86400000).toISOString(), weight_g:weight, length_cm:length } as Feeding);
const point = (days: number, grams=3500) => growthPoints([entry(days,grams)],birth,'who')[0];

test('WHO-LMS reproduziert Originalperzentile, Median und Randbereich ohne Normalannahme',()=>{
 assert.equal(WHO_WEIGHT_LMS.length,1857); assert.equal(WHO_LENGTH_LMS.length,131); assert.equal(WHO_VELOCITY.length,97);
 assert.ok(Math.abs(weightZScore(3232.2,0)!)<1e-12);
 assert.ok(Math.abs(weightZScore(2678,0)! + 1.2815516)<.002);
 assert.ok(Math.abs(weightZScore(3853,0)! - 1.2815516)<.002);
 assert.ok(Math.abs(whoZScore(1000,[0,3,0.1])!+8.2300301)<.001); // WHO extreme rule, not unbounded logarithm.
 assert.equal(weightZScore(3500,1857),null); assert.equal(weightZScore(3500,-1),null); assert.equal(weightZScore(NaN,0),null);
 assert.equal(weightZScore(0,0),null); assert.equal(weightZScore(3500,0.5),null);
});
test('Gewicht zur Länge nutzt Stützwerte, interpoliert und hat harte Längengrenzen',()=>{
 assert.ok(Math.abs(weightForLength(2460.7,45)!)<1e-12);
 assert.ok(Math.abs(weightForLength(2503.2,45.25)!)<1e-9);
 assert.ok(weightForLength(3500,110)!<0);
 for(const cm of [44.9,110.1,NaN]) assert.equal(weightForLength(3500,cm),null);
 assert.equal(weightForLength(-1,50),null);
});
test('Verlauf sortiert echte Zeiten, schließt ungeeignete Daten aus und respektiert zwei Jahre',()=>{
 const points=growthPoints([entry(14),entry(0,3000,50),entry(-1),entry(2200),entry(7,3200),entry(800,9000,80),entry(1,NaN)],birth,'who',Date.parse('2030-01-01Z'));
 assert.deepEqual(points.map(p=>p.days),[0,7,14,800]); assert.ok(points[0].lengthZ!==null);assert.equal(points.at(-1)!.lengthZ,null);
 assert.deepEqual(growthPoints([entry(0)],null,'who'),[]);
 assert.deepEqual(growthPoints([entry(0)],birth,'who',Date.parse('2024-12-31Z')),[]);
 const who=growthPoints([entry(14)],birth,'who')[0],kiggs=growthPoints([entry(14)],birth,'kiggs')[0];
 assert.equal(who.z,kiggs.z);assert.notEqual(who.median,kiggs.median);
});
test('Messintervall: erste bis letzte Messung, echte Teil-Tage, negative Zunahme und gleiche Zeiten',()=>{
 const points=growthPoints([entry(0),entry(7),entry(21)],birth,'who');assert.deepEqual(defaultInterval(points),{start:'w0',end:'w21'});
 assert.deepEqual(defaultInterval([]),{start:'',end:''});
 assert.deepEqual(defaultInterval([points[0]]),{start:'',end:'w0'});
 assert.deepEqual(defaultInterval([points[0],{...points[0],entry:{...points[0].entry,id:'duplicate'}}]),{start:'',end:'duplicate'});
 const a=point(7,3500),b=point(21,3800),change=intervalChange(a,b);assert.ok(!('reason' in change));assert.equal(change.grams,300);assert.equal(change.perDay,300/14);
 assert.match(intervalChange(b,a).reason!,/nach/);assert.match(intervalChange(a,a).reason!,/nach/);assert.match(intervalChange(undefined,b).reason!,/zwei/);
 const negative=intervalChange(b,{...b,time:b.time+1.5*86400000,grams:3700});assert.ok(!('reason' in negative));assert.equal(negative.perDay,-100/1.5);
});
test('WHO-Geburtsgewichtsintervalle: Grenzen, kleine Stichprobe und keine erfundenen Zwischenintervalle',()=>{
 const a=point(14),b=point(28,3900);
 const normal=velocityComparison(a,b,birth,2800);assert.ok(!('reason' in normal));assert.deepEqual(normal.centiles,[[5,300],[10,400],[25,450],[50,600]]);assert.equal(normal.n,124);
 const small=velocityComparison(a,b,birth,2400);assert.ok(!('reason' in small));assert.deepEqual(small.centiles,[[50,500]]);assert.match(small.note,/Kleine Stichprobe/);
 const boundary=velocityComparison(a,b,birth,2500);assert.ok(!('reason' in boundary));assert.equal(boundary.centiles.length,4);
 const upper=velocityComparison(a,b,birth,4000);assert.ok(!('reason' in upper));assert.match(upper.label,/ab 4000/);
 assert.match(velocityComparison(a,b,birth,1999).reason!,/keine passende Gruppe/);
 assert.match(velocityComparison(a,b,birth,null).reason!,/Geburtsgewicht/);
 assert.match(velocityComparison(a,point(29),birth,2800).reason!,/keinen passenden/);
 assert.equal(velocityPosition(400,normal.centiles),'Bei P10'); assert.equal(velocityPosition(425,normal.centiles),'Zwischen P10 und P25');
 const first=velocityComparison(point(0),point(7,3300),birth,2800);assert.ok(!('reason' in first));assert.equal(first.centiles[1][1],-100);
});
test('Monatstabellen verwenden Vierwochen- und Kalenderstützpunkte ohne abrundende Zuordnung',()=>{
 const first=velocityComparison(point(0),point(28),birth,null);assert.ok(!('reason' in first));assert.equal(first.centiles.find(([p])=>p===50)![1],879);
 const later=velocityComparison(point(59),point(90),birth,null);assert.ok(!('reason' in later));assert.equal(later.centiles.find(([p])=>p===50)![1],718);
 assert.match(velocityComparison(point(60),point(90),birth,null).reason!,/keinen passenden/);
 assert.equal(monthDay('2024-01-31',1),'2024-02-29');assert.equal(monthDay('2025-01-31',1),'2025-02-28');
 assert.equal(monthDay('2024-02-29',12),'2025-02-28');
});
test('Längeneingabe, Bearbeitung, Retryvergleich und CSV erhalten optionalen Messwert',()=>{
 const draft={...newDraft(),kind:'weight' as const,weight:'3500',length:'52,5'};
 const input=feedingInput(draft);assert.equal(input.length_cm,52.5);
 assert.equal(feedingInput({...draft,kind:'bottle',amount:'65'}).length_cm,null);
 for(const length of ['29.9','150.1','52.55','NaN','1e2']) assert.throws(()=>feedingInput({...draft,length}),/Körperlänge/);
 assert.equal(draftFromFeeding({...input,id:'test'} as Feeding).length,'52.5');
 assert.equal(sameInput(input,{...input,length_cm:53}),false);assert.match(toCsv([{...input,id:'test'} as Feeding]),/52,5/);
 assert.equal(optionalBirthWeight(''),null);assert.equal(optionalBirthWeight('2800'),2800);assert.throws(()=>optionalBirthWeight('299'),/Geburtsgewicht/);
});
test('Diagramme haben echte Zeitpositionen, zugängliche Beschreibung und keine ungültigen SVG-Zahlen',()=>{
 const points=growthPoints([entry(0),entry(7),entry(28)],birth,'who');
 for(const z of [true,false]){const svg=growthChart(points,birth,'who',z);assert.match(svg,/role="img"/);assert.doesNotMatch(svg,/NaN|Infinity/);assert.match(svg,z ? /1 Messpunkte/ : /3 Messpunkte/);}
 assert.doesNotMatch(growthChart([points[0]],birth,'who'),/NaN|Infinity/);
});

test('Normalverteilungsfunktion reproduziert bekannte Perzentilen, Symmetrie und Reihenfolge', () => {
 for (const [z, percentile] of [[0,50],[1,84.1344746069],[-1,15.8655253931],[1.95996398454,97.5],[-3,0.1349898032],[3,99.8650101968]]) {
   assert.ok(Math.abs(zPercentile(z) - percentile) < 0.000008);
   assert.ok(Math.abs(zPercentile(z) + zPercentile(-z) - 100) < 1e-10);
 }
 let previous = -1;
 for(let z=-8;z<=8;z+=0.1) {const value=zPercentile(z);assert.ok(value>=previous && value>=0 && value<=100);previous=value;}
});

test('Karten und beide Verläufe verwenden durchgängig Lebenstage ab tatsächlicher Geburt', () => {
 const days = [0, 1, 7, 28, 60, 800];
 const entries = days.map(day => entry(day, WHO_WEIGHT_LMS[day][1] * 1000, 52));
 for (const reference of ['who', 'kiggs'] as const) {
   const points = growthPoints(entries, birth, reference, Date.parse('2030-01-01T12:00:00Z'));
   assert.deepEqual(points.map(point => point.days), days);
   points.forEach((point, i) => {
     const card = weightComparison(entries[i].weight_g!, entries[i].occurred_at, birth, Date.parse('2030-01-01T12:00:00Z'), reference);
     assert.ok(!('reason' in card));
     assert.equal(card.days, point.days);
     assert.equal(point.p10, card.p10);assert.equal(point.median, card.median);assert.equal(point.p90, card.p90);
     assert.ok(Math.abs(point.z) < 1e-12);
     if (reference === 'who') assert.equal(card.percentile, 'ca. P50,0');
   });
   const change = intervalChange(points[0], points[3]);
   assert.ok(!('reason' in change));
   assert.equal(change.days, 28);
   assert.equal(change.grams, entries[3].weight_g! - entries[0].weight_g!);
   assert.equal(change.perDay, change.grams / 28);
   assert.equal(change.zChange, null);
   const velocity = velocityComparison(points[0], points[3], birth, null);
   assert.ok(!('reason' in velocity));
   assert.match(velocity.label, /0\s*–\s*4 Wochen/);
   assert.equal(velocity.centiles.find(([p]) => p === 50)![1], 879);
 }
});

test('Gewicht zur Länge nutzt die gemessene Länge; Altersgrenze liegt am zweiten tatsächlichen Geburtstag', () => {
 const days = [0, 700, 730];
 const rows = days.map(day => entry(day, 3500, 52));
 const points = growthPoints(rows, birth, 'who', Date.parse('2030-01-01T12:00:00Z'));
 assert.equal(points[0].lengthZ, points[1].lengthZ);
 assert.equal(points[0].lengthZ, weightForLength(3500, 52));
 assert.equal(points[2].lengthZ, null);
});
