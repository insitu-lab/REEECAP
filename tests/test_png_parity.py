"""Local-image export must use exactly the same renderer as the movie preview."""
import importlib.util
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
spec=importlib.util.spec_from_file_location('br',str(Path(__file__).parent/'test_real_browser.py'))
br=importlib.util.module_from_spec(spec);spec.loader.exec_module(br)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(accept_downloads=True,viewport={'width':390,'height':844});errors=br.boot(page)
 page.locator('#demoHero').click()
 page.locator('#nextStory').click()
 with page.expect_download(timeout=15000) as d:page.locator('#downloadCard').click()
 output='/mnt/data/reeecap-2.1-card-parity.png';d.value.save_as(output)
 img=Image.open(output)
 assert img.size==(1080,1920),img.size
 assert img.mode in ('RGB','RGBA')
 assert page.evaluate('typeof window.REEECAP_DRAW_STORY_FRAME')=='function'
 assert not errors,errors
 print('Image/video unified renderer, 1080x1920 PNG:',Path(output).stat().st_size,'bytes',img.size)
 b.close()
