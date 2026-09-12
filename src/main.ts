import './style.css';
import { configured, supabase, listFeedings, allFeedings, createFeeding, updateFeeding, deleteFeeding, friendlyError } from './api.ts';
import { newDraft, draftFromFeeding, feedingInput, localDateTime, dayKey, sideLabel, toCsv, PAGE_SIZE, type Draft, type Feeding, type PendingCreate } from './domain.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
const icons = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2"/>',
  bottle: '<path d="M9 3h6v4l2 3v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l2-3zM9 7h6M7 12h4M7 16h4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = (name: keyof typeof icons) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
let userId: string | null = null;
let view: 'new' | 'history' | 'about' = 'new';
let draft = newDraft();
let edit: Feeding | null = null;
let pending: PendingCreate | null = null;
let entries: Feeding[] = [];
let latest: Feeding | null = null;
let hasMore = false;
let busy = false;
let loading = false;
let notice = '';
let error = '';
let authorized = false;
let epoch = 0;
let refreshGeneration = 0;
let loginEmail = '';

function confirmAction(message: string): Promise<boolean> {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('aria-labelledby', 'confirm-title');
    dialog.innerHTML = `<h2 id="confirm-title">Kurz nachgefragt</h2><p>${escape(message)}</p><div class="dialog-actions"><button class="secondary" data-cancel autofocus>Abbrechen</button><button class="primary" data-confirm>Bestätigen</button></div>`;
    const finish = (confirmed: boolean) => { dialog.close(); dialog.remove(); resolve(confirmed); };
    dialog.querySelector('[data-cancel]')!.addEventListener('click', () => finish(false));
    dialog.querySelector('[data-confirm]')!.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', e => { e.preventDefault(); finish(false); });
    document.body.append(dialog);
    dialog.showModal();
  });
}

