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
const julia = '11111111-1111-4111-8111-111111111111';
const christian = '22222222-2222-4222-8222-222222222222';
const outsider = '33333333-3333-4333-8333-333333333333';
const migrations = readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
try {
  sql('postgres', `create database ${source}; create database ${target};`);
  // Reuse the installed Auth schema, never its data. Roles belong to the local cluster.
  const authSchema = docker(['pg_dump', '-U', 'supabase_admin', '-d', 'postgres', '--schema-only', '--schema=auth']);
  sql(source, authSchema);
  // Supabase bootstrap grants on a fresh platform database.
  sql(source, 'grant usage on schema public to anon, authenticated, service_role;');
  sql(source, 'create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key, statements text[], name text);');
  for (const file of migrations) {
    const version = file.split('_')[0];
    sql(source, `begin; ${readFileSync(`supabase/migrations/${file}`, 'utf8')}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','${file}'); commit;`);
  }
  sql(source, `
    insert into auth.users(id,email,encrypted_password) values
      ('${julia}','julia@restore.test','synthetic-password-hash'),
      ('${christian}','christian@restore.test','synthetic-password-hash'),
      ('${outsider}','outsider@restore.test','synthetic-password-hash');
    insert into auth.identities(provider_id,user_id,identity_data,provider) values ('${julia}','${julia}','{"sub":"${julia}","email":"julia@restore.test"}','email');
    insert into private.members values ('${julia}','Julia'),('${christian}','Christian');
    insert into public.feedings(id,kind,occurred_at,amount_ml,created_by) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bottle','2088-01-01Z',65,'${julia}');
    update public.feedings set amount_ml=70,performed_by='Christian',mood_after='calm';
    insert into public.feedings(id,kind,occurred_at,side,estimated_ml,created_by) values
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','breast','2088-01-01Z','both',55,'${christian}');
    insert into public.feedings(id,kind,occurred_at,urine,stool,held_success,created_by) values
      ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','diaper','2088-01-01Z',true,false,true,'${julia}');
    insert into public.feedings(id,kind,occurred_at,weight_g,created_by) values
      ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','weight','2088-01-01Z',3500,'${christian}');
    insert into public.feedings(id,kind,occurred_at,amount_ml,created_by) values
      ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','bottle','2088-01-01Z',60,'${julia}');
    delete from public.feedings where id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    insert into public.feedings(id,kind,occurred_at,temperature_c,created_by) values
      ('ffffffff-ffff-4fff-8fff-ffffffffffff','temperature','2088-01-01Z',37.2,'${julia}');
    insert into public.feedings(id,kind,occurred_at,duration_minutes,created_by) values
      ('99999999-9999-4999-8999-999999999999','sunbath','2088-01-01Z',5,'${christian}'),
      ('88888888-8888-4888-8888-888888888888','massage','2088-01-01Z',7,'${julia}'),
      ('77777777-7777-4777-8777-777777777777','gymnastics','2088-01-01Z',null,'${christian}');
    update public.feedings set mood_after='asleep' where kind in ('breast', 'sunbath', 'massage', 'gymnastics');
    update public.family_settings set breast_left_ml=20,breast_right_ml=35;
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
  const tables = ['private.events_before_20260913_layout', 'private.settings_before_20260913_layout', 'private.members_before_20260913_layout', 'public.feedings', 'public.family_settings', 'private.members', 'private.feeding_create_receipts', 'private.events_before_20260913_correction', 'auth.users', 'auth.identities', 'supabase_migrations.schema_migrations'];
  const snapshot = db => tables.map(table => sql(db, `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from ${table} t;`));
  const before = snapshot(source);
  // Consistent custom-format dump includes schema, grants, policies, triggers and all data.
  const dump = docker(['pg_dump', '-U', 'supabase_admin', '-d', source, '-Fc', '--schema=public', '--schema=private', '--schema=auth', '--schema=supabase_migrations']);
  sql(target, 'drop schema public;');
  docker(['pg_restore', '-U', 'supabase_admin', '-d', target, '--exit-on-error', '--single-transaction'], dump);
  assert.deepEqual(snapshot(target), before, 'All application, Auth, private backup and migration rows roundtrip exactly');
  sql(target, `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub','${julia}',true);
    do $$ begin
      assert public.is_family_member();
      assert public.current_family_person() = 'Julia';
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
    select set_config('request.jwt.claim.sub','${christian}',true);
    do $$ begin assert public.is_family_member(); assert (select count(*)=8 from public.feedings); end $$;
    select set_config('request.jwt.claim.sub','${outsider}',true);
    do $$ begin assert not public.is_family_member(); assert (select count(*)=0 from public.feedings); end $$;
    reset role;
    do $$ begin
      assert not has_table_privilege('authenticated','private.feeding_create_receipts','select');
      assert not has_table_privilege('authenticated','private.events_before_20260913_correction','select');
 assert not has_table_privilege('anon','public.feedings','select'); end $$;
    rollback;`);
  console.log(`Restore bestanden: alle ${migrations.length} Migrationen auf leerer Datenbank, vollständiger synthetischer Dump/Restore einschließlich Temperatur, Sonnenbad, Massage und Babygymnastik, identische Daten und Metadaten, RLS, Versionsschutz und gelöschte UUID.`);
} finally {
  sql('postgres', `drop database if exists ${target} with (force); drop database if exists ${source} with (force);`);
}
