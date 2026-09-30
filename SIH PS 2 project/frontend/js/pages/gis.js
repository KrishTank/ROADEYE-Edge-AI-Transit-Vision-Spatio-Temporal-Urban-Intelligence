/* =========================================================
   URBANSENSE AI — GIS INTELLIGENCE
   Leaflet map with OSM France tiles + icon-based event markers.
   ========================================================= */

let urbanMap;
let standardMap;
let satelliteMap;

let busLayer;
let eventLayer;
let trafficLayer;
let pedestrianLayer;

let eventMarkers = {};

const MAP_CENTER = [12.9716, 77.5946];
const MAP_ZOOM = 12;

/* =========================================================
   DETECTION TYPE → ICON MAPPING
   ========================================================= */

const DETECTION_ICONS = {
  'Pothole':         { icon: '⚠' },
  'Road Crack':      { icon: '〰' },
  'Waterlogging':    { icon: '≈' },
  'Missing Divider': { icon: '⋮' },
  'Missing Sign':    { icon: '✖' },
  'Missing Zebra':   { icon: '≡' },
  'Pedestrian':      { icon: '♟' },
  'Rash Driving':    { icon: '⚡' },
  'Traffic Sign':    { icon: '⛔' },
  'Traffic Density': { icon: '⊞' },
  'Work Order':      { icon: '📋' },
  'Accident':        { icon: '✱' },
};

function iconForType(type) {
  return DETECTION_ICONS[type] || { icon: '!' };
}

/* =========================================================
   INIT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initializeMap();
  setupLayers();
  setupButtons();
  setupSearch();
  renderAll();

  setInterval(() => {
    renderEventMarkers();
    updateAreaStats();
    updateMapStatus();
  }, 8000);
});

/* =========================================================
   MAP INIT
   ========================================================= */

function initializeMap() {
  urbanMap = L.map('urbanMap', {
    zoomControl: false,
    attributionControl: true,
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  /* OSM France Humanitarian tiles — 100% free, no API key,
     no CARTO involvement. Dark filter applied via CSS. */
  standardMap = L.tileLayer(
    'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors · Humanitarian Style',
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    }
  );

  /* Esri satellite — also key-free */
  satelliteMap = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    }
  );

  standardMap.addTo(urbanMap);

  L.control.zoom({ position: 'bottomright' }).addTo(urbanMap);

  urbanMap.on('click', (e) => {
    setSelectedInfo({
      title: 'Custom Location',
      lat: e.latlng.lat.toFixed(5),
      lng: e.latlng.lng.toFixed(5),
      description: 'Selected map coordinate',
    });
  });

  busLayer        = L.layerGroup().addTo(urbanMap);
  eventLayer      = L.layerGroup().addTo(urbanMap);
  trafficLayer    = L.layerGroup().addTo(urbanMap);
  pedestrianLayer = L.layerGroup().addTo(urbanMap);

  window.__urbanMap = urbanMap;

  renderSimulatedZones();
}

/* =========================================================
   SIMULATED ZONES
   ========================================================= */

function renderSimulatedZones() {
  const trafficZones = [
    { lat: 12.9171, lng: 77.6233, congestion: 82, name: 'Silk Board Junction' },
    { lat: 13.0068, lng: 77.6784, congestion: 64, name: 'K R Puram' },
    { lat: 13.0358, lng: 77.5971, congestion: 45, name: 'Hebbal Flyover' },
  ];

  const pedZones = [
    { lat: 12.9750, lng: 77.6068, people: 18, name: 'MG Road' },
    { lat: 12.9352, lng: 77.6245, people: 27, name: 'Koramangala' },
  ];

  trafficZones.forEach(z => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="zone-icon zone-traffic">🚦</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const marker = L.marker([z.lat, z.lng], { icon })
      .bindPopup(`
        <div class="urb-popup">
          <div class="urb-popup-title">🚦 Traffic Hotspot</div>
          <div class="urb-popup-row"><span class="label">Location</span><span class="value">${z.name}</span></div>
          <div class="urb-popup-row"><span class="label">Congestion</span><span class="value">${z.congestion}%</span></div>
          <div class="urb-popup-row"><span class="label">Severity</span><span class="value">${z.congestion >= 75 ? 'CRITICAL' : z.congestion >= 60 ? 'HIGH' : 'MODERATE'}</span></div>
        </div>
      `)
      .on('click', () => setSelectedInfo({
        title: 'Traffic Hotspot',
        lat: z.lat.toFixed(5),
        lng: z.lng.toFixed(5),
        description: z.name + ' · ' + z.congestion + '% congestion',
      }));
    trafficLayer.addLayer(marker);
  });

  pedZones.forEach(z => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="zone-icon zone-pedestrian">🚶</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const marker = L.marker([z.lat, z.lng], { icon })
      .bindPopup(`
        <div class="urb-popup">
          <div class="urb-popup-title">🚶 Pedestrian Cluster</div>
          <div class="urb-popup-row"><span class="label">Location</span><span class="value">${z.name}</span></div>
          <div class="urb-popup-row"><span class="label">People</span><span class="value">${z.people} detected</span></div>
          <div class="urb-popup-row"><span class="label">Risk</span><span class="value">MONITORED</span></div>
        </div>
      `)
      .on('click', () => setSelectedInfo({
        title: 'Pedestrian Cluster',
        lat: z.lat.toFixed(5),
        lng: z.lng.toFixed(5),
        description: z.people + ' people · ' + z.name,
      }));
    pedestrianLayer.addLayer(marker);
  });
}

