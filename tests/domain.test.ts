import test from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, feedingInput, draftFromFeeding, localDateTime, toCsv, sameInput, type Feeding } from '../src/domain.ts';
const now = new Date('2026-09-12T08:45:00Z');

test('Stillen startet mit 30 Minuten, Flasche hat 15 und keine voreingestellte Menge', () => {
  const draft = newDraft();
  assert.equal(draft.kind, 'breast');
  assert.equal(draft.breastDuration, '30');
  assert.equal(draft.bottleDuration, '15');
  assert.equal(draft.amount, '');
});
test('jetzt wird erst beim Absenden aufgelöst; Stillbeginn wird aus Dauer abgeleitet', () => {
  const input = feedingInput(newDraft(), now);
  assert.equal(input.occurred_at, now.toISOString());
  assert.equal(input.started_at, '2026-09-12T08:15:00.000Z');
});
test('manueller Nachtrag bleibt trotz späterem Absenden unverändert', () => {
  const draft = { ...newDraft(), timeMode: 'custom' as const, localTime: '2026-09-11T18:20' };
  assert.equal(feedingInput(draft, now).occurred_at, new Date('2026-09-11T18:20').toISOString());
});
test('nur positive Flaschenmengen in 5-ml-Schritten sind zulässig', () => {
  for (const amount of ['', '0', '-5', '62', '2.5', '1e3']) {
    assert.throws(() => feedingInput({ ...newDraft(), kind: 'bottle', amount }, now));
  }
  for (const amount of ['5', '60', '65']) {
    const input = feedingInput({ ...newDraft(), kind: 'bottle', amount, side: 'left' }, now);
    assert.equal(input.amount_ml, Number(amount));
    assert.equal(input.side, null);
    assert.equal(input.started_at, null);
  }
});
test('Stillen speichert keine alte Flaschenmenge; unbekannte Dauer erlaubt', () => {
  const input = feedingInput({ ...newDraft(), amount: '90', breastUnknown: true, side: 'both' }, now);
  assert.equal(input.amount_ml, null);
  assert.equal(input.duration_minutes, null);
  assert.equal(input.started_at, null);
  assert.equal(input.side, 'both');
});
test('laufendes Stillen kann nicht vor dem Beenden gespeichert werden', () => {
  assert.throws(() => feedingInput({ ...newDraft(), breastStart: now.toISOString() }, now), /beenden/);
});
test('Start/End-Klicks bleiben sekundengenau erhalten und bestimmen Dauer', () => {
  const input = feedingInput({ ...newDraft(), breastStart: '2026-09-12T08:12:03Z', breastEnd: '2026-09-12T08:42:13Z' }, now);
  assert.equal(input.started_at, '2026-09-12T08:12:03.000Z');
  assert.equal(input.occurred_at, '2026-09-12T08:42:13.000Z');
  assert.equal(input.duration_minutes, 30);
  assert.throws(() => feedingInput({ ...newDraft(), breastStart: '2026-09-12T09:12:03Z', breastEnd: '2026-09-12T08:42:13Z' }, now), /Beginn/);
});
test('Bearbeiten eines gestoppten Stillvorgangs verändert die genauen Zeitpunkte nicht', () => {
  const input = feedingInput({ ...newDraft(), breastStart: '2026-09-12T08:12:03Z', breastEnd: '2026-09-12T08:42:13Z' }, now);
  const entry = { ...input, id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  assert.deepEqual(feedingInput(draftFromFeeding(entry), now), input);
});
test('Wiederholungsvergleich toleriert gleiche Zeitpunkte in verschiedenen UTC-Schreibweisen', () => {
  const input = feedingInput(newDraft(), now);
  assert.equal(sameInput(input, { ...input, occurred_at: '2026-09-12T08:45:00+00:00' }), true);
  assert.equal(sameInput(input, { ...input, duration_minutes: 25 }), false);
});
test('Export enthält Start, Ende und leere unbekannte Werte', () => {
  const entry: Feeding = { ...feedingInput({ ...newDraft(), breastUnknown: true }, now), id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  const csv = toCsv([entry]);
  assert.match(csv, /Ende \(UTC\)/);
  assert.match(csv, /Beginn \(UTC\)/);
  assert.match(csv, /"Stillen";"";"";""/);
  assert.equal(csv.includes('user'), false);
});
test('lokale Datumseingabe roundtrippt ohne Zeitzonenverschiebung', () => {
  const date = new Date('2026-09-12T08:45:00Z');
  assert.equal(new Date(localDateTime(date)).getTime(), date.getTime());
});

test('Mengen-Korrektur verändert den sekundengenauen Flaschenzeitpunkt nicht', () => {
  const input = feedingInput({ ...newDraft(), kind: 'bottle', amount: '60' }, new Date('2026-09-12T08:45:37Z'));
  const entry = { ...input, id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  const draft = draftFromFeeding(entry);
  draft.amount = '65';
  assert.equal(feedingInput(draft, now).occurred_at, input.occurred_at);
});

test('0 Minuten ist unbekannt; Milchart startet mit Pre und bleibt beim Bearbeiten erhalten', () => {
  const input = feedingInput({ ...newDraft(), kind: 'bottle', amount: '60', bottleDuration: '0' }, now);
  assert.equal(input.duration_minutes, null);
  assert.equal(input.milk_type, 'pre');
  const entry = { ...input, milk_type: 'breast_milk' as const, id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  assert.deepEqual(feedingInput(draftFromFeeding(entry), now), entry && { ...input, milk_type: 'breast_milk' });
  for (const breastDuration of ['-1', '0.5', '']) assert.throws(() => feedingInput({ ...newDraft(), breastDuration }, now));
  assert.equal(feedingInput({ ...newDraft(), breastDuration: '0' }, now).started_at, null);
  assert.equal(sameInput(input, { ...input, milk_type: 'breast_milk' }), false);
});
