const IMG = (f) => f ? `/images/monsters/${f}` : "/placeholder.png";
const SKILL_IMG = (f) => f ? `/images/skills/${f}` : "";
const SW_CDN = "https://swarfarm.com/static/herders/images";

const ELEMENT_CLASS = {
  Fire: "el-fire", Water: "el-water", Wind: "el-wind",
  Light: "el-light", Dark: "el-dark",
};
const STARS = (n) => "★".repeat(n);

const EFFECT_ICON = {
  1:"buff_attack_up.png", 2:"buff_defence_up.png", 3:"buff_crit_up.png",
  4:"buff_crit_down.png", 5:"buff_speed.png", 6:"buff_heal.png",
  7:"buff_counter.png", 9:"buff_immune.png", 10:"buff_invinciblity.png",
  11:"buff_reflect.png", 12:"buff_shield.png", 13:"buff_endure.png",
  14:"buff_protect.png", 15:"buff_soul_protect.png",
  18:"debuff_glancing_hit.png", 19:"debuff_attack_down.png",
  20:"debuff_defence_down.png", 21:"debuff_slow.png",
  22:"debuff_block_buffs.png", 23:"debuff_bomb.png", 24:"debuff_provoke.png",
  25:"debuff_sleep.png", 26:"debuff_dot.png", 27:"debuff_freeze.png",
  28:"debuff_stun.png", 29:"debuff_block_heal.png", 30:"debuff_silence.png",
  31:"debuff_brand.png", 32:"debuff_oblivious.png", 64:"buff_threat.png",
  70:"buff_knowledge.png", 71:"buff_manafury.png", 73:"buff_vampire.png",
  78:"debuff_cleanse_block.png", 82:"debuff_suppress.png",
  83:"debuff_deathcurse.png", 89:"buff_berserk.png", 93:"buff_soul_stone.png",
  98:"buff_magic_reflect.png", 106:"debuff_irresistible.png", 112:"debuff_seal.png",
};

const SOURCE_ICON = {
  3:  "summon_legendary_scroll.png",
  4:  "summon_light_and_dark_scroll.png",
  5:  "summon_fire_scroll.png",
  6:  "summon_water_scroll.png",
  7:  "summon_wind_scroll.png",
  35: "fusion.png",
  38: "summon_mystical_crystal.png",
  39: "summon_unknown_social.png",
};

function leaderIconUrl(attribute, area) {
  const a = (attribute || "").replace(/ /g, "_");
  return `${SW_CDN}/skills/leader/leader_skill_${a}_${area || "General"}.png`;
}

