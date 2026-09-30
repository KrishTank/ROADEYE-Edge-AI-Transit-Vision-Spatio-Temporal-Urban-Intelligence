/* =========================================================
   URBANSENSE AI — API CLIENT
   Wraps every backend call in one place.
   If the backend is unreachable, callers get null and can fall back.
   ========================================================= */

window.UrbanAPI = (function () {

  const BASE = 'http://localhost:5000';
  const TIMEOUT = 3000;
  let backendAvailable = null;   // null = unknown, true/false once tested

  /* =========================================================
     CORE FETCH WITH TIMEOUT
     ========================================================= */

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const res = await fetch(BASE + path, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        console.warn('[UrbanAPI] HTTP ' + res.status + ' on ' + path);
        return null;
      }

      const json = await res.json();
      return json;

    } catch (err) {
      clearTimeout(timer);
      return null;
    }
  }

  /* =========================================================
     HEALTH CHECK (cached)
     ========================================================= */

  async function isAvailable() {
    if (backendAvailable !== null) return backendAvailable;

    const res = await request('/api/health');
    backendAvailable = !!(res && res.success);
    console.log('[UrbanAPI] Backend ' +
      (backendAvailable ? 'ONLINE' : 'OFFLINE') +
      ' — using ' + (backendAvailable ? 'API' : 'localStorage'));
    return backendAvailable;
  }

  function resetAvailabilityCache() {
    backendAvailable = null;
  }

  /* =========================================================
     FLEET
     ========================================================= */

  async function getFleet() {
    const res = await request('/api/fleet');
    return res && res.success ? res.data : null;
  }

  async function getBus(id) {
    const res = await request('/api/fleet/' + id);
    return res && res.success ? res.data : null;
  }

  async function updateBus(id, patch) {
    const res = await request('/api/fleet/' + id, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return res && res.success ? res.data : null;
  }

  async function simulateFleet() {
    const res = await request('/api/fleet/simulate', { method: 'POST' });
    return res && res.success ? res : null;
  }

  /* =========================================================
     EVENTS
     ========================================================= */

  async function getEvents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.limit)    params.set('limit', filters.limit);
    if (filters.status)   params.set('status', filters.status);
    if (filters.type)     params.set('type', filters.type);
    if (filters.bus_id)   params.set('bus_id', filters.bus_id);
    if (filters.severity) params.set('severity', filters.severity);

    const qs = params.toString();
    const res = await request('/api/events' + (qs ? '?' + qs : ''));
    return res && res.success ? res.data : null;
  }

  async function getEvent(id) {
    const res = await request('/api/events/' + id);
    return res && res.success ? res.data : null;
  }

  async function createEvent(payload) {
    const res = await request('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : null;
  }

  async function updateEventStatus(id, status) {
    const res = await request('/api/events/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status: status }),
    });
    return res && res.success ? res.data : null;
  }

  async function deleteEvent(id) {
    const res = await request('/api/events/' + id, { method: 'DELETE' });
    return res && res.success;
  }

  async function clearEvents() {
    const res = await request('/api/events/clear', { method: 'POST' });
    return res && res.success;
  }

  /* =========================================================
     STATS
     ========================================================= */

  async function getStats() {
    const res = await request('/api/stats');
    return res && res.success ? res.data : null;
  }

  async function getSummary() {
    const res = await request('/api/stats/summary');
    return res && res.success ? res : null;
  }

  async function getZones() {
    const res = await request('/api/stats/zones');
    return res && res.success ? res.data : null;
  }

  async function getTimeline(hours = 12) {
    const res = await request('/api/stats/timeline?hours=' + hours);
    return res && res.success ? res.data : null;
  }

  async function getVehicleClasses() {
    const res = await request('/api/stats/vehicles');
    return res && res.success ? res.data : null;
  }

  async function getTrafficZones() {
    const res = await request('/api/stats/traffic-zones');
    return res && res.success ? res.data : null;
  }

  /* =========================================================
     SCAN
     ========================================================= */

  async function scanFrame(payload) {
    const res = await request('/api/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : null;
  }

  async function scanAndPublish(payload) {
    const res = await request('/api/scan/publish', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res && res.success ? res.data : null;
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  return {
    isAvailable,
    resetAvailabilityCache,
    getFleet,
    getBus,
    updateBus,
    simulateFleet,
    getEvents,
    getEvent,
    createEvent,
    updateEventStatus,
    deleteEvent,
    clearEvents,
    getStats,
    getSummary,
    getZones,
    getTimeline,
    getVehicleClasses,
    getTrafficZones,
    scanFrame,
    scanAndPublish,
  };

})();

console.log('[UrbanAPI] Loaded · backend at http://localhost:5000');