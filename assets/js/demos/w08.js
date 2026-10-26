const RMW={"i": [60.0, 85.5, 64.8, 61.5, 87.0, 110.1, 108.0, 82.8, 69.0, 93.0, 51.0, 81.0, 75.0, 52.8, 64.8, 43.2, 84.0, 49.2, 59.4, 66.0, 47.4, 33.0, 51.0, 63.0], "l": [18.4, 16.8, 21.6, 20.8, 23.6, 19.2, 17.6, 22.4, 20.0, 20.8, 22.0, 20.0, 19.6, 20.8, 17.2, 20.4, 17.6, 17.6, 16.0, 18.4, 16.4, 18.8, 14.0, 14.8], "o": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
/* Lecture 8 demo: kNN on riding mowers */
(function () {
  const n = RMW.i.length, mean = a => a.reduce((s, v) => s + v, 0) / a.length, sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const mi = mean(RMW.i), si = sd(RMW.i), ml = mean(RMW.l), sl = sd(RMW.l);
  const kk = document.getElementById("kk"), sc = document.getElementById("kScale"), reg = document.getElementById("kRegion");
  let q = [66, 19.5], dragging = false;
  const X0 = 25, X1 = 120, Y0 = 13, Y1 = 25;
  function neigh(x, y, k, scaled) {
    const d = RMW.i.map((v, j) => scaled ? Math.hypot((v - x) / si, (RMW.l[j] - y) / sl) : Math.hypot(v - x, RMW.l[j] - y));
    return d.map((v, j) => [v, j]).sort((a, b) => a[0] - b[0]).slice(0, k);
  }
  let sx, sy;
  const st = DM.canvas(document.getElementById("knnCanvas"), w => w < 560 ? 0.85 : 0.56, draw);
  function draw(s) {
    const { ctx, w, h } = s, kc = DM.col(); s.m = { l: 50, r: 14, t: 12, b: 38 }; const m = s.m;
    sx = DM.scale(X0, X1, m.l, w - m.r); sy = DM.scale(Y0, Y1, h - m.b, m.t);
    const k = +kk.value, scaled = sc.checked;
    if (reg.checked) {
      const step = 6;
      for (let px = m.l; px < w - m.r; px += step) for (let py = m.t; py < h - m.b; py += step) {
        const nb = neigh(sx.inv(px + step / 2), sy.inv(py + step / 2), k, scaled); const v = nb.reduce((t, [, j]) => t + RMW.o[j], 0) / k;
        ctx.fillStyle = v > .5 ? kc.c1 : kc.c2; ctx.globalAlpha = .13; ctx.fillRect(px, py, step, step);
      }
      ctx.globalAlpha = 1;
    }
    DM.axes(ctx, s, sx, sy, { x0: X0, x1: X1, y0: Y0, y1: Y1, xl: "Income ($000)", yl: "Lot size (000 ft²)" });
    const nb = neigh(q[0], q[1], k, scaled);
    // neighbourhood outline
    const r = nb[nb.length - 1][0];
    ctx.strokeStyle = kc.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
    if (scaled) ctx.ellipse(sx(q[0]), sy(q[1]), Math.abs(sx(q[0] + r * si) - sx(q[0])), Math.abs(sy(q[1] + r * sl) - sy(q[1])), 0, 0, 7);
    else ctx.ellipse(sx(q[0]), sy(q[1]), Math.abs(sx(q[0] + r) - sx(q[0])), Math.abs(sy(q[1] + r) - sy(q[1])), 0, 0, 7);
    ctx.stroke(); ctx.setLineDash([]);
    nb.forEach(([, j]) => { ctx.strokeStyle = kc.text; ctx.lineWidth = 1; ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(sx(q[0]), sy(q[1])); ctx.lineTo(sx(RMW.i[j]), sy(RMW.l[j])); ctx.stroke(); ctx.globalAlpha = 1; });
    for (let j = 0; j < n; j++) {
      const isN = nb.some(([, t]) => t === j), x = sx(RMW.i[j]), y = sy(RMW.l[j]);
      if (RMW.o[j]) DM.dot(ctx, x, y, 6, kc.c1); else { ctx.fillStyle = kc.c2; ctx.fillRect(x - 5.5, y - 5.5, 11, 11); }
      if (isN) DM.dot(ctx, x, y, 10, null, kc.text);
    }
    const votes = nb.reduce((t, [, j]) => t + RMW.o[j], 0);
    // star
    ctx.fillStyle = votes / k > .5 ? kc.c1 : kc.c2; ctx.strokeStyle = kc.text; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 5 : 12; ctx.lineTo(sx(q[0]) + rr * Math.cos(a), sy(q[1]) + rr * Math.sin(a)); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = "600 11px " + DM.css("--font"); ctx.fillStyle = kc.c1; ctx.fillText("● owner", m.l + 8, m.t + 12); ctx.fillStyle = kc.c2; ctx.fillText("■ non-owner", m.l + 70, m.t + 12);
    const S = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    document.getElementById("knnStats").innerHTML = S("new household", `$${q[0].toFixed(0)}k · ${q[1].toFixed(1)}k ft²`) + S("votes owner", `${votes} / ${k}`) + S("P(owner)", (votes / k).toFixed(2)) + S("prediction", votes / k > .5 ? "Owner" : "Non-owner");
    document.getElementById("kkV").textContent = k;
  }
  const cv = document.getElementById("knnCanvas");
  const move = e => { const [x, y] = st.pos(e); q = [Math.max(X0, Math.min(X1, sx.inv(x))), Math.max(Y0, Math.min(Y1, sy.inv(y)))]; st.redraw(); };
  cv.addEventListener("pointerdown", e => { dragging = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", e => { if (dragging) move(e); });
  cv.addEventListener("pointerup", () => dragging = false);
  [kk, sc, reg].forEach(e => e.addEventListener("input", () => st.redraw()));
})();