// ── Search header navigation ───────────────────────────────────────────────────
function initSearchNav() {
  // Pre-fill from hash (state carried from the grid)
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
  params.delete("monster");
  params.delete("page");
  Object.entries(overrides).forEach(([k, v]) => {
    if (v) params.set(k, v); else params.delete(k);
  });
  const str = params.toString();
  location.href = "/" + (str ? "#" + str : "");
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const slugOrId = location.pathname.replace(/^\/monsters\//, "").replace(/\/$/, "");

document.addEventListener("DOMContentLoaded", async () => {
  initSearchNav();

  if (!slugOrId) { showError("No monster specified."); return; }

  const res = await fetch(`/api/monsters/${slugOrId}`, { cache: "no-store" });
  if (!res.ok) { showError("Monster not found."); return; }

  const m = await res.json();
  window._pageMonster = m;
  document.title = `${m.name} — SW Monster Guide`;
  document.getElementById("monster-page").innerHTML = renderMonster(m);

  document.getElementById("rune-btn")?.addEventListener("click", () => {
    navigator.sendBeacon("/api/track", new Blob(
      [JSON.stringify({ event: "rune_examples", monster_id: m.id, monster_name: m.name, monster_element: m.element })],
      { type: "application/json" }
    ));
  });
  document.getElementById("tc-btn")?.addEventListener("click", () => {
    navigator.sendBeacon("/api/track", new Blob(
      [JSON.stringify({ event: "team_comp", monster_id: m.id, monster_name: m.name, monster_element: m.element })],
      { type: "application/json" }
    ));
  });
});

/* ══════════════════════════════════════════════════════════════
   ADD RUNE BUILD MODAL — SVG star builder
   ══════════════════════════════════════════════════════════════ */
const _MN_FIXED_MAIN = {0:'ATK', 2:'DEF', 4:'HP'};
const _MN_MAIN_OPTS  = {
  1: ['SPD','ATK%','DEF%','HP%','ATK','DEF','HP'],
  3: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%'],
  5: ['ATK%','DEF%','HP%','CR%','CD%','RES%','ACC%']
};
const _MN_SUB_TYPES  = ['SPD','ATK','ATK%','DEF','DEF%','HP','HP%','CR%','CD%','RES%','ACC%'];
const _MN_MAIN_DEFS  = {
  'ATK':'160','DEF':'160','HP':'2484','ATK%':'63','DEF%':'63','HP%':'63',
  'SPD':'42','RES%':'63','ACC%':'63','CR%':'58','CD%':'80'
};
const _MN_ANGLES = [0,60,120,180,240,300];
const _MN_CX=200,_MN_CY=200,_MN_R1=52,_MN_R2=110,_MN_R3=158;
const _MN_SF  = 'background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
const _MN_SFW = 'flex:1;min-width:0;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';
const _MN_IFW = 'width:68px;background:#0f1117;border:1px solid #2e3250;border-radius:6px;padding:.35rem .5rem;color:#e8eaf6;font-size:.82rem';

let _mnArSlots       = [{},{},{},{},{},{}];
let _mnArSegEls      = [];
let _mnArCurrentSlot = -1;

function _mnToRad(d) { return d * Math.PI / 180; }
function _mnPt(r,deg) { return [_MN_CX+r*Math.sin(_mnToRad(deg)), _MN_CY-r*Math.cos(_mnToRad(deg))]; }
function _mnSegPts(a) { return [_mnPt(_MN_R1,a-30),_mnPt(_MN_R2,a-21),_mnPt(_MN_R3,a),_mnPt(_MN_R2,a+21),_mnPt(_MN_R1,a+30)]; }
function _mnSharpPath(pts) { return 'M '+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ')+' Z'; }
function _mnLabelPt(a) { return _mnPt(_MN_R1+(_MN_R3-_MN_R1)*0.54,a); }
function _mnSubTypeOpts(sel) {
  return '<option value="">— none —</option>'+_MN_SUB_TYPES.map(t=>`<option value="${t}"${t===sel?' selected':''}>${t}</option>`).join('');
}
function _mnMainTypeOpts(i,sel) {
  return '<option value="">— type —</option>'+(_MN_MAIN_OPTS[i]||[]).map(t=>`<option value="${t}"${t===sel?' selected':''}>${t}</option>`).join('');
}
function _mnParseStr(s) { const m=s&&s.match(/^(.+?)\+(.*)$/); return m?{type:m[1],val:m[2]}:{type:s||'',val:''}; }

function mnArUpdateSetIcon(val) {
  const el=document.getElementById('mnArRuneSetIcon');
  if(!el) return;
  if(val){el.src='/images/runes/'+val.toLowerCase()+'.webp';el.style.display='inline';}
  else el.style.display='none';
}
function _mnArAutoFillMain(sel) {
  const d=_MN_MAIN_DEFS[sel.value];
  if(d){const el=document.getElementById('mnArMainVal');if(el)el.value=d;}
}
function _mnArRenderMain(slotIdx,slot) {
  const box=document.getElementById('mnArMainSection'); if(!box) return;
  const fixed=_MN_FIXED_MAIN[slotIdx];
  const parsed=_mnParseStr((slot&&slot.main_stat)||'');
  if(fixed){
    box.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center"><span style="background:#2e3250;color:#7c6cf8;border-radius:5px;padding:.3rem .6rem;font-size:.82rem;font-weight:700;flex-shrink:0">${fixed}</span><input id="mnArMainVal" type="text" placeholder="value" value="${parsed.val||_MN_MAIN_DEFS[fixed]||''}" style="${_MN_SF};flex:1"></div>`;
  } else {
    const vv=parsed.val||(parsed.type?(_MN_MAIN_DEFS[parsed.type]||''):'');
    box.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center"><select id="mnArMainType" onchange="_mnArAutoFillMain(this)" style="${_MN_SFW}">${_mnMainTypeOpts(slotIdx,parsed.type)}</select><input id="mnArMainVal" type="text" placeholder="val" value="${vv}" style="${_MN_IFW}"></div>`;
  }
}
function _mnArRenderSubs(slot) {
  const box=document.getElementById('mnArSubSection'); if(!box) return;
  const subs=(slot&&slot.substats)||[];
  let rows='';
  for(let k=0;k<4;k++){
    const p=_mnParseStr(subs[k]||'');
    rows+=`<div style="display:flex;gap:.4rem;margin-bottom:.28rem"><select id="mnArSub${k}T" style="${_MN_SFW}">${_mnSubTypeOpts(p.type)}</select><input id="mnArSub${k}V" type="text" placeholder="val" value="${p.val}" style="${_MN_IFW}"></div>`;
  }
  box.innerHTML=rows;
}

function _mnArBuildStar() {
  const con=document.getElementById('mnArStarContainer'); if(!con) return;
  con.innerHTML=''; _mnArSegEls=[];
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 400 400');svg.setAttribute('width','260');svg.setAttribute('height','260');
  svg.innerHTML='<defs>'
    +'<radialGradient id="mn-ar-bg" cx="50%" cy="50%" r="50%"><stop offset="40%" stop-color="#1c1208"/><stop offset="100%" stop-color="#3a2510"/></radialGradient>'
    +'<radialGradient id="mn-ar-empty" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#221508"/><stop offset="100%" stop-color="#110a02"/></radialGradient>'
    +'<radialGradient id="mn-ar-full" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#3e2a0c"/><stop offset="100%" stop-color="#1c1005"/></radialGradient>'
    +'<radialGradient id="mn-ar-active" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#7a4e1a"/><stop offset="100%" stop-color="#3d2208"/></radialGradient>'
    +'<radialGradient id="mn-ar-center" cx="38%" cy="32%" r="60%"><stop offset="0%" stop-color="#2a1808"/><stop offset="100%" stop-color="#0e0804"/></radialGradient>'
    +'</defs>'
    +'<circle cx="200" cy="200" r="178" fill="url(#mn-ar-bg)" stroke="#5e3a0e" stroke-width="4"/>'
    +'<circle cx="200" cy="200" r="171" fill="none" stroke="#2a1808" stroke-width="1.5"/>';
  const g=document.createElementNS(NS,'g'); svg.appendChild(g);
  const cg=document.createElementNS(NS,'g');
  cg.innerHTML='<circle cx="200" cy="200" r="44" fill="url(#mn-ar-center)" stroke="#b87820" stroke-width="2.8"/>'
    +'<circle cx="200" cy="200" r="36" fill="none" stroke="#7a4e14" stroke-width="1.2"/>'
    +'<text x="200" y="210" text-anchor="middle" font-size="24" fill="#8a6030" font-family="Georgia,serif">⚔</text>';
  _MN_ANGLES.forEach((alpha,i)=>{
    const hf=!!(_mnArSlots[i]&&(_mnArSlots[i].rune_set||_mnArSlots[i].main_stat));
    const d=_mnSharpPath(_mnSegPts(alpha));
    const [lx,ly]=_mnLabelPt(alpha);
    const grp=document.createElementNS(NS,'g'); grp.style.cursor='pointer';
    const sh=document.createElementNS(NS,'path');
    sh.setAttribute('d',d);sh.setAttribute('fill','none');sh.setAttribute('stroke','#050200');sh.setAttribute('stroke-width','8');sh.setAttribute('stroke-linejoin','miter');
    grp.appendChild(sh);
    const fill=document.createElementNS(NS,'path');
    fill.setAttribute('d',d);fill.setAttribute('fill',hf?'url(#mn-ar-full)':'url(#mn-ar-empty)');
    fill.setAttribute('stroke',hf?'#c8881a':'#3d2208');fill.setAttribute('stroke-width','2.2');fill.setAttribute('stroke-linejoin','miter');
    grp.appendChild(fill);
    const bv=document.createElementNS(NS,'path');
    bv.setAttribute('d',d);bv.setAttribute('fill','none');bv.setAttribute('stroke',hf?'rgba(255,200,80,.11)':'rgba(100,60,10,.06)');bv.setAttribute('stroke-width','4');bv.setAttribute('stroke-linejoin','miter');
    grp.appendChild(bv);
    if(hf&&_mnArSlots[i].rune_set){
      const sz=36,img=document.createElementNS(NS,'image');
      img.setAttribute('href','/images/runes/'+_mnArSlots[i].rune_set.toLowerCase()+'.webp');
      img.setAttribute('x',(lx-sz/2).toFixed(1));img.setAttribute('y',(ly-sz/2).toFixed(1));
      img.setAttribute('width',sz);img.setAttribute('height',sz);img.setAttribute('pointer-events','none');
      grp.appendChild(img);
      const nt=document.createElementNS(NS,'text');
      nt.setAttribute('x',(lx+sz*.38).toFixed(1));nt.setAttribute('y',(ly+sz*.55).toFixed(1));
      nt.setAttribute('text-anchor','middle');nt.setAttribute('font-size','13');nt.setAttribute('font-weight','bold');
      nt.setAttribute('fill','#ffe033');nt.setAttribute('stroke','#1a0e00');nt.setAttribute('stroke-width','2');
      nt.setAttribute('paint-order','stroke');nt.setAttribute('pointer-events','none');nt.setAttribute('font-family','Georgia,serif');
      nt.textContent=i+1; grp.appendChild(nt);
    } else {
      const tx=document.createElementNS(NS,'text');
      tx.setAttribute('x',lx.toFixed(1));tx.setAttribute('y',(ly+8).toFixed(1));
      tx.setAttribute('text-anchor','middle');tx.setAttribute('font-size','22');tx.setAttribute('font-weight','bold');
      tx.setAttribute('fill',hf?'#ffe033':'#7a4e10');tx.setAttribute('stroke',hf?'#3a2000':'none');
      tx.setAttribute('stroke-width','2.5');tx.setAttribute('paint-order','stroke');tx.setAttribute('pointer-events','none');tx.setAttribute('font-family','Georgia,serif');
      tx.textContent=i+1; grp.appendChild(tx);
    }
    grp.addEventListener('mouseenter',()=>{ if(_mnArCurrentSlot!==i) fill.setAttribute('fill',hf?'#5a3a0e':'#3a2510'); });
    grp.addEventListener('mouseleave',()=>{ if(_mnArCurrentSlot!==i) fill.setAttribute('fill',hf?'url(#mn-ar-full)':'url(#mn-ar-empty)'); });
    grp.addEventListener('click',()=>_mnArOpenSlot(i,svg));
    _mnArSegEls.push({fill,hf});
    g.appendChild(grp);
  });
  svg.appendChild(cg); con.appendChild(svg);
}

function _mnArHighlight(active) {
  _mnArSegEls.forEach((el,j)=>{
    const hf=!!(_mnArSlots[j]&&(_mnArSlots[j].rune_set||_mnArSlots[j].main_stat));
    el.fill.setAttribute('fill',j===active?'url(#mn-ar-active)':(hf?'url(#mn-ar-full)':'url(#mn-ar-empty)'));
  });
}

function _mnArOpenSlot(i,svgEl) {
  _mnArCurrentSlot=i;
  const alpha=_MN_ANGLES[i];
  const rect=svgEl.getBoundingClientRect();
  const sx=rect.width/400,sy=rect.height/400;
  const tx=rect.left+(_MN_CX+_MN_R3*Math.sin(_mnToRad(alpha)))*sx;
  const ty=rect.top +(_MN_CY-_MN_R3*Math.cos(_mnToRad(alpha)))*sy;
  const dx=Math.sin(_mnToRad(alpha)),dy=-Math.cos(_mnToRad(alpha));
  let x=tx+dx*18-145, y=ty+dy*18-180;
  x=Math.max(8,Math.min(window.innerWidth-298-8,x));
  y=Math.max(8,Math.min(window.innerHeight-370-8,y));
  const form=document.getElementById('mnArSlotForm');
  form.style.left=x+'px'; form.style.top=y+'px';
  document.getElementById('mnArFormTitle').textContent='Slot '+(i+1);
  const slot=_mnArSlots[i]||{};
  document.getElementById('mnArRuneSet').value=slot.rune_set||'';
  mnArUpdateSetIcon(slot.rune_set||'');
  _mnArRenderMain(i,slot); _mnArRenderSubs(slot);
  form.style.display='block'; _mnArHighlight(i);
}

function mnArCloseSlotForm() {
  document.getElementById('mnArSlotForm').style.display='none';
  _mnArCurrentSlot=-1;
  _mnArSegEls.forEach((el,j)=>{
    const hf=!!(_mnArSlots[j]&&(_mnArSlots[j].rune_set||_mnArSlots[j].main_stat));
    el.fill.setAttribute('fill',hf?'url(#mn-ar-full)':'url(#mn-ar-empty)');
  });
}

function mnArSaveSlot() {
  const i=_mnArCurrentSlot; if(i<0) return;
  const set=document.getElementById('mnArRuneSet').value;
  const fixed=_MN_FIXED_MAIN[i];
  const mt=fixed||(document.getElementById('mnArMainType')?document.getElementById('mnArMainType').value:'');
  const mv=(document.getElementById('mnArMainVal')?.value||'').trim();
  const main=mt?(mv?mt+'+'+mv:mt):'';
  const subs=[];
  for(let k=0;k<4;k++){
    const t=document.getElementById(`mnArSub${k}T`)?.value||'';
    const v=(document.getElementById(`mnArSub${k}V`)?.value||'').trim();
    if(t) subs.push(v?t+'+'+v:t);
  }
  _mnArSlots[i]={rune_set:set,main_stat:main,substats:subs};
  mnArCloseSlotForm(); _mnArBuildStar(); _mnArUpdateSummary();
}

function _mnArUpdateSummary() {
  const box=document.getElementById('mnArSlotsSummary'); if(!box) return;
  box.innerHTML=_mnArSlots.map((s,i)=>{
    const hf=!!(s&&(s.rune_set||s.main_stat));
    const icon=(hf&&s.rune_set)?`<img src="/images/runes/${s.rune_set.toLowerCase()}.webp" width="14" height="14" style="object-fit:contain;vertical-align:middle;margin-right:3px">`:'';
    return `<span style="display:inline-flex;align-items:center;background:${hf?'#2a1f5a':'#1a1d27'};border:1px solid ${hf?'#7c6cf8':'#2e3250'};border-radius:5px;padding:.18rem .5rem;font-size:.75rem;color:${hf?'#c8c0f8':'#555'}">${icon}Slot ${i+1}${hf&&s.rune_set?' — '+s.rune_set:''}</span>`;
  }).join('');
}

function mnOpenAddRune() {
  const m=window._pageMonster; if(!m) return;
  _mnArSlots=[{},{},{},{},{},{}]; _mnArCurrentSlot=-1;
  document.getElementById('mnAddRuneTitle').textContent=`Add Rune Build — ${m.name}`;
  document.getElementById('mnArName').value='';
  document.getElementById('mnAddRuneMsg').textContent='';
  document.getElementById('mnAddRuneSubmitBtn').disabled=false;
  document.getElementById('mnAddRuneSubmitBtn').textContent='Submit Build';
  document.getElementById('mnArSlotForm').style.display='none';
  if(window.turnstile) window.turnstile.reset();
  document.getElementById('mnAddRuneOverlay').style.display='flex';
  _mnArBuildStar(); _mnArUpdateSummary();
}
function mnCloseAddRune() {
  document.getElementById('mnAddRuneOverlay').style.display='none';
  mnArCloseSlotForm();
}
async function mnSubmitAddRune() {
  const m=window._pageMonster; if(!m) return;
  const token=document.querySelector('#mnAddRuneCaptcha [name="cf-turnstile-response"]')?.value||'';
  const btn=document.getElementById('mnAddRuneSubmitBtn');
  const msg=document.getElementById('mnAddRuneMsg');
  if(!token){msg.style.color='#e08080';msg.textContent='Please complete the CAPTCHA first.';return;}
  const filledAny=_mnArSlots.some(s=>s&&(s.rune_set||s.main_stat));
  if(!filledAny){msg.style.color='#e08080';msg.textContent='Fill at least one slot before submitting.';return;}
  const sc={};_mnArSlots.forEach(s=>{if(s&&s.rune_set)sc[s.rune_set]=(sc[s.rune_set]||0)+1;});
  const sorted=Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  let name=document.getElementById('mnArName').value.trim()||sorted.filter(e=>e[1]>=2).map(e=>e[0]).join(' / ')||( sorted.length?'Broken Set':'Unnamed Build');
  btn.disabled=true; btn.textContent='Submitting…';
  const res=await fetch('/api/submit-rune-build',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({monster_id:m.id,monster_name:m.name,name,slots:_mnArSlots,token})});
  if(res.ok){msg.style.color='#80c880';msg.textContent='Build submitted! Thank you 🙏';btn.textContent='Submitted!';setTimeout(mnCloseAddRune,2200);}
  else{btn.disabled=false;btn.textContent='Submit Build';const e=await res.json().catch(()=>({}));msg.style.color='#e08080';msg.textContent=e.error||'Failed — please try again.';if(window.turnstile)window.turnstile.reset();}
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){mnArCloseSlotForm();mnCloseAddRune();mnCloseAddTc();}
});

