// Only the named local test container. Never connect to a configured remote project.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const file = '202610240023_caregiver_presentation.sql';
const version = file.split('_')[0];
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
if (sql(`select count(*) from supabase_migrations.schema_migrations where version='${version}'`).trim() === '0') {
  sql(`begin; ${readFileSync(`supabase/migrations/${file}`, 'utf8')}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','${file}'); notify pgrst, 'reload schema'; commit;`);
  console.log('Lokale Migration 023 angewandt. Keine Produktionsverbindung.');
} else console.log('Migration 023 bereits lokal registriert.');
