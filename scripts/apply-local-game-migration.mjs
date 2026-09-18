// Apply only the new game migration to this project's existing LOCAL database.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
const version = '202609180017';
if (sql(`select count(*) from supabase_migrations.schema_migrations where version='${version}'`).trim() === '0') {
  sql(`begin; ${readFileSync('supabase/migrations/202609180017_baby_game.sql', 'utf8')}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','baby_game'); commit;`);
  console.log('Lokale Spielmigration 017 angewandt. Bestehende Logbuchmigrationen nicht wiederholt.');
} else console.log('Spielmigration 017 ist lokal bereits registriert.');
