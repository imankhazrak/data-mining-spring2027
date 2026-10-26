const UT={"names":["Arizona","Boston","Central","Commonwealth","NY","Florida","Hawaiian","Idaho","Kentucky","Madison","Nevada","New England","Northern","Oklahoma","Pacific","Puget","San Diego","Southern","Texas","Wisconsin","United","Virginia"],"single":[[11.0,20.0,1.4167,2.0],[9.0,12.0,1.4401,2.0],[3.0,23.0,1.5265,3.0],[6.0,22.0,1.6991,3.0],[19.0,24.0,1.8592,4.0],[13.0,18.0,1.9202,2.0],[0.0,17.0,1.9214,2.0],[14.0,25.0,2.1465,4.0],[27.0,28.0,2.1632,4.0],[1.0,26.0,2.2151,5.0],[7.0,15.0,2.2533,2.0],[29.0,31.0,2.373,9.0],[21.0,33.0,2.4789,10.0],[8.0,30.0,2.4857,5.0],[34.0,35.0,2.5096,15.0],[5.0,36.0,2.642,16.0],[2.0,37.0,2.7881,17.0],[32.0,38.0,2.8018,19.0],[16.0,39.0,3.1678,20.0],[10.0,40.0,3.5107,21.0],[4.0,41.0,3.6887,22.0]],"complete":[[11.0,20.0,1.4167,2.0],[9.0,12.0,1.4401,2.0],[3.0,19.0,1.8592,2.0],[13.0,18.0,1.9202,2.0],[0.0,17.0,1.9214,2.0],[7.0,15.0,2.2533,2.0],[14.0,22.0,2.3836,3.0],[1.0,21.0,2.4789,2.0],[25.0,26.0,2.5319,4.0],[23.0,24.0,2.6376,4.0],[2.0,8.0,2.8174,2.0],[6.0,28.0,2.9991,4.0],[29.0,31.0,3.5157,6.0],[10.0,27.0,3.5441,3.0],[5.0,30.0,3.6911,5.0],[32.0,36.0,4.2057,7.0],[16.0,33.0,4.685,5.0],[4.0,34.0,4.87,7.0],[37.0,39.0,5.2546,14.0],[35.0,38.0,6.1369,8.0],[40.0,41.0,6.613,22.0]],"average":[[11.0,20.0,1.4167,2.0],[9.0,12.0,1.4401,2.0],[3.0,19.0,1.8592,2.0],[13.0,18.0,1.9202,2.0],[0.0,17.0,1.9214,2.0],[23.0,24.0,2.1364,4.0],[6.0,22.0,2.2187,3.0],[7.0,15.0,2.2533,2.0],[25.0,26.0,2.3794,4.0],[1.0,21.0,2.4789,2.0],[14.0,28.0,2.5097,4.0],[27.0,31.0,2.7889,6.0],[2.0,8.0,2.8174,2.0],[5.0,30.0,3.2013,5.0],[34.0,35.0,3.3425,7.0],[10.0,29.0,3.5274,3.0],[16.0,32.0,3.7281,5.0],[33.0,36.0,3.7317,13.0],[38.0,39.0,4.1702,18.0],[4.0,40.0,4.4718,19.0],[37.0,41.0,4.7165,22.0]],"ward":[[11.0,20.0,1.4167,2.0],[9.0,12.0,1.4401,2.0],[3.0,19.0,1.8592,2.0],[13.0,18.0,1.9202,2.0],[0.0,17.0,1.9214,2.0],[7.0,15.0,2.2533,2.0],[1.0,21.0,2.4789,2.0],[14.0,22.0,2.4881,3.0],[23.0,24.0,2.5857,4.0],[6.0,29.0,2.7642,4.0],[25.0,26.0,2.7699,4.0],[2.0,8.0,2.8174,2.0],[28.0,30.0,3.5924,6.0],[5.0,33.0,3.6511,3.0],[10.0,27.0,3.8598,3.0],[32.0,35.0,4.3841,7.0],[16.0,31.0,4.4267,5.0],[4.0,34.0,5.1736,7.0],[37.0,39.0,7.1625,14.0],[36.0,40.0,8.0436,17.0],[38.0,41.0,8.1864,22.0]]};
/* Lecture 13 demos: dendrogram + k-means stepper */
(function () {
  /* ---------- dendrogram */
  const link = document.getElementById("dLink"), dk = document.getElementById("dK");
  const n = UT.names.length;
  const st = DM.canvas(document.getElementById("dendCanvas"), w => w < 560 ? 0.85 : 0.45, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(), L = UT[link.value], K = +dk.value;
    const pal = [k.c1, k.c2, k.c3, k.c4, k.c5, k.c6, k.text, k.muted];
    // children
    const kids = {}; L.forEach((r, i) => kids[n + i] = [r[0], r[1], r[2]]);
    const order = []; (function walk(id) { if (id < n) { order.push(id); return; } walk(kids[id][0]); walk(kids[id][1]); })(2 * n - 2);
    // cluster membership for K: undo last K-1 merges
    const cutH = K > 1 ? (L[n - K][2] + L[n - K - 1 + 1 - 1][2]) / 2 : Infinity;
    const clusterOf = {}; let cid = 0;
    (function assign(id, c) { const height = id < n ? 0 : kids[id][2]; if (c === undefined && height <= cutH) c = cid++; if (id < n) { clusterOf[id] = c; return; } kids[id].slice(0, 2).forEach(ch => assign(ch, c)); })(2 * n - 2, undefined);
    // remap cluster ids by leaf order
    const remap = {}; let nx = 0; order.forEach(id => { if (remap[clusterOf[id]] === undefined) remap[clusterOf[id]] = nx++; });
    const m = { l: 40, r: 10, t: 12, b: w < 560 ? 92 : 78 };
    const maxH = L[n - 2][2] * 1.05;
    const xs = i => m.l + (order.indexOf(i) + .5) * (w - m.l - m.r) / n, sy = DM.scale(0, maxH, h - m.b, m.t);
    DM.axes(ctx, s, { inv: v => v }, sy, { m, x0: 0, x1: 0, xt: [], y0: 0, y1: maxH, yl: "merge distance" });
    const pos = {}; for (let i = 0; i < n; i++) pos[i] = [xs(i), sy(0)];
    const colOf = id => { if (id < n) return pal[remap[clusterOf[id]] % pal.length]; const leaves = []; (function g(x) { if (x < n) leaves.push(x); else { g(kids[x][0]); g(kids[x][1]); } })(id); const cs = new Set(leaves.map(l => clusterOf[l])); return cs.size === 1 && kids[id][2] <= cutH ? pal[remap[[...cs][0]] % pal.length] : k.muted; };
    L.forEach((r, i) => {
      const id = n + i, [a, b] = [r[0], r[1]], y = sy(r[2]), c = colOf(id);
      ctx.strokeStyle = c; ctx.lineWidth = c === k.muted ? 1.4 : 2.2; ctx.beginPath(); ctx.moveTo(pos[a][0], pos[a][1]); ctx.lineTo(pos[a][0], y); ctx.lineTo(pos[b][0], y); ctx.lineTo(pos[b][0], pos[b][1]); ctx.stroke();
      pos[id] = [(pos[a][0] + pos[b][0]) / 2, y];
    });
    if (K > 1) { ctx.strokeStyle = k.accent; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m.l, sy(cutH)); ctx.lineTo(w - m.r, sy(cutH)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = k.accent; ctx.font = "600 11px " + DM.css("--font"); ctx.textAlign = "right"; ctx.fillText(`cut → ${K} clusters`, w - m.r, sy(cutH) - 5); }
    ctx.font = (w < 560 ? "10px " : "11px ") + DM.css("--font");
    order.forEach(i => { ctx.save(); ctx.translate(xs(i), h - m.b + 6); ctx.rotate(-Math.PI / 2.6); ctx.textAlign = "right"; ctx.fillStyle = pal[remap[clusterOf[i]] % pal.length]; ctx.fillText(UT.names[i], 0, 4); ctx.restore(); });
    const groups = {}; order.forEach(i => (groups[remap[clusterOf[i]]] = groups[remap[clusterOf[i]]] || []).push(UT.names[i]));
    document.getElementById("dGroups").innerHTML = Object.keys(groups).map(g => `<div style="margin:3px 0"><span class="pill" style="color:${pal[g % pal.length]}">Cluster ${+g + 1} · ${groups[g].length}</span> ${groups[g].join(", ")}</div>`).join("");
    document.getElementById("dKV").textContent = K;
  }
  [link, dk].forEach(e => e.addEventListener("input", () => st.redraw()));

  /* ---------- k-means stepper */
  const kK = document.getElementById("kmK"), stepB = document.getElementById("kmStep");
  let pts = [], cents = [], assign = [], phase = "assign", iter = 0, dseed = 5, iseed = 1, conv = false;
  function genData() { const R = DM.rng(dseed); const C = [[.25, .3], [.7, .28], [.5, .72], [.2, .75]]; pts = []; for (let i = 0; i < 220; i++) { const c = C[i % 4], sd = .07 + (i % 4) * .015; pts.push([c[0] + R.norm() * sd, c[1] + R.norm() * sd]); } }
  function initC() { const R = DM.rng(iseed * 17 + 3); cents = Array.from({ length: +kK.value }, () => { const p = pts[Math.floor(R() * pts.length)]; return [p[0], p[1]]; }); assign = pts.map(() => -1); phase = "assign"; iter = 0; conv = false; stepB.textContent = "Step: assign"; }
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const wss = () => assign[0] < 0 ? NaN : pts.reduce((s, p, i) => s + d2(p, cents[assign[i]]), 0);
  function step() {
    if (conv) return;
    if (phase === "assign") { const old = assign.join(); assign = pts.map(p => { let b = 0; cents.forEach((c, j) => { if (d2(p, c) < d2(p, cents[b])) b = j; }); return b; }); if (old === assign.join() && iter > 0) { conv = true; stepB.textContent = "Converged ✓"; } else { phase = "update"; stepB.textContent = "Step: update"; } }
    else { cents = cents.map((c, j) => { const m = pts.filter((_, i) => assign[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; }); phase = "assign"; iter++; stepB.textContent = "Step: assign"; }
    st2.redraw();
  }
  const st2 = DM.canvas(document.getElementById("kmCanvas"), w => w < 560 ? 0.9 : 0.55, draw2);
  function draw2(s) {
    const { ctx, w, h } = s, k = DM.col(); const pal = [k.c1, k.c2, k.c3, k.c4, k.c5, k.c6, k.text, k.muted];
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), pad = .03; const sx = DM.scale(Math.min(...xs) - pad, Math.max(...xs) + pad, 10, w - 10), sy = DM.scale(Math.min(...ys) - pad, Math.max(...ys) + pad, h - 10, 10);
    ctx.strokeStyle = k.border; ctx.strokeRect(10, 10, w - 20, h - 20);
    if (assign[0] >= 0) pts.forEach((p, i) => { ctx.strokeStyle = pal[assign[i]]; ctx.globalAlpha = .18; ctx.beginPath(); ctx.moveTo(sx(p[0]), sy(p[1])); ctx.lineTo(sx(cents[assign[i]][0]), sy(cents[assign[i]][1])); ctx.stroke(); });
    ctx.globalAlpha = 1;
    pts.forEach((p, i) => DM.dot(ctx, sx(p[0]), sy(p[1]), 3.8, assign[i] >= 0 ? pal[assign[i]] : k.muted));
    cents.forEach((c, j) => { const x = sx(c[0]), y = sy(c[1]); ctx.lineWidth = 6; ctx.strokeStyle = k.surface; ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = pal[j]; ctx.stroke(); });
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    const W = wss();
    document.getElementById("kmStats").innerHTML = T("iteration", iter) + T("next step", conv ? "done" : phase) + T("WSS", isNaN(W) ? "—" : W.toFixed(3)) + T("k", cents.length);
    document.getElementById("kmKV").textContent = kK.value;
  }
  stepB.addEventListener("click", step);
  document.getElementById("kmRun").addEventListener("click", () => { let g = 0; (function r() { if (conv || g++ > 60) return; step(); setTimeout(r, 160); })(); });
  document.getElementById("kmInit").addEventListener("click", () => { iseed++; initC(); st2.redraw(); });
  document.getElementById("kmData").addEventListener("click", () => { dseed++; genData(); initC(); st2.redraw(); });
  kK.addEventListener("input", () => { initC(); st2.redraw(); });
  genData(); initC();
})();
