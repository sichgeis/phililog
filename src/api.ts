import { createClient } from '@supabase/supabase-js';
import { PAGE_SIZE, sameInput, type Feeding, type FeedingInput, type PendingCreate } from './domain.ts';

const url = import.meta.env?.VITE_SUPABASE_URL;
const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_PUBLIC'));
export const supabase = configured ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;
export async function listFeedings(limit = PAGE_SIZE, before?: { time: string; id: string }): Promise<Feeding[]> {
  let query = supabase!.from('feedings').select('*').order('occurred_at', { ascending: false }).order('id', { ascending: false }).limit(limit);
  if (before) query = query.or(`occurred_at.lt.${before.time},and(occurred_at.eq.${before.time},id.lt.${before.id})`);
  const { data, error } = await query;
  if (error) throw error;
  return data as Feeding[];
}
export async function latestMeal(): Promise<Feeding | null> {
  const { data, error } = await supabase!.from('feedings').select('*').in('kind', ['bottle', 'breast'])
    .order('occurred_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as Feeding | null;
}
export async function allFeedings(): Promise<Feeding[]> {
  const entries: Feeding[] = [];
  let cursor: { time: string; id: string } | undefined;
  for (;;) {
    const batch = await listFeedings(500, cursor);
    entries.push(...batch);
    if (batch.length < 500) return entries;
    const last = batch.at(-1)!;
    cursor = { time: last.occurred_at, id: last.id };
  }
}
export async function createFeeding(pending: PendingCreate, userId: string): Promise<Feeding> {
  const { data, error } = await supabase!.from('feedings').insert({ id: pending.id, ...pending.input, created_by: userId }).select().single();
  if (!error) return data as Feeding;
  // A response can be lost after commit. Read the same UUID before deciding whether retry failed.
  if (error.code === '23505') {
    const { data: existing, error: readError } = await supabase!.from('feedings').select('*').eq('id', pending.id).single();
    if (!readError && existing.created_by === userId && sameInput(existing as Feeding, pending.input)) return existing as Feeding;
  }
  throw error;
}
export async function updateFeeding(entry: Feeding, input: FeedingInput): Promise<Feeding> {
  const { data, error } = await supabase!.from('feedings').update(input).eq('id', entry.id).eq('version', entry.version).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Dieser Eintrag wurde inzwischen geändert oder gelöscht. Bitte die Historie aktualisieren und erneut öffnen.');
  return data as Feeding;
}
export async function deleteFeeding(entry: Feeding): Promise<void> {
  const { data, error } = await supabase!.from('feedings').delete().eq('id', entry.id).eq('version', entry.version).select('id');
  if (error) throw error;
  if (!data.length) throw new Error('Dieser Eintrag wurde inzwischen geändert oder gelöscht. Bitte die Historie aktualisieren.');
}
export function friendlyError(error: unknown): string {
  if (error instanceof Error && !/fetch|network|load failed/i.test(error.message)) return error.message;
  const code = (error as { code?: string })?.code;
  if (code === '42501') return 'Kein Zugriff. Bitte eure Freischaltung prüfen.';
  if (code === '23514') return 'Bitte Menge, Dauer und Zeitpunkt prüfen.';
  if (code === 'PGRST205') return 'Die Datenbank ist noch nicht eingerichtet.';
  return 'Das hat gerade nicht geklappt. Bitte die Verbindung prüfen und erneut versuchen.';
}

export async function getSettings(): Promise<import('./report.ts').Settings> {
  const { data, error } = await supabase!.from('family_settings').select('breast_left_ml,breast_right_ml,version').eq('id', true).single();
  if (error) throw error;
  return data;
}
export async function saveSettings(defaults: import('./report.ts').BreastDefaults, version: number): Promise<import('./report.ts').Settings> {
  const { data, error } = await supabase!.from('family_settings').update({ breast_left_ml: defaults.left, breast_right_ml: defaults.right }).eq('id', true).eq('version', version).select('breast_left_ml,breast_right_ml,version').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Die Einstellungen wurden inzwischen geändert. Bitte aktualisieren und erneut speichern.');
  return data;
}
export async function getDailyReport(first: string, last: string): Promise<import('./report.ts').DailyReport[]> {
  const { data, error } = await supabase!.rpc('daily_report', { first_day: first, last_day: last });
  if (error) throw error;
  return data;
}

export async function currentFamilyPerson(): Promise<import('./domain.ts').Person | null> {
  const { data, error } = await supabase!.rpc('current_family_person');
  if (error) throw error;
  return data === 'Julia' || data === 'Christian' ? data : null;
}
