/* =========================================================
   URBANSENSE AI — FIELD OPERATIONS
   Crew assignments, live status, work order tracking.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  UrbanSense.startClock('liveClock');
  renderAll();
  setInterval(renderAll, 8000);
});

/* =========================================================
   CREW DATA (simulated municipal crews)
   ========================================================= */

const CREWS = [
  { id: 'CREW-01', name: 'Alpha Unit',     dept: 'Road Department',    status: 'on-site',    lat: 12.9716, lng: 77.5946, eta: '—',   activeOrders: 1 },
  { id: 'CREW-02', name: 'Bravo Unit',     dept: 'Road Department',    status: 'en-route',   lat: 12.9600, lng: 77.6050, eta: '8 min', activeOrders: 1 },
  { id: 'CREW-03', name: 'Charlie Unit',   dept: 'Water & Drainage',   status: 'idle',       lat: 12.9860, lng: 77.6120, eta: '—',   activeOrders: 0 },
  { id: 'CREW-04', name: 'Delta Unit',     dept: 'Traffic Police',     status: 'on-site',    lat: 12.9520, lng: 77.6180, eta: '—',   activeOrders: 2 },
  { id: 'CREW-05', name: 'Echo Unit',      dept: 'Emergency Services', status: 'available',  lat: 12.9800, lng: 77.5820, eta: '—',   activeOrders: 0 },
  { id: 'CREW-06', name: 'Foxtrot Unit',   dept: 'Road Department',    status: 'en-route',   lat: 12.9750, lng: 77.6068, eta: '12 min', activeOrders: 1 },
];

const STATUS_META = {
  'idle':       { label: 'IDLE',       color: '#7A8BA5' },
  'available':  { label: 'AVAILABLE',  color: '#00E68A' },
  'en-route':   { label: 'EN ROUTE',   color: '#FFB300' },
  'on-site':    { label: 'ON SITE',    color: '#00E5FF' },
  'completed':  { label: 'COMPLETED',  color: '#00E68A' },
};

/* =========================================================
   MAIN RENDER
   ========================================================= */

async function renderAll() {
  await renderKPIs();
  renderCrews();
  await renderActiveAssignments();
  renderStatusFlow();
}

/* =========================================================
   KPIs
   ========================================================= */

async function renderKPIs() {
  try {
    const crews = CREWS;
    const onSite = crews.filter(c => c.status === 'on-site').length;
    const enRoute = crews.filter(c => c.status === 'en-route').length;
    const available = crews.filter(c => c.status === 'available' || c.status === 'idle').length;

    setText('foTotalCrews', crews.length);
    setText('foOnSite', onSite);
    setText('foEnRoute', enRoute);
    setText('foAvailable', available);

    // Active orders count
    const res = await fetch('http://localhost:5000/api/work-orders').then(r => r.json()).catch(() => ({ data: [] }));
    const orders = (res && res.data) ? res.data : [];
    const active = orders.filter(o => o.status !== 'Resolved' && o.status !== 'Completed').length;
    setText('foActiveOrders', active);
  } catch (e) {
    console.warn('[field-ops] KPI failed:', e);
  }
}

/* =========================================================
   CREWS GRID
   ========================================================= */

function renderCrews() {
  const container = document.getElementById('foCrewGrid');
  if (!container) return;

  container.innerHTML = CREWS.map(c => {
    const meta = STATUS_META[c.status] || STATUS_META.idle;
    return `
      <div class="crew-card">
        <div class="crew-head">
          <div class="crew-id mono">${escapeHTML(c.id)}</div>
          <span class="crew-status" style="color:${meta.color}; border-color:${meta.color}33; background:${meta.color}15;">
            <span style="width:6px;height:6px;border-radius:50%;background:${meta.color};box-shadow:0 0 6px ${meta.color};"></span>
            ${meta.label}
          </span>
        </div>
        <div class="crew-name">${escapeHTML(c.name)}</div>
        <div class="crew-dept">${escapeHTML(c.dept)}</div>

        <div class="crew-stats">
          <div class="crew-stat">
            <span class="label">Active orders</span>
            <span class="value mono">${c.activeOrders}</span>
          </div>
          <div class="crew-stat">
            <span class="label">ETA</span>
            <span class="value mono">${escapeHTML(c.eta)}</span>
          </div>
        </div>

        <div class="crew-footer mono">
          ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   ACTIVE ASSIGNMENTS
   ========================================================= */

async function renderActiveAssignments() {
  const container = document.getElementById('foAssignmentsList');
  if (!container) return;

  try {
    const res = await fetch('http://localhost:5000/api/work-orders').then(r => r.json());
    const orders = (res && res.data) ? res.data : [];
    const active = orders.filter(o => o.status !== 'Resolved' && o.status !== 'Completed');

    if (active.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:30px 20px;">
          <strong>No active assignments</strong>
          Assign work orders from the Incident Center.
        </div>`;
      return;
    }

    container.innerHTML = active.slice(0, 10).map((o, i) => {
      const crew = CREWS[i % CREWS.length];
      const eta = ['3 min', '6 min', '9 min', '12 min', '15 min'][i % 5];
      const priority = (o.priority || 'medium').toLowerCase();

      return `
        <div class="assignment-row">
          <div class="assign-icon">${priority === 'critical' ? '🚨' : priority === 'high' ? '⚠️' : '📋'}</div>
          <div class="assign-body">
            <div class="assign-title">
              <span class="mono" style="color:var(--accent-cyan);">${escapeHTML(o.id)}</span>
              <span style="color:var(--text-muted);">·</span>
              <span>${escapeHTML(o.department || 'Road Department')}</span>
            </div>
            <div class="assign-meta mono">
              Crew ${escapeHTML(crew.id)} · ${escapeHTML(crew.name)} · ETA ${eta}
            </div>
          </div>
          <div class="assign-priority">
            <span class="badge badge-${priority}">${escapeHTML(o.priority || 'MEDIUM')}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Failed to load assignments.</div>`;
  }
}

/* =========================================================
   STATUS FLOW (kanban-like)
   ========================================================= */

function renderStatusFlow() {
  const container = document.getElementById('foStatusFlow');
  if (!container) return;

  const stages = [
    { id: 'assigned',   label: 'Assigned',     count: 3, color: '#00E5FF' },
    { id: 'inprogress', label: 'In Progress',  count: 2, color: '#FFB300' },
    { id: 'completed',  label: 'Completed',    count: 8, color: '#00E68A' },
    { id: 'verified',   label: 'Verified',     count: 5, color: '#8B5CF6' },
  ];

  container.innerHTML = stages.map(s => `
    <div class="flow-card" style="--flow-color:${s.color};">
      <div class="flow-count mono">${s.count}</div>
      <div class="flow-label">${s.label}</div>
      <div class="flow-bar"><div class="flow-fill" style="width:100%; background:${s.color};"></div></div>
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
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}