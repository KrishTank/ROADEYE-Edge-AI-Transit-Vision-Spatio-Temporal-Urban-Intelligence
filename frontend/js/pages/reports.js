/* =========================================================
   URBANSENSE AI — REPORTS & INSIGHTS
   ========================================================= */

let currentReport = 'daily';

const REPORT_TYPES = [
  { id: 'daily',    icon: '◈', label: 'Daily Summary',       filter: () => true },
  { id: 'road',     icon: '▲', label: 'Weekly Road Defects', filter: e =>
      ['Pothole','Road Crack','Waterlogging','Missing Divider','Missing Sign','Missing Zebra','Damaged Road'].includes(e.type) },
  { id: 'incident', icon: '⚠', label: 'Incident Report',     filter: e =>
      ['Rash Driving','Pedestrian','Accident','Signal Viol'].some(t => (e.type || '').includes(t)) },
  { id: 'traffic',  icon: '⇄', label: 'Traffic Report',      filter: e =>
      ['Traffic Density','Traffic Sign'].some(t => (e.type || '').includes(t)) },
  { id: 'fleet',    icon: '▣', label: 'Fleet Performance',   filter: () => true, mode: 'fleet' },
];

document.addEventListener('DOMContentLoaded', () => {
  renderReportTypes();
  updateSourceStats();
  renderReport('daily');
  setInterval(updateSourceStats, 10000);
});

/* =========================================================
   REPORT TYPE BUTTONS
   ========================================================= */

