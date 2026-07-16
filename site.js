/* ==========================================================================
   BLACK SEA · site.js
   One source of truth for chrome (nav + footer) and interactions.
   The CTO lifts .nav / footer markup into an SSG layout partial; everything
   is data-driven from window.BS (coverage.js) so nav, hub, and matrix never
   drift. Local demo uses FLAT files; production routes are on data-route.
   No external dependencies. Reduced-motion safe. No-JS safe (forms POST).
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Cloudflare Web Analytics beacon. The domain is DNS-only to GitHub Pages (Cloudflare does
     not proxy it), so edge auto-injection cannot fire; install the beacon snippet here so it
     loads on every page. Cookieless, no consent banner. */
  (function () {
    var b = document.createElement("script");
    b.defer = true;
    b.src = "https://static.cloudflareinsights.com/beacon.min.js";
    b.setAttribute("data-cf-beacon", '{"token": "302388cdb807420591a613f27c543bb9"}');
    (document.head || document.documentElement).appendChild(b);
  })();

  var BS = window.BS;

  /* ---- locale-aware chrome labels (EN root, RU under /ru/) --------------- */
  var isRU = (document.documentElement.getAttribute("lang") || "en").toLowerCase().indexOf("ru") === 0;
  var T = isRU ? {
    whatWeDo: "Чем мы занимаемся", method: "Метод", coverage: "Покрытие", radar: "Radar",
    insights: "Аналитика", firm: "Фирма", partners: "Партнёры", engagement: "Формат работы",
    contact: "Контакты", costed: "Запросить смету", menu: "Меню",
    sectors: "Секторы", markets: "Рынки", coverageHub: "Карта покрытия",
    allSectors: "Все секторы (9)", allMarkets: "Все рынки (19)",
    seeMatrix: "Открыть матрицу покрытия &rarr;", amInScope: "Подхожу ли я? &rarr;",
    fhWhatWeDo: "Чем мы занимаемся", fhCoverage: "Покрытие", fhFirm: "Фирма",
    legal: "Правовое", privacy: "Конфиденциальность", terms: "Условия", disclaimer: "Оговорка",
    language: "Язык", langNote: "Английский в корне, русский в /ru/",
    tag: "Лицензия, это простая часть. Мы строим то, что стоит за ней.",
    posture: "Конфиденциально &nbsp;·&nbsp; Операционно &nbsp;·&nbsp; Независимо, без конфликтов, только старшие специалисты",
    disc: "&copy; Black Sea. Без указания местоположения, имён и цен. Это независимая консалтинговая практика.",
    briefings: "Брифинги", booking: "Запись"
  } : {
    whatWeDo: "What we do", method: "Method", coverage: "Coverage", radar: "Radar",
    insights: "Insights", firm: "Firm", partners: "Partners", engagement: "Engagement",
    contact: "Contact", costed: "Get a costed plan", menu: "Menu",
    sectors: "Sectors", markets: "Markets", coverageHub: "Coverage hub",
    allSectors: "All sectors (9)", allMarkets: "All markets (19)",
    seeMatrix: "See the full coverage matrix &rarr;", amInScope: "Am I in scope? &rarr;",
    fhWhatWeDo: "What we do", fhCoverage: "Coverage", fhFirm: "Firm",
    legal: "Legal", privacy: "Privacy", terms: "Terms", disclaimer: "Disclaimer",
    language: "Language", langNote: "English at root, Russian under /ru/",
    tag: "The licence is the easy part. We build what sits behind it.",
    posture: "Confidential &nbsp;·&nbsp; Operational &nbsp;·&nbsp; Independent, conflict-free, senior-only",
    disc: "&copy; Black Sea. No location, no named individuals, no prices. Independent advisory.",
    briefings: "Briefings", booking: "Booking"
  };

  /* ---- route <-> local flat file map ------------------------------------ */
  var FILE = {
    "/": "index.html", "/what-we-do/": "what-we-do.html", "/method/": "method.html",
    "/coverage/": "coverage.html", "/radar/": "radar.html", "/insights/": "insights.html",
    "/partners/": "partners.html", "/firm/": "firm.html", "/engagement/": "engagement.html",
    "/contact/": "contact.html", "/legal/": "legal.html"
  };
  var BUILT = { "market-azerbaijan": 1, "market-bahrain": 1, "market-bahrain-banks-fis": 1, "market-egypt": 1, "market-georgia": 1, "market-ghana": 1, "market-jordan": 1, "market-kazakhstan": 1, "market-kazakhstan-banks-fis": 1, "market-kazakhstan-vasp-crypto": 1, "market-kenya": 1, "market-kuwait": 1, "market-kuwait-vasp-crypto": 1, "market-kyrgyzstan": 1, "market-nigeria": 1, "market-nigeria-payments-msb": 1, "market-nigeria-vasp-crypto": 1, "market-oman": 1, "market-pakistan": 1, "market-qatar": 1, "market-qatar-funds-csp": 1, "market-saudi-arabia": 1, "market-saudi-arabia-payments-msb": 1, "market-south-africa": 1, "market-south-africa-vasp-crypto": 1, "market-turkey": 1, "market-turkey-vasp-crypto": 1, "market-uae": 1, "market-uae-funds-csp": 1, "market-uae-payments-msb": 1, "market-uae-vasp-crypto": 1, "market-uzbekistan": 1, "sector-art-high-value": 1, "sector-banks-fis": 1, "sector-defense-dual-use": 1, "sector-funds-csp": 1, "sector-gaming": 1, "sector-gold-dpms": 1, "sector-payments-msb": 1, "sector-real-estate-dnfbp": 1, "sector-vasp-crypto": 1 };
  function sectorFile(s){ return "sector-" + s + ".html"; }
  function marketFile(s){ return "market-" + s + ".html"; }
  function comboFile(c, s){ return "market-" + c + "-" + s + ".html"; }
  // resolve a local href; unbuilt template pages fall back to their parent so the demo never 404s
  function localHref(file){
    var base = file.replace(/\.html$/, "");
    if (FILE_VALUES.indexOf(file) > -1) return file;
    if (BUILT[base]) return file;
    if (base.indexOf("market-") === 0){
      var rest = base.slice(7); var parts = rest.split("-");
      // combo: market-<country>-<sector> -> parent market if that sector slug is known
      for (var i = 0; i < BS.sectors.length; i++){
        var ss = BS.sectors[i].slug;
        if (rest.length > ss.length && rest.slice(-ss.length) === ss && rest.charAt(rest.length - ss.length - 1) === "-"){
          var country = rest.slice(0, rest.length - ss.length - 1);
          return BUILT["market-" + country] ? marketFile(country) : "coverage.html";
        }
      }
      return BUILT[base] ? file : "coverage.html";
    }
    if (base.indexOf("sector-") === 0) return "coverage.html";
    return file;
  }
  var FILE_VALUES = Object.keys(FILE).map(function (k){ return FILE[k]; });
  // expose route helpers so radar.js grid cells reuse the same BUILT-aware fallback (never 404)
  BS.localHref = localHref; BS.comboFile = comboFile; BS.marketFile = marketFile;

  /* ---- production route for data-route (handoff documentation) ---------- */
  function routeFor(file){
    for (var k in FILE){ if (FILE[k] === file) return k; }
    var b = file.replace(/\.html$/, "");
    if (b.indexOf("sector-") === 0) return "/sectors/" + b.slice(7) + "/";
    if (b.indexOf("market-") === 0){
      var rest = b.slice(7);
      for (var i = 0; i < BS.sectors.length; i++){
        var ss = BS.sectors[i].slug;
        if (rest.length > ss.length && rest.slice(-ss.length) === ss && rest.charAt(rest.length - ss.length - 1) === "-")
          return "/markets/" + rest.slice(0, rest.length - ss.length - 1) + "/" + ss + "/";
      }
      return "/markets/" + rest + "/";
    }
    return "/";
  }
  function A(file, label, cls){
    var r = routeFor(file);
    return '<a href="' + localHref(file) + '" data-route="' + r + '"' + (cls ? ' class="' + cls + '"' : "") + '>' + label + "</a>";
  }

  /* ---- Horizon mark SVG -------------------------------------------------- */
  var MARK = '<span class="bs-mark"><svg viewBox="0 0 100 100" aria-hidden="true">'
    + '<circle class="bs-mark-stroke" cx="50" cy="50" r="38" stroke-width="2.4"/>'
    + '<line class="bs-mark-stroke" x1="12" y1="50" x2="88" y2="50" stroke-width="2.4"/>'
    + '<rect class="bs-mark-square" x="43" y="43" width="14" height="14"/></svg></span>';
  var WORD = '<span class="bs-wordmark">BLACK<i>·</i>SEA</span>';

  /* ---- language toggle --------------------------------------------------- */
  function langToggle(cls){
    // resolve the sibling page relatively from the actual served flat file, so it
    // works in local preview and on GitHub Pages (EN at root, RU under /ru/).
    var file = (location.pathname.replace(/^.*\//, "") || "index.html");
    if (file === "") file = "index.html";
    if (isRU){
      return '<div class="' + cls + '">'
        + '<a class="off" href="../' + file + '" hreflang="en" data-lang="en">EN</a>'
        + '<span class="sep"></span><span class="on">RU</span></div>';
    }
    return '<div class="' + cls + '">'
      + '<span class="on">EN</span><span class="sep"></span>'
      + '<a class="off" href="ru/' + file + '" hreflang="ru" data-lang="ru">RU</a></div>';
  }

  /* ---- NAV --------------------------------------------------------------- */
  function buildNav(){
    var links =
      '<div class="nav-links">'
      + A("what-we-do.html", T.whatWeDo, "nav-link").replace("<a ", '<a data-nav="what-we-do" ')
      + A("method.html", T.method, "nav-link").replace("<a ", '<a data-nav="method" ')
      + '<button class="nav-link" data-nav="coverage" aria-expanded="false" aria-haspopup="true" id="megaBtn">' + T.coverage + ' <span class="caret"></span></button>'
      + A("radar.html", '<span>' + T.radar + '</span><span class="free">FREE</span>', "nav-link").replace("<a ", '<a data-nav="radar" ')
      + A("insights.html", T.insights, "nav-link").replace("<a ", '<a data-nav="insights" ')
      + A("firm.html", T.firm, "nav-link").replace("<a ", '<a data-nav="firm" ')
      + "</div>";

    var mega = buildMega();

    var nav =
      '<nav class="nav" id="nav"><div class="nav-inner">'
      + '<a class="nav-brand" href="' + localHref("index.html") + '" data-route="/">' + MARK + WORD + "</a>"
      + links
      + '<span class="nav-spacer"></span>'
      + langToggle("nav-lang")
      + '<a class="bs-btn bs-btn--primary nav-cta" href="' + localHref("engagement.html") + '" data-route="/engagement/">' + T.costed + ' &rarr;</a>'
      + '<button class="nav-burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>'
      + "</div>" + mega + "</nav>"
      + buildDrawer();
    return nav;
  }

  function buildMega(){
    var s = BS.sectors.map(function (x){
      return '<a class="mega-item" href="' + localHref(sectorFile(x.slug)) + '" data-route="/sectors/' + x.slug + '/">'
        + '<span class="nm">' + x.name + '</span><span class="ds">' + x.mono + "</span></a>";
    }).join("");
    var theatres = BS.theatres.map(function (t){
      var links = t.markets.map(function (m){
        return '<a href="' + localHref(marketFile(m.slug)) + '" data-route="/markets/' + m.slug + '/">' + m.name + "</a>";
      }).join("");
      return '<div class="mega-theatre"><div class="cap">' + t.caption + "</div>" + links + "</div>";
    }).join("");
    return '<div class="nav-mega" id="mega"><div class="nav-mega-inner">'
      + '<div class="mega-col"><div class="mega-col-h"><span class="lab">' + T.sectors + ' / ' + BS.counts.sectors + '</span><span class="line"></span></div>'
      + '<div class="mega-sectors">' + s + "</div></div>"
      + '<div class="mega-col"><div class="mega-col-h"><span class="lab">' + T.markets + ' / ' + BS.counts.markets + '</span><span class="line"></span></div>'
      + '<div class="mega-markets">' + theatres + "</div></div>"
      + '<div class="mega-foot">' + A("coverage.html", T.seeMatrix) + A("radar.html", T.amInScope) + "</div>"
      + "</div></div>";
  }

  function buildDrawer(){
    var secAcc = BS.sectors.map(function (x){ return '<a href="' + localHref(sectorFile(x.slug)) + '">' + x.name + "</a>"; }).join("");
    var mktAcc = BS.markets.map(function (m){ return '<a href="' + localHref(marketFile(m.slug)) + '">' + m.name + "</a>"; }).join("");
    return '<div class="nav-drawer" id="drawer">'
      + A("what-we-do.html", T.whatWeDo) + A("method.html", T.method)
      + '<div class="drawer-acc"><button aria-expanded="false">' + T.coverage + ' <span class="caret"></span></button><div class="body">'
      + A("coverage.html", T.coverageHub) + secAcc + mktAcc + "</div></div>"
      + A("radar.html", T.radar) + A("insights.html", T.insights) + A("firm.html", T.firm)
      + A("partners.html", T.partners) + A("engagement.html", T.engagement)
      + '<a class="bs-btn bs-btn--primary drawer-cta" href="' + localHref("engagement.html") + '">' + T.costed + ' &rarr;</a>'
      + "</div>";
  }

  /* ---- FOOTER ------------------------------------------------------------ */
  function buildFooter(){
    var svc = BS.services.map(function (x){
      return '<a href="' + localHref("what-we-do.html") + '#' + x.anchor + '" data-route="/what-we-do/#' + x.anchor + '">' + x.name + "</a>";
    }).join("");
    var grid =
      '<div class="footer-grid">'
      + '<div class="footer-col footer-brand"><div class="bs-lockup">' + MARK + WORD + "</div>"
      + '<div class="tag">' + T.tag + '</div>'
      + '<div class="meta"><span class="m">Coverage 19 / 9</span><span class="m">Theatre Frontier &amp; Gulf</span><span class="m">43.41N 34.33E</span></div></div>'
      + '<div class="footer-col"><div class="fh">' + T.fhWhatWeDo + '</div>' + svc + "</div>"
      + '<div class="footer-col"><div class="fh">' + T.fhCoverage + '</div>'
      + A("coverage.html", T.coverageHub) + A("coverage.html", T.allSectors) + A("coverage.html", T.allMarkets)
      + A("radar.html", T.radar) + A("insights.html", T.insights) + "</div>"
      + '<div class="footer-col"><div class="fh">' + T.fhFirm + '</div>'
      + A("firm.html", T.firm) + A("method.html", T.method) + A("partners.html", T.partners)
      + A("engagement.html", T.engagement) + A("contact.html", T.contact) + "</div>"
      + "</div>";

    var contact =
      '<div class="footer-contact"><div class="lines">'
      + '<span><a href="mailto:operations@blackseaspv.com">operations@blackseaspv.com</a></span>'
      + '<span>' + T.briefings + ': <a href="https://blackseabriefings.substack.com" target="_blank" rel="noopener">blackseabriefings.substack.com</a></span>'
      + '<span>' + T.booking + ': <a href="https://cal.com/black-sea/30min" target="_blank" rel="noopener">cal.com/black-sea/30min</a></span>'
      + "</div>"
      + '<a class="bs-btn bs-btn--ghost" href="' + localHref("engagement.html") + '">' + T.costed + ' &rarr;</a></div>';

    var lang = '<div class="footer-lang"><span>' + T.language + '</span>' + langToggle("nav-lang") + "<span>" + T.langNote + "</span></div>";

    var legal =
      '<div class="footer-legal"><div class="links">'
      + A("legal.html", T.legal) + '<a href="legal.html#privacy" data-route="/legal/privacy/">' + T.privacy + '</a>'
      + '<a href="legal.html#terms" data-route="/legal/terms/">' + T.terms + '</a>'
      + '<a href="legal.html#disclaimer" data-route="/legal/disclaimer/">' + T.disclaimer + '</a></div>'
      + '<div class="posture">' + T.posture + '</div>'
      + '<div class="disc">' + T.disc + '</div></div>';

    return '<footer class="site-footer">' + grid + contact + lang + legal + "</footer>";
  }

  /* ---- fixed instrument HUD (brackets, progress, rail, telemetry) -------- */
  function buildHud(){
    if (document.getElementById("bs-hud")) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var hud = document.createElement("div");
    hud.className = "hud"; hud.id = "bs-hud"; hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = '<div class="bracket tl"><i></i></div><div class="bracket tr"></div><div class="bracket bl"></div><div class="bracket br"></div>';
    document.body.appendChild(hud);

    var prog = document.createElement("div"); prog.className = "scan-progress"; prog.id = "bs-progress";
    document.body.appendChild(prog);

    // collect sections: hero first, then each .section-tag's parent section
    var secs = [];
    var hero = document.querySelector(".cine, header.hero");
    if (hero){ if (!hero.id) hero.id = "sec-top"; secs.push({ id: hero.id, n: "00", t: hero.getAttribute("data-name") || "Top" }); }
    [].forEach.call(document.querySelectorAll(".section-tag"), function (tag){
      var sec = tag.closest(".section") || tag.closest("section"); if (!sec) return;
      var nEl = tag.querySelector(".n"), tEl = tag.querySelector(".t");
      var n = nEl ? nEl.textContent.trim() : "", t = tEl ? tEl.textContent.trim() : "";
      if (!sec.id) sec.id = "sec-" + (n || Math.random().toString(36).slice(2, 7));
      secs.push({ id: sec.id, n: n, t: t });
    });

    var rail = document.createElement("nav"); rail.className = "rail"; rail.id = "bs-rail"; rail.setAttribute("aria-label", "Sections");
    secs.forEach(function (s){
      var a = document.createElement("a"); a.href = "#" + s.id; a.setAttribute("data-target", s.id);
      a.innerHTML = '<span class="lbl">' + (s.t || "") + '</span><span class="num">' + s.n + '</span><span class="tick"></span>';
      a.addEventListener("click", function (ev){ ev.preventDefault(); var el = document.getElementById(s.id); if (el){ var y = el.getBoundingClientRect().top + (window.pageYOffset || 0) - 54; window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); } });
      rail.appendChild(a);
    });
    document.body.appendChild(rail);

    var tel = document.createElement("div"); tel.className = "telemetry";
    tel.innerHTML =
      '<div class="seg"><span class="ac">&#9642;</span> <b id="bs-frame">00 / Top</b></div>' +
      '<div class="seg hide-s"><span>BLACK&#183;SEA</span> <span>REV 1.0</span></div>' +
      '<div class="seg"><span class="ac">&#9679; LIVE</span> <b data-utc>00:00:00 UTC</b></div>';
    document.body.appendChild(tel);
    var frameEl = document.getElementById("bs-frame");

    // scanline sweep into every cinematic hero
    [].forEach.call(document.querySelectorAll(".cine"), function (c){
      if (!c.querySelector(".hero-scan")){ var s = document.createElement("span"); s.className = "hero-scan"; c.appendChild(s); }
    });

    var railLinks = [].slice.call(rail.querySelectorAll("a"));
    var ticking = false;
    function upd(){
      var st = window.pageYOffset || document.documentElement.scrollTop || 0;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (st / h * 100) : 0) + "%";
      var mid = st + window.innerHeight * 0.42, active = secs[0];
      for (var k = 0; k < secs.length; k++){ var el = document.getElementById(secs[k].id); if (el && el.offsetTop <= mid) active = secs[k]; }
      if (active){
        if (frameEl) frameEl.textContent = active.n + " / " + (active.t || "");
        railLinks.forEach(function (a){ a.classList.toggle("active", a.getAttribute("data-target") === active.id); });
      }
      ticking = false;
    }
    window.addEventListener("scroll", function (){ if (!ticking){ ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---- interactions ------------------------------------------------------ */
  function wire(){
    var body = document.body;
    var page = body.getAttribute("data-page");
    buildHud();

    // active nav
    var activeMap = { sector: "coverage", market: "coverage", combo: "coverage", engagement: "" , partners: "" };
    var act = activeMap.hasOwnProperty(page) ? activeMap[page] : page;
    if (act){
      var el = document.querySelector('[data-nav="' + act + '"]');
      if (el) el.classList.add("is-active");
    }

    // mega-menu
    var nav = document.getElementById("nav");
    var mega = document.getElementById("mega");
    var megaBtn = document.getElementById("megaBtn");
    var megaOpen = false, hideT;
    function openMega(){ clearTimeout(hideT); mega.classList.add("is-open"); megaBtn.setAttribute("aria-expanded", "true"); megaOpen = true; }
    function closeMega(){ mega.classList.remove("is-open"); megaBtn.setAttribute("aria-expanded", "false"); megaOpen = false; }
    if (megaBtn){
      megaBtn.addEventListener("click", function (e){ e.stopPropagation(); megaOpen ? closeMega() : openMega(); });
      megaBtn.addEventListener("mouseenter", openMega);
      nav.addEventListener("mouseleave", function (){ hideT = setTimeout(closeMega, 160); });
      mega.addEventListener("mouseenter", function (){ clearTimeout(hideT); });
      mega.addEventListener("mouseleave", function (){ hideT = setTimeout(closeMega, 160); });
      document.addEventListener("click", function (e){ if (megaOpen && !mega.contains(e.target) && e.target !== megaBtn) closeMega(); });
      document.addEventListener("keydown", function (e){ if (e.key === "Escape" && megaOpen) closeMega(); });
    }

    // mobile drawer
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("drawer");
    if (burger){
      burger.addEventListener("click", function (){
        var open = drawer.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      drawer.querySelectorAll(".drawer-acc > button").forEach(function (b){
        b.addEventListener("click", function (){ b.parentNode.classList.toggle("is-open"); });
      });
    }

    // tabs (theatre / sector switchers)
    document.querySelectorAll("[data-tabs]").forEach(function (group){
      var btns = group.querySelectorAll(".tab-btn");
      btns.forEach(function (btn){
        btn.addEventListener("click", function (){
          var id = btn.getAttribute("data-tab");
          group.querySelectorAll(".tab-btn").forEach(function (b){ b.classList.toggle("is-on", b === btn); });
          group.querySelectorAll(".tab-panel").forEach(function (p){ p.classList.toggle("is-on", p.getAttribute("data-panel") === id); });
        });
      });
    });

    // build matrix if a host is present
    buildMatrix();

    // Formspree AJAX submit + honeypot + .form-thanks (no-JS falls back to normal POST)
    document.querySelectorAll("form.ajax-form").forEach(function (form){
      form.addEventListener("submit", function (e){
        if (form.querySelector('[name="_gotcha"]') && form.querySelector('[name="_gotcha"]').value) { e.preventDefault(); return; }
        var action = form.getAttribute("action") || "";
        if (action.indexOf("{{") > -1){ e.preventDefault(); showThanks(form); return; }  // demo: endpoint not wired yet
        e.preventDefault();
        var data = new FormData(form);
        fetch(action, { method: "POST", body: data, headers: { "Accept": "application/json" } })
          .then(function (r){ showThanks(form); })
          .catch(function (){ form.submit(); });
      });
    });
    function showThanks(form){
      var wrap = form.closest("[data-form-wrap]") || form.parentNode;
      var thanks = wrap.querySelector(".form-thanks");
      if (thanks){ form.style.display = "none"; thanks.classList.add("is-on"); }
      var read = wrap.querySelector(".radar-read");
      if (read){ read.classList.add("is-on"); populateRead(form, read); }
    }
    function populateRead(form, read){
      var m = form.querySelector('[name="market"]'), s = form.querySelector('[name="sector"]');
      var body = read.querySelector("[data-read-body]");
      var head = read.querySelector(".rk");
      var mv = m && (m.options ? m.options[m.selectedIndex].text : m.value);
      var sv = s && (s.options ? s.options[s.selectedIndex].text : s.value);
      if (head && mv && sv){ head.textContent = (isRU ? "В зоне охвата // " : "In scope // ") + mv + " x " + sv; }
      if (body && mv && sv){
        // grid state (moved/quiet) is public on this page already, so echoing the chosen cell is safe and real
        var moved = (window.__radarState && m && s && window.__radarState(m.value, s.value) === "moved");
        var pre = moved ? (isRU ? "На этой ячейке периметр недавно двигался. " : "This cell moved on the perimeter recently. ") : "";
        body.textContent = pre + (isRU
          ? sv + " в " + mv + ": разбор вашей экспозиции и текущая позиция регулятора уже идут к вам на почту, вместе с релевантными брифингами. Следующий шаг, смета в течение 48 часов."
          : sv + " in " + mv + ": your exposure read and the current authority posture are on their way to your inbox, with the relevant briefings. Next step is a costed plan within 48 hours.");
      }
    }

    // segmented single-select fields (intake build/fix/run)
    document.querySelectorAll(".seg-field").forEach(function (seg){
      var hidden = seg.parentNode.querySelector('input[type="hidden"][data-seg]');
      seg.querySelectorAll("button").forEach(function (b){
        b.addEventListener("click", function (e){
          e.preventDefault();
          seg.querySelectorAll("button").forEach(function (x){ x.classList.toggle("on", x === b); });
          if (hidden) hidden.value = b.getAttribute("data-val");
        });
      });
    });

    // live UTC clock (any [data-utc])
    var clocks = document.querySelectorAll("[data-utc]");
    if (clocks.length){
      var tick = function (){
        var d = new Date(), p = function (n){ return String(n).padStart(2, "0"); };
        var s = p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + ":" + p(d.getUTCSeconds()) + " UTC";
        clocks.forEach(function (c){ c.textContent = s; });
      };
      tick(); setInterval(tick, 1000);
    }

    // reveal-on-scroll (visible by default; IO opts into the animation)
    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length && "IntersectionObserver" in window){
      var io = new IntersectionObserver(function (entries){
        entries.forEach(function (en){ if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      reveals.forEach(function (r){ io.observe(r); });
    } else {
      reveals.forEach(function (r){ r.classList.add("in"); });
    }

    enhance();
  }

  /* ---- motion enhancement (safe: content + final values exist without JS) - */
  function enhance(){
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // marquee: duplicate track for a seamless -50% loop
    document.querySelectorAll(".marquee-track").forEach(function (t){ t.innerHTML = t.innerHTML + t.innerHTML; });

    // count-up on view (final value is already the element text, so JS-off is fine)
    var counters = [].slice.call(document.querySelectorAll("[data-count]"));
    if (counters.length){
      var run = function (el){
        var to = parseFloat(el.getAttribute("data-count")) || 0, suf = el.getAttribute("data-suffix") || "";
        if (reduce){ el.textContent = to + suf; return; }
        var dur = 1150, t0 = null;
        var step = function (ts){ if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      };
      if ("IntersectionObserver" in window){
        var cio = new IntersectionObserver(function (es){ es.forEach(function (en){ if (en.isIntersecting){ run(en.target); cio.unobserve(en.target); } }); }, { threshold: .4 });
        counters.forEach(function (c){ cio.observe(c); });
      } else counters.forEach(run);
    }

    // scroll-tied parallax on [data-parallax] photos
    if (!reduce){
      var px = [].slice.call(document.querySelectorAll("[data-parallax]"));
      if (px.length){
        var ticking = false;
        var upd = function (){
          var vh = window.innerHeight;
          px.forEach(function (el){
            var host = el.closest(".band") || el.parentNode;
            var r = host.getBoundingClientRect();
            if (r.bottom < -120 || r.top > vh + 120) return;
            var prog = (r.top + r.height / 2 - vh / 2) / vh;   // -1 .. 1, 0 = centred
            var amt = parseFloat(el.getAttribute("data-parallax")) || 8;
            el.style.transform = "scale(1.16) translateY(" + (prog * -amt) + "%)";
          });
          ticking = false;
        };
        window.addEventListener("scroll", function (){ if (!ticking){ ticking = true; requestAnimationFrame(upd); } }, { passive: true });
        window.addEventListener("resize", upd); upd();
      }
    }

    // pinned cinematic scenes: [data-scene] pins while acts swap on scroll
    var scenes2 = [].slice.call(document.querySelectorAll("[data-scene]"));
    if (!reduce && "IntersectionObserver" in window && scenes2.length){
      scenes2.forEach(function (sc){
        var acts  = [].slice.call(sc.querySelectorAll(".scene-act"));
        var bgs   = [].slice.call(sc.querySelectorAll(".scene-bg"));
        var ticks = [].slice.call(sc.querySelectorAll(".scene-rail b"));
        var ro    = sc.querySelector(".scene-readout");
        var n = acts.length; if (!n) return;
        sc.setAttribute("data-scene-on", "");
        var setH = function (){ sc.style.height = (n * 90 + 24) + "vh"; };
        setH();
        var cur = -1, tk = false;
        var upd2 = function (){
          var total = sc.offsetHeight - window.innerHeight;
          var prog = total > 0 ? (-sc.getBoundingClientRect().top) / total : 0;
          prog = Math.max(0, Math.min(0.99999, prog));
          var idx = Math.floor(prog * n);
          if (idx === cur) return;
          cur = idx;
          acts.forEach(function (a,i){ a.classList.toggle("on", i === idx); });
          bgs.forEach(function (b,i){ b.classList.toggle("on", i === idx); });
          ticks.forEach(function (t,i){ t.classList.toggle("on", i === idx); });
          if (ro) ro.textContent = "ACT " + String(idx+1).padStart(2,"0") + " / " + String(n).padStart(2,"0");
        };
        window.addEventListener("scroll", function (){ if(!tk){ tk=true; requestAnimationFrame(function(){ upd2(); tk=false; }); } }, { passive:true });
        window.addEventListener("resize", function (){ setH(); cur = -1; upd2(); });
        upd2();
      });
    }
  }

  /* ---- 19 x 9 coverage matrix ------------------------------------------- */
  var PRIORITY = { "uae|vasp-crypto":1,"uae|payments-msb":1,"turkey|vasp-crypto":1,"turkey|payments-msb":1,
    "kazakhstan|vasp-crypto":1,"kazakhstan|banks-fis":1,"nigeria|vasp-crypto":1,"nigeria|payments-msb":1,
    "saudi-arabia|banks-fis":1,"south-africa|vasp-crypto":1,"georgia|vasp-crypto":1,"bahrain|banks-fis":1 };
  function buildMatrix(){
    var host = document.getElementById("coverageMatrix");
    if (!host) return;
    var head = '<thead><tr><th class="cm-corner"><span class="k">19 mkt / 9 sct</span></th>';
    BS.sectors.forEach(function (s){ head += '<th class="cm-sector-h">' + s.name + "</th>"; });
    head += "</tr></thead>";
    var rows = BS.markets.map(function (m){
      var tds = BS.sectors.map(function (s){
        var pri = PRIORITY[m.slug + "|" + s.slug] ? " is-priority" : "";
        return '<td class="cm-cell' + pri + '"><a href="' + localHref(comboFile(m.slug, s.slug)) + '" data-route="/markets/' + m.slug + "/" + s.slug + '/" aria-label="' + s.name + " in " + m.name + '"></a></td>';
      }).join("");
      return '<tr><th class="cm-market-h"><a href="' + localHref(marketFile(m.slug)) + '" data-route="/markets/' + m.slug + '/">' + m.name + "</a></th>" + tds + "</tr>";
    }).join("");
    host.innerHTML = '<table class="cm-table">' + head + "<tbody>" + rows + "</tbody></table>";

    // mobile 2-step selector
    var mob = document.getElementById("coverageMatrixMobile");
    if (mob){
      var mo = BS.markets.map(function (m){ return '<option value="' + m.slug + '">' + m.name + "</option>"; }).join("");
      var so = BS.sectors.map(function (s){ return '<option value="' + s.slug + '">' + s.name + "</option>"; }).join("");
      mob.innerHTML =
        '<div class="scope-field"><label>Market</label><select id="cmM">' + mo + "</select></div>"
        + '<div class="scope-field" style="margin-top:12px"><label>Sector</label><select id="cmS">' + so + "</select></div>"
        + '<a class="bs-btn bs-btn--primary" id="cmGo" style="margin-top:16px" href="#">Open combination &rarr;</a>';
      var go = function (){
        var mm = document.getElementById("cmM").value, svv = document.getElementById("cmS").value;
        document.getElementById("cmGo").setAttribute("href", localHref(comboFile(mm, svv)));
      };
      document.getElementById("cmM").addEventListener("change", go);
      document.getElementById("cmS").addEventListener("change", go);
      go();
    }
  }

  /* ---- mount ------------------------------------------------------------- */
  function mount(){
    var navHost = document.getElementById("bs-nav");
    var footHost = document.getElementById("bs-footer");
    if (navHost) navHost.outerHTML = buildNav();
    if (footHost) footHost.outerHTML = buildFooter();
    wire();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
