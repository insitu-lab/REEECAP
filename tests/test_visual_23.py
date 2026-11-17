"""Creator screenshot regression tests: desktop width, story collision, light theme and import mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import boot,BASE

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [320,360,390,412,768,1024,1280,1440,1920]:
  for light in [False,True]:
   page=browser.new_page(viewport={'width':width,'height':920})
   errors=boot(page)
   if light:page.locator('#reeecapTheme').click()
   page.wait_for_timeout(500)
   actual=page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)')
   assert actual <= width+1,(width,light,actual)
   if width>=1100:
    layout=page.evaluate('''() => {let hero=document.querySelector('.hero').getBoundingClientRect();let card=document.querySelector('.preview-stage').getBoundingClientRect();let first=document.querySelector('#hero-title').firstChild;let range=document.createRange();range.selectNodeContents(first);return {heroWidth:hero.width,cardX:card.x,headlineEnd:range.getBoundingClientRect().right}}''')
    assert layout['heroWidth']>=width*.90,(width,layout)
    assert layout['headlineEnd']<layout['cardX']-15,(width,layout)
   if light:
    assert page.locator('.site-header .brand-logo-light').is_visible()
    assert not page.locator('.site-header .brand-logo:not(.brand-logo-light)').is_visible()
    assert page.locator('.site-header .brand').evaluate('e=>getComputedStyle(e).backgroundColor') in ['rgba(0, 0, 0, 0)','rgb(247, 247, 251)']
   assert not errors,errors
   page.close()
  print('viewport passed',width)

 for width in [320,390,768,1440]:
  for light in [False,True]:
   page=browser.new_page(viewport={'width':width,'height':920})
   errors=boot(page)
   if light:page.locator('#reeecapTheme').click()
   page.locator('[data-platform="instagram"]').first.click()
   page.locator('[data-step="3"]').click();page.wait_for_timeout(600)
   dims=page.evaluate('''() => {let a=document.querySelector('.studio-layout').getBoundingClientRect(), b=document.querySelector('.import-wrap').getBoundingClientRect();return {studio:a.width,importWidth:b.width,back:document.querySelector('.studio-back').getBoundingClientRect().width}}''')
   assert abs(dims['studio']-dims['importWidth'])<=2,(width,light,dims)
   assert page.locator('.studio-back span').is_visible(),(width,light)
   assert page.locator('#selectFiles').is_visible(),(width,light)
   if light:
    e=page.locator('#stepPane3 h3').evaluate('e=>getComputedStyle(e).color')
    assert e in ['rgb(35, 24, 47)','rgb(24, 21, 35)'],e
   page.locator('.studio-back').click()
   assert page.locator('.hero').is_visible(),(width,light)
   page.close()
  print('import passed',width)

 page=browser.new_page(viewport={'width':390,'height':844})
 boot(page)
 page.locator('[data-platform="instagram"]').first.click()
 page.locator('[data-step="3"]').click()
 page.locator('#reeecapLanguage').select_option('en')
 assert 'Ready to import' in page.locator('#stepPane3 h3').inner_text()
 page.locator('#reeecapLanguage').select_option('es')
 assert 'Todo listo' in page.locator('#stepPane3 h3').inner_text()
 page.close()
 browser.close()
print('All creator screenshot regressions passed')
