from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import boot
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for viewport in [{'width':390,'height':844},{'width':1280,'height':850}]:
  page=b.new_page(viewport=viewport);err=boot(page)
  page.locator('#demoHero').click();page.wait_for_timeout(260)
  for n in range(6):
   page.locator('#pauseStory').click() if n==0 else None
   if n:page.locator('#nextStory').click()
   classes=page.locator('#storyVisual .story-atmosphere').count()
   print('viewport',viewport,'story',n,'title',page.locator('.story-headline').inner_text(),'art',classes,'errors',err)
   if classes:
    page.wait_for_timeout(760)
    suffix='mobile' if viewport['width']<600 else 'desktop'
    page.locator('#storyVisual').screenshot(path=f'/mnt/data/reeecap-atmosphere-{suffix}.png')
    assert classes==1
    break
  assert not err
  page.close()
 b.close()
