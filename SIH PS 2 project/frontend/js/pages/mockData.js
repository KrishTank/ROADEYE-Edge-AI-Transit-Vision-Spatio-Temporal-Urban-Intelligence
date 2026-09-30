// ============ CONSTANTS ============
const CENTER = [77.5946, 12.9716]; // Bengaluru

const ROUTES = [
  { id: 'R-500', name: '500D · Silk Board → Hebbal', color: '#00E5FF' },
  { id: 'R-335', name: '335E · Majestic → Kadugodi', color: '#8B5CF6' },
  { id: 'R-201', name: '201R · Domlur → Whitefield', color: '#00E68A' },
  { id: 'R-401', name: '401K · Yeshwanthpur → ECity', color: '#FFB300' },
];

const EVENT_TYPES = [
  { type: 'pothole',      label: 'Pothole',       severity: 'medium',  color: '#FFB300' },
  { type: 'pedestrian',   label: 'Pedestrian',    severity: 'high',    color: '#FF3B47' },
  { type: 'stopsign',     label: 'Stop Sign',     severity: 'low',     color: '#00E68A' },
  { type: 'signal',       label: 'Signal Viol.',  severity: 'high',    color: '#FF3B47' },
  { type: 'illegal_park', label: 'Illegal Park',  severity: 'medium',  color: '#FFB300' },
  { type: 'road_crack',   label: 'Road Crack',    severity: 'low',     color: '#00E5FF' },
  { type: 'accident',     label: 'Accident',      severity: 'critical',color: '#FF3B47' },
];

// ============ HELPERS ============
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = ([lng, lat], m = 0.005) => [lng + rand(-m, m), lat + rand(-m, m)];

// ============ FLEET ============
function generateFleet(count = 42) {
  const buses = [];
  for (let i = 0; i < count; i++) {
    const route = ROUTES[i % ROUTES.length];
    buses.push({
      id: `BUS-${String(i + 1).padStart(2, '0')}`,
      route: route.id,
      routeName: route.name,
      routeColor: route.color,
      position: jitter(CENTER, 0.06),
      heading: rand(0, 360),
      speed: rand(8, 42),
      occupancy: Math.round(rand(10, 90)),
      health: Math.random() > 0.9 ? 'warn' : 'ok',
      cameras: 4,
      lastPing: Date.now(),
    });
  }
  return buses;
}

function tickFleet(buses, dt = 1000) {
  return buses.map((b) => {
    const rad = (b.heading * Math.PI) / 180;
    const speedDeg = (b.speed / 3600) * (dt / 1000) * 0.0004 * 3.6;
    const lng = b.position[0] + Math.cos(rad) * speedDeg;
    const lat = b.position[1] + Math.sin(rad) * speedDeg;
    let heading = b.heading + rand(-0.8, 0.8);
    if (Math.random() < 0.01) heading = rand(0, 360);
    return {
      ...b,
      position: [lng, lat],
      heading,
      speed: Math.max(4, Math.min(55, b.speed + rand(-1.5, 1.5))),
      lastPing: Date.now(),
    };
  });
}

// ============ EVENTS ============
let eventCounter = 0;
function generateEvent(buses) {
  if (!buses.length) return null;
  const bus = pick(buses);
  const t = pick(EVENT_TYPES);
  return {
    id: `EVT-${Date.now()}-${eventCounter++}`,
    type: t.type,
    label: t.label,
    severity: t.severity,
    color: t.color,
    confidence: +rand(0.72, 0.98).toFixed(2),
    position: jitter(bus.position, 0.0008),
    busId: bus.id,
    route: bus.route,
    timestamp: Date.now(),
    status: 'new',
    cameraId: `CAM-${Math.floor(rand(1, 5))}`,
  };
}

// ============ SIMULATOR BOOTSTRAP ============
window.Mock = {
  ROUTES,
  EVENT_TYPES,
  generateFleet,
  tickFleet,
  generateEvent,
};