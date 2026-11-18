"""Re-apply Claude's patches on top of a Codex source drop.
usage: python3 merge_patch.py <source_dir> <version_tag>
Idempotent where possible; asserts when an anchor is missing so drift is noticed.
"""
import sys, re, os
src, ver = sys.argv[1], sys.argv[2]
P = lambda f: os.path.join(src, f)

def must(s, a, n=1):
    c = s.count(a)
    assert c == n, f"anchor count {c} != {n}: {a[:80]!r}"

# ---------- index.html: cache-busting + title ----------
h = open(P('index.html')).read()
h = re.sub(r'<title>[^<]*</title>', '<title>별빛 마당 · 우리의 시간</title>', h, count=1)
h = re.sub(r'href="\./app\.css(\?[^"]*)?"', f'href="./app.css?v={ver}"', h)
h = re.sub(r'src="\./app\.js(\?[^"]*)?"', f'src="./app.js?v={ver}"', h)
if 'id="decoMoveBtn"' not in h:
    a = '      <div class="decos" id="decoList"></div>'
    must(h, a)
    h = h.replace(a, '      <div class="btns"><button type="button" class="btn" id="decoMoveBtn">장식 위치 옮기기</button></div>\n' + a)
if 'id="decoEditBar"' not in h:
    a = '\n<script src="./app.js'
    must(h, a)
    h = h.replace(a, '''
<div class="deco-edit-bar" id="decoEditBar" hidden>
  <span>끌어서 옮겨요</span>
  <button type="button" class="btn" id="decoReset">처음 자리로</button>
  <button type="button" class="btn primary" id="decoDone">완료</button>
</div>''' + a, 1)
h = h.replace('우리 아이들 (최대 5마리)', '우리 아이들 (최대 10마리)')
h = h.replace('<div class="veil" id="setupVeil">', '<div class="veil" id="setupVeil" hidden>')
if 'safety net: if starting up' not in h:
    h = h.replace('<script src="./app.js', '<script>/* safety net: if starting up ever fails, never leave the new-yard sheet covering a saved yard */\n(function(){var t0=Date.now();window.addEventListener("error",function(){if(Date.now()-t0>8000)return;try{var g=JSON.parse(localStorage.getItem("starlight-yard-v1")||"null");if(g&&g.set&&g.family&&g.family.length){var v=document.getElementById("setupVeil");if(v)v.hidden=true;var d=document.getElementById("dock");if(d)d.hidden=false;}}catch(e){}});})();</script>\n' + '<script src="./app.js', 1)
open(P('index.html'), 'w').write(h)

# ---------- build script: accept ?v= ----------
b = open(P('tools/build-standalone.cjs')).read()
old = "html=html.replace('<link rel=\"stylesheet\" href=\"./app.css\">',()=>'<style>'+css+'</style>').replace('<script src=\"./app.js\"></script>',()=>'<script>'+js+'</script>');"
if old in b:
    b = b.replace(old, "html=html.replace(/<link rel=\"stylesheet\" href=\"\\.\\/app\\.css(\\?[^\"]*)?\">/,()=>'<style>'+css+'</style>').replace(/<script src=\"\\.\\/app\\.js(\\?[^\"]*)?\"><\\/script>/,()=>'<script>'+js+'</script>');")
    open(P('tools/build-standalone.cjs'), 'w').write(b)

# ---------- app.js ----------
s = open(P('app.js')).read()

# fitVisible: only stretch to what is really visible
i0 = s.index('  const fitVisible = () => {'); i1 = s.index('  fitVisible();', i0)
s = s[:i0] + '''  const fitVisible = () => {
    // Fill what the browser says is visible; never stretch past it (that would hide the menu).
    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches);
    const root = document.documentElement, stg = document.querySelector(".stage");
    [root, document.body, stg].forEach(el => { if (el) { el.style.height = ""; if (el === stg) el.style.bottom = ""; } });
    const laidOut = stg ? stg.getBoundingClientRect().height : window.innerHeight;
    const vv = window.visualViewport;
    let full = Math.max(window.innerHeight, root.clientHeight, vv ? Math.round(vv.height + vv.offsetTop) : 0);
    if (full > laidOut + 1) [root, document.body, stg].forEach(el => { if (!el) return; el.style.height = full + "px"; if (el === stg) el.style.bottom = "auto"; });
    const d = $("dock"); if (d && !d.hidden) document.documentElement.style.setProperty("--dockH", Math.round(d.getBoundingClientRect().height) + "px");
    if (window.__syDebug) window.__syDebug({standalone, laidOut, full});
  };
''' + s[i1:]
a = '  if (window.visualViewport) window.visualViewport.addEventListener("resize", later);'
must(s, a)
if 'addEventListener("pageshow", later)' not in s:
    s = s.replace(a, a + '\n  window.addEventListener("resize", later); window.addEventListener("pageshow", later); document.addEventListener("visibilitychange", () => { if (!document.hidden) later(); });', 1)

