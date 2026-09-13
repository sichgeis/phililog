import test from 'node:test';
import assert from 'node:assert/strict';
import { hasDraftChanges, newDraft, type Draft } from '../src/domain.ts';

test('Alle fachlichen Abweichungen schützen den Entwurf, Standardladung allein nicht', () => {
  assert.equal(hasDraftChanges(newDraft({ left: 20, right: 35 })), false);
  const changes: Partial<Draft>[] = [
    { kind: 'diaper' }, { urine: true }, { stool: true }, { heldSuccess: true },
    { milkType: 'breast_milk' }, { side: 'left' }, { bottleDuration: '20' }, { breastDuration: '0' },
    { timeMode: 'custom' }, { localTime: '2026-09-12T12:34' }, { mood: 'calm' },
    { estimateMode: 'manual' }, { amount: '65' }, { weight: '3500' }, { performedBy: 'Julia' },
    { breastStart: '2026-09-12T12:34:00Z' },
  ];
  for (const change of changes) assert.equal(hasDraftChanges({ ...newDraft(), ...change }), true, JSON.stringify(change));
});
