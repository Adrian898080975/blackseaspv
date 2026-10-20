/* Black Sea 3.0: behaviour only. Every word is already in the HTML the server sends.
   Header shadow, mobile menu, photo fade-in, the ink-in statement, contact form presets,
   the "Other market" field and the form's sent and error states. */
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
      if (!on) input.value = '';
    }
  }
  if (market) {
    market.addEventListener('change', syncOther);
    syncOther();
  }

  var wrap = form.closest('[data-form-wrap]');
  var done = wrap && wrap.querySelector('[data-form-done]');
  var fail = wrap && wrap.querySelector('[data-form-error]');

  form.addEventListener('submit', function (e) {
    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && trap.value) { e.preventDefault(); return; }
    if (!window.fetch || !window.FormData || !done || !fail) return; /* plain POST */
    e.preventDefault();
    var submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    fail.hidden = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        form.hidden = true;
        done.hidden = false;
        done.focus();
      })
      .catch(function () {
        fail.hidden = false;
        fail.focus();
      })
      .then(function () {
        if (submit) submit.disabled = false;
      });
  });
})();