/* =========================================================
   RENDER
   ========================================================= */

function renderAll() {
  renderEventMarkers();
  updateAreaStats();
  updateMapStatus();
}

/* =========================================================
   EVENT MARKERS
   ========================================================= */

function renderEventMarkers() {
  const events = UrbanSense.getEvents();
  const seenIds = new Set();

  events.forEach(ev => {
    seenIds.add(ev.id);
    if (!ev.latitude || !ev.longitude) return;

    const color = UrbanSense.getDetectionColor(ev.type);
    const meta = iconForType(ev.type);
    const severityClass = (ev.severity || 'low').toLowerCase();

    const icon = L.divIcon({
      className: '',
      html: `
        <div class="event-marker-icon2 ${severityClass}" style="--marker-color: ${color};">
          <span class="event-marker-glyph">${meta.icon}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const popupContent = `
      <div class="urb-popup">
        <div class="urb-popup-title"><span style="color:${color};">${meta.icon}</span> ${UrbanSense.escapeHTML(ev.type)}</div>
        <div class="urb-popup-row"><span class="label">Severity</span><span class="value">${ev.severity}</span></div>
        <div class="urb-popup-row"><span class="label">Confidence</span><span class="value">${ev.confidence}%</span></div>
        <div class="urb-popup-row"><span class="label">Bus</span><span class="value">${ev.bus_id || ev.busId || ''}</span></div>
        <div class="urb-popup-row"><span class="label">Route</span><span class="value">${ev.route}</span></div>
        <div class="urb-popup-row"><span class="label">Location</span><span class="value">${UrbanSense.escapeHTML(ev.location)}</span></div>
        <div class="urb-popup-row"><span class="label">Detected</span><span class="value">${UrbanSense.timeAgo(ev.timestamp)}</span></div>
      </div>
    `;

    if (eventMarkers[ev.id]) {
      eventMarkers[ev.id].setLatLng([ev.latitude, ev.longitude]);
      eventMarkers[ev.id].setPopupContent(popupContent);
    } else {
      const marker = L.marker([ev.latitude, ev.longitude], { icon })
        .bindPopup(popupContent)
        .on('click', () => setSelectedInfo({
          title: ev.type,
          lat: ev.latitude.toFixed(5),
          lng: ev.longitude.toFixed(5),
          description: `${ev.severity} severity · ${ev.confidence}% · ${ev.bus_id || ev.busId || ''}`,
        }));
      eventLayer.addLayer(marker);
      eventMarkers[ev.id] = marker;
    }
  });

  Object.keys(eventMarkers).forEach(id => {
    if (!seenIds.has(id)) {
      eventLayer.removeLayer(eventMarkers[id]);
      delete eventMarkers[id];
    }
  });
}

/* =========================================================
   LAYERS
   ========================================================= */

function setupLayers() {
  document.querySelectorAll('.layer-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.layer;
      const isOn = row.classList.toggle('on');

      const layerMap = {
        buses:        busLayer,
        events:       eventLayer,
        traffic:      trafficLayer,
        pedestrians:  pedestrianLayer,
      };

      const target = layerMap[key];
      if (!target) return;

      if (isOn) urbanMap.addLayer(target);
      else      urbanMap.removeLayer(target);
    });
  });
}

/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {
  const mapBtn = document.getElementById('mapViewBtn');
  const satBtn = document.getElementById('satelliteBtn');
  const locateBtn = document.getElementById('locateBtn');
  const refreshBtn = document.getElementById('refreshMapBtn');
  const clearBtn = document.getElementById('clearSearch');

  mapBtn.addEventListener('click', () => {
    urbanMap.removeLayer(satelliteMap);
    standardMap.addTo(urbanMap);
    mapBtn.classList.add('active');
    satBtn.classList.remove('active');
    document.getElementById('urbanMap').classList.remove('map-satellite');
  });

  satBtn.addEventListener('click', () => {
    urbanMap.removeLayer(standardMap);
    satelliteMap.addTo(urbanMap);
    satBtn.classList.add('active');
    mapBtn.classList.remove('active');
    document.getElementById('urbanMap').classList.add('map-satellite');
  });

  locateBtn.addEventListener('click', () => {
    urbanMap.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1 });
  });

  refreshBtn.addEventListener('click', () => {
    renderAll();
    UrbanSense.showToast('Map refreshed', 'success');
  });

  clearBtn.addEventListener('click', () => {
    document.getElementById('mapSearch').value = '';
    urbanMap.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1 });
    clearSelectedInfo();
  });
}

/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const input = document.getElementById('mapSearch');
  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(input.value.trim().toLowerCase()), 300);
  });
}

function performSearch(query) {
  if (!query) return;
  const events = UrbanSense.getEvents();
  const eventMatch = events.find(e =>
    (e.type || '').toLowerCase().includes(query) ||
    (e.bus_id || e.busId || '').toLowerCase().includes(query) ||
    (e.location || '').toLowerCase().includes(query)
  );

  if (eventMatch && eventMarkers[eventMatch.id]) {
    urbanMap.flyTo([eventMatch.latitude, eventMatch.longitude], 16, { duration: 1 });
    setTimeout(() => eventMarkers[eventMatch.id].openPopup(), 1100);
    setSelectedInfo({
      title: eventMatch.type,
      lat: eventMatch.latitude.toFixed(5),
      lng: eventMatch.longitude.toFixed(5),
      description: `${eventMatch.severity} · ${eventMatch.confidence}% · ${eventMatch.bus_id || eventMatch.busId || ''}`,
    });
    return;
  }

  UrbanSense.showToast('No matches for "' + query + '"', 'warning');
}

/* =========================================================
   SELECTED INFO
   ========================================================= */

function setSelectedInfo({ title, lat, lng, description }) {
  const el = document.getElementById('selectedInfo');
  if (!el) return;

  el.classList.remove('selected-empty');
  el.innerHTML = `
    <div class="selected-info">
      <h4>${UrbanSense.escapeHTML(title)}</h4>
      ${description ? `<div style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">${UrbanSense.escapeHTML(description)}</div>` : ''}
      <div class="row"><span class="label">LAT</span><span class="value">${lat}</span></div>
      <div class="row"><span class="label">LNG</span><span class="value">${lng}</span></div>
    </div>
  `;
}

function clearSelectedInfo() {
  const el = document.getElementById('selectedInfo');
  if (!el) return;
  el.classList.add('selected-empty');
  el.innerHTML = 'Click any bus or event marker on the map to inspect live intelligence.';
}

/* =========================================================
   AREA STATS
   ========================================================= */

function updateAreaStats() {
  const fleet = UrbanSense.getFleet();
  const events = UrbanSense.getEvents();

  const activeBuses = fleet.filter(b => b.status === 'ACTIVE').length;
  const openEvents  = events.filter(e => e.status !== 'Resolved').length;

  const coverageEl  = document.getElementById('areaCoverage');
  const defectsEl   = document.getElementById('areaDefects');
  const incidentsEl = document.getElementById('areaIncidents');

  if (coverageEl)  coverageEl.textContent  = activeBuses + ' buses';
  if (defectsEl)   defectsEl.textContent   = events.filter(e =>
    ['Pothole','Road Crack','Waterlogging','Missing Divider','Missing Sign','Missing Zebra'].includes(e.type)
  ).length;
  if (incidentsEl) incidentsEl.textContent = openEvents;
}

/* =========================================================
   STATUS BAR
   ========================================================= */

function updateMapStatus() {
  const el = document.getElementById('mapStatus');
  if (!el) return;

  const eventCount = Object.keys(eventMarkers).length;
  const busCount = window.__gpsBusCount || 6;

  el.textContent = `GPS feeds connected · ${busCount} buses · ${eventCount} events`;
}