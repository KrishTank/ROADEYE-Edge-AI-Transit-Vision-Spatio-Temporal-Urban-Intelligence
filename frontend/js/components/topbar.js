/* =========================================================
   URBANSENSE AI — GLOBAL TOP BAR
   Injects a top bar across every page.
   ========================================================= */

(function () {

  function ensureTopBar() {
    if (document.getElementById('globalTopBar')) return;

    const app = document.querySelector('.app');
    if (!app) return;

    // Wrap the whole app in a column
    app.classList.add('has-topbar');

    const bar = document.createElement('header');
    bar.id = 'globalTopBar';
    bar.className = 'global-topbar';
    bar.innerHTML = `
      <div class="gtb-brand">
        <div class="gtb-logo">U</div>
        <div>
          <div class="gtb-name">UrbanSense AI</div>
          <div class="gtb-sub">SMART CITY COMMAND</div>
        </div>
      </div>

      <div class="gtb-search">
        <span class="gtb-search-icon">🔍</span>
        <input type="text" id="gtbSearch" placeholder="Search bus, plate, location, incident…">
      </div>

      <div class="gtb-meta">
        <div class="gtb-demo">
          <span class="gtb-demo-dot"></span>
          DEMO MODE
        </div>
        <div class="gtb-clock" id="gtbClock">--:--:--</div>
        <button class="gtb-btn" id="gtbAlertsBtn" title="Alerts">
          🔔
          <span class="gtb-badge" id="gtbAlertCount">0</span>
        </button>
        <button class="gtb-btn" id="gtbProfileBtn" title="Command profile">
          👤
        </button>
      </div>
    `;

    document.body.insertBefore(bar, app);

    // Wire events
    setupClock();
    setupSearch();
    setupAlerts();
    setupProfile();
  }

  /* ============ CLOCK ============ */

  function setupClock() {
    const el = document.getElementById('gtbClock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      el.textContent = d.toLocaleTimeString('en-GB');
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ============ SEARCH ============ */

  function setupSearch() {
    const input = document.getElementById('gtbSearch');
    if (!input) return;

    let timer;
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = input.value.trim();
      if (!q) return;
      navigateForQuery(q);
    });

    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        if (!q) return;

        // If it looks like a plate (5+ chars, digits + letters, no spaces)
        if (/^[a-z]{2}\d{1,2}[a-z]{1,3}\d{3,4}$/i.test(q.replace(/\s/g, ''))) {
          window.location.href = 'ocr.html?plate=' + encodeURIComponent(q.toUpperCase());
        }
      }, 600);
    });
  }

  function navigateForQuery(q) {
    const lower = q.toLowerCase();

    // Plate pattern → OCR page
    if (/^[a-z]{2}\d{1,2}[a-z]{1,3}\d{3,4}$/i.test(q.replace(/\s/g, ''))) {
      window.location.href = 'ocr.html?plate=' + encodeURIComponent(q.toUpperCase());
      return;
    }
    // Bus ID pattern → Fleet page
    if (/^bus-?\d+/i.test(q)) {
      window.location.href = 'fleet.html?bus=' + encodeURIComponent(q.toUpperCase());
      return;
    }
    // Default → GIS page (searches map)
    window.location.href = 'gis.html?q=' + encodeURIComponent(q);
  }

  /* ============ ALERTS ============ */

  async function setupAlerts() {
    const btn = document.getElementById('gtbAlertsBtn');
    const count = document.getElementById('gtbAlertCount');
    if (!btn || !count) return;

    // Update count from backend
    async function refresh() {
      try {
        const res = await fetch('http://localhost:5000/api/events?limit=100').then(r => r.json());
        if (res.success) {
          const open = res.data.filter(e => e.status !== 'Resolved').length;
          count.textContent = open > 99 ? '99+' : String(open);
          count.style.display = open > 0 ? 'grid' : 'none';
        }
      } catch (e) {}
    }
    refresh();
    setInterval(refresh, 15000);

    btn.addEventListener('click', () => {
      window.location.href = 'incidents.html';
    });

    // Live update on SSE
    window.addEventListener('urbansense:newEvent', refresh);
  }

  /* ============ PROFILE ============ */

  function setupProfile() {
    const btn = document.getElementById('gtbProfileBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (window.UrbanSense && UrbanSense.showToast) {
        UrbanSense.showToast('AMC Command · Operations Lead', 'info');
      }
    });
  }

  /* ============ INIT ============ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureTopBar);
  } else {
    ensureTopBar();
  }

  console.log('[topbar] Loaded.');

})();