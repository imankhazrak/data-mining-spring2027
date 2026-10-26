/* Lecture 10 demo: train a tiny neural network live */
(function () {
  const sel = document.getElementById("nnData"), H = document.getElementById("nnH"), dec = document.getElementById("nnDecay"), lr = document.getElementById("nnLR"), play = document.getElementById("nnPlay");
  let data = [], W1, b1, W2, b2, epoch = 0, running = false, losses = [];
  function gen() {
    const R = DM.rng(7 + sel.selectedIndex); data = [];
    for (let i = 0; i < 200; i++) {
      let x, y, c; const t = sel.value;
      if (t === "xor") { x = R() * 2 - 1; y = R() * 2 - 1; c = (x * y > 0) ? 1 : 0; x += R.norm() * .08; y += R.norm() * .08; }
      else if (t === "circle") { x = R() * 2 - 1; y = R() * 2 - 1; c = (x * x + y * y < .42) ? 1 : 0; x += R.norm() * .05; y += R.norm() * .05; }
      else if (t === "moons") { const a = R() * Math.PI; c = i % 2; if (c) { x = Math.cos(a) * .7 - .3; y = Math.sin(a) * .7 - .2; } else { x = .3 - Math.cos(a) * .7; y = .2 - Math.sin(a) * .7; } x += R.norm() * .12; y += R.norm() * .12; }
      else { x = R() * 2 - 1; y = R() * 2 - 1; c = (y > .6 * x + .1 + R.norm() * .15) ? 1 : 0; }
      data.push([x, y, c]);
    }
  }
  function init() { const R = DM.rng(99 + +H.value), h = +H.value; W1 = Array.from({ length: h }, () => [R.norm() * .8, R.norm() * .8]); b1 = Array.from({ length: h }, () => R.norm() * .3); W2 = Array.from({ length: h }, () => R.norm() * .8); b2 = 0; epoch = 0; losses = []; }
  const sig = z => 1 / (1 + Math.exp(-z));
  function fwd(x, y) { const a = W1.map((w, j) => Math.tanh(w[0] * x + w[1] * y + b1[j])); return [a, sig(a.reduce((s, v, j) => s + v * W2[j], b2))]; }
  function trainEpoch() {
    const h = W1.length, eta = +lr.value, lam = +dec.value, n = data.length;
    const gW1 = W1.map(() => [0, 0]), gb1 = Array(h).fill(0), gW2 = Array(h).fill(0); let gb2 = 0, L = 0;
    data.forEach(([x, y, c]) => { const [a, p] = fwd(x, y); const pc = Math.min(1 - 1e-9, Math.max(1e-9, p)); L -= c * Math.log(pc) + (1 - c) * Math.log(1 - pc); const d2 = p - c; gb2 += d2; for (let j = 0; j < h; j++) { gW2[j] += d2 * a[j]; const d1 = d2 * W2[j] * (1 - a[j] * a[j]); gW1[j][0] += d1 * x; gW1[j][1] += d1 * y; gb1[j] += d1; } });
    for (let j = 0; j < h; j++) { W2[j] -= eta * (gW2[j] / n + lam * W2[j]); W1[j][0] -= eta * (gW1[j][0] / n + lam * W1[j][0]); W1[j][1] -= eta * (gW1[j][1] / n + lam * W1[j][1]); b1[j] -= eta * gb1[j] / n; }
    b2 -= eta * gb2 / n; epoch++;
    return L / n;
  }
  const st = DM.canvas(document.getElementById("nnCanvas"), w => w < 600 ? 1.2 : 0.5, draw);
  function draw(s) {
    const { ctx, w, h } = s, k = DM.col(), narrow = w < 600;
    const S1 = narrow ? Math.min(w, h * 0.62) : Math.min(h, w * 0.55), ox = narrow ? (w - S1) / 2 : 0;
    const sx = DM.scale(-1.3, 1.3, ox, ox + S1), sy = DM.scale(-1.3, 1.3, S1, 0);
    const step = 6;
    const c1 = k.c1, c2 = k.c2;
    for (let px = 0; px < S1; px += step) for (let py = 0; py < S1; py += step) {
      const p = fwd(sx.inv(ox + px + step / 2), sy.inv(py + step / 2))[1];
      ctx.fillStyle = p > .5 ? c1 : c2; ctx.globalAlpha = .07 + .3 * Math.abs(p - .5) * 2; ctx.fillRect(ox + px, py, step, step);
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = k.border; ctx.strokeRect(ox, 0, S1, S1);
    let correct = 0;
    data.forEach(([x, y, c]) => { const p = fwd(x, y)[1]; if ((p > .5) === !!c) correct++; DM.dot(ctx, sx(x), sy(y), 3.6, c ? c1 : c2, k.surface); });
    // loss curve
    const lx = narrow ? 0 : S1 + 20, ly = narrow ? S1 + 14 : 0, LW = narrow ? w : w - S1 - 20, LH = narrow ? h - S1 - 14 : h * .55;
    const m = { l: lx + 40, r: 8, t: ly + 18, b: 26 };
    const maxL = Math.max(0.8, ...losses.slice(0, 5));
    const xs = DM.scale(0, Math.max(200, losses.length), m.l, lx + LW - m.r), ys = DM.scale(0, maxL, ly + LH - m.b, m.t);
    DM.axes(ctx, { w: lx + LW, h: ly + LH }, xs, ys, { m, x0: 0, x1: Math.max(200, losses.length), y0: 0, y1: maxL, xt: DM.ticks(0, Math.max(200, losses.length), 4), yt: DM.ticks(0, maxL, 4) });
    ctx.fillStyle = k.text; ctx.font = "600 11px " + DM.css("--font"); ctx.textAlign = "left"; ctx.fillText("training loss (cross-entropy) by epoch", m.l, ly + 10);
    ctx.strokeStyle = k.c4; ctx.lineWidth = 2; ctx.beginPath(); losses.forEach((v, i) => i ? ctx.lineTo(xs(i), ys(v)) : ctx.moveTo(xs(i), ys(v))); ctx.stroke();
    if (!narrow) {
      // network sketch
      const ny = LH + 20, nh = h - ny - 4, hh = W1.length, cx0 = S1 + 50, cx1 = S1 + 20 + LW / 2, cx2 = w - 40;
      const yi = i => ny + nh * (i + 1) / 3, yh = j => ny + nh * (j + 1) / (hh + 1), mw = Math.max(...W1.flat().map(Math.abs), ...W2.map(Math.abs), 1e-6);
      for (let j = 0; j < hh; j++) { [0, 1].forEach(i => { ctx.strokeStyle = W1[j][i] > 0 ? k.c3 : k.c1; ctx.globalAlpha = .7; ctx.lineWidth = .5 + 3 * Math.abs(W1[j][i]) / mw; ctx.beginPath(); ctx.moveTo(cx0, yi(i)); ctx.lineTo(cx1, yh(j)); ctx.stroke(); }); ctx.strokeStyle = W2[j] > 0 ? k.c3 : k.c1; ctx.lineWidth = .5 + 3 * Math.abs(W2[j]) / mw; ctx.beginPath(); ctx.moveTo(cx1, yh(j)); ctx.lineTo(cx2, ny + nh / 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
      [yi(0), yi(1)].forEach(y => DM.dot(ctx, cx0, y, 7, k.info || k.c2, k.surface)); for (let j = 0; j < hh; j++) DM.dot(ctx, cx1, yh(j), 6, k.accent, k.surface); DM.dot(ctx, cx2, ny + nh / 2, 8, k.ok, k.surface);
      ctx.fillStyle = k.muted; ctx.font = "10.5px " + DM.css("--font"); ctx.textAlign = "center"; ctx.fillText("x₁, x₂", cx0, h - 2); ctx.fillText(`${hh} hidden`, cx1, h - 2); ctx.fillText("output", cx2, h - 2);
      ctx.fillText("green = positive weight, orange = negative", (cx0 + cx2) / 2, ny + 6);
    }
    const nP = W1.length * 4 + 1;
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    document.getElementById("nnStats").innerHTML = T("epoch", epoch) + T("loss", losses.length ? losses[losses.length - 1].toFixed(3) : "—") + T("training accuracy", (100 * correct / data.length).toFixed(1) + "%") + T("parameters", nP);
    document.getElementById("nnHV").textContent = H.value;
  }
  function loop() { if (!running) return; for (let i = 0; i < 15; i++) { losses.push(trainEpoch()); } st.redraw(); if (epoch >= 6000) { running = false; play.textContent = "▶ Train"; return; } requestAnimationFrame(loop); }
  play.addEventListener("click", () => { running = !running; play.textContent = running ? "❚❚ Pause" : "▶ Train"; if (running) loop(); });
  document.getElementById("nnReset").addEventListener("click", () => { init(); st.redraw(); });
  sel.addEventListener("input", () => { gen(); init(); st.redraw(); });
  H.addEventListener("input", () => { init(); st.redraw(); });
  [dec, lr].forEach(e => e.addEventListener("input", () => st.redraw()));
  gen(); init();
})();
