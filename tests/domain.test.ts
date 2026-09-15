import test from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, feedingInput, draftFromFeeding, localDateTime, toCsv, sameInput, elapsedLabel, type Feeding } from '../src/domain.ts';
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
  const input = feedingInput({ ...newDraft(25), amount: '90', breastUnknown: true, side: 'both' }, now);
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
  assert.deepEqual(feedingInput(draftFromFeeding(entry), now), { ...input, milk_type: 'breast_milk' });
  for (const breastDuration of ['-1', '0.5', '']) assert.throws(() => feedingInput({ ...newDraft(), breastDuration }, now));
  assert.equal(feedingInput({ ...newDraft(), breastDuration: '0' }, now).started_at, null);
  assert.equal(sameInput(input, { ...input, milk_type: 'breast_milk' }), false);
});

test('Wickeln trennt alle Fütterungsdetails und erhält unabhängige Toggles beim Bearbeiten', () => {
  for (const urine of [false, true]) for (const stool of [false, true]) for (const heldSuccess of [false, true]) {
    const input = feedingInput({ ...newDraft(), kind: 'diaper', urine, stool, heldSuccess, amount: '60', side: 'left', breastStart: now.toISOString() }, now);
    assert.equal(input.urine, urine); assert.equal(input.stool, stool); assert.equal(input.held_success, heldSuccess);
    for (const field of ['duration_minutes','amount_ml','started_at','milk_type','side'] as const) assert.equal(input[field], null);
    const entry = { ...input, id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
    assert.deepEqual(feedingInput(draftFromFeeding(entry), now), input);
    assert.match(toCsv([entry]), /Wickeln/);
    assert.equal(sameInput(input, { ...input, urine: !urine }), false);
  }
  const feeding = feedingInput({ ...newDraft(), urine: true, stool: true, heldSuccess: true }, now);
  assert.equal(feeding.urine, null); assert.equal(feeding.stool, null); assert.equal(feeding.held_success, null);
});

test('Zeitanzeige zählt Stunden, Minuten und Sekunden aus Zeitstempeln', () => {
  const start = '2026-09-12T08:00:00Z';
  const at = (seconds: number) => new Date(start).getTime() + seconds * 1000;
  assert.equal(elapsedLabel(start, at(59)), 'gerade eben');
  assert.equal(elapsedLabel(start, at(60)), 'vor 1 Min.');
  assert.equal(elapsedLabel(start, at(3661)), 'vor 1 Std. 1 Min.');
  assert.equal(elapsedLabel(start, at(3661), true), '1 Std. 1 Min. 01 Sek.');
  assert.equal(elapsedLabel(start, at(5), true), '0 Min. 05 Sek.');
  assert.equal(elapsedLabel(start, at(-1)), 'Zeitpunkt liegt in der Zukunft');
});

test('Wiegen erfasst nur positives Grammgewicht und Zeitpunkt, inklusive Bearbeitung und CSV', () => {
  for (const weight of ['', '0', '-5', '3.5', '1e3']) assert.throws(() => feedingInput({ ...newDraft(), kind: 'weight', weight }, now));
  const input = feedingInput({ ...newDraft(), kind: 'weight', weight: '3500', amount: '60', urine: true, heldSuccess: true, side: 'left' }, now);
  assert.equal(input.weight_g, 3500);
  for (const field of ['duration_minutes','amount_ml','side','urine','stool','held_success','milk_type','started_at'] as const) assert.equal(input[field], null);
  const entry = { ...input, id: 'id', created_by: 'user', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  assert.deepEqual(feedingInput(draftFromFeeding(entry), now), input);
  assert.match(toCsv([entry]), /Gewicht \(g\)/); assert.match(toCsv([entry]), /3500/);
  assert.equal(sameInput(input, { ...input, weight_g: 3550 }), false);
  assert.equal(feedingInput({ ...newDraft(), weight: '3500' }, now).weight_g, null);
});

test('Personenzuordnung bleibt bei Korrektur und CSV erhalten; neue Einträge nutzen die Serverzuordnung', () => {
  const input = feedingInput(newDraft(), now);
  assert.equal(input.performed_by, undefined);
  const entry = { ...input, performed_by: 'Julia' as const, id: 'id', created_by: 'creator', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  const draft = draftFromFeeding(entry);
  assert.equal(draft.performedBy, 'Julia');
  draft.performedBy = 'Christian';
  assert.equal(feedingInput(draft, now).performed_by, 'Christian');
  assert.match(toCsv([entry]), /Erledigt von/); assert.match(toCsv([entry]), /Julia/);
  assert.equal(sameInput(entry, input), true);
  assert.equal(sameInput(entry, { ...input, performed_by: 'Christian' }), false);
  assert.equal(feedingInput(draftFromFeeding({ ...entry, performed_by: null }), now).performed_by, null);
});

test('Optionales Befinden bleibt bei Bearbeitung/CSV erhalten und gehört nicht zu Wiegen', () => {
 const initial = feedingInput(newDraft(), now);
 assert.equal(initial.mood_after,null);
 const input = feedingInput({...newDraft(),mood:'sleepy'},now);
 const entry = {...input,id:'id',created_by:'creator',created_at:now.toISOString(),updated_at:now.toISOString(),version:1};
 assert.equal(draftFromFeeding(entry).mood,'sleepy');
 assert.match(toCsv([entry]),/Schläfrig/);
 assert.equal(sameInput(input,{...input,mood_after:'calm'}),false);
 assert.equal(sameInput(initial,{...initial,mood_after:undefined}),true);
 assert.equal(feedingInput({...draftFromFeeding(entry),mood:null},now).mood_after,null);
 assert.equal(feedingInput({...newDraft(),kind:'weight',weight:'3500',mood:'calm'},now).mood_after,null);
});


test('Temperatur akzeptiert Komma/Punkt, prüft Grenzen und erhält Wert in Bearbeitung/CSV', () => {
  const draft = { ...newDraft(), kind: 'temperature' as const, temperature: '37,2', mood: 'calm' as const };
  const value = feedingInput(draft, now);
  assert.equal(value.temperature_c, 37.2);
  assert.equal(value.duration_minutes, null);
  assert.equal(value.mood_after, null);
  assert.equal(value.estimated_ml, null);
  for (const temperature of ['25', '45.0', '37.2']) assert.doesNotThrow(() => feedingInput({ ...draft, temperature }));
  for (const temperature of ['', '24.9', '45.1', '37.22', 'NaN', '3e1', '37,2x']) assert.throws(() => feedingInput({ ...draft, temperature }), /Temperatur/);
  const entry = { ...value, id: 'temperature-test', version: 1 } as Feeding;
  assert.equal(feedingInput(draftFromFeeding(entry)).temperature_c, 37.2);
  assert.match(toCsv([entry]), /Temperatur \(°C\)/);
  assert.match(toCsv([entry]), /"37,2"/);
  assert.equal(sameInput(value, { ...value, temperature_c: 37.3 }), false);
  assert.equal(feedingInput({ ...draft, kind: 'diaper' }).temperature_c, null);
});


for (const [mood, label] of [['angry', 'Zornig'], ['asleep', 'Eingeschlafen']] as const) {
 test(`${label} bleibt in Bearbeitung, Export und Wiederholungsvergleich erhalten`, () => {
  const input = feedingInput({ ...newDraft(), mood }, now);
  const entry = { ...input, id: 'mood-test', created_by: 'test', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1 };
  assert.equal(input.mood_after, mood);
  assert.equal(feedingInput(draftFromFeeding(entry), now).mood_after, mood);
  assert.ok(toCsv([entry]).includes(label));
  assert.equal(sameInput(input, { ...input }), true);
  assert.equal(sameInput(input, { ...input, mood_after: mood === 'angry' ? 'asleep' : 'angry' }), false);
  assert.equal(feedingInput({ ...draftFromFeeding(entry), mood: null }, now).mood_after, null);
  assert.equal(feedingInput({ ...newDraft(), kind: 'temperature', temperature: '37,2', mood }, now).mood_after, null);
  assert.equal(feedingInput({ ...newDraft(), kind: 'weight', weight: '3500', mood }, now).mood_after, null);
 });
}

test('Sonnenbad trennt optionale Dauer von Mahlzeiten und erhält Nachtrag, Korrektur und CSV', () => {
 const draft = { ...newDraft(), kind: 'sunbath' as const, mood: 'calm' as const, amount: '65', weight: '3500', temperature: '37,2', sunbathDuration: '5' };
 const input = feedingInput(draft, now);
 assert.equal(input.duration_minutes, 5);
 assert.equal(input.occurred_at, now.toISOString());
 for (const key of ['mood_after', 'estimated_ml', 'started_at', 'amount_ml', 'side', 'milk_type', 'urine', 'stool', 'held_success', 'temperature_c', 'weight_g'] as const) assert.equal(input[key], null, key);
 for (const sunbathDuration of ['', '0']) assert.equal(feedingInput({ ...draft, sunbathDuration }, now).duration_minutes, null);
 for (const sunbathDuration of ['-1', '1.5', 'abc', '2147483648']) assert.throws(() => feedingInput({ ...draft, sunbathDuration }, now), /Dauer/);
 const entry = { ...input, id: 'sunbath-test', created_by: 'test', created_at: now.toISOString(), updated_at: now.toISOString(), version: 1, performed_by: 'Christian' as const };
 const restored = draftFromFeeding(entry);
 assert.equal(restored.sunbathDuration, '5');
 assert.equal(restored.breastDuration, '30');
 assert.equal(restored.bottleDuration, '15');
 assert.equal(feedingInput({ ...restored, sunbathDuration: '7' }).occurred_at, input.occurred_at);
 assert.equal(feedingInput(restored).performed_by, 'Christian');
 assert.equal(sameInput(input, { ...input, duration_minutes: 7 }), false);
 assert.match(toCsv([entry]), /"Sonnenbad";"5"/);
 assert.equal(draftFromFeeding({ ...entry, duration_minutes: null }).sunbathDuration, '');
 assert.equal(feedingInput({ ...draft, kind: 'breast' }, now).duration_minutes, 30);
 assert.equal(feedingInput({ ...draft, kind: 'bottle' }, now).duration_minutes, 15);
});
