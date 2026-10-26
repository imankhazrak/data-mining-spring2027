/* Lecture 2 demo: interactive least squares */
(function () {
  const cv = document.getElementById("olsCanvas");
  const R = DM.rng(4);
  const base = () => Array.from({ length: 18 }, () => { const age = 6 + R() * 66; return [age, 19500 - 140 * age + R.norm() * 1300]; });
  let pts = base();
  const X0 = 0, X1 = 80, Y0 = 0, Y1 = 26000;
  const sq = document.getElementById("olsSq"), hand = document.getElementById("olsHand"), b0 = document.getElementById("b0"), b1 = document.getElementById("b1");
  let drag = -1, sx, sy;
  function ols(p) { const n = p.length; const mx = p.reduce((s, q) => s + q[0], 0) / n, my = p.reduce((s, q) => s + q[1], 0) / n; let sxy = 0, sxx = 0; p.forEach(q => { sxy += (q[0] - mx) * (q[1] - my); sxx += (q[0] - mx) ** 2; }); const b = sxx ? sxy / sxx : 0; return [my - b * mx, b]; }
  const sse = (p, a, b) => p.reduce((s, q) => s + (q[1] - a - b * q[0]) ** 2, 0);
  const st = DM.canvas(cv, 0.58, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(); s.m = { l: 58, r: 14, t: 12, b: 38 }; const m = s.m;
    sx = DM.scale(X0, X1, m.l, w - m.r); sy = DM.scale(Y0, Y1, h - m.b, m.t);
    DM.axes(ctx, s, sx, sy, { x0: X0, x1: X1, y0: Y0, y1: Y1, xl: "Age (months)", yl: "Price (€)" });
    if (pts.length < 2) return;
    const [a, b] = ols(pts); const useHand = hand.checked; const ha = +b0.value, hb = +b1.value;
    const [la, lb] = useHand ? [ha, hb] : [a, b];
    // residuals
    pts.forEach(q => {
      const yh = la + lb * q[0], x = sx(q[0]), y1 = sy(q[1]), y2 = sy(yh);
      if (sq.checked) { const side = Math.abs(y2 - y1); ctx.fillStyle = k.c1; ctx.globalAlpha = .12; ctx.fillRect(x, Math.min(y1, y2), Math.min(side, w - m.r - x), side); ctx.globalAlpha = 1; }
      ctx.strokeStyle = k.c1; ctx.globalAlpha = .7; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); ctx.globalAlpha = 1;
    });
    const line = (A, B, c, dash) => { ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(sx(X0), sy(A + B * X0)); ctx.lineTo(sx(X1), sy(A + B * X1)); ctx.stroke(); ctx.setLineDash([]); };
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, w - m.l - m.r, h - m.t - m.b); ctx.clip();
    if (useHand) line(a, b, k.muted, [6, 5]);
    line(la, lb, useHand ? k.c4 : k.c2);
    ctx.restore();
    pts.forEach((q, i) => DM.dot(ctx, sx(q[0]), sy(q[1]), 5.5, k.surface, i === drag ? k.accent : k.text));
    const n = pts.length, my = pts.reduce((t, q) => t + q[1], 0) / n, sst = pts.reduce((t, q) => t + (q[1] - my) ** 2, 0);
    const S0 = sse(pts, a, b), Sh = sse(pts, ha, hb);
    let html = stat("n", n) + stat("OLS intercept", Math.round(a).toLocaleString()) + stat("OLS slope", b.toFixed(1)) + stat("R²", (1 - S0 / sst).toFixed(3)) + stat("RMSE (train)", Math.round(Math.sqrt(S0 / n)).toLocaleString());
    if (useHand) html += stat("your SSE ÷ OLS SSE", (Sh / S0).toFixed(2) + "×");
    document.getElementById("olsStats").innerHTML = html;
    document.getElementById("b0v").textContent = (+b0.value).toLocaleString(); document.getElementById("b1v").textContent = b1.value;
  }
  const stat = (k, v) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  const near = (x, y) => pts.findIndex(q => Math.hypot(sx(q[0]) - x, sy(q[1]) - y) < 12);
  cv.addEventListener("pointerdown", e => {
    const [x, y] = st.pos(e); const i = near(x, y);
    if (i >= 0 && e.shiftKey) { pts.splice(i, 1); st.redraw(); return; }
    if (i >= 0) { drag = i; cv.setPointerCapture(e.pointerId); }
    else { pts.push([sx.inv(x), sy.inv(y)]); drag = pts.length - 1; cv.setPointerCapture(e.pointerId); }
    st.redraw();
  });
  cv.addEventListener("pointermove", e => { if (drag < 0) return; const [x, y] = st.pos(e); pts[drag] = [Math.max(X0, Math.min(X1, sx.inv(x))), Math.max(Y0, Math.min(Y1, sy.inv(y)))]; st.redraw(); });
  cv.addEventListener("pointerup", () => { drag = -1; st.redraw(); });
  [sq, b0, b1].forEach(el => el.addEventListener("input", () => st.redraw()));
  hand.addEventListener("input", () => { document.getElementById("handCtl").style.display = hand.checked ? "inline-flex" : "none"; st.redraw(); });
  document.getElementById("olsOut").addEventListener("click", () => { pts.push([78, 23000]); st.redraw(); });
  document.getElementById("olsReset").addEventListener("click", () => { pts = base(); st.redraw(); });
})();
