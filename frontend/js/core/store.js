// Tiny pub/sub store. Global singleton.
const Store = (() => {
  const state = {
    view: 'map',
    layers: {
      routes: true,
      buses: true,
      events: true,
      heatmap: false,
      cones: true,
      boxes: false,
    },
    buses: [],
    events: [],
    selectedBusId: null,
    selectedEventId: null,
    connection: 'live',
  };

  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => fn(state));
  }

  return {
    get: () => state,
    subscribe(fn) {
      listeners.add(fn);
      fn(state);
      return () => listeners.delete(fn);
    },
    set(patch) {
      Object.assign(state, patch);
      emit();
    },
    toggleLayer(key) {
      state.layers[key] = !state.layers[key];
      emit();
    },
    selectBus(id) {
      state.selectedBusId = id;
      state.selectedEventId = null;
      emit();
    },
    selectEvent(id) {
      state.selectedEventId = id;
      emit();
    },
    clearSelection() {
      state.selectedBusId = null;
      state.selectedEventId = null;
      emit();
    },
    pushEvent(ev) {
      state.events = [ev, ...state.events].slice(0, 300);
      emit();
    },
    setBuses(buses) {
      state.buses = buses;
      emit();
    },
    setView(v) {
      state.view = v;
      emit();
    },
    setConnection(c) {
      state.connection = c;
      emit();
    },
  };
})();

window.Store = Store;