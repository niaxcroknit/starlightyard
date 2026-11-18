"""Add yard sharing + sky lanterns on top of a source dir. Idempotent. usage: apply_share.py <source_dir>"""
import sys, os
src = sys.argv[1]; here = os.path.dirname(os.path.abspath(__file__))
P = lambda f: os.path.join(src, f)
def must(s, a):
    assert s.count(a) == 1, f"anchor {s.count(a)}: {a[:70]!r}"

h = open(P('index.html')).read()
h = h.replace('메일함에서 <b>Sign in</b> 링크를 눌러 주세요. 사파리에서 열려도 괜찮아요. 이 앱이 알아서 로그인을 이어받아요.', '메일로 온 숫자 6개를 아래에 넣어 주세요. 메일에 숫자 없이 Sign in 링크만 있으면 링크를 눌러도 돼요. 이 앱이 알아서 이어받아요.')
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
      <p class="lead">풍등에 남길 이름을 적어 주세요. 이름은 마당 주인만 볼 수 있어요. 풍등은 하루에 하나씩 띄울 수 있어요.</p>
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
h = h.replace('마당 주인과 놀러 온 사람들이 이름을 볼 수 있어요. 풍등은 하루에 하나씩 띄울 수 있어요.', '이름은 마당 주인만 볼 수 있어요. 풍등은 하루에 하나씩 띄울 수 있어요.')
h = h.replace('이름을 볼 수 있어요.</p>\n      <label class="field"><span>이름</span><input type="text" id="lanternName"', '이름을 볼 수 있어요. 풍등은 하루에 하나씩 띄울 수 있어요.</p>\n      <label class="field"><span>이름</span><input type="text" id="lanternName"')
if 'id="lanternBtn"' not in h:
    a = '      <button class="iconbtn px" id="soundBtn"'
    must(h, a)
    h = h.replace(a, '      <button class="iconbtn px" id="lanternBtn" aria-label="풍등 보기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 4.5h7.6c1.6 2 2.4 4.6 2.2 7.6-.2 3-1.2 5.3-2.6 6.9H8.6C7.2 17.4 6.2 15.1 6 12.1c-.2-3 .6-5.6 2.2-7.6z"/><path d="M10.4 4.6c-.8 2.4-.9 9.4.2 14.3M13.6 4.6c.8 2.4.9 9.4-.2 14.3"/><path d="M9.4 21h5.2"/></svg></button>\n' + a, 1)
if 'id="lanternBar"' not in h:
    a = '  <div class="visit-bar px" id="visitBar" hidden>'
    must(h, a)
    h = h.replace(a, '  <div class="visit-bar px" id="lanternBar" hidden><span id="lanternCount">풍등</span><button type="button" class="btn primary" id="lanternLaunch">풍등 띄우기</button><button type="button" class="btn" id="lanternExit">나가기</button></div>\n' + a, 1)
h = h.replace('id="lanternMine">나도 풍등 띄우기</button>', 'id="lanternMine">풍등 보러 가기</button>')
if 'id="cloudTitle"' not in h:
    a = '      <section class="backup" aria-labelledby="backupTitle">'
    must(h, a)
    h = h.replace(a, '''      <section class="backup cloud" aria-labelledby="cloudTitle">
        <h3 id="cloudTitle">서버에 저장</h3>
        <div id="cloudOff">
          <p class="small">이메일로 로그인하면 마당이 바뀔 때마다 서버에 자동으로 저장돼요. 휴대폰을 바꾸거나 앱을 다시 깔아도 같은 이메일로 로그인하면 그대로 돌아와요. 내 마당은 나만 볼 수 있어요.</p>
          <div class="cloud-row"><input type="email" id="cloudEmail" placeholder="이메일 주소" autocomplete="email" inputmode="email"><button type="button" class="btn primary" id="cloudSend">메일 받기</button></div>\n          <p class="small cloud-wait" id="cloudWait" hidden>메일로 온 숫자 6개를 아래에 넣어 주세요. 메일에 숫자 없이 Sign in 링크만 있으면 링크를 눌러도 돼요. 이 앱이 알아서 이어받아요.</p>
          <div class="cloud-row" id="cloudCodeRow" hidden><input type="text" id="cloudCode" placeholder="메일로 온 숫자 6개" inputmode="numeric" autocomplete="one-time-code" maxlength="6"><button type="button" class="btn primary" id="cloudVerify">확인</button></div>
        </div>
        <div id="cloudOn" hidden>
          <p class="small" id="cloudStatus"></p>
          <div class="btns"><button type="button" class="btn" id="cloudOut">로그아웃</button></div>
        </div>
      </section>
''' + a, 1)
if 'id="setupCloud"' not in h:
    i = h.index('<p class="lead" id="setupLead">'); j = h.index('</p>', i) + 4
    h = h[:j] + '\n      <button type="button" class="btn" id="setupCloud">전에 쓰던 마당이 있어요 · 이메일로 불러오기</button>' + h[j:]
