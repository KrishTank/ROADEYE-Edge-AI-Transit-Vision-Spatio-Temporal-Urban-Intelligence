/* =========================================================
   URBANSENSE AI — SHARED APPLICATION DATA LAYER
   v2 — historical seeding + critical incident injector
   ========================================================= */

const URBANSENSE_KEYS = {
  FLEET:  'urbansense_fleet',
  EVENTS: 'urbansense_events',
  SEEDED: 'urbansense_seeded_v2',
};

/* =========================================================
   DEFAULT FLEET
   ========================================================= */

const DEFAULT_FLEET = [
  { id: 'BUS-101', route: 'R-05', destination: 'Central Station',    location: 'Central Zone',     latitude: 12.9716, longitude: 77.5946, speed: 42, passengers: 38, capacity: 60, progress: 64, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-104', route: 'R-12', destination: 'Ring Road Terminal', location: 'Ring Road',       latitude: 12.9600, longitude: 77.6050, speed: 31, passengers: 51, capacity: 60, progress: 72, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-109', route: 'R-08', destination: 'Main Terminal',      location: 'Main Road',       latitude: 12.9800, longitude: 77.5820, speed: 27, passengers: 42, capacity: 55, progress: 48, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-112', route: 'R-03', destination: 'City Depot',         location: 'Central Depot',   latitude: 12.9630, longitude: 77.5860, speed: 0,  passengers: 0,  capacity: 55, progress: 0,  status: 'IDLE',   camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-118', route: 'R-17', destination: 'Industrial Area',    location: 'Industrial Area', latitude: 12.9860, longitude: 77.6120, speed: 19, passengers: 54, capacity: 60, progress: 81, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-121', route: 'R-21', destination: 'Airport Road',       location: 'Airport Road',    latitude: 12.9520, longitude: 77.6180, speed: 35, passengers: 46, capacity: 60, progress: 39, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-125', route: 'R-11', destination: 'Old City',           location: 'Old City',        latitude: 12.9680, longitude: 77.6080, speed: 22, passengers: 34, capacity: 55, progress: 55, status: 'ACTIVE', camera: 'ONLINE', lastUpdate: Date.now() },
  { id: 'BUS-130', route: 'R-07', destination: 'North Terminal',     location: 'North Zone',      latitude: 13.0000, longitude: 77.5940, speed: 0,  passengers: 0,  capacity: 60, progress: 0,  status: 'IDLE',   camera: 'ONLINE', lastUpdate: Date.now() },
];

/* =========================================================
   DETECTION TYPES
   ========================================================= */

const DETECTION_TYPES = [
  { type: 'Pothole',         severity: 'HIGH',     color: '#FF3B47' },
  { type: 'Road Crack',      severity: 'MEDIUM',   color: '#FFB300' },
  { type: 'Waterlogging',    severity: 'HIGH',     color: '#00E5FF' },
  { type: 'Missing Divider', severity: 'MEDIUM',   color: '#FFB300' },
  { type: 'Missing Sign',    severity: 'MEDIUM',   color: '#8B5CF6' },
  { type: 'Missing Zebra',   severity: 'LOW',      color: '#00E68A' },
  { type: 'Pedestrian',      severity: 'HIGH',     color: '#FF3B47' },
  { type: 'Rash Driving',    severity: 'CRITICAL', color: '#FF3B47' },
  { type: 'Traffic Sign',    severity: 'LOW',      color: '#00E68A' },
  { type: 'Traffic Density', severity: 'MEDIUM',   color: '#FFB300' },
];

/* =========================================================
   ZONES (used for historical seeding)
   ========================================================= */

const SEED_ZONES = [
  { name: 'Central Zone',    lat: 12.9716, lng: 77.5946 },
  { name: 'Ring Road',       lat: 12.9600, lng: 77.6050 },
  { name: 'Industrial Area', lat: 12.9860, lng: 77.6120 },
  { name: 'Airport Road',    lat: 12.9520, lng: 77.6180 },
  { name: 'Main Road',       lat: 12.9800, lng: 77.5820 },
  { name: 'North Zone',      lat: 13.0000, lng: 77.5940 },
];

/* =========================================================
   URBANSENSE GLOBAL API
   ========================================================= */

