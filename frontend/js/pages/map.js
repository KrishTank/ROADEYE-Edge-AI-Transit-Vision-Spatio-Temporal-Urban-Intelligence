(function initMap() {
  const container = document.getElementById('map');
  const BLR_CENTER = [77.5946, 12.9716];

  // ============ DARK STYLE ============
  const darkStyle = {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '© CARTO · © OpenStreetMap',
      },
    },
    layers: [
      {
        id: 'carto-dark',
        type: 'raster',
        source: 'carto',
        paint: { 'raster-saturation': -0.15, 'raster-brightness-max': 0.6 },
      },
    ],
  };

  // ============ INIT ============
  const map = new maplibregl.Map({
    container,
    style: darkStyle,
    center: BLR_CENTER,
    zoom: 11.5,
    pitch: 0,
    attributionControl: false,
    dragRotate: false,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');

  window.__map = map; // for debugging

  // ============ EVENT SOURCE + LAYERS ============
  map.on('load', () => {
    map.addSource('events', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Heatmap
    map.addLayer({
      id: 'events-heat',
      type: 'heatmap',
      source: 'events',
      layout: { visibility: 'none' },
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': 1.2,
        'heatmap-radius': 28,
        'heatmap-opacity': 0.75,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,    'rgba(0,229,255,0)',
          0.3,  'rgba(0,229,255,0.5)',
          0.6,  'rgba(255,179,0,0.7)',
          1,    'rgba(255,59,71,0.9)',
        ],
      },
    });

    // Points
    map.addLayer({
      id: 'events-points',
      type: 'circle',
      source: 'events',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 16, 8],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#060A14',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.9,
      },
    });

    // Click on event
    map.on('click', 'events-points', (e) => {
      const f = e.features[0];
      if (f && f.properties && f.properties.id) {
        Store.selectEvent(f.properties.id);
      }
    });
    map.on('mouseenter', 'events-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'events-points', () => { map.getCanvas().style.cursor = ''; });
  });

  // ============ BUS MARKERS (DOM) ============
  const markers = {};

  function makeMarkerEl(bus) {
    const el = document.createElement('div');
    el.className = 'bus-marker';
    el.style.setProperty('--bus-color', bus.routeColor);
    el.innerHTML = `
      <div class="bus-marker__pulse"></div>
      <div class="bus-marker__dot">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <polygon points="6,1 11,11 6,8.5 1,11"/>
        </svg>
      </div>
    `;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      Store.selectBus(bus.id);
      map.flyTo({ center: bus.position, zoom: 14, duration: 900, curve: 1.4 });
    });
    return el;
  }

  function syncBuses(buses, selectedBusId) {
    const currentIds = new Set(buses.map((b) => b.id));

    // Remove stale
    Object.keys(markers).forEach((id) => {
      if (!currentIds.has(id)) {
        markers[id].remove();
        delete markers[id];
      }
    });

    // Add / update
    buses.forEach((bus) => {
      let m = markers[bus.id];
      if (!m) {
        const el = makeMarkerEl(bus);
        m = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
          .setLngLat(bus.position)
          .addTo(map);
        markers[bus.id] = m;
      } else {
        m.setLngLat(bus.position);
      }
      const el = m.getElement();
      el.style.setProperty('--bus-color', bus.routeColor);
      // apply rotation via CSS variable (rotate dot, not whole marker, so pulse stays round)
      const dot = el.querySelector('.bus-marker__dot svg');
      if (dot) dot.style.transform = `rotate(${bus.heading}deg)`;
      el.classList.toggle('is-selected', bus.id === selectedBusId);
    });
  }

  // ============ SYNC EVENTS GEOJSON ============
  function syncEvents(events) {
    const src = map.getSource('events');
    if (!src) return;
    src.setData({
      type: 'FeatureCollection',
      features: events.map((ev) => ({
        type: 'Feature',
        properties: {
          id: ev.id,
          color: ev.color,
          severity: ev.severity,
        },
        geometry: { type: 'Point', coordinates: ev.position },
      })),
    });
  }

  // ============ LAYER TOGGLES ============
  function syncLayers(layers) {
    const set = (id, on) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
      }
    };
    set('events-heat', layers.heatmap);
    set('events-points', layers.events && !layers.heatmap);

    // Bus markers visibility
    Object.values(markers).forEach((m) => {
      m.getElement().style.display = layers.buses ? '' : 'none';
    });
  }

  // ============ SUBSCRIBE ============
  Store.subscribe((state) => {
    if (map.isStyleLoaded()) {
      syncBuses(state.buses, state.selectedBusId);
      syncEvents(state.events);
      syncLayers(state.layers);
    } else {
      map.once('load', () => {
        syncBuses(state.buses, state.selectedBusId);
        syncEvents(state.events);
        syncLayers(state.layers);
      });
    }
  });

  // ============ LAYER HUD ============
  const hud = document.getElementById('layerHud');
  const layerDefs = [
    ['buses', 'Fleet'],
    ['events', 'Events'],
    ['heatmap', 'Heatmap'],
    ['cones', 'FOV Cones'],
    ['boxes', 'Detections'],
  ];

  function renderHud(state) {
    hud.innerHTML = `
      <div class="map-hud__title mono">LAYERS</div>
      ${layerDefs.map(([key, label]) => `
        <button class="map-hud__item ${state.layers[key] ? 'is-on' : ''}" data-layer="${key}">
          <span class="map-hud__swatch"></span>
          ${label}
        </button>
      `).join('')}
    `;
    hud.querySelectorAll('[data-layer]').forEach((btn) => {
      btn.addEventListener('click', () => Store.toggleLayer(btn.dataset.layer));
    });
  }

  Store.subscribe(renderHud);
})();