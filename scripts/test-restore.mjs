import { legacyPeople, installationPeople } from './legacy-test-people.mjs';
// Full application backup roundtrip in two disposable databases; never dump family data.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
const container = 'supabase_db_phililog';
const suffix = randomUUID().replaceAll('-', '');
const source = `phililog_restore_source_${suffix}`;
const target = `phililog_restore_target_${suffix}`;
const docker = (args, input) => execFileSync('docker', ['exec', '-i', container, ...args], { input, maxBuffer: 32 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
const sql = (db, input) => docker(['psql', '-X', '-U', 'supabase_admin', '-d', db, '-v', 'ON_ERROR_STOP=1', '-At'], input).toString().trim();
const caregiverA = '11111111-1111-4111-8111-111111111111';
const caregiverB = '22222222-2222-4222-8222-222222222222';
const outsider = '33333333-3333-4333-8333-333333333333';
const migrationSource = file => {
  let source = readFileSync(`supabase/migrations/${file}`, 'utf8');
  if (process.argv.includes('--legacy-identities') && !file.startsWith('202610240023')) {
    for (let i = 0; i < installationPeople.length; i++) source = source.replaceAll(`'${installationPeople[i]}'`, `'${legacyPeople[i]}'`);
  }
  return source;
};
const migrations = readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
try {
  sql('postgres', `create database ${source}; create database ${target};`);
  // Reuse the installed Auth schema, never its data. Roles belong to the local cluster.
  const authSchema = docker(['pg_dump', '-U', 'supabase_admin', '-d', 'postgres', '--schema-only', '--schema=auth']);
  sql(source, authSchema);
  // Supabase bootstrap grants on a fresh platform database.
  sql(source, 'grant usage on schema public to anon, authenticated, service_role;');
  sql(source, 'create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key, statements text[], name text);');
  for (const file of migrations.filter(file => !file.startsWith('202609180018') && !file.startsWith('202610240023'))) {
    const version = file.split('_')[0];
    sql(source, `begin; ${migrationSource(file)}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','${file}'); commit;`);
  }
  sql(source, `
    insert into auth.users(id,email,encrypted_password) values
      ('${caregiverA}','caregiverA@restore.test','synthetic-password-hash'),
      ('${caregiverB}','caregiverB@restore.test','synthetic-password-hash'),
      ('${outsider}','outsider@restore.test','synthetic-password-hash');
    insert into auth.identities(provider_id,user_id,identity_data,provider) values ('${caregiverA}','${caregiverA}','{"sub":"${caregiverA}","email":"caregiverA@restore.test"}','email');
    insert into private.members values ('${caregiverA}','${legacyPeople[0]}'),('${caregiverB}','${legacyPeople[1]}');
    insert into public.feedings(id,kind,occurred_at,amount_ml,created_by) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bottle','2088-01-01Z',65,'${caregiverA}');
    update public.feedings set amount_ml=70,performed_by='${legacyPeople[1]}',mood_after='calm';
    insert into public.feedings(id,kind,occurred_at,side,estimated_ml,created_by) values
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','breast','2088-01-01Z','both',55,'${caregiverB}');
    insert into public.feedings(id,kind,occurred_at,urine,stool,held_success,created_by) values
      ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','diaper','2088-01-01Z',true,false,true,'${caregiverA}');
    insert into public.feedings(id,kind,occurred_at,weight_g,length_cm,created_by) values
      ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','weight','2088-01-01Z',3500,52.5,'${caregiverB}');
    insert into public.feedings(id,kind,occurred_at,amount_ml,created_by) values
      ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','bottle','2088-01-01Z',60,'${caregiverA}');
    delete from public.feedings where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    insert into public.feedings(id,kind,occurred_at,temperature_c,created_by) values
      ('ffffffff-ffff-4fff-8fff-ffffffffffff','temperature','2088-01-01Z',37.2,'${caregiverA}');
    insert into public.feedings(id,kind,occurred_at,duration_minutes,created_by) values
      ('99999999-9999-4999-8999-999999999999','sunbath','2088-01-01Z',5,'${caregiverB}'),
      ('88888888-8888-4888-8888-888888888888','massage','2088-01-01Z',7,'${caregiverA}'),
      ('77777777-7777-4777-8777-777777777777','gymnastics','2088-01-01Z',null,'${caregiverB}');
    update public.feedings set mood_after='asleep' where kind in ('breast', 'sunbath', 'massage', 'gymnastics');
    update public.family_settings set breast_left_ml=20,breast_right_ml=35,birth_date='2025-01-01',birth_weight_g=2800,gestational_age_days=275;
    insert into private.events_before_20260913_correction
      select id,kind,occurred_at,started_at,duration_minutes,amount_ml,side,created_by,created_at,updated_at,version,milk_type,urine,stool,held_success,weight_g,performed_by,estimated_ml
      from public.feedings where kind='bottle';
  `);
  sql(source, `
    create table private.events_before_20260913_layout as select * from public.feedings;
    create table private.settings_before_20260913_layout as select * from public.family_settings;
    create table private.members_before_20260913_layout as select * from private.members;
    revoke all on private.events_before_20260913_layout, private.settings_before_20260913_layout, private.members_before_20260913_layout from public, anon, authenticated;
  `);
  const fixture = JSON.parse(readFileSync('tests/fixtures/game-v1.json', 'utf8'));
  const json = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
  sql(source, `update public.game_state set schema_version=${fixture.state.schema_version},revision=${fixture.state.revision},xp_total=${fixture.state.xp_total},xp_balance=${fixture.state.xp_balance};
    insert into public.game_unlocks(skill_id,price) select skill_id,price from jsonb_to_recordset(${json(fixture.unlocks)}) as t(skill_id text,price integer);
    insert into public.game_stats(game_id,rounds,best_bonus) select game_id,rounds,best_bonus from jsonb_to_recordset(${json(fixture.stats)}) as t(game_id text,rounds bigint,best_bonus integer);
    insert into public.game_operations(id,actor_id,kind,rules_version,client_schema,payload,result) values('${fixture.receipt.id}','${caregiverA}','round',1,1,${json(fixture.receipt.payload)},${json(fixture.receipt.result)});`);
  const oldTables = ['game_state','game_unlocks','game_stats','game_operations'];
  const historicalV1 = () => oldTables.map(table => sql(source, `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from public.${table} t;`));
  const beforeUpgrade = historicalV1();
  sql(source, `begin; ${readFileSync('supabase/migrations/202609180018_pacifier_challenge.sql', 'utf8')}
    insert into supabase_migrations.schema_migrations(version,name) values('202609180018','202609180018_pacifier_challenge.sql'); commit;`);
  assert.deepEqual(historicalV1(), beforeUpgrade, 'Actual V1-to-V2 upgrade preserves historical rows and timestamps');
  const adventureFixture=JSON.parse(readFileSync('tests/fixtures/adventure-v1.json','utf8'));
  sql(source, `begin; update public.adventure_state set revision=${adventureFixture.revision-1},payload=${json(adventureFixture.payload)};
    set local role authenticated; select set_config('request.jwt.claim.sub','${caregiverA}',true);
    select public.adventure_save('66666666-6666-4666-8666-666666666666','${caregiverA}',4,${json(adventureFixture.payload)}); commit;`);
  // A populated pre-023 database, including a synthetic active session and refresh token.
  sql(source, `insert into auth.sessions(id,user_id,created_at,updated_at) values
    ('55555555-5555-4555-8555-555555555555','${caregiverA}',now(),now());
    insert into auth.refresh_tokens(token,user_id,session_id,revoked) values
    ('synthetic-refresh-token','${caregiverA}','55555555-5555-4555-8555-555555555555',false);`);
  const legacyTables = ['public.feedings','private.members','public.family_settings','auth.users','auth.identities','auth.sessions','auth.refresh_tokens','private.feeding_create_receipts'];
  const legacySnapshot = () => legacyTables.map(table => sql(source, `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from ${table} t;`));
  const beforePresentation = legacySnapshot();
  sql(source, `begin; ${readFileSync('supabase/migrations/202610240023_caregiver_presentation.sql', 'utf8')}
    insert into supabase_migrations.schema_migrations(version,name) values ('202610240023','202610240023_caregiver_presentation.sql'); commit;`);
  assert.deepEqual(legacySnapshot(), beforePresentation, '023 preserves records, attribution, Auth sessions and refresh tokens exactly');
  const configure = readFileSync('scripts/configure-caregivers.sql', 'utf8')
    .replaceAll(":'caregiver_a_user_id'", `'${caregiverA}'`)
    .replaceAll(":'caregiver_b_user_id'", `'${caregiverB}'`);
  assert.throws(() => sql(source, configure.replaceAll(caregiverB, outsider)), 'Unknown member mapping must abort');
  assert.equal(sql(source, 'select count(*) from private.caregiver_profiles'), '0');
  sql(source, configure);
  assert.deepEqual(legacySnapshot(), beforePresentation, 'Private rollout config preserves all existing data and Auth');
  assert.throws(() => sql(source, configure), 'Repeated configuration must abort without changing the mapping');
  sql(source, "update private.caregiver_profiles set display_name=case id when 'caregiver_a' then 'Ada' else 'Bela' end;");
  const tables = ['private.caregiver_profiles','auth.sessions','auth.refresh_tokens','public.adventure_state','private.adventure_receipts','public.game_scores','public.game_state','public.game_unlocks','public.game_stats','public.game_operations','private.events_before_20260913_layout', 'private.settings_before_20260913_layout', 'private.members_before_20260913_layout', 'public.feedings', 'public.family_settings', 'private.members', 'private.feeding_create_receipts', 'private.events_before_20260913_correction', 'auth.users', 'auth.identities', 'supabase_migrations.schema_migrations'];
  const snapshot = db => tables.map(table => sql(db, `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from ${table} t;`));
  const historical = snapshot(source);
  sql(source, `begin; ${readFileSync('supabase/migrations/202609180018_pacifier_challenge.sql', 'utf8')} commit;`);
  assert.deepEqual(snapshot(source), historical, 'V2 installation preserves the populated V1 fixture');
  sql(source, `insert into public.game_scores(rules_version,tempo,assists,rounds,best_score) values(2,'steady',3,7,2800);`);
  const before = snapshot(source);
  // Consistent custom-format dump includes schema, grants, policies, triggers and all data.
  const dump = docker(['pg_dump', '-U', 'supabase_admin', '-d', source, '-Fc', '--schema=public', '--schema=private', '--schema=auth', '--schema=supabase_migrations']);
  sql(target, 'drop schema public;');
  docker(['pg_restore', '-U', 'supabase_admin', '-d', target, '--exit-on-error', '--single-transaction'], dump);
  assert.deepEqual(snapshot(target), before, 'All application, Auth, private backup and migration rows roundtrip exactly');
  sql(target, `begin; ${readFileSync('supabase/migrations/202609180018_pacifier_challenge.sql', 'utf8')} commit;`);
  assert.deepEqual(snapshot(target), before, 'Game installation repeated after restore preserves historical fixture');
  sql(target, `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub','${caregiverA}',true);
    do $$ begin
      assert public.is_family_member();
      assert (select count(*)=2 from public.family_caregivers());
      assert (select display_name='Ada' from public.family_caregivers() where id='caregiver_a');
      assert (public.game_snapshot()->>'xp_total')::integer = 203;
      assert (public.game_snapshot()->>'xp_balance')::integer = 23;
      assert jsonb_array_length(public.game_snapshot()->'unlocks') = 5;
      assert public.game_apply('${fixture.receipt.id}','${caregiverA}','round',${json(fixture.receipt.payload)},1,1) = ${json(fixture.receipt.result)};
      assert public.game_apply('${fixture.pending.id}','${caregiverA}','round',${json(fixture.pending.payload)},1,1)->>'status' = 'saved';
      assert public.game_apply('${fixture.pending.id}','${caregiverA}','round',${json(fixture.pending.payload)},1,1)->>'status' = 'saved';
      assert (public.game_snapshot()->>'xp_total')::integer = 215;
      assert (public.game_snapshot()->>'xp_balance')::integer = 35;
      assert public.game_snapshot_v2()->>'rules_version' = '2';
      assert public.game_snapshot_v2()->'scores'->0->>'best_score' = '2800';
      assert public.adventure_save('66666666-6666-4666-8666-666666666666','${caregiverA}',4,${json(adventureFixture.payload)})->>'revision' = '5';
      assert public.adventure_load()->'payload' = ${json(adventureFixture.payload)};
      assert public.adventure_save('${adventureFixture.pending.id}','${caregiverA}',5,${json(adventureFixture.pending.payload)})->>'revision' = '6';
      assert public.adventure_save('${adventureFixture.pending.id}','${caregiverA}',5,${json(adventureFixture.pending.payload)})->>'revision' = '6';
      assert public.adventure_load()->>'revision' = '6';
      assert public.adventure_load()->'payload'->>'sparks' = '18';
      assert public.current_family_person() = '${legacyPeople[0]}';
      assert (select count(*)=8 from public.feedings);
      assert public.feeding_create_known('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
      update public.feedings set amount_ml=75 where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and version=1;
      assert not found;
      update public.feedings set amount_ml=75 where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and version=2;
      assert found;
      assert (select version=3 from public.feedings where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
      begin
        insert into public.feedings(id,kind,occurred_at,amount_ml) values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','bottle','2088-01-01Z',60);
        raise exception 'Deleted ID was resurrected';
      exception when unique_violation then null; end;
    end $$;
    select set_config('request.jwt.claim.sub','${caregiverB}',true);
    do $$ begin assert public.is_family_member(); assert (select count(*)=8 from public.feedings); end $$;
    select set_config('request.jwt.claim.sub','${outsider}',true);
    do $$ begin assert not public.is_family_member(); assert (select count(*)=0 from public.feedings); assert (select count(*)=0 from public.family_caregivers()); end $$;
    reset role;
    do $$ begin
      assert not has_table_privilege('authenticated','private.caregiver_profiles','select');
      assert not has_function_privilege('anon','public.family_caregivers()','execute');
      assert not has_table_privilege('authenticated','private.feeding_create_receipts','select');
      assert not has_table_privilege('authenticated','private.events_before_20260913_correction','select');
 assert not has_table_privilege('anon','public.feedings','select'); end $$;
    rollback;`);
  console.log(`Restore bestanden: alle ${migrations.length} Migrationen auf leerer Datenbank, vollständiger synthetischer Dump/Restore einschließlich Temperatur, Sonnenbad, Massage und Babygymnastik, identische Daten und Metadaten, RLS, Versionsschutz und gelöschte UUID; Spielstand V1 mit Fähigkeiten, Statistik, altem Nachweis und vorgemerkter Runde erhalten.`);
} finally {
  sql('postgres', `drop database if exists ${target} with (force); drop database if exists ${source} with (force);`);
}
