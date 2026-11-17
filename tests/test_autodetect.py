from pathlib import Path
from playwright.sync_api import sync_playwright
from test_real_browser import BASE,boot
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 page=b.new_page(viewport={'width':390,'height':844})
 errors=boot(page)
 # default Instagram selection, user uploads a Spotify export
 page.locator('#fileInput').set_input_files(str(BASE/'tests'/'fixture-spotify.zip'))
 page.wait_for_function('document.querySelector("#recapopOverlay").classList.contains("hidden")===false || document.querySelector("#errorBox").classList.contains("hidden")===false',timeout=12000)
 assert not page.locator('#recapopOverlay').evaluate('(e)=>e.classList.contains("hidden")'),page.locator('#errorBox').inner_text()
 assert page.evaluate('window.REEECAP_VIDEO_SNAPSHOT().platform')=='spotify'
 assert page.locator('button[data-platform="spotify"]').get_attribute('aria-pressed')=='true'
 print('auto-detected Spotify correctly')
 assert not errors, errors
 b.close()
