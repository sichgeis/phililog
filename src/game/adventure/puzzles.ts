export function seedNumber(text:string){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function sequence(seed:number,length:number){let n=seed;return Array.from({length},()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return (n>>>16)%4;});}
export const rotate=(mask:number)=>((mask<<1)&15)|(mask>>3);
export interface Circuit {size:number;tiles:number[];target:number[];end:number;exit:number;moves:number}
export function circuit(size:number,seed:number):Circuit {
 const path:number[]=[0],used=new Set([0]);let attempts=0;
 const neighbors=(cell:number)=>[cell-size,cell+1,cell+size,cell-1].filter(n=>n>=0&&n<size*size&&Math.abs(n%size-cell%size)+Math.abs(Math.floor(n/size)-Math.floor(cell/size))===1);
 function build():boolean {
  if(++attempts>30000)return false;
  const cell=path.at(-1)!;
  if(path.length===size*size)return cell%size===0||cell%size===size-1||cell<size||cell>=size*(size-1);
  const choices=neighbors(cell).filter(n=>!used.has(n)).sort((a,b)=>seedNumber(`${a}:${seed}:${cell}:${path.length}`)-seedNumber(`${b}:${seed}:${cell}:${path.length}`));
  for(const next of choices){used.add(next);path.push(next);if(build())return true;path.pop();used.delete(next);}return false;
 }
 if(!build()){path.length=0;for(let y=0;y<size;y++)for(let x=0;x<size;x++)path.push(y*size+(y%2?size-1-x:x));}
 const end=path.at(-1)!;const exit=end%size===0?8:end%size===size-1?2:end<size?1:4;
 const target=Array(size*size).fill(0) as number[];
 function bit(a:number,b:number){return b===a-size?1:b===a+1?2:b===a+size?4:8;}
 path.forEach((cell,i)=>{target[cell]=(i?bit(cell,path[i-1]):8)|(i<path.length-1?bit(cell,path[i+1]):exit);});
 const rotations=sequence(seed,size*size);const tiles=target.map((mask,i)=>{for(let j=0;j<1+rotations[i];j++)mask=rotate(mask);return mask;});
 return {size,tiles,target,end,exit,moves:0};
}
export function connected(c:Circuit){
 const visited=new Set<number>();if(!(c.tiles[0]&8))return visited;
 const queue=[0];while(queue.length){const i=queue.pop()!;if(visited.has(i))continue;visited.add(i);
  for(const [dx,dy,bit,opposite] of [[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]]){
   const x=i%c.size+dx,y=Math.floor(i/c.size)+dy,j=y*c.size+x;
   if(x>=0&&y>=0&&x<c.size&&y<c.size&&(c.tiles[i]&bit)&&(c.tiles[j]&opposite))queue.push(j);
  }
 }return visited;
}
export const circuitSolved=(c:Circuit)=>connected(c).size===c.size*c.size&&Boolean(c.tiles[c.end]&c.exit);
export function circuitHint(c:Circuit){const i=c.tiles.findIndex((t,i)=>t!==c.target[i]);if(i>=0)c.tiles[i]=c.target[i];return i;}
export function timingPosition(seconds:number,index:number){const duration=index%2?1.65:2.15;return Math.min(1,seconds/duration);}

// A small search validates that the visible pieces admit a continuous path.
export function solveCircuit(c:Circuit):number[]|null {
 const result=Array(c.tiles.length).fill(0) as number[],seen=new Set<number>([0]);
 const allowed=c.tiles.map(mask=>{const set=new Set<number>();for(let i=0;i<4;i++){set.add(mask);mask=rotate(mask);}return set;});
 function walk(cell:number,incoming:number):boolean {
  if(seen.size===c.tiles.length){if(cell!==c.end||!allowed[cell].has(incoming|c.exit))return false;result[cell]=incoming|c.exit;return true;}
  if(cell===c.end)return false;
  for(const [dx,dy,bit,opposite]of [[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]]){
   const x=cell%c.size+dx,y=Math.floor(cell/c.size)+dy,next=y*c.size+x;
   if(x<0||y<0||x>=c.size||y>=c.size||seen.has(next)||!allowed[cell].has(incoming|bit))continue;
   seen.add(next);result[cell]=incoming|bit;if(walk(next,opposite))return true;seen.delete(next);
  }return false;
 }
 return walk(0,8)?result:null;
}
