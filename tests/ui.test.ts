import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { Window } from 'happy-dom';
import * as domain from '../src/domain.ts';
import * as report from '../src/report.ts';

// Execute the real entry point and handlers in a disposable DOM. Only the API is substituted.
async function setup(t: any) {
  const window = new Window({ url: 'http://localhost:5173' });
  t.after(() => window.happyDOM.close());
  window.document.body.innerHTML = '<div id="app"></div>';
  let settings = { breast_left_ml: 25, breast_right_ml: 25, version: 1 };
  const submitted: number[] = [];
  const entry = { ...domain.feedingInput({ ...domain.newDraft(), kind: 'bottle', amount: '65' }), id: 'existing', created_by: 'test-user', version: 1 };
  let create: (p: any) => Promise<any> = async p => ({ ...p.input, id: p.id });
  Object.assign(window, domain, report, {
    configured: true, currentFamilyPerson: async () => 'Julia',
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
