/* =========================================================
   URBANSENSE AI — ROAD HEALTH
   ========================================================= */

const ZONES = [
  { name: 'Central Zone',    bounds: { minLat: 12.9600, maxLat: 12.9800, minLng: 77.5850, maxLng: 77.6050 } },
  { name: 'Ring Road',       bounds: { minLat: 12.9500, maxLat: 12.9680, minLng: 77.6000, maxLng: 77.6180 } },
  { name: 'Industrial Area', bounds: { minLat: 12.9800, maxLat: 13.0000, minLng: 77.6050, maxLng: 77.6200 } },
  { name: 'Airport Road',    bounds: { minLat: 12.9400, maxLat: 12.9600, minLng: 77.6100, maxLng: 77.6300 } },
  { name: 'Main Road',       bounds: { minLat: 12.9750, maxLat: 12.9900, minLng: 77.5750, maxLng: 77.5900 } },
  { name: 'North Zone',      bounds: { minLat: 12.9900, maxLat: 13.0100, minLng: 77.5850, maxLng: 77.6050 } },
];

const DEFECT_WEIGHTS = {
  'Pothole': 3, 'Road Crack': 2, 'Waterlogging': 3,
  'Missing Divider': 2, 'Missing Sign': 2, 'Missing Zebra': 1, 'Damaged Road': 3,
};

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  setupRecalc();
  setInterval(renderAll, 10000);
});

function renderAll() {
  const events = UrbanSense.getEvents();
  const defects = events.filter(e => DEFECT_WEIGHTS[e.type] !== undefined);
  renderScoreRing(defects);
  renderZoneCards(defects);
  renderDefectBreakdown(defects);
  renderActivityTimeline(events);
}

/* =========================================================
   SCORE RING
   ========================================================= */

function renderScoreRing(defects) {
  const totalWeight = defects.reduce((sum, d) => sum + (DEFECT_WEIGHTS[d.type] || 1), 0);
  let score = Math.max(0, 100 - Math.min(60, totalWeight));
  const unresolved = defects.filter(d => d.status !== 'Resolved').length;
  score = Math.max(0, score - Math.min(15, unresolved));
  score = Math.round(score);

  animateNumber('scoreNumber', 0, score, 900);

  const ring = document.getElementById('scoreRing');
  const circumference = 2 * Math.PI * 68;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  let color = '#00E68A';
  if (score < 40)      color = '#FF3B47';
  else if (score < 70) color = '#FFB300';

  setTimeout(() => {
    ring.style.stroke = color;
    ring.style.strokeDashoffset = circumference - (circumference * score / 100);
  }, 50);

  const desc = document.getElementById('scoreDesc');
  if (score >= 80) {
    desc.textContent = `Excellent condition. ${defects.length} minor defect${defects.length === 1 ? '' : 's'} recorded city-wide.`;
  } else if (score >= 60) {
    desc.textContent = `Moderate condition. ${unresolved} unresolved defect${unresolved === 1 ? '' : 's'} need attention.`;
  } else if (score >= 40) {
    desc.textContent = `Degraded condition. Immediate maintenance recommended across ${ZONES.length} monitored zones.`;
  } else {
    desc.textContent = `Critical condition. Widespread infrastructure deterioration detected. Escalating to authorities.`;
  }
}

/* =========================================================
   ZONE CARDS
   ========================================================= */

function renderZoneCards(defects) {
  const grid = document.getElementById('zoneGrid');
  if (!grid) return;

  const zoneStats = ZONES.map(zone => {
    const inZone = defects.filter(d =>
      d.latitude  >= zone.bounds.minLat &&
      d.latitude  <= zone.bounds.maxLat &&
      d.longitude >= zone.bounds.minLng &&
      d.longitude <= zone.bounds.maxLng
    );
    return { zone, defects: inZone };
  });

  grid.innerHTML = zoneStats.map(({ zone, defects }) => {
    const weight = defects.reduce((s, d) => s + (DEFECT_WEIGHTS[d.type] || 1), 0);
    const score = Math.max(0, 100 - Math.min(80, weight * 4));

    let statusClass = 'good';
    if (score < 40)      statusClass = 'bad';
    else if (score < 70) statusClass = 'warn';

    let barColor = 'var(--accent-green)';
    if (score < 40)      barColor = 'var(--accent-red)';
    else if (score < 70) barColor = 'var(--accent-amber)';

    const critical = defects.filter(d => d.severity === 'HIGH' || d.severity === 'CRITICAL').length;

    return `
      <div class="zone-health-card ${statusClass}">
        <div class="zone-health-name">${zone.name}</div>
        <div class="zone-health-score">${score}<span class="unit">/ 100</span></div>
        <div class="zone-health-bar">
          <div class="zone-health-bar-fill" style="width:${score}%; background:${barColor};"></div>
        </div>
        <div style="margin-top:12px;">
          <div class="zone-health-row"><span class="label">DEFECTS</span><span class="value">${defects.length}</span></div>
          <div class="zone-health-row"><span class="label">CRITICAL</span><span class="value" style="color:${critical > 0 ? 'var(--accent-red)' : 'var(--text-muted)'};">${critical}</span></div>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   BREAKDOWN
   ========================================================= */

function renderDefectBreakdown(defects) {
  const container = document.getElementById('defectBreakdown');
  if (!container) return;

  if (defects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No road defects recorded yet</strong>
        Run the <a href="scanner.html">Edge AI Scanner</a> to detect infrastructure issues.
      </div>`;
    return;
  }

  const counts = {};
  defects.forEach(d => { counts[d.type] = (counts[d.type] || 0) + 1; });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...sorted.map(([_, c]) => c));

  container.innerHTML = sorted.map(([type, count]) => {
    const pct = Math.round(count / max * 100);
    const color = UrbanSense.getDetectionColor(type);

    return `
      <div class="defect-row">
        <div class="defect-name">${UrbanSense.escapeHTML(type)}</div>
        <div class="defect-bar-wrap">
          <div class="defect-bar" style="width:${pct}%; background:${color};"></div>
        </div>
        <div class="defect-count">${count}</div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivityTimeline(events) {
  const container = document.getElementById('activityTimeline');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No activity yet</strong>
        Detections from fleet cameras will appear here.
      </div>`;
    return;
  }

  const latest = events.slice(0, 12);

  container.innerHTML = latest.map(e => {
    const color = UrbanSense.getDetectionColor(e.type);

    return `
      <div class="activity-item">
        <div class="activity-icon" style="background:${color}22; color:${color}; border:1px solid ${color}44;">▲</div>
        <div class="activity-content">
          <div class="activity-title">
            <span style="color:${color};">${UrbanSense.escapeHTML(e.type)}</span>
            <span class="muted mono" style="font-size:10px; margin-left:6px;">${e.confidence}%</span>
          </div>
          <div class="activity-meta">${UrbanSense.escapeHTML(e.busId)} · ${UrbanSense.escapeHTML(e.location)}</div>
        </div>
        <span class="activity-time">${UrbanSense.timeAgo(e.timestamp)}</span>
      </div>
    `;
  }).join('');
}

/* =========================================================
   RECALC
   ========================================================= */

function setupRecalc() {
  const btn = document.getElementById('recalcBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = '⟳ Recalculating…';
    renderAll();
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '⟳ Recalculate';
      UrbanSense.showToast('Road health recalculated', 'success');
    }, 600);
  });
}

/* =========================================================
   ANIMATE NUMBER
   ========================================================= */

function animateNumber(id, start, end, duration) {
  const el = document.getElementById(id);
  if (!el) return;

  const startTime = performance.now();
  const diff = end - start;

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}