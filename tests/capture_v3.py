from playwright.sync_api import sync_playwright
from test_real_browser import BASE,boot
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for name,width,height in [('home-desktop',1440,980),('home-mobile',390,844)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=boot(page)
  page.wait_for_timeout(150)
  page.screenshot(path=str(BASE/'docs/media'/f'v3-{name}.png'),full_page=False)
  assert not errors,errors
  page.close()
 b.close()
print('screenshots ready')
