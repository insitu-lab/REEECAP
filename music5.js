/* REEECAP music selection: named actual licensed tracks; no user-file required.
 * Local media is installed by build job; remote streaming fallback if absent. */
(()=>{'use strict';
const library={
 instagram:{name:'REEECAP · Instagram',artist:'Trilha original (aguardando arquivo autorizado)',local:'./assets/media/music/reeecap-instagram.mp3',remote:''},
 tiktok:{name:'REEECAP · TikTok',artist:'Trilha original (aguardando arquivo autorizado)',local:'./assets/media/music/reeecap-tiktok.mp3',remote:''},
 cat:{name:'Cat Walk',artist:'Arulo',local:'./assets/media/music/cat-walk.mp3',remote:'https://assets.mixkit.co/music/371/371.mp3'},
 forest:{name:'Rising Forest',artist:'Diego Nava',local:'./assets/media/music/rising-forest.mp3',remote:'https://assets.mixkit.co/music/471/471.mp3'},
 fest:{name:'Techno Fest Vibes',artist:'Alejandro Magaña',local:'./assets/media/music/techno-fest.mp3',remote:'https://assets.mixkit.co/music/124/124.mp3'}
};
let selected='cat';const localGood=new Set();
const src=(key=selected)=>localGood.has(key)?library[key].local:library[key]?.remote||'';
// Check local assets without fetching entire tracks. Same-origin request made once.
(async()=>{for(const [k,s] of Object.entries(library)){try{const r=await fetch(s.local,{method:'HEAD'});if(r.ok&&String(r.headers.get('content-type')||'').includes('audio'))localGood.add(k);}catch{}}})();
function choose(key){if(library[key]){selected=key;const uri=src(key);if(uri)window.REEECAP_SET_BUILTIN_MUSIC?.(uri);}}
function forPlatform(platform){const v=String(platform||'').toLowerCase();return v==='instagram'?'instagram':v==='tiktok'?'tiktok':selected;}
const cues=[0,9,18,27,36,45,54,63,72,81,90,99,108];
function cue(index){return cues[Math.max(0,Math.min(cues.length-1,Number(index)||0))];}
window.REEECAP_MUSIC5={library,src,choose,forPlatform,cue,get selected(){return selected},get installed(){return [...localGood]}};
})();
