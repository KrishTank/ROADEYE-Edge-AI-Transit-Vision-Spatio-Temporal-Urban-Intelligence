/* =========================================================
   URBANSENSE AI — RIGHT PANEL
   Renders AI Insights + Critical Alerts into #rightPanel.
   Auto-injects the panel HTML into every page.
   ========================================================= */

(function () {

  if (typeof window.UrbanAPI === 'undefined') {
    console.warn('[right-panel] UrbanAPI not loaded — skipping.');
    return;
  }

  let insights = [];
  let alerts = [];

  /* =========================================================
     INJECT PANEL CONTAINER INTO PAGE
     ========================================================= */

  function ensurePanel() {
    let panel = document.getElementById('rightPanel');
    if (panel) return panel;

    // Wrap page layout into 3-column grid
    const app = document.querySelector('.app');
    if (!app) return null;

    app.classList.add('app-v2');

    panel = document.createElement('aside');
    panel.id = 'rightPanel';
    panel.className = 'right-panel';
    panel.innerHTML = `
      <div class="rp-section" id="rpInsights">
        <div class="rp-title">
          <span class="icon">🧠</span>
          AI INSIGHTS
          <span class="count" id="rpInsightsCount">0</span>
        </div>
        <div id="rpInsightsList"></div>
      </div>

      <div class="rp-section" id="rpAlerts">
        <div class="rp-title">
          <span class="icon">🚨</span>
          CRITICAL ALERTS
          <span class="count" id="rpAlertsCount">0</span>
        </div>
        <div id="rpAlertsList"></div>
      </div>
    `;

    app.appendChild(panel);
    return panel;
  }

  /* =========================================================
     RENDER INSIGHTS
     ========================================================= */

  function renderInsights() {
    const list = document.getElementById('rpInsightsList');
    const count = document.getElementById('rpInsightsCount');
    if (!list) return;

    if (insights.length === 0) {
      list.innerHTML = '<div style="padding:16px 0; text-align:center; color:var(--text-dim); font-family:var(--font-mono); font-size:10px;">ANALYZING DATA…</div>';
      if (count) count.textContent = '0';
      return;
    }

    list.innerHTML = insights.slice(0, 6).map(i => `
      <div class="insight-item">
        <span class="insight-icon ${i.level}"></span>
        <span class="insight-text">${i.text}</span>
      </div>
    `).join('');

    if (count) count.textContent = insights.length;
  }

  /* =========================================================
     RENDER ALERTS
     ========================================================= */

  function renderAlerts() {
    const list = document.getElementById('rpAlertsList');
    const count = document.getElementById('rpAlertsCount');
    if (!list) return;

    if (alerts.length === 0) {
      list.innerHTML = '<div style="padding:16px 0; text-align:center; color:var(--text-dim); font-family:var(--font-mono); font-size:10px;">NO ACTIVE ALERTS</div>';
      if (count) count.textContent = '0';
      return;
    }

    list.innerHTML = alerts.slice(0, 8).map(a => `
      <div class="alert-item" data-id="${a.id}">
        <span class="alert-sev ${(a.severity || 'low').toLowerCase()}"></span>
        <div class="alert-body">
          <div class="alert-title">${escapeHTML(a.title || a.type)}</div>
          <div class="alert-meta">${escapeHTML(a.meta || a.location || '')} · ${a.ago || ''}</div>
        </div>
      </div>
    `).join('');

    if (count) count.textContent = alerts.length;

    // Click handler
    list.querySelectorAll('.alert-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (!id) return;
        if (window.location.pathname.includes('incidents')) {
          // On incidents page, scroll the row into view
          const row = document.querySelector(`tr[data-incident-id="${id}"]`);
          if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Otherwise navigate
          window.location.href = 'incidents.html?id=' + id;
        }
      });
    });
  }

  /* =========================================================
     BUILD INSIGHTS FROM DATA
     ========================================================= */

  function buildInsights(events, fleet) {
    const out = [];

    // Insight 1 — Total detections
    if (events.length > 0) {
      out.push({
        level: 'info',
        text: `<strong>${events.length}</strong> AI detections recorded city-wide. Fleet is actively uploading.`,
      });
    }

    // Insight 2 — Most common type
    const typeCounts = {};
    events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    if (topType) {
      out.push({
        level: topType[0] === 'Pothole' ? 'warn' : 'info',
        text: `Most frequent: <strong>${topType[0]}</strong> with ${topType[1]} detections.`,
      });
    }

    // Insight 3 — Most active zone
    const locCounts = {};
    events.forEach(e => { locCounts[e.location] = (locCounts[e.location] || 0) + 1; });
    const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];
    if (topLoc) {
      out.push({
        level: 'warn',
        text: `Highest activity: <strong>${topLoc[0]}</strong> (${topLoc[1]} events). Recommend inspection.`,
      });
    }

    // Insight 4 — Critical events
    const critical = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH');
    if (critical.length > 0) {
      out.push({
        level: 'crit',
        text: `<strong>${critical.length}</strong> high-severity events require attention.`,
      });
    }

    // Insight 5 — Fleet activity
    const active = fleet.filter(b => b.status === 'ACTIVE').length;
    if (fleet.length > 0) {
      out.push({
        level: 'good',
        text: `<strong>${active}/${fleet.length}</strong> buses currently active and sensing.`,
      });
    }

    // Insight 6 — Resolved percentage
    const resolved = events.filter(e => e.status === 'Resolved').length;
    const resolvedPct = events.length > 0 ? Math.round(resolved / events.length * 100) : 0;
    out.push({
      level: resolvedPct >= 50 ? 'good' : 'warn',
      text: `Resolution rate: <strong>${resolvedPct}%</strong> of incidents addressed.`,
    });

    return out;
  }

  /* =========================================================
     BUILD ALERTS FROM DATA
     ========================================================= */

  function buildAlerts(events) {
    const open = events.filter(e => e.status !== 'Resolved');
    const critical = open.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH');
    const normal = open.filter(e => e.severity !== 'CRITICAL' && e.severity !== 'HIGH');

    const combined = [...critical, ...normal].slice(0, 8);

    return combined.map(e => ({
      id: e.id,
      title: e.type,
      severity: e.severity,
      location: e.location,
      meta: e.bus_id + ' · ' + (e.location || ''),
      ago: timeAgoShort(e.timestamp),
    }));
  }

  function timeAgoShort(ts) {
    const sec = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (sec < 60) return sec + 's ago';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + 'm ago';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h ago';
    return Math.floor(hr / 24) + 'd ago';
  }

  /* =========================================================
     REFRESH FROM API
     ========================================================= */

  async function refresh() {
    try {
      const [fleet, events] = await Promise.all([
        UrbanAPI.getFleet(),
        UrbanAPI.getEvents({ limit: 50 }),
      ]);
      if (fleet) {
        insights = buildInsights(events || [], fleet);
      }
      if (events) {
        alerts = buildAlerts(events);
      }
      renderInsights();
      renderAlerts();
    } catch (err) {
      console.warn('[right-panel] Refresh failed:', err);
    }
  }

  /* =========================================================
     ESCAPE HELPER
     ========================================================= */

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    const panel = ensurePanel();
    if (!panel) return;
    refresh();
    // Refresh every 20 seconds
    setInterval(refresh, 20000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also refresh when SSE pushes a new event
  window.addEventListener('urbansense:newEvent', refresh);

  console.log('[right-panel] Module loaded.');

})();
