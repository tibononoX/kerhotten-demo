#!/usr/bin/env python3
"""Build index.html from _build/index.src.html: expands <!--pic ...--> into responsive <picture>,
inlines minified styles.css (critical CSS = whole sheet, ~14 KB) and minifies main.js -> main.min.js.
Run from the kerhotten-demo folder: python3 _build/build.py  (needs npx terser + csso, optional)."""
import json, re, subprocess, os
here=os.path.dirname(os.path.abspath(__file__)); root=os.path.dirname(here)
man=json.load(open(os.path.join(here,'manifest.json')))
s=open(os.path.join(here,'index.src.html')).read()
def run(cmd, fallback):
    try: return subprocess.check_output(cmd, cwd=root, text=True)
    except Exception: return fallback
css=open(os.path.join(root,'styles.css')).read()
mincss=run(['npx','--prefix','/tmp/tools','csso',os.path.join(root,'styles.css')], css)
s=s.replace('<!--inline-css-->','<style>'+mincss.strip()+'</style>\n<script>document.documentElement.classList.add(\'js\')</script>')
js=open(os.path.join(root,'main.js')).read()
minjs=run(['npx','--prefix','/tmp/tools','terser',os.path.join(root,'main.js'),'-c','-m','--comments','/Private redesign/'], js)
open(os.path.join(root,'main.min.js'),'w').write(minjs)
def pic(m):
    name,alt,alten,sizes,cls,load=m.group(1).split('|')
    d=man[name]; W,H=d['ratio']; jw=d['jpg']; jh=round(H*jw/W)
    srcset=', '.join(f'img/{name}-{w}.webp {w}w' for w in d['w'])
    extra='fetchpriority="high"' if load=='eager' else 'loading="lazy" decoding="async"'
    return (f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
            f'<img class="{cls}" src="img/{name}-{jw}.jpg" width="{jw}" height="{jh}" alt="{alt}" data-en-alt="{alten}" {extra}></picture>')
s=re.sub(r'<!--pic (.*?)-->',pic,s)
open(os.path.join(root,'index.html'),'w').write(s)
print('index.html', len(s), 'bytes; css', len(mincss), 'js', len(minjs))
