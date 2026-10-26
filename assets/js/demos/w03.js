/* Lecture 3 demo: overfitting with polynomials + CV diagram */
(function () {
  // CV diagram
  const g = document.getElementById("cvrows");
  if (g) {
    let s = "";
    for (let r = 0; r < 5; r++) {
      s += `<text x="0" y="${42 + r * 26}" fill="var(--muted)">${r + 1}</text>`;
      for (let f = 0; f < 5; f++) {
        const val = f === r;
        s += `<rect x="${50 + f * 96}" y="${28 + r * 26}" width="90" height="20" rx="4" fill="${val ? "var(--accent)" : "var(--surface-2)"}" stroke="var(--border-strong)"/>`;
        s += `<text x="${95 + f * 96}" y="${42 + r * 26}" text-anchor="middle" fill="${val ? "#fff" : "var(--muted)"}" font-weight="${val ? 700 : 500}">${val ? "validate" : "train"}</text>`;
      }
      s += `<text x="545" y="${42 + r * 26}" fill="var(--text)">→ RMSE<tspan font-size="9" dy="3">${r + 1}</tspan></text>`;
    }
    s += `<text x="545" y="166" fill="var(--accent)" font-weight="700">CV error = average</text>`;
    g.innerHTML = s;
  }

  const cv = document.getElementById("ofCanvas");
  const deg = document.getElementById("deg"), noise = document.getElementById("noise");
  let seed = 11, train, valid;
  const f = x => Math.sin(2.6 * x) + 0.4 * x;
  function gen() { const R = DM.rng(seed); const nz = +noise.value; const mk = () => Array.from({ length: 30 }, () => { const x = -1 + 2 * R(); return [x, f(x) + nz * R.norm()]; }); train = mk(); valid = mk(); }
  function fit(pts, d) {
    const m = d + 1, A = Array.from({ length: m }, () => Array(m + 1).fill(0));
    pts.forEach(([x, y]) => { const p = []; for (let i = 0; i < m; i++) p.push(Math.pow(x, i)); for (let i = 0; i < m; i++) { for (let j = 0; j < m; j++) A[i][j] += p[i] * p[j]; A[i][m] += p[i] * y; } });
    for (let i = 0; i < m; i++) A[i][i] += 1e-9;
    for (let i = 0; i < m; i++) { let piv = i; for (let r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r; [A[i], A[piv]] = [A[piv], A[i]]; for (let r = 0; r < m; r++) if (r !== i) { const c = A[r][i] / A[i][i]; for (let k = i; k <= m; k++) A[r][k] -= c * A[i][k]; } }
    return A.map((row, i) => row[m] / row[i]);
  }
  const pred = (b, x) => b.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
  const rmse = (b, pts) => Math.sqrt(pts.reduce((s, [x, y]) => s + (y - pred(b, x)) ** 2, 0) / pts.length);
  gen();
  const st = DM.canvas(cv, w => w < 560 ? 1.15 : 0.5, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(), d = +deg.value;
    const narrow = w < 560;
    const W1 = narrow ? w : w * 0.56;
    // left: fit
    const m = { l: 36, r: 10, t: 12, b: 30 }; s.m = m;
    const H1 = narrow ? h * 0.55 : h;
    const sx = DM.scale(-1, 1, m.l, W1 - m.r), sy = DM.scale(-2.4, 2.4, H1 - m.b, m.t);
    DM.axes(ctx, { w: W1, h: H1 }, sx, sy, { m, x0: -1, x1: 1, y0: -2, y1: 2, xl: "x" });
    const b = fit(train, d);
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, W1 - m.l - m.r, H1 - m.t - m.b); ctx.clip();
    ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = -1 + i / 100; i ? ctx.lineTo(sx(x), sy(f(x))) : ctx.moveTo(sx(x), sy(f(x))); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = k.c1; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 400; i++) { const x = -1 + i / 200; const y = pred(b, x); i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y)); } ctx.stroke();
    ctx.restore();
    train.forEach(([x, y]) => DM.dot(ctx, sx(x), sy(y), 4, k.c2));
    valid.forEach(([x, y]) => DM.dot(ctx, sx(x), sy(y), 4, k.surface, k.c3));
    ctx.font = "600 11px " + DM.css("--font"); ctx.fillStyle = k.c2; ctx.fillText("● train", m.l + 8, m.t + 12); ctx.fillStyle = k.c3; ctx.fillText("○ validation", m.l + 64, m.t + 12); ctx.fillStyle = k.muted; ctx.fillText("- - true curve", m.l + 150, m.t + 12);
    // right: error curves
    const ox = narrow ? 0 : W1 + 10, oy = narrow ? H1 + 6 : 0, W2 = narrow ? w : w - W1 - 10, H2 = narrow ? h - H1 - 6 : h;
    const errs = []; for (let q = 1; q <= 12; q++) { const bq = fit(train, q); errs.push([rmse(bq, train), rmse(bq, valid)]); }
    const ymax = Math.min(1.6, Math.max(...errs.map(e => e[1])) * 1.05);
    const m2 = { l: ox + 40, r: 10, t: oy + 12, b: 30 };
    const sx2 = DM.scale(1, 12, m2.l, ox + W2 - m2.r), sy2 = DM.scale(0, ymax, oy + H2 - m2.b, m2.t);
    DM.axes(ctx, { w: ox + W2, h: oy + H2 }, sx2, sy2, { m: { l: m2.l, r: m2.r, t: m2.t, b: m2.b }, x0: 1, x1: 12, y0: 0, y1: ymax, xt: [1, 2, 4, 6, 8, 10, 12], xl: "", yl: "" });
    ctx.fillStyle = k.muted; ctx.textAlign = "center"; ctx.font = "11px " + DM.css("--font"); ctx.fillText("degree → RMSE", ox + W2 / 2 + 15, oy + H2 - 2);
    ctx.save(); ctx.beginPath(); ctx.rect(m2.l, m2.t, ox + W2 - m2.r - m2.l, oy + H2 - m2.b - m2.t); ctx.clip();
    [[0, k.c2, "train"], [1, k.c3, "validation"]].forEach(([j, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.beginPath(); errs.forEach((e, q) => { const x = sx2(q + 1), y = sy2(Math.min(e[j], ymax)); q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); errs.forEach((e, q) => DM.dot(ctx, sx2(q + 1), sy2(Math.min(e[j], ymax)), q + 1 === d ? 5 : 2.5, c)); });
    ctx.restore();
    const best = errs.reduce((bi, e, i) => e[1] < errs[bi][1] ? i : bi, 0) + 1;
    ctx.strokeStyle = k.accent; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(sx2(best), m2.t); ctx.lineTo(sx2(best), oy + H2 - m2.b); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left"; ctx.fillStyle = k.accent; ctx.font = "600 11px " + DM.css("--font"); ctx.fillText("best validation", Math.min(sx2(best) + 4, ox + W2 - 90), m2.t + 12);
    document.getElementById("ofStats").innerHTML = st_("degree", d) + st_("train RMSE", errs[d - 1][0].toFixed(3)) + st_("validation RMSE", errs[d - 1][1].toFixed(3)) + st_("best degree (valid)", best);
    document.getElementById("degV").textContent = d; document.getElementById("noiseV").textContent = noise.value;
  }
  const st_ = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  deg.addEventListener("input", () => st.redraw());
  noise.addEventListener("input", () => { gen(); st.redraw(); });
  document.getElementById("ofNew").addEventListener("click", () => { seed++; gen(); st.redraw(); });
})();
