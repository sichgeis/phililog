import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { Window } from 'happy-dom';
import * as domain from '../src/domain.ts';
import * as report from '../src/report.ts';

// Execute the real entry point and handlers in a disposable DOM. Only the API is substituted.
async function setup(t: any, person = 'Julia', reduced = false) {
  const window = new Window({ url: 'http://localhost:5173' });
  t.after(() => window.happyDOM.close());
  window.document.body.innerHTML = '<div id="app"></div>';
  let settings = { breast_left_ml: 25, breast_right_ml: 25, version: 1 };
  const submitted: number[] = [];
  const entry = { ...domain.feedingInput({ ...domain.newDraft(), kind: 'bottle', amount: '65' }), id: 'existing', created_by: 'test-user', version: 1 };
  let create: (p: any) => Promise<any> = async p => ({ ...p.input, id: p.id });
  Object.assign(window, domain, report, {
    configured: true, currentFamilyPerson: async () => person,
    matchMedia: () => ({ matches: reduced }),
    supabase: { rpc: async () => ({ data: true }), auth: { onAuthStateChange() {}, signOut: async () => ({}) } },
    getSettings: async () => ({ ...settings }),
    saveSettings: async (values: any, version: number) => {
      submitted.push(version);
      if (version !== settings.version) throw new Error('Die Einstellungen wurden inzwischen geändert.');
      settings = { breast_left_ml: values.left, breast_right_ml: values.right, version: version + 1 };
      return { ...settings };
    },
    listFeedings: async () => [entry], latestMeal: async () => entry,
    getDailyReport: async () => [], friendlyError: (e: Error) => e.message,
    createFeeding: (p: any) => create(p), updateFeeding: async () => entry,
  });
  const source = ['src/render-state.ts', 'src/main.ts'].map(path =>
    stripTypeScriptTypes(readFileSync(path, 'utf8').replace(/^import .*;\n/gm, '').replace(/^export /gm, ''))).join('\n');
  window.eval(source + '\nglobalThis.harness = { enterSession, refresh, storeSettings, save, switchView };');
  const app = (window as any).harness;
  await app.enterSession('test-user');
  const find = (selector: string) => { const el = window.document.querySelector(selector); assert.ok(el, selector); return el as any; };
  const input = (selector: string, value: string) => { const el = find(selector); el.value = value; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
  return { window, app, find, input, submitted, setSettings: (value: typeof settings) => { settings = value; }, setCreate: (fn: typeof create) => { create = fn; } };
}

test('Settings-Entwurf behält Version nach Refresh und verlangt ausdrückliche Übernahme', async t => {
  const ui = await setup(t);
  ui.app.switchView('settings'); await ui.app.refresh();
  ui.input('#breast-default-left', '20');
  ui.find('#breast-default-left').focus();
  ui.setSettings({ breast_left_ml: 35, breast_right_ml: 25, version: 2 });
  await ui.app.refresh();
  assert.equal(ui.find('#breast-default-left').value, '20');
  assert.equal(ui.window.document.activeElement?.id, 'breast-default-left');
  await ui.app.storeSettings();
  assert.deepEqual(ui.submitted, [1]);
  assert.match(ui.find('#messages').textContent, /inzwischen/);
  ui.find('#reset-settings').click(); ui.find('[data-confirm]').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.find('#breast-default-left').value, '35');
  ui.input('#breast-default-left', '40'); await ui.app.storeSettings();
  assert.deepEqual(ui.submitted, [1, 2]);
});

test('Windel-Toggle, geöffnete Bereiche und manueller Zeitpunkt überleben Refresh', async t => {
  const ui = await setup(t);
  ui.find('[data-kind="diaper"]').click();
  ui.find('[data-diaper="urine"]').focus(); ui.find('[data-diaper="urine"]').click();
  assert.equal(ui.window.document.activeElement?.getAttribute('data-diaper'), 'urine');
  ui.find('[data-time="custom"]').click();
  ui.input('#local-time', '2026-09-12T12:34'); ui.find('#local-time').focus();
  await ui.app.refresh();
  assert.equal(ui.find('#local-time').value, '2026-09-12T12:34');
  assert.equal(ui.window.document.activeElement?.id, 'local-time');
  ui.find('#logout').click();
  assert.match(ui.find('dialog').textContent, /ungespeicherten/);
  ui.find('[data-cancel]').click();
  ui.app.switchView('history'); await ui.app.refresh(); ui.find('[data-edit]').click();
  assert.match(ui.find('dialog').textContent, /Entwurf verwerfen/);
});

