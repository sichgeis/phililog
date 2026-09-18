// Invoked by test-local-supabase against the guarded local API. Preserve existing synthetic game data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const tables = ['game_state', 'game_unlocks', 'game_stats', 'game_operations'];
const snapshot = () => tables.map(t => sql(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from public.${t} t;`));
const quote = s => "'" + s.replaceAll("'", "''") + "'";
export async function testGame({ julia, christian, outsider, anonymous }) {
  const original = snapshot();
  const op = (kind, payload, actor = julia, id = randomUUID(), extra = {}) => ({ client: actor.client, args: { operation_id: id, actor_id: actor.user.id, operation_kind: kind, operation_payload: payload, rules: 1, client_schema: 1, ...extra } });
  const round = (bonus = 5, actor = julia) => op('round', { game: 'pacifier', completed: 5, bonus }, actor);
  const buy = (skill, actor = julia) => op('buy', { skill }, actor);
  const apply = async o => { const result = await o.client.rpc('game_apply', o.args); assert.ifError(result.error); return result.data; };
  const load = async (actor = julia) => { const result = await actor.client.rpc('game_snapshot'); assert.ifError(result.error); return result.data; };
  try {
    sql('begin; delete from public.game_operations; delete from public.game_stats; delete from public.game_unlocks; update public.game_state set xp_total=0,xp_balance=0,revision=0,schema_version=1; commit;');
    assert.equal((await load()).xp_total, 0);
    assert.deepEqual(await load(), await load(christian));
    for (const denied of [outsider.client, anonymous]) {
      assert.ok((await denied.rpc('game_snapshot')).error);
      assert.ok((await denied.rpc('game_apply', round().args)).error);
    }
    for (const table of tables) {
      assert.equal((await julia.client.from(table).insert({})).error?.code, '42501', `Direct insert denied by privilege: ${table}`);
      assert.equal((await julia.client.from(table).delete().eq(table === 'game_state' ? 'id' : 'state_id', true)).error?.code, '42501', `Direct delete denied by privilege: ${table}`);
    }
    assert.deepEqual((await outsider.client.from('game_state').select()).data, []);
    assert.ok((await julia.client.from('game_operations').select()).error);
    assert.ok((await julia.client.from('game_state').update({ xp_balance: 999 }).eq('id', true)).error);
    const repeated = round();
    const results = await Promise.all([apply(repeated), apply(repeated)]);
    assert.deepEqual(results, [{ status: 'saved', xp: 15 }, { status: 'saved', xp: 15 }]);
    assert.equal((await load()).xp_total, 15);
    assert.ok((await repeated.client.rpc('game_apply', { ...repeated.args, operation_payload: { game: 'pacifier', completed: 5, bonus: 4 } })).error);
    assert.ok((await christian.client.rpc('game_apply', repeated.args)).error, 'Actor cannot be spoofed');
    for (const payload of [{ game: 'pacifier', completed: 4, bonus: 5 }, { game: 'pacifier', completed: null, bonus: 5 }, { game: 'pacifier', completed: 5, bonus: 6 }, { game: 'pacifier', completed: 5, bonus: -1 }, { game: 'pacifier', completed: 5, bonus: 2.5 }, { game: 'grasp', completed: 5, bonus: 5 }, { game: 'unknown', completed: 5, bonus: 5 }]) {
      const invalid = op('round', payload); assert.ok((await invalid.client.rpc('game_apply', invalid.args)).error);
    }
    assert.equal((await apply(buy('targeted_grasp'))).status, 'missing_prerequisite');
    assert.equal((await apply(buy('hands_discovered'))).status, 'insufficient_xp');
    await apply(round(0)); // balance 25
    const racing = await Promise.all([apply(buy('hands_discovered')), apply(buy('eye_contact', christian))]);
    assert.equal(racing.filter(r => r.status === 'purchased').length, 1);
    assert.equal(racing.filter(r => r.status === 'insufficient_xp').length, 1);
    assert.equal((await load()).xp_balance, 5);
    await Promise.all([apply(round()), apply(round(5, christian))]);
    assert.equal((await load()).xp_total, 55);
    const missing = (await load()).unlocks.includes('hands_discovered') ? 'eye_contact' : 'hands_discovered';
    const sameBuy = await Promise.all([apply(buy(missing)), apply(buy(missing, christian))]);
    assert.equal(sameBuy.filter(r => r.status === 'purchased').length, 1);
    assert.equal(sameBuy.filter(r => r.status === 'already_owned').length, 1);
    assert.equal((await load()).xp_balance, 15);
    for (let i = 0; i < 9; i++) await apply(round()); // 150 balance; 190 total
    for (const skill of ['targeted_grasp', 'self_pacifier', 'social_smile']) assert.equal((await apply(buy(skill))).status, 'purchased');
    const grasp = op('round', { game: 'grasp', completed: 5, bonus: 3 }); await apply(grasp);
    assert.equal((await load()).xp_total, 203); assert.equal((await load()).xp_balance, 23);
    assert.equal((await load()).unlocks.length, 5);
    const before = snapshot();
    const migration = readFileSync('supabase/migrations/202609180017_baby_game.sql', 'utf8');
    sql(`begin; ${migration} commit;`);
    assert.deepEqual(snapshot(), before, 'Repeatable installation preserves every game row and timestamp');
    assert.deepEqual(await apply(grasp), { status: 'saved', xp: 13 });
    const oldPending = round(2); await apply(oldPending); assert.equal((await load()).xp_total, 215);
    sql("update public.game_state set schema_version=2; insert into public.game_unlocks(skill_id,price) values('future_skill',0);");
    assert.equal((await load()).schema_version, 2);
    assert.deepEqual(await apply(repeated), results[0], 'Known receipt is retrievable even after schema change');
    assert.ok((await julia.client.rpc('game_apply', round().args)).error, 'Unknown schema rejects new writes');
    assert.ok((await julia.client.rpc('game_apply', { ...round().args, client_schema: 2 })).error);
    assert.ok((await load()).unlocks.includes('future_skill'));
    sql('update public.game_state set schema_version=1;');
    await apply(round()); assert.ok((await load()).unlocks.includes('future_skill'), 'No snapshot overwrite');
    sql(`delete from private.members where user_id='${outsider.user.id}';`);
    // Revocation checked within every RPC, even for a formerly successful UUID.
    sql(`delete from private.members where user_id='${christian.user.id}';`);
    try { assert.ok((await christian.client.rpc('game_snapshot')).error); assert.ok((await christian.client.rpc('game_apply', round(5, christian).args)).error); }
    finally { sql(`insert into private.members(user_id,person) values('${christian.user.id}','Christian');`); }
    console.log('Spiel-Supabase bestanden: RLS, Validierung, gemeinsame XP, Parallelität, Idempotenz, alle Käufe, Wiederholbarkeit und versionierter Bestand.');
  } finally {
    sql(`begin; delete from public.game_operations; delete from public.game_stats; delete from public.game_unlocks; delete from public.game_state; ${tables.map((table, i) => `insert into public.${table} select * from jsonb_populate_recordset(null::public.${table},${quote(original[i])}::jsonb);`).join('\n')} commit;`);
  }
}
