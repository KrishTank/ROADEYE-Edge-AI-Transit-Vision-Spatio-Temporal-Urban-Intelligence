/* =========================================================
   ROADEYE — GLOBAL COMMAND TOPBAR
   Injects the unified light-theme operational header across every page.
   Displays: ROADEYE branding, Current Role, DEMO MODE, Selected City, System Status.
   ========================================================= */

(function () {

  function injectStyles() {
    if (document.getElementById('roadeyeTopBarStyles')) return;
    const s = document.createElement('style');
    s.id = 'roadeyeTopBarStyles';
    s.textContent = `
      .global-topbar {
        position: sticky;
        top: 0;
        z-index: 10000;
        height: 60px;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid #E2E8F0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        font-family: var(--font-sans, 'Plus Jakarta Sans', -apple-system, sans-serif);
      }

      .gtb-left {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .gtb-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #0F172A;
      }

      .gtb-logo {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: linear-gradient(135deg, #0284C7, #06B6D4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: 800;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
      }

      .gtb-name {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }

      .gtb-sub {
        font-size: 9px;
        font-family: var(--font-mono, monospace);
        font-weight: 700;
        color: #0284C7;
        letter-spacing: 0.08em;
      }

      .gtb-search-wrap {
        position: relative;
        width: 260px;
      }

      .gtb-search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 6px 12px 6px 32px;
        font-size: 12px;
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        border-radius: 8px;
        color: #0F172A;
        outline: none;
        transition: all 0.15s ease;
      }

      .gtb-search-input:focus {
        border-color: #0284C7;
        background: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
      }

      .gtb-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: #64748B;
        pointer-events: none;
      }

      .gtb-meta {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .gtb-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        color: #1E293B;
      }

      .gtb-chip.role-chip {
        background: #EFF6FF;
        border-color: #BAE6FD;
        color: #0284C7;
        font-weight: 700;
      }

      .gtb-chip.demo-chip {
        background: #FEF3C7;
        border-color: #FDE68A;
        color: #92400E;
        font-family: var(--font-mono, monospace);
        font-size: 10px;
        font-weight: 700;
      }

      .gtb-chip.status-chip {
        background: #ECFDF5;
        border-color: #A7F3D0;
        color: #065F46;
      }

      .gtb-city-select {
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        color: #0F172A;
        outline: none;
        cursor: pointer;
      }

      .gtb-city-select:focus {
        border-color: #0284C7;
      }

      .gtb-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        position: relative;
        transition: all 0.15s ease;
      }

      .gtb-btn:hover {
        background: #F1F5F9;
        color: #0284C7;
        border-color: #0284C7;
      }

      .gtb-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #EF4444;
        color: #FFFFFF;
        font-size: 9px;
        font-weight: 700;
        border-radius: 9999px;
        padding: 1px 5px;
      }

      .gtb-clock {
        font-family: var(--font-mono, monospace);
        font-size: 11px;
        font-weight: 600;
        color: #475569;
        background: #F8FAFC;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #E2E8F0;
      }

      .gtb-signout {
        font-size: 11px;
        font-weight: 700;
        color: #64748B;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
        background: #FFFFFF;
        transition: all 0.15s ease;
      }

      .gtb-signout:hover {
        background: #FEF2F2;
        color: #DC2626;
        border-color: #FECACA;
      }

      @media (max-width: 900px) {
        .gtb-search-wrap, .gtb-chip.status-chip { display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  function ensureTopBar() {
    if (document.getElementById('globalTopBar')) return;

    // Do not inject on Landing or Welcome or Login pages
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('index.html') || path.endsWith('welcome.html') || path.endsWith('login.html') || path === '/' || path === '') {
      return;
    }

    injectStyles();

    const app = document.querySelector('.app') || document.querySelector('.app-v2') || document.body;
    const currentRole = localStorage.getItem('roadeye_role') || localStorage.getItem('urbansense_role') || 'Transport Authority';
    const currentCity = localStorage.getItem('roadeye_city') || 'Ahmedabad';

    // Determine correct relative prefix
    const isSubdir = path.includes('/pages/');
    const homeHref = isSubdir ? '../dashboard.html' : 'dashboard.html';
    const loginHref = isSubdir ? '../login.html' : 'login.html';

    const bar = document.createElement('header');
    bar.id = 'globalTopBar';
    bar.className = 'global-topbar';
    bar.innerHTML = `
      <div class="gtb-left">
        <a href="${homeHref}" class="gtb-brand">
          <div class="gtb-logo">R</div>
          <div>
            <div class="gtb-name">ROADEYE</div>
            <div class="gtb-sub">EDGE-AI TRANSIT VISION</div>
          </div>
        </a>

        <div class="gtb-search-wrap">
          <span class="gtb-search-icon">🔍</span>
          <input type="text" id="gtbSearch" class="gtb-search-input" placeholder="Search bus, plate, defect, route…">
        </div>
      </div>

      <div class="gtb-meta">
        <!-- Current Role -->
        <div class="gtb-chip role-chip" title="Active Operational Role">
          <span>👤</span>
          <span id="gtbRoleText">${currentRole}</span>
        </div>

        <!-- DEMO MODE -->
        <div class="gtb-chip demo-chip">
          <span>⚡ DEMO MODE</span>
        </div>

        <!-- Selected City Dropdown -->
        <div class="gtb-chip" style="background:#FFFFFF; padding:2px 8px;">
          <span>📍</span>
          <select id="gtbCitySelect" class="gtb-city-select">
            <option value="Ahmedabad"${currentCity === 'Ahmedabad' ? ' selected' : ''}>Ahmedabad</option>
            <option value="Rajkot"${currentCity === 'Rajkot' ? ' selected' : ''}>Rajkot</option>
            <option value="Surat"${currentCity === 'Surat' ? ' selected' : ''}>Surat</option>
            <option value="Vadodara"${currentCity === 'Vadodara' ? ' selected' : ''}>Vadodara</option>
            <option value="Mumbai"${currentCity === 'Mumbai' ? ' selected' : ''}>Mumbai</option>
            <option value="Delhi"${currentCity === 'Delhi' ? ' selected' : ''}>Delhi</option>
            <option value="Bengaluru"${currentCity === 'Bengaluru' ? ' selected' : ''}>Bengaluru</option>
          </select>
        </div>

        <!-- System Status -->
        <div class="gtb-chip status-chip">
          <span style="width:6px; height:6px; border-radius:50%; background:#10B981;"></span>
          <span>Online · Edge Mesh</span>
        </div>

        <!-- Live Clock -->
        <div class="gtb-clock" id="gtbClock">00:00:00</div>

        <!-- Alerts -->
        <button class="gtb-btn" id="gtbAlertsBtn" title="Active Alerts">
          🔔
          <span class="gtb-badge" id="gtbAlertCount" style="display:none;">0</span>
        </button>

        <!-- AI Assistant Quick Launch -->
        <button class="gtb-btn" id="gtbChatBtn" title="ROADEYE AI Assistant" style="color:#0284C7;">
          💬
        </button>

        <!-- Switch Role / Sign Out -->
        <a href="${loginHref}" class="gtb-signout" title="Switch Role or Exit">
          Switch Role ↩
        </a>
      </div>
    `;

    document.body.insertBefore(bar, document.body.firstChild);

    setupClock();
    setupSearch(isSubdir);
    setupAlerts(isSubdir);
    setupCitySwitcher();
    setupChatButton();
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
  function setupSearch(isSubdir) {
    const input = document.getElementById('gtbSearch');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = input.value.trim();
      if (!q) return;

      const pfx = isSubdir ? '' : 'pages/';
      // Plate pattern → OCR
      if (/^[a-z]{2}\d{1,2}[a-z]{1,3}\d{3,4}$/i.test(q.replace(/\s/g, ''))) {
        window.location.href = pfx + 'ocr.html?plate=' + encodeURIComponent(q.toUpperCase());
        return;
      }
      // Bus ID pattern → Fleet
      if (/^bus-?\d+/i.test(q) || /^gj|mh|dl|ka/i.test(q)) {
        window.location.href = pfx + 'fleet.html?bus=' + encodeURIComponent(q.toUpperCase());
        return;
      }
      // Default → GIS page
      window.location.href = pfx + 'gis.html?q=' + encodeURIComponent(q);
    });
  }

  /* ============ ALERTS ============ */
  function setupAlerts(isSubdir) {
    const btn = document.getElementById('gtbAlertsBtn');
    const count = document.getElementById('gtbAlertCount');
    if (!btn || !count) return;

    function refresh() {
      try {
        const events = (window.ROADEYE && ROADEYE.getEvents) ? ROADEYE.getEvents() : 
                       (window.UrbanSense && UrbanSense.getEvents) ? UrbanSense.getEvents() : [];
        const open = events.filter(e => e.status !== 'Resolved' && e.status !== 'Dismissed').length;
        if (open > 0) {
          count.textContent = open > 99 ? '99+' : String(open);
          count.style.display = 'block';
        } else {
          count.style.display = 'none';
        }
      } catch (e) {}
    }

    refresh();
    setInterval(refresh, 5000);

    btn.addEventListener('click', () => {
      const pfx = isSubdir ? '' : 'pages/';
      window.location.href = pfx + 'incidents.html';
    });
  }

  /* ============ CITY SWITCHER ============ */
  function setupCitySwitcher() {
    const select = document.getElementById('gtbCitySelect');
    if (!select) return;

    select.addEventListener('change', () => {
      const city = select.value;
      localStorage.setItem('roadeye_city', city);
      const notify = (window.ROADEYE && ROADEYE.showToast) || (window.UrbanSense && UrbanSense.showToast);
      if (notify) {
        notify(`Switched active command zone to ${city}`, 'info');
      }
      // Dispatch custom event for pages that listen
      window.dispatchEvent(new CustomEvent('roadeye:cityChanged', { detail: { city } }));
    });
  }

  /* ============ CHAT LAUNCHER ============ */
  function setupChatButton() {
    const btn = document.getElementById('gtbChatBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sideBtn = document.getElementById('chatbotBtn');
      if (sideBtn) {
        sideBtn.click();
      } else if (window.ROADEYE_CHAT && window.ROADEYE_CHAT.toggle) {
        window.ROADEYE_CHAT.toggle();
      }
    });
  }

  /* ============ INIT ============ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureTopBar);
  } else {
    ensureTopBar();
  }

})();