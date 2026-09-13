import { milliliters, type BreastDefaults } from './report.ts';
export type FeedingKind = 'bottle' | 'breast' | 'diaper' | 'weight';
export const moods = { fussy: { label: 'Quengelig', icon: '😣' }, sleepy: { label: 'Schläfrig', icon: '😴' }, calm: { label: 'Ruhig', icon: '😌' }, alert: { label: 'Aufmerksam', icon: '👀' } } as const;
export type Mood = keyof typeof moods;
export type Person = 'Julia' | 'Christian';
export type MilkType = 'pre' | 'breast_milk';
export type Side = 'left' | 'right' | 'both';
export interface Draft {
  mood: Mood | null;
  breastDefault: BreastDefaults | null;
  estimateMode: 'auto' | 'manual';
  estimate: string;
  performedBy?: Person | null;
  kind: FeedingKind;
  bottleDuration: string;
  breastDuration: string;
  bottleUnknown: boolean;
  breastUnknown: boolean;
  urine: boolean;
  stool: boolean;
  heldSuccess: boolean;
  weight: string;
  amount: string;
  milkType: MilkType | '';
  side: '' | Side;
  timeMode: 'now' | 'custom';
  localTime: string;
  exactTime: string | null;
  breastStart: string | null;
  breastEnd: string | null;
}
export interface FeedingInput {
  mood_after?: Mood | null;
  estimated_ml?: number | null;
  performed_by?: Person | null;
  kind: FeedingKind;
  occurred_at: string;
  started_at: string | null;
  duration_minutes: number | null;
  amount_ml: number | null;
  side: Side | null;
  milk_type?: MilkType | null;
  urine?: boolean | null;
  stool?: boolean | null;
  held_success?: boolean | null;
  weight_g?: number | null;
}
export interface Feeding extends FeedingInput {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
}
export const PAGE_SIZE = 30;
export function newDraft(defaults: BreastDefaults | number | null = null): Draft {
  const breastDefault = typeof defaults === 'number' ? { left: defaults, right: defaults } : defaults;
  return { mood: null, breastDefault, estimateMode: 'auto', estimate: '', kind: 'breast', bottleDuration: '15', breastDuration: '30', bottleUnknown: false,
    breastUnknown: false, milkType: 'pre', urine: false, stool: false, heldSuccess: false, weight: '', amount: '', side: '', timeMode: 'now', localTime: '', exactTime: null, breastStart: null, breastEnd: null };
}
export function localDateTime(value: string | Date): string {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function draftFromFeeding(entry: Feeding): Draft {
  const draft = newDraft();
  draft.estimateMode = 'manual';
  draft.estimate = entry.estimated_ml == null ? '' : String(entry.estimated_ml);
  draft.kind = entry.kind;
  draft.mood = entry.mood_after ?? null;
  draft.performedBy = entry.performed_by;
  draft.weight = entry.weight_g == null ? '' : String(entry.weight_g);
  draft.urine = entry.urine ?? false;
  draft.stool = entry.stool ?? false;
  draft.heldSuccess = entry.held_success ?? false;
  draft.timeMode = 'custom';
  draft.localTime = localDateTime(entry.occurred_at);
  draft.exactTime = entry.occurred_at;
  if (entry.kind === 'bottle') {
    draft.bottleUnknown = entry.duration_minutes === null;
    draft.bottleDuration = String(entry.duration_minutes ?? 0);
    draft.amount = String(entry.amount_ml ?? '');
    draft.milkType = entry.milk_type ?? '';
  } else {
    draft.breastUnknown = entry.duration_minutes === null;
    draft.breastDuration = String(entry.duration_minutes ?? 0);
    draft.side = entry.side ?? '';
  }
  if (entry.kind === 'breast' && entry.started_at) {
    draft.breastStart = entry.started_at;
    draft.breastEnd = entry.occurred_at;
  }
  return draft;
}
function positiveInteger(value: string, label: string): number {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 2147483647) {
    throw new Error(`${label}: Bitte eine positive ganze Zahl eingeben.`);
  }
  return Number(value);
}
export function feedingInput(draft: Draft, now = new Date()): FeedingInput {
  const bottle = draft.kind === 'bottle';
  const diaper = draft.kind === 'diaper';
  const unknown = (bottle ? draft.bottleUnknown : draft.breastUnknown) || (bottle ? draft.bottleDuration : draft.breastDuration) === '0';
  const timed = draft.kind === 'breast' && draft.breastStart !== null;
  if (timed && !draft.breastEnd) throw new Error('Bitte zuerst das Stillen beenden.');
  const duration = diaper || draft.kind === 'weight' ? null : timed ? Math.max(1, Math.round((new Date(draft.breastEnd!).getTime() - new Date(draft.breastStart!).getTime()) / 60000)) : unknown ? null : positiveInteger(bottle ? draft.bottleDuration : draft.breastDuration, 'Dauer');
  const amount = bottle ? positiveInteger(draft.amount, 'Menge') : null;
  if (amount !== null && amount % 5 !== 0) throw new Error('Bitte die Menge in 5-ml-Schritten angeben.');
  const time = timed ? new Date(draft.breastEnd!) : draft.timeMode === 'now' ? now : draft.exactTime && localDateTime(draft.exactTime) === draft.localTime ? new Date(draft.exactTime) : new Date(draft.localTime);
  if (!Number.isFinite(time.getTime())) throw new Error('Bitte Datum und Uhrzeit angeben.');
  // Reject normalized invalid local dates (e.g. a missing hour during daylight-saving changes).
  if (!timed && draft.timeMode === 'custom' && localDateTime(time) !== draft.localTime) {
    throw new Error('Diese lokale Uhrzeit existiert nicht. Bitte den Zeitpunkt prüfen.');
  }
  const start = timed ? new Date(draft.breastStart!) : draft.kind === 'breast' && duration !== null ? new Date(time.getTime() - duration * 60000) : null;
  if (start && (!Number.isFinite(start.getTime()) || start > time)) throw new Error('Der Beginn muss vor dem Ende liegen.');
  return { mood_after: draft.kind === 'weight' ? null : draft.mood, estimated_ml: estimatedMilk(draft), ...(draft.performedBy !== undefined ? { performed_by: draft.performedBy } : {}), kind: draft.kind, occurred_at: time.toISOString(), started_at: start?.toISOString() ?? null, duration_minutes: duration,
    amount_ml: amount, side: draft.kind === 'breast' ? draft.side || null : null, milk_type: bottle ? draft.milkType || null : null,
    urine: diaper ? draft.urine : null, stool: diaper ? draft.stool : null, held_success: diaper ? draft.heldSuccess : null, weight_g: draft.kind === 'weight' ? positiveInteger(draft.weight, 'Gewicht') : null };
}
export function dayKey(iso: string): string { return localDateTime(iso).slice(0, 10); }
export const sideLabel = (side: Side | null): string => side ? { left: 'Links', right: 'Rechts', both: 'Beide' }[side] : '';
export const kindLabel = (kind: FeedingKind): string => ({ bottle: 'Flasche', breast: 'Stillen', diaper: 'Wickeln', weight: 'Wiegen' })[kind];
export const milkLabel = (milk: MilkType | null | undefined): string => milk === 'pre' ? 'Pre-Nahrung' : milk === 'breast_milk' ? 'Muttermilch' : '';
export function toCsv(entries: Feeding[]): string {
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows: unknown[][] = [['Ende (UTC)', 'Beginn (UTC)', 'Art', 'Dauer (Minuten)', 'Menge (ml)', 'Stillseite', 'Milchart', 'Urin', 'Stuhl', 'Abhalten erfolgreich', 'Gewicht (g)', 'Erledigt von', 'Stillmenge geschätzt (ml)', 'Befinden danach']];
  for (const entry of entries) rows.push([entry.occurred_at, entry.started_at, kindLabel(entry.kind), entry.duration_minutes, entry.amount_ml, sideLabel(entry.side), milkLabel(entry.milk_type), entry.urine == null ? '' : entry.urine ? 'Ja' : 'Nein', entry.stool == null ? '' : entry.stool ? 'Ja' : 'Nein', entry.held_success == null ? '' : entry.held_success ? 'Ja' : 'Nein', entry.weight_g, entry.performed_by, entry.estimated_ml, entry.mood_after ? moods[entry.mood_after].label : '']);
  return '\uFEFF' + rows.map(row => row.map(escape).join(';')).join('\r\n') + '\r\n';
}
export interface PendingCreate { id: string; input: FeedingInput }
export function sameInput(a: FeedingInput, b: FeedingInput): boolean {
  return (a.mood_after ?? null) === (b.mood_after ?? null) && (a.estimated_ml ?? null) === (b.estimated_ml ?? null) && (b.performed_by === undefined || (a.performed_by ?? null) === b.performed_by) && (a.started_at === b.started_at || (a.started_at !== null && b.started_at !== null && new Date(a.started_at).getTime() === new Date(b.started_at).getTime())) && a.kind === b.kind && new Date(a.occurred_at).getTime() === new Date(b.occurred_at).getTime()
    && a.duration_minutes === b.duration_minutes && a.amount_ml === b.amount_ml && a.side === b.side && (a.milk_type ?? null) === (b.milk_type ?? null) && (a.urine ?? null) === (b.urine ?? null) && (a.stool ?? null) === (b.stool ?? null) && (a.held_success ?? null) === (b.held_success ?? null) && (a.weight_g ?? null) === (b.weight_g ?? null);
}

export function elapsedLabel(since: string, now = Date.now(), seconds = false): string {
  const elapsed = now - new Date(since).getTime();
  if (!Number.isFinite(elapsed)) return 'Zeitpunkt unbekannt';
  if (elapsed < 0) return 'Zeitpunkt liegt in der Zukunft';
  const total = Math.floor(elapsed / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  if (seconds) return `${hours ? `${hours} Std. ` : ''}${minutes} Min. ${String(total % 60).padStart(2, '0')} Sek.`;
  if (total < 60) return 'gerade eben';
  return `vor ${hours ? `${hours} Std. ` : ''}${minutes} Min.`;
}

export function estimatedMilk(draft: Draft): number | null {
  if (draft.kind !== 'breast') return null;
  if (draft.estimateMode === 'manual') return draft.estimate === '' ? null : milliliters(draft.estimate);
  if (!draft.side) return null;
  if (draft.breastDefault === null) throw new Error('Bitte warten, bis der Still-Standard geladen ist, oder eine eigene Schätzung angeben.');
  return milliliters(String(draft.side === 'both' ? draft.breastDefault.left + draft.breastDefault.right : draft.breastDefault[draft.side]));
}
