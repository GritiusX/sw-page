const PAGE_SIZE = 20;
const MODE_MAX = { "": 5, rta: 5, defense: 3, attack: 3 };
let teamsState = { monsters: [], mode: "", offset: 0 }; // monsters: [{ id, name, image_filename, element }]
let searchTimer = null;
let teamsReq = 0;

const escAttr = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function readTeamsHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  teamsState.mode = TEAM_MODE_LABEL[params.get("mode")] ? params.get("mode") : "";
  const ids = (params.get("monsters") || "").split(",").map(x => parseInt(x)).filter(x => x > 0).slice(0, MODE_MAX[teamsState.mode]);
  const found = await Promise.all(ids.map(id => fetch(`/api/monsters/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)));
  teamsState.monsters = found.filter(Boolean).map(m => ({ id: m.id, name: m.name, image_filename: m.image_filename || "", element: m.element || "" }));
}

function syncTeamsHash() {
  const params = new URLSearchParams();
  if (teamsState.monsters.length) params.set("monsters", teamsState.monsters.map(m => m.id).join(","));
  if (teamsState.mode) params.set("mode", teamsState.mode);
  const str = params.toString();
  history.replaceState(null, "", str ? "#" + str : location.pathname);
}

function renderChips() {
  const max = MODE_MAX[teamsState.mode];
  document.getElementById("teams-chips").innerHTML = teamsState.monsters.map((m, i) => `
    <span class="teams-chip">
      <img src="/images/monsters/${escAttr(m.image_filename)}" alt="" onerror="this.style.display='none'">
      ${m.name}
      <button type="button" title="Remove" onclick="removeTeamFilter(${i})">✕</button>
    </span>`).join("");
  const full = teamsState.monsters.length >= max;
  const input = document.getElementById("teams-search");
  input.disabled = full;
  input.placeholder = full ? `Max ${max} monsters for this mode` : "Add a monster to filter teams…";
  document.getElementById("teams-filter-count").textContent =
    `${teamsState.monsters.length} / ${max} monsters — shows teams that include all of them`;
}

function removeTeamFilter(i) {
  teamsState.monsters.splice(i, 1);
  renderChips(); loadTeams();
}

function addTeamFilter(m) {
  if (teamsState.monsters.length >= MODE_MAX[teamsState.mode] || teamsState.monsters.some(x => x.id === m.id)) return;
  teamsState.monsters.push(m);
  const input = document.getElementById("teams-search");
  input.value = "";
  document.getElementById("teams-search-results").style.display = "none";
  renderChips(); loadTeams();
  if (!input.disabled) input.focus();
}

function searchMonsters(q) {
  clearTimeout(searchTimer);
  const box = document.getElementById("teams-search-results");
  if (!q.trim()) { box.style.display = "none"; return; }
  searchTimer = setTimeout(async () => {
    const data = await fetch("/api/monsters?q=" + encodeURIComponent(q) + "&limit=8").then(r => r.json()).catch(() => ({ results: [] }));
    const results = (data.results || []).filter(r => !teamsState.monsters.some(m => m.id === r.id));
    window._teamSearchResults = results;
    box.innerHTML = results.map((r, i) => `
      <div class="teams-search-item" onclick="addTeamFilter(window._teamSearchResults[${i}])">
        <img src="/images/monsters/${escAttr(r.image_filename)}" alt="" onerror="this.style.display='none'">
        <span>${r.name}</span>
        <span style="color:var(--text-dim);font-size:.78rem;margin-left:auto">${r.element || ""}</span>
      </div>`).join("") || `<div style="padding:.8rem;color:var(--text-dim);font-size:.85rem">No results</div>`;
    box.style.display = "block";
  }, 250);
}

async function loadTeams(append = false) {
  if (!append) teamsState.offset = 0;
  syncTeamsHash();
  const req = ++teamsReq;
  const params = new URLSearchParams({
    monsters: teamsState.monsters.map(m => m.id).join(","), mode: teamsState.mode,
    limit: PAGE_SIZE, offset: teamsState.offset,
  });
  const data = await fetch(`/api/teams?${params}`).then(r => r.json()).catch(() => ({ total: 0, results: [] }));
  if (req !== teamsReq) return; // a newer filter change started meanwhile

  const list = document.getElementById("teams-list");
  const html = data.results.map(teamCardHTML).join("");
  list.innerHTML = append ? list.innerHTML + html : html;
  teamsState.offset += data.results.length;

  const label = teamsState.mode ? TEAM_MODE_LABEL[teamsState.mode] + " " : "";
  const names = teamsState.monsters.map(m => m.name).join(" + ");
  document.getElementById("teams-count").textContent = data.total
    ? `${data.total} ${label}composition${data.total === 1 ? "" : "s"}${names ? ` with ${names}` : ""}`
    : "";
  if (!data.total) {
    list.innerHTML = `<div class="empty"><div class="big">👥</div>${names ? `No ${label}compositions found with ${names}.` : `No ${label}compositions added yet.`}</div>`;
  }
  document.getElementById("teams-more").style.display = teamsState.offset < data.total ? "" : "none";
}

// Called by team-add.js after a successful submit: refresh the list.
window.onTeamAdded = () => loadTeams();

document.addEventListener("DOMContentLoaded", async () => {
  await readTeamsHash();

  const input = document.getElementById("teams-search");
  input.addEventListener("input", (e) => searchMonsters(e.target.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.getElementById("teams-search-results").style.display = "none";
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".teams-filter")) document.getElementById("teams-search-results").style.display = "none";
  });

  const tabs = document.querySelectorAll("#teams-modes .tc-mode-tab");
  const markTab = () => tabs.forEach(b => b.classList.toggle("active", b.dataset.mode === teamsState.mode));
  tabs.forEach(b => b.addEventListener("click", () => {
    teamsState.mode = b.dataset.mode;
    teamsState.monsters = teamsState.monsters.slice(0, MODE_MAX[teamsState.mode]);
    markTab(); renderChips(); loadTeams();
  }));
  markTab();
  renderChips();

  document.getElementById("teams-more").addEventListener("click", () => loadTeams(true));
  loadTeams();
});
