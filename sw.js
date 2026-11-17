/* REEECAP PWA — only same-origin public app files are cached.
   Social-data ZIPs are never sent to the worker or stored. */
const VERSION='reeecap-shell-v6.3';
const STATIC=[
 './','./index.html','./manifest.webmanifest',
 './style.css','./atelier.css','./edition-02.css','./edition-03.css','./edition-04.css','./edition-05.css','./experience.css','./edition-06.css','./edition-07.css','./edition-08.css','./edition-09.css','./edition-10.css','./edition-11.css','./edition-12.css',
 './app.js','./atelier.js','./video.js','./motion.js','./intro-6.2.js','./intro-6.2.css','./config.js','./experience.js','./locale-full.js','./tutorial5.js','./music5.js','./edition-03.js','./worker.js',
 './assets/media/music/reeecap-instagram.mp3','./assets/media/music/reeecap-tiktok.mp3','./assets/reeecap-logo-3.png','./assets/reeecap-logo-darktext.png','./assets/insitu-lab.png','./assets/reeecap-hero.webp',
 './assets/brands/instagram.svg','./assets/brands/tiktok.svg','./assets/brands/youtube.svg','./assets/brands/spotify.svg','./assets/brands/facebook.svg','./assets/brands/reddit.svg'
];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 await Promise.allSettled(STATIC.map(path=>cache.add(new Request(path,{cache:'reload'}))));
 await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(k=>k.startsWith('reeecap-')&&k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim();})());});
function sameOrigin(url){return url.origin===self.location.origin;}
async function rangeFromResponse(response,range){
 const bytes=await response.arrayBuffer(),total=bytes.byteLength;
 const found=/bytes=(\d+)-(\d*)/.exec(range||'');if(!found)return response;
 const start=Number(found[1]);const end=found[2]?Math.min(total-1,Number(found[2])):total-1;
 if(!Number.isFinite(start)||start>=total||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
 return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'video/mp4','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${total}`,'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(!sameOrigin(url))return;
 const pathname=url.pathname;
 // Never cache responses to user/private endpoints, uploads, auth or checkout.
 if(/\/(?:api|checkout|auth|upload|user-data)\//i.test(pathname))return;
 const isVideo=/\/assets\/videos\/reel_\d+\.mp4$/i.test(pathname);
 if(event.request.headers.has('range')&&!isVideo)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  let response=await cache.match(event.request.url,{ignoreSearch:true});
  if(!response){
   try{response=await fetch(new Request(event.request.url,{mode:'same-origin'}));
    if(response.ok&&response.status===200){cache.put(event.request.url,response.clone()).catch(()=>{});}
   }catch{response=await cache.match('./index.html');}
  }
  if(!response)return new Response('Offline e arquivo não armazenado.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  if(isVideo&&event.request.headers.has('range')&&response.ok){return rangeFromResponse(response,event.request.headers.get('range'));}
  return response;
 })());
});
