/* Shared team composition card, used by the home page and /teams. */
const TEAM_MODE_LABEL = { rta: "RTA", defense: "Defense Arena", attack: "Attack Arena" };

function teamCardHTML(t) {
  const img = (f) => f ? `/images/monsters/${f}` : "/placeholder.png";
  const date = (t.created_at || "").slice(0, 10);
  return `
    <div class="team-card">
      <div class="team-card-head">
        <span class="team-mode-badge team-mode-${t.mode || "rta"}">${TEAM_MODE_LABEL[t.mode] || "RTA"}</span>
        <a class="team-card-anchor" href="/team-comp/${t.anchor_monster_id}#${t.mode || "rta"}">${t.anchor_name} team</a>
        <span class="team-card-date">${date}</span>
      </div>
      <div class="team-card-members">
        ${(t.members || []).map(mem => `
          <a class="tc-member" href="/monsters/${mem.id}" title="${mem.name}">
            <img src="${img(mem.image_filename)}" alt="${mem.name}" loading="lazy" onerror="this.src='/placeholder.png'">
            <div class="tc-member-name">${mem.name}</div>
          </a>`).join("")}
      </div>
    </div>`;
}
