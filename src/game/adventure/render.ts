import { H,W,regions,roomById } from './content.ts';
import { switchPosition,type World,type Enemy } from './model.ts';
const gold='#f2d48a';
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function rounded(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function star(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,d=i%2?r*.3:r;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();c.fill();}
function text(c:CanvasRenderingContext2D,s:string,x:number,y:number,size=12,color='#eee8d6'){c.font=`${size}px system-ui`;c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y);}
function lantern(c:CanvasRenderingContext2D,x:number,y:number,t:number){const g=c.createRadialGradient(x,y,0,x,y,42);g.addColorStop(0,'#f5d17a30');g.addColorStop(1,'#f5d17a00');c.fillStyle=g;c.fillRect(x-42,y-42,84,84);rounded(c,x-5,y-9,10,15,3,'#b99157');ellipse(c,x,y-2,3,5+Math.sin(t*3),gold);c.strokeStyle='#b99157';c.beginPath();c.arc(x,y-11,4,Math.PI,0);c.stroke();}
function tree(c:CanvasRenderingContext2D,x:number,y:number,scale:number,color:string){ellipse(c,x,y+8,20*scale,8*scale,'#10272566');rounded(c,x-4*scale,y-22*scale,8*scale,30*scale,2,'#8d725a');ellipse(c,x,y-35*scale,23*scale,28*scale,color);ellipse(c,x-13*scale,y-27*scale,17*scale,18*scale,color);ellipse(c,x+14*scale,y-30*scale,17*scale,20*scale,color);}
function npc(c:CanvasRenderingContext2D,x:number,y:number,region:number,t:number){ellipse(c,x,y+13,18,7,'#0004');rounded(c,x-12,y-9,24,27,7,region===0?'#edbe79':'#aab9b4');ellipse(c,x,y-17,12,12,'#ecd1a3');c.fillStyle='#443e51';c.fillRect(x-5,y-19,2,3);c.fillRect(x+4,y-19,2,3);if(region===0){star(c,x+28,y-30+Math.sin(t*2)*3,10,gold);}else{c.fillStyle='#5e526e';c.beginPath();c.moveTo(x-18,y-23);c.lineTo(x+2,y-42);c.lineTo(x+17,y-23);c.fill();}}
function enemy(c:CanvasRenderingContext2D,e:Enemy,t:number,region:number){const boss=e.type==='boss',r=boss?27:14;ellipse(c,e.x,e.y+r*.6,r*.9,r*.3,'#0005');
 if(e.phase==='tell'){c.strokeStyle='#ffbb88';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.target.x,e.target.y);c.stroke();c.setLineDash([]);ellipse(c,e.target.x,e.target.y,21,9,'#f3b97b30');}
 const colors:Record<string,string>={mote:'#d09aaa',beetle:'#ceae7b',archer:'#a997c4',wisp:'#a0d2cc',guard:'#899cc0',boss:regions[region-1]?.color??gold};
 const body=e.hit>0?'#fff4d3':colors[e.type];
 if(e.type==='wisp'){ellipse(c,e.x,e.y-3+Math.sin(t*4+e.id)*4,r,r,body);}
 else{rounded(c,e.x-r,e.y-r,r*2,r*1.7,boss?12:7,body);if(e.type==='beetle'){c.strokeStyle='#685247';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y-r);c.lineTo(e.x,e.y+r*.7);c.stroke();}}
 if(boss){
  c.strokeStyle=body;c.lineWidth=5;
  if(region===1){for(const side of [-1,1]){c.beginPath();c.moveTo(e.x+side*15,e.y-20);c.lineTo(e.x+side*32,e.y-42);c.lineTo(e.x+side*36,e.y-32);c.stroke();}}
  else if(region===2){ellipse(c,e.x,e.y,24,24,'#f1d39c');c.strokeStyle='#514557';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y-17);c.lineTo(e.x,e.y);c.lineTo(e.x+Math.cos(t)*18,e.y+Math.sin(t)*18);c.stroke();}
  else if(region===3){for(let i=0;i<5;i++)ellipse(c,e.x-26+i*13,e.y-24-Math.sin(i)*5,13,15,body);}
  else if(region===4){rounded(c,e.x-19,e.y-38,38,19,5,'#f2e9d2');ellipse(c,e.x-14,e.y-40,12,10,'#f2e9d2');ellipse(c,e.x+2,e.y-44,13,11,'#f2e9d2');ellipse(c,e.x+17,e.y-40,11,10,'#f2e9d2');}
  else if(region===5){rounded(c,e.x-34,e.y-26,68,42,3,'#eee0c8');c.strokeStyle='#80718c';c.lineWidth=2;c.beginPath();c.moveTo(e.x,e.y-24);c.lineTo(e.x,e.y+15);c.stroke();for(let i=0;i<3;i++){c.fillStyle='#9588a1';c.fillRect(e.x-27,e.y-17+i*8,18,2);c.fillRect(e.x+9,e.y-17+i*8,18,2);}}
  else {c.fillStyle='#c0bfca';c.beginPath();c.moveTo(e.x-21,e.y-28);c.lineTo(e.x-12,e.y-46);c.lineTo(e.x,e.y-35);c.lineTo(e.x+12,e.y-46);c.lineTo(e.x+21,e.y-28);c.fill();}
  if(e.phase==='rest'||e.stun>0){c.strokeStyle='#e8d28b';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,35,0,Math.PI*2);c.stroke();}
 }
 c.fillStyle='#253041';c.fillRect(e.x-r*.45,e.y-r*.4,4,boss?6:4);c.fillRect(e.x+r*.25,e.y-r*.4,4,boss?6:4);
 if(e.type==='guard'&&e.phase!=='rest'){rounded(c,e.x-9+e.facing.x*16,e.y+e.facing.y*16,18,22,5,'#d8d7c6');}
 if(e.stun>0)star(c,e.x,e.y-r-10,5,gold);
 if(e.hp<e.maxHp){rounded(c,e.x-r,e.y+r+7,r*2,3,1,'#1a2335');rounded(c,e.x-r,e.y+r+7,r*2*Math.max(0,e.hp/e.maxHp),3,1,'#e7a391');}
}
export function drawWorld(c:CanvasRenderingContext2D,w:World,reduced=false){
 const r=regions[w.room.region-1],night=w.realm===0,day=Boolean(w.p.ending),t=reduced?0:w.time;
 const viewW=c.canvas.width,viewH=c.canvas.height;
 const cameraX=Math.max(0,Math.min(W-viewW,w.hero.x-viewW/2)),cameraY=Math.max(0,Math.min(H-viewH,w.hero.y-viewH/2));
 c.clearRect(0,0,viewW,viewH);c.save();c.translate(-cameraX,-cameraY);c.fillStyle=day?['#6c815d','#91806b','#64818a','#b08d77','#79728e','#7b8a9f'][Math.max(0,w.room.region-1)]:night?r?.ground??'#284843':'#414567';c.fillRect(0,0,W,H);
 // Quiet tile texture and a central worn footpath.
 for(let y=32;y<H-32;y+=32)for(let x=32;x<W-32;x+=32){const hash=(x*17+y*31+w.room.index*37)%97;c.fillStyle=hash%3?'#ffffff04':'#00000009';c.fillRect(x+1,y+1,30,30);if(hash%5===0){c.fillStyle=night?'#acbf9555':'#bcc0ec55';c.fillRect(x+hash%17,y+hash%19,3,2);}}
 c.fillStyle=night?'#dfc89d13':'#ccc7f016';c.fillRect(40,203,560,42);c.fillRect(300,40,40,368);
 const boundary=day?'#465f59':r?.wall??'#18352f';c.fillStyle=boundary;c.fillRect(0,0,W,32);c.fillRect(0,H-32,W,32);c.fillRect(0,0,32,H);c.fillRect(W-32,0,32,H);
 for(let x=16;x<W;x+=48){if(x>275&&x<365)continue;if(w.room.region===1||w.room.region===0){tree(c,x,45,.8,day?'#487956':'#1e4037');tree(c,x,H-8,.8,day?'#54805b':'#203e35');}else{rounded(c,x,3,34,28,5,'#ffffff0b');rounded(c,x,H-28,34,28,5,'#ffffff09');}}
 for(const ex of w.room.exits){const next=roomById.get(ex.to)!;const open=next.kind!=='boss'||[6,7,11].every(i=>w.p.cleared.includes(`${next.region}:${i}`));
  const x=ex.direction==='w'?8:ex.direction==='e'?W-32:288,y=ex.direction==='n'?8:ex.direction==='s'?H-32:192;
  rounded(c,x,y,ex.direction==='e'||ex.direction==='w'?24:64,ex.direction==='e'||ex.direction==='w'?64:24,5,open?'#bca780':'#6a5260');
  text(c,ex.direction==='n'?'↑':ex.direction==='s'?'↓':ex.direction==='e'?'→':'←',x+(ex.direction==='e'||ex.direction==='w'?12:32),y+(ex.direction==='e'||ex.direction==='w'?38:18),18,open?'#253d39':'#ead5c1');
 }
 for(const o of w.obstacles){
  if(o.kind==='water'&&!(w.room.kind==='rift'&&!night)){rounded(c,o.x,o.y,o.w,o.h,8,r?.water??'#315b65');c.strokeStyle='#a4c6d333';c.lineWidth=2;for(let y=o.y+9;y<o.y+o.h;y+=14){c.beginPath();c.moveTo(o.x+8,y);c.quadraticCurveTo(o.x+o.w/2,y+Math.sin(t*2+y)*4,o.x+o.w-8,y);c.stroke();}}
  else if(o.kind==='dream'&&night){rounded(c,o.x,o.y,o.w,o.h,5,'#647994');c.strokeStyle='#c5c5eb';c.strokeRect(o.x+4,o.y+4,o.w-8,o.h-8);}
  else if(o.kind==='dream'||o.kind==='water'){c.strokeStyle='#a2d3d766';c.setLineDash([4,6]);c.strokeRect(o.x+2,o.y+2,o.w-4,o.h-4);c.setLineDash([]);}
  else if(o.kind==='thorn'){for(let x=o.x+8;x<o.x+o.w;x+=16)for(let y=o.y+8;y<o.y+o.h;y+=16)star(c,x,y,12,'#b0a681');}
  else {ellipse(c,o.x+o.w/2,o.y+o.h,o.w/2,8,'#0003');rounded(c,o.x,o.y,o.w,o.h,7,boundary);rounded(c,o.x+3,o.y,o.w-6,o.h-8,6,'#ffffff0c');if(w.room.region===1)for(let x=o.x+16;x<o.x+o.w;x+=32)tree(c,x,o.y+o.h-5,.75,'#3c6552');}
 }
 for(const a of [{x:112,y:80},{x:528,y:80},{x:112,y:368},{x:528,y:368}]){if(w.p.tools.includes('hook')){ellipse(c,a.x,a.y,8,5,'#243336');c.strokeStyle=gold;c.lineWidth=2;c.beginPath();c.arc(a.x,a.y-7,6,0,Math.PI*2);c.stroke();}else lantern(c,a.x,a.y,t);}
 const done=w.p.cleared.includes(w.room.id);
 switch(w.room.kind){
  case 'camp':npc(c,320,215,w.room.region,t);for(const side of [-1,1]){rounded(c,320+side*85-30,138,60,56,6,'#6e7161');c.fillStyle=side===1?'#c89979':'#889f8c';c.beginPath();c.moveTo(320+side*85-42,143);c.lineTo(320+side*85,102);c.lineTo(320+side*85+42,143);c.fill();}text(c,w.room.region?r?.keeper??'':'Pipp & die Nachtpost',320,263,12,gold);break;
  case 'tool':rounded(c,300,207,40,30,5,done?'#69594e':'#b9874f');rounded(c,298,199,44,16,5,done?'#85705b':'#dfba76');star(c,320,222,6,'#ffe7a4');if(!done)star(c,320,180+Math.sin(t*2)*4,9,gold);break;
  case 'switches':for(let i=0;i<3;i++){const p=switchPosition(i);rounded(c,p.x-13,p.y-9,26,28,5,'#253d3f');star(c,p.x,p.y-8,12,done||w.switches.includes(i)?gold:'#91b0b9');text(c,['Blatt','Mond','Stern'][i],p.x,p.y+36,11);}rounded(c,299,206,42,32,4,'#899280');text(c,'≡',320,229,20,'#243b36');break;
  case 'memory':case 'circuit':case 'timing':rounded(c,283,203,74,38,6,'#a08069');rounded(c,283,199,74,12,4,'#d7b58b');text(c,w.room.kind==='memory'?'♫':w.room.kind==='circuit'?'⌁':'✉',320,195,26,done?'#a5d0b7':gold);text(c,done?'Prüfung bestanden':'Prüfungspult',320,269,11);break;
  case 'rift':ellipse(c,320,224,44,20,'#aaaade22');star(c,320,212+Math.sin(t*2)*4,night?12:22,done?'#8dc6ac':night?'#697da6':gold);break;
  case 'story':if(w.room.id==='final')npc(c,320,215,6,t);else{rounded(c,300,209,40,30,4,'#bdb49a');text(c,'✉',320,229,24,'#37403e');}break;
 }
 if(w.room.letter&&!w.p.letters.includes(w.room.id)){rounded(c,484,325,24,17,3,'#ead6ac');c.strokeStyle='#9c7863';c.beginPath();c.moveTo(484,325);c.lineTo(496,335);c.lineTo(508,325);c.stroke();star(c,496,311,5,gold);}
 for(const e of [...w.enemies].sort((a,b)=>a.y-b.y))enemy(c,e,t,w.room.region);
 const h=w.hero;ellipse(c,h.x,h.y+13,15,6,'#0005');
 {
  c.globalAlpha=w.invincible>0&&!reduced?.7:1;
  // Mara's large postal cape and tiny satchel form a recognisable silhouette.
  c.fillStyle='#dbb783';c.beginPath();c.moveTo(h.x-9,h.y-7);c.lineTo(h.x-17-w.facing.x*3,h.y+15);c.quadraticCurveTo(h.x,h.y+22,h.x+17,h.y+15);c.lineTo(h.x+9,h.y-7);c.fill();
  rounded(c,h.x-9,h.y-5,18,21,5,'#427e83');ellipse(c,h.x,h.y-13,10,11,'#ebc79e');ellipse(c,h.x-2,h.y-20,11,5,'#4c4250');rounded(c,h.x-11,h.y-26,21,8,3,'#508a8b');rounded(c,h.x+7,h.y+2,10,12,3,'#986f48');
  c.fillStyle='#343844';
  c.fillRect(h.x-4+w.facing.x*3,h.y-15+w.facing.y*2,2,3);c.fillRect(h.x+3+w.facing.x*3,h.y-15+w.facing.y*2,2,3);
 }
 c.globalAlpha=1;
 if(w.attack>0){const a=Math.atan2(w.facing.y,w.facing.x);c.strokeStyle='#fff0bd';c.lineWidth=5;c.beginPath();c.arc(h.x,h.y,46,a-1.05,a+1.05);c.stroke();}
 star(c,h.x-26,h.y-26+Math.sin(t*3)*3,7,gold);
 for(const s of w.shots){ellipse(c,s.x,s.y,s.radius+3,s.radius+3,s.friendly?'#f4d68f33':'#e59ca133');star(c,s.x,s.y,s.radius+2,s.friendly?gold:'#f19da4');}
 for(const p of w.particles){c.globalAlpha=Math.max(0,p.life/.55);c.fillStyle=p.color;c.fillRect(p.x-2,p.y-2,4,4);}c.globalAlpha=1;
 const vignette=c.createRadialGradient(W/2,H/2,130,W/2,H/2,370);vignette.addColorStop(0,'#101b2800');vignette.addColorStop(1,day?'#e8c28a22':'#101b2877');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 if(!reduced)for(let i=0;i<12;i++){const x=(i*137+w.time*3)%W,y=(i*79+Math.sin(w.time+i)*6)%H;ellipse(c,x,y,1,1,'#eed9a977');}
 if(w.realm)text(c,'TRAUMSEITE',cameraX+viewW/2,cameraY+24,11,'#d2d2f5');
 c.restore();
}
