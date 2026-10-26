/* ==========================================================================
   site.js — shared header/footer, theme, config placeholders, progress store
   ========================================================================== */
(function () {
  const C = window.COURSE;
  const body = document.body;
  const ROOT = body.dataset.root || "";
  const PAGE = body.dataset.page || "";

  /* ---------- safe storage */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  window.DM = window.DM || {};
  DM.store = store;
  DM.root = ROOT;

  /* ---------- theme (set early to avoid flash) */
  const savedTheme = store.get("dm-theme", null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  const savedLang = store.get("dm-code", "r");
  document.documentElement.dataset.code = savedLang;

  /* ---------- dates */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  DM.parseDate = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  DM.fmt = (s, opts = {}) => { const d = DM.parseDate(s); return (opts.dow ? DAYS[d.getDay()] + ", " : "") + MONTHS[d.getMonth()] + " " + d.getDate(); };
  DM.dow = s => DAYS[DM.parseDate(s).getDay()];
  DM.today = () => { const q = new URLSearchParams(location.search).get("today"); const d = q ? DM.parseDate(q) : new Date(); d.setHours(0,0,0,0); return d; };
  DM.MONTHS = MONTHS; DM.DAYS = DAYS;

  /* ---------- progress (per lecture: set of done section ids) */
  DM.progress = {
    key: n => "dm-lec-" + n,
    get(n) { return store.get(this.key(n), { done: [], total: 0 }); },
    set(n, v) { store.set(this.key(n), v); },
    pct(n) { const p = this.get(n); return p.total ? Math.round(100 * p.done.length / p.total) : 0; }
  };

  DM.lectureUrl = l => ROOT + "lectures/" + l.file;
  DM.lectureDates = n => (window.SCHEDULE ? SCHEDULE.sessions.filter(s => s.lec === n).map(s => s.date) : []);

  /* ---------- icons */
  const I = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    mark: '<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="16" r="2.4" fill="#f26a1b"/><circle cx="11" cy="9" r="2.4" fill="#fbd3b8"/><circle cx="17" cy="13" r="2.4" fill="#f26a1b"/><circle cx="18" cy="5.5" r="1.8" fill="#fbd3b8"/><path d="M3 20.5h18" stroke="#fbd3b8" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  DM.icons = I;

  /* ---------- header */
  const links = [
    ["index.html", "Home", "home"],
    ["syllabus.html", "Syllabus", "syllabus"],
    ["schedule.html", "Schedule", "schedule"],
    ["assignments.html", "Assignments", "assignments"],
    ["index.html#lectures", "Lectures", "lectures"],
    ["resources.html", "Resources", "resources"]
  ];
  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><div class="wrap">
      <a class="brand" href="${ROOT}index.html" aria-label="${C.code} home">
        <span class="brand-mark">${I.mark}</span>
        <span>${C.title}<small>${C.code} · ${C.term}</small></span>
      </a>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">${I.menu}</button>
      <nav class="nav" id="siteNav" aria-label="Main">
        ${links.map(([h, t, k]) => `<a href="${ROOT}${h}"${PAGE === k || (k === "lectures" && PAGE === "lecture") ? ' aria-current="page"' : ""}>${t}</a>`).join("")}
        <button class="icon-btn" id="themeBtn" aria-label="Toggle dark mode" title="Toggle theme"></button>
      </nav>
    </div></header>`;
    const tb = document.getElementById("themeBtn");
    const isDark = () => (document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
    const paint = () => { tb.innerHTML = isDark() ? I.sun : I.moon; };
    paint();
    tb.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      document.documentElement.dataset.theme = next; store.set("dm-theme", next); paint();
      window.dispatchEvent(new Event("dm-theme"));
    });
    const mb = document.getElementById("menuBtn"), nav = document.getElementById("siteNav");
    mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
    nav.addEventListener("click", e => { if (e.target.tagName === "A") nav.classList.remove("open"); });
  }

  /* ---------- footer */
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML = `<footer class="site-footer"><div class="wrap">
      <div><b style="color:var(--text)">${C.code}: ${C.title}</b> · ${C.term}<br>${C.university}</div>
      <div>Instructor: <span data-c="instructor.name"></span> · <a data-c-href="mailto:instructor.email" data-c="instructor.email"></a><br>
      Lecture pages store your progress only in your own browser. Nothing is recorded.</div>
    </div></footer>`;
  }

  /* ---------- fill [data-c] placeholders from COURSE */
  const pick = path => path.split(".").reduce((o, k) => (o == null ? o : o[k]), C);
  DM.fill = (rootEl = document) => {
    rootEl.querySelectorAll("[data-c]").forEach(el => { const v = pick(el.dataset.c); if (v != null) el.innerHTML = v; });
    rootEl.querySelectorAll("[data-c-href]").forEach(el => {
      const spec = el.dataset.cHref; const m = spec.match(/^(mailto:)?(.*)$/);
      const v = pick(m[2]); if (v) el.setAttribute("href", (m[1] || "") + v);
    });
  };
  DM.fill();

  /* ---------- toast */
  DM.toast = msg => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1600);
  };

  /* ---------- CSS var reader for charts */
  DM.css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- side toc scrollspy for prose pages */
  const sideToc = document.querySelector(".side-toc");
  if (sideToc) {
    const as = [...sideToc.querySelectorAll("a")];
    const secs = as.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { as.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
    }, { rootMargin: "-20% 0px -70% 0px" });
    secs.forEach(s => io.observe(s));
  }
})();
