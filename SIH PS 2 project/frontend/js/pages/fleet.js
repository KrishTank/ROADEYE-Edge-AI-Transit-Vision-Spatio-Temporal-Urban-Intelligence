/* =========================================================
   URBANSENSE AI — LIVE FLEET
   ========================================================= */

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderFleet();
  setupSimulate();
  setupFilters();
  setupModal();
});

/* =========================================================
   RENDER FLEET
   ========================================================= */

function renderFleet() {
  const fleet = UrbanSense.getFleet();

  const active = fleet.filter(b => b.status === 'ACTIVE').length;
  const idle   = fleet.filter(b => b.status === 'IDLE').length;
  const avgSpeed = fleet.length
    ? Math.round(fleet.reduce((s, b) => s + b.speed, 0) / fleet.length)
    : 0;

  document.getElementById('statTotal').textContent  = fleet.length;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statIdle').textContent   = idle;
  document.getElementById('statSpeed').innerHTML    =
    avgSpeed + '<span class="unit">km/h</span>';

  let visible = fleet;
  if (currentFilter === 'ACTIVE') visible = fleet.filter(b => b.status === 'ACTIVE');
  if (currentFilter === 'IDLE')   visible = fleet.filter(b => b.status === 'IDLE');
  if (currentFilter === 'fast')   visible = fleet.filter(b => b.speed > 30);

  document.getElementById('showingCount').textContent =
    'Showing ' + visible.length + ' of ' + fleet.length;

  const grid = document.getElementById('fleetGrid');
  if (!grid) return;

  if (visible.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <strong>No buses match the current filter</strong>
      Try a different filter above.
    </div>`;
    return;
  }

  grid.innerHTML = visible.map(bus => renderBusCard(bus)).join('');

  grid.querySelectorAll('.bus-card').forEach(card => {
    card.addEventListener('click', () => openBusModal(card.dataset.busId));
  });
}

/* =========================================================
   SINGLE BUS CARD
   ========================================================= */

function renderBusCard(bus) {
  const statusClass = bus.status === 'ACTIVE' ? 'active' : 'idle';
  const cardClass   = bus.status === 'ACTIVE' ? '' : 'idle';
  const camClass    = bus.camera === 'ONLINE' ? '' : 'offline';

  return `
    <div class="bus-card ${cardClass}" data-bus-id="${bus.id}">
      <div class="bus-card-head">
        <div>
          <div class="bus-id">${UrbanSense.escapeHTML(bus.id)}</div>
          <div class="bus-route">${UrbanSense.escapeHTML(bus.route)} · ${UrbanSense.escapeHTML(bus.destination)}</div>
        </div>
        <span class="bus-status ${statusClass}">${bus.status}</span>
      </div>

      <div class="bus-stats">
        <div class="bus-stat">
          <span class="bus-stat-label">Speed</span>
          <span class="bus-stat-value">${bus.speed}<span class="unit">km/h</span></span>
        </div>
        <div class="bus-stat">
          <span class="bus-stat-label">Occupancy</span>
          <span class="bus-stat-value">${bus.passengers}<span class="unit">/ ${bus.capacity}</span></span>
        </div>
        <div class="bus-stat">
          <span class="bus-stat-label">Location</span>
          <span class="bus-stat-value" style="font-size:12px;">${UrbanSense.escapeHTML(bus.location)}</span>
        </div>
        <div class="bus-stat">
          <span class="bus-stat-label">Route progress</span>
          <span class="bus-stat-value">${bus.progress}<span class="unit">%</span></span>
        </div>
      </div>

      <div class="bus-progress">
        <div class="bus-progress-fill" style="width:${bus.progress}%;"></div>
      </div>

      <div class="bus-footer">
        <span class="bus-camera ${camClass}">
          <span class="status-dot"></span>
          CAM ${bus.camera}
        </span>
        <span>${UrbanSense.timeAgo(bus.lastUpdate)}</span>
      </div>
    </div>
  `;
}

/* =========================================================
   SIMULATE
   ========================================================= */

function setupSimulate() {
  const btn = document.getElementById('simulateBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = '⟳ Updating…';

    UrbanSense.simulateFleetUpdate();
    renderFleet();

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '⟳ Simulate Fleet Update';
      UrbanSense.showToast('Fleet positions updated', 'success');
    }, 500);
  });

  setInterval(() => {
    UrbanSense.simulateFleetUpdate();
    renderFleet();
  }, 8000);
}

/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {
  document.querySelectorAll('#filterChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderFleet();
    });
  });
}

/* =========================================================
   MODAL
   ========================================================= */

function setupModal() {
  const modal = document.getElementById('busModal');
  const close = document.getElementById('modalClose');
  if (!modal || !close) return;

  close.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
}

function openBusModal(busId) {
  const bus = UrbanSense.getBus(busId);
  if (!bus) return;

  const modal = document.getElementById('busModal');
  const title = document.getElementById('modalTitle');
  const body  = document.getElementById('modalBody');

  title.textContent = bus.id + ' · ' + bus.route;

  const events = UrbanSense.getEvents().filter(e => e.busId === bus.id).slice(0, 4);

  body.innerHTML = `
    <div class="detail-grid">
      <div class="detail-stat"><span class="detail-stat-label">Status</span><span class="detail-stat-value" style="color:${bus.status === 'ACTIVE' ? 'var(--accent-green)' : 'var(--text-muted)'};">${bus.status}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Speed</span><span class="detail-stat-value">${bus.speed}<span class="unit">km/h</span></span></div>
      <div class="detail-stat"><span class="detail-stat-label">Occupancy</span><span class="detail-stat-value">${bus.passengers}<span class="unit">/ ${bus.capacity}</span></span></div>
      <div class="detail-stat"><span class="detail-stat-label">Route</span><span class="detail-stat-value">${UrbanSense.escapeHTML(bus.route)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Latitude</span><span class="detail-stat-value">${bus.latitude.toFixed(5)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Longitude</span><span class="detail-stat-value">${bus.longitude.toFixed(5)}</span></div>
    </div>

    <div class="section-title" style="margin-top:20px;">CAMERA FEEDS</div>
    <div class="cam-grid">
      ${[1,2,3,4].map(n => `<div class="cam-tile"><div class="cam-tile-label">CAM-0${n}</div></div>`).join('')}
    </div>

    <div class="section-title" style="margin-top:22px;">RECENT DETECTIONS FROM THIS UNIT</div>
    ${events.length === 0
      ? `<div class="empty-state" style="padding:20px 0; text-align:left;">No detections recorded by ${bus.id} yet.</div>`
      : events.map(e => `
          <div class="stat-row">
            <span class="label">
              <span class="severity-dot ${(e.severity || 'low').toLowerCase()}" style="display:inline-block; margin-right:8px;"></span>
              ${UrbanSense.escapeHTML(e.type)}
            </span>
            <span class="value">${e.confidence}% · ${UrbanSense.timeAgo(e.timestamp)}</span>
          </div>
        `).join('')
    }
  `;

  modal.classList.add('open');
}

/* =========================================================
   ROUTE HEALTH PANEL
   ========================================================= */

function renderRouteHealth() {
  const container = document.getElementById('routeHealthPanel');
  if (!container) return;

  const events = UrbanSense.getEvents();
  const fleet  = UrbanSense.getFleet();

  const routeStats = {};
  events.forEach(e => {
    const r = e.route || 'UNKNOWN';
    if (!routeStats[r]) {
      routeStats[r] = { route: r, total: 0, potholes: 0, traffic: 0, incidents: 0, critical: 0 };
    }
    routeStats[r].total++;
    if (e.type === 'Pothole' || e.type === 'Road Crack') routeStats[r].potholes++;
    if (e.type === 'Traffic Density' || e.type === 'Traffic Sign') routeStats[r].traffic++;
    if (e.type === 'Rash Driving' || e.type === 'Pedestrian' || e.type === 'Accident') routeStats[r].incidents++;
    if (e.severity === 'CRITICAL' || e.severity === 'HIGH') routeStats[r].critical++;
  });

  Object.keys(routeStats).forEach(r => {
    routeStats[r].activeBuses = fleet.filter(b => b.route === r && b.status === 'ACTIVE').length;
    routeStats[r].totalBuses = fleet.filter(b => b.route === r).length;
  });

  const sorted = Object.values(routeStats).sort((a, b) => b.total - a.total);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><strong>No route activity yet</strong>Detections will appear here as buses upload data.</div>';
    return;
  }

  container.innerHTML = sorted.map(r => {
    const defectWeight = r.potholes * 3 + r.critical * 2 + r.incidents;
    const score = Math.max(0, 100 - Math.min(80, defectWeight));
    let scoreColor = 'var(--accent-green)';
    if (score < 40) scoreColor = 'var(--accent-red)';
    else if (score < 70) scoreColor = 'var(--accent-amber)';

    return `
      <div style="margin-bottom:22px; padding-bottom:22px; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div style="font-family:var(--font-mono); font-size:14px; font-weight:600; color:var(--accent-cyan); margin-bottom:4px;">${r.route}</div>
            <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${r.activeBuses}/${r.totalBuses} buses active · ${r.total} total detections</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:22px; font-weight:600; color:${scoreColor}; line-height:1;">${score}</div>
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); margin-top:2px;">HEALTH SCORE</div>
          </div>
        </div>
        <div style="height:6px; background:var(--bg-elevated); border-radius:10px; overflow:hidden; margin-bottom:12px;">
          <div style="height:100%; width:${score}%; background:${scoreColor}; border-radius:10px;"></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Potholes</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-red);">${r.potholes}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Traffic</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-amber);">${r.traffic}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Incidents</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-violet);">${r.incidents}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Critical</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-red);">${r.critical}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* =========================================================
   ROUTE HEALTH PANEL
   ========================================================= */

function renderRouteHealth() {
  const container = document.getElementById('routeHealthPanel');
  if (!container) return;

  const events = UrbanSense.getEvents();
  const fleet  = UrbanSense.getFleet();

  const routeStats = {};
  events.forEach(e => {
    const r = e.route || 'UNKNOWN';
    if (!routeStats[r]) {
      routeStats[r] = { route: r, total: 0, potholes: 0, traffic: 0, incidents: 0, critical: 0 };
    }
    routeStats[r].total++;
    if (e.type === 'Pothole' || e.type === 'Road Crack') routeStats[r].potholes++;
    if (e.type === 'Traffic Density' || e.type === 'Traffic Sign') routeStats[r].traffic++;
    if (e.type === 'Rash Driving' || e.type === 'Pedestrian' || e.type === 'Accident') routeStats[r].incidents++;
    if (e.severity === 'CRITICAL' || e.severity === 'HIGH') routeStats[r].critical++;
  });

  Object.keys(routeStats).forEach(r => {
    routeStats[r].activeBuses = fleet.filter(b => b.route === r && b.status === 'ACTIVE').length;
    routeStats[r].totalBuses = fleet.filter(b => b.route === r).length;
  });

  const sorted = Object.values(routeStats).sort((a, b) => b.total - a.total);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state"><strong>No route activity yet</strong>Detections will appear here as buses upload data.</div>';
    return;
  }

  container.innerHTML = sorted.map(r => {
    const defectWeight = r.potholes * 3 + r.critical * 2 + r.incidents;
    const score = Math.max(0, 100 - Math.min(80, defectWeight));
    let scoreColor = 'var(--accent-green)';
    if (score < 40) scoreColor = 'var(--accent-red)';
    else if (score < 70) scoreColor = 'var(--accent-amber)';

    return `
      <div style="margin-bottom:22px; padding-bottom:22px; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div style="font-family:var(--font-mono); font-size:14px; font-weight:600; color:var(--accent-cyan); margin-bottom:4px;">${r.route}</div>
            <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${r.activeBuses}/${r.totalBuses} buses active · ${r.total} total detections</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:22px; font-weight:600; color:${scoreColor}; line-height:1;">${score}</div>
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); margin-top:2px;">HEALTH SCORE</div>
          </div>
        </div>
        <div style="height:6px; background:var(--bg-elevated); border-radius:10px; overflow:hidden; margin-bottom:12px;">
          <div style="height:100%; width:${score}%; background:${scoreColor}; border-radius:10px;"></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Potholes</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-red);">${r.potholes}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Traffic</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-amber);">${r.traffic}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Incidents</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-violet);">${r.incidents}</div>
          </div>
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
            <div style="font-size:9px; font-family:var(--font-mono); letter-spacing:1px; color:var(--text-dim); text-transform:uppercase;">Critical</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:600; color:var(--accent-red);">${r.critical}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Auto-render after page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderRouteHealth, 800);
  setInterval(renderRouteHealth, 15000);
});