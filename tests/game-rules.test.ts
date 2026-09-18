import test from 'node:test';
import assert from 'node:assert/strict';
import { answer, canBuy, canPlay, inZone, markerPosition, nextAction, reward, skills, startRound, type Snapshot } from '../src/game/rules.ts';
import { compatible, operation, pendingKey, readPending } from '../src/game/api.ts';

test('Schnuller: Zonengrenzen, ruhige Variante, Rettung genau einmal und bewusster nächster Schritt', () => {
  assert.equal(markerPosition(0), 0); assert.equal(markerPosition(2500), 1); assert.equal(markerPosition(3750), .5); assert.equal(markerPosition(5000), 0);
  assert.equal(inZone(.3, []), true); assert.equal(inZone(.7, []), true); assert.equal(inZone(.2999, []), false);
  assert.equal(inZone(.2, ['hands_discovered']), true); assert.equal(inZone(.8, ['hands_discovered']), true);
  let r = startRound('pacifier', ['targeted_grasp']);
  r = answer(r, '', 0).round; assert.equal(r.bonus, 1); assert.equal(r.completed, 1); assert.equal(r.rescued, true);
  assert.equal(answer(r, '', .5).round.completed, 1, 'double tap cannot complete the next action');
  r = nextAction(r); r = answer(r, '', 0).round; assert.equal(r.completed, 1); assert.equal(r.bonus, 1);
  r = answer(r, '', .5).round; assert.equal(r.bonus, 2, 'successful timing after retries earns bonus');
  r = startRound('pacifier', ['targeted_grasp'], true); r = answer(r, '', 0).round;
  assert.equal(r.completed, 1); assert.equal(r.bonus, 0); assert.equal(r.rescued, false);
});

test('Babygespräch: Fehler kosten nur den Aktionsbonus, Lächeln ersetzt Aktion 2 und 4', () => {
  let r = startRound('baby_talk', ['eye_contact', 'social_smile'], false, () => .99);
  assert.equal(r.target, 'Da');
  r = answer(r, 'Oh').round; assert.equal(r.completed, 0);
  r = answer(r, 'Da').round; assert.equal(r.bonus, 0);
  r = nextAction(r); assert.equal(r.target, 'smile');
  r = answer(r, 'smile').round; assert.equal(r.bonus, 1);
  r = nextAction(r, () => 0); assert.equal(r.target, 'Ah');
  r = answer(r, 'Ah').round; r = nextAction(r); assert.equal(r.target, 'smile');
});

test('Greifspiel: Freischaltung, verschiedene Ziele und wiederholbare Runde', () => {
  assert.throws(() => startRound('grasp', []));
  let r = startRound('grasp', ['self_pacifier'], false, () => 0);
  const first = r.target; r = answer(r, '3').round; assert.equal(r.completed, 0);
  r = answer(r, first).round; assert.equal(r.bonus, 0);
  r = nextAction(r, () => 0); assert.notEqual(r.target, first);
  for (let i = 1; i < 5; i++) { r = answer(r, r.target).round; if (i < 4) r = nextAction(r); }
  assert.equal(reward(r.completed, r.bonus), 14);
  assert.throws(() => reward(4, 4)); assert.throws(() => reward(5, 6)); assert.throws(() => reward(5, .5));
});

test('Beide Zweigreihenfolgen kosten 180 XP und alle Spiele bleiben danach verfügbar', () => {
  for (const order of [skills, [...skills.slice(3), ...skills.slice(0, 3)]]) {
    const state: Snapshot = { schema_version: 1, rules_version: 1, revision: 0, xp_total: 200, xp_balance: 200, unlocks: [], stats: [] };
    assert.equal(canBuy('targeted_grasp', state), false);
    for (const skill of order) {
      assert.equal(canBuy(skill.id, state), true); state.xp_balance -= skill.cost; state.unlocks.push(skill.id);
      assert.equal(canBuy(skill.id, state), false);
    }
    assert.equal(state.xp_balance, 20); assert.equal(state.xp_total, 200);
    for (const game of ['pacifier', 'baby_talk', 'grasp'] as const) assert.equal(canPlay(game, state.unlocks), true);
    assert.equal(compatible({ ...state, schema_version: 2 }), false);
  }
});

test('Vorgemerkter Fortschritt ist kontogebunden und behält Regelversion und UUID', () => {
  const op = operation('test-account', 'round', { game: 'baby_talk', completed: 5, bonus: 3 });
  const storage = { getItem: (key: string) => key === pendingKey('test-account') ? JSON.stringify(op) : null };
  assert.deepEqual(readPending(storage, 'test-account'), op);
  assert.equal(readPending(storage, 'other-account'), null);
  assert.throws(() => readPending({ getItem: () => JSON.stringify({ ...op, account: 'other' }) }, 'test-account'));
  assert.throws(() => readPending({ getItem: () => '{bad' }, 'test-account'));
});
