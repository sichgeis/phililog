// Only against this project's local Supabase, with invented disposable users and entries.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const status = JSON.parse(execFileSync('npx', ['--yes', 'supabase@2.117.0', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.equal(status.API_URL, 'http://127.0.0.1:54321', 'Local API only');
const key = status.ANON_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, options);
const password = 'Local-test-only-Phililog-2026!';
const accounts = [];
for (const name of ['julia', 'christian', 'outsider']) {
  const email = `${name}@phililog.test`;
  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  assert.ifError(listError);
  let user = list.users.find(u => u.email === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error); user = data.user;
  }
  const client = createClient(status.API_URL, key, options);
  const { error } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  accounts.push({ user, client });
}
const [julia, christian, outsider] = accounts;
for (const [person, account] of [['Julia', julia], ['Christian', christian]]) {
  assert.match(account.user.id, /^[0-9a-f-]{36}$/);
  execFileSync('docker', ['exec', 'supabase_db_phililog', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', `insert into private.members (user_id, person) values ('${account.user.id}', '${person}') on conflict (person) do update set user_id=excluded.user_id;`], { stdio: 'pipe' });
}
const anonymous = createClient(status.API_URL, key, options);
const ids = [];
const input = { id: randomUUID(), kind: 'bottle', occurred_at: '2026-09-12T08:45:00Z', started_at: null, duration_minutes: 15, amount_ml: 65, side: null, created_by: julia.user.id };
ids.push(input.id);
try {
  assert.ok((await anonymous.auth.signUp({ email: `blocked-${randomUUID()}@phililog.test`, password })).error, 'Public registration disabled');
  assert.equal((await julia.client.rpc('is_family_member')).data, true);
  assert.equal((await christian.client.rpc('is_family_member')).data, true);
  assert.equal((await outsider.client.rpc('is_family_member')).data, false);
  assert.ok((await anonymous.from('feedings').select()).error, 'Anonymous read denied');
  assert.ok((await anonymous.from('feedings').insert(input)).error, 'Anonymous write denied');
  assert.deepEqual((await outsider.client.from('feedings').select()).data, [], 'Outsider sees no data');
  assert.ok((await outsider.client.from('feedings').insert({ ...input, created_by: outsider.user.id })).error, 'Outsider insert denied');
  assert.ok((await outsider.client.schema('private').from('members').insert({ user_id: outsider.user.id, person: 'Julia' })).error, 'Self-enrolment denied');
  assert.ok((await julia.client.from('feedings').insert({ ...input, created_by: christian.user.id })).error, 'Creator spoof denied');
  assert.ok((await julia.client.from('feedings').insert({ ...input, amount_ml: 63 })).error, 'SQL validates 5 ml steps');
  const created = await julia.client.from('feedings').insert(input).select().single();
  assert.ifError(created.error);
  assert.equal(created.data.version, 1);
  assert.equal(created.data.performed_by, 'Julia');
  const personId = randomUUID(); ids.push(personId);
  const own = await christian.client.from('feedings').insert({ ...input, id: personId, created_by: christian.user.id }).select().single();
  assert.ifError(own.error); assert.equal(own.data.performed_by, 'Christian');
  const reassigned = await julia.client.from('feedings').update({ performed_by: 'Julia' }).eq('id', personId).eq('version', 1).select().single();
  assert.ifError(reassigned.error); assert.equal(reassigned.data.performed_by, 'Julia'); assert.equal(reassigned.data.created_by, christian.user.id); assert.equal(reassigned.data.version, 2);
  assert.deepEqual((await christian.client.from('feedings').update({ performed_by: 'Christian' }).eq('id', personId).eq('version', 1).select()).data, []);
  assert.ok((await julia.client.from('feedings').update({ performed_by: 'Other' }).eq('id', personId)).error);
  assert.deepEqual((await outsider.client.from('feedings').update({ performed_by: 'Christian' }).eq('id', personId).select()).data, []);
  assert.ok((await christian.client.from('feedings').insert({ ...input, id: randomUUID(), created_by: christian.user.id, performed_by: 'Julia' })).error, 'Cannot override automatic assignment on insert');
  assert.equal((await julia.client.from('feedings').insert(input)).error?.code, '23505', 'Same ID cannot duplicate');
  assert.equal((await christian.client.from('feedings').select().eq('id', input.id)).data.length, 1, 'Shared logbook');
  assert.deepEqual((await outsider.client.from('feedings').update({ amount_ml: 70 }).eq('id', input.id).select()).data, [], 'Outsider update denied');
  assert.deepEqual((await outsider.client.from('feedings').delete().eq('id', input.id).select()).data, [], 'Outsider delete denied');
  const edited = await christian.client.from('feedings').update({ amount_ml: 70 }).eq('id', input.id).eq('version', 1).select().single();
  assert.ifError(edited.error); assert.equal(edited.data.version, 2);
  assert.equal(edited.data.created_by, julia.user.id);
  const stale = await julia.client.from('feedings').update({ amount_ml: 75 }).eq('id', input.id).eq('version', 1).select();
  assert.deepEqual(stale.data, [], 'Stale updates rejected');
  assert.deepEqual((await julia.client.from('feedings').delete().eq('id', input.id).eq('version', 1).select()).data, [], 'Stale delete rejected');
  assert.ok((await julia.client.from('feedings').update({ created_by: christian.user.id }).eq('id', input.id)).error, 'Creator immutable');
  const breast = { ...input, id: randomUUID(), kind: 'breast', started_at: '2026-09-12T08:15:00Z', amount_ml: null, side: 'left', duration_minutes: 30 };
  ids.push(breast.id);
  assert.ifError((await julia.client.from('feedings').insert(breast)).error);
  assert.ok((await julia.client.from('feedings').insert({ ...breast, id: randomUUID(), started_at: '2026-09-12T09:00:00Z' })).error, 'End before start denied');
  assert.ifError((await christian.client.from('feedings').update({ milk_type: 'breast_milk' }).eq('id', input.id)).error);
  assert.equal((await julia.client.from('feedings').select('milk_type').eq('id', input.id).single()).data.milk_type, 'breast_milk');
  assert.ok((await julia.client.from('feedings').update({ milk_type: 'invalid' }).eq('id', input.id)).error, 'Invalid milk denied');
  assert.ok((await julia.client.from('feedings').update({ milk_type: 'pre' }).eq('id', breast.id)).error, 'Milk type only for bottle');
  const removed = await christian.client.from('feedings').delete().eq('id', input.id).eq('version', 3).select();
  assert.ifError(removed.error); assert.equal(removed.data.length, 1);
  const diaper = { id: randomUUID(), kind: 'diaper', occurred_at: '2026-09-12T09:00:00Z', urine: true, stool: true, held_success: true };
  ids.push(diaper.id);
  const diaperCreated = await julia.client.from('feedings').insert(diaper).select().single();
  assert.ifError(diaperCreated.error);
  assert.equal((await christian.client.from('feedings').select().eq('id', diaper.id).single()).data.held_success, true);
  assert.ok((await outsider.client.from('feedings').insert({ ...diaper, id: randomUUID() })).error);
  assert.ok((await julia.client.from('feedings').insert({ ...diaper, id: randomUUID(), amount_ml: 5 })).error);
  assert.ok((await julia.client.from('feedings').insert({ ...diaper, id: randomUUID(), stool: null })).error);
  assert.ok((await julia.client.from('feedings').update({ urine: true }).eq('id', breast.id)).error);
  assert.ifError((await christian.client.from('feedings').update({ urine: false, stool: false, held_success: false }).eq('id', diaper.id)).error);
  assert.deepEqual((await outsider.client.from('feedings').delete().eq('id', diaper.id).select()).data, []);
  assert.ifError((await christian.client.from('feedings').delete().eq('id', diaper.id)).error);
  const weight = { id: randomUUID(), kind: 'weight', occurred_at: '2026-09-12T09:00:00Z', weight_g: 3500 };
  ids.push(weight.id);
  assert.ifError((await julia.client.from('feedings').insert(weight)).error);
  assert.equal((await christian.client.from('feedings').select().eq('id', weight.id).single()).data.weight_g, 3500);
  assert.ok((await outsider.client.from('feedings').insert({ ...weight, id: randomUUID() })).error);
  for (const invalid of [{ weight_g: 0 }, { amount_ml: 5 }, { urine: true }]) assert.ok((await julia.client.from('feedings').insert({ ...weight, ...invalid, id: randomUUID() })).error);
  assert.ok((await julia.client.from('feedings').update({ weight_g: 3500 }).eq('id', breast.id)).error);
  assert.ifError((await christian.client.from('feedings').update({ weight_g: 3550 }).eq('id', weight.id)).error);
  assert.deepEqual((await outsider.client.from('feedings').delete().eq('id', weight.id).select()).data, []);
  assert.ifError((await christian.client.from('feedings').delete().eq('id', weight.id)).error);
  // Exercise the application's actual repository functions, including pagination and retry.
  process.env.VITE_SUPABASE_URL = status.API_URL;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = key;
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const api = await vite.ssrLoadModule('/src/api.ts');
    assert.ifError((await api.supabase.auth.signInWithPassword({ email: 'julia@phililog.test', password })).error);
    const payload = { kind: 'bottle', occurred_at: '2026-09-10T08:45:00.000Z', started_at: null, duration_minutes: 15, amount_ml: 65, side: null };
    const pending = { id: randomUUID(), input: payload };
    ids.push(pending.id);
    const first = await api.createFeeding(pending, julia.user.id);
    const repeated = await api.createFeeding(pending, julia.user.id);
    assert.equal(first.id, repeated.id, 'Real retry returns existing entry');
    const corrected = await api.updateFeeding(first, { ...payload, amount_ml: 70 });
    await assert.rejects(api.updateFeeding(first, { ...payload, amount_ml: 75 }), /inzwischen/);
    await assert.rejects(api.deleteFeeding(first), /inzwischen/);
    await api.deleteFeeding(corrected);
    const mealId = randomUUID();
    const newerDiapers = Array.from({ length: 35 }, (_, i) => ({ id: randomUUID(), kind: 'diaper', occurred_at: new Date(Date.UTC(2091, 0, 1, 0, i)).toISOString(), urine: true, stool: false, held_success: false, created_by: julia.user.id }));
    ids.push(mealId, ...newerDiapers.map(row => row.id));
    assert.ifError((await admin.from('feedings').insert({ ...payload, id: mealId, occurred_at: '2090-01-01T00:00:00Z', created_by: julia.user.id })).error);
    assert.ifError((await admin.from('feedings').insert(newerDiapers)).error);
    assert.equal((await api.listFeedings()).every(row => row.kind === 'diaper'), true);
    assert.equal((await api.latestMeal()).id, mealId, 'Last meal ignores diapers beyond first history page');
    assert.ifError((await admin.from('feedings').delete().in('id', [mealId, ...newerDiapers.map(row => row.id)])).error);
    const bulk = Array.from({ length: 505 }, (_, i) => ({ ...payload, id: randomUUID(), created_by: julia.user.id, occurred_at: new Date(Date.UTC(2025, 0, 1, 0, i)).toISOString() }));
    ids.push(...bulk.map(row => row.id));
    assert.ifError((await admin.from('feedings').insert(bulk)).error);
    const bulkReport = await julia.client.rpc('daily_report',{ first_day:'2025-01-01',last_day:'2025-01-01' }); assert.ifError(bulkReport.error); assert.ok(bulkReport.data[0].events >= 505);
    const page = await api.listFeedings();
    assert.equal(page.length, 30);
    const last = page.at(-1);
    const next = await api.listFeedings(30, { time: last.occurred_at, id: last.id });
    assert.equal(next.some(row => page.some(previous => previous.id === row.id)), false, 'Pagination has no overlap');
    const exported = await api.allFeedings();
    assert.equal(bulk.every(row => exported.some(value => value.id === row.id)), true, 'Export includes every entry beyond API page 500');
    const { toCsv } = await vite.ssrLoadModule('/src/domain.ts');
    assert.equal(toCsv(exported).split('\r\n').length, exported.length + 2);
    await api.supabase.auth.signOut();
  } finally { await vite.close(); }
  const originalSettings = await julia.client.from('family_settings').select().single(); assert.ifError(originalSettings.error);
  try {
    assert.deepEqual((await outsider.client.from('family_settings').select()).data, []);
    assert.ok((await anonymous.from('family_settings').select()).error);
    assert.deepEqual((await outsider.client.from('family_settings').update({ breast_ml: 99 }).eq('id',true).select()).data, []);
    assert.ok((await julia.client.from('family_settings').update({ breast_ml: 0 }).eq('id',true)).error);
    const changed = await julia.client.from('family_settings').update({ breast_left_ml: 20, breast_right_ml: 35 }).eq('id',true).eq('version',originalSettings.data.version).select().single(); assert.ifError(changed.error);
    assert.equal((await christian.client.from('family_settings').select().single()).data.breast_left_ml,20);
    assert.equal((await christian.client.from('family_settings').select().single()).data.breast_right_ml,35);
    assert.ok((await julia.client.from('family_settings').update({ breast_left_ml: -1, breast_right_ml: 40 }).eq('id',true)).error);
    assert.equal((await christian.client.from('family_settings').select().single()).data.breast_right_ml,35);
    assert.deepEqual((await outsider.client.from('family_settings').update({ breast_left_ml: 90, breast_right_ml: 90 }).eq('id',true).select()).data,[]);
    assert.deepEqual((await christian.client.from('family_settings').update({ breast_ml: 40 }).eq('version',originalSettings.data.version).select()).data,[]);
    assert.ok((await outsider.client.rpc('daily_report',{ first_day:'2088-03-27',last_day:'2088-03-28' })).error);
    assert.ok((await anonymous.rpc('daily_report',{ first_day:'2088-03-27',last_day:'2088-03-28' })).error);
    assert.ok((await julia.client.rpc('daily_report',{ first_day:'2088-01-01',last_day:'2088-12-31' })).error);
    // 2088-03-28 is the 23-hour DST-start day in Europe/Berlin.
    const sample = (kind, time, extra = {}) => ({ id: randomUUID(), kind, occurred_at: time, started_at: null, duration_minutes: null, amount_ml: null, side: null, created_by: julia.user.id, ...extra });
    const samples = [sample('bottle','2088-03-27T23:00:00Z',{ amount_ml:60 }), sample('breast','2088-03-28T12:00:00Z',{ estimated_ml:50 }), sample('breast','2088-03-28T13:00:00Z'), sample('diaper','2088-03-28T14:00:00Z',{ urine:true,stool:true,held_success:false }), sample('diaper','2088-03-28T15:00:00Z',{ urine:false,stool:false,held_success:false }), sample('bottle','2088-03-28T22:00:00Z',{ amount_ml:90 })];
    ids.push(...samples.map(e=>e.id));
    for (const row of samples) assert.ifError((await julia.client.from('feedings').insert(row)).error);
    assert.ok((await julia.client.from('feedings').update({ estimated_ml:25 }).eq('id',samples[0].id)).error);
    assert.ok((await julia.client.from('feedings').update({ estimated_ml:-1 }).eq('id',samples[1].id)).error);
    const result = await christian.client.rpc('daily_report',{ first_day:'2088-03-27',last_day:'2088-03-29' }); assert.ifError(result.error);
    assert.deepEqual(result.data.find(d=>d.day==='2088-03-28'),{day:'2088-03-28',bottle_ml:60,breast_ml:50,missing_estimates:1,diapers:2,wet:1,stool:1,events:5});
    assert.equal(result.data.find(d=>d.day==='2088-03-29').bottle_ml,90);
    assert.equal(result.data.find(d=>d.day==='2088-03-27').events,0);
    assert.ifError((await christian.client.from('feedings').update({ estimated_ml:70 }).eq('id',samples[1].id)).error);
    assert.equal((await julia.client.rpc('daily_report',{first_day:'2088-03-28',last_day:'2088-03-28'})).data[0].breast_ml,70);
    assert.ifError((await christian.client.from('feedings').delete().eq('id',samples[1].id)).error);
    assert.equal((await julia.client.rpc('daily_report',{first_day:'2088-03-28',last_day:'2088-03-28'})).data[0].breast_ml,0);
  } finally { assert.ifError((await admin.from('family_settings').update({ breast_left_ml: originalSettings.data.breast_left_ml, breast_right_ml: originalSettings.data.breast_right_ml }).eq('id',true)).error); }
  const { readFileSync } = await import('node:fs');
  const correction = readFileSync('supabase/migrations/202609130008_backfill_family_events.sql','utf8');
  const seed = `begin;
    alter table if exists private.events_before_20260913_correction rename to events_before_20260913_correction_test_original;
    insert into public.feedings(id,kind,occurred_at,side,amount_ml,urine,stool,held_success,estimated_ml,created_by) values
    ('11111111-1111-4111-8111-111111111111','breast','2089-01-01Z','both',null,null,null,null,99,'${julia.user.id}'),
    ('22222222-2222-4222-8222-222222222222','breast','2089-01-01Z',null,null,null,null,null,99,'${julia.user.id}'),
    ('33333333-3333-4333-8333-333333333333','bottle','2089-01-01Z',null,60,null,null,null,null,'${julia.user.id}'),
    ('44444444-4444-4444-8444-444444444444','diaper','2089-01-01Z',null,null,true,true,false,null,'${julia.user.id}');
    ${correction}
    do $$ begin
      assert (select estimated_ml = 50 and performed_by = 'Julia' and version=2 from public.feedings where id='11111111-1111-4111-8111-111111111111');
      assert (select estimated_ml is null and performed_by = 'Julia' from public.feedings where id='22222222-2222-4222-8222-222222222222');
      assert (select performed_by = 'Christian' and amount_ml=60 from public.feedings where id='33333333-3333-4333-8333-333333333333');
      assert (select performed_by = 'Christian' and urine and stool from public.feedings where id='44444444-4444-4444-8444-444444444444');
      assert (select estimated_ml = 99 from private.events_before_20260913_correction where id='11111111-1111-4111-8111-111111111111');
      assert not has_table_privilege('authenticated','private.events_before_20260913_correction','select');
    end $$;
    rollback;`;
  execFileSync('docker',['exec','-i','supabase_db_phililog','psql','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],{input:seed,stdio:['pipe','pipe','pipe']});
  const moodId = randomUUID(); ids.push(moodId);
  const moodRow = await julia.client.from('feedings').insert({ ...input, id:moodId,mood_after:'fussy' }).select().single();
  assert.ifError(moodRow.error); assert.equal(moodRow.data.mood_after,'fussy');
  for (const mood of ['sleepy','calm','alert',null]) {
    const changed = await christian.client.from('feedings').update({mood_after:mood}).eq('id',moodId).select().single();
    assert.ifError(changed.error);assert.equal(changed.data.mood_after,mood);
  }
  assert.deepEqual((await julia.client.from('feedings').update({mood_after:'fussy'}).eq('id',moodId).eq('version',1).select()).data,[]);
  assert.ok((await julia.client.from('feedings').update({mood_after:'invalid'}).eq('id',moodId)).error);
  assert.ok((await julia.client.from('feedings').update({kind:'weight',amount_ml:null,duration_minutes:null,weight_g:3500,mood_after:'calm'}).eq('id',moodId)).error);
  assert.deepEqual((await outsider.client.from('feedings').update({mood_after:'calm'}).eq('id',moodId).select()).data,[]);
  console.log('Lokale Supabase-Prüfungen bestanden: erlaubte/verbotene CRUD-Zugriffe, Selbstfreischaltung, Validierung, Duplikatschutz, Versionskonflikte, echte Wiederholung und Export über 505 Einträge.');
} finally {
  for (let offset = 0; offset < ids.length; offset += 100) {
    assert.ifError((await admin.from('feedings').delete().in('id', ids.slice(offset, offset + 100))).error);
  }
}
if (process.argv.includes('--configure-preview')) {
  writeFileSync('.env.local', `VITE_SUPABASE_URL=${status.API_URL}\nVITE_SUPABASE_PUBLISHABLE_KEY=${key}\n`);
  console.log('Lokale Vorschau konfiguriert. Synthetischer Zugang: julia@phililog.test / Local-test-only-Phililog-2026!');
}
