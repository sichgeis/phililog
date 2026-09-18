import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, evaluate, opportunity, tap, type PacifierRound } from '../src/game/pacifier.ts';
const round = (): PacifierRound => ({ tempo: 'steady', assists: 0, elapsed: 0, offsets: [] });
test('V2: Ein endgültiger Tipp pro Gelegenheit, kein Wiederholen und genau zwölf Abschlüsse', () => {
  const r = round(); assert.equal(tap(r), false);
  advance(r, 400); assert.equal(tap(r), true); assert.equal(tap(r), false);
  assert.equal(evaluate(r.offsets, 0).outcomes[0], 'early');
  advance(r, 3200); assert.equal(opportunity(r).index, 1); assert.equal(tap(r), true);
  advance(r, 40000); assert.equal(opportunity(r).done, true); assert.equal(r.offsets.length, 12);
});
test('V2: Präzisionsgrenzen, Hilfen und genau eine Rettung', () => {
  assert.deepEqual(evaluate([-251,-250,-91,-90,90,91,250,251,null],0).outcomes, ['early','hit','hit','perfect','perfect','hit','hit','late','miss']);
  assert.deepEqual(evaluate([-376,-375,375,376,null],3).outcomes, ['rescued','hit','hit','late','miss']);
  assert.deepEqual(evaluate([null,null],2).outcomes, ['rescued','miss']);
});
test('V2: Serie gilt für nächsten Treffer, Fehler setzt sie zurück; XP und Medaillen', () => {
  assert.equal(evaluate([0,0,0],0).score,600);
  assert.equal(evaluate([0,0,0,0],0).score,900);
  assert.equal(evaluate([0,0,0,null,0],0).score,800);
  const perfect=evaluate(Array(12).fill(0),0);
  assert.equal(perfect.score,3900); assert.equal(perfect.xp,15); assert.equal(perfect.medal,'Gold');
  assert.equal(evaluate(Array(12).fill(null),0).xp,10);
  assert.equal(evaluate(Array(8).fill(200),0).medal,'Bronze');
  assert.equal(evaluate([...Array(4).fill(0),...Array(6).fill(200)],0).medal,'Silber');
});
test('V2: Tempowechsel, Timeout und Nullzeit verbrauchen keine zusätzlichen Aktionen', () => {
  const r=round(); r.tempo='alternating'; advance(r,1600); assert.equal(tap(r),true); assert.equal(r.offsets[0],0);
  advance(r,1800); assert.equal(opportunity(r).travel,1600);
  advance(r,36000); assert.equal(r.offsets.length,12);
  const paused=structuredClone(r); advance(r,0); assert.deepEqual(r,paused);
});
