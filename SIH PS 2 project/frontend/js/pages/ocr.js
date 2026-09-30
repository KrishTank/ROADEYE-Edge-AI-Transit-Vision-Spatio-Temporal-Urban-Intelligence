/* =========================================================
   URBANSENSE AI — NUMBER PLATE OCR
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  UrbanSense.startClock('liveClock');
  setupSearch();
  setupSamples();
});

/* =========================================================
   SETUP
   ========================================================= */

function setupSearch() {
  const input = document.getElementById('plateInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');
  if (!input || !searchBtn) return;

  searchBtn.addEventListener('click', () => doSearch(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(input.value);
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    resetResults();
  });
}

function setupSamples() {
  document.querySelectorAll('.sample-plate').forEach(el => {
    el.addEventListener('click', () => {
      const plate = el.dataset.plate;
      document.getElementById('plateInput').value = plate;
      doSearch(plate);
    });
  });
}

/* =========================================================
   SEARCH
   ========================================================= */

function doSearch(rawPlate) {
  const plate = (rawPlate || '').toUpperCase().replace(/\s+/g, '');
  if (!plate) {
    UrbanSense.showToast('Enter a plate number', 'warning');
    return;
  }
  if (plate.length < 6) {
    UrbanSense.showToast('Plate too short — try GJ03AB1234', 'warning');
    return;
  }

  const result = analyzePlate(plate);
  renderResult(result);
  UrbanSense.showToast('Plate ' + plate + ' matched with ' + result.confidence + '% confidence', 'success');
}

/* =========================================================
   PLATE ANALYSIS (simulated OCR)
   Deterministic based on plate string
   ========================================================= */

function analyzePlate(plate) {
  // Deterministic hash for consistent results
  let hash = 0;
  for (let i = 0; i < plate.length; i++) {
    hash = ((hash << 5) - hash) + plate.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const confidence = 88 + (hash % 11);          // 88-98
  const vehicleType = pickFrom(hash, ['Car', 'Motorcycle', 'Bus', 'Truck', 'Auto Rickshaw']);
  const state = plate.slice(0, 2);

  // Generate detection history timeline
  const history = generateHistory(plate, hash);

  return { plate, confidence, vehicleType, state, history };
}

function pickFrom(seed, arr) {
  return arr[seed % arr.length];
}

function generateHistory(plate, seed) {
  const locations = [
    'Kalupur Junction',
    'Relief Road',
    'Shahibaug Circle',
    'CG Road',
    'SG Highway',
    'Ashram Road',
    'Nehru Bridge',
    'Law Garden',
    'Vastrapur Lake',
    'Prahladnagar',
  ];
  const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];

  const count = 3 + (seed % 4);   // 3-6 entries
  const now = Date.now();

  const entries = [];
  for (let i = 0; i < count; i++) {
    const minutesAgo = (i + 1) * (10 + (seed % 15));
    const ts = new Date(now - minutesAgo * 60 * 1000);
    const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    entries.push({
      time: timeStr,
      location: locations[(seed + i * 3) % locations.length],
      camera: cameras[(seed + i) % cameras.length],
    });
  }

  return entries;
}

/* =========================================================
   RENDER RESULT
   ========================================================= */

function renderResult(result) {
  const area = document.getElementById('resultArea');
  if (!area) return;

  const historyHTML = result.history.map(h => `
    <div class="timeline-row">
      <div class="timeline-dot">📍</div>
      <div class="timeline-time">${h.time}</div>
      <div class="timeline-loc">${h.location}</div>
      <div class="timeline-meta">${h.camera}</div>
    </div>
  `).join('');

  area.innerHTML = `
    <div class="ocr-result">
      <div class="plate-preview">
        <div class="plate-image">
          <div class="plate-text">${result.plate}</div>
        </div>
        <div class="plate-meta">DETECTED BY CAM-04 · ${new Date().toLocaleTimeString('en-GB')}</div>
        <div class="plate-confidence">
          <span style="width:8px;height:8px;border-radius:50%;background:currentColor;"></span>
          OCR CONFIDENCE · ${result.confidence}%
        </div>
      </div>

      <div class="timeline-wrap">
        <div class="timeline-title">DETECTION HISTORY</div>
        <div class="timeline-items">${historyHTML}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">
          <h2>Vehicle Information</h2>
          <p>Extracted from plate: ${result.plate}</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="stat-row"><span class="label">Registration</span><span class="value">${result.plate}</span></div>
        <div class="stat-row"><span class="label">State Code</span><span class="value">${result.state}</span></div>
        <div class="stat-row"><span class="label">Vehicle Type</span><span class="value">${result.vehicleType}</span></div>
        <div class="stat-row"><span class="label">OCR Confidence</span><span class="value text-green">${result.confidence}%</span></div>
        <div class="stat-row"><span class="label">Detections Logged</span><span class="value">${result.history.length}</span></div>
        <div class="stat-row"><span class="label">Last Seen</span><span class="value">${result.history[0].time} · ${result.history[0].location}</span></div>
      </div>
    </div>
  `;
}

function resetResults() {
  const area = document.getElementById('resultArea');
  if (!area) return;
  area.innerHTML = `
    <div class="ocr-placeholder">
      <strong>🔍 Awaiting plate search</strong>
      Enter a registration number above, or click a sample.<br>
      The system will display the OCR detection, confidence, and vehicle history.
    </div>
  `;
}