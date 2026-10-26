/* ==========================================================================
   pages.js — renders home, schedule and assignments from config + schedule
   ========================================================================== */
(function () {
  const C = window.COURSE, S = window.SCHEDULE, ROOT = DM.root;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const today = DM.today();
  const D = DM.parseDate;
  const lec = n => C.lectures.find(l => l.n === n);
  const daysUntil = s => Math.round((D(s) - today) / 864e5);
  const rel = s => { const k = daysUntil(s); return k === 0 ? "today" : k === 1 ? "tomorrow" : k > 1 ? `in ${k} days` : `${-k} days ago`; };

  /* Unified event list --------------------------------------------------- */
  function events() {
    const ev = [];
    S.sessions.forEach(s => ev.push({ date: s.date, type: s.type, title: s.title, lec: s.lec, src: "session" }));
    S.assignments.forEach(a => {
      if (a.out && a.kind === "Homework") ev.push({ date: a.out, type: "out", title: `${a.id} released — ${a.title}`, src: "assign", a });
      if (a.kind !== "Exam") ev.push({ date: a.due, type: a.kind === "Project" ? "project" : "due", title: `${a.id} due${a.time ? " (" + a.time + ")" : ""} — ${a.title}`, src: "assign", a });
    });
    C.keyDates.forEach(k => ev.push({ date: k.date, type: "key", title: k.label, src: "key" }));
    return ev.sort((a, b) => a.date.localeCompare(b.date));
  }
  DM.events = events;

  /* ---------------------------------------------------------------- HOME */
  if (document.body.dataset.page === "home") {
    // next-up
    const nu = $("#nextUp");
    if (nu) {
      const iso = d => d.toISOString().slice(0, 10);
      const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const nextClass = S.sessions.find(s => s.date >= t && s.type !== "holiday");
      const nextDue = S.assignments.filter(a => a.kind !== "Exam" && a.due >= t && a.points > 0).sort((a, b) => a.due.localeCompare(b.due))[0];
      const nextExam = S.assignments.filter(a => a.kind === "Exam" && a.due >= t)[0];
      const card = (k, v, w, href) => `<a class="card" style="text-decoration:none;color:inherit" href="${href}"><div class="k">${k}</div><div class="v">${v}</div><div class="w">${w}</div></a>`;
      const before = t < S.sessions[0].date;
      nu.innerHTML =
        (nextClass ? card(before ? "First class" : "Next class", esc(nextClass.title) + (nextClass.lec ? ` <span class="muted">(Lecture ${nextClass.lec})</span>` : ""), `${DM.fmt(nextClass.date, { dow: true })} · ${rel(nextClass.date)}`, nextClass.lec ? DM.lectureUrl(lec(nextClass.lec)) : ROOT + "schedule.html") : card("Next class", "The semester is over", "See you next term", ROOT + "schedule.html")) +
        (nextDue ? card("Next deadline", `${nextDue.id}: ${esc(nextDue.title)}`, `${DM.fmt(nextDue.due, { dow: true })}, 11:59 PM · ${rel(nextDue.due)}`, ROOT + "assignments.html#" + nextDue.id) : card("Next deadline", "Nothing due", "—", ROOT + "assignments.html")) +
        (nextExam ? card("Next exam", esc(nextExam.title) + ` <span class="muted">(${nextExam.covers})</span>`, `${DM.fmt(nextExam.due, { dow: true })} · ${rel(nextExam.due)}`, ROOT + "assignments.html#" + nextExam.id) : card("Next exam", "No exams left", "—", ROOT + "assignments.html"));
    }
    // lectures by module
    const lg = $("#lectureGrid");
    if (lg) {
      lg.innerHTML = C.modules.map(m => `
        <div class="module-block">
          <div class="module-title"><span class="dot" style="background:var(--m${m.id})"></span>Module ${m.id} · ${m.name}</div>
          <div class="grid c3">
          ${C.lectures.filter(l => l.module === m.id).map(l => {
            const ds = DM.lectureDates(l.n); const p = DM.progress.pct(l.n);
            return `<a class="lec-card" style="--mc:var(--m${m.id})" href="${DM.lectureUrl(l)}">
              <span class="num">L${String(l.n).padStart(2, "0")}</span>
              <h3>${esc(l.title)}</h3><p>${esc(l.blurb)}</p>
              <div class="meta"><span class="when">${ds.length ? ds.map(d => DM.fmt(d)).join(" · ") : ""}</span>
              <span style="display:flex;align-items:center;gap:6px" title="${p}% of sections marked done">${p ? p + "%" : ""}<span class="progress-mini"><i style="width:${p}%"></i></span></span></div>
            </a>`;
          }).join("")}
          </div></div>`).join("");
    }
    // key dates
    const kd = $("#keyDates");
    if (kd) kd.innerHTML = C.keyDates.map(k => `<tr><td style="white-space:nowrap;font-weight:600">${DM.fmt(k.date, { dow: true })}</td><td>${esc(k.label)}</td></tr>`).join("");
    heroArt();
  }

  /* hero animation: points settle into clusters (k-means flavoured) */
  function heroArt() {
    const cv = document.getElementById("heroCanvas"); if (!cv) return;
    const ctx = cv.getContext("2d"); let w, h, dpr;
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const centers = [[.28, .32], [.7, .3], [.5, .72]];
    const pts = Array.from({ length: 150 }, (_, i) => { const c = i % 3; const a = rnd() * 6.283, r = Math.sqrt(rnd()) * .14; return { c, tx: centers[c][0] + Math.cos(a) * r, ty: centers[c][1] + Math.sin(a) * r * 1.1, x: rnd(), y: rnd() }; });
    let cent = [[.2, .8], [.5, .5], [.8, .75]], t0 = performance.now();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function size() { const r = cv.getBoundingClientRect(); dpr = devicePixelRatio || 1; w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    new ResizeObserver(size).observe(cv); size();
    const cols = () => [DM.css("--c1"), DM.css("--c2"), DM.css("--c3")];
    function frame(now) {
      const k = cols(), t = reduce ? 1 : Math.min(1, (now - t0) / 2600), e = 1 - Math.pow(1 - t, 3);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = DM.css("--border"); ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * w / 6, 0); ctx.lineTo(i * w / 6, h); ctx.moveTo(0, i * h / 6); ctx.lineTo(w, i * h / 6); ctx.stroke(); }
      cent = cent.map((c, j) => [c[0] + (centers[j][0] - c[0]) * .03 * (reduce ? 40 : 1), c[1] + (centers[j][1] - c[1]) * .03 * (reduce ? 40 : 1)]);
      pts.forEach(p => {
        const x = (p.x + (p.tx - p.x) * e) * w, y = (p.y + (p.ty - p.y) * e) * h;
        ctx.globalAlpha = .25 + .75 * e; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, 7); ctx.fillStyle = e < .2 ? DM.css("--muted") : k[p.c]; ctx.fill();
      });
      ctx.globalAlpha = 1;
      cent.forEach((c, j) => { const x = c[0] * w, y = c[1] * h; ctx.lineWidth = 3; ctx.strokeStyle = k[j]; ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke(); });
      if (t < 1 || Math.abs(cent[0][0] - centers[0][0]) > .001) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    cv.addEventListener("click", () => { pts.forEach(p => { p.x = rnd(); p.y = rnd(); }); cent = [[rnd(), rnd()], [rnd(), rnd()], [rnd(), rnd()]]; t0 = performance.now(); requestAnimationFrame(frame); });
    window.addEventListener("dm-theme", () => requestAnimationFrame(frame));
  }

  /* ------------------------------------------------------------ SCHEDULE */
  if (document.body.dataset.page === "schedule") {
    const list = $("#weekList"), months = $("#monthView");
    const t = (() => { const d = today; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
    const start = D("2027-01-11");
    const weekOf = s => Math.floor((D(s) - start) / (7 * 864e5)) + 1;
    const dueBy = {};
    S.assignments.forEach(a => { if (a.kind !== "Exam") (dueBy[a.due] = dueBy[a.due] || []).push(a); });
    // group by week
    const weeks = {};
    S.sessions.forEach(s => (weeks[weekOf(s.date)] = weeks[weekOf(s.date)] || []).push(s));
    // also deadlines that fall on non-class days
    Object.keys(dueBy).forEach(d => { if (!S.sessions.some(s => s.date === d)) (weeks[weekOf(d)] = weeks[weekOf(d)] || []).push({ date: d, type: "dueonly" }); });
    let teachWeek = 0;
    const html = Object.keys(weeks).sort((a, b) => a - b).map(wk => {
      const rows = weeks[wk].sort((a, b) => a.date.localeCompare(b.date));
      const isBreak = rows.every(r => r.type === "holiday");
      const isFinals = rows.some(r => r.date >= "2027-04-26");
      const label = isBreak ? "Break" : isFinals ? "Finals" : `Week ${++teachWeek}`;
      const mon = new Date(start.getTime() + (wk - 1) * 7 * 864e5);
      const fri = new Date(mon.getTime() + 4 * 864e5);
      const range = `${DM.MONTHS[mon.getMonth()]} ${mon.getDate()} – ${DM.MONTHS[fri.getMonth()]} ${fri.getDate()}`;
      const cur = rows.some(r => r.date >= t) && rows.some(r => r.date <= t) || (t >= mon.toISOString().slice(0, 10) && t <= fri.toISOString().slice(0, 10));
      return `<div class="week${isBreak ? " break" : ""}${cur ? " current" : ""}"><div class="wk"><b>${label}</b><span>${range}</span></div><div class="rows">
        ${rows.map(r => {
          const dues = (dueBy[r.date] || []).map(a => `<span class="pill ${a.kind === "Project" ? "project" : "due"}" title="${esc(a.title)}">${a.id} due</span>`).join(" ");
          if (r.type === "dueonly") {
            return `<div class="srow${r.date < t ? " past" : ""}${r.date === t ? " today" : ""}"><div class="d">${DM.dow(r.date)}<small>${DM.fmt(r.date)}</small></div>
            <div class="t muted">${(dueBy[r.date] || []).map(a => `<a href="assignments.html#${a.id}">${a.id}</a> — ${esc(a.title)} <span class="muted">(11:59 PM)</span>`).join("<br>")}</div><div class="tags">${dues}</div></div>`;
          }
          const L = r.lec ? lec(r.lec) : null;
          const pill = { class: '<span class="pill class">Class</span>', exam: '<span class="pill exam">Exam</span>', holiday: '<span class="pill holiday">No class</span>', project: '<span class="pill project">Project</span>' }[r.type];
          return `<div class="srow${r.date < t ? " past" : ""}${r.date === t ? " today" : ""}"><div class="d">${DM.dow(r.date)}<small>${DM.fmt(r.date)}</small></div>
            <div class="t">${L ? `<a href="${DM.lectureUrl(L)}">L${String(L.n).padStart(2, "0")} · ${esc(L.title)}</a><br><span class="muted small">${esc(r.title)}</span>` : `<b>${esc(r.title)}</b>`}</div>
            <div class="tags">${pill} ${dues}</div></div>`;
        }).join("")}
      </div></div>`;
    }).join("");
    list.innerHTML = html;

    // month grid
    const ev = events();
    const byDate = {}; ev.forEach(e => (byDate[e.date] = byDate[e.date] || []).push(e));
    const typeOf = e => e.type === "out" ? "class" : e.type;
    months.innerHTML = [0, 1, 2, 3].map(mi => {
      const first = new Date(2027, mi, 1), days = new Date(2027, mi + 1, 0).getDate();
      let cells = DM.DAYS.map(d => `<div class="dow">${d[0]}</div>`).join("");
      for (let i = 0; i < first.getDay(); i++) cells += `<div class="mday empty"></div>`;
      for (let d = 1; d <= days; d++) {
        const k = `2027-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const es = (byDate[k] || []).filter(e => e.type !== "out");
        cells += `<div class="mday${es.length ? " has" : ""}${k === t ? " today" : ""}" data-d="${k}" ${es.length ? 'tabindex="0" role="button"' : ""} aria-label="${DM.fmt(k)}${es.length ? ": " + es.map(e => esc(e.title)).join("; ") : ""}"><span class="dn">${d}</span>${es.map(e => `<span class="ev ${typeOf(e)}"></span>`).join("")}</div>`;
      }
      return `<div class="month"><h3>${["January", "February", "March", "April"][mi]} 2027</h3><div class="mgrid">${cells}</div></div>`;
    }).join("") + `<div class="month day-pop" id="dayPop"><h3>Select a day</h3><p class="muted small">Click any marked day to see what is happening.</p></div>`;
    months.addEventListener("click", e => {
      const c = e.target.closest(".mday.has"); if (!c) return; showDay(c.dataset.d);
    });
    months.addEventListener("keydown", e => { if (e.key === "Enter") { const c = e.target.closest(".mday.has"); if (c) showDay(c.dataset.d); } });
    function showDay(d) {
      const es = byDate[d] || [];
      $("#dayPop").innerHTML = `<h3>${DM.fmt(d, { dow: true })}, 2027</h3>` + es.map(e => {
        const L = e.lec ? lec(e.lec) : null;
        return `<p style="margin:.4em 0"><span class="pill ${typeOf(e) === "key" ? "" : typeOf(e)}">${{ class: "Class", exam: "Exam", due: "Due", project: "Project", holiday: "No class", key: "University", out: "Released" }[e.type]}</span> ${L ? `<a href="${DM.lectureUrl(L)}">${esc(e.title)}</a>` : esc(e.title)}</p>`;
      }).join("");
    }

    // view toggle
    document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("[data-view]").forEach(x => x.setAttribute("aria-pressed", x === b));
      list.hidden = b.dataset.view !== "list"; months.parentElement.hidden = b.dataset.view !== "month";
      DM.store.set("dm-sched-view", b.dataset.view);
    }));
    const v = DM.store.get("dm-sched-view", "list"); document.querySelector(`[data-view="${v}"]`).click();
    document.getElementById("icsBtn").addEventListener("click", ics);
    const jump = document.getElementById("jumpToday"); if (jump) jump.addEventListener("click", () => { const c = document.querySelector(".week.current") || document.querySelector(".srow:not(.past)"); if (c) c.scrollIntoView({ block: "center" }); });
  }

  /* .ics export ------------------------------------------------------------ */
  function ics() {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DataMining//Spring2027//EN", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${C.code} ${C.title} (${C.term})`];
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const fold = s => s.replace(/[,;\\]/g, m => "\\" + m);
    events().filter(e => e.type !== "out").forEach((e, i) => {
      const d = e.date.replace(/-/g, ""); const nd = new Date(D(e.date).getTime() + 864e5); const d2 = `${nd.getFullYear()}${String(nd.getMonth() + 1).padStart(2, "0")}${String(nd.getDate()).padStart(2, "0")}`;
      const L = e.lec ? lec(e.lec) : null;
      const sum = L ? `${C.code}: L${L.n} ${L.title}` : `${C.code}: ${e.title}`;
      lines.push("BEGIN:VEVENT", `UID:dm2027-${i}-${d}@course`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d2}`, `SUMMARY:${fold(sum)}`, `DESCRIPTION:${fold(e.title)}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data-mining-spring-2027.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    DM.toast("Calendar file downloaded");
  }
  DM.ics = ics;

  /* ---------------------------------------------------------- ASSIGNMENTS */
  if (document.body.dataset.page === "assignments") {
    const t = (() => { const d = today; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
    const tbody = $("#dueTable");
    const rows = S.assignments.slice().sort((a, b) => a.due.localeCompare(b.due));
    tbody.innerHTML = rows.map(a => {
      const st = a.due < t ? '<span class="pill">Closed</span>' : daysUntil(a.due) <= 7 ? `<span class="pill due">Due ${rel(a.due)}</span>` : '<span class="pill ok">Upcoming</span>';
      return `<tr id="${a.id}-row"><td><b>${a.id}</b></td><td><a href="#${a.id}">${esc(a.title)}</a><br><span class="muted small">${esc(a.covers)}${a.recurring ? " · " + esc(a.recurring) : ""}</span></td><td style="white-space:nowrap">${a.out ? DM.fmt(a.out) : "—"}</td><td style="white-space:nowrap"><b>${DM.fmt(a.due, { dow: true })}</b><br><span class="muted small">${a.time || "11:59 PM"}</span></td><td class="num">${a.points ? a.points + "%" : "—"}</td><td>${st}</td></tr>`;
    }).join("");
    const gt = $("#gradeTable");
    if (gt) gt.innerHTML = S.grading.map(g => `<tr><td>${esc(g.item)}</td><td class="num">${g.weight}%</td></tr>`).join("") + `<tr><td><b>Total</b></td><td class="num"><b>${S.grading.reduce((s, g) => s + g.weight, 0)}%</b></td></tr>`;
    document.getElementById("icsBtn")?.addEventListener("click", ics);
  }

  /* grading bars (syllabus + assignments) */
  document.querySelectorAll(".weightbar").forEach(wb => {
    const cs = ["--c1", "--c2", "--c3", "--c4", "--c5"];
    wb.innerHTML = S.grading.map((g, i) => `<span title="${esc(g.item)}: ${g.weight}%" style="width:${g.weight}%;background:var(${cs[i % 5]})"></span>`).join("");
    const lg = wb.nextElementSibling;
    if (lg && lg.classList.contains("legend")) lg.innerHTML = S.grading.map((g, i) => `<span><i style="background:var(${cs[i % 5]})"></i>${esc(g.item.split(" (")[0])} · ${g.weight}%</span>`).join("");
  });
  document.querySelectorAll("[data-grading-table]").forEach(tb => {
    tb.innerHTML = S.grading.map(g => `<tr><td>${esc(g.item)}</td><td class="num">${g.weight}%</td></tr>`).join("") + `<tr><td><b>Total</b></td><td class="num"><b>100%</b></td></tr>`;
  });
  document.querySelectorAll("[data-scale-table]").forEach(tb => { tb.innerHTML = S.scale.map(g => `<tr><td><b>${g.grade}</b></td><td class="num">${g.range}</td></tr>`).join(""); });
  document.querySelectorAll("[data-keydates]").forEach(tb => { tb.innerHTML = C.keyDates.map(k => `<tr><td style="white-space:nowrap;font-weight:600">${DM.fmt(k.date, { dow: true })}</td><td>${esc(k.label)}</td></tr>`).join(""); });
  document.querySelectorAll("[data-exams]").forEach(el => { el.innerHTML = S.assignments.filter(a => a.kind === "Exam").map(a => `<li><b>${a.title}</b> — ${DM.fmt(a.due, { dow: true })}, ${a.time}; covers ${a.covers}.</li>`).join(""); });
})();
