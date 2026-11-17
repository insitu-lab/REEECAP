"""UI smoke test on representative narrow, mobile, tablet and desktop widths."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
from test_real_browser import boot
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [320,360,390,412,768,1024,1280,1920]:
  page=b.new_page(viewport={'width':width,'height':max(640,int(width*.7))})
  errors=boot(page)
  scroll=page.evaluate('Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)')
  print('Core viewport',width,'scrollWidth',scroll,'errors',errors)
  if scroll>width:
   overs=page.evaluate('''w=>Array.from(document.querySelectorAll('*')).filter(e=>{let b=e.getBoundingClientRect();return b.width>0&&(b.right>w+2||b.left < -2)&&getComputedStyle(e).position!=='absolute'&&getComputedStyle(e).position!=='fixed'}).map(e=>[e.tagName,e.id,e.className?.baseVal||e.className,e.getBoundingClientRect().right]).slice(0,10)''',width)
   print('Overflow nodes',overs)
  assert scroll<=width+1,f'Core overflow at {width}: {scroll}'
  page.locator('#reeecapLanguage').select_option('en');page.locator('#reeecapTheme').click();
  page.locator('#demoHero').click();page.locator('#nextStory').click();page.wait_for_timeout(100)
  assert page.locator('.story-content.kind-number').count(),(width,errors)
  assert not errors,errors
  page.close()
 b.close()
