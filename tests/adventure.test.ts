import test from 'node:test';
import assert from 'node:assert/strict';
import { regions,rooms,roomById,regionOpen,roomOpen,adventureSkills } from '../src/game/adventure/content.ts';
import { attack,availableSparks,blocked,buySkill,completeRoom,createWorld,dodge,enter,freshSave,maxHp,step,useTool,validateSave } from '../src/game/adventure/model.ts';
import { circuit,circuitHint,circuitSolved,rotate,sequence,solveCircuit } from '../src/game/adventure/puzzles.ts';
import { AdventureStorage,saveKey,type AdventureApi,type PendingSave } from '../src/game/adventure/storage.ts';

test('Kampagnen-Inhaltsgraph: sechs Regionen mit je 16 Orten, alle Werkzeuge, Prüfungen und Finale erreichbar',()=>{
 assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length);assert.equal(rooms.length,98);
 const cleared:string[]=[],tools:string[]=[],seals:number[]=[];
 for(const region of regions){assert.ok(regionOpen(region.id,seals));const seen=new Set<string>(),queue=[`${region.id}:0`];
  for(let iteration=0;iteration<100&&queue.length;iteration++){
   const id=queue.shift()!,room=roomById.get(id)!;if(seen.has(id))continue;
   if(!roomOpen(room,cleared,tools)){queue.push(id);continue;}
   seen.add(id);if(room.kind==='tool')tools.push(region.tool);cleared.push(id);
   for(const exit of room.exits){const other=roomById.get(exit.to);assert.ok(other);assert.ok(other.exits.some(e=>e.to===id));queue.push(exit.to);}
  }
  assert.equal(seen.size,16,region.name);seals.push(region.id);
 }
 assert.equal(tools.length,6);assert.equal(seals.length,6);
 assert.equal(regionOpen(4,[1,2]),false);assert.equal(regionOpen(6,[1,2,3,4]),false);
});

test('Jeder Raum hat einen kollisionsfreien Eingang, Mitte, Schalter und vier miteinander verbundene Ausgänge',()=>{
 for(const room of rooms){const p=freshSave();p.room=room.id;p.tools=['bell'];const w=createWorld(p);
  for(const realm of [0,1] as const){w.realm=realm;const start={x:320,y:352};assert.equal(blocked(w,start.x,start.y),false,room.id);
   // Grid BFS with the actual collision predicate, no traversal through walls.
   const visited=new Set<string>(),queue=[start];while(queue.length){const q=queue.pop()!,key=`${q.x},${q.y}`;if(visited.has(key)||blocked(w,q.x,q.y,10))continue;visited.add(key);for(const [dx,dy]of[[16,0],[-16,0],[0,16],[0,-16]]){const x=q.x+dx,y=q.y+dy;if(x>=48&&x<=592&&y>=48&&y<=400&&!visited.has(`${x},${y}`))queue.push({x,y});}}
   for(const target of [[320,64],[320,384],[64,224],[576,224],[320,224],[496,336]])assert.ok(visited.has(target.join(',')),`${room.id}/${realm}: ${target}`);
  }
 }
});

test('Rolle, Schaden, Werkzeuge, Skillbaum und einmalige Belohnung',()=>{
 const p=freshSave();p.room='1:1';const w=createWorld(p);w.enemies=[];assert.ok(dodge(w));assert.equal(dodge(w),false);assert.equal(w.stamina,70);
 p.sparks=42;for(const skill of adventureSkills)assert.ok(buySkill(p,skill.id));assert.equal(availableSparks(p),0);assert.equal(buySkill(p,'heart'),false);assert.equal(maxHp(p),8);
 assert.ok(completeRoom(w));const before=p.sparks;assert.equal(completeRoom(w),false);assert.equal(p.sparks,before);
 p.tools=['bell','clock'];p.equipped='bell';w.toolCooldown=0;assert.ok(useTool(w));assert.equal(w.realm,1);
 p.equipped='clock';w.toolCooldown=0;w.stamina=100;assert.ok(useTool(w));assert.equal(w.slow,4);
 const hp=p.hp;step(w,{x:0,y:0},0);assert.equal(p.hp,hp);
});

