// Apply only the new game migration to this project's existing LOCAL database.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
for (const file of ['202609180017_baby_game.sql', '202609180018_pacifier_challenge.sql', '202609180019_nachtpost.sql']) {
  const version = file.split('_')[0];
  if (sql(`select count(*) from supabase_migrations.schema_migrations where version='${version}'`).trim() === '0') {
    sql(`begin; ${readFileSync(`supabase/migrations/${file}`, 'utf8')}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','${file}'); commit;`);
    console.log(`Lokale Spielmigration ${version} angewandt.`);
  } else console.log(`Spielmigration ${version} bereits lokal registriert.`);
}
