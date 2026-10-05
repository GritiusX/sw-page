const ELEMENT_CLASS = {
  Fire: "el-fire", Water: "el-water", Wind: "el-wind",
  Light: "el-light", Dark: "el-dark",
};
const IMG   = (f) => f ? `/images/monsters/${f}` : "/placeholder.png";
const STARS = (n) => "★".repeat(n);

/* ── Search nav ── */
function initSearchNav() {
  const p = new URLSearchParams(location.hash.slice(1));
  document.getElementById("search").value    = p.get("q")         || "";
  document.getElementById("element").value   = p.get("element")   || "";
  document.getElementById("archetype").value = p.get("archetype") || "";
  document.getElementById("stars").value     = p.get("stars")     || "";

  let t;
  document.getElementById("search").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => goHome({ q: e.target.value }), 300);
  });
  ["element","archetype","stars"].forEach(id =>
    document.getElementById(id).addEventListener("change", (e) => goHome({ [id]: e.target.value }))
  );
}

function goHome(overrides = {}) {
  const p = new URLSearchParams(location.hash.slice(1));
  p.delete("monster"); p.delete("page");
  Object.entries(overrides).forEach(([k,v]) => v ? p.set(k,v) : p.delete(k));
  const s = p.toString();
  location.href = "/" + (s ? "#" + s : "");
}

/* ── Init ── */
const monsterId = location.pathname.replace(/^\/rune-examples\//, "").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", async () => {
  initSearchNav();
  if (!monsterId) { showError("No monster specified."); return; }

  const [mRes, rbRes] = await Promise.all([
    fetch(`/api/monsters/${monsterId}`, { cache: "no-store" }),
    fetch(`/api/rune-builds/${monsterId}`),
  ]);
  if (!mRes.ok) { showError("Monster not found."); return; }

  const m      = await mRes.json();
  const rb     = rbRes.ok ? await rbRes.json() : { results: [] };
  const builds = rb.results || [];

  document.title = `${m.name} — Rune Examples — SW Guide`;
  document.getElementById("rune-page").innerHTML = renderPage(m, builds);
  window._currentMonster = m;

  initRuneStar(builds);
  initBuildsList(builds);
});

function showError(msg) {
  document.getElementById("rune-page").innerHTML =
    `<div class="empty"><div class="big">😵</div>${msg}</div>`;
}

/* ── Family strip ── */
function familyStripHTML(m) {
  const family = (m._family || []).filter(f =>
    m.awaken_level > 0 ? f.awaken_level > 0 : f.awaken_level === 0
  );
  if (family.length <= 1) return "";
  return `<div class="family-strip">
    ${family.map(f => `
      <a class="family-card${f.id === m.id ? " family-card-active" : ""}" href="/rune-examples/${f.id}">
        <img src="${IMG(f.image_filename)}" alt="${f.name}" onerror="this.src='/placeholder.png'">
        <div class="family-card-info">
          <div class="family-card-name">${f.name}</div>
          <div class="family-card-el">
            <span class="badge-element ${ELEMENT_CLASS[f.element] || ""}">${f.element}</span>
          </div>
        </div>
      </a>`).join("")}
  </div>`;
}

/* ── Page layout ── */
function renderPage(m, builds) {
  const elClass = ELEMENT_CLASS[m.element] || "";

  const heroHTML = `
    <div class="mp-hero" style="margin-bottom:1.2rem">
      <img class="mp-img" src="${IMG(m.image_filename)}" alt="${m.name}" onerror="this.src='/placeholder.png'">
      <div class="mp-hero-info">
        <h1 class="mp-name">${m.name}</h1>
        <div class="detail-badges">
          <span class="badge-element ${elClass}">${m.element}</span>
          <span class="badge-arch">${m.archetype}</span>
          <span class="stars">${STARS(m.natural_stars)}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:.4rem;margin-top:.7rem">
          <a href="/monsters/${m.id}" class="nav-pill nav-pill-back">← Back to monster page</a>
          <a href="/team-comp/${m.id}" class="nav-pill nav-pill-tc">👥 Team Composition</a>
        </div>
      </div>
    </div>`;

  const addBtn = `
    <button onclick="openAddRuneModal()" style="background:linear-gradient(135deg,#1a3a2a,#2a5a3a);border:1px solid #3a8a5a;color:#80d8a0;border-radius:20px;padding:.4rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
      ➕ Add a rune example
    </button>`;

  const askBtn = `
    <button onclick="openAskModal()" style="background:linear-gradient(135deg,#1e2a4a,#2a3a6a);border:1px solid #3a4a8a;color:#a0b8f8;border-radius:20px;padding:.4rem 1rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
      🙋 Ask for a rune example
    </button>`;

  return `
    <div class="section-title" style="margin-top:0">Rune Examples — ${m.name}</div>
    ${familyStripHTML(m)}

    <div style="display:grid;grid-template-columns:1fr auto;gap:2.5rem;margin-top:1.2rem;align-items:start">

      <!-- LEFT: hero + ask + builds list -->
      <div>
        ${heroHTML}
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.4rem">${addBtn}${askBtn}</div>
        <div id="examples-section"></div>
      </div>

      <!-- RIGHT: star -->
      <div style="display:flex;flex-direction:column;align-items:center">
        <div id="rune-star-wrap" style="filter:drop-shadow(0 8px 32px rgba(0,0,0,.8))"></div>
      </div>

    </div>`;
}

