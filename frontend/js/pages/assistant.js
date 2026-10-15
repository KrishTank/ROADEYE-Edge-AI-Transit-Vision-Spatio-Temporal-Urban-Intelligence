/* =========================================================
   ROADEYE — RAVI AI ASSISTANT CLIENT ENGINE
   Edge-AI Transit Vision & Spatio-Temporal Urban Intelligence
   Real AI communication, live operations telemetry, and safe rendering.
   ========================================================= */

(function () {
  'use strict';

  // Session storage key for persisting active chat across tab navigation
  const STORAGE_KEY = 'roadeye_ravi_conversation_v1';

  // DOM Elements cache
  let dom = {};

  // Current active request controller
  let currentAbortController = null;
  let isGenerating = false;

  // In-memory conversation state
  let conversationHistory = [];

  // Configuration state
  let aiConfig = {
    configured: false,
    provider: 'Google Gemini',
    model: 'gemini-3.8-flash',
    status: 'connecting',
    message: ''
  };

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function init() {
    cacheDom();
    bindEvents();
    loadConversation();
    checkAiStatus();
    fetchLiveOperations();

    // Polling live operations every 10 seconds
    setInterval(fetchLiveOperations, 10000);

    // Event listener for real-time SSE stream events
    window.addEventListener('roadeye:newEvent', fetchLiveOperations);
    window.addEventListener('urbansense:newEvent', fetchLiveOperations);

    console.log('[RAVI Assistant] Initialized with operational telemetry link.');
  }

  function cacheDom() {
    dom = {
      statusPill: document.getElementById('raviStatusPill'),
      statusText: document.getElementById('raviStatusText'),
      modelBadge: document.getElementById('raviModelBadge'),
      conversation: document.getElementById('raviConversation'),
      composerTextarea: document.getElementById('composerTextarea'),
      sendBtn: document.getElementById('composerSendBtn'),
      stopBtn: document.getElementById('composerStopBtn'),
      newChatBtn: document.getElementById('newChatBtn'),
      clearChatBtn: document.getElementById('clearChatBtn'),
      modalBackdrop: document.getElementById('clearModalBackdrop'),
      modalConfirmBtn: document.getElementById('modalConfirmClear'),
      modalCancelBtn: document.getElementById('modalCancelClear'),
      liveOpsUpdated: document.getElementById('liveOpsUpdated'),
      statBuses: document.getElementById('metricBuses'),
      statEvents: document.getElementById('metricEvents'),
      statCritical: document.getElementById('metricCritical'),
      statOrders: document.getElementById('metricOrders'),
      queryButtons: document.querySelectorAll('.query-row-btn'),
      promptChips: document.querySelectorAll('.ravi-prompt-chip, .quick-chip'),
      liveClock: document.getElementById('liveClock'),
      refreshBtn: document.getElementById('refreshAssistantData'),
      exportBtn: document.getElementById('exportChatBtn'),
      micBtn: document.getElementById('composerMicBtn'),
      metricCards: document.querySelectorAll('.ops-metric-card'),
      filterPills: document.querySelectorAll('.filter-pill'),
    };
  }

  function bindEvents() {
    // Composer input & keyboard
    if (dom.composerTextarea) {
      dom.composerTextarea.addEventListener('keydown', handleTextareaKeydown);
      dom.composerTextarea.addEventListener('input', autoResizeTextarea);
    }

    if (dom.sendBtn) {
      dom.sendBtn.addEventListener('click', handleSend);
    }

    if (dom.stopBtn) {
      dom.stopBtn.addEventListener('click', handleStop);
    }

    // New Chat & Clear Chat
    if (dom.newChatBtn) {
      dom.newChatBtn.addEventListener('click', () => {
        if (conversationHistory.length > 0) {
          openClearModal();
        }
      });
    }

    if (dom.clearChatBtn) {
      dom.clearChatBtn.addEventListener('click', openClearModal);
    }

    if (dom.modalCancelBtn) {
      dom.modalCancelBtn.addEventListener('click', closeClearModal);
    }

    if (dom.modalConfirmBtn) {
      dom.modalConfirmBtn.addEventListener('click', () => {
        clearConversation();
        closeClearModal();
      });
    }

    // Close modal on backdrop click
    if (dom.modalBackdrop) {
      dom.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === dom.modalBackdrop) closeClearModal();
      });
    }

    // Suggested queries in right column
    if (dom.queryButtons) {
      dom.queryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const query = btn.getAttribute('data-query') || btn.querySelector('.query-label').textContent.trim();
          sendUserMessage(query);
        });
      });
    }

    // Clickable prompt chips
    if (dom.promptChips) {
      dom.promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
          sendUserMessage(prompt);
        });
      });
    }

    // Manual refresh
    if (dom.refreshBtn) {
      dom.refreshBtn.addEventListener('click', () => {
        fetchLiveOperations();
        checkAiStatus();
      });
    }

    // Export Report
    if (dom.exportBtn) {
      dom.exportBtn.addEventListener('click', exportConversationReport);
    }

    // Voice Dictation (Speech-to-Text)
    if (dom.micBtn) {
      dom.micBtn.addEventListener('click', toggleSpeechRecognition);
      initSpeechRecognition();
    }

    // Interactive Metric Cards (One-Click Operations Analysis)
    if (dom.metricCards) {
      dom.metricCards.forEach(card => {
        card.addEventListener('click', () => {
          const query = card.getAttribute('data-query');
          if (query) sendUserMessage(query);
        });
      });
    }

    // Filter pills on Suggested Queries
    if (dom.filterPills) {
      dom.filterPills.forEach(pill => {
        pill.addEventListener('click', () => handleFilterClick(pill));
      });
    }

    // Live clock ticker
    if (dom.liveClock) {
      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  function updateClock() {
    if (!dom.liveClock) return;
    const now = new Date();
    dom.liveClock.textContent = now.toTimeString().split(' ')[0];
  }


  /* =========================================================
     AI STATUS & CONNECTION MONITOR
     ========================================================= */

  async function checkAiStatus() {
    try {
      let statusData = null;
      if (window.UrbanAPI && UrbanAPI.getAiStatus) {
        statusData = await UrbanAPI.getAiStatus();
      } else {
        const res = await fetch('http://localhost:5000/api/ai/status');
        statusData = await res.json();
      }

      if (statusData && statusData.success) {
        aiConfig = {
          configured: statusData.configured,
          provider: statusData.provider || 'Google Gemini',
          model: statusData.model || 'gemini-2.5-flash',
          status: statusData.configured ? 'online' : 'unavailable',
          message: statusData.message || ''
        };
      } else {
        aiConfig.status = 'unavailable';
        aiConfig.configured = false;
      }
    } catch (err) {
      console.warn('[RAVI] Could not reach AI status endpoint:', err);
      aiConfig.status = 'unavailable';
      aiConfig.configured = false;
      aiConfig.message = 'Backend offline or unreachable at http://localhost:5000.';
    }

    updateStatusUi();
  }

  function updateStatusUi() {
    if (!dom.statusPill || !dom.statusText) return;

    dom.statusPill.className = 'ravi-status-pill ' + aiConfig.status;
    if (aiConfig.status === 'online') {
      dom.statusText.textContent = 'ONLINE';
      dom.statusPill.title = `Connected to ${aiConfig.provider} (${aiConfig.model})`;
    } else if (aiConfig.status === 'connecting') {
      dom.statusText.textContent = 'CONNECTING';
      dom.statusPill.title = 'Checking AI provider status...';
    } else {
      dom.statusText.textContent = 'KEY REQUIRED';
      dom.statusPill.title = aiConfig.message || 'Configure GEMINI_API_KEY in backend/.env';
    }

    if (dom.modelBadge) {
      dom.modelBadge.textContent = `${aiConfig.provider} · ${aiConfig.model}`;
      dom.modelBadge.title = aiConfig.configured ? 'Live API active' : 'API Key required in backend/.env';
    }
  }


  /* =========================================================
     LIVE OPERATIONS SNAPSHOT
     ========================================================= */

  async function fetchLiveOperations() {
    try {
      let stats = null;
      if (window.UrbanAPI && UrbanAPI.getStats) {
        stats = await UrbanAPI.getStats();
      }

      if (!stats) {
        const res = await fetch('http://localhost:5000/api/stats');
        const json = await res.json();
        stats = json && json.success ? json.data : null;
      }

      if (stats) {
        renderLiveOperations(stats);
      } else {
        renderLiveOperationsFallback();
      }
    } catch (err) {
      console.warn('[RAVI] Error fetching live operations:', err);
      renderLiveOperationsFallback();
    }
  }

  function renderLiveOperations(stats) {
    if (dom.statBuses) {
      const active = stats.fleet ? stats.fleet.active : 0;
      const total = stats.fleet ? stats.fleet.total : 0;
      dom.statBuses.textContent = `${active} / ${total}`;
    }

    if (dom.statEvents) {
      const open = stats.events ? stats.events.open : 0;
      dom.statEvents.textContent = Number(open).toLocaleString();
    }

    if (dom.statCritical) {
      const crit = stats.events ? stats.events.critical : 0;
      dom.statCritical.textContent = Number(crit).toLocaleString();
    }

    if (dom.statOrders) {
      const orders = stats.work_orders ? stats.work_orders.total : 0;
      dom.statOrders.textContent = Number(orders).toLocaleString();
    }

    if (dom.liveOpsUpdated) {
      const now = new Date();
      dom.liveOpsUpdated.textContent = 'Updated ' + now.toTimeString().split(' ')[0];
    }
  }

  function renderLiveOperationsFallback() {
    // Use fallback data from localStorage if backend is temporarily disconnected
    if (window.ROADEYE && ROADEYE.getFleet && ROADEYE.getEvents) {
      const fleet = ROADEYE.getFleet() || [];
      const events = ROADEYE.getEvents() || [];
      const activeBuses = fleet.filter(b => b.status === 'ACTIVE').length;
      const openEvents = events.filter(e => e.status !== 'Resolved').length;
      const critical = events.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length;

      if (dom.statBuses) dom.statBuses.textContent = `${activeBuses} / ${fleet.length}`;
      if (dom.statEvents) dom.statEvents.textContent = Number(openEvents).toLocaleString();
      if (dom.statCritical) dom.statCritical.textContent = Number(critical).toLocaleString();
      if (dom.statOrders) dom.statOrders.textContent = '—';
      if (dom.liveOpsUpdated) dom.liveOpsUpdated.textContent = 'Local simulation';
    }
  }


  /* =========================================================
     CONVERSATION & STORAGE
     ========================================================= */

  function loadConversation() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        conversationHistory = JSON.parse(saved);
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          renderAllMessages();
          return;
        }
      }
    } catch (e) {
      console.warn('[RAVI] Could not parse stored conversation:', e);
    }

    // Default: render empty welcoming state
    renderEmptyState();
  }

  function saveConversation() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
    } catch (e) {
      console.warn('[RAVI] Could not save conversation:', e);
    }
  }

  function clearConversation() {
    conversationHistory = [];
    sessionStorage.removeItem(STORAGE_KEY);
    renderEmptyState();
  }


  /* =========================================================
     RENDERING
     ========================================================= */

  function renderEmptyState() {
    if (!dom.conversation) return;
    dom.conversation.innerHTML = `
      <div class="ravi-empty-state" id="raviEmptyState">
        <div class="empty-state-icon">🤖</div>
        <div class="empty-state-title">Welcome to RAVI Operational Intelligence</div>
        <div class="empty-state-desc">
          I am connected to your live mobile bus sensing fleet. Ask me anything about real-time road defects, fleet telemetry, pavement degradation indices, or municipal work orders.
        </div>
        <div class="ravi-chips-container">
          <button class="ravi-prompt-chip" data-prompt="Summarize current fleet operations.">
            <span>🚌</span> Summarize current fleet operations
          </button>
          <button class="ravi-prompt-chip" data-prompt="Analyze route performance.">
            <span>🛣️</span> Analyze route performance
          </button>
          <button class="ravi-prompt-chip" data-prompt="Generate an operations report.">
            <span>📊</span> Generate an operations report
          </button>
          <button class="ravi-prompt-chip" data-prompt="Identify operational risks.">
            <span>🚨</span> Identify operational risks
          </button>
          <button class="ravi-prompt-chip" data-prompt="Explain recent analytics.">
            <span>📈</span> Explain recent analytics
          </button>
          <button class="ravi-prompt-chip" data-prompt="Recommend ways to improve efficiency.">
            <span>⚡</span> Recommend ways to improve efficiency
          </button>
        </div>
      </div>
    `;

    // Re-bind click events for chips
    dom.conversation.querySelectorAll('.ravi-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        sendUserMessage(prompt);
      });
    });
  }

  function renderAllMessages() {
    if (!dom.conversation) return;
    dom.conversation.innerHTML = '';
    conversationHistory.forEach((msg, idx) => {
      appendMessageElement(msg, idx);
    });
    scrollToBottom();
  }

  function appendMessageElement(msg, idx) {
    if (!dom.conversation) return null;

    // Remove empty state if present
    const emptyState = document.getElementById('raviEmptyState');
    if (emptyState) emptyState.remove();

    const msgEl = document.createElement('div');
    msgEl.className = `ravi-msg ${msg.role === 'user' ? 'user' : 'assistant'}`;
    if (msg.isError) msgEl.classList.add('error-msg');
    msgEl.dataset.idx = idx;

    const timeStr = msg.timestamp ? formatTime(msg.timestamp) : formatTime(new Date());

    let contentHtml = '';
    if (msg.role === 'user') {
      contentHtml = escapeHtml(msg.content);
    } else {
      contentHtml = renderSafeMarkdown(msg.content);
    }

    let footerHtml = '';
    if (msg.role === 'assistant' && !msg.isError) {
      footerHtml = `
        <div class="msg-footer">
          <span>${timeStr}</span>
          <span>·</span>
          <button class="msg-copy-btn" title="Copy response to clipboard">
            <span>📋</span> Copy
          </button>
          <span>·</span>
          <button class="msg-audio-btn" title="Read response aloud (Voice synthesis)">
            <span>🔊</span> Listen
          </button>
        </div>
      `;
    } else if (msg.role === 'assistant' && msg.isError) {
      footerHtml = `
        <div class="msg-footer">
          <span>${timeStr}</span>
          <span>·</span>
          <button class="msg-retry-btn">⟳ Retry</button>
        </div>
      `;
    } else {
      footerHtml = `<div class="msg-footer"><span>${timeStr}</span></div>`;
    }

    msgEl.innerHTML = `
      <div class="msg-bubble">${contentHtml}</div>
      ${footerHtml}
    `;

    // Bind copy button
    const copyBtn = msgEl.querySelector('.msg-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => copyToClipboard(msg.content, copyBtn));
    }

    // Bind audio TTS button
    const audioBtn = msgEl.querySelector('.msg-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => toggleSpeech(msg.content, audioBtn));
    }

    // Bind retry button
    const retryBtn = msgEl.querySelector('.msg-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => retryLastMessage());
    }

    dom.conversation.appendChild(msgEl);
    scrollToBottom();
    return msgEl;
  }

  function appendTypingIndicator() {
    const emptyState = document.getElementById('raviEmptyState');
    if (emptyState) emptyState.remove();

    const indicator = document.createElement('div');
    indicator.className = 'ravi-msg assistant';
    indicator.id = 'raviTypingMsg';
    indicator.innerHTML = `
      <div class="msg-bubble" style="padding: 10px 14px;">
        <div class="ravi-typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    dom.conversation.appendChild(indicator);
    scrollToBottom();
    return indicator;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('raviTypingMsg');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    if (!dom.conversation) return;
    dom.conversation.scrollTop = dom.conversation.scrollHeight;
  }


  /* =========================================================
     COMPOSER ACTIONS & MESSAGE DISPATCH
     ========================================================= */

  function handleTextareaKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResizeTextarea() {
    if (!dom.composerTextarea) return;
    dom.composerTextarea.style.height = 'auto';
    dom.composerTextarea.style.height = Math.min(dom.composerTextarea.scrollHeight, 120) + 'px';
  }

  function handleSend() {
    if (!dom.composerTextarea) return;
    const text = dom.composerTextarea.value.trim();
    if (!text || isGenerating) return;

    dom.composerTextarea.value = '';
    autoResizeTextarea();
    sendUserMessage(text);
  }

  function handleStop() {
    if (currentAbortController && isGenerating) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  async function sendUserMessage(text) {
    if (!text || isGenerating) return;

    setGeneratingState(true);

    // 1. Add user message
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    conversationHistory.push(userMsg);
    saveConversation();
    appendMessageElement(userMsg, conversationHistory.length - 1);

    // 2. Add typing indicator
    appendTypingIndicator();

    // 3. Prepare AbortController
    currentAbortController = new AbortController();

    try {
      // Build history payload for contextual follow-up
      const historyPayload = conversationHistory.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      let response = null;
      if (window.UrbanAPI && UrbanAPI.sendAiChat) {
        response = await UrbanAPI.sendAiChat(
          { message: text, history: historyPayload },
          currentAbortController.signal
        );
      } else {
        const res = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: historyPayload }),
          signal: currentAbortController.signal
        });
        response = await res.json();
      }

      removeTypingIndicator();

      if (response && response.success && response.reply) {
        // Success response
        const assistantMsg = {
          role: 'assistant',
          content: response.reply,
          timestamp: response.timestamp || new Date().toISOString(),
          isError: false
        };
        conversationHistory.push(assistantMsg);
        saveConversation();
        appendMessageElement(assistantMsg, conversationHistory.length - 1);

        // Update model badge with actual model returned
        if (response.model) {
          aiConfig.model = response.model;
          aiConfig.provider = response.provider || 'Google Gemini';
          aiConfig.configured = true;
          aiConfig.status = 'online';
          updateStatusUi();
        }

      } else {
        // Failed response / Unconfigured
        const errorText = (response && response.error) ?
          response.error :
          'Failed to generate response from AI model. Please verify backend service and API configuration.';

        const errorMsg = {
          role: 'assistant',
          content: `⚠️ **AI Service Notification:**\n\n${errorText}\n\n*To enable real AI responses, configure your \`GEMINI_API_KEY\` in \`backend/.env\`.*`,
          timestamp: new Date().toISOString(),
          isError: true,
          failedText: text
        };

        conversationHistory.push(errorMsg);
        saveConversation();
        appendMessageElement(errorMsg, conversationHistory.length - 1);

        // Update status UI
        if (response && response.configured === false) {
          aiConfig.status = 'unavailable';
          aiConfig.configured = false;
          updateStatusUi();
        }
      }

    } catch (err) {
      removeTypingIndicator();

      if (err.message && err.message.includes('aborted')) {
        const stopMsg = {
          role: 'assistant',
          content: '_Generation stopped by operator._',
          timestamp: new Date().toISOString(),
          isError: false
        };
        conversationHistory.push(stopMsg);
        saveConversation();
        appendMessageElement(stopMsg, conversationHistory.length - 1);
      } else {
        const networkErrorMsg = {
          role: 'assistant',
          content: `⚠️ **Connection Error:** Unable to reach ROADEYE Backend at http://localhost:5000. Error: ${err.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
          failedText: text
        };
        conversationHistory.push(networkErrorMsg);
        saveConversation();
        appendMessageElement(networkErrorMsg, conversationHistory.length - 1);
      }
    } finally {
      currentAbortController = null;
      setGeneratingState(false);
    }
  }

  function retryLastMessage() {
    // Find the last user message or failed text
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      if (conversationHistory[i].role === 'user') {
        const text = conversationHistory[i].content;
        // Remove trailing error messages
        conversationHistory = conversationHistory.slice(0, i);
        saveConversation();
        renderAllMessages();
        sendUserMessage(text);
        return;
      }
    }
  }

  function setGeneratingState(generating) {
    isGenerating = generating;
    if (dom.sendBtn) dom.sendBtn.disabled = generating;
    if (dom.stopBtn) {
      if (generating) dom.stopBtn.classList.add('active');
      else dom.stopBtn.classList.remove('active');
    }
    if (dom.composerTextarea) {
      dom.composerTextarea.disabled = generating;
      if (!generating) dom.composerTextarea.focus();
    }
  }


  /* =========================================================
     MODAL CONTROLS
     ========================================================= */

  function openClearModal() {
    if (dom.modalBackdrop) dom.modalBackdrop.classList.add('open');
  }

  function closeClearModal() {
    if (dom.modalBackdrop) dom.modalBackdrop.classList.remove('open');
  }


  /* =========================================================
     CLIPBOARD UTILITY
     ========================================================= */

  function copyToClipboard(text, btn) {
    if (!navigator.clipboard) {
      fallbackCopy(text);
      indicateCopied(btn);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      indicateCopied(btn);
    }).catch(err => {
      console.warn('Clipboard write failed:', err);
      fallbackCopy(text);
      indicateCopied(btn);
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function indicateCopied(btn) {
    if (!btn) return;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<span>✓</span> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.classList.remove('copied');
    }, 2000);
  }


  /* =========================================================
     SAFE MARKDOWN PARSER (XSS-Safe, Clean Output)
     ========================================================= */

  function renderSafeMarkdown(rawText) {
    if (!rawText) return '';

    // Step 1: Escape HTML to prevent injection
    let text = escapeHtml(rawText);

    // Code blocks ```code```
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function (match, lang, code) {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings ###
    text = text.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    text = text.replace(/^# (.*?)$/gm, '<h2>$1</h2>');

    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Markdown Tables
    text = parseMarkdownTables(text);

    // Unordered lists (- item or * item)
    text = text.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\s*)+/gs, function (match) {
      return `<ul>${match}</ul>`;
    });

    // Ordered lists (1. item)
    text = text.replace(/^\s*\d+\.\s+(.*?)$/gm, '<oli>$1</oli>');
    text = text.replace(/(<oli>.*?<\/oli>\s*)+/gs, function (match) {
      const items = match.replace(/<\/?oli>/g, tag => tag.replace('oli', 'li'));
      return `<ol>${items}</ol>`;
    });

    // Entity Chips (Auto-link Event IDs, Bus IDs, Routes)
    text = text.replace(/\[?(EVT-[A-Za-z0-9-]+)\]?/g, function(match, evtId) {
      return `<a href="incidents.html?search=${evtId}" class="entity-chip chip-evt" title="Inspect ${evtId} in Incidents Console">🔍 ${evtId}</a>`;
    });

    text = text.replace(/\b(BUS-\d+)\b/g, function(match, busId) {
      return `<a href="fleet.html?bus=${busId}" class="entity-chip chip-bus" title="Track ${busId} in Fleet Console">🚌 ${busId}</a>`;
    });

    text = text.replace(/\b(R-\d+)\b/g, function(match, routeId) {
      return `<span class="entity-chip chip-route" title="Route Corridor ${routeId}">🛣️ ${routeId}</span>`;
    });

    // Paragraphs: double newline to paragraph, single to <br>
    const blocks = text.split(/\n\n+/);
    const formattedBlocks = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      // If block starts with a tag like <h3>, <ul>, <ol>, <pre>, <table>, don't wrap in <p>
      if (/^<(h[2-4]|ul|ol|pre|table)/.test(block)) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    });

    return formattedBlocks.join('\n');
  }

  function parseMarkdownTables(text) {
    const lines = text.split('\n');
    let inTable = false;
    let tableHtml = [];
    let out = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        // Is table row
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        // Check if delimiter row (|---|---|)
        const isDelimiter = cells.every(c => /^[-:]+$/.test(c));

        if (!inTable) {
          inTable = true;
          tableHtml.push('<table>');
          // First row is header
          tableHtml.push('<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead>');
          tableHtml.push('<tbody>');
        } else if (!isDelimiter) {
          tableHtml.push('<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>');
        }
      } else {
        if (inTable) {
          tableHtml.push('</tbody></table>');
          out.push(tableHtml.join(''));
          tableHtml = [];
          inTable = false;
        }
        out.push(lines[i]);
      }
    }

    if (inTable) {
      tableHtml.push('</tbody></table>');
      out.push(tableHtml.join(''));
    }

    return out.join('\n');
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }


  /* =========================================================
     VOICE DICTATION (SPEECH-TO-TEXT)
     ========================================================= */

  let recognition = null;
  let isListening = false;

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (dom.micBtn) dom.micBtn.style.display = 'none';
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListening = true;
        if (dom.micBtn) {
          dom.micBtn.classList.add('listening');
          dom.micBtn.title = 'Listening... Speak now';
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (dom.composerTextarea && transcript) {
          const current = dom.composerTextarea.value.trim();
          dom.composerTextarea.value = current ? `${current} ${transcript}` : transcript;
          autoResizeTextarea();
          dom.composerTextarea.focus();
        }
      };

      recognition.onerror = (e) => {
        console.warn('[RAVI Voice] Speech recognition error:', e.error);
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };
    } catch (e) {
      console.warn('[RAVI Voice] Speech recognition init failed:', e);
      if (dom.micBtn) dom.micBtn.style.display = 'none';
    }
  }

  function toggleSpeechRecognition() {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      stopListening();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
      }
    }
  }

  function stopListening() {
    isListening = false;
    if (dom.micBtn) {
      dom.micBtn.classList.remove('listening');
      dom.micBtn.title = 'Voice dictation (Click to speak)';
    }
  }


  /* =========================================================
     TEXT-TO-SPEECH (AUDIO BRIEFINGS)
     ========================================================= */

  let activeAudioBtn = null;

  function toggleSpeech(rawText, btn) {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    // If currently speaking from this button, stop
    if (window.speechSynthesis.speaking && activeAudioBtn === btn) {
      window.speechSynthesis.cancel();
      resetAudioButton(btn);
      activeAudioBtn = null;
      return;
    }

    // Cancel any previous utterance
    window.speechSynthesis.cancel();
    if (activeAudioBtn) {
      resetAudioButton(activeAudioBtn);
    }

    // Strip Markdown symbols for clean, natural speech
    const cleanText = rawText
      .replace(/###\s+/g, '')
      .replace(/##\s+/g, '')
      .replace(/#\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\[EVT-[A-Za-z0-9-]+\]/g, 'Event')
      .replace(/WO-\d+-\d+/g, 'Work Order')
      .replace(/\|/g, ', ')
      .replace(/`{1,3}.*?`{1,3}/gs, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    btn.innerHTML = '<span>⏹</span> Stop';
    btn.classList.add('playing');
    activeAudioBtn = btn;

    utterance.onend = () => {
      resetAudioButton(btn);
      if (activeAudioBtn === btn) activeAudioBtn = null;
    };

    utterance.onerror = () => {
      resetAudioButton(btn);
      if (activeAudioBtn === btn) activeAudioBtn = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  function resetAudioButton(btn) {
    if (!btn) return;
    btn.innerHTML = '<span>🔊</span> Listen';
    btn.classList.remove('playing');
  }


  /* =========================================================
     REPORT EXPORT (MARKDOWN DOWNLOAD)
     ========================================================= */

  function exportConversationReport() {
    if (conversationHistory.length === 0) {
      alert('No active conversation to export. Start a discussion with RAVI first.');
      return;
    }

    const now = new Date();
    const timestampStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let md = `# ROADEYE Urban Intelligence Operations Report\n`;
    md += `**Date:** ${now.toUTCString()}\n`;
    md += `**Platform:** ROADEYE Edge-AI Transit Vision & Spatio-Temporal Urban Intelligence\n`;
    md += `**Assistant Engine:** RAVI (${aiConfig.provider} · ${aiConfig.model})\n\n`;
    md += `---\n\n`;
    md += `## Operations Dialogue\n\n`;

    conversationHistory.forEach((msg, idx) => {
      const speaker = msg.role === 'user' ? 'OPERATOR' : 'RAVI (AI ASSISTANT)';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      md += `### [${idx + 1}] ${speaker} (${time})\n\n`;
      md += `${msg.content}\n\n`;
      md += `---\n\n`;
    });

    md += `*End of ROADEYE Operations Report — Generated via RAVI AI Console.*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadeye-operations-report-${timestampStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  /* =========================================================
     SUGGESTED QUERIES DOMAIN FILTER
     ========================================================= */

  function handleFilterClick(pill) {
    const filter = pill.getAttribute('data-filter');
    if (dom.filterPills) {
      dom.filterPills.forEach(p => p.classList.remove('active'));
    }
    pill.classList.add('active');

    const buttons = document.querySelectorAll('.query-row-btn');
    buttons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    });
  }


  /* =========================================================
     DOM READY BOOTSTRAP
     ========================================================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
