"""Synthetic examples; do not contain account data. Used to verify ZIP import only."""
from pathlib import Path
import zipfile,json
root=Path(__file__).parent
cases={
 'instagram':{
  'your_instagram_activity/comments/post_comments_1.json':json.dumps({'comments_media_comments':[{'string_map_data':{'Comment':{'value':'Já vi: ação, coração e emoção ❤','timestamp':1792800000}}}]},ensure_ascii=False),
  'your_instagram_activity/likes/liked_posts.json':json.dumps({'likes_media_likes':[{'title':'conta_exemplo','string_list_data':[{'timestamp':1792801200}]},{'title':'conta_diferente','string_list_data':[{'timestamp':1792801400}]}]},ensure_ascii=False),
  'your_instagram_activity/content/posts_1.json':json.dumps({'ig_posts':[{'title':'Minha foto de teste','media':[{'uri':'photos/test0.jpg','creation_timestamp':1792801600}]}]},ensure_ascii=False),
  'messages/inbox/secret.json':'{}',
 },
 'tiktok':{
  'user_data.json':json.dumps({'Activity':{'Video Browsing History':{'Video Browsing History':[{'Date':'2026-10-23 13:04:00','Link':'https://example.test/video/1'}]},'Like List':{'Like List':[{'Date':'2026-10-23 13:10:00','Link':'https://example.test/like/1'}]}}},ensure_ascii=False),
 },
 'youtube':{
  'Takeout/YouTube and YouTube Music/history/watch-history.json':json.dumps([{'title':'Watched vídeo: manhã','time':'2026-10-21T14:02:00Z'},{'title':'Watched vídeo: tarde','time':'2026-10-22T15:05:00Z'}],ensure_ascii=False),
  'Takeout/YouTube and YouTube Music/history/search-history.json':json.dumps([{'title':'Searched for teste','time':'2026-10-22T14:02:00Z'}],ensure_ascii=False)
 },
 'reddit':{
   'comments.csv':'id,created_utc,body\n"t1_1","2026-10-21T12:00:00Z","Comentário com á, é e ç, teste"\n',
   'saved_posts.csv':'id,created_utc,title\n"t3_1","2026-10-21T15:00:00Z","Post salvo"\n',
 }
}
for platform,contents in cases.items():
 with zipfile.ZipFile(root/f'fixture-{platform}.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
  for name,text in contents.items():z.writestr(name,text.encode('utf-8'))
 print('fixture',platform)
