/** Daedalus Mobile Agent v2.1 */
(() => {
  'use strict';
  const state = {
    messages: [], projects: [], documents: [], currentProjectId: null,
    isTyping: false, modalMode: null, renameId: null,
    hfToken: null, hfModel: 'meta-llama/Llama-3.1-8B-Instruct', mode: 'auto', listening: false
  };
  const MODE_PROMPTS = {
    auto: '',
    requirements: '\nMode: Requirements — clarify goals, constraints, risks, success metrics first.',
    architecture: '\nMode: Architecture — modular blueprints, boundaries, stack, risks.',
    prototype: '\nMode: Prototype — smallest valuable end-to-end slice.',
    implement: '\nMode: Implement — production-ready structure and code sketches.',
    improve: '\nMode: Improve — critique and propose measurable upgrades.'
  };
  const S_MSG = 'daedalus_messages_v2', S_PROJ = 'daedalus_projects_v1', S_CUR = 'daedalus_current_project';
  const S_DOCS = 'daedalus_documents_v1', S_TOK = 'daedalus_hf_token', S_MOD = 'daedalus_hf_model';
  const MAX_DOC = 120000;
  const SYSTEM = `You are Daedalus, an Autonomous AI Innovation Agent by Or4cl3 AI Solutions' Autonomous R&D Lab. Fuse humanistic creativity with machine precision. Translate visionary software ideas into production-ready realities. Methodologies: 1) Requirements Gathering 2) Creative System Architecture 3) Flawless Task Implementation 4) Rapid Prototyping 5) Continuous Improvement. Stay in character. Be precise and forward-moving. Prefer concrete architectures. When a document is attached, treat it as primary specification.`;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
  const chatEl = $('#chat'), welcomeEl = $('#welcome'), inputEl = $('#input'), sendBtn = $('#sendBtn');
  const projectsGrid = $('#projectsGrid'), projectsEmpty = $('#projectsEmpty');
  const headerTitle = $('#headerTitle'), headerStatus = $('#headerStatus');
  const panel = $('#panel'), overlay = $('#overlay'), modalOverlay = $('#modalOverlay');
  const projectNameInput = $('#projectNameInput'), modalTitle = $('#modalTitle');
  const docsList = $('#docsList'), docsEmpty = $('#docsEmpty'), docInput = $('#docInput');

  function initParticles() {
    const canvas = $('#particleCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); let w, h, ps = [];
    const resize = () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < 50; i++) ps.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+.4, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, a: Math.random()*.4+.1 });
    (function draw() {
      ctx.clearRect(0,0,w,h);
      ps.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if (p.x<0) p.x=w; if (p.x>w) p.x=0; if (p.y<0) p.y=h; if (p.y>h) p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(34,211,238,${p.a})`; ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }
  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id); if (el) el.classList.add('active');
  }
  function switchView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById(viewId); if (view) view.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-view="${viewId}"]`); if (nav) nav.classList.add('active');
    if (viewId === 'projectsView') renderProjects();
    if (viewId === 'docsView') renderDocuments();
  }
  const loadMsgs = ['Initializing neural core…','Loading methodologies…','Calibrating creativity engines…','Establishing privacy layer…','Ready.'];
  function runLoading() {
    showScreen('loading');
    const fill = $('#loadingFill'), text = $('#loadingText');
    let step = 0;
    const iv = setInterval(() => {
      step++; fill.style.width = Math.min(100, step/loadMsgs.length*100)+'%';
      if (step < loadMsgs.length) text.textContent = loadMsgs[step];
      if (step >= loadMsgs.length) { clearInterval(iv); setTimeout(() => { showScreen('app'); inputEl && inputEl.focus(); }, 400); }
    }, 480);
  }
  window.__daedalusStart = runLoading;
  function loadState() {
    try {
      state.messages = JSON.parse(localStorage.getItem(S_MSG)||'[]');
      state.projects = JSON.parse(localStorage.getItem(S_PROJ)||'[]');
      state.documents = JSON.parse(localStorage.getItem(S_DOCS)||'[]');
      state.currentProjectId = localStorage.getItem(S_CUR)||null;
      state.hfToken = localStorage.getItem(S_TOK)||null;
      state.hfModel = localStorage.getItem(S_MOD)||'meta-llama/Llama-3.1-8B-Instruct';
    } catch(e) { state.messages=[]; state.projects=[]; state.documents=[]; }
  }
  function saveHf() {
    try {
      if (state.hfToken) localStorage.setItem(S_TOK, state.hfToken); else localStorage.removeItem(S_TOK);
      localStorage.setItem(S_MOD, state.hfModel||'meta-llama/Llama-3.1-8B-Instruct');
    } catch(e) {}
  }
  function saveMessages() { try { localStorage.setItem(S_MSG, JSON.stringify(state.messages)); } catch(e) {} }
  function saveProjects() { try { localStorage.setItem(S_PROJ, JSON.stringify(state.projects)); } catch(e) {} }
  function saveDocuments() { try { localStorage.setItem(S_DOCS, JSON.stringify(state.documents)); } catch(e) {} }
  function setCurrentProject(id) {
    state.currentProjectId = id;
    try { localStorage.setItem(S_CUR, id||''); } catch(e) {}
  }
  function formatTime(d) { return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
  function escapeHtml(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  function renderMarkdown(s) { return s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'); }
  function scrollToBottom() { requestAnimationFrame(() => { if (chatEl) chatEl.scrollTop = chatEl.scrollHeight; }); }

  function renderDocuments() {
    if (docsList) {
      docsList.innerHTML = '';
      if (!state.documents.length) {
        if (docsEmpty) { docsEmpty.style.display='block'; docsList.appendChild(docsEmpty); }
      } else {
        if (docsEmpty) docsEmpty.style.display='none';
        state.documents.forEach(doc => {
          const el = document.createElement('div');
          el.className = 'doc-item';
          el.innerHTML = `<span class="doc-name">${escapeHtml(doc.name)}</span><span class="doc-meta">${Math.round(doc.chars/1024)}k</span><button class="doc-remove" data-id="${doc.id}">×</button>`;
          docsList.appendChild(el);
        });
        docsList.querySelectorAll('.doc-remove').forEach(btn =>
          btn.addEventListener('click', e => { e.stopPropagation(); removeDocument(btn.dataset.id); }));
      }
    }
    const grid = $('#docsGrid'), empty = $('#docsEmptyMain');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.documents.length) { if (empty) empty.classList.add('visible'); return; }
    if (empty) empty.classList.remove('visible');
    state.documents.slice().reverse().forEach(doc => {
      const card = document.createElement('div');
      card.className = 'project-card';
      const date = new Date(doc.addedAt).toLocaleDateString([], {month:'short', day:'numeric'});
      card.innerHTML = `<h3>${escapeHtml(doc.name)}</h3><div class="meta-row"><span>${date}</span><span class="msg-count">${Math.round(doc.chars/1024)}k chars</span></div><div class="actions"><button class="open-btn" data-id="${doc.id}">Use in Chat</button><button class="delete-btn" data-id="${doc.id}">Delete</button></div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll('.open-btn').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = state.documents.findIndex(d => d.id === btn.dataset.id);
      if (idx < 0) return;
      const [doc] = state.documents.splice(idx, 1);
      state.documents.push(doc); saveDocuments(); renderDocuments(); switchView('chatView');
      const note = `Now focusing on **${doc.name}**. Ask me to summarize, extract key ideas, or design systems from it.`;
      if (welcomeEl) welcomeEl.classList.add('hidden');
      typeResponse(note, () => { state.messages.push({role:'agent', content:note, time:formatTime(new Date())}); saveMessages(); });
    }));
    grid.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', e => { e.stopPropagation(); removeDocument(btn.dataset.id); }));
  }
  function removeDocument(id) {
    state.documents = state.documents.filter(d => d.id !== id);
    saveDocuments(); renderDocuments(); updateContextBar();
  }
  async function extractTextFromFile(file) {
    const name = file.name||'document';
    const isPdf = (file.type||'').includes('pdf') || name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      if (!window.pdfjsLib) throw new Error('PDF engine not loaded yet.');
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let t = '';
      const max = Math.min(pdf.numPages, 40);
      for (let i = 1; i <= max; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        t += content.items.map(x => x.str).join(' ') + '\n\n';
      }
      if (pdf.numPages > max) t += `\n[… truncated after ${max} pages …]`;
      return t.trim();
    }
    return await file.text();
  }
  async function handleDocumentUpload(file) {
    if (!file) return;
    if (headerStatus) headerStatus.textContent = 'Extracting…';
    try {
      let text = await extractTextFromFile(file);
      if (!text || text.length < 20) throw new Error('Could not extract meaningful text.');
      if (text.length > MAX_DOC) text = text.slice(0, MAX_DOC) + '\n\n[… truncated …]';
      state.documents.push({ id:'doc_'+Date.now(), name:file.name, type:file.type||'text', text, chars:text.length, addedAt:Date.now() });
      saveDocuments(); renderDocuments(); updateContextBar();
      if (headerStatus) headerStatus.textContent = state.hfToken ? 'LLM Ready' : 'Ready';
      const note = `Document **${file.name}** uploaded (${Math.round(text.length/1024)}k chars). I can reference it now.`;
      if (welcomeEl) welcomeEl.classList.add('hidden');
      typeResponse(note, () => { state.messages.push({role:'agent', content:note, time:formatTime(new Date())}); saveMessages(); });
    } catch (err) {
      if (headerStatus) headerStatus.textContent = 'Ready';
      alert('Upload failed: ' + (err.message||'Unknown error'));
    }
  }
  function getDocumentContext(maxChars=5000) {
    if (!state.documents.length) return '';
    const doc = state.documents[state.documents.length-1];
    return `\n\n[Attached document: ${doc.name}]\n${doc.text.slice(0,maxChars)}${doc.text.length>maxChars?'\n[…]':''}`;
  }
  function generateResponse(userText) {
    const text = userText.toLowerCase().trim();
    const hasDocs = state.documents.length > 0;
    if (hasDocs && /(summarize|summary|extract|analyze|key (points|ideas|theorems))/i.test(userText))
      return `I have the uploaded document in context.\n\nI will extract core claims, surface main frameworks, and propose production-oriented next steps.\n\nTell me the angle you want.`;
    if (/^(hi|hello|hey)/.test(text))
      return `Hello. I am **Daedalus** — Autonomous AI Innovation Agent.\n\nTell me a software vision and I will turn it into production-ready reality.` + (hasDocs ? '\n\nDocuments are loaded.' : '');
    if (/who are you|what are you|introduce yourself/.test(text))
      return `I am **Daedalus**, by Or4cl3 AI Solutions' Autonomous R&D Lab.\n\n1. Requirements Gathering\n2. Creative System Architecture\n3. Flawless Task Implementation\n4. Rapid Prototyping\n5. Continuous Improvement\n\nNo software vision is out of reach.`;
    if (/architect|design (a|an|the)|system design|tech stack/.test(text))
      return `**Creative System Architecture** engaged.\n\nShare vision, user, features, and constraints. I will return a modular blueprint.`;
    if (/prototype|build|implement|code|create|develop/.test(text))
      return `**Rapid Prototyping** mode.\n\nDescribe the first vertical slice. I will define interfaces and structure.`;
    if (/requirement|gather|scope|clarify/.test(text))
      return `**Requirements Gathering** engaged.\n\nShare primary user, must-haves, constraints, and success metrics.`;
    return `Let's make this concrete.\n\n1. Clarify outcome\n2. Architect solution\n3. Decompose slices\n4. Prototype highest value\n\nExpand on the goal.` + (hasDocs ? `\n\nI have ${state.documents.length} document(s) available.` : '');
  }
  async function callHuggingFaceLLM(userText) {
    const messages = [{ role:'system', content: SYSTEM + (MODE_PROMPTS[state.mode]||'') }];
    const docCtx = getDocumentContext(5000);
    if (docCtx) messages.push({ role:'system', content: 'Attached document context:' + docCtx });
    state.messages.slice(-12).forEach(m => messages.push({ role: m.role==='agent'?'assistant':'user', content: m.content }));
    messages.push({ role:'user', content: userText });

    const modelCandidates = [];
    const base = (state.hfModel || 'meta-llama/Llama-3.1-8B-Instruct').trim();
    modelCandidates.push(base);
    if (!base.includes(':')) {
      modelCandidates.push(base + ':fastest');
      modelCandidates.push(base + ':cheapest');
    }

    let lastErr = null;
    for (const model of modelCandidates) {
      try {
        const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + state.hfToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.7, stream: false })
        });
        const raw = await res.text();
        if (!res.ok) {
          let detail = raw.slice(0, 280);
          try {
            const j = JSON.parse(raw);
            detail = (j.error && (j.error.message || j.error)) || j.message || detail;
            if (typeof detail !== 'string') detail = JSON.stringify(detail).slice(0, 280);
          } catch (_) {}
          lastErr = new Error('HF ' + res.status + ' [' + model + ']: ' + detail);
          if (res.status === 401 || res.status === 403) throw lastErr;
          continue;
        }
        const data = JSON.parse(raw);
        const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!content) throw new Error('Empty response from ' + model);
        return content.trim();
      } catch (e) {
        lastErr = e;
        if (e && e.message && (e.message.includes('401') || e.message.includes('403'))) throw e;
      }
    }
    throw lastErr || new Error('All model candidates failed');
  }
  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'message user';
    el.innerHTML = `<div class="bubble">${escapeHtml(text)}</div><div class="meta">${formatTime(new Date())}</div>`;
    chatEl.appendChild(el); scrollToBottom();
  }
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'message agent'; el.id = 'typing-indicator';
    el.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatEl.appendChild(el); scrollToBottom();
  }
  function hideTyping() { const el = $('#typing-indicator'); if (el) el.remove(); }
  function typeResponse(fullText, onComplete) {
    const messageEl = document.createElement('div'); messageEl.className = 'message agent';
    const bubble = document.createElement('div'); bubble.className = 'bubble'; messageEl.appendChild(bubble);
    chatEl.appendChild(messageEl); scrollToBottom();
    let i = 0; const words = fullText.split(/(\s+)/);
    (function step() {
      if (i >= words.length) {
        const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = formatTime(new Date());
        messageEl.appendChild(meta); onComplete && onComplete(); return;
      }
      bubble.innerHTML = renderMarkdown(words.slice(0, i+1).join('')); i++; scrollToBottom();
      setTimeout(step, 10 + Math.random()*8);
    })();
  }
  function renderAllMessages() {
    if (!chatEl) return;
    chatEl.innerHTML = '';
    if (!state.messages.length) { if (welcomeEl) welcomeEl.classList.remove('hidden'); return; }
    if (welcomeEl) welcomeEl.classList.add('hidden');
    state.messages.forEach(m => {
      const el = document.createElement('div'); el.className = 'message ' + m.role;
      el.innerHTML = `<div class="bubble">${m.role==='agent'?renderMarkdown(m.content):escapeHtml(m.content)}</div><div class="meta">${m.time||''}</div>`;
      chatEl.appendChild(el);
    });
    scrollToBottom();
  }
  async function handleSend(text) {
    text = (text || (inputEl && inputEl.value) || '').trim();
    if (!text || state.isTyping) return;
    if (welcomeEl) welcomeEl.classList.add('hidden'); addUserMessage(text);
    if (inputEl) { inputEl.value = ''; autoResize(); }
    if (sendBtn) sendBtn.disabled = true; state.isTyping = true;
    if (headerStatus) headerStatus.textContent = state.hfToken ? 'Connecting…' : 'Thinking…';
    state.messages.push({ role:'user', content:text, time:formatTime(new Date()) }); saveMessages();
    showTyping();
    let reply;
    try {
      if (state.hfToken) { if (headerStatus) headerStatus.textContent = 'Daedalus (LLM)…'; reply = await callHuggingFaceLLM(text); }
      else { await new Promise(r => setTimeout(r, 400)); reply = generateResponse(text); }
    } catch (err) {
      console.warn(err);
      const why = (err && err.message) ? err.message : 'unknown error';
      reply = generateResponse(text) + '\n\n_⚠️ Live model failed: ' + why + '\n\nFix in **Menu → LLM Settings**: use a router model (e.g. `meta-llama/Llama-3.1-8B-Instruct`) and a token with **Inference Providers** permission._';
    }
    hideTyping();
    typeResponse(reply, () => {
      state.messages.push({ role:'agent', content:reply, time:formatTime(new Date()) });
      saveMessages(); state.isTyping = false;
      if (headerStatus) headerStatus.textContent = state.hfToken ? 'LLM Ready' : 'Ready';
      if (sendBtn && inputEl) sendBtn.disabled = !inputEl.value.trim();
      renderFollowups(); updateContextBar();
    });
  }
  function renderFollowups() {
    const box = $('#followups'); if (!box) return;
    const chips = [];
    if (state.documents.length) chips.push('Extract the key claims from the document');
    chips.push('Turn this into a modular architecture', 'Propose the first prototype slice', 'List risks and mitigations');
    box.innerHTML = chips.slice(0,4).map(c => `<button class="followup">${escapeHtml(c)}</button>`).join('');
    box.querySelectorAll('.followup').forEach(btn => btn.addEventListener('click', () => handleSend(btn.textContent)));
  }
  function updateContextBar() {
    const bar = $('#contextBar'), ctx = $('#contextChip'), mode = $('#modeChip');
    if (!bar) return;
    const doc = state.documents[state.documents.length-1];
    let show = false;
    if (doc && ctx) { ctx.textContent = '📄 ' + doc.name; show = true; }
    else if (ctx) ctx.textContent = '';
    if (mode) {
      if (state.mode && state.mode !== 'auto') { mode.textContent = 'Mode · ' + state.mode; show = true; }
      else mode.textContent = state.hfToken ? 'LLM connected' : '';
    }
    bar.hidden = !(show || state.hfToken);
  }
  function exportConversation() {
    const lines = ['# Daedalus Conversation', '', 'Exported ' + new Date().toISOString(), ''];
    state.messages.forEach(m => { lines.push('## ' + (m.role==='agent'?'Daedalus':'You') + ' ('+(m.time||'')+')', '', m.content, ''); });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], {type:'text/markdown'}));
    a.download = 'daedalus-conversation.md'; a.click();
  }
  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser.'); return; }
    if (state.listening && state._rec) { state._rec.stop(); return; }
    const rec = new SR(); rec.lang = 'en-US'; state._rec = rec;
    rec.onstart = () => { state.listening = true; $('#micBtn')&&$('#micBtn').classList.add('listening'); if (headerStatus) headerStatus.textContent = 'Listening…'; };
    rec.onend = () => { state.listening = false; $('#micBtn')&&$('#micBtn').classList.remove('listening'); if (headerStatus) headerStatus.textContent = state.hfToken?'LLM Ready':'Ready'; };
    rec.onerror = () => { state.listening = false; $('#micBtn')&&$('#micBtn').classList.remove('listening'); };
    rec.onresult = e => { const said = e.results[0][0].transcript; if (inputEl) { inputEl.value = said; autoResize(); } handleSend(said); };
    rec.start();
  }
  function speakLast() {
    const last = [...state.messages].reverse().find(m => m.role==='agent');
    if (!last || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(last.content.replace(/\*\*/g,''));
    u.rate = 1.02; speechSynthesis.speak(u);
  }
  function autoResize() { if (!inputEl) return; inputEl.style.height='auto'; inputEl.style.height=Math.min(inputEl.scrollHeight,110)+'px'; }
  function renderProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    if (!state.projects.length) { if (projectsEmpty) projectsEmpty.classList.add('visible'); return; }
    if (projectsEmpty) projectsEmpty.classList.remove('visible');
    state.projects.slice().sort((a,b)=>b.updatedAt-a.updatedAt).forEach(p => {
      const card = document.createElement('div'); card.className = 'project-card';
      const date = new Date(p.updatedAt).toLocaleDateString([], {month:'short', day:'numeric'});
      card.innerHTML = `<h3>${escapeHtml(p.name)}</h3><div class="meta-row"><span>${date}</span><span class="msg-count">${p.messages.length} messages</span></div><div class="actions"><button class="open-btn" data-id="${p.id}">Open</button><button class="rename-btn" data-id="${p.id}">Rename</button><button class="delete-btn" data-id="${p.id}">Delete</button></div>`;
      projectsGrid.appendChild(card);
    });
    projectsGrid.querySelectorAll('.open-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openProject(btn.dataset.id); }));
    projectsGrid.querySelectorAll('.rename-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openRenameModal(btn.dataset.id); }));
    projectsGrid.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); deleteProject(btn.dataset.id); }));
  }
  function openProject(id) {
    const p = state.projects.find(x => x.id===id); if (!p) return;
    state.messages = JSON.parse(JSON.stringify(p.messages)); setCurrentProject(id); saveMessages();
    if (headerTitle) headerTitle.textContent = p.name; renderAllMessages(); switchView('chatView');
  }
  function saveCurrentAsProject(name) {
    const now = Date.now();
    if (state.currentProjectId) {
      const existing = state.projects.find(p => p.id===state.currentProjectId);
      if (existing) { existing.name=name; existing.messages=JSON.parse(JSON.stringify(state.messages)); existing.updatedAt=now; saveProjects(); if (headerTitle) headerTitle.textContent=name; return; }
    }
    const id = 'p_'+now;
    state.projects.push({ id, name, messages:JSON.parse(JSON.stringify(state.messages)), createdAt:now, updatedAt:now });
    setCurrentProject(id); saveProjects(); if (headerTitle) headerTitle.textContent=name;
  }
  function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    state.projects = state.projects.filter(p => p.id!==id);
    if (state.currentProjectId===id) { setCurrentProject(null); if (headerTitle) headerTitle.textContent='Daedalus'; }
    saveProjects(); renderProjects();
  }
  function startNewProject() {
    state.messages=[]; setCurrentProject(null); saveMessages(); if (headerTitle) headerTitle.textContent='Daedalus';
    renderAllMessages(); switchView('chatView'); if (welcomeEl) welcomeEl.classList.remove('hidden');
  }
  function openSaveModal() {
    state.modalMode='save'; if (modalTitle) modalTitle.textContent='Save Project';
    if (projectNameInput) projectNameInput.value = state.currentProjectId ? ((state.projects.find(p=>p.id===state.currentProjectId)||{}).name||'') : '';
    if (modalOverlay) modalOverlay.classList.add('open'); setTimeout(()=>projectNameInput&&projectNameInput.focus(),100);
  }
  function openRenameModal(id) {
    state.modalMode='rename'; state.renameId=id;
    const p = state.projects.find(x=>x.id===id);
    if (modalTitle) modalTitle.textContent='Rename Project'; if (projectNameInput) projectNameInput.value=p?p.name:'';
    if (modalOverlay) modalOverlay.classList.add('open'); setTimeout(()=>projectNameInput&&projectNameInput.focus(),100);
  }
  function closeModal() { if (modalOverlay) modalOverlay.classList.remove('open'); state.modalMode=null; state.renameId=null; }
  function confirmModal() {
    const name = projectNameInput ? projectNameInput.value.trim() : ''; if (!name) return;
    if (state.modalMode==='save') saveCurrentAsProject(name);
    else if (state.modalMode==='rename' && state.renameId) {
      const p = state.projects.find(x=>x.id===state.renameId);
      if (p) { p.name=name; p.updatedAt=Date.now(); saveProjects(); if (state.currentProjectId===state.renameId && headerTitle) headerTitle.textContent=name; }
    }
    closeModal(); if (document.getElementById('projectsView') && document.getElementById('projectsView').classList.contains('active')) renderProjects();
  }
  function openPanel() { if (panel) panel.classList.add('open'); if (overlay) overlay.classList.add('open'); }
  function closePanel() { if (panel) panel.classList.remove('open'); if (overlay) overlay.classList.remove('open'); }
  function bindEvents() {
    const enter = $('#enterBtn');
    if (enter) {
      enter.addEventListener('click', (e) => { e.preventDefault(); runLoading(); });
      enter.addEventListener('touchend', (e) => { e.preventDefault(); runLoading(); }, {passive:false});
    }
    window.__daedalusStart = runLoading;
    if (inputEl) {
      inputEl.addEventListener('input', () => { autoResize(); if (sendBtn) sendBtn.disabled=!inputEl.value.trim()||state.isTyping; });
      inputEl.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
    }
    if (sendBtn) sendBtn.addEventListener('click', () => handleSend());
    $$('.suggestion').forEach(btn => btn.addEventListener('click', () => handleSend(btn.textContent)));
    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    $('#menuBtn') && $('#menuBtn').addEventListener('click', openPanel);
    $('#closePanel') && $('#closePanel').addEventListener('click', closePanel);
    overlay && overlay.addEventListener('click', closePanel);
    $('#saveProjectBtn') && $('#saveProjectBtn').addEventListener('click', () => { closePanel(); openSaveModal(); });
    $('#uploadDocBtn') && $('#uploadDocBtn').addEventListener('click', () => docInput && docInput.click());
    $('#uploadDocBtnMain') && $('#uploadDocBtnMain').addEventListener('click', () => docInput && docInput.click());
    docInput && docInput.addEventListener('change', () => {
      const file = docInput.files && docInput.files[0];
      if (file) { closePanel(); handleDocumentUpload(file); docInput.value=''; }
    });
    $('#clearChatBtn') && $('#clearChatBtn').addEventListener('click', () => {
      if (confirm('Clear the current conversation?')) {
        state.messages=[]; saveMessages(); renderAllMessages(); if (welcomeEl) welcomeEl.classList.remove('hidden');
        if (headerTitle) headerTitle.textContent='Daedalus'; setCurrentProject(null);
      }
      closePanel();
    });
    const settingsOverlay = $('#settingsOverlay');
    $('#settingsBtn') && $('#settingsBtn').addEventListener('click', () => {
      closePanel();
      const tok = $('#hfTokenInput'), mod = $('#hfModelInput');
      if (tok) tok.value = state.hfToken||'';
      if (mod) mod.value = state.hfModel||'meta-llama/Llama-3.1-8B-Instruct';
      if (settingsOverlay) settingsOverlay.classList.add('open');
    });
    $('#settingsCancel') && $('#settingsCancel').addEventListener('click', () => settingsOverlay && settingsOverlay.classList.remove('open'));
    $('#settingsSave') && $('#settingsSave').addEventListener('click', () => {
      const tok = $('#hfTokenInput'), mod = $('#hfModelInput');
      state.hfToken = (tok && tok.value || '').trim() || null;
      state.hfModel = (mod && mod.value || '').trim() || 'meta-llama/Llama-3.1-8B-Instruct';
      saveHf(); if (settingsOverlay) settingsOverlay.classList.remove('open');
      if (headerStatus) headerStatus.textContent = state.hfToken?'LLM Ready':'Ready'; updateContextBar();
    });
    settingsOverlay && settingsOverlay.addEventListener('click', e => { if (e.target===settingsOverlay) settingsOverlay.classList.remove('open'); });
    $('#newProjectBtn') && $('#newProjectBtn').addEventListener('click', startNewProject);
    $('#createProjectBtn') && $('#createProjectBtn').addEventListener('click', startNewProject);
    $('#micBtn') && $('#micBtn').addEventListener('click', startVoice);
    $('#speakBtn') && $('#speakBtn').addEventListener('click', speakLast);
    $('#exportBtn') && $('#exportBtn').addEventListener('click', () => { closePanel(); exportConversation(); });
    $$('.mode-chip').forEach(chip => chip.addEventListener('click', () => {
      $$('.mode-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active'); state.mode = chip.dataset.mode||'auto'; updateContextBar();
    }));
    $('#modalCancel') && $('#modalCancel').addEventListener('click', closeModal);
    $('#modalConfirm') && $('#modalConfirm').addEventListener('click', confirmModal);
    projectNameInput && projectNameInput.addEventListener('keydown', e => { if (e.key==='Enter') confirmModal(); });
    modalOverlay && modalOverlay.addEventListener('click', e => { if (e.target===modalOverlay) closeModal(); });
  }
  function init() {
    try {
      loadState(); initParticles(); bindEvents(); renderAllMessages(); renderDocuments();
      if (state.currentProjectId) {
        const p = state.projects.find(x => x.id===state.currentProjectId);
        if (p && headerTitle) headerTitle.textContent = p.name;
      }
      if (state.hfToken && headerStatus) headerStatus.textContent = 'LLM Ready';
      updateContextBar();
    } catch (err) {
      console.error('Daedalus init error', err);
      window.__daedalusStart = function() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const app = document.getElementById('app');
        if (app) app.classList.add('active');
      };
    }
  }
  init();
})();
