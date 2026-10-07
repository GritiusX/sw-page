/* Shared "Add Team Composition" modal (RTA / Defense Arena / Attack Arena).
   Used by /monsters/:id and /team-comp/:id. Expects window._pageMonster to be set
   before mnOpenAddTc(mode) is called; optional window.onTeamAdded(mode) runs after a
   successful submit. Load before the Turnstile script so the captcha widget renders. */
document.body.insertAdjacentHTML('beforeend', `
<!-- Add Team Composition modal -->
<div id="mnAddTcOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:200;align-items:center;justify-content:center" onclick="if(event.target===this)mnCloseAddTc()">
  <div style="background:#1a1d27;border:1px solid #2e3250;border-radius:14px;padding:1.8rem;width:100%;max-width:480px;position:relative">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem">
      <h3 id="mnAddTcTitle" style="font-size:1rem;color:#e8eaf6">Add Team Composition</h3>
      <button onclick="mnCloseAddTc()" style="background:none;border:none;color:#8b90b0;font-size:1.2rem;cursor:pointer;line-height:1">✕</button>
    </div>
    <div id="mnTcModeTabs" style="display:flex;gap:.35rem;margin-bottom:.9rem">
      <button type="button" data-mode="rta" onclick="mnTcSetMode('rta')" class="tc-mode-tab">RTA</button>
      <button type="button" data-mode="defense" onclick="mnTcSetMode('defense')" class="tc-mode-tab">Defense Arena</button>
      <button type="button" data-mode="attack" onclick="mnTcSetMode('attack')" class="tc-mode-tab">Attack Arena</button>
    </div>
    <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:#8b90b0;margin-bottom:.4rem">Team members</div>
    <div id="mnTcMembersBox" style="display:flex;flex-wrap:wrap;gap:.35rem;min-height:46px;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.5rem;align-items:center;margin-bottom:.3rem"></div>
    <div id="mnTcMemberCount" style="color:#8b90b0;font-size:.76rem;margin-bottom:.7rem">0 / 5 members</div>
    <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#8b90b0;margin-bottom:.3rem">Add monster to team</div>
    <input type="text" id="mnTcSearch" placeholder="Search monster name…" autocomplete="off" oninput="mnTcSearch(this.value)" style="width:100%;background:#0f1117;border:1px solid #2e3250;border-radius:8px;padding:.55rem .75rem;color:#e8eaf6;font-size:.88rem;box-sizing:border-box">
    <div id="mnTcSearchResults" style="display:none;background:#0f1117;border:1px solid #2e3250;border-radius:8px;margin-top:.25rem;max-height:180px;overflow-y:auto"></div>
    <div id="mnAddTcCaptcha" class="cf-turnstile" data-sitekey="0x4AAAAAAFCeTQKQViJOybqD" data-theme="dark" style="margin-top:.9rem;margin-bottom:.3rem"></div>
    <div id="mnAddTcMsg" style="font-size:.82rem;margin-bottom:.5rem"></div>
    <div style="display:flex;gap:.6rem;justify-content:flex-end">
      <button onclick="mnCloseAddTc()" style="background:#22263a;border:1px solid #2e3250;color:#c8cadf;border-radius:8px;padding:.5rem 1rem;cursor:pointer;font-size:.88rem">Cancel</button>
      <button id="mnAddTcSubmitBtn" onclick="mnSubmitAddTc()" style="background:linear-gradient(135deg,#2a5a3a,#3a8a5a);border:none;color:#fff;border-radius:8px;padding:.5rem 1.1rem;cursor:pointer;font-size:.88rem;font-weight:700">Submit Team</button>
    </div>
  </div>
</div>
`);

/* ══════════════════════════════════════════════════════════════
   ADD TEAM COMPOSITION MODAL
   ══════════════════════════════════════════════════════════════ */
let _mnTcMembers = [];
let _mnTcTimer   = null;
let _mnTcMode    = 'rta';
const TC_MODE_MAX = { rta: 5, defense: 3, attack: 3 };

