/* =========================================================
   URBANSENSE AI — REAL-TIME SSE CLIENT
   Subscribes to /api/stream. Updates UI without refresh.
   ========================================================= */

(function () {

  if (typeof window.UrbanAPI === 'undefined') {
    console.warn('[realtime] UrbanAPI not loaded — skipping.');
    return;
  }

  const STREAM_URL = 'http://localhost:5000/api/stream';
  let evtSource = null;
  let reconnectTimer = null;
  let eventCount = 0;

  /* =========================================================
     CONNECT
     ========================================================= */

  function connect() {
    if (evtSource) {
      try { evtSource.close(); } catch (e) {}
    }

    console.log('[realtime] Connecting to ' + STREAM_URL + '...');
    evtSource = new EventSource(STREAM_URL);

    evtSource.onopen = function () {
      console.log('[realtime] Stream connected.');
      showStreamBadge(true);
    };

    evtSource.onmessage = function (msg) {
      let data;
      try { data = JSON.parse(msg.data); } catch (err) { return; }
      handleMessage(data);
    };

    evtSource.onerror = function () {
      console.warn('[realtime] Stream error. Reconnecting in 3s...');
      showStreamBadge(false);
      evtSource.close();
      evtSource = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  /* =========================================================
     MESSAGE HANDLERS
     ========================================================= */

  function handleMessage(data) {
    if (!data || !data.type) return;

    if (data.type === 'connected') {
      console.log('[realtime] Server acknowledged connection.');
      return;
    }

    if (data.type === 'event') {
      eventCount++;
      console.log('[realtime] New event #' + eventCount + ':', data.payload.id);
      handleNewEvent(data.payload);
      return;
    }

    if (data.type === 'fleet_updated') {
      console.log('[realtime] Fleet updated signal.');
      try {
        if (typeof window.renderFleet === 'function') window.renderFleet();
      } catch (e) {}
      return;
    }
  }

  /* =========================================================
     NEW EVENT -> UPDATE UI
     ========================================================= */

  function handleNewEvent(event) {
    // Toast notification
    if (window.UrbanSense && UrbanSense.showToast) {
      const type = event.type || 'Detection';
      const loc = event.location || '';
      UrbanSense.showToast(
        '\u25CF ' + type + (loc ? ' \u00B7 ' + loc : ''),
        event.severity === 'CRITICAL' || event.severity === 'HIGH' ? 'warning' : 'info'
      );
    }

    // Critical flash
    if (event.severity === 'CRITICAL') {
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;box-shadow:inset 0 0 140px rgba(255,59,71,.75);transition:box-shadow 300ms ease;';
      document.body.appendChild(flash);
      setTimeout(function () {
        flash.style.boxShadow = 'inset 0 0 0 rgba(255,59,71,0)';
        setTimeout(function () { flash.remove(); }, 400);
      }, 200);
    }

    // Page-specific hooks
    try {
      if (typeof window.updateDashboard === 'function') window.updateDashboard();
      if (typeof window.renderFleet === 'function') window.renderFleet();
      if (typeof window.renderTable === 'function') window.renderTable();
      if (typeof window.renderAll === 'function') window.renderAll();
      if (typeof window.renderZones === 'function') window.renderZones();
    } catch (err) {}

    // Universal prepend to any #liveFeed
    prependToLiveFeed(event);
  }

  /* =========================================================
     LIVE FEED PREPEND
     ========================================================= */

  function prependToLiveFeed(event) {
    const feed = document.getElementById('liveFeed');
    if (!feed) return;

    const sevClass = (event.severity || 'low').toLowerCase();
    const color = (window.UrbanSense && UrbanSense.getDetectionColor)
      ? UrbanSense.getDetectionColor(event.type)
      : '#00E5FF';

    const row = document.createElement('div');
    row.className = 'feed-item';
    row.style.cssText = 'opacity:0;transform:translateY(-8px);transition:all 320ms ease;background:rgba(0,229,255,.06);';
    row.innerHTML =
      '<span class="severity-dot ' + sevClass + '"></span>' +
      '<div class="feed-main">' +
        '<div class="feed-title">' +
          '<span style="color:' + color + ';font-weight:500;">' + escapeHTML(event.type) + '</span>' +
          '<span class="mono muted" style="font-size:10px;">' + (event.confidence || '') + '%</span>' +
        '</div>' +
        '<div class="feed-meta mono">' +
          escapeHTML(event.bus_id || '') + ' \u00B7 ' + escapeHTML(event.route || '') +
        '</div>' +
      '</div>' +
      '<span class="feed-time mono">just now</span>';

    const empty = feed.querySelector('.empty-state');
    if (empty) empty.remove();

    feed.insertBefore(row, feed.firstChild);

    requestAnimationFrame(function () {
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
    });

    const items = feed.querySelectorAll('.feed-item');
    if (items.length > 20) items[items.length - 1].remove();
  }

  /* =========================================================
     STREAM BADGE (top-right)
     ========================================================= */

  function showStreamBadge(connected) {
    let badge = document.getElementById('streamBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'streamBadge';
      badge.style.cssText =
        'position:fixed;top:16px;right:16px;z-index:9997;' +
        'display:flex;align-items:center;gap:6px;' +
        'padding:6px 10px;border-radius:6px;' +
        'font-family:JetBrains Mono,monospace;font-size:10px;' +
        'letter-spacing:1px;font-weight:700;' +
        'backdrop-filter:blur(8px);transition:all 240ms ease;';
      document.body.appendChild(badge);
    }

    if (connected) {
      badge.style.background = 'rgba(0,230,138,.12)';
      badge.style.color = '#00E68A';
      badge.style.border = '1px solid rgba(0,230,138,.3)';
      badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#00E68A;box-shadow:0 0 6px #00E68A;"></span> STREAM LIVE';
    } else {
      badge.style.background = 'rgba(255,179,0,.12)';
      badge.style.color = '#FFB300';
      badge.style.border = '1px solid rgba(255,179,0,.3)';
      badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:#FFB300;"></span> RECONNECTING';
    }
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  /* =========================================================
     PUBLIC HOOKS
     ========================================================= */

  window.UrbanRealtime = {
    connect: connect,
    disconnect: function () {
      if (evtSource) { evtSource.close(); evtSource = null; }
      clearTimeout(reconnectTimer);
      showStreamBadge(false);
    },
    status: function () { return evtSource ? evtSource.readyState : -1; },
  };

  /* =========================================================
     AUTO-CONNECT
     ========================================================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }

  console.log('[realtime] Module loaded.');

})();