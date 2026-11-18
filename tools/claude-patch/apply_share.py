"""Add yard sharing + sky lanterns on top of a source dir. Idempotent. usage: apply_share.py <source_dir>"""
import sys, os
src = sys.argv[1]; here = os.path.dirname(os.path.abspath(__file__))
P = lambda f: os.path.join(src, f)
def must(s, a):
    assert s.count(a) == 1, f"anchor {s.count(a)}: {a[:70]!r}"

h = open(P('index.html')).read()
if 'id="shareTitle"' not in h:
    a = '      <p class="small" id="saveNote">'
    must(h, a)
    h = h.replace(a, '''      <section class="backup share" aria-labelledby="shareTitle">
        <h3 id="shareTitle">마당 공유</h3>
        <div id="shareOff">
          <p class="small">공유 코드를 만들면 코드를 받은 사람이 내 마당을 구경하고 하늘에 풍등을 띄울 수 있어요. 마당을 바꾸는 건 나만 할 수 있고, 별 편지는 공유되지 않아요.</p>
          <div class="btns"><button type="button" class="btn primary" id="shareMake">공유 코드 만들기</button></div>
        </div>
        <div id="shareOn" hidden>
          <p class="small">이 코드를 알려 주세요. 마당을 바꾸면 공유된 마당에도 자동으로 반영돼요.</p>
          <p class="share-code" id="shareCode">------</p>
          <div class="btns"><button type="button" class="btn" id="shareCopyCode">코드 복사</button><button type="button" class="btn" id="shareCopyLink">링크 복사</button></div>
          <div class="btns"><button type="button" class="btn" id="shareStop">공유 그만하기</button></div>
          <div class="backup-confirm" id="shareStopConfirm" hidden>
            <p>공유를 그만하면 이 코드로 더는 들어올 수 없고, 하늘에 띄워진 풍등도 사라져요.</p>
            <div class="btns"><button type="button" class="btn" id="shareStopNo">그대로 둘게요</button><button type="button" class="btn primary" id="shareStopYes">그만하기</button></div>
          </div>
        </div>
        <label class="share-check"><input type="checkbox" id="sharePhotos"> 아이 사진도 보여주기</label>
        <div class="btns"><button type="button" class="btn" id="lanternMine">나도 풍등 띄우기</button></div>
        <h3 class="sub">친구 마당 놀러 가기</h3>
        <div class="share-visit"><input type="text" id="visitCodeInput" maxlength="8" placeholder="공유 코드 6자리" autocomplete="off" autocapitalize="characters"><button type="button" class="btn" id="visitGo">놀러 가기</button></div>
      </section>
''' + a, 1)
if 'id="visitBar"' not in h:
    a = '  <nav class="dock" id="dock"'
    must(h, a)
    h = h.replace(a, '''  <div class="visit-bar px" id="visitBar" hidden><span id="visitWho">친구 마당에 놀러 왔어요</span><button type="button" class="btn primary" id="visitLantern">풍등 띄우기</button><button type="button" class="btn" id="visitHome">내 마당으로</button></div>
  <div class="lantern-tag px" id="lanternTag" hidden><span id="lanternTagText"></span><button type="button" class="btn" id="lanternDel" hidden>내리기</button></div>
  <div class="veil" id="lanternVeil" hidden>
    <form class="sheet px" id="lanternForm" autocomplete="off">
      <h2>풍등 띄우기</h2>
      <p class="lead">풍등에 남길 이름을 적어 주세요. 풍등을 누르면 마당 주인과 놀러 온 사람들이 이름을 볼 수 있어요.</p>
      <label class="field"><span>이름</span><input type="text" id="lanternName" maxlength="12" placeholder="예: 수진"></label>
      <div class="btns"><button type="button" class="btn" data-close>닫기</button><button type="submit" class="btn primary">띄우기</button></div>
    </form>
  </div>
''' + a, 1)
if 'id="visitCover"' not in h:
    a = '<script src="./app.js'
    must(h, a)
    h = h.replace(a, '''<div id="visitCover"><p id="visitCoverText">친구 마당으로 가는 중…</p><div class="btns" style="justify-content:center"><button type="button" class="btn" id="visitCoverHome" hidden>내 마당으로</button></div></div>
<script>if(/[?&]visit=/.test(location.search))document.documentElement.classList.add("visiting");</script>
''' + a, 1)
open(P('index.html'), 'w').write(h)

s = open(P('app.js')).read()
reps = [
 ('function save(){\n  G.updatedAt = Date.now();', 'function save(){\n  if (window.__syVisit) return;\n  G.updatedAt = Date.now();'),
 ('function flush(){\n  if (!docRef) return;', 'function flush(){\n  if (!docRef || window.__syVisit) return;'),
 ('      if (r && (r.family || r.pet) && (r.updatedAt||0) > (G.updatedAt||0)) {', '      if (!window.__syVisit && r && (r.family || r.pet) && (r.updatedAt||0) > (G.updatedAt||0)) {'),
 ('  drawClayBackground(h,t);\n', '  drawClayBackground(h,t);\n  drawSkyLanterns(t);\n'),
]
for a, b in reps:
    if b in s: continue
    must(s, a); s = s.replace(a, b, 1)
if 'yard sharing + sky lanterns (Claude)' not in s:
    s = s.rstrip(); assert s.endswith('})();')
    s = s[:-5] + open(os.path.join(here, 'share_tail.js')).read() + '\n})();\n'
open(P('app.js'), 'w').write(s)

c = open(P('app.css')).read()
mk = '/* ===== yard sharing + sky lanterns ===== */'
if mk in c: c = c[:c.index(mk)].rstrip() + '\n'
c = c.rstrip() + '\n' + open(os.path.join(here, 'share_tail.css')).read()
open(P('app.css'), 'w').write(c)
print('share applied')
