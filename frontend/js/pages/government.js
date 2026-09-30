/* =========================================================
   URBANSENSE AI — GOVERNMENT ACTION PAGE
   Work orders, municipal departments, SLA tracking.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  UrbanSense.startClock('liveClock');
  renderAll();
  setInterval(renderAll, 8000);
});

/* =========================================================
   MAIN RENDER
   ========================================================= */

async function renderAll() {
  await renderKPIs();
  await renderWorkOrders();
  await renderDepartments();
  await renderSLA();
}

/* =========================================================
   KPIs
   ========================================================= */

async function renderKPIs() {
  try {
    const [orders, events] = await Promise.all([
      fetch('http://localhost:5000/api/work-orders').then(r => r.json()).catch(() => ({ data: [] })),
      UrbanAPI.getEvents({ limit: 200 }),
    ]);

    const woList = (orders && orders.data) ? orders.data : [];
    const total = woList.length;
    const assigned = woList.filter(w => w.status === 'Assigned').length;
    const inProgress = woList.filter(w => w.status === 'In Progress').length;
    const resolved = woList.filter(w => w.status === 'Resolved' || w.status === 'Completed').length;

    setText('govTotalOrders', total);
    setText('govAssigned', assigned);
    setText('govInProgress', inProgress);
    setText('govResolved', resolved);

    const pending = (events || []).filter(e => e.status !== 'Resolved').length;
    setText('govPendingIncidents', pending);
  } catch (e) {
    console.warn('[government] KPI fetch failed:', e);
  }
}

/* =========================================================
   WORK ORDERS LIST
   ========================================================= */

async function renderWorkOrders() {
  const container = document.getElementById('govOrdersList');
  if (!container) return;

  try {
    const res = await fetch('http://localhost:5000/api/work-orders').then(r => r.json());
    const orders = (res && res.data) ? res.data : [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:40px 20px;">
          <strong>No work orders yet</strong>
          Assign incidents to a department from the Incident Center.<br>
          <a href="incidents.html" style="color:var(--accent-cyan);">Go to Incident Center →</a>
        </div>`;
      return;
    }

    container.innerHTML = orders.slice(0, 20).map(w => {
      const statusClass = (w.status || 'assigned').toLowerCase().replace(/\s+/g, '-');
      const priorityClass = (w.priority || 'medium').toLowerCase();
      const created = new Date(w.created_at);
      const timeStr = created.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const dateStr = created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      return `
        <div class="wo-row">
          <div class="wo-id">
            <span class="mono">${escapeHTML(w.id)}</span>
          </div>
          <div class="wo-dept">
            <div class="wo-dept-name">${escapeHTML(w.department || 'Road Department')}</div>
            <div class="wo-dept-meta mono">Event: ${escapeHTML(w.event_id || '—')}</div>
          </div>
          <div class="wo-priority">
            <span class="badge badge-${priorityClass}">${escapeHTML(w.priority || 'MEDIUM')}</span>
          </div>
          <div class="wo-status">
            <span class="wo-status-pill ${statusClass}">${escapeHTML(w.status || 'Assigned')}</span>
          </div>
          <div class="wo-time mono">
            ${timeStr}<br><span class="dim">${dateStr}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Failed to load work orders.</div>`;
  }
}

/* =========================================================
   DEPARTMENTS GRID
   ========================================================= */

async function renderDepartments() {
  const container = document.getElementById('govDeptGrid');
  if (!container) return;

  const departments = [
    { name: 'Road Department',      icon: '🛣️', color: '#00E5FF', load: 0, sla: 92 },
    { name: 'Traffic Police',       icon: '🚦', color: '#FFB300', load: 0, sla: 88 },
    { name: 'Water & Drainage',     icon: '💧', color: '#00E68A', load: 0, sla: 95 },
    { name: 'Urban Planning',       icon: '🏙️', color: '#8B5CF6', load: 0, sla: 90 },
    { name: 'Emergency Services',   icon: '🚑', color: '#FF3B47', load: 0, sla: 97 },
    { name: 'Sanitation',           icon: '🧹', color: '#7A8BA5', load: 0, sla: 85 },
  ];

  try {
    const res = await fetch('http://localhost:5000/api/work-orders').then(r => r.json());
    const orders = (res && res.data) ? res.data : [];
    orders.forEach(w => {
      const d = departments.find(x => x.name === w.department);
      if (d) d.load++;
    });
  } catch (e) {}

  container.innerHTML = departments.map(d => `
    <div class="dept-card" style="--dept-color: ${d.color};">
      <div class="dept-icon">${d.icon}</div>
      <div class="dept-name">${d.name}</div>
      <div class="dept-stats">
        <div class="dept-stat">
          <span class="label">Active orders</span>
          <span class="value mono">${d.load}</span>
        </div>
        <div class="dept-stat">
          <span class="label">SLA %</span>
          <span class="value mono" style="color:${d.sla >= 90 ? 'var(--accent-green)' : 'var(--accent-amber)'};">${d.sla}%</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* =========================================================
   SLA PANEL
   ========================================================= */

async function renderSLA() {
  const container = document.getElementById('govSlaPanel');
  if (!container) return;

  const metrics = [
    { label: 'Avg. Response Time',    value: '18 min', trend: '-12%', good: true },
    { label: 'Avg. Resolution Time',  value: '4.2 hr', trend: '-8%',  good: true },
    { label: 'SLA Compliance',        value: '92%',    trend: '+3%',  good: true },
    { label: 'Escalated Tickets',     value: '3',      trend: '+1',   good: false },
    { label: 'Overdue Tickets',       value: '1',      trend: '-2',   good: true },
  ];

  container.innerHTML = metrics.map(m => `
    <div class="sla-row">
      <span class="sla-label">${m.label}</span>
      <span class="sla-value mono">${m.value}</span>
      <span class="sla-trend ${m.good ? 'good' : 'bad'} mono">${m.trend}</span>
    </div>
  `).join('');
}

/* =========================================================
   HELPERS
   ========================================================= */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}