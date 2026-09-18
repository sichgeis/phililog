export function createAdventureAudio(){
 let context:AudioContext|null=null,timer:ReturnType<typeof setInterval>|null=null,beat=0,region=0,enabled=false;
 const scales=[[0,3,7,10,12,7,5,3],[0,4,7,11,12,7,4,2],[0,2,5,7,10,7,5,2],[0,3,5,8,12,8,7,3],[0,4,7,9,12,9,7,4],[0,2,7,9,14,9,7,2],[0,4,7,12,16,12,7,4]];
 function tone(frequency:number,duration:number,gain=.025,type:OscillatorType='sine'){
  if(!context||context.state!=='running'||!enabled)return;
  const oscillator=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
  oscillator.type=type;oscillator.frequency.value=frequency;volume.gain.setValueAtTime(0,now);volume.gain.linearRampToValueAtTime(gain,now+.015);volume.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(volume);volume.connect(context.destination);oscillator.start(now);oscillator.stop(now+duration+.05);
 }
 function pause(){if(timer)clearInterval(timer);timer=null;void context?.suspend().catch(()=>{});}
 async function start(on:boolean,nextRegion:number){enabled=on;region=nextRegion;if(!enabled){pause();return;}try{context??=new AudioContext();await context.resume();if(timer)return;timer=setInterval(()=>{const scale=scales[region%scales.length],note=scale[beat%scale.length];tone(220*2**(note/12),.65,.018,'triangle');if(beat%4===0)tone(110*2**(scale[Math.floor(beat/4)%4]/12),1.5,.025);beat++;},380);}catch{enabled=false;}}
 return {start,pause,region:(n:number)=>{region=n;},effect:(kind:string)=>{const notes:Record<string,number[]>={swing:[180],hit:[320,220],hurt:[130,90],roll:[240],magic:[523,784],bell:[660,990],success:[392,494,587]};for(const [i,n] of (notes[kind]??[440]).entries())tone(n,.12+i*.09,.035,'triangle');},dispose(){pause();void context?.close().catch(()=>{});context=null;}};
}
