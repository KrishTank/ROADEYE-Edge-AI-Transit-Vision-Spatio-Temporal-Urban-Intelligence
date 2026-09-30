/* =========================================================
   URBANSENSE AI — INCIDENT CENTER
   v2 — with work-order assignment
   ========================================================= */

let currentStatusFilter = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  UrbanSense.startClock('liveClock');
  renderTable();
  setupFilters();
  setupExport();
  setupModal();
  setInterval(renderTable, 10000);
});

/* =========================================================
   FILTER
   ========================================================= */

function getFilteredEvents() {
  let events = UrbanSense.getEvents();

  if (currentStatusFilter !== 'all') {
    events = events.filter(e => (e.status || 'Open') === currentStatusFilter);
  }

  if (currentSearchQuery) {
    const q = currentSearchQuery;
    events = events.filter(e =>
      (e.id || '').toLowerCase().includes(q) ||
      (e.type || '').toLowerCase().includes(q) ||
      (e.bus_id || e.busId || '').toLowerCase().includes(q) ||
      (e.route || '').toLowerCase().includes(q) ||
      (e.location || '').toLowerCase().includes(q)
    );
  }

  return events;
}

/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderTable() {
  const events = getFilteredEvents();
  const tbody = document.getElementById('incidentTableBody');
  if (!tbody) return;

  document.getElementById('resultCount').textContent =
    events.length + (events.length === 1 ? ' incident' : ' incidents');

  if (events.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <strong>No incidents match the current filter</strong>
            Adjust the status or search above, or open the
            <a href="scanner.html">Edge AI Scanner</a> to generate a new detection.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = events.map(e => {
    const status = e.status || 'Open';
    const sevClass = (e.severity || 'low').toLowerCase();
    const statusClass = status.toLowerCase();
    const busId = e.bus_id || e.busId || '—';

    return `
      <tr data-incident-id="${e.id}">
        <td class="incident-id">${UrbanSense.escapeHTML(e.id)}</td>
        <td class="incident-type">${UrbanSense.escapeHTML(e.type)}</td>
        <td class="mono">${UrbanSense.escapeHTML(busId)}</td>
        <td>${UrbanSense.escapeHTML(e.location)}</td>
        <td class="incident-confidence">${e.confidence}%</td>
        <td><span class="badge badge-${sevClass}">${e.severity}</span></td>
        <td><span class="incident-status ${statusClass}">${status}</span></td>
        <td class="mono" style="font-size:10px; color:var(--text-dim);">${UrbanSense.timeAgo(e.timestamp)}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('tr[data-incident-id]').forEach(row => {
    row.addEventListener('click', () => {
      openIncidentModal(row.dataset.incidentId);
    });
  });
}

/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {
  document.querySelectorAll('#statusChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#statusChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStatusFilter = chip.dataset.status;
      renderTable();
    });
  });

  const input = document.getElementById('searchInput');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      currentSearchQuery = input.value.trim().toLowerCase();
      renderTable();
    }, 200);
  });
}

/* =========================================================
   EXPORT CSV
   ========================================================= */

function setupExport() {
  const btn = document.getElementById('exportBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const events = getFilteredEvents();
    if (events.length === 0) {
      UrbanSense.showToast('Nothing to export', 'warning');
      return;
    }

    const headers = ['ID', 'Type', 'Severity', 'Confidence', 'BusID', 'Route',
                     'Location', 'Latitude', 'Longitude', 'Status', 'Timestamp'];

    const rows = events.map(e => [
      e.id, e.type, e.severity, e.confidence,
      e.bus_id || e.busId || '', e.route,
      e.location, e.latitude, e.longitude, e.status, e.timestamp,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urbansense-incidents-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    UrbanSense.showToast('Exported ' + events.length + ' incidents', 'success');
  });
}

/* =========================================================
   MODAL
   ========================================================= */

function setupModal() {
  const modal = document.getElementById('incidentModal');
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

function openIncidentModal(incidentId) {
  const events = UrbanSense.getEvents();
  const e = events.find(x => x.id === incidentId);
  if (!e) return;

  const modal = document.getElementById('incidentModal');
  const title = document.getElementById('modalTitle');
  const body  = document.getElementById('modalBody');
  const foot  = document.getElementById('modalFoot');

  title.textContent = e.id + ' · ' + e.type;

  const sevClass = (e.severity || 'low').toLowerCase();
  const color = UrbanSense.getDetectionColor(e.type);
  const busId = e.bus_id || e.busId || '—';

  const statusSteps = ['Open', 'Verified', 'Dispatched', 'Resolved'];
  const currentIdx = statusSteps.indexOf(e.status || 'Open');

  const timelineHTML = statusSteps.map((step, i) => {
    const completed = i <= currentIdx;
    const labels = {
      Open: 'Incident logged by Edge AI',
      Verified: 'Verified by operations center',
      Dispatched: 'Repair crew dispatched',
      Resolved: 'Marked resolved by field team',
    };
    return `
      <div class="timeline-step ${completed ? 'completed' : ''}">
        <div class="timeline-dot">${completed ? '✓' : i + 1}</div>
        <div class="timeline-content">
          <div class="timeline-title">${labels[step]}</div>
          <div class="timeline-time">${completed ? UrbanSense.timeAgo(e.timestamp) : 'Pending'}</div>
        </div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <div class="evidence-frame">
      <div class="evidence-label">${UrbanSense.escapeHTML(e.camera_id || e.cameraId || 'CAM-01')} · ${UrbanSense.formatTime(e.timestamp)}</div>
      <div class="evidence-corner tl"></div>
      <div class="evidence-corner tr"></div>
      <div class="evidence-corner bl"></div>
      <div class="evidence-corner br"></div>
      <div class="evidence-bbox">
        <span class="evidence-bbox-label">${UrbanSense.escapeHTML(e.type)} · ${e.confidence}%</span>
      </div>
    </div>

    <div class="detail-grid">
      <div class="detail-stat"><span class="detail-stat-label">Type</span><span class="detail-stat-value" style="color:${color};">${UrbanSense.escapeHTML(e.type)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Severity</span><span class="detail-stat-value"><span class="badge badge-${sevClass}">${e.severity}</span></span></div>
      <div class="detail-stat"><span class="detail-stat-label">Confidence</span><span class="detail-stat-value">${e.confidence}%</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Detected By</span><span class="detail-stat-value">${UrbanSense.escapeHTML(busId)} · ${UrbanSense.escapeHTML(e.route)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Location</span><span class="detail-stat-value">${UrbanSense.escapeHTML(e.location)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Detected</span><span class="detail-stat-value">${UrbanSense.formatTime(e.timestamp)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Latitude</span><span class="detail-stat-value">${Number(e.latitude).toFixed(5)}</span></div>
      <div class="detail-stat"><span class="detail-stat-label">Longitude</span><span class="detail-stat-value">${Number(e.longitude).toFixed(5)}</span></div>
      ${e.vehicle_reg ? `<div class="detail-stat"><span class="detail-stat-label">Vehicle Registration</span><span class="detail-stat-value" style="color:var(--accent-amber);">${UrbanSense.escapeHTML(e.vehicle_reg)}</span></div>` : ''}
    </div>

    <div class="section-title">RESPONSE TIMELINE</div>
    <div class="timeline">${timelineHTML}</div>
  `;

  const nextAction = {
    Open:       { label: 'Verify Incident', next: 'Verified' },
    Verified:   { label: 'Dispatch Crew',   next: 'Dispatched' },
    Dispatched: { label: 'Mark Resolved',   next: 'Resolved' },
    Resolved:   null,
  }[e.status || 'Open'];

  foot.innerHTML = `
    <button class="btn" id="closeModalBtn">Close</button>
    ${e.status !== 'Resolved' ? `<button class="btn btn-primary" id="assignBtn">📋 Assign to Road Dept</button>` : ''}
    ${nextAction ? `<button class="btn" id="advanceBtn">${nextAction.label}</button>` : ''}
    ${e.status !== 'Resolved' && e.status !== 'Dismissed'
      ? `<button class="btn btn-danger" id="dismissBtn">Dismiss</button>` : ''}
  `;

  /* ---------- Close ---------- */
  foot.querySelector('#closeModalBtn').addEventListener('click', () => {
    modal.classList.remove('open');
  });

  /* ---------- Assign to Road Dept ---------- */
  const assignBtn = foot.querySelector('#assignBtn');
  if (assignBtn) {
    assignBtn.addEventListener('click', async () => {
      assignBtn.disabled = true;
      assignBtn.textContent = '📋 Creating ticket…';

      try {
        const res = await fetch('http://localhost:5000/api/events/' + e.id + '/work-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: 'Road Department',
            priority: e.severity,
            notes: 'Auto-created from incident center',
          }),
        });
        const json = await res.json();

        if (json.success) {
          const wo = json.data;
          UrbanSense.showToast('Work order ' + wo.id + ' assigned to ' + wo.department, 'success');
          assignBtn.textContent = '✓ Assigned · ' + wo.id;
          assignBtn.style.background = 'rgba(0, 230, 138, 0.15)';
          assignBtn.style.color = 'var(--accent-green)';
          assignBtn.style.borderColor = 'rgba(0, 230, 138, 0.3)';

          setTimeout(renderTable, 1000);
        } else {
          throw new Error(json.error || 'Failed');
        }
      } catch (err) {
        UrbanSense.showToast('Work order failed: ' + err.message, 'error');
        assignBtn.disabled = false;
        assignBtn.textContent = '📋 Assign to Road Dept';
      }
    });
  }

  /* ---------- Advance status ---------- */
  if (nextAction) {
    foot.querySelector('#advanceBtn').addEventListener('click', () => {
      UrbanSense.updateEventStatus(e.id, nextAction.next);
      UrbanSense.showToast(e.id + ' → ' + nextAction.next, 'success');
      modal.classList.remove('open');
      renderTable();
    });
  }

  /* ---------- Dismiss ---------- */
  const dismissBtn = foot.querySelector('#dismissBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      UrbanSense.updateEventStatus(e.id, 'Resolved');
      UrbanSense.showToast(e.id + ' dismissed', 'warning');
      modal.classList.remove('open');
      renderTable();
    });
  }

  modal.classList.add('open');
}