test('Texteingabe und Auswahl bleiben nach Hintergrundaktualisierung erhalten', async t => {
  const ui = await setup(t);
  ui.find('[data-kind="bottle"]').click(); ui.input('#amount', '65');
  ui.find('#amount').focus(); await ui.app.refresh();
  assert.equal(ui.find('#amount').value, '65');
  assert.equal(ui.window.document.activeElement?.id, 'amount');
  const details = ui.find('form details'); details.open = true; await ui.app.refresh();
  assert.equal(ui.find('form details').open, true);
  ui.find('form summary').focus(); await ui.app.refresh();
  assert.equal(ui.window.document.activeElement?.tagName, 'SUMMARY');
});

test('Ungewisse Übermittlung wiederholt dieselbe ID; fremde Korrektur und Löschung lösen Formular', async t => {
  for (const deleted of [false, true]) {
    const ui = await setup(t);
    ui.find('[data-kind="bottle"]').click(); ui.input('#amount', '65');
    const attempts: string[] = [];
    ui.setCreate(async p => { attempts.push(p.id); throw new Error('Network failed'); });
    await ui.app.save();
    assert.equal(ui.find('fieldset').disabled, true);
    ui.setCreate(async p => { attempts.push(p.id); return deleted ? null : { ...p.input, amount_ml: 70, id: p.id }; });
    await ui.app.save();
    assert.equal(attempts[0], attempts[1]);
    assert.equal(ui.find('fieldset').disabled, false);
    assert.match(ui.find('#messages').textContent, deleted ? /gelöscht/ : /inzwischen geändert/);
    assert.equal(ui.window.localStorage.getItem('phililog-draft:test-user')?.includes('"pending":null'), true);
  }
});

test('Neues Layout erhält Bereiche per ID bei Artwechsel, Stillfokus und Befinden-Abwahl', async t => {
  const ui = await setup(t);
  assert.match(ui.find('#time-options').textContent, /Julia/);
  ui.find('#estimate-options').open = true;
  ui.find('#mood-options').open = true;
  ui.find('#time-options').open = false;
  ui.find('[data-kind="bottle"]').click();
  assert.equal(ui.find('#time-options').open, false, 'Stillmenge darf nicht den Zeitbereich öffnen');
  assert.equal(ui.find('#mood-options').open, true);
  ui.find('[data-mood="calm"]').click();
  ui.find('#clear-mood').click();
  assert.equal(ui.window.document.activeElement, ui.find('#mood-options summary'));
  ui.find('[data-kind="breast"]').click();
  ui.find('#start-breast').click();
  assert.equal(ui.window.document.activeElement?.id, 'end-breast');
  await ui.app.refresh();
  assert.equal(ui.window.document.activeElement?.id, 'end-breast');
  ui.find('#end-breast').click();
  assert.equal(ui.window.document.activeElement?.id, 'clear-timer');
});

test('Kalenderwochen-Navigation bleibt mit Wartungsrefresh bedienbar', async t => {
  const ui = await setup(t);
  ui.app.switchView('report'); await ui.app.refresh();
  const current = ui.find('.report-controls strong').textContent;
  assert.equal(ui.find('#report-next').disabled, true);
  ui.find('#report-prev').click(); await ui.app.refresh();
  assert.notEqual(ui.find('.report-controls strong').textContent, current);
  assert.equal(ui.find('#report-next').disabled, false);
  ui.find('#report-today').click(); await ui.app.refresh();
  assert.equal(ui.find('.report-controls strong').textContent, current);
  assert.equal(ui.find('#report-next').disabled, true);
});


