import test from 'node:test';
import assert from 'node:assert/strict';
import { WHO_WEIGHT_GIRLS } from '../src/data/who-weight-girls.ts';
import { KIGGS_WEIGHT_GIRLS } from '../src/data/kiggs-weight-girls.ts';
import { ageInDays, ageLabel, validBirthDate, weightComparison, kiggsWeightAtAge, readWeightReference, rememberWeightReference } from '../src/weight.ts';

test('KiGGS-Stützwerte, Zwischenwerte und Bereich; Quellen verändern die Einordnung', () => {
  assert.equal(KIGGS_WEIGHT_GIRLS.length, 24);
  assert.deepEqual(kiggsWeightAtAge(0), [2840, 3390, 3930]);
  assert.deepEqual(kiggsWeightAtAge(2 * 30.4375), [4240, 5000, 5840]);
  assert.deepEqual(kiggsWeightAtAge(12 * 30.4375), [8160, 9340, 10770]);
  for (const [months, ...values] of KIGGS_WEIGHT_GIRLS) {
    if (months * 30.4375 <= 1856) assert.deepEqual(kiggsWeightAtAge(months * 30.4375), values);
  }
  assert.deepEqual(kiggsWeightAtAge(0.5 * 30.4375), [3190, 3795, 4420]);
  assert.ok(kiggsWeightAtAge(1856));
  for (const age of [-1, 1857, NaN, Infinity]) assert.equal(kiggsWeightAtAge(age), null);
  const who = weightComparison(3900, '2025-01-01T12:00:00Z', '2025-01-01');
  const kiggs = weightComparison(3900, '2025-01-01T12:00:00Z', '2025-01-01', Date.now(), 'kiggs');
  assert.equal(who.relation, 'Über P90'); assert.equal(kiggs.relation, 'Zwischen P10 und P90');
  assert.equal(who.days, kiggs.days);
  assert.match(weightComparison(3500, '2025-01-01Z', null, Date.now(), 'kiggs').reason!, /Geburtsdatum/);
  assert.match(weightComparison(3500, '2024-12-31T12:00:00Z', '2025-01-01', Date.now(), 'kiggs').reason!, /vor dem/);
  assert.match(weightComparison(3500, '2099-01-01T12:00:00Z', '2099-01-01', Date.now(), 'kiggs').reason!, /Zukunft/);
  assert.match(weightComparison(18000, '2025-02-01T12:00:00Z', '2020-01-01', Date.now(), 'kiggs').reason!, /KiGGS/);
});
test('Gerätepräferenz validiert Werte und übersteht gesperrten Speicher', () => {
  let value: string | null = null;
  const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
  assert.equal(readWeightReference(storage), 'who');
  rememberWeightReference('kiggs', storage); assert.equal(readWeightReference(storage), 'kiggs');
  value = 'corrupt'; assert.equal(readWeightReference(storage), 'who');
  const blocked = { getItem(): string | null { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readWeightReference(blocked), 'who');
  assert.doesNotThrow(() => rememberWeightReference('kiggs', blocked));
});

test('Alter folgt Berliner Kalendertagen einschließlich Tageswechsel und Sommerzeit', () => {
  assert.equal(ageInDays('2025-01-01', '2025-01-01T12:00:00Z'), 0);
  assert.equal(ageInDays('2025-01-01', '2025-01-01T23:00:00Z'), 1);
  assert.equal(ageInDays('2025-03-29', '2025-03-30T22:30:00Z'), 2);
  assert.equal(ageInDays('2025-10-25', '2025-10-27T00:00:00Z'), 2);
  assert.equal(ageInDays('2024-02-28', '2024-03-01T12:00:00Z'), 2);
  assert.equal(validBirthDate('2025-02-30'), false);
  assert.equal(validBirthDate('invalid'), false);
  assert.equal(ageInDays('2025-01-01', 'invalid'), null);
  assert.equal(ageLabel(47), '47 Tage · 6 Wochen und 5 Tage');
});
test('WHO-Tabelle vollständig; Originalwerte, asymmetrischer Median und äußere Punkte', () => {
  assert.equal(WHO_WEIGHT_GIRLS.length, 1857);
  assert.deepEqual(WHO_WEIGHT_GIRLS[0], [2678, 3232, 3853]);
  assert.deepEqual(WHO_WEIGHT_GIRLS[1], [2635, 3196, 3831]);
  for (const [a, b, c] of WHO_WEIGHT_GIRLS) assert.ok(a > 0 && a < b && b < c);
  for (const weight of [1500, 2678, 3232, 3853, 6000]) {
    const result = weightComparison(weight, '2025-01-01T12:00:00Z', '2025-01-01');
    assert.ok(!('reason' in result));
    assert.ok(result.point > 0 && result.point < 100);
    if (weight === 3232) { assert.equal(result.point, result.center); assert.notEqual(result.center, 50); }
    if (weight < result.p10) { assert.ok(result.point < result.left); assert.equal(result.relation, 'Unter P10'); }
    if (weight > result.p90) { assert.ok(result.point > result.right); assert.equal(result.relation, 'Über P90'); }
  }
});
test('Keine erfundene Referenz bei fehlendem Datum, Zukunft, vor Geburt oder außerhalb des Bereichs', () => {
  assert.match(weightComparison(3500, '2025-01-01Z', null).reason!, /Geburtsdatum/);
  assert.match(weightComparison(3500, '2024-12-31T12:00:00Z', '2025-01-01').reason!, /vor dem/);
  assert.match(weightComparison(3500, '2099-01-01T12:00:00Z', '2099-01-01').reason!, /Zukunft/);
  const atDay = (days: number) => new Date(Date.parse('2020-01-01T12:00:00Z') + days * 86400000).toISOString();
  assert.ok(!('reason' in weightComparison(18000, atDay(1856), '2020-01-01')));
  assert.match(weightComparison(18000, atDay(1857), '2020-01-01').reason!, /Außerhalb/);
});
