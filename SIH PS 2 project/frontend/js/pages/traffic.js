/* =========================================================
   URBANSENSE AI — TRAFFIC ANALYTICS
   ========================================================= */

let currentRange = 12;
let canvas, ctx;
let zones = [];

const INITIAL_ZONES = [
  { name: 'Central Zone',    value: 78, vehicles: 1240, status: 'HIGH' },
  { name: 'Ring Road',       value: 65, vehicles: 980,  status: 'HIGH' },
  { name: 'Industrial Area', value: 43, vehicles: 710,  status: 'MODERATE' },
  { name: 'Airport Road',    value: 28, vehicles: 420,  status: 'LOW' },
  { name: 'Main Road',       value: 56, vehicles: 860,  status: 'MODERATE' },
];

const TRAFFIC_INTELLIGENCE = [
  { icon: '⚠', color: 'red', badge: 'CRITICAL', title: 'Heavy congestion detected', desc: 'Central Zone operating at 82% congestion based on 6 active fleet cameras.', time: '2 min ago' },
  { icon: '🚗', color: 'amber', badge: 'HIGH', title: 'Traffic buildup detected', desc: 'Vehicle density increased near Ring Road during current monitoring cycle.', time: '5 min ago' },
  { icon: '↘', color: 'blue', badge: 'INFO', title: 'Traffic flow improving', desc: 'Industrial Area traffic intensity decreased by approximately 8%.', time: '8 min ago' },
  { icon: '✓', color: 'green', badge: 'NORMAL', title: 'Airport Road operating normally', desc: 'Low vehicle density and stable average speed detected.', time: '11 min ago' },
];

const VEHICLE_CLASSES = [
  { name: 'Cars',         value: 48, color: '#4169E1' },
  { name: 'Two Wheelers', value: 31, color: '#00E5FF' },
  { name: 'Buses',        value: 9,  color: '#8B5CF6' },
  { name: 'Trucks',       value: 7,  color: '#FFB300' },
  { name: 'Other',        value: 5,  color: '#7A8BA5' },
];

const CHART_DATA = {
  6:  { labels: ['15:00','16:00','17:00','18:00','19:00','20:00'], values: [620, 810, 1040, 1080, 890, 720] },
  12: { labels: ['09','10','11','12','13','14','15','16','17','18','19','20'], values: [880, 650, 540, 560, 590, 620, 700, 810, 920, 1050, 890, 720] },
  24: { labels: ['00','02','04','06','08','10','12','14','16','18','20','22'], values: [180, 120, 90, 240, 760, 650, 540, 620, 810, 1050, 720, 420] },
};

document.addEventListener('DOMContentLoaded', () => {
  zones = INITIAL_ZONES.map(z => ({ ...z }));
  renderZones();
  renderAIFeed();
  renderVehicleBreakdown();
  initChart();
  setupRangeButtons();
  updateKPIs();

  setInterval(() => {
    simulateTraffic();
    updateKPIs();
  }, 6000);
});

/* =========================================================
   KPIs
   ========================================================= */

function updateKPIs() {
  const totalVehicles = zones.reduce((s, z) => s + z.vehicles, 0) + 4600;
  const congested = zones.filter(z => z.value >= 60).length;
  const critical  = zones.filter(z => z.value >= 75).length;
  const avgCongestion = zones.reduce((s, z) => s + z.value, 0) / zones.length;
  const flow = Math.round(100 - avgCongestion * 0.25);

  document.getElementById('vehiclesDetected').textContent = totalVehicles.toLocaleString();
  document.getElementById('congestedZones').textContent   = congested;
  document.getElementById('criticalZones').textContent    = critical + ' critical';
  document.getElementById('averageDelay').innerHTML       = (14 + Math.random() * 3).toFixed(1) + '<span class="kpi-unit">m</span>';
  document.getElementById('trafficFlow').innerHTML        = flow + '<span class="kpi-unit">%</span>';

  const flowStatus = document.getElementById('flowStatus');
  if (flow >= 75)      { flowStatus.textContent = 'Normal';   flowStatus.style.color = 'var(--accent-green)'; }
  else if (flow >= 55) { flowStatus.textContent = 'Moderate'; flowStatus.style.color = 'var(--accent-amber)'; }
  else                 { flowStatus.textContent = 'Heavy';    flowStatus.style.color = 'var(--accent-red)'; }

  const fleet = UrbanSense.getFleet();
  const avgSpeed = fleet.length ? Math.round(fleet.reduce((s, b) => s + b.speed, 0) / fleet.length) : 0;
  document.getElementById('avgSpeed').textContent = avgSpeed + ' km/h';
  document.getElementById('camerasOnline').textContent = fleet.filter(b => b.camera === 'ONLINE').length;

  const avg = avgCongestion;
  const pill = document.getElementById('statusPill');
  const val  = document.getElementById('overallStatus');
  const msg  = document.getElementById('statusMessage');

  pill.className = 'status-pill';
  if (avg >= 75) {
    val.textContent = 'Severe';
    pill.textContent = 'CRITICAL';
    pill.classList.add('crit');
    msg.textContent = 'Network under heavy load. AI recommends rerouting and dispatch of traffic control.';
  } else if (avg >= 55) {
    val.textContent = 'Moderate';
    pill.textContent = 'HIGH';
    pill.classList.add('warn');
    msg.textContent = 'Traffic network operating above normal capacity. AI monitoring continues.';
  } else {
    val.textContent = 'Low';
    pill.textContent = 'NORMAL';
    msg.textContent = 'Traffic network operating within expected capacity.';
  }
}

