(function initStatusBar() {
  const el = document.getElementById('statusbar');

  function render(state) {
    const lastMin = state.events.filter((e) => Date.now() - e.timestamp < 60_000).length;
    const queue = state.events.filter((e) => e.status === 'new').length;

    el.innerHTML = `
      <div class="statusbar__item">
        <span class="statusbar__dot statusbar__dot--green"></span>
        <span class="mono">${state.buses.length}</span>
        <span class="muted">/ 48 fleet online</span>
      </div>
      <div class="statusbar__sep"></div>
      <div class="statusbar__item">
        <span class="muted">events/min</span>
        <span class="mono">${lastMin}</span>
      </div>
      <div class="statusbar__sep"></div>
      <div class="statusbar__item">
        <span class="muted">queue</span>
        <span class="mono">${queue}</span>
      </div>
      <div class="statusbar__spacer"></div>
      <div class="statusbar__item muted mono">
        model v2.4.1 · inference 42ms · ws://urban.sense/feed
      </div>
    `;
  }

  Store.subscribe(render);
})();