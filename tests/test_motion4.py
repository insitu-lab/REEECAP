from playwright.sync_api import sync_playwright
from test_real_browser import boot,BASE
from pathlib import Path
import subprocess
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 for width in (390,1280):
  page=b.new_page(viewport={'width':width,'height':844},accept_downloads=True)
  errs=boot(page)
  page.locator('#demoHero').click()
  page.locator('#pauseStory').click()
  snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
  wanted=['likes','stories','shares','comments']
  found=[]
  for i,s in enumerate(snap['stories']):
   if s['metricKey'] in wanted or s['kind']=='days':
    while page.locator('#storyCounter').get_attribute('aria-live')=='off' and page.evaluate('''i=>{return Number(document.querySelector('#storyCounter').textContent.match(/\d+/)?.[0])}''',0)<i+1:
     page.locator('#nextStory').click()
    page.wait_for_timeout(250)
    kind=s.get('metricKey') or s['kind'];found.append(kind)
    canvas=page.locator('#storyMotionCanvas')
    assert canvas.count()==1,(width,kind)
    assert page.evaluate('document.querySelector("#storyMotionCanvas").getContext("2d").getImageData(0,0,720,1280).data.some(x=>x>0)') or kind=='comments',kind
    page.locator('.recapop-shell').screenshot(path=f'/mnt/data/reeecap-4-{kind}-{width}.png',timeout=15000)
    if kind=='days':
     assert 'is-revealed' not in (page.locator('.kind-days').get_attribute('class') or '')
     page.locator('#calendarPeel').click(timeout=3000)
     for _ in range(4):page.locator('#calendarPeel').click(timeout=3000)
     page.wait_for_timeout(150)
     assert 'is-revealed' in (page.locator('.kind-days').get_attribute('class') or ''),'calendar failed'
  print('visual:',width,found,'errors:',errs)
  assert not errs, errs
  page.close()
 b.close()