function showError(msg) {
  document.getElementById("monster-page").innerHTML =
    `<div class="empty"><div class="big">😵</div>${msg}</div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderMonster(m) {
  const elClass     = ELEMENT_CLASS[m.element] || "";
  const awakenLabel = ["Unawakened", "Awakened", "2nd Awakened"][m.awaken_level] || "";

  const stats = [
    ["HP",     m.max_lvl_hp      ?? m.base_hp],
    ["ATK",    m.max_lvl_attack  ?? m.base_attack],
    ["DEF",    m.max_lvl_defense ?? m.base_defense],
    ["SPD",    m.speed],
    ["C.Rate", `${m.crit_rate}%`],
    ["C.DMG",  `${m.crit_damage}%`],
    ["RES",    `${m.resistance}%`],
    ["ACC",    `${m.accuracy}%`],
  ];

  // Awakening
  const essences = (m.awaken_cost || []).map((c) => {
    const icon = c.item?.icon
      ? `<img src="${SW_CDN}/items/${c.item.icon}" alt="${c.item.name}" title="${c.item.name}" onerror="this.style.display='none'">`
      : "";
    return `<div class="essence-item">${icon}<span class="essence-qty">${c.quantity}</span></div>`;
  }).join("");

  const devilmon = m.skill_ups_to_max
    ? `<div class="devilmon-item">
        <img src="${SW_CDN}/monsters/devilmon_dark.png" alt="Devilmon" title="Devilmon (skill-ups to max)">
        <span class="essence-qty">${m.skill_ups_to_max}</span>
       </div>`
    : "";

  const hasAwaken = !!(m.awaken_bonus || essences || devilmon);

  // Sources (defined here so awakenSection can reference it)
  const EL_COLOR = { Fire:"#e84040", Water:"#4090e8", Wind:"#e8c840", Light:"#f0f0f0", Dark:"#9040c8" };
  const elColor  = EL_COLOR[m.element] || "#555";

  const sourcesHTML = (m.source || []).map((s) => {
    const iconFile = SOURCE_ICON[s.id];
    if (iconFile) {
      return `<div class="source-item" title="${s.name}">
        <img src="${SW_CDN}/icons/${iconFile}" alt="${s.name}" onerror="this.style.display='none'">
        <span>${s.name}</span>
      </div>`;
    }
    if (s.id === 10) {
      return `<div class="source-item" title="${s.name}">
        <div style="width:44px;height:44px;border-radius:8px;background:${elColor};opacity:.85;flex-shrink:0"></div>
        <span>${s.name}</span>
      </div>`;
    }
    return `<div class="source-item source-item-text"><span>${s.name}</span></div>`;
  }).join("") || `<span class="source-tag" style="opacity:.5">Unknown</span>`;

  const awakenSection = `
    <div class="section-title">Awakening</div>
    <div class="awaken-box">
      ${m.awaken_bonus ? `<div class="awaken-row awaken-row-full">
        <span class="awaken-label">Bonus</span>
        <span class="awaken-value">${m.awaken_bonus}</span>
      </div>` : ""}
      <div class="awaken-split">
        ${(essences || devilmon) ? `<div class="awaken-main">
          ${essences ? `<div><span class="awaken-label" style="display:block;margin-bottom:.35rem">Essences</span><div class="essence-list">${essences}</div></div>` : ""}
          ${devilmon ? `<div><span class="awaken-label" style="display:block;margin-bottom:.35rem">Skill-ups to max</span><div class="essence-list">${devilmon}</div></div>` : ""}
        </div>` : ""}
        <div class="awaken-obtain ${(essences || devilmon) ? "awaken-obtain-border" : ""}">
          <span class="awaken-label" style="display:block;margin-bottom:.5rem">Obtain From</span>
          <div class="sources-list">${sourcesHTML}</div>
        </div>
      </div>
    </div>`;

  // Leader skill
  const ls = m.leader_skill_detail;
  const leaderHTML = ls ? `
    <div class="leader-skill-box">
      <img class="leader-icon-img"
           src="${leaderIconUrl(ls.attribute, ls.area)}"
           alt="Leader Skill"
           onerror="this.src=''; this.classList.add('hidden')">
      <div class="leader-desc">
        <strong>Increase the ${ls.attribute} of ally monsters
        ${ls.element ? `(${ls.element})` : ""}
        in ${ls.area === "General" ? "all areas" : `the ${ls.area}`}
        by ${ls.amount}%</strong>
      </div>
    </div>` : `<p style="color:var(--text-dim);font-size:.85rem">No leader skill</p>`;

  // Skills
  const skillsHTML = (m.skills_detail || []).filter(Boolean).map((sk) => {
    const meta = [
      sk.cooltime ? `CD: ${sk.cooltime} turns` : "No cooldown",
      sk.hits > 1  ? `${sk.hits} hits` : null,
      sk.passive   ? "Passive"          : null,
      sk.aoe       ? "AoE"              : null,
    ].filter(Boolean).join(" · ");

    const upgrades = (sk.upgrades || []).map((u) =>
      `<li>${u.effect.replace("{0}", u.amount)}</li>`
    ).join("");

    const effects = (sk.effects || []).filter(e => e.effect?.name).map((e) => {
      const cls    = e.effect.is_buff ? "eff-buff"
                   : e.effect.type === "Debuff" ? "eff-debuff" : "eff-neutral";
      const chance = (e.chance && e.chance < 100) ? ` ${e.chance}%` : "";
      const iconFn = EFFECT_ICON[e.effect.id];
      const icon   = iconFn
        ? `<img src="/images/buffs/${iconFn}" alt="" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:3px">`
        : "";
      return `<span class="effect-tag ${cls}">${icon}${e.effect.name}${chance}</span>`;
    }).join("");

    const formula = sk.multiplier_formula
      ? `<div class="skill-formula">⚡ ${sk.multiplier_formula}${sk.hits > 1 ? ` × ${sk.hits}` : ""}</div>`
      : "";

    return `
    <div class="skill-card">
      <div class="skill-card-header">
        ${sk.icon_filename ? `<img class="skill-icon" src="${SKILL_IMG(sk.icon_filename)}" alt="${sk.name}" onerror="this.style.display='none'">` : ""}
        <div>
          <div class="skill-name">${sk.name}${sk.passive ? ' <span class="passive-badge">Passive</span>' : ""}</div>
          <div class="skill-meta">${meta}</div>
        </div>
      </div>
      <div class="skill-desc">${sk.description || ""}</div>
      ${effects ? `<div class="skill-effects">${effects}</div>` : ""}
      ${formula}
      ${upgrades ? `<div class="skill-lvlup"><div class="skill-lvlup-title">Level-up Progress</div><ul>${upgrades}</ul></div>` : ""}
    </div>`;
  }).join("");

  // Family strip
  const family = (m._family || []).filter(f =>
    m.awaken_level > 0 ? f.awaken_level > 0 : f.awaken_level === 0
  );
  const familyHTML = family.length > 1 ? `
    <div class="family-strip">
      ${family.map(f => `
        <a class="family-card${f.id === m.id ? " family-card-active" : ""}" href="/monsters/${f.id}">
          <img src="${IMG(f.image_filename)}" alt="${f.name}" onerror="this.src='/placeholder.png'">
          <div class="family-card-info">
            <div class="family-card-name">${f.name}</div>
            <div class="family-card-el">
              <span class="badge-element ${ELEMENT_CLASS[f.element] || ""}">${f.element}</span>
            </div>
          </div>
        </a>`).join("")}
    </div>` : "";

  // Other forms — use _family (same element, different awaken level) for full chain
  const FORM_LABEL = { 0: "Unawakened form", 1: "Awakened form", 2: "2nd Awakened" };
  const sameEl = (m._family || []).filter(f => f.element === m.element && f.id !== m.id);
  const byLevel = (lvl) => sameEl.find(f => f.awaken_level === lvl);

  const mkFormCard = (f, is2A) => `
    <a class="other-form-card${is2A ? " other-form-card-2a" : ""}" href="/monsters/${f.id}">
      <img src="${IMG(f.image_filename)}" alt="${f.name}" onerror="this.src='/placeholder.png'">
      <div class="other-form-info">
        <div class="other-form-name">${f.name}</div>
        <div class="other-form-meta">
          <span class="badge-element ${ELEMENT_CLASS[f.element] || ""}">${f.element}</span>
          <span class="badge-arch">${f.archetype}</span>
          <span class="stars">${STARS(f.natural_stars)}</span>
        </div>
        <div class="other-form-label${is2A ? " other-form-label-2a" : ""}">↩ ${FORM_LABEL[f.awaken_level]}</div>
      </div>
    </a>`;

  const otherLevels = [0, 1, 2].filter(l => l !== m.awaken_level);
  const formCards = otherLevels
    .map(l => { const f = byLevel(l); return f ? mkFormCard(f, l === 2) : ""; })
    .filter(Boolean);

  const otherFormHTML = formCards.length
    ? `<div class="other-forms-row">${formCards.join("")}</div>`
    : "";

  return `
  ${familyHTML}
  <div class="mp-layout">

    <!-- LEFT: hero + stats + awakening + leader -->
    <div class="mp-left">
      <div class="mp-hero">
        <img class="mp-img" src="${IMG(m.image_filename)}" alt="${m.name}" onerror="this.src='/placeholder.png'">
        <div class="mp-hero-info">
          <h1 class="mp-name">${m.name}</h1>
          <div class="detail-badges">
            <span class="badge-element ${elClass}">${m.element}</span>
            <span class="badge-arch">${m.archetype}</span>
            ${m.awaken_level > 0 ? `<span class="badge-awaken">${awakenLabel}</span>` : ""}
            <span class="stars">${STARS(m.natural_stars)}</span>
          </div>
          ${otherFormHTML}
        </div>
      </div>

      <div class="section-title">Max Stats (Lv. max)</div>
      <div class="detail-stats">
        ${stats.map(([l, v]) => `
          <div class="stat-item">
            <div class="stat-label">${l}</div>
            <div class="stat-value">${v ?? "—"}</div>
          </div>`).join("")}
      </div>

      ${awakenSection}

      <div class="section-title">Leader Skill</div>
      ${leaderHTML}

      <div style="display:flex;gap:.5rem;align-items:stretch">
        <a class="rune-examples-btn" href="/rune-examples/${m.id}" id="rune-btn" style="flex:1">
          <img src="/Rune_Icon.webp" alt="" style="width:32px;height:32px;object-fit:contain">
          Rune Examples
        </a>
        <button id="add-rune-btn" onclick="mnOpenAddRune()" style="background:linear-gradient(135deg,#3a2a6a,#5a3a9a);border:1px solid #5a4ae8;color:#c8b8f8;border-radius:8px;padding:.8rem 1rem;font-size:.88rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">➕ Add Rune Build</button>
      </div>
      <div style="display:flex;gap:.5rem;align-items:stretch;margin-top:.5rem">
        <a class="rune-examples-btn team-comp-btn" href="/team-comp/${m.id}" id="tc-btn" style="flex:1">
          👥 Team Composition
        </a>
        <button id="add-tc-btn" onclick="mnOpenAddTc()" style="background:linear-gradient(135deg,#1a3a2a,#2a5a3a);border:1px solid #3a8a5a;color:#80d8a0;border-radius:8px;padding:.8rem 1rem;font-size:.88rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">➕ Add Team Comp</button>
      </div>
    </div>

    <!-- RIGHT: skills (aligned with top of hero) -->
    <div class="mp-right">
      <div class="section-title">Skills</div>
      <div class="skills-grid" style="grid-template-columns:1fr">
        ${skillsHTML || `<p style="color:var(--text-dim);font-size:.85rem">No skills data</p>`}
      </div>
    </div>

  </div>

  <div style="margin-top:.8rem;font-size:.75rem;color:var(--text-dim)">
    Bestiary: <a href="https://swarfarm.com/bestiary/${m.bestiary_slug}/"
      target="_blank" style="color:var(--accent)">${m.bestiary_slug}</a>
  </div>`;
}