test('Temperatur unter Mehr, Footer-Einstellungen und Dezimaleingabe bleiben erhalten', async t => {
  const ui = await setup(t);
  assert.equal(ui.window.document.querySelector('.navigation-bar [data-view="settings"]'), null);
  assert.ok(ui.find('footer [data-view="settings"]'));
  assert.ok(ui.find('#extra-events [data-kind="temperature"]'));
  ui.find('[data-kind="temperature"]').click();
  assert.equal(ui.window.document.querySelector('#mood-options'), null);
  assert.equal(ui.find('.duration-block').hidden, true);
  ui.input('#temperature', '37,2');
  await ui.app.refresh();
  assert.equal(ui.find('#temperature').value, '37,2');
  let saved: any;
  ui.setCreate(async p => { saved = p.input; return p.input; });
  await ui.app.save();
  assert.equal(saved.temperature_c, 37.2);
  assert.equal(saved.duration_minutes, null);
  assert.match(ui.find('#messages').textContent, /Io triumphe/);
});

for (const kind of ['bottle', 'diaper']) test(`Christian erhält Sterne und Regenbogen nach ${kind}`, async t => {
  const ui = await setup(t, 'Christian');
  ui.find(`[data-kind="${kind}"]`).click();
  if (kind === 'bottle') ui.input('#amount', '65');
  await ui.app.save();
  assert.equal(ui.window.document.querySelectorAll('.star-celebration i').length, 72);
  assert.equal(ui.find('.celebration-rainbow').textContent, '🌈');
});

test('Julias Konfetti bleibt erhalten; Fehler haben keinen Effekt', async t => {
  const ui = await setup(t);
  ui.find('[data-kind="bottle"]').click();
  await ui.app.save();
  assert.equal(ui.window.document.querySelector('.watercolor-celebration'), null);
  ui.input('#amount', '65');
  ui.setCreate(async () => { throw new Error('Verbindung fehlgeschlagen'); });
  await ui.app.save();
  assert.equal(ui.window.document.querySelector('.watercolor-celebration'), null);
  ui.setCreate(async p => p.input);
  await ui.app.save();
  assert.equal(ui.window.document.querySelectorAll('.watercolor-celebration i').length, 24);
  assert.equal(ui.window.document.querySelector('.star-celebration'), null);
});

test('Christian erhält bei reduzierter Bewegung eine ruhige Grafik', async t => {
  const ui = await setup(t, 'Christian', true);
  ui.find('[data-kind="diaper"]').click();
  await ui.app.save();
  assert.ok(ui.find('.star-celebration.reduced-celebration .celebration-rainbow'));
});


for (const mood of ['angry', 'asleep']) test(`${mood}: Auswahl, Wechsel, Abwahl, Entwurf und Speicherung`, async t => {
 const ui = await setup(t);
 ui.find('[data-kind="diaper"]').click();
 assert.equal(ui.window.document.querySelectorAll('[data-mood]').length, 6);
 ui.find('[data-mood="calm"]').click();
 ui.find(`[data-mood="${mood}"]`).click();
 assert.equal(ui.find('[data-mood="calm"]').getAttribute('aria-pressed'), 'false');
 assert.equal(ui.find(`[data-mood="${mood}"]`).getAttribute('aria-pressed'), 'true');
 ui.find(`[data-mood="${mood}"]`).click();
 assert.equal(ui.find(`[data-mood="${mood}"]`).getAttribute('aria-pressed'), 'false');
 ui.find(`[data-mood="${mood}"]`).click();
 await ui.app.refresh();
 assert.equal(ui.find(`[data-mood="${mood}"]`).getAttribute('aria-pressed'), 'true');
 assert.equal(JSON.parse(ui.window.localStorage.getItem('phililog-draft:test-user')!).draft.mood, mood);
 let saved: any;
 ui.setCreate(async p => { saved = p.input; return p.input; });
 await ui.app.save();
 assert.equal(saved.mood_after, mood);
 assert.equal(ui.window.document.querySelector('[data-mood][aria-pressed="true"]'), null);
});

