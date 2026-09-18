import { adventureSkills, roomById, roomOpen, regions, W, H, type Room, type Tool } from './content.ts';
export interface Save {
  schema:1; room:string; x:number; y:number; hp:number; tools:Tool[]; equipped:Tool;
  skills:string[]; cleared:string[]; visited:string[]; letters:string[]; quests:number[]; seals:number[];
  sparks:number; playSeconds:number; deaths:number; intro:boolean; ending:'together'|'release'|null;
  difficulty:'normal'|'cozy'; sound:boolean; tea:number;
}
export function freshSave():Save { return {schema:1,room:'home',x:320,y:320,hp:6,tools:[],equipped:'bell',skills:[],cleared:[],visited:['home'],letters:[],quests:[],seals:[],sparks:0,playSeconds:0,deaths:0,intro:false,ending:null,difficulty:'normal',sound:false,tea:2}; }
export function validateSave(data:unknown):Save {
  if(!data||typeof data!=='object')throw new Error('Der Spielstand ist nicht lesbar. Er wird nicht ersetzt.');
  const p=data as Save;
  if(p.schema!==1)throw new Error('Dieser Abenteuerstand benötigt eine andere Spielversion. Bitte aktualisieren.');
  for(const key of ['tools','skills','cleared','visited','letters','quests','seals'] as const)if(!Array.isArray(p[key]))throw new Error('Unvollständiger Abenteuerstand.');
  if(!roomById.has(p.room)||!Number.isFinite(p.sparks)||p.sparks<0||!Number.isFinite(p.playSeconds))throw new Error('Unbekannter Abenteuerstand. Sicherung bleibt erhalten.');
  for(const key of ['x','y','hp','sparks','playSeconds','deaths','tea'] as const)if(!Number.isFinite(p[key])||p[key]<0)throw new Error('Unvollständiger Zahlenwert im Abenteuerstand.');
  if(!['normal','cozy'].includes(p.difficulty)||typeof p.intro!=='boolean'||typeof p.sound!=='boolean')throw new Error('Unbekannte Abenteuer-Einstellungen.');
  return structuredClone(p);
}
export const maxHp=(p:Save)=>6+(p.skills.includes('heart')?2:0)+Math.floor(p.seals.length/2);
export const availableSparks=(p:Save)=>p.sparks-adventureSkills.filter(s=>p.skills.includes(s.id)).reduce((sum,s)=>sum+s.cost,0);
export function buySkill(p:Save,id:string) { const s=adventureSkills.find(s=>s.id===id);if(!s||p.skills.includes(id)||(s.requires&&!p.skills.includes(s.requires))||availableSparks(p)<s.cost)return false;p.skills.push(id);if(id==='heart')p.hp=Math.min(maxHp(p),p.hp+2);return true; }
export interface Vec {x:number;y:number}
export interface Rect extends Vec {w:number;h:number;kind:'wall'|'water'|'thorn'|'dream'}
export type EnemyType='mote'|'beetle'|'archer'|'wisp'|'guard'|'boss';
export interface Enemy extends Vec {id:number;type:EnemyType;hp:number;maxHp:number;phase:'approach'|'tell'|'strike'|'rest';timer:number;target:Vec;hit:number;stun:number;facing:Vec;cycle:number;route?:Vec[];routeTime?:number}
export interface Shot extends Vec {vx:number;vy:number;life:number;friendly:boolean;damage:number;radius:number;tool?:Tool}
export interface Particle extends Vec {vx:number;vy:number;life:number;color:string}
export interface Input {x:number;y:number;attack?:boolean;roll?:boolean;tool?:boolean;interact?:boolean}
export interface Event {type:'text'|'dialogue'|'puzzle'|'changed'|'sound'|'death'|'ending';text?:string;kind?:string}
export interface World {p:Save;room:Room;hero:Vec;facing:Vec;realm:0|1;enemies:Enemy[];shots:Shot[];particles:Particle[];obstacles:Rect[];stamina:number;invincible:number;attack:number;attackCooldown:number;roll:number;rollCooldown:number;toolCooldown:number;slow:number;wave:number;switches:number[];switchOrder:number[];time:number;transition:number;events:Event[];nextEnemy:number}
const spawnPositions:Vec[]=[{x:144,y:112},{x:496,y:112},{x:144,y:336},{x:496,y:336},{x:320,y:96},{x:320,y:352}];
export function geometry(room:Room):Rect[] {
 if(room.kind==='camp'||room.id==='final'||room.kind==='boss')return [];
 const shapes:Rect[][]=[
 [{x:208,y:144,w:64,h:48,kind:'wall'},{x:368,y:256,w:64,h:48,kind:'wall'}],
 [{x:192,y:160,w:64,h:128,kind:'wall'},{x:384,y:160,w:64,h:128,kind:'wall'}],
 [{x:224,y:128,w:192,h:32,kind:'water'},{x:224,y:288,w:192,h:32,kind:'water'}],
 [{x:80,y:176,w:96,h:32,kind:'wall'},{x:464,y:256,w:96,h:32,kind:'wall'}],
 [{x:208,y:96,w:32,h:96,kind:'wall'},{x:400,y:256,w:32,h:96,kind:'wall'}],
 [{x:96,y:192,w:80,h:64,kind:'thorn'},{x:464,y:192,w:80,h:64,kind:'thorn'}],
 ];
 const result=structuredClone(shapes[room.layout%6]);
 if(room.kind==='rift')return [{x:224,y:64,w:32,h:112,kind:'dream'},{x:224,y:272,w:32,h:112,kind:'dream'},{x:384,y:64,w:32,h:112,kind:'water'},{x:384,y:272,w:32,h:112,kind:'water'}];
 return result;
}
export function createWorld(p:Save):World {
 const room=roomById.get(p.room)!;
 const w:World={p,room,hero:{x:p.x,y:p.y},facing:{x:0,y:-1},realm:0,enemies:[],shots:[],particles:[],obstacles:geometry(room),stamina:100,invincible:1,attack:0,attackCooldown:0,roll:0,rollCooldown:0,toolCooldown:0,slow:0,wave:0,switches:[],switchOrder:[0,1,2].map(i=>(i+room.region+room.index)%3),time:0,transition:0,events:[],nextEnemy:0};
 if(blocked(w,w.hero.x,w.hero.y,11)){w.hero={x:320,y:352};p.x=320;p.y=352;}
 spawnWave(w);return w;
}
export function enter(w:World,id:string,from?:'n'|'s'|'e'|'w') {
 const next=roomById.get(id);if(!next)return false;
 if(!roomOpen(next,w.p.cleared,w.p.tools)){say(w,next.kind==='boss'?'Für den Hüter braucht ihr das Werkzeug dieser Region und die drei Prüfungsstempel.':'Hier braucht ihr zuerst die Traumglocke.');return false;}
 const position=from==='n'?{x:320,y:384}:from==='s'?{x:320,y:64}:from==='e'?{x:64,y:224}:from==='w'?{x:576,y:224}:{x:320,y:352};
 w.p.room=id;w.p.x=position.x;w.p.y=position.y;
 if(!w.p.visited.includes(id))w.p.visited.push(id);
 const nextWorld=createWorld(w.p);Object.assign(w,nextWorld);w.transition=.8;w.events.push({type:'changed'});
 const region=regions.find(r=>r.id===next.region);
 say(w,next.kind==='camp'?(region?`${region.keeper} wartet am Feuer.`:'Sternhafen. Jeder Weg beginnt mit einer offenen Tür.'):next.kind==='boss'?`${region?.boss}. Achte auf die Vorwarnung und die Ruhe nach jedem Angriff.`:next.hint);
 return true;
}
function spawnWave(w:World) {
 if(w.p.cleared.includes(w.room.id)||!['fight','boss'].includes(w.room.kind))return;
 if(w.room.kind==='boss') {
  const hp=48+w.room.region*10;w.enemies.push({id:w.nextEnemy++,type:'boss',x:320,y:144,hp,maxHp:hp,phase:'approach',timer:1.7,target:{...w.hero},hit:0,stun:0,facing:{x:0,y:1},cycle:0});return;
 }
 const types:EnemyType[]=['mote','beetle','archer','wisp','guard'];
 const n=2+Math.min(3,Math.floor(w.room.region/2))+Number(w.room.index===14);
 for(let i=0;i<n;i++) {
  const type=types[(i+w.room.region+w.wave+w.room.index)%Math.min(5,2+w.room.region)];
  const hp=(type==='guard'?5:type==='beetle'?4:3)+Math.floor(w.room.region/3);
  w.enemies.push({id:w.nextEnemy++,type,...spawnPositions[(i+w.wave)%6],hp,maxHp:hp,phase:'approach',timer:1+i*.3,target:{...w.hero},hit:0,stun:0,facing:{x:0,y:1},cycle:0});
 }
}
export function say(w:World,text:string){w.events.push({type:'text',text});}
export function completeRoom(w:World) {
 if(w.p.cleared.includes(w.room.id))return false;
 w.p.cleared.push(w.room.id);w.p.sparks+=w.room.kind==='boss'?5:['memory','circuit','timing'].includes(w.room.kind)?2:1;
 if(w.p.skills.includes('mend'))w.p.hp=Math.min(maxHp(w.p),w.p.hp+1);
 if(w.room.kind==='boss'&&!w.p.seals.includes(w.room.region)){w.p.seals.push(w.room.region);w.p.hp=maxHp(w.p);w.events.push({type:'dialogue',kind:'boss'});}
 else say(w,'Ein weiterer kleiner Sieg. Ein Sternenfunke für euren Fähigkeitenbaum.');
 burst(w,w.hero.x,w.hero.y,'#f7df8e',20);w.events.push({type:'sound',kind:'success'},{type:'changed'});return true;
}
export function blocked(w:World,x:number,y:number,r=11,realm=w.realm) {
 if(x<32+r||x>W-32-r||y<32+r||y>H-32-r)return true;
 return w.obstacles.some(o=>!(o.kind==='dream'&&realm===1)&&!(o.kind==='water'&&realm===1&&w.room.kind==='rift')&&x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);
}
function move(w:World,pos:Vec,dx:number,dy:number,r=11){if(!blocked(w,pos.x+dx,pos.y,r))pos.x+=dx;if(!blocked(w,pos.x,pos.y+dy,r))pos.y+=dy;}
function distance(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y);}
function direction(a:Vec,b:Vec):Vec{const d=distance(a,b)||1;return{x:(b.x-a.x)/d,y:(b.y-a.y)/d};}
function burst(w:World,x:number,y:number,color:string,n=8){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;w.particles.push({x,y,vx:Math.cos(a)*50,vy:Math.sin(a)*50,life:.55,color});}}
function damageEnemy(w:World,e:Enemy,amount:number,stun=.12){if(e.hp<=0)return;if(e.type==='boss'&&e.phase!=='rest'&&e.stun<=0){burst(w,e.x,e.y,'#98b2c5',3);return;}e.hp-=amount;e.hit=.18;e.stun=Math.max(e.stun,e.type==='boss'?0:stun);burst(w,e.x,e.y,'#f8d394');w.events.push({type:'sound',kind:'hit'});}
function hurt(w:World,damage=1){if(w.invincible>0||w.roll>0)return;w.p.hp-=damage;w.invincible=w.p.difficulty==='cozy'?1.6:1;burst(w,w.hero.x,w.hero.y,'#e88d96');w.events.push({type:'sound',kind:'hurt'});if(w.p.hp<=0){w.p.deaths++;w.p.hp=maxHp(w.p);w.p.x=320;w.p.y=352;const next=createWorld(w.p);Object.assign(w,next);w.events.push({type:'death'},{type:'changed'});}}
export function attack(w:World) {
 if(w.attackCooldown>0||w.roll>0||w.stamina<10)return false;w.stamina-=10;
 w.attack=.2;w.attackCooldown=.36;w.events.push({type:'sound',kind:'swing'});
 const damage=(2+Number(w.p.skills.includes('edge')))*(w.p.skills.includes('resolve')&&w.p.hp<=2?2:1);
 for(const e of w.enemies){const d=direction(w.hero,e),dot=d.x*w.facing.x+d.y*w.facing.y;
  if(distance(w.hero,e)<64&&(dot>-.1||w.p.skills.includes('sweep'))){
   if(e.type==='guard'&&e.phase!=='rest'&&e.stun<=0&&(direction(e,w.hero).x*e.facing.x+direction(e,w.hero).y*e.facing.y)>-.3){say(w,'Die Wache blockt. Rolle hinter sie oder betäube sie mit dem Werkzeug.');continue;}
   if(e.type==='boss'&&e.phase==='tell'){burst(w,e.x,e.y,'#c4c9da');continue;}
   damageEnemy(w,e,damage);
  }
 }
 for(let i=0;i<3;i++)if(distance(w.hero,switchPosition(i))<60&&w.room.kind==='switches')activateSwitch(w,i);
 const thorn=w.obstacles.find(o=>o.kind==='thorn'&&distance(w.hero,{x:o.x+o.w/2,y:o.y+o.h/2})<72);
 if(thorn)say(w,'Diese Dornen brauchen Licht. Die Mutlaterne findet ihr in den Laternenmooren.');
 return true;
}
export function dodge(w:World) {
 const cost=w.p.skills.includes('roll')?18:30;if(w.rollCooldown>0||w.stamina<cost)return false;
 w.stamina-=cost;w.roll=.22;w.rollCooldown=w.p.skills.includes('roll')?.48:.7;w.invincible=Math.max(w.invincible,.28);w.events.push({type:'sound',kind:'roll'});
 if(w.p.skills.includes('nova'))for(const e of w.enemies)if(distance(w.hero,e)<80)damageEnemy(w,e,2);
 return true;
}
export function useTool(w:World) {
 const tool=w.p.equipped;if(!w.p.tools.includes(tool))return false;
 if(w.toolCooldown>0)return false;
 if(tool==='bell') {const next=w.realm===0?1:0;if(blocked(w,w.hero.x,w.hero.y,11,next)){say(w,'Hier fehlt auf der anderen Seite der Boden. Suche eine sichere Stelle.');return false;}w.realm=next;w.toolCooldown=.5;for(const e of w.enemies)if(e.type==='boss'&&w.room.region===1&&e.phase==='tell'){e.phase='rest';e.timer=1.3;}w.events.push({type:'sound',kind:'bell'});say(w,next?'Traumseite. Manche Wege gibt es nur, wenn man anders hinsieht.':'Zurück in der Nacht.');return true;}
 const cost=w.p.skills.includes('flow')?18:28;if(w.stamina<cost){say(w,'Kurz durchatmen – eure Ausdauer füllt sich wieder.');return false;}
 w.stamina-=cost;w.toolCooldown=.6;const damage=2+Number(w.p.skills.includes('spark'));w.events.push({type:'sound',kind:'magic'});
 if(tool==='clock'){w.slow=4;for(const e of w.enemies)if(e.type==='boss'&&w.room.region===6&&e.phase==='tell'){e.phase='rest';e.timer=1.5;}return true;}
 if(tool==='gust'){w.shots=w.shots.filter(s=>s.friendly||distance(w.hero,s)>160);const radius=w.p.skills.includes('reach')?160:112;for(const e of w.enemies)if(distance(w.hero,e)<radius){if(e.type==='boss'&&w.room.region===4&&e.phase==='tell'){e.phase='rest';e.timer=1.7;}damageEnemy(w,e,damage,.9);const d=direction(w.hero,e);move(w,e,d.x*35,d.y*35,12);}for(let i=0;i<3;i++)if(w.room.kind==='switches'&&distance(w.hero,switchPosition(i))<radius)activateSwitch(w,i);burst(w,w.hero.x,w.hero.y,'#bde8d4',24);return true;}
 if(tool==='hook'){
  const target=w.enemies.find(e=>distance(w.hero,e)<200&&(direction(w.hero,e).x*w.facing.x+direction(w.hero,e).y*w.facing.y)>.7);
  if(target){if(target.type==='boss'&&w.room.region===2&&target.phase==='tell'){target.phase='rest';target.timer=2;}damageEnemy(w,target,damage,w.p.skills.includes('reach')?3:1.8);return true;}
  const anchors=[{x:112,y:80},{x:528,y:80},{x:112,y:368},{x:528,y:368}];
  const anchor=anchors.filter(a=>distance(w.hero,a)<360&&(direction(w.hero,a).x*w.facing.x+direction(w.hero,a).y*w.facing.y)>.6).sort((a,b)=>distance(w.hero,a)-distance(w.hero,b))[0];
  if(anchor&&!blocked(w,anchor.x,anchor.y)){w.hero={...anchor};burst(w,anchor.x,anchor.y,'#f7df8e');}else say(w,'Blicke zu einem goldenen Anker oder einem Gegner.');return true;
 }
 const base=Math.atan2(w.facing.y,w.facing.x);
 for(const offset of tool==='echo'?[-.24,0,.24]:[0])w.shots.push({...w.hero,vx:Math.cos(base+offset)*260,vy:Math.sin(base+offset)*260,life:1.5,friendly:true,damage,radius:5,tool});return true;
}
export const switchPosition=(i:number)=>({x:160+i*160,y:112});
export function activateSwitch(w:World,i:number) {
 if(w.p.cleared.includes(w.room.id)||w.switches.includes(i))return;
 if(w.switchOrder[w.switches.length]===i){w.switches.push(i);w.events.push({type:'sound',kind:'bell'});if(w.switches.length===3)completeRoom(w);}
 else {w.switches=[];say(w,'Die Kristalle werden still. Die Stele zeigt die Reihenfolge: '+w.switchOrder.map(n=>['Blatt','Mond','Stern'][n]).join(' → '));}
}
export function interact(w:World) {
 if(w.room.letter&&!w.p.letters.includes(w.room.id)&&distance(w.hero,{x:496,y:336})<64){w.p.letters.push(w.room.id);w.p.sparks++;w.events.push({type:'dialogue',kind:'letter'},{type:'changed'});return;}
 if(distance(w.hero,{x:320,y:224})>76){say(w,'Geh näher an die Person, Truhe oder das Pult. Briefe liegen unten rechts.');return;}
 switch(w.room.kind){
  case 'camp':w.p.hp=maxHp(w.p);w.p.tea=w.p.skills.includes('pockets')?3:2;w.events.push({type:'dialogue',kind:'camp'},{type:'changed'});break;
  case 'tool':{const r=regions[w.room.region-1];if(!w.p.tools.includes(r.tool)){w.p.tools.push(r.tool);w.p.equipped=r.tool;completeRoom(w);}w.events.push({type:'dialogue',kind:'tool'});break;}
  case 'memory':case 'circuit':case 'timing':w.events.push({type:'puzzle',kind:w.room.kind});break;
  case 'story':if(w.room.id==='final')w.events.push({type:'ending'});else{completeRoom(w);w.events.push({type:'dialogue',kind:'story'});}break;
  case 'switches':w.events.push({type:'dialogue',kind:'switches'});break;
  case 'rift':if(w.realm===1){completeRoom(w);}else say(w,'Der Sternenschrein ist auf der Traumseite. Läute eure Glocke.');break;
  default:say(w,w.room.hint);
 }
}
function enemyShot(w:World,e:Enemy,angle:number,speed:number){w.shots.push({x:e.x,y:e.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:4,friendly:false,damage:1,radius:6});}
function steer(w:World,e:Enemy,target:Vec):Vec {
 if(!e.routeTime||w.time>=e.routeTime){
  e.routeTime=w.time+.6;
  const cols=20,rows=14,start=Math.floor(e.y/32)*cols+Math.floor(e.x/32),goal=Math.floor(target.y/32)*cols+Math.floor(target.x/32);
  const previous=new Map<number,number>([[start,-1]]),queue=[start];let found=start,best=Infinity;
  for(let head=0;head<queue.length;head++){
   const cell=queue[head],x=cell%cols,y=Math.floor(cell/cols),d=Math.hypot(x*32+16-target.x,y*32+16-target.y);
   if(d<best){best=d;found=cell;}if(cell===goal){found=cell;break;}
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,next=ny*cols+nx;if(nx<1||ny<1||nx>=cols-1||ny>=rows-1||previous.has(next)||blocked(w,nx*32+16,ny*32+16,12))continue;previous.set(next,cell);queue.push(next);}
  }
  const route:Vec[]=[];while(found!==start&&previous.has(found)){route.unshift({x:(found%cols)*32+16,y:Math.floor(found/cols)*32+16});found=previous.get(found)!;}e.route=route;
 }
 while(e.route?.length&&distance(e,e.route[0])<10)e.route.shift();
 return direction(e,e.route?.[0]??target);
}
function updateEnemy(w:World,e:Enemy,dt:number){
 e.hit=Math.max(0,e.hit-dt);e.stun=Math.max(0,e.stun-dt);if(e.stun>0)return;
 const slow=(w.slow>0?.35:1)*(w.p.difficulty==='cozy'?.72:1);dt*=slow;
 e.timer-=dt;
 if(e.phase==='approach'){
  const d=e.type==='boss'||e.type==='archer'?direction(e,w.hero):steer(w,e,w.hero);e.facing=direction(e,w.hero);
  if(e.type!=='archer'&&e.type!=='boss'&&distance(e,w.hero)>42)move(w,e,d.x*(e.type==='wisp'?58:38)*dt,d.y*(e.type==='wisp'?58:38)*dt,12);
  if(e.timer<=0){e.phase='tell';e.target={...w.hero};e.timer=e.type==='boss'?.9:e.type==='beetle'?.7:.65;}
 }else if(e.phase==='tell'&&e.timer<=0){
  e.phase='strike';e.timer=e.type==='boss'?.7:.45;e.facing=direction(e,e.target);
  if(e.type==='archer'||e.type==='boss'){
   const angle=Math.atan2(e.target.y-e.y,e.target.x-e.x);
   if(e.type==='boss'){
    const region=w.room.region,phase=e.hp<e.maxHp/2?2:1;e.cycle++;
    if(region===1||region===6){for(let i=-phase;i<=phase;i++)enemyShot(w,e,angle+i*.25,145);}
    else if(region===2||region===5){for(let i=0;i<8+phase*2;i++)enemyShot(w,e,i*Math.PI*2/(8+phase*2)+e.cycle*.2,100+region*5);}
    else if(region===3){for(let i=0;i<5;i++)enemyShot(w,e,angle+(i-2)*.35,110);}
    else for(let i=-2;i<=2;i++)enemyShot(w,e,angle+i*.2,180);
   }else enemyShot(w,e,angle,150);
  }
 }else if(e.phase==='strike'){
  if(e.type==='beetle'||e.type==='guard'||(e.type==='boss'&&[1,3,6].includes(w.room.region))){move(w,e,e.facing.x*260*dt,e.facing.y*260*dt,e.type==='boss'?24:12);}
  if(distance(e,w.hero)<(e.type==='boss'?42:30))hurt(w);
  if(e.timer<=0){e.phase='rest';e.timer=e.type==='boss'?1.6:1.1;}
 }else if(e.phase==='rest'&&e.timer<=0){e.phase='approach';e.timer=e.type==='boss'?(e.hp<e.maxHp/2?.5:.8):.7;}
}
export function step(w:World,input:Input,dt:number){
 dt=Math.max(0,Math.min(.05,dt));w.time+=dt;w.p.playSeconds+=dt;
 for(const key of ['invincible','attack','attackCooldown','roll','rollCooldown','toolCooldown','slow','transition'] as const)w[key]=Math.max(0,w[key]-dt);
 w.stamina=Math.min(100,w.stamina+dt*26);
 const length=Math.hypot(input.x,input.y),dir=length?{x:input.x/Math.max(1,length),y:input.y/Math.max(1,length)}:{x:0,y:0};
 if(length>.15&&w.roll<=0)w.facing=direction({x:0,y:0},dir);
 if(input.roll)dodge(w);if(input.attack)attack(w);if(input.tool)useTool(w);if(input.interact)interact(w);
 const speed=(w.p.skills.includes('boots')?161:140)*(w.roll>0?2.8:1);
 const movement=w.roll>0?w.facing:dir;move(w,w.hero,movement.x*speed*dt,movement.y*speed*dt);
 w.p.x=w.hero.x;w.p.y=w.hero.y;
 if(w.transition<=0&&!(w.room.kind==='boss'&&!w.p.cleared.includes(w.room.id))){const exit=w.room.exits.find(e=>e.direction==='n'?w.hero.y<49&&Math.abs(w.hero.x-320)<44:e.direction==='s'?w.hero.y>399&&Math.abs(w.hero.x-320)<44:e.direction==='w'?w.hero.x<49&&Math.abs(w.hero.y-224)<44:w.hero.x>591&&Math.abs(w.hero.y-224)<44);
  if(exit){if(enter(w,exit.to,exit.direction))return;w.transition=1;}}
 for(const e of w.enemies)if(e.hp>0)updateEnemy(w,e,dt);
 for(const s of w.shots){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(s.friendly){const hit=w.enemies.find(e=>e.hp>0&&distance(s,e)<(e.type==='boss'?28:18));if(hit){if(hit.type==='boss'&&hit.phase==='tell'&&((w.room.region===3&&s.tool==='lantern')||(w.room.region===5&&s.tool==='echo'))){hit.phase='rest';hit.timer=Math.max(hit.timer,1);}damageEnemy(w,hit,s.damage,.35);s.life=0;}
   if(w.room.kind==='switches')for(let i=0;i<3;i++)if(distance(s,switchPosition(i))<18){activateSwitch(w,i);s.life=0;}
   const thorn=w.obstacles.find(o=>o.kind==='thorn'&&s.x>o.x&&s.x<o.x+o.w&&s.y>o.y&&s.y<o.y+o.h);if(thorn&&s.tool==='lantern'){w.obstacles=w.obstacles.filter(o=>o!==thorn);burst(w,s.x,s.y,'#b7d99b');s.life=0;}
  }else if(distance(s,w.hero)<17){hurt(w);s.life=0;}
  if(blocked(w,s.x,s.y,2))s.life=0;
 }
 w.shots=w.shots.filter(s=>s.life>0);w.enemies=w.enemies.filter(e=>e.hp>0);
 if(['fight','boss'].includes(w.room.kind)&&!w.p.cleared.includes(w.room.id)&&w.enemies.length===0){
  if(w.room.kind==='fight'&&w.wave<1+Number(w.room.index===14)){w.wave++;spawnWave(w);say(w,`Noch eine Gruppe Schatten. Welle ${w.wave+1}.`);}else completeRoom(w);
 }
 for(const p of w.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}w.particles=w.particles.filter(p=>p.life>0);
}
