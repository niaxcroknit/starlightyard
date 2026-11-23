
(() => {
"use strict";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FONT = '"Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const $ = (id) => document.getElementById(id);
let camZ = 1, camX = 0, camY = 0;
const DP_ROW = 40, DOW = ["일","월","화","수","목","금","토"];

/* ---------- helpers ---------- */
const HX = new Map();
const hx = (h) => { let v = HX.get(h); if (!v) { const s = h.replace("#",""); v = [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]; HX.set(h,v); } return v; };
const toHex = (c) => "#" + c.map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const MX = new Map();
const mix = (a,b,t) => { const k = a+b+t; let v = MX.get(k); if (!v) { const A=hx(a),B=hx(b); v = toHex(A.map((x,i)=>x+(B[i]-x)*t)); if (MX.size > 6000) MX.clear(); MX.set(k,v); } return v; };
const shade = (h,t) => t>=0 ? mix(h,"#ffffff",t) : mix(h,"#1a1224",-t);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const rand = (a,b) => a+Math.random()*(b-a);
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const hash = (x,y) => { let h = (x*374761393 + y*668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
const norm3 = (x,y,z) => { const l = Math.hypot(x,y,z) || 1; return [x/l,y/l,z/l]; };
const dot3 = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const uid = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

/* ---------- breeds ---------- */
const BREEDS = {
  cat: [
    {id:"cheese",   name:"치즈 코숏",      pat:"tabby",  base:"#f4a65d", dark:"#d9772f", light:"#fff1dc"},
    {id:"mackerel", name:"고등어 코숏",    pat:"tabby",  base:"#a69c8c", dark:"#5c5249", light:"#f1ebe0"},
    {id:"calico",   name:"삼색이",         pat:"calico", base:"#fbf7f0", dark:"#ea9446", dark2:"#3f3739", light:"#fbf7f0"},
    {id:"tuxedo",   name:"턱시도",         pat:"tuxedo", base:"#3d3543", light:"#fbf7f0", eye:"#9ad06a"},
    {id:"black",    name:"까만 고양이",    pat:"solid",  base:"#3d3543", light:"#51475a", eye:"#f2cf4a"},
    {id:"white",    name:"하얀 고양이",    pat:"solid",  base:"#fbf8f4", light:"#ffffff", eye:"#7cb9ec"},
    {id:"russian",  name:"러시안 블루",    pat:"solid",  base:"#8f9cb2", light:"#a8b4c7", eye:"#6cc58c"},
    {id:"siamese",  name:"샴",             pat:"point",  base:"#f3e6cf", dark:"#5b4337", light:"#fbf4e6", eye:"#5aa9ec"},
    {id:"persian",  name:"페르시안",       pat:"solid",  base:"#f7efe4", light:"#ffffff", fluffy:true, eye:"#e3a64a"},
    {id:"fold",     name:"스코티시 폴드",  pat:"solid",  base:"#bdb6bd", light:"#ece8ec", ear:"fold", eye:"#e3a64a", chunky:true},
    {id:"munchkin", name:"먼치킨",         pat:"tabby",  base:"#ebcfa6", dark:"#c69a63", light:"#fff7ea", short:true},
    {id:"norwegian",name:"노르웨이 숲",    pat:"tabby",  base:"#9e7f61", dark:"#5f4633", light:"#f1e4d2", fluffy:true, eye:"#9ad06a"},
    {id:"british",  name:"브리티시 숏헤어",pat:"solid",  base:"#8994a7", light:"#a3adbe", eye:"#ec9a3c", chunky:true},
    {id:"ragdoll",  name:"랙돌",           pat:"point",  base:"#f6eee2", dark:"#7e6453", light:"#ffffff", fluffy:true, mitts:true, eye:"#5aa9ec"},
    {id:"bengal",   name:"벵갈",           pat:"spots",  base:"#e3a960", dark:"#6e4526", light:"#f7e6c8", eye:"#9ad06a"},
    {id:"american", name:"아메리칸 숏헤어",pat:"tabby",  base:"#cdd0d6", dark:"#4f545b", light:"#f2f3f5"}
  ],
  dog: [
    {id:"maltese",  name:"말티즈",         pat:"solid",  base:"#fbfaf6", light:"#ffffff", ear:"flop", fluffy:true},
    {id:"poodle",   name:"푸들",           pat:"solid",  base:"#d9a06b", light:"#ebc39a", ear:"flop", fluffy:true},
    {id:"pom",      name:"포메라니안",     pat:"solid",  base:"#f0a250", light:"#ffe1bb", ear:"point", fluffy:true},
    {id:"shiba",    name:"시바견",         pat:"bicolor",base:"#dc8840", light:"#fff2de", ear:"point", tail:"curl"},
    {id:"jindo",    name:"진돗개",         pat:"solid",  base:"#f3ede2", light:"#ffffff", ear:"point", tail:"curl"},
    {id:"corgi",    name:"웰시 코기",      pat:"bicolor",base:"#e18b3f", light:"#fff4e6", ear:"big", tail:"stub", short:true, whitePaws:true},
    {id:"golden",   name:"골든 리트리버",  pat:"solid",  base:"#e3b46a", light:"#f4d9a6", ear:"flop"},
    {id:"bichon",   name:"비숑",           pat:"solid",  base:"#fffdf7", light:"#ffffff", ear:"flop", fluffy:true},
    {id:"dachs",    name:"닥스훈트",       pat:"solid",  base:"#8c4b2c", light:"#c58052", ear:"flop", long:true, short:true},
    {id:"mix",      name:"누렁이",         pat:"solid",  base:"#d6ad73", light:"#f3e2c4", ear:"point"}
  ],
  rabbit: [
    {id:"white",    name:"하얀 토끼",      pat:"solid",  base:"#fbf8f4", light:"#ffffff", eye:"#e86a7f"},
    {id:"gray",     name:"회색 토끼",      pat:"solid",  base:"#a7a4ab", light:"#e2e0e5"},
    {id:"brown",    name:"갈색 토끼",      pat:"solid",  base:"#b88a62", light:"#ecd8c2"},
    {id:"lop",      name:"롭이어",         pat:"solid",  base:"#e8cfa8", light:"#fff3e0", ear:"lop"},
    {id:"dutch",    name:"더치",           pat:"dutch",  base:"#fbf8f4", dark:"#4b3f45", light:"#ffffff"}
  ],
  hamster: [
    {id:"golden",   name:"골든",           pat:"solid",  base:"#e8a964", light:"#fff3e3"},
    {id:"djungarian",name:"정글리안",      pat:"stripe", base:"#9b98a0", dark:"#5c5860", light:"#fbf8f4"},
    {id:"pearl",    name:"펄",             pat:"solid",  base:"#f2ece6", light:"#ffffff"},
    {id:"panda",    name:"판다",           pat:"panda",  base:"#fbf8f4", dark:"#3d3543", light:"#ffffff"},
    {id:"robo",     name:"로보로브스키",   pat:"solid",  base:"#e3c79a", light:"#fff8ee"}
  ]
};
BREEDS.parrot=[{id:'conure',name:'코뉴어',pat:'solid',base:'#91ab60',light:'#ede2bc'},{id:'cockatiel',name:'왕관앵무',pat:'solid',base:'#f4dc89',light:'#fff3c8'},{id:'budgie',name:'사랑앵무',pat:'solid',base:'#a5c9db',light:'#f4f1e7'}];
BREEDS.hedgehog=[{id:'salt',name:'솔트 앤 페퍼',pat:'solid',base:'#b7a58f',light:'#f2e4ca'},{id:'cinnamon',name:'시나몬',pat:'solid',base:'#c69364',light:'#f4e1c5'},{id:'white',name:'화이트',pat:'solid',base:'#eaddc8',light:'#fff5df'}];
const SPECIES_KO = {dog:"강아지", cat:"고양이", rabbit:"토끼", hamster:"햄스터",parrot:"앵무새",hedgehog:"고슴도치"};
const breedOf = (sp, id) => (BREEDS[sp] || BREEDS.cat).find(b => b.id === id) || (BREEDS[sp] || BREEDS.cat)[0];
const UNLOCKS = [
  {at:10, key:"flowers", name:"꽃밭", msg:"마당에 꽃이 피었어요"},
  {at:25, key:"cushion", name:"폭신한 방석", msg:"낮잠용 방석이 생겼어요"},
  {at:45, key:"lantern", name:"작은 등불", msg:"밤에도 마당이 밝아요"},
  {at:55, key:"mailbox", name:"우체통", msg:"편지 넣을 우체통이 생겼어요"},
  {at:70, key:"tree", name:"풍경 나무", msg:"바람이 불면 풍경이 울려요"},
  {at:85, key:"fence", name:"하얀 울타리", msg:"마당에 울타리가 생겼어요"},
  {at:100, key:"pond", name:"작은 연못", msg:"연못에 연꽃이 피었어요"},
  {at:120, key:"rainbow", name:"무지개", msg:"하늘에 무지개가 걸렸어요"},
  {at:140, key:"house", name:"아이들 집", msg:"아이들 집이 생겼어요"},
  {at:160, key:"sunflower", name:"해바라기", msg:"해바라기가 고개를 들었어요"},
  {at:180, key:"bench", name:"나무 벤치", msg:"쉬어 갈 벤치가 생겼어요"},
  {at:200, key:"butterfly", name:"나비", msg:"나비가 날아왔어요"}
];

/* ---------- sprite engine: height-mapped pixel sprites ---------- */
const SW = 44, SH = 36, GROUND = 35, AX = 22;
const EYE = "#2b1d2a", PINK = "#f28aa0";
function colorAt(B, part, x, y, m){
  let far = false;
  if (part.endsWith("Far")) { far = true; part = part.slice(0,-3); }
  const c = baseColor(B, part, x, y, m);
  return far ? shade(c, -0.1) : c;
}
function baseColor(B, part, x, y, m){
  if (part === "earIn") return "#f6a9b8";
  if (m.back && part === "head") return B.pat === "calico" ? (hash(x>>2, y>>2) % 10 < 3 ? B.dark : B.base) : B.base;
  const b = B.base, L = B.light || shade(b,0.35), D = B.dark || shade(b,-0.3);
  const soft = part==="belly" || part==="muzzle" || part==="tailPuff";
  const cx = m.fx - 0.5;
  switch (B.pat) {
    case "tabby":
      if (soft || part === "ruff") return L;
      if (part === "head") { if (y <= m.hy-4 && Math.abs(x-cx) <= 3 && (x+y)%2 === 0) return D; if (Math.abs(x-cx) >= 6 && y === m.hy+1) return D; return b; }
      if (part === "body" || part === "leg" || part === "tail") return ((x*2+y)%5 === 0) ? D : b;
      return b;
    case "spots":
      if (soft || part === "ruff") return L;
      if (part === "body" || part === "leg" || part === "tail") { const h = hash(Math.floor(x/3), Math.floor(y/3)) % 3; return (h === 0 && !(x%3===1 && y%3===1)) ? D : b; }
      if (part === "head" && y <= m.hy-4 && x%2 === 0) return D;
      return b;
    case "calico":
      if (soft || part === "paw" || part === "ruff") return b;
      { const h = hash(x>>2, y>>2) % 10; if (h < 3) return D; if (h < 5) return B.dark2; return b; }
    case "tuxedo":
      if (soft || part === "paw" || part === "ruff") return L;
      if (part === "head") { if ((x === m.fx-1 || x === m.fx) && y >= m.hy-6 && y <= m.hy+1) return L; if (y >= m.hy+2 && Math.abs(x-cx) <= 3.5) return L; }
      return b;
    case "point":
      if (part === "paw") return B.mitts ? L : D;
      if (part === "ear" || part === "tail" || part === "leg") return D;
      if (part === "head") return Math.hypot(x-cx, y-(m.hy+2)) <= 3.6 ? D : b;
      if (soft || part === "ruff") return L;
      return b;
    case "bicolor":
      if (soft || part === "ruff") return L;
      if (part === "paw") return B.whitePaws ? L : b;
      if (part === "head" && y >= m.hy+1) return L;
      return b;
    case "dutch":
      if (part === "ear") return D;
      if (part === "head") return (Math.abs(x-cx) <= 1.5 || y >= m.hy+2) ? L : D;
      if (part === "body" && m.front) return y > m.hy + 8 ? D : b;
      if (part === "body" || part === "leg") return x < m.bodyCx ? D : b;
      if (part === "tailPuff") return D;
      return soft ? L : b;
    case "panda":
      if (part === "ear") return D;
      if (part === "body" && m.front) return (y > m.hy + 5 && y < m.hy + 9) ? D : b;
      if (part === "body") return x < m.bodyCx-1 && y < GROUND-2 ? D : b;
      return soft ? L : b;
    case "stripe":
      if (part === "body" && y <= m.top+1 && x < m.fx-2) return D;
      return soft ? L : b;
    default:
      if (soft || part === "ruff") return L;
      return b;
  }
}
function newGrid(){ const g = new Array(SW*SH).fill(null); g.dm = new Uint8Array(SW*SH); g.z = new Float32Array(SW*SH); g.layer = 0; return g; }
function put(g,x,y,c,det,z){ x = Math.round(x); y = Math.round(y); if (x<0||y<0||x>=SW||y>=SH) return; const i = y*SW+x; g[i] = c; g.dm[i] = det ? 1 : 0; if (z != null) g.z[i] = z; }
const colOf = (fn,x,y) => typeof fn === "function" ? fn(x,y) : fn;
function ell(g,cx,cy,rx,ry,fn,o){
  o = o || {};
  const base = o.base != null ? o.base : (++g.layer)*1.1, h = o.h != null ? o.h : Math.min(rx,ry)+0.8;
  for (let y=Math.floor(cy-ry-1); y<=Math.ceil(cy+ry+1); y++)
    for (let x=Math.floor(cx-rx-1); x<=Math.ceil(cx+rx+1); x++) {
      const dx=(x-cx)/(rx+0.5), dy=(y-cy)/(ry+0.5), d = dx*dx+dy*dy;
      if (d <= 1) { if (o.paint) put(g,x,y,colOf(fn,x,y)); else put(g,x,y,colOf(fn,x,y),false, base + Math.sqrt(1-d)*h); }
    }
}
function rect(g,x0,y0,w,h,fn){
  const base = (++g.layer)*1.1, cx = x0 + (w-1)/2, rad = w/2 + 0.4;
  for (let y=y0;y<y0+h;y++) for (let x=x0;x<x0+w;x++){ const t = (x-cx)/rad; put(g,x,y,colOf(fn,x,y),false, base + Math.sqrt(Math.max(0,1-t*t))*rad); }
}
function tri(g,ax,ay,bx,by,cx,cy,fn,flat){
  const base = (++g.layer)*1.1 + (flat ? 0 : 1);
  const minX=Math.floor(Math.min(ax,bx,cx)), maxX=Math.ceil(Math.max(ax,bx,cx)), minY=Math.floor(Math.min(ay,by,cy)), maxY=Math.ceil(Math.max(ay,by,cy));
  const s = (px,py,qx,qy,rx,ry) => (px-rx)*(qy-ry)-(qx-rx)*(py-ry);
  for (let y=minY;y<=maxY;y++) for (let x=minX;x<=maxX;x++) {
    const d1=s(x,y,ax,ay,bx,by), d2=s(x,y,bx,by,cx,cy), d3=s(x,y,cx,cy,ax,ay);
    if (!(((d1<0)||(d2<0)||(d3<0)) && ((d1>0)||(d2>0)||(d3>0)))) { if (flat) put(g,x,y,colOf(fn,x,y)); else put(g,x,y,colOf(fn,x,y),false,base); }
  }
}
function stroke(g, pts, r, fn){
  const base = (++g.layer)*1.1;
  for (let i=0;i<pts.length-1;i++){
    const [x0,y0]=pts[i], [x1,y1]=pts[i+1], n=Math.max(1, Math.ceil(Math.hypot(x1-x0,y1-y0)*2));
    for (let k=0;k<=n;k++) ell(g, lerp(x0,x1,k/n), lerp(y0,y1,k/n), r, r, fn, {base: base + (i+k/n)*0.25, h: r+0.6});
  }
}
function lightGrid(g, side){
  const out = g.slice(), Ld = norm3(-0.55*side, -0.75, 0.9), Hd = norm3(Ld[0], Ld[1], Ld[2]+1);
  const zAt = (x,y,z0) => (x<0||y<0||x>=SW||y>=SH||!g[y*SW+x]) ? z0-2.4 : g.z[y*SW+x];
  for (let y=0;y<SH;y++) for (let x=0;x<SW;x++){
    const i = y*SW+x, c = g[i]; if (!c || g.dm[i]) continue;
    const z0 = g.z[i];
    const dx = clamp((zAt(x+1,y,z0)-zAt(x-1,y,z0))/2, -1.7, 1.7), dy = clamp((zAt(x,y+1,z0)-zAt(x,y-1,z0))/2, -1.7, 1.7);
    const n = norm3(-dx, -dy, 1);
    let I = 0.48 + 0.74*Math.max(0, dot3(n, Ld));
    I = Math.round(I*7)/7;
    const sp = Math.round(Math.pow(Math.max(0, dot3(n, Hd)), 22)*5)/10;
    let occ = 0;
    for (const [ox,oy] of [[0,-1],[1,0],[-1,0],[0,-2],[0,1]]) { const xx=x+ox, yy=y+oy; if (xx>=0&&yy>=0&&xx<SW&&yy<SH) { const j = yy*SW+xx; if (g[j] && g.z[j] > z0 + 1.8) occ++; } }
    let col = c;
    if (I < 1) col = mix(col, "#3e2f6e", Math.round((1-I)*0.62*20)/20); else col = mix(col, "#fff6ee", Math.min(0.5, Math.round((I-1)*1.4*20)/20));
    if (occ) col = mix(col, "#3e2f6e", Math.min(0.3, occ*0.08));
    if (sp >= 0.1) col = mix(col, "#ffffff", Math.min(0.5, sp));
    out[i] = col;
  }
  return out;
}
function outline(g, col){
  const out = g.slice();
  for (let y=0;y<SH;y++) for (let x=0;x<SW;x++) {
    if (g[y*SW+x]) continue;
    if ((x>0&&g[y*SW+x-1])||(x<SW-1&&g[y*SW+x+1])||(y>0&&g[(y-1)*SW+x])||(y<SH-1&&g[(y+1)*SW+x])) out[y*SW+x] = col;
  }
  return out;
}
function lineCol(B){ return B.line || mix(shade(B.base,-0.5), "#5b3a6e", 0.45); }
function finish(g, B, m, sp, side){
  const o = outline(lightGrid(g, side), lineCol(B));
  if (sp === "cat" && m.headRx && m.state !== "sleep") {
    const wc = mix(lineCol(B), "#ffffff", 0.4), y = Math.round(m.hy) + 2, L0 = Math.floor(m.hx - m.headRx) - 2, R0 = Math.ceil(m.hx + m.headRx) + 2;
    [[L0,y],[L0-1,y-1],[L0,y+2],[L0-1,y+3],[R0,y],[R0+1,y-1],[R0,y+2],[R0+1,y+3]].forEach(([x,yy]) => { if (x>=0&&x<SW&&yy>=0&&yy<SH && !o[yy*SW+x]) o[yy*SW+x] = wc; });
  }
  return o;
}
function face(g, B, m, expr, sp){
  const fx = m.fx, hy = m.hy, line = lineCol(B), isDog = sp === "dog";
  const F = (x,y,c) => put(g,x,y,c,true);
  if (isDog) ell(g, fx-0.5, hy+3, 3, 1.6, (x,y)=>colorAt(B,"muzzle",x,y,m), {h:2.2});
  const iris = B.eye || "#5a3a4a";
  [fx-4, fx+2].forEach(ex => {
    if (expr === "s") { F(ex-1,hy,EYE); F(ex,hy+1,EYE); F(ex+1,hy+1,EYE); F(ex+2,hy,EYE); }
    else if (expr === "b") { F(ex,hy+1,EYE); F(ex+1,hy+1,EYE); }
    else if (expr === "h") { F(ex,hy+1,EYE); F(ex+1,hy,EYE); F(ex+2,hy+1,EYE); }
    else { F(ex,hy-1,EYE); F(ex+1,hy-1,EYE); F(ex,hy,"#ffffff"); F(ex+1,hy,EYE); F(ex,hy+1,iris); F(ex+1,hy+1,iris); }
  });
  const blush = mix(B.base, "#ff8fae", 0.62);
  F(fx-6, hy+2, blush); F(fx-5, hy+2, blush); F(fx+4, hy+2, blush); F(fx+5, hy+2, blush);
  if (isDog) {
    F(fx-1, hy+2, EYE); F(fx, hy+2, EYE); F(fx-1, hy+1, "#7a6070");
    F(fx-1, hy+4, line); F(fx, hy+4, line);
    if (expr === "h") { F(fx, hy+5, "#ff7f9a"); F(fx-1, hy+5, "#ff7f9a"); }
  } else {
    if (m.front) { F(fx-1, hy+2, PINK); F(fx, hy+2, PINK); } else F(fx-0.5, hy+2, PINK);
    if (sp !== "hamster" && m.front) { F(fx-3, hy+3, line); F(fx-2, hy+4, line); F(fx-1, hy+3, line); F(fx, hy+3, line); F(fx+1, hy+4, line); F(fx+2, hy+3, line); }
    else if (sp !== "hamster") { F(fx-2, hy+3, line); F(fx-1, hy+4, line); F(fx, hy+3, line); F(fx+1, hy+4, line); F(fx+2, hy+3, line); }
    else { F(fx-1, hy+3, line); F(fx, hy+3, line); }
  }
}
function earKind(sp, B){ return B.ear || (sp === "cat" ? "tri" : sp === "rabbit" ? "up" : sp === "dog" ? "flop" : "round"); }
function earsBehind(g, sp, B, m, pose, C){
  const hx = m.hx, hy = m.hy, ear = earKind(sp, B);
  if (ear === "tri" || ear === "point" || ear === "big") {
    const t = ear === "big" ? 13 : ear === "point" ? 10 : 11, w = ear === "big" ? 1 : 0;
    tri(g, hx-7-w,hy-3, hx-1,hy-6, hx-5-w,hy-t, C("ear"));
    tri(g, hx+1,hy-6, hx+7+w,hy-3, hx+5+w,hy-t, C("ear"));
    tri(g, hx-5-w,hy-5, hx-2.5,hy-6, hx-4.6-w,hy-t+3, "#f6a9b8", true);
    tri(g, hx+2.5,hy-6, hx+5+w,hy-5, hx+4.6+w,hy-t+3, "#f6a9b8", true);
  } else if (ear === "up") {
    if (pose === "sleep") { ell(g, hx-9, hy-3, 5, 1.6, C("ear")); ell(g, hx-9, hy-3, 3, 0.6, "#f6a9b8", {paint:true}); }
    else { ell(g, hx+3, hy-12, 1.8, 6, C("earFar")); ell(g, hx-3, hy-12, 1.8, 6, C("ear")); ell(g, hx-3, hy-12, 0.6, 4, "#f6a9b8", {paint:true}); ell(g, hx+3, hy-12, 0.6, 4, "#f6a9b8", {paint:true}); }
  } else if (ear === "round") {
    ell(g, hx-5, hy-6, 2, 2, C("ear")); ell(g, hx+4, hy-6, 2, 2, C("ear"));
    put(g, hx-5, hy-6, "#f6a9b8"); put(g, hx+4, hy-6, "#f6a9b8");
  }
}
function earsFront(g, sp, B, m, pose, C){
  const hx = m.hx, hy = m.hy, ear = earKind(sp, B);
  if (ear === "flop") { ell(g, hx-7, hy+1, 2, 4, C("ear")); ell(g, hx+7, hy+1, 2, 4, C("ear")); }
  if (ear === "lop")  { ell(g, hx-7, hy+3, 2, 6, C("ear")); ell(g, hx+7, hy+3, 2, 6, C("ear")); }
  if (ear === "fold") { ell(g, hx-4, hy-6, 2.4, 1, C("ear")); ell(g, hx+4, hy-6, 2.4, 1, C("ear")); }
}
function tail(g, sp, B, m, pts0, sway, C){
  const kind = B.tail || (sp === "cat" ? "long" : sp === "dog" ? "wag" : "puff");
  const [tx, ty] = pts0;
  if (kind === "long") stroke(g, [[tx,ty],[tx-2,ty-2],[tx-3,ty-5],[tx-3,ty-8],[tx-2+sway,ty-11]], B.fluffy ? 1.5 : 1, C("tail"));
  else if (kind === "wag") stroke(g, [[tx,ty],[tx-2,ty-2],[tx-2+sway,ty-6]], B.fluffy ? 1.5 : 1, C("tail"));
  else if (kind === "curl") { ell(g, tx+1, ty-5, 3, 3, C("tail")); ell(g, tx+1, ty-5, 1, 1, null); }
  else if (kind === "stub") ell(g, tx, ty, 1.4, 1.4, C("tail"));
  else ell(g, tx, ty, 2.2, 2.2, C("tailPuff"));
}
function buildQuad(sp, B, pose, f, expr){
  const g = newGrid(), m = {};
  const C = (part) => (x,y) => colorAt(B, part, x, y, m);
  const fl = B.fluffy ? 1 : 0, ch = B.chunky ? 1 : 0, isRab = sp === "rabbit";
  const legH = B.short || isRab ? 3 : 6, moving = pose === "walk" || pose === "run", sway = [0,1,0,-1][f];
  const headRx = (isRab ? 7 : 8) + fl + ch, headRy = (isRab ? 6 : 7) + fl;
  if (pose === "sleep") {
    const rx = 12+fl+ch+(B.long?3:0), ry = 5+fl, bcx = 19, bcy = GROUND-ry;
    Object.assign(m, {bodyCx:bcx, top:bcy-ry, hx:bcx+rx-3, hy:GROUND-headRy-1, headRx, state:pose}); m.fx = m.hx+1;
    earsBehind(g, sp, B, m, pose, C);
    tail(g, sp, B, m, [bcx-rx+1, bcy], 0, C);
    ell(g, bcx, bcy, rx, ry, C("body"));
    if (B.tail !== "curl") stroke(g, [[bcx-rx+2,GROUND],[bcx+rx-6,GROUND]], 0.6, C("tail"));
    ell(g, m.hx, m.hy, headRx, headRy-1, C("head"));
    earsFront(g, sp, B, m, pose, C);
    face(g, B, m, "s", sp);
  } else if (pose === "fwalk" || pose === "bwalk") {
    const back = pose === "bwalk", cx = 21.5, bob = f%2 ? 1 : 0;
    const bR = 7+fl+ch, bcy = GROUND - legH - bR + 3 - bob, hRx = headRx + 1;
    Object.assign(m, {bodyCx:cx, top:bcy-bR, hx:cx, hy: back ? bcy-7 : bcy-4, headRx:hRx, state:pose, front:true, back}); m.fx = 22;
    const kind = B.tail || (sp === "cat" ? "long" : sp === "dog" ? "wag" : "puff");
    const lift = (i) => (f === 1 && (i === 0 || i === 3)) || (f === 3 && (i === 1 || i === 2)) ? 2 : 0;
    const legsAt = (xs, far, from) => xs.forEach((lx, i) => { const l = lift(i + (far ? 2 : 0)), top = from; rect(g, lx, top, 3, Math.max(1, GROUND - l - top - 1), C(far ? "legFar" : "leg")); rect(g, lx, GROUND - l - 1, 3, 2, C(far ? "pawFar" : "paw")); });
    if (!back) {
      if (kind === "long") stroke(g, [[cx+4,bcy-2],[cx+7,bcy-6],[cx+8+sway,bcy-11]], B.fluffy ? 1.5 : 1, C("tail"));
      else if (kind === "wag") stroke(g, [[cx+4,bcy-3],[cx+6+sway,bcy-8]], B.fluffy ? 1.5 : 1, C("tail"));
      else if (kind === "curl") { ell(g, cx+5, bcy-7, 3, 3, C("tail")); ell(g, cx+5, bcy-7, 1, 1, null); }
      legsAt([15, 26], true, bcy + 2);
      ell(g, cx, bcy, bR+1, bR, C("body"));
      if (!isRab) legsAt([18, 23], false, bcy + 3); else { ell(g, cx-3, GROUND-1-lift(0), 2, 1, C("paw")); ell(g, cx+3, GROUND-1-lift(1), 2, 1, C("paw")); }
      if (fl && !isRab) ell(g, cx, m.hy+6, 7, 3, C("ruff")); else if (!isRab) ell(g, cx, m.hy+headRy, 3, 2, C("belly"));
      earsBehind(g, sp, B, m, pose, C);
      ell(g, cx, m.hy, hRx, headRy, C("head"));
      earsFront(g, sp, B, m, pose, C);
      face(g, B, m, expr === "b" ? "b" : expr, sp);
    } else {
      if (!isRab) legsAt([18, 23], true, bcy + 2);
      ell(g, cx, m.hy, hRx, headRy, C("head"));
      earsBehind(g, sp, B, m, pose, C);
      earsFront(g, sp, B, m, pose, C);
      ell(g, cx, bcy+1, bR+1, bR, C("body"));
      legsAt([15, 26], false, bcy + 3);
      if (kind === "long") stroke(g, [[cx,bcy],[cx+sway,bcy-5],[cx+sway*2,bcy-10],[cx+1+sway*2,bcy-13]], B.fluffy ? 1.5 : 1, C("tail"));
      else if (kind === "wag") stroke(g, [[cx,bcy-1],[cx+sway*2,bcy-7]], B.fluffy ? 1.5 : 1, C("tail"));
      else if (kind === "curl") { ell(g, cx, bcy-4, 3, 3, C("tail")); ell(g, cx, bcy-4, 1, 1, null); }
      else if (kind === "stub") ell(g, cx, bcy-1, 1.4, 1.4, C("tail"));
      else ell(g, cx, bcy-1, 2.2, 2.2, C("tailPuff"));
    }
  } else if (pose === "front") {
    const cx = 21.5, r = 8+fl+ch, bcy = GROUND - r + (isRab?1:0), hRx = headRx + 1;
    Object.assign(m, {bodyCx:cx, top:bcy-r, hx:cx, hy:bcy - r - headRy + 4, headRx:hRx, state:pose, front:true}); m.fx = 22;
    const kind = B.tail || (sp === "cat" ? "long" : sp === "dog" ? "wag" : "puff");
    if (kind === "long") stroke(g, [[cx+6,GROUND-2],[cx+10,GROUND-4],[cx+12,GROUND-8],[cx+11+sway,GROUND-12]], B.fluffy ? 1.5 : 1, C("tail"));
    else if (kind === "wag") stroke(g, [[cx+6,GROUND-6],[cx+9,GROUND-9],[cx+10+sway,GROUND-13]], B.fluffy ? 1.5 : 1, C("tail"));
    else if (kind === "curl") { ell(g, cx+9, GROUND-13, 3, 3, C("tail")); ell(g, cx+9, GROUND-13, 1, 1, null); }
    else if (kind === "puff") ell(g, cx+8, GROUND-2, 2, 2, C("tailPuff"));
    ell(g, cx-6, GROUND-3, 4, 3, C("bodyFar")); ell(g, cx+6, GROUND-3, 4, 3, C("bodyFar"));
    ell(g, cx, bcy, r, r, C("body"));
    ell(g, cx, bcy+2, Math.max(3, r-4), r-3, C("belly"), {paint:true});
    if (!isRab) [18, 23].forEach(lx => { rect(g, lx, GROUND-6, 3, 5, C("leg")); rect(g, lx, GROUND-1, 3, 2, C("paw")); });
    else { ell(g, cx-3, GROUND-1, 2, 1, C("paw")); ell(g, cx+3, GROUND-1, 2, 1, C("paw")); }
    if (fl && !isRab) ell(g, cx, m.hy+6, 7, 3, C("ruff"));
    else if (!isRab) ell(g, cx, m.hy+headRy, 3, 2, C("belly"));
    earsBehind(g, sp, B, m, pose, C);
    ell(g, cx, m.hy, hRx, headRy, C("head"));
    earsFront(g, sp, B, m, pose, C);
    face(g, B, m, expr, sp);
  } else if (pose === "sit") {
    const r = 8+fl+ch, bcx = 18, bcy = GROUND-r+(isRab?1:0);
    Object.assign(m, {bodyCx:bcx, top:bcy-r, hx:bcx+4, hy:bcy-r-headRy+3, headRx, state:pose}); m.fx = m.hx+1;
    tail(g, sp, B, m, [bcx-6, GROUND-3], sway, C);
    ell(g, bcx-3, GROUND-3, 5, 3, C("bodyFar"));
    ell(g, bcx, bcy, r-1, r, C("body"));
    ell(g, bcx+3, bcy+1, Math.max(2,r-5), r-3, C("belly"), {paint:true});
    if (!isRab) [bcx+2, bcx+6].forEach((lx,i) => { rect(g, lx, bcy, 3, GROUND-bcy-1, C(i?"leg":"legFar")); rect(g, lx, GROUND-1, 3, 2, C("paw")); });
    else ell(g, bcx+4, GROUND-1, 2, 1, C("paw"));
    if (fl && !isRab) ell(g, m.hx-2, m.hy+6, 6, 3, C("ruff"));
    earsBehind(g, sp, B, m, pose, C);
    ell(g, m.hx, m.hy, headRx, headRy, C("head"));
    earsFront(g, sp, B, m, pose, C);
    face(g, B, m, expr, sp);
  } else {
    const bob = moving && f%2 === 1 ? 1 : 0;
    const rx = (B.long ? 15 : isRab ? 10 : 12) + fl + ch, ry = (isRab ? 7 : 6) + fl;
    const bcx = 19 - (B.long ? 1 : 0), bcy = GROUND - legH - ry + 2 - bob;
    Object.assign(m, {bodyCx:bcx, top:bcy-ry, hx:bcx+rx-2+(isRab?1:0), hy:bcy-6, headRx, state:pose});
    if (pose === "eat") { m.hx += 2; m.hy = bcy + 1 + (f%2); }
    m.fx = m.hx + 1;
    tail(g, sp, B, m, [bcx-rx+1, bcy-1], sway, C);
    const legs = [{x:bcx-rx+3,far:true,ph:0},{x:bcx+rx-8,far:true,ph:2},{x:bcx-rx+6,far:false,ph:2},{x:bcx+rx-5,far:false,ph:0}];
    legs.forEach(Lg => {
      const k = (f + Lg.ph) % 4, dx = moving ? [-1,0,1,0][k]*(pose==="run"?2:1) : 0, lift = moving && k === 1 ? 1 : 0, top = bcy + ry - 3;
      rect(g, Lg.x+dx, top, 3, GROUND-lift-top-1, C(Lg.far ? "legFar" : "leg"));
      rect(g, Lg.x+dx, GROUND-lift-1, 3, 2, C(Lg.far ? "pawFar" : "paw"));
    });
    if (isRab) ell(g, bcx-rx+5, GROUND-1, 4, 1.4, C("paw"));
    ell(g, bcx, bcy, rx, ry, C("body"));
    ell(g, bcx+2, bcy+ry-2, rx-5, 1.6, C("belly"), {paint:true});
    if (fl && !isRab) ell(g, m.hx-3, m.hy+6, 5, 4, C("ruff"));
    else if (!isRab) ell(g, m.hx-3, m.hy+headRy-1, 2.6, 2.2, C("belly"));
    earsBehind(g, sp, B, m, pose, C);
    ell(g, m.hx, m.hy, headRx, headRy, C("head"));
    earsFront(g, sp, B, m, pose, C);
    face(g, B, m, expr, sp);
  }
  m.mx = m.front ? m.fx - 0.5 + AX - AX : m.fx + 2; m.my = m.hy + 5;
  return {g, m};
}
function buildHamster(B, pose, f, expr){
  const g = newGrid(), m = {};
  const C = (part) => (x,y) => colorAt(B, part, x, y, m);
  const moving = pose === "walk" || pose === "run";
  if (pose === "fwalk" || pose === "bwalk") {
    const back = pose === "bwalk", cx = 21.5, bob = f%2 ? 1 : 0, bcy = GROUND-8-bob;
    Object.assign(m, {bodyCx:cx, top:bcy-9, hx:cx, hy:bcy-4, front:true, back}); m.fx = 22;
    earsBehind(g, "hamster", B, {hx:cx, hy:bcy-4}, pose, C);
    ell(g, cx, bcy, 10, 8, C("body"));
    if (!back) { ell(g, cx, bcy+3, 6.5, 4.5, C("belly"), {paint:true}); rect(g, 18, bcy+1, 2, 1, "#f3b2b6"); rect(g, 24, bcy+1, 2, 1, "#f3b2b6"); }
    else ell(g, cx, bcy+3, 1.4, 1.4, C("tailPuff"));
    rect(g, 15, GROUND - (f===1?1:0), 3, 1, "#f3b2b6"); rect(g, 26, GROUND - (f===3?1:0), 3, 1, "#f3b2b6");
    if (back) { m.mx = m.fx; m.my = m.hy; return {g, m}; }
  } else if (pose === "front") {
    const cx = 21.5, bcy = GROUND-8;
    Object.assign(m, {bodyCx:cx, top:bcy-9, hx:cx, hy:bcy-4, front:true}); m.fx = 22;
    earsBehind(g, "hamster", B, {hx:cx, hy:bcy-4}, pose, C);
    ell(g, cx, bcy, 10, 8.5, C("body"));
    ell(g, cx, bcy+3, 6.5, 5, C("belly"), {paint:true});
    rect(g, 18, bcy+1, 2, 1, "#f3b2b6"); rect(g, 24, bcy+1, 2, 1, "#f3b2b6");
    rect(g, 15, GROUND, 3, 1, "#f3b2b6"); rect(g, 26, GROUND, 3, 1, "#f3b2b6");
  } else if (pose === "sit") {
    const bcx = 20, bcy = GROUND-9;
    Object.assign(m, {bodyCx:bcx, top:bcy-9, hx:bcx+1, hy:bcy-3}); m.fx = m.hx+1;
    earsBehind(g, "hamster", B, {hx:bcx+1, hy:bcy-4}, pose, C);
    ell(g, bcx, bcy, 9, 9, C("body"));
    ell(g, bcx+1, bcy+3, 6, 5, C("belly"), {paint:true});
    rect(g, bcx-2, bcy+2, 2, 1, "#f3b2b6"); rect(g, bcx+3, bcy+2, 2, 1, "#f3b2b6");
    rect(g, bcx-4, GROUND, 3, 1, "#f3b2b6"); rect(g, bcx+4, GROUND, 3, 1, "#f3b2b6");
  } else if (pose === "sleep") {
    const bcx = 20, bcy = GROUND-5;
    Object.assign(m, {bodyCx:bcx, top:bcy-5, hx:bcx+6, hy:bcy-1}); m.fx = m.hx+1;
    earsBehind(g, "hamster", B, {hx:bcx+5, hy:bcy}, pose, C);
    ell(g, bcx, bcy, 12, 5, C("body"));
    ell(g, bcx+4, bcy+3, 6, 1.4, C("belly"), {paint:true});
  } else {
    const bob = moving && f%2 ? 1 : 0, bcx = 20, bcy = GROUND-7-bob;
    Object.assign(m, {bodyCx:bcx, top:bcy-8, hx:bcx+6, hy:bcy-2}); m.fx = m.hx+1;
    if (pose === "eat") m.hy += 1;
    earsBehind(g, "hamster", B, {hx:bcx+4, hy:bcy-3}, pose, C);
    ell(g, bcx-10, bcy+1, 1.2, 1.2, C("tailPuff"));
    [11,15,23,27].forEach((fx0,i) => { const o = moving ? [0,1,0,-1][(f+i*2)%4] : 0; rect(g, fx0+o, GROUND, 2, 1, "#f3b2b6"); });
    ell(g, bcx, bcy, 11, 8, C("body"));
    ell(g, bcx+4, bcy+3, 6, 3.5, C("belly"), {paint:true});
  }
  if (pose === "eat") { ell(g, m.fx-6, m.hy+3, 2.6, 2.2, C("belly")); ell(g, m.fx+4, m.hy+3, 2.6, 2.2, C("belly")); }
  face(g, B, m, pose === "sleep" ? "s" : expr, "hamster");
  m.mx = m.fx + 2; m.my = m.hy + 4;
  return {g, m};
}
const sprCache = new Map();
function gridCanvas(g, w, h){
  w = w || SW; h = h || SH;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const cx = c.getContext("2d"), img = cx.createImageData(w, h);
  for (let i=0;i<g.length;i++) { const col = g[i]; if (!col) continue; const v = hx(col); img.data[i*4]=v[0]; img.data[i*4+1]=v[1]; img.data[i*4+2]=v[2]; img.data[i*4+3]=255; }
  cx.putImageData(img, 0, 0); return c;
}
function getPixelSprite(sp, breedId, pose, f, expr, side){
  const key = sp+"|"+breedId+"|"+pose+"|"+f+"|"+expr+"|"+side;
  let s = sprCache.get(key); if (s) return s;
  const B = breedOf(sp, breedId);
  const r = sp === "hamster" ? buildHamster(B, pose, f, expr) : buildQuad(sp, B, pose, f, expr);
  s = {cv: gridCanvas(finish(r.g, B, r.m, sp, side)), m: r.m};
  if (sprCache.size > 900) sprCache.clear();
  sprCache.set(key, s); return s;
}

const CLAY_ART_DATA = [{"entries":{"cat/cheese|0":[31,8,193,240],"cat/cheese|1":[13,280,230,208],"cat/cheese|2":[41,520,173,240],"cat/cheese|3":[9,814,238,164],"cat/tuxedo|0":[292,8,184,240],"cat/tuxedo|1":[268,280,231,207],"cat/tuxedo|2":[299,520,170,240],"cat/tuxedo|3":[264,815,239,161],"cat/mackerel|0":[543,8,194,240],"cat/mackerel|1":[525,280,230,207],"cat/mackerel|2":[553,520,173,240],"cat/mackerel|3":[521,816,238,159],"cat/calico|0":[796,8,200,240],"cat/calico|1":[780,281,232,206],"cat/calico|2":[810,520,172,240],"cat/calico|3":[776,816,239,159],"cat/black|0":[1055,8,193,240],"cat/black|1":[1035,280,234,208],"cat/black|2":[1067,520,170,240],"cat/black|3":[1032,817,240,157],"cat/white|0":[1311,8,193,240],"cat/white|1":[1293,280,230,208],"cat/white|2":[1322,520,172,240],"cat/white|3":[1289,815,238,162]},"url":"assets/asset-05.webp"},{"entries":{"cat/russian|0":[48,8,160,240],"cat/russian|1":[8,279,240,209],"cat/russian|2":[56,520,143,240],"cat/russian|3":[8,821,240,150],"cat/siamese|0":[308,8,152,240],"cat/siamese|1":[269,279,229,209],"cat/siamese|2":[319,520,130,240],"cat/siamese|3":[264,819,240,154],"cat/persian|0":[532,8,215,240],"cat/persian|1":[520,279,240,209],"cat/persian|2":[540,520,200,240],"cat/persian|3":[520,816,240,160],"cat/fold|0":[799,10,194,236],"cat/fold|1":[776,292,240,183],"cat/fold|2":[814,528,163,224],"cat/fold|3":[776,822,240,148],"cat/munchkin|0":[1054,23,195,210],"cat/munchkin|1":[1033,300,237,167],"cat/munchkin|2":[1076,538,151,204],"cat/munchkin|3":[1032,825,240,142],"cat/norwegian|0":[1309,8,197,240],"cat/norwegian|1":[1288,280,240,208],"cat/norwegian|2":[1313,520,190,240],"cat/norwegian|3":[1288,814,240,163]},"url":"assets/asset-06.webp"},{"entries":{"cat/british|0":[31,8,194,240],"cat/british|1":[8,281,240,206],"cat/british|2":[37,520,182,240],"cat/british|3":[8,824,240,143],"cat/ragdoll|0":[280,8,208,240],"cat/ragdoll|1":[264,283,240,202],"cat/ragdoll|2":[291,520,185,240],"cat/ragdoll|3":[264,823,240,146],"cat/bengal|0":[549,8,182,240],"cat/bengal|1":[531,282,218,203],"cat/bengal|2":[560,520,159,240],"cat/bengal|3":[520,822,240,148],"cat/american|0":[802,8,188,240],"cat/american|1":[778,282,235,204],"cat/american|2":[814,520,164,240],"cat/american|3":[776,823,240,145],"dog/maltese|0":[1049,8,206,240],"dog/maltese|1":[1038,284,227,200],"dog/maltese|2":[1058,520,187,240],"dog/maltese|3":[1032,821,240,149],"dog/corgi|0":[1315,8,185,240],"dog/corgi|1":[1288,283,240,201],"dog/corgi|2":[1319,520,178,240],"dog/corgi|3":[1288,825,240,142]},"url":"assets/asset-07.webp"},{"entries":{"dog/poodle|0":[24,9,208,237],"dog/poodle|1":[15,280,226,207],"dog/poodle|2":[38,522,179,236],"dog/poodle|3":[8,819,240,153],"dog/pom|0":[290,11,187,233],"dog/pom|1":[274,281,220,205],"dog/pom|2":[297,524,174,232],"dog/pom|3":[264,817,240,158],"dog/shiba|0":[552,8,176,240],"dog/shiba|1":[525,278,230,212],"dog/shiba|2":[563,520,154,240],"dog/shiba|3":[520,817,239,158],"dog/jindo|0":[826,8,140,240],"dog/jindo|1":[781,273,230,221],"dog/jindo|2":[826,520,140,240],"dog/jindo|3":[776,816,240,159],"dog/golden|0":[1058,8,188,240],"dog/golden|1":[1032,290,240,188],"dog/golden|2":[1072,520,160,240],"dog/golden|3":[1032,826,240,140],"dog/bichon|0":[1319,8,177,240],"dog/bichon|1":[1296,282,223,204],"dog/bichon|2":[1330,520,156,239],"dog/bichon|3":[1288,818,239,155]},"url":"assets/asset-08.webp"},{"entries":{"dog/dachs|0":[9,23,238,210],"dog/dachs|1":[8,305,240,158],"dog/dachs|2":[39,532,177,215],"dog/dachs|3":[8,830,240,131],"dog/mix|0":[301,8,165,240],"dog/mix|1":[272,277,223,214],"dog/mix|2":[311,520,145,240],"dog/mix|3":[264,816,240,159],"rabbit/white|0":[559,8,162,240],"rabbit/white|1":[535,276,210,215],"rabbit/white|2":[565,520,149,240],"rabbit/white|3":[527,812,225,168],"rabbit/gray|0":[818,8,155,240],"rabbit/gray|1":[789,277,214,214],"rabbit/gray|2":[821,520,149,240],"rabbit/gray|3":[779,812,233,168],"rabbit/brown|0":[1073,8,157,240],"rabbit/brown|1":[1041,278,222,211],"rabbit/brown|2":[1077,520,149,240],"rabbit/brown|3":[1038,814,228,164],"rabbit/lop|0":[1310,8,196,240],"rabbit/lop|1":[1288,283,240,201],"rabbit/lop|2":[1316,520,184,240],"rabbit/lop|3":[1288,837,240,118]},"url":"assets/asset-09.webp"},{"entries":{"rabbit/dutch|0":[44,8,167,240],"rabbit/dutch|1":[12,275,232,218],"rabbit/dutch|2":[50,520,155,240],"rabbit/dutch|3":[8,795,240,201],"hamster/golden|0":[283,8,201,240],"hamster/golden|1":[268,291,232,185],"hamster/golden|2":[291,527,185,226],"hamster/golden|3":[267,819,234,154],"hamster/djungarian|0":[547,12,186,232],"hamster/djungarian|1":[531,303,217,162],"hamster/djungarian|2":[549,535,181,210],"hamster/djungarian|3":[525,822,229,147],"hamster/pearl|0":[804,18,184,220],"hamster/pearl|1":[786,306,219,156],"hamster/pearl|2":[805,539,182,201],"hamster/pearl|3":[786,824,220,144],"hamster/panda|0":[1058,14,187,228],"hamster/panda|1":[1040,304,224,160],"hamster/panda|2":[1062,537,180,205],"hamster/panda|3":[1032,821,240,149],"hamster/robo|0":[1318,20,180,215],"hamster/robo|1":[1299,310,218,148],"hamster/robo|2":[1320,541,176,198],"hamster/robo|3":[1295,824,225,143]},"url":"assets/asset-10.webp"},{"entries":{"parrot/conure|0":[31,10,194,235],"parrot/cockatiel|0":[296,10,176,236],"parrot/budgie|0":[545,13,190,229],"hedgehog/salt|0":[778,22,236,212],"hedgehog/cinnamon|0":[1034,19,236,217],"hedgehog/white|0":[1290,20,236,215],"parrot/conure|1":[14,275,228,218],"parrot/cockatiel|1":[267,267,233,233],"parrot/budgie|1":[531,276,217,215],"hedgehog/salt|1":[778,286,235,195],"hedgehog/cinnamon|1":[1036,286,232,195],"hedgehog/white|1":[1292,287,232,194],"parrot/conure|2":[50,526,156,228],"parrot/cockatiel|2":[310,522,148,236],"parrot/budgie|2":[563,528,154,224],"hedgehog/salt|2":[787,539,218,202],"hedgehog/cinnamon|2":[1045,539,214,202],"hedgehog/white|2":[1301,539,213,202],"parrot/conure|3":[17,794,222,203],"parrot/cockatiel|3":[275,787,217,217],"parrot/budgie|3":[533,804,214,183],"hedgehog/salt|3":[778,803,236,186],"hedgehog/cinnamon|3":[1034,802,236,188],"hedgehog/white|3":[1291,803,234,186]},"url":"assets/new-pet-poses.webp"}];
const CLAY_WALK_DATA = [{"entries":{"cat/cheese|0|0":[41,10,174,236],"cat/cheese|0|1":[297,10,174,236],"cat/cheese|0|2":[553,10,174,236],"cat/cheese|0|3":[809,10,174,236],"cat/tuxedo|0|0":[41,266,174,236],"cat/tuxedo|0|1":[297,266,174,236],"cat/tuxedo|0|2":[553,266,174,236],"cat/tuxedo|0|3":[809,266,174,236],"cat/mackerel|0|0":[40,522,175,236],"cat/mackerel|0|1":[296,522,175,236],"cat/mackerel|0|2":[552,522,175,236],"cat/mackerel|0|3":[808,522,175,236],"cat/calico|0|0":[41,778,174,236],"cat/calico|0|1":[297,778,174,236],"cat/calico|0|2":[553,778,174,236],"cat/calico|0|3":[809,778,174,236],"cat/black|0|0":[39,1034,177,236],"cat/black|0|1":[295,1034,177,236],"cat/black|0|2":[551,1034,177,236],"cat/black|0|3":[807,1034,177,236],"cat/white|0|0":[39,1290,178,235],"cat/white|0|1":[295,1290,178,235],"cat/white|0|2":[551,1290,178,235],"cat/white|0|3":[807,1290,178,235]},"url":"assets/asset-11.webp"},{"entries":{"cat/cheese|1|0":[10,30,236,196],"cat/cheese|1|1":[266,30,236,196],"cat/cheese|1|2":[522,30,236,196],"cat/cheese|1|3":[778,30,236,196],"cat/tuxedo|1|0":[10,286,236,196],"cat/tuxedo|1|1":[266,286,236,196],"cat/tuxedo|1|2":[522,286,236,196],"cat/tuxedo|1|3":[778,286,236,196],"cat/mackerel|1|0":[10,540,236,199],"cat/mackerel|1|1":[266,540,236,199],"cat/mackerel|1|2":[522,540,236,199],"cat/mackerel|1|3":[778,540,236,199],"cat/calico|1|0":[10,798,236,196],"cat/calico|1|1":[266,798,236,196],"cat/calico|1|2":[522,798,236,196],"cat/calico|1|3":[778,798,236,196],"cat/black|1|0":[10,1054,236,196],"cat/black|1|1":[266,1054,236,196],"cat/black|1|2":[522,1054,236,196],"cat/black|1|3":[778,1054,236,196],"cat/white|1|0":[10,1309,236,198],"cat/white|1|1":[266,1309,236,198],"cat/white|1|2":[522,1309,236,198],"cat/white|1|3":[778,1309,236,198]},"url":"assets/asset-12.webp"},{"entries":{"cat/cheese|2|0":[47,10,161,236],"cat/cheese|2|1":[303,10,161,236],"cat/cheese|2|2":[559,10,161,236],"cat/cheese|2|3":[815,10,161,236],"cat/tuxedo|2|0":[47,266,162,236],"cat/tuxedo|2|1":[303,266,162,236],"cat/tuxedo|2|2":[559,266,162,236],"cat/tuxedo|2|3":[815,266,162,236],"cat/mackerel|2|0":[45,522,165,235],"cat/mackerel|2|1":[301,522,165,235],"cat/mackerel|2|2":[557,522,165,235],"cat/mackerel|2|3":[813,522,165,235],"cat/calico|2|0":[45,779,165,233],"cat/calico|2|1":[301,779,165,233],"cat/calico|2|2":[557,779,165,233],"cat/calico|2|3":[813,779,165,233],"cat/black|2|0":[45,1035,166,234],"cat/black|2|1":[301,1035,166,234],"cat/black|2|2":[557,1035,166,234],"cat/black|2|3":[813,1035,166,234],"cat/white|2|0":[46,1291,164,233],"cat/white|2|1":[302,1291,164,233],"cat/white|2|2":[558,1291,164,233],"cat/white|2|3":[814,1291,164,233]},"url":"assets/asset-13.webp"},{"entries":{"cat/russian|0|0":[54,10,147,236],"cat/russian|0|1":[310,10,147,236],"cat/russian|0|2":[566,10,147,236],"cat/russian|0|3":[822,10,147,236],"cat/siamese|0|0":[55,266,146,236],"cat/siamese|0|1":[311,266,146,236],"cat/siamese|0|2":[567,266,146,236],"cat/siamese|0|3":[823,266,146,236],"cat/persian|0|0":[28,522,199,236],"cat/persian|0|1":[284,522,199,236],"cat/persian|0|2":[540,522,199,236],"cat/persian|0|3":[796,522,199,236],"cat/fold|0|0":[38,778,179,235],"cat/fold|0|1":[294,778,179,235],"cat/fold|0|2":[550,778,179,235],"cat/fold|0|3":[806,778,179,235],"cat/munchkin|0|0":[35,1042,185,220],"cat/munchkin|0|1":[291,1042,185,220],"cat/munchkin|0|2":[547,1042,185,220],"cat/munchkin|0|3":[803,1042,185,220],"cat/norwegian|0|0":[41,1290,174,236],"cat/norwegian|0|1":[297,1290,174,236],"cat/norwegian|0|2":[553,1290,174,236],"cat/norwegian|0|3":[809,1290,174,236]},"url":"assets/asset-14.webp"},{"entries":{"cat/russian|1|0":[10,26,236,204],"cat/russian|1|1":[266,26,236,204],"cat/russian|1|2":[522,26,236,204],"cat/russian|1|3":[778,26,236,204],"cat/siamese|1|0":[10,281,235,205],"cat/siamese|1|1":[266,281,235,205],"cat/siamese|1|2":[522,281,235,205],"cat/siamese|1|3":[778,281,235,205],"cat/persian|1|0":[10,539,236,201],"cat/persian|1|1":[266,539,236,201],"cat/persian|1|2":[522,539,236,201],"cat/persian|1|3":[778,539,236,201],"cat/fold|1|0":[10,808,236,176],"cat/fold|1|1":[266,808,236,176],"cat/fold|1|2":[522,808,236,176],"cat/fold|1|3":[778,808,236,176],"cat/munchkin|1|0":[10,1070,236,163],"cat/munchkin|1|1":[266,1070,236,163],"cat/munchkin|1|2":[522,1070,236,163],"cat/munchkin|1|3":[778,1070,236,163],"cat/norwegian|1|0":[10,1308,236,199],"cat/norwegian|1|1":[266,1308,236,199],"cat/norwegian|1|2":[522,1308,236,199],"cat/norwegian|1|3":[778,1308,236,199]},"url":"assets/asset-15.webp"},{"entries":{"cat/russian|2|0":[62,14,132,227],"cat/russian|2|1":[318,14,132,227],"cat/russian|2|2":[574,14,132,227],"cat/russian|2|3":[830,14,132,227],"cat/siamese|2|0":[65,271,126,226],"cat/siamese|2|1":[321,271,126,226],"cat/siamese|2|2":[577,271,126,226],"cat/siamese|2|3":[833,271,126,226],"cat/persian|2|0":[42,525,171,229],"cat/persian|2|1":[298,525,171,229],"cat/persian|2|2":[554,525,171,229],"cat/persian|2|3":[810,525,171,229],"cat/fold|2|0":[57,787,141,218],"cat/fold|2|1":[313,787,141,218],"cat/fold|2|2":[569,787,141,218],"cat/fold|2|3":[825,787,141,218],"cat/munchkin|2|0":[58,1052,139,200],"cat/munchkin|2|1":[314,1052,139,200],"cat/munchkin|2|2":[570,1052,139,200],"cat/munchkin|2|3":[826,1052,139,200],"cat/norwegian|2|0":[49,1290,158,236],"cat/norwegian|2|1":[305,1290,158,236],"cat/norwegian|2|2":[561,1290,158,236],"cat/norwegian|2|3":[817,1290,158,236]},"url":"assets/asset-16.webp"},{"entries":{"cat/british|0|0":[46,10,164,236],"cat/british|0|1":[302,10,164,236],"cat/british|0|2":[558,10,164,236],"cat/british|0|3":[814,10,164,236],"cat/ragdoll|0|0":[37,266,181,236],"cat/ragdoll|0|1":[293,266,181,236],"cat/ragdoll|0|2":[549,266,181,236],"cat/ragdoll|0|3":[805,266,181,236],"cat/bengal|0|0":[45,522,166,236],"cat/bengal|0|1":[301,522,166,236],"cat/bengal|0|2":[557,522,166,236],"cat/bengal|0|3":[813,522,166,236],"cat/american|0|0":[46,778,163,236],"cat/american|0|1":[302,778,163,236],"cat/american|0|2":[558,778,163,236],"cat/american|0|3":[814,778,163,236],"dog/maltese|0|0":[20,1034,215,236],"dog/maltese|0|1":[276,1034,215,236],"dog/maltese|0|2":[532,1034,215,236],"dog/maltese|0|3":[788,1034,215,236],"dog/corgi|0|0":[37,1290,181,236],"dog/corgi|0|1":[293,1290,181,236],"dog/corgi|0|2":[549,1290,181,236],"dog/corgi|0|3":[805,1290,181,236]},"url":"assets/asset-17.webp"},{"entries":{"cat/british|1|0":[15,35,225,186],"cat/british|1|1":[271,35,225,186],"cat/british|1|2":[527,35,225,186],"cat/british|1|3":[783,35,225,186],"cat/ragdoll|1|0":[10,288,236,191],"cat/ragdoll|1|1":[266,288,236,191],"cat/ragdoll|1|2":[522,288,236,191],"cat/ragdoll|1|3":[778,288,236,191],"cat/bengal|1|0":[12,546,231,188],"cat/bengal|1|1":[268,546,231,188],"cat/bengal|1|2":[524,546,231,188],"cat/bengal|1|3":[780,546,231,188],"cat/american|1|0":[10,800,236,192],"cat/american|1|1":[266,800,236,192],"cat/american|1|2":[522,800,236,192],"cat/american|1|3":[778,800,236,192],"dog/maltese|1|0":[10,1051,235,201],"dog/maltese|1|1":[266,1051,235,201],"dog/maltese|1|2":[522,1051,235,201],"dog/maltese|1|3":[778,1051,235,201],"dog/corgi|1|0":[10,1312,236,191],"dog/corgi|1|1":[266,1312,236,191],"dog/corgi|1|2":[522,1312,236,191],"dog/corgi|1|3":[778,1312,236,191]},"url":"assets/asset-18.webp"},{"entries":{"cat/british|2|0":[62,16,132,223],"cat/british|2|1":[318,16,132,223],"cat/british|2|2":[574,16,132,223],"cat/british|2|3":[830,16,132,223],"cat/ragdoll|2|0":[51,269,153,229],"cat/ragdoll|2|1":[307,269,153,229],"cat/ragdoll|2|2":[563,269,153,229],"cat/ragdoll|2|3":[819,269,153,229],"cat/bengal|2|0":[66,526,123,227],"cat/bengal|2|1":[322,526,123,227],"cat/bengal|2|2":[578,526,123,227],"cat/bengal|2|3":[834,526,123,227],"cat/american|2|0":[62,783,131,225],"cat/american|2|1":[318,783,131,225],"cat/american|2|2":[574,783,131,225],"cat/american|2|3":[830,783,131,225],"dog/maltese|2|0":[39,1036,177,232],"dog/maltese|2|1":[295,1036,177,232],"dog/maltese|2|2":[551,1036,177,232],"dog/maltese|2|3":[807,1036,177,232],"dog/corgi|2|0":[49,1294,157,227],"dog/corgi|2|1":[305,1294,157,227],"dog/corgi|2|2":[561,1294,157,227],"dog/corgi|2|3":[817,1294,157,227]},"url":"assets/asset-19.webp"},{"entries":{"dog/poodle|0|0":[29,12,198,231],"dog/poodle|0|1":[285,12,198,231],"dog/poodle|0|2":[541,12,198,231],"dog/poodle|0|3":[797,12,198,231],"dog/pom|0|0":[39,266,177,236],"dog/pom|0|1":[295,266,177,236],"dog/pom|0|2":[551,266,177,236],"dog/pom|0|3":[807,266,177,236],"dog/shiba|0|0":[54,522,148,236],"dog/shiba|0|1":[310,522,148,236],"dog/shiba|0|2":[566,522,148,236],"dog/shiba|0|3":[822,522,148,236],"dog/jindo|0|0":[68,778,119,236],"dog/jindo|0|1":[324,778,119,236],"dog/jindo|0|2":[580,778,119,236],"dog/jindo|0|3":[836,778,119,236],"dog/golden|0|0":[32,1034,191,236],"dog/golden|0|1":[288,1034,191,236],"dog/golden|0|2":[544,1034,191,236],"dog/golden|0|3":[800,1034,191,236],"dog/bichon|0|0":[37,1294,182,228],"dog/bichon|0|1":[293,1294,182,228],"dog/bichon|0|2":[549,1294,182,228],"dog/bichon|0|3":[805,1294,182,228]},"url":"assets/asset-20.webp"},{"entries":{"dog/poodle|1|0":[17,31,221,194],"dog/poodle|1|1":[273,31,221,194],"dog/poodle|1|2":[529,31,221,194],"dog/poodle|1|3":[785,31,221,194],"dog/pom|1|0":[21,285,214,198],"dog/pom|1|1":[277,285,214,198],"dog/pom|1|2":[533,285,214,198],"dog/pom|1|3":[789,285,214,198],"dog/shiba|1|0":[15,541,225,198],"dog/shiba|1|1":[271,541,225,198],"dog/shiba|1|2":[527,541,225,198],"dog/shiba|1|3":[783,541,225,198],"dog/jindo|1|0":[11,793,234,206],"dog/jindo|1|1":[267,793,234,206],"dog/jindo|1|2":[523,793,234,206],"dog/jindo|1|3":[779,793,234,206],"dog/golden|1|0":[10,1058,236,188],"dog/golden|1|1":[266,1058,236,188],"dog/golden|1|2":[522,1058,236,188],"dog/golden|1|3":[778,1058,236,188],"dog/bichon|1|0":[18,1311,220,193],"dog/bichon|1|1":[274,1311,220,193],"dog/bichon|1|2":[530,1311,220,193],"dog/bichon|1|3":[786,1311,220,193]},"url":"assets/asset-21.webp"},{"entries":{"dog/poodle|2|0":[38,10,180,236],"dog/poodle|2|1":[294,10,180,236],"dog/poodle|2|2":[550,10,180,236],"dog/poodle|2|3":[806,10,180,236],"dog/pom|2|0":[39,266,178,236],"dog/pom|2|1":[295,266,178,236],"dog/pom|2|2":[551,266,178,236],"dog/pom|2|3":[807,266,178,236],"dog/shiba|2|0":[63,522,130,236],"dog/shiba|2|1":[319,522,130,236],"dog/shiba|2|2":[575,522,130,236],"dog/shiba|2|3":[831,522,130,236],"dog/jindo|2|0":[65,778,125,236],"dog/jindo|2|1":[321,778,125,236],"dog/jindo|2|2":[577,778,125,236],"dog/jindo|2|3":[833,778,125,236],"dog/golden|2|0":[45,1034,166,236],"dog/golden|2|1":[301,1034,166,236],"dog/golden|2|2":[557,1034,166,236],"dog/golden|2|3":[813,1034,166,236],"dog/bichon|2|0":[47,1290,162,236],"dog/bichon|2|1":[303,1290,162,236],"dog/bichon|2|2":[559,1290,162,236],"dog/bichon|2|3":[815,1290,162,236]},"url":"assets/asset-22.webp"},{"entries":{"dog/dachs|0|0":[21,18,213,220],"dog/dachs|0|1":[277,18,213,220],"dog/dachs|0|2":[533,18,213,220],"dog/dachs|0|3":[789,18,213,220],"dog/mix|0|0":[42,266,171,236],"dog/mix|0|1":[298,266,171,236],"dog/mix|0|2":[554,266,171,236],"dog/mix|0|3":[810,266,171,236],"rabbit/white|0|0":[52,522,151,236],"rabbit/white|0|1":[308,522,151,236],"rabbit/white|0|2":[564,522,151,236],"rabbit/white|0|3":[820,522,151,236],"rabbit/gray|0|0":[53,778,150,236],"rabbit/gray|0|1":[309,778,150,236],"rabbit/gray|0|2":[565,778,150,236],"rabbit/gray|0|3":[821,778,150,236],"rabbit/brown|0|0":[54,1034,148,236],"rabbit/brown|0|1":[310,1034,148,236],"rabbit/brown|0|2":[566,1034,148,236],"rabbit/brown|0|3":[822,1034,148,236],"rabbit/lop|0|0":[19,1293,218,230],"rabbit/lop|0|1":[275,1293,218,230],"rabbit/lop|0|2":[531,1293,218,230],"rabbit/lop|0|3":[787,1293,218,230]},"url":"assets/asset-23.webp"},{"entries":{"dog/dachs|1|0":[10,48,236,160],"dog/dachs|1|1":[266,48,236,160],"dog/dachs|1|2":[522,48,236,160],"dog/dachs|1|3":[778,48,236,160],"dog/mix|1|0":[10,278,236,211],"dog/mix|1|1":[266,278,236,211],"dog/mix|1|2":[522,278,236,211],"dog/mix|1|3":[778,278,236,211],"rabbit/white|1|0":[12,525,232,230],"rabbit/white|1|1":[268,525,232,230],"rabbit/white|1|2":[524,525,232,230],"rabbit/white|1|3":[780,525,232,230],"rabbit/gray|1|0":[10,782,235,228],"rabbit/gray|1|1":[266,782,235,228],"rabbit/gray|1|2":[522,782,235,228],"rabbit/gray|1|3":[778,782,235,228],"rabbit/brown|1|0":[12,1038,232,228],"rabbit/brown|1|1":[268,1038,232,228],"rabbit/brown|1|2":[524,1038,232,228],"rabbit/brown|1|3":[780,1038,232,228],"rabbit/lop|1|0":[11,1309,233,198],"rabbit/lop|1|1":[267,1309,233,198],"rabbit/lop|1|2":[523,1309,233,198],"rabbit/lop|1|3":[779,1309,233,198]},"url":"assets/asset-24.webp"},{"entries":{"dog/dachs|2|0":[40,21,175,214],"dog/dachs|2|1":[296,21,175,214],"dog/dachs|2|2":[552,21,175,214],"dog/dachs|2|3":[808,21,175,214],"dog/mix|2|0":[49,266,157,236],"dog/mix|2|1":[305,266,157,236],"dog/mix|2|2":[561,266,157,236],"dog/mix|2|3":[817,266,157,236],"rabbit/white|2|0":[55,522,145,235],"rabbit/white|2|1":[311,522,145,235],"rabbit/white|2|2":[567,522,145,235],"rabbit/white|2|3":[823,522,145,235],"rabbit/gray|2|0":[54,779,147,234],"rabbit/gray|2|1":[310,779,147,234],"rabbit/gray|2|2":[566,779,147,234],"rabbit/gray|2|3":[822,779,147,234],"rabbit/brown|2|0":[56,1034,144,236],"rabbit/brown|2|1":[312,1034,144,236],"rabbit/brown|2|2":[568,1034,144,236],"rabbit/brown|2|3":[824,1034,144,236],"rabbit/lop|2|0":[30,1294,195,227],"rabbit/lop|2|1":[286,1294,195,227],"rabbit/lop|2|2":[542,1294,195,227],"rabbit/lop|2|3":[798,1294,195,227]},"url":"assets/asset-25.webp"},{"entries":{"rabbit/dutch|0|0":[50,10,156,236],"rabbit/dutch|0|1":[306,10,156,236],"rabbit/dutch|0|2":[562,10,156,236],"rabbit/dutch|0|3":[818,10,156,236],"hamster/golden|0|0":[29,269,197,230],"hamster/golden|0|1":[285,269,197,230],"hamster/golden|0|2":[541,269,197,230],"hamster/golden|0|3":[797,269,197,230],"hamster/djungarian|0|0":[35,529,185,222],"hamster/djungarian|0|1":[291,529,185,222],"hamster/djungarian|0|2":[547,529,185,222],"hamster/djungarian|0|3":[803,529,185,222],"hamster/pearl|0|0":[32,784,191,224],"hamster/pearl|0|1":[288,784,191,224],"hamster/pearl|0|2":[544,784,191,224],"hamster/pearl|0|3":[800,784,191,224],"hamster/panda|0|0":[35,1034,186,236],"hamster/panda|0|1":[291,1034,186,236],"hamster/panda|0|2":[547,1034,186,236],"hamster/panda|0|3":[803,1034,186,236],"hamster/robo|0|0":[31,1296,194,224],"hamster/robo|0|1":[287,1296,194,224],"hamster/robo|0|2":[543,1296,194,224],"hamster/robo|0|3":[799,1296,194,224]},"url":"assets/asset-26.webp"},{"entries":{"rabbit/dutch|1|0":[10,20,236,215],"rabbit/dutch|1|1":[266,20,236,215],"rabbit/dutch|1|2":[522,20,236,215],"rabbit/dutch|1|3":[778,20,236,215],"hamster/golden|1|0":[10,293,236,182],"hamster/golden|1|1":[266,293,236,182],"hamster/golden|1|2":[522,293,236,182],"hamster/golden|1|3":[778,293,236,182],"hamster/djungarian|1|0":[11,556,233,167],"hamster/djungarian|1|1":[267,556,233,167],"hamster/djungarian|1|2":[523,556,233,167],"hamster/djungarian|1|3":[779,556,233,167],"hamster/pearl|1|0":[11,812,233,167],"hamster/pearl|1|1":[267,812,233,167],"hamster/pearl|1|2":[523,812,233,167],"hamster/pearl|1|3":[779,812,233,167],"hamster/panda|1|0":[10,1068,236,168],"hamster/panda|1|1":[266,1068,236,168],"hamster/panda|1|2":[522,1068,236,168],"hamster/panda|1|3":[778,1068,236,168],"hamster/robo|1|0":[10,1322,236,171],"hamster/robo|1|1":[266,1322,236,171],"hamster/robo|1|2":[522,1322,236,171],"hamster/robo|1|3":[778,1322,236,171]},"url":"assets/asset-27.webp"},{"entries":{"rabbit/dutch|2|0":[58,10,140,236],"rabbit/dutch|2|1":[314,10,140,236],"rabbit/dutch|2|2":[570,10,140,236],"rabbit/dutch|2|3":[826,10,140,236],"hamster/golden|2|0":[40,275,176,217],"hamster/golden|2|1":[296,275,176,217],"hamster/golden|2|2":[552,275,176,217],"hamster/golden|2|3":[808,275,176,217],"hamster/djungarian|2|0":[42,536,172,208],"hamster/djungarian|2|1":[298,536,172,208],"hamster/djungarian|2|2":[554,536,172,208],"hamster/djungarian|2|3":[810,536,172,208],"hamster/pearl|2|0":[40,790,176,212],"hamster/pearl|2|1":[296,790,176,212],"hamster/pearl|2|2":[552,790,176,212],"hamster/pearl|2|3":[808,790,176,212],"hamster/panda|2|0":[39,1043,177,217],"hamster/panda|2|1":[295,1043,177,217],"hamster/panda|2|2":[551,1043,177,217],"hamster/panda|2|3":[807,1043,177,217],"hamster/robo|2|0":[39,1302,178,212],"hamster/robo|2|1":[295,1302,178,212],"hamster/robo|2|2":[551,1302,178,212],"hamster/robo|2|3":[807,1302,178,212]},"url":"assets/asset-28.webp"},{"entries":{"parrot/conure|0|0":[28,12,200,232],"parrot/conure|0|1":[284,12,200,232],"parrot/conure|0|2":[540,12,200,232],"parrot/conure|0|3":[796,12,200,232],"parrot/cockatiel|0|0":[35,266,185,236],"parrot/cockatiel|0|1":[291,266,185,236],"parrot/cockatiel|0|2":[547,266,185,236],"parrot/cockatiel|0|3":[803,266,185,236],"parrot/budgie|0|0":[29,522,197,236],"parrot/budgie|0|1":[285,522,197,236],"parrot/budgie|0|2":[541,522,197,236],"parrot/budgie|0|3":[797,522,197,236],"hedgehog/salt|0|0":[11,788,234,215],"hedgehog/salt|0|1":[267,788,234,215],"hedgehog/salt|0|2":[523,788,234,215],"hedgehog/salt|0|3":[779,788,234,215],"hedgehog/cinnamon|0|0":[10,1038,236,228],"hedgehog/cinnamon|0|1":[266,1038,236,228],"hedgehog/cinnamon|0|2":[522,1038,236,228],"hedgehog/cinnamon|0|3":[778,1038,236,228],"hedgehog/white|0|0":[10,1295,236,226],"hedgehog/white|0|1":[266,1295,236,226],"hedgehog/white|0|2":[522,1295,236,226],"hedgehog/white|0|3":[778,1295,236,226]},"url":"assets/new-pet-walk-0.webp"},{"entries":{"parrot/conure|1|0":[18,16,219,223],"parrot/conure|1|1":[274,16,219,223],"parrot/conure|1|2":[530,16,219,223],"parrot/conure|1|3":[786,16,219,223],"parrot/cockatiel|1|0":[20,266,216,236],"parrot/cockatiel|1|1":[276,266,216,236],"parrot/cockatiel|1|2":[532,266,216,236],"parrot/cockatiel|1|3":[788,266,216,236],"parrot/budgie|1|0":[19,531,217,217],"parrot/budgie|1|1":[275,531,217,217],"parrot/budgie|1|2":[531,531,217,217],"parrot/budgie|1|3":[787,531,217,217],"hedgehog/salt|1|0":[14,802,227,188],"hedgehog/salt|1|1":[270,802,227,188],"hedgehog/salt|1|2":[526,802,227,188],"hedgehog/salt|1|3":[782,802,227,188],"hedgehog/cinnamon|1|0":[14,1056,228,191],"hedgehog/cinnamon|1|1":[270,1056,228,191],"hedgehog/cinnamon|1|2":[526,1056,228,191],"hedgehog/cinnamon|1|3":[782,1056,228,191],"hedgehog/white|1|0":[13,1312,230,192],"hedgehog/white|1|1":[269,1312,230,192],"hedgehog/white|1|2":[525,1312,230,192],"hedgehog/white|1|3":[781,1312,230,192]},"url":"assets/new-pet-walk-1.webp"},{"entries":{"parrot/conure|2|0":[45,13,165,229],"parrot/conure|2|1":[301,13,165,229],"parrot/conure|2|2":[557,13,165,229],"parrot/conure|2|3":[813,13,165,229],"parrot/cockatiel|2|0":[52,266,152,236],"parrot/cockatiel|2|1":[308,266,152,236],"parrot/cockatiel|2|2":[564,266,152,236],"parrot/cockatiel|2|3":[820,266,152,236],"parrot/budgie|2|0":[44,526,167,228],"parrot/budgie|2|1":[300,526,167,228],"parrot/budgie|2|2":[556,526,167,228],"parrot/budgie|2|3":[812,526,167,228],"hedgehog/salt|2|0":[24,788,207,215],"hedgehog/salt|2|1":[280,788,207,215],"hedgehog/salt|2|2":[536,788,207,215],"hedgehog/salt|2|3":[792,788,207,215],"hedgehog/cinnamon|2|0":[23,1044,210,215],"hedgehog/cinnamon|2|1":[279,1044,210,215],"hedgehog/cinnamon|2|2":[535,1044,210,215],"hedgehog/cinnamon|2|3":[791,1044,210,215],"hedgehog/white|2|0":[22,1299,211,217],"hedgehog/white|2|1":[278,1299,211,217],"hedgehog/white|2|2":[534,1299,211,217],"hedgehog/white|2|3":[790,1299,211,217]},"url":"assets/new-pet-walk-2.webp"}];
/* Independent original artwork for each of the 36 breeds and four views.
 * Never recolor a different breed, flatten its muzzle or stretch its body.
 * Canvas coordinates AX/GROUND remain compatible with the existing game. */
const CLAY_SCALE=8,clayImages=[],clayViews=new Map(),clayFaces=new Map();
const clayWalkViews=new Map(),clayWalkAtlasFor=new Map(),clayWalkPending=new Set(),clayWalkLoaded=new Map();
let clayFailed=false;
function clayCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function clayEyeAnchors(sp,B){
 const y=sp==='parrot'?(B.id==='cockatiel'?.42:.31):sp==='hedgehog'?.53:sp==='rabbit'?(B.id==='lop'?.33:.49):sp==='hamster'?.29:sp==='cat'?.31:.34;
 return [[.35,y],[.65,y]];
}
function clayExpression(source,sp,B,view,expr,variant='still'){
 // Keep the approved eyes and smile untouched in normal and happy states.
 // Blink/bliss only close the original pupils, with locally sampled clay lids.
 if(view!==0||!['b','s'].includes(expr))return source;
 const key=sp+'/'+B.id+'|'+expr+'|'+variant;if(clayFaces.has(key))return clayFaces.get(key);
 const c=clayCanvas(source.width,source.height),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(source,0,0);
 const d=x.getImageData(0,0,c.width,c.height).data;
 for(const [u,v]of clayEyeAnchors(sp,B)){
  const ax=u*c.width,ay=v*c.height,rx=c.width*.075,ry=c.height*.055;
  let point=null,score=Infinity;
  for(let yy=Math.max(1,Math.floor(ay-ry));yy<Math.min(c.height-1,ay+ry);yy++)for(let xx=Math.max(1,Math.floor(ax-rx));xx<Math.min(c.width-1,ax+rx);xx++){
   const i=(yy*c.width+xx)*4,light=(d[i]+d[i+1]+d[i+2])/3,s=light+Math.hypot(xx-ax,yy-ay)*2;
   if(d[i+3]>235&&light<38&&s<score){score=s;point=[xx,yy];}
  }
  if(!point)continue;
  const [px,py]=point,r=Math.max(2,c.width*.033),sy=Math.max(1,Math.round(py-r*2)),si=(sy*c.width+px)*4;
  const lid=x.createRadialGradient(px-r*.25,py-r*.3,0,px,py,r*1.5);
  lid.addColorStop(0,`rgb(${d[si]},${d[si+1]},${d[si+2]})`);
  lid.addColorStop(1,`rgb(${Math.round(d[si]*.94)},${Math.round(d[si+1]*.94)},${Math.round(d[si+2]*.94)})`);
  x.fillStyle=lid;x.beginPath();x.ellipse(px,py,r*1.25,r*1.38,0,0,Math.PI*2);x.fill();
  x.strokeStyle='rgba(49,32,25,.82)';x.lineWidth=Math.max(1.2,c.width*.007);x.lineCap='round';
  x.beginPath();x.moveTo(px-r*.8,py);x.quadraticCurveTo(px,py+r*.66,px+r*.8,py);x.stroke();
 }
 if(clayFaces.size>=96)clayFaces.delete(clayFaces.keys().next().value);clayFaces.set(key,c);return c;
}
function clayHeight(sp,B,view){
 let h=({cat:29,dog:28,rabbit:32,hamster:29,parrot:29,hedgehog:29})[sp];
 // These are uniform scales, never separate width/height stretches.
 if(sp==='dog'&&B.id==='dachs')h=22;
 if(sp==='rabbit'&&B.id==='lop')h=25;
 if(view===1)h*=sp==='rabbit'?.88:['hamster','hedgehog'].includes(sp)?.78:sp==='dog'&&B.id==='dachs'?.68:.87;
 if(view===3)h*=.48;
 return h;
}
function requestClayWalk(sp,breedId,view){
 const group=sp+'/'+breedId+'|'+view,index=clayWalkAtlasFor.get(group);
 if(index==null||clayWalkPending.has(index))return;
 if(clayWalkLoaded.has(index)){const keys=clayWalkLoaded.get(index);clayWalkLoaded.delete(index);clayWalkLoaded.set(index,keys);return;}
 clayWalkPending.add(index);const atlas=CLAY_WALK_DATA[index],im=new Image();
 im.onload=()=>{
  try{
   const keys=[];
   for(const [key,[sx,sy,w,h]]of Object.entries(atlas.entries)){
    const c=clayCanvas(w,h);c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);clayWalkViews.set(key,c);keys.push(key);
   }
   clayWalkLoaded.set(index,keys);
   // Release less recently used animation atlases; all encoded art remains
   // embedded, so a later direction/breed can be decoded again without a fetch.
   const keepWalk=new Set();for(const p of fam())for(let v=0;v<3;v++){const i=clayWalkAtlasFor.get(p.species+'/'+breedOf(p.species,p.breed).id+'|'+v);if(i!=null)keepWalk.add(i);}
   for(const old of [...clayWalkLoaded.keys()]){if(clayWalkLoaded.size<=Math.max(9,keepWalk.size+1))break;if(keepWalk.has(old))continue;for(const key of clayWalkLoaded.get(old))clayWalkViews.delete(key);clayWalkLoaded.delete(old);}
   sprCache.clear();clayFaces.clear();
  }catch(e){console.error('Walk frames could not be prepared',index,e);}
  clayWalkPending.delete(index);im.onload=null;im.onerror=null;
 };
 im.onerror=()=>{clayWalkPending.delete(index);console.error('Walk frames could not load',index);};im.src=atlas.url;
}
function getAuthoredSprite(sp,breedId,pose,f,expr,side){
 const B=breedOf(sp,breedId),view=pose==='bwalk'?2:pose==='sleep'?3:['front','fwalk','sit'].includes(pose)?0:1;
 const moving=['walk','run','fwalk','bwalk'].includes(pose),walkKey=sp+'/'+B.id+'|'+view+'|'+(f%4);
 const authored=moving?clayWalkViews.get(walkKey):null;
 if(moving)requestClayWalk(sp,B.id,view);
 const key=[sp,breedId,pose,moving?f:0,view===0&&(expr==='b'||expr==='s')?expr:'n',authored?'walk-art-v4':'still-art-v4'].join('|');let cached=sprCache.get(key);if(cached)return cached;
 const raw=authored||clayViews.get(sp+'/'+B.id+'|'+view);
 if(!raw)return {cv:clayCanvas(SW*CLAY_SCALE,SH*CLAY_SCALE),m:{mx:AX,my:GROUND-15},clay:true,ready:false};
 const image=clayExpression(raw,sp,B,view,expr,authored?'walk:'+f:'still');
 const c=clayCanvas(SW*CLAY_SCALE,SH*CLAY_SCALE),x=c.getContext('2d');
 x.scale(CLAY_SCALE,CLAY_SCALE);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
 let h=clayHeight(sp,B,view)*(moving&&view!==1?.87:1),w=h*image.width/image.height;
 if(w>40){h*=40/w;w=40;}
 const left=AX-w/2,top=GROUND-h;
 x.save();
 // A small rigid eating tilt preserves the sculpted face/body proportions.
 if(pose==='eat'){x.translate(AX,GROUND);x.rotate(.065);x.translate(-AX,-GROUND);}
 // Play intact authored frames. No pixel warping, fake foot displacement or
 // added body bob: those movements are present in the artwork itself.
 x.drawImage(image,left,top,w,h);
 x.restore();
 const mx=view===0?AX:left+w*.90,my=top+h*(sp==='rabbit'?(B.id==='lop'?.48:.61):sp==='hamster'?.48:.46);
 cached={cv:c,m:{mx,my,front:view===0||view===2},clay:true,ready:true,motion:!!authored};
 if(sprCache.size>=192)sprCache.delete(sprCache.keys().next().value);sprCache.set(key,cached);return cached;
}

// Short, premultiplied transitions between authored poses. The middle of each
// contact pose stays crisp; only the final quarter eases into the next pose.
const smoothSpriteCache=new Map();
function getSprite(sp,breedId,pose,f,expr,side){
 const moving=['walk','run','fwalk','bwalk'].includes(pose);
 const phase=((f%4)+4)%4,index=Math.floor(phase);
 const a=getAuthoredSprite(sp,breedId,pose,moving?index:Math.floor(f),expr,side);
 if(!moving||!a.motion||RM)return a;
 const blend=clamp((phase-index-.70)/.30,0,1),step=blend<.25?0:blend<.5?5:blend<.75?11:16;   // two in-between frames are enough; keeps the saved set small
 if(!step)return a;
 const b=getAuthoredSprite(sp,breedId,pose,(index+1)%4,expr,side);if(!b.motion)return a;if(step>=16)return b;
 const key=[sp,breedId,pose,index,step,expr==='b'||expr==='s'?expr:'n'].join('|');let out=smoothSpriteCache.get(key);if(out)return out;
 const t=step/16,w=t*t*(3-2*t),c=clayCanvas(a.cv.width,a.cv.height),x=c.getContext('2d');
 x.globalAlpha=1-w;x.drawImage(a.cv,0,0);x.globalCompositeOperation='lighter';x.globalAlpha=w;x.drawImage(b.cv,0,0);
 out={...a,cv:c,m:{...a.m,mx:lerp(a.m.mx,b.m.mx,w),my:lerp(a.m.my,b.m.my,w)}};
 if(smoothSpriteCache.size>=128)smoothSpriteCache.delete(smoothSpriteCache.keys().next().value);smoothSpriteCache.set(key,out);return out;
}

function initClay(){
 CLAY_WALK_DATA.forEach((atlas,index)=>Object.keys(atlas.entries).forEach(key=>clayWalkAtlasFor.set(key.split('|').slice(0,2).join('|'),index)));
 CLAY_ART_DATA.forEach((atlas,index)=>{ const go=()=>{
  const im=new Image();clayImages.push(im);
  im.onload=()=>{
   try{
    const prepared=[];
    for(const [key,[sx,sy,sw,sh]]of Object.entries(atlas.entries)){
     const c=clayCanvas(sw,sh);c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,sw,sh);prepared.push([key,c]);
    }
    for(const [key,c]of prepared)clayViews.set(key,c);
    sprCache.clear();clayFaces.clear();
    if(setupOpen)renderBreeds();
    document.documentElement.dataset.clayReady=String(clayViews.size);renderDday();
   }catch(e){clayFailed=true;console.error('Clay art could not be prepared',index,e);}
  };
  im.onerror=()=>{clayFailed=true;console.error('Clay art could not load',index);};im.src=atlas.url;};
  // start-up speed: sheets for animals in this yard first, the rest a little later
  const mine=new Set(fam().map(p=>p.species+'/'+p.breed)),kinds=new Set(fam().map(p=>p.species));
  const need=setupOpen||!G.set||/[?&]visit=/.test(location.search)||Object.keys(atlas.entries).some(k=>{const id=k.split('|')[0];return mine.has(id)||kinds.has(id.split('/')[0])&&!fam().some(p=>p.breed);});
  if(need)go();else setTimeout(go,4500+index*600);
 });
 if(G.set)for(const pet of fam())for(let view=0;view<3;view++)requestClayWalk(pet.species,pet.breed,view);
}

/* small bitmaps */
const bmpCache = new Map();
function bmp(key, rows, pal, line){
  let c = bmpCache.get(key); if (c) return c;
  const o = line ? 1 : 0, w = rows[0].length + o*2, h = rows.length + o*2;
  let g = new Array(w*h).fill(null);
  rows.forEach((r,y) => [...r].forEach((chr,x) => { if (pal[chr]) g[(y+o)*w + x+o] = pal[chr]; }));
  if (line) { const out = g.slice(); for (let y=0;y<h;y++) for (let x=0;x<w;x++) { if (g[y*w+x]) continue; if ((x>0&&g[y*w+x-1])||(x<w-1&&g[y*w+x+1])||(y>0&&g[(y-1)*w+x])||(y<h-1&&g[(y+1)*w+x])) out[y*w+x] = line; } g = out; }
  c = gridCanvas(g, w, h); bmpCache.set(key, c); return c;
}
const PLUM = "#3b2340";
const BM = {
  heart: () => bmp("heart", [".pp.pp.","pwppppp","ppppppp",".ppppp.","..ppp..","...p..."], {p:"#ff8fb1", w:"#ffffff"}, PLUM),
  star: () => bmp("star", ["..y..",".yyy.","yywyy",".yyy.","..y.."], {y:"#ffe7a0", w:"#ffffff"}),
  twinkle: () => bmp("tw", [".y.","ywy",".y."], {y:"#ffe7a0", w:"#ffffff"}),
  spark: (c) => bmp("sp"+c, [".c.","ccc",".c."], {c}),
  ball: () => bmp("ball", [".rrrr.","rwwrrr","rwrrrr","rrrrrd","rrrrdd",".rddd."], {r:"#f08f72", w:"#fff3e6", d:"#c96650"}, PLUM),
  bone: () => bmp("bone", [".ww..ww.","wwwwwwww",".ww..ww."], {w:"#f3e3c6"}, "#7a5a3e"),
  fish: () => bmp("fish", [".bbbb..b","bebbbbbb",".bbbb..b"], {b:"#8fc0e6", e:"#2b1d2a"}, "#3f5f86"),
  carrot: () => bmp("carrot", [".g.g","..g.",".oo.",".oo.",".oo.","..o."], {g:"#6fb663", o:"#f39046"}, "#7a3d1c"),
  seed: () => bmp("seed", ["w.w.w",".www.","wwwww",".www.","w.w.w"], {w:"#ffffff"}),
  flower: (c) => bmp("fl"+c, [".p.","pyp",".p.",".g.","gg."], {p:c, y:"#ffd25e", g:"#5f9a5c"}),
  bowl: (full) => bmp("bowl"+full, full ? ["..k.kk.k..",".kkkkkkkk.","pppppppppp","pwpppppppp",".pppppppp.","..pppppp.."] : ["..........","..........","pppppppppp","pwppdddppp",".pppppppp.","..pppppp.."], {k:"#c98b52", p:"#ff9ec0", w:"#ffd6e4", d:"#e57fa6"}, PLUM),
  poop: () => bmp("poop", ["....b....","...bbh...","..bbbbb..",".bhbbbbb.",".bebbbeb.","bbbbmmbbb",".bbbbbbb."], {b:"#b07a4f", h:"#d9a57a", e:"#2b1d2a", m:"#f28aa0"}, "#6b4630"),
  picket: () => bmp("picket", [".w.","www","www","www","www","www","www","www","www","www","www","www"], {w:"#fffaf2"}, "#c9b8a6"),
  fly: (c, f) => bmp("fly"+c+f, f ? ["c.c","cbc","c.c"] : ["cc.cc","ccbcc",".c.c."], {c, b:"#3b2340"}),
  tulip: (c) => bmp("tu"+c, [".p.p.","ppppp","pwppp",".ppp.","..g..","g.g..",".gg.."], {p:c, w:"#ffffff", g:"#5f9a5c"}, "#5b3a6e"),
  env: () => bmp("env", ["wwwwwwwww","wlwwwwwlw","wwlwwwlww","wwwlhlwww","wwwwhwwww","wwwwwwwww"], {w:"#fffaf0", l:"#e6cfd9", h:"#ff8fb1"}, PLUM),
  cake: () => bmp("cake", ["....y....","....c....",".wwwwwww.","wpwpwpwpw","ppppppppp","pphpphppp","bbbbbbbbb"], {y:"#ffd25e", c:"#9cc8f3", w:"#fffaf0", p:"#ffb3c9", h:"#ff7fa3", b:"#d9d0e6"}, PLUM),
  balloon: (c) => bmp("bl"+c, [".bbb.","bwbbb","bbbbb","bbbbb",".bbb.","..b.."], {b:c, w:"#ffffff"}, PLUM),
  chute: () => bmp("chute", ["..ppppp..",".ppwpwpp.","ppppppppp","p.......p"], {p:"#ffc2d6", w:"#ffffff"})
};
const treatImg = (sp) => sp === "cat" ? BM.fish() : sp === "dog" ? BM.bone() : BM.carrot();

/* ---------- state ---------- */
const NAMES = ["나비","치즈","보리","콩이","모모","두부","율무","호두","별이","달이"];
const newPet = (i) => ({id: uid(), name: "", species: "cat", breed: "cheese", motto: "", photo: null, _n: i});
const SAMPLE = {family:[{id:"p1", name:"나비", species:"cat", breed:"cheese", motto:"", photo:null}], warmth:0, pats:0, catches:0, treats:0, stars:[], sky:"auto", lastVisit:0, updatedAt:0, set:false};
let G = JSON.parse(JSON.stringify(SAMPLE));
const LS_KEY = "starlight-yard-v1";
function normalize(){
  if (!Array.isArray(G.family) || !G.family.length) {
    const p = G.pet || SAMPLE.family[0];
    G.family = [{id:"p1", name:p.name || "나비", species:p.species || "cat", breed:p.breed || "", motto:p.motto || "", photo:G.photo || null}];
  }
  if (typeof G.pets === "number") { G.pats = (G.pats||0) + G.pets; }
  delete G.pets; delete G.pet; delete G.photo;
  G.pats = G.pats || 0;
  G.family.forEach(p => {
    if (!BREEDS[p.species]) p.species = "cat";
    if (!p.breed || !BREEDS[p.species].some(b => b.id === p.breed)) p.breed = BREEDS[p.species][0].id;
    delete p.color; petDates(p);
  });
  G.stars.forEach(s => { if (!s.to) s.to = "all"; });
  G.visits = Array.isArray(G.visits) ? G.visits : [];
  G.moods = G.moods && typeof G.moods === "object" ? G.moods : {};
  G.notes = Array.isArray(G.notes) ? G.notes : [];
  G.noteDate = G.noteDate || ""; G.breaths = G.breaths || 0;
}
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
const dayKey = (d) => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
try { const raw = localStorage.getItem(LS_KEY); if (raw) { const s = JSON.parse(raw); if (s && (s.pet || s.family)) G = Object.assign(G, s); } } catch(e) {}
normalize();
const prevVisit = G.lastVisit || 0;

/* ---------- persistence ---------- */
let docRef = null, writing = false, again = false, saveTimer = null;
function save(){
  if (window.__syVisit) return;
  G.updatedAt = Date.now(); G.lastVisit = Date.now();
  try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch(e) {}
  if (typeof cloudQueue === "function") cloudQueue();
  clearTimeout(saveTimer); saveTimer = setTimeout(flush, 1200);
}
function flush(){
  if (!docRef || window.__syVisit) return;
  if (writing) { again = true; return; }
  writing = true;
  docRef.set(JSON.parse(JSON.stringify(G))).catch(()=>{}).finally(() => { writing = false; if (again) { again = false; flush(); } });
}
(async () => {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    const ref = db.doc("data/users/" + id + "/garden");
    const snap = await Promise.race([ref.get(), new Promise((_,rej)=>setTimeout(()=>rej("timeout"),10000))]);
    docRef = ref;
    $("saveNote").textContent = "기록은 이 계정에만 보이도록 비공개로 저장돼요. 다른 기기에서 열어도 그대로예요.";
    if (snap.exists) {
      const r = snap.data();
      if (!window.__syVisit && r && (r.family || r.pet) && (r.updatedAt||0) > (G.updatedAt||0)) {
        G = Object.assign(JSON.parse(JSON.stringify(SAMPLE)), JSON.parse(JSON.stringify(r)));
        normalize();
        try { localStorage.setItem(LS_KEY, JSON.stringify(G)); } catch(e) {}
        afterLoad(); return;
      }
    }
    if (G.set) flush();
  } catch(e) {}
})();

/* ---------- canvas ---------- */
const cv = $("scene"), mctx = cv.getContext("2d");
const lcv = document.createElement("canvas"); let ctx = lcv.getContext("2d");
const bcv = document.createElement("canvas"), bctx = bcv.getContext("2d");
let vignette = null;
let W=0,H=0,DPR=1,P=3,LW=0,LH=0,groundY=0,S=1,dMin=0,dMax=0;
function resize(){
  const r = {width: cv.offsetWidth, height: cv.offsetHeight};
  DPR = Math.min(2, window.devicePixelRatio||1); W = r.width; H = r.height;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  P = clamp(Math.round(Math.min(W, H*0.9)/190), 2, 5);
  LW = Math.ceil(W/P); LH = Math.ceil(H/P); lcv.width = LW; lcv.height = LH;
  bcv.width = Math.max(1, Math.ceil(W/12)); bcv.height = Math.max(1, Math.ceil(H/12));
  const dockH = ($("dock").hidden ? 0 : $("dock").getBoundingClientRect().height) || 80;
  groundY = Math.round(H*(H < 520 ? 0.5 : 0.56)/P)*P; S = clamp(Math.min(W,H)/560, 0.72, 1.45);
  dMin = 3*P; dMax = Math.max(dMin+10*P, (dockTopInStage() || (H - dockH)) - 30 - groundY);
  vignette = mctx.createRadialGradient(W/2, H*0.45, Math.min(W,H)*0.3, W/2, H*0.45, Math.max(W,H)*0.8);
  vignette.addColorStop(0, "rgba(255,240,250,0)"); vignette.addColorStop(1, "rgba(70,40,110,0.3)");
  for (const e of ents) { e.x = clamp(e.x || W*0.5, 16*P, W-16*P); e.depth = clamp(e.depth || (dMin+dMax)/2, dMin, dMax); }
  decCache.clear(); buildBackdrop();
}
const L = (v) => Math.round(v/P);
const ds = (d) => 0.78 + 0.42*clamp((d - dMin)/Math.max(1, dMax - dMin), 0, 1);

let bgStars = [], flowers = [], clouds = [], bank = [], bits = [], stones = [], petals = [], sunPos = null, stripes = [];
function buildBackdrop(){
  const LG = L(groundY);
  bgStars = Array.from({length: Math.round(LW*LH/260)}, () => ({x:Math.floor(Math.random()*LW), y:Math.floor(Math.random()*LG*0.85), p:Math.random()*6, big: Math.random() < 0.08}));
  flowers = Array.from({length: 30}, (_,i) => ({x: 12 + (i*0.618034 % 1)*(W-24), d: dMin + ((i*0.381966*7)%1)*(dMax-dMin), c: ["#f6b8cf","#d9c2f2","#ffe39a","#ffffff","#f7a8a0"][i%5]}));
  clouds = Array.from({length: Math.max(4, Math.round(LW/40))}, (_,i) => ({x: Math.random()*LW, y: rand(0.1, 0.45)*LG, r: rand(4, 7)*(i%3===0?1.45:1), v: rand(0.5, 1.4)*(i%3===0?1.3:0.7)}));
  bank = Array.from({length: Math.ceil(LW/9)+2}, (_,i) => ({x: i*9 + (hash(i,9)%5) - 2, r: 5 + hash(i,4)%5}));
  bits = Array.from({length: Math.round(LW*0.7)}, (_,i) => { const k = hash(i,7) % 100, u = (hash(i,5) % 1000)/1000; return {x: hash(i,3) % LW, y: LG + 2 + Math.round(Math.pow(u, 0.8)*(LH - LG - 4)), t: k < 32 ? "blade" : k < 52 ? "clover" : k < 66 ? "daisy" : k < 76 ? "pebble" : "dot"}; });
  stones = Array.from({length: 7}, (_,i) => { const u = (i+0.5)/7, x0 = W*0.5, y0 = H - 40, x1 = W*0.3, y1 = groundY + cushionDepth() + 8, cx = W*0.47, cy = groundY + dMax*0.85; const x = (1-u)*(1-u)*x0 + 2*(1-u)*u*cx + u*u*x1, y = (1-u)*(1-u)*y0 + 2*(1-u)*u*cy + u*u*y1; return {x, y, d: y - groundY}; });
  stripes = []; const n = 9; for (let i=0;i<=n;i++) stripes.push(LG + Math.round(Math.pow(i/n, 1.9)*(LH-LG)));
}

/* sky keyframes: hour, skyTop, skyBottom, hillFar, hillNear, ground */
const SKY = [
  [0,   "#141a45","#2f3170","#262c5c","#1f3a4d","#28493f"],
  [4.5, "#181d4c","#3a3878","#2a2f60","#24404f","#2b4d42"],
  [6.2, "#6a73c0","#ffbfa6","#8b86bd","#6d9a8d","#78ac7c"],
  [8,   "#8cc4f2","#e3f4fb","#a4d2c1","#7cc093","#8fd087"],
  [16,  "#84bdf0","#ddf0f8","#9fcebd","#77bb8f","#8bcc83"],
  [18.2,"#8b77c4","#ffb08e","#9a8bbf","#6f9a8b","#7cab7a"],
  [19.6,"#3b3780","#8a66a8","#3f3f78","#2f5059","#345a4c"],
  [21,  "#181e4c","#36357a","#262c5c","#203c4e","#294a40"],
  [24,  "#141a45","#2f3170","#262c5c","#1f3a4d","#28493f"]
];
function hourNow(){ const m = {dawn:6.6, day:12.5, dusk:18.6, night:22.5}; if (G.sky && m[G.sky]) return m[G.sky]; const d = new Date(); return d.getHours() + d.getMinutes()/60; }
function palette(h){
  for (let i=0;i<SKY.length-1;i++){ const a=SKY[i], b=SKY[i+1]; if (h>=a[0] && h<=b[0]) { const t=Math.round((h-a[0])/(b[0]-a[0])*40)/40; return [1,2,3,4,5].map(k=>mix(a[k],b[k],t)); } }
  return SKY[0].slice(1);
}
function nightAmt(h){ if (h<4.5 || h>=21) return 1; if (h<6.6) return 1-(h-4.5)/2.1; if (h>=18.2) return (h-18.2)/2.8; return 0; }
let NIGHT = 0;

/* ---------- pets (entities) ---------- */
let ents = [];
const fam = () => setupOpen ? draftFam : G.family;
const petOf = (e) => fam().find(p => p.id === e.id) || fam()[0];
function makeEnt(p){ return {id:p.id, x:rand(W*0.25, W*0.75), depth:rand(dMin+(dMax-dMin)*0.3, dMax*0.85), dir:Math.random()<0.5?1:-1, state:"idle", stateT:0, anim:rand(0,5), target:null, onArrive:null, jumpY:0, vy:0, happy:0, think:rand(1,3), carry:false, blink:rand(1,4)}; }
function syncEnts(){
  const list = fam();
  ents = list.map(p => ents.find(e => e.id === p.id) || makeEnt(p));
  if (bubble && !ents.includes(bubble.e)) bubble = null;
  treats = treats.filter(t => ents.some(e => e.id === t.owner));
}
const awake = () => ents.filter(e => e.state !== "sleep");
const ey = (e) => groundY + e.depth;
function setState(e, s, think){ e.state = s; e.stateT = 0; e.front = false; if (think != null) e.think = think; }
function sitFront(e, t){ if (e.target) return; setState(e, "sit", t || rand(3,6)); e.front = true; }
function goTo(e, x, depth, fast, cb){ e.catchJump=null; e.bow=null; if(ball&&ball.by===e&&ball.state==='grabbing')ballFade(e); e.target = {x:clamp(x,16*P,W-16*P), depth:clamp(depth,dMin,dMax), fast:!!fast}; e.onArrive = cb||null; }

let ball = null, treats = [], glows = [], hearts = [], sparks = [], rising = null, bubble = null, bubbleCooldown = 6;
let ballMode = false, glowTimer = 0, lastPatWarm = 0, chimeT = 0, lastStar = null;
const bornAt = new Map();

const LINES = {
  any: ["여기 바람 좋다","천천히 쉬다 가","같이 있으니까 좋아","오늘 하루 고생 많았어","나 여기서 잘 지내","네 목소리 기억하고 있어","가끔 생각해 줘서 고마워","오늘은 뭐 하고 지냈어?","우리 좋은 시간 많았지"],
  dog: ["꼬리가 저절로 흔들려","산책 가고 싶다!","냄새 좋다, 킁킁"],
  cat: ["골골골…","햇볕 자리 찜했어","쓰다듬는 건 허락할게","꾹꾹이 해 줄까?","냥"],
  rabbit: ["깡총!","풀 냄새 좋아","코가 씰룩씰룩"],
  hamster: ["볼에 해바라기씨 가득","쪼르르르","바퀴 굴리고 싶다"],
  morning: ["좋은 아침!","오늘도 와 줘서 반가워"],
  night: ["별이 많네","졸려… 조금만 더 있다 가","밤하늘 같이 보자"],
  together: ["우리 여기서 같이 놀아","친구랑 있으니까 좋아","걱정 마, 우리 같이 있어"]
};
const MEOWS = ["야옹","냐앙","미야옹","냥!","먀아","골골골…"];
let bgLine = null;
function say(e, text, t){
  if (!e) return;
  const p = petOf(e);
  if (p && p.species === "cat") {
    const meowish = /골골|냥|야옹|먀/.test(text) && text.length < 8;
    bubble = {e, text: meowish ? text : pick(MEOWS), t: 2.2};
    if (!meowish) bgLine = {text, t: Math.max(4.5, (t||3.6) + 0.8), dur: Math.max(4.5, (t||3.6) + 0.8)};
  } else bubble = {e, text, t: t||3.6};
  bubbleCooldown = rand(14, 24);
}
function drawBgLine(dt){
  if (!bgLine) return;
  bgLine.t -= dt; if (bgLine.t <= 0) { bgLine = null; return; }
  const age = bgLine.dur - bgLine.t, a = Math.min(1, age/0.8, bgLine.t/0.9);
  let fs = P >= 3 ? 26 : 19;
  mctx.font = `700 ${fs}px ${FONT}`;
  while (fs > 13 && mctx.measureText(bgLine.text).width > W - 48) { fs -= 1; mctx.font = `700 ${fs}px ${FONT}`; }
  mctx.save();
  mctx.globalAlpha = a; mctx.textAlign = "center"; mctx.textBaseline = "middle";
  mctx.shadowColor = "rgba(59,35,64,0.15)"; mctx.shadowOffsetX = 0; mctx.shadowOffsetY = 2; mctx.shadowBlur = 6;
  mctx.fillStyle = NIGHT>.35?"#fff8f1":"#79617b";
  mctx.fillText(bgLine.text, W/2, groundY*0.58 - (RM ? 0 : age*3));
  mctx.restore();
}
function idleLine(){
  const pool0 = awake(); if (!pool0.length) return;
  const e = pick(pool0), p = petOf(e), h = hourNow();
  let pool = LINES.any.concat(LINES[p.species]||[]);
  if (h>=5 && h<10) pool = pool.concat(LINES.morning);
  if (NIGHT>0.6) pool = pool.concat(LINES.night, LINES.night);
  if (ents.length > 1) pool = pool.concat(LINES.together);
  if (e.state === "sit" || e.state === "idle") sitFront(e, rand(4,6));
  say(e, pick(pool));
}
function unlocked(key){ const u = UNLOCKS.find(u=>u.key===key); return !!u && G.warmth >= u.at; }
function has(key){ return unlocked(key) && !(G.hidden || []).includes(key); }
function cushionDepth(){ return decoAt("cushion", W*0.24, dMin + (dMax-dMin)*0.22).d; }
function cushionX(){ return decoAt("cushion", W*0.24, dMin + (dMax-dMin)*0.22).x; }
function cushionSlot(e){ const i = ents.indexOf(e), n = ents.length; return cushionX() + (i - (n-1)/2)*Math.min(9*P, 60); }
function decide(e){
  const r = Math.random(), sleepy = NIGHT*0.3 + 0.07;
  const others = ents.filter(o => o !== e && o.state !== "sleep");
  if (others.length && r < 0.16) {
    const o = pick(others), side = e.x < o.x ? -1 : 1;
    goTo(e, o.x + side*15*P*ds(o.depth), o.depth + rand(-4,4), false, () => { e.dir = o.x > e.x ? 1 : -1; setState(e, "sit", rand(4,7)); e.happy = 1.2; heartBurst(lerp(e.x,o.x,0.5), ey(e) - 24*P*ds(e.depth)); if (!o.target) { o.dir = -e.dir; o.happy = 1; } });
  } else if (r < 0.16 + sleepy) { const go = () => setState(e, "sleep", rand(9,16)); if (has("cushion")) goTo(e, cushionSlot(e), cushionDepth()+2, false, go); else go(); }
  else if (r < 0.4 + sleepy) { setState(e, "sit", rand(4,8)); e.front = Math.random() < 0.6; }
  else if (r < 0.48 + sleepy) setState(e, "idle", rand(2,4));
  else goTo(e, rand(W*0.1, W*0.9), rand(dMin, dMax), false, () => setState(e, "idle", rand(1.5,4)));
}
function updatePet(e, dt){
  if(!e.target)e.moveSpeed=0;
  e.anim += dt; e.stateT += dt; e.happy = Math.max(0, e.happy-dt); e.bliss = Math.max(0, (e.bliss||0) - dt);
  { const mine = rub && rub.e === e, moving = mine && performance.now() - rub.last < 180;
    const tLean = mine ? rub.tx : 0, tPress = moving ? 0.6 + 0.4*(rub.ty||0.5) : (mine ? 0.35 : 0);
    e.leanV = (e.leanV||0) + ((tLean - (e.lean||0))*16 - (e.leanV||0)*5.5)*dt;
    e.lean = (e.lean||0) + e.leanV*dt;
    e.press = (e.press||0) + (tPress - (e.press||0))*Math.min(1, dt*(tPress > (e.press||0) ? 2.2 : 1.4)); }
  if ((rub && rub.e === e) || breathing) e.think = Math.max(e.think, 2);
  e.blink -= dt; if (e.blink < -0.14) e.blink = rand(2.5, 5);
  if (e.jumpY > 0 || e.vy > 0) { e.vy -= 1500*S*dt; e.jumpY = Math.max(0, e.jumpY + e.vy*dt); if (e.jumpY===0) e.vy = 0; }
  if(updateCatchJump(e,dt))return;
  if(e.bow){e.bow.t+=dt;if(e.bow.t>=1.02){e.bow=null;setState(e,'idle',2);}else return;}
  if(ball&&ball.state==='grabbing'&&ball.by===e)return;
  if (e.target) {
    const dx = e.target.x-e.x, dd = e.target.depth-e.depth, dist = Math.hypot(dx,dd);
    const desired = (e.target.fast ? 230*(e.boost||1) : 75) * S * (0.7 + 0.3*ds(e.depth));
    // Braking distance determines approach speed; exponential easing is stable
    // across refresh rates. Advance phase from actual travel at this depth.
    const stopping=Math.sqrt(Math.max(0,2*desired*3.8*dist));
    const goal=Math.min(desired,stopping),ease=1-Math.exp(-dt*7);
    e.moveSpeed=(e.moveSpeed||0)+(goal-(e.moveSpeed||0))*ease;
    if (dist < .35) { e.moveSpeed=0;e.target = null; setState(e, "idle", rand(2,4)); const cb = e.onArrive; e.onArrive = null; cb && cb(); }
    else { const st = Math.min(dist, e.moveSpeed*dt); e.walkDistance = (e.walkDistance||0)+st;
      const pet=petOf(e),stride=Math.max(1,12*P*ds(e.depth)*1.4*petSizeFactor(pet)*(e.target.fast?1.6:1));
      e.walkPhase=((e.walkPhase||0)+st/stride*4)%4;
      e.x += dx/dist*st; e.depth += dd/dist*st; e.mdx = dx/dist;
      e.mdd=(e.mdd||0)+(dd/dist-(e.mdd||0))*(1-Math.exp(-dt*9));
      if (Math.abs(dx) > 5*P) e.dir = dx>0 ? 1 : -1; e.state = e.target.fast ? "run" : "walk"; }

  } else if (e.state === "eat") {
    e.moveSpeed=0;
    if (e.stateT > 2.15 && e.atBowl) { e.atBowl = false; bowlDone(e); }
    if (e.stateT > 2.15) { setState(e, "idle", 3); e.happy = 1.4; if (!bubble) say(e, pick(["냠냠, 맛있다!","이거 제일 좋아해","고마워!"])); }
  } else if (ball && ball.state === "ground" && e.state !== "sleep") approachBall(e);
  else {
    const tr = treats.find(t => t.owner === e.id && t.landed && !t.eating);
    if (tr && (!ball || ball.state === "drop")) goTo(e, tr.x - 6*P*ds(tr.d), tr.d, true, () => eatTreat(e, tr));
    else if (!ball || ball.state === "drop" || e.state === "sleep") { e.think -= dt; if (e.think <= 0) { if (e.state==="sleep") setState(e, "sit", 3); else decide(e); } }
  }
}

/* ball */
function throwBall(tx, ty){
  if (ball) return;
  bowl.full=false;bowl.left=0;bowl.round=null;for(const e of ents)e.atBowl=false;
  const td = clamp(ty - groundY, dMin, dMax);
  ball = {round:uid(),sx:W*0.5, sy:H+10, tx:clamp(tx,16*P,W-16*P), td, p:0, dur:1.55, peak:Math.min(H*0.42, 300*S), state:"fly", x:W*0.5, y:H+10, alt:0, fade:1, bounce:0, by:null};
  const order = [...ents].sort((a,b) => ((a.wins||0) - (b.wins||0)) || (Math.random() - 0.5));
  order.forEach((e, i) => { e.boost = i === 0 ? 1.22 : rand(0.8, 1.0); });
  const _far = (e) => Math.hypot((e.x - ball.tx)/Math.max(1, W), (e.depth - td)/Math.max(1, dMax - dMin)*0.6);
  let chasers = ents.filter(e => e.state !== "eat" && _far(e) < 0.42);
  if (!chasers.length) chasers = [...ents].filter(e => e.state !== "eat").sort((a,b) => _far(a) - _far(b)).slice(0, 1);
  if (!chasers.length) chasers = [...ents].sort((a,b) => _far(a) - _far(b)).slice(0, 1);
  ents.forEach(e => { if (!chasers.includes(e) && !e.target && e.state !== "eat" && e.state !== "sleep") e.dir = ball.tx >= e.x ? 1 : -1; });
  chasers.forEach(e => { e.chaseRound=ball.round;requestBend(petOf(e));requestReach(petOf(e));requestCrouch(petOf(e));if (e.state === "sleep") setState(e, "idle"); goTo(e, ball.tx + rand(-6,6)*P, td + rand(-6,6), true, () => pickBall(e)); });
  planJumpCatch();
  sfx("throw");
}
function ballMouth(e){
 const p=petOf(e),k=P*ds(e.depth)*1.4*petSizeFactor(p),amount=bendAmount(e),spr=(jumpCrouchAmount(e)!==null?getCrouchSprite(p,jumpCrouchAmount(e)):null)||(e.catchJump?.phase==='air'?getReachSprite(p,reachFrame(e)):null)||(amount!==null?getBendSprite(p,amount):null)||getBendSprite(p,0)||getSprite(p.species,p.breed,'stand',0,'n',e.dir),b=BM.ball(),bk=P*ds(e.depth);
 return {x:e.x+e.dir*(spr.m.mx-AX)*k,y:ey(e)-e.jumpY+(spr.m.my-GROUND)*k-b.height*bk*.1};
}
function approachBall(e){
 if(!ball||ball.state!=='ground')return;
 e.dir=ball.x>=e.x?1:-1;
 let reach=Math.abs(ballMouth(e).x-e.x),x=ball.x-e.dir*reach;
 if(x<16*P||x>W-16*P){e.dir*=-1;x=ball.x-e.dir*reach;}
 goTo(e,x,ball.td,true,()=>pickBall(e));
}
function beginBallGrab(e,caught){
 if(!ball||!['fly','ground'].includes(ball.state))return;
 const b=BM.ball(),bk=P*ds(ball.td),scale=ball.state==='fly'?1+(1-ball.p)*.9:1;
 ball.grabX=ball.x;ball.grabY=ball.y-ball.alt-b.height*bk*scale*.5;ball.grabScale=scale;
 ball.state='grabbing';ball.by=e;ball.caught=caught;ball.grabT=0;ball.alt=0;
 e.target=null;e.onArrive=null;e.moveSpeed=0;e.carry=false;setState(e,'stand');
 e.wins=(e.wins||0)+1;ents.forEach(o=>o.boost=1);othersStop(e);
}
function pickBall(e){
 if(!ball||ball.state!=='ground')return;
 const mouth=ballMouth(e);
 if(Math.abs(mouth.x-ball.x)>4*P&&Math.abs(e.x-clamp(ball.x-e.dir*Math.abs(mouth.x-e.x),16*P,W-16*P))>P){approachBall(e);return;}
 beginBallGrab(e,false);
}
function othersStop(winner){
 const bx=ball?.x??winner.x,bd=ball?.td??winner.depth;
 for(const o of ents)if(o!==winner&&((ball&&o.chaseRound===ball.round)||(o.target&&o.target.fast))){
  const near=Math.hypot((o.x-bx)/Math.max(1,W),(o.depth-bd)/Math.max(1,dMax-dMin)*0.6)<0.075;   // only pets right by the ball (about a body away) bow for it
  if(o.catchJump)o.catchJump.missed=true;
  else if(near)startMissedBow(o,ball?.round||'pickup',bx);
  else{o.target=null;o.onArrive=null;o.moveSpeed=0;o.dir=bx>=o.x?1:-1;setState(o,'stand',rand(1.2,2.2));}
  o.happy=.8;}
}
function bringBack(e, caught){
  goTo(e, W*0.5 + rand(-0.12, 0.12)*W, dMin + (dMax-dMin)*rand(0.5, 0.75), false, () => {
    e.carry = false; if (!ball) return;
    ball.state = "drop"; ball.x = e.x + e.dir*14*P*ds(e.depth); ball.y = ey(e); ball.td = e.depth; ball.alt = 0; ball.fade = 1; ball.by = null;
    e.happy = 1.6;
    addWarmth(caught ? 2 : 1);
    say(e, caught ? pick(["봤어? 잡았어!","한 번 더!","나 잘했지?"]) : pick(["가져왔어!","또 던져 줘","헥헥, 재밌다"]));
    save();
  });
}
function updateBall(dt){
  if (!ball) return;
  if (ball.state === "fly") {
    if(!ball.jumpPlan&&ball.p<.4)planJumpCatch();
    ball.p += dt/ball.dur; const p = Math.min(1, ball.p);
    ball.x = lerp(ball.sx, ball.tx, p); ball.y = lerp(ball.sy, groundY + ball.td, p); ball.alt = 4*ball.peak*p*(1-p);
    const pd = lerp(dMax+60*S, ball.td, p);
    const plan=ball.jumpPlan;
    if(plan&&!plan.started&&ball.p*ball.dur>=plan.at){
      plan.started=true;const e=plan.e;
      if(ents.includes(e)&&Math.hypot(e.x-plan.x,e.depth-plan.d)<7*P){e.target=null;e.onArrive=null;e.moveSpeed=0;e.dir=plan.dir;setState(e,'stand');e.catchJump={phase:'prep',t:0,v:plan.v,vx:clamp((plan.x-e.x)/plan.air,-90*S,90*S)};startMissedJumps(e,plan);}
    }
    const can = ents.filter(e => { const k=P*ds(e.depth),mouth=ballMouth(e),bb=BM.ball();
      const cy=ball.y-ball.alt-bb.height*k*(1+(1-p)*.9)*.5;
      return !!e.catchJump&&!e.catchJump.missed&&e.catchJump.phase==='air'&&e.jumpY>2*S&&p>.65&&Math.hypot(mouth.x-ball.x,mouth.y-cy)<4*k;
    });
    if(can.length){
      const e=can.sort((a,b)=>Math.hypot(ballMouth(a).x-ball.x,ballMouth(a).y-(ball.y-ball.alt))-Math.hypot(ballMouth(b).x-ball.x,ballMouth(b).y-(ball.y-ball.alt)))[0];
      ball.state='carried';ball.by=e;ball.carryT=0;e.carry=true;e.wins=(e.wins||0)+1;G.catches++;e.happy=1.2;
      ball.grabY=ball.y-ball.alt;ents.forEach(o=>o.boost=1);othersStop(e);
      sparkBurst(ball.x,ball.grabY,'#ffe08a',8);toast(petOf(e).name+' 멋진 캐치!');sfx('catch');return;
    }

    if (ball.p >= 1) { ball.state = "ground"; ball.bounce = 1; }
  } else if (ball.state === "ground") {
    ball.bounce = Math.max(0, ball.bounce - dt*1.6); ball.alt = Math.abs(Math.sin(ball.bounce*9))*ball.bounce*8*P; ball.y = groundY + ball.td;
    ball.groundT = (ball.groundT || 0) + dt;
    // nobody is on the way (a tap, meal or petting changed their plan): send the nearest pet again
    if (ball.groundT > 2.5 && !ents.some(e => e.target && e.onArrive)) {
      const near = ents.filter(e => e.state !== "eat").sort((a,b) => Math.hypot(a.x - ball.x, a.depth - ball.td) - Math.hypot(b.x - ball.x, b.depth - ball.td))[0];
      if (near) { if (near.state === "sleep") setState(near, "idle"); approachBall(near); }
      ball.groundT = 0.5;
    }
    if ((ball.age || 0) > 20) ballFade();
  } else if (ball.state === 'grabbing') {
    const e=ball.by;if(!e||!ents.includes(e)){ballFade();return;}
    ball.grabT+=dt;const duration=ball.caught?.22:1.02;
    const mouth=ballMouth(e),bb=BM.ball(),bk=P*ds(e.depth);
    if(ball.caught){const u=clamp(ball.grabT/.22,0,1),t=u*u*(3-2*u);ball.x=lerp(ball.grabX,mouth.x,t);ball.y=lerp(ball.grabY,mouth.y,t)+bb.height*bk*.5;}
    else if(ball.grabT<.40){ball.x=ball.grabX;ball.y=ball.grabY+bb.height*bk*.5;}
    else{const u=clamp((ball.grabT-.40)/.12,0,1),t=u*u*(3-2*u);ball.x=lerp(ball.grabX,mouth.x,t);ball.y=lerp(ball.grabY,mouth.y,t)+bb.height*bk*.5;}
    ball.td=e.depth;ball.alt=0;
    ball.grabScale=lerp(ball.grabScale,1,Math.min(1,dt*18));
    if(ball.grabT>=duration){const caught=ball.caught;ball.state='carried';ball.carryT=0;e.carry=true;bringBack(e,caught);}
  } else if (ball.state === "carried") {
    ball.carryT = (ball.carryT || 0) + dt;
    const c = ball.by;
    // the carrier lost its way back (petted, fed, removed...): let the ball go where it is
    if (!c || !ents.includes(c) || (ball.carryT > 1 && !c.catchJump && !(c.target && c.onArrive))) { if (c) c.carry = false; ballFade(c); }
  } else if (ball.state === "drop") { ball.fade -= dt*0.8; if (ball.fade <= 0) { ents.forEach(e => e.carry = false); ball = null; } }
  if (ball) { ball.age = (ball.age || 0) + dt; if (ball.age > 40) ballFade(); }
}
function ballFade(e){
  if (!ball || ball.state === "drop") return;
  if (e && ents.includes(e)) { ball.x = e.x + e.dir*14*P*ds(e.depth); ball.y = ey(e); ball.td = e.depth; }
  ball.state = "drop"; ball.alt = 0; ball.fade = 1; ball.by = null; ents.forEach(x => x.carry = false);
}

/* treats: one for each pet */
function dropTreat(){
  if (treats.length) { const e = pick(ents); say(e, "아직 남았어!"); return; }
  ents.forEach((e, i) => {
    const x = clamp(e.x + rand(-W*0.18, W*0.18), W*0.1, W*0.9), d = clamp(e.depth + rand(-20, 20), dMin, dMax);
    treats.push({owner:e.id, x, d, y:-20 - i*40, vy:0, landed:false, sway:rand(0,6), eating:false});
    if (e.state === "sleep") setState(e, "idle");
  });
  sfx("treat");
}
function eatTreat(e, tr){
  if (!tr || tr.eating || !treats.includes(tr)) return;
  tr.eating = true; e.dir = tr.x >= e.x ? 1 : -1; setState(e, "eat");
  setTimeout(() => { treats = treats.filter(t => t !== tr); G.treats++; addWarmth(1); save(); }, 1300);
}
function updateTreats(dt){
  for (const t of treats) { if (t.landed) continue; t.vy = Math.min(t.vy + 400*dt, 150); t.y += t.vy*dt; t.sway += dt*3; if (t.y >= groundY + t.d) { t.y = groundY + t.d; t.landed = true; } }
}

/* drifting lights */
function spawnGlow(){ if (lanternMode) return; glows.push({x:rand(W*0.06,W*0.94), y:rand(H*0.3, groundY + dMax*0.8), vx:rand(-14,14), vy:rand(-8,8), p:rand(0,6), life:0, kind: NIGHT > 0.45 ? "fly" : "seed"}); }
function updateGlows(dt){
  glowTimer -= dt;
  if (glows.length < 6 && glowTimer <= 0) { spawnGlow(); glowTimer = rand(1.5, 4); }
  const k = RM ? 0.4 : 1;
  for (const g of glows) {
    g.p += dt; g.life = Math.min(1, g.life + dt*0.7);
    g.x += (g.vx + Math.sin(g.p*0.9)*12)*dt*k; g.y += (g.vy + Math.cos(g.p*1.3)*10)*dt*k;
    if (g.x < 10 || g.x > W-10) g.vx *= -1;
    if (g.y < H*0.22 || g.y > groundY + dMax) g.vy *= -1;
  }
}
function collectGlow(i){
  const g = glows[i]; glows.splice(i,1);
  sparkBurst(g.x, g.y, g.kind==="fly" ? "#fff0a8" : "#ffffff", 10);
  addWarmth(1); sfx("glow");
  ents.forEach(e => { if (e.state !== "sleep" && !e.target && !ball) { e.dir = g.x > e.x ? 1 : -1; } });
  save();
}

/* effects */
function sparkBurst(x,y,c,n){ for (let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=rand(40,140); sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,t:rand(0.5,0.9),c}); } }
function heartBurst(x,y){ for (let i=0;i<3;i++) hearts.push({x:x+rand(-8*P,8*P), y:y-rand(0,4*P), vy:rand(-50,-34), t:1.4+i*0.15}); }
function updateFx(dt){
  for (const s of sparks){ s.t -= dt; s.x += s.vx*dt; s.y += s.vy*dt; s.vy += 120*dt; s.vx *= 0.97; }
  sparks = sparks.filter(s => s.t > 0);
  for (const h of hearts){ h.t -= dt; h.y += h.vy*dt; }
  hearts = hearts.filter(h => h.t > 0);
  if (rising && !rising.hold) { rising.t += dt/2.2; if (rising.t >= 1) { bornAt.set(rising.star.id, performance.now()); rising = null; if (lastStar) sparkBurst(lastStar.x*LW*P, lastStar.y*LH*P, "#ffe6a8", 18); sfx("star"); } }
}
function addWarmth(n){
  const before = G.warmth; G.warmth += n;
  for (const u of UNLOCKS) if (before < u.at && G.warmth >= u.at) { toast(u.msg); sfx("unlock"); decCache.clear(); }
  renderHud();
}

/* ---------- low-res backdrop (sky, clouds, hills, meadow) ---------- */
function fr(x,y,w,h,c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function pxEll(cx,cy,rx,ry,c){
  ctx.fillStyle = c;
  for (let y=-Math.ceil(ry); y<=Math.ceil(ry); y++){ const t = 1 - (y*y)/((ry+0.5)*(ry+0.5)); if (t < 0) continue; const w = Math.round((rx+0.5)*Math.sqrt(t)); ctx.fillRect(Math.round(cx)-w, Math.round(cy)+y, w*2+1, 1); }
}
function blit(img, x, y){ drawArtImage(ctx,img, Math.round(x - img.width/2), Math.round(y)); }
function glow(c, x, y, r, rgb, a){ const g = c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${rgb},${a})`); g.addColorStop(1,`rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x-r,y-r,r*2,r*2); }
const PUFF = [[0,0,1],[-1.15,0.35,0.72],[1.1,0.3,0.78],[0.45,-0.45,0.72],[-0.5,-0.3,0.62],[1.85,0.55,0.48],[-1.85,0.6,0.44]];
function cloudCols(pal){ const base = mix(mix(pal[1], "#ffffff", 0.7), "#8a86c8", Math.round(NIGHT*10)/20); return {base, hi: mix(base, NIGHT > 0.5 ? "#dcdaff" : "#ffffff", 0.65), sh: mix(base, pal[0], 0.3)}; }
function puff(x, y, r, cols){
  for (const [dx,dy,k] of PUFF) pxEll(x+dx*r, y+dy*r+1, k*r, k*r*0.82, cols.sh);
  for (const [dx,dy,k] of PUFF) pxEll(x+dx*r, y+dy*r, k*r, k*r*0.82, cols.base);
  for (const [dx,dy,k] of PUFF) if (dy <= 0.35) pxEll(x+dx*r-1, y+dy*r-Math.max(1,k*r*0.3), k*r*0.55, k*r*0.42, cols.hi);
}
function updateClouds(dt){ for (const c of clouds){ c.x += c.v*dt*(RM?0.3:1); if (c.x - c.r*2.5 > LW) { c.x = -c.r*2.5; c.y = rand(0.1, 0.45)*L(groundY); } } }
let tintTop = [];
function legacyDrawBackdrop(pal, h, t){
  const LG = L(groundY), bands = 16;
  for (let i=0;i<bands;i++){
    const y0 = Math.floor(i*LG/bands), y1 = Math.floor((i+1)*LG/bands);
    fr(0, y0, LW, y1-y0+1, mix(pal[0], pal[1], Math.round(i/(bands-1)*20)/20));
    if (i > 0) { ctx.fillStyle = mix(pal[0], pal[1], Math.round((i-1)/(bands-1)*20)/20); for (let x=(y0%2); x<LW; x+=2) ctx.fillRect(x, y0, 1, 1); }
  }
  fr(0, LG, LW, LH-LG, pal[1]);
  if (NIGHT > 0.05) for (const s of bgStars) { ctx.globalAlpha = NIGHT*(0.4+0.6*Math.sin(t*1.3+s.p)**2); if (s.big) blit(BM.twinkle(), s.x, s.y-1); else fr(s.x, s.y, 1, 1, "#ffffff"); }
  ctx.globalAlpha = 1;
  if (h>=5.6 && h<=19) {
    const p = (h-5.6)/13.4, sx = lerp(LW*0.08, LW*0.92, p), sy = LG*0.95 - Math.sin(p*Math.PI)*LG*0.72;
    sunPos = {x:sx, y:sy};
    glow(ctx, sx, sy, 34, "255,236,200", 0.55); glow(ctx, sx, sy, 16, "255,248,225", 0.7); pxEll(sx, sy, 6, 6, "#fff2c4"); pxEll(sx-1, sy-1, 4, 4, "#fffbe8");
  } else {
    sunPos = null;
    const hh = h<12 ? h+24 : h, p = (hh-19)/(29.6-19), mx = lerp(LW*0.12, LW*0.88, p), my = LG*0.9 - Math.sin(p*Math.PI)*LG*0.7;
    glow(ctx, mx, my, 30, "220,224,255", 0.28); glow(ctx, mx, my, 14, "235,236,255", 0.35);
    pxEll(mx, my, 5, 5, "#f4f1e0"); pxEll(mx+3, my-2, 4, 4, mix(pal[0],pal[1],0.2));
  }
  if (has("rainbow") && NIGHT < 0.6) {
    ctx.globalAlpha = 0.45*(1-NIGHT);
    const cx = LW*0.62, cy = LG + 4, R = Math.min(LW*0.5, LH*0.5);
    ["#ff9a9a","#ffc98a","#fff09a","#a6e3b0","#9cc8f3","#c3aef0"].forEach((c,i) => { ctx.fillStyle = c; const r = R - i*2; for (let x=Math.floor(cx-r); x<=cx+r; x++){ const y = cy - Math.sqrt(Math.max(0, r*r-(x-cx)*(x-cx))); if (y < LG-2) ctx.fillRect(x, Math.round(y), 1, 2); } });
    ctx.globalAlpha = 1;
  }
  const cols = cloudCols(pal);
  ctx.globalAlpha = 0.92 - NIGHT*0.25; for (const c of clouds) puff(c.x, c.y, c.r, cols); ctx.globalAlpha = 1;
  // memory stars
  const now = performance.now();
  for (const st of (lanternMode ? [] : G.stars)) {
    if (rising && rising.star === st) continue;
    const x = st.x*LW, y = st.y*LH, b0 = bornAt.get(st.id), born = b0 ? clamp((now-b0)/1200, 0, 1) : 1;
    const a = (0.6 + 0.4*NIGHT) * born, tw = Math.sin(t*1.7 + st.x*40);
    glow(ctx, x, y, 12 + tw*2, "255,226,190", 0.28*a); glow(ctx, x, y, 6 + tw*1.5, "255,240,200", 0.6*a);
    ctx.globalAlpha = a; blit(tw > 0.85 ? BM.twinkle() : BM.star(), x, y - 2); ctx.globalAlpha = 1;
  }
  if (rising && !rising.hold) {
    const e = 1 - Math.pow(1-rising.t, 3);
    const x = lerp(rising.x0, rising.x1, e)/P, y = (lerp(rising.y0, rising.y1, e) - Math.sin(e*Math.PI)*40*S)/P;
    glow(ctx, x, y, 8, "255,236,180", 0.95); blit(BM.star(), x, y-2);
  }
  // horizon cloud sea (hazy, far away)
  { const by = L(groundY - 64*S) + 4; ctx.globalAlpha = 0.9 - NIGHT*0.2; for (const b of bank) puff(b.x, by + (b.r%3), b.r, cols); ctx.globalAlpha = 1; }
  // far hills with atmospheric haze
  tintTop = new Array(LW);
  const far = mix(pal[2], pal[1], 0.35), near = mix(pal[3], pal[1], 0.12);
  ctx.fillStyle = far;
  for (let x=0;x<LW;x++){ const sx = x*P; const y = Math.round((groundY - 62*S + Math.sin(sx*0.006+0.5)*20*S + Math.sin(sx*0.017)*8*S)/P); tintTop[x] = y; ctx.fillRect(x, y, 1, LH-y); }
  ctx.fillStyle = shade(far, 0.1); for (let x=0;x<LW;x++) ctx.fillRect(x, tintTop[x], 1, 1);
  const nearTop = [];
  ctx.fillStyle = near;
  for (let x=0;x<LW;x++){ const sx = x*P; const y = Math.round((groundY - 26*S + Math.sin(sx*0.009+2)*14*S + Math.sin(sx*0.023+1)*5*S)/P); nearTop[x] = y; ctx.fillRect(x, y, 1, LH-y); }
  ctx.fillStyle = shade(near, 0.12); for (let x=0;x<LW;x++) ctx.fillRect(x, nearTop[x], 1, 1);
  ctx.fillStyle = shade(near, -0.06); for (let x=0;x<LW;x++) if ((x*7)%11 < 3) ctx.fillRect(x, nearTop[x]+2, 1, 1);
  // haze band where hills meet the meadow
  const hz = ctx.createLinearGradient(0, LG-14, 0, LG+2); hz.addColorStop(0, "rgba(255,255,255,0)"); hz.addColorStop(1, `rgba(${hx(mix(pal[1],"#ffffff",0.4)).join(",")},${0.35 - NIGHT*0.2})`);
  ctx.fillStyle = hz; ctx.fillRect(0, LG-14, LW, 16);
  // meadow: perspective stripes, wider toward the viewer
  const g0 = pal[4];
  for (let x=0;x<LW;x++){ const y = Math.round((groundY - 5*S + Math.sin(x*P*0.011)*3*S)/P); ctx.fillStyle = mix(g0, pal[1], 0.18); ctx.fillRect(x, y, 1, LH-y); ctx.fillStyle = shade(g0, 0.18); ctx.fillRect(x, y, 1, 1); }
  for (let i=0;i<stripes.length-1;i++){
    const y0 = stripes[i] + 1, y1 = stripes[i+1], u = i/(stripes.length-1);
    const base = mix(mix(g0, pal[1], 0.18*(1-u)), "#2f6a52", u*0.18);
    fr(0, y0, LW, y1-y0+1, i%2 ? shade(base, 0.04) : shade(base, -0.02));
    ctx.fillStyle = i%2 ? shade(base,-0.02) : shade(base,0.04); for (let x=(y0%2); x<LW; x+=2) ctx.fillRect(x, y0, 1, 1);
  }
  // ground bits
  const dark = mix(g0, "#2f6a52", 0.45), lite = shade(g0, 0.25);
  for (const b of bits){
    const x = b.x, y = b.y;
    if (b.t === "blade") { fr(x, y, 1, 1, dark); fr(x, y-1, 1, 1, lite); fr(x+1, y-2, 1, 1, lite); }
    else if (b.t === "clover") { fr(x, y, 2, 1, dark); fr(x, y-1, 1, 1, dark); fr(x+1, y-1, 1, 1, mix(dark, "#ffffff", 0.2)); }
    else if (b.t === "daisy") { fr(x-1, y-1, 1, 1, "#ffffff"); fr(x+1, y-1, 1, 1, "#ffffff"); fr(x, y-2, 1, 1, "#ffffff"); fr(x, y, 1, 1, "#f3eef9"); fr(x, y-1, 1, 1, "#ffd25e"); }
    else if (b.t === "pebble") { fr(x, y, 2, 1, "#cfc6d9"); fr(x, y-1, 1, 1, "#ece6f2"); fr(x, y+1, 2, 1, mix(g0, "#3b2340", 0.25)); }
    else fr(x, y, 1, 1, lite);
  }
}

/* ---------- decor sprites (drawn once, placed with depth scale) ---------- */
const decCache = new Map();
function legacyDecor(key, w, h, ax, ay, fn){
  let d = decCache.get(key); if (d) return d;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const prev = ctx; ctx = c.getContext("2d"); fn(ax, ay); ctx = prev;
  d = {cv:c, ax, ay}; decCache.set(key, d); return d;
}
function legacyPlace(d, sx, sy, k){ drawArtImage(mctx,d.cv, Math.round(sx - d.ax*k), Math.round(sy - d.ay*k), Math.round(d.cv.width*k), Math.round(d.cv.height*k)); }
function softShadow(x, y, rx, ry, a){
  mctx.save(); mctx.translate(x, y); mctx.scale(1, ry/rx);
  const g = mctx.createRadialGradient(0,0,0,0,0,rx); g.addColorStop(0, `rgba(50,25,80,${a})`); g.addColorStop(0.7, `rgba(50,25,80,${a*0.5})`); g.addColorStop(1, "rgba(50,25,80,0)");
  mctx.fillStyle = g; mctx.beginPath(); mctx.arc(0,0,rx,0,Math.PI*2); mctx.fill(); mctx.restore();
}
const cushionDec = () => decor("cushion", 50, 12, 18, 9, (x,y) => {
  pxEll(x, y-3, 14, 4.5, "#8f6aa6"); pxEll(x, y-3, 13, 3.6, "#c49ad8"); pxEll(x, y-4, 11, 2.4, "#dcb8ea"); pxEll(x-3, y-5, 5, 0.8, "#f3e2fa");
  fr(x-7, y-4, 1, 1, "#9b74b3"); fr(x, y-4, 1, 1, "#9b74b3"); fr(x+7, y-4, 1, 1, "#9b74b3");
  fr(x-16, y-4, 2, 2, "#ffd25e"); fr(x+15, y-4, 2, 2, "#ffd25e"); fr(x-16, y-2, 1, 2, "#f0b840"); fr(x+16, y-2, 1, 2, "#f0b840");
  const bx = x + 23, by = y;
  fr(bx-4, by-3, 9, 3, "#8fb7e8"); fr(bx-3, by, 7, 1, "#6f97cc"); fr(bx-4, by-4, 9, 1, "#d9e8ff"); fr(bx-3, by-4, 7, 1, "#9fd8ff"); fr(bx-1, by-2, 2, 1, "#ffffff");
});
const lanternDec = (lit) => decor("lantern"+lit, 16, 30, 5, 28, (x,y) => {
  fr(x-1, y-26, 2, 26, "#5b3a6e"); fr(x, y-26, 1, 26, "#7a5590"); fr(x-1, y-26, 8, 2, "#5b3a6e");
  fr(x+2, y-24, 8, 2, "#7a4f8f"); fr(x+3, y-25, 6, 1, "#9a6fb0");
  fr(x+3, y-22, 6, 8, "#5b3a6e"); fr(x+4, y-21, 4, 6, lit ? "#ffe2a4" : "#fbefd6"); fr(x+4, y-21, 1, 2, "#ffffff");
  fr(x+5, y-14, 2, 1, "#5b3a6e");
  fr(x-3, y-3, 1, 3, "#5f9a5c"); fr(x-4, y-4, 1, 1, "#ffc2d6"); fr(x+2, y-2, 1, 2, "#5f9a5c"); fr(x+2, y-3, 1, 1, "#fff");
});
const treeDec = (sw) => decor("tree"+sw, 36, 50, 18, 48, (x,y) => {
  fr(x-2, y-24, 4, 24, "#8a6650"); fr(x-2, y-24, 1, 24, "#a88268"); fr(x+1, y-24, 1, 24, "#6f4f3d");
  fr(x+2, y-17, 4, 2, "#8a6650"); fr(x-6, y-20, 4, 2, "#8a6650");
  const P2 = [[0,-33,11,8],[-9,-28,8,6],[9,-28,8,6],[-4,-39,7,5],[5,-39,7,5],[0,-25,9,5]];
  for (const [dx,dy,rx,ry] of P2) pxEll(x+dx, y+dy+1, rx, ry, "#e08db2");
  for (const [dx,dy,rx,ry] of P2) pxEll(x+dx, y+dy, rx, ry, "#f7b6cf");
  for (const [dx,dy,rx,ry] of P2) if (dy < -27) pxEll(x+dx-1, y+dy-2, rx*0.55, ry*0.45, "#ffd9e7");
  for (let i=0;i<16;i++) fr(x - 13 + (hash(i,1)%27), y - 44 + (hash(i,2)%20), 1, 1, i%3 ? "#ffffff" : "#ff9fc0");
  const bx = x-10, by = y-20;
  fr(bx-3, by, 7, 1, "#d6ad6a"); fr(bx, by-3, 1, 3, "#e9e2d0");
  [-3,-1,1,3].forEach((o,i) => fr(bx+o+(i%2?sw:0), by+1, 1, 4+(i%2)*2, "#e9e2d0"));
  fr(bx-1+sw, by+8, 3, 3, "#bfe3ff"); fr(bx-1+sw, by+8, 1, 1, "#ffffff");
});
const stoneDec = () => decor("stone", 10, 5, 5, 3, (x,y) => { pxEll(x, y, 4, 1.4, "#b9afc8"); pxEll(x, y-1, 4, 1.2, "#ddd5e8"); fr(x-2, y-2, 3, 1, "#f6f2fb"); });
const photoImgs = new Map();
function photoImg(p){ let o = photoImgs.get(p.id); if (!o || o.src !== p.photo) { const img = new Image(); img.src = p.photo; o = {src: p.photo, img}; photoImgs.set(p.id, o); } return o.img; }
function legacyFrameDec(p){
  const img = photoImg(p); if (!img.complete || !img.naturalWidth) return null;
  return decor("frame"+p.id+p.photo.length, 20, 36, 10, 35, (x,y) => {
    fr(x-1, y-12, 2, 12, "#7a5a40"); fr(x-5, y-1, 10, 1, "#7a5a40");
    const fw = 16, fh = 19, fx = x - fw/2, fy = y - 12 - fh;
    fr(fx-2, fy-2, fw+4, fh+4, PLUM); fr(fx-1, fy-1, fw+2, fh+2, "#c89766");
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip(); ctx.imageSmoothingEnabled = true;
    const iw = img.naturalWidth, ih = img.naturalHeight, sc = Math.max(fw/iw, fh/ih);
    drawArtImage(ctx,img, fx + (fw - iw*sc)/2, fy + (fh - ih*sc)/2, iw*sc, ih*sc); ctx.restore();
    fr(fx, fy, 3, 1, "rgba(255,255,255,.6)");
  });
}
let frameHits = [];

/* ---------- main-canvas scene ---------- */
function drawPetEnt(e){
  const p = petOf(e), k = P*ds(e.depth)*1.40*petSizeFactor(p);
  const moving = e.state === "walk" || e.state === "run";
  let pose = e.state === "run" ? "run" : moving ? "walk" : e.state === "sit" ? "sit" : e.state === "sleep" ? "sleep" : e.state === "eat" ? "eat" : "stand";
  if (e.jumpY > 0) pose = "run";
  const grabbing=ball&&ball.state==='grabbing'&&ball.by===e;
  if(grabbing)pose="stand";
  const f = e.catchJump?.phase==='air' ? 0 : moving ? (e.walkPhase||0) : Math.floor(e.anim * 1.6) % 4;
  if (pose === "sit" && e.front) pose = "front";
  if ((pose === "walk" || pose === "run") && e.jumpY === 0 && Math.abs(e.mdd || 0) > (e.motionFront ? .4 : .58)) pose = e.mdd > 0 ? "fwalk" : "bwalk";
  const front = bendAmount(e)===null&&(pose === "front" || pose === "fwalk" || pose === "bwalk");
  e.motionFront=moving&&front;
  let expr = "n"; if (e.bliss > 0 || (breathing && breathVal > 0.8)) expr = "s"; else if (e.happy > 0 || e.jumpY > 0) expr = "h"; else if (e.blink < 0) expr = "b";
  const amount=bendAmount(e),bend=amount!==null?getBendSprite(p,amount):null;
  const crouchAmount=jumpCrouchAmount(e),crouch=crouchAmount!==null?getCrouchSprite(p,crouchAmount):null;
  const reaching=e.catchJump?.phase==='air'?getReachSprite(p,reachFrame(e)):null;
  const spr = crouch||reaching||bend||getSprite(p.species, p.breed, pose, f, expr, front ? 1 : e.dir);
  const dip=0;
  const x = e.x, y = ey(e) - e.jumpY+dip+(bend&&e.state==='eat'&&e.stateT>.4&&e.stateT<1.65&&!RM?Math.sin(e.anim*15)*.13*k:0);
  softShadow(x + (front ? 0 : e.dir*2*k), ey(e) + k*0.5, Math.max(6, 15 - e.jumpY/(3*k))*k, 3.2*k, 0.32*(1 - Math.min(0.6, e.jumpY/(120*S))));
  mctx.save(); mctx.translate(x, y);
  { const lean = clamp(e.lean||0, -1.3, 1.3), pr = e.press||0, br = breathing ? (breathVal - 0.775)*0.14 : 0;
    mctx.rotate(-lean*.025);
    mctx.scale(1 + pr*0.012 + br*0.15, 1 - pr*0.018 + br*.35); }
  if (e.dir < 0 && !front) mctx.scale(-1, 1);
  mctx.imageSmoothingEnabled = !!spr.clay;
  drawArtImage(mctx,spr.cv, -AX*k, -GROUND*k, SW*k, SH*k);
  if (e.carry && ball) { const b = BM.ball(), bk=P*ds(e.depth); drawArtImage(mctx,b, Math.round((spr.m.mx - AX)*k - b.width*bk/2), Math.round((spr.m.my - GROUND)*k - b.height*bk*0.6), Math.round(b.width*bk), Math.round(b.height*bk)); }
  mctx.restore(); mctx.imageSmoothingEnabled = false;
  e._top = y - 32*k; e._k = k;
}
function drawBallM(){
  if (!ball || ball.state === "carried") return;
  const k = P*ds(ball.td) * (ball.state === "fly" ? 1 + (1-ball.p)*0.9 : ball.state==='grabbing' ? ball.grabScale : 1), b = BM.ball();
  mctx.globalAlpha = ball.state === "drop" ? Math.max(0, ball.fade) : 1;
  if (ball.state !== "fly" || ball.p > 0.3) softShadow(ball.x, ball.y + k*0.5, 4*k, 1.4*k, 0.3);
  drawArtImage(mctx,b, Math.round(ball.x - b.width*k/2), Math.round(ball.y - ball.alt - b.height*k), Math.round(b.width*k), Math.round(b.height*k));
  mctx.globalAlpha = 1;
}
function drawTreatM(t){
  const e = ents.find(x => x.id === t.owner); const sp = e ? petOf(e).species : "cat";
  const img = treatImg(sp), k = P*ds(t.d), x = t.x + (t.landed ? 0 : Math.sin(t.sway)*5*P), y = t.y;
  if (!t.landed) { const c = BM.chute(); drawArtImage(mctx,c, Math.round(x - c.width*k/2), Math.round(y - (img.height+6+c.height)*k), Math.round(c.width*k), Math.round(c.height*k)); mctx.fillStyle = "rgba(255,255,255,.7)"; mctx.fillRect(x-4*k, y-(img.height+2)*k, k*0.6, 2*k); mctx.fillRect(x+4*k, y-(img.height+2)*k, k*0.6, 2*k); }
  else softShadow(x, y, 5*k, 1.4*k, 0.28);
  drawArtImage(mctx,img, Math.round(x - img.width*k/2), Math.round(y - img.height*k), Math.round(img.width*k), Math.round(img.height*k));
}
function drawScene(t){
  const items = [];
  const decK = (d) => P*ds(d);
  for (const st of stones) items.push({d: st.d - 50, fn: () => { const k = decK(st.d); place(stoneDec(), st.x, st.y, k); }});
  if (has("flowers")) { const n = Math.min(flowers.length, 8 + Math.floor((G.warmth-10)/6)); for (let i=0;i<n;i++){ const fl = flowers[i]; items.push({d: fl.d, fn: () => { const k = decK(fl.d), b = BM.flower(fl.c); drawArtImage(mctx,b, Math.round(fl.x - b.width*k/2), Math.round(groundY + fl.d - b.height*k), Math.round(b.width*k), Math.round(b.height*k)); }}); } }
  for (const b of (G.bloomSpots || [])) { const d = dMin + b.d*(dMax - dMin), x = b.x*W; items.push({d, fn: () => { const k = decK(d), img = BM.tulip(b.c); drawArtImage(mctx,img, Math.round(x - img.width*k/2), Math.round(groundY + d - img.height*k), Math.round(img.width*k), Math.round(img.height*k)); }}); }
  frameHits = [];
  const withPhoto = fam().filter(p => p.photo);
  withPhoto.forEach((p, i) => {
    const _q = decoAt("frame-" + p.id, W*0.07 + i*Math.min(W*0.075, 22*P), cushionDepth() - 10 - i*3), d = _q.d, x = _q.x;
    items.push({d, key: "frame-" + p.id, fn: () => { const dec = frameDec(p); if (!dec) return; const k = decK(d)*(withPhoto.length > 2 ? 0.8 : 1); softShadow(x, groundY+d, 6*k, 1.5*k, 0.25); place(dec, x, groundY + d, k); frameHits.push({p, x: x - 10*k, y: groundY + d - 35*k, w: 20*k, h: 35*k}); }});
  });
  if (has("cushion")) items.push({d: cushionDepth()-0.1, key: "cushion", fn: () => { const k = decK(cushionDepth()); softShadow(cushionX() + 3*k, groundY + cushionDepth() + k, 19*k, 3.5*k, 0.28); place(cushionDec(), cushionX(), groundY + cushionDepth(), k); }});
  let lamp = null;
  if (has("lantern")) { const _q = decoAt("lantern", W*0.78, dMin + 6*S), d = _q.d; items.push({d, key: "lantern", fn: () => { const k = decK(d), x = _q.x; softShadow(x + 2*k, groundY + d, 6*k, 1.6*k, 0.28); place(lanternDec(NIGHT > 0.3 ? 1 : 0), x, groundY + d, k); lamp = {x: x + 6*k, y: groundY + d - 18*k, k}; }}); }
  if (has("tree")) { const _q = decoAt("tree", W*0.9, dMin), d = _q.d; items.push({d: d-1, key: "tree", fn: () => { const k = decK(d), x = _q.x; softShadow(x + 3*k, groundY + d, 14*k, 2.5*k, 0.25); place(treeDec(RM ? 0 : (Math.sin(t*2.1) > 0 ? 1 : 0)), x, groundY + d, k); }}); }
  for (const tr of treats) if (tr.landed) items.push({d: tr.d, fn: () => drawTreatM(tr)});
  bowlHit = null; poopHits = [];
  { const d = bowlD(), x = bowlX(); items.push({d, fn: () => { const k = decK(d), img = BM.bowl(bowl.full ? 1 : 0); softShadow(x, groundY + d, 7*k, 1.6*k, 0.28); drawArtImage(mctx,img, Math.round(x - img.width*k/2), Math.round(groundY + d - img.height*k), Math.round(img.width*k), Math.round(img.height*k)); bowlHit = {x: x - 10*k, y: groundY + d - 12*k, w: 20*k, h: 16*k}; decoHits.push({key: "bowl", x: x - 11*k, y: groundY + d - 13*k, w: 22*k, h: 15*k, fx: x, fd: d}); }}); }
  for (const pp of poops) items.push({d: pp.d, fn: () => {
    const k = decK(pp.d)*(pp.pop < 1 ? 0.4 + pp.pop*0.6 : 1), img = BM.poop(), foot = groundY + pp.d, pw = img.width*k, ph = img.height*k;
    if (pp.cl == null) {
      softShadow(pp.x, foot, 4*k, 1*k, 0.25); drawArtImage(mctx,img, Math.round(pp.x - pw/2), Math.round(foot - ph), Math.round(pw), Math.round(ph));
      poopHits.push({pp, x: pp.x, y: foot - 4*k, r: Math.max(24, 9*k)}); return;
    }
    drawScoopClean(pp, img, k, foot, pw, ph);
  }});
  if (has("fence")) items.push({d: dMin - 3, fn: () => drawFence() });
  if (has("mailbox")) { const _q = decoAt("mailbox", W*0.66, dMin + 4), d = _q.d, x = _q.x; items.push({d, key: "mailbox", fn: () => { const k = decK(d); softShadow(x, groundY + d, 5*k, 1.3*k, 0.26); place(mailboxDec(), x, groundY + d, k); }}); }
  if (has("pond")) { const _q = decoAt("pond", W*0.82, dMin + (dMax - dMin)*0.62), d = _q.d, x = _q.x; items.push({d: d - 8, key: "pond", fn: () => { const k = decK(d); place(pondDec(Math.floor(t*1.5) % 2), x, groundY + d, k); }}); }
  if (has("house")) { const _q = decoAt("house", W*0.56, dMin + 2), d = _q.d, x = _q.x; items.push({d, key: "house", fn: () => { const k = decK(d); softShadow(x + 2*k, groundY + d, 16*k, 2.6*k, 0.26); place(houseDec(), x, groundY + d, k); }}); }
  if (has("sunflower")) { const _q = decoAt("sunflower", W*0.42, dMin + 1), d = _q.d, x = _q.x; items.push({d, key: "sunflower", fn: () => { const k = decK(d); place(sunflowerDec(RM ? 0 : (Math.sin(t*1.2) > 0 ? 1 : 0)), x, groundY + d, k); }}); }
  if (has("bench")) { const _q = decoAt("bench", W*0.13, dMin + (dMax - dMin)*0.55), d = _q.d, x = _q.x; items.push({d, key: "bench", fn: () => { const k = decK(d); softShadow(x, groundY + d, 15*k, 2.2*k, 0.26); place(benchDec(), x, groundY + d, k); }}); }
  envHit = null;
  if (envelope && !lanternMode) items.push({d: envelope.d, fn: () => {
    const k = P*ds(envelope.d), b = BM.env(), bob = Math.round(Math.sin(t*2.4)*1.5)*k, x = envelope.x, y = groundY + envelope.d;
    softShadow(x, y, 6*k, 1.5*k, 0.25); glow(mctx, x, y - 5*k + bob, 12*k, "255,220,235", 0.5 + 0.2*Math.sin(t*3));
    drawArtImage(mctx,b, Math.round(x - b.width*k/2), Math.round(y - b.height*k - 2*k + bob), Math.round(b.width*k), Math.round(b.height*k));
    envHit = {x: x - b.width*k, y: y - b.height*k*2 - 4*k, w: b.width*k*2, h: b.height*k*2 + 6*k};
  }});
  if (celebrating) {
    const dc = dMin + (dMax-dMin)*0.35, xc = W*0.64;
    items.push({d: dc, fn: () => {
      const k = P*ds(dc), cake = BM.cake();
      softShadow(xc, groundY + dc, 7*k, 1.6*k, 0.28);
      drawArtImage(mctx,cake, Math.round(xc - cake.width*k/2), Math.round(groundY + dc - cake.height*k), Math.round(cake.width*k), Math.round(cake.height*k));
      ["#ff9ec0","#ffe08a","#a6e6c8"].forEach((c, i) => {
        const bx = xc + (i-1)*7*k + Math.sin(t*1.3+i)*2*k, by = groundY + dc - 40*k - i%2*6*k + Math.sin(t*1.7+i*2)*2*k, b = BM.balloon(c);
        mctx.strokeStyle = "rgba(255,255,255,.8)"; mctx.lineWidth = Math.max(1, k*0.4); mctx.beginPath(); mctx.moveTo(bx, by + b.height*k); mctx.quadraticCurveTo(bx + 3*k, by + 18*k, xc + (i-1)*2*k, groundY + dc - 8*k); mctx.stroke();
        drawArtImage(mctx,b, Math.round(bx - b.width*k/2), Math.round(by), Math.round(b.width*k), Math.round(b.height*k));
      });
    }});
  }
  appendSpeciesDecor(items);
  for (const e of ents) items.push({d: e.depth + 0.5, fn: () => drawPetEnt(e)});
  if (ball && ball.state !== "fly") items.push({d: ball.td + 0.2, fn: drawBallM});
  decoHits.length = 0; items.sort((a,b) => a.d - b.d).forEach(i => { placingKey = i.key || null; i.fn(); placingKey = null; });
  drawDecoEditMarks();
  for (const tr of treats) if (!tr.landed) drawTreatM(tr);
  if (ball && ball.state === "fly") drawBallM();
  return lamp;
}
function legacyDrawRays(t){
  if (!sunPos || NIGHT > 0.7) return;
  const sx = sunPos.x*P, sy = sunPos.y*P, a0 = 0.045*(1-NIGHT), len = H*1.4;
  mctx.save(); mctx.globalCompositeOperation = "lighter";
  for (let i=0;i<6;i++){
    const a = Math.PI*0.5 + (i-2.5)*0.3 + Math.sin(t*0.15+i*1.7)*0.05, w = 0.05 + (i%2)*0.03;
    mctx.fillStyle = `rgba(255,236,214,${a0})`;
    mctx.beginPath(); mctx.moveTo(sx, sy); mctx.lineTo(sx+Math.cos(a-w)*len, sy+Math.sin(a-w)*len); mctx.lineTo(sx+Math.cos(a+w)*len, sy+Math.sin(a+w)*len); mctx.fill();
  }
  mctx.restore();
}
function updatePetals(dt){
  const want = has("tree") ? 16 : 8;
  while (petals.length < want) petals.push({x: Math.random()*W, y: -10 - Math.random()*H*0.6, vy: rand(12,24), ph: rand(0,6), c: Math.random()<0.6 ? "#ffc2d6" : "#ffe6ef", z: rand(0.7, 1.4)});
  for (const p of petals){ p.ph += dt; p.y += p.vy*p.z*dt*(RM?0.4:1); p.x += (Math.sin(p.ph*1.3)*16 + 6)*dt*(RM?0.4:1); if (p.y > groundY + dMax + 20 || p.x > W + 10) { p.y = -10; p.x = Math.random()*W; } }
}
function legacyDrawOverlayFx(){
  for (const g of glows) {
    const a = g.life * (0.6 + 0.4*Math.sin(g.p*3));
    if (g.kind === "fly") { glow(mctx, g.x, g.y, 7*P, "255,240,150", a*0.75); mctx.fillStyle = "#fffbd6"; mctx.fillRect(Math.round(g.x), Math.round(g.y), 2*P, 2*P); }
    else { glow(mctx, g.x, g.y, 5*P, "255,255,255", a*0.4); const s = BM.seed(); mctx.globalAlpha = g.life; drawArtImage(mctx,s, Math.round(g.x - s.width*P/2), Math.round(g.y - s.height*P/2), s.width*P, s.height*P); mctx.globalAlpha = 1; }
  }
  for (const p of petals){ const k = P*p.z, flip = Math.sin(p.ph*3) > 0; mctx.fillStyle = NIGHT > 0.6 ? "#e2dbff" : p.c; mctx.fillRect(Math.round(p.x), Math.round(p.y), (flip?2:1)*k, (flip?1:2)*k); }
  for (const s of sparks){ mctx.globalAlpha = clamp(s.t*1.6,0,1); const b = BM.spark(s.c); drawArtImage(mctx,b, Math.round(s.x - b.width*P/2), Math.round(s.y - b.height*P/2), b.width*P, b.height*P); }
  mctx.globalAlpha = 1;
  for (const h of hearts){ mctx.globalAlpha = clamp(h.t, 0, 1); const b = BM.heart(); drawArtImage(mctx,b, Math.round(h.x - b.width*P/2), Math.round(h.y), b.width*P, b.height*P); }
  mctx.globalAlpha = 1;
}
function legacyDrawBubble(){
  if (!bubble || !bubble.e || bubble.e._top == null || breathing) return;
  const e = bubble.e; let fs = P >= 3 ? 22 : 16;
  mctx.font = `${fs}px ${FONT}`;
  while (fs > 11 && mctx.measureText(bubble.text).width + fs*1.2 > W - 24) { fs -= 1; mctx.font = `${fs}px ${FONT}`; }
  const tw = Math.ceil(mctx.measureText(bubble.text).width), pad = fs*0.6, w = Math.round(tw + pad*2), h = Math.round(fs + pad*1.2);
  const px = e.x, bx = Math.round(clamp(px - w/2, 10, W - w - 10)), by = Math.round(Math.max(76, e._top - h - 12));
  const b = Math.max(2, Math.round(P*0.8));
  mctx.globalAlpha = clamp(bubble.t*2, 0, 1);
  mctx.fillStyle = "rgba(60,30,90,.18)"; mctx.fillRect(bx+b, by+b*2, w-2*b, h);
  mctx.fillStyle = PLUM; mctx.fillRect(bx+b, by, w-2*b, h); mctx.fillRect(bx, by+b, w, h-2*b);
  mctx.fillStyle = "#fffdf6"; mctx.fillRect(bx+b, by+b, w-2*b, h-2*b);
  const tx = Math.round(clamp(px - 1.5*b, bx+3*b, bx+w-6*b));
  mctx.fillRect(tx+b, by+h-b, b, b);
  mctx.fillStyle = PLUM; mctx.fillRect(tx, by+h, b, b); mctx.fillRect(tx+2*b, by+h, b, b); mctx.fillRect(tx+b, by+h+b, b, b);
  mctx.fillStyle = "#fffdf6"; mctx.fillRect(tx+b, by+h, b, b);
  mctx.fillStyle = PLUM; mctx.textBaseline = "middle"; mctx.fillText(bubble.text, bx + pad, by + h/2 + 1);
  mctx.globalAlpha = 1; mctx.textBaseline = "alphabetic";
}
function drawZ(t){
  const fs = P >= 3 ? 20 : 15; mctx.font = `${fs}px ${FONT}`; mctx.fillStyle = "#ffffff";
  for (const e of ents) {
    if (e.state !== "sleep" || e._top == null) continue;
    for (let i=0;i<3;i++){ const p = ((t*0.5 + i/3) % 1); mctx.globalAlpha = Math.sin(p*Math.PI); mctx.fillText("z", e.x + e.dir*12*e._k + p*6*e._k, e._top + 14*e._k - p*12*e._k); }
  }
  mctx.globalAlpha = 1;
}

/* ---------- main loop ---------- */
let last = performance.now();
function frame(now){
  if(dayWidgetDate!==today())renderHud();if(daySpecialDate!==today()){daySpecialDate=today();checkSpecial();}
  const dt = Math.min(0.05, (now-last)/1000); last = now; const t = now/1000;
  const h = hourNow(); NIGHT = nightAmt(h); const pal = palette(h);
  for (const e of ents) updatePet(e, dt);
  if (!setupOpen) { updateBall(dt); updateTreats(dt); }
  updateGlows(dt); updateFx(dt); updateClouds(dt); updatePetals(dt);
  for (const pp of poops) pp.pop = Math.min(1, pp.pop + dt*3);
  updateScoops(dt);
  if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
  else { bubbleCooldown -= dt; if (bubbleCooldown <= 0) idleLine(); }
  if (has("tree") && soundOn) { chimeT -= dt; if (chimeT <= 0) { chimeT = rand(14, 30); sfx("chime"); } }

  ctx.imageSmoothingEnabled = false; ctx.clearRect(0,0,LW,LH);
  drawBackdrop(pal, h, t);
  mctx.setTransform(DPR,0,0,DPR,0,0); mctx.imageSmoothingEnabled = false; mctx.clearRect(0,0,W,H);
  updateCamLift(dt); mctx.translate(0, camLift);   // lantern view: the camera tilts up a little
  drawClayBackground(h,t);
  drawSkyLanterns(t);
  const lamp = drawScene(t);
  drawRays(t);
  if (NIGHT > 0.02) { mctx.fillStyle = `rgba(28,26,78,${0.3*NIGHT})`; mctx.beginPath(); mctx.moveTo(0, H); for (let x=0;x<LW;x++) mctx.lineTo(x*P, tintTop[x]*P); mctx.lineTo(W, tintTop[LW-1]*P); mctx.lineTo(W, H); mctx.fill(); }
  if (lamp && NIGHT > 0.05) { mctx.save(); mctx.globalCompositeOperation = "lighter"; glow(mctx, lamp.x, lamp.y, 36*lamp.k, "255,196,120", 0.42*NIGHT); mctx.restore(); }
  drawOverlayFx(); if (has("butterfly")) drawButterflies(t, dt);
  if (!lanternMode) drawBgLine(dt);
  mctx.setTransform(DPR,0,0,DPR,0,0);
  if (now - (window.__bloomAt || 0) > 200) { window.__bloomAt = now; bctx.imageSmoothingEnabled = true; bctx.clearRect(0,0,bcv.width,bcv.height); drawArtImage(bctx,cv, 0, 0, bcv.width, bcv.height); }   // the soft glow changes slowly: refresh it 5x a second, not every frame
  mctx.save(); mctx.imageSmoothingEnabled = true; mctx.globalCompositeOperation = "screen"; mctx.globalAlpha = 0.2 + 0.14*NIGHT; drawArtImage(mctx,bcv, 0, 0, W, H); mctx.restore();
  if (vignette) { mctx.fillStyle = vignette; mctx.fillRect(0, 0, W, H); }
  mctx.save(); mctx.translate(0, camLift); drawZ(t); drawBubble(); mctx.restore();
  requestAnimationFrame(frame);
}

/* ---------- input ---------- */
cv.addEventListener("pointerdown", (ev) => {
  if (setupOpen) return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left)/camZ, y = (ev.clientY - r.top)/camZ;
  for (const st of (lanternMode ? [] : G.stars)) { if (Math.hypot(st.x*LW*P - x, st.y*LH*P - y) < Math.max(22, 6*P)) { openRead(st.id); return; } }
  for (let i=glows.length-1;i>=0;i--) { if (Math.hypot(glows[i].x - x, glows[i].y - y) < Math.max(26, 7*P)) { collectGlow(i); return; } }
  const byFront = [...ents].sort((a,b) => b.depth - a.depth);
  for (const h of poopHits) if (Math.hypot(h.x - x, h.y - y) < h.r) { cleanPoop(h.pp); return; }
  if (bowlHit && x >= bowlHit.x && x <= bowlHit.x + bowlHit.w && y >= bowlHit.y && y <= bowlHit.y + bowlHit.h) { feed(); return; }
  if (envHit && x >= envHit.x && x <= envHit.x + envHit.w && y >= envHit.y && y <= envHit.y + envHit.h) { openNote(); return; }
  for (const e of byFront) { const k = e._k || P*ds(e.depth)*1.40*petSizeFactor(petOf(e)), py = ey(e) - e.jumpY; if (Math.abs(x - e.x) < 18*k && y < py + 2*k && y > py - 30*k) { startStroke(e, ev, x, y); return; } }
  for (const fh of frameHits) if (x>=fh.x && x<=fh.x+fh.w && y>=fh.y && y<=fh.y+fh.h) { $("bigPhoto").src = fh.p.photo; $("bigPhoto").alt = fh.p.name + " 사진"; $("photoCap").textContent = fh.p.name; openVeil("photoVeil"); return; }
  if (ballMode) { if (y > groundY*0.5) { throwBall(x, Math.max(y, groundY + dMin)); setHint(""); } return; }
  if (y > groundY - 10) {
    const near = [...ents].sort((a,b) => Math.hypot(a.x-x, ey(a)-y) - Math.hypot(b.x-x, ey(b)-y))[0];
    if (!near) return;
    if (near.state === "sleep") { setState(near, "sit", 2); say(near, pick(["음… 불렀어?","하암, 잘 잤다"])); return; }
    goTo(near, x, y - groundY, false, () => setState(near, "sit", rand(3,6)));
  }
});
let rub = null;
function startStroke(e, ev, x, y){
  rub = {e, x, y, dist: 0, acc: 0, id: ev.pointerId};
  try { cv.setPointerCapture(ev.pointerId); } catch(err) {}
  e.target = null; e.onArrive = null;
  if (e.state === "sleep") say(e, pick(["음… 왔어?","쓰다듬어 줘서 깼어"]));
  if (e.state !== "eat") sitFront(e, 5);
}
cv.addEventListener("pointermove", (ev) => {
  if (!rub || ev.pointerId !== rub.id) return;
  const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left)/camZ, y = (ev.clientY - r.top)/camZ, d = Math.hypot(x - rub.x, y - rub.y);
  rub.x = x; rub.y = y; rub.dist += d; rub.acc += d;
  const e = rub.e, kk = e._k || P*ds(e.depth)*1.40*petSizeFactor(petOf(e));
  rub.tx = clamp((x - e.x)/(16*kk), -1, 1); rub.ty = clamp((ey(e) - y)/(30*kk), 0, 1); rub.last = performance.now();
  if (rub.dist > 10 && e.press > 0.55) { e.bliss = 1.2; purrStart(e); }
  if (rub.acc > 34) {
    rub.acc = 0; G.pats++;
    hearts.push({x: x + rand(-6,6), y: y - 10, vy: rand(-55,-38), t: 1.2});
    const now = performance.now(); if (now - lastPatWarm > 1500) { lastPatWarm = now; addWarmth(1); }
    if (petOf(e).species !== "cat" && Math.random() < 0.3) sfx("pet");
    if (!bubble && Math.random() < 0.05) say(e, pick(petOf(e).species === "cat" ? ["골골골골…","거기 좋아…","눈이 스르르 감겨"] : petOf(e).species === "dog" ? ["꼬리 멈출 수가 없어!","헤헤, 좋아","더, 더!"] : ["포근해…","거기 좋아…","스르르…"]));
  }
});
function endStroke(ev){
  if (!rub || (ev && ev.pointerId !== rub.id)) return;
  const s0 = rub; rub = null; purrStop();
  if (s0.dist < 10) patPet(s0.e);
  else { s0.e.happy = 1.6; s0.e.bliss = 0.6; renderHud(); save(); if (!bubble) say(s0.e, pick(["또 쓰다듬어 줘","네 손 기억나","따뜻했어"])); }
}
cv.addEventListener("pointerup", endStroke);
cv.addEventListener("pointercancel", endStroke);
function patPet(e){
  if (e.state === "sleep") { setState(e, "sit", 3); say(e, pick(["음… 왔어?","쓰다듬어 줘서 깼어"])); }
  heartBurst(e.x, ey(e) - 26*P*ds(e.depth)); e.happy = 1.8; G.pats++;
  if (!e.target && e.state !== "eat") sitFront(e, rand(3,5));
  const now = performance.now();
  if (now - lastPatWarm > 1500) { lastPatWarm = now; addWarmth(1); }
  sfx("pet");
  if (!bubble && Math.random() < 0.45) say(e, pick(petOf(e).species === "cat" ? ["골골골…","거기, 거기!","따뜻하다","네 손 기억나"] : ["좋아, 더 해 줘","거기, 거기!","따뜻하다","네 손 기억나"]));
  setHint("아이를 문지르듯 쓰다듬으면 더 좋아해요");
  renderHud(); save();
}

/* ---------- HUD ---------- */
function yardTitle(){
  if (G.yardName) return G.yardName;
  const names = G.family.map(p => p.name);
  if (names.length === 1) return names[0] + "의 마당";
  if (names.length === 2) return names.join("·") + "의 마당";
  return names[0] + "네 마당";
}
function legacyRenderHud(){
  $("yardName").textContent = yardTitle();
  const one = G.family.length === 1 ? G.family[0] : null;
  $("yardSub").textContent = one && one.motto ? one.motto : (one ? `${breedOf(one.species, one.breed).name} · 꽃 ${G.blooms||0}송이 · 온기 ${G.warmth||0}` : `${G.family.length}마리 · 꽃 ${G.blooms||0}송이 · 온기 ${G.warmth||0}`);
  $("warmNum").textContent = G.warmth;
  const next = UNLOCKS.find(u => G.warmth < u.at), prev = [...UNLOCKS].reverse().find(u => G.warmth >= u.at);
  if (next) { const base = prev ? prev.at : 0; $("warmBar").style.width = Math.round((G.warmth-base)/(next.at-base)*100) + "%"; $("warmNext").textContent = `다음: ${next.name} (${next.at})`; }
  else { $("warmBar").style.width = "100%"; $("warmNext").textContent = "마당이 다 꾸며졌어요"; }
}
let toastT = null;
function toast(msg){ const el = $("toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove("on"), 2400); }
let hintT = null;
function setHint(msg){ const el = $("hint"); if (!msg) { el.classList.add("off"); return; } el.textContent = msg; el.classList.remove("off"); clearTimeout(hintT); hintT = setTimeout(()=>el.classList.add("off"), 6000); }

/* ---------- sheets ---------- */
let setupOpen = !G.set, draftFam = [], selIdx = 0;
function openVeil(id){ if (typeof refreshDateBtns === "function") refreshDateBtns(); $(id).hidden = false; const f = $(id).querySelector("textarea,button.primary"); f && setTimeout(()=>f.focus({preventScroll:true}), 50); }
function closeVeil(id){ $(id).hidden = true; }
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => closeVeil(b.closest(".veil").id)));
document.querySelectorAll(".veil").forEach(v => v.addEventListener("pointerdown", (ev) => { if (ev.target === v && v.id !== "setupVeil") closeVeil(v.id); }));
document.addEventListener("keydown", (ev) => { if (ev.key !== "Escape") return; document.querySelectorAll(".veil:not([hidden])").forEach(v => { if (v.id === "setupVeil") { if (G.set) cancelSetup(); } else closeVeil(v.id); }); });

function openSetup(){
  draftFam = JSON.parse(JSON.stringify(G.family));
  if (!G.set) draftFam[0].name = "";
  selIdx = 0; setupOpen = true; syncEnts(); renderSetup(); openVeil("setupVeil");
}
function cancelSetup(){ setupOpen = false; closeVeil("setupVeil"); syncEnts(); renderHud(); }
const cur = () => draftFam[selIdx];
function renderFamChips(){
  const box = $("famChips"); box.textContent = "";
  draftFam.forEach((p, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", String(i === selIdx));
    b.textContent = p.name || NAMES[i] || ("아이 " + (i+1)); if (!p.name) b.style.color = "var(--muted)";
    b.addEventListener("click", () => { selIdx = i; renderSetup(); });
    box.appendChild(b);
  });
  if (draftFam.length < 10) {
    const a = document.createElement("button"); a.type = "button"; a.className = "chip add"; a.textContent = "+ 아이 추가";
    a.addEventListener("click", () => { draftFam.push(newPet(draftFam.length)); selIdx = draftFam.length - 1; syncEnts(); renderSetup(); $("petName").focus(); });
    box.appendChild(a);
  }
}
function renderSetup(){
  const p = cur();
  renderFamChips();
  $("petName").value = p.name; $("petName").placeholder = "예: " + (NAMES[selIdx] || "나비"); $("petMotto").value = p.motto || ""; $("petDay").value = p.day || "";
  renderBreeds(); syncSetup(); syncDayFields(); refreshDateBtns();
  $("removeRow").hidden = draftFam.length <= 1; $("removeConfirm").hidden = true;
  $("setupTitle").textContent = G.set ? "우리 아이들" : "함께할 아이를 소개해 주세요";
  $("setupLead").hidden = G.set; $("setupCancel").hidden = !G.set; $("setupSubmit").textContent = G.set ? "저장하기" : "마당 열기";
}
function renderBreeds(){
  const p = cur(), box = $("breeds"); box.textContent = "";
  $("breedLabel").textContent = SPECIES_KO[p.species] + " 종류";
  BREEDS[p.species].forEach(b => {
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "breed"; btn.dataset.v = b.id;
    btn.setAttribute("aria-pressed", String(b.id === p.breed)); btn.setAttribute("aria-label", b.name);
    const c = document.createElement("canvas"); c.width = SW*CLAY_SCALE; c.height = SH*CLAY_SCALE;
    c.getContext("2d").drawImage(getSprite(p.species, b.id, "front", 0, "n", 1).cv, 0, 0, c.width, c.height);
    const s = document.createElement("span"); s.textContent = b.name;
    btn.append(c, s); box.appendChild(btn);
  });
}
function syncSetup(){
  const p = cur();
  document.querySelectorAll("#speciesChips .chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.v === p.species)));
  document.querySelectorAll("#breeds .breed").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.v === p.breed)));
  $("thumb").style.backgroundImage = p.photo ? `url(${p.photo})` : "none";
  $("photoClear").hidden = !p.photo;
}
const entOfCur = () => ents.find(e => e.id === cur().id);
$("petName").addEventListener("input", () => { cur().name = $("petName").value.trim(); renderFamChips(); });
$("petMotto").addEventListener("input", () => { cur().motto = $("petMotto").value.trim(); });
$("petDay").addEventListener("input", () => { cur().day = $("petDay").value || ""; });
$("speciesChips").addEventListener("click", ev => { const b = ev.target.closest(".chip"); if (!b || b.dataset.v === cur().species) return; cur().species = b.dataset.v; cur().breed = BREEDS[b.dataset.v][0].id; renderBreeds(); syncSetup(); const e = entOfCur(); if (e) e.happy = 1; });
$("breeds").addEventListener("click", ev => { const b = ev.target.closest(".breed"); if (!b) return; cur().breed = b.dataset.v; syncSetup(); const e = entOfCur(); if (e) { e.happy = 1.2; e.vy = 260*S; } });
$("photoInput").addEventListener("change", ev => {
  const file = ev.target.files && ev.target.files[0]; if (!file) return;
  const img = new Image(), url = URL.createObjectURL(file), p = cur();
  img.onload = () => {
    const sc = Math.min(1, 280/Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    p.photo = c.toDataURL("image/jpeg", 0.78); URL.revokeObjectURL(url); syncSetup();
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast("이 사진은 열 수 없어요"); };
  img.src = url; ev.target.value = "";
});
$("photoClear").addEventListener("click", () => { cur().photo = null; syncSetup(); });
$("removePet").addEventListener("click", () => { $("removeRow").hidden = true; $("removeConfirm").hidden = false; });
$("removeKeep").addEventListener("click", () => { $("removeRow").hidden = false; $("removeConfirm").hidden = true; });
$("removeYes").addEventListener("click", () => { draftFam.splice(selIdx, 1); selIdx = 0; syncEnts(); renderSetup(); });
$("setupCancel").addEventListener("click", cancelSetup);
$("setupForm").addEventListener("submit", ev => {
  ev.preventDefault();
  const first = !G.set;
  draftFam.forEach((p, i) => { if (!p.name) p.name = NAMES[i] || ("아이" + (i+1)); delete p._n; });
  const ids = new Set(draftFam.map(p => p.id));
  G.family = draftFam; setupOpen = false; G.set = true;
  G.stars.forEach(s => { if (s.to !== "all" && !ids.has(s.to)) s.to = "all"; });
  closeVeil("setupVeil"); $("dock").hidden = false; syncEnts(); recordVisit(); checkSpecial(); renderHud(); save();
  if (first) {
    setTimeout(openGuide, 700);
    const e0 = ents[0], n0 = G.family[0].name;
    setTimeout(() => say(e0, ents.length > 1 ? "우리 다 같이 왔어!" : `안녕, 나 ${n0}${hasBatchim(n0) ? "이야" : "야"}. 여기 좋다`, 4.5), 500);
    setHint("아이를 살짝 눌러 쓰다듬어 주세요");
  } else toast("저장했어요");
});
function hasBatchim(w){ const c = w.charCodeAt(w.length-1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }

/* letters */
let letterTo = "all";
function renderToChips(){
  const box = $("toChips"); box.textContent = ""; box.hidden = G.family.length < 2;
  const opts = (G.family.length > 1 ? [{id:"all", name:"모두에게"}] : []).concat(G.family.map(p => ({id:p.id, name:p.name})));
  if (!opts.some(o => o.id === letterTo)) letterTo = opts[0].id;
  opts.forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.name; b.setAttribute("aria-pressed", String(o.id === letterTo)); b.addEventListener("click", () => { letterTo = o.id; renderToChips(); }); box.appendChild(b); });
}
function openLetter(){ letterTo = G.family.length > 1 ? "all" : G.family[0].id; renderToChips(); openVeil("letterVeil"); }
const toName = (to) => to === "all" ? (G.family.length > 1 ? "모두에게" : G.family[0].name + "에게") : ((G.family.find(p => p.id === to) || {}).name || "") + "에게";
$("letterText").addEventListener("input", () => { $("letterCount").textContent = $("letterText").value.length; });
$("letterForm").addEventListener("submit", ev => {
  ev.preventDefault();
  const text = $("letterText").value.trim(); if (!text) { $("letterText").focus(); return; }
  const pos = placeStar();
  const st = {id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2,6), text, at: Date.now(), x: pos.x, y: pos.y, to: letterTo};
  G.stars.push(st); lastStar = st;
  const paperRect = $("letterText").getBoundingClientRect();
  $("letterText").value = ""; $("letterCount").textContent = "0"; closeVeil("letterVeil");
  const from = letterTo === "all" ? null : ents.find(e => e.id === letterTo);
  const ox = from ? from.x : W*0.5, oy = from ? ey(from) - 24*P*ds(from.depth) : groundY;
  rising = {x0: ox, y0: oy, x1: st.x*LW*P, y1: st.y*LH*P, t: 0, star: st, hold: true};
  { const rs = rising; flyLetter(paperRect, text, ox*camZ + camX, oy*camZ + camY, rs.x1*camZ + camX, rs.y1*camZ + camY, () => { if (rising === rs) { rs.x0 = rs.x1; rs.y0 = rs.y1; rs.t = 0.72; rs.hold = false; } }); }
  (from ? [from] : ents).forEach(e => { if (!e.target) setState(e, "sit", 5); e.dir = st.x*W >= e.x ? 1 : -1; });
  const speaker = from || pick(ents);
  const rg = findRegret(text);
  if (rg) {
    const base = rg === "any" ? [] : (REGRETS.find(x => x.id === rg) || {lines:[]}).lines;
    const lines = [pick(["편지 다 읽었어. 많이 아팠구나","말해 줘서 고마워. 무거웠지"]), ...base, pick(REGRET_FREE.slice(1))];
    setTimeout(() => { (from ? [from] : ents).forEach(e => { e.target = null; sitFront(e, 30); }); }, 2000);
    lines.forEach((ln, i) => setTimeout(() => { say(speaker, ln, 4.4); if (i === lines.length - 1) { (from ? [from] : ents).forEach(e => { e.happy = 1.6; }); heartBurst(speaker.x, ey(speaker) - 26*P*ds(speaker.depth)); } }, 2300 + i*4800));
    addWarmth(3); renderHud(); save();
    return;
  }
  setTimeout(() => sitFront(speaker, 5), 2000);
  setTimeout(() => say(speaker, from ? pick(["잘 받았어. 하늘에 걸어 둘게","다 들었어. 고마워","나도 많이 사랑해"]) : pick(["우리 다 같이 읽었어","모두 고맙대","우리도 많이 사랑해"]), 4.5), 2300);
  addWarmth(3); renderHud(); save();
});
function placeStar(){
  let best = null, bestD = -1;
  for (let i=0;i<40;i++) { const c = {x: rand(0.07, 0.93), y: rand(0.13, 0.36)}; const d = G.stars.reduce((m,s) => Math.min(m, Math.hypot((s.x-c.x)*W, (s.y-c.y)*H)), 1e9); if (d > bestD) { bestD = d; best = c; } }
  return best;
}
const fmtDate = (ts) => new Date(ts).toLocaleDateString("ko-KR", {year:"numeric", month:"long", day:"numeric"});
let readingId = null;
function openRead(id){
  const st = G.stars.find(s => s.id === id); if (!st) return;
  readingId = id; $("readDate").textContent = `${toName(st.to)} · ${fmtDate(st.at)}`; $("readText").textContent = st.text;
  $("readBtns").hidden = false; $("readConfirm").hidden = true; openVeil("readVeil"); sfx("star");
}
$("readDelete").addEventListener("click", () => { $("readBtns").hidden = true; $("readConfirm").hidden = false; });
$("readKeep").addEventListener("click", () => { $("readBtns").hidden = false; $("readConfirm").hidden = true; });
$("readDeleteYes").addEventListener("click", () => { G.stars = G.stars.filter(s => s.id !== readingId); closeVeil("readVeil"); renderHud(); renderList(); save(); toast("별을 내려놓았어요"); });
function renderNotes(){
  const ul = $("noteList"); ul.textContent = "";
  if (!G.notes.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = "가끔 마당에 아이들이 쓴 쪽지가 놓여 있어요."; ul.appendChild(li); return; }
  [...G.notes].reverse().forEach(n => {
    const li = document.createElement("li"), b = document.createElement("button");
    const t = document.createElement("span"); t.className = "t"; t.textContent = n.text;
    const d = document.createElement("span"); d.className = "d"; d.textContent = `${n.name} · ${fmtDate(n.at)}`;
    b.append(t, d); b.addEventListener("click", () => { closeVeil("listVeil"); showNote(n); }); li.appendChild(b); ul.appendChild(li);
  });
}
function renderList(){
  renderNotes();
  const ul = $("starList"); ul.textContent = "";
  if (!G.stars.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = "아직 띄운 별이 없어요. 하고 싶은 말을 편지로 써 보세요."; ul.appendChild(li); return; }
  [...G.stars].sort((a,b)=>b.at-a.at).forEach(s => {
    const li = document.createElement("li"), b = document.createElement("button");
    const t = document.createElement("span"); t.className = "t"; t.textContent = s.text.split("\n")[0];
    const d = document.createElement("span"); d.className = "d"; d.textContent = `${toName(s.to)} · ${fmtDate(s.at)}`;
    b.append(t, d); b.addEventListener("click", () => { closeVeil("listVeil"); openRead(s.id); }); li.appendChild(b); ul.appendChild(li);
  });
}

$("feedBtn").addEventListener("click", () => { setBallMode(false); feed(); });
$("decoBtn").addEventListener("click", () => { setBallMode(false); renderDeco(); openVeil("decoVeil"); });
$("ballBtn").addEventListener("click", () => setBallMode(!ballMode));
function setBallMode(on){
  ballMode = on; $("ballBtn").setAttribute("aria-pressed", String(on));
  if (on) { setHint("공을 던질 곳을 눌러요. 공중에서 잡으면 캐치!"); ents.forEach(e => { if (e.state === "sleep") setState(e, "idle"); }); say(pick(ents), pick(["공이다! 던져 줘!","준비됐어!"])); }
  else setHint("");
}
$("letterBtn").addEventListener("click", () => { setBallMode(false); openLetter(); });

$("pastBtn").addEventListener("click", () => { closeVeil("letterVeil"); renderList(); openVeil("listVeil"); });
$("listWrite").addEventListener("click", () => { closeVeil("listVeil"); openLetter(); });
$("yardNameInput").addEventListener("input", () => { G.yardName = $("yardNameInput").value.trim(); renderHud(); save(); });
$("settingsBtn").addEventListener("click", () => { $("yardNameInput").value = G.yardName || ""; $("yardNameInput").placeholder = (() => { const n = G.yardName; G.yardName = ""; const a = yardTitle(); G.yardName = n; return a; })(); $("skySel").value = G.sky || "auto"; openVeil("settingsVeil"); });
$("skySel").addEventListener("change", () => { G.sky = $("skySel").value; glows = []; decCache.clear(); save(); });
$("editPet").addEventListener("click", () => { closeVeil("settingsVeil"); openSetup(); });

/* ---------- meals & tidying ---------- */
const bowl = {full: false, left: 0};
let bowlHit = null, poops = [], poopHits = [];
const bowlX = () => decoAt("bowl", W*0.4, dMin + (dMax - dMin)*0.3).x, bowlD = () => decoAt("bowl", W*0.4, dMin + (dMax - dMin)*0.3).d;
function feed(){
  for(const p of fam())requestBend(p);
  if(ball)ballFade(ball.by);
  if (bowl.full) { const e = pick(ents); if (e) say(e, "아직 밥 남았어!"); return; }
  const _now = Date.now(), _hungry = ents.filter(e => !e.ateAt || _now - e.ateAt > 90000);
  if (!_hungry.length) { const e = pick(ents); if (e) say(e, pick(["아까 먹어서 배불러","배 빵빵해!","조금 있다 먹을래"])); toast("다들 아직 배가 불러요"); return; }
  const _eaters = _hungry.sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random()*_hungry.length));
  bowl.full = true; bowl.left = _eaters.length; bowl.round=uid(); const mealRound=bowl.round; sfx("treat");
  const _full = ents.filter(e => !_eaters.includes(e));
  if (_full.length && Math.random() < 0.6) setTimeout(() => { const e = pick(_full); if (e && !bubble) say(e, pick(["난 아직 배불러","먼저 먹어~","난 구경할래"])); }, 1400);
  for (let i=0;i<10;i++) setTimeout(() => sparks.push({x: bowlX() + rand(-6,6)*P, y: groundY + bowlD() - 30*P, vx: rand(-20,20), vy: 120, t: 0.35, c: "#c98b52"}), i*50);
  const n = _eaters.length;
  _eaters.forEach((e, i) => {
    e.ateAt = _now;
    if (e.state === "sleep") setState(e, "idle");
    const side = n === 1 ? -1 : (i % 2 ? 1 : -1), row = Math.floor(i/2);
    const p=petOf(e),spr=getBendSprite(p,2),reach=spr?(spr.m.mx-AX)*P*ds(bowlD())*1.4*petSizeFactor(p):(15*P*ds(bowlD())*petSizeFactor(p));
    const tx=clamp(bowlX()+side*(reach+row*5*P),16*P,W-16*P),td=clamp(bowlD()-3*P+row*3*P,dMin,dMax);
    setTimeout(() => {if(bowl.full&&bowl.round===mealRound)goTo(e, tx, td, true, () => { if(!bowl.full||bowl.round!==mealRound)return;e.dir = bowlX() > e.x ? 1 : -1; setState(e, "eat"); e.atBowl = true; });}, i*250);
  });
}
function bowlDone(e){
  bowl.left = Math.max(0, bowl.left - 1);
  if (bowl.left === 0) { bowl.full = false; G.treats++; addWarmth(1); save(); }
  if (Math.random() < 0.7) setTimeout(() => spawnPoop(e), rand(18000, 45000));
}
function spawnPoop(e){
  if (poops.length >= 3 || !ents.includes(e) || breathing) return;
  const x = clamp(e.x - e.dir*12*P*ds(e.depth), W*0.08, W*0.92), d = clamp(e.depth + rand(-4, 4), dMin + 4, dMax);
  poops.push({x, d, pop: 0});
  if (!bubble && Math.random() < 0.5) say(e, pick(["앗… 실례했어","헤헤, 치워 줄 거지?","뿌듯하다!"]));
}
function cleanPoop(pp){
  if (pp.cl != null) return;
  pp.cl = 0; pp.sand = []; sfx("throw");
  if (RM) pp.cl = SCOOP_T - 0.05;
}
const SCOOP_T = 1.7;
function updateScoops(dt){
  for (const pp of poops) {
    if (pp.cl == null) continue;
    const prev = pp.cl; pp.cl += dt;
    const k = P*ds(pp.d);
    if (pp.cl > 0.72 && pp.cl < 1.25 && Math.random() < 0.85) for (let i=0;i<2;i++) pp.sand.push({x: pp.x + rand(-7,7)*k, y: groundY + pp.d - 13*k + rand(-2,2)*k, vy: rand(10,40), t: rand(.45,.8), c: pick(["#b39a7a","#c9b28f","#9f8667","#d8c6a6"])});
    for (const g of pp.sand) { g.t -= dt; g.vy += 260*dt; g.y += g.vy*dt; }
    pp.sand = pp.sand.filter(g => g.t > 0 && g.y < groundY + pp.d + 2);
    if (prev < 0.7 && pp.cl >= 0.7) sfx("treat");
    if (pp.cl >= SCOOP_T) finishPoop(pp);
  }
}
function drawScoopClean(pp, img, k, foot, pw, ph){
  const t = pp.cl, ez = (u) => u < 0 ? 0 : u > 1 ? 1 : u*u*(3 - 2*u);
  const a1 = ez(t/0.3), a2 = ez((t - 0.3)/0.38), a3 = ez((t - 0.72)/0.45), a4 = ez((t - 1.22)/0.45);
  const sc = 0.2*k, panX = pp.x - pw*0.12, startX = panX - 34*k;
  const x = startX + (panX - startX)*a2 + 4*k*a4, lift = 15*k*a3 + 10*k*a4, tilt = -0.05 - 0.17*a3 - 0.2*a4;
  const y = foot - 2*k - lift, alpha = a1*(1 - a4), size = 1 - 0.45*a4;
  // ground shadow under scoop
  softShadow(x - 4*k, foot + k*0.5, 13*k*(1 - 0.3*a3), 2*k, 0.22*alpha);
  if (a3 < 0.05 && a4 === 0) { softShadow(pp.x, foot, 4*k, 1*k, 0.25); }
  mctx.save(); mctx.globalAlpha = alpha; mctx.translate(x, y); mctx.rotate(tilt); mctx.scale(size, size);
  drawScoop(mctx, sc);
  mctx.restore();
  // the poop: on the grass until the pan slides under, then rides in it
  mctx.save(); mctx.globalAlpha = 1 - a4;
  if (a3 <= 0 && t < 0.72) { drawArtImage(mctx, img, Math.round(pp.x - pw/2), Math.round(foot - ph), Math.round(pw), Math.round(ph)); }
  else { mctx.translate(x + pw*0.12, y - 1*k); mctx.rotate(tilt); mctx.scale(size, size); drawArtImage(mctx, img, -pw/2, -ph, pw, ph); }
  mctx.restore();
  for (const g of pp.sand) { mctx.globalAlpha = Math.min(1, g.t*2); mctx.fillStyle = g.c; mctx.beginPath(); mctx.arc(g.x, g.y, Math.max(1, 0.55*k), 0, Math.PI*2); mctx.fill(); }
  mctx.globalAlpha = 1;
  if (a4 > 0) for (let i=0;i<6;i++) { const ang = i*1.05 + t*3, r = (6 + 10*a4)*k; const sx2 = x + Math.cos(ang)*r, sy2 = y - 6*k + Math.sin(ang)*r*0.7, ss = (1.6 - a4)*k; mctx.globalAlpha = 1 - a4*0.7; mctx.fillStyle = "#fffbe8"; mctx.beginPath(); mctx.moveTo(sx2, sy2 - ss); mctx.quadraticCurveTo(sx2, sy2, sx2 + ss, sy2); mctx.quadraticCurveTo(sx2, sy2, sx2, sy2 + ss); mctx.quadraticCurveTo(sx2, sy2, sx2 - ss, sy2); mctx.quadraticCurveTo(sx2, sy2, sx2, sy2 - ss); mctx.fill(); }
  mctx.globalAlpha = 1;
}
/* clay litter scoop, pan pointing right; origin = centre of the pan floor */
function drawScoop(c, s){
  c.save(); c.scale(s, s);
  const hi = "#d8eef9", base = "#a9d3ea", lo = "#7fb3d1", rim = "#c4e3f4";
  const rrp = (x,y,w,h,r) => { const p = new Path2D(); p.roundRect(x,y,w,h,r); return p; };
  c.save(); c.shadowColor = "rgba(60,80,100,.22)"; c.shadowBlur = 8; c.shadowOffsetY = 5;
  let g = c.createLinearGradient(0,-7,0,7); g.addColorStop(0,hi); g.addColorStop(.5,base); g.addColorStop(1,lo);
  c.fillStyle = g; c.fill(rrp(-118,-7,82,14,7)); c.restore();
  c.fillStyle = "rgba(90,130,160,.45)"; c.fill(rrp(-100,-3,14,6,3));
  g = c.createRadialGradient(-122,-4,1,-120,0,13); g.addColorStop(0,hi); g.addColorStop(1,lo);
  c.fillStyle = g; c.beginPath(); c.arc(-120,0,12,0,Math.PI*2); c.fill();
  c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(-124,-4,3.4,0,Math.PI*2); c.fill();
  c.save(); c.shadowColor = "rgba(60,80,100,.22)"; c.shadowBlur = 12; c.shadowOffsetY = 6;
  const pan = new Path2D(); pan.moveTo(-40,-26); pan.lineTo(40,-34); pan.quadraticCurveTo(52,-34,52,-22); pan.lineTo(52,22); pan.quadraticCurveTo(52,34,40,34); pan.lineTo(-40,26); pan.quadraticCurveTo(-46,26,-46,18); pan.lineTo(-46,-18); pan.quadraticCurveTo(-46,-26,-40,-26); pan.closePath();
  g = c.createLinearGradient(-46,-34,52,34); g.addColorStop(0,hi); g.addColorStop(.55,base); g.addColorStop(1,lo);
  c.fillStyle = g; c.fill(pan); c.restore();
  const fl = new Path2D(); fl.moveTo(-34,-19); fl.lineTo(40,-26); fl.quadraticCurveTo(45,-26,45,-20); fl.lineTo(45,20); fl.quadraticCurveTo(45,26,40,26); fl.lineTo(-34,19); fl.quadraticCurveTo(-38,19,-38,15); fl.lineTo(-38,-15); fl.quadraticCurveTo(-38,-19,-34,-19); fl.closePath();
  g = c.createLinearGradient(0,-26,0,26); g.addColorStop(0,"#9ccbe5"); g.addColorStop(1,"#b9def0"); c.fillStyle = g; c.fill(fl);
  for (let rI=0;rI<4;rI++) for (let cI=0;cI<5;cI++){ const px = -26 + cI*14, py = -15 + rI*10 + cI*0.35; c.fillStyle = "rgba(70,110,140,.42)"; c.fill(rrp(px,py,9,4.4,2.2)); c.fillStyle = "rgba(255,255,255,.35)"; c.fill(rrp(px+1,py+3.6,7,1,.5)); }
  c.strokeStyle = rim; c.lineWidth = 2.4; c.lineCap = "round"; c.beginPath(); c.moveTo(-42,-24); c.lineTo(40,-32); c.quadraticCurveTo(50,-32,50,-22); c.stroke();
  c.restore();
}
function finishPoop(pp){
  poops = poops.filter(q => q !== pp);
  sparkBurst(pp.x, groundY + pp.d - 14*P*ds(pp.d), "#ffffff", 12); sfx("glow"); addWarmth(1); save();
  const e = [...ents].sort((a,b) => Math.abs(a.x - pp.x) - Math.abs(b.x - pp.x))[0];
  if (e && !bubble && Math.random() < 0.6) { e.happy = 1.2; say(e, pick(["고마워! 깨끗해졌다","역시 최고야","치워 줘서 고마워"])); }
}

/* ---------- more decor ---------- */
function legacyDrawFence(){
  const d = dMin - 3, k = P*ds(d), y = groundY + d, step = 12*k, ph = Math.round(y - 12*k);
  mctx.fillStyle = "#e8dccd"; mctx.fillRect(0, Math.round(y - 9*k), W, Math.round(1.5*k)); mctx.fillRect(0, Math.round(y - 4*k), W, Math.round(1.5*k));
  mctx.fillStyle = "#fffaf2"; mctx.fillRect(0, Math.round(y - 9.5*k), W, Math.round(1*k)); mctx.fillRect(0, Math.round(y - 4.5*k), W, Math.round(1*k));
  const img = BM.picket();
  for (let x = (W % step)/2; x < W; x += step) drawArtImage(mctx,img, Math.round(x - img.width*k/2), ph, Math.round(img.width*k), Math.round(img.height*k));
}
const mailboxDec = () => decor("mailbox", 14, 26, 5, 25, (x,y) => {
  fr(x-1, y-14, 2, 14, "#8a6650"); fr(x-1, y-14, 1, 14, "#a88268");
  fr(x-4, y-22, 10, 8, "#5b3a6e"); fr(x-3, y-23, 8, 1, "#5b3a6e"); fr(x-3, y-21, 8, 6, "#ff9ec0"); fr(x-3, y-21, 8, 1, "#ffc2d6"); fr(x-2, y-23, 6, 1, "#ff9ec0");
  fr(x-2, y-18, 6, 1, "#c76f93"); fr(x+6, y-24, 1, 6, "#5b3a6e"); fr(x+6, y-24, 3, 2, "#ffd25e");
});
const pondDec = (sh) => decor("pond"+sh, 50, 18, 25, 12, (x,y) => {
  pxEll(x, y, 22, 6, "#b9afc8"); pxEll(x, y-1, 21, 5.4, "#8fc0e6"); pxEll(x+2, y, 17, 3.8, "#6fa6d6"); pxEll(x-8, y-3, 6, 0.8, "#d8ecfb");
  fr(x+4+sh, y-2, 3, 1, "#e6f4ff"); fr(x-12-sh, y+1, 2, 1, "#e6f4ff");
  pxEll(x-6, y, 3.5, 1.5, "#5f9a5c"); fr(x-6, y-1, 1, 1, "#3f7a46"); pxEll(x+9, y-2, 3, 1.2, "#6fb663");
  fr(x+8, y-4, 3, 2, "#ffb3c9"); fr(x+9, y-5, 1, 1, "#ff8fb1"); fr(x+9, y-3, 1, 1, "#ffe08a");
  [[-21,1],[-15,4],[19,3],[13,5],[0,6],[-6,6]].forEach(([dx,dy]) => { pxEll(x+dx, y+dy, 2, 1, "#d8d0e4"); fr(x+dx-1, y+dy-1, 2, 1, "#f4f0fa"); });
});
const houseDec = () => decor("house", 40, 36, 20, 34, (x,y) => {
  fr(x-12, y-16, 24, 16, "#5b3a6e"); fr(x-11, y-15, 22, 15, "#fff1dc"); fr(x-11, y-15, 22, 2, "#ffffff"); fr(x+8, y-15, 3, 15, "#f1dcc0");
  for (let i=0;i<10;i++) fr(x-16+i, y-17-i, 32-i*2, 1, i < 2 ? "#5b3a6e" : (i%3 === 0 ? "#ff9ec0" : "#ffb3c9"));
  fr(x-15, y-17, 30, 1, "#5b3a6e"); fr(x-1, y-27, 2, 1, "#5b3a6e");
  pxEll(x, y-5, 5, 6, "#5b3a6e"); fr(x-5, y-5, 11, 5, "#5b3a6e"); pxEll(x, y-5, 4, 5, "#3d2a4a"); fr(x-4, y-5, 9, 5, "#3d2a4a");
  fr(x-4, y-1, 9, 1, "#c49ad8");
  fr(x-9, y-12, 4, 4, "#5b3a6e"); fr(x-8, y-11, 2, 2, "#bfe3ff"); fr(x+5, y-12, 4, 4, "#5b3a6e"); fr(x+6, y-11, 2, 2, "#bfe3ff");
  fr(x-3, y-22, 6, 4, "#ffe08a"); fr(x-2, y-21, 1, 1, "#ff8fb1"); fr(x+1, y-21, 1, 1, "#ff8fb1"); fr(x-1, y-20, 2, 1, "#ff8fb1");
});
const sunflowerDec = (sw) => decor("sun"+sw, 34, 34, 17, 33, (x,y) => {
  [[-10,24],[0,30],[10,22]].forEach(([dx,h], i) => {
    const s = (i === 1 ? sw : -sw);
    fr(x+dx, y-h+6, 1, h-6, "#5f9a5c"); fr(x+dx-2, y-h/2, 2, 1, "#6fb663"); fr(x+dx+1, y-h/2+3, 2, 1, "#6fb663");
    const cx = x+dx+s, cy = y-h+4;
    for (const [ox,oy] of [[0,-4],[3,-3],[4,0],[3,3],[0,4],[-3,3],[-4,0],[-3,-3]]) pxEll(cx+ox, cy+oy, 1.6, 1.6, "#ffd25e");
    pxEll(cx, cy, 2.6, 2.6, "#8a5a3c"); fr(cx-1, cy-1, 1, 1, "#b07a4f");
  });
});
const benchDec = () => decor("bench", 36, 16, 18, 15, (x,y) => {
  fr(x-15, y-9, 30, 3, "#5b3a6e"); fr(x-14, y-8, 28, 1, "#c99a6c"); fr(x-14, y-9, 28, 1, "#e0b88a");
  fr(x-15, y-15, 30, 4, "#5b3a6e"); fr(x-14, y-14, 28, 2, "#c99a6c"); fr(x-14, y-14, 28, 1, "#e0b88a");
  [-13, 11].forEach(dx => { fr(x+dx, y-11, 2, 11, "#5b3a6e"); fr(x+dx, y-6, 2, 6, "#8a6650"); });
  fr(x+4, y-12, 5, 3, "#ff9ec0"); fr(x+5, y-12, 3, 1, "#ffc2d6");
});
let flies = [];
function drawButterflies(t, dt){
  if (!flies.length) flies = Array.from({length: 4}, (_,i) => ({x: rand(W*0.1, W*0.9), y: rand(groundY - 40*P, groundY + dMax*0.4), p: rand(0,6), c: ["#ffb3c9","#ffe08a","#c3aef0","#a6e6c8"][i]}));
  for (const f of flies) {
    f.p += 1/60; f.x += Math.cos(f.p*0.7)*0.8*(RM?0.3:1); f.y += Math.sin(f.p*1.9)*0.6*(RM?0.3:1);
    if (f.x < 10 || f.x > W - 10) f.p += Math.PI;
    const img = BM.fly(f.c, Math.floor(t*8 + f.p) % 2), k = P;
    drawArtImage(mctx,img, Math.round(f.x - img.width*k/2), Math.round(f.y), img.width*k, img.height*k);
  }
}
const DECO_PREV = {
  flowers: () => bmp("pv-fl", [".p...y..", "pyp.yoy.", ".p...y..", ".g...g..", "gg..gg.."], {p:"#f6b8cf", y:"#ffe39a", o:"#ffd25e", g:"#5f9a5c"}),
  rainbow: () => bmp("pv-rb", ["..rrrr..", ".roooor.", "royyyyor", "oyg..gyo", "yg....gy"], {r:"#ff9a9a", o:"#ffc98a", y:"#fff09a", g:"#a6e3b0"}),
  butterfly: () => BM.fly("#ffb3c9", 0),
  fence: () => bmp("pv-fe", [".w..w..w.", "www.w.www", "wwwwwwwww", ".w..w..w.", "wwwwwwwww", ".w..w..w."], {w:"#fffaf2"}, "#c9b8a6")
};
function legacyDecoPreview(key){
  if (DECO_PREV[key]) return DECO_PREV[key]();
  const map = {cushion: cushionDec, lantern: () => lanternDec(1), tree: () => treeDec(0), mailbox: mailboxDec, pond: () => pondDec(0), house: houseDec, sunflower: () => sunflowerDec(0), bench: benchDec};
  return map[key] ? map[key]().cv : null;
}
function renderBaseDeco(){
  const box = $("decoList"); box.textContent = "";
  UNLOCKS.forEach(u => {
    const open = unlocked(u.key), on = has(u.key);
    const b = document.createElement("button"); b.type = "button"; b.className = "deco"; b.disabled = !open; b.setAttribute("aria-pressed", String(on));
    const c = document.createElement("canvas"); c.width = 288; c.height = 216;
    const src = decoPreview(u.key);
    if (src) { const cx = c.getContext("2d"); cx.imageSmoothingEnabled = true; const sc = Math.min(264/src.width, 192/src.height); drawArtImage(cx,src, (288-src.width*sc)/2, (216-src.height*sc)/2, src.width*sc, src.height*sc); }
    const nm = document.createElement("span"); nm.textContent = u.name;
    const st = document.createElement("span"); st.className = "st"; st.textContent = open ? (on ? "놓여 있어요" : "치워 뒀어요") : `온기 ${u.at}에 열려요`;
    b.append(c, nm, st);
    b.addEventListener("click", () => { G.hidden = G.hidden || []; if (on) G.hidden.push(u.key); else G.hidden = G.hidden.filter(k => k !== u.key); decCache.clear(); flies = []; save(); renderDeco(); });
    box.appendChild(b);
  });
}

/* ---------- visits, daily notes, special days ---------- */
let envelope = null, envHit = null, celebrating = null;
function recordVisit(){ if (!G.set) return; const d = today(); if (!G.visits.includes(d)) { G.visits.push(d); if (G.visits.length > 800) G.visits = G.visits.slice(-800); save(); } }
const NOTES = [
  "오늘도 와 줘서 고마워. 그거면 충분해.",
  "밥 잘 챙겨 먹었어? 나는 여기서 배불러.",
  "네가 웃을 때 내 꼬리도 같이 흔들렸던 거 알아?",
  "슬픈 날엔 슬퍼해도 돼. 나는 어디 안 가.",
  "우리 같이 걷던 길, 나도 다 기억해.",
  "너무 미안해하지 마. 나는 네 덕분에 행복했어.",
  "오늘 하늘 봤어? 나도 같은 하늘 보고 있어.",
  "따뜻한 물 한 잔 마시고 푹 자.",
  "네 손이 세상에서 제일 좋았어.",
  "가끔은 나 말고 너 자신도 쓰다듬어 줘.",
  "여기 친구들이 많아. 외롭지 않아.",
  "네가 불러 준 내 이름, 아직도 제일 좋아.",
  "창밖에 바람 불면 내가 인사하는 거야.",
  "오늘 하루도 잘 버텼어. 정말 대단해.",
  "내 자리가 비어 있어도 괜찮아. 마음에 있잖아.",
  "우리 처음 만난 날, 나도 엄청 설렜어.",
  "졸리면 자. 꿈에서 같이 놀자.",
  "네가 행복하면 여기 꽃이 더 많이 펴.",
  "산책 나가면 나 대신 꽃 냄새 맡아 줘.",
  "고마워. 사랑해. 또 와.",
  "네 옆에 있던 시간이 내 전부였어.",
  "힘들면 쉬어 가. 나는 기다리는 거 잘해.",
  "나 생각하면서 한 번 웃어 줘.",
  "너는 좋은 보호자였어. 정말이야."
];
function setupEnvelope(){
  if (!G.set || G.noteDate === today() || envelope) return;
  const e = pick(ents);
  envelope = {x: clamp((e ? e.x : W*0.5) + rand(-0.15, 0.15)*W, W*0.12, W*0.88), d: clamp((e ? e.depth : dMax*0.6) + rand(-10, 10), dMin + 6, dMax), from: e ? e.id : G.family[0].id};

}
function openNote(){
  if (!envelope) return;
  const fromP = G.family.find(p => p.id === envelope.from) || pick(G.family);
  const text = NOTES[(G.notes.length + hash(G.visits.length, 3)) % NOTES.length];
  const n = {at: Date.now(), from: fromP.id, name: fromP.name, text};
  G.notes.push(n); if (G.notes.length > 120) G.notes = G.notes.slice(-120);
  G.noteDate = today(); sparkBurst(envelope.x, groundY + envelope.d - 10, "#ffc2d6", 14); envelope = null;
  addWarmth(2); save(); sfx("star"); showNote(n);
  const e = ents.find(x => x.id === fromP.id); if (e) { sitFront(e, 6); setTimeout(() => say(e, "내가 쓴 거야. 읽어 줘서 고마워"), 900); }
}
function showNote(n){ $("noteFrom").textContent = `From. ${n.name} · ${fmtDate(n.at)}`; $("noteText").textContent = n.text; openVeil("noteVeil"); }
function checkSpecial(){
  const md = today().slice(5);
  const p = G.family.find(p => isPetDay(p));
  celebrating = p ? p.id : null;
  if (p) {
    setTimeout(() => { toast(`오늘은 ${p.name}의 날이에요`); const e = ents.find(x => x.id === p.id); if (e) { sitFront(e, 8); e.happy = 3; say(e, "오늘을 기억해 줘서 고마워!", 5); } for (let i=0;i<3;i++) setTimeout(() => sparkBurst(W*0.64, groundY + dMin + (dMax-dMin)*0.3 - 30*P, pick(["#ff9ec0","#ffe08a","#a6e6c8"]), 16), 600 + i*700); }, 1500);
  }
}

/* ---------- mood & breathing ---------- */
const MOODS = [
  {id:"ok",    label:"괜찮아요",    c:"#ffe08a", lines:["다행이다! 오늘 같이 놀자","네가 괜찮으면 나도 좋아","오늘 하늘 예쁘다, 그치?"]},
  {id:"miss",  label:"그리워요",    c:"#c3aef0", lines:["나도 보고 싶었어","그리운 건 그만큼 사랑했다는 거야","나 여기 있어. 언제든 와"]},
  {id:"sad",   label:"많이 슬퍼요", c:"#9cc8f3", lines:["천천히 해도 돼. 옆에 있을게","네 잘못 아니야. 정말이야","천천히 숨 쉬어 보자. 같이"]},
  {id:"tired", label:"지쳤어요",    c:"#a6e6c8", lines:["오늘은 아무것도 안 해도 돼","내 옆에서 잠깐 쉬자","잘 버텼어. 고생 많았어"]},
  {id:"thanks",label:"고마운 마음", c:"#ff9ec0", lines:["나도 고마워!","우리 좋은 시간 많았지","네 덕분에 행복했어"]}
];
function renderMood(){ renderFavor(); }
/* small favors that lead out into the day */
const FAVORS = [
  "물 한 잔만 마셔 줘. 천천히.",
  "창문 열고 바깥 공기 한 번 크게 마셔 줘.",
  "10분만 밖에 걸어 줘. 나 대신 냄새도 맡고.",
  "따뜻한 밥 한 끼 챙겨 먹어 줘.",
  "좋아하는 노래 한 곡 들어 줘.",
  "햇볕 5분만 쬐어 줘. 나 그거 좋아했잖아.",
  "오늘은 조금 일찍 누워 줘.",
  "보고 싶은 사람한테 안부 한 줄 보내 줘.",
  "따뜻한 물로 씻고 개운하게 쉬어 줘.",
  "하늘 사진 한 장 찍어 줘. 나도 보고 싶어.",
  "어깨 한 번 쭉 펴고 기지개 켜 줘.",
  "맛있는 간식 하나 사 먹어. 내 몫까지."
];
function favorToday(){ const d = today(), n = parseInt(d.replace(/-/g,""), 10); return {date: d, text: FAVORS[(n + G.family.length) % FAVORS.length], from: G.family[n % G.family.length]}; }
function renderFavor(){
  const f = favorToday(), done = G.favorDone === f.date;
  $("favorFrom").textContent = `${f.from.name}의 작은 부탁`;
  $("favorText").textContent = done ? "고마워! 마당에 꽃이 하나 피었어." : f.text;
  $("favorBox").classList.toggle("done", done);
  $("favorDone").hidden = done; $("favorNote").hidden = done;
}
$("favorDone").addEventListener("click", () => {
  const f = favorToday(); if (G.favorDone === f.date) return;
  G.favorDone = f.date; G.blooms = (G.blooms||0) + 1; save(); renderFavor();
  closeVeil("moodVeil");
  const fl = {x: rand(W*0.12, W*0.88), d: rand(dMin+6, dMax*0.8), c: pick(["#ffb3c9","#ffe08a","#c3aef0","#ffffff"])};
  bloomAt(fl);
  const e = ents.find(x => x.id === f.from.id) || pick(ents);
  goTo(e, fl.x - 10*P, fl.d, false, () => { sitFront(e, 6); e.happy = 2; say(e, pick(["고마워! 이 꽃 네 거야","나 대신 해 줘서 고마워","봐, 꽃 피었다!"]), 4.5); });
  sfx("unlock");
});
function bloomAt(fl){ G.bloomSpots = G.bloomSpots || []; G.bloomSpots.push({x: fl.x/W, d: (fl.d - dMin)/Math.max(1, dMax - dMin), c: fl.c}); if (G.bloomSpots.length > 60) G.bloomSpots.shift(); sparkBurst(fl.x, groundY + fl.d - 6*P, fl.c, 14); save(); }

/* regret comfort */
const REGRET_FREE = ["말해 줘서 고마워. 많이 무거웠지","그 마음, 이제 내가 들고 있을게","후회가 남는 건 그만큼 사랑했다는 거야","나는 너를 탓한 적 한 번도 없어"];
const REGRETS = [
  {id:"late",  label:"더 일찍 알아챘다면", lines:["아픈 거 숨긴 건 나야. 너한테 걱정 주기 싫었어","너는 알게 된 순간부터 최선을 다했어","그때 너는 할 수 있는 걸 다 했어. 나 다 봤어"]},
  {id:"choice",label:"그 결정이 맞았을까", lines:["그건 나를 많이 사랑해서 한 결정이야","나 이제 하나도 안 아파. 정말이야","가장 힘든 선택을 대신 해 줘서 고마워"]},
  {id:"absent",label:"마지막에 곁에 없었어", lines:["난 네 냄새랑 목소리 늘 기억하고 있었어","마지막 순간보다 같이 산 날들이 훨씬 길어","난 혼자라고 느낀 적 없어. 네 사랑이 있었으니까"]},
  {id:"more",  label:"더 잘해 줄걸", lines:["나는 그때도 충분히 행복했어","산책, 밥, 쓰다듬어 준 손, 다 기억해","너는 나한테 최고의 보호자였어"]},
  {id:"angry", label:"화냈던 날이 떠올라", lines:["그런 날도 있었지. 근데 난 금방 잊었어","나는 너 미워한 적 한 번도 없어","그다음 날도 넌 날 꼭 안아 줬잖아"]},
  {id:"busy",  label:"바빠서 못 놀아 줬어", lines:["네가 돌아오는 소리만으로도 좋았어","기다리는 것도 나한텐 행복이었어","같이 있던 시간, 짧지 않았어"]}
];
/* letters that carry regret get a gentle answer; matched here on the device, nothing is sent anywhere */
const REGRET_KEYS = [
  {id:"choice", keys:["결정","안락사","보내준","보낸 게","보낸게","선택","수술","치료를 그만","치료 그만"]},
  {id:"late",   keys:["일찍","알아채","알아차","몰랐","눈치","늦게","빨리 병원","병원에 데려"]},
  {id:"absent", keys:["곁에 없","옆에 없","곁을 못","옆을 못","마지막","혼자 보내","혼자 가게","못 지켜","지켜주지"]},
  {id:"angry",  keys:["화내","화냈","혼내","혼냈","소리 질","소리질","짜증"]},
  {id:"busy",   keys:["바빠","바빴","바쁘","못 놀아","놀아주지","혼자 두","혼자 있게","외롭게"]},
  {id:"more",   keys:["더 잘해","잘해줄","잘해 줄","못해준","못 해준","못해 준","해준 게 없","해 준 게 없","부족"]},
  {id:"any",    keys:["미안","후회","잘못","죄책","탓","했더라면","했다면","할걸","할 걸","줄걸","줄 걸"]}
];
function findRegret(text){ const t = text.replace(/\s+/g, " "); for (const g of REGRET_KEYS) if (g.keys.some(k => t.includes(k))) return g.id; return null; }

function gather(after){
  const n = ents.length;
  ents.forEach((e, i) => {
    if (e.state === "sleep") setState(e, "idle");
    goTo(e, W*0.5 + (i - (n-1)/2)*Math.min(70, 17*P), dMin + (dMax-dMin)*(0.72 + (i%2)*0.08), false, () => { sitFront(e, 9); if (after) after(e, i); });
  });
}
function chooseMood(m){
  G.moods[today()] = m.id;
  const keys = Object.keys(G.moods).sort(); if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(k => delete G.moods[k]);
  closeVeil("moodVeil"); save();
  const speaker = pick(ents), lines = [...m.lines];
  gather((e) => { e.happy = 1; });
  lines.forEach((ln, i) => setTimeout(() => say(i === 0 ? speaker : pick(ents), ln, 4.2), 1600 + i*4600));
  if (m.id === "sad" || m.id === "tired") setTimeout(() => setHint("마음 버튼에서 '같이 숨 쉬기'를 해 볼 수 있어요"), 1600 + lines.length*4600);
}
let breathing = false, breathVal = 0.55, breathTimers = [];
function startBreath(){
  closeVeil("moodVeil"); setBallMode(false);
  breathing = true; breathVal = 0.55; $("breathe").hidden = false; $("dock").hidden = true;
  gather();
  const ring = $("ring"), txt = $("breatheText"), sub = $("breatheSub");
  const phases = [["들이쉬어요", 4, 1], ["잠깐 멈춰요", 2, 1], ["천천히 내쉬어요", 6, 0.55]], cycles = 5;
  let t0 = 1200;
  txt.textContent = "편하게 앉아요"; sub.textContent = "아이들이 같이 숨 쉬어요"; ring.style.transitionDuration = "0s"; ring.style.transform = "scale(.55)";
  for (let c=0;c<cycles;c++) for (const [label, sec, sc] of phases) {
    breathTimers.push(setTimeout(() => {
      txt.textContent = label; sub.textContent = `${c+1} / ${cycles}`;
      ring.style.transitionDuration = sec + "s"; ring.style.transform = `scale(${sc})`;
      const from = breathVal, start = performance.now();
      const step = () => { if (!breathing) return; const u = Math.min(1, (performance.now()-start)/(sec*1000)); breathVal = from + (sc - from)*(0.5 - Math.cos(u*Math.PI)/2); if (u < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      if (sc === 1 && label === phases[0][0]) tone(PENT[c % PENT.length], 0, sec, 0.025, "sine");
    }, t0));
    t0 += sec*1000;
  }
  breathTimers.push(setTimeout(() => endBreath(true), t0 + 300));
}
function endBreath(done){
  breathTimers.forEach(clearTimeout); breathTimers = []; breathing = false; breathVal = 0.55;
  $("breathe").hidden = true; $("dock").hidden = false;
  if (done) { G.breaths++; addWarmth(3); save(); const e = pick(ents); setTimeout(() => say(e, pick(["잘했어. 여기까지 온 것만으로 충분해","조금 편해졌어? 나도 그래","언제든 같이 숨 쉬자"]), 5), 400); ents.forEach(x => x.happy = 1.2); }
}
$("moodBtn").addEventListener("click", () => { setBallMode(false); renderMood(); openVeil("moodVeil"); });
$("breatheBtn").addEventListener("click", startBreath);
$("breatheStop").addEventListener("click", () => endBreath(false));

/* ---------- sound ---------- */
let AC = null, master = null, soundOn = false, ambT = null;
function initAudio(){
  if (AC) return;
  const Ctor = window.AudioContext || window.webkitAudioContext; if (!Ctor) return;
  AC = new Ctor(); master = AC.createGain(); master.gain.value = 0.5;
  const delay = AC.createDelay(); delay.delayTime.value = 0.38; const fb = AC.createGain(); fb.gain.value = 0.32; const wet = AC.createGain(); wet.gain.value = 0.35;
  master.connect(AC.destination); master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(AC.destination);
}
const PENT = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
function tone(freq, when, dur, vol, type){
  if (!AC || !soundOn) return;
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type || "triangle"; o.frequency.value = freq;
  const t0 = AC.currentTime + (when||0);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol||0.06, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur||1.4));
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + (dur||1.4) + 0.05);
}
function sfx(kind){
  if (!AC || !soundOn) return;
  if (kind==="pet") { tone(523.25,0,0.5,0.05,"square"); tone(659.25,0.08,0.6,0.04,"square"); }
  else if (kind==="glow") tone(pick([783.99,880,1046.5]),0,0.6,0.04,"square");
  else if (kind==="catch") [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*0.07,0.5,0.04,"square"));
  else if (kind==="throw") tone(392,0,0.25,0.035,"square");
  else if (kind==="treat") { tone(440,0,0.3,0.04,"square"); tone(587.33,0.1,0.35,0.04,"square"); }
  else if (kind==="star") [392,493.88,587.33,783.99].forEach((f,i)=>tone(f,i*0.18,2,0.045));
  else if (kind==="unlock") [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*0.1,0.8,0.04,"square"));
  else if (kind==="chime") for (let i=0;i<5;i++) tone(pick([1046.5,1174.66,1318.5,1567.98]), i*rand(0.12,0.3), 2, 0.02, "sine");
}
let purr = null;
function purrStart(e){
  if (!AC || !soundOn || purr || petOf(e).species !== "cat") return;
  const o = AC.createOscillator(), lp = AC.createBiquadFilter(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
  o.type = "sawtooth"; o.frequency.value = 46; lp.type = "lowpass"; lp.frequency.value = 200;
  lfo.frequency.value = 23; lg.gain.value = 0.028; g.gain.value = 0;
  lfo.connect(lg); lg.connect(g.gain); o.connect(lp); lp.connect(g); g.connect(master); o.start(); lfo.start();
  g.gain.setTargetAtTime(0.032, AC.currentTime, 0.15); purr = {o, lfo, g};
}
function purrStop(){ if (!purr) return; const p = purr; purr = null; p.g.gain.setTargetAtTime(0, AC.currentTime, 0.15); setTimeout(() => { try { p.o.stop(); p.lfo.stop(); } catch(err) {} }, 700); }
function ambient(){ if (!soundOn) return; tone(pick(PENT)/(Math.random()<0.4 ? 2 : 1), 0, 2.8, 0.03); if (Math.random()<0.35) tone(pick(PENT), 0.6, 2.2, 0.02); ambT = setTimeout(ambient, rand(2400, 5200)); }
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn; $("soundBtn").setAttribute("aria-pressed", String(soundOn)); $("soundBtn").setAttribute("aria-label", soundOn ? "소리 끄기" : "잔잔한 소리 켜기");
  if (soundOn) { initAudio(); AC && AC.resume && AC.resume(); clearTimeout(ambT); ambient(); } else clearTimeout(ambT);
});

const SCENE_ART={"backgrounds":{"day":"assets/asset-29.webp","dawn":"assets/asset-30.webp","dusk":"assets/asset-31.webp","night":"assets/asset-32.webp"},"props":{"entries":{"cushion":[8,69,304,181],"lantern":[403,8,154,304],"tree":[648,11,304,297],"stone":[992,90,256,139],"mailbox":[1335,33,210,254],"pond":[1608,76,304,167],"house":[8,353,304,253],"sunflower":[328,340,304,280],"bench":[648,370,304,219],"fence":[968,390,304,179],"flowers":[1289,349,301,261],"tulip":[1641,340,237,280],"bowl-empty":[8,697,304,206],"bowl-full":[328,692,304,215],"ball":[689,687,221,225],"envelope":[970,687,300,225],"cake":[1306,648,267,304],"balloon":[1616,662,287,275],"poop":[30,989,260,261],"water":[328,1017,304,206],"photo-frame":[663,968,274,304],"butterfly":[968,997,304,245],"rainbow":[1288,1012,304,215],"heart":[1625,1003,270,233]},"url":"assets/asset-33.webp"}};
const sceneBackgrounds=new Map(),sceneProps=new Map(),sceneBitCache=new Map();
const PROP_DECORS={cushion:'cushion',lantern:'lantern',tree:'tree',stone:'stone',mailbox:'mailbox',pond:'pond',house:'house',sun:'sunflower',bench:'bench'};
function drawArtImage(context,source,...args){
 if(source&&source.artCanvas){
  context.save();context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
  if(args.length===2)context.drawImage(source.artCanvas,...args,source.width,source.height);else context.drawImage(source.artCanvas,...args);
  context.restore();
 }else context.drawImage(source,...args);
}
function roundedPath(x,a,b,w,h,r){
 r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();
}
function artFit(context,image,x,y,w,h){const s=Math.min(w/image.width,h/image.height);context.drawImage(image,x+(w-image.width*s)/2,y+(h-image.height*s)/2,image.width*s,image.height*s);}
function decor(key,w,h,ax,ay,fn){
 let d=decCache.get(key);if(d)return d;
 const propName=PROP_DECORS[Object.keys(PROP_DECORS).find(k=>key.startsWith(k))];
 if(!propName)return legacyDecor(key,w,h,ax,ay,fn);
 if(propName==='tree'){w=50;h=50;ax=25;ay=48;}
 if(propName==='cushion'){h=16;ay=14;}
 if(propName==='bench'){w=42;h=24;ax=21;ay=23;}
 if(propName==='pond'){w=50;h=28;ax=25;ay=25;}
 const c=clayCanvas(w*12,h*12),x=c.getContext('2d'),image=sceneProps.get(propName);
 if(image){
  const s=Math.min((w-2)*12/image.width,(h-2)*12/image.height);
  const anchor=image.groundAnchor==null?.5:image.groundAnchor;
  let xx=ax*12-image.width*s*anchor;xx=clamp(xx,0,c.width-image.width*s);
  x.drawImage(image,xx,ay*12-image.height*s,image.width*s,image.height*s);
 }
 d={cv:c,w,h,ax,ay};decCache.set(key,d);return d;
}
function place(d,sx,sy,k){
 if(placingKey)decoHits.push({key:placingKey,x:sx-d.ax*k,y:sy-d.ay*k,w:(d.w||d.cv.width)*k,h:(d.h||d.cv.height)*k,fx:sx,fd:sy-groundY});
 mctx.save();mctx.imageSmoothingEnabled=true;mctx.imageSmoothingQuality='high';
 mctx.drawImage(d.cv,sx-d.ax*k,sy-d.ay*k,(d.w||d.cv.width)*k,(d.h||d.cv.height)*k);mctx.restore();
}
function frameDec(p){
 const image=photoImg(p);if(!image.complete||!image.naturalWidth)return null;
 const key='clay-photo-'+p.id+'-'+p.photo.length;let d=decCache.get(key);if(d)return d;
 const c=clayCanvas(240,432),x=c.getContext('2d');x.scale(12,12);
 const post=x.createLinearGradient(8,0,12,0);post.addColorStop(0,'#b5896a');post.addColorStop(.5,'#e7c6a4');post.addColorStop(1,'#b48769');
 x.fillStyle=post;roundedPath(x,9,22,2,13,.8);x.fill();roundedPath(x,5,34,10,1.1,.5);x.fill();
 const rim=x.createLinearGradient(1,3,19,26);rim.addColorStop(0,'#fff4dd');rim.addColorStop(.45,'#eacba9');rim.addColorStop(1,'#bd9479');
 x.fillStyle=rim;roundedPath(x,1,3,18,24,2);x.fill();
 x.save();roundedPath(x,3,5,14,20,.8);x.clip();const s=Math.max(14/image.naturalWidth,20/image.naturalHeight);x.drawImage(image,3+(14-image.naturalWidth*s)/2,5+(20-image.naturalHeight*s)/2,image.naturalWidth*s,image.naturalHeight*s);x.restore();
 x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.5;roundedPath(x,1.6,3.6,16.8,22.8,1.5);x.stroke();
 d={cv:c,w:20,h:36,ax:10,ay:35};decCache.set(key,d);return d;
}
function clayBit(name,args,logical){
 const key=name+JSON.stringify(args);if(sceneBitCache.has(key))return sceneBitCache.get(key);
 let prop={ball:'ball',bowl:args[0]?'bowl-full':'bowl-empty',poop:'poop',env:'envelope',cake:'cake',balloon:'balloon',flower:'flowers',tulip:'tulip',fly:'butterfly',heart:'heart'}[name];
 const w=logical.width,h=logical.height,c=clayCanvas(w*16,h*16),x=c.getContext('2d');x.scale(16,16);
 const asset=sceneProps.get(prop);
 if(asset){
  const flap=name==='fly'&&args[1]? .55:1;artFit(x,asset,w*(1-flap)/2,0,w*flap,h);
 }else{
  const gradient=(a,b)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
  x.lineCap='round';x.lineJoin='round';
  if(['star','twinkle','spark'].includes(name)){
   x.fillStyle=gradient(name==='spark'?args[0]:'#fff7d5',name==='spark'?args[0]:'#eac680');x.beginPath();
   const n=name==='star'?10:8;for(let i=0;i<n;i++){const a=-Math.PI/2+i*Math.PI*2/n,r=(i%2?.25:.48)*Math.min(w,h);const xx=w/2+Math.cos(a)*r,yy=h/2+Math.sin(a)*r;i?x.lineTo(xx,yy):x.moveTo(xx,yy);}x.closePath();x.fill();
  }else if(name==='heart'){
   x.fillStyle=gradient('#ffcdd9','#d989a6');x.beginPath();x.moveTo(w*.5,h*.91);x.bezierCurveTo(-w*.25,h*.4,w*.10,-h*.17,w*.5,h*.2);x.bezierCurveTo(w*.90,-h*.17,w*1.25,h*.4,w*.5,h*.91);x.fill();
  }else if(name==='seed'){
   x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=.28;for(let i=0;i<8;i++){const a=i*Math.PI/4;x.beginPath();x.moveTo(w/2,h/2);x.lineTo(w/2+Math.cos(a)*w*.42,h/2+Math.sin(a)*h*.42);x.stroke();}x.fillStyle='#fffdf1';x.beginPath();x.arc(w/2,h/2,.6,0,Math.PI*2);x.fill();
  }else if(name==='bone'){
   x.fillStyle=gradient('#fff1d8','#d6b68e');roundedPath(x,w*.16,h*.30,w*.68,h*.4,h*.2);x.fill();for(const xx of [.18,.82])for(const yy of [.27,.73]){x.beginPath();x.ellipse(w*xx,h*yy,w*.14,h*.25,0,0,Math.PI*2);x.fill();}
  }else if(name==='fish'){
   x.fillStyle=gradient('#d9ecf5','#8eb9d0');x.beginPath();x.ellipse(w*.42,h*.5,w*.35,h*.40,0,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(w*.68,h*.5);x.lineTo(w*.97,h*.12);x.lineTo(w*.97,h*.88);x.closePath();x.fill();x.fillStyle='#697a85';x.beginPath();x.arc(w*.19,h*.43,.25,0,Math.PI*2);x.fill();
  }else if(name==='carrot'){
   x.fillStyle=gradient('#f8bc83','#df9054');x.beginPath();x.moveTo(w*.22,h*.3);x.quadraticCurveTo(w*.50,h*1.3,w*.78,h*.3);x.closePath();x.fill();x.strokeStyle='#91aa77';x.lineWidth=.7;for(const xx of [.23,.5,.77]){x.beginPath();x.moveTo(w/2,h*.32);x.lineTo(w*xx,h*.04);x.stroke();}
  }else if(name==='chute'){
   x.fillStyle=gradient('#ffe0e6','#dda7be');x.beginPath();x.ellipse(w/2,h*.93,w*.46,h*.9,0,Math.PI,Math.PI*2);x.lineTo(w*.94,h*.93);x.closePath();x.fill();
  }else{
   x.fillStyle=gradient('#f6dbe6','#d9b9d4');x.beginPath();x.ellipse(w/2,h/2,w*.45,h*.43,0,0,Math.PI*2);x.fill();
  }
 }
 const result={width:w,height:h,artCanvas:c};if(sceneBitCache.size>160)sceneBitCache.clear();sceneBitCache.set(key,result);return result;
}
function drawFence(){
 const image=sceneProps.get('fence');if(!image)return;
 const k=P*ds(dMin-3),h=14*k,w=h*image.width/image.height,y=groundY+dMin-3;
 mctx.save();mctx.imageSmoothingEnabled=true;for(let x=-w*.25;x<W;x+=w*.94)mctx.drawImage(image,x,y-h,w,h);mctx.restore();
}
function drawBackdrop(pal,h,t){
 tintTop=new Array(LW).fill(Math.round(groundY/P));
 sunPos=NIGHT<.7?{x:W*.22/P,y:groundY*.18/P}:null;
}
function sceneTimeLayers(h){
 const stops=[[0,'night'],[5,'night'],[7,'dawn'],[10,'day'],[16,'day'],[19,'dusk'],[21,'night'],[24,'night']];
 for(let i=1;i<stops.length;i++)if(h<=stops[i][0])return [stops[i-1][1],stops[i][1],(h-stops[i-1][0])/(stops[i][0]-stops[i-1][0])];
 return ['night','night',0];
}
function drawClayBackground(h,t){
 const [a,b,blend]=sceneTimeLayers(h),first=sceneBackgrounds.get(a)||sceneBackgrounds.get(b),second=sceneBackgrounds.get(b)||first;
 const draw=image=>{const s=Math.max(W/image.width,H/image.height),y0=groundY-image.height*s*.56;mctx.drawImage(image,(W-image.width*s)/2,y0,image.width*s,image.height*s);if(camLift>0.5)skyAbove(image,y0);return;mctx.drawImage(image,(W-image.width*s)/2,y0,image.width*s,image.height*s);};
 mctx.save();mctx.imageSmoothingEnabled=true;mctx.imageSmoothingQuality='high';
 const g=mctx.createLinearGradient(0,0,0,H);g.addColorStop(0,NIGHT>.5?'#49405f':'#d6e4ed');g.addColorStop(.56,NIGHT>.5?'#a0b4b5':'#eff2e4');g.addColorStop(1,NIGHT>.5?'#71958d':'#c3d8ad');mctx.fillStyle=g;mctx.fillRect(0,0,W,H);
 if(first)draw(first);if(second&&second!==first){mctx.globalAlpha=blend;draw(second);mctx.globalAlpha=1;}
 // The painted sky supplies its main clouds; two faint live puffs retain the
 // original slow cloud drift without covering the date card or the yard.
 mctx.globalAlpha=.24*(1-NIGHT*.4);
 for(const c of clouds.slice(0,2))for(const [dx,dy,k]of PUFF){
  const r=c.r*P,xx=c.x*P+dx*r,yy=c.y*P+dy*r;
  const g=mctx.createRadialGradient(xx-r*.2,yy-r*.3,0,xx,yy,r*k);g.addColorStop(0,NIGHT>.5?'#e5dcec':'#fffaf0');g.addColorStop(1,NIGHT>.5?'#c8b7dc':'#f0dfd8');
  mctx.fillStyle=g;mctx.beginPath();mctx.ellipse(xx,yy,r*k,r*k*.6,0,0,Math.PI*2);mctx.fill();
 }
 mctx.globalAlpha=1;
 if(has('rainbow')&&NIGHT<.6){
  const image=sceneProps.get('rainbow');if(image){const w=Math.min(W*.60,H*.64),hh=w*image.height/image.width;mctx.globalAlpha=.32*(1-NIGHT);mctx.drawImage(image,W*.62-w/2,groundY-hh+4,w,hh);mctx.globalAlpha=1;}
 }
 const paintStar=(x,y,size,opacity)=>{
  glow(mctx,x,y,size*4,'255,225,178',opacity*.3);mctx.globalAlpha=opacity;const star=BM.star();drawArtImage(mctx,star,x-size/2,y-size/2,size,size);mctx.globalAlpha=1;
 };
 const now=performance.now();
 for(const st of (lanternMode?[]:G.stars)){if(rising&&rising.star===st)continue;const born=bornAt.get(st.id),opacity=(.6+.4*NIGHT)*(born?clamp((now-born)/1200,0,1):1);paintStar(st.x*LW*P,st.y*LH*P,P*5,opacity);}
 if(rising&&!rising.hold){const e=1-Math.pow(1-rising.t,3);paintStar(lerp(rising.x0,rising.x1,e),lerp(rising.y0,rising.y1,e)-Math.sin(e*Math.PI)*40*S,P*5,1);}
 mctx.restore();
}
function drawRays(t){
 if(!sunPos||NIGHT>.7)return;
 glow(mctx,sunPos.x*P,sunPos.y*P,H*.5,'255,238,213',(.045+.006*Math.sin(t*.18))*(1-NIGHT));
}
function drawOverlayFx(){
 for(const g of glows){const a=g.life*(.6+.4*Math.sin(g.p*3));glow(mctx,g.x,g.y,7*P,'255,243,194',a*.5);mctx.save();mctx.globalAlpha=g.life;const s=BM.seed();drawArtImage(mctx,s,g.x-s.width*P/2,g.y-s.height*P/2,s.width*P,s.height*P);mctx.restore();}
 for(const p of petals){mctx.save();mctx.translate(p.x,p.y);mctx.rotate(Math.sin(p.ph)*.8);mctx.fillStyle=NIGHT>.6?'#e6d9ed':p.c;mctx.globalAlpha=.8;mctx.beginPath();mctx.ellipse(0,0,P*p.z*1.2,P*p.z*.65,0,0,Math.PI*2);mctx.fill();mctx.restore();}
 for(const s of sparks){mctx.save();mctx.globalAlpha=clamp(s.t*1.6,0,1);const b=BM.spark(s.c);drawArtImage(mctx,b,s.x-b.width*P/2,s.y-b.height*P/2,b.width*P,b.height*P);mctx.restore();}
 for(const h of hearts){mctx.save();mctx.globalAlpha=clamp(h.t,0,1);const b=BM.heart();drawArtImage(mctx,b,h.x-b.width*P/2,h.y,b.width*P,b.height*P);mctx.restore();}
}
function drawBubble(){
 if(lanternMode)return;
 if(!bubble||!bubble.e||bubble.e._top==null||breathing)return;
 const e=bubble.e;let fs=P>=3?18:15;mctx.font=`500 ${fs}px ${FONT}`;while(fs>11&&mctx.measureText(bubble.text).width+24>W-24){fs--;mctx.font=`500 ${fs}px ${FONT}`;}
 const w=mctx.measureText(bubble.text).width+24,h=fs+20,bx=clamp(e.x-w/2,10,W-w-10),by=Math.max(82,e._top-h-12);
 mctx.save();mctx.globalAlpha=clamp(bubble.t*2,0,1);mctx.shadowColor='rgba(87,64,90,.12)';mctx.shadowBlur=16;mctx.shadowOffsetY=5;mctx.fillStyle='#fffaf3';roundedPath(mctx,bx,by,w,h,15);mctx.fill();mctx.shadowBlur=0;mctx.shadowOffsetY=0;
 mctx.beginPath();mctx.moveTo(clamp(e.x,bx+15,bx+w-15)-5,by+h-1);mctx.quadraticCurveTo(e.x,by+h+10,clamp(e.x,bx+15,bx+w-15)+5,by+h-1);mctx.fill();mctx.fillStyle='#765e77';mctx.textBaseline='middle';mctx.fillText(bubble.text,bx+12,by+h/2);mctx.restore();
}
function initSceneArt(){
 const old={...BM};for(const name of Object.keys(BM))BM[name]=(...args)=>clayBit(name,args,old[name](...args));
 const nowSky=sceneTimeLayers(hourNow()).slice(0,2);
 for(const [key,url]of Object.entries(SCENE_ART.backgrounds)){
  const go=()=>{const im=new Image();im.onload=()=>{sceneBackgrounds.set(key,im);};im.src=url;};
  if(nowSky.includes(key))go();else setTimeout(go,5000);   // other times of day aren't needed right away
 }
 const im=new Image();im.onload=()=>{
  for(const [key,[sx,sy,w,h]]of Object.entries(SCENE_ART.props.entries)){
   const c=clayCanvas(w,h),x=c.getContext('2d');x.drawImage(im,sx,sy,w,h,0,0,w,h);
   const p=x.getImageData(0,Math.max(0,Math.floor(h*.86)),w,Math.max(1,h-Math.floor(h*.86))).data;let sum=0,weight=0;for(let i=0;i<p.length/4;i++)if(p[i*4+3]>200){sum+=(i%w)*p[i*4+3];weight+=p[i*4+3];}c.groundAnchor=weight?sum/weight/w:.5;sceneProps.set(key,c);
  }
  sceneBitCache.clear();decCache.clear();if(!$('decoVeil').hidden)renderDeco();
 };im.src=SCENE_ART.props.url;
}

/* Calendar dates, independent of timezone offsets / daylight saving time. */
const DAY_KINDS={met:{label:'만난 날',since:'만난 지',until:'만날 날까지'},born:{label:'태어난 날',since:'태어난 지',until:'태어날 날까지'},star:{label:'별이 된 날',since:'별이 된 지',until:'기억하는 날까지'},day:{label:'기억하는 날',since:'기억하는 날부터',until:'기억하는 날까지'}};
function calendarDay(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number);if(y<100)return null;
 const stamp=Date.UTC(y,m-1,d),date=new Date(stamp);
 return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?stamp/86400000:null;
}
function petDates(p){
 if(!p.dates||typeof p.dates!=='object')p.dates={};
 for(const key of ['born','met','star'])if(calendarDay(p.dates[key])==null)p.dates[key]='';
 return p.dates;
}
function dayWidgetModel(p,now=today(),requested){
 const dates={...petDates(p),day:p.day||''},available=Object.keys(DAY_KINDS).filter(k=>calendarDay(dates[k])!=null);
 const selected=requested||p.dayKind,kind=available.includes(selected)?selected:available.find(k=>k==='met')||available[0];
 if(!kind)return {empty:true,available,kind:'met',label:'우리의 날짜',title:p.name+'의 소중한 날',number:'—',prefix:'',caption:'태어난 날이나 처음 만난 날을 남겨 주세요'};
 const elapsed=calendarDay(now)-calendarDay(dates[kind]),info=DAY_KINDS[kind];
 const upcoming=elapsed<0,number=Math.abs(elapsed).toLocaleString('ko-KR');
 const milestone=!upcoming&&elapsed>0&&elapsed%100===0;
 const next=(Math.floor(Math.max(0,elapsed)/100)+1)*100;
 let caption=upcoming?dates[kind].replaceAll('-','.'):milestone?'오늘은 '+number+'일 기념일이에요':elapsed===0?'오늘부터 차곡차곡':next.toLocaleString('ko-KR')+'일까지 D−'+(next-elapsed).toLocaleString('ko-KR');
 return {empty:false,available,kind,date:dates[kind],elapsed,milestone,label:info.label,title:p.name+' · '+(upcoming?info.until:info.since),number,prefix:upcoming?'D−':'D+',caption};
}
let dayWidgetDate='',daySpecialDate='';
function renderDday(){
 const root=$('dayWidget');if(!root)return;
 const p=fam().find(p=>p.id===G.widgetPetId)||fam()[0];if(!p)return;
 const model=dayWidgetModel(p);dayWidgetDate=today();
 $('dayTitle').textContent=model.title;$('dayPrefix').textContent=model.prefix;$('dayCount').textContent=model.number;
 $('dayUnit').textContent=model.empty?'':'일';$('dayCaption').textContent=model.caption;
 $('dayEdit').textContent=model.empty?'날짜 정하기':'날짜 편집';root.dataset.milestone=String(!!model.milestone);
 const names=$('dayPets');names.textContent='';names.hidden=fam().length<2;
 for(const pet of fam()){
  const b=document.createElement('button');b.type='button';b.className='day-pet';b.textContent=pet.name;
  b.setAttribute('aria-pressed',String(pet.id===p.id));b.addEventListener('click',()=>{G.widgetPetId=pet.id;renderDday();save();});names.append(b);
 }
 const kinds=$('dayKinds');kinds.textContent='';
 for(const kind of ['met','born','star']){
  const b=document.createElement('button');b.type='button';b.className='day-kind';b.textContent=DAY_KINDS[kind].label;
  b.setAttribute('aria-pressed',String(model.kind===kind&&!model.empty));
  b.addEventListener('click',()=>{if(!petDates(p)[kind]){editDayDates(p,kind);return;}p.dayKind=kind;renderDday();save();});kinds.append(b);
 }
 const photo=$('dayPhoto'),avatar=$('dayAvatar');photo.hidden=!p.photo;avatar.hidden=!!p.photo;
 if(p.photo){photo.src=p.photo;photo.alt=p.name+' 사진';}
 else{
  const x=avatar.getContext('2d');x.clearRect(0,0,avatar.width,avatar.height);x.imageSmoothingEnabled=true;
  x.drawImage(getSprite(p.species,p.breed,'front',0,'n',1).cv,0,0,avatar.width,avatar.height);
 }
}
function editDayDates(p,kind){
 closeVeil('settingsVeil');
 openSetup();selIdx=Math.max(0,draftFam.findIndex(item=>item.id===p.id));renderSetup();
 const id={met:'petMet',born:'petBorn',star:'petStar',day:'petDay'}[kind]||'petMet';
 const b=document.querySelector('.date-btn[data-for="'+id+'"]');if(b){b.scrollIntoView&&b.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});setTimeout(()=>openDatePicker(id),RM?0:380);}
}
function syncDayFields(){
 const p=cur(),dates=petDates(p);$('petBorn').value=dates.born;$('petMet').value=dates.met;$('petStar').value=dates.star;
}
function isPetDay(p,now=today()){
 const md=now.slice(5),dates=petDates(p);
 if(p.day&&p.day.slice(5)===md)return true;
 for(const key of ['born','met','star'])if(dates[key]&&dates[key].slice(5)===md)return true;
 for(const key of ['born','met','star'])if(dates[key]){const days=calendarDay(now)-calendarDay(dates[key]);if(days>0&&days%100===0)return true;}
 return false;
}
function initDayWidget(){
 daySpecialDate=today();
 for(const [id,key]of [['petBorn','born'],['petMet','met'],['petStar','star']])$(id).addEventListener('input',()=>{const p=cur();petDates(p)[key]=$(id).value||'';if($(id).value)p.dayKind=key;});
 $('dayEdit').addEventListener('click',()=>{const p=fam().find(p=>p.id===G.widgetPetId)||fam()[0];editDayDates(p,dayWidgetModel(p).kind);});
 renderDday();
}

function decoPreview(key){const prop={flowers:'flowers',rainbow:'rainbow',butterfly:'butterfly',fence:'fence',cushion:'cushion',lantern:'lantern',tree:'tree',mailbox:'mailbox',pond:'pond',house:'house',sunflower:'sunflower',bench:'bench'}[key];const image=sceneProps.get(prop),c=clayCanvas(720,540);if(image)artFit(c.getContext('2d'),image,12,12,696,516);return {width:72,height:54,artCanvas:c};}
function renderHud(){legacyRenderHud();renderDday();}

/* ---------- boot ---------- */
function afterLoad(){ if (G.set && setupOpen && $("setupCancel").hidden) { setupOpen = false; closeVeil("setupVeil"); $("dock").hidden = false; } syncEnts(); recordVisit(); setupEnvelope(); checkSpecial(); renderHud(); }
window.addEventListener("resize", resize);
{ // keep the canvas matched to the real visible screen (Safari toolbars, rotation, keyboard)
  const fitVisible = () => {
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
  fitVisible();
  let rz = null; const later = () => { clearTimeout(rz); rz = setTimeout(() => { fitVisible(); resize(); window.scrollTo(0, 0); }, 120); };
  if (window.visualViewport) window.visualViewport.addEventListener("scroll", later);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", later);
  window.addEventListener("resize", later); window.addEventListener("pageshow", later); document.addEventListener("visibilitychange", () => { if (!document.hidden) later(); });
  window.addEventListener("orientationchange", () => { later(); setTimeout(later, 450); });
  document.addEventListener("focusout", (ev) => { if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) setTimeout(() => window.scrollTo(0, 0), 60); });
}
syncEnts();
resize();
ents.forEach((e, i) => { const narrow=W<600&&ents.length>2, slots=[[.28,.22],[.72,.22],[.5,.51],[.25,.82],[.75,.82]]; const sl = slots[i] || [rand(0.15,0.85), rand(0.2,0.85)]; e.x = narrow?W*sl[0]:W*clamp(0.5 + (i - (ents.length-1)/2)*(ents.length > 5 ? 0.085 : 0.17), 0.06, 0.94); e.depth = dMin + (dMax-dMin)*(narrow?sl[1]:(0.45+(i%2)*0.2)); });
renderHud();
if (G.set) {
  closeVeil("setupVeil");
  const away = prevVisit ? (Date.now() - prevVisit)/3600000 : 0;
  ents.forEach(e => sitFront(e, rand(3,6)));
  recordVisit(); setupEnvelope(); checkSpecial();
  setTimeout(() => say(pick(ents), away > 6 ? pick(["왔구나! 반가워","오늘도 와 줘서 고마워"]) : pick(["또 왔네, 좋다","같이 있자"]), 4), 700);
  setHint("아이를 살짝 눌러 쓰다듬어 주세요");
  if (!G.guideSeen) setTimeout(openGuide, 900);
} else { openSetup(); $("dock").hidden = true; setHint(""); setTimeout(() => say(ents[0], "안녕!", 3), 900); }
for (let i=0;i<4;i++) spawnGlow();
if (document.fonts && document.fonts.load) document.fonts.load(`16px ${FONT}`).catch(()=>{});
initClay();
initSceneArt();
initDayWidget();
requestAnimationFrame(frame);


/* ---------- wheel date picker (year · month · day) ---------- */
let dpState = null;
const dpDays = (y, m) => new Date(y, m, 0).getDate();
const dpPad = (n) => String(n).padStart(2, "0");
function dpLabel(v){ if (!v) return "날짜 고르기"; const [y,m,d] = v.split("-").map(Number); const w = DOW[new Date(y, m-1, d).getDay()]; return `${y}년 ${m}월 ${d}일 (${w})`; }
function refreshDateBtns(){
  document.querySelectorAll(".date-btn").forEach(b => { const v = ($(b.dataset.for) || {}).value || ""; b.querySelector(".dv").textContent = dpLabel(v); b.classList.toggle("empty", !v); });
}
function dpFill(col, items, sel){
  col.textContent = "";
  items.forEach((it, i) => { const d = document.createElement("div"); d.className = "dp-item"; d.textContent = it.label; d.dataset.i = i; d.addEventListener("click", () => col.scrollTo({top: i*DP_ROW, behavior: RM ? "auto" : "smooth"})); col.appendChild(d); });
  col.scrollTop = sel*DP_ROW; dpMark(col);
}
function dpMark(col){ const i = Math.round(col.scrollTop/DP_ROW); col.querySelectorAll(".dp-item").forEach((el, k) => el.classList.toggle("on", k === i)); return i; }
function dpRead(){
  const s = dpState, yi = Math.round($("dpY").scrollTop/DP_ROW), mi = Math.round($("dpM").scrollTop/DP_ROW);
  s.y = s.years[clamp(yi, 0, s.years.length-1)]; s.m = clamp(mi, 0, 11) + 1;
  const n = dpDays(s.y, s.m), di = Math.round($("dpD").scrollTop/DP_ROW);
  s.d = clamp(di, 0, $("dpD").children.length - 1) + 1;
  if ($("dpD").children.length !== n) { s.d = Math.min(s.d, n); dpFill($("dpD"), Array.from({length:n}, (_,i) => ({label:(i+1)+"일"})), s.d-1); }
  const w = DOW[new Date(s.y, s.m-1, s.d).getDay()];
  $("dpMonth").textContent = `${s.y}년 ${s.m}월`;
  $("dpOk").textContent = `${s.m}월 ${s.d}일(${w}) 선택`;
}
function openDatePicker(id){
  const input = $(id), btn = document.querySelector('.date-btn[data-for="'+id+'"]'); if (!input) return;
  const now = new Date(), maxY = now.getFullYear(), years = []; for (let y = 1985; y <= maxY; y++) years.push(y);
  let y = maxY, m = now.getMonth()+1, d = now.getDate();
  if (input.value) { const a = input.value.split("-").map(Number); if (a[0]) { y = a[0]; m = a[1]; d = a[2]; } }
  if (!years.includes(y)) years.push(y), years.sort((a,b) => a-b);
  dpState = {id, years, y, m, d, btn};
  $("dpTitle").textContent = (btn && btn.dataset.label) || "날짜 선택";
  $("dpClear").hidden = !input.value;
  $("dpVeil").hidden = false;
  requestAnimationFrame(() => {
    dpFill($("dpY"), years.map(v => ({label: v+"년"})), years.indexOf(y));
    dpFill($("dpM"), Array.from({length:12}, (_,i) => ({label:(i+1)+"월"})), m-1);
    dpFill($("dpD"), Array.from({length:dpDays(y,m)}, (_,i) => ({label:(i+1)+"일"})), d-1);
    dpRead(); $("dpVeil").classList.add("on"); $("dpOk").focus({preventScroll:true});
  });
}
function closeDatePicker(){ $("dpVeil").classList.remove("on"); $("dpVeil").hidden = true; const b = dpState && dpState.btn; dpState = null; if (b) b.focus({preventScroll:true}); }
function dpCommit(value){
  const input = $(dpState.id); input.value = value; input.dispatchEvent(new Event("input", {bubbles:true})); refreshDateBtns(); closeDatePicker();
}
["dpY","dpM","dpD"].forEach(id => {
  const col = $(id); let t = null;
  col.addEventListener("scroll", () => { dpMark(col); clearTimeout(t); t = setTimeout(() => { if (dpState) dpRead(); }, 90); }, {passive:true});
  col.addEventListener("keydown", (ev) => { if (ev.key !== "ArrowUp" && ev.key !== "ArrowDown") return; ev.preventDefault(); const i = Math.round(col.scrollTop/DP_ROW) + (ev.key === "ArrowDown" ? 1 : -1); col.scrollTo({top: Math.max(0, i)*DP_ROW, behavior: RM ? "auto" : "smooth"}); });
});
$("dpOk").addEventListener("click", () => { if (!dpState) return; dpRead(); const s = dpState; dpCommit(`${s.y}-${dpPad(s.m)}-${dpPad(s.d)}`); });
$("dpClear").addEventListener("click", () => { if (dpState) dpCommit(""); });
$("dpClose").addEventListener("click", closeDatePicker);
$("dpVeil").addEventListener("pointerdown", (ev) => { if (ev.target === $("dpVeil")) closeDatePicker(); });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && dpState) { ev.stopPropagation(); closeDatePicker(); } }, true);
document.querySelectorAll(".date-btn").forEach(b => b.addEventListener("click", () => openDatePicker(b.dataset.for)));
refreshDateBtns();

/* ---------- star letter: fold into a paper plane and fly up ---------- */
function flyLetter(rect, text, ox, oy, tx, ty, done){
  const stage = document.querySelector(".stage"), sr = stage.getBoundingClientRect();
  if (RM || !rect || !rect.width) { setTimeout(done, 300); return; }
  const wrap = document.createElement("div"); wrap.className = "fly-wrap"; wrap.setAttribute("aria-hidden", "true");
  const paper = document.createElement("div"); paper.className = "fly-paper";
  const body = document.createElement("div"); body.className = "fly-text"; body.textContent = text; paper.appendChild(body);
  const fl = document.createElement("i"); fl.className = "fly-flap l"; const fr2 = document.createElement("i"); fr2.className = "fly-flap r";
  const crease = document.createElement("i"); crease.className = "fly-crease";
  paper.append(fl, fr2, crease); wrap.appendChild(paper); stage.appendChild(wrap);
  const x0 = rect.left - sr.left, y0 = rect.top - sr.top, w0 = rect.width, h0 = rect.height;
  const pw = 150, ph = 190, cx = sr.width/2, cy = Math.min(sr.height*0.46, y0 + h0/2);
  Object.assign(paper.style, {left: x0+"px", top: y0+"px", width: w0+"px", height: h0+"px"});
  const ease = "cubic-bezier(.4,0,.2,1)";
  // 1) lift into a sheet of paper
  const a1 = paper.animate([
    {left: x0+"px", top: y0+"px", width: w0+"px", height: h0+"px", borderRadius: "14px", transform: "rotate(0deg)"},
    {left: (cx-pw/2)+"px", top: (cy-ph/2)+"px", width: pw+"px", height: ph+"px", borderRadius: "6px", transform: "rotate(-4deg)"}
  ], {duration: 420, easing: ease, fill: "forwards"});
  a1.onfinish = () => {
    body.animate([{opacity: 1}, {opacity: .25}], {duration: 300, fill: "forwards"});
    // 2) the two top corners fold down to the centre line
    fl.animate([{transform: "rotateY(0deg)", opacity: 0}, {transform: "rotateY(0deg)", opacity: 1, offset: .15}, {transform: "rotateY(180deg)", opacity: 1}], {duration: 460, easing: ease, fill: "forwards"});
    const a2 = fr2.animate([{transform: "rotateY(0deg)", opacity: 0}, {transform: "rotateY(0deg)", opacity: 1, offset: .15}, {transform: "rotateY(-180deg)", opacity: 1}], {duration: 460, delay: 120, easing: ease, fill: "forwards"});
    paper.animate([{clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)"}, {clipPath: "polygon(50% 0,100% 39%,100% 100%,0 100%,0 39%)"}], {duration: 460, delay: 120, easing: ease, fill: "forwards"});
    a2.onfinish = () => {
      // 3) fold in half and turn into a plane
      const a3 = paper.animate([
        {transform: "rotate(-4deg) scaleX(1)", opacity: 1},
        {transform: "rotate(-30deg) scaleX(.18) scaleY(.75)", opacity: 0}
      ], {duration: 300, easing: "ease-in", fill: "forwards"});
      const plane = document.createElement("div"); plane.className = "fly-plane";
      plane.innerHTML = '<svg viewBox="0 0 64 44"><path d="M62 4 2 20l20 7z" fill="#fffaf4"/><path d="M62 4 22 27l4 15 8-10z" fill="#efdfe7"/><path d="M62 4 22 27l12 5z" fill="#e4cfdb"/><path d="M62 4 2 20" stroke="#e9a7ba" stroke-width="1.6"/><circle cx="20" cy="21" r="1.8" fill="#e9a7ba"/></svg>';
      wrap.appendChild(plane);
      const px0 = cx, py0 = cy, c1x = (ox + cx)/2, c1y = Math.max(py0, oy) + 30, c2x = (tx + ox)/2 - 30, c2y = (ty + oy)/2 - 60;
      const T = 1700, t0 = performance.now(); let lastDot = 0, prev = [px0, py0];
      plane.animate([{opacity: 0, transform: "translate(-50%,-50%) scale(.6)"}, {opacity: 1, transform: "translate(-50%,-50%) scale(1)"}], {duration: 220, fill: "forwards"});
      const step = (now) => {
        const u = Math.min(1, (now - t0)/T), e = u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2, v = 1 - e;
        const x = v*v*v*px0 + 3*v*v*e*c1x + 3*v*e*e*c2x + e*e*e*tx, y = v*v*v*py0 + 3*v*v*e*c1y + 3*v*e*e*c2y + e*e*e*ty + Math.sin(u*Math.PI*3)*6*(1-u);
        const ang = Math.atan2(y - prev[1], x - prev[0]); prev = [x, y];
        const sc = 1 - .55*e;
        plane.style.left = x + "px"; plane.style.top = y + "px";
        plane.firstChild.style.transform = `rotate(${ang}rad) scale(${sc})`;
        if (now - lastDot > 55 && u < .96) { lastDot = now; const dot = document.createElement("i"); dot.className = "fly-dot"; dot.style.left = x + "px"; dot.style.top = y + "px"; wrap.appendChild(dot); dot.animate([{opacity: .9, transform: "translate(-50%,-50%) scale(1)"}, {opacity: 0, transform: "translate(-50%,-50%) scale(.3)"}], {duration: 900, fill: "forwards"}).onfinish = () => dot.remove(); }
        if (u < 1) requestAnimationFrame(step);
        else { plane.animate([{opacity: 1}, {opacity: 0, transform: "translate(-50%,-50%) scale(.2)"}], {duration: 260, fill: "forwards"}).onfinish = () => wrap.remove(); done(); }
      };
      a3.onfinish = () => paper.remove();
      requestAnimationFrame(step);
    };
  };
}


/* ---------- pinch to zoom the yard only (menus stay the same size) ---------- */
(() => {
  const stage = document.querySelector(".stage"), ptrs = new Map(); let pinch = null, settle = null;
  function applyCam(){
    const w = cv.offsetWidth, h = cv.offsetHeight;
    camZ = clamp(camZ, 1, 2.6); camX = clamp(camX, w - w*camZ, 0); camY = clamp(camY, h - h*camZ, 0);
    cv.style.transformOrigin = "0 0";
    cv.style.transform = camZ === 1 ? "" : `translate(${camX}px,${camY}px) scale(${camZ})`;
  }
  function zoomAt(cx, cy, z){
    const sr = stage.getBoundingClientRect(), px = cx - sr.left, py = cy - sr.top;
    const sx = (px - camX)/camZ, sy = (py - camY)/camZ;
    camZ = clamp(z, 1, 2.6); camX = px - sx*camZ; camY = py - sy*camZ; applyCam();
  }
  function relax(){
    if (camZ > 1.06) return;
    cancelAnimationFrame(settle);
    const z0 = camZ, x0 = camX, y0 = camY, t0 = performance.now();
    const step = (now) => { const u = Math.min(1, (now - t0)/180); camZ = z0 + (1 - z0)*u; camX = x0*(1-u); camY = y0*(1-u); applyCam(); if (u < 1) settle = requestAnimationFrame(step); };
    settle = requestAnimationFrame(step);
  }
  const mid = () => { const a = [...ptrs.values()]; return {x: (a[0].x + a[1].x)/2, y: (a[0].y + a[1].y)/2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1}; };
  stage.addEventListener("pointerdown", (ev) => {
    if (ev.target !== cv || ev.pointerType === "mouse") return;
    ptrs.set(ev.pointerId, {x: ev.clientX, y: ev.clientY});
    if (ptrs.size >= 2) {
      ev.stopPropagation();
      if (typeof rub !== "undefined" && rub) { rub = null; if (typeof purrStop === "function") purrStop(); }
      const m = mid(); pinch = {d0: m.d, z0: camZ, mx: m.x, my: m.y};
    }
  }, true);
  stage.addEventListener("pointermove", (ev) => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.set(ev.pointerId, {x: ev.clientX, y: ev.clientY});
    if (pinch && ptrs.size >= 2) {
      ev.stopPropagation();
      const m = mid();
      zoomAt(pinch.mx, pinch.my, pinch.z0*m.d/pinch.d0);
      camX += m.x - pinch.mx; camY += m.y - pinch.my; pinch.mx = m.x; pinch.my = m.y; pinch.d0 = m.d; pinch.z0 = camZ; applyCam();
    }
  }, true);
  const up = (ev) => { if (!ptrs.delete(ev.pointerId)) return; if (pinch) ev.stopPropagation(); if (ptrs.size < 2) { if (pinch) relax(); pinch = null; } };
  stage.addEventListener("pointerup", up, true); stage.addEventListener("pointercancel", up, true);
  // trackpad pinch / ctrl + wheel on desktop
  stage.addEventListener("wheel", (ev) => { if (!ev.ctrlKey) return; ev.preventDefault(); zoomAt(ev.clientX, ev.clientY, camZ*Math.exp(-ev.deltaY*0.01)); clearTimeout(stage._rz); stage._rz = setTimeout(relax, 200); }, {passive: false});
  // stop the browser from zooming the whole page (Safari gesture events)
  ["gesturestart","gesturechange","gestureend"].forEach(t => document.addEventListener(t, (ev) => ev.preventDefault(), {passive: false}));
  window.addEventListener("resize", applyCam);
})();

/* ---------- how-to guide (first visit, and from settings) ---------- */
let guidePage = 0;
function renderGuide(){
  document.querySelectorAll("#guideVeil .g-page").forEach((el, i) => { el.hidden = i !== guidePage; });
  document.querySelectorAll("#guideDots i").forEach((el, i) => el.classList.toggle("on", i === guidePage));
  const last = guidePage === document.querySelectorAll("#guideVeil .g-page").length - 1;
  $("guideNext").textContent = last ? "마당으로 가기" : "다음";
  $("guidePrev").hidden = guidePage === 0;
}
function openGuide(){ guidePage = 0; renderGuide(); closeVeil("settingsVeil"); openVeil("guideVeil"); }
function closeGuide(){ closeVeil("guideVeil"); if (!G.guideSeen) { G.guideSeen = true; save(); } }
$("guideNext").addEventListener("click", () => { const n = document.querySelectorAll("#guideVeil .g-page").length; if (guidePage >= n - 1) closeGuide(); else { guidePage++; renderGuide(); } });
$("guidePrev").addEventListener("click", () => { if (guidePage > 0) { guidePage--; renderGuide(); } });
$("guideSkip").addEventListener("click", closeGuide);
$("guideBtn").addEventListener("click", openGuide);

/* ---------- backup file: save everything to one file, load it on another phone ---------- */
const BACKUP_APP = "starlight-yard";
let pendingBackup = null;
const fmtStamp = (t) => { const d = new Date(t); return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`; };
function renderBackup(){
  const n = G.family.length, st = G.stars.length, ph = G.family.filter(p => p.photo).length;
  $("backupLast").textContent = (G.lastBackup ? `마지막 백업 ${fmtStamp(G.lastBackup)} · ` : "아직 백업한 적이 없어요 · ") + `아이 ${n} · 별 편지 ${st}` + (ph ? ` · 사진 ${ph}` : "");
}
async function saveBackup(){
  const now = new Date(), name = `별이된너에게-백업-${now.getFullYear()}${dpPad(now.getMonth()+1)}${dpPad(now.getDate())}.json`;
  const text = JSON.stringify({app: BACKUP_APP, version: 1, exportedAt: now.toISOString(), data: G});
  const blob = new Blob([text], {type: "application/json"});
  let ok = false;
  try {
    if (window.StarlightAndroid && window.StarlightAndroid.saveFile) { window.StarlightAndroid.saveFile(name, await blob.text()); G.lastBackup = Date.now(); save(); renderBackup(); return; }   // Android app: native "save as"
    const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
    if (dl) { await dl.save({filename: name, data: blob}); ok = true; }
  } catch (e) { if (e && e.code === "declined") return; }
  if (!ok) {
    try {
      const file = new File([blob], name, {type: "application/json"});
      if (navigator.canShare && navigator.canShare({files: [file]}) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { await navigator.share({files: [file], title: "별이 된 너에게 백업"}); ok = true; }
    } catch (e) { if (e && e.name === "AbortError") return; }
  }
  if (!ok) {
    try { const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); ok = true; } catch (e) {}
  }
  if (ok) { G.lastBackup = Date.now(); save(); renderBackup(); toast("백업 파일을 저장했어요"); }
  else toast("이 화면에서는 파일을 저장할 수 없어요. 사파리나 크롬에서 열어 주세요");
}
function readBackup(file){
  if (!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    let obj = null; try { obj = JSON.parse(fr.result); } catch (e) {}
    const data = obj && obj.app === BACKUP_APP ? obj.data : (obj && obj.family ? obj : null);
    if (!data || !Array.isArray(data.family) || !data.family.length) { toast("이 앱의 백업 파일이 아니에요"); return; }
    pendingBackup = data;
    const when = obj.exportedAt ? fmtStamp(obj.exportedAt) + "에 만든 " : "";
    $("backupConfirmText").textContent = `${when}백업이에요. 아이 ${data.family.length}마리(${data.family.map(p => p.name).join(", ")}), 별 편지 ${(data.stars||[]).length}개가 들어 있어요. 불러오면 지금 마당이 이 내용으로 바뀌어요.`;
    $("backupConfirm").hidden = false;
  };
  fr.onerror = () => toast("파일을 읽지 못했어요. 다시 골라 주세요");
  fr.readAsText(file);
}
function applyBackup(){
  if (!pendingBackup) return;
  G = Object.assign(JSON.parse(JSON.stringify(SAMPLE)), JSON.parse(JSON.stringify(pendingBackup)));
  G.set = true; G.guideSeen = true; normalize(); pendingBackup = null;
  save(); flush();
  toast("백업을 불러왔어요");
  setTimeout(() => location.reload(), 900);
}
$("backupSave").addEventListener("click", saveBackup);
$("backupFile").addEventListener("change", (ev) => { readBackup(ev.target.files && ev.target.files[0]); ev.target.value = ""; });
$("backupYes").addEventListener("click", applyBackup);
$("backupNo").addEventListener("click", () => { pendingBackup = null; $("backupConfirm").hidden = true; });
$("settingsBtn").addEventListener("click", () => { $("backupConfirm").hidden = true; renderBackup(); });

const SPECIES_PROP_DATA={"url":"assets/species-props.webp","entries":{"dog":[10,88,364,208],"cat":[412,10,327,364],"hamster":[802,10,315,364],"hedgehog":[10,416,364,319],"parrot":[394,396,364,360],"rabbit":[778,468,364,216]}};
/* Preview additions: the existing save schema / pet ids stay compatible. */
function petSizeFactor(p){return ['parrot','hamster','hedgehog'].includes(p.species)?.5:p.species==='dog'&&['golden','jindo'].includes(p.breed)?1.2:1;}
const speciesPropArt=new Map();
const SPECIES_PROP_LABEL={dog:'뼈다귀 장난감',cat:'캣타워 · 강아지풀',hamster:'쳇바퀴',hedgehog:'고슴도치 동굴',parrot:'열린 새장 · 횃대',rabbit:'토끼 터널'};
function initSpeciesProps(){
 const im=new Image();im.onload=()=>{for(const [sp,[sx,sy,w,h]]of Object.entries(SPECIES_PROP_DATA.entries)){const c=clayCanvas(w,h);c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);speciesPropArt.set(sp,c);}if(!$('decoVeil').hidden)renderDeco();};im.src=SPECIES_PROP_DATA.url;
}
function speciesPropLayout(){
 const present=[...new Set(fam().map(p=>p.species))].filter(sp=>speciesPropArt.has(sp)&&!(G.hidden||[]).includes('auto-'+sp));
 const occupied=[];
 for(const [key,x,d]of [['tree',.9,0],['house',.56,.04],['mailbox',.66,.1],['cushion',.24,.22],['pond',.82,.62],['sunflower',.42,.04],['bench',.13,.55]])if(has(key))occupied.push([x,d]);
 const candidates=[[.09,.3],[.9,.3],[.51,.8],[.3,.75],[.7,.76],[.34,.16],[.76,.12],[.12,.86],[.9,.86],[.49,.42]];
 return present.map(sp=>{let chosen=candidates[0],best=-1;for(const spot of candidates){const score=occupied.length?Math.min(...occupied.map(p=>Math.hypot((spot[0]-p[0])*1.4,spot[1]-p[1]))):1;if(score>best){best=score;chosen=spot;}}occupied.push(chosen);return {sp,x:chosen[0]*W,d:dMin+chosen[1]*(dMax-dMin)};});
}
function appendSpeciesDecor(items){
 for(const o of speciesPropLayout()){const q=decoAt('auto-'+o.sp,o.x,o.d),sp=o.sp,x=q.x,d=q.d;items.push({d:d-.1,fn:()=>{
  const image=speciesPropArt.get(sp),k=P*ds(d),height=({dog:8,cat:27,hamster:24,hedgehog:20,parrot:28,rabbit:18})[sp]*k*(W<500?.84:1),width=height*image.width/image.height;
  mctx.save();mctx.imageSmoothingEnabled=true;softShadow(x,groundY+d,width*.4,2*k,.18);mctx.drawImage(image,x-width/2,groundY+d-height,width,height);mctx.restore();
  decoHits.push({key:'auto-'+sp,x:x-width/2,y:groundY+d-height,w:width,h:height,fx:x,fd:d});
 }});}
}
function appendSpeciesDecoControls(){
 const present=[...new Set(fam().map(p=>p.species))];if(!present.length)return;
 const box=$('decoList');
 const heading=document.createElement('p');heading.className='small';heading.style.gridColumn='1 / -1';heading.textContent='아이들 소품';box.appendChild(heading);
 for(const sp of present){
  const button=document.createElement('button'),key='auto-'+sp,on=!(G.hidden||[]).includes(key);button.type='button';button.className='deco';button.setAttribute('aria-pressed',String(on));
  const c=clayCanvas(288,216),image=speciesPropArt.get(sp);if(image)artFit(c.getContext('2d'),image,12,12,264,192);
  const name=document.createElement('span');name.textContent=SPECIES_PROP_LABEL[sp];const status=document.createElement('span');status.className='st';status.textContent=on?'함께 놓였어요':'치워 뒀어요';button.append(c,name,status);
  button.addEventListener('click',()=>{G.hidden=on?[...(G.hidden||[]),key]:(G.hidden||[]).filter(x=>x!==key);save();renderDeco();});box.appendChild(button);
 }
}

function renderDeco(){renderBaseDeco();appendSpeciesDecoControls();}
LINES.parrot=['짹짹, 반가워!','오늘도 같이 있자','삐리릭!'];
LINES.hedgehog=['조금씩 다가갈게','포근한 곳이 좋아','여기 내 동굴이야'];
initSpeciesProps();

const BEND_DATA=[{"url":"assets/bend-0.webp","entries":{"cat/cheese|0":[6,20,244,215],"cat/cheese|1":[262,20,244,215],"cat/cheese|2":[518,20,244,215],"cat/cheese|3":[774,20,244,215],"cat/cheese|4":[1030,20,244,215],"cat/tuxedo|0":[6,273,244,221],"cat/tuxedo|1":[262,273,244,221],"cat/tuxedo|2":[518,273,244,221],"cat/tuxedo|3":[774,273,244,221],"cat/tuxedo|4":[1030,273,244,221],"cat/mackerel|0":[6,530,244,220],"cat/mackerel|1":[262,530,244,220],"cat/mackerel|2":[518,530,244,220],"cat/mackerel|3":[774,530,244,220],"cat/mackerel|4":[1030,530,244,220],"cat/calico|0":[6,785,244,222],"cat/calico|1":[262,785,244,222],"cat/calico|2":[518,785,244,222],"cat/calico|3":[774,785,244,222],"cat/calico|4":[1030,785,244,222],"cat/black|0":[6,1042,244,220],"cat/black|1":[262,1042,244,220],"cat/black|2":[518,1042,244,220],"cat/black|3":[774,1042,244,220],"cat/black|4":[1030,1042,244,220],"cat/white|0":[6,1298,244,220],"cat/white|1":[262,1298,244,220],"cat/white|2":[518,1298,244,220],"cat/white|3":[774,1298,244,220],"cat/white|4":[1030,1298,244,220]}},{"url":"assets/bend-1.webp","entries":{"cat/russian|0":[6,14,244,227],"cat/russian|1":[262,14,244,227],"cat/russian|2":[518,14,244,227],"cat/russian|3":[774,14,244,227],"cat/russian|4":[1030,14,244,227],"cat/siamese|0":[6,263,244,241],"cat/siamese|1":[262,263,244,241],"cat/siamese|2":[518,263,244,241],"cat/siamese|3":[774,263,244,241],"cat/siamese|4":[1030,263,244,241],"cat/persian|0":[6,531,244,217],"cat/persian|1":[262,531,244,217],"cat/persian|2":[518,531,244,217],"cat/persian|3":[774,531,244,217],"cat/persian|4":[1030,531,244,217],"cat/fold|0":[5,796,245,199],"cat/fold|1":[261,796,245,199],"cat/fold|2":[517,796,245,199],"cat/fold|3":[773,796,245,199],"cat/fold|4":[1029,796,245,199],"cat/munchkin|0":[6,1051,244,201],"cat/munchkin|1":[262,1051,244,201],"cat/munchkin|2":[518,1051,244,201],"cat/munchkin|3":[774,1051,244,201],"cat/munchkin|4":[1030,1051,244,201],"cat/norwegian|0":[6,1292,244,231],"cat/norwegian|1":[262,1292,244,231],"cat/norwegian|2":[518,1292,244,231],"cat/norwegian|3":[774,1292,244,231],"cat/norwegian|4":[1030,1292,244,231]}},{"url":"assets/bend-2.webp","entries":{"cat/british|0":[6,24,244,207],"cat/british|1":[262,24,244,207],"cat/british|2":[518,24,244,207],"cat/british|3":[774,24,244,207],"cat/british|4":[1030,24,244,207],"cat/ragdoll|0":[6,273,244,222],"cat/ragdoll|1":[262,273,244,222],"cat/ragdoll|2":[518,273,244,222],"cat/ragdoll|3":[774,273,244,222],"cat/ragdoll|4":[1030,273,244,222],"cat/bengal|0":[6,531,244,217],"cat/bengal|1":[262,531,244,217],"cat/bengal|2":[518,531,244,217],"cat/bengal|3":[774,531,244,217],"cat/bengal|4":[1030,531,244,217],"cat/american|0":[6,787,244,218],"cat/american|1":[262,787,244,218],"cat/american|2":[518,787,244,218],"cat/american|3":[774,787,244,218],"cat/american|4":[1030,787,244,218],"dog/maltese|0":[5,1040,245,224],"dog/maltese|1":[261,1040,245,224],"dog/maltese|2":[517,1040,245,224],"dog/maltese|3":[773,1040,245,224],"dog/maltese|4":[1029,1040,245,224],"dog/corgi|0":[5,1304,245,207],"dog/corgi|1":[261,1304,245,207],"dog/corgi|2":[517,1304,245,207],"dog/corgi|3":[773,1304,245,207],"dog/corgi|4":[1029,1304,245,207]}},{"url":"assets/bend-3.webp","entries":{"dog/poodle|0":[5,17,245,221],"dog/poodle|1":[261,17,245,221],"dog/poodle|2":[517,17,245,221],"dog/poodle|3":[773,17,245,221],"dog/poodle|4":[1029,17,245,221],"dog/pom|0":[6,271,244,225],"dog/pom|1":[262,271,244,225],"dog/pom|2":[518,271,244,225],"dog/pom|3":[774,271,244,225],"dog/pom|4":[1030,271,244,225],"dog/shiba|0":[6,526,244,227],"dog/shiba|1":[262,526,244,227],"dog/shiba|2":[518,526,244,227],"dog/shiba|3":[774,526,244,227],"dog/shiba|4":[1030,526,244,227],"dog/jindo|0":[6,780,244,231],"dog/jindo|1":[262,780,244,231],"dog/jindo|2":[518,780,244,231],"dog/jindo|3":[774,780,244,231],"dog/jindo|4":[1030,780,244,231],"dog/golden|0":[6,1049,244,206],"dog/golden|1":[262,1049,244,206],"dog/golden|2":[518,1049,244,206],"dog/golden|3":[774,1049,244,206],"dog/golden|4":[1030,1049,244,206],"dog/bichon|0":[6,1294,244,227],"dog/bichon|1":[262,1294,244,227],"dog/bichon|2":[518,1294,244,227],"dog/bichon|3":[774,1294,244,227],"dog/bichon|4":[1030,1294,244,227]}},{"url":"assets/bend-4.webp","entries":{"dog/dachs|0":[6,32,244,191],"dog/dachs|1":[262,32,244,191],"dog/dachs|2":[518,32,244,191],"dog/dachs|3":[774,32,244,191],"dog/dachs|4":[1030,32,244,191],"dog/mix|0":[6,265,244,238],"dog/mix|1":[262,265,244,238],"dog/mix|2":[518,265,244,238],"dog/mix|3":[774,265,244,238],"dog/mix|4":[1030,265,244,238],"rabbit/white|0":[6,524,244,232],"rabbit/white|1":[262,524,244,232],"rabbit/white|2":[518,524,244,232],"rabbit/white|3":[774,524,244,232],"rabbit/white|4":[1030,524,244,232],"rabbit/gray|0":[6,787,244,218],"rabbit/gray|1":[262,787,244,218],"rabbit/gray|2":[518,787,244,218],"rabbit/gray|3":[774,787,244,218],"rabbit/gray|4":[1030,787,244,218],"rabbit/brown|0":[6,1041,244,222],"rabbit/brown|1":[262,1041,244,222],"rabbit/brown|2":[518,1041,244,222],"rabbit/brown|3":[774,1041,244,222],"rabbit/brown|4":[1030,1041,244,222],"rabbit/lop|0":[5,1307,245,201],"rabbit/lop|1":[261,1307,245,201],"rabbit/lop|2":[517,1307,245,201],"rabbit/lop|3":[773,1307,245,201],"rabbit/lop|4":[1029,1307,245,201]}},{"url":"assets/bend-5.webp","entries":{"rabbit/dutch|0":[6,7,244,241],"rabbit/dutch|1":[262,7,244,241],"rabbit/dutch|2":[518,7,244,241],"rabbit/dutch|3":[774,7,244,241],"rabbit/dutch|4":[1030,7,244,241],"hamster/golden|0":[6,279,244,210],"hamster/golden|1":[262,279,244,210],"hamster/golden|2":[518,279,244,210],"hamster/golden|3":[774,279,244,210],"hamster/golden|4":[1030,279,244,210],"hamster/djungarian|0":[6,538,244,204],"hamster/djungarian|1":[262,538,244,204],"hamster/djungarian|2":[518,538,244,204],"hamster/djungarian|3":[774,538,244,204],"hamster/djungarian|4":[1030,538,244,204],"hamster/pearl|0":[6,791,244,210],"hamster/pearl|1":[262,791,244,210],"hamster/pearl|2":[518,791,244,210],"hamster/pearl|3":[774,791,244,210],"hamster/pearl|4":[1030,791,244,210],"hamster/panda|0":[6,1052,244,199],"hamster/panda|1":[262,1052,244,199],"hamster/panda|2":[518,1052,244,199],"hamster/panda|3":[774,1052,244,199],"hamster/panda|4":[1030,1052,244,199],"hamster/robo|0":[6,1305,244,206],"hamster/robo|1":[262,1305,244,206],"hamster/robo|2":[518,1305,244,206],"hamster/robo|3":[774,1305,244,206],"hamster/robo|4":[1030,1305,244,206]}},{"url":"assets/bend-6.webp","entries":{"parrot/conure|0":[6,29,244,197],"parrot/conure|1":[262,29,244,197],"parrot/conure|2":[518,29,244,197],"parrot/conure|3":[774,29,244,197],"parrot/conure|4":[1030,29,244,197],"parrot/cockatiel|0":[6,277,244,214],"parrot/cockatiel|1":[262,277,244,214],"parrot/cockatiel|2":[518,277,244,214],"parrot/cockatiel|3":[774,277,244,214],"parrot/cockatiel|4":[1030,277,244,214],"parrot/budgie|0":[6,541,244,197],"parrot/budgie|1":[262,541,244,197],"parrot/budgie|2":[518,541,244,197],"parrot/budgie|3":[774,541,244,197],"parrot/budgie|4":[1030,541,244,197],"hedgehog/salt|0":[6,790,244,212],"hedgehog/salt|1":[262,790,244,212],"hedgehog/salt|2":[518,790,244,212],"hedgehog/salt|3":[774,790,244,212],"hedgehog/salt|4":[1030,790,244,212],"hedgehog/cinnamon|0":[6,1042,244,219],"hedgehog/cinnamon|1":[262,1042,244,219],"hedgehog/cinnamon|2":[518,1042,244,219],"hedgehog/cinnamon|3":[774,1042,244,219],"hedgehog/cinnamon|4":[1030,1042,244,219],"hedgehog/white|0":[6,1294,244,227],"hedgehog/white|1":[262,1294,244,227],"hedgehog/white|2":[518,1294,244,227],"hedgehog/white|3":[774,1294,244,227],"hedgehog/white|4":[1030,1294,244,227]}}];
/* Authored articulated bend poses; shared by pickup, missed attempts and meals. */
const bendViews=new Map(),bendPending=new Set(),bendLoaded=new Set(),bendCache=new Map();
function requestBend(p){
 const id=p.species+'/'+p.breed,index=BEND_DATA.findIndex(a=>a.entries[id+'|0']);
 if(index<0||bendPending.has(index)||bendLoaded.has(index))return;
 bendPending.add(index);const im=new Image();im.onload=()=>{const a=BEND_DATA[index];for(const [key,[sx,sy,w,h]]of Object.entries(a.entries)){const c=clayCanvas(w,h);c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);bendViews.set(key,c);}bendPending.delete(index);bendLoaded.add(index);bendCache.clear();};im.onerror=()=>bendPending.delete(index);im.src=BEND_DATA[index].url;
}
function bendCurve(t){if(t<.40)return 2*(1-Math.cos(Math.PI*clamp(t/.40,0,1)))/2;if(t<.56)return 2;return 2*(1-(1-Math.cos(Math.PI*clamp((t-.56)/.46,0,1)))/2);}
function bendAmount(e){
 const jump=jumpBend(e);if(jump!==null)return jump;
 if(e.bow)return bendCurve(e.bow.t);
 if(ball&&ball.by===e&&ball.state==='grabbing'&&!ball.caught)return bendCurve(ball.grabT);
 if(e.state==='eat'){const t=e.stateT;if(t<.4)return bendCurve(t);if(t<1.65)return 1.92+.08*Math.sin(t*15);return 2*(1-clamp((t-1.65)/.45,0,1));}
 return null;
}
function getBendSprite(p,amount){
 requestBend(p);const id=p.species+'/'+p.breed,raw=bendViews.get(id+'|0');if(!raw)return null;

 const f=Math.round(clamp(amount,0,2)*2),key=id+'|'+f;let out=bendCache.get(key);if(out)return out;
 const image=bendViews.get(id+'|'+f),B=breedOf(p.species,p.breed);if(!image)return null;
 const c=clayCanvas(SW*CLAY_SCALE,SH*CLAY_SCALE),x=c.getContext('2d');x.scale(CLAY_SCALE,CLAY_SCALE);x.imageSmoothingEnabled=true;
 let h=clayHeight(p.species,B,1),w=h*raw.width/raw.height;if(w>40){h*=40/w;w=40;}const left=AX-w/2,top=GROUND-h;
 // Authored intermediate drawings keep one clean face at every instant.
 x.drawImage(image,left,top,w,h);
 out={cv:c,m:{mx:left+w*.91,my:lerp(top+h*.46,GROUND-1.4,f/4),front:false},clay:true,ready:true,bending:true};

 if(bendCache.size>=48)bendCache.delete(bendCache.keys().next().value);bendCache.set(key,out);return out;
}
function startMissedBow(e,round,x){
 if(e.missedRound===round)return;e.missedRound=round;e.target=null;e.onArrive=null;e.moveSpeed=0;e.carry=false;e.dir=x>=e.x?1:-1;setState(e,'stand',2);e.bow={t:0,kind:'miss'};requestBend(petOf(e));
}

setTimeout(()=>{for(const p of fam())requestBend(p);},6000);   // only needed once they eat or play

function planJumpCatch(){
 if(!ball||ball.state!=='fly'||!ents.length)return;
 const sorted=ents.filter(e=>e.chaseRound===ball.round).sort((a,b)=>Math.hypot(a.x-ball.tx,a.depth-ball.td)-Math.hypot(b.x-ball.tx,b.depth-ball.td)+(a.wins||0)*8-(b.wins||0)*8);
 for(const e of sorted){const pet=petOf(e),k=P*ds(ball.td)*1.4*petSizeFactor(pet),spr=getReachSprite(pet,1),bb=BM.ball(),bk=P*ds(ball.td),g=1500*S;
  if(!spr||!getCrouchSprite(pet,2))continue;
  for(let p=.72;p<=.94;p+=.02){const bx=lerp(ball.sx,ball.tx,p),by=lerp(ball.sy,groundY+ball.td,p)-4*ball.peak*p*(1-p)-bb.height*bk*(1+(1-p)*.9)*.5;
   const mouthY=groundY+ball.td+(spr.m.my-GROUND)*k-bb.height*bk*.1,h=mouthY-by;
   if(h<12*S||h>90*S*Math.sqrt(petSizeFactor(pet)))continue;
   const dir=bx>=e.x?1:-1,x=clamp(bx-dir*(spr.m.mx-AX)*k,16*P,W-16*P),v=Math.sqrt(2*g*h),air=v/g,prep=.32,at=p*ball.dur-air-prep;
   if(at<Math.max(.06,ball.p*ball.dur+.04)||Math.hypot(x-e.x,ball.td-e.depth)>Math.max(30,at*190*S))continue;
   ball.jumpPlan={e,p,x,d:ball.td,dir,v,air,at};goTo(e,x,ball.td,true);return;
  }
 }
}
function updateCatchJump(e,dt){
 const j=e.catchJump;if(!j)return false;j.t+=dt;
 if(j.phase==='prep'){
  if(j.t>=.32){j.phase='air';j.t=0;e.vy=j.v;e.jumpY=.01;}
 }else if(j.phase==='air'){
  e.x=clamp(e.x+(j.vx||0)*dt,16*P,W-16*P);
  if(e.jumpY<=0&&e.vy<=0){j.phase='land';j.t=0;}
 }else if(j.phase==='land'&&j.t>=.30){
  e.catchJump=null;setState(e,'idle',2);if(ball&&ball.state==='carried'&&ball.by===e)bringBack(e,true);else if(ball&&ball.state==='ground')approachBall(e);return true;
 }
 return true;
}
function jumpBend(e){const j=e.catchJump;if(!j)return null;if(j.phase==='prep')return Math.sin(Math.PI*.5*clamp(j.t/.14,0,1));if(j.phase==='land')return 1.5*Math.sin(Math.PI*clamp(j.t/.22,0,1));return null;}

const REACH_DATA=[{"url":"assets/reach-0.webp","entries":{"cat/cheese|0":[6,9,244,237],"cat/cheese|1":[262,9,244,237],"cat/cheese|2":[518,9,244,237],"cat/tuxedo|0":[6,262,244,243],"cat/tuxedo|1":[262,262,244,243],"cat/tuxedo|2":[518,262,244,243],"cat/mackerel|0":[6,518,244,244],"cat/mackerel|1":[262,518,244,244],"cat/mackerel|2":[518,518,244,244],"cat/calico|0":[6,774,244,243],"cat/calico|1":[262,774,244,243],"cat/calico|2":[518,774,244,243],"cat/black|0":[6,1030,244,244],"cat/black|1":[262,1030,244,244],"cat/black|2":[518,1030,244,244],"cat/white|0":[6,1286,244,244],"cat/white|1":[262,1286,244,244],"cat/white|2":[518,1286,244,244]}},{"url":"assets/reach-1.webp","entries":{"cat/russian|0":[10,6,235,244],"cat/russian|1":[266,6,235,244],"cat/russian|2":[522,6,235,244],"cat/siamese|0":[12,262,232,244],"cat/siamese|1":[268,262,232,244],"cat/siamese|2":[524,262,232,244],"cat/persian|0":[6,522,244,236],"cat/persian|1":[262,522,244,236],"cat/persian|2":[518,522,244,236],"cat/fold|0":[6,775,244,242],"cat/fold|1":[262,775,244,242],"cat/fold|2":[518,775,244,242],"cat/munchkin|0":[6,1031,244,241],"cat/munchkin|1":[262,1031,244,241],"cat/munchkin|2":[518,1031,244,241],"cat/norwegian|0":[6,1286,244,243],"cat/norwegian|1":[262,1286,244,243],"cat/norwegian|2":[518,1286,244,243]}},{"url":"assets/reach-2.webp","entries":{"cat/british|0":[6,6,244,243],"cat/british|1":[262,6,244,243],"cat/british|2":[518,6,244,243],"cat/ragdoll|0":[6,262,243,244],"cat/ragdoll|1":[262,262,243,244],"cat/ragdoll|2":[518,262,243,244],"cat/bengal|0":[13,518,229,244],"cat/bengal|1":[269,518,229,244],"cat/bengal|2":[525,518,229,244],"cat/american|0":[17,774,222,244],"cat/american|1":[273,774,222,244],"cat/american|2":[529,774,222,244],"dog/maltese|0":[18,1030,220,244],"dog/maltese|1":[274,1030,220,244],"dog/maltese|2":[530,1030,220,244],"dog/corgi|0":[15,1286,225,244],"dog/corgi|1":[271,1286,225,244],"dog/corgi|2":[527,1286,225,244]}},{"url":"assets/reach-3.webp","entries":{"dog/poodle|0":[13,6,230,244],"dog/poodle|1":[269,6,230,244],"dog/poodle|2":[525,6,230,244],"dog/pom|0":[13,262,230,244],"dog/pom|1":[269,262,230,244],"dog/pom|2":[525,262,230,244],"dog/shiba|0":[17,518,222,244],"dog/shiba|1":[273,518,222,244],"dog/shiba|2":[529,518,222,244],"dog/jindo|0":[18,774,220,244],"dog/jindo|1":[274,774,220,244],"dog/jindo|2":[530,774,220,244],"dog/golden|0":[11,1030,233,244],"dog/golden|1":[267,1030,233,244],"dog/golden|2":[523,1030,233,244],"dog/bichon|0":[19,1286,217,244],"dog/bichon|1":[275,1286,217,244],"dog/bichon|2":[531,1286,217,244]}},{"url":"assets/reach-4.webp","entries":{"dog/dachs|0":[6,9,244,237],"dog/dachs|1":[262,9,244,237],"dog/dachs|2":[518,9,244,237],"dog/mix|0":[13,262,230,244],"dog/mix|1":[269,262,230,244],"dog/mix|2":[525,262,230,244],"rabbit/white|0":[19,518,217,244],"rabbit/white|1":[275,518,217,244],"rabbit/white|2":[531,518,217,244],"rabbit/gray|0":[14,774,227,244],"rabbit/gray|1":[270,774,227,244],"rabbit/gray|2":[526,774,227,244],"rabbit/brown|0":[13,1030,230,244],"rabbit/brown|1":[269,1030,230,244],"rabbit/brown|2":[525,1030,230,244],"rabbit/lop|0":[7,1285,241,245],"rabbit/lop|1":[263,1285,241,245],"rabbit/lop|2":[519,1285,241,245]}},{"url":"assets/reach-5.webp","entries":{"rabbit/dutch|0":[30,6,195,244],"rabbit/dutch|1":[286,6,195,244],"rabbit/dutch|2":[542,6,195,244],"hamster/golden|0":[23,262,210,244],"hamster/golden|1":[279,262,210,244],"hamster/golden|2":[535,262,210,244],"hamster/djungarian|0":[18,518,219,244],"hamster/djungarian|1":[274,518,219,244],"hamster/djungarian|2":[530,518,219,244],"hamster/pearl|0":[21,774,214,244],"hamster/pearl|1":[277,774,214,244],"hamster/pearl|2":[533,774,214,244],"hamster/panda|0":[20,1030,215,244],"hamster/panda|1":[276,1030,215,244],"hamster/panda|2":[532,1030,215,244],"hamster/robo|0":[22,1286,212,244],"hamster/robo|1":[278,1286,212,244],"hamster/robo|2":[534,1286,212,244]}},{"url":"assets/reach-6.webp","entries":{"parrot/conure|0":[9,6,238,244],"parrot/conure|1":[265,6,238,244],"parrot/conure|2":[521,6,238,244],"parrot/cockatiel|0":[11,262,233,244],"parrot/cockatiel|1":[267,262,233,244],"parrot/cockatiel|2":[523,262,233,244],"parrot/budgie|0":[14,518,228,244],"parrot/budgie|1":[270,518,228,244],"parrot/budgie|2":[526,518,228,244],"hedgehog/salt|0":[9,773,237,245],"hedgehog/salt|1":[265,773,237,245],"hedgehog/salt|2":[521,773,237,245],"hedgehog/cinnamon|0":[10,1030,236,244],"hedgehog/cinnamon|1":[266,1030,236,244],"hedgehog/cinnamon|2":[522,1030,236,244],"hedgehog/white|0":[10,1286,235,244],"hedgehog/white|1":[266,1286,235,244],"hedgehog/white|2":[522,1286,235,244]}}];
const reachViews=new Map(),reachPending=new Set(),reachLoaded=new Set(),reachCache=new Map();
function requestReach(p){
 const id=p.species+'/'+p.breed,index=REACH_DATA.findIndex(a=>a.entries[id+'|0']);if(index<0||reachPending.has(index)||reachLoaded.has(index))return;
 reachPending.add(index);const im=new Image();im.onload=()=>{for(const [key,[sx,sy,w,h]]of Object.entries(REACH_DATA[index].entries)){const c=clayCanvas(w,h);c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);reachViews.set(key,c);}reachPending.delete(index);reachLoaded.add(index);};im.onerror=()=>reachPending.delete(index);im.src=REACH_DATA[index].url;
}
function reachFrame(e){const j=e.catchJump;if(!j||j.phase!=='air')return 1;const ratio=e.vy/j.v;return ratio>.32?0:ratio<-.32?2:1;}
function getReachSprite(p,frame=1){
 requestReach(p);const id=p.species+'/'+p.breed,key=id+'|'+frame;let out=reachCache.get(key);if(out)return out;const image=reachViews.get(key);if(!image)return null;
 const B=breedOf(p.species,p.breed),c=clayCanvas(SW*CLAY_SCALE,SH*CLAY_SCALE),x=c.getContext('2d');x.scale(CLAY_SCALE,CLAY_SCALE);x.imageSmoothingEnabled=true;
 let h=Math.min(34,clayHeight(p.species,B,1)*1.35),w=h*image.width/image.height;if(w>40){h*=40/w;w=40;}const left=AX-w/2,top=GROUND-h;x.drawImage(image,left,top,w,h);
 const anchor=({cat:[[.90,.30],[.86,.26],[.92,.38]],dog:[[.90,.27],[.87,.23],[.90,.29]],rabbit:[[.90,.39],[.86,.34],[.91,.4]],hamster:[[.91,.29],[.88,.24],[.92,.32]],hedgehog:[[.92,.31],[.90,.29],[.93,.34]],parrot:[[.92,.35],[.90,.30],[.93,.38]]})[p.species][frame];
 out={cv:c,m:{mx:left+w*anchor[0],my:top+h*anchor[1],front:false},clay:true,ready:true,reaching:true};if(reachCache.size>=72)reachCache.delete(reachCache.keys().next().value);reachCache.set(key,out);return out;
}

setTimeout(()=>{for(const p of fam())requestReach(p);},7000);

const CROUCH_DATA=[{"url":"assets/crouch-0.webp","entries":{"cat/cheese|0":[6,24,244,208],"cat/cheese|1":[262,24,244,208],"cat/cheese|2":[518,24,244,208],"cat/tuxedo|0":[6,280,244,208],"cat/tuxedo|1":[262,280,244,208],"cat/tuxedo|2":[518,280,244,208],"cat/mackerel|0":[6,536,244,208],"cat/mackerel|1":[262,536,244,208],"cat/mackerel|2":[518,536,244,208],"cat/calico|0":[6,793,244,205],"cat/calico|1":[262,793,244,205],"cat/calico|2":[518,793,244,205],"cat/black|0":[6,1048,244,208],"cat/black|1":[262,1048,244,208],"cat/black|2":[518,1048,244,208],"cat/white|0":[6,1303,244,209],"cat/white|1":[262,1303,244,209],"cat/white|2":[518,1303,244,209]}},{"url":"assets/crouch-1.webp","entries":{"cat/russian|0":[6,17,244,222],"cat/russian|1":[262,17,244,222],"cat/russian|2":[518,17,244,222],"cat/siamese|0":[6,269,244,230],"cat/siamese|1":[262,269,244,230],"cat/siamese|2":[518,269,244,230],"cat/persian|0":[6,530,244,219],"cat/persian|1":[262,530,244,219],"cat/persian|2":[518,530,244,219],"cat/fold|0":[6,791,244,210],"cat/fold|1":[262,791,244,210],"cat/fold|2":[518,791,244,210],"cat/munchkin|0":[6,1049,244,206],"cat/munchkin|1":[262,1049,244,206],"cat/munchkin|2":[518,1049,244,206],"cat/norwegian|0":[6,1296,244,224],"cat/norwegian|1":[262,1296,244,224],"cat/norwegian|2":[518,1296,244,224]}},{"url":"assets/crouch-2.webp","entries":{"cat/british|0":[6,22,244,211],"cat/british|1":[262,22,244,211],"cat/british|2":[518,22,244,211],"cat/ragdoll|0":[6,280,244,207],"cat/ragdoll|1":[262,280,244,207],"cat/ragdoll|2":[518,280,244,207],"cat/bengal|0":[6,530,244,220],"cat/bengal|1":[262,530,244,220],"cat/bengal|2":[518,530,244,220],"cat/american|0":[6,791,244,210],"cat/american|1":[262,791,244,210],"cat/american|2":[518,791,244,210],"dog/maltese|0":[6,1043,244,217],"dog/maltese|1":[262,1043,244,217],"dog/maltese|2":[518,1043,244,217],"dog/corgi|0":[6,1304,244,208],"dog/corgi|1":[262,1304,244,208],"dog/corgi|2":[518,1304,244,208]}},{"url":"assets/crouch-3.webp","entries":{"dog/poodle|0":[6,14,244,227],"dog/poodle|1":[262,14,244,227],"dog/poodle|2":[518,14,244,227],"dog/pom|0":[6,267,244,233],"dog/pom|1":[262,267,244,233],"dog/pom|2":[518,267,244,233],"dog/shiba|0":[5,517,245,245],"dog/shiba|1":[261,517,245,245],"dog/shiba|2":[517,517,245,245],"dog/jindo|0":[6,774,244,244],"dog/jindo|1":[262,774,244,244],"dog/jindo|2":[518,774,244,244],"dog/golden|0":[6,1049,244,206],"dog/golden|1":[262,1049,244,206],"dog/golden|2":[518,1049,244,206],"dog/bichon|0":[6,1295,244,226],"dog/bichon|1":[262,1295,244,226],"dog/bichon|2":[518,1295,244,226]}},{"url":"assets/crouch-4.webp","entries":{"dog/dachs|0":[6,38,244,179],"dog/dachs|1":[262,38,244,179],"dog/dachs|2":[518,38,244,179],"dog/mix|0":[6,263,244,242],"dog/mix|1":[262,263,244,242],"dog/mix|2":[518,263,244,242],"rabbit/white|0":[10,518,236,244],"rabbit/white|1":[266,518,236,244],"rabbit/white|2":[522,518,236,244],"rabbit/gray|0":[6,774,244,243],"rabbit/gray|1":[262,774,244,243],"rabbit/gray|2":[518,774,244,243],"rabbit/brown|0":[7,1030,241,244],"rabbit/brown|1":[263,1030,241,244],"rabbit/brown|2":[519,1030,241,244],"rabbit/lop|0":[6,1304,244,208],"rabbit/lop|1":[262,1304,244,208],"rabbit/lop|2":[518,1304,244,208]}},{"url":"assets/crouch-5.webp","entries":{"rabbit/dutch|0":[6,15,244,225],"rabbit/dutch|1":[262,15,244,225],"rabbit/dutch|2":[518,15,244,225],"hamster/golden|0":[6,286,244,195],"hamster/golden|1":[262,286,244,195],"hamster/golden|2":[518,286,244,195],"hamster/djungarian|0":[6,545,244,190],"hamster/djungarian|1":[262,545,244,190],"hamster/djungarian|2":[518,545,244,190],"hamster/pearl|0":[6,805,244,182],"hamster/pearl|1":[262,805,244,182],"hamster/pearl|2":[518,805,244,182],"hamster/panda|0":[6,1060,244,183],"hamster/panda|1":[262,1060,244,183],"hamster/panda|2":[518,1060,244,183],"hamster/robo|0":[6,1316,244,184],"hamster/robo|1":[262,1316,244,184],"hamster/robo|2":[518,1316,244,184]}},{"url":"assets/crouch-6.webp","entries":{"parrot/conure|0":[6,23,244,210],"parrot/conure|1":[262,23,244,210],"parrot/conure|2":[518,23,244,210],"parrot/cockatiel|0":[6,276,244,215],"parrot/cockatiel|1":[262,276,244,215],"parrot/cockatiel|2":[518,276,244,215],"parrot/budgie|0":[6,530,244,219],"parrot/budgie|1":[262,530,244,219],"parrot/budgie|2":[518,530,244,219],"hedgehog/salt|0":[6,794,244,203],"hedgehog/salt|1":[262,794,244,203],"hedgehog/salt|2":[518,794,244,203],"hedgehog/cinnamon|0":[6,1048,244,208],"hedgehog/cinnamon|1":[262,1048,244,208],"hedgehog/cinnamon|2":[518,1048,244,208],"hedgehog/white|0":[6,1302,244,212],"hedgehog/white|1":[262,1302,244,212],"hedgehog/white|2":[518,1302,244,212]}}];
const crouchViews=new Map(),crouchPending=new Set(),crouchLoaded=new Set(),crouchCache=new Map();
function requestCrouch(p){
 const id=p.species+'/'+p.breed,index=CROUCH_DATA.findIndex(a=>a.entries[id+'|0']);if(index<0||crouchPending.has(index)||crouchLoaded.has(index))return;
 crouchPending.add(index);const im=new Image();im.onload=()=>{for(const [key,[sx,sy,w,h]]of Object.entries(CROUCH_DATA[index].entries)){const c=clayCanvas(w,h);c.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);crouchViews.set(key,c);}crouchPending.delete(index);crouchLoaded.add(index);};im.onerror=()=>crouchPending.delete(index);im.src=CROUCH_DATA[index].url;
}
function jumpCrouchAmount(e){
 const j=e.catchJump;if(!j)return null;
 if(j.phase==='prep'){const t=Math.max(0,j.t);return t<.20?2*(1-Math.cos(Math.PI*.5*t/.20)):t<.27?2:2-clamp((t-.27)/.05,0,1);}
 if(j.phase==='land')return 2*Math.sin(Math.PI*clamp(j.t/.30,0,1));return null;
}
function getCrouchSprite(p,amount){
 requestCrouch(p);const id=p.species+'/'+p.breed,f=Math.round(clamp(amount,0,2)),key=id+'|'+f;let out=crouchCache.get(key);if(out)return out;const image=crouchViews.get(key);if(!image)return null;
 const B=breedOf(p.species,p.breed),c=clayCanvas(SW*CLAY_SCALE,SH*CLAY_SCALE),x=c.getContext('2d');x.scale(CLAY_SCALE,CLAY_SCALE);x.imageSmoothingEnabled=true;
 let h=clayHeight(p.species,B,1),w=h*image.width/image.height;if(w>40){h*=40/w;w=40;}const left=AX-w/2,top=GROUND-h;x.drawImage(image,left,top,w,h);
 const base=({cat:[.36,.49,.66],dog:[.40,.52,.69],rabbit:[.56,.64,.75],hamster:[.43,.55,.68],hedgehog:[.40,.52,.65],parrot:[.40,.48,.58]})[p.species][f];
 out={cv:c,m:{mx:left+w*.95,my:top+h*base,front:false},clay:true,ready:true,crouching:true};if(crouchCache.size>=72)crouchCache.delete(crouchCache.keys().next().value);crouchCache.set(key,out);return out;
}
function startMissedJumps(winner,plan){
 if(!ball)return;let index=0;for(const o of ents){if(o===winner||o.chaseRound!==ball.round)continue;
 o.target=null;o.onArrive=null;o.bow=null;o.moveSpeed=0;o.carry=false;o.dir=ball.x>=o.x?1:-1;setState(o,'stand');
 if(Math.hypot((o.x-plan.x)/Math.max(1,W),(o.depth-plan.d)/Math.max(1,dMax-dMin)*0.6)>=0.09){setState(o,'stand',rand(1.2,2.2));continue;}   // too far to try: just stop and watch
 const factor=petSizeFactor(petOf(o)),v=Math.min(plan.v*.8,Math.sqrt(2*1500*S*48*S*Math.sqrt(factor)));
 o.catchJump={phase:'prep',t:-index*.035,v,vx:o.dir*12*S,missed:true};requestCrouch(petOf(o));requestReach(petOf(o));index++;
 }
}

setTimeout(()=>{for(const p of fam())requestCrouch(p);},8000);




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

/* ---------- the yard is as tall as the real screen ----------
 * iPhone home-screen apps can report a viewport shorter than the screen (by the status bar) yet still paint
 * that strip, and 100lvh can be shorter than innerHeight. Take the largest honest number and size the yard to it.
 * (No canvas read-backs here: reading pixels from the yard canvas makes iOS drop to slow software drawing.) */
var __fullInfo = {};
(() => {
  const fix = () => {
    const sa = navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches);
    const vv = window.visualViewport;
    let full = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, vv ? Math.round(vv.height + vv.offsetTop) : 0);
    let scr = 0;
    if (sa && window.screen) {
      const portrait = window.innerHeight >= window.innerWidth;
      scr = portrait ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width);
      if (scr - full > 0 && scr - full <= 140) full = scr;
    }
    __fullInfo = {sa, scr, full};
    const v = full + "px";
    if (document.documentElement.style.getPropertyValue("--stageH") !== v) { document.documentElement.style.setProperty("--stageH", v); setTimeout(resize, 30); }
  };
  fix();
  ["resize", "orientationchange", "pageshow"].forEach(e => window.addEventListener(e, () => { fix(); setTimeout(fix, 350); setTimeout(fix, 800); }));
  if (window.visualViewport) visualViewport.addEventListener("resize", () => setTimeout(fix, 100));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(fix, 200); });
  setTimeout(fix, 400);
})();
function dockTopInStage(){
  const d = $("dock"), s = document.querySelector(".stage");
  if (!d || d.hidden || !s) return 0;
  return d.getBoundingClientRect().top - s.getBoundingClientRect().top;
}

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
      `full   ${__fullInfo.full} (screen ${__fullInfo.scr}, ${__fullInfo.sa ? 'app' : 'web'}) canvas ${cv.width}x${cv.height}`,
      `build  ${sEl ? (sEl.src.split("?")[1] || "-") : "single file"}`
    ].join("\n");
  };
  setInterval(tick, 700); tick();
}
if (/debug/.test(location.hash + location.search)) enableScreenCheck();
{ let taps = 0, tt = null; const t = document.querySelector(".title"); if (t) t.addEventListener("click", () => { taps++; clearTimeout(tt); tt = setTimeout(() => taps = 0, 1200); if (taps >= 5) { taps = 0; enableScreenCheck(); } }); }





































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
/* clouds cut from the painted skies (assets/sky-clouds.webp), loaded only when lantern view is first opened */
const SKY_CLOUDS = {"day": [[0, 0, 254, 148], [258, 0, 180, 114], [442, 0, 362, 204]], "dawn": [[808, 0, 174, 110], [986, 0, 240, 146]], "dusk": [[1230, 0, 278, 148], [1512, 0, 376, 204], [0, 208, 168, 92]], "night": [[368, 208, 294, 150], [666, 208, 222, 124], [892, 208, 230, 124]]};
let skyCloudImg = null;
function needSkyClouds(){ if (skyCloudImg) return; skyCloudImg = new Image(); skyCloudImg.src = "assets/sky-clouds.webp"; }
function skyKeyOf(image){ for (const [k, v] of sceneBackgrounds) if (v === image) return k; return "day"; }
const SKY_LAYOUT = [[0.16, 0.42, 0, 0.62], [0.62, 0.18, 1, 0.5], [0.9, 0.62, 2, 0.42], [0.4, 0.78, 1, 0.34]];   // x, y (in the new strip), which cloud, size
const SKY_STARS = [[0.08,0.3],[0.27,0.12],[0.35,0.55],[0.5,0.32],[0.71,0.6],[0.83,0.22],[0.95,0.45],[0.2,0.75],[0.58,0.85],[0.44,0.08]];
function skyAbove(image, y0){
  const [r, g, b] = skyTopColor(image), deep = (v) => Math.round(v*0.9), top = y0 - camLift - 6, blend = 46;
  const gr = mctx.createLinearGradient(0, top, 0, y0 + blend);
  gr.addColorStop(0, `rgb(${deep(r)},${deep(g)},${deep(b)})`);
  gr.addColorStop(Math.max(0.01, (y0 - top)/(y0 + blend - top)), `rgba(${r},${g},${b},1)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  mctx.fillStyle = gr; mctx.fillRect(0, top, W, y0 + blend - top);
  const band = y0 - top, key = skyKeyOf(image), list = SKY_CLOUDS[key] || SKY_CLOUDS.day, s = Math.max(W/image.width, H/image.height);
  if (key === "night" || NIGHT > 0.5) {               // a few soft stars like the painted ones
    mctx.save();
    SKY_STARS.forEach(([fx, fy], i) => { const x = fx*W, y = top + 8 + fy*(band - 10), tw = 0.6 + 0.4*Math.sin(performance.now()/900 + i*1.7), r = (i % 3 === 0 ? 2.4 : 1.6);
      const g = mctx.createRadialGradient(x, y, 0, x, y, r*4); g.addColorStop(0, `rgba(255,236,190,${0.9*tw})`); g.addColorStop(1, "rgba(255,236,190,0)");
      mctx.fillStyle = g; mctx.beginPath(); mctx.arc(x, y, r*4, 0, 7); mctx.fill(); });
    mctx.restore();
  }
  if (skyCloudImg && skyCloudImg.complete && skyCloudImg.naturalWidth) {
    mctx.save(); mctx.imageSmoothingEnabled = true;
    const drift = performance.now()/1000*2.2;
    SKY_LAYOUT.slice(0, band > 110 ? 4 : 3).forEach(([fx, fy, ci, k], i) => {
      const [sx, sy, sw, sh] = list[ci % list.length], w = sw*s*k*1.25, h = sh*s*k*1.25;
      let x = ((fx*W + drift*(0.6 + i*0.25)) % (W + w)) - w/2, y = top + fy*band - h/2;
      if (i % 2) { mctx.save(); mctx.translate(x + w/2, 0); mctx.scale(-1, 1); mctx.drawImage(skyCloudImg, sx, sy, sw, sh, -w/2, y, w, h); mctx.restore(); }   // mirrored left-right only
      else mctx.drawImage(skyCloudImg, sx, sy, sw, sh, x - 0, y, w, h);
    });
    mctx.restore();
  }
}
var camFrom = 0, camGoal = 0, camStart = 0;
const CAM_MS = 900, camEase = (u) => u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3)/2;   // slow start, slow stop
function updateCamLift(dt){
  const goal = lanternMode ? Math.round(H*0.16) : 0, now = performance.now();
  if (goal !== camGoal) { camFrom = camLift; camGoal = goal; camStart = now; }
  const u = Math.min(1, (now - camStart)/CAM_MS);
  camLift = camFrom + (camGoal - camFrom)*camEase(u);
}    // lanterns are only shown in this calm view (letters stay in the normal sky)
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
  if ((!lanternMode && camLift < 0.5) || !lanterns.length || !W) return;
  const fade = Math.max(0, Math.min(1, camLift/Math.max(1, H*0.16)));   // lanterns appear and leave together with the camera slide
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
    let a = (0.3 + 0.7*near)*fade*fade;
    if (l.born) { const p = Math.min(1, (now - l.born)/5200), e = 1 - Math.pow(1 - p, 3); y = (groundY + 40) + (y - groundY - 40)*e; a *= Math.min(1, p*3); if (p >= 1) l.born = 0; }
    return {l, x, y, s, a, near};
  });
  mctx.save(); mctx.imageSmoothingEnabled = true;
  for (let k = placed.length - 1; k >= 0; k--) {           // far ones first, the near ones on top
    const {l, x, y, s, a, near} = placed[k], w = 26*s, h = 34*s, gr = 120*s;
    mctx.globalAlpha = a*glowA*(0.55 + 0.45*near); mctx.drawImage(lanternGlow, x - gr/2, y - gr/2, gr, gr);
    mctx.globalAlpha = a; mctx.drawImage(lanternArt, x - w*0.62, y - h*0.62, w*1.23, h*1.23);
    if (lanternMode) lanternHits.push({l, x, y, r: Math.max(18, 20*s)});
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
const copyText = async (txt, ok) => { if (window.StarlightAndroid && window.StarlightAndroid.copyText) { window.StarlightAndroid.copyText(txt); toast(ok); return; } try { await navigator.clipboard.writeText(txt); toast(ok); } catch (e) { toast(G.share ? "코드: " + G.share.code : txt); } };
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
$("shareCopyLink").addEventListener("click", () => G.share && copyText(`${(G.yardName || "우리 마당")}에 놀러 와요\n${SY_LINK}?visit=${G.share.code}\n(공유 코드: ${G.share.code})`, "링크를 복사했어요"));
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
    needSkyClouds(); $("dock").hidden = true; $("visitBar").hidden = false; lanternMode = true; document.documentElement.classList.add("lantern-mode");
    cover.classList.add("done"); setTimeout(() => cover.remove(), 600);
    setInterval(() => { if (!document.hidden) pullLanterns(); }, 45000);
  })();
}
function yardTitleText(){ try { return ($("yardName") || {}).textContent || "친구 마당"; } catch (e) { return "친구 마당"; } }

/* ---------- lantern mode: only the pets, the yard and the lanterns ---------- */
function lanternCountText(){ const n = lanterns.length; $("lanternCount").textContent = n ? `풍등 ${n}개` : "아직 풍등이 없어요"; }
function enterLanternMode(){
  if (VISIT || lanternMode) return;
  needSkyClouds();
  if (typeof decoEditing !== "undefined" && decoEditing) setDecoEditing(false);
  try { setBallMode(false); } catch (e) {}
  lanternMode = true; glows = []; bubble = null;
  document.documentElement.classList.add("lantern-mode");
  const bar = $("lanternBar"); bar.classList.add("off"); bar.hidden = false; lanternCountText();
  requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.remove("off")));
  clearTimeout(window.__dockT); window.__dockT = setTimeout(() => { if (lanternMode) $("dock").hidden = true; }, 520);
  if (G.share) pullLanterns().then(lanternCountText);
  if (!G.lanternTip) { G.lanternTip = true; save(); setTimeout(() => toast("풍등을 누르면 누가 띄웠는지 보여요"), 500); }
}
function exitLanternMode(){
  lanternMode = false; $("lanternTag").hidden = true;
  clearTimeout(window.__dockT); $("dock").hidden = false;
  const bar = $("lanternBar"); bar.classList.add("off");
  requestAnimationFrame(() => document.documentElement.classList.remove("lantern-mode"));
  setTimeout(() => { if (!lanternMode) bar.hidden = true; }, 520);
}
$("lanternBtn").addEventListener("click", enterLanternMode);
$("lanternExit").addEventListener("click", exitLanternMode);
$("lanternLaunch").addEventListener("click", askLantern);
setInterval(() => { if (lanternMode && !VISIT) lanternCountText(); }, 1000);

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
  const on = !!cloud; if ($("cloudDelConfirm")) $("cloudDelConfirm").hidden = true;
  $("cloudOff").hidden = on; $("cloudOn").hidden = !on;
  if (on) $("cloudStatus").textContent = `${cloud.email || "내 이메일"}로 저장하고 있어요.` + (cloudErr ? " " + cloudErr : cloudLast ? ` 마지막 저장 ${fmtWhen(cloudLast)}` : "");
}
$("settingsBtn").addEventListener("click", () => { renderCloud(); const w = pendingPair(); $("cloudCodeRow").hidden = !w; $("cloudWait").hidden = !w; });
var cloudEmail = "";
$("cloudSend").addEventListener("click", async () => {
  const em = $("cloudEmail").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast("이메일 주소를 확인해 주세요"); return; }
  const b = $("cloudSend"); b.disabled = true;
  try {
    const pair = "x" + Array.from(crypto.getRandomValues(new Uint8Array(18)), v => v.toString(16).padStart(2, "0")).join("");
    const back = location.origin + location.pathname + "?pair=" + pair;
    await sbFetch("/auth/v1/otp?redirect_to=" + encodeURIComponent(back), {method: "POST", headers: authHeaders(), body: JSON.stringify({email: em, create_user: true})});
    cloudEmail = em; try { localStorage.setItem(PKEY, JSON.stringify({id: pair, at: Date.now()})); } catch (e) {}
    $("cloudWait").hidden = false; $("cloudCodeRow").hidden = false; $("cloudCode").value = ""; setTimeout(() => $("cloudCode").focus(), 60);
    toast("메일을 보냈어요"); waitPair();
  }
  catch (e) { cloudEmail = em; $("cloudCodeRow").hidden = false; toast(e.status === 429 ? "메일을 너무 자주 보냈어요. 잠시 뒤에 다시 해 주세요" : "메일을 보내지 못했어요. 잠시 뒤에 다시 해 주세요"); }
  b.disabled = false;
});
$("cloudVerify").addEventListener("click", async () => {
  const code = $("cloudCode").value.replace(/\D/g, "");
  if (code.length < 6) { toast("메일로 받은 숫자를 모두 넣어 주세요"); return; }
  const b = $("cloudVerify"); b.disabled = true;
  try {
    let s;
    try { s = await sbFetch("/auth/v1/verify", {method: "POST", headers: authHeaders(), body: JSON.stringify({type: "email", email: cloudEmail, token: code})}); }
    catch (e1) {   // Google Play review account signs in with a fixed number (its password) instead of an emailed code
      s = await sbFetch("/auth/v1/token?grant_type=password", {method: "POST", headers: authHeaders(), body: JSON.stringify({email: cloudEmail, password: code})});
    }
    cloud = {access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Date.now()/1000 + (s.expires_in || 3600)), email: s.user && s.user.email, uid: s.user && s.user.id};
    cloudStore(); try { localStorage.removeItem(PKEY); } catch (e) {} clearInterval(pairTimer); $("cloudWait").hidden = true; $("cloudCodeRow").hidden = true; renderCloud(); await cloudReconcile(true);
  } catch (e) { toast("숫자가 맞지 않거나 시간이 지났어요. 다시 받아 주세요"); }
  b.disabled = false;
});
$("cloudOut").addEventListener("click", () => { cloud = null; cloudReady = false; cloudStore(); renderCloud(); toast("로그아웃했어요. 이 폰의 마당은 그대로 있어요"); });

if (cloud && !window.__syVisit && !VISIT) { setTimeout(() => cloudReconcile(false), 1500); }
document.addEventListener("visibilitychange", () => { if (!document.hidden && cloud && cloudReady && !VISIT) { if (cloudDirty) cloudFlush(); } });
window.addEventListener("pagehide", () => { if (cloudDirty) cloudFlush(); });
$("setupCloud").hidden = !!G.set;
$("setupCloud").addEventListener("click", () => { renderCloud(); const w = pendingPair(); $("cloudCodeRow").hidden = !w; $("cloudWait").hidden = !w; openVeil("settingsVeil"); setTimeout(() => { const s = document.querySelector(".cloud"); if (s) s.scrollIntoView({block: "center"}); $("cloudEmail").focus(); }, 80); });

/* login link: Supabase sends a link (templates can't be edited on the free mail). The link opens in Safari with the session in the
 * address; Safari hands it to the app that asked through a one-time pairing id, and the app picks it up by itself. */
var PKEY = "starlight-yard-pair", pairTimer = null;
function pendingPair(){ try { const p = JSON.parse(localStorage.getItem(PKEY) || "null"); return p && Date.now() - p.at < 20*60*1000 ? p : null; } catch (e) { return null; } }
function sessionFrom(s){ return {access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Date.now()/1000 + (s.expires_in || 3600)), email: s.user && s.user.email, uid: s.user && s.user.id}; }
async function loggedIn(s){
  cloud = sessionFrom(s); cloudStore(); try { localStorage.removeItem(PKEY); } catch (e) {}
  clearInterval(pairTimer); pairTimer = null; $("cloudWait").hidden = true; $("cloudCodeRow").hidden = true; renderCloud();
  toast("로그인했어요"); await cloudReconcile(true);
}
async function takePair(){
  const p = pendingPair(); if (!p || cloud) { clearInterval(pairTimer); pairTimer = null; return; }
  try {
    const rt = await syRpc("sy_pair_take", {p_id: p.id}); if (!rt) return;
    const s = await sbFetch("/auth/v1/token?grant_type=refresh_token", {method: "POST", headers: authHeaders(), body: JSON.stringify({refresh_token: rt})});
    await loggedIn(s);
  } catch (e) {}
}
function waitPair(){ clearInterval(pairTimer); pairTimer = setInterval(takePair, 3000); takePair(); }
document.addEventListener("visibilitychange", () => { if (!document.hidden && pendingPair() && !cloud) waitPair(); });
if (pendingPair() && !cloud && !VISIT) waitPair();
/* this page was opened from the mail link */
(async () => {
  const h = new URLSearchParams(location.hash.replace(/^#/, "")), q = new URLSearchParams(location.search);
  if (!h.get("access_token") && !h.get("error")) return;
  const pair = q.get("pair"); history.replaceState(null, "", location.pathname);
  if (h.get("error")) { toast("링크가 만료됐어요. 앱에서 메일을 다시 받아 주세요"); return; }
  const at = h.get("access_token"), rt = h.get("refresh_token");
  let user = null; try { user = await sbFetch("/auth/v1/user", {headers: Object.assign(authHeaders(), {Authorization: "Bearer " + at})}); } catch (e) {}
  const mine = pendingPair();
  if (pair && !(mine && mine.id === pair)) {
    // opened in Safari, but the request came from the home-screen app: hand the login over, then sign in here too with a fresh session later
    let ok = false; try { ok = await syRpc("sy_pair_put", {p_id: pair, p_refresh: rt}); } catch (e) {}
    $("pairDoneText").textContent = ok ? "로그인됐어요. 이제 홈 화면의 별이 된 너에게 앱으로 돌아가 주세요. 앱이 알아서 이어받아요." : "로그인을 넘겨주지 못했어요. 앱에서 메일을 다시 받아 주세요.";
    openVeil("pairVeil");
    return;
  }
  await loggedIn({access_token: at, refresh_token: rt, expires_in: Number(h.get("expires_in")) || 3600, user});
})();

/* delete my login account and my saved copy on the server (this phone's yard stays) */
$("cloudDel").addEventListener("click", () => { $("cloudDelConfirm").hidden = false; });
$("cloudDelNo").addEventListener("click", () => { $("cloudDelConfirm").hidden = true; });
$("cloudDelYes").addEventListener("click", async () => {
  const b = $("cloudDelYes"); b.disabled = true;
  try {
    const tk = await cloudToken(); if (!tk) throw new Error("no session");
    const ok = await sbFetch("/rest/v1/rpc/sy_delete_me", {method: "POST", headers: Object.assign(authHeaders(), {Authorization: "Bearer " + tk}), body: "{}"});
    if (ok !== true) throw new Error("not deleted");
    cloud = null; cloudReady = false; cloudStore(); $("cloudDelConfirm").hidden = true; renderCloud(); toast("계정과 서버에 저장된 마당을 지웠어요");
  } catch (e) { toast("지우지 못했어요. 인터넷 연결을 확인하고 다시 해 주세요"); }
  b.disabled = false;
});

})();
