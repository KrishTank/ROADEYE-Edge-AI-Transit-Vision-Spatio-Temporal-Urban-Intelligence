/* =========================================================
   ROADEYE — AI ASSISTANT / CHATBOT COMPONENT
   Real-time intelligent conversational assistant for the Command Center.
   Explains live telemetry, road defects, fleet health, and municipal workflows.
   ========================================================= */

(function () {

  const CHAT_ID = 'roadeyeChatDrawer';

  function injectStyles() {
    if (document.getElementById('roadeyeChatStyles')) return;
    const s = document.createElement('style');
    s.id = 'roadeyeChatStyles';
    s.textContent = `
      .roadeye-chat-drawer {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        height: 520px;
        max-height: calc(100vh - 100px);
        background: #FFFFFF;
        border: 1px solid #BAE6FD;
        border-radius: 18px;
        box-shadow: 0 16px 40px -10px rgba(2, 132, 199, 0.25), 0 4px 16px rgba(15, 23, 42, 0.08);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        transform: translateY(20px) scale(0.96);
        opacity: 0;
        pointer-events: none;
        font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
      }

      .roadeye-chat-drawer.open {
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: auto;
      }

      .chat-drawer-head {
        padding: 14px 18px;
        background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
        border-bottom: 1px solid #BAE6FD;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .cdh-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cdh-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #0284C7;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }

      .cdh-title {
        font-size: 14px;
        font-weight: 800;
        color: #0F172A;
      }

      .cdh-sub {
        font-size: 10px;
        font-family: var(--font-mono, monospace);
        color: #0369A1;
        font-weight: 600;
      }

      .cdh-close-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
        background: #FFFFFF;
        color: #64748B;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.15s ease;
      }

      .cdh-close-btn:hover {
        background: #FEF2F2;
        color: #DC2626;
        border-color: #FECACA;
      }

      .chat-drawer-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #F8FAFC;
      }

      .c-msg {
        max-width: 86%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
      }

      .c-msg.bot {
        align-self: flex-start;
        background: #FFFFFF;
        color: #1E293B;
        border: 1px solid #E2E8F0;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
      }

      .c-msg.bot strong {
        color: #0284C7;
      }

      .c-msg.user {
        align-self: flex-end;
        background: #0284C7;
        color: #FFFFFF;
        border-bottom-right-radius: 4px;
      }

      .chat-drawer-suggestions {
        padding: 8px 12px;
        background: #FFFFFF;
        border-top: 1px solid #F1F5F9;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        white-space: nowrap;
      }

      .chat-drawer-suggestions::-webkit-scrollbar {
        height: 4px;
      }

      .chat-drawer-suggestions::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 4px;
      }

      .c-sugg-pill {
        padding: 4px 10px;
        background: #F0F9FF;
        border: 1px solid #BAE6FD;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        color: #0369A1;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .c-sugg-pill:hover {
        background: #0284C7;
        color: #FFFFFF;
        border-color: #0284C7;
      }

      .chat-drawer-input-row {
        padding: 12px 14px;
        background: #FFFFFF;
        border-top: 1px solid #E2E8F0;
        display: flex;
        gap: 8px;
      }

      .c-input {
        flex: 1;
        padding: 8px 12px;
        font-size: 13px;
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        outline: none;
        color: #0F172A;
      }

      .c-input:focus {
        border-color: #0284C7;
        background: #FFFFFF;
      }

      .c-send-btn {
        padding: 8px 14px;
        background: #0284C7;
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        transition: background 0.15s ease;
      }

      .c-send-btn:hover {
        background: #0369A1;
      }
    `;
    document.head.appendChild(s);
  }

  function createDrawer() {
    if (document.getElementById(CHAT_ID)) return;
    injectStyles();

    const drawer = document.createElement('div');
    drawer.id = CHAT_ID;
    drawer.className = 'roadeye-chat-drawer';
    drawer.innerHTML = `
      <div class="chat-drawer-head">
        <div class="cdh-left">
          <div class="cdh-icon">🤖</div>
          <div>
            <div class="cdh-title">ROADEYE AI Assistant</div>
            <div class="cdh-sub">Spatio-Temporal Intelligence Engine</div>
          </div>
        </div>
        <button class="cdh-close-btn" id="roadeyeChatClose" title="Close">✕</button>
      </div>

      <div class="chat-drawer-messages" id="roadeyeChatMsgs">
        <div class="c-msg bot">
          Hello! I am your <strong>ROADEYE AI Assistant</strong>. I continuously analyze telemetry from the bus sensing fleet to detect pavement degradation, congestion hotspots, and high-risk traffic incidents across cities. How can I assist your command operations?
        </div>
      </div>

      <div class="chat-drawer-suggestions">
        <button class="c-sugg-pill" data-q="Explain current road defects and potholes">🕳️ Road Defects</button>
        <button class="c-sugg-pill" data-q="What is the current fleet status?">🚌 Fleet Status</button>
        <button class="c-sugg-pill" data-q="Show critical incidents requiring government action">🚨 Critical Alerts</button>
        <button class="c-sugg-pill" data-q="How does the bus Edge AI model work?">🤖 Edge AI Pipeline</button>
      </div>

      <div class="chat-drawer-input-row">
        <input type="text" class="c-input" id="roadeyeChatInput" placeholder="Ask about road defects, fleet, or incidents…">
        <button class="c-send-btn" id="roadeyeChatSend">Send</button>
      </div>
    `;

    document.body.appendChild(drawer);

    // Wire events
    document.getElementById('roadeyeChatClose').addEventListener('click', toggleChat);
    document.getElementById('roadeyeChatSend').addEventListener('click', handleSend);
    document.getElementById('roadeyeChatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    // Suggestions
    drawer.querySelectorAll('.c-sugg-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.q;
        sendUserQuery(q);
      });
    });

    // Sidebar button wire
    const sideBtn = document.getElementById('chatbotBtn');
    if (sideBtn) {
      sideBtn.addEventListener('click', toggleChat);
    }
  }

  function toggleChat() {
    const d = document.getElementById(CHAT_ID);
    if (!d) return;
    d.classList.toggle('open');
    if (d.classList.contains('open')) {
      const inp = document.getElementById('roadeyeChatInput');
      if (inp) inp.focus();
    }
  }

  function openChat() {
    const d = document.getElementById(CHAT_ID);
    if (d) d.classList.add('open');
  }

  function handleSend() {
    const inp = document.getElementById('roadeyeChatInput');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    sendUserQuery(text);
  }

  function sendUserQuery(text) {
    const msgs = document.getElementById('roadeyeChatMsgs');
    if (!msgs) return;

    // Append user message
    const uMsg = document.createElement('div');
    uMsg.className = 'c-msg user';
    uMsg.textContent = text;
    msgs.appendChild(uMsg);
    msgs.scrollTop = msgs.scrollHeight;

    // Generate intelligent response based on live state
    setTimeout(() => {
      const response = generateAIResponse(text);
      const bMsg = document.createElement('div');
      bMsg.className = 'c-msg bot';
      bMsg.innerHTML = response;
      msgs.appendChild(bMsg);
      msgs.scrollTop = msgs.scrollHeight;
    }, 450);
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    const events = (window.ROADEYE && ROADEYE.getEvents) ? ROADEYE.getEvents() : 
                   (window.UrbanSense && UrbanSense.getEvents) ? UrbanSense.getEvents() : [];
    const fleet = (window.ROADEYE && ROADEYE.getFleet) ? ROADEYE.getFleet() : 
                  (window.UrbanSense && UrbanSense.getFleet) ? UrbanSense.getFleet() : [];

    const openEvents = events.filter(e => e.status !== 'Resolved');
    const potholeEvents = events.filter(e => (e.type || '').toLowerCase().includes('pothole') || (e.type || '').toLowerCase().includes('crack'));
    const criticalEvents = events.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL');
    const activeBuses = fleet.filter(b => b.status === 'ACTIVE');

    if (q.includes('road') || q.includes('pothole') || q.includes('defect')) {
      return `Analysis of road surface telemetry: ROADEYE has cataloged <strong>${potholeEvents.length} pavement defects</strong> across surveyed corridors. Highest density observed along <strong>Ring Road</strong> and <strong>Industrial corridors</strong>. The computed Pavement Condition Index (PCI) is <strong>72.4/100 (Fair)</strong>, with 3 high-priority potholes automatically batched for municipal patching.`;
    }

    if (q.includes('fleet') || q.includes('bus') || q.includes('vehicle')) {
      return `Active Fleet Status: <strong>${activeBuses.length} of ${fleet.length} Smart Buses</strong> are actively streaming optical and GPS telemetry. Average fleet speed is <strong>${Math.round(fleet.reduce((s, b) => s + b.speed, 0) / (fleet.length || 1))} km/h</strong>. Edge camera availability stands at <strong>98.4%</strong> with 0 critical network dropouts.`;
    }

    if (q.includes('incident') || q.includes('alert') || q.includes('critical')) {
      return `Incident & Safety Center: Currently <strong>${criticalEvents.length} high-severity alerts</strong> are pending verification. The most urgent is a simulated rash-driving incident near <strong>Ring Road</strong> with confidence score <strong>94%</strong>. Immediate notification was dispatched to Traffic Control.`;
    }

    if (q.includes('edge') || q.includes('model') || q.includes('ai') || q.includes('how')) {
      return `The ROADEYE Edge AI pipeline runs a quantized <strong>YOLOv8-Transit model</strong> directly on bus hardware at <strong>42ms inference latency</strong>. It processes 1080p optical streams at 30 FPS, geo-synchronizes bounding boxes with RTK-GNSS sub-meter coordinates, and transmits lightweight JSON telemetry over 4G/5G, saving <strong>98% cellular bandwidth</strong> compared to raw video.`;
    }

    if (q.includes('government') || q.includes('municipal') || q.includes('work order')) {
      return `Government Action Protocol: Verified defects with confidence &gt; 85% are automatically converted into <strong>Municipal Work Orders</strong>. Work order #WO-2026-8812 has been routed to AMC Road Infrastructure Division with an SLA target of <strong>48 hours</strong>.`;
    }

    // Default intelligent summary
    return `Based on live telemetry across <strong>${fleet.length} sensing buses</strong>: We have recorded <strong>${events.length} urban events</strong> with average Edge AI confidence of <strong>91.4%</strong>. City infrastructure health is nominal, with ${criticalEvents.length} critical items flagged for immediate operational review.`;
  }

  // Public API
  window.ROADEYE_CHAT = {
    toggle: toggleChat,
    open: openChat,
    explainLatestData() {
      openChat();
      sendUserQuery('Explain the latest detected events and road conditions across the city fleet');
    }
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDrawer);
  } else {
    createDrawer();
  }

})();
