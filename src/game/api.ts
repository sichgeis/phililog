import type { SupabaseClient } from '@supabase/supabase-js';
import { RULES_VERSION, SCHEMA_VERSION, type GameId, type SkillId, type Snapshot } from './rules.ts';
export interface Operation {
  id: string; account: string; rules_version: number; schema_version: number;
  kind: 'round' | 'buy'; payload: { game?: GameId; completed?: number; bonus?: number; skill?: SkillId };
}
export interface GameApi { load(): Promise<Snapshot>; submit(op: Operation): Promise<{ status: string; xp?: number }> }
export function createApi(client: SupabaseClient): GameApi {
  return {
    async load() { const { data, error } = await client.rpc('game_snapshot'); if (error) throw error; return data; },
    async submit(op) {
      // An auth change must not send a former user's local operation with a new token.
      const { data: { session } } = await client.auth.getSession();
      if (session?.user.id !== op.account) throw new Error('Bitte mit dem ursprünglichen Konto anmelden, um diese Runde zu speichern.');
      const { data, error } = await client.rpc('game_apply', { operation_id: op.id, actor_id: op.account, operation_kind: op.kind, operation_payload: op.payload, rules: op.rules_version, client_schema: op.schema_version });
      if (error) throw error; return data;
    },
  };
}
export const pendingKey = (account: string) => `phililog-game:1:pending:${account}`;
export function operation(account: string, kind: Operation['kind'], payload: Operation['payload']): Operation {
  return { id: crypto.randomUUID(), account, kind, payload, rules_version: RULES_VERSION, schema_version: SCHEMA_VERSION };
}
export function readPending(storage: Pick<Storage, 'getItem'>, account: string): Operation | null {
  const raw = storage.getItem(pendingKey(account));
  if (!raw) return null;
  const value = JSON.parse(raw) as Operation;
  if (!value || value.account !== account || !/^[\da-f-]{36}$/i.test(value.id) || !['round', 'buy'].includes(value.kind) || !Number.isInteger(value.rules_version) || !Number.isInteger(value.schema_version) || !value.payload) throw new Error('Der vorgemerkte Spielvorgang konnte nicht gelesen werden. Bitte nicht löschen; zunächst erneut laden.');
  return value;
}
export function gameError(e: unknown) {
  const code = (e as { code?: string })?.code;
  if (code === '42501') return 'Kein Spielzugriff. Bitte Anmeldung und Freischaltung prüfen.';
  if (code === 'PGRST202' || code === 'PGRST205') return 'Das Spiel ist in der Datenbank noch nicht eingerichtet. Migration 017 fehlt.';
  if (e instanceof Error && !/fetch|network|load failed/i.test(e.message)) return e.message;
  return 'Noch nicht gespeichert oder geladen. Bitte Verbindung prüfen und erneut versuchen.';
}
export function compatible(s: Snapshot) { return s.schema_version === SCHEMA_VERSION && s.rules_version === RULES_VERSION; }
