from test_real_browser import boot,BASE
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1280,'height':900})
 boot(page)
 for lang in ('en','es'):
  page.locator('#reeecapLanguage').select_option(lang)
  page.eval_on_selector('[data-platform="instagram"]', "e=>e.click()");page.wait_for_timeout(250)
  print('\nLANG',lang,'STUDIO:\n',page.locator('#studioView').inner_text()[:6000] if page.locator('#studioView').count() else page.locator('body').inner_text()[:4000])
  page.eval_on_selector('#demoInline','el=>el.click()');page.wait_for_timeout(300)
  print('\nSTORY',page.locator('#storyVisual').inner_text())
  page.locator('#openDashboard').click();page.wait_for_timeout(250)
  print('\nDASH',page.locator('#dashboardOverlay').inner_text()[:6000])
  page.locator('#closeDashboard').click()
 b.close()
