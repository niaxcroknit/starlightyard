
/* ===== Claude patches (re-applied on each Codex drop by merge_patch.py) ===== */

/* ---------- movable decorations ---------- */
var placingKey = null, decoHits = [], decoEditing = false, decoDrag = null;
function decoAt(key, x, d){
  const s = G.decoPos && G.decoPos[key];
  if (!s) return {x, d};
  return {x: clamp(s.fx, 0.03, 0.97)*W, d: dMin + clamp(s.fd, 0, 1)*(dMax - dMin)};
}
function drawDecoEditMarks(){
  if (!decoEditing) return;
  mctx.save();
  for (const h of decoHits) {
    const on = decoDrag && decoDrag.key === h.key;
    mctx.setLineDash(on ? [] : [5, 5]); mctx.lineWidth = on ? 2.5 : 1.6;
    mctx.strokeStyle = on ? "rgba(233,167,186,.95)" : "rgba(255,255,255,.9)";
    mctx.fillStyle = on ? "rgba(255,240,246,.18)" : "rgba(255,255,255,.08)";
    const p = new Path2D(); p.roundRect(h.x - 4, h.y - 4, h.w + 8, h.h + 8, 12); mctx.fill(p); mctx.stroke(p);
  }
  mctx.restore();
}
function setDecoEditing(on){
  decoEditing = on; decoDrag = null;
  $("decoEditBar").hidden = !on; $("dock").hidden = on;
  if (on) { closeVeil("decoVeil"); setBallMode(false); setHint(""); }
  else save();
}
(() => {
  const stage = document.querySelector(".stage");
  const toScene = (ev) => { const r = cv.getBoundingClientRect(); return {x: (ev.clientX - r.left)/camZ, y: (ev.clientY - r.top)/camZ}; };
  stage.addEventListener("pointerdown", (ev) => {
    if (!decoEditing || ev.target !== cv) return;
    ev.stopPropagation(); ev.preventDefault();
    const p = toScene(ev);
    for (let i = decoHits.length - 1; i >= 0; i--) {
      const h = decoHits[i];
      if (p.x >= h.x - 6 && p.x <= h.x + h.w + 6 && p.y >= h.y - 6 && p.y <= h.y + h.h + 6) {
        decoDrag = {key: h.key, id: ev.pointerId, px: p.x, py: p.y, fx: h.fx, fd: h.fd};
        try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
        return;
      }
    }
  }, true);
  stage.addEventListener("pointermove", (ev) => {
    if (!decoEditing) return;
    ev.stopPropagation();
    if (!decoDrag || ev.pointerId !== decoDrag.id) return;
    const p = toScene(ev), nx = clamp(decoDrag.fx + (p.x - decoDrag.px), W*0.03, W*0.97), nd = clamp(decoDrag.fd + (p.y - decoDrag.py), dMin, dMax);
    G.decoPos = G.decoPos || {};
    G.decoPos[decoDrag.key] = {fx: nx/W, fd: (nd - dMin)/Math.max(1, dMax - dMin)};
  }, true);
  const up = (ev) => { if (!decoEditing) return; ev.stopPropagation(); if (decoDrag && ev.pointerId === decoDrag.id) { decoDrag = null; save(); } };
  stage.addEventListener("pointerup", up, true); stage.addEventListener("pointercancel", up, true);
  $("decoMoveBtn").addEventListener("click", () => setDecoEditing(true));
  $("decoDone").addEventListener("click", () => { setDecoEditing(false); toast("장식 위치를 저장했어요"); });
  $("decoReset").addEventListener("click", () => { G.decoPos = {}; save(); toast("처음 자리로 돌려놨어요"); });
})();

/* ---------- fill any strip below the yard with the yard itself (mirrored grass) ---------- */
(() => {
  const ext = document.createElement("canvas"); ext.id = "sceneExt"; ext.setAttribute("aria-hidden", "true");
  document.body.appendChild(ext);
  const ectx = ext.getContext("2d");
  let lastCol = "";
  const draw = () => {
    try {
      const st = document.querySelector(".stage").getBoundingClientRect();
      const gap = Math.max(0, Math.ceil((window.screen ? Math.max(screen.height, screen.width) : 0) - st.bottom), 240);
      ext.style.top = Math.floor(st.bottom - 1) + "px"; ext.style.height = gap + "px";
      const dpr = cv.width / Math.max(1, cv.offsetWidth), w = cv.width, h = Math.max(1, Math.round(gap*dpr));
      if (ext.width !== w || ext.height !== h) { ext.width = w; ext.height = h; }
      const src = Math.min(cv.height, h);
      ectx.save(); ectx.setTransform(1, 0, 0, -1, 0, src);
      ectx.drawImage(cv, 0, cv.height - src, w, src, 0, 0, w, src);
      ectx.restore();
      if (h > src) { ectx.drawImage(ext, 0, src - 1, w, 1, 0, src, w, h - src); }
      const d = ectx.getImageData(Math.floor(w/2), Math.max(0, src - 2), 1, 1).data, col = `rgb(${d[0]},${d[1]},${d[2]})`;
      if (col !== lastCol) { lastCol = col; document.documentElement.style.backgroundColor = col; document.body.style.backgroundColor = col; }
    } catch (e) {}
  };
  setInterval(draw, 120); setTimeout(draw, 300);
})();

/* ---------- screen-size check: tap the yard name 5 times (or open with #debug) ---------- */
function enableScreenCheck(){
  if (document.getElementById("syDebugBox")) { document.getElementById("syDebugBox").remove(); return; }
  const box = document.createElement("pre"), probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);pointer-events:none";
  box.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:999;margin:0;padding:12px 14px;border-radius:14px;background:rgba(40,30,50,.86);color:#fff;font:12px/1.55 ui-monospace,Menlo,monospace;white-space:pre";
  box.id = "syDebugBox"; box.addEventListener("click", () => box.remove());
  document.body.append(probe, box);
  let extra = {};
  window.__syDebug = (o) => { extra = o; };
  const tick = () => {
    if (!document.body.contains(box)) return;
    const vv = window.visualViewport, st = document.querySelector(".stage").getBoundingClientRect(), ps = getComputedStyle(probe), dk = $("dock").getBoundingClientRect();
    const sEl = document.querySelector('script[src*="app.js"]');
    box.textContent = [
      `inner ${innerWidth} x ${innerHeight}`,
      `screen ${screen.width} x ${screen.height}`,
      `client ${document.documentElement.clientWidth} x ${document.documentElement.clientHeight}`,
      `visual ${vv ? Math.round(vv.width) + " x " + Math.round(vv.height) + " @" + Math.round(vv.offsetTop) : "-"}`,
      `stage  ${Math.round(st.top)} ~ ${Math.round(st.bottom)}`,
      `dock   ${Math.round(dk.top)} ~ ${Math.round(dk.bottom)}`,
      `safe   top ${ps.paddingTop} / bottom ${ps.paddingBottom}`,
      `app    ${navigator.standalone === true ? "home-screen" : (matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser")}`,
      `fit    laid ${Math.round(extra.laidOut || 0)} -> ${Math.round(extra.full || 0)}`,
      `build  ${sEl ? (sEl.src.split("?")[1] || "-") : "single file"}`
    ].join("\n");
  };
  setInterval(tick, 700); tick();
}
if (/debug/.test(location.hash + location.search)) enableScreenCheck();
{ let taps = 0, tt = null; const t = document.querySelector(".title"); if (t) t.addEventListener("click", () => { taps++; clearTimeout(tt); tt = setTimeout(() => taps = 0, 1200); if (taps >= 5) { taps = 0; enableScreenCheck(); } }); }
