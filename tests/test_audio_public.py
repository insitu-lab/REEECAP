"""End-to-end audio recording: assert an audible audio track exists, not just checked UI."""
from pathlib import Path
import base64,subprocess
from playwright.sync_api import sync_playwright
from test_real_browser import BASE,boot
sound=BASE/'assets/reeecap-original-loop.mp3'
assert sound.is_file(),sound
mp3='data:audio/mpeg;base64,'+base64.b64encode(sound.read_bytes()).decode()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
 page=b.new_page(accept_downloads=True)
 errors=boot(page)
 page.evaluate('''s=>{const original=window.Audio;window.Audio=function(src){return new original(src?.includes('reeecap-original-loop.mp3')?s:src);}}''',mp3)
 page.locator('#demoHero').click();page.locator('#downloadVideo').click();
 page.locator('#videoNone').click();page.locator('#videoStorySelect input').first.check()
 page.locator('#videoAudio').check()
 page.locator('#videoQuality').select_option('720');page.locator('#videoSpeed').select_option('2400')
 with page.expect_download(timeout=30000) as dl:page.locator('#videoStart').click()
 name=dl.value.suggested_filename;out=Path('/mnt/data/reeecap-public-audio.'+name.rsplit('.',1)[-1]);dl.value.save_as(str(out))
 meta=subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,codec_type,width,height','-of','compact',str(out)],text=True)
 print('PUBLIC AUDIO VIDEO',name,out.stat().st_size,meta)
 assert 'codec_type=audio' in meta,meta
 assert 'codec_type=video' in meta,meta
 assert not errors,errors
 page.close();b.close()
