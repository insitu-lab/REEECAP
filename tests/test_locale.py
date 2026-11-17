from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import BASE,boot
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 errors=boot(page)
 print('loaded',page.locator('#reeecapLanguage').input_value())
 for lang in ('en','es','pt'):
  page.locator('#reeecapLanguage').select_option(lang)
  page.wait_for_timeout(240)
  print('LANG',lang,'hero',page.locator('.hero h1').inner_text(),'steps',page.locator('.step-card p').first.inner_text(),'sample',page.locator('.platform-note').inner_text()[:60]);
  assert lang!='en' or 'open' in page.locator('.step-card p').first.inner_text()
  assert lang!='es' or 'abre' in page.locator('.step-card p').first.inner_text()
  for network in ['instagram','tiktok','youtube','reddit']:
   page.eval_on_selector(f'[data-platform="{network}"]', "e => e.click()")
   page.wait_for_timeout(50)
   v=page.locator('#wantedList').inner_text()
   print('  ',network,v[:35])
   if lang=='en' and network=='instagram':assert 'Likes' in v
   if lang=='es' and network=='reddit':assert 'Publicaciones' in v
  page.eval_on_selector('[data-platform="instagram"]', "e => e.click()")
  page.eval_on_selector('#demoInline', 'e => e.click()')
  page.wait_for_timeout(160)
  print('  story',page.locator('.story-headline').inner_text(),page.locator('.story-body').inner_text())
  if lang=='en':assert 'What did' in page.locator('.story-headline').inner_text()
  if lang=='es':assert 'Qué dejó' in page.locator('.story-headline').inner_text()
  page.locator('#openDashboard').click();page.wait_for_timeout(150)
  print('  metric',page.locator('.metric-name').first.inner_text(),'coverage',page.locator('#coverageNote').inner_text()[:85])
  if lang=='en':assert 'dated activities' in page.locator('#coverageNote').inner_text()
  if lang=='es':assert 'actividades con fecha' in page.locator('#coverageNote').inner_text()
  page.locator('#closeDashboard').click()
  assert not errors,errors
 print('pageerrors',errors)
 page.close();b.close()
