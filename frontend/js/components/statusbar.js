(function initStatusBar() {
  const el = document.getElementById('statusbar');
  if (!el) return;

  function render(state) {
    const events = (state && state.events) ? state.events : [];
    const buses = (state && state.buses) ? state.buses : [];
    const lastMin = events.filter((e) => Date.now() - (e.timestamp || 0) < 60_000).length;
    const queue = events.filter((e) => e.status === 'new' || e.status === 'ACTIVE').length;

    el.innerHTML = `
      <div class="statusbar__item">
        <span class="statusbar__dot statusbar__dot--green"></span>
        <span class="mono">${buses.length || 8}</span>
        <span class="muted">/ 50 smart buses active</span>
      </div>
      <div class="statusbar__sep"></div>
      <div class="statusbar__item">
        <span class="muted">edge events/min</span>
        <span class="mono">${lastMin}</span>
      </div>
      <div class="statusbar__sep"></div>
      <div class="statusbar__item">
        <span class="muted">queue</span>
        <span class="mono">${queue}</span>
      </div>
      <div class="statusbar__spacer"></div>
      <div class="statusbar__item muted mono">
        ROADEYE Edge AI · YOLOv8 Transit · inference 42ms · roadeye://edge.mesh
      </div>
    `;
  }

  if (window.Store && Store.subscribe) {
    Store.subscribe(render);
  }
})();