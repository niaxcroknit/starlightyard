
/* ===== seasons + keep-a-letter card (Claude) ===== */

/* ---------- seasons: the yard follows the calendar (or a fixed season from settings) ---------- */
function seasonNow(){
  const s = G.season || "auto";
  if (s !== "auto") return s;
  const m = new Date().getMonth() + 1;
  return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
}
const SEASON_FX = {
  spring: {kind: "petal", count: () => has("tree") ? 22 : 14},
  summer: {kind: "none",  count: () => 0},
  autumn: {kind: "leaf",  count: () => 16},
  winter: {kind: "snow",  count: () => 46},
  off:    {kind: "petal", count: () => has("tree") ? 16 : 8},     // the yard as it was before seasons
};
function seasonFx(){ const f = SEASON_FX[seasonNow()] || SEASON_FX.off; return {kind: f.kind, count: f.count()}; }
const LEAF_COLS = ["#e9a25e", "#d9784e", "#f1c56c", "#c9894f"];
function newFlake(kind, anywhere){
  const p = {kind, x: Math.random()*W, y: anywhere ? Math.random()*(groundY + dMax) : -10 - Math.random()*H*0.5, ph: rand(0, 6), z: rand(0.7, 1.4)};
  if (kind === "snow") { p.vy = rand(10, 22); p.z = rand(0.55, 1.35); p.c = "#ffffff"; }
  else if (kind === "leaf") { p.vy = rand(14, 26); p.c = pick(LEAF_COLS); p.spin = rand(-1.6, 1.6); }
  else { p.vy = rand(12, 24); p.c = Math.random() < 0.6 ? "#ffc2d6" : "#ffe6ef"; }
  return p;
}
function seasonUpdatePetals(dt){
  const ss = seasonFx(), slow = RM ? 0.4 : 1;
  if (petals.length > ss.count) petals.length = ss.count;
  while (petals.length < ss.count) petals.push(newFlake(ss.kind, petals.length < ss.count*0.6 && !petals.__warm));
  petals.__warm = true;
  for (let i = 0; i < petals.length; i++) {
    const p = petals[i];
    p.ph += dt;
    const sway = p.kind === "snow" ? Math.sin(p.ph*0.9)*10 : p.kind === "leaf" ? Math.sin(p.ph*1.1)*22 + 4 : Math.sin(p.ph*1.3)*16 + 6;
    p.y += p.vy*p.z*dt*slow; p.x += sway*dt*slow;
    if (p.y > groundY + dMax + 20 || p.x > W + 14 || p.x < -14) petals[i] = newFlake(ss.kind, false);
  }
}
const snowDot = (() => { const c = document.createElement("canvas"), n = 32; c.width = c.height = n; const x = c.getContext("2d"); const g = x.createRadialGradient(n/2, n/2, 0, n/2, n/2, n/2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.45, "rgba(255,255,255,.85)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, n, n); return c; })();
function drawFlake(p){
  if (p.kind === "snow") {
    const r = P*p.z*1.9; mctx.save(); mctx.globalAlpha = 0.92; mctx.drawImage(snowDot, p.x - r, p.y - r, r*2, r*2); mctx.restore(); return;
  }
  mctx.save(); mctx.translate(p.x, p.y);
  if (p.kind === "leaf") {
    mctx.rotate(p.ph*(p.spin || 1)*0.8); const a = P*p.z*1.9, b = P*p.z*1.0;
    mctx.fillStyle = NIGHT > 0.6 ? "#b9a3b6" : p.c; mctx.globalAlpha = 0.9;
    mctx.beginPath(); mctx.ellipse(0, 0, a, b, 0, 0, Math.PI*2); mctx.fill();
    mctx.strokeStyle = "rgba(120,70,40,.35)"; mctx.lineWidth = Math.max(0.6, P*0.25); mctx.beginPath(); mctx.moveTo(-a*0.9, 0); mctx.lineTo(a*0.9, 0); mctx.stroke();
  } else {
    mctx.rotate(Math.sin(p.ph)*.8); mctx.fillStyle = NIGHT > .6 ? "#e6d9ed" : p.c; mctx.globalAlpha = .8;
    mctx.beginPath(); mctx.ellipse(0, 0, P*p.z*1.2, P*p.z*.65, 0, 0, Math.PI*2); mctx.fill();
  }
  mctx.restore();
}

/* what lies on the ground: snow in winter, fallen leaves in autumn, a few petals in spring */
let groundFx = null;
function buildGroundFx(season){
  const c = document.createElement("canvas"), w = Math.max(1, Math.round(W)), h = Math.max(1, Math.round(H - groundY + 60));
  c.width = w; c.height = h; const x = c.getContext("2d");
  let s = 11; const r = () => (s = (s*9301 + 49297) % 233280)/233280;
  if (season === "winter") {
    // soft drifts: a white blanket that's thicker toward the front, made of many rounded clay-like lumps
    const top = 52, g = x.createLinearGradient(0, top - 14, 0, h); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.08, "rgba(250,251,255,.78)"); g.addColorStop(1, "rgba(246,247,253,.9)");
    x.fillStyle = g; x.fillRect(0, top - 14, w, h - top + 14);
    for (let i = 0; i < 140; i++) { const px = r()*w, py = top + Math.pow(r(), 0.8)*(h - top), rx = 14 + r()*46, ry = rx*(0.28 + r()*0.12);
      const gg = x.createRadialGradient(px - rx*0.25, py - ry*0.5, 1, px, py, rx); gg.addColorStop(0, "rgba(255,255,255,.75)"); gg.addColorStop(1, "rgba(225,228,242,0)");
      x.fillStyle = gg; x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, Math.PI*2); x.fill(); }
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(190,196,222,${0.12 + r()*0.12})`; x.beginPath(); x.ellipse(r()*w, top + r()*(h - top), 6 + r()*18, 1.5 + r()*2, 0, 0, Math.PI*2); x.fill(); }   // gentle shadows in the snow
  } else if (season === "autumn") {
    for (let i = 0; i < 46; i++) { const px = r()*w, py = 60 + Math.pow(r(), 0.7)*(h - 70), k = 0.6 + (py/h)*0.9;
      x.save(); x.translate(px, py); x.rotate(r()*Math.PI); x.fillStyle = LEAF_COLS[Math.floor(r()*LEAF_COLS.length)]; x.globalAlpha = 0.85;
      x.beginPath(); x.ellipse(0, 0, 5.5*k*P/2.6, 2.8*k*P/2.6, 0, 0, Math.PI*2); x.fill(); x.restore(); }
  } else if (season === "spring") {
    for (let i = 0; i < 34; i++) { const px = r()*w, py = 60 + Math.pow(r(), 0.7)*(h - 70), k = 0.6 + (py/h)*0.8;
      x.save(); x.translate(px, py); x.rotate(r()*Math.PI); x.fillStyle = r() < 0.6 ? "#ffc2d6" : "#ffe6ef"; x.globalAlpha = 0.85;
      x.beginPath(); x.ellipse(0, 0, 3.4*k*P/2.6, 1.9*k*P/2.6, 0, 0, Math.PI*2); x.fill(); x.restore(); }
  }
  return {season, w, h, gy: groundY, c};
}
function drawSeasonGround(){
  const season = seasonNow();
  if (season === "summer" || season === "off") return;
  if (!groundFx || groundFx.season !== season || groundFx.w !== Math.round(W) || groundFx.gy !== groundY) groundFx = buildGroundFx(season);
  mctx.drawImage(groundFx.c, 0, groundY - 60);
}

/* settings: which season the yard shows */
(() => {
  const sel = $("seasonSel"); if (!sel) return;
  $("settingsBtn").addEventListener("click", () => { sel.value = G.season || "auto"; });
  sel.addEventListener("change", () => { G.season = sel.value; petals.length = 0; petals.__warm = false; groundFx = null; save(); });
})();

/* ---------- keep a star letter: save it as a picture card ---------- */
function wrapLines(ctx, text, maxW){
  const out = [];
  for (const para of String(text).split(/\n/)) {
    let line = "";
    for (const ch of Array.from(para)) {
      const t = line + ch;
      if (ctx.measureText(t).width > maxW && line) {
        // break at the last space when possible, so Korean words stay together
        const cut = line.lastIndexOf(" ");
        if (cut > 0 && line.length - cut < 10) { out.push(line.slice(0, cut)); line = line.slice(cut + 1) + ch; }
        else { out.push(line); line = ch; }
      } else line = t;
    }
    out.push(line);
  }
  return out;
}
function letterCard(st){
  const W2 = 1080, H2 = 1350, c = document.createElement("canvas"); c.width = W2; c.height = H2; const x = c.getContext("2d");
  const font = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR","Segoe UI",sans-serif';
  // night sky like the yard's
  const g = x.createLinearGradient(0, 0, 0, H2); g.addColorStop(0, "#4b4374"); g.addColorStop(0.55, "#7d6b9e"); g.addColorStop(1, "#d6b4c9"); x.fillStyle = g; x.fillRect(0, 0, W2, H2);
  let s = 7; const r = () => (s = (s*9301 + 49297) % 233280)/233280;
  for (let i = 0; i < 2600; i++) { x.fillStyle = r() < 0.5 ? "rgba(255,255,255,.035)" : "rgba(40,20,60,.04)"; x.fillRect(r()*W2, r()*H2, 2, 2); }   // paper-like grain
  for (let i = 0; i < 46; i++) { const px = r()*W2, py = r()*H2*0.42, rr = 1.2 + r()*2.4; const sg = x.createRadialGradient(px, py, 0, px, py, rr*4); sg.addColorStop(0, "rgba(255,240,205,.95)"); sg.addColorStop(1, "rgba(255,240,205,0)"); x.fillStyle = sg; x.beginPath(); x.arc(px, py, rr*4, 0, 7); x.fill(); }
  // one big soft star
  const cx = W2/2, cy = 168;
  const glow = x.createRadialGradient(cx, cy, 0, cx, cy, 150); glow.addColorStop(0, "rgba(255,226,150,.55)"); glow.addColorStop(1, "rgba(255,226,150,0)"); x.fillStyle = glow; x.fillRect(cx - 160, cy - 160, 320, 320);
  x.save(); x.translate(cx, cy); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? 26 : 56; x.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); } x.closePath();
  x.lineJoin = "round"; x.lineWidth = 16; x.strokeStyle = "#ffd978"; x.stroke(); const sf = x.createRadialGradient(-8, -10, 2, 0, 0, 60); sf.addColorStop(0, "#fff8d6"); sf.addColorStop(0.6, "#ffe08a"); sf.addColorStop(1, "#f5c66b"); x.fillStyle = sf; x.fill(); x.restore();
  // paper
  const px = 90, py = 300, pw = W2 - 180, ph = H2 - 300 - 150;
  x.save(); x.shadowColor = "rgba(40,24,60,.28)"; x.shadowBlur = 40; x.shadowOffsetY = 14; x.fillStyle = "#fffaf4"; roundedPath(x, px, py, pw, ph, 44); x.fill(); x.restore();
  x.strokeStyle = "rgba(233,167,186,.55)"; x.lineWidth = 3; x.setLineDash([12, 10]); roundedPath(x, px + 22, py + 22, pw - 44, ph - 44, 30); x.stroke(); x.setLineDash([]);
  // to / text / date
  x.fillStyle = "#645163"; x.font = `700 46px ${font}`; x.textBaseline = "top"; x.fillText(toName(st.to), px + 70, py + 70);
  let size = 40, lines; const maxW = pw - 140, maxH = ph - 260;
  for (; size >= 26; size -= 2) { x.font = `400 ${size}px ${font}`; lines = wrapLines(x, st.text, maxW); if (lines.length*size*1.75 <= maxH) break; }
  x.fillStyle = "#4f3f50"; lines.forEach((ln, i) => x.fillText(ln, px + 70, py + 160 + i*size*1.75));
  x.fillStyle = "#96849a"; x.font = `400 30px ${font}`; x.textAlign = "right"; x.fillText(fmtDate(st.at), px + pw - 70, py + ph - 90);
  x.textAlign = "center"; x.fillStyle = "rgba(255,255,255,.88)"; x.font = `600 30px ${font}`; x.fillText("별이 된 너에게", W2/2, H2 - 92);
  return c;
}
async function keepLetter(){
  const st = G.stars.find(s => s.id === readingId); if (!st) return;
  const c = letterCard(st), d = new Date(st.at), name = `별편지-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}.png`;
  const blob = await new Promise(res => c.toBlob(res, "image/png"));
  if (!blob) { toast("이미지를 만들지 못했어요"); return; }
  if (window.StarlightAndroid && window.StarlightAndroid.saveImage) { window.StarlightAndroid.saveImage(name, c.toDataURL("image/png").split(",")[1]); return; }   // Android: saved to the photo gallery
  try { const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; if (dl) { await dl.save({filename: name, data: blob}); toast("편지를 그림으로 저장했어요"); return; } } catch (e) { if (e && e.code === "declined") return; }
  try { const file = new File([blob], name, {type: "image/png"}); if (navigator.canShare && navigator.canShare({files: [file]}) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { await navigator.share({files: [file]}); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  try { const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast("편지를 그림으로 저장했어요"); }
  catch (e) { toast("이 화면에서는 저장할 수 없어요"); }
}
if ($("readKeepCard")) $("readKeepCard").addEventListener("click", keepLetter);
