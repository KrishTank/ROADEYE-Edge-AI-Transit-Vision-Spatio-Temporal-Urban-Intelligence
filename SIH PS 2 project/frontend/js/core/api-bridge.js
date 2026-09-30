/* =========================================================
   URBANSENSE AI — API BRIDGE
   Patches UrbanSense so getFleet()/getEvents() use the backend.
   Falls back to localStorage if backend is offline.
   ========================================================= */

(function () {

  if (typeof window.UrbanSense === 'undefined') {
    console.warn('[api-bridge] UrbanSense not loaded — bridge skipped.');
    return;
  }

  if (typeof window.UrbanAPI === 'undefined') {
    console.warn('[api-bridge] UrbanAPI not loaded — bridge skipped.');
    return;
  }

  let fleetCache = null;
  let eventsCache = null;
  let backendOnline = false;

  async function prefetch() {
    const online = await UrbanAPI.isAvailable();
    backendOnline = online;

    if (online) {
      try {
        const results = await Promise.all([
          UrbanAPI.getFleet(),
          UrbanAPI.getEvents({ limit: 100 }),
        ]);
        const fleet = results[0];
        const events = results[1];
        if (fleet) fleetCache = fleet;
        if (events) eventsCache = events;
        console.log('[api-bridge] Prefetched from backend:',
          (fleetCache ? fleetCache.length : 0) + ' buses,',
          (eventsCache ? eventsCache.length : 0) + ' events');
      } catch (err) {
        console.warn('[api-bridge] Prefetch failed:', err);
        backendOnline = false;
      }
    }

    window.dispatchEvent(new CustomEvent('urbansense:ready', {
      detail: { backendOnline, fleet: fleetCache, events: eventsCache },
    }));
  }

  const originalGetFleet = UrbanSense.getFleet.bind(UrbanSense);
  UrbanSense.getFleet = function () {
    if (backendOnline && fleetCache) return fleetCache;
    return originalGetFleet();
  };

  const originalGetBus = UrbanSense.getBus.bind(UrbanSense);
  UrbanSense.getBus = function (id) {
    if (backendOnline && fleetCache) {
      return fleetCache.find(function (b) { return b.id === id; }) || null;
    }
    return originalGetBus(id);
  };

  const originalGetEvents = UrbanSense.getEvents.bind(UrbanSense);
  UrbanSense.getEvents = function () {
    if (backendOnline && eventsCache) return eventsCache;
    return originalGetEvents();
  };

  const originalAddEvent = UrbanSense.addEvent.bind(UrbanSense);
  UrbanSense.addEvent = function (data) {
    if (backendOnline) {
      UrbanAPI.createEvent(data).then(function (saved) {
        if (saved) {
          console.log('[api-bridge] Event saved to backend:', saved.id);
          if (eventsCache) eventsCache.unshift(saved);
        }
      });
    }
    return originalAddEvent(data);
  };

  const originalUpdateStatus = UrbanSense.updateEventStatus.bind(UrbanSense);
  UrbanSense.updateEventStatus = function (id, status) {
    if (backendOnline) {
      UrbanAPI.updateEventStatus(id, status).then(function (updated) {
        if (updated && eventsCache) {
          const idx = eventsCache.findIndex(function (e) { return e.id === id; });
          if (idx !== -1) eventsCache[idx] = updated;
        }
      });
    }
    return originalUpdateStatus(id, status);
  };

  const originalSimulate = UrbanSense.simulateFleetUpdate.bind(UrbanSense);
  UrbanSense.simulateFleetUpdate = function () {
    if (backendOnline) {
      UrbanAPI.simulateFleet().then(function () {
        setTimeout(async function () {
          const fleet = await UrbanAPI.getFleet();
          if (fleet) fleetCache = fleet;
          window.dispatchEvent(new CustomEvent('urbansense:fleetUpdated'));
        }, 500);
      });
    }
    return originalSimulate();
  };

  UrbanSense.isBackendOnline = function () { return backendOnline; };
  UrbanSense.refreshFromBackend = async function () {
    if (!backendOnline) return false;
    const results = await Promise.all([
      UrbanAPI.getFleet(),
      UrbanAPI.getEvents({ limit: 100 }),
    ]);
    if (results[0]) fleetCache = results[0];
    if (results[1]) eventsCache = results[1];
    window.dispatchEvent(new CustomEvent('urbansense:refreshed'));
    return true;
  };

  prefetch();
  console.log('[api-bridge] Bridge installed.');

})();