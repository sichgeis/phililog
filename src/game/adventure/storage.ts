import type { SupabaseClient } from '@supabase/supabase-js';
import { freshSave, validateSave, type Save } from './model.ts';
export interface PendingSave {id:string;account:string;base:number;payload:Save}
export interface AdventureApi {load():Promise<{revision:number;payload:unknown}>;save(op:PendingSave):Promise<{status:string;revision:number}>}
export function adventureApi(client:SupabaseClient):AdventureApi{return{
 async load(){const {data,error}=await client.rpc('adventure_load');if(error)throw error;return data;},
 async save(op){const {data:{session}}=await client.auth.getSession();if(session?.user.id!==op.account)throw new Error('Bitte mit dem ursprünglichen Konto anmelden.');const {data,error}=await client.rpc('adventure_save',{operation_id:op.id,actor_id:op.account,base_revision:op.base,checkpoint:op.payload});if(error)throw error;return data;}
};}
export const saveKey=(account:string)=>`phililog:adventure:1:${account}`;
export class AdventureStorage {
 private latest:Save|null=null;
 revision=0;pending:PendingSave|null=null;conflict=false;busy=false;error='';dirty=false;disposed=false;
 private api:AdventureApi;private account:string;private storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>;private onStatus:()=>void;
 constructor(api:AdventureApi,account:string,storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,onStatus:()=>void){this.api=api;this.account=account;this.storage=storage;this.onStatus=onStatus;}
 async load():Promise<Save>{
  const raw=this.storage.getItem(saveKey(this.account));
  if(raw){const op=JSON.parse(raw) as PendingSave;if(op.account!==this.account||!op.id||!Number.isInteger(op.base))throw new Error('Die lokale Sicherung konnte nicht zugeordnet werden. Sie bleibt erhalten.');validateSave(op.payload);this.pending=op;}
  const remote=await this.api.load();this.revision=remote.revision;
  if(this.pending){
   const backup=this.storage.getItem(saveKey(this.account)+':backup');
   const local=backup?validateSave(JSON.parse(backup)):structuredClone(this.pending.payload);
   this.latest=local;this.dirty=JSON.stringify(local)!==JSON.stringify(this.pending.payload);
   await this.flush();
   if(!this.conflict&&!this.pending){const latest=await this.api.load();if(latest.revision!==this.revision){this.conflict=true;this.error='Der gemeinsame Stand ist neuer als eure lokale Sicherung.';}}
   return local;
  }
  return remote.payload===null?freshSave():validateSave(remote.payload);
 }
 checkpoint(p:Save){if(this.conflict||this.disposed)return;this.dirty=true;this.latest=structuredClone(p);
  // Backup remains separate from the immutable in-flight receipt.
  try{this.storage.setItem(saveKey(this.account)+':backup',JSON.stringify(p));}catch{this.error='Lokale Sicherung nicht möglich. Seite bis zum Speichern offen lassen.';}
  if(!this.pending){this.pending={id:crypto.randomUUID(),account:this.account,base:this.revision,payload:structuredClone(p)};this.dirty=false;}
  this.remember();this.onStatus();
 }
 private remember(){try{this.storage.setItem(saveKey(this.account),JSON.stringify(this.pending));}catch{this.error='Gerätespeicher nicht verfügbar. Bitte online speichern, bevor ihr schließt.';}}
 async flush():Promise<void>{if(!this.pending||this.busy||this.conflict||this.disposed)return;this.busy=true;this.onStatus();const op=this.pending;let saved=false;
  try{const result=await this.api.save(op);if(this.disposed)return;
   if(result.status==='conflict'){this.conflict=true;this.error='Auf dem anderen Gerät wurde weitergespielt. Eure lokale Sicherung bleibt erhalten.';return;}
   if(result.status!=='saved')throw new Error('Unbekannte Speicherantwort. Bitte erneut versuchen.');
   this.revision=result.revision;this.error='';saved=true;
   if(this.dirty&&this.latest){
    this.pending={id:crypto.randomUUID(),account:this.account,base:this.revision,payload:structuredClone(this.latest)};this.dirty=false;this.remember();
   }else{
    this.pending=null;
    try{this.storage.removeItem(saveKey(this.account));}catch{this.error='Gespeichert. Ein alter lokaler Nachweis bleibt sicher wiederholbar.';}
   }
  }catch(e){this.error=e instanceof Error?e.message:'Noch nicht gespeichert. Verbindung prüfen und erneut versuchen.';}
  finally{this.busy=false;this.onStatus();}
  if(saved&&this.pending&&!this.conflict&&!this.disposed)await this.flush();
 }
 lastConflict():Save|null {const key=this.storage.getItem(saveKey(this.account)+':last-conflict');const raw=key?this.storage.getItem(key):null;return raw?validateSave(JSON.parse(raw)):null;}
 async useRemote(){if(this.busy)throw new Error('Speicherung läuft noch.');const remote=await this.api.load();const p=remote.payload===null?freshSave():validateSave(remote.payload);if(this.conflict&&this.pending){const key=saveKey(this.account)+':conflict:'+this.pending.id;this.storage.setItem(key,JSON.stringify(this.latest??this.pending.payload));this.storage.setItem(saveKey(this.account)+':last-conflict',key);}this.storage.removeItem(saveKey(this.account));this.pending=null;this.latest=null;this.dirty=false;this.conflict=false;this.error='';this.revision=remote.revision;this.onStatus();return p;}
}
