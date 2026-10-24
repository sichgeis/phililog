// Synthetic test identities. Existing LOCAL schemas may retain older opaque values.
// Never use this helper for production membership or presentation.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const migration = readFileSync(new URL('../supabase/migrations/202609120001_feedings.sql', import.meta.url), 'utf8');
const constraint = migration.match(/check \(person in \(([^)]+)\)\)/);
assert.ok(constraint, 'Historical member constraint exists');
export const installationPeople = [...constraint[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
assert.equal(installationPeople.length, 2);
let people = installationPeople;
if (process.argv.includes('--legacy-identities')) people = ['former-caregiver-a', 'former-caregiver-b'];
if (process.argv.includes('--existing-local-identities')) {
  const definition = execFileSync('docker', ['exec', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-At', '-c', "select pg_get_constraintdef(oid) from pg_constraint where conrelid='private.members'::regclass and contype='c'"], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  people = [...definition.matchAll(/'([^']+)'/g)].map(match => match[1]);
}
assert.equal(people.length, 2, 'Exactly two local fixture identities');
export const legacyPeople = people;
