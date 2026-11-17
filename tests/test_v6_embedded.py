"""Chromium test: real user-supplied H.264 bytes via Playwright route, no HTTP server."""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from test_real_browser import inline_html,WORKER
from urllib.parse import urlparse
import mimetypes, re
BASE=Path(__file__).resolve().parents[1]
SCRIPTS=['edition-03.js','config.js','motion.js','app.js','atelier.js','video.js','experience.js','locale-full.js','tutorial5.js','music5.js']
assert len(list((BASE/'assets/videos').glob('reel_*.mp4')))==12
HTML=inline_html().replace('<head>','<head><base href="https://reeecap.test/">',1)

def boot(page):
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 def serve(route):
  request=route.request
  rel=urlparse(request.url).path.lstrip('/')
  path=BASE/rel
  if not path.is_file():
   route.fulfill(status=404,body=b'not found',headers={'Access-Control-Allow-Origin':'*'});return
  data=path.read_bytes();headers={'Access-Control-Allow-Origin':'*','Content-Type':mimetypes.guess_type(path.name)[0] or 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'public,max-age=3600'}
  rng=request.headers.get('range','')
  m=re.fullmatch(r'bytes=(\d+)-(\d*)',rng)
  if m:
   start=int(m.group(1));end=min(len(data)-1,int(m.group(2)) if m.group(2) else len(data)-1)
   if start<len(data) and end>=start:
    headers['Content-Range']=f'bytes {start}-{end}/{len(data)}'
    route.fulfill(status=206,body=data[start:end+1],headers=headers);return
  route.fulfill(status=200,body=data,headers=headers)
 page.route('https://reeecap.test/**',serve)
 page.set_content(HTML,wait_until='load')
 page.evaluate("""source=>{const N=window.Worker;const u=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));window.Worker=class{constructor(){this.w=new N(u);this.w.onmessage=e=>this.onmessage?.(e);this.w.onerror=e=>this.onerror?.(e);}postMessage(x){this.w.postMessage(x)}terminate(){this.w.terminate()}};}""",WORKER)
 for f in SCRIPTS:page.add_script_tag(content=(BASE/f).read_text())
 return errors

if __name__=='__main__':
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  for width in (390,1280):
   pg=b.new_page(viewport={'width':width,'height':844},accept_downloads=True)
   errs=boot(pg)
   pg.locator('#demoHero').click()
   pg.wait_for_function('window.REEECAP_VIDEO_SNAPSHOT?.()?.stories?.length>0')
   content=pg.evaluate('''async ()=>{
    const m=window.REEECAP_MOTION;const ready=await m.ensure();
    return {ready,count:m.count,source:m.source,library:m.libraryCount,urls:m.clips.map(v=>v.currentSrc||v.src),dimensions:m.clips.map(v=>[v.videoWidth,v.videoHeight])};
   }''')
   print('VIDEOS',width,content)
   assert content['source']=='embedded' and content['ready']>=2 and content['library']==12,content
   assert all('reeecap.test/assets/videos/reel_' in u for u in content['urls'])
   assert all(s[0]>=500 and s[1]>=900 for s in content['dimensions'] if s[0])
   pg.wait_for_timeout(900)
   snap=pg.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
   likes_i=next((i for i,s in enumerate(snap['stories']) if s.get('metricKey') in ('likes','watched','reels')), 0)
   for _ in range(likes_i):pg.locator('#nextStory').click()
   pg.wait_for_timeout(350)
   rgba=pg.evaluate('''()=>{const c=document.querySelector('#storyMotionCanvas');if(!c)return 0;const d=c.getContext('2d').getImageData(0,0,720,1280).data;let count=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)count++;return count;}''')
   print('ACTUAL_CANVAS_PIXELS',rgba)
   assert rgba>5000
   pg.screenshot(path=f'/mnt/data/reeecap6-integrado-{width}.png')
   assert not errs,errs
   pg.close()
  b.close()
