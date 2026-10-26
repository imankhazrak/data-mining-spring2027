/* Lecture 12 demo: base rate, costs and the cutoff */
(function () {
  const PIS = [0.005, 0.01, 0.05, 0.1, 0.25, 0.5];
  const pi = document.getElementById("rPi"), fn = document.getElementById("rFN"), fp = document.getElementById("rFP"), cut = document.getElementById("rCut");
  // standard-normal quantiles for a smooth, deterministic "sample"
  const M = 4000, z = []; const erfinv = x => { const a = .147, l = Math.log(1 - x * x), t = 2 / (Math.PI * a) + l / 2; return Math.sign(x) * Math.sqrt(Math.sqrt(t * t - l / a) - t); };
  for (let i = 0; i < M; i++) z.push(Math.SQRT2 * erfinv(2 * (i + .5) / M - 1));
  const sig = v => 1 / (1 + Math.exp(-v));
  function rates(c, p0) {
    // negatives: score s ~ N(-1.2,1); positives ~ N(1.2,1); calibrated prob = sig(2.4 s + logit(p0))
    const L = Math.log(p0 / (1 - p0)); let tpr = 0, fpr = 0;
    for (let i = 0; i < M; i++) { if (sig(2.4 * (z[i] + 1.2) + L) >= c) tpr++; if (sig(2.4 * (z[i] - 1.2) + L) >= c) fpr++; }
    return [tpr / M, fpr / M];
  }
  const st = DM.canvas(document.getElementById("rareCanvas"), w => w < 560 ? 0.95 : 0.48, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(); const p0 = PIS[+pi.value], CFN = +fn.value, CFP = +fp.value, c = +cut.value;
    s.m = { l: 52, r: 52, t: 16, b: 36 }; const m = s.m;
    const cs = []; for (let q = 1; q <= 99; q++) { const cc = q / 100, [tpr, fpr] = rates(cc, p0); const cost = 1000 * (p0 * (1 - tpr) * CFN + (1 - p0) * fpr * CFP); cs.push({ cc, tpr, fpr, cost, acc: p0 * tpr + (1 - p0) * (1 - fpr) }); }
    const naive = 1000 * p0 * CFN, cmax = Math.max(naive, ...cs.map(o => o.cost)) * 1.05;
    const sx = DM.scale(0, 1, m.l, w - m.r), sy = DM.scale(0, cmax, h - m.b, m.t), sy2 = DM.scale(0, 1, h - m.b, m.t);
    DM.axes(ctx, s, sx, sy, { x0: 0, x1: 1, y0: 0, y1: cmax, xl: "cutoff", yl: "expected cost per 1,000 records" });
    ctx.fillStyle = k.muted; ctx.font = "11px " + DM.css("--font"); ctx.textAlign = "left"; [0, .25, .5, .75, 1].forEach(v => ctx.fillText(Math.round(v * 100) + "%", w - m.r + 6, sy2(v) + 4));
    const curve = (key, sc, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); cs.forEach((o, i) => i ? ctx.lineTo(sx(o.cc), sc(o[key])) : ctx.moveTo(sx(o.cc), sc(o[key]))); ctx.stroke(); ctx.setLineDash([]); };
    ctx.strokeStyle = k.muted; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(m.l, sy(naive)); ctx.lineTo(w - m.r, sy(naive)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = k.muted; ctx.textAlign = "right"; ctx.fillText("naive rule (flag nobody)", w - m.r - 6, sy(naive) - 5); ctx.textAlign = "left";
    curve("cost", sy, k.c1, 3); curve("acc", sy2, k.c2, 2); curve("tpr", sy2, k.c3, 2, [6, 4]);
    const best = cs.reduce((a, b) => b.cost < a.cost ? b : a);
    const theory = CFP / (CFP + CFN);
    ctx.strokeStyle = k.c4; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(sx(theory), m.t); ctx.lineTo(sx(theory), h - m.b); ctx.stroke(); ctx.setLineDash([]);
    DM.dot(ctx, sx(best.cc), sy(best.cost), 6, k.ok, k.surface);
    ctx.strokeStyle = k.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx(c), m.t); ctx.lineTo(sx(c), h - m.b); ctx.stroke();
    const [tpr, fpr] = rates(c, p0), acc = p0 * tpr + (1 - p0) * (1 - fpr), cost = 1000 * (p0 * (1 - tpr) * CFN + (1 - p0) * fpr * CFP);
    const prec = p0 * tpr + (1 - p0) * fpr > 0 ? p0 * tpr / (p0 * tpr + (1 - p0) * fpr) : 0;
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    document.getElementById("rareStats").innerHTML = T("accuracy", (100 * acc).toFixed(1) + "%") + T("sensitivity", tpr.toFixed(2)) + T("precision", prec.toFixed(2)) + T("cost / 1,000", Math.round(cost)) + T("best cutoff", best.cc.toFixed(2)) + T("theory c*", theory.toFixed(3));
    document.getElementById("rPiV").textContent = (p0 * 100) + "%"; document.getElementById("rFNV").textContent = CFN; document.getElementById("rFPV").textContent = CFP; document.getElementById("rCutV").textContent = c.toFixed(2);
  }
  [pi, fn, fp, cut].forEach(e => e.addEventListener("input", () => st.redraw()));
})();
