import './style.css';
import { preserveFormState } from './render-state.ts';
import { currentFamilyPerson, getSettings, saveSettings, getDailyReport, configured, supabase, listFeedings, allFeedings, latestMeal, createFeeding, updateFeeding, deleteFeeding, friendlyError } from './api.ts';
import { isActivity, hasDraftChanges, sameInput, moods, type Mood, type Person, estimatedMilk, newDraft, draftFromFeeding, feedingInput, localDateTime, dayKey, elapsedLabel, sideLabel, milkLabel, kindLabel, toCsv, PAGE_SIZE, type Draft, type Feeding, type PendingCreate } from './domain.ts';

import { berlinDay, shiftDay, weekRange, reportTotal, milliliters, type Settings, type BreastDefaults, type DailyReport } from './report.ts';

const app = document.querySelector<HTMLDivElement>('#app')!;
const icons = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2"/>',
  bottle: '<path d="M9 3h6v4l2 3v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l2-3zM9 7h6M7 12h4M7 16h4"/>',
  massage: '<path d="M3 16c3-3 5-3 8-1s6 2 10-1M4 20h16M7 4c-2 2 2 3 0 5m5-6c-2 2 2 3 0 5m5-4c-2 2 2 3 0 5"/>',
  gymnastics: '<circle cx="12" cy="4" r="2"/><path d="m4 8 8 3 8-3m-8 3v5m0 0-6 6m6-6 6 6"/>',
  sunbath: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  temperature: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM12 8v9"/>',
  weight: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 8h8l-1 5H9zM12 8l1 3"/>',
  diaper: '<path d="M4 5h16l-2 13a8 8 0 0 1-12 0zM4 9c4 0 5 4 5 8m11-8c-4 0-5 4-5 8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  edit: '<path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-3-3L5 16z"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = (name: keyof typeof icons) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const localTimeLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Datum wählen' : date.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