test('Bosszugang benötigt drei Prüfungen; Tod verliert keine Werkzeuge oder Briefe',()=>{
 const p=freshSave();p.room='1:14';p.tools=['bell'];p.letters=['1:3'];const w=createWorld(p);
 assert.equal(enter(w,'1:15'),false);p.cleared.push('1:6','1:7','1:11');assert.equal(enter(w,'1:15'),true);
 p.hp=1;w.invincible=0;w.shots.push({x:w.hero.x,y:w.hero.y,vx:0,vy:0,life:1,friendly:false,damage:1,radius:6});step(w,{x:0,y:0},.01);
 assert.equal(p.deaths,1);assert.deepEqual(p.tools,['bell']);assert.deepEqual(p.letters,['1:3']);assert.equal(p.hp,maxHp(p));
});

test('Alle sechs Schaltkreise sind lösbar; Hinweise helfen tatsächlich, Gedächtnisfolgen variieren',()=>{
 for(let seed=0;seed<100;seed++){const c=circuit(seed%10===0?5:seed%2?3:4,seed);const solved=solveCircuit(c);assert.ok(solved);assert.ok(circuitSolved({...c,tiles:solved}));for(let i=0;i<c.tiles.length;i++)circuitHint(c);assert.ok(circuitSolved(c));for(const target of c.target){let n=target;for(let r=0;r<4;r++)n=rotate(n);assert.equal(n,target);}}
 assert.notDeepEqual(sequence(3,8),sequence(4,8));assert.equal(sequence(7,8).length,8);
});

test('Versionsschutz lässt unbekannte Felder bestehen und unbekannte Formate scheitern',()=>{
 const p={...freshSave(),futureField:{present:true}};assert.deepEqual(validateSave(p),p);assert.throws(()=>validateSave({...p,schema:2}));
});

function memoryStorage(){const values=new Map<string,string>();return {getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};}
function server(){let revision=0,payload:unknown=null;const receipts=new Map<string,{status:string;revision:number}>();const sent:PendingSave[]=[];let fail=false;const api:AdventureApi={load:async()=>({revision,payload:structuredClone(payload)}),save:async op=>{sent.push(structuredClone(op));if(receipts.has(op.id))return receipts.get(op.id)!;if(op.base!==revision)return {status:'conflict',revision};payload=structuredClone(op.payload);revision++;const result={status:'saved',revision};receipts.set(op.id,result);if(fail)throw new Error('Antwort verloren');return result;}};return {api,sent,fail:(v:boolean)=>{fail=v;}};}

test('Save: verlorene Antwort wird identisch wiederholt, Fortschritt während Versand wird danach gespeichert',async()=>{
 const s=server(),local=memoryStorage(),store=new AdventureStorage(s.api,'a',local,()=>{}),p=await store.load();
 p.sparks=2;s.fail(true);store.checkpoint(p);await store.flush();assert.ok(store.pending);
 p.sparks=3;store.checkpoint(p);s.fail(false);await store.flush();assert.equal((await s.api.load()).revision,2);assert.equal((await s.api.load()).payload.sparks,3);
 assert.equal(s.sent[0].id,s.sent[1].id);assert.equal(local.getItem(saveKey('a')),null);
});

test('Save: zwei Geräte dürfen sich nicht überschreiben; lokale Sicherung bleibt beim Konflikt erhalten',async()=>{
 const s=server(),localA=memoryStorage(),localB=memoryStorage();const a=new AdventureStorage(s.api,'a',localA,()=>{}),b=new AdventureStorage(s.api,'b',localB,()=>{});const pa=await a.load(),pb=await b.load();pa.sparks=4;a.checkpoint(pa);await a.flush();pb.sparks=3;b.checkpoint(pb);await b.flush();assert.ok(b.conflict);assert.ok(localB.getItem(saveKey('b')));assert.ok(localB.getItem(saveKey('b')+':backup'));assert.equal((await b.useRemote()).sparks,4);assert.ok(localB.getItem(saveKey('b')+':backup'));b.checkpoint(await b.useRemote());assert.equal(b.lastConflict()?.sparks,3);
});

