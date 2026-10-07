var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS,POST,DELETE",
  "Content-Type": "application/json"
};
var IMG_FALLBACK = "https://swarfarm.com/static/herders/images";
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    if (url.pathname.startsWith("/images/")) {
      const key = url.pathname.slice(1);
      const obj = await env.IMAGES.get(key);
      if (obj) {
        return new Response(obj.body, {
          headers: {
            "Content-Type": obj.httpMetadata?.contentType || "image/png",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }
      const sub = key.replace("images/", "");
      return Response.redirect(`${IMG_FALLBACK}/${sub}`, 302);
    }
    if (url.pathname === "/dashboard") {
      return handleDashboard(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return handleAPI(url, request, env);
    }
    if (/^\/monsters\/[^/]+\/?$/.test(url.pathname)) {
      const shellReq = new Request(new URL("/monster", request.url), request);
      return env.ASSETS.fetch(shellReq);
    }
    if (/^\/rune-examples\/[^/]+\/?$/.test(url.pathname)) {
      const shellReq = new Request(new URL("/rune-examples", request.url), request);
      return env.ASSETS.fetch(shellReq);
    }
    if (/^\/team-comp\/[^/]+\/?$/.test(url.pathname)) {
      const shellReq = new Request(new URL("/team-comp", request.url), request);
      return env.ASSETS.fetch(shellReq);
    }
    const dungeonMatch = url.pathname.match(/^\/dungeon\/(gb12|db12|nb12|sf12|pc12|sr12)\/?$/i);
    if (dungeonMatch) {
      return dungeonComingSoon(dungeonMatch[1].toUpperCase());
    }
    return env.ASSETS.fetch(request);
  }
};
function dungeonComingSoon(name) {
  const cfg = {
    GB12: { img: "/images/dungeons/gb12.png", accent: "#3a7adc", text: "#a0c8ff", label: "Giants B12" },
    DB12: { img: "/images/dungeons/db12.jpg", accent: "#9a2a2a", text: "#ffaaaa", label: "Dragon B12" },
    NB12: { img: "/images/dungeons/nb12.jpg", accent: "#6a3a9a", text: "#d0a0ff", label: "Necropolis B12" },
    SF12: { img: "/images/dungeons/sf12.jpg", accent: "#b89a10", text: "#ffe870", label: "Steel Fortress 12" },
    PC12: { img: "/images/dungeons/pc12.jpg", accent: "#cccccc", text: "#1a1a1a", label: "Punisher's Crypt 12" },
    SR12: { img: "/images/dungeons/sr12.jpg", accent: "#e07820", text: "#ffe0b0", label: "Steel Rift 12" }
  };
  const c = cfg[name] || { img: "", accent: "#5a4ee8", text: "#fff", label: name };
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.label} \u2014 SW Guide</title><link rel="stylesheet" href="/style.css">
<style>
  .dungeon-hero{position:relative;width:100%;height:320px;overflow:hidden;border-radius:16px;margin-bottom:2rem}
  .dungeon-hero img{width:100%;height:100%;object-fit:cover;display:block}
  .dungeon-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,12,22,.92) 0%,rgba(10,12,22,.3) 60%,transparent 100%);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:1.8rem 2rem}
  .dungeon-hero h1{font-size:2.2rem;font-weight:900;color:#fff;margin:0 0 .3rem;text-shadow:0 2px 12px rgba(0,0,0,.8)}
  .dungeon-badge{display:inline-block;padding:.25rem .75rem;border-radius:6px;font-size:.85rem;font-weight:800;letter-spacing:.06em;background:${c.accent};color:${c.text}}
</style>
</head>
<body>
<header>
  <div class="header-inner">
    <div class="header-left">
      <div class="logo">
        <a href="/" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:.5rem">
          <span class="logo-sw">SW</span>
          <span class="logo-text">Monster Guide</span>
        </a>
      </div>
      <p class="tagline">All 3 000+ monsters \u2014 stats, skills &amp; awakenings</p>
    </div>
    <div class="header-right">
      <div class="filters">
        <input id="dungeon-search" type="text" placeholder="Search monster name\u2026" autocomplete="off" onkeydown="if(event.key==='Enter'&&this.value.trim())location.href='/#q='+encodeURIComponent(this.value.trim())">
      </div>
    </div>
  </div>
  <div class="dungeon-btns">
    <a href="/dungeon/gb12" class="dungeon-btn dungeon-gb">Team Guides GB12</a>
    <a href="/dungeon/db12" class="dungeon-btn dungeon-db">Team Guides DB12</a>
    <a href="/dungeon/nb12" class="dungeon-btn dungeon-nb">Team Guides NB12</a>
    <a href="/dungeon/sf12" class="dungeon-btn dungeon-sf">Team Guides SF12</a>
    <a href="/dungeon/pc12" class="dungeon-btn dungeon-pc">Team Guides PC12</a>
    <a href="/dungeon/sr12" class="dungeon-btn dungeon-sr">Team Guides SR12</a>
  </div>
</header>
<main style="padding:2rem 1.5rem;max-width:900px;margin:0 auto">
  <div class="dungeon-hero">
    <img src="${c.img}" alt="${c.label}" onerror="this.style.display='none'">
    <div class="dungeon-hero-overlay">
      <span class="dungeon-badge">${name}</span>
      <h1>${c.label} Teams</h1>
    </div>
  </div>
  <div style="text-align:center;padding:3rem 1rem;color:#8b90b0;background:#1a1d27;border:1px solid #2e3250;border-radius:12px">
    <div style="font-size:3rem;margin-bottom:1rem">\u{1F3D7}\uFE0F</div>
    <p style="font-size:1rem;max-width:380px;margin:0 auto">Team compositions for ${c.label} are coming soon.</p>
  </div>
</main>
<footer>
  <a href="/dashboard" class="footer-dashboard-btn">\u{1F4CA} Dashboard</a>
</footer>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}
__name(dungeonComingSoon, "dungeonComingSoon");
function checkAdmin(request, env) {
  const url = new URL(request.url);
  const password = env.DASHBOARD_PASSWORD || "sw-admin";
  const token = request.headers.get("X-Admin-Token") || url.searchParams.get("t");
  return token === password;
}
__name(checkAdmin, "checkAdmin");
function loginPage(error = "") {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SW Dashboard \u2014 Login</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f1117;color:#e8eaf6;font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .box{background:#1a1d27;border:1px solid #2e3250;border-radius:14px;padding:2.5rem 2rem;width:100%;max-width:360px}
  h1{font-size:1.3rem;margin-bottom:.3rem}
  .sub{color:#8b90b0;font-size:.85rem;margin-bottom:1.8rem}
  label{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.07em;color:#8b90b0;margin-bottom:.4rem}
  input{width:100%;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.65rem .9rem;color:#e8eaf6;font-size:.95rem;outline:none}
  input:focus{border-color:#7c6cf8}
  .err{color:#e08080;font-size:.82rem;margin-top:.6rem}
  button{margin-top:1.4rem;width:100%;background:linear-gradient(135deg,#5a4ee8,#8b5cf6);border:none;border-radius:8px;padding:.75rem;color:#fff;font-size:1rem;font-weight:700;cursor:pointer}
  button:hover{opacity:.9}
</style>
</head>
<body>
  <div class="box">
    <h1>SW Dashboard</h1>
    <p class="sub">Enter your password to continue</p>
    <form method="POST" action="/dashboard">
      <label for="pw">Password</label>
      <input id="pw" name="password" type="password" autofocus autocomplete="current-password">
      ${error ? `<div class="err">${error}</div>` : ""}
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
  return new Response(html, { status: error ? 401 : 200, headers: { "Content-Type": "text/html;charset=utf-8" } });
}
__name(loginPage, "loginPage");
async function handleDashboard(request, env) {
  const password = env.DASHBOARD_PASSWORD || "sw-admin";
  if (request.method === "GET") {
    const url = new URL(request.url);
    if (url.searchParams.get("t") !== password) return loginPage();
  }
  if (request.method === "POST") {
    const form = await request.formData();
    if ((form.get("password") || "") !== password) return loginPage("Incorrect password.");
    const url = new URL(request.url);
    url.searchParams.set("t", password);
    return Response.redirect(url.toString(), 303);
  }
  const t = new URL(request.url).searchParams.get("t");
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anchor_monster_id INTEGER NOT NULL,
    anchor_name TEXT NOT NULL,
    members TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'rta',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rune_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monster_id INTEGER NOT NULL,
    monster_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rune_builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monster_id INTEGER NOT NULL,
    monster_name TEXT NOT NULL,
    slots TEXT NOT NULL,
    name TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const [totalRow, clicksRows, recentRows, runeExRows, tcRows, tcClicksRows, reqRows, runeBuildsRows] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) as total FROM events WHERE event_type = 'rune_examples'"),
    env.DB.prepare(`
      SELECT e.monster_id, e.monster_name, e.monster_element,
             COUNT(*) as clicks, MAX(e.created_at) as last_click,
             m.image_filename
      FROM events e
      LEFT JOIN monsters m ON m.id = e.monster_id
      WHERE e.event_type = 'rune_examples'
      GROUP BY e.monster_id, e.monster_name, e.monster_element
      ORDER BY clicks DESC LIMIT 50
    `),
    env.DB.prepare(`
      SELECT e.monster_id, e.monster_name, e.monster_element, e.created_at, m.image_filename
      FROM events e
      LEFT JOIN monsters m ON m.id = e.monster_id
      WHERE e.event_type = 'rune_examples'
      ORDER BY e.id DESC LIMIT 20
    `),
    env.DB.prepare(`
      SELECT re.id, re.monster_id, re.monster_name, re.image_key, re.created_at,
             m.image_filename as monster_img
      FROM rune_examples re
      LEFT JOIN monsters m ON m.id = re.monster_id
      ORDER BY re.created_at DESC
    `),
    env.DB.prepare(`
      SELECT t.id, t.anchor_monster_id, t.anchor_name, t.members, t.mode, t.created_at,
             m.image_filename as monster_img
      FROM teams t
      LEFT JOIN monsters m ON m.id = t.anchor_monster_id
      ORDER BY t.created_at DESC
    `),
    env.DB.prepare(`
      SELECT e.monster_id, e.monster_name, e.monster_element,
             COUNT(*) as clicks, MAX(e.created_at) as last_click,
             m.image_filename
      FROM events e
      LEFT JOIN monsters m ON m.id = e.monster_id
      WHERE e.event_type = 'team_comp'
      GROUP BY e.monster_id, e.monster_name, e.monster_element
      ORDER BY clicks DESC LIMIT 50
    `),
    env.DB.prepare(`
      SELECT rr.id, rr.monster_id, rr.monster_name, rr.created_at, m.image_filename
      FROM rune_requests rr
      LEFT JOIN monsters m ON m.id = rr.monster_id
      ORDER BY rr.created_at DESC LIMIT 100
    `),
    env.DB.prepare(`
      SELECT rb.id, rb.monster_id, rb.monster_name, rb.slots, rb.name, rb.created_at,
             m.image_filename as monster_img
      FROM rune_builds rb
      LEFT JOIN monsters m ON m.id = rb.monster_id
      ORDER BY rb.created_at DESC
    `)
  ]);
  const total = totalRow.results[0]?.total ?? 0;
  const clicks = clicksRows.results;
  const recent = recentRows.results;
  const runeExs = runeExRows.results;
  const tcClicks = tcClicksRows.results;
  const runeReqs = reqRows.results;
  const runeBuilds = runeBuildsRows.results.map((r) => {
    let slots = [];
    try {
      slots = JSON.parse(r.slots);
    } catch {
    }
    return { id: r.id, monster_id: r.monster_id, monster_name: r.monster_name, monster_img: r.monster_img, name: r.name, slots, created_at: r.created_at };
  });
  const runeByMonster = {};
  for (const r of runeExs) {
    if (!runeByMonster[r.monster_id]) {
      runeByMonster[r.monster_id] = { monster_id: r.monster_id, monster_name: r.monster_name, monster_img: r.monster_img, images: [] };
    }
    runeByMonster[r.monster_id].images.push({ id: r.id, key: r.image_key, date: r.created_at?.slice(0, 10) ?? "" });
  }
  const runeGroups = Object.values(runeByMonster);
  const tcByMonster = {};
  for (const r of tcRows.results) {
    if (!tcByMonster[r.anchor_monster_id]) {
      tcByMonster[r.anchor_monster_id] = { monster_id: r.anchor_monster_id, monster_name: r.anchor_name, monster_img: r.monster_img, teams: [] };
    }
    let members = [];
    try {
      members = JSON.parse(r.members);
    } catch {
    }
    tcByMonster[r.anchor_monster_id].teams.push({ id: r.id, members, mode: r.mode || "rta", date: r.created_at?.slice(0, 10) ?? "" });
  }
  const tcGroups = Object.values(tcByMonster);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SW Dashboard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f1117;color:#e8eaf6;font-family:'Segoe UI',system-ui,sans-serif;padding:2rem 1.5rem;max-width:1600px;margin:0 auto}
  h1{font-size:1.6rem;margin-bottom:.3rem}
  .sub{color:#8b90b0;font-size:.9rem;margin-bottom:1.5rem}
  .top-bar{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem;flex-wrap:wrap}
  .stat{background:#1a1d27;border:1px solid #2e3250;border-radius:10px;padding:.8rem 1.5rem}
  .stat-n{font-size:2rem;font-weight:800;color:#7c6cf8}
  .stat-l{font-size:.8rem;color:#8b90b0;margin-top:.1rem}
  .btn{border:none;border-radius:8px;padding:.6rem 1.1rem;font-size:.88rem;font-weight:700;cursor:pointer;transition:opacity .15s}
  .btn:hover{opacity:.85}
  .btn-purple{background:linear-gradient(135deg,#5a4ee8,#8b5cf6);color:#fff}
  .btn-green{background:linear-gradient(135deg,#2a5a3a,#3a8a5a);color:#fff}
  .tc-mode-tab{flex:1;background:#0f1117;border:1px solid #2e3250;color:#8b90b0;border-radius:8px;padding:.5rem .6rem;font-size:.82rem;font-weight:600;cursor:pointer}
  .tc-mode-tab.active{background:linear-gradient(135deg,#1a3a2a,#2a5a3a);border-color:#3a8a5a;color:#e8eaf6}
  .tc-mode-badge{display:inline-block;background:#1a3a2a;border:1px solid #3a8a5a;color:#80d8a0;border-radius:5px;padding:.1rem .45rem;font-size:.68rem;font-weight:700;margin-right:.4rem}
  .btn-danger{background:#3a1a1a;border:1px solid #7a2a2a;color:#e08080}
  .btn-sm{padding:.22rem .6rem;font-size:.78rem;border-radius:6px}
  h2{font-size:1rem;text-transform:uppercase;letter-spacing:.1em;color:#8b90b0;margin-bottom:.75rem;margin-top:2rem;border-bottom:1px solid #2e3250;padding-bottom:.4rem}
  table{width:100%;border-collapse:collapse;background:#1a1d27;border-radius:10px;overflow:hidden;margin-bottom:2rem}
  th{background:#22263a;padding:.6rem 1rem;text-align:left;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:#8b90b0}
  td{padding:.55rem 1rem;border-top:1px solid #2e3250;font-size:.88rem;vertical-align:middle}
  tr:hover td{background:#22263a}
  /* Overlay backdrop */
  .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;align-items:center;justify-content:center}
  .overlay.open{display:flex}
  /* Modal */
  .modal{background:#1a1d27;border:1px solid #2e3250;border-radius:14px;padding:1.8rem;width:100%;max-width:440px;position:relative}
  .modal h3{font-size:1.1rem;margin-bottom:.4rem}
  .modal p{color:#8b90b0;font-size:.88rem;margin-bottom:1.4rem}
  .modal-actions{display:flex;gap:.6rem;justify-content:flex-end;margin-top:1.2rem}
  .modal label{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;color:#8b90b0;margin:.9rem 0 .35rem}
  .modal label:first-of-type{margin-top:0}
  .modal input[type=text],.modal input[type=file]{width:100%;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.55rem .8rem;color:#e8eaf6;font-size:.9rem;outline:none}
  .modal input:focus{border-color:#7c6cf8}
  .search-results{background:#0f1117;border:1px solid #2e3250;border-radius:8px;margin-top:.3rem;max-height:180px;overflow-y:auto}
  .search-item{display:flex;align-items:center;gap:.6rem;padding:.5rem .8rem;cursor:pointer;border-bottom:1px solid #1a1d27}
  .search-item:hover{background:#1a1d27}
  .sel-monster{display:none;align-items:center;gap:.7rem;background:#0f1117;border:1px solid #7c6cf8;border-radius:8px;padding:.5rem .8rem;margin-top:.4rem}
  .msg{margin-top:.6rem;font-size:.82rem;padding:.4rem .7rem;border-radius:6px}
  .msg-ok{background:#1a2a1a;color:#80c880;border:1px solid #2a5a2a}
  .msg-err{background:#2a1a1a;color:#e08080;border:1px solid #5a2a2a}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start}
  .two-col table{margin-bottom:0}
  .pagin{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.5rem;margin-bottom:1.5rem}
  @media(max-width:820px){.two-col{grid-template-columns:1fr}}
</style>
</head>
<body>
  <div style="display:flex;align-items:center;gap:.9rem;margin-bottom:.2rem;flex-wrap:wrap">
    <a href="/" style="background:#22263a;border:1px solid #2e3250;color:#c8cadf;border-radius:8px;padding:.45rem .8rem;text-decoration:none;font-size:1.1rem;line-height:1;flex-shrink:0" title="Go home">\u{1F3E0}</a>
    <div>
      <h1>SW Dashboard</h1>
      <p class="sub" style="margin:0">Rune Examples \u2014 click tracking &amp; management</p>
    </div>
  </div>

  <div class="top-bar">
    <div class="stat">
      <div class="stat-n">${total}</div>
      <div class="stat-l">Total rune clicks</div>
    </div>
    <button class="btn btn-purple" onclick="openCreateRuneBuild()">\u2B06 Create Rune Build</button>
    <button class="btn btn-green" onclick="openCreateTeam()">\u{1F465} Create Team Comp</button>
    <button class="btn btn-danger" onclick="openConfirm('Delete ALL click events?','This will permanently remove all ${total} click records.','deleteAllClicks')">\u{1F5D1} Clear All Clicks</button>
  </div>

  <div class="two-col">
    <div>
      <h2 style="margin-top:0">Top monsters by rune clicks</h2>
      <table>
        <thead><tr><th>Monster</th><th>Element</th><th>Clicks</th><th>Last click</th><th></th></tr></thead>
        <tbody id="clicksBody"></tbody>
      </table>
      <div id="clicksPagin" class="pagin"></div>
    </div>
    <div>
      <h2 style="margin-top:0">Recent rune clicks</h2>
      <table>
        <thead><tr><th>Monster</th><th>Element</th><th>Time (UTC)</th></tr></thead>
        <tbody id="recentBody"></tbody>
      </table>
      <div id="recentPagin" class="pagin"></div>
    </div>
  </div>

  <div class="two-col">
    <div>
      <h2>Top monsters by Team Comp clicks</h2>
      <table>
        <thead><tr><th>Monster</th><th>Element</th><th>Clicks</th><th>Last click</th><th></th></tr></thead>
        <tbody id="tcClicksBody"></tbody>
      </table>
      <div id="tcClicksPagin" class="pagin"></div>
    </div>
    <div>
      <h2 style="display:flex;align-items:center;justify-content:space-between">
        <span>Rune Example Requests</span>
        <button class="btn btn-sm btn-danger" onclick="openConfirm('Delete all rune requests?','All pending rune requests will be removed.',()=>deleteAllReqs())">\u{1F5D1} Clear All</button>
      </h2>
      <table>
        <thead><tr><th>Monster</th><th>Requested at (UTC)</th><th colspan="2"></th></tr></thead>
        <tbody id="reqBody"></tbody>
      </table>
      <div id="reqPagin" class="pagin"></div>
    </div>
  </div>

  <div class="two-col" style="margin-top:2rem">
    <div>
      <h2 style="margin-top:0;display:flex;align-items:center;justify-content:space-between">
        <span>Rune Builds</span>
        <button class="btn btn-sm btn-danger" onclick="openConfirm('Delete ALL rune builds?','Every rune build for every monster will be permanently removed.',()=>deleteAllRBGlobal())">\u{1F5D1} Delete All</button>
      </h2>
      <table>
        <thead><tr><th>Monster</th><th>Build</th><th>Slots</th><th></th></tr></thead>
        <tbody id="rbBody"></tbody>
      </table>
      <div id="rbPagin" class="pagin"></div>
    </div>
    <div>
      <h2 style="margin-top:0;display:flex;align-items:center;justify-content:space-between">
        <span>Team Compositions</span>
        <button class="btn btn-sm btn-danger" onclick="openConfirm('Delete ALL team compositions?','Every saved team for every monster will be permanently removed.',()=>deleteAllTeamsGlobal())">\u{1F5D1} Delete All</button>
      </h2>
      <table>
        <thead><tr><th>Monster</th><th>Teams</th><th>Members preview</th><th></th></tr></thead>
        <tbody id="tcBody"></tbody>
      </table>
      <div id="tcPagin" class="pagin"></div>
    </div>
  </div>

  <!-- View rune build modal -->
  <div class="overlay" id="rbViewOverlay" onclick="if(event.target===this)closeRBView()">
    <div class="modal" style="max-width:500px;width:95vw;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem">
        <h3 id="rbViewTitle"></h3>
        <div style="display:flex;gap:.5rem;align-items:center">
          <button class="btn btn-purple btn-sm" id="rbEditBtn" onclick="openEditRB(_rbViewCurrent)">\u270F Edit</button>
          <button class="btn" style="background:#22263a;color:#e8eaf6;padding:.3rem .8rem" onclick="closeRBView()">\u2715</button>
        </div>
      </div>
      <div id="rbViewContent" style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem"></div>
    </div>
  </div>

  <!-- View rune images modal -->
  <div class="overlay" id="viewOverlay" onclick="if(event.target===this)closeView()">
    <div class="modal" style="max-width:700px;width:95vw;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem">
        <h3 id="viewTitle">Rune Images</h3>
        <button class="btn" style="background:#22263a;color:#e8eaf6;padding:.3rem .8rem" onclick="closeView()">\u2715</button>
      </div>
      <div id="viewGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem"></div>
      <div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid #2e3250;display:flex;align-items:center;gap:.7rem;flex-wrap:wrap">
        <input type="file" id="viewFile" accept="image/*" style="flex:1;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.45rem .7rem;color:#e8eaf6;font-size:.85rem;min-width:0">
        <button class="btn btn-purple" id="viewUploadBtn" onclick="uploadFromView()">\u2B06 Add Image</button>
        <span id="viewUploadMsg" style="font-size:.82rem"></span>
      </div>
    </div>
  </div>

  <!-- View teams modal -->
  <div class="overlay" id="tcViewOverlay" onclick="if(event.target===this)closeTCView()">
    <div class="modal" style="max-width:680px;width:95vw;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem">
        <h3 id="tcViewTitle">Teams</h3>
        <button class="btn" style="background:#22263a;color:#e8eaf6;padding:.3rem .8rem" onclick="closeTCView()">\u2715</button>
      </div>
      <div id="tcViewList"></div>
    </div>
  </div>

  <!-- Create Team modal -->
  <div class="overlay" id="createTeamOverlay" onclick="if(event.target===this)closeCreateTeam()">
    <div class="modal" style="max-width:520px">
      <h3 id="createTeamTitle">Create Team</h3>
      <div id="teamModeTabs" style="display:flex;gap:.35rem;margin-top:.9rem">
        <button type="button" class="tc-mode-tab" data-mode="rta" onclick="setTeamMode('rta')">RTA</button>
        <button type="button" class="tc-mode-tab" data-mode="defense" onclick="setTeamMode('defense')">Defense Arena</button>
        <button type="button" class="tc-mode-tab" data-mode="attack" onclick="setTeamMode('attack')">Attack Arena</button>
      </div>
      <div style="margin:.9rem 0 .3rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;color:#8b90b0">Team members</div>
      <div id="teamMembersBox" style="display:flex;flex-wrap:wrap;gap:.35rem;min-height:46px;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.5rem;align-items:center"></div>
      <div id="teamMemberCount" style="color:#8b90b0;font-size:.76rem;margin:.3rem 0 .7rem">0 / 5 members</div>
      <label>Add monster to team</label>
      <input type="text" id="teamSearch" placeholder="Search monster name\u2026" autocomplete="off" oninput="searchForTeam(this.value)">
      <div class="search-results" id="teamSearchResults" style="display:none"></div>
      <div id="createTeamMsg" style="margin-top:.6rem;font-size:.82rem"></div>
      <div class="modal-actions">
        <button class="btn" style="background:#22263a;color:#e8eaf6" onclick="closeCreateTeam()">Cancel</button>
        <button class="btn btn-green" id="saveTeamBtn" onclick="saveTeam()" disabled>Save Team</button>
      </div>
    </div>
  </div>

  <!-- Confirm modal -->
  <div class="overlay" id="confirmOverlay" onclick="e => e.target===this&&closeConfirm()">
    <div class="modal">
      <h3 id="confirmTitle"></h3>
      <p id="confirmMsg"></p>
      <div class="modal-actions">
        <button class="btn" style="background:#22263a;color:#e8eaf6" onclick="closeConfirm()">Cancel</button>
        <button class="btn btn-danger" id="confirmOkBtn">Delete</button>
      </div>
    </div>
  </div>

  <!-- Rune Build modal -->
  <div class="overlay" id="rbOverlay" onclick="if(event.target===this)closeRB()">
    <div class="modal" style="max-width:480px;width:95vw">
      <h3>Create Rune Build</h3>
      <label>Search monster</label>
      <input type="text" id="rbSearch" placeholder="Type a monster name\u2026" autocomplete="off" oninput="rbSearchMonster(this.value)">
      <div class="search-results" id="rbSearchResults" style="display:none"></div>
      <div class="sel-monster" id="rbSelMonster"></div>
      <input type="hidden" id="rbMonsterId">
      <input type="hidden" id="rbMonsterName">
      <label style="margin-top:.9rem">Build name (optional)</label>
      <input type="text" id="rbBuildName" placeholder="e.g. Speed/Violent DPS">
      <div style="margin:1.1rem 0 .4rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:#8b90b0">Click each slot to fill in stats</div>
      <div style="display:flex;justify-content:center">
        <div id="rbStarContainer" style="position:relative;width:260px;height:260px"></div>
      </div>
      <div id="rbSlotsSummary" style="display:flex;gap:.25rem;flex-wrap:wrap;margin-top:.7rem;min-height:28px"></div>
      <div id="rbMsg" style="margin-top:.5rem;font-size:.82rem"></div>
      <div class="modal-actions" style="margin-top:.8rem">
        <button class="btn" style="background:#22263a;color:#e8eaf6" onclick="closeRB()">Cancel</button>
        <button class="btn btn-purple" id="rbSaveBtn" onclick="saveRuneBuild()">Save Build</button>
      </div>
    </div>
  </div>

  <!-- Floating slot form (position:fixed, shared) -->
  <div id="rbSlotForm" style="display:none;position:fixed;background:#1a1d27;border:1px solid #7c6cf8;border-radius:10px;padding:1rem;width:290px;z-index:500;box-shadow:0 8px 32px rgba(0,0,0,.8)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem">
      <span id="rbFormTitle" style="font-weight:700;font-size:.95rem;color:#e8eaf6"></span>
      <button onclick="closeSlotForm()" style="background:none;border:none;color:#8b90b0;cursor:pointer;font-size:1.1rem;line-height:1;padding:0">\u2715</button>
    </div>
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem">
      <span style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#8b90b0">Rune Set</span>
      <img id="rbRuneSetIcon" src="" width="20" height="20" style="display:none;object-fit:contain">
    </div>
    <select id="rbRuneSet" onchange="rbUpdateSetIcon(this.value)" style="width:100%;background:#0f1117;border:1px solid #2e3250;border-radius:7px;padding:.45rem .6rem;color:#e8eaf6;font-size:.88rem;margin-bottom:.6rem">
      <option value="">\u2014 none \u2014</option>
      <option>Energy</option><option>Fatal</option><option>Blade</option>
      <option>Swift</option><option>Focus</option><option>Guard</option>
      <option>Endure</option><option>Shield</option><option>Revenge</option>
      <option>Will</option><option>Nemesis</option><option>Vampire</option>
      <option>Destroy</option><option>Despair</option><option>Violent</option>
      <option>Rage</option><option>Fight</option><option>Determination</option>
      <option>Enhance</option><option>Accuracy</option><option>Tolerance</option>
    </select>
    <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#8b90b0;margin-bottom:.25rem">Main Stat</div>
    <div id="rbMainSection" style="margin-bottom:.6rem"></div>
    <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#8b90b0;margin-bottom:.3rem">Substats <span style="color:#555;font-size:.7rem;text-transform:none">(optional)</span></div>
    <div id="rbSubSection" style="margin-bottom:.7rem"></div>
    <button onclick="saveSlot()" style="width:100%;background:linear-gradient(135deg,#5a4ee8,#8b5cf6);color:#fff;border:none;border-radius:7px;padding:.5rem;font-size:.88rem;font-weight:700;cursor:pointer">\u2713 Done</button>
  </div>

  <!-- Upload modal -->
  <div class="overlay" id="uploadOverlay" onclick="if(event.target===this)closeUpload()">
    <div class="modal" style="max-width:500px">
      <h3 id="uploadModalTitle">Upload</h3>
      <label>Search monster</label>
      <input type="text" id="monsterSearch" placeholder="Type a monster name\u2026" autocomplete="off" oninput="searchMonster(this.value)">
      <div class="search-results" id="searchResults" style="display:none"></div>
      <div class="sel-monster" id="selMonster"></div>
      <input type="hidden" id="selectedId">
      <input type="hidden" id="selectedName">
      <label>Image file (PNG / JPG / WEBP)</label>
      <input type="file" id="runeFile" accept="image/*">
      <div id="uploadMsg"></div>
      <div class="modal-actions">
        <button class="btn" style="background:#22263a;color:#e8eaf6" onclick="closeUpload()">Cancel</button>
        <button class="btn btn-purple" id="uploadBtn" onclick="uploadRune()" disabled>Upload</button>
      </div>
    </div>
  </div>

<script>
const T = "${t}";
const RUNE_BUILDS_DATA = ${JSON.stringify(runeBuilds)};
const RUNE_DATA      = ${JSON.stringify(runeGroups)};
const TC_DATA        = ${JSON.stringify(tcGroups)};
const CLICKS_DATA    = ${JSON.stringify(clicks)};
const RECENT_DATA    = ${JSON.stringify(recent)};
const TC_CLICKS_DATA = ${JSON.stringify(tcClicks)};
const REQ_DATA       = ${JSON.stringify(runeReqs)};
let searchTimer;
let pendingAction = null;
let uploadType = "rune";

/* \u2500\u2500 Client-side pagination \u2500\u2500 */
const PER_PAGE = 5;
const _pgs = { clicks:1, recent:1, tcc:1, reqs:1, rune:1, tc:1, rb:1 };

function initPages() {
  const p = new URLSearchParams(location.hash.slice(1));
  for (const k of Object.keys(_pgs)) {
    const n = parseInt(p.get('p_'+k));
    if (n > 0) _pgs[k] = n;
  }
}
function updateHash() {
  const p = new URLSearchParams();
  for (const [k, n] of Object.entries(_pgs)) { if (n > 1) p.set('p_'+k, n); }
  const s = p.toString();
  history.replaceState(null, '', s ? '#'+s : location.pathname + location.search);
}
function setPage(k, n) { _pgs[k] = n; updateHash(); renderAll(); }

const _ELC = { Fire:'#e84040', Water:'#4090e8', Wind:'#e8c840', Light:'#f0f0f0', Dark:'#9040c8' };
const _ELT = { Wind:'#1a1400', Light:'#1a1a1a' };
function _badge(el) {
  return '<span style="background:'+(_ELC[el]||'#555')+';color:'+(_ELT[el]||'#fff')+';padding:.1rem .45rem;border-radius:20px;font-size:.72rem;font-weight:700">'+el+'</span>';
}
function _avatar(fn) {
  return fn
    ? '<img src="/images/monsters/'+fn+'" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#111;flex-shrink:0" onerror="this.style.display=\\'none\\'">'
    : '<div style="width:36px;height:36px;border-radius:6px;background:#22263a;flex-shrink:0"></div>';
}
function _monCell(id, name, fn) {
  return '<div style="display:flex;align-items:center;gap:.6rem">'+_avatar(fn)+'<a href="/monsters/'+id+'" style="color:inherit;text-decoration:none" onmouseover="this.style.color=\\'#7c6cf8\\'" onmouseout="this.style.color=\\'inherit\\'">'+name+'</a></div>';
}
function _ae(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _renderTbody(tbId, paginId, data, key, rowFn, emptyMsg, cols) {
  const pg = _pgs[key], slice = data.slice((pg-1)*PER_PAGE, pg*PER_PAGE);
  const tb = document.getElementById(tbId);
  if (tb) tb.innerHTML = slice.length ? slice.map(rowFn).join('') : '<tr><td colspan="'+cols+'" style="color:#8b90b0;text-align:center;padding:2rem">'+emptyMsg+'</td></tr>';
  const total = Math.ceil(data.length/PER_PAGE);
  const pn = document.getElementById(paginId);
  if (!pn) return;
  pn.innerHTML = total > 1 ? Array.from({length:total},(_,i)=>i+1).map(n=>'<button onclick="setPage('+"'"+key+"'"+','+n+')" style="background:'+(n===pg?'#7c6cf8':'#22263a')+';color:'+(n===pg?'#fff':'#c8cadf')+';border:1px solid #2e3250;border-radius:6px;padding:.22rem .55rem;font-size:.78rem;cursor:pointer">'+n+'</button>').join(' ') : '';
}

function renderClicksTable() {
  _renderTbody('clicksBody','clicksPagin',CLICKS_DATA,'clicks', r => {
    const mid=r.monster_id, nm=r.monster_name, img=r.image_filename||'';
    return '<tr data-id="'+mid+'">'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td>'+_badge(r.monster_element)+'</td>'
      +'<td style="font-weight:700;color:#7c6cf8">'+r.clicks+'</td>'
      +'<td style="color:#8b90b0;font-size:.85rem">'+(r.last_click||'').slice(0,16).replace('T',' ')+'</td>'
      +'<td><div style="display:flex;gap:.4rem">'
      +'<button class="btn btn-sm btn-purple" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-img="'+_ae(img)+'" onclick="btnCreateRBFor(this)">\u2694 Rune Build</button>'
      +'<button data-id="'+mid+'" data-name="'+_ae(nm)+'" onclick="btnDeleteClicks(this)" style="background:#3a1a1a;border:1px solid #7a2a2a;color:#e08080;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.78rem">Delete</button>'
      +'</div></td>'
      +'</tr>';
  }, 'No data yet', 5);
}
function renderRecentTable() {
  _renderTbody('recentBody','recentPagin',RECENT_DATA,'recent', r => {
    return '<tr>'
      +'<td>'+_monCell(r.monster_id,r.monster_name,r.image_filename||'')+'</td>'
      +'<td>'+_badge(r.monster_element)+'</td>'
      +'<td style="color:#8b90b0;font-size:.85rem">'+(r.created_at||'').slice(0,16).replace('T',' ')+'</td>'
      +'</tr>';
  }, 'No data yet', 3);
}
function renderTCClicksTable() {
  _renderTbody('tcClicksBody','tcClicksPagin',TC_CLICKS_DATA,'tcc', r => {
    const mid=r.monster_id, nm=r.monster_name, img=r.image_filename||'';
    return '<tr>'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td>'+_badge(r.monster_element)+'</td>'
      +'<td style="font-weight:700;color:#3a8a5a">'+r.clicks+'</td>'
      +'<td style="color:#8b90b0;font-size:.85rem">'+(r.last_click||'').slice(0,16).replace('T',' ')+'</td>'
      +'<td><div style="display:flex;gap:.4rem">'
      +'<button class="btn btn-sm btn-green" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-img="'+_ae(img)+'" onclick="btnCreateTeam(this)">\u{1F465} + Team</button>'
      +'<button data-id="'+mid+'" data-name="'+_ae(nm)+'" onclick="btnDeleteTCClicks(this)" style="background:#3a1a1a;border:1px solid #7a2a2a;color:#e08080;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.78rem">Delete</button>'
      +'</div></td>'
      +'</tr>';
  }, 'No data yet', 5);
}
function renderReqsTable() {
  _renderTbody('reqBody','reqPagin',REQ_DATA,'reqs', r => {
    const mid=r.monster_id, nm=r.monster_name, img=r.image_filename||'';
    return '<tr>'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td style="color:#8b90b0;font-size:.85rem">'+(r.created_at||'').slice(0,16).replace('T',' ')+'</td>'
      +'<td><button class="btn btn-sm btn-purple" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-img="'+_ae(img)+'" onclick="btnCreateRBFor(this)">\u2694 Rune Build</button></td>'
      +'<td><button data-rid="'+r.id+'" onclick="btnDeleteReq(this)" style="background:#3a1a1a;border:1px solid #7a2a2a;color:#e08080;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.78rem">Delete</button></td>'
      +'</tr>';
  }, 'No requests yet', 4);
}
function renderRuneTable() {
  _renderTbody('runeBody','runePagin',RUNE_DATA,'rune', g => {
    const mid=g.monster_id, nm=g.monster_name, img=g.monster_img||'', cnt=g.images.length;
    return '<tr>'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td style="color:#7c6cf8;font-weight:700">'+cnt+'</td>'
      +'<td><img src="/images/rune-examples/'+(g.images[0]?.key||'')+'" style="width:80px;height:54px;object-fit:cover;border-radius:6px" onerror="this.style.opacity=\\'.3\\'"></td>'
      +'<td><div style="display:flex;gap:.4rem;flex-wrap:wrap">'
      +'<button class="btn btn-sm btn-purple" onclick="viewRunes('+mid+')">View</button>'
      +'<button class="btn btn-sm btn-green" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-img="'+_ae(img)+'" onclick="btnUploadFor(this)">\u2B06 Upload</button>'
      +'<button class="btn btn-sm btn-danger" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-cnt="'+cnt+'" onclick="btnDeleteAllRunes(this)">Delete all</button>'
      +'</div></td>'
      +'</tr>';
  }, 'No uploads yet', 4);
}
function renderRuneBuildsTable() {
  const RUNE_SETS = { Fatal:'F', Blade:'Bl', Swift:'Sw', Violent:'Vi', Rage:'Ra', Despair:'De',
    Will:'Wi', Revenge:'Re', Vampire:'Va', Nemesis:'Ne', Energy:'En', Guard:'Gu',
    Shield:'Sh', Endure:'Ed', Focus:'Fo', Destroy:'Ds', Fight:'Fg', Determination:'Dt',
    Enhance:'Eh', Accuracy:'Ac', Tolerance:'To' };
  _renderTbody('rbBody','rbPagin',RUNE_BUILDS_DATA,'rb', r => {
    const mid=r.monster_id, nm=r.monster_name, img=r.monster_img||'';
    const filledCnt = (r.slots||[]).filter(s=>s&&(s.rune_set||s.main_stat)).length;
    const slotBadges = (r.slots||[]).map((s,i)=>{
      const set = s?.rune_set || '';
      const filled = !!(s&&(s.rune_set||s.main_stat));
      const icon = (filled && set)
        ? '<img src="/images/runes/'+set.toLowerCase()+'.webp" width="14" height="14" style="object-fit:contain;vertical-align:middle;margin-right:2px">'
        : '';
      return '<span style="display:inline-flex;align-items:center;background:'+(filled?'#2a1f5a':'#1a1d27')+';border:1px solid '+(filled?'#7c6cf8':'#2e3250')+
        ';border-radius:4px;padding:.1rem .35rem;font-size:.7rem;color:'+(filled?'#c8c0f8':'#555')+
        '" title="Slot '+(i+1)+(set?' \u2014 '+set:'')+'">'+(i+1)+(filled?icon:'')+'</span>';
    }).join('');
    return '<tr>'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td style="color:#c8cadf;font-size:.85rem">'+(r.name||'<span style="color:#555">\u2014</span>')+'</td>'
      +'<td><div style="display:flex;gap:.3rem;flex-wrap:wrap">'+slotBadges+'</div></td>'
      +'<td><div style="display:flex;gap:.4rem;flex-wrap:wrap">'
      +'<button class="btn btn-sm btn-purple" data-rid="'+r.id+'" data-mid="'+mid+'" data-mname="'+_ae(nm)+'" data-mimg="'+_ae(img)+'" onclick="btnViewRB(this)">View</button>'
      +'<button class="btn btn-sm btn-danger" data-rid="'+r.id+'" data-rname="'+_ae(r.name||nm)+'" onclick="btnDeleteRB(this)">Delete</button>'
      +'</div></td>'
      +'</tr>';
  }, 'No rune builds yet', 4);
}
function renderTCTable() {
  _renderTbody('tcBody','tcPagin',TC_DATA,'tc', g => {
    const mid=g.monster_id, nm=g.monster_name, img=g.monster_img||'', cnt=g.teams.length;
    const thumbs = (g.teams[0]?.members||[]).slice(0,5).map(m=>'<img src="/images/monsters/'+(m.image_filename||'')+'" style="width:28px;height:28px;object-fit:contain;border-radius:4px;background:#111" onerror="this.style.display=\\'none\\'" title="'+_ae(m.name)+'">').join('');
    return '<tr>'
      +'<td>'+_monCell(mid,nm,img)+'</td>'
      +'<td style="color:#3a8a5a;font-weight:700">'+cnt+'</td>'
      +'<td><div style="display:flex;gap:.25rem;flex-wrap:wrap">'+thumbs+'</div></td>'
      +'<td><div style="display:flex;gap:.4rem;flex-wrap:wrap">'
      +'<button class="btn btn-sm btn-purple" onclick="viewTeams('+mid+')">View</button>'
      +'<button class="btn btn-sm btn-green" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-img="'+_ae(img)+'" onclick="btnCreateTeam(this)">+ Team</button>'
      +'<button class="btn btn-sm btn-danger" data-id="'+mid+'" data-name="'+_ae(nm)+'" data-cnt="'+cnt+'" onclick="btnDeleteAllTeams(this)">Delete all</button>'
      +'</div></td>'
      +'</tr>';
  }, 'No teams yet', 4);
}
function renderAll() {
  renderClicksTable(); renderRecentTable(); renderTCClicksTable();
  renderReqsTable(); renderRuneTable(); renderTCTable(); renderRuneBuildsTable();
}

/* \u2500\u2500 Data-attribute button handlers \u2500\u2500 */
function btnUploadFor(btn) { openUploadFor(+btn.dataset.id, btn.dataset.name, btn.dataset.img); }
function btnCreateRBFor(btn) { openCreateRuneBuildFor(+btn.dataset.id, btn.dataset.name, btn.dataset.img); }
function btnCreateTeam(btn) { openCreateTeam(+btn.dataset.id, btn.dataset.name, btn.dataset.img); }
function btnDeleteAllRunes(btn) {
  var id=+btn.dataset.id, nm=btn.dataset.name, cnt=+btn.dataset.cnt;
  openConfirm('Delete all images for '+nm+'?','All '+cnt+' rune image(s) for this monster will be permanently removed.',()=>deleteAllRunes(id));
}
function btnDeleteAllTeams(btn) {
  var id=+btn.dataset.id, nm=btn.dataset.name, cnt=+btn.dataset.cnt;
  openConfirm('Delete all teams for '+nm+'?','All '+cnt+' team(s) will be removed.',()=>deleteAllTeams(id));
}
function btnDeleteClicks(btn) {
  var id=+btn.dataset.id, nm=btn.dataset.name;
  openConfirm('Delete clicks for '+nm+'?','All click events for this monster will be removed.',()=>{
    fetch('/api/admin/events/'+id+'?t='+encodeURIComponent(T),{method:'DELETE'}).then(r=>{
      if(r.ok){const i=CLICKS_DATA.findIndex(x=>x.monster_id===id);if(i!==-1)CLICKS_DATA.splice(i,1);renderClicksTable();}
    });
  });
}
function btnDeleteTCClicks(btn) {
  var id=+btn.dataset.id, nm=btn.dataset.name;
  openConfirm('Delete TC clicks for '+nm+'?','All team comp click events for this monster will be removed.',()=>{
    fetch('/api/admin/events/tc/'+id+'?t='+encodeURIComponent(T),{method:'DELETE'}).then(r=>{
      if(r.ok){const i=TC_CLICKS_DATA.findIndex(x=>x.monster_id===id);if(i!==-1)TC_CLICKS_DATA.splice(i,1);renderTCClicksTable();}
    });
  });
}
function btnDeleteReq(btn) {
  var id=+btn.dataset.rid;
  btn.disabled=true;
  fetch('/api/admin/rune-requests/'+id+'?t='+encodeURIComponent(T),{method:'DELETE'}).then(r=>{
    if(r.ok){const i=REQ_DATA.findIndex(x=>x.id===id);if(i!==-1)REQ_DATA.splice(i,1);renderReqsTable();}
    else btn.disabled=false;
  });
}
function btnViewRB(btn) {
  var rid=+btn.dataset.rid;
  var mname=btn.dataset.mname;
  var r=RUNE_BUILDS_DATA.find(x=>x.id===rid);
  if(!r)return;
  openViewRB(r);
}
function btnDeleteRB(btn) {
  var rid=+btn.dataset.rid, rname=btn.dataset.rname;
  openConfirm('Delete build "'+rname+'"?','This rune build will be permanently removed.',()=>{
    fetch('/api/admin/rune-builds/'+rid+'?t='+encodeURIComponent(T),{method:'DELETE'}).then(res=>{
      if(res.ok){const i=RUNE_BUILDS_DATA.findIndex(x=>x.id===rid);if(i!==-1)RUNE_BUILDS_DATA.splice(i,1);renderRuneBuildsTable();}
    });
  });
}
function deleteAllRBGlobal() {
  fetch('/api/admin/rune-builds/all?t='+encodeURIComponent(T),{method:'DELETE'}).then(r=>{
    if(r.ok){RUNE_BUILDS_DATA.splice(0);renderRuneBuildsTable();}
  });
}

/* \u2500\u2500 Create Rune Build modal \u2500\u2500 */
const _RB_ANGLES = [0, 60, 120, 180, 240, 300];
const _RB_CX = 200, _RB_CY = 200;
const _RB_R1 = 52, _RB_R2 = 110, _RB_R3 = 158;

let rbSlots = [{},{},{},{},{},{}];
let rbSvgEl = null;
let rbCurrentSlot = -1;

/* Slot 1\u2192idx 0 = ATK, Slot 3\u2192idx 2 = DEF, Slot 5\u2192idx 4 = HP (fixed main stats) */
const _RB_FIXED_MAIN = {0:'ATK', 2:'DEF', 4:'HP'};
const _RB_MAIN_OPTS = {
  1: ['SPD','ATK%','DEF%','HP%','ATK','DEF','HP'],
  3: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%'],
  5: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%']
};
const _RB_SUB_TYPES = ['SPD','ATK','ATK%','DEF','DEF%','HP','HP%','CR%','CD%','RES%','ACC%'];

const _RB_MAIN_DEFAULTS = {
  'ATK':'160','DEF':'160','HP':'2484',
  'ATK%':'63','DEF%':'63','HP%':'63',
  'SPD':'42','RES%':'63','ACC%':'63',
  'CR%':'58','CD%':'80'
};
function _rbAutoFillMainVal(sel) {
  var d = _RB_MAIN_DEFAULTS[sel.value];
  if (d) { var el = document.getElementById('rbMainVal'); if (el) el.value = d; }
}

function _parseStatStr(s) {
  if (!s) return {type:'', val:''};
  var m = s.match(/^(.+?)\\+(.*)$/);
  return m ? {type:m[1], val:m[2]} : {type:s, val:''};
}
function _buildStatStr(type, val) {
  if (!type) return '';
  return val ? type+'+'+val : type;
}

var _SF = 'width:100%;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
var _SFW = 'flex:1;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
var _IFW = 'width:68px;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';

function _rbSubTypeOpts(selected, exclude) {
  return _RB_SUB_TYPES.filter(function(t){ return t !== exclude; }).map(function(t){
    return '<option value="'+t+'"'+(t===selected?' selected':'')+'>'+t+'</option>';
  }).join('');
}
function _rbMainTypeOpts(slotIdx, selected) {
  var opts = _RB_MAIN_OPTS[slotIdx] || [];
  return opts.map(function(t){
    return '<option value="'+t+'"'+(t===selected?' selected':'')+'>'+t+'</option>';
  }).join('');
}

function _rbRenderMainSection(slotIdx, slot) {
  var box = document.getElementById('rbMainSection');
  if (!box) return;
  var fixed = _RB_FIXED_MAIN[slotIdx];
  var parsed = _parseStatStr((slot && slot.main_stat) || '');
  if (fixed) {
    var fixedVal = parsed.val || (_RB_MAIN_DEFAULTS[fixed] || '');
    box.innerHTML = '<div style="display:flex;gap:.4rem;align-items:center">'
      +'<span style="background:#2e3250;color:#7c6cf8;border-radius:5px;padding:.3rem .6rem;font-size:.82rem;font-weight:700;flex-shrink:0">'+fixed+'</span>'
      +'<input id="rbMainVal" type="text" placeholder="value" value="'+_ae(fixedVal)+'" style="'+_SF+'">'
      +'</div>';
  } else {
    var varVal = parsed.val || (parsed.type ? (_RB_MAIN_DEFAULTS[parsed.type] || '') : '');
    box.innerHTML = '<div style="display:flex;gap:.4rem;align-items:center">'
      +'<select id="rbMainType" onchange="_rbOnMainTypeChange(this)" style="'+_SFW+'"><option value="">\u2014 type \u2014</option>'+_rbMainTypeOpts(slotIdx, parsed.type)+'</select>'
      +'<input id="rbMainVal" type="text" placeholder="val" value="'+_ae(varVal)+'" style="'+_IFW+'">'
      +'</div>';
  }
}

function _rbRenderSubSection(slot, mainType) {
  var box = document.getElementById('rbSubSection');
  if (!box) return;
  var subs = ((slot && slot.substats) || []).filter(function(x){ return _parseStatStr(x).type !== mainType; });
  var rows = '';
  for (var k = 0; k < 4; k++) {
    var parsed = _parseStatStr(subs[k] || '');
    rows += '<div style="display:flex;gap:.4rem;margin-bottom:.28rem">'
      +'<select id="rbSub'+k+'Type" style="'+_SFW+'"><option value="">\u2014 none \u2014</option>'+_rbSubTypeOpts(parsed.type, mainType)+'</select>'
      +'<input id="rbSub'+k+'Val" type="text" placeholder="val" value="'+_ae(parsed.val)+'" style="'+_IFW+'">'
      +'</div>';
  }
  box.innerHTML = rows;
}
/* Main stat can't repeat as a substat: re-render subs without it, keeping what was typed */
function _rbOnMainTypeChange(sel) {
  _rbAutoFillMainVal(sel);
  var subs = [];
  for (var k = 0; k < 4; k++) {
    var tEl = document.getElementById('rbSub'+k+'Type');
    var vEl = document.getElementById('rbSub'+k+'Val');
    if (tEl && tEl.value) subs.push(_buildStatStr(tEl.value, vEl ? vEl.value.trim() : ''));
  }
  _rbRenderSubSection({ substats: subs }, sel.value);
}
let rbSearchTimer2;
let rbEditId = null;

function _rbToRad(d) { return d * Math.PI / 180; }
function _rbPt(r, deg) {
  return [_RB_CX + r * Math.sin(_rbToRad(deg)), _RB_CY - r * Math.cos(_rbToRad(deg))];
}
function _rbSegPts(a) {
  return [_rbPt(_RB_R1,a-30),_rbPt(_RB_R2,a-21),_rbPt(_RB_R3,a),_rbPt(_RB_R2,a+21),_rbPt(_RB_R1,a+30)];
}
function _rbSharpPath(pts) {
  return 'M '+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ')+' Z';
}
function _rbLabelPt(a) { return _rbPt(_RB_R1+(_RB_R3-_RB_R1)*0.54, a); }

const _rbSegEls = [];

function _rbBuildStar() {
  const con = document.getElementById('rbStarContainer');
  if (!con) return;
  con.innerHTML = '';
  _rbSegEls.length = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('width', '260');
  svg.setAttribute('height', '260');
  svg.setAttribute('id', 'rbSvgEl');
  svg.innerHTML = '<defs>'
    + '<radialGradient id="rb-bg" cx="50%" cy="50%" r="50%"><stop offset="40%" stop-color="#1c1208"/><stop offset="100%" stop-color="#3a2510"/></radialGradient>'
    + '<radialGradient id="rb-empty" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#221508"/><stop offset="100%" stop-color="#110a02"/></radialGradient>'
    + '<radialGradient id="rb-full" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#3e2a0c"/><stop offset="100%" stop-color="#1c1005"/></radialGradient>'
    + '<radialGradient id="rb-active" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#7a4e1a"/><stop offset="100%" stop-color="#3d2208"/></radialGradient>'
    + '<radialGradient id="rb-center" cx="38%" cy="32%" r="60%"><stop offset="0%" stop-color="#2a1808"/><stop offset="100%" stop-color="#0e0804"/></radialGradient>'
    + '</defs>'
    + '<circle cx="200" cy="200" r="178" fill="url(#rb-bg)" stroke="#5e3a0e" stroke-width="4"/>'
    + '<circle cx="200" cy="200" r="171" fill="none" stroke="#2a1808" stroke-width="1.5"/>';
  const g = document.createElementNS(NS, 'g');
  svg.appendChild(g);
  const centerG = document.createElementNS(NS, 'g');
  centerG.innerHTML = '<circle cx="200" cy="200" r="44" fill="url(#rb-center)" stroke="#b87820" stroke-width="2.8"/>'
    + '<circle cx="200" cy="200" r="36" fill="none" stroke="#7a4e14" stroke-width="1.2"/>'
    + '<text x="200" y="210" text-anchor="middle" font-size="24" fill="#8a6030" font-family="Georgia,serif">\u2694</text>';
  _RB_ANGLES.forEach(function(alpha, i) {
    var hasFill = !!(rbSlots[i] && (rbSlots[i].rune_set || rbSlots[i].main_stat));
    var pts = _rbSegPts(alpha);
    var d   = _rbSharpPath(pts);
    var lp  = _rbLabelPt(alpha);
    var grp = document.createElementNS(NS, 'g');
    grp.style.cursor = 'pointer';
    var shadow = document.createElementNS(NS, 'path');
    shadow.setAttribute('d', d); shadow.setAttribute('fill', 'none');
    shadow.setAttribute('stroke', '#050200'); shadow.setAttribute('stroke-width', '8');
    shadow.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(shadow);
    var fill = document.createElementNS(NS, 'path');
    fill.setAttribute('d', d);
    fill.setAttribute('fill', hasFill ? 'url(#rb-full)' : 'url(#rb-empty)');
    fill.setAttribute('stroke', hasFill ? '#c8881a' : '#3d2208');
    fill.setAttribute('stroke-width', '2.2');
    fill.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(fill);
    var bevel = document.createElementNS(NS, 'path');
    bevel.setAttribute('d', d); bevel.setAttribute('fill', 'none');
    bevel.setAttribute('stroke', hasFill ? 'rgba(255,200,80,.11)' : 'rgba(100,60,10,.06)');
    bevel.setAttribute('stroke-width', '4'); bevel.setAttribute('stroke-linejoin', 'miter');
    grp.appendChild(bevel);
    var runeSet = rbSlots[i] && rbSlots[i].rune_set;
    if (hasFill && runeSet) {
      var iconSize = 36;
      var imgEl = document.createElementNS(NS, 'image');
      imgEl.setAttribute('href', '/images/runes/' + runeSet.toLowerCase() + '.webp');
      imgEl.setAttribute('x', (lp[0] - iconSize/2).toFixed(1));
      imgEl.setAttribute('y', (lp[1] - iconSize/2).toFixed(1));
      imgEl.setAttribute('width', iconSize); imgEl.setAttribute('height', iconSize);
      imgEl.setAttribute('pointer-events', 'none');
      grp.appendChild(imgEl);
      var numEl = document.createElementNS(NS, 'text');
      numEl.setAttribute('x', (lp[0] + iconSize * 0.38).toFixed(1));
      numEl.setAttribute('y', (lp[1] + iconSize * 0.55).toFixed(1));
      numEl.setAttribute('text-anchor', 'middle'); numEl.setAttribute('font-size', '13');
      numEl.setAttribute('font-weight', 'bold'); numEl.setAttribute('fill', '#ffe033');
      numEl.setAttribute('stroke', '#1a0e00'); numEl.setAttribute('stroke-width', '2');
      numEl.setAttribute('paint-order', 'stroke'); numEl.setAttribute('pointer-events', 'none');
      numEl.setAttribute('font-family', 'Georgia,serif');
      numEl.textContent = i + 1;
      grp.appendChild(numEl);
    } else {
      var txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', lp[0].toFixed(1)); txt.setAttribute('y', (lp[1]+8).toFixed(1));
      txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('font-size', '22');
      txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('fill', hasFill ? '#ffe033' : '#7a4e10');
      txt.setAttribute('stroke', hasFill ? '#3a2000' : 'none');
      txt.setAttribute('stroke-width', '2.5'); txt.setAttribute('paint-order', 'stroke');
      txt.setAttribute('pointer-events', 'none'); txt.setAttribute('font-family', 'Georgia,serif');
      txt.textContent = i + 1;
      grp.appendChild(txt);
    }
    grp.addEventListener('mouseenter', function() { if(rbCurrentSlot!==i) fill.setAttribute('fill','#4a2e0e'); });
    grp.addEventListener('mouseleave', function() { if(rbCurrentSlot!==i) fill.setAttribute('fill', hasFill?'url(#rb-full)':'url(#rb-empty)'); });
    grp.addEventListener('click', function() { _rbOpenSlotForm(i, svg); });
    _rbSegEls.push({ grp, fill, hasFill });
    g.appendChild(grp);
  });
  svg.appendChild(centerG);
  rbSvgEl = svg;
  con.appendChild(svg);
}

function rbUpdateSetIcon(val) {
  var el = document.getElementById('rbRuneSetIcon');
  if (!el) return;
  if (val) { el.src = '/images/runes/' + val.toLowerCase() + '.webp'; el.style.display = 'inline'; }
  else { el.style.display = 'none'; }
}

function _rbOpenSlotForm(segIdx, svgEl) {
  rbCurrentSlot = segIdx;
  var alpha = _RB_ANGLES[segIdx];
  var rect = svgEl.getBoundingClientRect();
  var scaleX = rect.width / 400, scaleY = rect.height / 400;
  var tipX = rect.left + (200 + _RB_R3 * Math.sin(_rbToRad(alpha))) * scaleX;
  var tipY = rect.top  + (200 - _RB_R3 * Math.cos(_rbToRad(alpha))) * scaleY;
  var dx = Math.sin(_rbToRad(alpha)), dy = -Math.cos(_rbToRad(alpha));
  var formW = 300, formH = 360;
  var x = tipX + dx * 18 - formW / 2;
  var y = tipY + dy * 18 - formH / 2;
  x = Math.max(8, Math.min(window.innerWidth  - formW - 8, x));
  y = Math.max(8, Math.min(window.innerHeight - formH - 8, y));
  var form = document.getElementById('rbSlotForm');
  form.style.left = x + 'px'; form.style.top = y + 'px';
  document.getElementById('rbFormTitle').textContent = 'Slot ' + (segIdx + 1);
  var slot = rbSlots[segIdx] || {};
  document.getElementById('rbRuneSet').value = slot.rune_set || '';
  rbUpdateSetIcon(slot.rune_set || '');
  _rbRenderMainSection(segIdx, slot);
  _rbRenderSubSection(slot, _RB_FIXED_MAIN[segIdx] || _parseStatStr(slot.main_stat || '').type);
  form.style.display = 'block';
  _rbHighlightSeg(segIdx);
}

function _rbHighlightSeg(activeIdx) {
  _rbSegEls.forEach(function(el, j) {
    var isFilled = !!(rbSlots[j] && (rbSlots[j].rune_set || rbSlots[j].main_stat));
    el.fill.setAttribute('fill', j === activeIdx ? 'url(#rb-active)' : (isFilled ? 'url(#rb-full)' : 'url(#rb-empty)'));
  });
}

function saveSlot() {
  var i = rbCurrentSlot;
  if (i < 0) return;
  var set = document.getElementById('rbRuneSet').value;
  var fixedMain = _RB_FIXED_MAIN[i];
  var mainType = fixedMain || (document.getElementById('rbMainType') ? document.getElementById('rbMainType').value : '');
  var mainValEl = document.getElementById('rbMainVal');
  var mainVal = mainValEl ? mainValEl.value.trim() : '';
  var main = _buildStatStr(mainType, mainVal);
  var subs = [];
  for (var k = 0; k < 4; k++) {
    var tEl = document.getElementById('rbSub'+k+'Type');
    var vEl = document.getElementById('rbSub'+k+'Val');
    var st = tEl ? tEl.value : '';
    var sv = vEl ? vEl.value.trim() : '';
    if (st) subs.push(_buildStatStr(st, sv));
  }
  rbSlots[i] = { rune_set: set, main_stat: main, substats: subs };
  closeSlotForm();
  _rbBuildStar();
  _rbUpdateSummary();
}

function closeSlotForm() {
  document.getElementById('rbSlotForm').style.display = 'none';
  rbCurrentSlot = -1;
  if (_rbSegEls.length) {
    _rbSegEls.forEach(function(el, j) {
      var isFilled = !!(rbSlots[j] && (rbSlots[j].rune_set || rbSlots[j].main_stat));
      el.fill.setAttribute('fill', isFilled ? 'url(#rb-full)' : 'url(#rb-empty)');
    });
  }
}

function _rbUpdateSummary() {
  var box = document.getElementById('rbSlotsSummary');
  if (!box) return;
  box.innerHTML = rbSlots.map(function(s, i) {
    var filled = !!(s && (s.rune_set || s.main_stat));
    var icon = (filled && s.rune_set)
      ? '<img src="/images/runes/'+s.rune_set.toLowerCase()+'.webp" width="14" height="14" style="object-fit:contain;vertical-align:middle;margin-right:3px">'
      : '';
    return '<span style="display:inline-flex;align-items:center;background:'+(filled?'#2a1f5a':'#1a1d27')+';border:1px solid '+(filled?'#7c6cf8':'#2e3250')
      +';border-radius:5px;padding:.18rem .5rem;font-size:.75rem;color:'+(filled?'#c8c0f8':'#555')+'">'
      +icon+'Slot '+(i+1)+(filled&&s.rune_set?' \u2014 '+s.rune_set:'')
      +'</span>';
  }).join('');
}

function _rbOpenModal(monsterId, monsterName, monsterImg, buildName, slots, editId) {
  rbEditId = editId || null;
  rbSlots = slots || [{},{},{},{},{},{}];
  rbCurrentSlot = -1;
  document.getElementById('rbMonsterId').value   = monsterId   || '';
  document.getElementById('rbMonsterName').value = monsterName || '';
  document.getElementById('rbSearch').value      = monsterName || '';
  document.getElementById('rbSearchResults').style.display = 'none';
  var sel = document.getElementById('rbSelMonster');
  if (monsterId && monsterName) {
    sel.style.display = 'flex';
    sel.innerHTML = '<img src="/images/monsters/'+(monsterImg||'')+'" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#111" onerror="this.style.display=\\'none\\'"><strong>'+monsterName+'</strong>';
  } else {
    sel.style.display = 'none';
  }
  document.getElementById('rbBuildName').value = buildName || '';
  document.getElementById('rbMsg').textContent = '';
  document.getElementById('rbSaveBtn').textContent = editId ? 'Save Changes' : 'Save Build';
  document.getElementById('rbOverlay').classList.add('open');
  _rbBuildStar();
  _rbUpdateSummary();
  if (!monsterId) setTimeout(function(){ document.getElementById('rbSearch').focus(); }, 50);
}
function openCreateRuneBuild() {
  _rbOpenModal('', '', '', '', [{},{},{},{},{},{}], null);
}
function openCreateRuneBuildFor(id, name, img) {
  _rbOpenModal(id, name, img, '', [{},{},{},{},{},{}], null);
}
function openEditRB(r) {
  closeRBView();
  var slots = (r.slots || []).map(function(s){ return s || {}; });
  while (slots.length < 6) slots.push({});
  _rbOpenModal(r.monster_id, r.monster_name, r.monster_img || '', r.name || '', slots, r.id);
}
function closeRB() {
  document.getElementById('rbOverlay').classList.remove('open');
  closeSlotForm();
}

function rbSearchMonster(q) {
  clearTimeout(rbSearchTimer2);
  var res = document.getElementById('rbSearchResults');
  if (!q.trim()) { res.style.display = 'none'; return; }
  rbSearchTimer2 = setTimeout(function() {
    fetch('/api/monsters?q='+encodeURIComponent(q)+'&limit=8').then(function(r){return r.json();}).then(function(data){
      res.innerHTML = data.results.map(function(m) {
        return '<div class="search-item" onclick="rbSelectMonster('+m.id+',\\''
          +m.name.replace(/\\'/g,"\\\\'")+'\\',\\''+( m.image_filename||'')+'\\')"><img src="/images/monsters/'
          +(m.image_filename||'')+'" style="width:28px;height:28px;object-fit:contain;border-radius:3px;background:#111" onerror="this.style.display=\\'none\\'"><span>'
          +m.name+'</span><span style="color:#8b90b0;font-size:.78rem;margin-left:auto">'+m.element+'</span></div>';
      }).join('') || '<div style="padding:.8rem;color:#8b90b0">No results</div>';
      res.style.display = 'block';
    });
  }, 250);
}
function rbSelectMonster(id, name, img) {
  document.getElementById('rbMonsterId').value   = id;
  document.getElementById('rbMonsterName').value = name;
  document.getElementById('rbSearch').value      = name;
  document.getElementById('rbSearchResults').style.display = 'none';
  var sel = document.getElementById('rbSelMonster');
  sel.style.display = 'flex';
  sel.innerHTML = '<img src="/images/monsters/'+img+'" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#111" onerror="this.style.display=\\'none\\'"><strong>'+name+'</strong>';
}
async function saveRuneBuild() {
  var mid   = document.getElementById('rbMonsterId').value;
  var mname = document.getElementById('rbMonsterName').value;
  var bname = document.getElementById('rbBuildName').value.trim();
  var msg   = document.getElementById('rbMsg');
  var btn   = document.getElementById('rbSaveBtn');
  if (!mid) { msg.style.color='#e08080'; msg.textContent='Select a monster first.'; return; }
  var filledAny = rbSlots.some(function(s){ return s && (s.rune_set||s.main_stat); });
  if (!filledAny) { msg.style.color='#e08080'; msg.textContent='Fill at least one slot before saving.'; return; }
  if (!bname) {
    var setCounts = {};
    rbSlots.forEach(function(s){ if (s && s.rune_set) setCounts[s.rune_set] = (setCounts[s.rune_set]||0)+1; });
    var sorted = Object.entries(setCounts).sort(function(a,b){ return b[1]-a[1]; });
    if (sorted.length === 0) {
      bname = 'Unnamed Build';
    } else if (sorted.every(function(e){ return e[1] === 1; })) {
      bname = 'Broken Set';
    } else {
      bname = sorted.filter(function(e){ return e[1] >= 2; }).map(function(e){ return e[0]; }).join(' / ');
      if (!bname) bname = 'Broken Set';
    }
  }
  btn.disabled = true; btn.textContent = 'Saving\u2026';
  var isEdit = !!rbEditId;
  var url  = isEdit ? '/api/admin/rune-builds/'+rbEditId+'?t='+encodeURIComponent(T)
                    : '/api/admin/rune-builds?t='+encodeURIComponent(T);
  var method = isEdit ? 'PUT' : 'POST';
  var res = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monster_id: parseInt(mid), monster_name: mname, name: bname, slots: rbSlots }),
  });
  btn.disabled = false; btn.textContent = isEdit ? 'Save Changes' : 'Save Build';
  if (res.ok) {
    if (isEdit) {
      var idx = RUNE_BUILDS_DATA.findIndex(function(x){ return x.id === rbEditId; });
      if (idx !== -1) {
        RUNE_BUILDS_DATA[idx].slots = rbSlots;
        RUNE_BUILDS_DATA[idx].name  = bname;
      }
    } else {
      var data = await res.json();
      RUNE_BUILDS_DATA.unshift(data.build);
    }
    renderRuneBuildsTable();
    msg.style.color = '#80c880'; msg.textContent = isEdit ? 'Changes saved!' : 'Build saved!';
    setTimeout(closeRB, 1200);
  } else {
    msg.style.color = '#e08080'; msg.textContent = 'Failed to save.';
  }
}

/* \u2500\u2500 View Rune Build modal \u2500\u2500 */
let _rbViewCurrent = null;
function openViewRB(r) {
  _rbViewCurrent = r;
  var STAT_LABELS = ['ATK', 'ATK%', 'DEF', 'DEF%', 'HP', 'HP%', 'SPD', 'CR%', 'CD%', 'RES%', 'ACC%'];
  var inner = (r.slots||[]).map(function(s, i) {
    if (!s || (!s.rune_set && !s.main_stat)) {
      return '<div style="background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.6rem .8rem;opacity:.4">'
        +'<span style="color:#555;font-size:.82rem">Slot '+(i+1)+' \u2014 empty</span></div>';
    }
    var subs = (s.substats||[]).map(function(x){ return '<span style="color:#a0b8f8;font-size:.8rem">'+x+'</span>'; }).join(', ');
    return '<div style="background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.65rem .85rem">'
      +'<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">'
      +'<span style="background:#2a1f5a;color:#c8c0f8;border-radius:4px;padding:.1rem .45rem;font-size:.72rem;font-weight:700">Slot '+(i+1)+'</span>'
      +(s.rune_set?'<span style="display:inline-flex;align-items:center;gap:3px;background:#1a2a1a;color:#80c880;border-radius:4px;padding:.1rem .45rem;font-size:.72rem;font-weight:700"><img src="/images/runes/'+s.rune_set.toLowerCase()+'.webp" width="14" height="14" style="object-fit:contain">'+s.rune_set+'</span>':'')
      +'</div>'
      +(s.main_stat?'<div style="color:#e8c060;font-size:.88rem;font-weight:600">'+s.main_stat+'</div>':'')
      +(subs?'<div style="margin-top:.2rem">'+subs+'</div>':'')
      +'</div>';
  }).join('');
  document.getElementById('rbViewTitle').textContent = (r.name||r.monster_name) + ' \u2014 Rune Build';
  document.getElementById('rbViewContent').innerHTML = inner;
  document.getElementById('rbViewOverlay').classList.add('open');
}
function closeRBView() {
  document.getElementById('rbViewOverlay').classList.remove('open');
}

/* \u2500\u2500 View rune images modal \u2500\u2500 */
let currentViewId   = null;
let currentViewName = null;

async function uploadFromView() {
  const file = document.getElementById("viewFile").files[0];
  const msg  = document.getElementById("viewUploadMsg");
  const btn  = document.getElementById("viewUploadBtn");
  if (!file || !currentViewId) { msg.style.color = "#e08080"; msg.textContent = "No file selected."; return; }
  btn.disabled = true; btn.textContent = "Uploading\u2026";
  const form = new FormData();
  form.append("monster_id", currentViewId);
  form.append("monster_name", currentViewName);
  form.append("image", file);
  const res = await fetch("/api/admin/rune-examples?t=" + encodeURIComponent(T), { method: "POST", body: form });
  btn.disabled = false; btn.textContent = "\u2B06 Add Image";
  if (res.ok) {
    const data = await res.json();
    msg.style.color = "#80c880";
    msg.textContent = \`Uploaded to \${data.forms} form(s). Refreshing\u2026\`;
    document.getElementById("viewFile").value = "";
    setTimeout(() => location.reload(), 1200);
  } else {
    msg.style.color = "#e08080"; msg.textContent = "Upload failed.";
  }
}

function viewRunes(monsterId) {
  const group = RUNE_DATA.find(g => g.monster_id === monsterId);
  if (!group) return;
  currentViewId   = group.monster_id;
  currentViewName = group.monster_name;
  document.getElementById("viewUploadMsg").textContent = "";
  document.getElementById("viewTitle").textContent = group.monster_name + " \u2014 Rune Examples";
  const grid = document.getElementById("viewGrid");
  grid.innerHTML = group.images.map(img => \`
    <div id="img-\${img.id}" style="background:#0f1117;border:1px solid #2e3250;border-radius:8px;overflow:hidden">
      <img src="/images/rune-examples/\${img.key}"
           style="width:100%;height:140px;object-fit:cover;cursor:zoom-in;display:block"
           onclick="window.open(this.src)"
           onerror="this.style.opacity='.2'">
      <div style="padding:.4rem .5rem;display:flex;align-items:center;justify-content:space-between">
        <span style="color:#8b90b0;font-size:.72rem">\${img.date}</span>
        <button class="btn btn-sm btn-danger" onclick="deleteRuneFromView(\${img.id},\${group.monster_id},this)">Delete</button>
      </div>
    </div>\`).join("");
  document.getElementById("viewOverlay").classList.add("open");
}
function closeView() {
  document.getElementById("viewOverlay").classList.remove("open");
}
function deleteRuneFromView(id, monsterId, btn) {
  openConfirm("Delete this image?", "This image will be permanently removed.", () => {
    btn.disabled = true;
    fetch("/api/admin/rune-examples/" + id + "?t=" + encodeURIComponent(T), { method: "DELETE" })
      .then(r => {
        if (r.ok) {
          document.getElementById("img-" + id)?.remove();
          const group = RUNE_DATA.find(g => g.monster_id === monsterId);
          if (group) { group.images = group.images.filter(i => i.id !== id); renderRuneTable(); }
          if (!document.getElementById("viewGrid").children.length) closeView();
        } else btn.disabled = false;
      });
  });
}

/* \u2500\u2500 View teams modal \u2500\u2500 */
function viewTeams(monsterId) {
  const group = TC_DATA.find(g => g.monster_id === monsterId);
  if (!group) return;
  document.getElementById("tcViewTitle").textContent = group.monster_name + " \u2014 Team Compositions";
  renderTCList(group);
  document.getElementById("tcViewOverlay").classList.add("open");
}
function renderTCList(group) {
  const list = document.getElementById("tcViewList");
  list.innerHTML = group.teams.map(t => \`
    <div id="team-\${t.id}" style="background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.7rem .8rem;margin-bottom:.6rem">
      <div style="display:flex;align-items:flex-start;gap:.5rem;flex-wrap:wrap">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;flex:1">
          \${(t.members||[]).map(m => \`
            <div style="display:flex;flex-direction:column;align-items:center;gap:.25rem;min-width:50px;max-width:60px">
              <img src="/images/monsters/\${m.image_filename||""}" style="width:44px;height:44px;object-fit:contain;border-radius:6px;background:#111" onerror="this.style.opacity='.3'" title="\${m.name}">
              <span style="font-size:.66rem;color:#c8cadf;text-align:center;word-break:break-word">\${m.name}</span>
            </div>\`).join("")}
        </div>
        <button class="btn btn-sm btn-danger" onclick="deleteTeam(\${t.id},\${group.monster_id},this)">Delete</button>
      </div>
      <div style="color:#8b90b0;font-size:.7rem;margin-top:.4rem"><span class="tc-mode-badge">\${TEAM_MODE_LABEL[t.mode] || "RTA"}</span>\${t.date}</div>
    </div>\`).join("") || '<div style="color:#8b90b0;text-align:center;padding:1.5rem">No teams yet</div>';
}
function closeTCView() {
  document.getElementById("tcViewOverlay").classList.remove("open");
}
async function deleteTeam(id, monsterId, btn) {
  openConfirm("Delete this team?", "This team composition will be permanently removed.", () => {
    btn.disabled = true;
    fetch("/api/admin/teams/" + id + "?t=" + encodeURIComponent(T), { method: "DELETE" })
      .then(r => {
        if (r.ok) {
          document.getElementById("team-" + id)?.remove();
          const group = TC_DATA.find(g => g.monster_id === monsterId);
          if (group) { group.teams = group.teams.filter(t => t.id !== id); renderTCTable(); }
        } else btn.disabled = false;
      });
  });
}
/* \u2500\u2500 Create Team modal \u2500\u2500 */
let teamMembers = [];
let teamAnchorId = null;
let teamSearchTimer;
let teamMode = "rta";
const TEAM_MODE_MAX = { rta: 5, defense: 3, attack: 3 };
const TEAM_MODE_LABEL = { rta: "RTA", defense: "Defense Arena", attack: "Attack Arena" };
function setTeamMode(mode) {
  teamMode = mode;
  document.querySelectorAll("#teamModeTabs .tc-mode-tab").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  if (teamMembers.length > TEAM_MODE_MAX[mode]) teamMembers = teamMembers.slice(0, TEAM_MODE_MAX[mode]);
  renderTeamMembers();
}

function openCreateTeam(anchorId, anchorName, anchorImg) {
  teamMembers = anchorId ? [{ id: anchorId, name: anchorName, image_filename: anchorImg || "", element: "" }] : [];
  teamAnchorId = anchorId || null;
  document.getElementById("createTeamTitle").textContent = anchorName ? \`Create Team for \${anchorName}\` : "Create Team";
  document.getElementById("teamSearch").value = "";
  document.getElementById("teamSearchResults").style.display = "none";
  document.getElementById("createTeamMsg").textContent = "";
  setTeamMode("rta");
  document.getElementById("createTeamOverlay").classList.add("open");
  setTimeout(() => document.getElementById("teamSearch").focus(), 50);
}
function closeCreateTeam() {
  document.getElementById("createTeamOverlay").classList.remove("open");
}
function renderTeamMembers() {
  const box = document.getElementById("teamMembersBox");
  box.innerHTML = teamMembers.map((m, i) => \`
    <div style="display:inline-flex;align-items:center;gap:.3rem;background:#1a1d27;border:1px solid #2e3250;border-radius:6px;padding:.22rem .45rem;font-size:.79rem">
      <img src="/images/monsters/\${m.image_filename}" style="width:22px;height:22px;object-fit:contain;border-radius:3px;background:#111" onerror="this.style.display='none'">
      <span>\${m.name}</span>
      \${i === 0 && teamAnchorId ? '<span style="color:#7c6cf8;font-size:.68rem;margin-left:.1rem">(anchor)</span>' : \`<button onclick="removeMember(\${i})" style="background:none;border:none;color:#e08080;cursor:pointer;padding:0 .1rem;font-size:.85rem;line-height:1;margin-left:.1rem">\u2715</button>\`}
    </div>\`).join("") || '<span style="color:#8b90b0;font-size:.83rem">No members \u2014 search to add</span>';
  document.getElementById("teamMemberCount").textContent = \`\${teamMembers.length} / \${TEAM_MODE_MAX[teamMode]} members\`;
  document.getElementById("saveTeamBtn").disabled = teamMembers.length < 2;
}
function removeMember(index) {
  teamMembers.splice(index, 1);
  renderTeamMembers();
}
function searchForTeam(q) {
  clearTimeout(teamSearchTimer);
  const res = document.getElementById("teamSearchResults");
  if (!q.trim() || teamMembers.length >= TEAM_MODE_MAX[teamMode]) { res.style.display = "none"; return; }
  teamSearchTimer = setTimeout(async () => {
    const data = await fetch("/api/monsters?q=" + encodeURIComponent(q) + "&limit=8").then(r => r.json());
    res.innerHTML = data.results.map(m =>
      \`<div class="search-item" onclick="addTeamMember(\${m.id},'\${m.name.replace(/'/g,"\\\\'")}','\${m.image_filename||""}','\${m.element||""}')">
        <img src="/images/monsters/\${m.image_filename}" style="width:28px;height:28px;object-fit:contain;border-radius:3px;background:#111" onerror="this.style.display='none'">
        <span>\${m.name}</span>
        <span style="color:#8b90b0;font-size:.78rem;margin-left:auto">\${m.element}</span>
      </div>\`
    ).join("") || "<div style='padding:.8rem;color:#8b90b0'>No results</div>";
    res.style.display = "block";
  }, 250);
}
function addTeamMember(id, name, img, element) {
  if (teamMembers.length >= TEAM_MODE_MAX[teamMode] || teamMembers.some(m => m.id === id)) return;
  if (!teamAnchorId) teamAnchorId = id;
  teamMembers.push({ id, name, image_filename: img, element });
  document.getElementById("teamSearch").value = "";
  document.getElementById("teamSearchResults").style.display = "none";
  renderTeamMembers();
}
async function saveTeam() {
  const btn = document.getElementById("saveTeamBtn");
  const msg = document.getElementById("createTeamMsg");
  if (teamMembers.length < 2) return;
  const anchorId = teamAnchorId || teamMembers[0].id;
  const anchorName = teamMembers.find(m => m.id === anchorId)?.name || teamMembers[0].name;
  btn.disabled = true; btn.textContent = "Saving\u2026";
  const res = await fetch("/api/admin/teams?t=" + encodeURIComponent(T), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anchor_monster_id: anchorId, anchor_name: anchorName, members: teamMembers, mode: teamMode })
  });
  btn.disabled = false; btn.textContent = "Save Team";
  if (res.ok) {
    msg.style.color = "#80c880"; msg.textContent = "Team saved! Refreshing\u2026";
    setTimeout(() => location.reload(), 1000);
  } else {
    msg.style.color = "#e08080"; msg.textContent = "Failed to save.";
  }
}

/* \u2500\u2500 Confirm modal \u2500\u2500 */
function openConfirm(title, msg, action) {
  pendingAction = action;
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMsg").textContent = msg;
  document.getElementById("confirmOkBtn").onclick = () => { closeConfirm(); (typeof action === "function" ? action : window[action])(); };
  document.getElementById("confirmOverlay").classList.add("open");
}
function closeConfirm() {
  document.getElementById("confirmOverlay").classList.remove("open");
  pendingAction = null;
}

/* \u2500\u2500 Upload modal \u2500\u2500 */
function openUploadFor(monsterId, monsterName, monsterImg) {
  uploadType = "rune";
  document.getElementById("uploadModalTitle").textContent = "Upload Rune Example";
  document.getElementById("selectedId").value = monsterId;
  document.getElementById("selectedName").value = monsterName;
  document.getElementById("monsterSearch").value = monsterName;
  document.getElementById("searchResults").style.display = "none";
  const sel = document.getElementById("selMonster");
  sel.style.display = "flex";
  sel.innerHTML = \`<img src="/images/monsters/\${monsterImg}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#111" onerror="this.style.display='none'"><strong>\${monsterName}</strong>\`;
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("runeFile").value = "";
  document.getElementById("uploadMsg").textContent = "";
  document.getElementById("uploadOverlay").classList.add("open");
}
function openUpload(type) {
  uploadType = type || "rune";
  const titles = { rune: "Upload Rune Example" };
  document.getElementById("uploadModalTitle").textContent = titles[uploadType] || "Upload";
  document.getElementById("selectedId").value = "";
  document.getElementById("selectedName").value = "";
  document.getElementById("monsterSearch").value = "";
  document.getElementById("selMonster").style.display = "none";
  document.getElementById("runeFile").value = "";
  document.getElementById("uploadBtn").disabled = true;
  document.getElementById("uploadOverlay").classList.add("open");
  setTimeout(() => document.getElementById("monsterSearch").focus(), 50);
}
function closeUpload() {
  document.getElementById("uploadOverlay").classList.remove("open");
  document.getElementById("uploadMsg").textContent = "";
  document.getElementById("uploadMsg").className = "";
}

/* \u2500\u2500 Monster search \u2500\u2500 */
function searchMonster(q) {
  clearTimeout(searchTimer);
  const res = document.getElementById("searchResults");
  if (!q.trim()) { res.style.display = "none"; return; }
  searchTimer = setTimeout(async () => {
    const data = await fetch("/api/monsters?q=" + encodeURIComponent(q) + "&limit=10").then(r => r.json());
    res.innerHTML = data.results.map(m =>
      \`<div class="search-item" onclick="selectMonster(\${m.id},'\${m.name.replace(/'/g,"\\\\'")}','\${m.image_filename||""}')">
        <img src="/images/monsters/\${m.image_filename}" style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:#111" onerror="this.style.display='none'">
        <span>\${m.name}</span>
        <span style="color:#8b90b0;font-size:.8rem;margin-left:auto">\${m.element}</span>
      </div>\`
    ).join("") || "<div style='padding:.8rem;color:#8b90b0'>No results</div>";
    res.style.display = "block";
  }, 250);
}
function selectMonster(id, name, img) {
  document.getElementById("selectedId").value = id;
  document.getElementById("selectedName").value = name;
  document.getElementById("monsterSearch").value = name;
  document.getElementById("searchResults").style.display = "none";
  const sel = document.getElementById("selMonster");
  sel.style.display = "flex";
  sel.innerHTML = \`<img src="/images/monsters/\${img}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#111"><strong>\${name}</strong><span style="color:#7c6cf8;font-size:.8rem;margin-left:.3rem">ID \${id}</span>\`;
  document.getElementById("uploadBtn").disabled = false;
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeConfirm(); closeUpload(); closeView(); closeTCView(); closeCreateTeam(); }
  if ((e.target.id === "monsterSearch" || e.target.id === "teamSearch") && e.key === "Escape") {
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("teamSearchResults").style.display = "none";
  }
});

/* \u2500\u2500 Upload rune \u2500\u2500 */
async function uploadRune() {
  const id   = document.getElementById("selectedId").value;
  const name = document.getElementById("selectedName").value;
  const file = document.getElementById("runeFile").files[0];
  const msg  = document.getElementById("uploadMsg");
  const btn  = document.getElementById("uploadBtn");
  if (!id || !file) { msg.className = "msg msg-err"; msg.textContent = "Select a monster and a file."; return; }
  btn.disabled = true; btn.textContent = "Uploading\u2026";
  const form = new FormData();
  form.append("monster_id", id);
  form.append("monster_name", name);
  form.append("image", file);
  const res = await fetch("/api/admin/rune-examples?t=" + encodeURIComponent(T), { method: "POST", body: form });
  btn.disabled = false; btn.textContent = "Upload";
  if (res.ok) {
    msg.className = "msg msg-ok";
    msg.textContent = "Uploaded! Refresh to see it in the table below.";
    document.getElementById("runeFile").value = "";
  } else {
    msg.className = "msg msg-err"; msg.textContent = "Upload failed.";
  }
}

/* \u2500\u2500 Delete helpers \u2500\u2500 */
async function deleteAllClicks() {
  const res = await fetch("/api/admin/events/all?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { CLICKS_DATA.length = 0; RECENT_DATA.length = 0; renderClicksTable(); renderRecentTable(); }
}
async function deleteAllReqs() {
  const res = await fetch("/api/admin/rune-requests/all?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { REQ_DATA.length = 0; renderReqsTable(); }
}
async function deleteAllRunes(monsterId) {
  const res = await fetch("/api/admin/rune-examples/monster/" + monsterId + "?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { const i = RUNE_DATA.findIndex(g => g.monster_id === monsterId); if (i !== -1) RUNE_DATA.splice(i, 1); renderRuneTable(); }
}
async function deleteAllRunesGlobal() {
  const res = await fetch("/api/admin/rune-examples/all?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { RUNE_DATA.length = 0; renderRuneTable(); }
}
async function deleteAllTeams(monsterId) {
  const res = await fetch("/api/admin/teams/anchor/" + monsterId + "?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { const i = TC_DATA.findIndex(g => g.monster_id === monsterId); if (i !== -1) TC_DATA.splice(i, 1); renderTCTable(); }
}
async function deleteAllTeamsGlobal() {
  const res = await fetch("/api/admin/teams/all?t=" + encodeURIComponent(T), { method: "DELETE" });
  if (res.ok) { TC_DATA.length = 0; renderTCTable(); }
}

initPages();
renderAll();
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeSlotForm();
});
<\/script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}
__name(handleDashboard, "handleDashboard");
async function handleAPI(url, request, env) {
  const path = url.pathname.replace("/api", "");
  if (path === "/request-rune" && request.method === "POST") {
    const body = await request.json();
    const secret = env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(body.token || "")}&remoteip=${encodeURIComponent(request.headers.get("CF-Connecting-IP") || "")}`
    }).then((r) => r.json());
    if (!verify.success) return json({ error: "CAPTCHA failed" }, 400);
    await env.DB.prepare(
      "INSERT INTO rune_requests (monster_id, monster_name) VALUES (?, ?)"
    ).bind(parseInt(body.monster_id), body.monster_name || "").run();
    return json({ ok: true });
  }
  if (path === "/submit-team-comp" && request.method === "POST") {
    const body = await request.json();
    const secret = env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(body.token || "")}&remoteip=${encodeURIComponent(request.headers.get("CF-Connecting-IP") || "")}`
    }).then((r) => r.json());
    if (!verify.success) return json({ error: "CAPTCHA failed" }, 400);
    const anchorId = parseInt(body.anchor_monster_id);
    const anchorName = body.anchor_name || "";
    const members = body.members || [];
    const mode = TEAM_MODE_MAX[body.mode] ? body.mode : "rta";
    if (!anchorId || members.length < 2) return json({ error: "Missing data" }, 400);
    if (members.length > TEAM_MODE_MAX[mode]) return json({ error: `Max ${TEAM_MODE_MAX[mode]} members for this mode` }, 400);
    await env.DB.prepare(
      "INSERT INTO teams (anchor_monster_id, anchor_name, members, mode) VALUES (?, ?, ?, ?)"
    ).bind(anchorId, anchorName, JSON.stringify(members), mode).run();
    return json({ ok: true });
  }
  if (path === "/submit-rune-build" && request.method === "POST") {
    const body = await request.json();
    const secret = env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(body.token || "")}&remoteip=${encodeURIComponent(request.headers.get("CF-Connecting-IP") || "")}`
    }).then((r) => r.json());
    if (!verify.success) return json({ error: "CAPTCHA failed" }, 400);
    const mId = parseInt(body.monster_id);
    const mName = body.monster_name || "";
    const slots = JSON.stringify(body.slots || []);
    const name = (body.name || "").slice(0, 120);
    if (!mId) return json({ error: "Missing monster_id" }, 400);
    await env.DB.prepare(
      "INSERT INTO rune_builds (monster_id, monster_name, slots, name) VALUES (?, ?, ?, ?)"
    ).bind(mId, mName, slots, name).run();
    return json({ ok: true });
  }
  if (path === "/track" && request.method === "POST") {
    return handleTrack(request, env);
  }
  const runeMatch = path.match(/^\/rune-examples\/(\d+)$/);
  if (runeMatch && request.method === "GET") {
    return getRuneExamples(runeMatch[1], env);
  }
  const rbMatch = path.match(/^\/rune-builds\/(\d+)$/);
  if (rbMatch && request.method === "GET") {
    return getRuneBuilds(rbMatch[1], env);
  }
  if (path === "/teams" && request.method === "GET") {
    return listTeams(url.searchParams, env);
  }
  const tcMatch = path.match(/^\/team-comp\/(\d+)$/);
  if (tcMatch && request.method === "GET") {
    return getTeamComp(tcMatch[1], env);
  }
  if (path.startsWith("/admin/")) {
    return handleAdminAPI(path.slice(7), request, env);
  }
  if (path === "/monsters" || path === "/monsters/") {
    return searchMonsters(url.searchParams, env);
  }
  const match = path.match(/^\/monsters\/(.+)$/);
  if (match) {
    return getMonster(match[1], env);
  }
  return json({ error: "Not found" }, 404);
}
__name(handleAPI, "handleAPI");
async function getRuneExamples(monsterId, env) {
  const rows = await env.DB.prepare(
    `SELECT id, image_key, created_at FROM rune_examples WHERE monster_id = ? ORDER BY created_at DESC`
  ).bind(parseInt(monsterId)).all();
  return json({ results: rows.results.map((r) => ({ id: r.id, url: `/images/rune-examples/${r.image_key}`, created_at: r.created_at })) });
}
__name(getRuneExamples, "getRuneExamples");
async function getRuneBuilds(monsterId, env) {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, slots, name, created_at FROM rune_builds WHERE monster_id = ? ORDER BY created_at DESC`
    ).bind(parseInt(monsterId)).all();
    return json({
      results: rows.results.map((r) => {
        let slots = [];
        try {
          slots = JSON.parse(r.slots);
        } catch {
        }
        return { id: r.id, name: r.name, slots, created_at: r.created_at };
      })
    });
  } catch {
    return json({ results: [] });
  }
}
__name(getRuneBuilds, "getRuneBuilds");
const TEAM_MODE_MAX = { rta: 5, defense: 3, attack: 3 };
async function getTeamComp(monsterId, env) {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, members, mode, created_at FROM teams WHERE anchor_monster_id = ? ORDER BY created_at DESC`
    ).bind(parseInt(monsterId)).all();
    return json({
      results: rows.results.map((r) => {
        let members = [];
        try {
          members = JSON.parse(r.members);
        } catch {
        }
        return { id: r.id, members, mode: r.mode || "rta", created_at: r.created_at };
      })
    });
  } catch {
    return json({ results: [] });
  }
}
__name(getTeamComp, "getTeamComp");
async function listTeams(params, env) {
  const mode = TEAM_MODE_MAX[params.get("mode")] ? params.get("mode") : "";
  const maxIds = mode ? TEAM_MODE_MAX[mode] : 5;
  const ids = [...new Set((params.get("monsters") || "").split(",").map((x) => parseInt(x)).filter((x) => x > 0))].slice(0, maxIds);
  const limit = Math.min(Math.max(parseInt(params.get("limit")) || 20, 1), 50);
  const offset = Math.max(parseInt(params.get("offset")) || 0, 0);
  const conds = ids.map(() => "EXISTS (SELECT 1 FROM json_each(t.members) j WHERE CAST(json_extract(j.value, '$.id') AS INTEGER) = ?)");
  if (mode) conds.push("t.mode = ?");
  const where = conds.length ? "WHERE " + conds.join(" AND ") : "";
  const binds = mode ? [...ids, mode] : ids;
  try {
    const [rows, total] = await env.DB.batch([
      env.DB.prepare(`SELECT t.id, t.anchor_monster_id, t.anchor_name, t.members, t.mode, t.created_at
        FROM teams t ${where} ORDER BY t.created_at DESC, t.id DESC LIMIT ? OFFSET ?`).bind(...binds, limit, offset),
      env.DB.prepare(`SELECT COUNT(*) AS n FROM teams t ${where}`).bind(...binds)
    ]);
    return json({
      total: total.results[0]?.n ?? 0,
      results: rows.results.map((r) => {
        let members = [];
        try {
          members = JSON.parse(r.members);
        } catch {
        }
        return { id: r.id, anchor_monster_id: r.anchor_monster_id, anchor_name: r.anchor_name, mode: r.mode || "rta", members, created_at: r.created_at };
      })
    });
  } catch {
    return json({ total: 0, results: [] });
  }
}
__name(listTeams, "listTeams");
async function handleAdminAPI(path, request, env) {
  if (!checkAdmin(request, env)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (path === "events/all" && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM events WHERE event_type = 'rune_examples'").run();
    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  }
  const evMatch = path.match(/^events\/(\d+)$/);
  if (evMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM events WHERE monster_id = ?").bind(parseInt(evMatch[1])).run();
    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  }
  const tcEvMatch = path.match(/^events\/tc\/(\d+)$/);
  if (tcEvMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM events WHERE monster_id = ? AND event_type = 'team_comp'").bind(parseInt(tcEvMatch[1])).run();
    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  }
  if (path === "rune-requests/all" && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM rune_requests").run();
    return json({ ok: true });
  }
  const reqMatch = path.match(/^rune-requests\/(\d+)$/);
  if (reqMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM rune_requests WHERE id = ?").bind(parseInt(reqMatch[1])).run();
    return json({ ok: true });
  }
  if (path === "rune-examples/all" && request.method === "DELETE") {
    const allKeys = await env.DB.prepare("SELECT image_key FROM rune_examples").all();
    for (const row of allKeys.results) await env.IMAGES.delete(`images/rune-examples/${row.image_key}`);
    await env.DB.prepare("DELETE FROM rune_examples").run();
    return json({ ok: true });
  }
  const allRuneMatch = path.match(/^rune-examples\/monster\/(\d+)$/);
  if (allRuneMatch && request.method === "DELETE") {
    const mId = parseInt(allRuneMatch[1]);
    const rows2 = await env.DB.prepare("SELECT image_key FROM rune_examples WHERE monster_id = ?").bind(mId).all();
    for (const row2 of rows2.results) {
      await env.IMAGES.delete(`images/rune-examples/${row2.image_key}`);
    }
    await env.DB.prepare("DELETE FROM rune_examples WHERE monster_id = ?").bind(mId).run();
    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  }
  if (path === "rune-examples" && request.method === "POST") {
    const formData = await request.formData();
    const file = formData.get("image");
    const monsterId = parseInt(formData.get("monster_id"));
    const monsterName = formData.get("monster_name") || "";
    if (!file || !monsterId) return json({ error: "Missing file or monster_id" }, 400);
    const base = await env.DB.prepare(
      "SELECT family_id, element FROM monsters WHERE id = ?"
    ).bind(monsterId).first();
    let targets = [{ id: monsterId, name: monsterName }];
    if (base?.family_id) {
      const forms = await env.DB.prepare(
        "SELECT id, name FROM monsters WHERE family_id = ? AND element = ? AND obtainable = 1"
      ).bind(base.family_id, base.element).all();
      if (forms.results.length > 0) targets = forms.results;
    }
    const ext = (file.name || "jpg").split(".").pop().toLowerCase();
    const key = `${monsterId}/${Date.now()}.${ext}`;
    await env.IMAGES.put(`images/rune-examples/${key}`, file.stream(), {
      httpMetadata: { contentType: file.type || "image/jpeg" }
    });
    await env.DB.batch(targets.map(
      (t) => env.DB.prepare("INSERT INTO rune_examples (monster_id, monster_name, image_key) VALUES (?, ?, ?)").bind(t.id, t.name, key)
    ));
    return json({ ok: true, forms: targets.length });
  }
  const reMatch = path.match(/^rune-examples\/(\d+)$/);
  if (reMatch && request.method === "DELETE") {
    const id = parseInt(reMatch[1]);
    const row = await env.DB.prepare("SELECT image_key FROM rune_examples WHERE id = ?").bind(id).first();
    if (row) {
      await env.IMAGES.delete(`images/rune-examples/${row.image_key}`);
      await env.DB.prepare("DELETE FROM rune_examples WHERE id = ?").bind(id).run();
    }
    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  }
  if (path === "teams" && request.method === "POST") {
    const body = await request.json();
    const anchorId = parseInt(body.anchor_monster_id);
    const anchorName = body.anchor_name || "";
    const members = JSON.stringify(body.members || []);
    const mode = TEAM_MODE_MAX[body.mode] ? body.mode : "rta";
    if (!anchorId || !body.members?.length) return json({ error: "Missing data" }, 400);
    if (body.members.length > TEAM_MODE_MAX[mode]) return json({ error: `Max ${TEAM_MODE_MAX[mode]} members for this mode` }, 400);
    await env.DB.prepare(
      "INSERT INTO teams (anchor_monster_id, anchor_name, members, mode) VALUES (?, ?, ?, ?)"
    ).bind(anchorId, anchorName, members, mode).run();
    return json({ ok: true });
  }
  if (path === "teams/all" && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM teams").run();
    return json({ ok: true });
  }
  const teamsAnchorMatch = path.match(/^teams\/anchor\/(\d+)$/);
  if (teamsAnchorMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM teams WHERE anchor_monster_id = ?").bind(parseInt(teamsAnchorMatch[1])).run();
    return json({ ok: true });
  }
  const teamsIdMatch = path.match(/^teams\/(\d+)$/);
  if (teamsIdMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM teams WHERE id = ?").bind(parseInt(teamsIdMatch[1])).run();
    return json({ ok: true });
  }
  if (path === "rune-builds" && request.method === "POST") {
    const body = await request.json();
    const mId = parseInt(body.monster_id);
    const mName = body.monster_name || "";
    const slots = JSON.stringify(body.slots || []);
    const name = body.name || "";
    if (!mId) return json({ error: "Missing monster_id" }, 400);
    const result = await env.DB.prepare(
      "INSERT INTO rune_builds (monster_id, monster_name, slots, name) VALUES (?, ?, ?, ?)"
    ).bind(mId, mName, slots, name).run();
    const newId = result.meta?.last_row_id ?? null;
    return json({ ok: true, build: { id: newId, monster_id: mId, monster_name: mName, name, slots: body.slots || [], created_at: (/* @__PURE__ */ new Date()).toISOString() } });
  }
  const rbPutMatch = path.match(/^rune-builds\/(\d+)$/);
  if (rbPutMatch && request.method === "PUT") {
    const id = parseInt(rbPutMatch[1]);
    const body = await request.json();
    const slots = JSON.stringify(body.slots || []);
    const name = body.name || "";
    await env.DB.prepare("UPDATE rune_builds SET slots = ?, name = ? WHERE id = ?").bind(slots, name, id).run();
    return json({ ok: true });
  }
  if (path === "rune-builds/all" && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM rune_builds").run();
    return json({ ok: true });
  }
  const rbIdMatch = path.match(/^rune-builds\/(\d+)$/);
  if (rbIdMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM rune_builds WHERE id = ?").bind(parseInt(rbIdMatch[1])).run();
    return json({ ok: true });
  }
  return json({ error: "Not found" }, 404);
}
__name(handleAdminAPI, "handleAdminAPI");
async function handleTrack(request, env) {
  try {
    const body = await request.json();
    await env.DB.prepare(
      `INSERT INTO events (event_type, monster_id, monster_name, monster_element)
       VALUES (?, ?, ?, ?)`
    ).bind(
      body.event || "unknown",
      body.monster_id ?? null,
      body.monster_name ?? null,
      body.monster_element ?? null
    ).run();
    return new Response("ok", { headers: { ...CORS, "Content-Type": "text/plain" } });
  } catch {
    return new Response("error", { status: 500, headers: CORS });
  }
}
__name(handleTrack, "handleTrack");
async function searchMonsters(params, env) {
  const q = (params.get("q") || "").trim();
  const element = params.get("element") || "";
  const archetype = params.get("archetype") || "";
  const stars = params.get("stars") || "";
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "48")));
  const offset = (page - 1) * limit;
  const SELECT = `SELECT id, com2us_id, name, element, archetype, base_stars, natural_stars,
                         awaken_level, image_filename, bestiary_slug`;
  const extraConds = ["obtainable = 1"];
  const extraVals = [];
  if (element) {
    extraConds.push("element = ?");
    extraVals.push(element);
  }
  if (archetype) {
    extraConds.push("archetype = ?");
    extraVals.push(archetype);
  }
  if (stars) {
    extraConds.push("natural_stars = ?");
    extraVals.push(parseInt(stars));
  }
  const extraWhere = extraConds.join(" AND ");
  let countStmt, rowsStmt;
  if (q) {
    const namePattern = `%${q}%`;
    const familySub = `SELECT DISTINCT family_id FROM monsters WHERE name LIKE ? AND obtainable = 1`;
    countStmt = env.DB.prepare(
      `SELECT COUNT(*) as total FROM monsters
       WHERE family_id IN (${familySub}) AND ${extraWhere}`
    ).bind(namePattern, ...extraVals);
    rowsStmt = env.DB.prepare(
      `${SELECT} FROM monsters
       WHERE family_id IN (${familySub}) AND ${extraWhere}
       ORDER BY
         CASE WHEN name LIKE ? THEN 0 ELSE 1 END ASC,
         CASE WHEN name LIKE ? THEN awaken_level ELSE -1 END DESC,
         family_id ASC, awaken_level DESC, name ASC
       LIMIT ? OFFSET ?`
    ).bind(namePattern, ...extraVals, namePattern, namePattern, limit, offset);
  } else {
    countStmt = env.DB.prepare(
      `SELECT COUNT(*) as total FROM monsters WHERE ${extraWhere}`
    ).bind(...extraVals);
    rowsStmt = env.DB.prepare(
      `${SELECT} FROM monsters WHERE ${extraWhere}
       ORDER BY natural_stars DESC, name ASC
       LIMIT ? OFFSET ?`
    ).bind(...extraVals, limit, offset);
  }
  const [countRow, rows] = await env.DB.batch([countStmt, rowsStmt]);
  const total = countRow.results[0]?.total ?? 0;
  return json({ total, page, limit, pages: Math.ceil(total / limit), results: rows.results });
}
__name(searchMonsters, "searchMonsters");
async function getMonster(slugOrId, env) {
  const isId = /^\d+$/.test(slugOrId);
  const col = isId ? "id" : "bestiary_slug";
  const row = await env.DB.prepare(
    `SELECT data FROM monsters WHERE ${col} = ? LIMIT 1`
  ).bind(isId ? parseInt(slugOrId) : slugOrId).first();
  if (!row) return json({ error: "Monster not found" }, 404);
  const m = JSON.parse(row.data);
  const relatedIds = [m.awakens_from, m.awakens_to].filter((id) => id && typeof id === "number");
  const queries = [];
  if (relatedIds.length) {
    const ph = relatedIds.map(() => "?").join(",");
    queries.push(env.DB.prepare(
      `SELECT id, name, element, archetype, natural_stars, awaken_level, image_filename
       FROM monsters WHERE id IN (${ph})`
    ).bind(...relatedIds));
  } else {
    queries.push(env.DB.prepare("SELECT 1 WHERE 0"));
  }
  if (m.family_id) {
    queries.push(env.DB.prepare(
      `SELECT id, name, element, archetype, natural_stars, awaken_level, image_filename, bestiary_slug
       FROM monsters WHERE family_id = ? AND obtainable = 1
       ORDER BY natural_stars ASC, awaken_level ASC, name ASC`
    ).bind(m.family_id));
  } else {
    queries.push(env.DB.prepare("SELECT 1 WHERE 0"));
  }
  const [relRes, famRes] = await env.DB.batch(queries);
  m._related_forms = relRes.results;
  m._family = famRes.results;
  return new Response(JSON.stringify(m), {
    headers: { ...CORS, "Cache-Control": "public, max-age=300" }
  });
}
__name(getMonster, "getMonster");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Cache-Control": "public, max-age=60" }
  });
}
__name(json, "json");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map