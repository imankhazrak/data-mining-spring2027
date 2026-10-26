const FP={"items": ["Red", "White", "Blue", "Orange", "Green", "Yellow"], "rows": [[1, 1, 0, 0, 1, 0], [0, 1, 0, 1, 0, 0], [0, 1, 1, 0, 0, 0], [1, 1, 0, 1, 0, 0], [1, 0, 1, 0, 0, 0], [0, 1, 1, 0, 0, 0], [1, 0, 1, 0, 0, 0], [1, 1, 1, 0, 1, 0], [1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1]]};
const CR={"users": ["LN", "MH", "JH", "EN", "DU", "FL", "GL", "AH", "SA", "RW", "BA", "MG", "AF", "KG", "DS"], "items": ["SQL", "Spatial", "PA1", "DM in R", "Python", "Forecast", "R Prog", "Hadoop", "Regression"], "r": [[4, null, null, null, 3, 2, 4, null, 2], [3, 4, null, null, 4, null, null, null, null], [2, 2, null, null, null, null, null, null, null], [4, null, null, 4, null, null, 4, null, 3], [4, 4, null, null, null, null, null, null, null], [null, 4, null, null, null, null, null, null, null], [null, 4, null, null, null, null, null, null, null], [null, 3, null, null, null, null, null, null, null], [null, null, 4, null, null, null, null, null, null], [null, null, 2, null, null, null, null, 4, null], [null, null, 4, null, null, null, null, null, null], [null, null, 4, null, null, 4, null, null, null], [null, null, 4, null, null, null, null, null, null], [null, null, 3, null, null, null, null, null, null], [4, null, null, 2, null, null, 4, null, null]]};
// 0.4 0.5714285714285714 0.9523809523809523
/* Lecture 14 demos: rule builder, Apriori table, user-based CF */
(function () {
  const $ = id => document.getElementById(id);
  const N = FP.rows.length, I = FP.items;
  let A = new Set(["Red", "White"]), Cc = new Set(["Green"]);
  const has = (row, set) => [...set].every(it => row[I.indexOf(it)] === 1);
  function chips(el, set, other) {
    el.innerHTML = I.map(it => `<button class="btn sm${set.has(it) ? " primary" : ""}" data-it="${it}" ${other.has(it) ? "disabled" : ""} aria-pressed="${set.has(it)}">${it}</button>`).join("");
    el.querySelectorAll("button").forEach(b => b.onclick = () => { const it = b.dataset.it; set.has(it) ? set.delete(it) : set.add(it); paint(); });
  }
  function paint() {
    chips($("fpA"), A, Cc); chips($("fpC"), Cc, A);
    $("fpTable").innerHTML = `<table style="min-width:420px"><thead><tr><th>#</th>${I.map(it => `<th style="text-align:center">${it}</th>`).join("")}</tr></thead><tbody>${FP.rows.map((r, i) => { const a = A.size && has(r, A), both = a && Cc.size && has(r, Cc); return `<tr style="${a ? "background:var(--accent-soft);" : ""}${both ? "font-weight:700" : ""}"><td>${i + 1}</td>${r.map((v, j) => `<td style="text-align:center">${v ? (A.has(I[j]) || Cc.has(I[j]) ? "●" : "○") : ""}</td>`).join("")}</tr>`; }).join("")}</tbody></table>`;
    const nA = FP.rows.filter(r => has(r, A)).length, nC = FP.rows.filter(r => has(r, Cc)).length, nAC = FP.rows.filter(r => has(r, A) && has(r, Cc)).length;
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    if (!A.size || !Cc.size) { $("fpStats").innerHTML = T("rule", "pick both sides"); return; }
    const sup = nAC / N, conf = nA ? nAC / nA : 0, lift = nC ? conf / (nC / N) : 0;
    $("fpStats").innerHTML = T("rule", `{${[...A].join(", ")}} ⇒ {${[...Cc].join(", ")}}`) + T("support", sup.toFixed(2)) + T("confidence", nA ? conf.toFixed(2) : "—") + T("lift", nA && nC ? lift.toFixed(2) : "—") + T("baseline P(THEN)", (nC / N).toFixed(2));
  }
  paint();

  // Apriori table (brute force is fine for 6 items)
  const S = $("apS"), Cf = $("apC");
  function subsets(arr) { const out = []; for (let m = 1; m < (1 << arr.length); m++) out.push(arr.filter((_, i) => m & (1 << i))); return out; }
  const sup = set => FP.rows.filter(r => set.every(it => r[I.indexOf(it)] === 1)).length / N;
  function rules() {
    const ms = +S.value, mc = +Cf.value, out = [];
    subsets(I).filter(s => s.length >= 2 && sup(s) >= ms - 1e-9).forEach(set => {
      subsets(set).filter(a => a.length < set.length).forEach(a => { const c = set.filter(x => !a.includes(x)); const s2 = sup(set), conf = s2 / sup(a); if (conf >= mc - 1e-9) out.push({ a, c, s: s2, conf, lift: conf / sup(c) }); });
    });
    out.sort((x, y) => y.lift - x.lift || y.conf - x.conf);
    $("apRules").innerHTML = out.map(r => `<tr><td>{${r.a.join(", ")}}</td><td>{${r.c.join(", ")}}</td><td class="num">${r.s.toFixed(2)}</td><td class="num">${r.conf.toFixed(2)}</td><td class="num" style="${r.lift > 1 ? "color:var(--ok);font-weight:700" : r.lift < 1 ? "color:var(--bad)" : ""}">${r.lift.toFixed(2)}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">No rules meet these thresholds.</td></tr>`;
    $("apCount").textContent = `${out.length} rule${out.length === 1 ? "" : "s"} meet support ≥ ${ms} and confidence ≥ ${mc}. Lift > 1 in green, < 1 in red. Lower the support to see how quickly the list grows.`;
    $("apSV").textContent = ms; $("apCV").textContent = mc;
  }
  [S, Cf].forEach(e => e.addEventListener("input", rules)); rules();

  // CF
  const U = $("cfU"), It = $("cfI"), K = $("cfK");
  U.innerHTML = CR.users.map(u => `<option>${u}</option>`).join(""); U.value = "EN";
  function fillItems() { const ui = CR.users.indexOf(U.value); const opts = CR.items.filter((_, j) => CR.r[ui][j] === null && CR.r.some((row, v) => v !== ui && row[j] !== null)); It.innerHTML = opts.map(i => `<option>${i}</option>`).join(""); if (opts.includes("Python")) It.value = "Python"; }
  function cos(a, b) { let s = 0, na = 0, nb = 0, c = 0; for (let j = 0; j < CR.items.length; j++) if (CR.r[a][j] !== null && CR.r[b][j] !== null) { s += CR.r[a][j] * CR.r[b][j]; na += CR.r[a][j] ** 2; nb += CR.r[b][j] ** 2; c++; } return c ? { s: s / Math.sqrt(na * nb), c } : null; }
  function cf() {
    const ui = CR.users.indexOf(U.value), j = CR.items.indexOf(It.value), k = +K.value;
    const cand = CR.users.map((_, v) => v).filter(v => v !== ui && CR.r[v][j] !== null).map(v => ({ v, sim: cos(ui, v) })).filter(o => o.sim).sort((a, b) => b.sim.s - a.sim.s || b.sim.c - a.sim.c);
    const nb = cand.slice(0, k), pred = nb.length ? nb.reduce((s, o) => s + o.sim.s * CR.r[o.v][j], 0) / nb.reduce((s, o) => s + o.sim.s, 0) : NaN;
    const rowsToShow = [ui, ...cand.map(o => o.v)];
    $("cfTable").innerHTML = `<table style="min-width:560px"><thead><tr><th>Student</th><th class="num">cosine</th>${CR.items.map(i => `<th style="text-align:center;${i === It.value ? "color:var(--accent)" : ""}">${i}</th>`).join("")}</tr></thead><tbody>${rowsToShow.map((v, q) => { const o = cand.find(c => c.v === v), inN = nb.some(c => c.v === v); return `<tr style="${q === 0 ? "background:var(--accent-soft);font-weight:700" : inN ? "background:var(--ok-soft)" : ""}"><td>${CR.users[v]}${q === 0 ? " (target)" : ""}</td><td class="num" style="white-space:nowrap">${o ? o.sim.s.toFixed(3) + ` <span class="muted small">(${o.sim.c} shared)</span>` : "—"}</td>${CR.r[v].map((x, jj) => `<td style="text-align:center;${jj === j ? "font-weight:700" : ""}">${x === null ? (q === 0 && jj === j ? "?" : "") : "★".repeat(x)}</td>`).join("")}</tr>`; }).join("")}</tbody></table>` + (cand.length ? "" : `<p class="muted small">No one who rated this course shares any course with ${U.value}: cold start.</p>`);
    const T = (a, b) => `<div class="stat"><div class="k">${a}</div><div class="v">${b}</div></div>`;
    $("cfStats").innerHTML = T("predicted rating", isNaN(pred) ? "—" : pred.toFixed(2) + " ★") + T("neighbours used", nb.map(o => CR.users[o.v]).join(", ") || "none") + T("candidates", cand.length);
    $("cfKV").textContent = k;
  }
  U.addEventListener("input", () => { fillItems(); cf(); }); [It, K].forEach(e => e.addEventListener("input", cf));
  fillItems(); cf();
})();
