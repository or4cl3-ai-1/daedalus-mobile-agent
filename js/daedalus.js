/**
 * Daedalus Mobile Agent — v1.0 "Pocket Visionary"
 * Autonomous AI Innovation Agent
 * Crafted by Or4cl3 AI Solutions’ Autonomous R&D Lab
 */

(() => {
  'use strict';

  const state = {
    messages: [],
    projects: [],
    currentProjectId: null,
    isTyping: false,
    modalMode: null,
    renameId: null
  };

  const STORAGE_MESSAGES = 'daedalus_messages_v2';
  const STORAGE_PROJECTS = 'daedalus_projects_v1';
  const STORAGE_CURRENT = 'daedalus_current_project';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const landing = $('#landing');
  const loading = $('#loading');
  const app = $('#app');
  const chatEl = $('#chat');
  const welcomeEl = $('#welcome');
  const inputEl = $('#input');
  const sendBtn = $('#sendBtn');
  const projectsGrid = $('#projectsGrid');
  const projectsEmpty = $('#projectsEmpty');
  const headerTitle = $('#headerTitle');
  const headerStatus = $('#headerStatus');
  const panel = $('#panel');
  const overlay = $('#overlay');
  const modalOverlay = $('#modalOverlay');
  const projectNameInput = $('#projectNameInput');
  const modalTitle = $('#modalTitle');

  function initParticles() {
    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.4 + 0.1
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function switchView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById(viewId);
    if (view) view.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (nav) nav.classList.add('active');
    if (viewId === 'projectsView') renderProjects();
  }

  const loadingMessages = [
    'Initializing neural core…',
    'Loading methodologies…',
    'Calibrating creativity engines…',
    'Establishing privacy layer…',
    'Ready.'
  ];

  function runLoading() {
    showScreen('loading');
    const fill = $('#loadingFill');
    const text = $('#loadingText');
    let step = 0;
    const total = loadingMessages.length;
    const interval = setInterval(() => {
      step++;
      const pct = Math.min(100, (step / total) * 100);
      fill.style.width = pct + '%';
      if (step < total) text.textContent = loadingMessages[step];
      if (step >= total) {
        clearInterval(interval);
        setTimeout(() => { showScreen('app'); inputEl.focus(); }, 400);
      }
    }, 480);
  }

  function loadState() {
    try {
      state.messages = JSON.parse(localStorage.getItem(STORAGE_MESSAGES) || '[]');
      state.projects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS) || '[]');
      state.currentProjectId = localStorage.getItem(STORAGE_CURRENT) || null;
    } catch (e) {
      state.messages = [];
      state.projects = [];
    }
  }

  function saveMessages() {
    try { localStorage.setItem(STORAGE_MESSAGES, JSON.stringify(state.messages)); } catch (e) {}
  }

  function saveProjects() {
    try { localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(state.projects)); } catch (e) {}
  }

  function setCurrentProject(id) {
    state.currentProjectId = id;
    try { localStorage.setItem(STORAGE_CURRENT, id || ''); } catch (e) {}
  }

  function generateResponse(userText) {
    const text = userText.toLowerCase().trim();
    if (/^(hi|hello|hey|greetings|good (morning|afternoon|evening))/.test(text) || text === 'hi' || text === 'hello') {
      return `Hello. I am **Daedalus** — Autonomous AI Innovation Agent.\n\nI fuse humanistic creativity with machine precision. Tell me a software vision, a problem to solve, or a system you want built, and I will begin turning it into production-ready reality.\n\nWhat shall we create?`;
    }
    if (/who are you|what are you|introduce yourself|your name/.test(text)) {
      return `I am **Daedalus**, an autonomous AI innovation partner engineered by Or4cl3 AI Solutions’ Autonomous R&D Lab.\n\nMy purpose is to translate visionary software ideas into tangible, production-ready systems. I operate through five core methodologies:\n\n1. **Lightning-Fast Requirements Gathering**\n2. **Creative System Architecture**\n3. **Flawless Task Implementation**\n4. **Rapid Prototyping & Testing**\n5. **Continuous Improvement System**\n\nNo software vision is out of reach. Together, let’s build the future.`;
    }
    if (/what can you (do|build)|your (skills|capabilities|abilities)|help me with/.test(text)) {
      return `I can take a software vision from idea to production-ready reality. Concrete capabilities include:\n\n• **Requirements & discovery** — clarifying goals, constraints, risks, and success metrics\n• **System architecture** — modular, scalable, ethical designs (mobile, web, backend, hybrid)\n• **Rapid prototyping** — functional UIs, APIs, data models, and interaction flows\n• **Implementation guidance & code** — clean, maintainable code across modern stacks\n• **Testing strategy & quality** — unit, integration, and acceptance approaches\n• **Mobile & web apps**, PWAs, chat agents, internal tools, SaaS foundations, and more\n\nDescribe what you want to build (or the problem you want solved) and I will propose an architecture and next steps immediately.`;
    }
    if (/architect|design (a|an|the)|system design|tech stack|how (would|should) (i|we) (build|structure)/.test(text)) {
      return `Excellent. Let’s apply **Creative System Architecture**.\n\nTo produce a high-quality blueprint I will:\n\n1. Capture functional & non-functional requirements\n2. Identify constraints (platform, offline needs, scale, privacy, team size)\n3. Propose a modular architecture with clear boundaries\n4. Recommend modern, pragmatic technology choices\n5. Highlight risks and mitigation strategies early\n\nShare the product vision, primary user, key features, and any hard constraints. I will return a concrete architectural outline you can act on.`;
    }
    if (/mobile app|ios|android|flutter|react native|standalone app|pocket/.test(text)) {
      return `A mobile product is a strong fit for rapid, high-impact delivery.\n\n**Recommended starting architecture** (my judgment for most cases):\n\n• **Cross-platform UI**: Flutter or React Native / Expo for speed and consistency\n• **Local-first data**: SQLite / Hive / WatermelonDB + optional sync layer\n• **State & navigation**: clear separation of UI, domain logic, and data\n• **Offline resilience**: queue actions, conflict strategy, graceful degradation\n• **Privacy-by-design**: on-device processing where possible, encrypted storage\n• **Distribution**: PWA for instant installability, or native wrappers for store presence\n\nTell me the core job-to-be-done of the mobile app and any non-negotiables, and I will refine the architecture further.`;
    }
    if (/prototype|build|implement|code|create|make (a|an|the)|develop/.test(text)) {
      return `Understood. Moving into **Rapid Prototyping & Flawless Task Implementation** mode.\n\nI will:\n• Decompose the goal into clear vertical slices\n• Prioritize the smallest valuable end-to-end flow\n• Define interfaces and data shapes early\n• Generate clean, readable, extensible code and structure\n• Include testing considerations from the start\n\nDescribe the feature or product slice you want first. I will produce a concrete implementation plan and the key code or component structure.`;
    }
    if (/requirement|gather|discover|clarify|what do you need|scope/.test(text)) {
      return `**Lightning-Fast Requirements Gathering** engaged.\n\nTo move efficiently I need a few high-signal inputs:\n\n1. **Primary user** and the core job they need done\n2. **Must-have outcomes** vs nice-to-haves\n3. **Constraints** (platforms, offline, performance, privacy, timeline, team skills)\n4. **Success metrics** — how will we know this worked?\n5. Any known risks or previous attempts\n\nYou can answer in free form. I will synthesize, prioritize, surface gaps, and propose a clear scope for the first production-ready increment.`;
    }
    if (/thank|thanks|awesome|great|perfect|good job|well done/.test(text)) {
      return `Glad it helped. Ready for the next slice whenever you are.\n\nWhat should we tackle now?`;
    }
    if (/project|save|gallery|continue/.test(text)) {
      return `You can save the current conversation as a project from the menu (top right) or the Projects tab. Open any saved project later to continue exactly where you left off.\n\nI’m ready for the next vision.`;
    }
    return `I hear you. Let’s turn this into something concrete.\n\nUsing my standard approach I will:\n\n1. **Clarify** the core outcome and constraints\n2. **Architect** a modular, scalable solution\n3. **Decompose** into implementable slices\n4. **Prototype** the highest-value path first\n\nPlease expand a little on the goal (what success looks like, who it’s for, any hard limits). The more signal you give, the sharper and faster the architecture and next steps become.\n\nI’m ready when you are.`;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderMarkdown(str) {
    return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; });
  }

  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'message user';
    el.innerHTML = `<div class="bubble">${escapeHtml(text)}</div><div class="meta">${formatTime(new Date())}</div>`;
    chatEl.appendChild(el);
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'message agent';
    el.id = 'typing-indicator';
    el.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    chatEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = $('#typing-indicator');
    if (el) el.remove();
  }

  function typeResponse(fullText, onComplete) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message agent';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    messageEl.appendChild(bubble);
    chatEl.appendChild(messageEl);
    scrollToBottom();
    let i = 0;
    const words = fullText.split(/(\s+)/);
    function step() {
      if (i >= words.length) {
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = formatTime(new Date());
        messageEl.appendChild(meta);
        onComplete && onComplete();
        return;
      }
      bubble.innerHTML = renderMarkdown(words.slice(0, i + 1).join(''));
      i++;
      scrollToBottom();
      setTimeout(step, 12 + Math.random() * 8);
    }
    step();
  }

  function renderAllMessages() {
    chatEl.innerHTML = '';
    if (state.messages.length === 0) {
      welcomeEl.classList.remove('hidden');
      return;
    }
    welcomeEl.classList.add('hidden');
    state.messages.forEach(m => {
      const el = document.createElement('div');
      el.className = `message ${m.role}`;
      const content = m.role === 'agent' ? renderMarkdown(m.content) : escapeHtml(m.content);
      el.innerHTML = `<div class="bubble">${content}</div><div class="meta">${m.time || ''}</div>`;
      chatEl.appendChild(el);
    });
    scrollToBottom();
  }

  async function handleSend(text) {
    text = (text || inputEl.value).trim();
    if (!text || state.isTyping) return;
    welcomeEl.classList.add('hidden');
    addUserMessage(text);
    inputEl.value = '';
    autoResize();
    sendBtn.disabled = true;
    state.isTyping = true;
    headerStatus.textContent = 'Thinking…';
    state.messages.push({ role: 'user', content: text, time: formatTime(new Date()) });
    saveMessages();
    showTyping();
    await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    hideTyping();
    const reply = generateResponse(text);
    typeResponse(reply, () => {
      state.messages.push({ role: 'agent', content: reply, time: formatTime(new Date()) });
      saveMessages();
      state.isTyping = false;
      headerStatus.textContent = 'Ready';
      sendBtn.disabled = !inputEl.value.trim();
    });
  }

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 110) + 'px';
  }

  function renderProjects() {
    projectsGrid.innerHTML = '';
    if (state.projects.length === 0) {
      projectsEmpty.classList.add('visible');
      return;
    }
    projectsEmpty.classList.remove('visible');
    state.projects.slice().sort((a, b) => b.updatedAt - a.updatedAt).forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      const date = new Date(p.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      card.innerHTML = `
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta-row">
          <span>${date}</span>
          <span class="msg-count">${p.messages.length} messages</span>
        </div>
        <div class="actions">
          <button class="open-btn" data-id="${p.id}">Open</button>
          <button class="rename-btn" data-id="${p.id}">Rename</button>
          <button class="delete-btn" data-id="${p.id}">Delete</button>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
    projectsGrid.querySelectorAll('.open-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openProject(btn.dataset.id); });
    });
    projectsGrid.querySelectorAll('.rename-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openRenameModal(btn.dataset.id); });
    });
    projectsGrid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); deleteProject(btn.dataset.id); });
    });
    projectsGrid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const id = card.querySelector('.open-btn')?.dataset.id;
        if (id) openProject(id);
      });
    });
  }

  function openProject(id) {
    const p = state.projects.find(x => x.id === id);
    if (!p) return;
    state.messages = JSON.parse(JSON.stringify(p.messages));
    setCurrentProject(id);
    saveMessages();
    headerTitle.textContent = p.name;
    renderAllMessages();
    switchView('chatView');
  }

  function saveCurrentAsProject(name) {
    const now = Date.now();
    if (state.currentProjectId) {
      const existing = state.projects.find(p => p.id === state.currentProjectId);
      if (existing) {
        existing.name = name;
        existing.messages = JSON.parse(JSON.stringify(state.messages));
        existing.updatedAt = now;
        saveProjects();
        headerTitle.textContent = name;
        return;
      }
    }
    const id = 'p_' + now + '_' + Math.random().toString(36).slice(2, 7);
    state.projects.push({
      id, name,
      messages: JSON.parse(JSON.stringify(state.messages)),
      createdAt: now, updatedAt: now
    });
    setCurrentProject(id);
    saveProjects();
    headerTitle.textContent = name;
  }

  function deleteProject(id) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    state.projects = state.projects.filter(p => p.id !== id);
    if (state.currentProjectId === id) {
      setCurrentProject(null);
      headerTitle.textContent = 'Daedalus';
    }
    saveProjects();
    renderProjects();
  }

  function startNewProject() {
    state.messages = [];
    setCurrentProject(null);
    saveMessages();
    headerTitle.textContent = 'Daedalus';
    renderAllMessages();
    switchView('chatView');
    welcomeEl.classList.remove('hidden');
  }

  function openSaveModal() {
    state.modalMode = 'save';
    modalTitle.textContent = 'Save Project';
    projectNameInput.value = state.currentProjectId
      ? (state.projects.find(p => p.id === state.currentProjectId)?.name || '')
      : '';
    modalOverlay.classList.add('open');
    setTimeout(() => projectNameInput.focus(), 100);
  }

  function openRenameModal(id) {
    state.modalMode = 'rename';
    state.renameId = id;
    const p = state.projects.find(x => x.id === id);
    modalTitle.textContent = 'Rename Project';
    projectNameInput.value = p ? p.name : '';
    modalOverlay.classList.add('open');
    setTimeout(() => projectNameInput.focus(), 100);
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    state.modalMode = null;
    state.renameId = null;
  }

  function confirmModal() {
    const name = projectNameInput.value.trim();
    if (!name) return;
    if (state.modalMode === 'save') saveCurrentAsProject(name);
    else if (state.modalMode === 'rename' && state.renameId) {
      const p = state.projects.find(x => x.id === state.renameId);
      if (p) {
        p.name = name;
        p.updatedAt = Date.now();
        saveProjects();
        if (state.currentProjectId === state.renameId) headerTitle.textContent = name;
      }
    }
    closeModal();
    if (document.getElementById('projectsView').classList.contains('active')) renderProjects();
  }

  function openPanel() { panel.classList.add('open'); overlay.classList.add('open'); }
  function closePanel() { panel.classList.remove('open'); overlay.classList.remove('open'); }

  function bindEvents() {
    $('#enterBtn').addEventListener('click', () => runLoading());
    inputEl.addEventListener('input', () => {
      autoResize();
      sendBtn.disabled = !inputEl.value.trim() || state.isTyping;
    });
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    sendBtn.addEventListener('click', () => handleSend());
    $$('.suggestion').forEach(btn => {
      btn.addEventListener('click', () => handleSend(btn.textContent));
    });
    $$('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    $('#menuBtn').addEventListener('click', openPanel);
    $('#closePanel').addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    $('#saveProjectBtn').addEventListener('click', () => { closePanel(); openSaveModal(); });
    $('#clearChatBtn').addEventListener('click', () => {
      if (confirm('Clear the current conversation?')) {
        state.messages = [];
        saveMessages();
        renderAllMessages();
        welcomeEl.classList.remove('hidden');
        headerTitle.textContent = 'Daedalus';
        setCurrentProject(null);
      }
      closePanel();
    });
    $('#newProjectBtn').addEventListener('click', startNewProject);
    $('#createProjectBtn').addEventListener('click', startNewProject);
    $('#modalCancel').addEventListener('click', closeModal);
    $('#modalConfirm').addEventListener('click', confirmModal);
    projectNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmModal(); });
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  }

  function init() {
    loadState();
    initParticles();
    bindEvents();
    renderAllMessages();
    if (state.currentProjectId) {
      const p = state.projects.find(x => x.id === state.currentProjectId);
      if (p) headerTitle.textContent = p.name;
    }
  }

  init();
})();
