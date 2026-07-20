# Graph Report - site  (2026-07-16)

## Corpus Check
- 13 files · ~283,530 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 81 nodes · 127 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9c52f1a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- radar.js
- gen-radar-data.mjs
- gen-sitemap.mjs
- lint-hardrules.mjs
- site.js
- localHref
- gen-canonicals.mjs
- buildMega
- fix-unbuilt-links.mjs
- gen-ru-shell.mjs
- buildMatrix
- gen-built-map.mjs

## God Nodes (most connected - your core abstractions)
1. `buildMega()` - 9 edges
2. `localHref()` - 8 edges
3. `A()` - 7 edges
4. `buildNav()` - 7 edges
5. `buildDrawer()` - 7 edges
6. `renderBoard()` - 6 edges
7. `renderGrid()` - 6 edges
8. `run()` - 6 edges
9. `buildFooter()` - 6 edges
10. `buildMatrix()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `buildDrawer()` --calls--> `nm()`  [EXTRACTED]
  site.js → site.js  _Bridges community 10 → community 5_
- `buildMega()` --calls--> `nm()`  [EXTRACTED]
  site.js → site.js  _Bridges community 10 → community 7_
- `buildDrawer()` --calls--> `sectorFile()`  [EXTRACTED]
  site.js → site.js  _Bridges community 7 → community 5_
- `A()` --calls--> `routeFor()`  [EXTRACTED]
  site.js → site.js  _Bridges community 4 → community 5_
- `wire()` --calls--> `buildMatrix()`  [EXTRACTED]
  site.js → site.js  _Bridges community 4 → community 10_

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 0 - "radar.js"
Cohesion: 0.26
Nodes (15): comboFile(), esc(), headRow(), href(), isStale(), marketFile(), mkName(), nameOf() (+7 more)

### Community 1 - "gen-radar-data.mjs"
Cohesion: 0.24
Nodes (9): ALL_MARKETS, cleanBoard(), { kept, dropped }, MARKET_TOKENS, PAGES, payload, reject(), SOURCES (+1 more)

### Community 2 - "gen-sitemap.mjs"
Cohesion: 0.25
Nodes (7): body, collect(), en, isNoindex(), ru, SKIP, urls

### Community 3 - "lint-hardrules.mjs"
Cohesion: 0.32
Nodes (6): files, findings, radarBoardText(), RULES, stripCode(), textOf()

### Community 4 - "site.js"
Cohesion: 0.48
Nodes (6): buildHud(), enhance(), mount(), routeFor(), secName(), wire()

### Community 5 - "localHref"
Cohesion: 0.57
Nodes (7): A(), buildDrawer(), buildFooter(), buildNav(), langToggle(), localHref(), marketFile()

### Community 6 - "gen-canonicals.mjs"
Cohesion: 0.47
Nodes (5): enURL(), rewrite(), ruURL(), SKIP, targets

### Community 7 - "buildMega"
Cohesion: 0.50
Nodes (4): buildMega(), cap(), mono(), sectorFile()

### Community 10 - "buildMatrix"
Cohesion: 0.67
Nodes (3): buildMatrix(), comboFile(), nm()

## Knowledge Gaps
- **21 isolated node(s):** `pages`, `MARKETS`, `pages`, `SKIP`, `targets` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildMega()` connect `buildMega` to `buildMatrix`, `site.js`, `localHref`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `pages`, `MARKETS`, `pages` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._