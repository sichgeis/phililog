import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {freshSave} from '../src/game/adventure/model.ts';
const sql=input=>execFileSync('docker',['exec','-i','supabase_db_phililog','psql','-X','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-At'],{input,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const tables=['public.adventure_state','private.adventure_receipts'];
const snapshot=()=>tables.map(t=>sql(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') from ${t} t;`));
export async function testAdventure({julia,christian,outsider,anonymous}){
 const original=snapshot();
 const save=(actor,revision,payload=freshSave(),id=randomUUID())=>({operation_id:id,actor_id:actor.user.id,base_revision:revision,checkpoint:payload});
 const load=async actor=>{const r=await actor.client.rpc('adventure_load');assert.ifError(r.error);return r.data;};
 try{
  sql('begin; delete from private.adventure_receipts; update public.adventure_state set revision=0,payload=null; commit;');
  assert.deepEqual(await load(julia),{revision:0,payload:null});
  for(const client of [outsider.client,anonymous]){assert.ok((await client.rpc('adventure_load')).error);assert.ok((await client.rpc('adventure_save',save(julia,0))).error);}
  for(const operation of [julia.client.from('adventure_state').select(),julia.client.from('adventure_state').update({payload:{}}).eq('id',true),julia.client.from('adventure_state').insert({id:true})])assert.equal((await operation).error?.code,'42501');
  const p=freshSave();p.tools=['bell'];p.cleared=['1:2'];p.letters=['1:3'];p.sparks=7;p.room='1:0';
  const pending=save(julia,0,p);
  const applied=await Promise.all([julia.client.rpc('adventure_save',pending),julia.client.rpc('adventure_save',pending)]);
  for(const r of applied){assert.ifError(r.error);assert.deepEqual(r.data,{status:'saved',revision:1});}
  assert.deepEqual((await load(christian)).payload,p);
  assert.ok((await christian.client.rpc('adventure_save',pending)).error);
  assert.ok((await julia.client.rpc('adventure_save',{...pending,checkpoint:{...p,sparks:8}})).error);
  const race=await Promise.all([julia.client.rpc('adventure_save',save(julia,1,{...p,sparks:8})),christian.client.rpc('adventure_save',save(christian,1,{...p,sparks:9}))]);
  assert.equal(race.filter(r=>r.data?.status==='saved').length,1);assert.equal(race.filter(r=>r.data?.status==='conflict').length,1);assert.equal((await load(julia)).revision,2);
  for(const payload of [{...p,schema:2},{...p,sparks:-1},{...p,tools:null},{...p,room:null},{...p,letters:Array(1001).fill('x')},{...p,huge:'x'.repeat(100001)}])assert.ok((await julia.client.rpc('adventure_save',save(julia,2,payload))).error);
  const before=snapshot();sql(`begin; ${readFileSync('supabase/migrations/202609180019_nachtpost.sql','utf8')} commit;`);assert.deepEqual(snapshot(),before);
  sql(`update public.adventure_state set payload=jsonb_set(payload,'{schema}','2');`);
  assert.deepEqual((await julia.client.rpc('adventure_save',pending)).data,{status:'saved',revision:1});
  assert.ok((await julia.client.rpc('adventure_save',save(julia,2,p))).error);
  console.log('Nachtpost-Supabase bestanden: Familienzugriff, direkte Rechte gesperrt, CAS-Konflikt, identische Wiederholung, Payload-/Versionsschutz und wiederholbare Migration.');
 }finally{sql(`begin; delete from private.adventure_receipts; delete from public.adventure_state; ${tables.map((t,i)=>`insert into ${t} select * from jsonb_populate_recordset(null::${t},${quote(original[i])}::jsonb);`).join('\n')} commit;`);}
}