# decor positions: helpers used by drawScene
reps = [
 ('function cushionDepth(){ return dMin + (dMax-dMin)*0.22; }',
  'function cushionDepth(){ return decoAt("cushion", W*0.24, dMin + (dMax-dMin)*0.22).d; }\nfunction cushionX(){ return decoAt("cushion", W*0.24, dMin + (dMax-dMin)*0.22).x; }'),
 ('function cushionSlot(e){ const i = ents.indexOf(e), n = ents.length; return W*0.24 +',
  'function cushionSlot(e){ const i = ents.indexOf(e), n = ents.length; return cushionX() +'),
 ('    const d = cushionDepth() - 10 - i*3, x = W*0.07 + i*Math.min(W*0.075, 22*P);\n    items.push({d, fn:',
  '    const _q = decoAt("frame-" + p.id, W*0.07 + i*Math.min(W*0.075, 22*P), cushionDepth() - 10 - i*3), d = _q.d, x = _q.x;\n    items.push({d, key: "frame-" + p.id, fn:'),
 ('  if (has("cushion")) items.push({d: cushionDepth()-0.1, fn: () => { const k = decK(cushionDepth()); softShadow(W*0.24 + 3*k, groundY + cushionDepth() + k, 19*k, 3.5*k, 0.28); place(cushionDec(), W*0.24, groundY + cushionDepth(), k); }});',
  '  if (has("cushion")) items.push({d: cushionDepth()-0.1, key: "cushion", fn: () => { const k = decK(cushionDepth()); softShadow(cushionX() + 3*k, groundY + cushionDepth() + k, 19*k, 3.5*k, 0.28); place(cushionDec(), cushionX(), groundY + cushionDepth(), k); }});'),
 ('  if (has("lantern")) { const d = dMin + 6*S; items.push({d, fn: () => { const k = decK(d), x = W*0.78;',
  '  if (has("lantern")) { const _q = decoAt("lantern", W*0.78, dMin + 6*S), d = _q.d; items.push({d, key: "lantern", fn: () => { const k = decK(d), x = _q.x;'),
 ('  if (has("tree")) { const d = dMin; items.push({d: d-1, fn: () => { const k = decK(d), x = W*0.9;',
  '  if (has("tree")) { const _q = decoAt("tree", W*0.9, dMin), d = _q.d; items.push({d: d-1, key: "tree", fn: () => { const k = decK(d), x = _q.x;'),
 ('  if (has("mailbox")) { const d = dMin + 4, x = W*0.66; items.push({d, fn:',
  '  if (has("mailbox")) { const _q = decoAt("mailbox", W*0.66, dMin + 4), d = _q.d, x = _q.x; items.push({d, key: "mailbox", fn:'),
 ('  if (has("pond")) { const d = dMin + (dMax - dMin)*0.62, x = W*0.82; items.push({d: d - 8, fn:',
  '  if (has("pond")) { const _q = decoAt("pond", W*0.82, dMin + (dMax - dMin)*0.62), d = _q.d, x = _q.x; items.push({d: d - 8, key: "pond", fn:'),
 ('  if (has("house")) { const d = dMin + 2, x = W*0.56; items.push({d, fn:',
  '  if (has("house")) { const _q = decoAt("house", W*0.56, dMin + 2), d = _q.d, x = _q.x; items.push({d, key: "house", fn:'),
 ('  if (has("sunflower")) { const d = dMin + 1, x = W*0.42; items.push({d, fn:',
  '  if (has("sunflower")) { const _q = decoAt("sunflower", W*0.42, dMin + 1), d = _q.d, x = _q.x; items.push({d, key: "sunflower", fn:'),
 ('  if (has("bench")) { const d = dMin + (dMax - dMin)*0.55, x = W*0.13; items.push({d, fn:',
  '  if (has("bench")) { const _q = decoAt("bench", W*0.13, dMin + (dMax - dMin)*0.55), d = _q.d, x = _q.x; items.push({d, key: "bench", fn:'),
 ('dMin = 3*P; dMax = Math.max(dMin+10*P, H - dockH - 30 - groundY);',
  'dMin = 3*P; dMax = Math.max(dMin+10*P, (dockTopInStage() || (H - dockH)) - 30 - groundY);'),
 ('const bowlX = () => W*0.4, bowlD = () => dMin + (dMax - dMin)*0.3;',
  'const bowlX = () => decoAt("bowl", W*0.4, dMin + (dMax - dMin)*0.3).x, bowlD = () => decoAt("bowl", W*0.4, dMin + (dMax - dMin)*0.3).d;'),
 ('bowlHit = {x: x - 10*k, y: groundY + d - 12*k, w: 20*k, h: 16*k}; }}); }',
  'bowlHit = {x: x - 10*k, y: groundY + d - 12*k, w: 20*k, h: 16*k}; decoHits.push({key: "bowl", x: x - 11*k, y: groundY + d - 13*k, w: 22*k, h: 15*k, fx: x, fd: d}); }}); }'),
 ('  items.sort((a,b) => a.d - b.d).forEach(i => i.fn());',
  '  decoHits.length = 0; items.sort((a,b) => a.d - b.d).forEach(i => { placingKey = i.key || null; i.fn(); placingKey = null; });\n  drawDecoEditMarks();'),
 ('function place(d,sx,sy,k){\n',
  'function place(d,sx,sy,k){\n if(placingKey)decoHits.push({key:placingKey,x:sx-d.ax*k,y:sy-d.ay*k,w:(d.w||d.cv.width)*k,h:(d.h||d.cv.height)*k,fx:sx,fd:sy-groundY});\n'),
 (''' for(const {sp,x,d}of speciesPropLayout())items.push({d:d-.1,fn:()=>{
  const image=speciesPropArt.get(sp),k=P*ds(d),height=({dog:8,cat:27,hamster:24,hedgehog:20,parrot:28,rabbit:18})[sp]*k*(W<500?.84:1),width=height*image.width/image.height;
  mctx.save();mctx.imageSmoothingEnabled=true;softShadow(x,groundY+d,width*.4,2*k,.18);mctx.drawImage(image,x-width/2,groundY+d-height,width,height);mctx.restore();
 }});''',
  ''' for(const o of speciesPropLayout()){const q=decoAt('auto-'+o.sp,o.x,o.d),sp=o.sp,x=q.x,d=q.d;items.push({d:d-.1,fn:()=>{
  const image=speciesPropArt.get(sp),k=P*ds(d),height=({dog:8,cat:27,hamster:24,hedgehog:20,parrot:28,rabbit:18})[sp]*k*(W<500?.84:1),width=height*image.width/image.height;
  mctx.save();mctx.imageSmoothingEnabled=true;softShadow(x,groundY+d,width*.4,2*k,.18);mctx.drawImage(image,x-width/2,groundY+d-height,width,height);mctx.restore();
  decoHits.push({key:'auto-'+sp,x:x-width/2,y:groundY+d-height,w:width,h:height,fx:x,fd:d});
 }});}'''),
]
for a, b2 in reps:
    if b2.split('\n')[0] in s and a not in s:
        continue
    must(s, a)
    s = s.replace(a, b2, 1)

