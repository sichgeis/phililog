import type { SupabaseClient } from '@supabase/supabase-js';
import { mountAdventure } from './adventure/index.ts';
import { mountGame as mountArcade, type GameController } from './arcade.ts';
export type { GameController } from './arcade.ts';
export function mountGame({container,client,account,onExit}:{container:HTMLElement;client:SupabaseClient;account:string;onExit():void}):GameController {
 const adventureRoot=document.createElement('div'),arcadeRoot=document.createElement('div');
 arcadeRoot.hidden=true;container.append(adventureRoot,arcadeRoot);
 let arcade:GameController|null=null,active:'adventure'|'arcade'='adventure';
 const adventure=mountAdventure({container:adventureRoot,client,account,onExit,onArcade(){
  adventure.hide();active='arcade';
  if(!arcade)arcade=mountArcade({container:arcadeRoot,client,account,exitLabel:'← Zur Nachtpost',onExit(){arcade?.hide();active='adventure';adventure.show();}});
  arcade.show();window.scrollTo(0,0);
 }});
 return {show(){container.hidden=false;(active==='adventure'?adventure:arcade)?.show();},pause(){(active==='adventure'?adventure:arcade)?.pause();},hide(){container.hidden=true;(active==='adventure'?adventure:arcade)?.hide();},dispose(){adventure.dispose();arcade?.dispose();container.replaceChildren();}};
}
