/* Black Sea — live briefings pulled from the Substack RSS feed.
   Renders the latest posts into #briefings-grid. Graceful fallback on failure. */
(function () {
  var grid = document.getElementById('briefings-grid');
  if (!grid) return;

  var FEED = 'https://blackseabriefings.substack.com/feed';
  var ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED);

  function strip(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
  }
  function fmtDate(s) {
    try {
      var dt = new Date(s);
      if (isNaN(dt)) return '';
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    } catch (e) { return ''; }
  }
  function card(href, date, title, excerpt, cta) {
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.className = 'briefing-card';
    a.innerHTML =
      '<div class="briefing-date">' + (date || 'Black Sea Briefings') + '</div>' +
      '<div class="briefing-title"></div>' +
      '<div class="briefing-excerpt"></div>' +
      '<div class="briefing-read">' + (cta || 'Read briefing') + '</div>';
    a.querySelector('.briefing-title').textContent = title || '';
    a.querySelector('.briefing-excerpt').textContent = excerpt || '';
    return a;
  }
  function fallback() {
    grid.innerHTML = '';
    grid.appendChild(card(
      'https://blackseabriefings.substack.com',
      'Black Sea Briefings',
      'Read the latest on Substack',
      'Frontier compliance briefings on the regimes, deadlines and enforcement shaping our markets.',
      'Open Substack'
    ));
  }

  fetch(ENDPOINT)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || data.status !== 'ok' || !data.items || !data.items.length) throw new Error('no items');
      grid.innerHTML = '';
      data.items.slice(0, 3).forEach(function (it) {
        var ex = strip(it.description || it.content || '');
        if (ex.length > 150) ex = ex.slice(0, 150).replace(/\s+\S*$/, '') + '…';
        grid.appendChild(card(it.link, fmtDate(it.pubDate), it.title, ex, 'Read briefing'));
      });
    })
    .catch(fallback);
})();
