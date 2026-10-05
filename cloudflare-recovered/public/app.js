const IMG = (filename) =>
  filename ? `/images/monsters/${filename}` : "/placeholder.png";

const ELEMENT_CLASS = {
  Fire: "el-fire", Water: "el-water", Wind: "el-wind",
  Light: "el-light", Dark: "el-dark",
};
const STARS = (n) => "★".repeat(n);

// ── State ─────────────────────────────────────────────────────────────────────
let state = { q: "", element: "", archetype: "", stars: "", page: 1 };
let debounceTimer = null;

// ── URL hash persistence ───────────────────────────────────────────────────────
function syncHash() {
  const params = new URLSearchParams();
  if (state.q)         params.set("q",         state.q);
  if (state.element)   params.set("element",   state.element);
  if (state.archetype) params.set("archetype", state.archetype);
  if (state.stars)     params.set("stars",     state.stars);
  if (state.page > 1)  params.set("page",      String(state.page));
  const str = params.toString();
  history.replaceState(null, "", str ? "#" + str : location.pathname);
}

function readHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const params = new URLSearchParams(hash);
  state.q         = params.get("q")         || "";
  state.element   = params.get("element")   || "";
  state.archetype = params.get("archetype") || "";
  state.stars     = params.get("stars")     || "";
  state.page      = parseInt(params.get("page") || "1");
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  readHash();

  document.getElementById("search").value    = state.q;
  document.getElementById("element").value   = state.element;
  document.getElementById("archetype").value = state.archetype;
  document.getElementById("stars").value     = state.stars;

  document.getElementById("search").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.q = e.target.value;
      state.page = 1;
      load();
    }, 300);
  });

  ["element", "archetype", "stars"].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => {
      state[id] = e.target.value;
      state.page = 1;
      load();
    });
  });

  load();
});

// ── Load monsters ─────────────────────────────────────────────────────────────
async function load() {
  showSkeletons();
  const params = new URLSearchParams({
    q: state.q, element: state.element, archetype: state.archetype,
    stars: state.stars, page: state.page, limit: 48,
  });
  const res = await fetch(`/api/monsters?${params}`);
  const data = await res.json();
  render(data);
  syncHash();
}

function showSkeletons() {
  const grid = document.getElementById("grid");
  grid.innerHTML = Array(12).fill(0).map(() => `
    <div class="card card-skeleton">
      <div class="card-img-wrap skeleton"></div>
      <div class="card-body skeleton"></div>
    </div>`).join("");
}

function render(data) {
  document.getElementById("count").textContent =
    `${data.total.toLocaleString()} monsters`;

  const grid = document.getElementById("grid");

  if (!data.results.length) {
    grid.innerHTML = `<div class="empty"><div class="big">🔍</div>No monsters found</div>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  grid.innerHTML = data.results.map(cardHTML).join("");
  renderPagination(data);
}

function cardHTML(m) {
  const elClass = ELEMENT_CLASS[m.element] || "";
  return `
  <a class="card" href="/monsters/${m.id}">
    <div class="card-arch card-arch-${(m.archetype||"").toLowerCase()}">${{"Attack":"ATK","Defense":"DEF","HP":"HP","Support":"SUPP"}[m.archetype]||m.archetype}</div>
    <div class="card-img-wrap">
      <img src="${IMG(m.image_filename)}" alt="${m.name}"
           loading="lazy" onerror="this.src='/placeholder.png'">
    </div>
    <div class="card-body">
      <div class="card-name">${m.name}</div>
      <div class="card-meta">
        <span class="badge-element ${elClass}">${m.element || "?"}</span>
        <span class="stars">${STARS(m.natural_stars)}</span>
      </div>
    </div>
  </a>`;
}

function renderPagination(data) {
  const pag = document.getElementById("pagination");
  if (data.pages <= 1) { pag.innerHTML = ""; return; }

  const { page, pages } = data;
  const range = [];

  range.push(1);
  if (page > 3) range.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) range.push(i);
  if (page < pages - 2) range.push("…");
  if (pages > 1) range.push(pages);

  pag.innerHTML = [
    `<button ${page === 1 ? "disabled" : ""} onclick="goPage(${page - 1})">‹ Prev</button>`,
    ...range.map((r) =>
      r === "…"
        ? `<button disabled>…</button>`
        : `<button class="${r === page ? "active" : ""}" onclick="goPage(${r})">${r}</button>`
    ),
    `<button ${page === pages ? "disabled" : ""} onclick="goPage(${page + 1})">Next ›</button>`,
  ].join("");
}

function goPage(p) {
  state.page = p;
  load();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
