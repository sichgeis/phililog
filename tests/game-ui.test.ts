import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { Window } from 'happy-dom';
import { pendingKey, type Operation } from '../src/game/api.ts';
import type { Snapshot } from '../src/game/rules.ts';
const tick = () => new Promise(resolve => setImmediate(resolve));
async function setup(t: any, options: { pending?: Operation; fail?: boolean; schema?: number; storageFails?: boolean; clock?: boolean } = {}) {
  const window = new Window({ url: 'http://localhost:5173' });
  t.after(() => window.happyDOM.close());
  let now = 100, scheduled: FrameRequestCallback | null = null;
  if (options.clock) {
    const originalNow = Object.getOwnPropertyDescriptor(window.performance, 'now');
    Object.defineProperty(window.performance, 'now', { configurable: true, value: () => now });
    t.after(() => { if (originalNow) Object.defineProperty(window.performance, 'now', originalNow); else delete (window.performance as any).now; });
    window.requestAnimationFrame = cb => { scheduled = cb; return 1; };
    window.cancelAnimationFrame = () => { scheduled = null; };
  }
  const step = (delta: number) => { now += delta; const cb = scheduled; scheduled = null; cb?.(now); };
  window.document.body.innerHTML = '<div id="game"></div>';
  let state: Snapshot = { schema_version: options.schema ?? 1, rules_version: 1, revision: 0, xp_total: 40, xp_balance: 40, unlocks: [], stats: [] };
  let fail = options.fail ?? false;
  const sent: Operation[] = [];
  const api = {
    load: async () => structuredClone(state),
    submit: async (op: Operation) => { sent.push(structuredClone(op)); if (fail) throw new Error('Verbindung unterbrochen'); state.xp_total += 10 + (op.payload.bonus ?? 0); state.xp_balance += 10 + (op.payload.bonus ?? 0); state.revision++; return { status: 'saved', xp: 10 + (op.payload.bonus ?? 0) }; },
  };
  if (options.pending) window.localStorage.setItem(pendingKey('synthetic-user'), JSON.stringify(options.pending));
  if (options.storageFails) Object.defineProperty(window, 'localStorage', { value: { getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); }, removeItem: () => {} }, configurable: true });
  Object.assign(window, { testApi: api });
  const source = ['src/game/rules.ts', 'src/game/pacifier.ts', 'src/game/api.ts', 'src/game/index.ts'].map(path => stripTypeScriptTypes(readFileSync(path, 'utf8').replace(/^import .*;\n/gm, '').replace(/^export /gm, ''))).join('\n');
  window.eval(source + '\nglobalThis.controller = mountGame({ container: document.querySelector("#game"), client: null, account: "synthetic-user", api: testApi, onExit() { controller.hide(); } });');
  const find = (selector: string) => { const el = window.document.querySelector(selector); assert.ok(el, selector); return el as any; };
  await tick();
  return { window, find, step, controller: (window as any).controller, sent, setFail: (v: boolean) => { fail = v; }, setState: (s: Snapshot) => { state = s; } };
}
async function quietRound(ui: Awaited<ReturnType<typeof setup>>) {
  ui.find('[data-game="pacifier"]').click(); ui.find('[data-mode="practice"]').click(); ui.find('[data-action="begin"]').click(); await tick();
  for (let i = 0; i < 5; i++) { ui.find('[data-answer]').click(); if (i < 4) ui.find('[data-action="next"]').click(); }
  await tick();
}

test('Ruhige Runde speichert einmal nach fünf Aktionen; Ergebnis bestätigt und weiteres Spiel möglich', async t => {
  const ui = await setup(t); await quietRound(ui);
  assert.equal(ui.sent.length, 1); assert.deepEqual(ui.sent[0].payload, { game: 'pacifier', completed: 5, bonus: 0 });
  assert.match(ui.find('#game').textContent, /Gespeichert · \+10 XP/);
  assert.equal(ui.window.localStorage.getItem(pendingKey('synthetic-user')), null);
  ui.find('[data-action="home"]').click(); await tick();
  assert.equal(ui.find('[data-game="pacifier"]').disabled, false);
});

test('Verlorene Antwort: gleicher Vorgang nach Wiederholung und nach Neuladen', async t => {
  const ui = await setup(t, { fail: true }); await quietRound(ui);
  assert.match(ui.find('#game').textContent, /Noch nicht gespeichert/);
  const saved = JSON.parse(ui.window.localStorage.getItem(pendingKey('synthetic-user'))!);
  assert.equal(saved.id, ui.sent[0].id);
  const reloaded = await setup(t, { pending: saved });
  reloaded.find('[data-action="retry"]').click(); await tick();
  assert.equal(reloaded.sent[0].id, saved.id); assert.equal(reloaded.sent[0].rules_version, 1);
  ui.setFail(false); ui.find('[data-action="retry"]').click(); await tick();
  assert.equal(ui.sent[0].id, ui.sent[1].id);
});

