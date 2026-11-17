"""Exercise the 400MB ZIP index path using synthetic, intentionally irrelevant media.
This does not validate an actual Instagram export or mobile memory pressure.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED, ZIP_DEFLATED
from playwright.sync_api import sync_playwright
from test_real_browser import BASE, boot

p=BASE/'tests'/'stress-400mb-instagram.zip'
try:
    print('creating synthetic ZIP')
    with ZipFile(p,'w',allowZip64=False) as z:
        block=b'\0'*(4*1024*1024)
        for i in range(100):
            # Store media without compressing, while keeping memory use bounded.
            z.writestr(f'media/archives/dummy_{i:03d}.jpg',block,compress_type=ZIP_STORED)
        z.writestr('your_instagram_activity/likes/liked_posts.json',
                   '{"likes_media_likes":[{"title":"sample","string_list_data":[{"timestamp":1792801200}]}]}',
                   compress_type=ZIP_DEFLATED)
    print('generated',p.stat().st_size)
    assert p.stat().st_size>=400*1024*1024
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=b.new_page(viewport={'width':390,'height':844})
        errors=boot(page)
        page.locator('[data-platform="instagram"]').first.click()
        page.locator('#fileInput').set_input_files(str(p))
        page.wait_for_function('document.querySelector("#recapopOverlay")?.classList.contains("hidden")===false || document.querySelector("#errorBox")?.classList.contains("hidden")===false',timeout=25000)
        err=page.locator('#errorBox').inner_text() if not page.locator('#errorBox').evaluate('(e)=>e.classList.contains("hidden")') else None
        assert err is None,err
        snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
        assert snap['platform']=='instagram' and len(snap['stories'])>=3,snap
        assert not errors,errors
        print('400MB synthetic ZIP analyzed: passed; stories',len(snap['stories']))
        b.close()
finally:
    p.unlink(missing_ok=True)
