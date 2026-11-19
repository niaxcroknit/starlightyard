
/* ===== yard sharing + sky lanterns (Claude) =====
 * Owner makes a share code; anyone with the code sees the yard read-only and can only launch sky lanterns.
 * Visitors never touch their own saved yard: save() is a no-op while visiting (window.__syVisit). */
const SY_API = "https://rbtodhdjwumkmlnpdmcm.supabase.co/rest/v1/rpc/", SY_KEY = "sb_publishable_kjtwpZzY9oQBFQV0AkcrFw_x88bLvyG";
const SY_LINK = "https://niaxcroknit.github.io/starlightyard/";
async function syRpc(fn, args){
  const r = await fetch(SY_API + fn, {method: "POST", headers: {apikey: SY_KEY, "Content-Type": "application/json"}, body: JSON.stringify(args || {})});
  const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
  if (!r.ok) throw new Error((j && (j.message || j.hint)) || txt || ("http " + r.status));
  return j;
}
const syErr = (e) => { const m = String(e && e.message || e); return /one_per_day/.test(m) ? "풍등은 하루에 하나만 띄울 수 있어요. 내일 또 띄워 주세요" : /slow_down/.test(m) ? "잠시 뒤에 다시 띄워 주세요" : /no_yard|not found/i.test(m) ? "공유가 끝난 마당이에요" : /too_big/.test(m) ? "사진이 너무 커서 공유할 수 없어요. 사진 보여주기를 꺼 주세요" : "연결이 잠깐 불안정해요. 조금 뒤에 다시 해 주세요"; };
const VISIT = (() => { const m = /[?&]visit=([A-Za-z0-9]{4,10})/.exec(location.search); return m ? m[1].toUpperCase() : null; })();
let lanterns = [];          // {id, name, by_owner, at, born?}
var lanternMode = false, camLift = 0;   // camLift: how far the yard is pushed down while looking up at the lanterns
/* the strip of sky revealed above the painting: plain sky colour (no clouds), fading into the painting so there's no seam */
const skyTopCols = new WeakMap();
function skyTopColor(image){
  let c = skyTopCols.get(image); if (c) return c;
  try { const k = document.createElement("canvas"); k.width = 24; k.height = 4; const x = k.getContext("2d", {willReadFrequently: true});
    x.drawImage(image, 0, 0, image.width, Math.max(2, image.height*0.02), 0, 0, 24, 4);
    const d = x.getImageData(0, 0, 24, 4).data, px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i+1], d[i+2], d[i]+d[i+1]+d[i+2]]);
    px.sort((a, b) => a[3] - b[3]); const mid = px.slice(Math.floor(px.length*0.1), Math.floor(px.length*0.6));   // skip bright cloud pixels
    const avg = [0,1,2].map(j => Math.round(mid.reduce((m, p) => m + p[j], 0)/mid.length)); c = avg;
  } catch (e) { c = [200, 214, 232]; }
  skyTopCols.set(image, c); return c;
}
function skyAbove(image, y0){
  const [r, g, b] = skyTopColor(image), deep = (v) => Math.round(v*0.9), top = y0 - camLift - 6, blend = 46;
  const gr = mctx.createLinearGradient(0, top, 0, y0 + blend);
  gr.addColorStop(0, `rgb(${deep(r)},${deep(g)},${deep(b)})`);
  gr.addColorStop(Math.max(0.01, (y0 - top)/(y0 + blend - top)), `rgba(${r},${g},${b},1)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  mctx.fillStyle = gr; mctx.fillRect(0, top, W, y0 + blend - top);
}
function updateCamLift(dt){ const goal = lanternMode ? Math.round(H*0.16) : 0; camLift += (goal - camLift)*(1 - Math.exp(-dt*3.2)); if (Math.abs(goal - camLift) < 0.3) camLift = goal; }    // lanterns are only shown in this calm view (letters stay in the normal sky)
const VKEY = "starlight-yard-visitor";
const DKEY = "starlight-yard-device", LDKEY = "starlight-yard-lantern-day";
const deviceId = (() => { try { let d = localStorage.getItem(DKEY); if (!d) { d = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); localStorage.setItem(DKEY, d); } return d; } catch (e) { return "d-" + Math.random().toString(36).slice(2, 14); } })();
const lanternKey = () => VISIT || (G.share && G.share.code) || "mine";
const lanternDays = () => { try { return JSON.parse(localStorage.getItem(LDKEY) || "{}"); } catch (e) { return {}; } };
const launchedToday = () => lanternDays()[lanternKey()] === today();
const markLaunched = () => { try { const m = lanternDays(); m[lanternKey()] = today(); localStorage.setItem(LDKEY, JSON.stringify(m)); } catch (e) {} };
const vname = () => { try { return localStorage.getItem(VKEY) || ""; } catch (e) { return ""; } };

function shareSnapshot(){
  const photos = !!G.sharePhotos;
  return {v: 1, yardName: G.yardName || "", sky: G.sky || "auto", warmth: G.warmth || 0, blooms: G.blooms || 0, bloomSpots: G.bloomSpots || [], hidden: G.hidden || [], decoPos: G.decoPos || {},
    family: G.family.map(p => ({id: p.id, name: p.name, species: p.species, breed: p.breed, motto: p.motto || "", photo: photos ? (p.photo || null) : null}))};
}

/* ---------- lantern drawing ---------- */
const lanternArt = (() => {
  const c = document.createElement("canvas"), w = 64, h = 84; c.width = w; c.height = h; const x = c.getContext("2d");
  x.translate(w/2, h/2); const bw = 52, bh = 68;
  x.beginPath(); x.moveTo(-bw*.42,-bh*.5); x.bezierCurveTo(-bw*.62,-bh*.15,-bw*.58,bh*.35,-bw*.36,bh*.5); x.lineTo(bw*.36,bh*.5); x.bezierCurveTo(bw*.58,bh*.35,bw*.62,-bh*.15,bw*.42,-bh*.5); x.quadraticCurveTo(0,-bh*.62,-bw*.42,-bh*.5); x.closePath();
  const g = x.createLinearGradient(0,-bh/2,0,bh/2); g.addColorStop(0,"#f7c98d"); g.addColorStop(.6,"#ffd9a0"); g.addColorStop(1,"#fff1c9"); x.fillStyle = g; x.fill();
  x.save(); x.clip(); const rg = x.createRadialGradient(0,bh*.32,0,0,bh*.32,bw*.7); rg.addColorStop(0,"rgba(255,250,220,.95)"); rg.addColorStop(1,"rgba(255,230,180,0)"); x.fillStyle = rg; x.fillRect(-bw,-bh,2*bw,2*bh);
  x.strokeStyle = "rgba(205,140,90,.35)"; x.lineWidth = 2; for (const t of [-.2,.2]) { x.beginPath(); x.moveTo(t*bw,-bh*.55); x.quadraticCurveTo(t*bw*1.4,0,t*bw*.9,bh*.5); x.stroke(); }
  let s = 7; const r = () => (s = (s*9301+49297)%233280)/233280;
  for (let i = 0; i < 260; i++) { x.fillStyle = r() < .5 ? "rgba(255,255,255,.35)" : "rgba(120,70,40,.16)"; x.fillRect((r()-.5)*bw, (r()-.5)*bh, 1.4, 1.4); }
  x.restore();
  x.fillStyle = "rgba(180,120,80,.55)"; x.beginPath(); x.ellipse(0, bh*.5, bw*.36, 3, 0, 0, 7); x.fill();
  return c;
})();
const lanternGlow = (() => { const c = document.createElement("canvas"), n = 128; c.width = c.height = n; const x = c.getContext("2d"); const g = x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2); g.addColorStop(0,"rgba(255,190,110,.55)"); g.addColorStop(.45,"rgba(255,190,110,.2)"); g.addColorStop(1,"rgba(255,190,110,0)"); x.fillStyle = g; x.fillRect(0,0,n,n); return c; })();
let lanternHits = [];
try { $("lanternSkyImg").src = lanternArt.toDataURL(); } catch (e) {}
function lanternSpot(l){
  let h = 2166136261; for (const ch of String(l.id)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const u = (k) => ((h >>> (k*5)) & 1023)/1023;
  return {u1: u(0), u2: u(1), u3: u(2), u4: u(3)};
}
function drawSkyLanterns(t){
  lanternHits = [];
  if (!lanternMode || !lanterns.length || !W) return;
  // depth: the newest lantern is close (big, low, bright); each older one has drifted further away (smaller, higher, fainter, toward the middle)
  const list = lanterns.slice(0, 40), n = list.length, top = 92 - camLift, bot = Math.max(top + 80, groundY*0.86), now = performance.now(), cx = W/2;
  const glowA = 0.45 + 0.55*(typeof NIGHT === "number" ? NIGHT : 0), base = Math.min(1.35, Math.max(0.85, W/400));
  const placed = list.map((l, i) => {
    const q = lanternSpot(l), near = n <= 1 ? 1 : Math.max(0.1, Math.pow(0.87, i));
    const s = base*(0.3 + 0.9*near);
    const u = (q.u1*0.35 + i*0.618034) % 1, hx = (0.06 + 0.88*u)*W;          // golden-ratio spread so neighbours don't pile up
    let x = hx + Math.sin(t*0.23 + q.u4*9)*5*near;                          // use the whole width; height alone carries the distance
    const yn = Math.max(0.02, Math.min(0.96, 0.05 + 0.78*near + (q.u2 - 0.5)*(0.12 + 0.3*(1 - near))));
    let y = top + yn*(bot - top) + Math.sin(t*0.6 + q.u1*6)*3*(0.4 + 0.6*near);
    let a = 0.3 + 0.7*near;
    if (l.born) { const p = Math.min(1, (now - l.born)/5200), e = 1 - Math.pow(1 - p, 3); y = (groundY + 40) + (y - groundY - 40)*e; a *= Math.min(1, p*3); if (p >= 1) l.born = 0; }
    return {l, x, y, s, a, near};
  });
  mctx.save(); mctx.imageSmoothingEnabled = true;
  for (let k = placed.length - 1; k >= 0; k--) {           // far ones first, the near ones on top
    const {l, x, y, s, a, near} = placed[k], w = 26*s, h = 34*s, gr = 120*s;
    mctx.globalAlpha = a*glowA*(0.55 + 0.45*near); mctx.drawImage(lanternGlow, x - gr/2, y - gr/2, gr, gr);
    mctx.globalAlpha = a; mctx.drawImage(lanternArt, x - w*0.62, y - h*0.62, w*1.23, h*1.23);
    lanternHits.push({l, x, y, r: Math.max(18, 20*s)});
  }
  mctx.restore();
}

/* ---------- name tag / owner remove ---------- */
let tagFor = null, tagT = null;
function showLanternTag(l, cx, cy){
  const tag = $("lanternTag"); tagFor = l;
  const d = new Date(l.at || Date.now()), when = `${d.getMonth()+1}월 ${d.getDate()}일`;
  const mine = !VISIT && l.by_owner;
  $("lanternTagText").textContent = (mine ? "내가 띄운 풍등" : (l.name ? `${l.name} 님의 풍등${l.by_owner ? " · 마당 주인" : ""}` : "누군가 띄운 풍등")) + " · " + when;
  $("lanternDel").hidden = !!VISIT;
  tag.hidden = false;
  const r = tag.getBoundingClientRect();
  tag.style.left = Math.round(Math.min(window.innerWidth - r.width - 10, Math.max(10, cx - r.width/2))) + "px";
  tag.style.top = Math.round(Math.max(70, cy - r.height - 24)) + "px";
  clearTimeout(tagT); tagT = setTimeout(() => { tag.hidden = true; }, 4000);
}
$("lanternDel").addEventListener("click", async () => {
  const l = tagFor; if (!l) return; $("lanternTag").hidden = true;
  if (G.share && !String(l.id).startsWith("p")) {
    try { await syRpc("sy_delete_lantern", {p_code: G.share.code, p_secret: G.share.secret, p_id: l.id}); } catch (e) { toast(syErr(e)); return; }
  } else { G.lanterns = (G.lanterns || []).filter(x => x.id !== l.id); save(); }
  lanterns = lanterns.filter(x => x !== l); toast("풍등을 내렸어요");
});

/* ---------- canvas taps: lanterns (and, while visiting, nothing else) ---------- */
(() => {
  const stage = document.querySelector(".stage");
  stage.addEventListener("pointerdown", (ev) => {
    if (!lanternMode) return;
    const inUi = ev.target.closest && ev.target.closest(".visit-bar,.veil,.lantern-tag,#visitCover,.toast");
    if (inUi) return;
    const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left)/camZ, y = (ev.clientY - r.top)/camZ - camLift;
    if (!VISIT) for (let i = lanternHits.length - 1; i >= 0; i--) { const h = lanternHits[i]; if (Math.hypot(h.x - x, h.y - y) < h.r) { ev.stopPropagation(); showLanternTag(h.l, ev.clientX, ev.clientY); return; } }
    ev.stopPropagation(); if (ev.target === cv) ev.preventDefault();
  }, true);
})();

/* ---------- launching ---------- */
let launchAs = null;
function askLantern(){ if (launchedToday()) { toast("오늘은 이미 풍등을 띄웠어요. 내일 또 띄워 주세요"); return; } $("lanternName").value = vname(); openVeil("lanternVeil"); setTimeout(() => $("lanternName").focus(), 60); }
$("lanternForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const name = $("lanternName").value.trim().slice(0, 12);
  if (!name) { $("lanternName").focus(); return; }
  try { localStorage.setItem(VKEY, name); } catch (e) {}
  closeVeil("lanternVeil");
  if (VISIT) {
    try { const r0 = await syRpc("sy_add_lantern", {p_code: VISIT, p_name: name, p_device: deviceId}), l = {id: r0.id, at: r0.at}; l.born = performance.now(); lanterns.unshift(l); markLaunched(); toast("풍등이 하늘로 올라가요"); }
    catch (e) { if (/one_per_day/.test(e.message)) markLaunched(); toast(syErr(e)); }
  } else if (G.share) {
    try { const l = await syRpc("sy_add_lantern", {p_code: G.share.code, p_name: name, p_device: deviceId, p_secret: G.share.secret}); l.born = performance.now(); lanterns.unshift(l); markLaunched(); toast("풍등이 하늘로 올라가요"); }
    catch (e) { if (/one_per_day/.test(e.message)) markLaunched(); toast(syErr(e)); }
  } else {
    const l = {id: uid(), name, by_owner: true, at: new Date().toISOString()};
    G.lanterns = [l].concat(G.lanterns || []).slice(0, 40); save();
    lanterns.unshift(Object.assign({born: performance.now()}, l)); markLaunched(); toast("풍등이 하늘로 올라가요");
  }
});

/* ---------- owner: share settings ---------- */
function renderShare(){
  const on = !!G.share;
  $("shareOff").hidden = on; $("shareOn").hidden = !on; $("shareStopConfirm").hidden = true;
  $("sharePhotos").checked = !!G.sharePhotos;
  if (on) $("shareCode").textContent = G.share.code;
}
const copyText = async (txt, ok) => { try { await navigator.clipboard.writeText(txt); toast(ok); } catch (e) { toast(G.share ? "코드: " + G.share.code : txt); } };
$("settingsBtn").addEventListener("click", renderShare);
$("sharePhotos").addEventListener("change", () => { G.sharePhotos = $("sharePhotos").checked; save(); });
$("shareMake").addEventListener("click", async () => {
  const b = $("shareMake"); b.disabled = true; b.textContent = "만드는 중…";
  try {
    const r = await syRpc("sy_create_share", {p_snapshot: shareSnapshot()});
    G.share = {code: r.code, secret: r.secret}; save(); syncedStr = "";
    for (const l of (G.lanterns || []).slice(0, 10).reverse()) { try { await syRpc("sy_add_lantern", {p_code: r.code, p_name: l.name, p_device: deviceId + "-" + l.id, p_secret: r.secret}); } catch (e) {} }
    G.lanterns = []; save(); await pullLanterns(); renderShare(); toast("공유 코드를 만들었어요");
  } catch (e) { toast(syErr(e)); }
  b.disabled = false; b.textContent = "공유 코드 만들기";
});
$("shareCopyCode").addEventListener("click", () => G.share && copyText(G.share.code, "코드를 복사했어요"));
$("shareCopyLink").addEventListener("click", () => G.share && copyText(`${(G.yardName || "별빛 마당")}에 놀러 와요\n${SY_LINK}?visit=${G.share.code}\n(공유 코드: ${G.share.code})`, "링크를 복사했어요"));
$("shareStop").addEventListener("click", () => { $("shareStopConfirm").hidden = false; });
$("shareStopNo").addEventListener("click", () => { $("shareStopConfirm").hidden = true; });
$("shareStopYes").addEventListener("click", async () => {
  if (!G.share) return;
  try { await syRpc("sy_stop_share", {p_code: G.share.code, p_secret: G.share.secret}); } catch (e) { toast(syErr(e)); return; }
  delete G.share; save(); lanterns = (G.lanterns || []).slice(); renderShare(); toast("공유를 그만했어요");
});
$("lanternMine").addEventListener("click", () => { closeVeil("settingsVeil"); enterLanternMode(); });
$("visitGo").addEventListener("click", () => {
  const c = $("visitCodeInput").value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (c.length < 4) { toast("공유 코드를 확인해 주세요"); return; }
  if (G.share && c === G.share.code) { toast("내 마당의 코드예요"); return; }
  location.href = location.pathname + "?visit=" + c;
});

/* keep the shared copy up to date + fetch lanterns */
let syncedStr = "", syncedAt = 0, syncing = false;
async function pushShare(){
  if (VISIT || !G.share || syncing || G.updatedAt === syncedAt) return;
  const snap = JSON.stringify(shareSnapshot()); syncedAt = G.updatedAt;
  if (snap === syncedStr) return;
  syncing = true;
  try { const ok = await syRpc("sy_update_share", {p_code: G.share.code, p_secret: G.share.secret, p_snapshot: JSON.parse(snap)}); if (ok) syncedStr = snap; } catch (e) { syncedAt = 0; }
  syncing = false;
}
async function pullLanterns(){
  const code = VISIT || (G.share && G.share.code); if (!code) return null;
  try {
    const y = await syRpc("sy_get_yard", VISIT ? {p_code: code} : {p_code: code, p_secret: G.share.secret}); if (!y) return null;
    const born = new Map(lanterns.filter(l => l.born).map(l => [l.id, l.born]));
    lanterns = (y.lanterns || []).map(l => Object.assign(l, born.has(l.id) ? {born: born.get(l.id)} : {}));
    return y;
  } catch (e) { return null; }
}
if (!VISIT) {
  lanterns = (G.lanterns || []).slice();
  if (G.share) { pullLanterns(); setTimeout(pushShare, 3000); }
  setInterval(pushShare, 5000);
  setInterval(() => { if (!document.hidden && G.share) pullLanterns(); }, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && G.share) pullLanterns(); });
}

/* ---------- visitor ---------- */
if (VISIT) {
  window.__syVisit = VISIT;
  const cover = $("visitCover");
  const fail = (msg) => { $("visitCoverText").textContent = msg; $("visitCoverHome").hidden = false; };
  $("visitCoverHome").addEventListener("click", () => { location.href = location.pathname; });
  $("visitHome").addEventListener("click", () => { location.href = location.pathname; });
  $("visitLantern").addEventListener("click", askLantern);
  (async () => {
    let y = null;
    try { y = await syRpc("sy_get_yard", {p_code: VISIT}); } catch (e) { fail("지금은 친구 마당에 갈 수 없어요. 연결을 확인해 주세요."); return; }
    if (!y || !y.snapshot || !Array.isArray(y.snapshot.family) || !y.snapshot.family.length) { fail("이 공유 코드의 마당을 찾을 수 없어요."); return; }
    const s = y.snapshot;
    G = Object.assign(JSON.parse(JSON.stringify(SAMPLE)), {family: s.family, yardName: s.yardName, sky: s.sky, warmth: s.warmth, blooms: s.blooms, bloomSpots: s.bloomSpots, hidden: s.hidden, decoPos: s.decoPos, stars: [], set: true, guideSeen: true, lastVisit: Date.now()});
    normalize();
    ["setupVeil", "guideVeil", "settingsVeil", "letterVeil"].forEach(id => { const v = $(id); if (v) v.hidden = true; });
    setupOpen = false; ents = []; syncEnts();
    ents.forEach((e, i) => { e.x = W*(0.15 + 0.7*((i + 0.5)/Math.max(1, ents.length))); e.depth = dMin + (dMax - dMin)*(0.35 + 0.3*((i*37) % 10)/10); sitFront(e, rand(3, 6)); });
    try { glows = []; decCache.clear(); } catch (e) {}
    renderHud();
    lanterns = (y.lanterns || []).slice();
    $("visitWho").textContent = `${yardTitleText()}에 놀러 왔어요`;
    $("dock").hidden = true; $("visitBar").hidden = false; lanternMode = true; document.documentElement.classList.add("lantern-mode");
    cover.classList.add("done"); setTimeout(() => cover.remove(), 600);
    setInterval(() => { if (!document.hidden) pullLanterns(); }, 45000);
  })();
}
function yardTitleText(){ try { return ($("yardName") || {}).textContent || "친구 마당"; } catch (e) { return "친구 마당"; } }

/* ---------- lantern mode: only the pets, the yard and the lanterns ---------- */
function lanternCountText(){ const n = lanterns.length; $("lanternCount").textContent = n ? `풍등 ${n}개` : "아직 풍등이 없어요"; }
function enterLanternMode(){
  if (VISIT || lanternMode) return;
  if (typeof decoEditing !== "undefined" && decoEditing) setDecoEditing(false);
  try { setBallMode(false); } catch (e) {}
  lanternMode = true; glows = []; bubble = null;
  document.documentElement.classList.add("lantern-mode");
  $("dock").hidden = true; $("lanternBar").hidden = false; lanternCountText();
  if (G.share) pullLanterns().then(lanternCountText);
  if (!G.lanternTip) { G.lanternTip = true; save(); setTimeout(() => toast("풍등을 누르면 누가 띄웠는지 보여요"), 500); }
}
function exitLanternMode(){
  lanternMode = false; $("lanternTag").hidden = true;
  document.documentElement.classList.remove("lantern-mode");
  $("lanternBar").hidden = true; $("dock").hidden = false;
}
$("lanternBtn").addEventListener("click", enterLanternMode);
$("lanternExit").addEventListener("click", exitLanternMode);
$("lanternLaunch").addEventListener("click", askLantern);
setInterval(() => { if (lanternMode && !VISIT) lanternCountText(); }, 1000);
