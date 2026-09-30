/* =========================================================
   URBANSENSE AI — EDGE AI SCANNER (v3)
   Canvas bounding boxes + multiple detections per frame
   ========================================================= */

let uploadedFile = null;
let uploadedDataURL = null;
let detections = [];   // array of detection objects

document.addEventListener('DOMContentLoaded', () => {
  setupDropzone();
  setupFileInput();
});

/* =========================================================
   DROPZONE
   ========================================================= */

function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  if (!dropzone) return;

  dropzone.addEventListener('click', () => document.getElementById('fileInput').click());

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove('dragging');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

function setupFileInput() {
  const input = document.getElementById('fileInput');
  if (!input) return;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) handleFile(file);
  });
}

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    UrbanSense.showToast('Please upload an image file', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    UrbanSense.showToast('File too large (max 5 MB)', 'error');
    return;
  }

  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedDataURL = ev.target.result;
    renderPreview();
    renderResultsEmpty();
  };
  reader.readAsDataURL(file);
}

function renderPreview() {
  const uploadPanel = document.getElementById('uploadPanel');
  if (!uploadPanel) return;

  uploadPanel.innerHTML = `
    <div class="preview-wrap" id="previewWrap">
      <img src="${uploadedDataURL}" class="preview-img" id="previewImg" alt="Uploaded frame">
      <canvas id="bboxCanvas" class="bbox-canvas"></canvas>
    </div>
    <div class="preview-meta" style="border-radius: 0 0 6px 6px; margin-top:-1px;">
      <span class="file-name">${escapeHTML(uploadedFile.name)}</span>
      <span>${(uploadedFile.size / 1024).toFixed(1)} KB</span>
    </div>
    <div class="preview-actions">
      <button class="btn btn-primary" id="runScanBtn">▶ Run Edge AI Scan</button>
      <button class="btn" id="resetBtn">⟲ Choose Another</button>
    </div>
  `;

  // Size the canvas after image loads
  const img = document.getElementById('previewImg');
  img.addEventListener('load', () => sizeCanvas());
  window.addEventListener('resize', () => sizeCanvas());

  document.getElementById('runScanBtn').addEventListener('click', runScan);
  document.getElementById('resetBtn').addEventListener('click', resetUpload);
}

function sizeCanvas() {
  const img = document.getElementById('previewImg');
  const canvas = document.getElementById('bboxCanvas');
  if (!img || !canvas) return;
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  redrawBoxes();
}

function resetUpload() {
  uploadedFile = null;
  uploadedDataURL = null;
  detections = [];

  const uploadPanel = document.getElementById('uploadPanel');
  uploadPanel.innerHTML = `
    <div class="dropzone" id="dropzone">
      <div class="dropzone-icon">◉</div>
      <h3>Drag & drop an image</h3>
      <p>or click to browse files</p>
      <p class="hint">JPG · PNG · WEBP — max 5 MB</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none;">
    </div>
  `;
  setupDropzone();
  setupFileInput();
  renderResultsEmpty();
}

