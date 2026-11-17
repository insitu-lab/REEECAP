#!/usr/bin/env python3
"""Prepare self-hosted, license-vetted footage, music and screenshot references.
Run on an internet-connected builder, NOT in the visitor's browser. Requires ffmpeg.
Use --strict to fail if required video or music cannot be bundled.
"""
from pathlib import Path
import argparse, json, subprocess, tempfile, urllib.request
ROOT=Path(__file__).resolve().parents[1]
MEDIA=ROOT/'assets/media'
VIDS=[
('clip-1.mp4','https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4','https://mixkit.co/free-stock-video/girl-in-neon-sign-1232/'),
('clip-2.mp4','https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4','https://mixkit.co/free-stock-video/man-dancing-under-changing-lights-1240/'),
('clip-3.mp4','https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4','https://mixkit.co/free-stock-video/mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764/'),
('clip-4.mp4','https://assets.mixkit.co/videos/preview/mixkit-influencers-dancing-in-a-recording-a-tik-tok-video-42315-large.mp4','https://mixkit.co/free-stock-video/influencers-dancing-in-a-recording-a-tik-tok-video-42315/')]
MUSIC=[
('cat-walk.mp3','https://assets.mixkit.co/music/371/371.mp3','Cat Walk','Arulo'),
('rising-forest.mp3','https://assets.mixkit.co/music/471/471.mp3','Rising Forest','Diego Nava'),
('techno-fest.mp3','https://assets.mixkit.co/music/124/124.mp3','Techno Fest Vibes','Alejandro Magaña')]
IMAGES={
 'instagram-1.png':'https://images.wondershare.com/drfone/article/2026/05/how-to-find-deleted-instagram-post-10.jpg',
 'instagram-2.png':'https://www.multcloud.com/screenshot/en/others-1/instagram/choose-all-available-information.png',
 'facebook-1.png':'https://images.wondershare.com/drfone/article/2026/05/how-to-find-deleted-instagram-post-10.jpg',
 'tiktok-1.png':'https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w600/2025/01/TikTok-Account-Settings.png',
 'tiktok-2.png':'https://storage.ghost.io/c/fb/a8/fba8736e-797b-43bb-bcba-040fb8dcfebb/content/images/size/w1600/2025/01/TikTok-Data-Request-Configuration.png',
 'youtube-1.png':'https://resource.gbyte.com/20250821/large/google-takeout-exporte-video-youtube.webp'}
HEADERS={'User-Agent':'REEECAP Media Installer/1.0 (personal application; https://github.com/insitu-lab/REEECAP)','Accept':'*/*'}
def get(url,output,limit=40*1024*1024):
 req=urllib.request.Request(url,headers=HEADERS)
 with urllib.request.urlopen(req,timeout=30) as resp,open(output,'wb') as f:
  size=0
  while True:
   chunk=resp.read(256*1024)
   if not chunk:break
   size+=len(chunk)
   if size>limit:raise ValueError('asset exceeds configured size limit')
   f.write(chunk)
  if size<1024:raise ValueError('asset unexpectedly tiny')
 return size

def run(cmd):subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True,timeout=150)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--strict',action='store_true');args=ap.parse_args()
 for sub in ['clips','music','tutorials']:(MEDIA/sub).mkdir(parents=True,exist_ok=True)
 bundled=list((ROOT/'assets/videos').glob('reel_*.mp4'))
 okV=0;okM=0;notes=[]
 if len(bundled)>=12:notes.append('12 supplied real stock clips already bundled; skips external video acquisition')
 for name,url,page in ([] if len(bundled)>=12 else VIDS):
  out=MEDIA/'clips'/name
  if out.exists() and out.stat().st_size>50000:okV+=1;continue
  try:
   with tempfile.NamedTemporaryFile(suffix='.mp4') as temp:
    get(url,temp.name)
    run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',temp.name,'-an','-t','9','-vf','scale=320:568:force_original_aspect_ratio=increase,crop=320:568','-r','24','-c:v','libx264','-crf','28','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',str(out)])
   okV+=1;notes.append('Video installed: '+name)
  except Exception as e:notes.append('Video FAILED: '+name+' '+str(e)[:170]);out.unlink(missing_ok=True)
 for name,url,title,artist in MUSIC:
  out=MEDIA/'music'/name
  if out.exists() and out.stat().st_size>50000:okM+=1;continue
  try:
   with tempfile.NamedTemporaryFile(suffix='.mp3') as temp:
    get(url,temp.name,20*1024*1024)
    run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',temp.name,'-t','75','-ar','44100','-ac','2','-codec:a','libmp3lame','-b:a','160k',str(out)])
   okM+=1;notes.append('Music installed: '+title)
  except Exception as e:notes.append('Music FAILED: '+name+' '+str(e)[:170]);out.unlink(missing_ok=True)
 for name,url in IMAGES.items():
  out=MEDIA/'tutorials'/name
  if out.exists() and out.stat().st_size>1024:continue
  try:
   with tempfile.NamedTemporaryFile(suffix=Path(url).suffix) as temp:
    get(url,temp.name,8*1024*1024)
    run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',temp.name,'-frames:v','1','-vf','scale=1100:-2:force_original_aspect_ratio=decrease','-compression_level','8',str(out)])
   notes.append('Screenshot installed: '+name)
  except Exception as e:notes.append('Screenshot not available: '+name+' '+str(e)[:100]);out.unlink(missing_ok=True)
 (MEDIA/'manifest.json').write_text(json.dumps({'video':okV,'music':okM,'videos_required':4,'music_required':3,'notes':notes,'license_video':'https://mixkit.co/license/modal/videoFree/','license_music':'https://mixkit.co/license/modal/musicFree/'},indent=2,ensure_ascii=False))
 print('\n'.join(notes));print(f'Embedded: {len(bundled)} supplied reels, {okV}/4 optional clip presets; {okM}/3 songs')
 if args.strict and ((okV<4 and len(bundled)<12) or okM<3):raise SystemExit('Required embedded media missing: publish blocked')
if __name__=='__main__':main()