function renderReportTypes() {
  const container = document.getElementById('reportTypes');
  if (!container) return;

  const events = UrbanSense.getEvents();

  container.innerHTML = REPORT_TYPES.map(rt => {
    const count = rt.mode === 'fleet'
      ? UrbanSense.getFleet().length
      : events.filter(rt.filter).length;

    return `
      <button class="report-type-btn ${currentReport === rt.id ? 'active' : ''}" data-report-id="${rt.id}">
        <div class="icon">${rt.icon}</div>
        <div class="label">${rt.label}</div>
        <div class="count">${count}</div>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.report-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentReport = btn.dataset.reportId;
      renderReportTypes();
      renderReport(currentReport);
    });
  });
}

/* =========================================================
   DATA SOURCE
   ========================================================= */

function updateSourceStats() {
  const fleet = UrbanSense.getFleet();
  const events = UrbanSense.getEvents();

  document.getElementById('srcFleet').textContent    = fleet.length;
  document.getElementById('srcEvents').textContent   = events.length;
  document.getElementById('srcOpen').textContent     = events.filter(e => e.status !== 'Resolved').length;
  document.getElementById('srcResolved').textContent = events.filter(e => e.status === 'Resolved').length;
  document.getElementById('srcUpdated').textContent  = new Date().toLocaleTimeString('en-GB');
}

/* =========================================================
   RENDER REPORT
   ========================================================= */

function renderReport(id) {
  const container = document.getElementById('reportPreview');
  if (!container) return;

  const rt = REPORT_TYPES.find(r => r.id === id);
  if (!rt) return;

  if (rt.mode === 'fleet') {
    container.innerHTML = buildFleetReport();
  } else {
    const events = UrbanSense.getEvents().filter(rt.filter);
    container.innerHTML = buildEventReport(id, rt, events);
  }
}

/* =========================================================
   EVENT REPORT
   ========================================================= */

function buildEventReport(id, rt, events) {
  const now = new Date();
  const rangeLabel = id === 'daily' ? 'Last 24 hours'
                   : id === 'road'  ? 'Last 7 days'
                   : 'Current session';

  const total    = events.length;
  const critical = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
  const resolved = events.filter(e => e.status === 'Resolved').length;
  const avgConf  = total > 0
    ? (events.reduce((s, e) => s + Number(e.confidence || 0), 0) / total).toFixed(1)
    : '0.0';

  const typeCounts = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const locationCounts = {};
  events.forEach(e => { locationCounts[e.location] = (locationCounts[e.location] || 0) + 1; });
  const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recommendations = generateRecommendations(events, id);

  return `
    <div class="report-preview">
      <div class="report-header">
        <div class="report-brand">
          <div class="logo-mark">U</div>
          <div>
            <div class="brand-text">UrbanSense AI</div>
            <div class="brand-sub">CITY INTELLIGENCE · AUTOMATED REPORT</div>
          </div>
        </div>
        <div class="report-title">${rt.label}</div>
        <div class="report-subtitle">
          Generated ${now.toLocaleDateString('en-GB')} · ${now.toLocaleTimeString('en-GB')} · Range: ${rangeLabel}
        </div>
      </div>

      <div class="report-kpis">
        <div class="report-kpi">
          <div class="label">Events</div>
          <div class="value">${total}</div>
          <div class="sub">${total === 0 ? 'No detections' : 'In range'}</div>
        </div>
        <div class="report-kpi">
          <div class="label">High Severity</div>
          <div class="value" style="color:${critical > 0 ? 'var(--accent-red)' : 'var(--text-primary)'};">${critical}</div>
          <div class="sub">${total > 0 ? Math.round(critical / total * 100) + '% of total' : '—'}</div>
        </div>
        <div class="report-kpi">
          <div class="label">Resolved</div>
          <div class="value" style="color:var(--accent-green);">${resolved}</div>
          <div class="sub">${total > 0 ? Math.round(resolved / total * 100) + '% completion' : '—'}</div>
        </div>
        <div class="report-kpi">
          <div class="label">Avg Confidence</div>
          <div class="value">${avgConf}<span style="font-size:12px; color:var(--text-muted);">%</span></div>
          <div class="sub">AI inference</div>
        </div>
      </div>

      ${total === 0 ? `
        <div class="report-section">
          <div class="report-empty">
            <strong>No detections in this range</strong>
            Run the <a href="scanner.html">Edge AI Scanner</a> to generate events.
          </div>
        </div>
      ` : `
        <div class="report-section">
          <div class="report-section-title">Top Detection Categories</div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style="width:120px;">Count</th>
                <th style="width:120px;">Share</th>
              </tr>
            </thead>
            <tbody>
              ${topTypes.map(([type, count]) => `
                <tr>
                  <td>
                    <span class="severity-dot" style="background:${UrbanSense.getDetectionColor(type)}; display:inline-block; margin-right:8px;"></span>
                    ${UrbanSense.escapeHTML(type)}
                  </td>
                  <td class="mono">${count}</td>
                  <td class="mono">${Math.round(count / total * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${topLocations.length ? `
          <div class="report-section">
            <div class="report-section-title">Hotspot Zones</div>
            <table class="report-table">
              <thead>
                <tr><th>Zone</th><th style="width:120px;">Detections</th></tr>
              </thead>
              <tbody>
                ${topLocations.map(([loc, count]) => `
                  <tr><td>${UrbanSense.escapeHTML(loc)}</td><td class="mono">${count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      `}

      <div class="report-section">
        <div class="report-section-title">AI Recommendations</div>
        <div class="recommendations">
          ${recommendations.map(r => `
            <div class="recommendation priority-${r.priority}">
              <div class="recommendation-icon">${r.priority === 'high' ? '⚠' : r.priority === 'medium' ? '→' : '✓'}</div>
              <div class="recommendation-text">${r.text}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="report-actions">
        <button class="btn btn-primary" id="downloadJsonBtn">⬇ Download JSON</button>
        <button class="btn" id="downloadCsvBtn">⬇ Download CSV</button>
        <button class="btn" id="printBtn">⎙ Print / PDF</button>
      </div>
    </div>
  `;
}

/* =========================================================
   FLEET REPORT
   ========================================================= */

function buildFleetReport() {
  const fleet = UrbanSense.getFleet();
  const now = new Date();

  const active   = fleet.filter(b => b.status === 'ACTIVE').length;
  const idle     = fleet.length - active;
  const avgSpeed = fleet.length ? Math.round(fleet.reduce((s, b) => s + b.speed, 0) / fleet.length) : 0;
  const avgOcc   = fleet.length ? Math.round(fleet.reduce((s, b) => s + (b.passengers / b.capacity * 100), 0) / fleet.length) : 0;

  return `
    <div class="report-preview">
      <div class="report-header">
        <div class="report-brand">
          <div class="logo-mark">U</div>
          <div>
            <div class="brand-text">UrbanSense AI</div>
            <div class="brand-sub">FLEET OPERATIONS · AUTOMATED REPORT</div>
          </div>
        </div>
        <div class="report-title">Fleet Performance Report</div>
        <div class="report-subtitle">
          Generated ${now.toLocaleDateString('en-GB')} · ${now.toLocaleTimeString('en-GB')}
        </div>
      </div>

      <div class="report-kpis">
        <div class="report-kpi"><div class="label">Total Units</div><div class="value">${fleet.length}</div><div class="sub">${active} active · ${idle} idle</div></div>
        <div class="report-kpi"><div class="label">Avg Speed</div><div class="value">${avgSpeed}<span style="font-size:12px; color:var(--text-muted);"> km/h</span></div><div class="sub">Across fleet</div></div>
        <div class="report-kpi"><div class="label">Avg Occupancy</div><div class="value">${avgOcc}<span style="font-size:12px; color:var(--text-muted);">%</span></div><div class="sub">Passenger load</div></div>
        <div class="report-kpi"><div class="label">Cameras</div><div class="value">${fleet.filter(b => b.camera === 'ONLINE').length}</div><div class="sub">Online units</div></div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Fleet Detail</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>Bus ID</th><th>Route</th><th>Location</th>
              <th>Speed</th><th>Occupancy</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${fleet.map(b => `
              <tr>
                <td class="mono" style="color:var(--accent-cyan);">${b.id}</td>
                <td class="mono">${b.route}</td>
                <td>${UrbanSense.escapeHTML(b.location)}</td>
                <td class="mono">${b.speed} km/h</td>
                <td class="mono">${b.passengers}/${b.capacity}</td>
                <td><span class="badge badge-${b.status === 'ACTIVE' ? 'normal' : 'info'}">${b.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="report-actions">
        <button class="btn btn-primary" id="downloadJsonBtn">⬇ Download JSON</button>
        <button class="btn" id="printBtn">⎙ Print / PDF</button>
      </div>
    </div>
  `;
}

/* =========================================================
   RECOMMENDATIONS
   ========================================================= */

function generateRecommendations(events, reportId) {
  const recs = [];

  if (events.length === 0) {
    recs.push({
      priority: 'low',
      text: '<strong>No detections in range.</strong> Continue passive monitoring — fleet cameras are active and uploading telemetry.',
    });
    return recs;
  }

  const roadDefects = events.filter(e => ['Pothole','Road Crack','Waterlogging'].includes(e.type));
  if (roadDefects.length > 3) {
    recs.push({
      priority: 'high',
      text: `<strong>${roadDefects.length} road defects</strong> detected in this range. Immediate dispatch of maintenance crew recommended for high-severity clusters.`,
    });
  }

  const critical = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH');
  if (critical.length > 2) {
    recs.push({
      priority: 'high',
      text: `<strong>${critical.length} high-severity events</strong> recorded. Escalate to traffic control and prioritize on-site verification within 4 hours.`,
    });
  }

  const water = events.filter(e => (e.type || '').includes('Waterlogging'));
  if (water.length > 0) {
    recs.push({
      priority: 'medium',
      text: `<strong>Waterlogging detected</strong> at ${water.length} location${water.length > 1 ? 's' : ''}. Inspect drainage infrastructure and monitor during next rainfall cycle.`,
    });
  }

  const ped = events.filter(e => (e.type || '').includes('Pedestrian'));
  if (ped.length > 0) {
    recs.push({
      priority: 'medium',
      text: `<strong>Vulnerable pedestrian situations</strong> flagged ${ped.length} time${ped.length > 1 ? 's' : ''}. Consider signage upgrades or crossing controls.`,
    });
  }

  const resolved = events.filter(e => e.status === 'Resolved').length;
  const rate = Math.round(resolved / events.length * 100);
  if (rate < 30) {
    recs.push({
      priority: 'medium',
      text: `<strong>Resolution rate at ${rate}%.</strong> Incident backlog is growing. Review crew allocation and dispatch pipeline.`,
    });
  } else if (rate >= 70) {
    recs.push({
      priority: 'low',
      text: `<strong>Healthy resolution rate at ${rate}%.</strong> Current response pipeline is efficient. Maintain current staffing levels.`,
    });
  }

  const avgConf = (events.reduce((s, e) => s + Number(e.confidence || 0), 0) / events.length).toFixed(1);
  recs.push({
    priority: 'low',
    text: `<strong>Continue fleet-wide monitoring.</strong> AI inference is active across all ${UrbanSense.getFleet().length} units with average confidence ${avgConf}%.`,
  });

  return recs;
}

/* =========================================================
   EXPORTS
   ========================================================= */

document.addEventListener('click', (e) => {
  if (e.target.id === 'downloadJsonBtn') {
    const events = UrbanSense.getEvents();
    const blob = new Blob([JSON.stringify({
      generated: new Date().toISOString(),
      fleet: UrbanSense.getFleet(),
      events: events,
    }, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'urbansense-report-' + Date.now() + '.json');
    UrbanSense.showToast('JSON report downloaded', 'success');
  }

  if (e.target.id === 'downloadCsvBtn') {
    const events = UrbanSense.getEvents();
    const headers = ['ID','Type','Severity','Confidence','BusID','Route','Location','Latitude','Longitude','Status','Timestamp'];
    const rows = events.map(ev => [
      ev.id, ev.type, ev.severity, ev.confidence,
      ev.busId, ev.route, ev.location, ev.latitude, ev.longitude,
      ev.status, ev.timestamp,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'urbansense-report-' + Date.now() + '.csv');
    UrbanSense.showToast('CSV report downloaded', 'success');
  }

  if (e.target.id === 'printBtn') {
    window.print();
  }
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}