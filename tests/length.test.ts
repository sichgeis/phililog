import assert from 'node:assert/strict';
import test from 'node:test';
import { draftFromFeeding, feedingInput, newDraft, sameInput, toCsv, type Feeding } from '../src/domain.ts';
import { lengthBands, lengthComparison } from '../src/length.ts';

const birthday = '2023-01-01';
const date = (day: number) => new Date(Date.parse(`${birthday}T12:00:00Z`) + day * 86_400_000).toISOString();
const now = Date.parse(date(2000));

test('WHO-Längenreferenz liefert offizielle Werte und wechselt an Tag 731 die Messart', () => {
  const birth = lengthBands(0, 'who')!;
  assert.equal(birth.median, 49.1477);
  assert.equal(birth.p10.toFixed(3), '46.761');
  assert.equal(birth.p90.toFixed(3), '51.535');
  assert.equal(lengthBands(730, 'who')?.standing, false);
  assert.equal(lengthBands(731, 'who')?.standing, true);
  assert.equal(lengthBands(731, 'who')?.median, 85.7299);
  assert.equal(lengthBands(1856, 'who')?.median, 109.9352);
  assert.equal(lengthBands(1857, 'who'), null);
  assert.deepEqual(lengthComparison(49.1477, false, date(0), birthday, 'who', now), { days: 0, percentile: 'ca. P50,0' });
  assert.match((lengthComparison(86, true, date(730), birthday, 'who', now) as { reason: string }).reason, /liegend/);
  assert.match((lengthComparison(86, false, date(731), birthday, 'who', now) as { reason: string }).reason, /stehend/);
});

test('KiGGS nutzt die veröffentlichte Tabelle und kennzeichnet Perzentilen zwischen Stützpunkten', () => {
  assert.deepEqual(lengthBands(0, 'kiggs'), { p10: 48.49, median: 51.32, p90: 54.17, standing: false });
  const interpolated = lengthBands(15, 'kiggs')!;
  assert.ok(interpolated.median > 51.32 && interpolated.median < 54.94);
  assert.deepEqual(lengthComparison(interpolated.median, false, date(15), birthday, 'kiggs', now), { days: 15, percentile: 'ca. P50,0 (geschätzt)' });
  assert.deepEqual(lengthComparison(60, false, date(0), birthday, 'kiggs', now), { days: 0, percentile: 'über P97' });
  for (const [time, birth] of [[date(-1), birthday], [date(2001), birthday], [date(100), null]]) {
    assert.ok('reason' in lengthComparison(60, false, time!, birth, 'kiggs', now));
  }
});

test('Eigenständige und gemeinsame Längen speichern, bearbeiten und exportieren ihre Messart korrekt', () => {
  const draft = { ...newDraft(null, 'length'), bodyLength: '92,4', lengthStanding: true, weight: '3500', length: '53', mood: 'calm' as const };
  const input = feedingInput(draft, new Date(date(900)));
  assert.deepEqual([input.weight_g, input.length_cm, input.length_standing, input.mood_after, input.duration_minutes], [null, 92.4, true, null, null]);
  const entry = { ...input, id: 'length' } as Feeding;
  assert.ok(sameInput(input, feedingInput(draftFromFeeding(entry))));
  assert.equal(sameInput(input, { ...input, length_standing: false }), false);
  assert.match(toCsv([entry]), /"92,4";"Stehend"/);
  const paired = feedingInput({ ...draft, kind: 'weight' });
  assert.equal(paired.length_standing, null);
  assert.match(toCsv([{ ...paired, id: 'paired' } as Feeding]), /"53,0";"Liegend"/);
  for (const bodyLength of ['', '29,9', '220,1', '65,24']) assert.throws(() => feedingInput({ ...draft, bodyLength }), /Körperlänge/);
});