test('Sonnenbad unter Mehr: getrennte Dauer, Entwurf, keine fachfremden Felder und Speichern', async t => {
 const ui = await setup(t);
 assert.ok(ui.find('#extra-events [data-kind="sunbath"]'));
 assert.equal(ui.window.document.querySelector('.kind-picker [data-kind="sunbath"]'), null);
 ui.find('[data-kind="bottle"]').click(); ui.input('#amount', '65');
 ui.find('[data-mood="calm"]').click();
 ui.find('[data-kind="sunbath"]').click();
 assert.equal(ui.find('#sunbath-duration').value, '');
 assert.equal(ui.find('.duration-block').hidden, true);
 for (const selector of ['#amount', '#temperature', '#weight', '.side-picker', '.timer-box']) assert.equal(ui.window.document.querySelector(selector), null, selector);
 ui.input('#sunbath-duration', '5');
 await ui.app.refresh();
 assert.equal(ui.find('#sunbath-duration').value, '5');
 await ui.app.enterSession('test-user');
 assert.equal(ui.find('#sunbath-duration').value, '5');
 ui.find('[data-kind="bottle"]').click(); assert.equal(ui.find('#duration').value, '15');
 ui.find('[data-kind="sunbath"]').click(); assert.equal(ui.find('#sunbath-duration').value, '5');
 let saved: any;
 ui.setCreate(async p => { saved = p.input; return p.input; });
 await ui.app.save();
 assert.equal(saved.kind, 'sunbath'); assert.equal(saved.duration_minutes, 5); assert.equal(saved.mood_after, 'calm');
 ui.find('[data-kind="sunbath"]').click(); assert.equal(ui.find('#sunbath-duration').value, '');
 await ui.app.save(); assert.equal(saved.duration_minutes, null);
});

test('Laufendes Stillen sperrt Sonnenbad wie andere zusätzliche Ereignisse', async t => {
 const ui = await setup(t);
 ui.find('#start-breast').click();
 assert.equal(ui.find('[data-kind="sunbath"]').disabled, true);
});

test('Massage unter Mehr: getrennte Dauer, Entwurf, keine fachfremden Felder und Speichern', async t => {
 const ui = await setup(t);
 assert.ok(ui.find('#extra-events [data-kind="massage"]'));
 assert.equal(ui.window.document.querySelector('.kind-picker [data-kind="massage"]'), null);
 ui.find('[data-kind="bottle"]').click(); ui.input('#amount', '65');
 ui.find('[data-mood="calm"]').click();
 ui.find('[data-kind="massage"]').click();
 assert.equal(ui.find('#massage-duration').value, '');
 assert.equal(ui.find('.duration-block').hidden, true);
 for (const selector of ['#amount', '#temperature', '#weight', '.side-picker', '.timer-box']) assert.equal(ui.window.document.querySelector(selector), null, selector);
 ui.input('#massage-duration', '5');
 await ui.app.refresh();
 assert.equal(ui.find('#massage-duration').value, '5');
 await ui.app.enterSession('test-user');
 assert.equal(ui.find('#massage-duration').value, '5');
 ui.find('[data-kind="bottle"]').click(); assert.equal(ui.find('#duration').value, '15');
 ui.find('[data-kind="massage"]').click(); assert.equal(ui.find('#massage-duration').value, '5');
 let saved: any;
 ui.setCreate(async p => { saved = p.input; return p.input; });
 await ui.app.save();
 assert.equal(saved.kind, 'massage'); assert.equal(saved.duration_minutes, 5); assert.equal(saved.mood_after, 'calm');
 ui.find('[data-kind="massage"]').click(); assert.equal(ui.find('#massage-duration').value, '');
 await ui.app.save(); assert.equal(saved.duration_minutes, null);
});

test('Laufendes Stillen sperrt Massage wie andere zusätzliche Ereignisse', async t => {
 const ui = await setup(t);
 ui.find('#start-breast').click();
 assert.equal(ui.find('[data-kind="massage"]').disabled, true);
});

