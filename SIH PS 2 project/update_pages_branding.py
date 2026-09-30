import os
import re

PAGES_DIR = r"d:\Krish Tank\SIH 2026\SIH PS 2 project\frontend\pages"
FRONTEND_DIR = r"d:\Krish Tank\SIH 2026\SIH PS 2 project\frontend"

page_modules = {
    "gis.html": ("gis", "Live GIS Map"),
    "scanner.html": ("scanner", "AI Detection"),
    "vehicle-intel.html": ("vehicle-intel", "Vehicle Intelligence"),
    "ocr.html": ("ocr", "Number Plate / OCR"),
    "road-health.html": ("road-health", "Road & Infrastructure"),
    "incidents.html": ("incidents", "Incident & Alert Center"),
    "traffic.html": ("traffic", "Traffic Analytics"),
    "fleet.html": ("fleet", "Fleet & Routes"),
    "reports.html": ("reports", "Analytics & Reports"),
    "government.html": ("government", "Government Action"),
    "field-ops.html": ("field-ops", "Field Operations"),
    "system-health.html": ("system-health", "System Health"),
}

def get_sidebar_nav(active_slug):
    def act(slug):
        return " active" if slug == active_slug else ""
        
    return f"""<div class="nav-group-label">10 CONNECTED MODULES</div>
      <!-- 1. AI Dashboard -->
      <a href="../dashboard.html" class="nav-item"><span>🏠</span><span>AI Dashboard</span></a>
      <!-- 2. Live GIS Map -->
      <a href="gis.html" class="nav-item{act('gis')}"><span>🗺️</span><span>Live GIS Map</span></a>
      <!-- 3. AI Detection -->
      <a href="scanner.html" class="nav-item{act('scanner')}"><span>🤖</span><span>AI Detection</span></a>
      <!-- 4. Vehicle Intelligence -->
      <a href="vehicle-intel.html" class="nav-item{act('vehicle-intel')}"><span>🚗</span><span>Vehicle Intelligence</span><span class="badge-new">NEW</span></a>
      <!-- 5. Number Plate / OCR -->
      <a href="ocr.html" class="nav-item{act('ocr')}"><span>🔢</span><span>Number Plate / OCR</span><span class="badge-new">NEW</span></a>
      <!-- 6. Road & Infrastructure -->
      <a href="road-health.html" class="nav-item{act('road-health')}"><span>🛣️</span><span>Road &amp; Infrastructure</span></a>
      <!-- 7. Incident & Alert Center -->
      <a href="incidents.html" class="nav-item{act('incidents')}"><span>🚨</span><span>Incident &amp; Alert Center</span></a>
      <!-- 8. Fleet & Route Management -->
      <a href="fleet.html" class="nav-item{act('fleet')}"><span>🚌</span><span>Fleet &amp; Routes</span></a>
      <!-- 9. Analytics & Reports -->
      <a href="reports.html" class="nav-item{act('reports')}"><span>📊</span><span>Analytics &amp; Reports</span></a>
      <!-- 10. AI Assistant / Chatbot -->
      <button class="nav-item" id="chatbotBtn" style="color:#0284C7; cursor:pointer;"><span>💬</span><span>AI Assistant</span></button>

      <div class="nav-group-label" style="margin-top:16px;">GOVERNANCE &amp; CONTROLS</div>
      <a href="government.html" class="nav-item{act('government')}"><span>🏛️</span><span>Government Action</span><span class="badge-new">NEW</span></a>
      <a href="field-ops.html" class="nav-item{act('field-ops')}"><span>🔧</span><span>Field Operations</span></a>
      <a href="system-health.html" class="nav-item{act('system-health')}"><span>⚙️</span><span>System Health</span></a>
      <button class="nav-item" id="simDemoBtn" style="color:#0D9488; cursor:pointer; width:100%; text-align:left;"><span>🎮</span><span>Demo Simulation</span></button>
      <button class="nav-item" id="resetDemoBtn" style="width:100%; margin-top:12px; color:var(--accent-red); cursor:pointer;"><span>⟲</span><span>Reset Demo</span></button>"""