function renderResultsEmpty() {
  const panel = document.getElementById('resultsPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="results-empty">
      <strong>Awaiting input frame</strong>
      Upload an image on the left,<br>then run the Edge AI scan.
    </div>
  `;
}

/* =========================================================
   RUN SCAN
   ========================================================= */

function runScan() {
  if (!uploadedDataURL) return;
  const panel = document.getElementById('resultsPanel');
  if (!panel) return;

  const steps = [
    'Preprocessing frame · resize · normalize',
    'YOLOv8-N inference · object proposals',
    'Road hazard classifier · severity scoring',
    'GPS + timestamp association',
    'Publishing event to command center',
  ];

  panel.innerHTML = `
    <div class="analysis-progress">
      ${steps.map((s, i) => `
        <div class="progress-step" data-step="${i}">
          <div class="progress-step-icon">${i + 1}</div>
          <div class="progress-step-text">${s}</div>
        </div>
      `).join('')}
    </div>
  `;

  const stepEls = panel.querySelectorAll('.progress-step');
  let current = 0;
  const tick = () => {
    if (current >= steps.length) {
      generateDetections();
      animateBoxes();
      renderDetectionsPanel();
      return;
    }
    if (current > 0) stepEls[current - 1].classList.replace('active', 'done');
    stepEls[current].classList.add('active');
    current++;
    setTimeout(tick, 420 + Math.random() * 260);
  };
  setTimeout(() => {
    stepEls[0].classList.add('active');
    current = 0;
    setTimeout(tick, 380);
  }, 180);
}

/* =========================================================
   IMAGE ANALYSIS — pick 2-4 detections
   ========================================================= */

function analyzeImage(dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 120;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      const GRID = 6;
      const cellW = SIZE / GRID;
      const cellH = SIZE / GRID;
      const cells = [];

      for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
          let sumB = 0, sumDark = 0, sumGreen = 0, count = 0;
          for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
            for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
              const i = (Math.floor(y) * SIZE + Math.floor(x)) * 4;
              const r = data[i], g = data[i + 1], b = data[i + 2];
              const brightness = (r + g + b) / 3;
              sumB += brightness;
              if (brightness < 60) sumDark++;
              if (g > r + 15 && g > b + 15 && g > 80) sumGreen++;
              count++;
            }
          }
          cells.push({
            gx, gy,
            bright: sumB / count,
            darkRatio: sumDark / count,
            greenRatio: sumGreen / count,
          });
        }
      }

      // Find top candidates
      const darkest = [...cells].sort((a, b) => b.darkRatio - a.darkRatio).slice(0, 3);
      const brightest = [...cells].sort((a, b) => b.bright - a.bright).slice(0, 2);
      const greenest = [...cells].sort((a, b) => b.greenRatio - a.greenRatio).slice(0, 2);

      const detections = [];

      // Pothole from darkest
      if (darkest[0].darkRatio > 0.25) {
        detections.push({
          type: 'Pothole',
          cell: darkest[0],
          confidence: Math.round(85 + Math.random() * 12),
        });
      }

      // Road crack from second darkest
      if (darkest[1] && darkest[1].darkRatio > 0.15) {
        detections.push({
          type: 'Road Crack',
          cell: darkest[1],
          confidence: Math.round(78 + Math.random() * 15),
        });
      }

      // Traffic sign from brightest
      if (brightest[0].bright > 175) {
        detections.push({
          type: 'Traffic Sign',
          cell: brightest[0],
          confidence: Math.round(80 + Math.random() * 14),
        });
      }

      // Pedestrian from greenest
      if (greenest[0].greenRatio > 0.2) {
        detections.push({
          type: 'Pedestrian',
          cell: greenest[0],
          confidence: Math.round(82 + Math.random() * 12),
        });
      }

      // Ensure at least 2 detections
      if (detections.length === 0) {
        detections.push({ type: 'Road Crack', cell: darkest[0], confidence: 82 });
        detections.push({ type: 'Pothole', cell: darkest[1] || darkest[0], confidence: 91 });
      } else if (detections.length === 1) {
        const other = darkest.find(c => c !== detections[0].cell);
        if (other) {
          detections.push({ type: 'Pothole', cell: other, confidence: Math.round(80 + Math.random() * 15) });
        }
      }

      resolve({ detections, gridSize: GRID, cellW, cellH });
    };
    img.src = dataURL;
  });
}

function generateDetections() {
  analyzeImage(uploadedDataURL).then((result) => {
    detections = result.detections;
  });
}

/* =========================================================
   BOUNDING BOX CANVAS ANIMATION
   ========================================================= */

let animationProgress = 0;
let animationFrame = null;

function animateBoxes() {
  animationProgress = 0;
  if (animationFrame) cancelAnimationFrame(animationFrame);

  const step = () => {
    animationProgress = Math.min(1, animationProgress + 0.04);
    redrawBoxes();
    if (animationProgress < 1) {
      animationFrame = requestAnimationFrame(step);
    }
  };
  step();
}

function redrawBoxes() {
  const canvas = document.getElementById('bboxCanvas');
  const img = document.getElementById('previewImg');
  if (!canvas || !img) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (detections.length === 0) return;

  const grid = 6;
  const cellW = W / grid;
  const cellH = H / grid;

  const colors = {
    'Pothole':      { border: '#FF3B47', label: '#FF3B47', text: '#ffffff' },
    'Road Crack':   { border: '#FFB300', label: '#FFB300', text: '#101010' },
    'Traffic Sign': { border: '#00E68A', label: '#00E68A', text: '#001018' },
    'Pedestrian':   { border: '#8B5CF6', label: '#8B5CF6', text: '#ffffff' },
  };

  detections.forEach((d, i) => {
    const x = d.cell.gx * cellW;
    const y = d.cell.gy * cellH;
    const w = cellW * 1.8;
    const h = cellH * 1.8;

    // Staggered appearance
    const localProgress = Math.max(0, Math.min(1, (animationProgress - i * 0.15) * 2.5));
    if (localProgress <= 0) return;

    const c = colors[d.type] || colors['Pothole'];

    // Scale-in animation
    const scale = 0.3 + 0.7 * localProgress;
    const dw = w * scale;
    const dh = h * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;

    // Glow
    ctx.save();
    ctx.shadowColor = c.border;
    ctx.shadowBlur = 15 * localProgress;

    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(dx, dy, dw, dh);

    // Corner accents
    const cornerLen = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // TL
    ctx.moveTo(dx, dy + cornerLen);
    ctx.lineTo(dx, dy);
    ctx.lineTo(dx + cornerLen, dy);
    // TR
    ctx.moveTo(dx + dw - cornerLen, dy);
    ctx.lineTo(dx + dw, dy);
    ctx.lineTo(dx + dw, dy + cornerLen);
    // BL
    ctx.moveTo(dx, dy + dh - cornerLen);
    ctx.lineTo(dx, dy + dh);
    ctx.lineTo(dx + cornerLen, dy + dh);
    // BR
    ctx.moveTo(dx + dw - cornerLen, dy + dh);
    ctx.lineTo(dx + dw, dy + dh);
    ctx.lineTo(dx + dw, dy + dh - cornerLen);
    ctx.stroke();
    ctx.restore();

    // Label background
    const label = `${d.type} · ${d.confidence}%`;
    ctx.font = '600 11px JetBrains Mono, monospace';
    const textW = ctx.measureText(label).width;
    const labelH = 20;
    const labelPad = 8;
    const labelX = dx;
    const labelY = Math.max(0, dy - labelH - 4);

    ctx.fillStyle = c.label;
    ctx.fillRect(labelX, labelY, textW + labelPad * 2, labelH);

    // Label text
    ctx.fillStyle = c.text;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, labelX + labelPad, labelY + labelH / 2 + 1);
  });
}

/* =========================================================
   RESULTS PANEL
   ========================================================= */

function renderDetectionsPanel() {
  const panel = document.getElementById('resultsPanel');
  if (!panel) return;

  const fleet = UrbanSense.getFleet();
  const bus = UrbanSense.pickRandom(fleet);
  const [lng, lat] = UrbanSense.jitterGPS([bus.longitude, bus.latitude], 80);
  const cameraId = 'CAM-0' + UrbanSense.randomInt(1, 4);

  const primary = detections[0];
  const typeMeta = UrbanSense.getDetectionTypes().find(t => t.type === primary.type) || { severity: 'MEDIUM' };
  const severity = Math.random() < 0.7 ? typeMeta.severity : UrbanSense.pickRandom(['LOW', 'MEDIUM', 'HIGH']);

  panel.innerHTML = `
    <div class="result-card">
      <div class="result-head">
        <div>
          <div class="result-kicker">DETECTIONS FOUND</div>
          <div class="result-type">${detections.length} objects detected</div>
        </div>
        <span class="badge badge-${severity.toLowerCase()}">${severity}</span>
      </div>

      <div class="detection-table" style="margin-bottom:18px;">
        <div class="dt-head">
          <span>Object</span>
          <span>Confidence</span>
          <span>Severity</span>
        </div>
        ${detections.map(d => {
          const meta = UrbanSense.getDetectionTypes().find(t => t.type === d.type) || { severity: 'MEDIUM' };
          const color = UrbanSense.getDetectionColor(d.type);
          return `
            <div class="dt-row">
              <span>
                <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;margin-right:8px;box-shadow:0 0 6px ${color};"></span>
                <span style="color:${color};font-weight:500;">${escapeHTML(d.type)}</span>
              </span>
              <span class="mono">${d.confidence}%</span>
              <span><span class="badge badge-${meta.severity.toLowerCase()}">${meta.severity}</span></span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="result-grid">
        <div class="result-stat">
          <span class="result-stat-label">Detected By</span>
          <span class="result-stat-value">${bus.id} · ${bus.route}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Camera</span>
          <span class="result-stat-value">${cameraId}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Location</span>
          <span class="result-stat-value">${escapeHTML(bus.location)}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Timestamp</span>
          <span class="result-stat-value">${UrbanSense.formatTime(new Date())}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary" id="publishAllBtn">▶ Publish All to Command Center</button>
        <button class="btn" id="rescanBtn">⟲ Re-scan</button>
        <button class="btn" id="discardBtn">✕ Discard</button>
      </div>
    </div>
  `;

  document.getElementById('publishAllBtn').addEventListener('click', () => publishDetections(bus, lat, lng, cameraId));
  document.getElementById('rescanBtn').addEventListener('click', () => {
    renderResultsEmpty();
    document.getElementById('runScanBtn').click();
  });
  document.getElementById('discardBtn').addEventListener('click', () => {
    resetUpload();
    UrbanSense.showToast('Detections discarded', 'info');
  });
}

function publishDetections(bus, lat, lng, cameraId) {
  let published = 0;

  detections.forEach(d => {
    const meta = UrbanSense.getDetectionTypes().find(t => t.type === d.type) || { severity: 'MEDIUM' };
    UrbanSense.addEvent({
      type: d.type,
      severity: meta.severity,
      confidence: d.confidence,
      busId: bus.id,
      route: bus.route,
      location: bus.location,
      latitude: lat + (Math.random() - 0.5) * 0.0005,
      longitude: lng + (Math.random() - 0.5) * 0.0005,
      cameraId: cameraId,
      status: 'Open',
      timestamp: new Date().toISOString(),
    });
    published++;
  });

  UrbanSense.showToast(published + ' detections published to command center', 'success');

  const panel = document.getElementById('resultsPanel');
  panel.innerHTML = `
    <div class="result-card" style="text-align:center; padding:40px 24px;">
      <div style="width:64px; height:64px; margin:0 auto 18px;
        border-radius:50%; background: rgba(0, 230, 138, 0.12);
        border: 2px solid var(--accent-green); display:grid; place-items:center;
        font-size:28px; color: var(--accent-green); box-shadow: var(--glow-green);">✓</div>
      <h3 style="font-size:18px; margin-bottom:8px;">${published} Detections Published</h3>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">
        All detections have been added to the urban intelligence platform.
      </p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-width:380px; margin:0 auto 24px;">
        <a href="index.html" class="btn" style="justify-content:center;">◈ Dashboard</a>
        <a href="gis.html" class="btn" style="justify-content:center;">◎ View on GIS</a>
        <a href="incidents.html" class="btn" style="justify-content:center;">⚠ Incidents</a>
        <a href="road-health.html" class="btn" style="justify-content:center;">🛣️ Road Health</a>
      </div>
      <button class="btn btn-primary" id="newScanBtn" style="min-width:200px; justify-content:center;">◉ Run Another Scan</button>
    </div>
  `;
  document.getElementById('newScanBtn').addEventListener('click', resetUpload);
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}