REPS2 = [('e.x = narrow?W*slots[i][0]:W*(0.5 + (i - (ents.length-1)/2)*0.17); e.depth = dMin + (dMax-dMin)*(narrow?slots[i][1]:(0.45+(i%2)*0.2)); });', 'const sl = slots[i] || [rand(0.15,0.85), rand(0.2,0.85)]; e.x = narrow?W*sl[0]:W*clamp(0.5 + (i - (ents.length-1)/2)*(ents.length > 5 ? 0.085 : 0.17), 0.06, 0.94); e.depth = dMin + (dMax-dMin)*(narrow?sl[1]:(0.45+(i%2)*0.2)); });'), ('Math.abs(e.mdd || 0) > (e.motionFront ? .48 : .72)) pose = e.mdd > 0 ? "fwalk" : "bwalk";', 'Math.abs(e.mdd || 0) > (e.motionFront ? .4 : .58)) pose = e.mdd > 0 ? "fwalk" : "bwalk";'), ('const NAMES = ["나비","치즈","보리","콩이","모모"];', 'const NAMES = ["나비","치즈","보리","콩이","모모","두부","율무","호두","별이","달이"];'), ('  if (draftFam.length < 5) {', '  if (draftFam.length < 10) {'), ('  ents.forEach(e => { e.chaseRound=ball.round;requestBend(petOf(e));requestReach(petOf(e));requestCrouch(petOf(e));if (e.state === "sleep") setState(e, "idle"); goTo(e, ball.tx + rand(-6,6)*P, td + rand(-6,6), true, () => pickBall(e)); });', '  const _far = (e) => Math.hypot((e.x - ball.tx)/Math.max(1, W), (e.depth - td)/Math.max(1, dMax - dMin)*0.6);\n  let chasers = ents.filter(e => e.state !== "eat" && _far(e) < 0.42);\n  if (!chasers.length) chasers = [...ents].filter(e => e.state !== "eat").sort((a,b) => _far(a) - _far(b)).slice(0, 1);\n  if (!chasers.length) chasers = [...ents].sort((a,b) => _far(a) - _far(b)).slice(0, 1);\n  ents.forEach(e => { if (!chasers.includes(e) && !e.target && e.state !== "eat" && e.state !== "sleep") e.dir = ball.tx >= e.x ? 1 : -1; });\n  chasers.forEach(e => { e.chaseRound=ball.round;requestBend(petOf(e));requestReach(petOf(e));requestCrouch(petOf(e));if (e.state === "sleep") setState(e, "idle"); goTo(e, ball.tx + rand(-6,6)*P, td + rand(-6,6), true, () => pickBall(e)); });'), (' const sorted=[...ents].sort((a,b)=>Math.hypot(a.x-ball.tx,a.depth-ball.td)', ' const sorted=ents.filter(e=>e.chaseRound===ball.round).sort((a,b)=>Math.hypot(a.x-ball.tx,a.depth-ball.td)'), ('  bowl.full = true; bowl.left = ents.length; bowl.round=uid(); const mealRound=bowl.round; sfx("treat");', '  const _now = Date.now(), _hungry = ents.filter(e => !e.ateAt || _now - e.ateAt > 90000);\n  if (!_hungry.length) { const e = pick(ents); if (e) say(e, pick(["아까 먹어서 배불러","배 빵빵해!","조금 있다 먹을래"])); toast("다들 아직 배가 불러요"); return; }\n  const _eaters = _hungry.sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random()*_hungry.length));\n  bowl.full = true; bowl.left = _eaters.length; bowl.round=uid(); const mealRound=bowl.round; sfx("treat");\n  const _full = ents.filter(e => !_eaters.includes(e));\n  if (_full.length && Math.random() < 0.6) setTimeout(() => { const e = pick(_full); if (e && !bubble) say(e, pick(["난 아직 배불러","먼저 먹어~","난 구경할래"])); }, 1400);'), ('  const n = ents.length;\n  ents.forEach((e, i) => {\n    if (e.state === "sleep") setState(e, "idle");\n    const side = n === 1', '  const n = _eaters.length;\n  _eaters.forEach((e, i) => {\n    e.ateAt = _now;\n    if (e.state === "sleep") setState(e, "idle");\n    const side = n === 1')]
for a, b2 in REPS2:
    if a not in s and b2.split('\n')[0] in s: continue
    must(s, a); s = s.replace(a, b2, 1)

s = s.rstrip(); assert s.endswith('})();')
s = s[:-5] + open(os.path.join(os.path.dirname(__file__), 'claude_tail.js')).read() + '\n})();\n'
open(P('app.js'), 'w').write(s)

# ---------- app.css ----------
c = open(P('app.css')).read()
marker = '/* ===== claude patch css ===== */'
if marker in c:
    c = c[:c.index(marker)]
c = c.rstrip() + '\n\n' + marker + '\n' + open(os.path.join(os.path.dirname(__file__), 'claude_tail.css')).read()
open(P('app.css'), 'w').write(c)
print("patched", src, ver)

# ---------- sharing + lanterns ----------
import subprocess
subprocess.check_call([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "apply_share.py"), src])