let userId: string | null = null;
let view: 'new' | 'history' | 'about' | 'report' | 'settings' = 'new';
let draft = newDraft();
let edit: Feeding | null = null;
let pending: PendingCreate | null = null;
let entries: Feeding[] = [];
let latest: Feeding | null = null;
let meal: Feeding | null = null;
let hasMore = false;
let busy = false;
let loading = false;
let notice = '';
let error = '';
let authorized = false;
let epoch = 0;
let refreshGeneration = 0;
let loginEmail = '';
let settings: Settings | null = null;
let settingsDraft: { left: string; right: string; version: number } | null = null;
let reportWeek = berlinDay();
let signedInPerson: Person | null = null;
let reportRows: DailyReport[] | null = null;
function currentDefaults(): BreastDefaults | null {
  return settings ? { left: settings.breast_left_ml, right: settings.breast_right_ml } : null;
}

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
    if (saved && ['bottle', 'breast', 'diaper', 'weight', 'temperature', 'sunbath', 'massage', 'gymnastics'].includes(saved.draft?.kind)) {
      draft = { ...newDraft(), ...saved.draft };
      if (typeof saved.draft.breastDefault === 'number') draft.breastDefault = { left: saved.draft.breastDefault, right: saved.draft.breastDefault };
      if (draft.bottleUnknown) draft.bottleDuration = '0';
      if (draft.breastUnknown) draft.breastDuration = '0';
      draft.bottleUnknown = false; draft.breastUnknown = false;
      edit = saved.edit ?? null;
      if (edit && saved.draft.estimateMode === undefined) { draft.estimateMode = 'manual'; draft.estimate = edit.estimated_ml == null ? '' : String(edit.estimated_ml); }
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
function entryValues(entry: Feeding): string {
  if (entry.kind === 'temperature') return `${entry.temperature_c?.toLocaleString('de-DE', { minimumFractionDigits: 1 })} °C`;
  if (entry.kind === 'weight') return `${entry.weight_g?.toLocaleString('de-DE')} g`;
  if (entry.kind === 'diaper') return [entry.urine ? 'Urin' : '', entry.stool ? 'Stuhl' : '', !entry.urine && !entry.stool ? 'Windel trocken' : ''].filter(Boolean).join(' · ');
  return [entry.kind === 'bottle' ? `${entry.amount_ml} ml` : entry.estimated_ml != null ? `${entry.estimated_ml} ml geschätzt` : '', entry.duration_minutes === null ? 'Dauer unbekannt' : `${entry.duration_minutes} Min.`].filter(Boolean).join(' · ');
}
function entryCard(entry: Feeding, compact = false): string {
  const metadata = [sideLabel(entry.side), milkLabel(entry.milk_type), entry.held_success ? 'Abhalten erfolgreich' : ''].filter(Boolean).join(' · ');
  return `<article class="entry ${compact ? 'compact' : ''}"><span class="entry-icon ${entry.kind}">${icon(entry.kind === 'bottle' ? 'bottle' : entry.kind === 'diaper' ? 'diaper' : entry.kind === 'weight' ? 'weight' : entry.kind === 'temperature' ? 'temperature' : isActivity(entry.kind) ? entry.kind : 'heart')}</span><div class="entry-content"><div class="entry-heading"><strong>${kindLabel(entry.kind)}</strong><time datetime="${escape(entry.occurred_at)}">${timeLabel(entry.occurred_at)}</time></div><p class="entry-values">${escape(entryValues(entry))}</p>${metadata ? `<p>${escape(metadata)}</p>` : ''}<div class="entry-meta"><span class="person-badge ${entry.performed_by === 'Julia' ? 'person-julia' : entry.performed_by === 'Christian' ? 'person-christian' : 'person-unknown'}">${escape(entry.performed_by ?? 'Nicht zugeordnet')}</span>${entry.mood_after ? `<span class="mood-badge"><span aria-hidden="true">${moods[entry.mood_after].icon}</span> ${moods[entry.mood_after].label}</span>` : ''}</div>${compact ? `<span class="entry-date">${dateLabel(entry.occurred_at)}</span>` : ''}</div><button class="edit-button" data-edit="${entry.id}" aria-label="${kindLabel(entry.kind)} vom ${escape(dateLabel(entry.occurred_at))} um ${timeLabel(entry.occurred_at)} bearbeiten">${icon('edit')}</button></article>`;
}
function recentContext(): string {
  if (draft.kind === 'diaper' || draft.kind === 'weight' || draft.kind === 'temperature' || isActivity(draft.kind)) return `<aside class="recent-context"><span>Letzter Eintrag</span><strong>${latest ? `${kindLabel(latest.kind)} · ${timeLabel(latest.occurred_at)}` : 'Noch kein Eintrag'}</strong><button type="button" id="see-history" class="text-button">Logbuch</button></aside>`;
  return `<aside class="recent-context"><span>Letzte Mahlzeit</span><strong id="meal-elapsed">${meal ? elapsedLabel(meal.occurred_at) : loading ? 'Wird geladen …' : 'Noch keine Mahlzeit'}</strong>${meal ? `<span class="recent-detail">${kindLabel(meal.kind)} · Ende ${timeLabel(meal.occurred_at)}</span>` : ''}<button type="button" id="see-history" class="text-button">Logbuch</button></aside>`;
}
function formView(): string {
  const bottle = draft.kind === 'bottle';
  const diaper = draft.kind === 'diaper';
  const weight = draft.kind === 'weight';
  const temperature = draft.kind === 'temperature';
  const activity = isActivity(draft.kind);
  const timed = draft.kind === 'breast' && Boolean(draft.breastStart);
  return `${edit ? `<div class="edit-heading-row"><div><h1>Eintrag bearbeiten</h1><p>${kindLabel(edit.kind)} · ${dateLabel(edit.occurred_at)} · ${timeLabel(edit.occurred_at)}</p></div><button type="button" id="cancel-edit" class="secondary" ${busy ? 'disabled' : ''}>Abbrechen</button></div>` : '<h1 class="sr-only">Eintrag erfassen</h1>'}${recentContext()}<div class="form-layout"><section class="card feeding-card"><form id="feeding-form" novalidate><fieldset ${busy || pending ? 'disabled' : ''}><legend class="sr-only">Eintrag erfassen</legend><div class="field-header kind-header"><span>Eintragsart</span><details id="extra-events" class="extra-events"><summary>${weight ? 'Wiegen' : temperature ? 'Temperatur' : activity ? kindLabel(draft.kind) : 'Mehr'}<span class="sr-only"> · Weitere Ereignisse</span></summary><div class="extra-events-menu"><button type="button" data-kind="weight" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${weight}" class="secondary ${weight ? 'selected' : ''}">${icon('weight')} Wiegen</button><button type="button" data-kind="temperature" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${temperature}" class="secondary ${temperature ? 'selected' : ''}">${icon('temperature')} Temperatur</button>${(['sunbath', 'massage', 'gymnastics'] as const).map(kind => `<button type="button" data-kind="${kind}" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${draft.kind === kind}" class="secondary ${draft.kind === kind ? 'selected' : ''}">${icon(kind)} ${kindLabel(kind)}</button>`).join('')}</div></details></div><div class="kind-picker" role="group" aria-label="Eintragsart"><button type="button" data-kind="bottle" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${bottle}" class="kind-button ${bottle ? 'selected' : ''}">${icon('bottle')}<span>Flasche</span>${bottle ? icon('check') : ''}</button><button type="button" data-kind="breast" aria-pressed="${draft.kind === 'breast'}" class="kind-button ${draft.kind === 'breast' ? 'selected' : ''}">${icon('heart')}<span>Stillen</span>${draft.kind === 'breast' ? icon('check') : ''}</button><button type="button" data-kind="diaper" ${draft.breastStart && !draft.breastEnd ? 'disabled' : ''} aria-pressed="${diaper}" class="kind-button ${diaper ? 'selected' : ''}">${icon('diaper')}<span>Wickeln</span>${diaper ? icon('check') : ''}</button></div>

      ${activity ? `<div class="field-block"><div class="field-header"><label for="${draft.kind}-duration">Dauer</label><span class="field-hint">Optional</span></div><div class="weight-input"><input id="${draft.kind}-duration" type="number" inputmode="numeric" min="0" step="1" placeholder="—" value="${escape(isActivity(draft.kind) ? draft[`${draft.kind}Duration`] : '')}"><span>Min.</span></div><p class="field-note">Leer lassen oder 0 eingeben, wenn die Dauer nicht bekannt ist.</p></div>` : ''}
      ${temperature ? `<div class="field-block"><div class="field-header"><label for="temperature">Körpertemperatur</label><span class="field-hint">in °C</span></div><div class="weight-input"><input id="temperature" type="text" inputmode="decimal" required placeholder="z. B. 37,2" value="${escape(draft.temperature)}"><span>°C</span></div></div>` : ''}
      ${weight ? `<div class="field-block"><div class="field-header"><label for="weight">Gewicht</label><span class="field-hint">in Gramm</span></div><div class="weight-input"><input id="weight" type="number" inputmode="numeric" min="1" step="1" required placeholder="z. B. 3500" value="${escape(draft.weight)}"><span>g</span></div></div>` : ''}
      ${diaper ? `<div class="field-block"><div class="field-header"><label>Was war in der Windel?</label></div><div class="diaper-toggles" role="group" aria-label="Windelinhalt"><button type="button" data-diaper="urine" aria-pressed="${draft.urine}" class="secondary ${draft.urine ? 'selected' : ''}"><span class="toggle-check" aria-hidden="true">${draft.urine ? '✓' : ''}</span> 💧 Urin</button><button type="button" data-diaper="stool" aria-pressed="${draft.stool}" class="secondary ${draft.stool ? 'selected' : ''}"><span class="toggle-check" aria-hidden="true">${draft.stool ? '✓' : ''}</span> 💩 Stuhl</button></div><p class="field-note">Beides möglich. Ohne Auswahl: Windel trocken.</p><button type="button" data-diaper="heldSuccess" aria-pressed="${draft.heldSuccess}" class="secondary held-toggle ${draft.heldSuccess ? 'selected' : ''}"><span class="toggle-check" aria-hidden="true">${draft.heldSuccess ? '✓' : ''}</span> Abhalten erfolgreich</button></div>` : ''}
      ${bottle ? `<div class="field-block"><div class="field-header"><label for="amount">Getrunkene Menge</label><span class="field-hint">In 5-ml-Schritten</span></div><div class="stepper amount-stepper"><button type="button" data-step="amount:-5" aria-label="Menge um 5 Milliliter verringern">−</button><div class="unit-input"><input id="amount" name="amount" type="number" inputmode="numeric" min="5" step="5" placeholder="—" value="${escape(draft.amount)}" required><span>ml</span></div><button type="button" data-step="amount:5" aria-label="Menge um 5 Milliliter erhöhen">+</button></div></div><div class="field-block"><label for="milk-type">Milchart</label><select id="milk-type"><option value="pre" ${draft.milkType === 'pre' ? 'selected' : ''}>Pre-Nahrung</option><option value="breast_milk" ${draft.milkType === 'breast_milk' ? 'selected' : ''}>Muttermilch</option>${draft.milkType === '' ? '<option value="" selected>Nicht angegeben</option>' : ''}</select></div>` : diaper || weight || temperature || activity ? '' : `<div class="field-block"><div class="field-header"><label>Stillseite</label><span class="field-hint">Optional</span></div><div class="segmented side-picker" role="group" aria-label="Stillseite">${[['', 'Offen'], ['left', 'Links'], ['right', 'Rechts'], ['both', 'Beide']].map(([value, label]) => `<button type="button" data-side="${value}" aria-pressed="${draft.side === value}" class="${draft.side === value ? 'active' : ''}">${label}</button>`).join('')}</div></div>`}
      ${draft.kind === 'breast' ? `<div class="timer-box"><div><span class="eyebrow">STILLZEIT FESTHALTEN</span><p>${draft.breastStart ? `Beginn ${timeLabel(draft.breastStart)}${draft.breastEnd ? ` · Ende ${timeLabel(draft.breastEnd)}` : ' · läuft'}` : 'Ein Klick zum Start. Einer zum Ende.'}</p>${draft.breastStart ? `<strong class="elapsed-timer" id="nursing-elapsed">${elapsedLabel(draft.breastStart, draft.breastEnd ? new Date(draft.breastEnd).getTime() : Date.now(), true)}</strong>` : ''}</div>${!draft.breastStart ? `<button type="button" id="start-breast" class="secondary">Stillen starten</button>` : !draft.breastEnd ? `<button type="button" id="end-breast" class="primary">Stillen beenden</button>` : '<span class="timer-done">Zeiten erfasst</span>'}${draft.breastStart ? '<button type="button" id="clear-timer" class="text-button">Zeiten manuell angeben</button>' : ''}</div>` : ''}
      ${draft.kind === 'breast' ? `<details id="estimate-options" class="estimate-options" ${draft.estimateMode === 'manual' ? 'open' : ''}><summary>Stillmenge · ${estimateLabel()}</summary><p class="field-note">Optionale Schätzung für die gesamte Mahlzeit. ${draft.breastDefault === null ? 'Standard wird geladen.' : `Standard: links ${draft.breastDefault.left} ml · rechts ${draft.breastDefault.right} ml; bei beiden zusammen.`}</p><label for="estimate">Geschätzte Gesamtmenge (ml)</label><input id="estimate" type="number" inputmode="numeric" min="0" step="1" value="${escape(draft.estimateMode === 'manual' ? draft.estimate : automaticEstimateValue())}" placeholder="Keine Schätzung"><p class="field-note">Leer lassen, wenn ihr keine Menge schätzen möchtet.</p><button type="button" id="estimate-default" class="text-button" ${!settings ? 'disabled' : ''}>Aktuellen Standard verwenden</button></details>` : ''}
      <div class="timing-fields"><div class="field-block duration-block" ${diaper || weight || temperature || activity ? 'hidden' : ''}><div class="field-header"><label for="duration">Dauer</label><span class="field-hint">${timed ? 'Aus Start und Ende' : 'Vorschlag · anpassbar'}</span></div><div class="stepper"><button type="button" data-step="duration:-1" aria-label="Dauer um eine Minute verringern" ${timed ? 'disabled' : ''}>−</button><div class="unit-input"><input id="duration" name="duration" type="number" inputmode="numeric" min="0" step="1" placeholder="—" value="${timed && !draft.breastEnd ? '' : escape(bottle ? draft.bottleDuration : draft.breastDuration)}" ${timed ? 'disabled' : ''}><span>Min.</span></div><button type="button" data-step="duration:1" aria-label="Dauer um eine Minute erhöhen" ${timed ? 'disabled' : ''}>+</button></div>${!timed ? '<p class="field-note">0 Minuten = Dauer nicht bekannt</p>' : ''}</div>
      <details id="time-options" class="time-options" ${draft.timeMode === 'custom' && !timed ? 'open' : ''}><summary><span>${timed ? 'Erfasste Zeit' : weight || temperature || diaper || activity ? 'Zeitpunkt' : 'Endzeit'} · ${timed ? `${timeLabel(draft.breastStart!)}${draft.breastEnd ? `–${timeLabel(draft.breastEnd)}` : ' · läuft'}` : draft.timeMode === 'now' ? 'Gerade eben' : escape(localTimeLabel(draft.localTime))}</span><span class="person-context">${escape(edit ? draft.performedBy ?? 'Nicht zugeordnet' : signedInPerson ?? 'Dein Konto')}</span></summary><div class="time-block" ${timed ? 'hidden' : ''}><div class="segmented" role="group" aria-label="Zeitpunkt"><button type="button" data-time="now" aria-pressed="${draft.timeMode === 'now'}" class="${draft.timeMode === 'now' ? 'active' : ''}">Gerade eben</button><button type="button" data-time="custom" aria-pressed="${draft.timeMode === 'custom'}" class="${draft.timeMode === 'custom' ? 'active' : ''}">Anderer Zeitpunkt</button></div>${draft.timeMode === 'custom' ? `<label for="local-time">Datum und Uhrzeit</label><input id="local-time" type="datetime-local" step="60" value="${escape(draft.localTime)}" required>` : '<p class="field-note">Uhrzeit beim Speichern.</p>'}</div>${edit ? `<div class="field-block"><label for="performed-by">Erledigt von</label><select id="performed-by">${!draft.performedBy ? '<option value="" selected>Nicht zugeordnet</option>' : ''}<option value="Julia" ${draft.performedBy === 'Julia' ? 'selected' : ''}>Julia</option><option value="Christian" ${draft.performedBy === 'Christian' ? 'selected' : ''}>Christian</option></select></div>` : `<p class="field-note">Zuordnung: ${escape(signedInPerson ?? 'angemeldetes Konto')}. Nach dem Speichern änderbar.</p>`}</details></div>${!weight && !temperature ? `<details id="mood-options" class="mood-field" ${draft.mood ? 'open' : ''}><summary><span id="mood-label">Befinden danach</span><span class="field-hint">${draft.mood ? moods[draft.mood].label : 'Optional'}</span></summary><div class="mood-picker" role="group" aria-labelledby="mood-label">${Object.entries(moods).map(([value, mood]) => `<button type="button" data-mood="${value}" aria-pressed="${draft.mood === value}"><span aria-hidden="true">${mood.icon}</span>${mood.label}</button>`).join('')}</div>${draft.mood ? '<button type="button" id="clear-mood" class="text-button">Auswahl entfernen</button>' : ''}</details>` : ''}</fieldset>
      ${pending ? '<p class="pending-note">Die Bestätigung fehlt noch. „Erneut speichern“ prüft dieselbe Übermittlung, ohne einen zweiten Eintrag anzulegen.</p>' : ''}
      <div class="save-bar"><button class="primary full save-button" type="submit" ${busy || (timed && !draft.breastEnd) ? 'disabled' : ''}>${busy ? 'Wird gespeichert …' : pending ? 'Erneut speichern' : edit ? 'Änderungen speichern' : 'Speichern · Io triumphe'} ${icon('check')}</button></div>
      ${edit ? `<div class="edit-actions"><button type="button" id="delete-entry" class="text-button danger" ${busy ? 'disabled' : ''}>Eintrag löschen</button></div>` : ''}
      </form></section></div>`;
}
function automaticEstimateValue(): string {
  try { return String(estimatedMilk(draft) ?? ''); } catch { return ''; }
}
function estimateLabel(): string {
  try { const value = estimatedMilk(draft); return value === null ? 'ohne Schätzung' : `ca. ${value} ml`; } catch { return 'Bitte Menge prüfen'; }
}
function settingsView(): string {
  return `<section class="card settings-card"><h1>Einstellungen</h1><h2>Still-Schätzung</h2><p>Gemeinsam für Julia und Christian. Der Standard wird bei neuen Einträgen pro Brust übernommen. Gespeicherte Mengen bleiben unverändert.</p>${settings ? `<form id="settings-form" novalidate><label for="breast-default-left">Linke Brust (ml)</label><input id="breast-default-left" type="number" inputmode="numeric" min="1" step="1" value="${escape(settingsDraft?.left ?? settings.breast_left_ml)}" ${busy ? 'disabled' : ''}><label for="breast-default-right">Rechte Brust (ml)</label><input id="breast-default-right" type="number" inputmode="numeric" min="1" step="1" value="${escape(settingsDraft?.right ?? settings.breast_right_ml)}" ${busy ? 'disabled' : ''}><p class="field-note">Bei beiden Brüsten werden die Werte addiert. Dies ist eure persönliche Schätzung.</p><button class="primary" ${busy ? 'disabled' : ''}>${busy ? 'Wird gespeichert …' : 'Einstellungen speichern'}</button></form>${settingsDraft ? `<p class="field-note">${settingsDraft.version !== settings?.version ? 'Die Serverwerte wurden inzwischen geändert. Deine Eingaben bleiben erhalten. Übernimm die Serverwerte, um die Änderung neu einzugeben.' : 'Ungespeicherte Einstellungen'}</p><button class="secondary" id="reset-settings" ${busy ? 'disabled' : ''}>Serverwerte übernehmen</button>` : ''}` : '<p>Einstellungen werden geladen …</p>'}</section>`;
}
function reportView(): string {
  const today = berlinDay();
  const range = weekRange(reportWeek, today);
  const formatDay = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', weekday: 'short', timeZone: 'Europe/Berlin' });
  const ml = (n: number) => `${n.toLocaleString('de-DE')} ml`;
  return `<section class="daily-report"><h1>Tagesbericht</h1><div class="report-controls"><button class="secondary" id="report-prev" aria-label="Vorherige Kalenderwoche">←</button><strong aria-live="polite">KW ${range.week} <span>· ${range.year}</span></strong><button class="secondary" id="report-next" aria-label="Nächste Kalenderwoche" ${range.current ? 'disabled' : ''}>→</button></div><div class="report-today"><span>Heute · ${formatDay(today)}</span><button class="secondary" id="report-today" aria-label="Zur aktuellen Kalenderwoche">Heute</button></div>${reportRows === null ? `<p>${loading ? 'Bericht wird geladen …' : 'Bericht konnte nicht geladen werden.'}</p>` : reportRows.map(row => {
    const total = reportTotal(row);
    return `<article class="card daily-card ${row.day === today ? 'is-today' : ''}"><h2>${row.day === today ? 'Heute · ' : ''}${formatDay(row.day)}</h2>${row.events ? `<dl class="milk-totals"><div><dt>Flasche</dt><dd>${ml(row.bottle_ml)}</dd></div><div><dt>Stillen · geschätzt</dt><dd>${row.breast_ml === 0 && row.missing_estimates ? '—' : `ca. ${ml(row.breast_ml)}`}</dd></div><div class="milk-total"><dt>Erfasste Menge${total.estimated ? ' · geschätzt' : ''}${total.incomplete ? '<span class="incomplete-label">Unvollständig</span>' : ''}</dt><dd>${total.estimated ? 'ca. ' : ''}${ml(total.amount)}</dd></div></dl>${row.missing_estimates ? `<p class="missing-estimates">${row.missing_estimates} Stillmahlzeit${row.missing_estimates === 1 ? '' : 'en'} ohne Mengenangabe</p>` : ''}<div class="diaper-counts"><span><b>${row.diapers}</b> × gewickelt</span><span><b>${row.wet}</b> × Urin</span><span><b>${row.stool}</b> × Stuhl</span></div>` : '<p class="field-note">Keine Einträge</p>'}</article>`;
  }).join('')}</section>`;
}
async function storeSettings() {
  if (busy || !settings) return;
  const ownEpoch = epoch;
  try {
    const value = { left: milliliters(settingsDraft?.left ?? String(settings.breast_left_ml), false), right: milliliters(settingsDraft?.right ?? String(settings.breast_right_ml), false) };
    busy = true; error = ''; render();
    const updated = await saveSettings(value, settingsDraft?.version ?? settings.version);
    if (ownEpoch !== epoch) return;
    settings = updated; settingsDraft = null;
    if (!edit && !pending && !draft.side && !draft.breastStart && draft.estimateMode === 'auto') { draft.breastDefault = currentDefaults(); remember(); } notice = 'Standard gespeichert. Gilt für neue Einträge.';
  } catch (e) { if (ownEpoch === epoch) error = friendlyError(e); }
  finally { if (ownEpoch === epoch) { busy = false; render(); } }
}
function bindReports() {
  document.querySelector('#reset-settings')?.addEventListener('click', async () => {
    if (busy || !await confirmAction('Eigene Einstellungswerte verwerfen und aktuelle Serverwerte übernehmen?')) return;
    settingsDraft = null; error = ''; await refresh(); render();
  });
  document.querySelector('#settings-form')?.addEventListener('submit', e => { e.preventDefault(); void storeSettings(); });
  document.querySelector('#settings-form')?.addEventListener('input', () => { settingsDraft = { version: settingsDraft?.version ?? settings!.version, left: document.querySelector<HTMLInputElement>('#breast-default-left')!.value, right: document.querySelector<HTMLInputElement>('#breast-default-right')!.value }; });
  const changeWeek = (day: string) => { reportWeek = weekRange(day).start; reportRows = null; void refresh(); render(); };
  document.querySelector('#report-prev')?.addEventListener('click', () => changeWeek(shiftDay(weekRange(reportWeek).start, -7)));
  document.querySelector('#report-next')?.addEventListener('click', () => changeWeek(shiftDay(weekRange(reportWeek).start, 7)));
  document.querySelector('#report-today')?.addEventListener('click', () => changeWeek(berlinDay()));
}
function historyView(): string {
  let previous = '';
  const list = entries.map(entry => {
    const day = dayKey(entry.occurred_at);
    const heading = day !== previous ? `<h2 class="day-heading">${day === dayKey(new Date().toISOString()) ? 'Heute' : dateLabel(entry.occurred_at)}</h2>` : '';
    previous = day;
    return heading + entryCard(entry);
  }).join('');
  return `<div class="page-heading"><h1>Logbuch</h1><button id="export" class="secondary" ${busy ? 'disabled' : ''}>${icon('download')}<span>CSV exportieren</span></button></div><section class="history-list">${list || `<div class="card empty-history">${icon('book')}<h2>${loading ? 'Einen Moment …' : 'Euer Logbuch wartet auf euch.'}</h2><p>${loading ? 'Wir laden eure Einträge.' : 'Der erste Eintrag erscheint hier, sobald ihr ihn gespeichert habt.'}</p><button id="first-entry" class="secondary">Neuen Eintrag erstellen</button></div>`}${hasMore ? `<button class="secondary load-more" id="load-more" ${loading ? 'disabled' : ''}>${loading ? 'Wird geladen …' : 'Weitere Einträge laden'}</button>` : ''}</section>`;
}
function aboutView(): string {
  return `<section class="card about-card"><h1>Über Phililog</h1><p>Ein kleines gemeinsames Logbuch für den Alltag mit Philine. Mahlzeiten schnell festhalten, gemeinsam den Überblick behalten und mehr Zeit füreinander haben.</p><p>Von Christian und Julia für Philine vibe-gecodet – mit Liebe in Göttingen entstanden.</p><p>Die Aquarellfarben erinnern an ihre Geburtskarte: ein bisschen Blau, Türkis und Violett begleitet euch durch den Alltag.</p><button class="secondary" data-view="new">Zurück zur Eingabe</button></section>`;
}
function render() {
  if (!userId) return renderLogin();
  const restoreFormState = preserveFormState(app);
  app.innerHTML = `<main class="app-main">${authorized ? `<div class="navigation-bar"><nav class="main-nav" aria-label="Hauptansichten"><button data-view="new" class="${view === 'new' ? 'active' : ''}" aria-current="${view === 'new' ? 'page' : 'false'}">${icon('plus')}Eintragen</button><button data-view="history" class="${view === 'history' ? 'active' : ''}" aria-current="${view === 'history' ? 'page' : 'false'}">${icon('book')}Logbuch</button><button data-view="report" class="${view === 'report' ? 'active' : ''}" aria-current="${view === 'report' ? 'page' : 'false'}">Tagesbericht</button></nav></div><div id="messages" aria-live="polite">${notice ? `<p class="message success">${icon('check')}${escape(notice)}</p>` : ''}${error ? `<p class="message error" role="alert">${escape(error)} <button id="refresh" class="text-button">Aktualisieren</button></p>` : ''}</div>${view === 'new' ? formView() : view === 'history' ? historyView() : view === 'report' ? reportView() : view === 'settings' ? settingsView() : aboutView()}` : `<section class="card access-card"><h1>${loading ? 'Euer Logbuch wird geöffnet …' : 'Zugang noch nicht freigeschaltet'}</h1><p>${escape(error || 'Dieses Konto muss für euer gemeinsames Logbuch freigeschaltet sein.')}</p><button id="refresh-access" class="secondary">Erneut prüfen</button></section>`}</main><footer class="app-footer"><span>phililog.</span>${authorized ? `<button class="text-button" data-view="about" aria-current="${view === 'about' ? 'page' : 'false'}">Über das Projekt</button><button class="text-button" data-view="settings">Einstellungen</button>` : ''}<button class="text-button logout" id="logout">Abmelden</button></footer>`;
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
    if ((edit || hasDraftChanges(draft)) && !await confirmAction('Den aktuellen Entwurf verwerfen und diesen Eintrag bearbeiten?')) return;
    edit = entry; draft = draftFromFeeding(entry); view = 'new'; notice = ''; error = ''; remember(); render(); window.scrollTo(0, 0);
  }));
  document.querySelector('#load-more')?.addEventListener('click', () => void refresh(true));
  document.querySelector('#export')?.addEventListener('click', () => void exportEntries());
  bindForm();
  bindReports();
  restoreFormState();
}
function switchView(next: typeof view) {
  if (busy) return;
  captureForm(); remember(); if (next === 'report') reportRows = null; view = next; notice = ''; error = ''; render(); window.scrollTo(0, 0); if (next !== 'about') void refresh();
}
function bindLogout() {
  document.querySelector('#logout')?.addEventListener('click', async () => {
    if (busy) return;
    if ((pending || edit || settingsDraft || hasDraftChanges(draft)) && !await confirmAction('Abmelden und den ungespeicherten Entwurf auf diesem Gerät löschen?')) return;
    const key = storageKey();
    await supabase!.auth.signOut({ scope: 'local' });
    try { localStorage.removeItem(key); } catch { /* no local storage */ }
    await enterSession(null);
  });
}
function bindForm() {
  const form = document.querySelector<HTMLFormElement>('#feeding-form');
  if (!form) return;
  document.querySelector('#clear-mood')?.addEventListener('click', () => { captureForm(); draft.mood = null; remember(); render(); document.querySelector<HTMLElement>('#mood-options summary')?.focus(); });
  document.querySelectorAll<HTMLButtonElement>('[data-mood]').forEach(button => button.addEventListener('click', () => {
    captureForm(); const value = button.dataset.mood as Mood;
    draft.mood = draft.mood === value ? null : value;
    remember(); render(); document.querySelector<HTMLButtonElement>(`[data-mood="${value}"]`)?.focus({ preventScroll: true });
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-diaper]').forEach(button => button.addEventListener('click', () => {
    const field = button.dataset.diaper as 'urine' | 'stool' | 'heldSuccess';
    captureForm(); draft[field] = !draft[field]; remember(); render();
  }));
  document.querySelector('#start-breast')?.addEventListener('click', () => {
    captureForm(); draft.breastStart = new Date().toISOString(); draft.breastEnd = null;
    draft.breastUnknown = false; remember(); render(); document.querySelector<HTMLElement>('#end-breast')?.focus({ preventScroll: true });
  });
  document.querySelector('#end-breast')?.addEventListener('click', () => {
    draft.breastEnd = new Date().toISOString();
    draft.breastDuration = String(Math.max(1, Math.round((new Date(draft.breastEnd).getTime() - new Date(draft.breastStart!).getTime()) / 60000)));
    draft.timeMode = 'custom'; draft.localTime = localDateTime(draft.breastEnd); remember(); render(); document.querySelector<HTMLElement>('#clear-timer')?.focus({ preventScroll: true });
  });
  document.querySelector('#clear-timer')?.addEventListener('click', async () => {
    if (!await confirmAction('Die erfassten Start-/Endzeiten durch manuelle Angaben ersetzen?')) return;
    draft.breastStart = null; draft.breastEnd = null;
    if (!draft.breastDuration) draft.breastDuration = '30';
    remember(); render();
  });
  document.querySelector<HTMLInputElement>('#estimate')?.addEventListener('input', e => { draft.estimateMode = 'manual'; draft.estimate = (e.target as HTMLInputElement).value; remember(); });
  document.querySelector('#estimate-default')?.addEventListener('click', () => { captureForm(); draft.breastDefault = currentDefaults(); draft.estimateMode = 'auto'; draft.estimate = ''; remember(); render(); });
  form.addEventListener('input', () => { captureForm(); remember(); });
  document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(b => b.addEventListener('click', () => {
    captureForm(); draft.kind = b.dataset.kind as Draft['kind']; if (draft.kind === 'weight' || draft.kind === 'temperature') draft.mood = null; remember(); render();
    const extra = document.querySelector<HTMLDetailsElement>('#extra-events');
    if (extra) extra.open = false;
    if (draft.kind === 'weight' || draft.kind === 'temperature' || isActivity(draft.kind)) document.querySelector<HTMLElement>('#extra-events summary')?.focus({ preventScroll: true });
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-side]').forEach(b => b.addEventListener('click', () => {
    draft.side = b.dataset.side as Draft['side']; remember(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-time]').forEach(b => b.addEventListener('click', () => {
    captureForm(); draft.timeMode = b.dataset.time as Draft['timeMode'];
    if (draft.timeMode === 'custom' && !draft.localTime) draft.localTime = localDateTime(new Date());
    remember(); render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b => b.addEventListener('click', () => {
    const [field, delta] = b.dataset.step!.split(':');
    const input = document.querySelector<HTMLInputElement>(`#${field}`)!;
    input.value = String(Math.max(field === 'amount' ? 5 : 0, (Number(input.value) || 0) + Number(delta)));
    captureForm(); remember();
  }));
  form.addEventListener('submit', e => { e.preventDefault(); void save(); });
  document.querySelector('#cancel-edit')?.addEventListener('click', () => { edit = null; draft = newDraft(currentDefaults()); error = ''; remember(); render(); });
  document.querySelector('#delete-entry')?.addEventListener('click', () => void remove());
}
function captureForm() {
  const input = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`);
  const performer = document.querySelector<HTMLSelectElement>('#performed-by');
  if (performer) draft.performedBy = performer.value as Draft['performedBy'] || null;
  if (isActivity(draft.kind) && input(`${draft.kind}-duration`)) draft[`${draft.kind}Duration`] = input(`${draft.kind}-duration`)!.value;
  if (input('temperature')) draft.temperature = input('temperature')!.value;
  if (input('weight')) draft.weight = input('weight')!.value;
  if (input('local-time')) draft.localTime = input('local-time')!.value;
  if (!input('duration')) return;
  if (draft.kind === 'bottle') {
    draft.bottleDuration = input('duration')!.value;
    draft.bottleUnknown = false;
    draft.milkType = (document.querySelector<HTMLSelectElement>('#milk-type')?.value ?? 'pre') as Draft['milkType'];
    draft.amount = input('amount')!.value;
  } else {
    draft.breastDuration = input('duration')!.value;
    draft.breastUnknown = false;
  }
}
function celebrate() {
  const christian = signedInPerson === 'Christian';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced && !christian) return;
  document.querySelectorAll('.watercolor-celebration').forEach(el => el.remove());
  const shower = document.createElement('div');
  shower.className = `watercolor-celebration${christian ? ' star-celebration' : ''}${reduced ? ' reduced-celebration' : ''}`; shower.setAttribute('aria-hidden', 'true');
  if (christian) {
    const rainbow = document.createElement('div');
    rainbow.className = 'celebration-rainbow';
    rainbow.textContent = '🌈';
    shower.append(rainbow);
  }
  for (let i = 0; i < (christian ? 72 : 24); i++) {
    const dot = document.createElement('i');
    dot.style.setProperty('--x', `${Math.random() * 100}%`);
    dot.style.setProperty('--delay', `${Math.random() * 180}ms`);
    dot.style.setProperty('--drift', `${Math.random() * 100 - 50}px`);
    if (christian) {
      dot.textContent = i % 3 === 0 ? '✦' : '★';
      dot.style.color = ['#ffcf40', '#ff80b5', '#80ddff', '#c2a1ff'][i % 4];
      dot.style.setProperty('--delay', `${Math.random() * 700}ms`);
      dot.style.setProperty('--size', `${22 + Math.random() * 26}px`);
    } else dot.style.background = ['#83ced9', '#85b6df', '#b1a4d6'][i % 3];
    shower.append(dot);
  }
  document.body.append(shower);
  setTimeout(() => shower.remove(), christian ? 3200 : 1600);
}
async function save() {
  if (busy || !userId) return;
  captureForm();
  const ownEpoch = epoch;
  error = ''; notice = '';
  let showCelebration = false;
  try {
    const input = pending?.input ?? feedingInput(draft);
    if (!edit && !pending) { pending = { id: crypto.randomUUID(), input }; remember(); }
    busy = true; render();
    const result = edit ? await updateFeeding(edit, input) : await createFeeding(pending!, userId);
    const recovered = !edit && (!result || !sameInput(result, input));
    if (ownEpoch !== epoch) return;
    notice = edit ? 'Änderungen gespeichert.' : !result ? 'Der Eintrag war gespeichert und wurde inzwischen gelöscht. Er wird nicht erneut angelegt.' : recovered ? 'Der Eintrag war bereits gespeichert und wurde inzwischen geändert. Die aktuelle Fassung bleibt erhalten.' : 'Io triumphe! Eintrag festgehalten.';
    showCelebration = Boolean(result) && !recovered;
    edit = null; pending = null; draft = newDraft(currentDefaults()); remember();
  } catch (e) {
    if (ownEpoch !== epoch) return;
    error = friendlyError(e);
    // Definitive validation/permission rejections did not commit; allow correction.
    if (['23514', '42501', 'PGRST205', 'CREATE_COLLISION'].includes((e as { code?: string })?.code ?? '')) { pending = null; remember(); }
  } finally { if (ownEpoch === epoch) { busy = false; render(); document.querySelector('#messages')?.scrollIntoView({ block: 'nearest' }); } }
  if (ownEpoch === epoch && !error) { if (showCelebration) celebrate(); await refresh(); }
}
async function remove() {
  if (busy || !edit || !await confirmAction('Diesen Eintrag wirklich löschen? Das lässt sich nicht rückgängig machen.')) return;
  busy = true; error = ''; render();
  try {
    await deleteFeeding(edit);
    edit = null; draft = newDraft(currentDefaults()); view = 'history'; notice = 'Eintrag gelöscht.'; remember();
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
    const [rows, recentMeal, currentSettings, dailyRows] = await Promise.all([
      listFeedings(PAGE_SIZE, last ? { time: last.occurred_at, id: last.id } : undefined),
      more ? Promise.resolve(meal) : latestMeal(),
      getSettings(),
      view === 'report' ? getDailyReport(weekRange(reportWeek).start, weekRange(reportWeek).end) : Promise.resolve(null),
    ]);
    if (ownEpoch !== epoch || ownRefresh !== refreshGeneration) return;
    if (more) entries = [...entries, ...rows.filter(row => !entries.some(e => e.id === row.id))];
    else { entries = rows; latest = rows[0] ?? null; meal = recentMeal; }
    settings = currentSettings;
    if (!edit && !pending && (draft.breastDefault === null || (!draft.side && !draft.breastStart && draft.estimateMode === 'auto'))) { draft.breastDefault = currentDefaults(); remember(); }
    if (dailyRows) reportRows = dailyRows;
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
  settings = null; settingsDraft = null; reportRows = null; reportWeek = berlinDay(); signedInPerson = null;
  userId = id; authorized = false; entries = []; latest = null; meal = null; draft = newDraft(); pending = null; edit = null;
  error = ''; notice = ''; view = 'new'; busy = false; loading = Boolean(id);
  if (!id) { render(); return; }
  restore(); render();
  try {
    const { data, error: accessError } = await supabase!.rpc('is_family_member');
    if (ownEpoch !== epoch) return;
    if (accessError) throw accessError;
    if (data === true) {
      const person = await currentFamilyPerson();
      if (ownEpoch !== epoch) return;
      signedInPerson = person;
    }
    authorized = data === true;
    if (!authorized) error = 'Dieses Konto ist nicht für euer Logbuch freigeschaltet.';
  } catch (e) { if (ownEpoch === epoch) error = friendlyError(e); }
  finally { if (ownEpoch === epoch) { loading = false; render(); if (authorized) await refresh(); } }
}
function updateElapsedTimes() {
  const nursing = document.querySelector('#nursing-elapsed');
  if (nursing && draft.breastStart) nursing.textContent = elapsedLabel(draft.breastStart, draft.breastEnd ? new Date(draft.breastEnd).getTime() : Date.now(), true);
  const previousMeal = document.querySelector('#meal-elapsed');
  if (previousMeal && meal) previousMeal.textContent = elapsedLabel(meal.occurred_at);
}
setInterval(() => { if (document.visibilityState === 'visible') updateElapsedTimes(); }, 1000);
window.addEventListener('online', () => { if (!busy) void refresh(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !busy) { updateElapsedTimes(); void refresh(); }
  else if (document.visibilityState === 'hidden') { captureForm(); remember(); }
});
renderLogin();
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    // Keep asynchronous Supabase work outside the auth callback lock.
    setTimeout(() => void enterSession(session?.user.id ?? null), 0);
  });
}
