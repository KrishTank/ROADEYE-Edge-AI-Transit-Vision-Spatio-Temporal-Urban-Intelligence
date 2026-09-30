/* SYSTEM HEALTH PAGE */
document.addEventListener('DOMContentLoaded', function () {
  UrbanSense.startClock('liveClock');
  refreshHealth();
  refreshSecurity();
  setInterval(refreshHealth, 5000);
  setInterval(refreshSecurity, 30000);
});

async function refreshHealth() {
  try {
    var res = await fetch('http://localhost:5000/api/system/health').then(function(r) { return r.json(); });
    if (!res.success) return;
    var d = res.data;
    document.getElementById('shCpu').innerHTML = d.cpu_percent + '<span class="unit">%</span>';
    document.getElementById('shCpuBar').style.width = d.cpu_percent + '%';
    document.getElementById('shMem').innerHTML = d.memory_percent + '<span class="unit">%</span>';
    document.getElementById('shMemBar').style.width = d.memory_percent + '%';
    document.getElementById('shLatency').innerHTML = d.latency_ms + '<span class="unit">ms</span>';
    document.getElementById('shLatencySub').textContent = 'Average response';
    document.getElementById('shUptime').textContent = d.uptime.human;
    document.getElementById('shUptimeSub').textContent = 'Since boot';
    renderServices(d.services);
  } catch (e) {
    console.warn('[system-health] Health fetch failed', e);
  }
}

function renderServices(services) {
  var container = document.getElementById('shServices');
  if (!container || !services) return;
  container.innerHTML = services.map(function(s) {
    return '<div class="service-row">' +
      '<span class="service-dot"></span>' +
      '<span class="service-name">' + s.name + '</span>' +
      '<span class="service-latency">' + s.latency_ms + ' ms</span>' +
      '<span class="service-status">' + s.status + '</span>' +
      '</div>';
  }).join('');
}

async function refreshSecurity() {
  try {
    var res = await fetch('http://localhost:5000/api/system/security').then(function(r) { return r.json(); });
    if (!res.success) return;
    var d = res.data;
    document.getElementById('secBlocked').textContent = d.threats.blocked_last_24h;
    document.getElementById('secFailed').textContent = d.threats.failed_logins_last_24h;
    document.getElementById('secTls').textContent = d.encryption.tls_version;
    document.getElementById('secCert').textContent = d.encryption.cert_expires_days + ' days';
    document.getElementById('secAuth').textContent = d.authentication.method;
    document.getElementById('secMfa').textContent = d.authentication.mfa_enabled ? 'ENABLED' : 'DISABLED';
    renderLogins(d.recent_logins);
    renderPolicies(d.policies);
  } catch (e) {
    console.warn('[system-health] Security fetch failed', e);
  }
}

function renderLogins(logins) {
  var container = document.getElementById('secLogins');
  if (!container || !logins) return;
  container.innerHTML = logins.map(function(l) {
    var t = new Date(l.timestamp);
    var hh = String(t.getHours()).padStart(2, '0');
    var mm = String(t.getMinutes()).padStart(2, '0');
    return '<div class="login-row">' +
      '<span class="login-time">' + hh + ':' + mm + '</span>' +
      '<span class="login-user">' + l.user + '</span>' +
      '<span class="login-ip">' + l.ip + '</span>' +
      '<span class="login-status ' + l.status + '">' + l.status + '</span>' +
      '</div>';
  }).join('');
}

function renderPolicies(policies) {
  var container = document.getElementById('secPolicies');
  if (!container || !policies) return;
  container.innerHTML = policies.map(function(p) {
    return '<div class="policy-item">' + p + '</div>';
  }).join('');
}
