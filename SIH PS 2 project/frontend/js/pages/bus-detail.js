/* =========================================================
   URBANSENSE AI — BUS DETAIL PANEL
   Click a bus marker → shows live telemetry, camera tiles,
   and AI detection overlay.
   ========================================================= */

(function () {

  let currentBusId = null;
  let refreshTimer = null;

  /* =========================================================
     CSS — injected on load so it works without html changes
     ========================================================= */

  function injectStyles() {
    if (document.getElementById('busDetailStyles')) return;
    const style = document.createElement('style');
    style.id = 'busDetailStyles';
    style.textContent = `
      .bus-detail-panel {
        position: fixed;
        top: 56px;
        right: 0;
        width: 420px;
        height: calc(100vh - 56px);
        background: var(--bg-panel);
        border-left: 1px solid var(--border-strong);
        z-index: 9990;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -20px 0 60px rgba(0,0,0,0.5);
      }
      .bus-detail-panel.open {
        transform: translateX(0);
      }
      .bd-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .bd-header-left {
        flex: 1;
        min-width: 0;
      }
      .bd-bus-id {
        font-family: var(--font-mono);
        font-size: 18px;
        font-weight: 700;
        color: var(--accent-cyan);
        letter-spacing: 0.5px;
      }
      .bd-route {
        font-size: 11px;
        font-family: var(--font-mono);
        color: var(--text-muted);
        margin-top: 2px;
      }
      .bd-status-pill {
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.8px;
        background: rgba(0, 230, 138, 0.12);
        color: var(--accent-green);
        border: 1px solid rgba(0, 230, 138, 0.3);
      }
      .bd-close {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 20px;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .bd-close:hover {
        background: var(--bg-elevated);
        color: var(--text-primary);
      }
      .bd-body {
        flex: 1;
        overflow-y: auto;
        padding: 18px 20px;
      }
      .bd-section {
        margin-bottom: 22px;
      }
      .bd-section-title {
        font-size: 10px;
        font-family: var(--font-mono);
        letter-spacing: 1.4px;
        text-transform: uppercase;
        color: var(--text-dim);
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bd-stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .bd-stat {
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 10px 12px;
      }
      .bd-stat-label {
        font-size: 9px;
        font-family: var(--font-mono);
        letter-spacing: 1px;
        color: var(--text-dim);
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .bd-stat-value {
        font-family: var(--font-mono);
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .bd-stat-value .unit {
        font-size: 10px;
        color: var(--text-muted);
        font-weight: 400;
        margin-left: 3px;
      }
      .bd-cam-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .bd-cam-tile {
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, #0a0f1a, #0d1420);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 200ms ease;
      }
      .bd-cam-tile:hover {
        border-color: var(--accent-cyan);
      }
      .bd-cam-tile.expanded {
        grid-column: 1 / -1;
        aspect-ratio: 16/9;
      }
      .bd-cam-tile::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 2px,
          rgba(0, 229, 255, 0.04) 2px,
          rgba(0, 229, 255, 0.04) 3px
        );
        pointer-events: none;
        z-index: 2;
      }
      .bd-cam-label {
        position: absolute;
        top: 6px;
        left: 8px;
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 600;
        color: var(--accent-cyan);
        letter-spacing: 0.6px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .bd-cam-label .live-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--accent-red);
        box-shadow: 0 0 6px var(--accent-red);
        animation: pulseDot 1.6s ease-in-out infinite;
      }
      .bd-cam-ts {
        position: absolute;
        top: 6px;
        right: 8px;
        font-family: var(--font-mono);
        font-size: 8px;
        color: var(--text-dim);
        z-index: 3;
      }
      .bd-cam-road {
        position: absolute;
        inset: 0;
        z-index: 1;
      }
      .bd-cam-road svg {
        width: 100%;
        height: 100%;
      }
      .bd-bbox {
        position: absolute;
        border: 2px solid var(--accent-amber);
        border-radius: 3px;
        box-shadow: 0 0 8px rgba(255, 179, 0, 0.5);
        animation: bboxPulse 2s ease-in-out infinite;
        z-index: 4;
      }
      .bd-bbox-label {
        position: absolute;
        top: -16px;
        left: -2px;
        background: var(--accent-amber);
        color: #101010;
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 2px;
        white-space: nowrap;
      }
      .bd-bbox.critical {
        border-color: var(--accent-red);
        box-shadow: 0 0 8px rgba(255, 59, 71, 0.6);
      }
      .bd-bbox.critical .bd-bbox-label {
        background: var(--accent-red);
        color: #ffffff;
      }
      @keyframes bboxPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .bd-detection-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .bd-detection-row {
        display: grid;
        grid-template-columns: 12px 1fr auto auto;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        font-size: 11px;
      }
      .bd-detection-row .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .bd-detection-row .type {
        color: var(--text-primary);
        font-weight: 500;
      }
      .bd-detection-row .conf {
        font-family: var(--font-mono);
        color: var(--accent-cyan);
        font-weight: 600;
      }
      .bd-detection-row .time {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--text-dim);
      }
      .bd-empty {
        padding: 20px;
        text-align: center;
        color: var(--text-dim);
        font-size: 11px;
        font-family: var(--font-mono);
      }
      .bd-footer-actions {
        padding: 14px 20px;
        border-top: 1px solid var(--border-subtle);
        display: flex;
        gap: 8px;
      }
      .bd-footer-actions .btn {
        flex: 1;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }

  /* =========================================================
     BUILD PANEL HTML
     ========================================================= */

  function createPanel() {
    if (document.getElementById('busDetailPanel')) return;

    const panel = document.createElement('aside');
    panel.className = 'bus-detail-panel';
    panel.id = 'busDetailPanel';
    panel.innerHTML = `
      <div class="bd-header">
        <div class="bd-header-left">
          <div class="bd-bus-id" id="bdBusId">BUS-101</div>
          <div class="bd-route" id="bdRoute">R-05 · Central Station</div>
        </div>
        <span class="bd-status-pill" id="bdStatus">ACTIVE</span>
        <button class="bd-close" id="bdClose">×</button>
      </div>
      <div class="bd-body" id="bdBody"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById('bdClose').addEventListener('click', close);
  }

  /* =========================================================
     RENDER BODY — called every refresh
     ========================================================= */

  function renderBody(bus, events) {
    const body = document.getElementById('bdBody');
    if (!body) return;

    const busEvents = events.filter(e => (e.bus_id || e.busId) === bus.id).slice(0, 5);

    // Camera IDs
    const cams = [
      { id: 'CAM-01', label: 'FRONT', angle: 0 },
      { id: 'CAM-02', label: 'SIDE-L', angle: 270 },
      { id: 'CAM-03', label: 'SIDE-R', angle: 90 },
      { id: 'CAM-04', label: 'REAR', angle: 180 },
    ];

    // Live detections on this bus (or generate plausible ones)
    const liveDetections = busEvents.length > 0
      ? busEvents.slice(0, 3).map(e => ({
          type: e.type,
          confidence: e.confidence,
          severity: e.severity,
          color: UrbanSense.getDetectionColor(e.type),
        }))
      : [
          { type: 'Road Crack', confidence: 84, severity: 'MEDIUM', color: '#FFB300' },
          { type: 'Traffic Sign', confidence: 91, severity: 'LOW', color: '#00E68A' },
        ];

    body.innerHTML = `
      <div class="bd-section">
        <div class="bd-section-title">⚡ Live Telemetry</div>
        <div class="bd-stats-grid">
          <div class="bd-stat">
            <div class="bd-stat-label">Speed</div>
            <div class="bd-stat-value">${Math.round(bus.speed)}<span class="unit">km/h</span></div>
          </div>
          <div class="bd-stat">
            <div class="bd-stat-label">Heading</div>
            <div class="bd-stat-value">${Math.round(bus.heading || 0)}<span class="unit">°</span></div>
          </div>
          <div class="bd-stat">
            <div class="bd-stat-label">Occupancy</div>
            <div class="bd-stat-value">${bus.passengers}<span class="unit">/ ${bus.capacity}</span></div>
          </div>
          <div class="bd-stat">
            <div class="bd-stat-label">Route Progress</div>
            <div class="bd-stat-value">${bus.progress}<span class="unit">%</span></div>
          </div>
          <div class="bd-stat">
            <div class="bd-stat-label">Latitude</div>
            <div class="bd-stat-value" style="font-size:12px;">${bus.latitude.toFixed(5)}</div>
          </div>
          <div class="bd-stat">
            <div class="bd-stat-label">Longitude</div>
            <div class="bd-stat-value" style="font-size:12px;">${bus.longitude.toFixed(5)}</div>
          </div>
        </div>
      </div>

      <div class="bd-section">
        <div class="bd-section-title">
          📹 Live Camera Feeds
          <span style="margin-left:auto; font-size:9px; color:var(--accent-red);">● REC</span>
        </div>
        <div class="bd-cam-grid">
          ${cams.map((c, i) => renderCamTile(c, i, liveDetections)).join('')}
        </div>
      </div>

      <div class="bd-section">
        <div class="bd-section-title">🤖 Active AI Detections</div>
        <div class="bd-detection-list">
          ${liveDetections.length === 0
            ? '<div class="bd-empty">No active detections on this unit</div>'
            : liveDetections.map(d => `
                <div class="bd-detection-row">
                  <span class="dot" style="background:${d.color}; box-shadow:0 0 6px ${d.color};"></span>
                  <span class="type">${d.type}</span>
                  <span class="conf">${d.confidence}%</span>
                  <span class="time">${d.severity}</span>
                </div>
              `).join('')
          }
        </div>
      </div>

      <div class="bd-section">
        <div class="bd-section-title">📋 Recent Detections From This Unit</div>
        ${busEvents.length === 0
          ? '<div class="bd-empty">No detections logged by this unit yet</div>'
          : `<div class="bd-detection-list">
              ${busEvents.map(e => `
                <div class="bd-detection-row">
                  <span class="dot" style="background:${UrbanSense.getDetectionColor(e.type)};"></span>
                  <span class="type">${UrbanSense.escapeHTML(e.type)}</span>
                  <span class="conf">${e.confidence}%</span>
                  <span class="time">${UrbanSense.timeAgo(e.timestamp)}</span>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    `;

    // Wire camera tile clicks → expand
    document.querySelectorAll('.bd-cam-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        document.querySelectorAll('.bd-cam-tile').forEach(t => t.classList.remove('expanded'));
        tile.classList.toggle('expanded');
      });
    });
  }

  /* =========================================================
     RENDER ONE CAMERA TILE
     ========================================================= */

  function renderCamTile(cam, index, liveDetections) {
    // Pick a detection to display on this camera
    const det = liveDetections[index % liveDetections.length];

    // Random-looking bbox positions (deterministic per bus+cam)
    const bboxSeed = (index + 1) * 7;
    const bboxes = det ? [
      {
        x: 20 + (bboxSeed * 3) % 40,
        y: 30 + (bboxSeed * 5) % 30,
        w: 22 + (bboxSeed * 2) % 18,
        h: 26 + (bboxSeed * 2) % 22,
        label: det.type + ' ' + det.confidence + '%',
        critical: det.severity === 'CRITICAL' || det.severity === 'HIGH',
      }
    ] : [];

    const ts = new Date().toLocaleTimeString('en-GB');

    return `
      <div class="bd-cam-tile">
        <div class="bd-cam-label">
          <span class="live-dot"></span> ${cam.label} · ${cam.id}
        </div>
        <div class="bd-cam-ts">${ts}</div>
        <div class="bd-cam-road">
          ${renderCamRoad(cam.angle)}
        </div>
        ${bboxes.map(b => `
          <div class="bd-bbox ${b.critical ? 'critical' : ''}" style="left:${b.x}%; top:${b.y}%; width:${b.w}%; height:${b.h}%;">
            <span class="bd-bbox-label">${b.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* =========================================================
     SIMULATED CAMERA VIEW — road-like SVG
     ========================================================= */

  function renderCamRoad(angle) {
    // Horizon-based perspective road
    return `
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
        <!-- Sky -->
        <rect x="0" y="0" width="320" height="90" fill="#0a1220"/>
        <!-- Ground -->
        <rect x="0" y="90" width="320" height="90" fill="#0d1622"/>
        <!-- Road -->
        <polygon points="120,90 200,90 280,180 40,180" fill="#1a2333"/>
        <!-- Lane markings -->
        <line x1="160" y1="90" x2="160" y2="180" stroke="#3a4a63" stroke-width="2" stroke-dasharray="10,8"/>
        <!-- Distant glow -->
        <ellipse cx="160" cy="88" rx="60" ry="6" fill="#00E5FF" opacity="0.15"/>
        <!-- Horizon -->
        <line x1="0" y1="90" x2="320" y2="90" stroke="#1E2A3F" stroke-width="1"/>
        <!-- Side object hint (vehicle) -->
        <rect x="${140 + (angle % 40)}" y="120" width="40" height="22" fill="#0f1926" opacity="0.5" rx="2"/>
      </svg>
    `;
  }

  /* =========================================================
     OPEN / CLOSE / REFRESH
     ========================================================= */

  async function open(busId) {
    currentBusId = busId;
    const panel = document.getElementById('busDetailPanel');
    if (!panel) return;

    panel.classList.add('open');
    await refresh();

    // Auto-refresh every 3 seconds while open
    clearInterval(refreshTimer);
    refreshTimer = setInterval(refresh, 3000);
  }

  async function refresh() {
    if (!currentBusId) return;
    const bus = UrbanSense.getBus(currentBusId);
    if (!bus) return;

    // Update header
    document.getElementById('bdBusId').textContent = bus.id;
    document.getElementById('bdRoute').textContent = bus.route + ' · ' + bus.destination;

    const statusEl = document.getElementById('bdStatus');
    statusEl.textContent = bus.status;
    if (bus.status === 'ACTIVE') {
      statusEl.style.background = 'rgba(0, 230, 138, 0.12)';
      statusEl.style.color = 'var(--accent-green)';
      statusEl.style.borderColor = 'rgba(0, 230, 138, 0.3)';
    } else {
      statusEl.style.background = 'rgba(122, 139, 165, 0.12)';
      statusEl.style.color = 'var(--text-muted)';
      statusEl.style.borderColor = 'rgba(122, 139, 165, 0.3)';
    }

    const events = UrbanSense.getEvents();
    renderBody(bus, events);
  }

  function close() {
    const panel = document.getElementById('busDetailPanel');
    if (panel) panel.classList.remove('open');
    clearInterval(refreshTimer);
    currentBusId = null;
  }

  /* =========================================================
     PUBLIC HOOK
     ========================================================= */

  window.BusDetail = {
    open: open,
    close: close,
    refresh: refresh,
  };

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    injectStyles();
    createPanel();
    console.log('[bus-detail] Ready. Click any bus marker.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Close panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

})();