test('Babygymnastik unter Mehr: getrennte Dauer, Entwurf, keine fachfremden Felder und Speichern', async t => {
 const ui = await setup(t);
 assert.ok(ui.find('#extra-events [data-kind="gymnastics"]'));
 assert.equal(ui.window.document.querySelector('.kind-picker [data-kind="gymnastics"]'), null);
 ui.find('[data-kind="bottle"]').click(); ui.input('#amount', '65');
 ui.find('[data-mood="calm"]').click();
 ui.find('[data-kind="gymnastics"]').click();
 assert.equal(ui.find('#gymnastics-duration').value, '');
 assert.equal(ui.find('.duration-block').hidden, true);
 for (const selector of ['#amount', '#temperature', '#weight', '.side-picker', '.timer-box']) assert.equal(ui.window.document.querySelector(selector), null, selector);
 ui.input('#gymnastics-duration', '5');
 await ui.app.refresh();
 assert.equal(ui.find('#gymnastics-duration').value, '5');
 await ui.app.enterSession('test-user');
 assert.equal(ui.find('#gymnastics-duration').value, '5');
 ui.find('[data-kind="bottle"]').click(); assert.equal(ui.find('#duration').value, '15');
 ui.find('[data-kind="gymnastics"]').click(); assert.equal(ui.find('#gymnastics-duration').value, '5');
 let saved: any;
 ui.setCreate(async p => { saved = p.input; return p.input; });
 await ui.app.save();
 assert.equal(saved.kind, 'gymnastics'); assert.equal(saved.duration_minutes, 5); assert.equal(saved.mood_after, 'calm');
 ui.find('[data-kind="gymnastics"]').click(); assert.equal(ui.find('#gymnastics-duration').value, '');
 await ui.app.save(); assert.equal(saved.duration_minutes, null);
});

test('Laufendes Stillen sperrt Babygymnastik wie andere zusätzliche Ereignisse', async t => {
 const ui = await setup(t);
 ui.find('#start-breast').click();
 assert.equal(ui.find('[data-kind="gymnastics"]').disabled, true);
});


test('Aktivitäten behalten jeweils ihre eigene Dauer beim Wechsel', async t => {
 const ui = await setup(t);
 for (const [kind, value] of [['sunbath', '3'], ['massage', '7'], ['gymnastics', '9']]) {
  ui.find(`[data-kind="${kind}"]`).click();
  assert.equal(ui.find(`#${kind}-duration`).value, '');
  ui.input(`#${kind}-duration`, value);
 }
 for (const [kind, value] of [['sunbath', '3'], ['massage', '7'], ['gymnastics', '9']]) {
  ui.find(`[data-kind="${kind}"]`).click();
  assert.equal(ui.find(`#${kind}-duration`).value, value);
 }
});

for (const kind of ['sunbath', 'massage', 'gymnastics']) test(`${kind}: Befinden auswählen, entfernen, wiederherstellen und bei Messungen zurücksetzen`, async t => {
 const ui = await setup(t);
 ui.find(`[data-kind="${kind}"]`).click();
 assert.equal(ui.window.document.querySelectorAll('[data-mood]').length, 6);
 assert.equal(ui.window.document.querySelector('[data-mood][aria-pressed="true"]'), null);
 ui.find('[data-mood="calm"]').click();
 ui.find('[data-mood="asleep"]').click();
 assert.equal(ui.find('[data-mood="calm"]').getAttribute('aria-pressed'), 'false');
 ui.find('[data-mood="asleep"]').click();
 assert.equal(ui.window.document.querySelector('[data-mood][aria-pressed="true"]'), null);
 ui.find('[data-mood="angry"]').click();
 await ui.app.enterSession('test-user');
 assert.equal(ui.find('[data-mood="angry"]').getAttribute('aria-pressed'), 'true');
 let saved: any;
 ui.setCreate(async p => { saved = p.input; return p.input; });
 await ui.app.save();
 assert.equal(saved.mood_after, 'angry');
 ui.find(`[data-kind="${kind}"]`).click();
 assert.equal(ui.window.document.querySelector('[data-mood][aria-pressed="true"]'), null);
 for (const measurement of ['weight', 'temperature']) {
  ui.find('[data-mood="calm"]').click();
  ui.find(`[data-kind="${measurement}"]`).click();
  assert.equal(ui.window.document.querySelector('#mood-options'), null);
  ui.find(`[data-kind="${kind}"]`).click();
  assert.equal(ui.window.document.querySelector('[data-mood][aria-pressed="true"]'), null);
 }
});