window.UrbanSense = {

  /* ==================== FLEET ==================== */

  getFleet() {
    const stored = localStorage.getItem(URBANSENSE_KEYS.FLEET);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn('Fleet storage corrupted — resetting.');
      }
    }
    this.saveFleet(DEFAULT_FLEET);
    return [...DEFAULT_FLEET];
  },

  saveFleet(buses) {
    localStorage.setItem(URBANSENSE_KEYS.FLEET, JSON.stringify(buses));
  },

  getBus(id) {
    return this.getFleet().find(b => b.id === id) || null;
  },

  updateBus(id, patch) {
    const fleet = this.getFleet();
    const index = fleet.findIndex(b => b.id === id);
    if (index === -1) return null;
    fleet[index] = { ...fleet[index], ...patch, lastUpdate: Date.now() };
    this.saveFleet(fleet);
    return fleet[index];
  },

  /* ==================== EVENTS ==================== */

  getEvents() {
    const stored = localStorage.getItem(URBANSENSE_KEYS.EVENTS);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Events storage corrupted — clearing.');
      return [];
    }
  },

  saveEvents(events) {
    localStorage.setItem(URBANSENSE_KEYS.EVENTS, JSON.stringify(events));
  },

  addEvent(data) {
    const events = this.getEvents();
    const event = {
      id: 'EVT-' + Date.now().toString().slice(-6) +
          Math.floor(Math.random() * 90 + 10),
      type:       data.type       || 'Unknown Event',
      severity:   data.severity   || 'LOW',
      confidence: Number(data.confidence || 0),
      busId:      data.busId      || 'BUS-UNKNOWN',
      route:      data.route      || 'UNKNOWN',
      location:   data.location   || 'Unknown Location',
      latitude:   Number(data.latitude  || 0),
      longitude:  Number(data.longitude || 0),
      status:     data.status     || 'Open',
      vehicleReg: data.vehicleReg || null,
      cameraId:   data.cameraId   || 'CAM-01',
      timestamp:  data.timestamp  || new Date().toISOString(),
    };
    events.unshift(event);
    this.saveEvents(events.slice(0, 100));
    return event;
  },

  updateEventStatus(id, status) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    events[index].status = status;
    this.saveEvents(events);
    return events[index];
  },

  clearEvents() {
    localStorage.removeItem(URBANSENSE_KEYS.EVENTS);
  },

  /* ==================== DETECTION HELPERS ==================== */

  getDetectionTypes() {
    return [...DETECTION_TYPES];
  },

  getDetectionColor(type) {
    const found = DETECTION_TYPES.find(t => t.type === type);
    return found ? found.color : '#00E5FF';
  },

  /* ==================== TIME HELPERS ==================== */

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  },

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  },

  timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 10)   return 'just now';
    if (seconds < 60)   return seconds + 's ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)   return minutes + ' min ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24)     return hours + ' hr ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
  },

  escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  },

  /* ==================== RANDOM UTILITIES ==================== */

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  pickRandom(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  },

  jitterGPS([lng, lat], meters = 100) {
    const deg = meters / 111000;
    return [
      lng + (Math.random() - 0.5) * deg * 2,
      lat + (Math.random() - 0.5) * deg * 2,
    ];
  },

  /* ==================== UI HELPERS ==================== */

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `
      <span class="severity-dot ${type === 'success' ? 'normal' :
                                    type === 'error'   ? 'critical' :
                                    type === 'warning' ? 'medium' : 'low'}"></span>
      <span>${this.escapeHTML(message)}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 240ms ease';
      setTimeout(() => toast.remove(), 240);
    }, 3200);
  },

  highlightActiveNav() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href === current) item.classList.add('active');
      else item.classList.remove('active');
    });
  },

  startClock(elementId = 'liveClock') {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString('en-GB');
    };
    tick();
    setInterval(tick, 1000);
  },

  /* ==================== SIMULATION ==================== */

  simulateFleetUpdate() {
    const fleet = this.getFleet();
    fleet.forEach(bus => {
      if (bus.status !== 'ACTIVE') return;
      bus.latitude  += (Math.random() - 0.5) * 0.0015;
      bus.longitude += (Math.random() - 0.5) * 0.0015;
      bus.speed = Math.max(10, Math.min(55,
        bus.speed + Math.floor(Math.random() * 7 - 3)));
      bus.progress = Math.min(100, bus.progress + Math.floor(Math.random() * 5));
      bus.lastUpdate = Date.now();
    });
    this.saveFleet(fleet);
    return fleet;
  },

  /* ==================== SEEDING (PATCH 1) ==================== */

  seedHistoricalEvents() {
    /* Only seed once */
    if (localStorage.getItem(URBANSENSE_KEYS.SEEDED)) return 0;

    const fleet = this.getFleet();
    const count = 55;
    const events = [];

    for (let i = 0; i < count; i++) {
      const type = this.pickRandom(DETECTION_TYPES);
      const zone = this.pickRandom(SEED_ZONES);
      const bus  = this.pickRandom(fleet);

      /* Spread over last 48 hours */
      const hoursAgo = Math.random() * 48;
      const timestamp = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

      /* GPS jitter within zone */
      const lat = zone.lat + (Math.random() - 0.5) * 0.012;
      const lng = zone.lng + (Math.random() - 0.5) * 0.012;

      /* Status distribution: 70% Open, 20% Verified, 10% Resolved */
      const r = Math.random();
      const status = r < 0.70 ? 'Open' : r < 0.90 ? 'Verified' : 'Resolved';

      /* Confidence 78–97 */
      const confidence = Math.round(78 + Math.random() * 19);

      /* Occasionally upgrade to CRITICAL for rash driving */
      let severity = type.severity;
      if (type.type === 'Rash Driving' && Math.random() < 0.4) severity = 'CRITICAL';

      const ev = {
        id: 'EVT-' + Math.floor(100000 + Math.random() * 900000),
        type: type.type,
        severity,
        confidence,
        busId: bus.id,
        route: bus.route,
        location: zone.name,
        latitude: lat,
        longitude: lng,
        status,
        cameraId: 'CAM-0' + Math.floor(Math.random() * 4 + 1),
        vehicleReg: type.type === 'Rash Driving'
          ? 'KA' + String(Math.floor(Math.random() * 90 + 10)) +
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
            String(Math.floor(1000 + Math.random() * 9000))
          : null,
        timestamp,
      };

      events.push(ev);
    }

    /* Sort newest first */
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    this.saveEvents(events);
    localStorage.setItem(URBANSENSE_KEYS.SEEDED, 'true');
    return events.length;
  },

  /* ==================== CRITICAL INJECTOR (PATCH 3) ==================== */

  injectCriticalIncident() {
    const fleet = this.getFleet();
    const bus = this.pickRandom(fleet);

    const criticalTypes = [
      { type: 'Rash Driving', reg: true },
      { type: 'Accident',     reg: true },
      { type: 'Pedestrian',   reg: false },
    ];
    const chosen = this.pickRandom(criticalTypes);

    const ev = this.addEvent({
      type: chosen.type,
      severity: 'CRITICAL',
      confidence: Math.round(93 + Math.random() * 6),
      busId: bus.id,
      route: bus.route,
      location: bus.location,
      latitude: bus.latitude + (Math.random() - 0.5) * 0.005,
      longitude: bus.longitude + (Math.random() - 0.5) * 0.005,
      vehicleReg: chosen.reg
        ? 'KA' + String(Math.floor(Math.random() * 90 + 10)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          String(Math.floor(1000 + Math.random() * 9000))
        : null,
      cameraId: 'CAM-0' + Math.floor(Math.random() * 4 + 1),
    });

    /* Flash screen edge red */
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9998;
      box-shadow: inset 0 0 140px rgba(255, 59, 71, 0.75);
      animation: criticalFlash 900ms ease-out forwards;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 900);

    this.showToast('🚨 CRITICAL · ' + ev.type + ' at ' + ev.location, 'error');
    return ev;
  },

  /* ==================== RESET ==================== */

  resetDemo() {
    localStorage.removeItem(URBANSENSE_KEYS.FLEET);
    localStorage.removeItem(URBANSENSE_KEYS.EVENTS);
    localStorage.removeItem(URBANSENSE_KEYS.SEEDED);
    location.reload();
  },

};

window.ROADEYE = window.UrbanSense;

/* =========================================================
   AUTO-INIT ON EVERY PAGE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* PATCH 1: Seed historical events on first load */
  const seeded = UrbanSense.seedHistoricalEvents();
  if (seeded > 0) {
    console.log('%c[UrbanSense] Seeded ' + seeded + ' historical events',
                'color:#00E5FF;font-weight:600;');
  }

  UrbanSense.highlightActiveNav();
  UrbanSense.startClock('liveClock');

  /* ============ KEYBOARD SHORTCUTS (PATCH 3) ============ */
  document.addEventListener('keydown', (e) => {

    /* Ctrl + Shift + C = Critical incident */
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      UrbanSense.injectCriticalIncident();

      /* Re-render the current page if it exposes these functions */
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof renderTable === 'function') renderTable();
      if (typeof renderAll === 'function') renderAll();
      if (typeof renderFleet === 'function') renderFleet();
    }

    /* Ctrl + Shift + R = Reset demo */
    if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
      e.preventDefault();
      if (confirm('Reset all demo data?')) UrbanSense.resetDemo();
    }
  });

});