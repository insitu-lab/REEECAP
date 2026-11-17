"""Browser UI, video encode and import tests with synthetic data; browser sandbox forbids local HTTP."""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import mimetypes, base64, subprocess
BASE=Path(__file__).resolve().parent.parent
SCRIPTS=['edition-03.js','config.js','app.js','atelier.js','video.js','experience.js']
def inline_html():
 soup=BeautifulSoup((BASE/'index.html').read_text(),'html.parser')
 for node in soup.select('meta[http-equiv="Content-Security-Policy"],script'):node.decompose()
 for link in soup.select('link[rel=stylesheet]'):
  path=BASE/link['href'].removeprefix('./')
  if path.exists():style=soup.new_tag('style');style.string=path.read_text();link.replace_with(style)
 for img in soup.select('img[src]'):
  path=BASE/img['src'].removeprefix('./')
  if path.exists():img['src']=f'data:{mimetypes.guess_type(path.name)[0] or "image/png"};base64,{base64.b64encode(path.read_bytes()).decode()}'
 return str(soup)
HTML=inline_html()
WORKER=(BASE/'worker.js').read_text()
MOCK='''source=>{window.Worker=class{
 constructor(path){const target=this;this.terminated=false;
  const sandbox={postMessage(data){if(!target.terminated)setTimeout(()=>target.onmessage?.({data}),0);}};
  this.handler=new Function('self',source+'\\nreturn self.onmessage;')(sandbox);sandbox.pako=window.pako;
 }
 postMessage(data){Promise.resolve().then(()=>this.handler({data})).catch(err=>{console.error('MOCK_WORKER_EXCEPTION',err.stack||err.message);this.onerror?.(err);});}
 terminate(){this.terminated=true;}
};}'''
def boot(page):
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda msg: print('CONSOLE',msg.type,msg.text[:400]) if 'MOCK_WORKER' in msg.text else None)
 page.set_content(HTML,wait_until='load')
 # The browser testing sandbox blocks localhost and file:// navigation: only Worker transport is simulated.
 page.evaluate(MOCK,WORKER)
 for fn in SCRIPTS:page.add_script_tag(content=(BASE/fn).read_text())
 return errors
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':900},accept_downloads=True)
 errors=boot(page)
 page.locator('#demoHero').click();page.locator('#downloadVideo').click()
 assert page.locator('#videoComposer').evaluate('(e)=>e.open')
 assert page.locator('#videoStorySelect label').count()>=6
 page.locator('#videoNone').click();assert page.locator('#videoStart').is_disabled()
 page.locator('#videoAll').click();assert page.locator('#videoStart').is_enabled()
 page.locator('#videoNone').click();page.locator('#videoStorySelect input').first.check()
 page.locator('#videoAudio').uncheck()
 page.locator('#videoComposer').screenshot(path='/mnt/data/reeecap-2.1-video-editor-desktop.png')
 with page.expect_download(timeout=40000) as download_info:page.locator('#videoStart').click()
 download=download_info.value;ext=download.suggested_filename.rsplit('.',1)[-1]
 download.save_as(f'/mnt/data/reeecap-2.1-video-test.{ext}')
 print('recorded',download.suggested_filename,'size',Path(f'/mnt/data/reeecap-2.1-video-test.{ext}').stat().st_size)
 meta=subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height','-of','compact',f'/mnt/data/reeecap-2.1-video-test.{ext}'],text=True).strip()
 print('recorded metadata',meta)
 assert '720' in meta and '1280' in meta
 assert not errors,errors;page.close()
 for platform in ['instagram','tiktok','youtube','reddit']:
  page=browser.new_page(viewport={'width':390,'height':844},accept_downloads=True)
  errors=boot(page)
  page.locator(f'[data-platform="{platform}"]').first.click()
  page.locator('#fileInput').set_input_files(str(BASE/'tests'/f'fixture-{platform}.zip'))
  page.wait_for_function('document.querySelector("#recapopOverlay")?.classList.contains("hidden")===false || document.querySelector("#errorBox")?.classList.contains("hidden")===false',timeout=10000)
  err=page.locator('#errorBox').inner_text() if not page.locator('#errorBox').evaluate('(e)=>e.classList.contains("hidden")') else None
  assert not err,f'{platform}: {err}'
  snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
  print('import success',platform,'slides',len(snap['stories']),'errors',errors)
  assert len(snap['stories'])>=3,(platform,snap)
  assert not errors,(platform,errors)
  if platform=='instagram':
   page.locator('#openDashboard').click()
   page.locator('#commentsSearch').fill('coração')
   assert 'coração' in page.locator('#commentsList').inner_text(), 'Accents not repaired'
   print('Instagram accents OK, search OK')
  page.close()
 page=browser.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 errors=boot(page);page.locator('#demoHero').click();page.locator('#downloadVideo').click()
 page.locator('#videoComposer').screenshot(path='/mnt/data/reeecap-2.1-video-editor-mobile.png')
 print('mobile document width',page.evaluate('document.body.scrollWidth'),'viewport',390,'errors',errors)
 assert page.evaluate('document.body.scrollWidth')<=390
 assert not errors;page.close();browser.close()
