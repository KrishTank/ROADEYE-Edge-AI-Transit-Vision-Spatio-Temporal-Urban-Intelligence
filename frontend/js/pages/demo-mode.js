/* URBANSENSE AI — DEMO MODE */
(function () {
  const SEQUENCE = [
    { page: 'index.html', delay: 6000, label: 'Command Center' },
    { page: 'gis.html', delay: 6000, label: 'GIS Intelligence' },
    { page: 'scanner.html', delay: 9000, label: 'Edge AI Scanner', autoScan: true },
    { page: 'index.html', delay: 6000, label: 'Back to Dashboard' },
    { page: 'incidents.html', delay: 6000, label: 'Incident Center' },
    { page: 'road-health.html', delay: 6000, label: 'Road Health' },
    { page: 'reports.html', delay: 6000, label: 'Reports' },
  ];
  const KEY = 'urbansense_demo_step';

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      localStorage.setItem(KEY, '0');
      location.href = 'index.html?demo=1';
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') !== '1') return;
    const step = Number(localStorage.getItem(KEY) || '0');
    if (step >= SEQUENCE.length) {
      localStorage.removeItem(KEY);
      if (window.UrbanSense) UrbanSense.showToast('Demo complete', 'success');
      return;
    }
    const current = SEQUENCE[step];
    const here = location.pathname.split('/').pop() || 'index.html';
    if (here !== current.page) return;

    const hud = document.createElement('div');
    hud.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;padding:10px 18px;background:rgba(13,20,32,.95);border:1px solid var(--accent-cyan);border-radius:8px;font-family:monospace;font-size:11px;color:var(--accent-cyan);';
    hud.textContent = 'DEMO ' + (step + 1) + ' / ' + SEQUENCE.length + ' | ' + current.label;
    document.body.appendChild(hud);

    if (current.autoScan) {
      setTimeout(function () {
        const runBtn = document.getElementById('runScanBtn');
        if (runBtn) {
          runBtn.click();
          setTimeout(function () {
            const pub = document.getElementById('publishBtn');
            if (pub) pub.click();
          }, 4500);
        }
      }, 1200);
    }

    setTimeout(function () {
      const next = step + 1;
      if (next >= SEQUENCE.length) { localStorage.removeItem(KEY); return; }
      localStorage.setItem(KEY, String(next));
      location.href = SEQUENCE[next].page + '?demo=1';
    }, current.delay);
  });
})();