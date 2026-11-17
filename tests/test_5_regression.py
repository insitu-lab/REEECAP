from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import inline_html,WORKER
BASE=Path(__file__).resolve().parent.parent
SCRIPTS=['edition-03.js','config.js','motion.js','app.js','atelier.js','video.js','experience.js','locale-full.js','tutorial5.js','music5.js']
def boot(page):
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(inline_html(),wait_until='load')
 page.evaluate("""source=>{const N=window.Worker;const u=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));window.Worker=class{constructor(){this.w=new N(u);this.w.onmessage=e=>this.onmessage?.(e);this.w.onerror=e=>this.onerror?.(e);}postMessage(x){this.w.postMessage(x)}terminate(){this.w.terminate()}};}""",WORKER)
 for f in SCRIPTS:page.add_script_tag(content=(BASE/f).read_text())
 return errors
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for platform in ['instagram','tiktok','youtube','reddit','spotify','facebook']:
  page=b.new_page(viewport={'width':390,'height':844},accept_downloads=True)
  errs=boot(page)
  page.locator(f'.platform-card[data-platform="{platform}"]').click()
  assert page.locator('#reeecapTutorial').evaluate('(e)=>e.open')
  for _ in range(3):page.locator('#tutorialNext').click()
  page.locator('#fileInput').set_input_files(str(BASE/'tests'/f'fixture-{platform}.zip'))
  page.wait_for_function('!document.querySelector("#recapopOverlay").classList.contains("hidden") || !document.querySelector("#errorBox").classList.contains("hidden")',timeout=17000)
  err=page.locator('#errorBox').inner_text() if not page.locator('#errorBox').evaluate('(e)=>e.classList.contains("hidden")') else ''
  assert not err,f'{platform} {err}'
  snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
  assert len(snap['stories'])>=3
  if platform=='instagram':
   page.locator('#openDashboard').click()
   page.locator('#commentsSearch').fill('coração')
   assert 'coração' in page.locator('#commentsList').inner_text()
  print('IMPORT_OK',platform,'stories=',len(snap['stories']),'errors=',errs)
  assert not errs
  page.close()
 page=b.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 errs=boot(page)
 page.locator('#demoHero').click();page.locator('#downloadVideo').click()
 assert page.locator('#videoComposer').evaluate('(e)=>e.open')
 assert page.locator('#reeecapPreviewSoundtrack').is_visible()
 assert len(page.locator('input[name="reeecapSoundtrack"]').all())==3
 page.locator('#videoNone').click();page.locator('#videoStorySelect input').last.check()
 page.locator('#videoAudio').uncheck()
 with page.expect_download(timeout=40000) as dl:page.locator('#videoStart').click()
 d=dl.value;d.save_as('/mnt/data/reeecap-5-video-test.'+d.suggested_filename.split('.')[-1])
 print('VIDEO_OK',d.suggested_filename,'errors',errs)
 assert not errs
 b.close()
