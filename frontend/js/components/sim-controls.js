/* =========================================================
   ROADEYE — SIMULATION CONTROLS & FULL DEMO ORCHESTRATOR
   Provides floating controls and orchestrates the complete 14-step demo flow:
   STEP 9: Runs: START DEMO
   STEP 10: Multiple buses detect events across multiple cities.
   STEP 11: Events appear on GIS.
   STEP 12: AI Assistant explains the data.
   STEP 13: Government workflow converts verified problems into actionable reports.
   STEP 14: Field team resolves the issue.
   ========================================================= */

(function () {

  const PANEL_ID = 'simControls';
  const STATE_KEY = 'roadeye_sim_state';

  let paused = false;
  let eventRate = 12;
  let autoTimer = null;

  /* =========================================================
     STYLES (LIGHT THEME MATCHING)
     ========================================================= */

  function injectStyles() {
    if (document.getElementById('simControlStyles')) return;
    const s = document.createElement('style');
    s.id = 'simControlStyles';
    s.textContent = `
      .sim-controls {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 9985;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid #CBD5E1;
        border-radius: 14px;
        box-shadow: 0 16px 36px -8px rgba(2, 132, 199, 0.18), 0 4px 16px rgba(15, 23, 42, 0.08);
        backdrop-filter: blur(14px);
        width: 290px;
        overflow: hidden;
        transition: all 240ms ease;
        font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
      }
      .sim-controls.collapsed {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
      }
      .sim-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 14px;
        background: linear-gradient(135deg, #F0F9FF, #E0F2FE);
        border-bottom: 1px solid #BAE6FD;
        cursor: pointer;
      }
      .sim-controls.collapsed .sim-header {
        padding: 0;
        justify-content: center;
        border: none;
        background: linear-gradient(135deg, #0284C7, #06B6D4);
        height: 100%;
      }
      .sim-header-icon {
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        font-size: 13px;
        color: #0284C7;
      }
      .sim-controls.collapsed .sim-header-icon {
        color: #FFFFFF;
        font-size: 18px;
      }
      .sim-header-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #0F172A;
        text-transform: uppercase;
        flex: 1;
      }
      .sim-controls.collapsed .sim-header-title,
      .sim-controls.collapsed .sim-header-toggle {
        display: none;
      }
      .sim-header-toggle {
        width: 16px;
        height: 16px;
        display: grid;
        place-items: center;
        font-size: 12px;
        color: #64748B;
      }
      .sim-body {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #FFFFFF;
      }
      .sim-controls.collapsed .sim-body {
        display: none;
      }
      .sim-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #ECFDF5;
        border: 1px solid #A7F3D0;
        border-radius: 6px;
        font-size: 11px;
        font-family: var(--font-mono, monospace);
        font-weight: 700;
        color: #047857;
      }
      .sim-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10B981;
      }
      .sim-status.paused .sim-status-dot {
        background: #EA580C;
      }
      .sim-status.paused {
        background: #FFF7ED;
        border-color: #FED7AA;
        color: #C2410C;
      }
      .sim-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .sim-btn {
        height: 32px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
        background: #F8FAFC;
        color: #1E293B;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 120ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .sim-btn:hover {
        background: #EFF6FF;
        border-color: #0284C7;
        color: #0284C7;
      }
      .sim-btn.primary {
        background: #0284C7;
        color: #FFFFFF;
        border-color: #0284C7;
      }
      .sim-btn.primary:hover {
        background: #0369A1;
        color: #FFFFFF;
      }
      .sim-btn.flow-action {
        grid-column: 1 / -1;
        height: 36px;
        background: linear-gradient(135deg, #0284C7, #0D9488);
        color: #FFFFFF;
        border: none;
        box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
      }
      .sim-btn.flow-action:hover {
        background: linear-gradient(135deg, #0369A1, #0F766E);
        color: #FFFFFF;
        transform: translateY(-1px);
      }
      .sim-btn.danger {
        grid-column: 1 / -1;
        color: #DC2626;
        border-color: #FECACA;
        background: #FFF5F5;
      }
      .sim-btn.danger:hover {
        background: #FEF2F2;
      }
      .sim-rate {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 6px;
        font-size: 11px;
      }
      .sim-rate-label {
        color: #64748B;
        font-weight: 600;
      }
      .sim-rate-value {
        color: #0284C7;
        font-weight: 700;
        font-family: var(--font-mono, monospace);
      }
      .sim-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid #E2E8F0;
      }
      .sim-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sim-stat-label {
        font-size: 9px;
        color: #64748B;
        font-weight: 600;
        text-transform: uppercase;
      }
      .sim-stat-value {
        font-size: 14px;
        font-weight: 800;
        color: #0F172A;
        font-family: var(--font-mono, monospace);
      }
    `;
    document.head.appendChild(s);
  }

  /* =========================================================
     BUILD PANEL
     ========================================================= */

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const el = document.createElement('div');
    el.id = PANEL_ID;
    el.className = 'sim-controls';
    el.innerHTML = `
      <div class="sim-header" id="simHeader" title="Click to collapse / expand">
        <div class="sim-header-icon">🎮</div>
        <div class="sim-header-title">ROADEYE Simulation</div>
        <div class="sim-header-toggle">▾</div>
      </div>
      <div class="sim-body">
        <div class="sim-status" id="simStatus">
          <span class="sim-status-dot"></span>
          <span id="simStatusText">FLEET MESH STREAMING</span>
        </div>

        <!-- Automated Complete Demo Flow (Steps 9-14) -->
        <button class="sim-btn flow-action" id="btnStartDemoFlow">
          <span>⚡</span>
          <span>START DEMO FLOW</span>
        </button>

        <div class="sim-buttons">
          <button class="sim-btn primary" id="simToggle">⏸ Pause</button>
          <button class="sim-btn" id="simStep">⏭ Step Frame</button>
        </div>

        <button class="sim-btn danger" id="simReset">⟲ Reset Demo Data</button>

        <div class="sim-rate">
          <span class="sim-rate-label">Autonomous Rate</span>
          <span class="sim-rate-value" id="simRateValue">Every 12s</span>
        </div>

        <div class="sim-stats">
          <div class="sim-stat">
            <div class="sim-stat-label">Events</div>
            <div class="sim-stat-value" id="simStatEvents">0</div>
          </div>
          <div class="sim-stat">
            <div class="sim-stat-label">Smart Buses</div>
            <div class="sim-stat-value" id="simStatBuses">8/8</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('simHeader').addEventListener('click', () => {
      el.classList.toggle('collapsed');
    });

    document.getElementById('simToggle').addEventListener('click', togglePause);
    document.getElementById('simStep').addEventListener('click', stepOnce);
    document.getElementById('simReset').addEventListener('click', resetDemo);
    document.getElementById('btnStartDemoFlow').addEventListener('click', runFullDemoFlow);
  }

  /* =========================================================
     FULL DEMO FLOW (STEPS 9 - 14)
     ========================================================= */

  async function runFullDemoFlow() {
    const notify = (window.ROADEYE && ROADEYE.showToast) || (window.UrbanSense && UrbanSense.showToast) || console.log;

    // STEP 9: Runs: START DEMO
    notify('🎮 STEP 9: Initializing Full ROADEYE Demo Flow...', 'info');

    // STEP 10: Multiple buses detect events across multiple cities
    setTimeout(async () => {
      notify('🚌 STEP 10: Multi-city fleet detecting events (Ahmedabad, Rajkot, Mumbai, Delhi)...', 'info');

      const demoEvents = [
        { bus: 'GJ01-BUS-001', city: 'Ahmedabad', type: 'Pothole', location: 'Ashram Road (Near Riverfront)', sev: 'HIGH' },
        { bus: 'GJ01-BUS-002', city: 'Ahmedabad', type: 'Traffic Density', location: 'SG Highway Flyover', sev: 'MEDIUM' },
        { bus: 'GJ03-BUS-001', city: 'Rajkot', type: 'Road Crack', location: 'Kalawad Road', sev: 'LOW' },
        { bus: 'MH01-BUS-001', city: 'Mumbai', type: 'Waterlogging', location: 'Western Express Highway', sev: 'HIGH' },
        { bus: 'DL01-BUS-002', city: 'Delhi', type: 'Missing Divider', location: 'Outer Ring Road (Near Nehru Place)', sev: 'MEDIUM' },
        { bus: 'KA01-BUS-001', city: 'Bengaluru', type: 'Rash Driving', location: 'Outer Ring Road Bellandur', sev: 'CRITICAL' }
      ];

      for (const ev of demoEvents) {
        if (window.UrbanAPI && UrbanAPI.createEvent) {
          try {
            await UrbanAPI.createEvent({
              type: ev.type,
              bus_id: ev.bus,
              severity: ev.sev,
              location: ev.location,
              notes: `Simulated edge detection in ${ev.city}`
            });
          } catch(e){}
        } else if (window.ROADEYE && ROADEYE.addEvent) {
          ROADEYE.addEvent({
            type: ev.type,
            busId: ev.bus,
            severity: ev.sev,
            location: ev.location
          });
        }
      }

      // STEP 11: Events appear on GIS
      setTimeout(() => {
        notify('🗺️ STEP 11: Real-time detections mapped onto GIS spatial grid.', 'success');
        window.dispatchEvent(new CustomEvent('urbansense:newEvent'));
        window.dispatchEvent(new CustomEvent('roadeye:newEvent'));
        if (typeof updateDashboard === 'function') updateDashboard();

        // STEP 12: AI Assistant explains the data
        setTimeout(() => {
          notify('💬 STEP 12: AI Assistant analyzing incoming multi-city telemetry...', 'info');
          if (window.ROADEYE_CHAT && ROADEYE_CHAT.explainLatestData) {
            ROADEYE_CHAT.explainLatestData();
          }

          // STEP 13: Government workflow converts verified problems into actionable reports
          setTimeout(() => {
            notify('🏛️ STEP 13: Government Workflow: Verified Ashram Rd Pothole converted into Municipal Work Order #WO-8812.', 'success');

            // STEP 14: Field team resolves the issue
            setTimeout(() => {
              notify('✅ STEP 14: Field Operations team dispatched. Automated re-scan scheduled for bus run GJ01-BUS-002.', 'success');
            }, 3000);

          }, 3200);

        }, 2800);

      }, 1600);

    }, 1200);
  }

  /* =========================================================
     ACTIONS
     ========================================================= */

  function togglePause() {
    paused = !paused;
    localStorage.setItem(STATE_KEY, paused ? 'paused' : 'running');

    const statusEl = document.getElementById('simStatus');
    const statusText = document.getElementById('simStatusText');
    const toggleBtn = document.getElementById('simToggle');

    if (paused) {
      statusEl.classList.add('paused');
      statusText.textContent = 'SIMULATION PAUSED';
      toggleBtn.innerHTML = '▶ Resume';
      stopAutoTimer();
    } else {
      statusEl.classList.remove('paused');
      statusText.textContent = 'FLEET MESH STREAMING';
      toggleBtn.innerHTML = '⏸ Pause';
      startAutoTimer();
    }

    const notify = (window.ROADEYE && ROADEYE.showToast) || (window.UrbanSense && UrbanSense.showToast);
    if (notify) {
      notify(paused ? 'Simulation paused' : 'Simulation resumed', paused ? 'warning' : 'success');
    }
  }

  async function stepOnce() {
    try {
      if (window.UrbanAPI && UrbanAPI.getFleet) {
        const busList = await UrbanAPI.getFleet();
        if (!busList || busList.length === 0) return;

        const active = busList.filter(b => b.status === 'ACTIVE');
        const bus = active[Math.floor(Math.random() * active.length)] || busList[0];
        const types = ['Pothole', 'Road Crack', 'Waterlogging', 'Pedestrian', 'Traffic Density', 'Traffic Sign'];
        const type = types[Math.floor(Math.random() * types.length)];

        const saved = await UrbanAPI.createEvent({
          type: type,
          bus_id: bus.id,
        });

        const notify = (window.ROADEYE && ROADEYE.showToast) || (window.UrbanSense && UrbanSense.showToast);
        if (saved && notify) {
          notify(`Detected: ${type} · ${bus.id}`, 'success');
        }
      }
    } catch (e) {
      console.warn('[sim-controls] Step failed:', e);
    }
  }

  async function resetDemo() {
    if (!confirm('Reset all demo data? This will clear all events and work orders.')) return;

    try {
      if (window.UrbanAPI && UrbanAPI.clearEvents) {
        await UrbanAPI.clearEvents();
      }
      localStorage.removeItem('urbansense_events');
      localStorage.removeItem('roadeye_events');
      const notify = (window.ROADEYE && ROADEYE.showToast) || (window.UrbanSense && UrbanSense.showToast);
      if (notify) notify('Demo data cleared. Reloading...', 'success');
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      alert('Reset failed: ' + e.message);
    }
  }

  function startAutoTimer() {
    stopAutoTimer();
    if (paused) return;
    autoTimer = setInterval(() => {
      if (!paused) stepOnce();
    }, eventRate * 1000);
  }

  function stopAutoTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  async function updateStats() {
    try {
      let eventCount = 0;
      let fleetCount = 8;
      let activeCount = 6;

      if (window.UrbanAPI && UrbanAPI.getEvents) {
        const [fleet, events] = await Promise.all([
          UrbanAPI.getFleet(),
          UrbanAPI.getEvents({ limit: 500 }),
        ]);
        if (events) eventCount = events.length;
        if (fleet) {
          fleetCount = fleet.length;
          activeCount = fleet.filter(b => b.status === 'ACTIVE').length;
        }
      } else if (window.ROADEYE && ROADEYE.getEvents) {
        eventCount = ROADEYE.getEvents().length;
        const fleet = ROADEYE.getFleet();
        fleetCount = fleet.length;
        activeCount = fleet.filter(b => b.status === 'ACTIVE').length;
      }

      const eventsEl = document.getElementById('simStatEvents');
      const busesEl = document.getElementById('simStatBuses');
      if (eventsEl) eventsEl.textContent = eventCount;
      if (busesEl) busesEl.textContent = `${activeCount}/${fleetCount}`;
    } catch (e) {}
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    // Only init if in command center / dashboard / pages
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('index.html') || path.endsWith('welcome.html') || path.endsWith('login.html') || path === '/' || path === '') {
      return;
    }

    injectStyles();
    createPanel();

    const saved = localStorage.getItem(STATE_KEY);
    paused = (saved === 'paused');
    if (paused) {
      const statusEl = document.getElementById('simStatus');
      const statusText = document.getElementById('simStatusText');
      const toggleBtn = document.getElementById('simToggle');
      if (statusEl) statusEl.classList.add('paused');
      if (statusText) statusText.textContent = 'SIMULATION PAUSED';
      if (toggleBtn) toggleBtn.innerHTML = '▶ Resume';
    } else {
      startAutoTimer();
    }

    updateStats();
    setInterval(updateStats, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SimControls = {
    pause: function () { if (!paused) togglePause(); },
    resume: function () { if (paused) togglePause(); },
    isPaused: function () { return paused; },
    step: stepOnce,
    startDemoFlow: runFullDemoFlow
  };

})();