"""Synthetic schema-contract tests; DO NOT represent real user exports."""
from pathlib import Path
import json,zipfile,sys,subprocess,hashlib
from playwright.sync_api import sync_playwright
from test_real_browser import boot, BASE

T=BASE/'tests'
spotify_extended=[
 {'ts':'2026-10-20T13:00:00Z','ms_played':125000,'master_metadata_track_name':'Canção A','master_metadata_album_artist_name':'Artista X','spotify_track_uri':'spotify:track:abc','ip_addr_decrypted':'REDACTED'},
 {'ts':'2026-10-21T13:00:00Z','ms_played':65000,'master_metadata_track_name':'Canção B','master_metadata_album_artist_name':'Artista X','spotify_track_uri':'spotify:track:def'},
 {'ts':'2026-10-21T19:00:00Z','ms_played':90000,'episode_name':'Episódio 1','episode_show_name':'Podcast A','spotify_episode_uri':'spotify:episode:12'}]
spotify_basic=[{'endTime':'2025-05-17 13:20','artistName':'Artista Y','trackName':'Faixa C','msPlayed':64000}]
facebook={
 'your_facebook_activity/posts/your_posts_1.json':[{'timestamp':1792800000,'data':[{'post':'Um post com coração'}],'id':'p0'}],
 'your_facebook_activity/comments/your_comments.json':{'comments_v2':[{'timestamp':1792800010,'data':[{'comment':'Achei incrível'}],'id':'c0'}]},
 'your_facebook_activity/likes_and_reactions/your_likes_and_reactions.json':{'likes_and_reactions':[{'timestamp':1792800100,'title':'Amei','id':'r0'}]},
 'messages/inbox/conversation.json':[{'timestamp':1792800000,'message':'PRIVATE_MESSAGE_SHOULD_NOT_LEAK'}]
}
for platform,items in [('spotify',{'Streaming_History_Audio_2025-2026_0.json':spotify_extended,'MyData/StreamingHistory0.json':spotify_basic,'AccountData/Payments.json':{'CARD':'HIDDEN'}}),('facebook',facebook)]:
 with zipfile.ZipFile(T/f'fixture-{platform}.zip','w',zipfile.ZIP_DEFLATED) as z:
  for file,obj in items.items():z.writestr(file,json.dumps(obj,ensure_ascii=False))

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for platform in ('spotify','facebook'):
  page=browser.new_page(viewport={'width':390,'height':844},accept_downloads=True)
  errs=boot(page)
  page.locator(f'button[data-platform="{platform}"]').click()
  assert page.locator('#exportPlatform').inner_text()==('Spotify' if platform=='spotify' else 'Facebook')
  page.locator('#fileInput').set_input_files(str(T/f'fixture-{platform}.zip'))
  page.wait_for_function('!document.querySelector("#recapopOverlay").classList.contains("hidden") || !document.querySelector("#errorBox").classList.contains("hidden")',timeout=12000)
  err=page.locator('#errorBox').inner_text() if not page.locator('#errorBox').evaluate('(e)=>e.classList.contains("hidden")') else ''
  assert not err,(platform,err)
  snap=page.evaluate('window.REEECAP_VIDEO_SNAPSHOT()')
  print(platform,'stories',[(s.get('metricKey'),s.get('value')) for s in snap['stories'] if s.get('metricKey')],'errs',errs)
  assert len(snap['stories'])>=4
  if platform=='spotify':
   def get(k):return next(int(s['value']) for s in snap['stories'] if s.get('metricKey')==k)
   assert get('listens')==2
   assert get('podcasts')==1
   assert get('minutes')==4
  else:
   assert {s['metricKey'] for s in snap['stories'] if s.get('metricKey')}>= {'posts','comments','likes'}
   assert 'PRIVATE_MESSAGE_SHOULD_NOT_LEAK' not in str(snap)
  if platform=='spotify':
   page.locator('#downloadVideo').click()
   assert page.locator('#videoComposer').evaluate('(e)=>e.open')
   for theme in ('neon','noir','paper'):
    page.locator('#videoTheme').select_option(theme)
    page.locator('#videoAccent').fill('#07c3ae')
    page.locator('#videoPreviewCanvas').screenshot(path=f'/mnt/data/reeecap-3-{theme}-preview.png')
   page.locator('#videoNone').click();page.locator('#videoStorySelect input').first.check()
   page.locator('#videoAudio').uncheck()
   with page.expect_download(timeout=35000) as dl:page.locator('#videoStart').click()
   item=dl.value;file=Path('/mnt/data/reeecap-3-paper-test.'+item.suggested_filename.split('.')[-1]);item.save_as(file)
   print('video saved',file,file.stat().st_size)
   info=subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height','-of','compact',str(file)],text=True)
   assert 'h264' in info and '1280' in info
  assert not errs,(platform,errs)
  page.close()
 browser.close()
print('V3 INTEGRATION PASSED')