test('Pause und Verlassen erhalten erledigte Aktionen; Fortsetzen ist ausdrücklich nötig', async t => {
  const ui = await setup(t);
  ui.find('[data-game="pacifier"]').click(); ui.find('[data-mode="practice"]').click(); ui.find('[data-action="begin"]').click(); await tick();
  ui.find('[data-answer]').click(); ui.find('[data-action="next"]').click();
  ui.controller.hide(); ui.controller.show(); await tick();
  assert.match(ui.find('#game').textContent, /Moment Pause/);
  ui.find('[data-action="resume"]').click();
  assert.equal(ui.find('.game-progress').getAttribute('aria-label'), '1 von 5 Aktionen');
  Object.defineProperty(ui.window.document, 'visibilityState', { configurable: true, value: 'hidden' });
  ui.window.document.dispatchEvent(new ui.window.Event('visibilitychange'));
  assert.match(ui.find('#game').textContent, /Moment Pause/);
  Object.defineProperty(ui.window.document, 'visibilityState', { configurable: true, value: 'visible' });
  ui.window.document.dispatchEvent(new ui.window.Event('visibilitychange')); await tick();
  assert.ok(ui.find('[data-action="resume"]'));
  ui.find('[data-action="abort"]').click(); assert.equal(ui.sent.length, 0);
});

test('Unbekanntes Schema blockiert neue Spiele und Käufe; bekanntes Pending bleibt wiederholbar', async t => {
  const ui = await setup(t, { schema: 2 });
  assert.match(ui.find('#game').textContent, /aktualisieren/);
  assert.equal(ui.find('[data-game="pacifier"]').disabled, true);
  ui.find('[data-action="skills"]').click(); assert.equal(ui.find('[data-buy="hands_discovered"]').disabled, true);
});

test('Lokaler Speicherfehler wird angezeigt, offene Übertragung schützt vor Schließen', async t => {
  const ui = await setup(t, { fail: true, storageFails: true }); await quietRound(ui);
  assert.match(ui.find('#game').textContent, /nicht vorgemerkt/);
  const event = new ui.window.Event('beforeunload', { cancelable: true }); ui.window.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  ui.controller.dispose();
  const after = new ui.window.Event('beforeunload', { cancelable: true }); ui.window.dispatchEvent(after); assert.equal(after.defaultPrevented, false);
});

test('Gespräch hebt nach Fehlversuch passende Antwort hervor und wartet auf Weiter', async t => {
  const ui = await setup(t);
  ui.find('[data-game="baby_talk"]').click(); ui.find('[data-action="begin"]').click(); await tick();
  const target = ui.find('.game-speech').textContent.includes('Ah') ? 'Ah' : 'Oh';
  ui.find(`[data-answer="${target === 'Ah' ? 'Oh' : 'Ah'}"]`).click();
  assert.ok(ui.find(`[data-answer="${target}"].game-hint`));
  ui.find(`[data-answer="${target}"]`).click();
  assert.ok(ui.find('[data-action="next"]')); assert.equal(ui.sent.length, 0);
});


test('V2-DOM: Countdown, endgültiger Tipp, Hintergrundpause und zwölf Gelegenheiten speichern Regeln 2', async t => {
  const ui = await setup(t, { clock: true });
  ui.find('[data-game="pacifier"]').click(); ui.find('[data-action="begin"]').click(); await tick();
  assert.equal(ui.find('[data-timing]').disabled,true);
  ui.step(2000); ui.step(1500); ui.find('[data-timing]').click();
  assert.match(ui.find('#game').textContent,/200 Punkte/);
  ui.find('[data-timing]').click(); assert.match(ui.find('#game').textContent,/200 Punkte/);
  ui.controller.hide(); ui.step(60000); ui.controller.show(); await tick();
  assert.match(ui.find('#game').textContent,/Moment Pause/);
  ui.find('[data-action="resume"]').click(); assert.match(ui.find('#game').textContent,/Bereit in 2/);
  ui.step(2000); assert.match(ui.find('#game').textContent,/1\/12/);
  ui.step(1700);
  for (let i=1;i<12;i++) { ui.step(1500); ui.find('[data-timing]').click(); ui.step(1700); }
  await tick(); assert.equal(ui.sent.length,1); assert.equal(ui.sent[0].rules_version,2);
  assert.deepEqual(ui.sent[0].payload.offsets,Array(12).fill(0));
  assert.match(ui.find('#game').textContent,/3900/); assert.match(ui.find('#game').textContent,/Gold/);
  ui.find('[data-action="begin"]').click(); await tick(); assert.match(ui.find('#game').textContent,/0 Punkte/);
});

test('V2: Verlorene Antwort überlebt Neuladen mit identischer UUID, Timingdaten und Regelversion', async t => {
  const ui = await setup(t, { clock: true, fail: true });
  ui.find('[data-game="pacifier"]').click(); ui.find('[data-mode="alternating"]').click();
  ui.find('[data-action="begin"]').click(); await tick(); ui.step(38000); await tick();
  assert.equal(ui.sent.length,1);
  const pending=JSON.parse(ui.window.localStorage.getItem(pendingKey('synthetic-user'))!);
  assert.equal(pending.rules_version,2); assert.equal(pending.payload.tempo,'alternating');
  assert.deepEqual(pending.payload.offsets,Array(12).fill(null));
  const reloaded=await setup(t,{pending}); reloaded.find('[data-action="retry"]').click(); await tick();
  assert.deepEqual(reloaded.sent[0],pending);
});
