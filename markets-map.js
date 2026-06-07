/* Black Sea — operations map. Real country borders (d3 + world-atlas),
   markets projected by real coordinates, operating countries lit up.
   Dense clusters (the Gulf) are fanned out with leader lines to true positions. */
(function () {
  var REGIONS = { gulf:'Gulf & Levant', africa:'Africa', casia:'Central Asia & Caucasus', turkiye:'Türkiye', pakistan:'Pakistan' };
  var ORDER = ['gulf','turkiye','casia','pakistan','africa'];
  // status keys: Live, Deadline, Enforcement, eMerging, Baseline (in scope under the general AML/CFT regime)
  var L='s-live', D='s-deadline', E='s-enforce', M='s-emerging', B='s-base';

  var MARKETS = [
    { id:'uae', name:'UAE', code:'UAE', region:'gulf', status:'active', ll:[54.4,24.3], off:[80,15],
      regulators:'VARA · ADGM FSRA · DIFC DFSA · CBUAE',
      trigger:'Federal CPF decree and a live enforcement wave across all three zones.',
      industries:[
        {n:'VASP / Crypto', r:'VARA Rulebook 2.0; ADGM and DIFC virtual-asset regimes', s:L},
        {n:'Payments / MSB', r:'CBUAE; exchange-house fines and licence revocations', s:E},
        {n:'Gold & DPMS', r:'DMCC responsible sourcing; MoET DNFBP supervision', s:E},
        {n:'Real Estate', r:'DNFBP; source-of-funds and goAML reporting', s:L},
        {n:'Banks & FIs', r:'CBUAE AML/CFT and CPF (Decree 10/2025)', s:L},
        {n:'Funds & CSP', r:'ADGM and DIFC fund and corporate-service rules', s:L},
        {n:'Defense & Dual-Use', r:'Pre-IPO primes; export-control and end-user diligence', s:M}
      ]},
    { id:'saudi', name:'Saudi Arabia', code:'KSA', region:'gulf', status:'active', ll:[45.0,24.0], off:[-70,5],
      regulators:'MIMR · SAMA · CMA',
      trigger:'Cabinet Resolution 269 moved DPMS dealers into the DNFBP perimeter, effective 11 Oct 2025.',
      industries:[
        {n:'Gold & DPMS', r:'Cabinet Res. 269; dealers now DNFBP (CDD, records, STRs)', s:D},
        {n:'Defense & Dual-Use', r:'Offset / localisation JVs; ABC and intermediary diligence', s:M},
        {n:'Banks & FIs', r:'SAMA AML/CFT', s:L},
        {n:'Payments', r:'SAMA-licensed payments and fintech', s:L},
        {n:'VASP / Crypto', r:'Framework emerging under SAMA and CMA', s:M},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B},
        {n:'Funds & CSP', r:'CMA-regulated funds; AML/CFT applies', s:B}
      ]},
    { id:'kuwait', name:'Kuwait', code:'KWT', region:'gulf', status:'active', ll:[47.9,29.3], off:[-50,-50],
      regulators:'CBK · CMA · FATF action plan',
      trigger:'FATF grey-listed in February 2026; whole-sector remediation wave.',
      industries:[
        {n:'Real Estate', r:'Grey-list action plan; BO accuracy, STR outreach', s:E},
        {n:'Gold & DPMS', r:'DNFBP under tightened supervision', s:E},
        {n:'Payments / Exchanges', r:'Exchange-house STR and monitoring uplift', s:E},
        {n:'Banks & FIs', r:'CBK AML/CFT', s:L},
        {n:'VASP / Crypto', r:'No dedicated regime yet; AML/CFT applies', s:M},
        {n:'Funds & CSP', r:'CMA-regulated; AML/CFT applies', s:B}
      ]},
    { id:'bahrain', name:'Bahrain', code:'BHR', region:'gulf', status:'active', ll:[50.6,26.1], off:[55,-60],
      regulators:'CBB',
      trigger:'Crypto-Asset Module (Rulebook Vol 6); the Travel Rule on every transfer.',
      industries:[
        {n:'VASP / Crypto', r:'CBB CRA, licence Cat 1-4; Travel Rule', s:L},
        {n:'Payments', r:'CBB payment and e-money rules', s:L},
        {n:'Banks & FIs', r:'CBB AML/CFT', s:L},
        {n:'Funds & CSP', r:'CBB-regulated funds; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B},
        {n:'Gold & DPMS', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'qatar', name:'Qatar', code:'QAT', region:'gulf', status:'building', ll:[51.2,25.3], off:[90,-25],
      regulators:'QFC · QCB',
      trigger:'A digital-asset framework is forming and DNFBP supervision is broadening.',
      industries:[
        {n:'VASP / Crypto', r:'QFC digital-asset framework (forming)', s:M},
        {n:'Banks & FIs', r:'QCB AML/CFT', s:L},
        {n:'Funds & CSP', r:'QFC fund and corporate rules', s:L},
        {n:'Payments', r:'QCB payment-services rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B},
        {n:'Gold & DPMS', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'oman', name:'Oman', code:'OMN', region:'gulf', status:'building', ll:[57.5,21.5], off:[55,45],
      regulators:'CMA · FSA',
      trigger:'A virtual-asset regulatory framework was introduced in 2025.',
      industries:[
        {n:'VASP / Crypto', r:'CMA virtual-asset regime (new)', s:M},
        {n:'Banks & FIs', r:'CBO AML/CFT', s:L},
        {n:'Payments', r:'CBO payment rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B},
        {n:'Funds & CSP', r:'CMA-regulated; AML/CFT applies', s:B}
      ]},
    { id:'jordan', name:'Jordan', code:'JOR', region:'gulf', status:'building', ll:[36.2,31.3],
      regulators:'CBJ · AMLU',
      trigger:'Virtual Assets Law No. 14 of 2025; first licensing framework.',
      industries:[
        {n:'VASP / Crypto', r:'Law 14/2025; CBJ licensing, AMLU reporting', s:M},
        {n:'Payments', r:'CBJ payment-service rules', s:L},
        {n:'Banks & FIs', r:'CBJ AML/CFT', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'turkey', name:'Turkey', code:'TUR', region:'turkiye', status:'active', ll:[34.0,39.0],
      regulators:'CMB (SPK) · MASAK',
      trigger:'CASP authorisation deadline around 30 June 2026 concentrates the market at once.',
      industries:[
        {n:'VASP / Crypto', r:'Law 7518; CMB authorisation by ~30 Jun 2026', s:D},
        {n:'Gold & DPMS', r:'BIST/LBMA scrutiny in the post-IGR spillover', s:E},
        {n:'Defense & Dual-Use', r:'Export-control and sanctions-nexus diligence', s:M},
        {n:'Banks & FIs', r:'MASAK AML/CFT', s:L},
        {n:'Payments', r:'CBRT / BDDK payment rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'pakistan', name:'Pakistan', code:'PAK', region:'pakistan', status:'building', ll:[69.3,30.4],
      regulators:'PVARA · FMU (goAML)',
      trigger:'Virtual Assets Act 2025 created PVARA; the sandbox is open.',
      industries:[
        {n:'VASP / Crypto', r:'PVARA licensing; FMU / goAML reporting', s:M},
        {n:'Banks & FIs', r:'SBP AML/CFT', s:L},
        {n:'Payments', r:'SBP EMI / payment rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'kazakhstan', name:'Kazakhstan · AIFC', code:'KAZ', region:'casia', status:'active', ll:[68.0,48.0],
      regulators:'AFSA · AIFC',
      trigger:'Full AFSA supervisory regime amid the 2025-26 crackdown.',
      industries:[
        {n:'VASP / Crypto', r:'AFSA full authorisation; ML surveillance', s:L},
        {n:'Banks & FIs', r:'AFSA / NBK; sanctions-AML scrutiny', s:E},
        {n:'Funds & CSP', r:'AIFC funds and corporate services; AML/CFT applies', s:B},
        {n:'Payments', r:'NBK payment rules; AML/CFT applies', s:B}
      ]},
    { id:'uzbekistan', name:'Uzbekistan', code:'UZB', region:'casia', status:'building', ll:[63.5,41.7],
      regulators:'NAPP',
      trigger:'Crypto-licensing regime; stablecoins legalised in 2026.',
      industries:[
        {n:'VASP / Crypto', r:'NAPP licensing; local-entity requirement', s:M},
        {n:'Banks & FIs', r:'CBU AML/CFT', s:B},
        {n:'Payments', r:'CBU payment rules; AML/CFT applies', s:B}
      ]},
    { id:'kyrgyzstan', name:'Kyrgyzstan', code:'KGZ', region:'casia', status:'building', ll:[74.6,41.5],
      regulators:'FSA · SFIS',
      trigger:'Virtual Assets law 2026; IMF flagged AML gaps.',
      industries:[
        {n:'VASP / Crypto', r:'Virtual-assets law; first licences issued', s:M},
        {n:'Banks & FIs', r:'NBKR AML/CFT', s:B},
        {n:'Payments', r:'NBKR payment rules; AML/CFT applies', s:B}
      ]},
    { id:'georgia', name:'Georgia', code:'GEO', region:'casia', status:'active', ll:[43.4,42.0],
      regulators:'NBG',
      trigger:'VASP registration enforcement; a tenfold jump in AML fines in 2025.',
      industries:[
        {n:'VASP / Crypto', r:'NBG VASP registration; SoF and monitoring enforcement', s:E},
        {n:'Banks & FIs', r:'NBG AML fines (TBC, Credo)', s:E},
        {n:'Payments', r:'NBG payment-services rules; AML/CFT applies', s:B}
      ]},
    { id:'azerbaijan', name:'Azerbaijan', code:'AZE', region:'casia', status:'building', ll:[47.6,40.4],
      regulators:'CBAR',
      trigger:'Payments AML enforcement with on-site penalties.',
      industries:[
        {n:'Payments / MSB', r:'CBAR transaction-monitoring and CDD enforcement', s:E},
        {n:'Banks & FIs', r:'CBAR AML/CFT', s:L},
        {n:'VASP / Crypto', r:'No dedicated regime; AML/CFT applies', s:M},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'nigeria', name:'Nigeria', code:'NGA', region:'africa', status:'active', ll:[8.0,9.6],
      regulators:'SEC · CBN · NFIU',
      trigger:'ISA 2025 and SEC ARIP, with a provisional-to-full squeeze and bank enforcement.',
      industries:[
        {n:'VASP / Crypto', r:'ISA 2025; ARIP to full licence, the new capital floor', s:D},
        {n:'Banks & FIs', r:'CBN AML/CFT fines (Zenith, Access)', s:E},
        {n:'Payments', r:'CBN payment / IMTO rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP / SCUML registration applies', s:B}
      ]},
    { id:'kenya', name:'Kenya', code:'KEN', region:'africa', status:'building', ll:[37.9,0.2],
      regulators:'CBK · CMA',
      trigger:'VASP Act with a 4 November 2026 deadline; under FATF grey-list pressure.',
      industries:[
        {n:'VASP / Crypto', r:'VASP Act; dual CBK/CMA licensing by 4 Nov 2026', s:D},
        {n:'Banks & FIs', r:'Grey-list de-risking; correspondent EDD', s:E},
        {n:'Payments', r:'CBK payment / money-remittance rules; AML/CFT applies', s:B},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]},
    { id:'ghana', name:'Ghana', code:'GHA', region:'africa', status:'active', ll:[-1.0,7.9],
      regulators:'Bank of Ghana · SEC',
      trigger:'Inward-remittance partnership suspensions (Sep 2025); a VASP framework forming.',
      industries:[
        {n:'Payments / MSB', r:'BoG inward-remittance suspensions; re-application', s:E},
        {n:'Gold & DPMS', r:'PMMC / LBMA responsible-sourcing build', s:L},
        {n:'VASP / Crypto', r:'VASP framework (forming)', s:M},
        {n:'Banks & FIs', r:'BoG AML/CFT', s:B}
      ]},
    { id:'southafrica', name:'South Africa', code:'RSA', region:'africa', status:'active', ll:[25.0,-29.0],
      regulators:'FSCA · SARB (PA) · FIC',
      trigger:'FSCA CASP licensing alongside an active FIC-Act enforcement cycle.',
      industries:[
        {n:'Banks & FIs', r:'PA/SARB FIC-Act sanctions (Standard, HBZ, Sasfin)', s:E},
        {n:'Funds & Asset Mgmt', r:'FSCA fines (Sanlam, Ninety One, Harith)', s:E},
        {n:'VASP / Crypto', r:'FSCA CASP; FIC Travel Rule', s:L},
        {n:'Payments', r:'SARB remittance enforcement', s:E},
        {n:'Real Estate', r:'DNFBP under the FIC Act; AML/CFT applies', s:B},
        {n:'Gold & DPMS', r:'Refiners and dealers; AML/CFT applies', s:B}
      ]},
    { id:'egypt', name:'Egypt', code:'EGY', region:'africa', status:'building', ll:[30.0,26.8],
      regulators:'FRA · CBE',
      trigger:'Fintech, payments and virtual-asset architecture forming under FATF expectations.',
      industries:[
        {n:'Payments', r:'CBE payment and fintech rules', s:L},
        {n:'VASP / Crypto', r:'FRA digital-asset framework (forming)', s:M},
        {n:'Banks & FIs', r:'CBE AML/CFT', s:L},
        {n:'Real Estate', r:'DNFBP AML/CFT obligations apply', s:B}
      ]}
  ];

  var SVGNS='http://www.w3.org/2000/svg', TW=1000, FB_TH=900;
  var LON0=-20, LON1=92, LAT0=-37, LAT1=54;

  var countriesG=document.getElementById('ops-countries');
  var leadersG=document.getElementById('ops-leaders');
  var nodesG=document.getElementById('ops-nodes');
  var navEl=document.getElementById('market-nav');
  var dossier=document.getElementById('dossier');
  var byId={}; MARKETS.forEach(function(m){ byId[m.id]=m; });

  function statusLabel(s){ return s==='s-live'?'Live':s==='s-deadline'?'Deadline':s==='s-enforce'?'Enforcement':s==='s-base'?'In scope':'Emerging'; }
  function setViewBox(h){ var svg=document.querySelector('.ops-map'); if(svg) svg.setAttribute('viewBox','0 0 '+TW+' '+h); }
  function fallbackProject(ll){
    var x=(ll[0]-LON0)/(LON1-LON0)*TW;
    var y=(LAT1-ll[1])/(LAT1-LAT0)*FB_TH;
    return [x,y];
  }

  function buildNodes(project){
    MARKETS.forEach(function(m){
      var tp=project(m.ll); if(!tp || isNaN(tp[0])){ tp=fallbackProject(m.ll); }
      var np = m.off ? [tp[0]+m.off[0], tp[1]+m.off[1]] : tp;
      if(m.off){
        var ld=document.createElementNS(SVGNS,'line'); ld.setAttribute('class','leader');
        ld.setAttribute('x1',tp[0]); ld.setAttribute('y1',tp[1]); ld.setAttribute('x2',np[0]); ld.setAttribute('y2',np[1]);
        leadersG.appendChild(ld);
        var an=document.createElementNS(SVGNS,'circle'); an.setAttribute('class','anchor-dot '+(m.status==='active'?'a-active':'a-building'));
        an.setAttribute('cx',tp[0]); an.setAttribute('cy',tp[1]); an.setAttribute('r','2.5');
        leadersG.appendChild(an);
      }
      var g=document.createElementNS(SVGNS,'g');
      g.setAttribute('class','node '+(m.status==='active'?'active-market':'building-market')+(m.off?' labelled':''));
      g.setAttribute('transform','translate('+np[0]+','+np[1]+')'); g.setAttribute('data-id',m.id);
      g.setAttribute('tabindex','0'); g.setAttribute('role','button'); g.setAttribute('aria-label',m.name);
      var hit=document.createElementNS(SVGNS,'circle'); hit.setAttribute('class','node-hit'); hit.setAttribute('r','30');
      var ring=document.createElementNS(SVGNS,'circle'); ring.setAttribute('class','node-ring'); ring.setAttribute('r','10');
      var dot=document.createElementNS(SVGNS,'circle'); dot.setAttribute('class','node-dot'); dot.setAttribute('r','8');
      var t=document.createElementNS(SVGNS,'text'); t.setAttribute('class','node-label'); t.setAttribute('x','16'); t.setAttribute('y','5'); t.textContent=m.code;
      g.appendChild(hit); g.appendChild(ring); g.appendChild(dot); g.appendChild(t);
      g.addEventListener('click', function(){ select(m.id); });
      g.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); select(m.id); } });
      nodesG.appendChild(g);
    });
  }

  function buildNav(){
    ORDER.forEach(function(rk){
      var ms=MARKETS.filter(function(m){ return m.region===rk; });
      if(!ms.length) return;
      var grp=document.createElement('div'); grp.className='nav-group';
      var h=document.createElement('div'); h.className='nav-group-label'; h.textContent=REGIONS[rk];
      grp.appendChild(h);
      var row=document.createElement('div'); row.className='nav-group-row';
      ms.forEach(function(m){
        var c=document.createElement('button');
        c.className='mchip'; c.setAttribute('data-id',m.id);
        c.innerHTML='<span class="cdot" style="background:'+(m.status==='active'?'var(--signal)':'var(--amber)')+'"></span>'+m.name;
        c.addEventListener('click', function(){ select(m.id); });
        row.appendChild(c);
      });
      grp.appendChild(row); navEl.appendChild(grp);
    });
  }

  function renderDossier(m){
    var rows=m.industries.map(function(i){
      return '<div class="mrow"><div class="mind">'+i.n+'</div><div class="mreg">'+i.r+'</div><div class="mstat '+i.s+'">'+statusLabel(i.s)+'</div></div>';
    }).join('');
    dossier.innerHTML=
      '<div class="dossier-head">'+
        '<div><div class="dossier-eyebrow">Dossier // '+REGIONS[m.region]+'</div>'+
        '<div class="dossier-name">'+m.name+'</div></div>'+
        '<div class="dossier-status '+(m.status==='active'?'status-active':'status-building')+'">'+(m.status==='active'?'Active':'Building')+'</div>'+
      '</div>'+
      '<div class="dossier-body">'+
        '<div class="dblock"><span class="k">Regulators</span><span class="v">'+m.regulators+'</span></div>'+
        '<div class="dblock"><span class="k">Trigger</span><span class="v">'+m.trigger+'</span></div>'+
        '<div class="matrix-title">Regulation by industry</div>'+
        '<div class="matrix">'+rows+'</div>'+
        '<a class="dossier-cta" href="contact.html">Book a call for '+m.name+' →</a>'+
      '</div>';
  }

  function select(id){
    var m=byId[id]; if(!m) return;
    Array.prototype.forEach.call(document.querySelectorAll('.node'), function(n){ n.classList.toggle('sel', n.getAttribute('data-id')===id); });
    Array.prototype.forEach.call(document.querySelectorAll('.mchip'), function(c){ c.classList.toggle('sel', c.getAttribute('data-id')===id); });
    renderDossier(m);
    if(history.replaceState) history.replaceState(null,'','#'+id);
  }

  function drawCountries(geoContains, features, path){
    features.forEach(function(f){
      var d; try{ d=path(f); }catch(e){ d=null; }
      if(!d) return;
      var owns=false;
      for(var i=0;i<MARKETS.length;i++){ try{ if(geoContains(f, MARKETS[i].ll)){ owns=true; break; } }catch(e){} }
      var p=document.createElementNS(SVGNS,'path');
      p.setAttribute('d',d); p.setAttribute('class', owns? 'country country-active' : 'country');
      countriesG.appendChild(p);
    });
  }

  function startup(){
    buildNav();
    var def = (location.hash && byId[location.hash.slice(1)]) ? location.hash.slice(1) : 'uae';
    if(window.d3 && window.topojson && d3.json){
      d3.json('vendor/countries-110m.json').then(function(topo){
        var fc=topojson.feature(topo, topo.objects.countries);
        var proj=d3.geoMercator().scale(1).translate([0,0]);
        var nw=proj([LON0,LAT1]), se=proj([LON1,LAT0]);
        var s=TW/(se[0]-nw[0]);
        var th=Math.round((se[1]-nw[1])*s);
        proj.scale(s).translate([-nw[0]*s, -nw[1]*s]);
        setViewBox(th);
        drawCountries(d3.geoContains, fc.features, d3.geoPath(proj));
        buildNodes(function(ll){ return proj(ll); });
        select(def);
      }).catch(function(){ setViewBox(FB_TH); buildNodes(fallbackProject); select(def); });
    } else {
      setViewBox(FB_TH); buildNodes(fallbackProject); select(def);
    }
  }
  startup();
})();
