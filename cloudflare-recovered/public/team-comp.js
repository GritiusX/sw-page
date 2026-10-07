const ELEMENT_CLASS = {
  Fire: "el-fire", Water: "el-water", Wind: "el-wind",
  Light: "el-light", Dark: "el-dark",
};
const IMG = (f) => f ? `/images/monsters/${f}` : "/placeholder.png";
const STARS = (n) => "★".repeat(n);
const TC_MODES = [
  { key: "rta",     label: "RTA" },
  { key: "defense", label: "Defense Arena" },
  { key: "attack",  label: "Attack Arena" },
];

function initSearchNav() {
  const params = new URLSearchParams(location.hash.slice(1));
  document.getElementById("search").value    = params.get("q")         || "";
  document.getElementById("element").value   = params.get("element")   || "";
  document.getElementById("archetype").value = params.get("archetype") || "";
  document.getElementById("stars").value     = params.get("stars")     || "";

  let debounceTimer;
  document.getElementById("search").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => goHome({ q: e.target.value }), 300);
  });
  ["element", "archetype", "stars"].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => goHome({ [id]: e.target.value }));
  });
}

function goHome(overrides = {}) {
  const params = new URLSearchParams(location.hash.slice(1));
  params.delete("monster"); params.delete("page");
  Object.entries(overrides).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
  const str = params.toString();
  location.href = "/" + (str ? "#" + str : "");
}

const monsterId = location.pathname.replace(/^\/team-comp\//, "").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", async () => {
  initSearchNav();
  if (!monsterId) { showError("No monster specified."); return; }

  const [mRes, tcRes] = await Promise.all([
    fetch(`/api/monsters/${monsterId}`, { cache: "no-store" }),
    fetch(`/api/team-comp/${monsterId}`),
  ]);

  if (!mRes.ok) { showError("Monster not found."); return; }

  const m  = await mRes.json();
  const tc = tcRes.ok ? await tcRes.json() : { results: [] };
  window._pageMonster = m;

  document.title = `${m.name} — Team Composition — SW Guide`;
  document.getElementById("tc-page").innerHTML = renderPage(m, tc.results || []);
  const initial = TC_MODES.some(x => x.key === location.hash.slice(1)) ? location.hash.slice(1) : "rta";
  setTcMode(initial);
});

// Called by team-add.js after a successful submit: re-render and show that mode's tab.
window.onTeamAdded = async (mode) => {
  const tc = await fetch(`/api/team-comp/${monsterId}`, { cache: "no-store" }).then(r => r.json()).catch(() => null);
  if (!tc) return;
  document.getElementById("tc-page").innerHTML = renderPage(window._pageMonster, tc.results || []);
  setTcMode(mode);
};

let currentTcMode = "rta";
function setTcMode(mode) {
  currentTcMode = mode;
  document.querySelectorAll("#tcModeTabs .tc-mode-tab").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  document.querySelectorAll(".tc-mode-panel").forEach(p => p.style.display = p.dataset.mode === mode ? "" : "none");
  history.replaceState(null, "", "#" + mode);
}

function showError(msg) {
  document.getElementById("tc-page").innerHTML =
    `<div class="empty"><div class="big">😵</div>${msg}</div>`;
}

function familyStripHTML(m) {
  const family = (m._family || []).filter(f =>
    m.awaken_level > 0 ? f.awaken_level > 0 : f.awaken_level === 0
  );
  if (family.length <= 1) return "";
  return `<div class="family-strip">
    ${family.map(f => `
      <a class="family-card${f.id === m.id ? " family-card-active" : ""}" href="/team-comp/${f.id}">
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

function renderPage(m, teams) {
  const elClass = ELEMENT_CLASS[m.element] || "";

  const heroHTML = `
    <div class="mp-hero" style="margin-bottom:1.4rem">
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
          <a href="/rune-examples/${m.id}" class="nav-pill nav-pill-rune">🪨 Rune Examples</a>
        </div>
      </div>
    </div>`;

  const panelHTML = (mode) => {
    const list = teams.filter(t => (t.mode || "rta") === mode.key);
    return `<div class="tc-mode-panel" data-mode="${mode.key}">${teamsListHTML(list, mode.label)}</div>`;
  };
  const tabsHTML = `<div style="display:flex;gap:.4rem;margin-bottom:1rem;flex-wrap:wrap;align-items:stretch">
    <div id="tcModeTabs" style="display:flex;gap:.4rem;flex:1;min-width:260px;max-width:560px">
      ${TC_MODES.map(x => `<button type="button" class="tc-mode-tab" data-mode="${x.key}" onclick="setTcMode('${x.key}')">${x.label}<span class="tc-mode-count">(${teams.filter(t => (t.mode || "rta") === x.key).length})</span></button>`).join("")}
    </div>
    <button type="button" onclick="mnOpenAddTc(currentTcMode)" style="background:linear-gradient(135deg,#1a3a2a,#2a5a3a);border:1px solid #3a8a5a;color:#80d8a0;border-radius:8px;padding:.5rem 1rem;font-size:.85rem;font-weight:600;cursor:pointer;white-space:nowrap">➕ Add Team</button>
  </div>`;

  return `
    <div class="section-title" style="margin-top:0">Team Composition — ${m.name}</div>
    ${familyStripHTML(m)}
    ${heroHTML}
    ${tabsHTML}
    ${TC_MODES.map(panelHTML).join("")}`;
}

function teamsListHTML(teams, label) {
  return teams.length
    ? `<div class="tc-teams-list">
        ${teams.map(t => `
          <div class="tc-team-row">
            ${(t.members || []).map(mem => `
              <a class="tc-member" href="/monsters/${mem.id}" title="${mem.name}">
                <img src="${IMG(mem.image_filename)}" alt="${mem.name}" loading="lazy" onerror="this.src='/placeholder.png'">
                <div class="tc-member-name">${mem.name}</div>
              </a>`).join("")}
          </div>`).join("")}
       </div>`
    : `<div class="empty" style="margin-top:2rem">
        <div class="big">👥</div>
        No ${label} teams added yet for this monster.
       </div>`;
}
