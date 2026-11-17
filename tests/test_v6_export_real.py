"""Chromium real media test via in-memory same-origin Blob H.264 files; no network."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import inline_html,WORKER
import base64,subprocess
BASE=Path(__file__).resolve().parents[1]
SCRIPTS=['edition-03.js','config.js','motion.js','app.js','atelier.js','video.js','experience.js','locale-full.js','tutorial5.js','music5.js']
media={str(i):base64.b64encode((BASE/'assets/videos'/f'reel_{i+1:02}.mp4').read_bytes()).decode() for i in (1,3,11,8)}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 page=b.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(inline_html(),wait_until='load')
 page.evaluate("""source=>{const N=window.Worker;const u=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));window.Worker=class{constructor(){this.w=new N(u);this.w.onmessage=e=>this.onmessage?.(e);this.w.onerror=e=>this.onerror?.(e);}postMessage(x){this.w.postMessage(x)}terminate(){this.w.terminate()}};}""",WORKER)
 page.evaluate("""encoded=>{window.__REEECAP_TEST_URLS={};for(const [k,s] of Object.entries(encoded)){const raw=atob(s);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));window.__REEECAP_TEST_URLS[k]=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));}}""",media)
 for fn in SCRIPTS:
  code=(BASE/fn).read_text()
  if fn=='motion.js':
   old='src:`./assets/videos/reel_${String(i+1).padStart(2,\'0\')}.mp4`'
   new='src:(window.__REEECAP_TEST_URLS?.[i]||`./assets/videos/reel_${String(i+1).padStart(2,\'0\')}.mp4`)'
   assert old in code
   code=code.replace(old,new)
  page.add_script_tag(content=code)
 page.locator('#demoHero').click()
 content=page.evaluate('''async()=>{const m=window.REEECAP_MOTION;return {ready:await m.ensure(),source:m.source,width:m.clips.map(v=>v.videoWidth)};}''')
 print('VIDEO_DECODER',content,flush=True)
 assert content['ready']>=2
 snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
 slide_i=next((i for i,s in enumerate(snap['stories']) if s.get('metricKey') in ('likes','watched','reels')),0)
 page.locator('#downloadVideo').click();page.locator('#videoNone').click();page.locator('#videoStorySelect input').nth(slide_i).check();page.locator('#videoAudio').uncheck()
 page.on('download',lambda d:print('DOWNLOAD',d.suggested_filename,flush=True))
 with page.expect_download(timeout=20000) as dl:page.locator('#videoStart').click()
 d=dl.value;out=Path('/mnt/data/REEECAP-v6-video-real-export.'+d.suggested_filename.rsplit('.',1)[-1]);d.save_as(out)
 print('OUTPUT',out,out.stat().st_size,flush=True)
 print('FFPROBE',subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height','-of','compact',str(out)],text=True),flush=True)
 assert out.stat().st_size>10000, 'No actual encoded frames'
 assert not errs,errs
 b.close()
