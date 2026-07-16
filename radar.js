/* ==========================================================================
   BLACK SEA · radar.js
   Binds the free /radar/ board (§03) and coverage grid (§04) to the one
   sanitised public contract (schema radar_public/v1), baked inline at build
   time (Transport A) into <script id="radar-data">. No engine access, no
   fetch, no scoring: a flat, source-cited, reverse-freshness list plus a
   moved/quiet coverage matrix. Grid cells reuse site.js's BUILT-aware
   localHref so an unbuilt combo falls back to its market, never a 404.
   Health rule (§5.2): missing / empty / generated_at older than 36h means
   feed-down; render placeholder rows plus a neutral grid, never stale rows,
   never fabricated movement.
   ========================================================================== */
(function () {
  "use strict";
  var BS = window.BS || {};
  var STALE_H = 36;

  function parseData(){
    var el = document.getElementById("radar-data");
    if (!el) return null;
    var txt = (el.textContent || "").trim();
    if (!txt || txt === "{}") return null;
    try { return JSON.parse(txt); } catch (e){ return null; }
  }

  // decorative signal-class map (no dates, no firm names); colour by cadence
  var SIG = {
    REGIME_TRANSITION_OPEN:          { label: "Regime open", cls: "live"  },
    FATF_EVALUATION_CYCLE:           { label: "FATF cycle",  cls: "live"  },
    SUPERVISORY_FOCUS_SHIFT:         { label: "Supervisory", cls: "watch" },
    SANCTIONS_EXPORT_CONTROL_UPDATE: { label: "Sanctions",   cls: "live"  },
    TRAVEL_RULE_ENFORCEMENT:         { label: "Travel rule", cls: "watch" }
  };

  function nameOf(list, slug){
    for (var i = 0; i < list.length; i++){ if (list[i].slug === slug) return list[i].name; }
    return String(slug).replace(/-/g, " ").replace(/\b\w/g, function (c){ return c.toUpperCase(); });
  }
  function mkName(slug){ return nameOf(BS.markets || [], slug); }
  function secName(slug){ return nameOf(BS.sectors || [], slug); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function (c){ return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]; }); }

  function relFresh(iso){
    var t = Date.parse(iso); if (isNaN(t)) return "";
    var h = Math.max(0, Math.round((Date.now() - t) / 3.6e6));
    if (h < 1) return "updated just now";
    if (h < 24) return "updated " + h + "h ago";
    return "updated " + Math.round(h / 24) + "d ago";
  }
  function isStale(iso){
    var t = Date.parse(iso); if (isNaN(t)) return true;
    return (Date.now() - t) / 3.6e6 > STALE_H;
  }
  function href(file){ return BS.localHref ? BS.localHref(file) : file; }
  function comboFile(c, s){ return BS.comboFile ? BS.comboFile(c, s) : ("market-" + c + "-" + s + ".html"); }
  function marketFile(c){ return BS.marketFile ? BS.marketFile(c) : ("market-" + c + ".html"); }

  function headRow(){
    return '<div class="rb-head"><span>Market / sector</span><span>What moved</span><span>Source</span><span>Signal</span></div>';
  }

  /* ---- §03 perimeter board --------------------------------------------- */
  function renderBoard(data, down){
    var host = document.querySelector(".radar-board");
    if (!host) return;
    // defence in depth: only rows carrying a real http(s) source survive ("no source, no row";
    // also blocks a javascript:/data: href sneaking in from a drifted export)
    var valid = (!down && data && data.board) ? data.board.filter(function (r){
      return r && /^https?:\/\//i.test(String(r.source_url || ""));
    }) : [];
    if (down || !valid.length){
      var ph = "";
      for (var i = 0; i < 5; i++){
        ph += '<div class="rb-line">'
          + '<div class="m">Live feed</div>'
          + '<div class="sig" style="color:var(--bs-text-lo)">Board between refreshes. The coverage grid below shows the live perimeter state.</div>'
          + '<div class="src"></div><div class="st"></div></div>';
      }
      host.innerHTML = headRow() + ph;
      return;
    }
    host.innerHTML = headRow() + valid.map(function (r){
      var sig = SIG[r.signal_class] || { label: "Signal", cls: "live" };
      return '<div class="rb-line">'
        + '<div class="m"><b>' + esc(mkName(r.market)) + '</b> &middot; ' + esc(secName(r.sector)) + '</div>'
        + '<div class="sig">' + esc(r.movement) + '</div>'
        + '<div class="src"><a href="' + esc(r.source_url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.source_label) + ' &nearr;</a></div>'
        + '<div class="st ' + sig.cls + '">' + esc(sig.label) + '</div></div>';
    }).join("");
  }

  /* ---- §04 coverage grid (state matrix) -------------------------------- */
  function renderGrid(data, down){
    var host = document.getElementById("radarGrid");
    if (!host) return;
    var markets = BS.markets || [], sectors = BS.sectors || [];
    var state = {};
    if (!down && data && data.grid){ data.grid.forEach(function (g){ state[g.market + "|" + g.sector] = g.state; }); }
    var moved = 0, total = markets.length * sectors.length;

    var head = '<tr><th class="rg-corner"><span class="k">19 mkt / 9 sct</span></th>'
      + sectors.map(function (s){ return '<th class="rg-sector-h">' + esc(s.name) + '</th>'; }).join("") + '</tr>';
    var body = markets.map(function (m){
      var tds = sectors.map(function (s){
        var mv = state[m.slug + "|" + s.slug] === "moved";
        if (mv){
          moved++;
          return '<td class="rg-cell m"><a href="' + esc(href(comboFile(m.slug, s.slug)))
            + '" data-route="/markets/' + m.slug + '/' + s.slug + '/" aria-label="' + esc(m.name + " / " + s.name) + ': moved"></a></td>';
        }
        return '<td class="rg-cell q" aria-label="' + esc(m.name + " / " + s.name) + ': quiet"></td>';
      }).join("");
      return '<tr><th class="rg-market-h"><a href="' + esc(href(marketFile(m.slug)))
        + '" data-route="/markets/' + m.slug + '/">' + esc(m.name) + '</a></th>' + tds + '</tr>';
    }).join("");
    host.innerHTML = '<table class="rg-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';

    var foot = host.parentNode && host.parentNode.querySelector(".rg-foot");
    if (foot){
      foot.innerHTML = down
        ? '<span>Feed between refreshes</span><span>Coverage 19 markets / 9 sectors &middot; evenly watched</span>'
        : '<span>' + moved + ' of ' + total + ' cells moved</span><span>Coverage 19 markets / 9 sectors &middot; evenly watched</span>';
    }
    // public grid state only, for the exposure-read echo in site.js populateRead
    window.__radarState = function (mSlug, sSlug){ return state[mSlug + "|" + sSlug] || "quiet"; };
  }

  /* ---- board-head relative freshness ----------------------------------- */
  function setFresh(data, down){
    var l = document.querySelector(".board-head .l");
    if (!l) return;
    var msg = down ? "feed between refreshes" : (data && data.generated_at ? relFresh(data.generated_at) : "");
    var slot = l.querySelector("[data-fresh]");
    if (!slot){ slot = document.createElement("span"); slot.setAttribute("data-fresh", ""); slot.style.color = "var(--bs-text-lo)"; l.appendChild(slot); }
    slot.textContent = msg ? "  ·  " + msg : "";
  }

  function run(){
    var data = parseData();
    var down = !data || !data.board || !data.board.length || isStale(data.generated_at);
    renderBoard(data, down);
    renderGrid(data, down);
    setFresh(data, down);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
