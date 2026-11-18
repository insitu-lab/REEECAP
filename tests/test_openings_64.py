"""Real HTTP/Worker/MediaRecorder evidence. No mocked browser APIs or imported metrics.

python tests/test_openings_64.py --out D:/Projetos/REEECAP-evidencias-6.4 --baseline
python tests/test_openings_64.py --out D:/Projetos/REEECAP-evidencias-6.4 --export --ui
"""
import argparse
import base64
import functools
import http.server
import json
from pathlib import Path
import subprocess
import threading
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]

class QuietServer(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--baseline', action='store_true')
    parser.add_argument('--export', action='store_true')
    parser.add_argument('--ui', action='store_true')
    parser.add_argument('--verify', action='store_true')
    parser.add_argument('--cpu-slowdown',type=float,default=1)
    parser.add_argument('--real-zip', type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    version = '6.3' if args.baseline else '6.4'
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(BASE)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    report = {'version': version, 'base_commit': subprocess.check_output(['git','rev-parse','HEAD'], cwd=BASE, text=True).strip(), 'runs': []}
    with sync_playwright() as p:
        executable = next((str(x) for x in [Path(p.chromium.executable_path), Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')] if x.exists()), None)
        browser = p.chromium.launch(executable_path=executable, headless=True, args=['--autoplay-policy=no-user-gesture-required'])
        def new_page(width=390):
            page = browser.new_page(viewport={'width':width,'height':844}, accept_downloads=True, service_workers='block')
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            # Offline local product assets only. Never send account data to a third party.
            page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(url) or r.request.url.startswith(('blob:','data:')) else r.abort())
            if args.baseline:
                for name in ('app.js','intro-6.2.js','video.js','intro-6.2.css'):
                    source = subprocess.check_output(['git','show',f'023eca2:{name}'], cwd=BASE)
                    def serve_source(body, name):
                        def respond(route):
                            route.fulfill(body=body, content_type='text/css' if name.endswith('.css') else 'application/javascript')
                        return respond
                    page.route(f'**/{name}', serve_source(source,name))
            page.goto(url, wait_until='networkidle')
            page.wait_for_function('()=>!!window.REEECAP_INTRO && !!window.REEECAP_DRAW_STORY_FRAME')
            page.evaluate('''()=>{
                window.__introTimes=[]; const attach=REEECAP_INTRO.attach;
                REEECAP_INTRO.attach=function(...a){const get=a[2];a[2]=()=>{const t=get();__introTimes.push(t);return t};return attach(...a)};
                document.addEventListener('reeecap:video-metrics',e=>window.__exportMetrics=e.detail);
            }''')
            return page, errors

        if args.ui:
            for width in (320,360,390,430,768,1024,1280,1920):
                page, errors = new_page(width)
                for lang in ('pt','en','es'):
                    page.locator('#reeecapLanguage').select_option(lang)
                    for theme in range(2):
                        page.locator('#reeecapTheme').click()
                        overflow = page.evaluate('Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)>innerWidth+1')
                        assert not overflow, (width,lang,theme,'overflow')
                page.locator('.platform-card[data-platform="instagram"]').click()
                for _ in range(3):
                    page.locator('#tutorialNext').click()
                page.locator('#demoInline').dispatch_event('click')
                page.wait_for_timeout(1000)
                page.locator('#pauseStory').click()
                paused = page.locator('#storyIntroCanvas').evaluate('(c)=>c.toDataURL()')
                page.wait_for_timeout(160)
                assert paused == page.locator('#storyIntroCanvas').evaluate('(c)=>c.toDataURL()'), 'paused artwork changes'
                page.locator('#pauseStory').click()
                page.wait_for_timeout(200)
                assert paused != page.locator('#storyIntroCanvas').evaluate('(c)=>c.toDataURL()'), 'resume stalled'
                page.screenshot(path=str(args.out/f'ui-{width}.png'))
                assert not errors, errors
                report['runs'].append({'viewport':width,'languages':3,'themes':2,'pause_resume':True,'errors':errors})
                page.close()
                print('UI', width, 'PASS', flush=True)

        if args.baseline or args.export or args.real_zip or args.verify:
            for network in (('instagram',) if args.real_zip else ('instagram','tiktok')):
                page, errors = new_page()
                page.locator(f'.platform-card[data-platform="{network}"]').click()
                for _ in range(3):
                    page.locator('#tutorialNext').click()
                if args.real_zip:
                    page.locator('#fileInput').set_input_files(str(args.real_zip))
                    page.wait_for_function('()=>!document.querySelector("#recapopOverlay").classList.contains("hidden") || !document.querySelector("#errorBox").classList.contains("hidden")', timeout=180000)
                    if page.locator('#recapopOverlay').evaluate('(e)=>e.classList.contains("hidden")'):
                        page.locator('#playSavedRecap').click()
                else:
                    page.locator('#demoInline').dispatch_event('click')
                assert page.evaluate('window.REEECAP_VIDEO_SNAPSHOT().platform') == network
                page.wait_for_timeout(1400)
                # Capture live clock deltas; a declared FPS alone cannot detect quantization.
                live = page.evaluate('''()=>{const a=__introTimes;return {draws:a.length,unique:new Set(a.map(t=>Math.round(t))).size,times:a}}''')
                page.locator('#pauseStory').click()
                ready = page.evaluate('async()=>await REEECAP_MOTION.ensure()')
                assert ready >= 2, ready
                if args.verify:
                    result=page.evaluate('''async()=>{
                        REEECAP_MOTION.pause();await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
                        const data=REEECAP_VIDEO_SNAPSHOT(),slide=data.stories[0],next=data.stories[1],total=data.stories.length;
                        const a=document.createElement('canvas'),b=document.createElement('canvas');
                        a.width=b.width=720;a.height=b.height=1280;document.body.append(a);
                        const ac=a.getContext('2d'),bc=b.getContext('2d'),cases=[];
                        for(const ms of [500,2500,5000,8500,9500,9900,10000]){
                            REEECAP_INTRO.attach(a,{...slide,demo:data.demo},()=>ms,data.platform,data.year,
                              (ctx,local)=>REEECAP_DRAW_STORY_FRAME(ctx,data,next,local/7800,1,total,null,local));
                            REEECAP_DRAW_STORY_FRAME(bc,data,slide,ms/10000,0,total,null,ms,next,7200);
                            REEECAP_INTRO.stop();
                            const x=ac.getImageData(0,0,720,1280).data,y=bc.getImageData(0,0,720,1280).data;
                            let changed=0;for(let i=0;i<x.length;i++)if(x[i]!==y[i])changed++;
                            cases.push({ms,changed_channels:changed});
                        }
                        REEECAP_DRAW_STORY_FRAME(ac,data,slide,1,0,total,null,10000,next,7200);
                        const x=ac.getImageData(0,0,720,1280).data;
                        REEECAP_DRAW_STORY_FRAME(bc,data,next,600/7800,1,total,null,600);
                        const y=bc.getImageData(0,0,720,1280).data;let seam=0,seamChanged=0,bounds=[720,1280,0,0];
                        for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);seam+=d;if(d>2){seamChanged++;const pixel=Math.floor(i/4),px=pixel%720,py=Math.floor(pixel/720);bounds=[Math.min(bounds[0],px),Math.min(bounds[1],py),Math.max(bounds[2],px),Math.max(bounds[3],py)]}}
                        const samples=[{ms:'seam-A',png:a.toDataURL('image/png').split(',')[1]},{ms:'seam-B',png:b.toDataURL('image/png').split(',')[1]}];
                        for(const ms of [500,2500,5000,7000,8500,9500,9900,10100,12000]){
                            const story=ms<10000?slide:next,local=ms<10000?ms:ms-10000+600;
                            REEECAP_DRAW_STORY_FRAME(bc,data,story,ms<10000?ms/10000:local/7800,ms<10000?0:1,total,null,local,next,7200);
                            samples.push({ms,png:b.toDataURL('image/png').split(',')[1]});
                        }
                        a.remove();return {cases,seam_mean_channel_delta:seam/x.length,seamChanged,bounds,samples};
                    }''')
                    for sample in result.pop('samples'):
                        (args.out/f'{network}-sample-{sample["ms"]}.png').write_bytes(base64.b64decode(sample['png']))
                    assert all(c['changed_channels']==0 for c in result['cases']), result
                    assert result['seam_mean_channel_delta']<.1,result
                    report['runs'].append({'network':network,'parity':result})
                    print('PARITY',network,result,flush=True)
                    page.close()
                    continue
                page.locator('#downloadVideo').click()
                page.locator('#videoNone').click()
                page.locator('#videoSpeed').select_option('2400')
                checks = page.locator('#videoStorySelect input')
                for i in range(min(1 if args.cpu_slowdown>1 else 3, checks.count())):
                    checks.nth(i).check()
                assert page.locator('#videoAudio').is_checked()
                if args.cpu_slowdown>1:
                    page.context.new_cdp_session(page).send('Emulation.setCPUThrottlingRate',{'rate':args.cpu_slowdown})
                with page.expect_download(timeout=90000) as dl:
                    page.locator('#videoStart').click()
                download = dl.value
                ext = download.suggested_filename.rsplit('.',1)[-1]
                label = 'real-local-PRIVATE' if args.real_zip else 'SLOW-CPU-DEMO' if args.cpu_slowdown>1 else 'DEMO'
                path = args.out/f'{network}-{version}-{label}.{ext}'
                download.save_as(str(path))
                probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],text=True))
                assert any(s['codec_type']=='audio' for s in probe['streams'])
                assert float(probe['format']['duration']) >= (9.9 if args.cpu_slowdown>1 else 14)
                assert not errors, errors
                report['runs'].append({'network':network,'demo':not bool(args.real_zip),'path':str(path),'live_clock':live,'export_metrics':page.evaluate('window.__exportMetrics||null'),'probe':probe,'errors':errors})
                page.close()
                print('EXPORT', path, path.stat().st_size, 'PASS', flush=True)
        browser.close()
    server.shutdown()
    suffix='-real-private' if args.real_zip else '-parity' if args.verify else '-slow-cpu' if args.cpu_slowdown>1 else '-ui' if args.ui and not args.export else ''
    (args.out/f'report-{version}{suffix}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

if __name__ == '__main__':
    main()
