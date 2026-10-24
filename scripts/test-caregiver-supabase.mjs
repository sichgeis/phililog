// Synthetic presentation fixtures in the local integration suite only.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { legacyPeople } from './legacy-test-people.mjs';
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
export async function testCaregivers({ caregiverA, caregiverB, outsider, anonymous }) {
  const before = sql('select coalesce(jsonb_agg(to_jsonb(p)),\'[]\') from private.caregiver_profiles p;');
  const quote = value => `'${value.replaceAll("'", "''")}'`;
  try {
    sql(`delete from private.caregiver_profiles;
      insert into private.caregiver_profiles values
      ('caregiver_a',${quote(legacyPeople[0])},'Ada','violet','watercolor'),
      ('caregiver_b',${quote(legacyPeople[1])},'Bela','turquoise','stars');`);
    for (const actor of [caregiverA, caregiverB]) {
      const result = await actor.client.rpc('family_caregivers');
      assert.ifError(result.error);
      assert.deepEqual(result.data, [
        { id: 'caregiver_a', person: legacyPeople[0], display_name: 'Ada', badge: 'violet', celebration: 'watercolor' },
        { id: 'caregiver_b', person: legacyPeople[1], display_name: 'Bela', badge: 'turquoise', celebration: 'stars' },
      ]);
      assert.ok((await actor.client.schema('private').from('caregiver_profiles').select()).error);
      assert.ok((await actor.client.schema('private').from('caregiver_profiles').update({ celebration: 'stars' }).eq('id', 'caregiver_a')).error);
      const { data: { session } } = await actor.client.auth.getSession();
      assert.ok(session);
      assert.ifError((await actor.client.auth.getUser(session.access_token)).error);
      assert.ifError((await actor.client.auth.refreshSession({ refresh_token: session.refresh_token })).error);
      assert.equal((await actor.client.rpc('is_family_member')).data, true);
    }
    // Revocation must remain independent of presentation, without losing its mapping.
    sql(`delete from private.members where user_id='${caregiverB.user.id}';`);
    try {
      assert.deepEqual((await caregiverB.client.rpc('family_caregivers')).data, []);
      assert.equal((await caregiverB.client.rpc('is_family_member')).data, false);
    } finally {
      sql(`insert into private.members(user_id,person) values('${caregiverB.user.id}',${quote(legacyPeople[1])});`);
    }
    assert.equal((await caregiverB.client.rpc('family_caregivers')).data.length, 2);
    assert.deepEqual((await outsider.client.rpc('family_caregivers')).data, []);
    assert.ok((await anonymous.rpc('family_caregivers')).error);
    // Presentation removal does not revoke access or change the old identity RPC.
    sql('delete from private.caregiver_profiles;');
    assert.deepEqual((await caregiverA.client.rpc('family_caregivers')).data, []);
    assert.equal((await caregiverA.client.rpc('current_family_person')).data, legacyPeople[0]);
    assert.equal((await caregiverB.client.rpc('is_family_member')).data, true);
  } finally {
    sql(`delete from private.caregiver_profiles; insert into private.caregiver_profiles select * from jsonb_populate_recordset(null::private.caregiver_profiles,${quote(before)}::jsonb);`);
  }
  console.log('Private Darstellung: beide Konten, bestehende Sitzungen/Token-Erneuerung, Fremd-/Anonymzugriff und ausfallsichere alte Identitäten geprüft.');
}
