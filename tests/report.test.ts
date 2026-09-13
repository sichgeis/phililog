import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, feedingInput, draftFromFeeding, sameInput, toCsv } from '../src/domain.ts';
import { berlinDay, shiftDay, milliliters, calendarWeek, weekRange, reportTotal } from '../src/report.ts';
const now = new Date('2026-09-13T12:00:00Z');
test('Standard pro Brust wird als feste Gesamtschätzung gespeichert', () => {
  const draft = newDraft(25);
  assert.equal(feedingInput(draft, now).estimated_ml, null);
  draft.side = 'left'; assert.equal(feedingInput(draft, now).estimated_ml, 25);
  draft.side = 'right'; assert.equal(feedingInput(draft, now).estimated_ml, 25);
  draft.side = 'both'; const old = feedingInput(draft, now); assert.equal(old.estimated_ml, 50);
  assert.equal(feedingInput({ ...newDraft(35), side: 'both' }, now).estimated_ml, 70);
  const entry = { ...old, id: 'id', created_by: 'creator', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  const edit = draftFromFeeding(entry); edit.breastDefault = { left: 35, right: 35 };
  assert.equal(feedingInput(edit, now).estimated_ml, 50);
  assert.match(toCsv([entry]), /Stillmenge geschätzt/);
  assert.equal(sameInput(old, { ...old, estimated_ml: 70 }), false);
});
test('Manuelle Schätzung, Entfernen und Typwechsel vermischen keine Mengen', () => {
  const draft = { ...newDraft(25), estimateMode: 'manual' as const, estimate: '42' };
  assert.equal(feedingInput(draft, now).estimated_ml, 42);
  assert.equal(feedingInput({ ...draft, estimate: '' }, now).estimated_ml, null);
  assert.equal(feedingInput({ ...draft, estimate: '0' }, now).estimated_ml, 0);
  assert.equal(feedingInput({ ...draft, kind: 'bottle', amount: '60' }, now).estimated_ml, null);
  for (const value of ['-1','1.5','1e2','2147483648']) assert.throws(() => feedingInput({ ...draft, estimate: value }, now));
  assert.throws(() => feedingInput({ ...newDraft(), side: 'left' }, now));
  assert.throws(() => milliliters('0', false));
  assert.equal(milliliters('35', false), 35);
  assert.deepEqual(JSON.parse(JSON.stringify(draft)), draft);
});
test('Deutsche Kalendertage und Wochenwechsel sind unabhängig von Sommerzeit', () => {
  assert.equal(berlinDay(new Date('2026-09-12T22:00:00Z')), '2026-09-13');
  assert.equal(berlinDay(new Date('2026-01-01T22:59:59Z')), '2026-01-01');
  assert.equal(berlinDay(new Date('2026-03-29T22:00:00Z')), '2026-03-30');
  assert.equal(shiftDay('2026-03-30', -7), '2026-03-23');
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
});

test('Getrennte Standards: links 20, rechts 35, beide 55; Momentaufnahme bleibt erhalten', () => {
 const draft = newDraft({ left:20, right:35 });
 assert.equal(feedingInput({ ...draft, side:'left' }, now).estimated_ml,20);
 assert.equal(feedingInput({ ...draft, side:'right' }, now).estimated_ml,35);
 assert.equal(feedingInput({ ...draft, side:'both' }, now).estimated_ml,55);
 assert.equal(feedingInput({ ...newDraft(25), side:'both' }, now).estimated_ml,50);
 assert.deepEqual(JSON.parse(JSON.stringify(draft)).breastDefault,{left:20,right:35});
});

test('ISO-Wochen reichen über Jahresgrenzen und beginnen montags', () => {
  assert.deepEqual(calendarWeek('2021-01-01'), { start: '2020-12-28', end: '2021-01-03', week: 53, year: 2020 });
  assert.deepEqual(calendarWeek('2024-12-30'), { start: '2024-12-30', end: '2025-01-05', week: 1, year: 2025 });
  assert.equal(calendarWeek('2026-03-29').start, '2026-03-23');
  assert.equal(calendarWeek('2026-03-30').start, '2026-03-30');
});
test('Laufende Woche endet heute; vorherige Woche vollständig; Zukunft begrenzt', () => {
  const today = '2026-09-16';
  assert.deepEqual(weekRange(today, today), { start: '2026-09-14', end: today, week: 38, year: 2026, current: true });
  assert.equal(weekRange('2026-09-09', today).end, '2026-09-13');
  assert.deepEqual(weekRange('2026-09-23', today), weekRange(today, today));
  assert.equal(weekRange('2026-09-14', '2026-09-14').end, '2026-09-14');
});
test('Bericht trennt Flaschenmenge, Schätzung und fehlende Mengen', () => {
  const row = { day: '2026-09-13', bottle_ml: 60, breast_ml: 0, missing_estimates: 0, diapers: 0, wet: 0, stool: 0, events: 1 };
  assert.deepEqual(reportTotal(row), { amount: 60, estimated: false, incomplete: false });
  assert.deepEqual(reportTotal({ ...row, missing_estimates: 2 }), { amount: 60, estimated: false, incomplete: true });
  assert.deepEqual(reportTotal({ ...row, breast_ml: 25 }), { amount: 85, estimated: true, incomplete: false });
});
