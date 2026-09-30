/* =========================================================
   URBANSENSE AI — COMMAND CENTER DASHBOARD
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  setupRefresh();
  startAutoRefresh();
});

/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

function updateDashboard() {
  const fleet  = UrbanSense.getFleet();
  const events = UrbanSense.getEvents();

  /* ===== FLEET KPI ===== */
  const activeBuses = fleet.filter(b => b.status === 'ACTIVE').length;
  const totalBuses  = fleet.length;

  document.getElementById('activeFleet').textContent = activeBuses;
  document.getElementById('fleetSub').textContent =
    activeBuses + ' / ' + totalBuses + ' buses';

  /* ===== INCIDENTS KPI ===== */
  const openEvents = events.filter(e =>
    e.status !== 'Resolved' && e.status !== 'Dismissed');

  document.getElementById('activeIncidents').textContent = openEvents.length;

  const critical = events.filter(e => e.severity === 'HIGH' ||
                                       e.severity === 'CRITICAL').length;
  document.getElementById('incidentSub').textContent =
    critical + ' high severity';

  /* ===== ROAD DEFECTS KPI ===== */
  const roadTypes = ['Pothole', 'Road Crack', 'Waterlogging',
                     'Missing Divider', 'Missing Zebra', 'Damaged Road'];

  const roadEvents = events.filter(e =>
    roadTypes.some(t => e.type.toLowerCase().includes(t.toLowerCase())));

  document.getElementById('roadDefects').textContent = roadEvents.length;
  document.getElementById('defectSub').textContent =
    roadEvents.length === 0 ? 'No defects detected'
    : roadEvents.length + ' anomalies recorded';

  /* ===== CONFIDENCE KPI ===== */
  let avgConfidence = 0;
  if (events.length > 0) {
    const sum = events.reduce((s, e) => s + (Number(e.confidence) || 0), 0);
    avgConfidence = (sum / events.length).toFixed(1);
  }
  document.getElementById('avgConfidence').innerHTML =
    avgConfidence + '<span class="kpi-unit">%</span>';

  /* ===== FLEET HEALTH ===== */
  const pct = totalBuses > 0 ? Math.round(activeBuses / totalBuses * 100) : 0;
  document.getElementById('fhActive').textContent =
    activeBuses + ' / ' + totalBuses;
  document.getElementById('fhActiveBar').style.width = pct + '%';

  const avgSpeed = fleet.length
    ? Math.round(fleet.reduce((s, b) => s + b.speed, 0) / fleet.length)
    : 0;
  document.getElementById('fhSpeed').textContent = avgSpeed + ' km/h';
  document.getElementById('fhSpeedBar').style.width =
    Math.min(100, avgSpeed * 2) + '%';

  /* ===== RENDER BLOCKS ===== */
  renderLiveFeed(events);
  renderDetectionAnalytics(events);
  renderMiniMap(fleet, events);
}

/* =========================================================
   LIVE FEED
   ========================================================= */

function renderLiveFeed(events) {
  const container = document.getElementById('liveFeed');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No AI detections yet</strong>
        Open <a href="scanner.html">Edge AI Scanner</a><br>
        to generate your first detection.
      </div>`;
    return;
  }

  const latest = events.slice(0, 6);

  container.innerHTML = latest.map(e => {
    const color = UrbanSense.getDetectionColor(e.type);
    const sevClass = (e.severity || 'LOW').toLowerCase();

    return `
      <div class="feed-item" data-id="${e.id}">
        <span class="severity-dot ${sevClass}"></span>
        <div class="feed-main">
          <div class="feed-title">
            <span style="color:${color}; font-weight:500;">${UrbanSense.escapeHTML(e.type)}</span>
            <span class="mono muted" style="font-size:10px;">${e.confidence}%</span>
          </div>
          <div class="feed-meta mono">
            ${UrbanSense.escapeHTML(e.busId)} · ${UrbanSense.escapeHTML(e.route)}
          </div>
        </div>
        <span class="feed-time mono">${UrbanSense.timeAgo(e.timestamp)}</span>
      </div>`;
  }).join('');
}

/* =========================================================
   DETECTION ANALYTICS
   ========================================================= */

function renderDetectionAnalytics(events) {
  const container = document.getElementById('detectionAnalytics');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:24px;">
        Waiting for detection data…
      </div>`;
    return;
  }

  const counts = {};
  events.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const max = Math.max(...sorted.map(item => item[1]));

  container.innerHTML = sorted.map(([type, count]) => {
    const pct = Math.round(count / max * 100);
    const color = UrbanSense.getDetectionColor(type);

    return `
      <div style="margin-bottom:14px;">
        <div class="progress-row">
          <span style="color:var(--text-secondary);">${UrbanSense.escapeHTML(type)}</span>
          <strong>${count}</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%; background:${color};"></div>
        </div>
      </div>`;
  }).join('');
}

/* =========================================================
   MINI MAP
   ========================================================= */

function renderMiniMap(fleet, events) {
  const container = document.getElementById('miniMapMarkers');
  if (!container) return;

  const lats = fleet.map(b => b.latitude);
  const lngs = fleet.map(b => b.longitude);

  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const spanLat = (maxLat - minLat) || 1;
  const spanLng = (maxLng - minLng) || 1;

  const toPercent = (lat, lng) => {
    const x = ((lng - minLng) / spanLng) * 70 + 15;
    const y = 85 - ((lat - minLat) / spanLat) * 70;
    return { x, y };
  };

  let html = '';

  fleet.forEach(b => {
    const { x, y } = toPercent(b.latitude, b.longitude);
    const isActive = b.status === 'ACTIVE';
    html += `
      <div class="mini-map-marker bus"
           style="left:${x}%; top:${y}%;
                  opacity:${isActive ? 1 : 0.45};"
           title="${b.id} · ${b.route} · ${b.speed} km/h"></div>`;
  });

  events.slice(0, 15).forEach(e => {
    const { x, y } = toPercent(e.latitude, e.longitude);
    const color = UrbanSense.getDetectionColor(e.type);
    html += `
      <div class="mini-map-marker event"
           style="left:${x}%; top:${y}%;
                  background:${color};
                  box-shadow:0 0 8px ${color};"
           title="${UrbanSense.escapeHTML(e.type)} · ${e.busId}"></div>`;
  });

  container.innerHTML = html;
}

/* =========================================================
   REFRESH
   ========================================================= */

function setupRefresh() {
  const btn = document.getElementById('refreshDashboard');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.textContent = '⟳ Updating…';
    btn.disabled = true;

    UrbanSense.simulateFleetUpdate();
    updateDashboard();

    setTimeout(() => {
      btn.textContent = '⟳ Refresh';
      btn.disabled = false;
      UrbanSense.showToast('Dashboard refreshed', 'success');
    }, 400);
  });
}

function startAutoRefresh() {
  setInterval(() => {
    UrbanSense.simulateFleetUpdate();
    updateDashboard();
  }, 6000);
}