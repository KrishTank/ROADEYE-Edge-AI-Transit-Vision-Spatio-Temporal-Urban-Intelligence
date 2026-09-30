/* =========================================================
   URBANSENSE AI — SIMULATION CONTROLS
   Floating panel: Start / Pause / Reset the demo simulation.
   ========================================================= */

(function () {

  const PANEL_ID = 'simControls';
  const STATE_KEY = 'urbansense_sim_state';

  let paused = false;
  let eventRate = 12;
  let autoTimer = null;

  /* =========================================================
     STYLES
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
        background: rgba(13, 20, 32, 0.95);
        border: 1px solid var(--border-strong);
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(12px);
        width: 260px;
        overflow: hidden;
        transition: all 240ms ease;
        font-family: var(--font-mono);
      }
      .sim-controls.collapsed {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }
      .sim-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: linear-gradient(135deg, rgba(0,229,255,.1), rgba(139,92,246,.1));
        border-bottom: 1px solid var(--border-subtle);
        cursor: pointer;
      }
      .sim-controls.collapsed .sim-header {
        padding: 0;
        justify-content: center;
        border: none;
        background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
      }
      .sim-header-icon {
        width: 20px;
        height: 20px;
        display: grid;
        place-items: center;
        font-size: 12px;
        color: var(--accent-cyan);
      }
      .sim-controls.collapsed .sim-header-icon {
        color: #001018;
        font-size: 16px;
      }
      .sim-header-title {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: var(--text-primary);
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
        color: var(--text-muted);
      }
      .sim-body {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sim-controls.collapsed .sim-body {
        display: none;
      }
      .sim-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: var(--bg-elevated);
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: var(--accent-green);
      }
      .sim-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent-green);
        box-shadow: 0 0 8px var(--accent-green);
      }
      .sim-status.paused .sim-status-dot {
        background: var(--accent-amber);
        box-shadow: 0 0 8px var(--accent-amber);
      }
      .sim-status.paused {
        color: var(--accent-amber);
      }
      .sim-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .sim-btn {
        height: 34px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid var(--border-subtle);
        background: var(--bg-elevated);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 120ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .sim-btn:hover {
        background: var(--bg-hover);
        border-color: var(--border-strong);
      }
      .sim-btn.primary {
        background: var(--accent-cyan);
        color: #001018;
        border-color: var(--accent-cyan);
      }
      .sim-btn.primary:hover {
        background: #33ECFF;
      }
      .sim-btn.danger {
        color: var(--accent-red);
        border-color: rgba(255,59,71,0.3);
      }
      .sim-btn.danger:hover {
        background: rgba(255,59,71,0.1);
      }
      .sim-btn.full {
        grid-column: 1 / -1;
      }
      .sim-rate {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        background: var(--bg-elevated);
        border-radius: 6px;
        font-size: 10px;
      }
      .sim-rate-label {
        color: var(--text-muted);
        letter-spacing: 0.6px;
        text-transform: uppercase;
        font-size: 9px;
      }
      .sim-rate-value {
        color: var(--accent-cyan);
        font-weight: 700;
      }
      .sim-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-subtle);
      }
      .sim-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .sim-stat-label {
        font-size: 8px;
        color: var(--text-dim);
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
      .sim-stat-value {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
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
      <div class="sim-header" id="simHeader">
        <div class="sim-header-icon">⚙</div>
        <div class="sim-header-title">Simulation Control</div>
        <div class="sim-header-toggle">▾</div>
      </div>
      <div class="sim-body">
        <div class="sim-status" id="simStatus">
          <span class="sim-status-dot"></span>
          <span id="simStatusText">SIMULATION RUNNING</span>
        </div>

        <div class="sim-buttons">
          <button class="sim-btn primary" id="simToggle">⏸ Pause</button>
          <button class="sim-btn" id="simStep">⏭ Step</button>
          <button class="sim-btn danger full" id="simReset">⟲ Reset Demo Data</button>
        </div>

        <div class="sim-rate">
          <span class="sim-rate-label">Event Rate</span>
          <span class="sim-rate-value" id="simRateValue">Every 12s</span>
        </div>

        <div class="sim-stats">
          <div class="sim-stat">
            <div class="sim-stat-label">Events</div>
            <div class="sim-stat-value" id="simStatEvents">0</div>
          </div>
          <div class="sim-stat">
            <div class="sim-stat-label">Buses</div>
            <div class="sim-stat-value" id="simStatBuses">0</div>
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
      statusText.textContent = 'SIMULATION RUNNING';
      toggleBtn.innerHTML = '⏸ Pause';
      startAutoTimer();
    }

    window.dispatchEvent(new CustomEvent('urbansense:simStateChange', {
      detail: { paused: paused },
    }));

    UrbanSense.showToast(paused ? 'Simulation paused' : 'Simulation resumed', paused ? 'warning' : 'success');
  }

  async function stepOnce() {
    try {
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

      if (saved) {
        UrbanSense.showToast('Manual step: ' + type + ' · ' + bus.id, 'success');
      }
    } catch (e) {
      console.warn('[sim-controls] Step failed:', e);
    }
  }

  async function resetDemo() {
    if (!confirm('Reset all demo data? This will clear all events and work orders.')) return;

    try {
      await UrbanAPI.clearEvents();
      UrbanSense.showToast('Demo data cleared. Refresh to reload.', 'success');
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      UrbanSense.showToast('Reset failed: ' + e.message, 'error');
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
      const [fleet, events] = await Promise.all([
        UrbanAPI.getFleet(),
        UrbanAPI.getEvents({ limit: 500 }),
      ]);

      const eventsEl = document.getElementById('simStatEvents');
      const busesEl = document.getElementById('simStatBuses');

      if (eventsEl) eventsEl.textContent = events ? events.length : 0;
      if (busesEl && fleet) {
        const active = fleet.filter(b => b.status === 'ACTIVE').length;
        busesEl.textContent = active + '/' + fleet.length;
      }
    } catch (e) {}
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    injectStyles();
    createPanel();

    const saved = localStorage.getItem(STATE_KEY);
    paused = (saved === 'paused');
    if (paused) {
      const statusEl = document.getElementById('simStatus');
      const statusText = document.getElementById('simStatusText');
      const toggleBtn = document.getElementById('simToggle');
      statusEl.classList.add('paused');
      statusText.textContent = 'SIMULATION PAUSED';
      toggleBtn.innerHTML = '▶ Resume';
    } else {
      startAutoTimer();
    }

    updateStats();
    setInterval(updateStats, 4000);

    console.log('[sim-controls] Ready.');
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
  };

})();