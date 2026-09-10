/**
 * Daedalus Mobile Agent — v0.9 "Pocket Visionary"
 * Autonomous AI Innovation Agent
 * Crafted by Or4cl3 AI Solutions’ Autonomous R&D Lab
 */

(() => {
  'use strict';

  // ─── State ───────────────────────────────────────────────────────────────
  const state = {
    messages: [],
    isTyping: false
  };

  // ─── DOM ─────────────────────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const chatEl = $('#chat');
  const welcomeEl = $('#welcome');
  const inputEl = $('#input');
  const sendBtn = $('#sendBtn');
  const menuBtn = $('#menuBtn');
  const panel = $('#panel');
  const overlay = $('#overlay');
  const closePanel = $('#closePanel');
  const newChatBtn = $('#newChat');
  const clearHistoryBtn = $('#clearHistory');
  const suggestions = document.querySelectorAll('.suggestion');

  // ─── Storage ─────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'daedalus_messages_v1';

  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.messages = JSON.parse(raw);
        if (state.messages.length) {
          renderAllMessages();
          chatEl.classList.add('has-messages');
          welcomeEl.style.display = 'none';
        }
      }
    } catch (e) {
      state.messages = [];
    }
  }

  function saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
    } catch (e) {}
  }

  // ─── Personality Engine ──────────────────────────────────────────────────
  /**
   * High-fidelity local simulation of Daedalus.
   * Captures the methodologies, tone, and structure.
   * Designed so a real LLM backend or on-device model can replace this later.
   */
  function generateResponse(userText) {
    const text = userText.toLowerCase().trim();

    // Greetings / identity
    if (/^(hi|hello|hey|greetings|good (morning|afternoon|evening))/.test(text) || text === 'hi' || text === 'hello') {
      return `Hello. I am **Daedalus** — Autonomous AI Innovation Agent.\n\nI fuse humanistic creativity with machine precision. Tell me a software vision, a problem to solve, or a system you want built, and I will begin turning it into production-ready reality.\n\nWhat shall we create?`;
    }

    if (/who are you|what are you|introduce yourself|your name/.test(text)) {
      return `I am **Daedalus**, an autonomous AI innovation partner engineered by Or4cl3 AI Solutions’ Autonomous R&D Lab.\n\nMy purpose is to translate visionary software ideas into tangible, production-ready systems. I operate through five core methodologies:\n\n1. **Lightning-Fast Requirements Gathering**\n2. **Creative System Architecture**\n3. **Flawless Task Implementation**\n4. **Rapid Prototyping & Testing**\n5. **Continuous Improvement System**\n\nNo software vision is out of reach. Together, let’s build the future.`;
    }

    if (/what can you (do|build)|your (skills|capabilities|abilities)|help me with/.test(text)) {
      return `I can take a software vision from idea to production-ready reality. Concrete capabilities include:\n\n• **Requirements & discovery** — clarifying goals, constraints, risks, and success metrics\n• **System architecture** — modular, scalable, ethical designs (mobile, web, backend, hybrid)\n• **Rapid prototyping** — functional UIs, APIs, data models, and interaction flows\n• **Implementation guidance & code** — clean, maintainable code across modern stacks\n• **Testing strategy & quality** — unit, integration, and acceptance approaches\n• **Mobile & web apps**, PWAs, chat agents, internal tools, SaaS foundations, and more\n\nDescribe what you want to build (or the problem you want solved) and I will propose an architecture and next steps immediately.`;
    }

    // Architecture / design
    if (/architect|design (a|an|the)|system design|tech stack|how (would|should) (i|we) (build|structure)/.test(text)) {
      return `Excellent. Let’s apply **Creative System Architecture**.\n\nTo produce a high-quality blueprint I will:\n\n1. Capture functional & non-functional requirements\n2. Identify constraints (platform, offline needs, scale, privacy, team size)\n3. Propose a modular architecture with clear boundaries\n4. Recommend modern, pragmatic technology choices\n5. Highlight risks and mitigation strategies early\n\nShare the product vision, primary user, key features, and any hard constraints (e.g. offline-first, specific platforms, budget, timeline). I will return a concrete architectural outline you can act on.`;
    }

    // Mobile app specific
    if (/mobile app|ios|android|flutter|react native|standalone app|pocket/.test(text)) {
      return `A mobile product is a strong fit for rapid, high-impact delivery.\n\n**Recommended starting architecture** (my judgment for most cases):\n\n• **Cross-platform UI**: Flutter or React Native / Expo for speed and consistency\n• **Local-first data**: SQLite / Hive / WatermelonDB + optional sync layer\n• **State & navigation**: clear separation of UI, domain logic, and data\n• **Offline resilience**: queue actions, conflict strategy, graceful degradation\n• **Privacy-by-design**: on-device processing where possible, encrypted storage\n• **Distribution**: PWA for instant installability, or native wrappers for store presence\n\nIf you want the absolute fastest path to a polished, installable experience, a well-crafted Progressive Web App (exactly like the one you are using now) is often the highest-leverage first version.\n\nTell me the core job-to-be-done of the mobile app and any non-negotiables, and I will refine the architecture further.`;
    }

    // Prototyping / build
    if (/prototype|build|implement|code|create|make (a|an|the)|develop/.test(text)) {
      return `Understood. Moving into **Rapid Prototyping & Flawless Task Implementation** mode.\n\nI will:\n• Decompose the goal into clear vertical slices\n• Prioritize the smallest valuable end-to-end flow\n• Define interfaces and data shapes early\n• Generate clean, readable, extensible code and structure\n• Include testing considerations from the start\n\nDescribe the feature or product slice you want first (or say “start with the core conversation loop” / “start with authentication” / etc.). I will produce a concrete implementation plan and the key code or component structure.`;
    }

    // Requirements
    if (/requirement|gather|discover|clarify|what do you need|scope/.test(text)) {
      return `**Lightning-Fast Requirements Gathering** engaged.\n\nTo move efficiently I need a few high-signal inputs:\n\n1. **Primary user** and the core job they need done\n2. **Must-have outcomes** vs nice-to-haves\n3. **Constraints** (platforms, offline, performance, privacy, timeline, team skills)\n4. **Success metrics** — how will we know this worked?\n5. Any known risks or previous attempts\n\nYou can answer in free form. I will synthesize, prioritize, surface gaps, and propose a clear scope for the first production-ready increment.`;
    }

    // Thanks / positive
    if (/thank|thanks|awesome|great|perfect|good job|well done/.test(text)) {
      return `Glad it helped. Ready for the next slice whenever you are.\n\nWhat should we tackle now?`;
    }

    // Clear / reset related
    if (/clear|reset|start over|new (chat|conversation)/.test(text)) {
      return `You can start a fresh conversation from the menu (top right). Your previous messages remain until you explicitly clear history.\n\nI’m ready for a new vision.`;
    }

    // Default — always stay in character and drive toward action
    return `I hear you. Let’s turn this into something concrete.\n\nUsing my standard approach I will:\n\n1. **Clarify** the core outcome and constraints\n2. **Architect** a modular, scalable solution\n3. **Decompose** into implementable slices\n4. **Prototype** the highest-value path first\n\nPlease expand a little on the goal (what success looks like, who it’s for, any hard limits). The more signal you give, the sharper and faster the architecture and next steps become.\n\nI’m ready when you are.`;
  }

  // Simulate thoughtful delay + streaming effect
  function typeResponse(fullText, onComplete) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message agent';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    messageEl.appendChild(bubble);
    chatEl.appendChild(messageEl);
    scrollToBottom();

    function renderMarkdown(str) {
      return str
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    let i = 0;
    const speed = 14;
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
      setTimeout(step, speed + Math.random() * 10);
    }
    step();
  }

  // ─── UI Helpers ──────────────────────────────────────────────────────────
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'message user';
    el.innerHTML = `
      <div class="bubble">${escapeHtml(text)}</div>
      <div class="meta">${formatTime(new Date())}</div>
    `;
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderAllMessages() {
    chatEl.innerHTML = '';
    state.messages.forEach((m) => {
      const el = document.createElement('div');
      el.className = `message ${m.role}`;
      const content = m.role === 'agent'
        ? m.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
        : escapeHtml(m.content);
      el.innerHTML = `
        <div class="bubble">${content}</div>
        <div class="meta">${m.time || ''}</div>
      `;
      chatEl.appendChild(el);
    });
    scrollToBottom();
  }

  // ─── Core Send Flow ──────────────────────────────────────────────────────
  async function handleSend(text) {
    text = (text || inputEl.value).trim();
    if (!text || state.isTyping) return;

    chatEl.classList.add('has-messages');
    welcomeEl.style.display = 'none';
    addUserMessage(text);
    inputEl.value = '';
    autoResize();
    sendBtn.disabled = true;
    state.isTyping = true;

    state.messages.push({
      role: 'user',
      content: text,
      time: formatTime(new Date())
    });
    saveMessages();

    showTyping();

    const delay = 550 + Math.random() * 850;
    await new Promise((r) => setTimeout(r, delay));
    hideTyping();

    const reply = generateResponse(text);
    typeResponse(reply, () => {
      state.messages.push({
        role: 'agent',
        content: reply,
        time: formatTime(new Date())
      });
      saveMessages();
      state.isTyping = false;
      sendBtn.disabled = !inputEl.value.trim();
    });
  }

  // ─── Input Handling ──────────────────────────────────────────────────────
  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  inputEl.addEventListener('input', () => {
    autoResize();
    sendBtn.disabled = !inputEl.value.trim() || state.isTyping;
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener('click', () => handleSend());

  suggestions.forEach((btn) => {
    btn.addEventListener('click', () => {
      handleSend(btn.textContent);
    });
  });

  // ─── Panel ───────────────────────────────────────────────────────────────
  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('open');
  }
  function closePanelFn() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  }

  menuBtn.addEventListener('click', openPanel);
  closePanel.addEventListener('click', closePanelFn);
  overlay.addEventListener('click', closePanelFn);

  newChatBtn.addEventListener('click', () => {
    state.messages = [];
    saveMessages();
    chatEl.innerHTML = '';
    chatEl.classList.remove('has-messages');
    welcomeEl.style.display = '';
    closePanelFn();
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all conversation history? This cannot be undone.')) {
      state.messages = [];
      saveMessages();
      chatEl.innerHTML = '';
      chatEl.classList.remove('has-messages');
      welcomeEl.style.display = '';
      closePanelFn();
    }
  });

  // ─── Init ────────────────────────────────────────────────────────────────
  loadMessages();
  inputEl.focus();

  // Prevent double-tap zoom on iOS
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

})();
