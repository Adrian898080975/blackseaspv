/* Black Sea 3.0: behaviour only. Every word is already in the HTML the server sends.
   Header shadow, mobile menu, photo fade-in, the ink-in statement, the costed-plan bar on phones,
   contact form presets, the "Other market" field, the marked fields of a stopped send, and the
   form's sending, sent and error states. */
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
