/**
 * camera-demo.js — ROADEYE Live Camera Demo Simulation
 * Animates a synthetic dashcam feed on <canvas id="demoCanvas">
 * with AI-style bounding boxes, labels, confidence scores and a detection log.
 */
(function () {
  'use strict';

  /* ─── Config ────────────────────────────────────────── */
  const DETECTION_CLASSES = [
    { label: 'Pothole',       color: '#ef4444', severity: 'critical', stat: 'statPotholes' },
    { label: 'Road Crack',    color: '#f97316', severity: 'warning',  stat: 'statRoad'     },
    { label: 'Broken Sign',   color: '#facc15', severity: 'warning',  stat: 'statSigns'    },
    { label: 'Faded Line',    color: '#00e5ff', severity: 'info',     stat: 'statRoad'     },
    { label: 'Road Debris',   color: '#a78bfa', severity: 'warning',  stat: 'statRoad'     },
    { label: 'Waterlogging',  color: '#38bdf8', severity: 'critical', stat: 'statPotholes' },
    { label: 'Missing Sign',  color: '#fb923c', severity: 'critical', stat: 'statSigns'    },
  ];

  /* ─── Scene palette ─────────────────────────────────── */
  const SKY_TOP    = '#0b1829';
  const SKY_BOT    = '#1a2e48';
  const ROAD_FAR   = '#1a1f2e';
  const ROAD_NEAR  = '#2a2f3e';
  const LANE_COLOR = '#e2b848';

  /* ─── State ─────────────────────────────────────────── */
  const canvas  = document.getElementById('demoCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let paused   = false;
  let frame    = 0;
  let lastTime = 0;
  let fps      = 0;
  let frameCount = 0;
  let fpsTimer = 0;

  const stats = { total: 0, potholes: 0, signs: 0, road: 0 };

  // Active bounding boxes on canvas
  let boxes = [];
  // Scheduled next detection (in frames)
  let nextDetect = 40;

  // Road stripe offset for animation
  let stripeOffset = 0;

  /* ─── DOM refs ──────────────────────────────────────── */
  const fpsChip   = document.getElementById('demoFpsChip');
  const speedEl   = document.getElementById('demoSpeed');
  const logEl     = document.getElementById('detectLog');
  const pauseBtn  = document.getElementById('demoPauseBtn');
  const resetBtn  = document.getElementById('demoResetBtn');
  const statEls   = {
    total:    document.getElementById('statTotal'),
    potholes: document.getElementById('statPotholes'),
    signs:    document.getElementById('statSigns'),
    road:     document.getElementById('statRoad'),
  };

  /* ─── Controls ──────────────────────────────────────── */
  if (pauseBtn) pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    if (!paused) requestAnimationFrame(loop);
  });

  if (resetBtn) resetBtn.addEventListener('click', () => {
    boxes = [];
    frame = 0;
    stripeOffset = 0;
    nextDetect = 40;
    stats.total = stats.potholes = stats.signs = stats.road = 0;
    updateStats();
    if (logEl) logEl.innerHTML = '';
    if (!paused) requestAnimationFrame(loop);
  });

  /* ─── Scene drawing ─────────────────────────────────── */
  function drawSky() {
    const grd = ctx.createLinearGradient(0, 0, 0, H * 0.42);
    grd.addColorStop(0, SKY_TOP);
    grd.addColorStop(1, SKY_BOT);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H * 0.42);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const stars = [[40,20],[120,50],[220,15],[350,35],[480,18],[600,42],[680,28],[70,60],[300,65],[550,55]];
    stars.forEach(([x,y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI*2);
      ctx.fill();
    });

    // Moon
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath();
    ctx.arc(640, 40, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = SKY_TOP;
    ctx.beginPath();
    ctx.arc(650, 34, 16, 0, Math.PI*2);
    ctx.fill();
  }

  function drawBuildings() {
    const horizon = H * 0.42;
    const buildings = [
      {x:20,  w:60,  h:80,  lit:[[30,horizon-60,8,12],[50,horizon-40,8,12]]},
      {x:100, w:45,  h:60,  lit:[[110,horizon-40,8,10],[125,horizon-20,8,10]]},
      {x:160, w:80,  h:110, lit:[[170,horizon-80,10,14],[190,horizon-50,10,14],[210,horizon-20,10,14]]},
      {x:290, w:50,  h:70,  lit:[[300,horizon-50,8,10],[315,horizon-25,8,10]]},
      {x:580, w:90,  h:90,  lit:[[590,horizon-60,10,14],[610,horizon-30,10,14]]},
      {x:660, w:55,  h:75,  lit:[[670,horizon-50,8,10],[685,horizon-25,8,10]]},
    ];
    buildings.forEach(b => {
      // Body
      ctx.fillStyle = '#0d1a2f';
      ctx.fillRect(b.x, horizon - b.h, b.w, b.h);
      // Windows
      b.lit.forEach(([wx, wy, ww, wh]) => {
        ctx.fillStyle = Math.random() > 0.003
          ? 'rgba(255,220,100,0.75)'
          : 'rgba(100,200,255,0.5)';
        ctx.fillRect(wx, wy, ww, wh);
      });
      // Roof edge
      ctx.strokeStyle = '#1e3050';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, horizon - b.h, b.w, b.h);
    });
  }

  function drawRoad() {
    const hy = H * 0.42;
    // Road body
    const roadGrd = ctx.createLinearGradient(0, hy, 0, H);
    roadGrd.addColorStop(0, ROAD_FAR);
    roadGrd.addColorStop(1, ROAD_NEAR);
    ctx.fillStyle = roadGrd;
    ctx.beginPath();
    ctx.moveTo(0, hy);
    ctx.lineTo(W, hy);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Road surface noise
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    for (let i = 0; i < 80; i++) {
      ctx.fillRect(
        Math.random() * W,
        hy + Math.random() * (H - hy),
        Math.random() * 6 + 1,
        Math.random() * 2 + 1
      );
    }

    // Vanishing point (perspective)
    const vx = W / 2, vy = hy;

    // Road edges (kerb lines)
    ctx.strokeStyle = '#ffffff22';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(vx - 10, vy); ctx.lineTo(30, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vx + 10, vy); ctx.lineTo(W - 30, H); ctx.stroke();

    // Centre dashed lane markers (animated)
    const numStripes = 8;
    for (let i = 0; i < numStripes; i++) {
      const t = ((i / numStripes) + (stripeOffset / numStripes)) % 1;
      const y = vy + (H - vy) * t;
      const spread = (y - vy) / (H - vy);
      const sw = 3 + spread * 10;
      const sh = 4 + spread * 18;
      ctx.fillStyle = LANE_COLOR;
      ctx.globalAlpha = 0.4 + spread * 0.5;
      ctx.fillRect(vx - sw / 2, y, sw, sh);
    }
    ctx.globalAlpha = 1;

    // Left/right side markers
    for (let i = 0; i < numStripes; i++) {
      const t = ((i / numStripes) + (stripeOffset / numStripes)) % 1;
      const y = vy + (H - vy) * t;
      const spread = (y - vy) / (H - vy);
      const xOff = spread * (W * 0.38);
      const sw = 2 + spread * 6;
      const sh = 2 + spread * 10;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.18 + spread * 0.25;
      ctx.fillRect(vx - xOff - sw, y, sw, sh);
      ctx.fillRect(vx + xOff, y, sw, sh);
    }
    ctx.globalAlpha = 1;
  }

  function drawScanGrid() {
    // Subtle AI scan-lines overlay
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Corner brackets
    const bw = 28;
    ctx.strokeStyle = 'rgba(0,229,255,0.35)';
    ctx.lineWidth = 2;
    [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([x,y,dx,dy]) => {
      ctx.beginPath(); ctx.moveTo(x + dx*bw, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy*bw); ctx.stroke();
    });
  }

  function drawTimestamp() {
    const now = new Date();
    const ts = now.toISOString().replace('T',' ').slice(0,19);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(ts, W - 178, H - 10);
    ctx.fillText(`FRAME ${String(frame).padStart(6,'0')}`, 10, H - 10);
  }

  /* ─── Bounding boxes ────────────────────────────────── */
  function spawnDetection() {
    const cls = DETECTION_CLASSES[Math.floor(Math.random() * DETECTION_CLASSES.length)];
    const conf = (0.52 + Math.random() * 0.44).toFixed(2);

    // Spawn in lower 2/3 of frame (road area)
    const roadTop = H * 0.42;
    const margin = 30;
    const bw = 60 + Math.random() * 120;
    const bh = 40 + Math.random() * 80;
    const bx = margin + Math.random() * (W - bw - margin * 2);
    const by = roadTop + 10 + Math.random() * (H - roadTop - bh - 30);

    boxes.push({
      cls, conf,
      x: bx, y: by, w: bw, h: bh,
      life: 90 + Math.floor(Math.random() * 60), // frames to live
      age: 0,
      // Corner animation
      cornerAnim: 0,
    });

    // Update counters
    stats.total++;
    if (cls.stat === 'statPotholes') stats.potholes++;
    else if (cls.stat === 'statSigns') stats.signs++;
    else stats.road++;
    updateStats();
    addLog(cls, conf);
  }

  function drawBoxes() {
    boxes.forEach((b, idx) => {
      const alpha = b.age < 8
        ? b.age / 8
        : b.age > b.life - 12
          ? (b.life - b.age) / 12
          : 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Box fill
      const hex = b.cls.color;
      ctx.fillStyle = hex + '22';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Corner brackets only (not full rect border)
      const cs = Math.min(b.w, b.h) * 0.3;
      ctx.strokeStyle = b.cls.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = b.cls.color;
      ctx.shadowBlur = 8;

      // TL
      ctx.beginPath(); ctx.moveTo(b.x + cs, b.y); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x, b.y + cs); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(b.x + b.w - cs, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w, b.y + cs); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h - cs); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x + cs, b.y + b.h); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(b.x + b.w - cs, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h - cs); ctx.stroke();

      ctx.shadowBlur = 0;

      // Label chip
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const labelText = `${b.cls.label}  ${(b.conf * 100).toFixed(0)}%`;
      const tw = ctx.measureText(labelText).width;
      const chipH = 18;
      const chipY = b.y - chipH - 3;
      ctx.fillStyle = b.cls.color;
      ctx.fillRect(b.x, chipY, tw + 12, chipH);
      ctx.fillStyle = '#101010';
      ctx.fillText(labelText, b.x + 6, chipY + 12);

      ctx.restore();
    });
  }

  function updateBoxes() {
    boxes = boxes.filter(b => {
      b.age++;
      // Slow drift downward (parallax)
      b.y += 0.35;
      b.x += (Math.random() - 0.5) * 0.2;
      return b.age < b.life && b.y + b.h < H;
    });
  }

  /* ─── Stats & log ───────────────────────────────────── */
  function updateStats() {
    if (statEls.total)    statEls.total.textContent    = stats.total;
    if (statEls.potholes) statEls.potholes.textContent = stats.potholes;
    if (statEls.signs)    statEls.signs.textContent    = stats.signs;
    if (statEls.road)     statEls.road.textContent     = stats.road;
  }

  function addLog(cls, conf) {
    if (!logEl) return;
    const now = new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const item = document.createElement('div');
    item.className = `detect-log-item ${cls.severity}`;
    item.innerHTML =
      `<span class="log-label">${cls.label}</span>` +
      `<span class="log-conf">${(conf * 100).toFixed(0)}%</span>` +
      `<span class="log-time">${now}</span>`;
    logEl.prepend(item);
    // Keep max 20 items
    while (logEl.children.length > 20) logEl.lastChild.remove();
  }

  /* ─── FPS HUD ───────────────────────────────────────── */
  function updateFps(ts) {
    frameCount++;
    if (ts - fpsTimer >= 1000) {
      fps = frameCount;
      frameCount = 0;
      fpsTimer = ts;
      if (fpsChip) fpsChip.textContent = `⚡ ${fps} FPS  |  YOLO-EDGE`;
    }
  }

  function updateGps() {
    if (!speedEl) return;
    const speed = 28 + Math.floor(Math.sin(frame / 90) * 8 + Math.random() * 4);
    speedEl.textContent = `${speed} km/h`;
  }

  /* ─── Main loop ─────────────────────────────────────── */
  function loop(ts) {
    if (paused) return;

    updateFps(ts);
    frame++;
    stripeOffset = (stripeOffset + 0.025) % 1;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Scene
    drawSky();
    drawBuildings();
    drawRoad();
    drawScanGrid();

    // Boxes
    updateBoxes();
    drawBoxes();

    // HUD
    drawTimestamp();

    // Spawn detection
    nextDetect--;
    if (nextDetect <= 0) {
      spawnDetection();
      nextDetect = 35 + Math.floor(Math.random() * 55);
    }

    // GPS drift
    if (frame % 15 === 0) updateGps();

    requestAnimationFrame(loop);
  }

  /* ─── Boot ──────────────────────────────────────────── */
  requestAnimationFrame(loop);

})();
