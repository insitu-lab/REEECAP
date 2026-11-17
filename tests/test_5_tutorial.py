from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import inline_html, WORKER
BASE=Path(__file__).resolve().parent.parent
SCRIPTS=['edition-03.js','config.js','motion.js','app.js','atelier.js','video.js','experience.js','locale-full.js','tutorial5.js','music5.js']
def boot(page):
 errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(inline_html(),wait_until='load')
 page.evaluate("""source=>{const NativeWorker=window.Worker;const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));window.Worker=class{constructor(path){this.worker=new NativeWorker(url);this.worker.onmessage=e=>this.onmessage?.(e);this.worker.onerror=e=>this.onerror?.(e);}postMessage(data){return this.worker.postMessage(data)}terminate(){this.worker.terminate()}}}""",WORKER)
 for fn in SCRIPTS:page.add_script_tag(content=(BASE/fn).read_text())
 return errs
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for w in (320,390,768,1440):
  page=b.new_page(viewport={'width':w,'height':850},accept_downloads=True)
  errs=boot(page)
  page.locator('.platform-card[data-platform=instagram]').click()
  assert page.locator('#reeecapTutorial').evaluate('(el)=>el.open'), 'modal did not open'
  assert page.locator('#tutorialVisual').is_visible()
  assert page.locator('#tutorialTitle').inner_text()=='Perfil → ☰'
  if w==390:page.screenshot(path='/mnt/data/reeecap-5-tutorial-mobile.png')
  if w==1440:page.screenshot(path='/mnt/data/reeecap-5-tutorial-desktop.png')
  page.locator('#tutorialNext').click();assert 'Central de Contas' in page.locator('#tutorialTitle').inner_text()
  page.locator('#tutorialNext').click();assert 'JSON' in page.locator('#tutorialTitle').inner_text()
  page.locator('#tutorialNext').click();assert not page.locator('#reeecapTutorial').evaluate('(el)=>el.open')
  assert page.evaluate('window.REEECAP_TUTORIAL.completed')
  assert page.locator('#stepPane2').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth')<=w,('overflow',w,page.evaluate('document.documentElement.scrollWidth'))
  print('TUTORIAL_OK',w,'JSerrors',errs)
  assert not errs,errs
  page.close()
 page=b.new_page(viewport={'width':390,'height':850});errs=boot(page)
 for name in ('tiktok','spotify','facebook','youtube','reddit'):
  page.locator('#studioBack').click() if page.locator('#studioBack').is_visible() else None
  page.locator('.platform-card[data-platform='+name+']').click()
  assert page.locator('#reeecapTutorial').evaluate('(el)=>el.open'),name
  assert len(page.locator('#tutorialProgress span').all())==3
  for x in range(3):page.locator('#tutorialNext').click()
 print('ALL_PLATFORMS_TUTORIAL_OK',errs)
 b.close()