function mnTcSetMode(mode) {
  _mnTcMode = mode;
  document.querySelectorAll('#mnTcModeTabs .tc-mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  const max=TC_MODE_MAX[mode];
  if(_mnTcMembers.length>max) _mnTcMembers=_mnTcMembers.slice(0,max);
  _mnRenderTcMembers();
}

function mnOpenAddTc(mode) {
  const m=window._pageMonster; if(!m) return;
  _mnTcMembers=[{id:m.id,name:m.name,image_filename:m.image_filename||'',element:m.element||''}];
  document.getElementById('mnAddTcTitle').textContent=`Add Team — ${m.name}`;
  document.getElementById('mnTcSearch').value='';
  document.getElementById('mnTcSearchResults').style.display='none';
  document.getElementById('mnAddTcMsg').textContent='';
  document.getElementById('mnAddTcSubmitBtn').disabled=false;
  document.getElementById('mnAddTcSubmitBtn').textContent='Submit Team';
  if(window.turnstile) window.turnstile.reset();
  mnTcSetMode(TC_MODE_MAX[mode]?mode:'rta');
  document.getElementById('mnAddTcOverlay').style.display='flex';
  setTimeout(()=>document.getElementById('mnTcSearch').focus(),50);
}
function mnCloseAddTc() {
  document.getElementById('mnAddTcOverlay').style.display='none';
  document.getElementById('mnTcSearchResults').style.display='none';
}
function _mnRenderTcMembers() {
  const box=document.getElementById('mnTcMembersBox');
  const m=window._pageMonster;
  box.innerHTML=_mnTcMembers.map((tm,i)=>`
    <div style="display:inline-flex;align-items:center;gap:.3rem;background:#1a1d27;border:1px solid #2e3250;border-radius:6px;padding:.22rem .45rem;font-size:.79rem">
      <img src="/images/monsters/${tm.image_filename}" style="width:22px;height:22px;object-fit:contain;border-radius:3px;background:#111" onerror="this.style.display='none'">
      <span>${tm.name}</span>
      ${i===0?'<span style="color:#7c6cf8;font-size:.68rem;margin-left:.1rem">(anchor)</span>':`<button onclick="_mnRemoveTcMember(${i})" style="background:none;border:none;color:#e08080;cursor:pointer;padding:0 .1rem;font-size:.85rem;line-height:1;margin-left:.1rem">✕</button>`}
    </div>`).join('')||'<span style="color:#8b90b0;font-size:.83rem">No members</span>';
  document.getElementById('mnTcMemberCount').textContent=`${_mnTcMembers.length} / ${TC_MODE_MAX[_mnTcMode]} members`;
}
function _mnRemoveTcMember(i) { _mnTcMembers.splice(i,1); _mnRenderTcMembers(); }
function mnTcSearch(q) {
  clearTimeout(_mnTcTimer);
  const res=document.getElementById('mnTcSearchResults');
  if(!q.trim()||_mnTcMembers.length>=TC_MODE_MAX[_mnTcMode]){res.style.display='none';return;}
  _mnTcTimer=setTimeout(async()=>{
    const data=await fetch('/api/monsters?q='+encodeURIComponent(q)+'&limit=8').then(r=>r.json());
    res.innerHTML=data.results.map(r=>`<div onclick="_mnAddTcMember(${r.id},'${r.name.replace(/'/g,"\\'")}','${r.image_filename||''}','${r.element||''}')" style="display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;cursor:pointer;border-bottom:1px solid #1a1d27" onmouseover="this.style.background='#1a1d27'" onmouseout="this.style.background=''">
      <img src="/images/monsters/${r.image_filename}" style="width:28px;height:28px;object-fit:contain;border-radius:3px;background:#111" onerror="this.style.display='none'">
      <span style="font-size:.88rem;color:#e8eaf6">${r.name}</span>
      <span style="font-size:.78rem;color:#8b90b0;margin-left:auto">${r.element}</span>
    </div>`).join('')||'<div style="padding:.8rem;color:#8b90b0;font-size:.85rem">No results</div>';
    res.style.display='block';
  },250);
}
function _mnAddTcMember(id,name,img,element) {
  if(_mnTcMembers.length>=TC_MODE_MAX[_mnTcMode]||_mnTcMembers.some(t=>t.id===id)) return;
  _mnTcMembers.push({id,name,image_filename:img,element});
  document.getElementById('mnTcSearch').value='';
  document.getElementById('mnTcSearchResults').style.display='none';
  _mnRenderTcMembers();
}
async function mnSubmitAddTc() {
  const m=window._pageMonster; if(!m) return;
  const token=document.querySelector('#mnAddTcCaptcha [name="cf-turnstile-response"]')?.value||'';
  const btn=document.getElementById('mnAddTcSubmitBtn');
  const msg=document.getElementById('mnAddTcMsg');
  if(!token){msg.style.color='#e08080';msg.textContent='Please complete the CAPTCHA first.';return;}
  if(_mnTcMembers.length<2){msg.style.color='#e08080';msg.textContent='Add at least one more member.';return;}
  btn.disabled=true; btn.textContent='Submitting…';
  const res=await fetch('/api/submit-team-comp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({anchor_monster_id:m.id,anchor_name:m.name,members:_mnTcMembers,mode:_mnTcMode,token})});
  if(res.ok){msg.style.color='#80c880';msg.textContent='Team submitted! Thank you 🙏';btn.textContent='Submitted!';setTimeout(mnCloseAddTc,2200);if(typeof window.onTeamAdded==='function')window.onTeamAdded(_mnTcMode);}
  else{btn.disabled=false;btn.textContent='Submit Team';const e=await res.json().catch(()=>({}));msg.style.color='#e08080';msg.textContent=e.error||'Failed — please try again.';if(window.turnstile)window.turnstile.reset();}
}

document.addEventListener('keydown',e=>{ if(e.key==='Escape') mnCloseAddTc(); });
