/* Lecture 11 demo: bagging vs boosting on 1-D regression */
(function () {
  const Bsl = document.getElementById("eB"), LR = document.getElementById("eLR");
  let mode = "bag", seed = 3, train, test, bagTrees, bagCurve, boostStages, boostCurve;
  const f = x => Math.sin(x * 1.3) * 1.2 + 0.25 * x;
  function gen() { const R = DM.rng(seed); const mk = n => Array.from({ length: n }, () => { const x = R() * 6; return [x, f(x) + R.norm() * .5]; }).sort((a, b) => a[0] - b[0]); train = mk(60); test = mk(200); bagTrees = []; bagCurve = []; boostStages = null; }
  function tree(pts, depth, minLeaf) {
    const mean = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    if (depth === 0 || pts.length < 2 * minLeaf) return { v: mean };
    const s = [...pts].sort((a, b) => a[0] - b[0]); let best = null;
    let sl = 0, sl2 = 0; const tot = s.reduce((a, p) => a + p[1], 0), tot2 = s.reduce((a, p) => a + p[1] * p[1], 0);
    for (let i = 0; i < s.length - 1; i++) { sl += s[i][1]; sl2 += s[i][1] ** 2; const nl = i + 1, nr = s.length - nl; if (nl < minLeaf || nr < minLeaf || s[i][0] === s[i + 1][0]) continue; const sse = (sl2 - sl * sl / nl) + ((tot2 - sl2) - (tot - sl) ** 2 / nr); if (!best || sse < best.sse) best = { sse, t: (s[i][0] + s[i + 1][0]) / 2 }; }
    if (!best) return { v: mean };
    return { t: best.t, l: tree(s.filter(p => p[0] <= best.t), depth - 1, minLeaf), r: tree(s.filter(p => p[0] > best.t), depth - 1, minLeaf) };
  }
  const pred = (nd, x) => nd.t === undefined ? nd.v : pred(x <= nd.t ? nd.l : nd.r, x);
  const rmse = (fn) => Math.sqrt(test.reduce((s, [x, y]) => s + (y - fn(x)) ** 2, 0) / test.length);
  function ensureBag(B) { const R = DM.rng(seed * 31 + bagTrees.length); while (bagTrees.length < B) { const bs = Array.from({ length: train.length }, () => train[Math.floor(R() * train.length)]); bagTrees.push(tree(bs, 6, 3)); const n = bagTrees.length; bagCurve.push(rmse(x => bagTrees.reduce((s, t) => s + pred(t, x), 0) / n)); } }
  function ensureBoost() {
    if (boostStages && boostStages.lr === +LR.value) return;
    const eta = +LR.value, base = train.reduce((s, p) => s + p[1], 0) / train.length; const stumps = []; let F = train.map(() => base);
    boostCurve = [];
    for (let m = 0; m < 200; m++) { const res = train.map((p, i) => [p[0], p[1] - F[i]]); const st = tree(res, 1, 3); stumps.push(st); F = F.map((v, i) => v + eta * pred(st, train[i][0])); const k = stumps.length; boostCurve.push(rmse(x => base + eta * stumps.slice(0, k).reduce((s, t) => s + pred(t, x), 0))); }
    boostStages = { lr: eta, base, stumps };
  }
  const st = DM.canvas(document.getElementById("ensCanvas"), w => w < 600 ? 1.15 : 0.48, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(), B = +Bsl.value, narrow = w < 600;
    const W1 = narrow ? w : w * 0.62, H1 = narrow ? h * 0.58 : h, m = { l: 34, r: 8, t: 10, b: 26 };
    const sx = DM.scale(0, 6, m.l, W1 - m.r), sy = DM.scale(-2.6, 3.6, H1 - m.b, m.t);
    DM.axes(ctx, { w: W1, h: H1 }, sx, sy, { m, x0: 0, x1: 6, y0: -2, y1: 3, xt: [0, 1, 2, 3, 4, 5, 6] });
    const line = (fn, c, lw, a) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.globalAlpha = a; ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = i / 50; const y = fn(x); i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y)); } ctx.stroke(); ctx.globalAlpha = 1; };
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, W1 - m.l - m.r, H1 - m.t - m.b); ctx.clip();
    let ens, curve;
    if (mode === "bag") {
      ensureBag(B); const show = bagTrees.slice(0, Math.min(B, 25));
      show.forEach(t => line(x => pred(t, x), k.c2, 1, .22));
      ens = x => bagTrees.slice(0, B).reduce((s2, t) => s2 + pred(t, x), 0) / B; curve = bagCurve;
    } else {
      ensureBoost(); const S = boostStages; ens = x => S.base + S.lr * S.stumps.slice(0, B).reduce((s2, t) => s2 + pred(t, x), 0); curve = boostCurve;
      const last = S.stumps[B - 1]; line(x => S.base + S.lr * pred(last, x) * 4, k.c2, 1, .35);
    }
    line(f, k.muted, 1.5, .9);
    train.forEach(([x, y]) => DM.dot(ctx, sx(x), sy(y), 3.2, k.text));
    line(ens, k.c1, 3, 1);
    ctx.restore();
    ctx.font = "600 11px " + DM.css("--font"); ctx.fillStyle = k.c1; ctx.fillText("— ensemble", m.l + 8, m.t + 12); ctx.fillStyle = k.c2; ctx.fillText(mode === "bag" ? "— individual trees" : "— latest stump (×4)", m.l + 84, m.t + 12); ctx.fillStyle = k.muted; ctx.fillText("— true curve", m.l + 210, m.t + 12);
    // curve
    const ox = narrow ? 0 : W1 + 14, oy = narrow ? H1 + 8 : 0, W2 = narrow ? w : w - W1 - 14, H2 = narrow ? h - H1 - 8 : h;
    const n = mode === "bag" ? Math.max(B, Math.min(200, bagCurve.length)) : 200;
    const cu = curve.slice(0, n), lo = Math.min(.45, ...cu), hi = Math.min(1.4, Math.max(...cu));
    const m2 = { l: ox + 38, r: 16, t: oy + 20, b: 28 };
    const cx = DM.scale(1, 200, m2.l, ox + W2 - m2.r), cy = DM.scale(lo * .95, hi * 1.02, oy + H2 - m2.b, m2.t);
    DM.axes(ctx, { w: ox + W2, h: oy + H2 }, cx, cy, { m: m2, x0: 1, x1: 200, y0: lo, y1: hi, xt: [1, 50, 100, 150, 200], yt: DM.ticks(lo * .95, hi, 4) });
    ctx.fillStyle = k.text; ctx.textAlign = "left"; ctx.fillText("test RMSE vs. number of trees", m2.l, oy + 10);
    ctx.strokeStyle = k.c4; ctx.lineWidth = 2; ctx.beginPath(); cu.forEach((v, i) => i ? ctx.lineTo(cx(i + 1), cy(Math.min(v, hi))) : ctx.moveTo(cx(i + 1), cy(Math.min(v, hi)))); ctx.stroke();
    DM.dot(ctx, cx(B), cy(Math.min(curve[B - 1], hi)), 5, k.accent);
    ctx.strokeStyle = k.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(m2.l, cy(.5)); ctx.lineTo(ox + W2 - m2.r, cy(.5)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = k.muted; ctx.font = "10px " + DM.css("--font"); ctx.fillText("noise floor (σ = 0.5)", m2.l + 4, cy(.5) - 4);
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    const single = mode === "bag" ? bagCurve[0] : boostCurve[0];
    document.getElementById("ensStats").innerHTML = T("trees", B) + T("test RMSE now", curve[B - 1].toFixed(3)) + T(mode === "bag" ? "one deep tree" : "after 1 stump", single.toFixed(3)) + T("best in 1–200", Math.min(...cu).toFixed(3));
    document.getElementById("eBV").textContent = B;
  }
  document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; document.querySelectorAll("[data-mode]").forEach(x => x.setAttribute("aria-pressed", x === b)); document.getElementById("eLRw").style.display = mode === "boost" ? "" : "none"; if (mode === "bag") ensureBag(200); st.redraw(); }));
  Bsl.addEventListener("input", () => st.redraw()); LR.addEventListener("input", () => st.redraw());
  document.getElementById("eNew").addEventListener("click", () => { seed++; gen(); ensureBag(200); st.redraw(); });
  gen(); ensureBag(200);
})();
