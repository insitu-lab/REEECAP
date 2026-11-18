"""Inspect encoded frames and audio; build labelled side-by-side MP4 evidence.

This measures native source timestamps before the comparison is conformed to 60fps.
Comparison FPS must never be used as a measurement of the product's output FPS.
"""
import argparse
import json
from pathlib import Path
import subprocess
import numpy as np

BASE=Path(__file__).resolve().parents[1]

def run(args):
    return subprocess.check_output(args,stderr=subprocess.PIPE)

def longest_hold(deltas, times, threshold):
    longest=current=0.
    for i,d in enumerate(deltas):
        if d<=threshold:
            current+=times[i+1]-times[i]
            longest=max(longest,current)
        else:
            current=0.
    return round(longest,4)

def audio(path,seconds=21):
    raw=run(['ffmpeg','-v','error','-i',str(path),'-t',str(seconds),'-ac','1','-ar','8000','-f','f32le','-'])
    return np.frombuffer(raw,np.float32)

def inspect(path):
    probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]))
    frames=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(path)]))['frames']
    times=np.array([float(f['best_effort_timestamp_time']) for f in frames])
    raw=run(['ffmpeg','-v','error','-i',str(path),'-an','-vf','scale=90:160:flags=area,format=gray','-fps_mode','passthrough','-c:v','rawvideo','-f','image2pipe','-'])
    images=np.frombuffer(raw,np.uint8).reshape(-1,160,90).astype(np.int16)
    assert len(images)==len(times),(len(images),len(times))
    native=np.diff(times);mask=times<10;intro=images[mask];it=times[mask]
    delta=np.abs(np.diff(intro,axis=0)).mean((1,2))
    sound=audio(path)
    # Full decode is also a corruption check, independent of container metadata.
    subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True,capture_output=True)
    return {
        'path':str(path),'bytes':path.stat().st_size,
        'streams':[{k:s[k] for k in ('codec_type','codec_name','width','height','avg_frame_rate','sample_rate','channels') if k in s} for s in probe['streams']],
        'duration':float(probe['format']['duration']),
        'decoded_frames':len(images),'effective_fps':round((len(times)-1)/(times[-1]-times[0]),3),
        'timestamp_gap_p95_ms':round(float(np.percentile(native,95))*1000,3),
        'timestamp_gap_max_ms':round(float(native.max())*1000,3),
        'non_increasing_native_timestamps':int(np.sum(native<=0)),
        'intro_duplicate_frames':int(np.sum(delta==0)),
        'intro_longest_exact_hold_s':longest_hold(delta,it,0),
        'intro_longest_low_motion_s':longest_hold(delta,it,.05),
        'intro_delta_gray_p50':round(float(np.median(delta)),4),
        'audio_rms':round(float(np.sqrt(np.mean(sound**2))),6),
        'full_decode':'PASS'
    }

def sync_to_source(video,source):
    recorded=audio(video);original=audio(source)
    results=[]
    # Correlate windows on both sides of the intro seam. This catches a reset
    # or an unplanned seek even when AAC is present in the output container.
    for at in (.5,5.,9.5,10.5,12.5):
        i=int(at*8000);a=recorded[i:i+2000]
        if len(a)<2000:continue
        best=(-1.,0)
        for lag in range(-2400,2401,8):
            j=i+lag
            if j<0:continue
            b=original[j:j+2000]
            if len(b)!=len(a):continue
            corr=float(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-12))
            if corr>best[0]:best=(corr,lag)
        coarse=best[1]
        for lag in range(coarse-8,coarse+9):
            j=i+lag
            if j<0:continue
            b=original[j:j+2000]
            if len(b)!=len(a):continue
            corr=float(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)+1e-12))
            if corr>best[0]:best=(corr,lag)
        results.append({'time_s':at,'correlation':round(best[0],4),'source_offset_ms':best[1]/8})
    return results

def compare(before,after,out,font):
    font=font.as_posix().replace(':',r'\:')
    def panel(input_,label):
        return f"[{input_}:v]setpts=PTS-STARTPTS,scale=540:960,fps=60,pad=540:1024:0:64:black,drawtext=fontfile='{font}':text='{label}':fontcolor=white:fontsize=22:x=24:y=22[v{input_}]"
    filters=panel(0,'6.3 - ANTES - DEMO')+';'+panel(1,'6.4 - REVISAO - DEMO')+';[v0][v1]hstack=inputs=2[v]'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(before),'-i',str(after),'-filter_complex',filters,'-map','[v]','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',str(out)],check=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True)
    p.add_argument('--font',type=Path,default=Path('C:/Windows/Fonts/arial.ttf'))
    args=p.parse_args();report={}
    for net in ('instagram','tiktok'):
        before=args.out/f'{net}-6.3-DEMO.mp4';after=args.out/f'{net}-6.4-DEMO.mp4'
        report[net]={'before':inspect(before),'after':inspect(after),'audio_sync':sync_to_source(after,BASE/f'assets/media/music/reeecap-{net}.mp3')}
        compare(before,after,args.out/f'COMPARACAO-{net}-6.3-vs-6.4.mp4',args.font)
        print(net,json.dumps(report[net],ensure_ascii=True),flush=True)
    (args.out/'encoded-media-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

if __name__=='__main__':
    main()
