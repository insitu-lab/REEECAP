"""Play the final encoded evidence at normal speed in an actual browser decoder."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    results=[]
    with sync_playwright() as pw:
        candidates=[Path(pw.chromium.executable_path),Path('C:/Program Files/Google/Chrome/Application/chrome.exe'),Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]
        executable=next(str(x) for x in candidates if x.exists())
        browser=pw.chromium.launch(executable_path=executable,headless=True,args=['--autoplay-policy=no-user-gesture-required'])
        page=browser.new_page(viewport={'width':1280,'height':960})
        page.goto((args.out/'REVISAR.html').resolve().as_uri())
        for i in range(4):
            video=page.locator('video').nth(i);video.scroll_into_view_if_needed()
            video.evaluate('(v)=>{v.currentTime=0;return v.play()}')
            page.wait_for_timeout(5200)
            video.screenshot(path=str(args.out/f'native-playback-{i}-5s.png'))
            result=video.evaluate('''async v=>{
                if(!v.ended)await new Promise((resolve,reject)=>{
                    const timer=setTimeout(()=>reject(new Error('Playback timeout')),45000);
                    v.addEventListener('ended',()=>{clearTimeout(timer);resolve()},{once:true});
                    v.addEventListener('error',()=>reject(new Error('Decoder error')),{once:true});
                });
                const q=v.getVideoPlaybackQuality();return {src:v.src.split('/').pop(),ended:v.ended,duration:v.duration,
                    width:v.videoWidth,height:v.videoHeight,totalFrames:q.totalVideoFrames,droppedFrames:q.droppedVideoFrames,
                    decodedAudioBytes:v.webkitAudioDecodedByteCount||null};
            }''')
            assert result['ended'] and result['totalFrames']>100,result
            results.append(result);print('PLAYBACK',json.dumps(result),flush=True)
        browser.close()
    (args.out/'native-playback-report.json').write_text(json.dumps(results,indent=2),encoding='utf-8')

if __name__=='__main__':
    main()
