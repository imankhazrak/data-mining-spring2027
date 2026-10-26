/* Lecture 4 demo: logistic curve, log-likelihood, MLE, cutoff */
(function () {
  const R = DM.rng(21);
  const data = Array.from({ length: 120 }, () => { const inc = 10 + Math.pow(R(), 1.3) * 190; const p = 1 / (1 + Math.exp(-(-7 + 0.055 * inc))); return [inc, R() < p ? 1 : 0]; });
  const b0 = document.getElementById("lb0"), b1 = document.getElementById("lb1"), cut = document.getElementById("lcut");
  let A = +b0.value, B = +b1.value;
  const sig = z => 1 / (1 + Math.exp(-z));
  const ll = (a, b) => data.reduce((s, [x, y]) => { const p = Math.min(1 - 1e-12, Math.max(1e-12, sig(a + b * x))); return s + (y ? Math.log(p) : Math.log(1 - p)); }, 0);
  const cv = document.getElementById("lgCanvas");
  const st = DM.canvas(cv, 0.52, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(); s.m = { l: 44, r: 14, t: 16, b: 36 }; const m = s.m;
    const sx = DM.scale(0, 210, m.l, w - m.r), sy = DM.scale(-0.08, 1.08, h - m.b, m.t);
    DM.axes(ctx, s, sx, sy, { x0: 0, x1: 210, y0: 0, y1: 1, yt: [0, .25, .5, .75, 1], xl: "Income ($000)", yl: "P(accept)" });
    const a = A, b = B, c = +cut.value;
    // decision boundary x where sig = c
    const xb = b !== 0 ? (Math.log(c / (1 - c)) - a) / b : NaN;
    if (isFinite(xb) && xb > 0 && xb < 210) {
      ctx.fillStyle = k.accent; ctx.globalAlpha = .07; b > 0 ? ctx.fillRect(sx(xb), m.t, w - m.r - sx(xb), h - m.t - m.b) : ctx.fillRect(m.l, m.t, sx(xb) - m.l, h - m.t - m.b); ctx.globalAlpha = 1;
      ctx.strokeStyle = k.accent; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx(xb), m.t); ctx.lineTo(sx(xb), h - m.b); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = k.muted; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(m.l, sy(c)); ctx.lineTo(w - m.r, sy(c)); ctx.stroke(); ctx.setLineDash([]);
    const jit = DM.rng(5);
    let tp = 0, fp = 0, tn = 0, fn = 0;
    data.forEach(([x, y]) => { const pr = sig(a + b * x) >= c; if (pr && y) tp++; else if (pr && !y) fp++; else if (!pr && y) fn++; else tn++; DM.dot(ctx, sx(x), sy(y + (jit() - .5) * .07), 3.6, y ? k.c1 : k.c2); });
    ctx.strokeStyle = k.text; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 210; i++) { const y = sig(a + b * i); i ? ctx.lineTo(sx(i), sy(y)) : ctx.moveTo(sx(i), sy(y)); } ctx.stroke();
    document.getElementById("lb0v").textContent = a.toFixed(1); document.getElementById("lb1v").textContent = b.toFixed(3); document.getElementById("lcutv").textContent = c.toFixed(2);
    const S = (kk, v) => `<div class="stat"><div class="k">${kk}</div><div class="v">${v}</div></div>`;
    document.getElementById("lgStats").innerHTML = S("log-likelihood", ll(a, b).toFixed(1)) + S("odds ratio e^β₁", Math.exp(b).toFixed(3)) + S("accuracy", ((tp + tn) / data.length * 100).toFixed(1) + "%") + S("acceptors caught", `${tp}/${tp + fn}`) + S("false alarms", fp);
  }
  [b0, b1, cut].forEach(e => e.addEventListener("input", () => { A = +b0.value; B = +b1.value; st.redraw(); }));
  document.getElementById("lgFit").addEventListener("click", () => {
    // Newton-Raphson from the current values (scaled x for stability), animated
    let a = A, b = B, it = 0;
    (function step() {
      let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
      data.forEach(([x, y]) => { const p = sig(a + b * x), wgt = p * (1 - p); g0 += y - p; g1 += (y - p) * x; h00 += wgt; h01 += wgt * x; h11 += wgt * x * x; });
      const det = h00 * h11 - h01 * h01; if (Math.abs(det) < 1e-12) return;
      let da = (h11 * g0 - h01 * g1) / det, db = (-h01 * g0 + h00 * g1) / det;
      const lim = 1.5; const sc = Math.max(1, Math.abs(da) / lim, Math.abs(db) / (lim / 50)); a += da / sc; b += db / sc;
      A = a; B = b; b0.value = a; b1.value = b; st.redraw();
      if (++it < 25 && (Math.abs(da) > 1e-4 || Math.abs(db) > 1e-6)) setTimeout(step, 90);
    })();
  });
})();