test('Save: offener Auftrag überlebt Reload, fremdes Konto und unbekannte Version bleiben gesperrt',async()=>{
 const s=server(),local=memoryStorage(),a=new AdventureStorage(s.api,'a',local,()=>{}),p=await a.load();s.fail(true);p.sparks=7;a.checkpoint(p);await a.flush();s.fail(false);const b=new AdventureStorage(s.api,'a',local,()=>{});assert.equal((await b.load()).sparks,7);assert.equal((await s.api.load()).revision,1);
 local.setItem(saveKey('a'),JSON.stringify({id:'synthetic',account:'b',base:1,payload:p}));await assert.rejects(()=>new AdventureStorage(s.api,'a',local,()=>{}).load());assert.ok(local.getItem(saveKey('a')));
});

test('Boss: gepanzerte Phasen blocken, passendes Werkzeug kontert nur das angekündigte Zeitfenster',()=>{
 for(const region of regions){
  const p=freshSave();p.room=`${region.id}:15`;p.tools=regions.slice(0,region.id).map(r=>r.tool);p.equipped=region.tool;
  const w=createWorld(p),boss=w.enemies[0];w.hero={x:320,y:192};w.facing={x:0,y:-1};
  const hp=boss.hp;boss.phase='approach';attack(w);assert.equal(boss.hp,hp);
  w.attackCooldown=0;boss.phase='rest';attack(w);assert.equal(boss.hp,hp-2);
  boss.phase='tell';boss.timer=.8;w.toolCooldown=0;w.stamina=100;useTool(w);
  if(['bell','hook','gust','clock'].includes(region.tool))assert.equal(boss.phase,'rest',region.tool);
  else{for(let i=0;i<30;i++)step(w,{x:0,y:0},1/60);assert.ok(boss.hp<hp-2,region.tool);}
 }
});

test('Alle sechs Hüter sind mit normalen Kampfregeln besiegbar; Arena kann nicht versehentlich verlassen werden',()=>{
 for(const region of regions){
  const p={...freshSave(),room:`${region.id}:15`,tools:regions.slice(0,region.id).map(r=>r.tool),equipped:region.tool,skills:['heart','edge','boots','roll',...(region.id>3?['spark','flow']:[])],seals:regions.slice(0,region.id-1).map(r=>r.id),difficulty:'cozy' as const};p.hp=maxHp(p);const w=createWorld(p);
  for(let frame=0;frame<60*120&&!p.seals.includes(region.id);frame++){
   const e=w.enemies[0];assert.ok(e);const dx=e.x-w.hero.x,dy=e.y-w.hero.y,d=Math.hypot(dx,dy)||1,vulnerable=e.phase==='rest'||e.stun>0;
   let x=0,y=0;if(vulnerable){if(d>47){x=dx/d;y=dy/d;}else w.facing={x:dx/d,y:dy/d};}
   else{const distance=d<115?-1:d>210?.6:0;x=dx/d*distance-dy/d*.8;y=dy/d*distance+dx/d*.8;}
   const tool=e.phase==='tell'&&e.timer<.8&&w.toolCooldown===0;if(tool)w.facing={x:dx/d,y:dy/d};
   step(w,{x:tool?0:x,y:tool?0:y,attack:vulnerable&&d<63,tool,roll:e.phase==='strike'&&d<110},1/60);
  }
  assert.ok(p.seals.includes(region.id),region.name);assert.ok(p.cleared.includes(`${region.id}:15`));
 }
});

test('Fliegende Werkzeugtreffer behalten ihren Ursprung auch nach einem Werkzeugwechsel',()=>{
 const p=freshSave();p.room='3:15';p.tools=['lantern','echo'];p.equipped='lantern';const w=createWorld(p),boss=w.enemies[0];
 w.hero={x:320,y:192};w.facing={x:0,y:-1};boss.phase='tell';boss.timer=.8;
 useTool(w);p.equipped='echo';for(let i=0;i<15;i++)step(w,{x:0,y:0},1/60);
 assert.ok(boss.hp<boss.maxHp,'Die bereits abgefeuerte Laterne kontert weiterhin Mutter Mumpf.');
});