/* ── Rune icon helper ── */
function runeIcon(setName, size = 20) {
  if (!setName) return "";
  const key = setName.toLowerCase();
  return `<img src="/images/runes/${key}.webp" width="${size}" height="${size}" style="object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'" title="${setName}">`;
}

/* ── Builds list (left column) ── */
const EX_PER_PAGE = 5;
let _exPage    = 1;
let _allBuilds = [];
let _activeBuildIdx = 0;

function initBuildsList(builds) {
  _allBuilds = builds;
  _exPage    = 1;
  renderBuildsList();
}

function renderBuildsList() {
  const el = document.getElementById("examples-section");
  if (!el) return;

  if (_allBuilds.length === 0) {
    el.innerHTML = `<div class="empty" style="margin-top:.5rem"><div class="big">📭</div><p>No rune builds for this monster yet.</p></div>`;
    return;
  }

  const total = Math.ceil(_allBuilds.length / EX_PER_PAGE);
  const slice = _allBuilds.slice((_exPage - 1) * EX_PER_PAGE, _exPage * EX_PER_PAGE);

  const items = slice.map((b, i) => {
    const idx = (_exPage - 1) * EX_PER_PAGE + i;
    const isActive = idx === _activeBuildIdx;
    // Count rune sets
    const setCounts = {};
    for (const s of (b.slots || [])) {
      if (s && s.rune_set) setCounts[s.rune_set] = (setCounts[s.rune_set] || 0) + 1;
    }
    const sortedSets = Object.entries(setCounts).sort((a, b) => b[1] - a[1]);
    const setIcons = sortedSets
      .map(([name, cnt]) => `<span style="display:inline-flex;align-items:center;gap:3px">${runeIcon(name, 18)}<span style="color:#a0a8c0;font-size:.76rem">${cnt > 1 ? `(${cnt})` : ""}</span></span>`)
      .join('<span style="color:#444;margin:0 2px">·</span>');
    const firstIcon = sortedSets.length ? runeIcon(sortedSets[0][0], 28) : "⚔";
    return `
      <div onclick="selectBuild(${idx})"
           style="display:flex;align-items:center;gap:.8rem;padding:.55rem .8rem;background:${isActive ? '#1e1a38' : '#1a1d27'};border:1px solid ${isActive ? '#7c6cf8' : '#2e3250'};border-radius:8px;margin-bottom:.45rem;cursor:pointer;transition:border-color .15s"
           onmouseover="this.style.borderColor='#7c6cf8'" onmouseout="this.style.borderColor='${isActive ? '#7c6cf8' : '#2e3250'}'">
        <div style="width:40px;height:40px;background:#22263a;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${firstIcon}</div>
        <div style="min-width:0">
          <div style="color:#c8cadf;font-size:.9rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.name || `Build #${idx + 1}`}</div>
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:2px">${setIcons || '<span style="color:#555;font-size:.76rem">No sets</span>'}</div>
        </div>
        <span style="margin-left:auto;color:#8b90b0;font-size:.78rem;flex-shrink:0">👁</span>
      </div>`;
  }).join("");

  const pagin = total > 1
    ? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.7rem">
        ${Array.from({length:total},(_,i)=>i+1).map(n =>
          `<button onclick="exGoPage(${n})" style="background:${n===_exPage?'#7c6cf8':'#22263a'};color:${n===_exPage?'#fff':'#c8cadf'};border:1px solid #2e3250;border-radius:6px;padding:.22rem .55rem;font-size:.78rem;cursor:pointer">${n}</button>`
        ).join(" ")}
       </div>`
    : "";

  el.innerHTML = `
    <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:#8b90b0;margin-bottom:.6rem">
      Rune builds (${_allBuilds.length})
    </div>
    ${items}
    ${pagin}`;
}

function selectBuild(idx) {
  _activeBuildIdx = idx;
  renderBuildsList();
  updateStarForBuild(_allBuilds[idx]);
}

function exGoPage(n) {
  _exPage = n;
  renderBuildsList();
}

/* ── Rune Star ── */
let _starSegEls = [];
let _starSvgEl  = null;
let _starActiveIdx = -1;

function initRuneStar(builds) {
  const wrap = document.getElementById("rune-star-wrap");
  if (!wrap) return;

  const slots = builds.length > 0 ? (builds[0].slots || []) : [];
  _buildStar(wrap, slots);

  if (builds.length > 0) {
    _activeBuildIdx = 0;
    renderBuildsList();
  }
}

function updateStarForBuild(build) {
  const wrap = document.getElementById("rune-star-wrap");
  if (!wrap) return;
  closeStatTooltip();
  _starActiveIdx = -1;
  wrap.innerHTML = "";
  _buildStar(wrap, build ? (build.slots || []) : []);
}

function _buildStar(wrap, slots) {
  _starSegEls = [];
  _starActiveIdx = -1;

  const NS = "http://www.w3.org/2000/svg";

  /* Geometry — sharp kite shape matching image reference */
  const CX = 200, CY = 200;
  const R1  = 52;   // inner corner  (α ± 30°)
  const R2  = 110;  // outer shoulder (α ± 21°) — narrower angle = more pointed
  const R3  = 158;  // outer tip
  const ANGLES = [0, 60, 120, 180, 240, 300]; // Star of David: 1=top, 2=top-right…

  const toRad = d => d * Math.PI / 180;
  const pt    = (r, deg) => [
    CX + r * Math.sin(toRad(deg)),
    CY - r * Math.cos(toRad(deg)),
  ];

  function segPts(a) {
    return [
      pt(R1, a - 30),  // inner left
      pt(R2, a - 21),  // shoulder left  (narrower angle → pointier)
      pt(R3, a),       // tip
      pt(R2, a + 21),  // shoulder right
      pt(R1, a + 30),  // inner right
    ];
  }

  /* Straight-line polygon — no rounding */
  function sharpPath(pts) {
    return "M " + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L ") + " Z";
  }

  /* Label position: 54% from inner to tip */
  const labelPt = a => pt(R1 + (R3 - R1) * 0.54, a);

  /* SVG */
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 400 400");
  svg.setAttribute("width",  "300");
  svg.setAttribute("height", "300");

  svg.innerHTML = `
    <defs>
      <radialGradient id="rs-bg" cx="50%" cy="50%" r="50%">
        <stop offset="40%"  stop-color="#1c1208"/>
        <stop offset="100%" stop-color="#3a2510"/>
      </radialGradient>
      <radialGradient id="rs-empty" cx="38%" cy="32%" r="65%">
        <stop offset="0%"   stop-color="#221508"/>
        <stop offset="100%" stop-color="#110a02"/>
      </radialGradient>
      <radialGradient id="rs-full" cx="38%" cy="32%" r="65%">
        <stop offset="0%"   stop-color="#3e2a0c"/>
        <stop offset="100%" stop-color="#1c1005"/>
      </radialGradient>
      <radialGradient id="rs-active" cx="38%" cy="32%" r="65%">
        <stop offset="0%"   stop-color="#7a4e1a"/>
        <stop offset="100%" stop-color="#3d2208"/>
      </radialGradient>
      <radialGradient id="rs-center" cx="38%" cy="32%" r="60%">
        <stop offset="0%"   stop-color="#2a1808"/>
        <stop offset="100%" stop-color="#0e0804"/>
      </radialGradient>
    </defs>
    <circle cx="200" cy="200" r="178" fill="url(#rs-bg)" stroke="#5e3a0e" stroke-width="4"/>
    <circle cx="200" cy="200" r="171" fill="none"         stroke="#2a1808" stroke-width="1.5"/>
  `;

  const g = document.createElementNS(NS, "g");
  svg.appendChild(g);

  /* Center circle (drawn last to cover inner shared corners) */
  const centerG = document.createElementNS(NS, "g");
  centerG.innerHTML = `
    <circle cx="200" cy="200" r="44" fill="url(#rs-center)" stroke="#b87820" stroke-width="2.8"/>
    <circle cx="200" cy="200" r="36" fill="none" stroke="#7a4e14" stroke-width="1.2"/>
    <text x="200" y="210" text-anchor="middle" font-size="24" fill="#8a6030" font-family="Georgia,serif">⚔</text>
  `;

  ANGLES.forEach((alpha, i) => {
    const slotData = slots[i] || null;
    const hasFill  = !!(slotData && (slotData.rune_set || slotData.main_stat));
    const pts     = segPts(alpha);
    const d       = sharpPath(pts);
    const [lx,ly] = labelPt(alpha);

    const grp = document.createElementNS(NS, "g");
    grp.style.cursor = hasFill ? "pointer" : "default";

    /* Outer dark shadow stroke — creates visible gap between segments */
    const shadow = document.createElementNS(NS, "path");
    shadow.setAttribute("d", d);
    shadow.setAttribute("fill", "none");
    shadow.setAttribute("stroke", "#050200");
    shadow.setAttribute("stroke-width", "8");
    shadow.setAttribute("stroke-linejoin", "miter");
    grp.appendChild(shadow);

    /* Main fill */
    const fill = document.createElementNS(NS, "path");
    fill.setAttribute("d", d);
    fill.setAttribute("fill", hasFill ? "url(#rs-full)" : "url(#rs-empty)");
    fill.setAttribute("stroke", hasFill ? "#c8881a" : "#3d2208");
    fill.setAttribute("stroke-width", "2.2");
    fill.setAttribute("stroke-linejoin", "miter");
    grp.appendChild(fill);

    /* Inner bevel glow */
    const bevel = document.createElementNS(NS, "path");
    bevel.setAttribute("d", d);
    bevel.setAttribute("fill", "none");
    bevel.setAttribute("stroke", hasFill ? "rgba(255,200,80,.11)" : "rgba(100,60,10,.06)");
    bevel.setAttribute("stroke-width", "4");
    bevel.setAttribute("stroke-linejoin", "miter");
    grp.appendChild(bevel);

    /* Slot icon (rune set) or slot number */
    if (hasFill && slotData.rune_set) {
      const iconSize = 36;
      const img = document.createElementNS(NS, "image");
      img.setAttribute("href", `/images/runes/${slotData.rune_set.toLowerCase()}.webp`);
      img.setAttribute("x",      (lx - iconSize / 2).toFixed(1));
      img.setAttribute("y",      (ly - iconSize / 2).toFixed(1));
      img.setAttribute("width",  iconSize);
      img.setAttribute("height", iconSize);
      img.setAttribute("pointer-events", "none");
      grp.appendChild(img);
      /* small slot number in corner */
      const numTxt = document.createElementNS(NS, "text");
      const [nx, ny] = labelPt(alpha + 18);
      numTxt.setAttribute("x", (lx + iconSize * 0.38).toFixed(1));
      numTxt.setAttribute("y", (ly + iconSize * 0.55).toFixed(1));
      numTxt.setAttribute("text-anchor", "middle");
      numTxt.setAttribute("font-size", "13");
      numTxt.setAttribute("font-weight", "bold");
      numTxt.setAttribute("fill", "#ffe033");
      numTxt.setAttribute("stroke", "#1a0e00");
      numTxt.setAttribute("stroke-width", "2");
      numTxt.setAttribute("paint-order", "stroke");
      numTxt.setAttribute("pointer-events", "none");
      numTxt.setAttribute("font-family", "Georgia,serif");
      numTxt.textContent = i + 1;
      grp.appendChild(numTxt);
    } else {
      const txt = document.createElementNS(NS, "text");
      txt.setAttribute("x",            lx.toFixed(1));
      txt.setAttribute("y",            (ly + 8).toFixed(1));
      txt.setAttribute("text-anchor",  "middle");
      txt.setAttribute("font-size",    "22");
      txt.setAttribute("font-weight",  "bold");
      txt.setAttribute("fill",         hasFill ? "#ffe033" : "#7a4e10");
      txt.setAttribute("stroke",       hasFill ? "#3a2000" : "none");
      txt.setAttribute("stroke-width", "2.5");
      txt.setAttribute("paint-order",  "stroke");
      txt.setAttribute("pointer-events", "none");
      txt.setAttribute("font-family",  "Georgia,serif");
      txt.textContent = i + 1;
      grp.appendChild(txt);
    }

    /* Hover & click — only on filled segments */
    if (hasFill) {
      grp.addEventListener("mouseenter", () => {
        if (_starActiveIdx !== i) fill.setAttribute("fill", "#4a2e0e");
      });
      grp.addEventListener("mouseleave", () => {
        if (_starActiveIdx !== i) fill.setAttribute("fill", "url(#rs-full)");
      });
      grp.addEventListener("click", () => {
        _starSegEls.forEach((el, j) => {
          el.fill.setAttribute("fill",
            j === i ? "url(#rs-active)" : (el.hasFill ? "url(#rs-full)" : "url(#rs-empty)")
          );
        });
        _starActiveIdx = i;
        showStatTooltip(i, slotData, svg);
      });
    }

    _starSegEls.push({ grp, fill, hasFill });
    g.appendChild(grp);
  });

  svg.appendChild(centerG);
  _starSvgEl = svg;
  wrap.appendChild(svg);
}

/* ── Stat tooltip (position:fixed near clicked segment) ── */
let _statTooltip = null;

function _ensureTooltip() {
  if (_statTooltip) return _statTooltip;
  const d = document.createElement("div");
  d.id = "rs-stat-tooltip";
  d.style.cssText = "display:none;position:fixed;background:#1a1d27;border:1px solid #c8881a;border-radius:10px;padding:.9rem 1rem;max-width:200px;z-index:500;box-shadow:0 8px 32px rgba(0,0,0,.8);pointer-events:none";
  document.body.appendChild(d);
  _statTooltip = d;
  return d;
}

function showStatTooltip(slotIdx, slot, svgEl) {
  const tip = _ensureTooltip();
  if (!slot) { closeStatTooltip(); return; }

  const alpha = [0, 60, 120, 180, 240, 300][slotIdx];
  const R3 = 158;
  const rect = svgEl.getBoundingClientRect();
  const scaleX = rect.width / 400, scaleY = rect.height / 400;
  const tipX = rect.left + (200 + R3 * Math.sin(alpha * Math.PI / 180)) * scaleX;
  const tipY = rect.top  + (200 - R3 * Math.cos(alpha * Math.PI / 180)) * scaleY;
  const dx = Math.sin(alpha * Math.PI / 180);
  const dy = -Math.cos(alpha * Math.PI / 180);

  const subs = (slot.substats || []).map(s => `<div style="color:#a0b8f8;font-size:.8rem">${s}</div>`).join("");
  tip.innerHTML = `
    <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.5rem">
      <span style="background:#2a1f5a;color:#c8c0f8;border-radius:4px;padding:.1rem .4rem;font-size:.72rem;font-weight:700">Slot ${slotIdx + 1}</span>
      ${slot.rune_set ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#1a2a1a;color:#80c880;border-radius:4px;padding:.1rem .5rem;font-size:.72rem;font-weight:700">${runeIcon(slot.rune_set, 16)}${slot.rune_set}</span>` : ""}
    </div>
    ${slot.main_stat ? `<div style="color:#e8c060;font-size:.92rem;font-weight:600;margin-bottom:.3rem">${slot.main_stat}</div>` : ""}
    ${subs}`;

  tip.style.display = "block";
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let x = tipX + dx * 14 - tw / 2;
  let y = tipY + dy * 14 - th / 2;
  x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
  y = Math.max(8, Math.min(window.innerHeight - th - 8, y));
  tip.style.left = x + "px";
  tip.style.top  = y + "px";
}

function closeStatTooltip() {
  if (_statTooltip) _statTooltip.style.display = "none";
}

/* ── Lightbox (keep for potential legacy use) ── */
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  document.getElementById("lightbox-img").src = src;
  lb.style.display = "flex";
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.style.display = "none";
}

/* ── Ask-for-rune modal ── */
function openAskModal() {
  const m = window._currentMonster;
  if (!m) return;
  document.getElementById("askTitle").textContent = `Request Rune Example — ${m.name}`;
  document.getElementById("askDesc").textContent  = `Don't see good rune builds for ${m.name}? Send a request and we'll add examples soon!`;
  document.getElementById("askMsg").textContent   = "";
  document.getElementById("askSubmitBtn").disabled    = false;
  document.getElementById("askSubmitBtn").textContent = "Send Request";
  if (window.turnstile) window.turnstile.reset();
  document.getElementById("askOverlay").style.display = "flex";
}
function closeAskModal() {
  document.getElementById("askOverlay").style.display = "none";
}
async function submitAskRequest() {
  const m = window._currentMonster;
  if (!m) return;
  const token = document.querySelector("#askCaptcha [name='cf-turnstile-response']")?.value || "";
  const btn   = document.getElementById("askSubmitBtn");
  const msg   = document.getElementById("askMsg");
  if (!token) { msg.style.color = "#e08080"; msg.textContent = "Please complete the CAPTCHA first."; return; }
  btn.disabled = true; btn.textContent = "Sending…";
  const res = await fetch("/api/request-rune", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monster_id: m.id, monster_name: m.name, token }),
  });
  if (res.ok) {
    msg.style.color = "#80c880"; msg.textContent = "Request sent! We'll add examples soon 🙏";
    btn.textContent = "Sent!";
    setTimeout(closeAskModal, 2000);
  } else {
    btn.disabled = false; btn.textContent = "Send Request";
    msg.style.color = "#e08080"; msg.textContent = "Failed — please try again.";
    if (window.turnstile) window.turnstile.reset();
  }
}

/* ── Add-rune-build modal (SVG star builder) ── */
const _AR_FIXED_MAIN = {0:'ATK', 2:'DEF', 4:'HP'};
const _AR_MAIN_OPTS  = {
  1: ['SPD','ATK%','DEF%','HP%','ATK','DEF','HP'],
  3: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%'],
  5: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%']
};
const _AR_SUB_TYPES  = ['SPD','ATK','ATK%','DEF','DEF%','HP','HP%','CR%','CD%','RES%','ACC%'];
const _AR_MAIN_DEFS  = {
  'ATK':'160','DEF':'160','HP':'2484','ATK%':'63','DEF%':'63','HP%':'63',
  'SPD':'42','RES%':'63','ACC%':'63','CR%':'58','CD%':'80'
};
const _AR_ANGLES = [0, 60, 120, 180, 240, 300];
const _AR_CX = 200, _AR_CY = 200, _AR_R1 = 52, _AR_R2 = 110, _AR_R3 = 158;

let _arSlots       = [{},{},{},{},{},{}];
let _arSegEls      = [];
let _arCurrentSlot = -1;
let _arSvgEl       = null;

const _AR_SF  = 'background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
const _AR_SFW = 'flex:1;min-width:0;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
const _AR_IFW = 'width:68px;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';

function _arToRad(d) { return d * Math.PI / 180; }
function _arPt(r, deg) { return [_AR_CX + r * Math.sin(_arToRad(deg)), _AR_CY - r * Math.cos(_arToRad(deg))]; }
function _arSegPts(a) {
  return [_arPt(_AR_R1,a-30), _arPt(_AR_R2,a-21), _arPt(_AR_R3,a), _arPt(_AR_R2,a+21), _arPt(_AR_R1,a+30)];
}
function _arSharpPath(pts) {
  return 'M ' + pts.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ') + ' Z';
}
function _arLabelPt(a) { return _arPt(_AR_R1 + (_AR_R3 - _AR_R1) * 0.54, a); }

function _arSubTypeOpts(selected) {
  return '<option value="">— none —</option>' +
    _AR_SUB_TYPES.map(t => `<option value="${t}"${t===selected?' selected':''}>${t}</option>`).join('');
}
function _arMainTypeOpts(slotIdx, selected) {
  return '<option value="">— type —</option>' +
    (_AR_MAIN_OPTS[slotIdx]||[]).map(t => `<option value="${t}"${t===selected?' selected':''}>${t}</option>`).join('');
}
function _arParseStatStr(s) {
  if (!s) return {type:'',val:''};
  const m = s.match(/^(.+?)\+(.*)$/);
  return m ? {type:m[1],val:m[2]} : {type:s,val:''};
}

function arUpdateSetIcon(val) {
  const el = document.getElementById('arRuneSetIcon');
  if (!el) return;
  if (val) { el.src = '/images/runes/' + val.toLowerCase() + '.webp'; el.style.display = 'inline'; }
  else { el.style.display = 'none'; }
}
function _arAutoFillMainVal(sel) {
  const d = _AR_MAIN_DEFS[sel.value];
  if (d) { const el = document.getElementById('arMainVal'); if (el) el.value = d; }
}

function _arRenderMainSection(slotIdx, slot) {
  const box = document.getElementById('arMainSection');
  if (!box) return;
  const fixed  = _AR_FIXED_MAIN[slotIdx];
  const parsed = _arParseStatStr((slot && slot.main_stat) || '');
  if (fixed) {
    const fixedVal = parsed.val || (_AR_MAIN_DEFS[fixed] || '');
    box.innerHTML = `<div style="display:flex;gap:.4rem;align-items:center">
      <span style="background:#2e3250;color:#7c6cf8;border-radius:5px;padding:.3rem .6rem;font-size:.82rem;font-weight:700;flex-shrink:0">${fixed}</span>
      <input id="arMainVal" type="text" placeholder="value" value="${fixedVal}" style="${_AR_SF};flex:1">
      </div>`;
  } else {
    const varVal = parsed.val || (parsed.type ? (_AR_MAIN_DEFS[parsed.type] || '') : '');
    box.innerHTML = `<div style="display:flex;gap:.4rem;align-items:center">
      <select id="arMainType" onchange="_arAutoFillMainVal(this)" style="${_AR_SFW}">${_arMainTypeOpts(slotIdx, parsed.type)}</select>
      <input id="arMainVal" type="text" placeholder="val" value="${varVal}" style="${_AR_IFW}">
      </div>`;
  }
}

function _arRenderSubSection(slot) {
  const box = document.getElementById('arSubSection');
  if (!box) return;
  const subs = (slot && slot.substats) || [];
  let rows = '';
  for (let k = 0; k < 4; k++) {
    const parsed = _arParseStatStr(subs[k] || '');
    rows += `<div style="display:flex;gap:.4rem;margin-bottom:.28rem">
      <select id="arSub${k}Type" style="${_AR_SFW}">${_arSubTypeOpts(parsed.type)}</select>
      <input id="arSub${k}Val" type="text" placeholder="val" value="${parsed.val}" style="${_AR_IFW}">
      </div>`;
  }
  box.innerHTML = rows;
}

function _arBuildStar() {
  const con = document.getElementById('arStarContainer');
  if (!con) return;
  con.innerHTML = '';
  _arSegEls = [];
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('width', '260'); svg.setAttribute('height', '260');
  svg.innerHTML = '<defs>'
    + '<radialGradient id="ar-bg" cx="50%" cy="50%" r="50%"><stop offset="40%" stop-color="#1c1208"/><stop offset="100%" stop-color="#3a2510"/></radialGradient>'
    + '<radialGradient id="ar-empty" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#221508"/><stop offset="100%" stop-color="#110a02"/></radialGradient>'
    + '<radialGradient id="ar-full" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#3e2a0c"/><stop offset="100%" stop-color="#1c1005"/></radialGradient>'
    + '<radialGradient id="ar-active" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#7a4e1a"/><stop offset="100%" stop-color="#3d2208"/></radialGradient>'
    + '<radialGradient id="ar-center" cx="38%" cy="32%" r="60%"><stop offset="0%" stop-color="#2a1808"/><stop offset="100%" stop-color="#0e0804"/></radialGradient>'
    + '</defs>'
    + '<circle cx="200" cy="200" r="178" fill="url(#ar-bg)" stroke="#5e3a0e" stroke-width="4"/>'
    + '<circle cx="200" cy="200" r="171" fill="none" stroke="#2a1808" stroke-width="1.5"/>';
  const g = document.createElementNS(NS, 'g');
  svg.appendChild(g);
  const centerG = document.createElementNS(NS, 'g');
  centerG.innerHTML = '<circle cx="200" cy="200" r="44" fill="url(#ar-center)" stroke="#b87820" stroke-width="2.8"/>'
    + '<circle cx="200" cy="200" r="36" fill="none" stroke="#7a4e14" stroke-width="1.2"/>'
    + '<text x="200" y="210" text-anchor="middle" font-size="24" fill="#8a6030" font-family="Georgia,serif">⚔</text>';

  _AR_ANGLES.forEach((alpha, i) => {
    const hasFill = !!(_arSlots[i] && (_arSlots[i].rune_set || _arSlots[i].main_stat));
    const pts = _arSegPts(alpha);
    const d   = _arSharpPath(pts);
    const [lx, ly] = _arLabelPt(alpha);
    const grp = document.createElementNS(NS, 'g');
    grp.style.cursor = 'pointer';

    const shadow = document.createElementNS(NS, 'path');
    shadow.setAttribute('d', d); shadow.setAttribute('fill', 'none');
    shadow.setAttribute('stroke', '#050200'); shadow.setAttribute('stroke-width', '8');
    shadow.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(shadow);

    const fill = document.createElementNS(NS, 'path');
    fill.setAttribute('d', d);
    fill.setAttribute('fill', hasFill ? 'url(#ar-full)' : 'url(#ar-empty)');
    fill.setAttribute('stroke', hasFill ? '#c8881a' : '#3d2208');
    fill.setAttribute('stroke-width', '2.2'); fill.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(fill);

    const bevel = document.createElementNS(NS, 'path');
    bevel.setAttribute('d', d); bevel.setAttribute('fill', 'none');
    bevel.setAttribute('stroke', hasFill ? 'rgba(255,200,80,.11)' : 'rgba(100,60,10,.06)');
    bevel.setAttribute('stroke-width', '4'); bevel.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(bevel);

    if (hasFill && _arSlots[i].rune_set) {
      const iconSize = 36;
      const imgEl = document.createElementNS(NS, 'image');
      imgEl.setAttribute('href', '/images/runes/' + _arSlots[i].rune_set.toLowerCase() + '.webp');
      imgEl.setAttribute('x', (lx - iconSize/2).toFixed(1)); imgEl.setAttribute('y', (ly - iconSize/2).toFixed(1));
      imgEl.setAttribute('width', iconSize); imgEl.setAttribute('height', iconSize);
      imgEl.setAttribute('pointer-events', 'none');
      grp.appendChild(imgEl);
      const numEl = document.createElementNS(NS, 'text');
      numEl.setAttribute('x', (lx + iconSize*0.38).toFixed(1)); numEl.setAttribute('y', (ly + iconSize*0.55).toFixed(1));
      numEl.setAttribute('text-anchor','middle'); numEl.setAttribute('font-size','13');
      numEl.setAttribute('font-weight','bold'); numEl.setAttribute('fill','#ffe033');
      numEl.setAttribute('stroke','#1a0e00'); numEl.setAttribute('stroke-width','2');
      numEl.setAttribute('paint-order','stroke'); numEl.setAttribute('pointer-events','none');
      numEl.setAttribute('font-family','Georgia,serif'); numEl.textContent = i + 1;
      grp.appendChild(numEl);
    } else {
      const txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', lx.toFixed(1)); txt.setAttribute('y', (ly+8).toFixed(1));
      txt.setAttribute('text-anchor','middle'); txt.setAttribute('font-size','22');
      txt.setAttribute('font-weight','bold'); txt.setAttribute('fill', hasFill ? '#ffe033' : '#7a4e10');
      txt.setAttribute('stroke', hasFill ? '#3a2000' : 'none');
      txt.setAttribute('stroke-width','2.5'); txt.setAttribute('paint-order','stroke');
      txt.setAttribute('pointer-events','none'); txt.setAttribute('font-family','Georgia,serif');
      txt.textContent = i + 1;
      grp.appendChild(txt);
    }

    grp.addEventListener('mouseenter', () => { if (_arCurrentSlot !== i) fill.setAttribute('fill', hasFill ? '#5a3a0e' : '#3a2510'); });
    grp.addEventListener('mouseleave', () => { if (_arCurrentSlot !== i) fill.setAttribute('fill', hasFill ? 'url(#ar-full)' : 'url(#ar-empty)'); });
    grp.addEventListener('click', () => _arOpenSlotForm(i, svg));
    _arSegEls.push({ grp, fill, hasFill: !!(hasFill) });
    g.appendChild(grp);
  });

  svg.appendChild(centerG);
  _arSvgEl = svg;
  con.appendChild(svg);
}

function _arHighlightSeg(activeIdx) {
  _arSegEls.forEach((el, j) => {
    const isFilled = !!(_arSlots[j] && (_arSlots[j].rune_set || _arSlots[j].main_stat));
    el.fill.setAttribute('fill', j === activeIdx ? 'url(#ar-active)' : (isFilled ? 'url(#ar-full)' : 'url(#ar-empty)'));
  });
}

function _arOpenSlotForm(segIdx, svgEl) {
  _arCurrentSlot = segIdx;
  const alpha = _AR_ANGLES[segIdx];
  const rect  = svgEl.getBoundingClientRect();
  const scaleX = rect.width / 400, scaleY = rect.height / 400;
  const tipX = rect.left + (_AR_CX + _AR_R3 * Math.sin(_arToRad(alpha))) * scaleX;
  const tipY = rect.top  + (_AR_CY - _AR_R3 * Math.cos(_arToRad(alpha))) * scaleY;
  const dx = Math.sin(_arToRad(alpha)), dy = -Math.cos(_arToRad(alpha));
  const formW = 290, formH = 360;
  let x = tipX + dx * 18 - formW / 2;
  let y = tipY + dy * 18 - formH / 2;
  x = Math.max(8, Math.min(window.innerWidth  - formW - 8, x));
  y = Math.max(8, Math.min(window.innerHeight - formH - 8, y));
  const form = document.getElementById('arSlotForm');
  form.style.left = x + 'px'; form.style.top = y + 'px';
  document.getElementById('arFormTitle').textContent = 'Slot ' + (segIdx + 1);
  const slot = _arSlots[segIdx] || {};
  document.getElementById('arRuneSet').value = slot.rune_set || '';
  arUpdateSetIcon(slot.rune_set || '');
  _arRenderMainSection(segIdx, slot);
  _arRenderSubSection(slot);
  form.style.display = 'block';
  _arHighlightSeg(segIdx);
}

function arCloseSlotForm() {
  document.getElementById('arSlotForm').style.display = 'none';
  _arCurrentSlot = -1;
  _arSegEls.forEach((el, j) => {
    const isFilled = !!(_arSlots[j] && (_arSlots[j].rune_set || _arSlots[j].main_stat));
    el.fill.setAttribute('fill', isFilled ? 'url(#ar-full)' : 'url(#ar-empty)');
  });
}

function arSaveSlot() {
  const i = _arCurrentSlot;
  if (i < 0) return;
  const set      = document.getElementById('arRuneSet').value;
  const fixed    = _AR_FIXED_MAIN[i];
  const mainType = fixed || (document.getElementById('arMainType') ? document.getElementById('arMainType').value : '');
  const mainValEl = document.getElementById('arMainVal');
  const mainVal   = mainValEl ? mainValEl.value.trim() : '';
  const main = mainType ? (mainVal ? mainType + '+' + mainVal : mainType) : '';
  const subs = [];
  for (let k = 0; k < 4; k++) {
    const t = document.getElementById(`arSub${k}Type`)?.value || '';
    const v = document.getElementById(`arSub${k}Val`)?.value.trim() || '';
    if (t) subs.push(v ? t + '+' + v : t);
  }
  _arSlots[i] = { rune_set: set, main_stat: main, substats: subs };
  arCloseSlotForm();
  _arBuildStar();
  _arUpdateSummary();
}

function _arUpdateSummary() {
  const box = document.getElementById('arSlotsSummary');
  if (!box) return;
  box.innerHTML = _arSlots.map((s, i) => {
    const filled = !!(s && (s.rune_set || s.main_stat));
    const icon = (filled && s.rune_set)
      ? `<img src="/images/runes/${s.rune_set.toLowerCase()}.webp" width="14" height="14" style="object-fit:contain;vertical-align:middle;margin-right:3px">`
      : '';
    return `<span style="display:inline-flex;align-items:center;background:${filled?'#2a1f5a':'#1a1d27'};border:1px solid ${filled?'#7c6cf8':'#2e3250'};border-radius:5px;padding:.18rem .5rem;font-size:.75rem;color:${filled?'#c8c0f8':'#555'}">`
      + icon + 'Slot ' + (i+1) + (filled&&s.rune_set?' — '+s.rune_set:'') + '</span>';
  }).join('');
}

function openAddRuneModal() {
  const m = window._currentMonster;
  if (!m) return;
  _arSlots = [{},{},{},{},{},{}];
  _arCurrentSlot = -1;
  document.getElementById('addRuneTitle').textContent = `Add Rune Build — ${m.name}`;
  document.getElementById('addRuneMsg').textContent = '';
  document.getElementById('addRuneSubmitBtn').disabled = false;
  document.getElementById('addRuneSubmitBtn').textContent = 'Submit Build';
  document.getElementById('arSlotForm').style.display = 'none';
  if (window.turnstile) window.turnstile.reset();
  document.getElementById('addRuneOverlay').style.display = 'flex';
  _arBuildStar();
  _arUpdateSummary();
}
function closeAddRuneModal() {
  document.getElementById('addRuneOverlay').style.display = 'none';
  arCloseSlotForm();
}

async function submitAddRune() {
  const m   = window._currentMonster;
  if (!m) return;
  const token = document.querySelector('#addRuneCaptcha [name="cf-turnstile-response"]')?.value || '';
  const btn   = document.getElementById('addRuneSubmitBtn');
  const msg   = document.getElementById('addRuneMsg');
  if (!token) { msg.style.color = '#e08080'; msg.textContent = 'Please complete the CAPTCHA first.'; return; }

  const filledAny = _arSlots.some(s => s && (s.rune_set || s.main_stat));
  if (!filledAny) { msg.style.color = '#e08080'; msg.textContent = 'Fill at least one slot before submitting.'; return; }

  const setCounts = {};
  _arSlots.forEach(s => { if (s && s.rune_set) setCounts[s.rune_set] = (setCounts[s.rune_set] || 0) + 1; });
  const sorted = Object.entries(setCounts).sort((a,b) => b[1]-a[1]);
  let name = sorted.filter(e => e[1] >= 2).map(e => e[0]).join(' / ');
  if (!name) name = sorted.length ? 'Broken Set' : 'Unnamed Build';

  btn.disabled = true; btn.textContent = 'Submitting…';
  const res = await fetch('/api/submit-rune-build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monster_id: m.id, monster_name: m.name, name, slots: _arSlots, token }),
  });
  if (res.ok) {
    msg.style.color = '#80c880'; msg.textContent = 'Build submitted! Thank you 🙏';
    btn.textContent = 'Submitted!';
    setTimeout(closeAddRuneModal, 2200);
  } else {
    btn.disabled = false; btn.textContent = 'Submit Build';
    const err = await res.json().catch(() => ({}));
    msg.style.color = '#e08080'; msg.textContent = err.error || 'Failed — please try again.';
    if (window.turnstile) window.turnstile.reset();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeLightbox(); closeAskModal(); arCloseSlotForm(); closeAddRuneModal(); closeStatTooltip(); }
});
document.addEventListener("click", (e) => {
  if (_statTooltip && _statTooltip.style.display !== "none") {
    if (!e.target.closest("#rune-star-wrap")) closeStatTooltip();
  }
});
