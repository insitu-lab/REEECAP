"""Run the handoff's existing Linux-oriented scripts on a local Windows browser.

Only browser executable and artifact paths are substituted in memory. Assertions,
fixtures and the legacy tests' own setup remain intact. No source files are edited.
"""
import argparse
import os
from pathlib import Path
import subprocess
import sys

BASE=Path(__file__).resolve().parents[1]
TESTS=['test_v6_embedded.py','test_v6_export_real.py','test_5_tutorial.py',
       'test_locale.py','test_autodetect.py','test_responsive.py']

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--one',choices=TESTS)
    args=p.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    deps=args.out.parent/'test-deps'
    if deps.exists():
        sys.path.insert(0,str(deps))
    if args.one:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            candidates=[Path(pw.chromium.executable_path),Path('C:/Program Files/Google/Chrome/Application/chrome.exe'),Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]
        executable=next(x for x in candidates if x.exists())
        source=(BASE/'tests'/args.one).read_text(encoding='utf-8')
        source=source.replace('/usr/bin/chromium',executable.as_posix()).replace('/mnt/data',args.out.as_posix())
        sys.path.insert(0,str(BASE/'tests'))
        exec(compile(source,str(BASE/'tests'/args.one),'exec'),{'__name__':'__main__','__file__':str(BASE/'tests'/args.one)})
        return
    failures=[]
    for name in TESTS:
        result=subprocess.run([sys.executable,str(Path(__file__).resolve()),'--one',name,'--out',str(args.out)],cwd=BASE,env={**os.environ,'PYTHONUTF8':'1'},capture_output=True,text=True,encoding='utf-8')
        (args.out/(name+'.log')).write_text(result.stdout+result.stderr,encoding='utf-8')
        print(name, 'PASS' if result.returncode==0 else 'FAIL',flush=True)
        if result.returncode:
            failures.append(name)
            print(result.stderr[-1500:],flush=True)
    if failures:
        raise SystemExit('Failed: '+', '.join(failures))

if __name__=='__main__':
    main()
