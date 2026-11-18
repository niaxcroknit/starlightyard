
/* ===== cloud save with email login (Claude) =====
 * Sign in with an emailed 6-digit code; the yard is copied to the person's own row (sy_saves, RLS: only them).
 * Never overwrites a yard silently: if this phone and the server both have a yard and they differ, the person chooses. */
const SB_URL = "https://rbtodhdjwumkmlnpdmcm.supabase.co", AKEY = "starlight-yard-auth";
var cloud = (() => { try { return JSON.parse(localStorage.getItem(AKEY) || "null"); } catch (e) { return null; } })();
const cloudStore = () => { try { cloud ? localStorage.setItem(AKEY, JSON.stringify(cloud)) : localStorage.removeItem(AKEY); } catch (e) {} };
async function sbFetch(path, opt){
  const r = await fetch(SB_URL + path, opt); const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
  if (!r.ok) { const err = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ("http " + r.status)); err.status = r.status; err.code = j && (j.error_code || j.code); throw err; }
  return j;
}
const authHeaders = () => ({apikey: SY_KEY, "Content-Type": "application/json"});
async function cloudToken(){
  if (!cloud) return null;
  if (cloud.expires_at && Date.now()/1000 < cloud.expires_at - 60) return cloud.access_token;
  try {
    const s = await sbFetch("/auth/v1/token?grant_type=refresh_token", {method: "POST", headers: authHeaders(), body: JSON.stringify({refresh_token: cloud.refresh_token})});
    cloud = {access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Date.now()/1000 + (s.expires_in || 3600)), email: (s.user && s.user.email) || cloud.email, uid: (s.user && s.user.id) || cloud.uid};
    cloudStore(); return cloud.access_token;
  } catch (e) { if (e.status === 400 || e.status === 401) { cloud = null; cloudStore(); renderCloud(); } return null; }
}
async function cloudGet(){
  const tk = await cloudToken(); if (!tk) return undefined;
  const rows = await sbFetch(`/rest/v1/sy_saves?select=data,updated_at&user_id=eq.${cloud.uid}`, {headers: Object.assign(authHeaders(), {Authorization: "Bearer " + tk})});
  return rows && rows[0] ? rows[0] : null;
}
async function cloudPut(){
  const tk = await cloudToken(); if (!tk) return false;
  await sbFetch("/rest/v1/sy_saves?on_conflict=user_id", {method: "POST", headers: Object.assign(authHeaders(), {Authorization: "Bearer " + tk, Prefer: "resolution=merge-duplicates,return=minimal"}),
    body: JSON.stringify({user_id: cloud.uid, data: G, updated_at: new Date().toISOString()})});
  return true;
}
var cloudTimer = null, cloudBusy = false, cloudDirty = false, cloudReady = false, cloudLast = 0, cloudErr = "";
function cloudQueue(){ if (typeof cloudReady === "undefined" || !cloud || !cloudReady || window.__syVisit) return; cloudDirty = true; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudFlush, 2500); }
async function cloudFlush(){
  if (!cloudDirty || cloudBusy || !cloud || !cloudReady || window.__syVisit) return;
  cloudBusy = true; cloudDirty = false;
  try { await cloudPut(); cloudLast = Date.now(); cloudErr = ""; } catch (e) { cloudDirty = true; cloudErr = /size|8000000|check/i.test(e.message) ? "사진이 너무 커서 저장하지 못했어요" : "인터넷이 연결되면 다시 저장할게요"; }
  cloudBusy = false; renderCloud();
  if (cloudDirty) { clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudFlush, 15000); }
}
const yardSummary = (d) => { const f = (d && d.family) || []; return `${f.map(p => p.name).filter(Boolean).join(", ") || "이름 없음"} · 별 편지 ${(d && d.stars || []).length}개`; };
const fmtWhen = (ms) => { const d = new Date(ms); return `${d.getMonth()+1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
function applyCloudData(data){
  G = Object.assign(JSON.parse(JSON.stringify(SAMPLE)), JSON.parse(JSON.stringify(data)));
  normalize();
  try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch (e) {}
  ents = []; afterLoad(); try { glows = []; decCache.clear(); } catch (e) {}
  if (typeof lanterns !== "undefined") lanterns = (G.lanterns || []).slice();
}
/* after sign-in or on app start: line the phone and the server up */
function markLinked(){ cloudReady = true; if (cloud && !cloud.linked) { cloud.linked = true; cloudStore(); } }
async function cloudReconcile(fromLogin){
  if (!cloud || window.__syVisit) return;
  fromLogin = fromLogin || !cloud.linked;   // until this phone has been lined up once, always ask instead of choosing by time
  let row;
  try { row = await cloudGet(); } catch (e) { cloudErr = "인터넷이 연결되면 다시 맞출게요"; renderCloud(); return; }
  if (row === undefined) return;
  const localHas = !!(G.set && G.family && G.family.length), server = row && row.data, serverHas = !!(server && server.set && server.family && server.family.length);
  if (!serverHas) { markLinked(); cloudDirty = true; await cloudFlush(); if (fromLogin) toast("이 폰의 마당을 서버에 저장했어요"); return; }
  if (!localHas) { applyCloudData(server); markLinked(); cloudLast = Date.now(); renderCloud(); toast("서버에 저장된 마당을 불러왔어요"); return; }
  if ((server.updatedAt || 0) === (G.updatedAt || 0)) { markLinked(); cloudLast = Date.now(); renderCloud(); return; }
  if (!fromLogin && (G.updatedAt || 0) > (server.updatedAt || 0)) { markLinked(); cloudDirty = true; cloudFlush(); return; }      // this phone has newer changes
  if (!fromLogin && (server.updatedAt || 0) > (G.updatedAt || 0)) { applyCloudData(server); markLinked(); cloudLast = Date.now(); renderCloud(); return; } // changed on another phone
  // both have a yard and they differ: let the person choose, never overwrite silently
  $("cloudPickPhone").textContent = `이 폰의 마당 · ${yardSummary(G)} · ${fmtWhen(G.updatedAt || Date.now())}`;
  $("cloudPickServer").textContent = `서버의 마당 · ${yardSummary(server)} · ${fmtWhen(server.updatedAt || Date.parse(row.updated_at))}`;
  $("cloudPick").hidden = false; closeVeil("settingsVeil"); openVeil("cloudVeil");
  cloudPending = server;
}
var cloudPending = null;
$("cloudPickPhone").addEventListener("click", async () => { closeVeil("cloudVeil"); G.updatedAt = Date.now(); try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch (e) {} markLinked(); cloudDirty = true; await cloudFlush(); toast("이 폰의 마당으로 서버를 맞췄어요"); });
$("cloudPickServer").addEventListener("click", () => { closeVeil("cloudVeil"); if (cloudPending) applyCloudData(cloudPending); markLinked(); cloudLast = Date.now(); renderCloud(); toast("서버의 마당을 불러왔어요"); });

/* settings UI */
function renderCloud(){
  const on = !!cloud;
  $("cloudOff").hidden = on; $("cloudOn").hidden = !on;
  if (on) $("cloudStatus").textContent = `${cloud.email || "내 이메일"}로 저장하고 있어요.` + (cloudErr ? " " + cloudErr : cloudLast ? ` 마지막 저장 ${fmtWhen(cloudLast)}` : "");
}
$("settingsBtn").addEventListener("click", () => { renderCloud(); $("cloudCodeRow").hidden = true; });
var cloudEmail = "";
$("cloudSend").addEventListener("click", async () => {
  const em = $("cloudEmail").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast("이메일 주소를 확인해 주세요"); return; }
  const b = $("cloudSend"); b.disabled = true;
  try { await sbFetch("/auth/v1/otp", {method: "POST", headers: authHeaders(), body: JSON.stringify({email: em, create_user: true})}); cloudEmail = em; $("cloudCodeRow").hidden = false; $("cloudCode").value = ""; setTimeout(() => $("cloudCode").focus(), 60); toast("메일로 숫자 6개를 보냈어요"); }
  catch (e) { toast(e.status === 429 ? "메일을 너무 자주 보냈어요. 잠시 뒤에 다시 해 주세요" : "메일을 보내지 못했어요. 잠시 뒤에 다시 해 주세요"); }
  b.disabled = false;
});
$("cloudVerify").addEventListener("click", async () => {
  const code = $("cloudCode").value.replace(/\D/g, "");
  if (code.length < 6) { toast("메일로 받은 숫자 6개를 넣어 주세요"); return; }
  const b = $("cloudVerify"); b.disabled = true;
  try {
    const s = await sbFetch("/auth/v1/verify", {method: "POST", headers: authHeaders(), body: JSON.stringify({type: "email", email: cloudEmail, token: code})});
    cloud = {access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Date.now()/1000 + (s.expires_in || 3600)), email: s.user && s.user.email, uid: s.user && s.user.id};
    cloudStore(); $("cloudCodeRow").hidden = true; renderCloud(); await cloudReconcile(true);
  } catch (e) { toast("숫자가 맞지 않거나 시간이 지났어요. 다시 받아 주세요"); }
  b.disabled = false;
});
$("cloudOut").addEventListener("click", () => { cloud = null; cloudReady = false; cloudStore(); renderCloud(); toast("로그아웃했어요. 이 폰의 마당은 그대로 있어요"); });

if (cloud && !window.__syVisit && !VISIT) { setTimeout(() => cloudReconcile(false), 1500); }
document.addEventListener("visibilitychange", () => { if (!document.hidden && cloud && cloudReady && !VISIT) { if (cloudDirty) cloudFlush(); } });
window.addEventListener("pagehide", () => { if (cloudDirty) cloudFlush(); });
$("setupCloud").hidden = !!G.set;
$("setupCloud").addEventListener("click", () => { renderCloud(); $("cloudCodeRow").hidden = true; openVeil("settingsVeil"); setTimeout(() => { const s = document.querySelector(".cloud"); if (s) s.scrollIntoView({block: "center"}); $("cloudEmail").focus(); }, 80); });
