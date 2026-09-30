/* =========================================================
   URBANSENSE AI — LIVE GPS CLIENT v2
   - Caches bus positions in localStorage
   - Loads cached positions on page load (buses appear instantly)
   - Keeps markers on map even if backend goes down
   - Smooth animation between updates
   ========================================================= */

(function () {

  if (typeof window.L === 'undefined') {
    console.warn('[gps-live] Leaflet not loaded — skipping.');
    return;
  }

  const STREAM_URL = 'http://localhost:5000/api/gps/stream';
  const CURRENT_URL = 'http://localhost:5000/api/gps/current';
  const LANDMARKS_URL = 'http://localhost:5000/api/gps/landmarks';
  const CACHE_KEY = 'urbansense_bus_positions_v1';
  const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  let evtSource = null;
  let reconnectTimer = null;
  let map = null;
  let busMarkers = {};
  let busTrails = {};

  /* =========================================================
     CACHE HELPERS
     ========================================================= */

  function saveCache(buses) {
    try {
      const payload = {
        savedAt: Date.now(),
        buses: buses.map(b => ({
          bus_id: b.bus_id,
          route: b.route,
          lat: b.lat,
          lng: b.lng,
          heading: b.heading,
          speed: b.speed,
          trail: b.trail || [],
        })),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // localStorage full or blocked — silently ignore
    }
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload || !payload.buses) return null;
      if (Date.now() - payload.savedAt > CACHE_MAX_AGE_MS) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return payload.buses;
    } catch (e) {
      return null;
    }
  }

  /* =========================================================
     MAP HOOK
     ========================================================= */

  function waitForMap(cb) {
    let tries = 0;
    const interval = setInterval(() => {
      if (window.__urbanMap) {
        clearInterval(interval);
        cb(window.__urbanMap);
      }
      if (++tries > 50) {
        clearInterval(interval);
        console.warn('[gps-live] Map never appeared.');
      }
    }, 100);
  }

  /* =========================================================
     BUS ICON
     ========================================================= */

  function busIconHTML(heading) {
    return `
      <div class="gps-bus-icon" style="transform: rotate(${heading}deg);">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#0A1120" stroke="#00E5FF" stroke-width="1.5" opacity="0.9"/>
          <g transform="translate(8, 9)">
            <rect x="0" y="4" width="16" height="10" rx="2" fill="#00E5FF"/>
            <rect x="1.5" y="5.5" width="5" height="4" rx="1" fill="#0A1120"/>
            <rect x="9.5" y="5.5" width="5" height="4" rx="1" fill="#0A1120"/>
            <circle cx="4" cy="15" r="1.5" fill="#0A1120" stroke="#00E5FF" stroke-width="0.8"/>
            <circle cx="12" cy="15" r="1.5" fill="#0A1120" stroke="#00E5FF" stroke-width="0.8"/>
          </g>
          <polygon points="16,2 19,7 13,7" fill="#00E5FF" opacity="0.9"/>
        </svg>
      </div>
    `;
  }

  /* =========================================================
     MARKER + TRAIL
     ========================================================= */

  function createBusMarker(bus) {
    const el = document.createElement('div');
    el.className = 'gps-bus-marker';
    el.innerHTML = busIconHTML(bus.heading || 0);

    const marker = L.marker([bus.lat, bus.lng], {
      icon: L.divIcon({
        className: '',
        html: el,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      zIndexOffset: 1000,
    });

    marker.bindTooltip(
      `<strong>${bus.bus_id}</strong><br>Route ${bus.route}<br>${Math.round(bus.speed || 0)} km/h`,
      { direction: 'top', offset: [0, -18] }
    );

    marker.on('click', (e) => {
      if (e && e.originalEvent) e.originalEvent.stopPropagation();
      if (window.BusDetail) {
        window.BusDetail.open(bus.bus_id);
      }
    });

    return marker;
  }

  function createTrail(bus) {
    return L.polyline((bus.trail || []).map(p => [p[0], p[1]]), {
      color: '#00E5FF',
      weight: 2.5,
      opacity: 0.5,
      smoothFactor: 1,
      dashArray: '6,6',
    });
  }

  /* =========================================================
     ANIMATE
     ========================================================= */

  function animateMarker(marker, fromLatLng, toLatLng, heading, duration) {
    const start = performance.now();
    const fromLat = fromLatLng[0];
    const fromLng = fromLatLng[1];

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const lat = fromLat + (toLatLng[0] - fromLat) * t;
      const lng = fromLng + (toLatLng[1] - fromLng) * t;
      marker.setLatLng([lat, lng]);

      const el = marker.getElement();
      if (el) {
        const icon = el.querySelector('.gps-bus-icon');
        if (icon) icon.style.transform = 'rotate(' + heading + 'deg)';
      }

      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* =========================================================
     POSITION UPDATE
     ========================================================= */

  function handlePositions(buses) {
    if (!map || !buses || buses.length === 0) return;

    buses.forEach(bus => {
      const existing = busMarkers[bus.bus_id];

      if (!existing) {
        // Create new marker
        const marker = createBusMarker(bus);
        marker.addTo(map);
        busMarkers[bus.bus_id] = {
          marker: marker,
          lastLat: bus.lat,
          lastLng: bus.lng,
        };

        if (bus.trail && bus.trail.length > 1) {
          const trail = createTrail(bus);
          trail.addTo(map);
          busTrails[bus.bus_id] = trail;
        }
      } else {
        // Animate to new position
        const fromLatLng = [existing.lastLat, existing.lastLng];
        animateMarker(
          existing.marker,
          fromLatLng,
          [bus.lat, bus.lng],
          bus.heading,
          1000
        );
        existing.lastLat = bus.lat;
        existing.lastLng = bus.lng;

        if (bus.trail && bus.trail.length > 1) {
          if (busTrails[bus.bus_id]) {
            busTrails[bus.bus_id].setLatLngs(bus.trail.map(p => [p[0], p[1]]));
          } else {
            const trail = createTrail(bus);
            trail.addTo(map);
            busTrails[bus.bus_id] = trail;
          }
        }
      }
    });

    // Save to cache for next page load
    saveCache(buses);

    window.__gpsBusCount = buses.length;
  }

  /* =========================================================
     LOAD CACHED POSITIONS FIRST
     Called immediately on map init.
     Buses appear on the map BEFORE the SSE connects.
     ========================================================= */

  function loadCachedPositions() {
    const cached = loadCache();
    if (!cached || cached.length === 0) {
      console.log('[gps-live] No cached positions. Waiting for stream...');
      return false;
    }

    console.log('[gps-live] Loaded ' + cached.length + ' cached bus positions.');
    handlePositions(cached);
    return true;
  }

  /* =========================================================
     FETCH CURRENT (one-shot, when SSE is slow)
     ========================================================= */

  async function fetchCurrentOnce() {
    try {
      const res = await fetch(CURRENT_URL).then(r => r.json());
      if (res.success && res.data && res.data.length > 0) {
        console.log('[gps-live] Snapshot fetched: ' + res.data.length + ' buses.');
        handlePositions(res.data);
      }
    } catch (e) {
      // backend down — cache already loaded, no problem
    }
  }

  /* =========================================================
     SSE CONNECT
     ========================================================= */

  function connect() {
    if (evtSource) {
      try { evtSource.close(); } catch (e) {}
    }

    console.log('[gps-live] Connecting to ' + STREAM_URL);
    evtSource = new EventSource(STREAM_URL);

    evtSource.onopen = function () {
      console.log('[gps-live] Stream connected.');
    };

    evtSource.onmessage = function (msg) {
      let data;
      try { data = JSON.parse(msg.data); } catch (e) { return; }
      if (data.type === 'positions') {
        handlePositions(data.data);
      }
    };

    evtSource.onerror = function () {
      console.warn('[gps-live] Stream error. Reconnecting in 3s...');
      // NOTE: We do NOT remove bus markers on error.
      // The markers stay on the map showing the last known positions.
      try { evtSource.close(); } catch (e) {}
      evtSource = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  /* =========================================================
     LANDMARKS
     ========================================================= */

  async function addLandmarks() {
    if (!map) return;
    try {
      const res = await fetch(LANDMARKS_URL).then(r => r.json());
      if (!res.success) return;

      res.data.forEach(lm => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="gps-landmark">
                   <div class="gps-landmark-dot"></div>
                   <div class="gps-landmark-label">${lm.name}</div>
                 </div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([lm.lat, lm.lng], { icon, interactive: false })
          .addTo(map);
      });
    } catch (e) {
      console.warn('[gps-live] Landmarks failed:', e);
    }
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    waitForMap(function (m) {
      map = m;

      // 1. Load cached positions instantly (buses appear before backend connects)
      loadCachedPositions();

      // 2. Add landmarks (silent failure if backend is down)
      addLandmarks();

      // 3. Try a one-shot fetch in case SSE is slow
      fetchCurrentOnce();

      // 4. Open the live SSE stream
      connect();

      console.log('[gps-live] Ready.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.UrbanGPSLive = {
    connect: connect,
    disconnect: function () {
      if (evtSource) { evtSource.close(); evtSource = null; }
    },
    clearCache: function () {
      localStorage.removeItem(CACHE_KEY);
      console.log('[gps-live] Cache cleared.');
    },
  };

})();