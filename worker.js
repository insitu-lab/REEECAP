/* REEECAP — leitor local. Nenhum dado é enviado à rede. */
'use strict';
importScripts('./vendor/pako_inflate.min.js');
const decoder = new TextDecoder('utf-8');
const banned = /(?:^|[\/ _-])(messages?|chats?|direct.messages?|inbox|contacts?|passwords?|security|payment|payments|purchases?|credit.card|cookies?|addresses|locations?|autofill|login_history|device_information)(?:[\/ _.-]|$)/i;
const norm = x => String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
function dateValue(v){
 if(v == null || v === '')return null;
 if(typeof v==='number'){let n=v<1e11?v*1000:v; return Number.isFinite(n)&&n>0 ? new Date(n) : null;}
 if(typeof v==='string'){
  let x=v.trim(); if(/^\d{10,13}$/.test(x))return dateValue(Number(x));
  if(/^\d{4}-\d\d-\d\d \d\d:\d\d/.test(x)) x=x.replace(' ','T')+(x.includes('Z')||/[+-]\d\d:?\d\d$/.test(x)?'':'Z');
  const d=new Date(x);return Number.isFinite(d.getTime())?d:null;
 } return null;
}
function timeFromRecord(r){
 for(const key of ['timestamp','creation_timestamp','taken_at','date','Date','time','Time','ts','endTime','end_time','created_at','creation_time','creation_date']){
  if(r[key]!=null){const d=dateValue(r[key]);if(d)return d.toISOString();}
 }
 for(const d of (r.string_list_data || [])){if(d.timestamp!=null){const x=dateValue(d.timestamp);if(x)return x.toISOString();}}
 for(const v of Object.values(r.string_map_data||{})){const x=dateValue(v?.timestamp);if(x)return x.toISOString();}
 for(const v of Object.values(r.media_metadata||{})){const x=dateValue(v?.timestamp);if(x)return x.toISOString();}
 return null;
}
function zipEntries(file){
 return file.slice(Math.max(0,file.size-66000)).arrayBuffer().then(async tail=>{
   const b=new DataView(tail);let idx=-1;
   for(let i=b.byteLength-22;i>=0;i--){if(b.getUint32(i,true)===0x06054b50){idx=i;break;}}
   if(idx<0)throw Error('Não foi possível ler a estrutura do ZIP. Verifique se está completo.');
   const count=b.getUint16(idx+10,true),size=b.getUint32(idx+12,true),offset=b.getUint32(idx+16,true);
   if(count===65535||offset===4294967295)throw Error('ZIP64 ainda não é suportado. Exporte em partes menores.');
   if(size>96*1024*1024)throw Error('Índice do ZIP grande demais para leitura segura.');
   const central=new DataView(await file.slice(offset,offset+size).arrayBuffer());const list=[];let pos=0;
   for(let i=0;i<count;i++){
    if(pos+46>central.byteLength||central.getUint32(pos,true)!==0x02014b50)throw Error('Índice ZIP inválido.');
    const method=central.getUint16(pos+10,true),compressed=central.getUint32(pos+20,true),uncompressed=central.getUint32(pos+24,true);
    const nameLen=central.getUint16(pos+28,true),extra=central.getUint16(pos+30,true),comment=central.getUint16(pos+32,true),local=central.getUint32(pos+42,true);
    const name=decoder.decode(new Uint8Array(central.buffer,pos+46,nameLen));
    list.push({name,method,compressed,uncompressed,local});pos+=46+nameLen+extra+comment;
   }
   return list;
 });
}
async function zipText(file,e){
 if(e.uncompressed>260*1024*1024||e.compressed>260*1024*1024)throw Error('JSON individual excede o limite de 260 MB; exporte somente atividades.');
 const header=new DataView(await file.slice(e.local,e.local+30).arrayBuffer());
 if(header.getUint32(0,true)!==0x04034b50)throw Error('Entrada ZIP inválida.');
 const start=e.local+30+header.getUint16(26,true)+header.getUint16(28,true);
 const data=new Uint8Array(await file.slice(start,start+e.compressed).arrayBuffer());
 if(e.method===0)return decoder.decode(data);
 if(e.method===8)return decoder.decode(self.pako.inflateRaw(data));
 throw Error('Formato de compressão ZIP não suportado.');
}
function igCategory(path,root){
 const k=norm(path+'_'+Object.keys(root||{}).slice(0,4).join('_'));
 if(/liked_posts|liked_comments|likes_media_likes|likes_comment_likes|likes_post_likes/.test(k))return 'likes';
 if(/saved_posts|saved_reels|saved_saved_media|saved_saved_reels|saved_saved_posts/.test(k))return 'saved';
 if(/post_comments|comments_media_comments|reel_comments/.test(k))return 'comments';
 if(/story_reactions|stories_liked|story_likes|story_interactions/.test(k))return 'stories';
 if(/followers_1|followers_json|relationships_followers/.test(k))return 'followers';
 if(/following_json|relationships_following/.test(k))return 'following';
 if(/videos_watched|watch_history|reels_watched/.test(k))return 'watched';
 if(/shared_posts|share_history|reposts|shares\.json/.test(k))return 'shares';
 if(/recent_searches|searches\/|search_history/.test(k))return 'searches';
 if(/(?:^|_)posts_\d|(?:\/|_)posts\.json|ig_posts/.test(k))return 'posts';
 if(/(?:^|_)reels_\d|(?:\/|_)reels\.json|ig_reels/.test(k))return 'reels';
 if(/(?:^|_)stories_\d|(?:\/|_)stories\.json|ig_stories/.test(k))return 'posts';
 return null;
}
function findIGRecords(root,category){
 if(Array.isArray(root))return root;
 if(!root||typeof root!=='object')return [];
 let arr=[];
 for(const [k,v] of Object.entries(root)){
  if(!Array.isArray(v))continue;
  if(/string_list_data|media_metadata/.test(k))continue;
  if(v.length && typeof v[0]==='object')arr.push(...v);
 }
 return arr;
}
const kinds=['watched','likes','saved','shares','comments','posts','reels','following','followers','searches','stories','listens'];
let events=[], seen=new Set(), skipped=0, parseErrors=0, scanned=0, dedup=new Set(), account=new Map();
function add(type, date, label='', duration=0, meta=''){
 if(!kinds.includes(type))return;
 const valid=date?dateValue(date):null;
 const stamp=valid?valid.toISOString():null;
 const ev={type,time:stamp,duration:Number(duration)||0,label:typeof label==='string'?label.slice(0,120):'',meta:typeof meta==='string'?meta.slice(0,120):''};
 const key=[type,stamp,ev.label,ev.meta,ev.duration].join('|');
 if(dedup.has(key))return;dedup.add(key);events.push(ev);seen.add(type);
}
function parseInstagram(name,root){
 const category=igCategory(name,root);if(!category)return;
 seen.add(category);
 for(const r of findIGRecords(root,category)){
  if(!r||typeof r!=='object')continue;
  const label=r.title||r.username||r.name||'';
  add(category,timeFromRecord(r),label);
 }
}
function tiktokCat(path){
 const p=norm(path);
 if(/video_browsing_history|watch_history|watchhistory/.test(p))return 'watched';
 if(/like_list|likes_list|liked_videos/.test(p))return 'likes';
 if(/favourite_videos|favorite_videos|favorites_list|favorite_list/.test(p))return 'saved';
 if(/share_history|sharing_history/.test(p))return 'shares';
 if(/comment_history|comment_list/.test(p))return 'comments';
 if(/search_history|searches/.test(p))return 'searches';
 if(/following_list/.test(p))return 'following';
 if(/follower_list/.test(p))return 'followers';
 if(/posts_list|my_posts/.test(p))return 'posts';
 return null;
}
function parseTikTok(name,root){
 function walk(v,path,depth){
  if(depth>9||v==null||typeof v!=='object')return;
  if(Array.isArray(v)){
   const kind=tiktokCat(path);if(kind){seen.add(kind);for(const r of v){if(r&&typeof r==='object')add(kind,timeFromRecord(r),r.Title||r.Link||r['Video Link']||r.Username||r['Post title']||'');}return;}
   for(const sub of v.slice(0,250000)) if(sub&&typeof sub==='object'&&!Array.isArray(sub))walk(sub,path,depth+1);
  } else {
   for(const [key,val] of Object.entries(v)){
    if(banned.test(key))continue;
    const p=path+'/'+key;
    if(Array.isArray(val)&&tiktokCat(p)){
     const kind=tiktokCat(p);seen.add(kind);for(const r of val){if(r&&typeof r==='object')add(kind,timeFromRecord(r),r.Title||r.Link||r['Video Link']||r.Username||'');}
    }else if(typeof val==='object')walk(val,p,depth+1);
   }
  }
 }
 walk(root,name,0);
}
function parseSpotify(name,root){
 if(!Array.isArray(root)||!/(streaming|endsong|history)/i.test(name))return;
 if(!root.length)return;
 if(!root[0]||!('ms_played' in root[0])&&!('msPlayed' in root[0]))return;
 seen.add('listens');
 for(const r of root){const dur=r.ms_played??r.msPlayed??0;const label=r.master_metadata_track_name||r.trackName||r.episode_name||r.episodeName||'';
  const artist=r.master_metadata_album_artist_name||r.artistName||r.episode_show_name||r.podcastName||'';
  if(dur>0)add('listens',r.ts||r.endTime,label,dur,artist);
 }
}
function parseYouTube(name,root){
 if(!Array.isArray(root))return;
 const path=norm(name);
 if(/watch_history|watch_history_json/.test(path)){
  seen.add('watched');for(const r of root){if(r&&typeof r==='object'&&!(r.title||'').toLowerCase().startsWith('searched')) add('watched',r.time||r.date,r.title||'');}
 }else if(/search_history/.test(path)){
  seen.add('searches');for(const r of root){if(r&&typeof r==='object')add('searches',r.time||r.date,'');}
 }
}
function supportedFile(platform,name){
 const x=name.toLowerCase();
 if(!x.endsWith('.json')||banned.test(x))return false;
 if(platform==='instagram')return /likes|liked|saved|comments|story_interactions|stories_liked|following|followers|posts|reels|stories|video|search|share|repost/.test(x);
 if(platform==='tiktok')return true;
 if(platform==='spotify')return /streaming|endsong/i.test(x);
 if(platform==='youtube')return /watch.history|search.history/.test(x);
 return false;
}
function consume(platform,name,content){
 let obj;try{obj=JSON.parse(content.replace(/^\uFEFF/,''));}catch(err){parseErrors++;return;}
 if(platform==='instagram')parseInstagram(name,obj);
 if(platform==='tiktok')parseTikTok(name,obj);
 if(platform==='spotify')parseSpotify(name,obj);
 if(platform==='youtube')parseYouTube(name,obj);
 scanned++;
}
self.onmessage=async e=>{
 if(e.data?.action!=='analyze')return;
 ({events,seen,skipped,parseErrors,scanned,dedup,account}={events:[],seen:new Set(),skipped:0,parseErrors:0,scanned:0,dedup:new Set(),account:new Map()});
 const {files,platform}=e.data;
 try{
  const jobs=[];
  for(const file of files){
   if(/\.zip$/i.test(file.name)){
    const entries=await zipEntries(file);
    const eligible=entries.filter(x=>supportedFile(platform,x.name));
    for(const entry of eligible)jobs.push({file,entry,name:entry.name});
    skipped+=entries.length-eligible.length;
   } else if(supportedFile(platform,file.name))jobs.push({file,name:file.name});else skipped++;
  }
  // In Spotify, extended history is preferable to simpler account history (avoid double counting).
  const hasExtended=platform==='spotify'&&jobs.some(j=>/endsong|streaming_history_audio|streaming_history_video/i.test(j.name));
  const filtered=hasExtended?jobs.filter(j=>!/(?:^|\/)StreamingHistory\d*\.json|StreamingHistory_(?:music|podcast)/i.test(j.name)):jobs;
  for(let i=0;i<filtered.length;i++){
   const job=filtered[i];self.postMessage({kind:'progress',current:i,total:filtered.length,name:job.name});
   try{const content=job.entry?await zipText(job.file,job.entry):await job.file.text();consume(platform,job.name,content);}
   catch(err){parseErrors++;self.postMessage({kind:'warning',message:'Não foi possível ler '+job.name.split('/').pop()+': '+err.message});}
  }
  if(!filtered.length)throw Error('Não encontrei arquivos JSON de atividades para essa plataforma. Confira a rede selecionada e o formato da exportação.');
  if(!events.length)throw Error('Não encontrei registros compatíveis. É possível que a exportação use um formato diferente ou não tenha essas atividades.');
  self.postMessage({kind:'result',data:{events,seen:[...seen],scanned,skipped,parseErrors,platform}});
 }catch(err){self.postMessage({kind:'error',message:err.message});}
};
