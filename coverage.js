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
    { slug: "vasp-crypto",        name: "VASP & Crypto",           mono: "Virtual assets, exchange, custody, Travel Rule",  nameRu: "Виртуальные активы и криптовалюта",     monoRu: "Виртуальные активы, обмен, кастодиан, Travel Rule" },
    { slug: "payments-msb",       name: "Payments & MSB",          mono: "EMI, PSP, remittance, agent networks",           nameRu: "Платежи и MSB",                          monoRu: "EMI, PSP, переводы, агентские сети" },
    { slug: "banks-fis",          name: "Banks & FIs",             mono: "Banks, lenders, insurers, market infrastructure", nameRu: "Банки и финансовые институты",           monoRu: "Банки, кредиторы, страховщики, рыночная инфраструктура" },
    { slug: "funds-csp",          name: "Funds & CSP",             mono: "Funds, managers, corporate service providers",   nameRu: "Фонды и провайдеры корпоративных услуг", monoRu: "Фонды, управляющие, провайдеры корпоративных услуг" },
    { slug: "gold-dpms",          name: "Gold & DPMS",             mono: "Bullion, refiners, dealers in precious metals",  nameRu: "Золото, драгоценные металлы и камни",    monoRu: "Слитки, аффинажёры, дилеры драгоценных металлов" },
    { slug: "gaming",             name: "Gaming",                  mono: "Casinos, online gaming, betting operators",      nameRu: "Гейминг",                                monoRu: "Казино, онлайн-гейминг, букмекеры" },
    { slug: "real-estate-dnfbp",  name: "Real Estate & DNFBP",     mono: "Developers, agents, designated non-financial",   nameRu: "Недвижимость и DNFBP",                   monoRu: "Девелоперы, агенты, нефинансовые бизнесы (DNFBP)" },
    { slug: "defense-dual-use",   name: "Defense & Dual-Use",      mono: "Export control, dual-use goods, integrity DD",   nameRu: "Оборона и товары двойного назначения",   monoRu: "Экспортный контроль, товары двойного назначения, интегрити-DD" },
    { slug: "art-high-value",     name: "Art & High-Value Assets", mono: "Art, yachts, jets, high-value freeports",        nameRu: "Искусство и активы высокой стоимости",   monoRu: "Искусство, яхты, джеты, фрипорты высокой стоимости" }
  ];

  // nineteen markets, grouped by theatre caption (quiet scanning aid only,
  // no market weighted above another). Regulator = standing authority anchors.
  const theatres = [
    {
      caption: "Gulf", captionRu: "Персидский залив",
      markets: [
        { slug: "bahrain",      name: "Bahrain",       reg: ["CBB"],                                   nameRu: "Бахрейн" },
        { slug: "kuwait",       name: "Kuwait",        reg: ["CBK", "CMA"],                            nameRu: "Кувейт" },
        { slug: "oman",         name: "Oman",          reg: ["CBO", "CMA"],                            nameRu: "Оман" },
        { slug: "qatar",        name: "Qatar",         reg: ["QCB", "QFCRA"],                          nameRu: "Катар" },
        { slug: "saudi-arabia", name: "Saudi Arabia",  reg: ["SAMA", "CMA"],                           nameRu: "Саудовская Аравия" },
        { slug: "uae",          name: "UAE",           reg: ["VARA", "CBUAE", "ADGM FSRA", "DIFC DFSA"], nameRu: "ОАЭ" }
      ]
    },
    {
      caption: "Levant & MENA", captionRu: "Левант и MENA",
      markets: [
        { slug: "egypt",        name: "Egypt",         reg: ["CBE", "FRA"],                            nameRu: "Египет" },
        { slug: "jordan",       name: "Jordan",        reg: ["CBJ"],                                   nameRu: "Иордания" }
      ]
    },
    {
      caption: "Africa", captionRu: "Африка",
      markets: [
        { slug: "ghana",        name: "Ghana",         reg: ["BoG", "SEC"],                            nameRu: "Гана" },
        { slug: "kenya",        name: "Kenya",         reg: ["CBK", "CMA"],                            nameRu: "Кения" },
        { slug: "nigeria",      name: "Nigeria",       reg: ["CBN", "SEC", "NFIU"],                    nameRu: "Нигерия" },
        { slug: "south-africa", name: "South Africa",  reg: ["SARB", "FSCA", "FIC"],                   nameRu: "ЮАР" }
      ]
    },
    {
      caption: "Central Asia & Caucasus", captionRu: "Центральная Азия и Кавказ",
      markets: [
        { slug: "azerbaijan",   name: "Azerbaijan",    reg: ["CBAR", "FIMSA"],                         nameRu: "Азербайджан" },
        { slug: "georgia",      name: "Georgia",       reg: ["NBG"],                                   nameRu: "Грузия" },
        { slug: "kazakhstan",   name: "Kazakhstan",    reg: ["AFSA", "ARDFM", "NBK"],                  nameRu: "Казахстан" },
        { slug: "kyrgyzstan",   name: "Kyrgyzstan",    reg: ["NBKR"],                                  nameRu: "Кыргызстан" },
        { slug: "uzbekistan",   name: "Uzbekistan",    reg: ["CBU"],                                   nameRu: "Узбекистан" }
      ]
    },
    {
      caption: "Anatolia & South Asia", captionRu: "Анатолия и Южная Азия",
      markets: [
        { slug: "turkey",       name: "Turkey",        reg: ["MASAK", "BDDK", "CMB"],                  nameRu: "Турция" },
        { slug: "pakistan",     name: "Pakistan",      reg: ["SBP", "SECP", "FMU"],                    nameRu: "Пакистан" }
      ]
    }
  ];

  // flat market list, in the regional order above, for the matrix rows and market router.
  const markets = theatres
    .reduce((all, t) => all.concat(t.markets.map(m => Object.assign({ theatre: t.caption }, m))), []);

  // the five service lines (equal weight), with the deep-link anchors used
  // by Home 04 and the combo pages.
  const services = [
    { anchor: "licensing",    idx: "01", name: "Licensing & new-regime build",         mono: "Stand up a programme for a new licence or regime", nameRu: "Построение программы для лицензии и нового режима" },
    { anchor: "remediation",  idx: "02", name: "Remediation",                          mono: "Post-enforcement or post-finding, back to standard", nameRu: "Ремедиация" },
    { anchor: "mlro-fiu",     idx: "03", name: "Outsourced & bridge MLRO + FIU",       mono: "Run the function, or bridge it, managed FIU",     nameRu: "Аутсорсинг и временный MLRO плюс управляемая ПФР" },
    { anchor: "audit",        idx: "04", name: "Independent AML audit",                mono: "Independent review, examiner-grade, no conflict",  nameRu: "Независимый аудит ПОД/ФТ" },
    { anchor: "sanctions-dd", idx: "05", name: "Sanctions, export-control & DD",       mono: "Screening, Travel Rule, integrity due diligence",  nameRu: "Санкции, экспортный контроль и интегрити-проверка" }
  ];

  return { sectors, theatres, markets, services,
           counts: { markets: markets.length, sectors: sectors.length } };
})();