function storageKey() { return `phililog-draft:${userId}`; }
function remember() {
  if (!userId) return;
  try { localStorage.setItem(storageKey(), JSON.stringify({ draft, edit, pending })); } catch { /* In-memory editing remains available. */ }
}
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()) ?? 'null');
    if (saved && ['bottle', 'breast'].includes(saved.draft?.kind)) {
      draft = { ...newDraft(), ...saved.draft };
      edit = saved.edit ?? null;
      pending = saved.pending ?? null;
    }
  } catch { /* Ignore a damaged local draft. */ }
}
function header() {
  return `<header class="topbar"><a class="brand" href="./" aria-label="Phililog Startseite">phililog<span class="brand-dot">.</span></a><span class="private-label"><span class="status-dot"></span>Euer kleines Logbuch</span>${userId ? '<button class="text-button logout" id="logout">Abmelden</button>' : ''}</header>`;
}
function renderLogin() {
  app.innerHTML = `${header()}<main class="login-wrap"><section class="welcome"><span class="eyebrow">FÜR EURE ERSTEN GEMEINSAMEN TAGE</span><h1>Kleine Momente.<br>Gut aufgehoben.</h1><p>Euer gemeinsames Logbuch für die kleinen<br class="desktop-only"> und großen Mahlzeiten.</p><div class="welcome-art" aria-hidden="true"><div class="art-orbit"></div><div class="art-card">${icon('heart')}<span>Zusammen den<br>Überblick behalten.</span></div><span class="art-spark">✦</span></div></section><section class="card login-card"><span class="eyebrow">WILLKOMMEN ZURÜCK</span><h2>Schön, dass ihr da seid.</h2><p class="muted">Einmal anmelden. Danach direkt loslegen.</p>${configured ? `<form id="login-form"><label for="email">E-Mail-Adresse</label><input id="email" name="email" type="email" autocomplete="username" required value="${escape(loginEmail)}" placeholder="Eure E-Mail-Adresse"><label for="password">Passwort</label><input id="password" name="password" type="password" autocomplete="current-password" required placeholder="Euer Passwort"><p class="message error" role="alert">${escape(error)}</p><button class="primary full" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Anmelden …' : 'Anmelden'} ${icon('arrow')}</button></form><p class="login-note">Nur für euch beide. Auf diesem Gerät bleibt ihr angemeldet.</p><details class="help"><summary>Zugang vergessen?</summary><p>Christian kann das Passwort über die Supabase-Benutzerverwaltung neu setzen. Danach mit dem neuen Passwort anmelden.</p></details>` : '<div class="setup-note"><h3>Fast bereit für euch.</h3><p>Die Verbindung zu eurem Logbuch ist noch nicht eingerichtet. Sobald die Supabase-Konfiguration hinterlegt ist, könnt ihr euch hier anmelden.</p></div>'}</section></main><footer>Ein kleiner Helfer für euren Alltag.</footer>`;
  document.querySelector('#login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget as HTMLFormElement);
    loginEmail = String(form.get('email') ?? '').trim();
    busy = true; error = ''; renderLogin();
    try {
      const result = await supabase!.auth.signInWithPassword({ email: loginEmail, password: String(form.get('password')) });
      if (result.error) throw result.error;
    } catch {
      error = 'Anmeldung nicht möglich. Bitte E-Mail, Passwort und Verbindung prüfen.';
    } finally { busy = false; if (!userId) renderLogin(); }
  });
  bindLogout();
}
function details(entry: Feeding): string {
  return [entry.started_at ? `${timeLabel(entry.started_at)}–${timeLabel(entry.occurred_at)}` : '', entry.amount_ml !== null ? `${entry.amount_ml} ml` : sideLabel(entry.side), entry.duration_minutes === null ? 'Dauer unbekannt' : `${entry.duration_minutes} Min.`].filter(Boolean).join(' · ');
}
function entryCard(entry: Feeding, compact = false): string {
  return `<article class="entry ${compact ? 'compact' : ''}"><span class="entry-icon ${entry.kind}">${icon(entry.kind === 'bottle' ? 'bottle' : 'heart')}</span><div class="entry-content"><div class="entry-heading"><strong>${entry.kind === 'bottle' ? 'Flasche' : 'Stillen'}</strong><time datetime="${escape(entry.occurred_at)}">${timeLabel(entry.occurred_at)}</time></div><p>${escape(details(entry))}</p>${compact ? `<span class="entry-date">${dateLabel(entry.occurred_at)}</span>` : ''}</div><button class="edit-button" data-edit="${entry.id}" aria-label="${entry.kind === 'bottle' ? 'Flasche' : 'Stillen'} vom ${escape(dateLabel(entry.occurred_at))} um ${timeLabel(entry.occurred_at)} bearbeiten">${icon('arrow')}</button></article>`;
}
function formView(): string {
  const bottle = draft.kind === 'bottle';
  const timed = !bottle && Boolean(draft.breastStart);
  const unknown = bottle ? draft.bottleUnknown : draft.breastUnknown;
  return `<h1 class="${edit ? 'edit-heading' : 'sr-only'}">${edit ? 'Eintrag bearbeiten' : 'Fütterung erfassen'}</h1><div class="form-layout"><section class="card feeding-card"><form id="feeding-form" novalidate><fieldset ${busy || pending ? 'disabled' : ''}><legend class="sr-only">Fütterung erfassen</legend><div class="field-header"><label>Wie wurde gefüttert?</label></div><div class="kind-picker" role="group" aria-label="Fütterungsart"><button type="button" data-kind="bottle" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${bottle}" class="kind-button ${bottle ? 'selected' : ''}">${icon('bottle')}<span>Flasche</span>${bottle ? icon('check') : ''}</button><button type="button" data-kind="breast" aria-pressed="${!bottle}" class="kind-button ${!bottle ? 'selected' : ''}">${icon('heart')}<span>Stillen</span>${!bottle ? icon('check') : ''}</button></div>
      ${bottle ? `<div class="field-block"><div class="field-header"><label for="amount">Wie viel?</label><span class="field-hint">In 5-ml-Schritten</span></div><div class="stepper amount-stepper"><button type="button" data-step="amount:-5" aria-label="Menge um 5 Milliliter verringern">−</button><div class="unit-input"><input id="amount" name="amount" type="number" inputmode="numeric" min="5" step="5" placeholder="—" value="${escape(draft.amount)}" required><span>ml</span></div><button type="button" data-step="amount:5" aria-label="Menge um 5 Milliliter erhöhen">+</button></div><p class="field-note">Die tatsächlich getrunkene Menge.</p></div>` : `<div class="field-block"><div class="field-header"><label>Welche Seite?</label><span class="field-hint">Optional</span></div><div class="segmented side-picker" role="group" aria-label="Stillseite">${[['', 'Offen'], ['left', 'Links'], ['right', 'Rechts'], ['both', 'Beide']].map(([value, label]) => `<button type="button" data-side="${value}" aria-pressed="${draft.side === value}" class="${draft.side === value ? 'active' : ''}">${label}</button>`).join('')}</div></div>`}
      ${!bottle ? `<div class="timer-box"><div><span class="eyebrow">STILLZEIT FESTHALTEN</span><p>${draft.breastStart ? `Beginn ${timeLabel(draft.breastStart)}${draft.breastEnd ? ` · Ende ${timeLabel(draft.breastEnd)}` : ' · läuft'}` : 'Ein Klick zum Start. Einer zum Ende.'}</p></div>${!draft.breastStart ? `<button type="button" id="start-breast" class="secondary">Stillen starten</button>` : !draft.breastEnd ? `<button type="button" id="end-breast" class="primary">Stillen beenden</button>` : '<span class="timer-done">Zeiten erfasst</span>'}${draft.breastStart ? '<button type="button" id="clear-timer" class="text-button">Zeiten manuell angeben</button>' : ''}</div>` : ''}
      <div class="field-block duration-block"><div class="field-header"><label for="duration">Wie lange?</label><span class="field-hint">${timed ? 'Aus Start und Ende' : 'Vorschlag · anpassbar'}</span></div><div class="stepper"><button type="button" data-step="duration:-1" aria-label="Dauer um eine Minute verringern" ${unknown || timed ? 'disabled' : ''}>−</button><div class="unit-input"><input id="duration" name="duration" type="number" inputmode="numeric" min="1" step="1" placeholder="—" value="${timed && !draft.breastEnd ? '' : escape(bottle ? draft.bottleDuration : draft.breastDuration)}" ${unknown || timed ? 'disabled' : ''}><span>Min.</span></div><button type="button" data-step="duration:1" aria-label="Dauer um eine Minute erhöhen" ${unknown || timed ? 'disabled' : ''}>+</button></div><label class="checkbox" ${timed ? 'hidden' : ''}><input id="unknown" type="checkbox" ${timed ? 'disabled' : ''} ${unknown ? 'checked' : ''}>Dauer nicht bekannt</label></div>
      <div class="field-block time-block" ${timed ? 'hidden' : ''}><div class="field-header"><label>Wann war die Mahlzeit zu Ende?</label></div><div class="segmented" role="group" aria-label="Fütterungszeitpunkt"><button type="button" data-time="now" aria-pressed="${draft.timeMode === 'now'}" class="${draft.timeMode === 'now' ? 'active' : ''}" ${timed ? 'disabled' : ''}>Gerade eben</button><button type="button" data-time="custom" aria-pressed="${draft.timeMode === 'custom'}" class="${draft.timeMode === 'custom' ? 'active' : ''}" ${timed ? 'disabled' : ''}>Anderer Zeitpunkt</button></div>${draft.timeMode === 'custom' ? `<label class="sr-only" for="local-time">Datum und Uhrzeit</label><input id="local-time" ${timed ? 'disabled' : ''} type="datetime-local" step="60" value="${escape(draft.localTime)}" required>` : '<p class="field-note">Die aktuelle Uhrzeit wird beim Speichern eingetragen.</p>'}</div></fieldset>
      ${pending ? '<p class="pending-note">Die Bestätigung fehlt noch. „Erneut speichern“ prüft dieselbe Übermittlung, ohne einen zweiten Eintrag anzulegen.</p>' : ''}
      <button class="primary full save-button" type="submit" ${busy || (timed && !draft.breastEnd) ? 'disabled' : ''}>${busy ? 'Wird gespeichert …' : pending ? 'Erneut speichern' : edit ? 'Änderungen speichern' : 'Eintrag speichern'} ${icon('check')}</button>
      ${edit ? `<div class="edit-actions"><button type="button" id="cancel-edit" class="text-button" ${busy ? 'disabled' : ''}>Abbrechen</button><button type="button" id="delete-entry" class="text-button danger" ${busy ? 'disabled' : ''}>Eintrag löschen</button></div>` : ''}
      </form></section><aside class="aside"><section class="last-entry"><div class="section-title"><h2>Zuletzt gefüttert</h2><span class="small-dot"></span></div>${latest ? entryCard(latest, true) : `<div class="empty-mini">${icon('book')}<p>${loading ? 'Logbuch wird geladen …' : 'Hier erscheint eure letzte Mahlzeit.'}</p></div>`}<button id="see-history" class="history-link">Zum Logbuch ${icon('arrow')}</button></section></aside></div>`;
}
function historyView(): string {
  let previous = '';
  const list = entries.map(entry => {
    const day = dayKey(entry.occurred_at);
    const heading = day !== previous ? `<h2 class="day-heading">${day === dayKey(new Date().toISOString()) ? 'Heute' : dateLabel(entry.occurred_at)}</h2>` : '';
    previous = day;
    return heading + entryCard(entry);
  }).join('');
  return `<div class="page-heading"><h1>Logbuch</h1><button id="export" class="secondary" ${busy ? 'disabled' : ''}>${icon('download')}<span>CSV exportieren</span></button></div><section class="history-list">${list || `<div class="card empty-history">${icon('book')}<h2>${loading ? 'Einen Moment …' : 'Euer Logbuch wartet auf euch.'}</h2><p>${loading ? 'Wir laden eure Einträge.' : 'Die erste Mahlzeit erscheint hier, sobald ihr sie gespeichert habt.'}</p><button id="first-entry" class="secondary">Neuen Eintrag erstellen</button></div>`}${hasMore ? `<button class="secondary load-more" id="load-more" ${loading ? 'disabled' : ''}>${loading ? 'Wird geladen …' : 'Weitere Einträge laden'}</button>` : ''}</section>`;
}
function aboutView(): string {
  return `<section class="card about-card"><h1>Über Phililog</h1><p>Ein kleines gemeinsames Logbuch für den Alltag mit Philine. Mahlzeiten schnell festhalten, gemeinsam den Überblick behalten und mehr Zeit füreinander haben.</p><p>Von Christian und Julia für Philine vibe-gecodet – mit Liebe in Göttingen entstanden.</p><p>Die Aquarellfarben erinnern an ihre Geburtskarte: ein bisschen Blau, Türkis und Violett begleitet euch durch den Alltag.</p><button class="secondary" data-view="new">Zurück zur Eingabe</button></section>`;
}
function render() {
  if (!userId) return renderLogin();
  app.innerHTML = `<main class="app-main">${authorized ? `<nav class="main-nav" aria-label="Hauptansichten"><button data-view="new" class="${view === 'new' ? 'active' : ''}" aria-current="${view === 'new' ? 'page' : 'false'}">${icon('plus')}Neuer Eintrag</button><button data-view="history" class="${view === 'history' ? 'active' : ''}" aria-current="${view === 'history' ? 'page' : 'false'}">${icon('book')}Logbuch</button></nav><div id="messages" aria-live="polite">${notice ? `<p class="message success">${icon('check')}${escape(notice)}</p>` : ''}${error ? `<p class="message error" role="alert">${escape(error)} <button id="refresh" class="text-button">Aktualisieren</button></p>` : ''}</div>${view === 'new' ? formView() : view === 'history' ? historyView() : aboutView()}` : `<section class="card access-card"><h1>${loading ? 'Euer Logbuch wird geöffnet …' : 'Zugang noch nicht freigeschaltet'}</h1><p>${escape(error || 'Dieses Konto muss für euer gemeinsames Logbuch freigeschaltet sein.')}</p><button id="refresh-access" class="secondary">Erneut prüfen</button></section>`}</main><footer class="app-footer"><span>phililog.</span>${authorized ? `<button class="text-button" data-view="about" aria-current="${view === 'about' ? 'page' : 'false'}">Über das Projekt</button>` : ''}<button class="text-button logout" id="logout">Abmelden</button></footer>`;
  bindLogout();
  document.querySelector('#refresh-access')?.addEventListener('click', () => void enterSession(userId));
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view as typeof view)));
  document.querySelector('#refresh')?.addEventListener('click', () => void refresh());
  document.querySelector('#see-history')?.addEventListener('click', () => switchView('history'));
  document.querySelector('#first-entry')?.addEventListener('click', () => switchView('new'));
  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => button.addEventListener('click', async () => {
    if (busy || pending) return;
    const entry = entries.find(e => e.id === button.dataset.edit) ?? (latest?.id === button.dataset.edit ? latest : null);
    if (!entry) return;
    if ((edit || draft.breastStart || draft.amount || draft.timeMode === 'custom') && !await confirmAction('Den aktuellen Entwurf verwerfen und diesen Eintrag bearbeiten?')) return;
    edit = entry; draft = draftFromFeeding(entry); view = 'new'; notice = ''; error = ''; remember(); render(); window.scrollTo(0, 0);
  }));
  document.querySelector('#load-more')?.addEventListener('click', () => void refresh(true));
  document.querySelector('#export')?.addEventListener('click', () => void exportEntries());
  bindForm();
}
function switchView(next: typeof view) {
  if (busy) return;
  captureForm(); remember(); view = next; notice = ''; error = ''; render(); window.scrollTo(0, 0); if (next !== 'about') void refresh();
}
function bindLogout() {
  document.querySelector('#logout')?.addEventListener('click', async () => {
    if (busy) return;
    if ((pending || edit || draft.breastStart || draft.amount) && !await confirmAction('Abmelden und den ungespeicherten Entwurf auf diesem Gerät löschen?')) return;
    const key = storageKey();
    await supabase!.auth.signOut({ scope: 'local' });
    try { localStorage.removeItem(key); } catch { /* no local storage */ }
    await enterSession(null);
  });
}
function bindForm() {
  const form = document.querySelector<HTMLFormElement>('#feeding-form');
  if (!form) return;
  document.querySelector('#start-breast')?.addEventListener('click', () => {
    captureForm(); draft.breastStart = new Date().toISOString(); draft.breastEnd = null;
    draft.breastUnknown = false; remember(); render();
  });
  document.querySelector('#end-breast')?.addEventListener('click', () => {
    draft.breastEnd = new Date().toISOString();
    draft.breastDuration = String(Math.max(1, Math.round((new Date(draft.breastEnd).getTime() - new Date(draft.breastStart!).getTime()) / 60000)));
    draft.timeMode = 'custom'; draft.localTime = localDateTime(draft.breastEnd); remember(); render();
  });
  document.querySelector('#clear-timer')?.addEventListener('click', async () => {
    if (!await confirmAction('Die erfassten Start-/Endzeiten durch manuelle Angaben ersetzen?')) return;
    draft.breastStart = null; draft.breastEnd = null;
    if (!draft.breastDuration) draft.breastDuration = '30';
    remember(); render();
  });
  form.addEventListener('input', () => { captureForm(); remember(); });
  document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(b => b.addEventListener('click', () => {
    captureForm(); draft.kind = b.dataset.kind as Draft['kind']; remember(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-side]').forEach(b => b.addEventListener('click', () => {
    draft.side = b.dataset.side as Draft['side']; remember(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-time]').forEach(b => b.addEventListener('click', () => {
    captureForm(); draft.timeMode = b.dataset.time as Draft['timeMode'];
    if (draft.timeMode === 'custom' && !draft.localTime) draft.localTime = localDateTime(new Date());
    remember(); render();
  }));
  document.querySelector('#unknown')?.addEventListener('change', () => { captureForm(); remember(); render(); });
  document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b => b.addEventListener('click', () => {
    const [field, delta] = b.dataset.step!.split(':');
    const input = document.querySelector<HTMLInputElement>(`#${field}`)!;
    input.value = String(Math.max(field === 'amount' ? 5 : 1, (Number(input.value) || 0) + Number(delta)));
    captureForm(); remember();
  }));
  form.addEventListener('submit', e => { e.preventDefault(); void save(); });
  document.querySelector('#cancel-edit')?.addEventListener('click', () => { edit = null; draft = newDraft(); error = ''; remember(); render(); });
  document.querySelector('#delete-entry')?.addEventListener('click', () => void remove());
}
function captureForm() {
  const input = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input('duration')) return;
  if (draft.kind === 'bottle') {
    draft.bottleDuration = input('duration')!.value;
    draft.bottleUnknown = input('unknown')!.checked;
    draft.amount = input('amount')!.value;
  } else {
    draft.breastDuration = input('duration')!.value;
    draft.breastUnknown = input('unknown')!.checked;
  }
  if (input('local-time')) draft.localTime = input('local-time')!.value;
}
async function save() {
  if (busy || !userId) return;
  captureForm();
  const ownEpoch = epoch;
  error = ''; notice = '';
  try {
    const input = pending?.input ?? feedingInput(draft);
    if (!edit && !pending) { pending = { id: crypto.randomUUID(), input }; remember(); }
    busy = true; render();
    if (edit) await updateFeeding(edit, input);
    else await createFeeding(pending!, userId);
    if (ownEpoch !== epoch) return;
    notice = edit ? 'Änderungen gespeichert.' : 'Mahlzeit gespeichert. Alles festgehalten.';
    edit = null; pending = null; draft = newDraft(); remember();
  } catch (e) {
    if (ownEpoch !== epoch) return;
    error = friendlyError(e);
    // Definitive validation/permission rejections did not commit; allow correction.
    if (['23514', '42501', 'PGRST205'].includes((e as { code?: string })?.code ?? '')) { pending = null; remember(); }
  } finally { if (ownEpoch === epoch) { busy = false; render(); } }
  if (ownEpoch === epoch && !error) await refresh();
}
async function remove() {
  if (busy || !edit || !await confirmAction('Diese Mahlzeit wirklich löschen? Das lässt sich nicht rückgängig machen.')) return;
  busy = true; error = ''; render();
  try {
    await deleteFeeding(edit);
    edit = null; draft = newDraft(); view = 'history'; notice = 'Eintrag gelöscht.'; remember();
  } catch (e) { error = friendlyError(e); }
  finally { busy = false; render(); }
  if (!error) await refresh();
}
async function exportEntries() {
  if (busy) return;
  busy = true; error = ''; render();
  const ownEpoch = epoch;
  try {
    const rows = await allFeedings();
    if (ownEpoch !== epoch || !userId) return;
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `phililog-${dayKey(new Date().toISOString())}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice = 'CSV-Export erstellt.';
  } catch (e) { error = friendlyError(e); }
  finally { busy = false; render(); }
}
async function refresh(more = false) {
  if (!authorized || !userId || (more && loading)) return;
  loading = true;
  const ownEpoch = epoch;
  const ownRefresh = ++refreshGeneration;
  const last = more ? entries.at(-1) : undefined;
  try {
    const rows = await listFeedings(PAGE_SIZE, last ? { time: last.occurred_at, id: last.id } : undefined);
    if (ownEpoch !== epoch || ownRefresh !== refreshGeneration) return;
    if (more) entries = [...entries, ...rows.filter(row => !entries.some(e => e.id === row.id))];
    else { entries = rows; latest = rows[0] ?? null; }
    hasMore = rows.length === PAGE_SIZE;
    error = '';
  } catch (e) { if (ownEpoch === epoch && ownRefresh === refreshGeneration) error = friendlyError(e); }
  finally { if (ownEpoch === epoch && ownRefresh === refreshGeneration) { loading = false; captureForm(); render(); } }
}
async function enterSession(id: string | null) {
  if (id === userId && authorized) return;
  const previous = userId;
  const ownEpoch = ++epoch;
  if (previous && previous !== id) { try { localStorage.removeItem(storageKey()); } catch { /* no storage */ } }
  userId = id; authorized = false; entries = []; latest = null; draft = newDraft(); pending = null; edit = null;
  error = ''; notice = ''; view = 'new'; busy = false; loading = Boolean(id);
  if (!id) { render(); return; }
  restore(); render();
  try {
    const { data, error: accessError } = await supabase!.rpc('is_family_member');
    if (ownEpoch !== epoch) return;
    if (accessError) throw accessError;
    authorized = data === true;
    if (!authorized) error = 'Dieses Konto ist nicht für euer Logbuch freigeschaltet.';
  } catch (e) { if (ownEpoch === epoch) error = friendlyError(e); }
  finally { if (ownEpoch === epoch) { loading = false; render(); if (authorized) await refresh(); } }
}
window.addEventListener('online', () => { if (!busy) void refresh(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !busy) void refresh();
  else if (document.visibilityState === 'hidden') { captureForm(); remember(); }
});
renderLogin();
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    // Keep asynchronous Supabase work outside the auth callback lock.
    setTimeout(() => void enterSession(session?.user.id ?? null), 0);
  });
}