/* =========================================================
   ZONES
   ========================================================= */

function renderZones() {
  const container = document.getElementById('zonesContainer');
  if (!container) return;

  container.innerHTML = zones.map((z, i) => {
    const color = z.value >= 75 ? 'var(--accent-red)'
                : z.value >= 60 ? 'var(--accent-amber)'
                : z.value >= 35 ? 'var(--accent-cyan)'
                :                 'var(--accent-green)';

    return `
      <div class="zone-item" data-zone-index="${i}">
        <div class="zone-top">
          <div class="zone-name">
            <span class="zone-dot" style="background:${color}; box-shadow:0 0 6px ${color};"></span>
            ${z.name}
          </div>
          <div class="zone-percent">${z.value}%</div>
        </div>
        <div class="zone-track">
          <div class="zone-fill" style="width:${z.value}%; background:${color};"></div>
        </div>
        <div class="zone-meta">
          <span>${z.status}</span>
          <span>${z.vehicles.toLocaleString()} vehicles</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.zone-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = Number(item.dataset.zoneIndex);
      const z = zones[idx];
      UrbanSense.showToast(`${z.name}: ${z.value}% congestion`, 'info');
    });
  });
}

/* =========================================================
   AI FEED
   ========================================================= */

function renderAIFeed() {
  const container = document.getElementById('aiFeed');
  if (!container) return;

  container.innerHTML = TRAFFIC_INTELLIGENCE.map(e => `
    <div class="ai-event">
      <div class="ai-event-icon ${e.color}">${e.icon}</div>
      <div class="ai-event-content">
        <div class="ai-event-title">${e.title}</div>
        <div class="ai-event-desc">${e.desc}</div>
        <div class="ai-event-time">${e.time}</div>
      </div>
      <span class="badge badge-${e.badge === 'CRITICAL' ? 'critical' :
                                 e.badge === 'HIGH' ? 'high' :
                                 e.badge === 'INFO' ? 'info' : 'normal'}">${e.badge}</span>
    </div>
  `).join('');
}

/* =========================================================
   VEHICLE BREAKDOWN
   ========================================================= */

function renderVehicleBreakdown() {
  const container = document.getElementById('vehicleBreakdown');
  if (!container) return;

  container.innerHTML = VEHICLE_CLASSES.map(v => `
    <div class="vehicle-row">
      <div class="vehicle-row-top">
        <span class="vehicle-label">${v.name}</span>
        <span class="vehicle-value">${v.value}%</span>
      </div>
      <div class="vehicle-track">
        <div class="vehicle-fill" style="width:${v.value}%; background:${v.color};"></div>
      </div>
    </div>
  `).join('');
}

/* =========================================================
   CHART
   ========================================================= */

function initChart() {
  canvas = document.getElementById('trafficChart');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawChart(); });
  drawChart();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawChart() {
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const data = CHART_DATA[currentRange];
  const values = data.values;
  const labels = data.labels;

  const pad = { left: 50, right: 20, top: 20, bottom: 34 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const maxVal = Math.ceil(Math.max(...values) / 200) * 200;

  ctx.strokeStyle = '#1E2A3F';
  ctx.lineWidth = 1;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = '#4A5A75';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH - (chartH * i / 5);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    const v = Math.round(maxVal * i / 5);
    ctx.fillText(v.toLocaleString(), pad.left - 8, y);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#4A5A75';
  labels.forEach((label, i) => {
    const x = pad.left + (chartW * i / (labels.length - 1));
    ctx.fillText(label, x, H - pad.bottom + 10);
  });

  const points = values.map((v, i) => ({
    x: pad.left + (chartW * i / (values.length - 1)),
    y: pad.top + chartH - (v / maxVal * chartH),
    value: v,
  }));

  ctx.beginPath();
  ctx.moveTo(points[0].x, pad.top + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  gradient.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 229, 255, 0.02)');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0A1120';
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const peak = points.reduce((m, p) => p.value > m.value ? p : m, points[0]);
  ctx.fillStyle = '#E6F0FF';
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(peak.value.toLocaleString(), peak.x, peak.y - 10);
}

/* =========================================================
   RANGE BUTTONS
   ========================================================= */

function setupRangeButtons() {
  document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRange = Number(btn.dataset.range);
      drawChart();
    });
  });
}

/* =========================================================
   SIMULATE
   ========================================================= */

function simulateTraffic() {
  zones.forEach(z => {
    const change = Math.floor(Math.random() * 8) - 4;
    z.value = Math.max(15, Math.min(95, z.value + change));
    z.vehicles = Math.max(150, z.vehicles + Math.floor(Math.random() * 120) - 60);

    if (z.value >= 75)      z.status = 'CRITICAL';
    else if (z.value >= 60) z.status = 'HIGH';
    else if (z.value <= 35) z.status = 'LOW';
    else                    z.status = 'MODERATE';
  });

  renderZones();
  drawChart();
}