NEW_LOGO = """<div class="logo">
      <div class="logo-mark" style="background: linear-gradient(135deg, #0284C7, #06B6D4); color:#FFFFFF;">R</div>
      <div>
        <div class="logo-title" style="font-weight:800; letter-spacing:-0.02em;">ROADEYE</div>
        <div class="logo-subtitle" style="color:#0284C7;">TRANSIT VISION</div>
      </div>
    </div>"""

NEW_SIDEBAR_STATUS = """<div class="sidebar-status">
      <strong><span class="status-dot"></span> ROADEYE Online</strong>
      <small>Edge Mesh Connected</small>
    </div>"""

NEW_FOOTER = """<footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="logo-mark" style="background:#0284C7; color:#FFFFFF;">R</div>
          <div>
            <div class="footer-brand-text">ROADEYE Intelligence Platform</div>
            <div class="footer-brand-sub">Edge-AI Transit Vision &amp; Spatio-Temporal Urban Intelligence</div>
          </div>
        </div>
        <nav class="footer-nav">
          <a href="../index.html">Landing Page</a>
          <a href="../welcome.html">Interactive Tour</a>
          <a href="../login.html">Role Authentication</a>
          <a href="../dashboard.html">Command Center</a>
          <a href="../terms.html">Terms</a>
          <a href="../privacy.html">Privacy</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <div>&copy; 2026 ROADEYE. Smart India Hackathon 2026 • PS 26124. Built for intelligent civic governance.</div>
        <div class="footer-badge"><span class="status-dot"></span> DPDP Act 2023 Compliant · Data Stored in India</div>
      </div>
    </footer>"""

THEME_SCRIPT = """<script>
(function(){
  localStorage.setItem('roadeye_theme', 'light');
  document.documentElement.setAttribute('data-theme', 'light');
})();
</script>"""

for fname, (slug, title_name) in page_modules.items():
    fpath = os.path.join(PAGES_DIR, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Update title
    content = re.sub(r"<title>.*?</title>", f"<title>{title_name} | ROADEYE Command Center</title>", content, flags=re.IGNORECASE)

    # Force light theme
    content = re.sub(r"<script>\s*\(function\(\)\{\s*var s = localStorage\.getItem\('urbansense_theme'\);[\s\S]*?<\/script>", THEME_SCRIPT, content)

    # Update Logo
    content = re.sub(r'<div class="logo">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>', NEW_LOGO, content)

    # Update Nav Menu
    nav_match = re.search(r'<nav class="nav-menu">([\s\S]*?)<\/nav>', content)
    if nav_match:
        content = content[:nav_match.start()] + f'<nav class="nav-menu">\n      {get_sidebar_nav(slug)}\n    </nav>' + content[nav_match.end():]

    # Update Sidebar status
    content = re.sub(r'<div class="sidebar-status">[\s\S]*?<\/div>', NEW_SIDEBAR_STATUS, content)

    # Update Footer
    footer_match = re.search(r'<footer class="site-footer">[\s\S]*?<\/footer>', content)
    if footer_match:
        content = content[:footer_match.start()] + NEW_FOOTER + content[footer_match.end():]

    # Update Kickers
    content = re.sub(r'URBANSENSE AI ·', 'ROADEYE ·', content, flags=re.IGNORECASE)
    content = re.sub(r'UrbanSense AI', 'ROADEYE', content, flags=re.IGNORECASE)
    content = re.sub(r'UrbanSense', 'ROADEYE', content)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {fname}")

# Update other pages: terms, privacy, contact, signup
other_pages = ["terms.html", "privacy.html", "contact.html", "signup.html"]
for fname in other_pages:
    fpath = os.path.join(FRONTEND_DIR, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    content = re.sub(r'UrbanSense AI', 'ROADEYE', content, flags=re.IGNORECASE)
    content = re.sub(r'UrbanSense', 'ROADEYE', content, flags=re.IGNORECASE)
    content = re.sub(r"localStorage\.getItem\('urbansense_theme'\)", "'light'", content)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {fname}")
