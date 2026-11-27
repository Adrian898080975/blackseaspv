/* Black Sea 3.0: behaviour only. Every word is already in the HTML the server sends.
   Header shadow, mobile menu, photo fade-in, the ink-in statement, the costed-plan bar on phones,
   contact form presets, the "Other market" field, the marked fields of a stopped send, and the
   form's sending, sent and error states, the search and graph of the regulation map on Coverage,
   and its search and graph on Home. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: a hairline once the page scrolls */
  var hd = d.querySelector('[data-hd]');
  function onScroll() {
    if (hd) hd.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var menu = d.querySelector('[data-menu]');
  var panel = d.getElementById('hd-panel');
  function setMenu(open) {
    if (!menu) return;
    root.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menu && panel) {
    menu.addEventListener('click', function () {
      setMenu(menu.getAttribute('aria-expanded') !== 'true');
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* photographs fade in once loaded */
  Array.prototype.forEach.call(d.querySelectorAll('[data-photo] img'), function (img) {
    function show() { img.classList.add('is-in'); }
    if (img.complete) show();
    else {
      img.addEventListener('load', show);
      img.addEventListener('error', show);
    }
  });

  /* the statement inks in word by word as it scrolls into view */
  var st = d.querySelector('[data-inkin]');
  if (st && !reduce) {
    var words = st.textContent.trim().split(/\s+/);
    st.textContent = '';
    var spans = words.map(function (w, i) {
      var s = d.createElement('span');
      s.className = 'w';
      s.textContent = w;
      st.appendChild(s);
      if (i < words.length - 1) st.appendChild(d.createTextNode(' '));
      return s;
    });
    st.classList.add('is-ink');
    var ticking = false;
    function ink() {
      ticking = false;
      var vh = window.innerHeight;
      var top = st.getBoundingClientRect().top;
      var k = Math.max(0, Math.min(1, (vh * 0.85 - top) / (vh * 0.55)));
      var n = Math.round(k * spans.length);
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
    }
    function tick() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(ink); }
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    ink();
  }

  /* phones: the costed-plan bar at the foot of the screen, out of the way while another button to the
     form or the footer is in view (CSS shows it below 860 px only) */
  var bar = d.querySelector('[data-mcta]');
  if (bar && window.IntersectionObserver) {
    var to = bar.querySelector('a');
    var watch = Array.prototype.filter.call(d.querySelectorAll('main a.bs-btn'), function (a) {
      return a.pathname === to.pathname;
    });
    var ft = d.querySelector('.ft');
    if (ft) watch.push(ft);
    var inView = watch.map(function () { return false; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { inView[watch.indexOf(en.target)] = en.isIntersecting; });
      root.classList.toggle('mcta-on', inView.indexOf(true) < 0);
    });
    watch.forEach(function (el) { io.observe(el); });
    if (!watch.length) root.classList.add('mcta-on');
  }

  /* the regulation graph (26 Nov 2026), on Home and on Coverage: the nodes are HTML text, these functions only
     draw the lines between them and, after a search, build new nodes from the names the page or its data hold. */
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function make(tag, cls, txt, parent) {
    var el = d.createElement(tag);
    if (cls) el.className = cls;
    if (txt) el.textContent = txt;
    if (parent) parent.appendChild(el);
    return el;
  }
  function fold(s) {
    s = (s || '').toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }
  /* the supervisor as a node: the body's name, without "The" and without the qualifier after it */
  function bodies(text) {
    var parts = text.split('; ');
    var list = parts.length > 1 && parts.every(function (p) { return /^[Tt]he [A-Z]/.test(p); }) ? parts : [text];
    return list.map(function (p) {
      p = p.replace(/^[Tt]he (?=[A-Z])/, '');
      p = p.split(/, (?:for|by|which|when|under|if|as|where|depending|unless|including|once|with regard|in respect)\b|: /)[0];
      return p.charAt(0).toUpperCase() + p.slice(1);
    });
  }
  function gxDraw(b) {
    var s = b.querySelector('.gx-l');
    if (!s || !b.offsetWidth) return;
    gxWire(b);
    clear(s);
    var R = b.getBoundingClientRect();
    s.setAttribute('viewBox', '0 0 ' + Math.round(R.width) + ' ' + Math.round(R.height));
    function box(el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - R.left, r: r.right - R.left, y: r.top - R.top + r.height / 2, on: r.width > 0 };
    }
    function svg(tag, cls, si, pi) {
      var e = d.createElementNS(s.namespaceURI, tag);
      e.setAttribute('class', cls);
      if (si !== null) e.setAttribute('data-s', si);
      if (pi !== null) e.setAttribute('data-p', pi);
      s.appendChild(e);
      return e;
    }
    function line(a, c, cls, si, pi) {
      if (!a.on || !c.on) return;
      var k = (c.l - a.r) / 2;
      var dd = 'M' + a.r + ' ' + a.y + 'C' + (a.r + k) + ' ' + a.y + ' ' + (c.l - k) + ' ' + c.y + ' ' + c.l + ' ' + c.y;
      var p = svg('path', 'gx-ln ' + cls, si, pi);
      p.setAttribute('d', dd);
      if (cls.indexOf('none') >= 0) return;
      p.setAttribute('pathLength', '1');
      /* the signal's track: the same route, one short dash that runs along it */
      var t = svg('path', 'gx-tr ' + (cls.indexOf('gx-ln--a') >= 0 ? 'gx-tr--a' : 'gx-tr--b'), si, pi);
      t.setAttribute('d', dd);
      t.setAttribute('pathLength', '1');
    }
    function dot(x, y, cls, si, pi) {
      var c = svg('circle', 'gx-dot ' + cls, si, pi);
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', cls.indexOf('gx-dot--p') < 0 && cls.indexOf('gx-dot--x') < 0 ? 2.5 : 3.5);
    }
    var m = b.querySelector('.gx-n--m');
    var mb = m ? box(m) : { on: false };
    /* the horizon: one line from the market across the graph, drawn before the map branches from it */
    if (mb.on) {
      var hz = svg('path', 'gx-hz', null, null);
      hz.setAttribute('d', 'M' + mb.r + ' ' + mb.y + 'H' + Math.round(R.width));
      hz.setAttribute('pathLength', '1');
    }
    var sups = b.querySelectorAll('.gx-c--p .gx-n');
    var used = {};
    each(b.querySelectorAll('.gx-c--s .gx-n'), function (n, i) {
      var a = box(n);
      if (mb.on) {
        line(mb, a, 'gx-ln--a gx-ln--s', i, null);
        dot(a.l, a.y, 'gx-dot--a', i, null);
      }
      var to = (n.getAttribute('data-to') || '').split(' ').filter(function (j) { return j !== '' && sups[+j]; });
      to.forEach(function (j) {
        var x = sups[+j].classList.contains('gx-n--x');
        line(a, box(sups[+j]), 'gx-ln--b' + (x ? ' gx-ln--none' : ' gx-ln--s'), i, +j);
        used[j] = x ? 'x' : 'p';
      });
      if (to.length) dot(a.r, a.y, 'gx-dot--b', i, null);
    });
    if (mb.on) dot(mb.r, mb.y, 'gx-dot--m', null, null);
    each(sups, function (n, j) {
      var t = box(n);
      if (t.on) dot(t.l, t.y, 'gx-dot--c gx-dot--' + (used[j] || 'p'), null, j);
    });
  }
  /* one sector or supervisor in focus: its own lines and nodes stay, the rest of the graph fades */
  function gxFocus(b, n) {
    each(b.querySelectorAll('.on'), function (e) { e.classList.remove('on'); });
    var sec = b.querySelectorAll('.gx-c--s .gx-n');
    var sup = b.querySelectorAll('.gx-c--p .gx-n');
    var si = n ? Array.prototype.indexOf.call(sec, n) : -1;
    var pi = n ? Array.prototype.indexOf.call(sup, n) : -1;
    if (si < 0 && pi < 0) { b.classList.remove('gx-hl'); return; }
    var S = {}, P = {};
    each(sec, function (e, i) {
      var to = (e.getAttribute('data-to') || '').split(' ');
      if (i === si) { S[i] = 1; to.forEach(function (j) { if (j !== '') P[j] = 1; }); }
      else if (pi >= 0 && to.indexOf(String(pi)) >= 0) S[i] = 1;
    });
    if (pi >= 0) P[pi] = 1;
    each(sec, function (e, i) { if (S[i]) e.classList.add('on'); });
    each(sup, function (e, j) { if (P[j]) e.classList.add('on'); });
    each(b.querySelectorAll('.gx-l [data-s], .gx-l [data-p], .gx-dot--m'), function (e) {
      var s1 = e.getAttribute('data-s'), p1 = e.getAttribute('data-p');
      var hit = (s1 === null || S[s1]) && (p1 === null || P[p1]);
      if (hit) e.classList.add('on');
    });
    b.classList.add('gx-hl');
  }
  /* the lines draw in once, when the graph first comes into view or right after a search builds it */
  var gxStill = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function gxPlay(b) {
    if (b.gxSeen || gxStill) return;
    b.gxSeen = 1;
    b.classList.add('gx-in');
    window.setTimeout(function () { b.classList.remove('gx-in'); }, 4000);
  }
  var gxSee = window.IntersectionObserver ? new IntersectionObserver(function (list) {
    list.forEach(function (en) { if (en.isIntersecting) { gxPlay(en.target); gxSee.unobserve(en.target); } });
  }, { threshold: 0.35 }) : null;
  function gxWire(b) {
    if (b.gxOn) return;
    b.gxOn = 1;
    function pick(e) { var n = e.target.closest ? e.target.closest('.gx-n') : null; gxFocus(b, n); }
    b.addEventListener('mouseover', pick);
    b.addEventListener('focusin', pick);
    b.addEventListener('mouseleave', function () { gxFocus(b, null); });
    b.addEventListener('focusout', function (e) { if (!b.contains(e.relatedTarget)) gxFocus(b, null); });
    if (gxSee) gxSee.observe(b);
  }
  function gxAll() { each(d.querySelectorAll('[data-gx]'), gxDraw); }
  /* a new graph: the heading, the market, its sectors and the supervisors each one points to */
  function gxBuild(parent, heading, market, sectors) {
    var box = make('div', 'gx', null, parent);
    make('h3', 'bs-h3 gx-h', heading, box);
    var b = make('div', 'gx-b', null, box);
    b.setAttribute('data-gx', '');
    /* the lines' SVG, in the namespace of the logo mark so no address sits in this file */
    var mark = d.querySelector('svg');
    if (mark) {
      var sv = d.createElementNS(mark.namespaceURI, 'svg');
      sv.setAttribute('class', 'gx-l');
      sv.setAttribute('aria-hidden', 'true');
      sv.setAttribute('focusable', 'false');
      b.appendChild(sv);
    }
    var cm = make('div', 'gx-c gx-c--m', null, b);
    var am = make('a', 'gx-n gx-n--m', market.name, cm);
    am.href = market.href;
    var cs = make('ul', 'gx-c gx-c--s', null, b);
    var cp = make('ul', 'gx-c gx-c--p', null, b);
    var byName = {};
    var count = 0;
    sectors.forEach(function (c) {
      var to = [];
      c.sup.forEach(function (txt) {
        bodies(txt).forEach(function (nm) {
          if (!(nm in byName)) {
            byName[nm] = count++;
            make('span', 'gx-n gx-n--' + (c.none ? 'x' : 'p'), nm, make('li', null, null, cp));
          }
          if (to.indexOf(byName[nm]) < 0) to.push(byName[nm]);
        });
      });
      var a = make('a', 'gx-n', c.short, make('li', null, null, cs));
      a.href = c.href;
      a.setAttribute('data-to', to.join(' '));
    });
    gxDraw(b);
    gxPlay(b);
    return box;
  }
  var gxTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(gxTimer);
    gxTimer = window.setTimeout(gxAll, 150);
  });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(gxAll);
  window.addEventListener('load', gxAll);
  gxAll();

  /* the regulation map on Coverage (26 Nov 2026): a search across markets, sectors and supervisors, and a
     graph of one market. Every word comes from the table and its data attributes; nothing shows before a search.
     A search sent from Home arrives as ?q= and runs at once. */
  var rmap = d.querySelector('[data-rmap]');
  if (rmap) regMap(rmap);

  function regMap(rm) {
    var input = rm.querySelector('[data-rmap-q]');
    var out = rm.querySelector('[data-rmap-out]');
    var table = rm.querySelector('table');
    if (!input || !out || !table) return;
    function slugWords(h) {
      return (h || '').replace(/^.*\/(market|sector)-/, '').replace(/\.html$/, '').replace(/-/g, ' ');
    }
    var heads = [];
    each(table.querySelectorAll('thead th[data-s]'), function (th) {
      var a = th.querySelector('a');
      heads.push({ name: th.getAttribute('data-s'), short: th.textContent.trim(), href: a && a.getAttribute('href') });
    });
    var rows = [];
    var cells = [];
    each(table.tBodies, function (tb) {
      each(tb.rows, function (tr) {
        var th = tr.querySelector('th[scope="row"]');
        if (!th) return;
        var a = th.querySelector('a');
        var row = { tr: tr, body: tb, market: th.textContent.trim(), href: a && a.getAttribute('href'), cells: [] };
        rows.push(row);
        each(tr.querySelectorAll('td'), function (td, i) {
          var el = td.firstElementChild;
          var h = heads[i] || {};
          var c = { td: td, el: el, row: row, sector: h.name || '', short: h.short || '', sectorHref: h.href,
                    href: el && el.tagName === 'A' ? el.getAttribute('href') : null,
                    name: (el && el.getAttribute('aria-label')) || '', sup: (el && el.getAttribute('data-sup')) || '',
                    none: !!el && el.classList.contains('rc--none') };
          c.hay = fold([row.market, slugWords(row.href), c.sector, c.short, slugWords(c.href), c.sup].join(' '));
          if (c.href) el.setAttribute('title', c.name + '\n' + c.sup.split(' || ').join('\n').split(' :: ').join(': '));
          row.cells.push(c);
          cells.push(c);
        });
      });
    });

    function search() {
      var q = fold(input.value).trim();
      var tokens = q ? q.split(/\s+/) : [];
      clear(out);
      if (!tokens.length) {
        out.hidden = true;
        cells.forEach(function (c) { c.td.classList.remove('is-dim'); });
        rows.forEach(function (r) { r.tr.hidden = false; });
        each(table.tBodies, function (tb) { tb.hidden = false; });
        return;
      }
      var hits = [];
      cells.forEach(function (c) {
        var on = !!c.href && tokens.every(function (t) { return c.hay.indexOf(t) >= 0; });
        c.td.classList.toggle('is-dim', !on);
        if (on) hits.push(c);
      });
      rows.forEach(function (r) {
        r.tr.hidden = !r.cells.some(function (c) { return hits.indexOf(c) >= 0; });
      });
      each(table.tBodies, function (tb) {
        tb.hidden = !rows.some(function (r) { return r.body === tb && !r.tr.hidden; });
      });
      out.hidden = false;
      if (!hits.length) {
        make('p', null, rm.getAttribute('data-nomatch'), out);
        return;
      }
      var one = hits.every(function (c) { return c.row === hits[0].row; });
      if (one) {
        gxBuild(out, rm.getAttribute('data-graph-h').replace('<market>', hits[0].row.market),
                { name: hits[0].row.market, href: hits[0].row.href },
                hits.map(function (c) {
                  return { short: c.short, href: c.href, none: c.none,
                           sup: c.sup.split(' || ').map(function (r) { return r.split(' :: ').pop(); }) };
                }));
      }
      var ul = make('ul', 'rmap-hits', null, out);
      hits.forEach(function (c) {
        var li = make('li', null, null, ul);
        var a = make('a', 'bs-link', c.name, li);
        a.href = c.href;
        c.sup.split(' || ').forEach(function (r) {
          make('p', null, r.split(' :: ').join(': '), li);
        });
      });
    }
    var timer = 0;
    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(search, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) { input.value = ''; search(); }
    });
    var sent = new URLSearchParams(window.location.search).get('q');
    if (sent && !input.value) input.value = sent;
    if (input.value) search();
  }

  /* the map on Home (26 Nov 2026): the graph of one market is in the page; a search loads regulators.json, the
     map as data, and draws the market it finds, or lists the pairs it finds. Without JavaScript the search opens
     the map on Coverage. */
  var hmap = d.querySelector('[data-hmap]');
  if (hmap) homeMap(hmap);

  function homeMap(hm) {
    var input = hm.querySelector('[data-hmap-q]');
    var out = hm.querySelector('[data-hmap-out]');
    var def = hm.querySelector('[data-hmap-def]');
    var more = hm.querySelector('[data-hmap-more]');
    if (!input || !out || !def || !window.fetch) return;
    var base = more ? more.getAttribute('href').split('#')[0] : '';
    var cells = null;
    var asked = false;
    function path(u) {
      try { return new URL(u, window.location.href).pathname; } catch (e) { return u; }
    }
    function load(then) {
      if (cells) { then(); return; }
      if (asked) return;
      asked = true;
      window.fetch(hm.getAttribute('data-src')).then(function (r) { return r.json(); }).then(function (j) {
        var mk = {};
        var sc = {};
        j.markets.forEach(function (m) { mk[m.id] = m; });
        j.sectors.forEach(function (s) { sc[s.id] = s; });
        cells = j.pairs.map(function (p) {
          var m = mk[p.market] || {};
          var s = sc[p.sector] || {};
          var sup = p.supervisors.map(function (x) { return x.text; });
          var none = p.supervisors.length === 1 && /^No licence/.test(sup[0]);
          var said = p.supervisors.map(function (x) { return (x.where ? x.where + ': ' : '') + x.text; });
          return { market: m.name, mhref: path(m.url), mid: p.market, short: s.short, href: path(p.url), name: p.name,
                   sup: sup, said: said, none: none,
                   hay: fold([m.name, p.market.replace(/-/g, ' '), s.name, s.short, p.sector.replace(/-/g, ' ')]
                     .concat(said).join(' ')) };
        });
        then();
      }).catch(function () { asked = false; });
    }
    function search() {
      var raw = input.value.trim();
      var tokens = fold(raw) ? fold(raw).split(/\s+/) : [];
      if (more) more.setAttribute('href', base + (raw ? '?q=' + encodeURIComponent(raw) : '') + '#map');
      clear(out);
      if (!tokens.length) { out.hidden = true; def.hidden = false; gxAll(); return; }
      var hits = cells.filter(function (c) {
        return tokens.every(function (t) { return c.hay.indexOf(t) >= 0; });
      });
      def.hidden = true;
      out.hidden = false;
      if (!hits.length) { make('p', null, hm.getAttribute('data-nomatch'), out); return; }
      var one = hits.every(function (c) { return c.mid === hits[0].mid; });
      if (one) {
        gxBuild(out, hm.getAttribute('data-graph-h').replace('<market>', hits[0].market),
                { name: hits[0].market, href: hits[0].mhref }, hits);
        return;
      }
      var ul = make('ul', 'rmap-hits', null, out);
      hits.slice(0, 6).forEach(function (c) {
        var li = make('li', null, null, ul);
        var a = make('a', 'bs-link', c.name, li);
        a.href = c.href;
        c.said.forEach(function (r) { make('p', null, r, li); });
      });
    }
    var timer = 0;
    input.addEventListener('focus', function () { load(function () {}); });
    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { load(search); }, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) { input.value = ''; load(search); }
    });
  }

  /* contact form */
  var form = d.querySelector('form[data-form]');
  if (!form) return;

  var q = new URLSearchParams(window.location.search);
  ['service', 'market', 'sector'].forEach(function (k) {
    var v = q.get(k);
    if (!v) return;
    var sel = form.querySelector('select[name="' + k + '"]');
    if (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute('data-slug') === v) { sel.selectedIndex = i; break; }
      }
      return;
    }
    var radios = form.querySelectorAll('input[type="radio"][name="' + k + '"]');
    for (var j = 0; j < radios.length; j++) {
      if (radios[j].getAttribute('data-slug') === v) { radios[j].checked = true; break; }
    }
  });

  var market = form.querySelector('select[name="market"]');
  var other = form.querySelector('[data-other]');
  function syncOther() {
    if (!market || !other) return;
    var opt = market.options[market.selectedIndex];
    var on = !!opt && opt.getAttribute('data-slug') === 'other';
    other.hidden = !on;
    var input = other.querySelector('input');
    if (input) {
      input.required = on;
      if (!on) {
        input.value = '';
        input.removeAttribute('aria-invalid');
      }
    }
  }
  if (market) {
    market.addEventListener('change', syncOther);
    syncOther();
  }

  /* a send the browser stops: the fields it names are marked until they are fixed */
  form.addEventListener('invalid', function (e) {
    form.classList.add('tried');
    e.target.setAttribute('aria-invalid', 'true');
  }, true);
  function recheck(e) {
    var el = e.target;
    if (!el.name || !el.validity) return;
    /* one chosen radio makes its whole group valid */
    var group = el.type === 'radio' ? form.querySelectorAll('input[name="' + el.name + '"]') : [el];
    Array.prototype.forEach.call(group, function (x) {
      if (x.validity.valid) x.removeAttribute('aria-invalid');
    });
  }
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);
  function unmark() {
    form.classList.remove('tried');
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (x) {
      x.removeAttribute('aria-invalid');
    });
  }

  var wrap = form.closest('[data-form-wrap]');
  var done = wrap && wrap.querySelector('[data-form-done]');
  var fail = wrap && wrap.querySelector('[data-form-error]');
  var submit = form.querySelector('[type="submit"]');
  var idle = submit && submit.querySelector('[data-idle]');
  var busy = submit && submit.querySelector('[data-busy]');
  var thanks = form.getAttribute('data-thanks');

  /* while the form sends, the button says so and cannot be pressed again */
  function sending(on) {
    if (submit) submit.disabled = on;
    if (idle && busy) {
      idle.hidden = on;
      busy.hidden = !on;
    }
    if (on) form.setAttribute('aria-busy', 'true');
    else form.removeAttribute('aria-busy');
  }

  form.addEventListener('submit', function (e) {
    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) { e.preventDefault(); return; }
    if (!window.fetch || !window.FormData || !done || !fail) return; /* plain POST */
    e.preventDefault();
    sending(true);
    fail.hidden = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        unmark();
        form.reset();
        syncOther();
        if (thanks) {
          window.location.assign(thanks);
          return;
        }
        sending(false);
        form.hidden = true;
        done.hidden = false;
        done.focus();
      })
      .catch(function () {
        sending(false);
        fail.hidden = false;
        fail.focus();
      });
  });

  /* back from the thank-you page: an empty form with its usual button */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) sending(false);
  });
})();
