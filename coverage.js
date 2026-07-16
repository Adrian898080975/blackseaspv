/* ==========================================================================
   BLACK SEA · coverage data (single source of truth)
   Feeds: nav mega-menu, coverage hub grids, 19x9 matrix, market/sector routers.
   The CTO ports this to coverage.json for the SSG (structure is 1:1).
   19 markets x 9 sectors. No invented regulatory dates live here; regulator
   anchors are the standing authority names only. Facts come from _data/reg_*.md.
   ========================================================================== */
window.BS = (function () {

  // nine sectors, fixed scan order (regulated-financial first, DNFBP second).
  // equal weight, always: no flagship, no promoted cell.
  const sectors = [
    { slug: "vasp-crypto",        name: "VASP & Crypto",           mono: "Virtual assets, exchange, custody, Travel Rule" },
    { slug: "payments-msb",       name: "Payments & MSB",          mono: "EMI, PSP, remittance, agent networks" },
    { slug: "banks-fis",          name: "Banks & FIs",             mono: "Banks, lenders, insurers, market infrastructure" },
    { slug: "funds-csp",          name: "Funds & CSP",             mono: "Funds, managers, corporate service providers" },
    { slug: "gold-dpms",          name: "Gold & DPMS",             mono: "Bullion, refiners, dealers in precious metals" },
    { slug: "gaming",             name: "Gaming",                  mono: "Casinos, online gaming, betting operators" },
    { slug: "real-estate-dnfbp",  name: "Real Estate & DNFBP",     mono: "Developers, agents, designated non-financial" },
    { slug: "defense-dual-use",   name: "Defense & Dual-Use",      mono: "Export control, dual-use goods, integrity DD" },
    { slug: "art-high-value",     name: "Art & High-Value Assets", mono: "Art, yachts, jets, high-value freeports" }
  ];

  // nineteen markets, grouped by theatre caption (quiet scanning aid only,
  // no market weighted above another). Regulator = standing authority anchors.
  const theatres = [
    {
      caption: "Gulf",
      markets: [
        { slug: "bahrain",      name: "Bahrain",       reg: ["CBB"] },
        { slug: "kuwait",       name: "Kuwait",        reg: ["CBK", "CMA"] },
        { slug: "oman",         name: "Oman",          reg: ["CBO", "CMA"] },
        { slug: "qatar",        name: "Qatar",         reg: ["QCB", "QFCRA"] },
        { slug: "saudi-arabia", name: "Saudi Arabia",  reg: ["SAMA", "CMA"] },
        { slug: "uae",          name: "UAE",           reg: ["VARA", "CBUAE", "ADGM FSRA", "DIFC DFSA"] }
      ]
    },
    {
      caption: "Levant & MENA",
      markets: [
        { slug: "egypt",        name: "Egypt",         reg: ["CBE", "FRA"] },
        { slug: "jordan",       name: "Jordan",        reg: ["CBJ"] }
      ]
    },
    {
      caption: "Africa",
      markets: [
        { slug: "ghana",        name: "Ghana",         reg: ["BoG", "SEC"] },
        { slug: "kenya",        name: "Kenya",         reg: ["CBK", "CMA"] },
        { slug: "nigeria",      name: "Nigeria",       reg: ["CBN", "SEC", "NFIU"] },
        { slug: "south-africa", name: "South Africa",  reg: ["SARB", "FSCA", "FIC"] }
      ]
    },
    {
      caption: "Central Asia & Caucasus",
      markets: [
        { slug: "azerbaijan",   name: "Azerbaijan",    reg: ["CBAR", "FIMSA"] },
        { slug: "georgia",      name: "Georgia",       reg: ["NBG"] },
        { slug: "kazakhstan",   name: "Kazakhstan",    reg: ["AFSA", "ARDFM", "NBK"] },
        { slug: "kyrgyzstan",   name: "Kyrgyzstan",    reg: ["NBKR"] },
        { slug: "uzbekistan",   name: "Uzbekistan",    reg: ["CBU"] }
      ]
    },
    {
      caption: "Anatolia & South Asia",
      markets: [
        { slug: "turkey",       name: "Turkey",        reg: ["MASAK", "BDDK", "CMB"] },
        { slug: "pakistan",     name: "Pakistan",      reg: ["SBP", "SECP", "FMU"] }
      ]
    }
  ];

  // flat market list, in the regional order above, for the matrix rows and market router.
  const markets = theatres
    .reduce((all, t) => all.concat(t.markets.map(m => Object.assign({ theatre: t.caption }, m))), []);

  // the five service lines (equal weight), with the deep-link anchors used
  // by Home 04 and the combo pages.
  const services = [
    { anchor: "licensing",    idx: "01", name: "Licensing & new-regime build",         mono: "Stand up a programme for a new licence or regime" },
    { anchor: "remediation",  idx: "02", name: "Remediation",                          mono: "Post-enforcement or post-finding, back to standard" },
    { anchor: "mlro-fiu",     idx: "03", name: "Outsourced & bridge MLRO + FIU",       mono: "Run the function, or bridge it, managed FIU" },
    { anchor: "audit",        idx: "04", name: "Independent AML audit",                mono: "Independent review, examiner-grade, no conflict" },
    { anchor: "sanctions-dd", idx: "05", name: "Sanctions, export-control & DD",       mono: "Screening, Travel Rule, integrity due diligence" }
  ];

  return { sectors, theatres, markets, services,
           counts: { markets: markets.length, sectors: sectors.length } };
})();