h = h.replace('<div class="cloud-row"><input type="email" id="cloudEmail" placeholder="이메일 주소" autocomplete="email" inputmode="email"><button type="button" class="btn primary" id="cloudSend">숫자 받기</button></div>', '<div class="cloud-row"><input type="email" id="cloudEmail" placeholder="이메일 주소" autocomplete="email" inputmode="email"><button type="button" class="btn primary" id="cloudSend">메일 받기</button></div>\\n          <p class="small cloud-wait" id="cloudWait" hidden>메일로 온 숫자 6개를 아래에 넣어 주세요. 메일에 숫자 없이 Sign in 링크만 있으면 링크를 눌러도 돼요. 이 앱이 알아서 이어받아요.</p>')
if 'id="pairVeil"' not in h:
    a = '  <div class="veil" id="lanternVeil" hidden>'
    must(h, a)
    h = h.replace(a, '  <div class="veil" id="pairVeil" hidden>\n    <div class="sheet px">\n      <h2>별빛 마당 로그인</h2>\n      <p class="lead" id="pairDoneText"></p>\n      <div class="btns"><button type="button" class="btn primary" data-close>확인</button></div>\n    </div>\n  </div>\n' + a, 1)
if 'id="cloudVeil"' not in h:
    a = '  <div class="veil" id="lanternVeil" hidden>'
    must(h, a)
    h = h.replace(a, '''  <div class="veil" id="cloudVeil" hidden>
    <div class="sheet px">
      <h2>어느 마당을 쓸까요?</h2>
      <p class="lead">이 폰과 서버에 서로 다른 마당이 있어요. 고른 마당으로 맞추고, 앞으로는 자동으로 저장돼요. 고르기 전에 설정에서 백업 파일을 저장해 두면 더 안심이에요.</p>
      <div class="cloud-pick" id="cloudPick"><button type="button" class="btn" id="cloudPickPhone"></button><button type="button" class="btn" id="cloudPickServer"></button></div>
      <div class="btns"><button type="button" class="btn" data-close>나중에 고를게요</button></div>
    </div>
  </div>
''' + a, 1)
open(P('index.html'), 'w').write(h)

s = open(P('app.js')).read()
reps = [
 ('function save(){\n  G.updatedAt = Date.now();', 'function save(){\n  if (window.__syVisit) return;\n  G.updatedAt = Date.now();'),
 ('  try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch(e) {}\n  clearTimeout(saveTimer);', '  try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch(e) {}\n  if (typeof cloudQueue === "function") cloudQueue();\n  clearTimeout(saveTimer);'),
 ('function flush(){\n  if (!docRef) return;', 'function flush(){\n  if (!docRef || window.__syVisit) return;'),
 ('      if (r && (r.family || r.pet) && (r.updatedAt||0) > (G.updatedAt||0)) {', '      if (!window.__syVisit && r && (r.family || r.pet) && (r.updatedAt||0) > (G.updatedAt||0)) {'),
 ('  drawClayBackground(h,t);\n', '  drawClayBackground(h,t);\n  drawSkyLanterns(t);\n'),
 ('  for (const st of G.stars) {\n    if (rising && rising.star === st) continue;', '  for (const st of (lanternMode ? [] : G.stars)) {\n    if (rising && rising.star === st) continue;'),
 (' for(const st of G.stars){if(rising&&rising.star===st)continue;', ' for(const st of (lanternMode?[]:G.stars)){if(rising&&rising.star===st)continue;'),
 ('  for (const st of G.stars) { if (Math.hypot(st.x*LW*P - x, st.y*LH*P - y)', '  for (const st of (lanternMode ? [] : G.stars)) { if (Math.hypot(st.x*LW*P - x, st.y*LH*P - y)'),
 ('function spawnGlow(){ glows.push(', 'function spawnGlow(){ if (lanternMode) return; glows.push('),
 ('function drawBubble(){\n', 'function drawBubble(){\n if(lanternMode)return;\n'),
 ('  drawBgLine(dt);\n', '  if (!lanternMode) drawBgLine(dt);\n'),
 ('  if (envelope) items.push({d: envelope.d, fn: () => {', '  if (envelope && !lanternMode) items.push({d: envelope.d, fn: () => {'),
]
for a, b in reps:
    if b in s: continue
    must(s, a); s = s.replace(a, b, 1)
mk_js = '\n/* ===== yard sharing + sky lanterns (Claude) ====='
s = s.rstrip(); assert s.endswith('})();')
if mk_js in s: s = s[:s.index(mk_js)] + '\n})();'
s = s[:-5] + open(os.path.join(here, 'share_tail.js')).read() + open(os.path.join(here, 'cloud_tail.js')).read() + '\n})();\n'
open(P('app.js'), 'w').write(s)

c = open(P('app.css')).read()
mk = '/* ===== yard sharing + sky lanterns ===== */'
if mk in c: c = c[:c.index(mk)].rstrip() + '\n'
c = c.rstrip() + '\n' + open(os.path.join(here, 'share_tail.css')).read() + open(os.path.join(here, 'cloud_tail.css')).read()
open(P('app.css'), 'w').write(c)
print('share applied')
