/* ==========================================================================
   lecture.js — interactive lecture components
   concept map · predict-then-reveal · self-check · R/Python code walks ·
   section progress · pager · tiny canvas kit for demos
   ========================================================================== */
(function () {
  const C = window.COURSE, ROOT = DM.root;
  const body = document.body;
  const N = +body.dataset.lecture;
  const L = C.lectures.find(l => l.n === N);
  const idx = C.lectures.indexOf(L);
  const mod = C.modules.find(m => m.id === L.module);
  document.documentElement.style.setProperty("--mc", `var(--m${L.module})`);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- hero meta */
  const hero = $(".lec-hero");
  if (hero) {
    const dates = DM.lectureDates(N);
    const eb = hero.querySelector(".eyebrow");
    if (eb) eb.innerHTML = `Lecture ${String(N).padStart(2, "0")} · Module ${mod.id}: ${mod.name}`;
    const meta = hero.querySelector(".lec-meta");
    if (meta) {
      const extra = meta.innerHTML;
      meta.innerHTML = (dates.length ? `<span class="pill class">${dates.map(d => DM.fmt(d, { dow: true })).join(" · ")}</span>` : "") +
        `<span class="pill">Dataset: <a href="${ROOT}data/${L.data}.csv" download>${L.data}.csv</a></span>` + extra;
    }
  }

  /* ---------- sections, numbering, toc, done buttons */
  const secs = $$(".lsec");
  const prog = DM.progress.get(N);
  prog.total = secs.length;
  prog.done = prog.done.filter(id => secs.some(s => s.id === id));
  DM.progress.set(N, prog);

  secs.forEach((s, i) => {
    const h = s.querySelector("h2");
    if (h && !h.querySelector(".sn")) h.insertAdjacentHTML("afterbegin", `<span class="sn">${String(i + 1).padStart(2, "0")}</span>`);
    const row = document.createElement("div");
    row.className = "done-row";
    row.innerHTML = `<button class="done-btn" aria-pressed="false"><span class="box"></span>Mark this section done</button>`;
    s.appendChild(row);
    const b = row.firstElementChild;
    const paint = () => { const d = prog.done.includes(s.id); b.setAttribute("aria-pressed", d); b.querySelector(".box").textContent = d ? "✓" : ""; b.lastChild.textContent = d ? "Section done" : "Mark this section done"; };
    paint();
    b.addEventListener("click", () => {
      const k = prog.done.indexOf(s.id);
      if (k >= 0) prog.done.splice(k, 1); else prog.done.push(s.id);
      DM.progress.set(N, prog); paint(); paintProgress();
      if (k < 0 && prog.done.length === prog.total) DM.toast("Lecture complete — nice work!");
    });
  });

  // top bar
  const top = document.createElement("div");
  top.className = "lec-top";
  top.innerHTML = `<div class="wrap"><div class="crumb"><a href="${ROOT}index.html#lectures">Lectures</a> / ${String(N).padStart(2, "0")} · ${esc(L.title)}</div>
    <div class="lec-progress"><span id="progTxt"></span><span class="bar"><i id="progBar"></i></span></div></div>`;
  const hdr = $(".site-header");
  hdr.after(top);

  // side toc
  const tocHtml = secs.map(s => `<li><a href="#${s.id}" data-id="${s.id}">${esc((s.querySelector("h2")?.dataset.short) || s.querySelector("h2").textContent.replace(/^\d+/, "").trim())}</a></li>`).join("");
  const side = $(".lec-side");
  if (side) side.innerHTML = `<h4>On this page</h4><ol>${tocHtml}</ol>`;
  const inl = $(".toc-inline");
  if (inl) inl.innerHTML = `<summary>On this page (${secs.length} sections)</summary><ol>${secs.map(s => `<li><a href="#${s.id}">${esc(s.querySelector("h2").textContent.replace(/^\d+/, "").trim())}</a></li>`).join("")}</ol>`;

  function paintProgress() {
    const pct = prog.total ? Math.round(100 * prog.done.length / prog.total) : 0;
    $("#progTxt").textContent = `${prog.done.length}/${prog.total} done`;
    $("#progBar").style.width = pct + "%";
    $$(".lec-side a").forEach(a => a.classList.toggle("done", prog.done.includes(a.dataset.id)));
  }
  paintProgress();

  // scrollspy
  const sideLinks = $$(".lec-side a");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) sideLinks.forEach(a => a.classList.toggle("active", a.dataset.id === e.target.id));
  }), { rootMargin: "-25% 0px -65% 0px" });
  secs.forEach(s => io.observe(s));

  /* ---------- concept map */
  $$(".cmap[data-map]").forEach(el => {
    const m = JSON.parse(el.dataset.map);
    const W = m.w || 760, H = m.h || 300;
    const nodes = {};
    const pad = 14;
    m.nodes.forEach(n => { n.wd = Math.max(90, n.label.length * 7.4 + pad * 2); n.ht = 38; nodes[n.id] = n; });
    const edge = (a, b, lab) => {
      const A = nodes[a], B = nodes[b];
      const dx = B.x - A.x, dy = B.y - A.y;
      const clip = (n, dx, dy) => { const sx = (n.wd / 2) / Math.abs(dx || 1e-6), sy = (n.ht / 2) / Math.abs(dy || 1e-6); const s = Math.min(sx, sy); return [n.x + dx * s, n.y + dy * s]; };
      const [x1, y1] = clip(A, dx, dy), [x2, y2] = clip(B, -dx, -dy);
      const lx = (x1 + x2) / 2, ly = (y1 + y2) / 2;
      return `<path class="edge" d="M${x1},${y1} L${x2},${y2}"/>` + (lab ? `<text class="elabel" x="${lx}" y="${ly - 6}" text-anchor="middle">${esc(lab)}</text>` : "");
    };
    const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Concept map">
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--border-strong)"/></marker></defs>
      ${(m.edges || []).map(e => edge(...e)).join("")}
      ${m.nodes.map(n => `<g class="node ${n.state || ""}" data-href="${n.href || ""}" tabindex="0" role="link" aria-label="${esc(n.label)}">
        <rect x="${n.x - n.wd / 2}" y="${n.y - n.ht / 2}" width="${n.wd}" height="${n.ht}" rx="10"/>
        <text x="${n.x}" y="${n.y + 4.5}" text-anchor="middle">${esc(n.label)}</text></g>`).join("")}
    </svg>
    <div class="cmap-legend"><span class="l-prev">Earlier lectures</span><span class="l-today">Today</span><span class="l-later">Coming up</span><span>Click a node to jump</span></div>`;
    el.innerHTML = svg;
    const go = g => {
      let h = g.dataset.href; if (!h) return;
      if (/^L\d+$/.test(h)) { const t = C.lectures.find(l => l.n === +h.slice(1)); if (t) location.href = t.file; }
      else if (h.startsWith("#")) { const t = document.querySelector(h); if (t) t.scrollIntoView(); }
      else location.href = h;
    };
    $$(".node", el).forEach(g => { g.addEventListener("click", () => go(g)); g.addEventListener("keydown", e => { if (e.key === "Enter") go(g); }); });
  });

  /* ---------- options helper */
  const letter = i => "abcdefgh"[i];
  function setupOpts(box, single = true) {
    const opts = $$(".opt", box);
    opts.forEach((o, i) => {
      o.dataset.k = o.dataset.k || letter(i);
      if (!o.querySelector(".k")) o.insertAdjacentHTML("afterbegin", `<span class="k">${o.dataset.k.toUpperCase()}</span>`);
      o.setAttribute("aria-pressed", "false"); o.type = "button";
      o.addEventListener("click", () => {
        if (box.dataset.locked) return;
        if (single) opts.forEach(x => x.setAttribute("aria-pressed", "false"));
        o.setAttribute("aria-pressed", o.getAttribute("aria-pressed") === "true" ? "false" : "true");
      });
    });
    return opts;
  }

  /* ---------- predict-then-reveal */
  $$(".predict").forEach((p, i) => {
    const inner = p.innerHTML;
    p.innerHTML = `<div class="ph"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>${p.dataset.label || "Predict, then reveal"}</div><div class="pb">${inner}</div>`;
    const pb = $(".pb", p), rev = $(".reveal", pb), ans = p.dataset.answer;
    const opts = setupOpts(pb);
    const act = document.createElement("div"); act.className = "actions";
    if (opts.length) {
      act.innerHTML = `<button class="btn sm primary" type="button">Check</button><button class="btn sm ghost" type="button">Just show me</button><span class="muted small fb"></span>`;
      const [chk, show] = $$("button", act), fb = $(".fb", act);
      chk.addEventListener("click", () => {
        const sel = opts.find(o => o.getAttribute("aria-pressed") === "true");
        if (!sel) { fb.textContent = "Pick an answer first."; return; }
        pb.dataset.locked = 1;
        opts.forEach(o => { if (o.dataset.k === ans) o.classList.add("right"); else if (o === sel) o.classList.add("wrong"); });
        const ok = sel.dataset.k === ans;
        fb.textContent = ok ? "Correct." : "Not quite — read why below.";
        rev.classList.add("show"); rev.classList.toggle("miss", !ok); chk.disabled = true; show.disabled = true;
      });
      show.addEventListener("click", () => { pb.dataset.locked = 1; opts.forEach(o => { if (o.dataset.k === ans) o.classList.add("right"); }); rev.classList.add("show"); chk.disabled = true; show.disabled = true; });
    } else {
      act.innerHTML = `<button class="btn sm primary" type="button">Reveal</button>`;
      const ta = document.createElement("textarea"); ta.className = "write-down"; ta.rows = 2; ta.placeholder = "Write your prediction down first…";
      rev.before(ta);
      act.firstChild.addEventListener("click", () => { rev.classList.add("show"); act.firstChild.disabled = true; });
    }
    rev.before(act);
  });

  /* ---------- self-check quiz */
  $$(".quiz").forEach(qz => {
    const qs = $$(".qq", qz);
    qs.forEach((q, i) => { const qt = $(".q", q); qt.insertAdjacentHTML("afterbegin", `<b>Q${i + 1}</b>`); setupOpts(q); });
    const act = document.createElement("div"); act.className = "actions";
    act.innerHTML = `<button class="btn primary" type="button">Grade</button><button class="btn ghost" type="button">Reset</button><span class="score" aria-live="polite"></span>`;
    qz.appendChild(act);
    qz.insertAdjacentHTML("beforeend", `<div class="quiz-note">Ungraded and private: answers are checked in your browser and never sent anywhere.</div>`);
    const [g, r] = $$("button.btn", act), sc = $(".score", act);
    g.addEventListener("click", () => {
      let right = 0;
      qs.forEach(q => {
        q.dataset.locked = 1;
        const sel = $$(".opt", q).find(o => o.getAttribute("aria-pressed") === "true");
        $$(".opt", q).forEach(o => { o.classList.remove("right", "wrong"); if (o.dataset.k === q.dataset.answer) o.classList.add("right"); else if (o === sel) o.classList.add("wrong"); });
        if (sel && sel.dataset.k === q.dataset.answer) right++;
      });
      qz.classList.add("graded");
      sc.textContent = `${right} / ${qs.length}` + (right === qs.length ? " — perfect!" : right >= qs.length - 1 ? " — almost there." : " — review the explanations.");
      DM.store.set("dm-quiz-" + N, { right, total: qs.length });
    });
    r.addEventListener("click", () => {
      qs.forEach(q => { delete q.dataset.locked; $$(".opt", q).forEach(o => { o.classList.remove("right", "wrong"); o.setAttribute("aria-pressed", "false"); }); });
      qz.classList.remove("graded"); sc.textContent = "";
    });
  });

  /* ---------- code blocks */
  const langName = { r: "R", py: "Python", bash: "Shell", text: "Output" };
  $$("pre.code").forEach(pre => {
    const lang = pre.classList.contains("r") ? "r" : pre.classList.contains("py") ? "py" : pre.classList.contains("bash") ? "bash" : "text";
    const wrap = document.createElement("div"); wrap.className = "codeblock";
    if (lang === "r" || lang === "py") wrap.dataset.langOnly = lang;
    wrap.innerHTML = `<div class="cb-head"><span>${langName[lang]}</span><button class="copy" type="button">Copy</button></div>`;
    pre.before(wrap);
    const code = document.createElement("code");
    code.className = "language-" + ({ r: "r", py: "python", bash: "bash", text: "plaintext" }[lang]);
    // dedent
    const raw = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    const ind = Math.min(...raw.split("\n").filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    code.textContent = raw.split("\n").map(l => l.slice(ind)).join("\n");
    pre.textContent = ""; pre.appendChild(code); pre.className = "";
    wrap.appendChild(pre);
    $(".copy", wrap).addEventListener("click", () => {
      const t = code.textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => DM.toast("Copied"), () => {
        const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); DM.toast("Copied"); } catch (e) {} ta.remove();
      });
    });
  });
  // the step-level "see"/output blocks that are language specific: <div class="see r">
  $$(".see.r, .output.r").forEach(e => e.dataset.langOnly = "r");
  $$(".see.py, .output.py").forEach(e => e.dataset.langOnly = "py");

  // language switches
  $$(".lang-switch-slot").forEach(slot => {
    slot.outerHTML = `<div class="lang-switch" role="group" aria-label="Code language"><button type="button" data-l="r">R</button><button type="button" data-l="py">Python</button></div>`;
  });
  const paintLang = () => $$(".lang-switch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === document.documentElement.dataset.code));
  $$(".lang-switch button").forEach(b => b.addEventListener("click", () => { document.documentElement.dataset.code = b.dataset.l; DM.store.set("dm-code", b.dataset.l); paintLang(); }));
  paintLang();

  function highlight() { if (window.hljs) $$(".codeblock code").forEach(c => { if (!c.dataset.hl) { hljs.highlightElement(c); c.dataset.hl = 1; } }); }
  function math() { if (window.renderMathInElement) renderMathInElement(document.querySelector(".lec-body"), { delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }], throwOnError: false }); }
  window.addEventListener("load", () => { highlight(); math(); });

  /* ---------- pager */
  const prev = C.lectures[idx - 1], next = C.lectures[idx + 1];
  const pager = document.createElement("nav"); pager.className = "pager"; pager.setAttribute("aria-label", "Lecture navigation");
  pager.innerHTML = (prev ? `<a class="prev" href="${prev.file}"><small>‹ Back · Lecture ${prev.n}</small><b>${esc(prev.title)}</b></a>` : `<a class="prev" href="${ROOT}index.html#lectures"><small>‹ Back</small><b>All lectures</b></a>`) +
    (next ? `<a class="next" href="${next.file}"><small>Next · Lecture ${next.n} ›</small><b>${esc(next.title)}</b></a>` : `<a class="next" href="${ROOT}schedule.html"><small>Next ›</small><b>Course schedule</b></a>`);
  const lb = $(".lec-body");
  lb.appendChild(pager);
  lb.insertAdjacentHTML("beforeend", `<div class="pager-note">← → keys also work</div>`);
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea,select,[contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") location.href = $(".pager .prev").href;
    if (e.key === "ArrowRight") location.href = $(".pager .next").href;
  });

  /* ======================================================================
     Canvas kit for demos
     ====================================================================== */
  DM.canvas = function (cv, aspect = 0.62, draw) {
    const ctx = cv.getContext("2d");
    const st = { cv, ctx, w: 0, h: 0, draw };
    function size() {
      const r = cv.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      st.w = Math.max(260, r.width); st.h = Math.round(st.w * (typeof aspect === "function" ? aspect(st.w) : aspect));
      cv.style.height = st.h + "px"; cv.width = Math.round(st.w * dpr); cv.height = Math.round(st.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); st.draw && st.draw(st);
    }
    st.redraw = () => { ctx.clearRect(0, 0, st.w, st.h); st.draw && st.draw(st); };
    new ResizeObserver(size).observe(cv);
    window.addEventListener("dm-theme", () => st.redraw());
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => st.redraw());
    st.redraw = () => { if (!st.w) return; ctx.clearRect(0, 0, st.w, st.h); st.draw && st.draw(st); };
    st.pos = e => { const r = cv.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return [p.clientX - r.left, p.clientY - r.top]; };
    return st;
  };
  DM.scale = (d0, d1, r0, r1) => { const f = v => r0 + (v - d0) / (d1 - d0) * (r1 - r0); f.inv = p => d0 + (p - r0) / (r1 - r0) * (d1 - d0); return f; };
  DM.col = () => ({
    text: DM.css("--text"), muted: DM.css("--muted"), border: DM.css("--border"), grid: DM.css("--surface-2"), surface: DM.css("--surface"),
    c1: DM.css("--c1"), c2: DM.css("--c2"), c3: DM.css("--c3"), c4: DM.css("--c4"), c5: DM.css("--c5"), c6: DM.css("--c6"), ok: DM.css("--ok"), bad: DM.css("--bad"), accent: DM.css("--accent")
  });
  DM.axes = function (ctx, st, sx, sy, o = {}) {
    const k = DM.col(); const m = o.m || st.m;
    ctx.save(); ctx.font = "11px " + DM.css("--font"); ctx.fillStyle = k.muted; ctx.strokeStyle = k.border; ctx.lineWidth = 1;
    const tx = o.xt || ticks(o.x0, o.x1, 6), ty = o.yt || ticks(o.y0, o.y1, 5);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    tx.forEach(v => { const x = sx(v); ctx.beginPath(); ctx.moveTo(x, m.t); ctx.lineTo(x, st.h - m.b); ctx.globalAlpha = .55; ctx.stroke(); ctx.globalAlpha = 1; ctx.fillText(o.fx ? o.fx(v) : fmtN(v), x, st.h - m.b + 5); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ty.forEach(v => { const y = sy(v); ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(st.w - m.r, y); ctx.globalAlpha = .55; ctx.stroke(); ctx.globalAlpha = 1; ctx.fillText(o.fy ? o.fy(v) : fmtN(v), m.l - 6, y); });
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(o.xl, (m.l + st.w - m.r) / 2, st.h - 2); }
    if (o.yl) { ctx.translate(11, (m.t + st.h - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.yl, 0, -8); }
    ctx.restore();
  };
  function ticks(a, b, n) { const span = b - a, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))), r = step0 / mag; const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag; const out = []; for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10)); return out; }
  function fmtN(v) { return Math.abs(v) >= 1000 ? (v / 1000) + "k" : String(+v.toFixed(3)); }
  DM.ticks = ticks; DM.fmtN = fmtN;
  DM.dot = (ctx, x, y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } };
  // seeded RNG so demos are reproducible
  DM.rng = seed => { let s = seed >>> 0 || 1; const u = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296); }; u.norm = () => { let a = 0, b = 0; while (!a) a = u(); while (!b) b = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }; return u; };
  DM.$ = $; DM.$$ = $$;
})();
