(function initRightRail() {
  const el = document.getElementById('rightrail');

  function relativeTime(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    return `${m}m ago`;
  }

  function hhmmss(ts) {
    return new Date(ts).toLocaleTimeString('en-GB');
  }

  // ============ DETAIL VIEW: BUS ============
  function renderBusDetail(bus, events) {
    const busEvents = events.filter((e) => e.busId === bus.id).slice(0, 4);

    const cams = [1, 2, 3, 4].map((n) => {
      const boxes = n === 1
        ? `<div class="cam-tile__bbox" style="left:22%; top:40%; width:26%; height:32%;">
             <span class="cam-tile__bbox-label">pothole 0.94</span>
           </div>`
        : n === 3
        ? `<div class="cam-tile__bbox" style="left:60%; top:45%; width:14%; height:38%;">
             <span class="cam-tile__bbox-label">pedestrian 0.88</span>
           </div>`
        : '';
      return `
        <div class="cam-tile">
          <div class="cam-tile__label">CAM-0${n}</div>
          ${boxes}
        </div>
      `;
    }).join('');

    return `
      <div class="detail">
        <button class="detail__back" id="backBtn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          Back to feed
        </button>

        <div class="detail__head">
          <div>
            <div class="detail__id mono">${bus.id}</div>
            <div class="detail__route">${bus.routeName}</div>
          </div>
          <span class="detail__badge" style="background:${bus.routeColor}22;color:${bus.routeColor};margin-left:auto;">${bus.route}</span>
        </div>

        <div class="detail__grid">
          <div class="detail__stat">
            <span class="detail__stat-label">Speed</span>
            <span class="detail__stat-value">${bus.speed.toFixed(0)}<span class="unit">km/h</span></span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Heading</span>
            <span class="detail__stat-value">${bus.heading.toFixed(0)}<span class="unit">°</span></span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Occupancy</span>
            <span class="detail__stat-value">${bus.occupancy}<span class="unit">%</span></span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Cameras</span>
            <span class="detail__stat-value">${bus.cameras}<span class="unit">online</span></span>
          </div>
        </div>

        <div class="cam-grid">${cams}</div>

        <div class="detail__actions">
          <button class="btn btn--primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            Track live
          </button>
          <button class="btn">Logs</button>
        </div>

        ${busEvents.length ? `
          <div style="margin-top:18px;">
            <div class="detail__stat-label" style="margin-bottom:8px;">RECENT DETECTIONS</div>
            ${busEvents.map((e) => `
              <div class="feed-item" style="padding:8px 0;border-bottom:1px solid var(--border-subtle);">
                <span class="feed-item__sev feed-item__sev--${e.severity}"></span>
                <div class="feed-item__main">
                  <div class="feed-item__title">${e.label} <span class="feed-item__conf mono">${e.confidence}</span></div>
                  <div class="feed-item__meta"><span>${e.cameraId}</span></div>
                </div>
                <span class="feed-item__time mono">${relativeTime(e.timestamp)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // ============ DETAIL VIEW: EVENT ============
  function renderEventDetail(ev) {
    return `
      <div class="detail">
        <button class="detail__back" id="backBtn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
          Back to feed
        </button>

        <div class="detail__head">
          <div>
            <div class="detail__id mono" style="color:${ev.color}">${ev.label.toUpperCase()}</div>
            <div class="detail__route">${ev.id}</div>
          </div>
          <span class="detail__badge" style="background:${ev.color}22;color:${ev.color};margin-left:auto;">${ev.severity}</span>
        </div>

        <div class="detail__grid">
          <div class="detail__stat">
            <span class="detail__stat-label">Confidence</span>
            <span class="detail__stat-value">${(ev.confidence * 100).toFixed(0)}<span class="unit">%</span></span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Detected</span>
            <span class="detail__stat-value">${relativeTime(ev.timestamp)}</span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Source bus</span>
            <span class="detail__stat-value mono" style="font-size:12px;">${ev.busId}</span>
          </div>
          <div class="detail__stat">
            <span class="detail__stat-label">Camera</span>
            <span class="detail__stat-value mono" style="font-size:12px;">${ev.cameraId}</span>
          </div>
        </div>

        <div class="cam-grid" style="grid-template-columns:1fr;">
          <div class="cam-tile" style="aspect-ratio:16/9;">
            <div class="cam-tile__label">${ev.cameraId} · ${hhmmss(ev.timestamp)}</div>
            <div class="cam-tile__bbox" style="left:35%; top:35%; width:30%; height:40%;">
              <span class="cam-tile__bbox-label">${ev.label} ${ev.confidence}</span>
            </div>
          </div>
        </div>

        <div class="detail__actions">
          <button class="btn btn--primary">Verify</button>
          <button class="btn btn--danger">Dispatch</button>
          <button class="btn">Dismiss</button>
        </div>

        <div style="margin-top:16px;padding:10px;background:var(--bg-elevated);border-radius:var(--radius-md);font-size:11px;color:var(--text-muted);">
          <div class="mono" style="color:var(--text-dim);font-size:9px;letter-spacing:1px;margin-bottom:6px;">LOCATION</div>
          <span class="mono">${ev.position[1].toFixed(5)}, ${ev.position[0].toFixed(5)}</span>
        </div>
      </div>
    `;
  }

  // ============ FEED LIST ============
  function renderFeed(events) {
    if (!events.length) {
      return `
        <div style="padding:32px 14px;text-align:center;color:var(--text-dim);font-size:11px;" class="mono">
          AWAITING TELEMETRY…
        </div>
      `;
    }
    return events.slice(0, 60).map((e) => `
      <div class="feed-item" data-event-id="${e.id}">
        <span class="feed-item__sev feed-item__sev--${e.severity}"></span>
        <div class="feed-item__main">
          <div class="feed-item__title">
            ${e.label}
            <span class="feed-item__conf">${e.confidence}</span>
          </div>
          <div class="feed-item__meta">
            <span>${e.busId}</span>
            <span>·</span>
            <span>${e.route}</span>
          </div>
        </div>
        <span class="feed-item__time">${hhmmss(e.timestamp)}</span>
      </div>
    `).join('');
  }

  // ============ MAIN RENDER ============
  let lastRenderedSelection = null;
  let lastRenderedEventCount = 0;

  function render(state) {
    const { selectedBusId, selectedEventId, buses, events } = state;

    // Detail view?
    if (selectedBusId) {
      const bus = buses.find((b) => b.id === selectedBusId);
      if (bus) {
        el.innerHTML = renderBusDetail(bus, events);
        el.querySelector('#backBtn').addEventListener('click', () => Store.clearSelection());
        return;
      }
    }

    if (selectedEventId) {
      const ev = events.find((e) => e.id === selectedEventId);
      if (ev) {
        el.innerHTML = renderEventDetail(ev);
        el.querySelector('#backBtn').addEventListener('click', () => Store.clearSelection());
        return;
      }
    }

    // Default: feed
    const header = `
      <div class="rightrail__header">
        <div class="rightrail__title">Live Detections</div>
        <div class="rightrail__count mono">${events.length}</div>
      </div>
    `;

    // Only re-render body if new event arrived (avoid flicker)
    const body = `<div class="rightrail__body" id="feedBody">${renderFeed(events)}</div>`;
    el.innerHTML = header + body;

    el.querySelectorAll('[data-event-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.eventId;
        const ev = events.find((e) => e.id === id);
        if (ev) {
          Store.selectEvent(id);
          if (window.__map) {
            window.__map.flyTo({ center: ev.position, zoom: 15, duration: 900, curve: 1.4 });
          }
        }
      });
    });
  }

  Store.subscribe(render);
})();