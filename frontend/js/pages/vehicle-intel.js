/* =========================================================
   URBANSENSE AI — VEHICLE INTELLIGENCE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  UrbanSense.startClock('liveClock');
  renderAll();
  setupRefresh();
  setInterval(renderAll, 8000);
});

function renderAll() {
  renderCounters();
  renderFlowChart();
  renderSpeedChart();
  renderClassBreakdown();
  renderTrafficStatus();
}

/* =========================================================
   COUNTERS
   Deterministic based on current time — grows over the day
   ========================================================= */

function renderCounters() {
  const hour = new Date().getHours();
  const trafficMultiplier = getTrafficMultiplier(hour);

  const cars   = Math.round(320 * trafficMultiplier + Math.random() * 30);
  const bikes  = Math.round(520 * trafficMultiplier + Math.random() * 40);
  const buses  = Math.round(40  * trafficMultiplier + Math.random() * 5);
  const trucks = Math.round(35  * trafficMultiplier + Math.random() * 5);

  document.getElementById('vcCars').textContent   = cars.toLocaleString();
  document.getElementById('vcBikes').textContent  = bikes.toLocaleString();
  document.getElementById('vcBuses').textContent  = buses.toLocaleString();
  document.getElementById('vcTrucks').textContent = trucks.toLocaleString();
}

function getTrafficMultiplier(hour) {
  // Peak hours: 8-10am, 5-8pm
  if (hour >= 8  && hour <= 10) return 1.6;
  if (hour >= 17 && hour <= 20) return 1.8;
  if (hour >= 22 || hour <= 5)  return 0.3;
  return 1.0;
}

/* =========================================================
   FLOW CHART (hourly detection count)
   ========================================================= */

function renderFlowChart() {
  const canvas = document.getElementById('flowChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  // Generate 12-hour data based on real traffic pattern
  const hours = [];
  const values = [];
  const now = new Date().getHours();

  for (let i = 11; i >= 0; i--) {
    const h = (now - i + 24) % 24;
    hours.push(String(h).padStart(2, '0') + ':00');
    const base = h >= 8 && h <= 10 ? 780
              : h >= 17 && h <= 20 ? 950
              : h >= 22 || h <= 5 ? 120
              : 480;
    values.push(base + Math.round(Math.random() * 80 - 40));
  }

  drawLineChart(ctx, W, H, hours, values, '#00E5FF');
}

/* =========================================================
   SPEED CHART (avg speed by hour)
   ========================================================= */

function renderSpeedChart() {
  const canvas = document.getElementById('speedChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const hours = [];
  const values = [];
  const now = new Date().getHours();

  for (let i = 11; i >= 0; i--) {
    const h = (now - i + 24) % 24;
    hours.push(String(h).padStart(2, '0') + ':00');
    // Speeds inverse to traffic: peak hours = low speed
    const base = h >= 8 && h <= 10 ? 22
              : h >= 17 && h <= 20 ? 18
              : h >= 22 || h <= 5 ? 52
              : 38;
    values.push(base + Math.round(Math.random() * 6 - 3));
  }

  drawLineChart(ctx, W, H, hours, values, '#8B5CF6', 'km/h');
}

/* =========================================================
   SHARED LINE CHART RENDERER
   ========================================================= */

function drawLineChart(ctx, W, H, labels, values, color, suffix) {
  const pad = { left: 46, right: 16, top: 20, bottom: 30 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.ceil(Math.max(...values) * 1.15);

  ctx.strokeStyle = '#1E2A3F';
  ctx.lineWidth = 1;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = '#4A5A75';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillText(Math.round(maxVal * i / 4), pad.left - 6, y);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  labels.forEach((label, i) => {
    if (i % 2 !== 0) return;
    const x = pad.left + (chartW * i / (labels.length - 1));
    ctx.fillText(label, x, H - pad.bottom + 8);
  });

  const points = values.map((v, i) => ({
    x: pad.left + (chartW * i / (values.length - 1)),
    y: pad.top + chartH - (v / maxVal * chartH),
    value: v,
  }));

  // Gradient fill
  ctx.beginPath();
  ctx.moveTo(points[0].x, pad.top + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, hexToRgba(color, 0.35));
  grad.addColorStop(1, hexToRgba(color, 0.02));
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Points
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0A1120';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* =========================================================
   VEHICLE CLASS BREAKDOWN
   ========================================================= */

function renderClassBreakdown() {
  const container = document.getElementById('classBreakdown');
  if (!container) return;

  const classes = [
    { name: 'Cars',         value: 48, color: '#4169E1' },
    { name: 'Two Wheelers', value: 31, color: '#00E5FF' },
    { name: 'Buses',        value: 9,  color: '#8B5CF6' },
    { name: 'Trucks',       value: 7,  color: '#FFB300' },
    { name: 'Other',        value: 5,  color: '#7A8BA5' },
  ];

  container.innerHTML = classes.map(c => `
    <div class="class-row">
      <div class="class-name">${c.name}</div>
      <div class="class-track">
        <div class="class-fill" style="width:${c.value}%; background:${c.color};"></div>
      </div>
      <div class="class-count">${c.value}%</div>
    </div>
  `).join('');
}

/* =========================================================
   TRAFFIC STATUS
   ========================================================= */

function renderTrafficStatus() {
  const container = document.getElementById('trafficStatus');
  if (!container) return;

  const zones = [
    { name: 'Central Zone',    density: 78 },
    { name: 'Ring Road',       density: 65 },
    { name: 'Industrial Area', density: 43 },
    { name: 'Airport Road',    density: 28 },
    { name: 'Main Road',       density: 56 },
  ];

  container.innerHTML = zones.map(z => {
    let level = 'low';
    if (z.density >= 70) level = 'high';
    else if (z.density >= 45) level = 'medium';

    return `
      <div class="traffic-status-row">
        <span class="label">${z.name}</span>
        <span class="traffic-status-pill ${level}">
          <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
          ${z.density}% · ${level.toUpperCase()}
        </span>
      </div>
    `;
  }).join('');
}

/* =========================================================
   REFRESH BUTTON
   ========================================================= */

function setupRefresh() {
  const btn = document.getElementById('refreshBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    renderAll();
    UrbanSense.showToast('Vehicle intelligence refreshed', 'success');
  });
}