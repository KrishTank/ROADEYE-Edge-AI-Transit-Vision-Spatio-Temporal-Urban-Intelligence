# DhruvaTwin: Offline-First Digital Twin for Indian Antarctic Research Stations

**Team Name**: HackFinity007  
**Problem Statement ID**: 26060  
**Theme**: Smart Automation  
**Category**: Software  
**Event**: Smart India Hackathon 2026  
**Agency**: National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences (MoES), Government of India  

---

## Executive Summary

**DhruvaTwin** is a mission-critical, offline-first Digital Twin platform engineered specifically for the extreme conditions of Antarctica. Built for India's operational stations—**Maitri** (Schirmacher Oasis) and **Bharati** (Larsemann Hills)—as well as the historic **Dakshin Gangotri** and the planned next-generation **Maitri-II** polar hub, DhruvaTwin bridges extreme communication isolation with autonomous SCADA monitoring, neural network satellite blackout prediction, and cryptographic audit integrity.

---

## Core Capabilities & Mandatory Feature Highlights

### 1. Separate High-Fidelity 3D Spatial Twins (40+ Objects per Station)
- **Maitri Station (1989)**: Displaced rocky terrain of Schirmacher Oasis, main habitat elevated on 8 steel pillars, Lake Priyadarshini (0.297 sq km) with animated water and floating ice floes, cyan-pulsing heated water pipeline (45-minute freeze vulnerability), 4 × 62.5 kVA diesel generators with exhaust stacks and status indicators, fuel farm, lake pump house, 15m meteorological weather mast with rotating anemometer cups, summer camp modules, and Novo Airfield runway marker (5.5 km NE).
- **Bharati Station (2012)**: Displaced coastal fjord terrain, aerodynamic station structure built of 134 shipping containers with composite envelope, 40+ blue windows, yellow emergency airlock, 3 CHP cogeneration units (100 kVA electrical + 150 kW thermal each), 13 bulk fuel tanks (300,000L capacity) and 3 day feed tanks, heated seawater pump house with 450m intake line from Thala Fjord, Quilty Bay, biological wastewater treatment module, regulated clean-power science laboratory, and Progress Station (8 km East) / Zhongshan coordination markers.
- **Atmosphere & Environment**: 3,000–4,000 particle snowfall simulation, undulating polar aurora borealis bands, skybox stars, and realistic depth fog.
- **Camera Presets & Hotspots**: Instant switching between *Overview*, *Maitri Focus*, *Bharati Focus*, *Aerial*, and *Component Zoom*. Every asset features interactive raycasting for real-time SCADA sensor inspection.

### 2. Antarctic High-Visibility Mode (Extreme Sub-Zero Ergonomics)
- **Activations**: Top nav snowflake toggle, keyboard shortcut `Ctrl+Shift+A`, or automatic threshold triggers (temperature below -20°C or katabatic gusts exceeding 80 km/h).
- **Visual Design**: Pure black background (`#000000`), pure white high-contrast text (`#FFFFFF`), zero gradients, and 4px white button borders.
- **Extreme Touch & Glove Targets**: Minimum 64x64px touch targets with 16px spacing; body text scaled to 18pt+, headings to 24pt+, and numeric telemetry to 28pt+ in JetBrains Mono Bold.
- **Emergency Controls**: Prominent voice command input button and a dedicated **200x200px pulsing red SOS button** for instant life-safety distress broadcasts.
- **Top HUD**: Large real-time temperature (32pt), current time (24pt), katabatic wind velocity (32pt), and UPS battery reserves.

### 3. AI Blackout Predictor & Satellite Continuity Engine
- **Six Mandatory Touchpoints**:
  1. *Top Nav Bar*: Live link status badge showing *Link Stable* (green), *Drop Predicted in X min* (amber), or *Blackout Active* (red).
  2. *3D Viewport*: Top-right HUD showing predicted time to drop, confidence score, and cyan pulsing *AI Continuity: ACTIVE* tag.
  3. *Telemetry Charts*: Solid cyan line for live SCADA telemetry, dotted orange line for AI-predicted continuity data, and red vertical blackout window band labeled *"AI-PREDICTED (target 95% accuracy)"*.
  4. *Right Sidebar*: AI Continuity Engine card tracking predictions, confidence, and model accuracy.
  5. *Left Sidebar*: Dedicated AI Continuity navigation link with the **"Simulate Satellite Blackout"** action button.
  6. *Footer Bar*: Persistent `AI Engine: ACTIVE` cyan indicator.
- **60-Second Blackout Simulation & Post-Outage Reconciliation**: Clicking *Simulate Satellite Blackout* triggers VSAT loss-of-lock, initiates neural synthetic imputation, and pulses red alert borders. Upon completion, a post-blackout reconciliation report benchmarks predicted vs. actual telemetry with mean absolute error (MAE) deltas.

### 4. MQTT & Offline-First Prioritized Sync
- **HiveMQ Public Broker Integration**: Connects via WebSocket to `broker.hivemq.com` across topics:
  - `dhruvatwin/telemetry/{stationId}/{sensorId}`
  - `dhruvatwin/alerts/{stationId}/{severity}`
  - `dhruvatwin/commands/{stationId}/{deviceId}`
- **IndexedDB Priority Queue (Dexie.js)**: Telemetry is queued and processed in strict priority order:
  - Priority 1: `SOS`
  - Priority 2: `Critical` (Freeze alarms, power drops)
  - Priority 3: `Checkin` (Crew RFID heartbeats)
  - Priority 4: `Routine` (Environmental background data)
- **Bandwidth Delta Compression**: Achieves 99.5% transmission size reduction (250 KB raw payload compressed to 1.2 KB), displayed dynamically in the UI.

### 5. Ten Dedicated Operational Screens
1. **Alert Triage & Incident Matrix**: 4-tier cards (Tier 1 Critical to Tier 4 Routine), subsystem chips, active incident queue, and NCPOR step-by-step SOP execution.
2. **Station Dashboard & Personnel Roster**: 4 KPI cards, wintering crew biometric tracking (heart rate, SpO2, core temp), RFID sector tracking, circadian blue-light cycle index, and habitat muster shelters.
3. **Local Cryosphere & Radar**: Synthetic Aperture Radar (SAR) ice velocity vector canvas, Automated Weather Station (AWS) metrics, and orbital satellite pass countdowns.
4. **Microgrid & CHP Command**: 6 KPI cards, dynamic energy flow topology, synchronous bus load balancing, Savonius wind turbine injection, bifacial solar PV, 120 kWh BESS storage, and glycol heat recovery loop.
5. **Digital Twin 3D View**: Full Three.js 3D viewport with camera utilities and right-hand telemetry diagnostic sidebar.
6. **Antarctica 4-Station Overview**: Maitri, Bharati, Dakshin Gangotri (historic 1983 site), and Maitri-II (next-gen hub) on polar stereographic coordinates with carrier link budgets.
7. **NCPOR Technical Library**: Categorized repository with instant downloads and FAIR metadata summaries.
8. **NPDC Compliance Center**: 8-point FAIR principles checklist, ISO 19115 schema viewer, and JSON metadata export.
9. **Expedition Logs (ISEA 1–46)**: Complete history of all 46 Indian Antarctic expeditions from 1981 to 2026.
10. **Cryptographic Audit Trail**: SHA-256 tamper-evident hash-chain verifying SCADA setpoint modifications and operator commands.

### 6. Additional Intelligence & Operations Modules
- **Open-Meteo Weather Integration**: Real weather data fetched for Maitri (-70.76°S, 11.73°E) and Bharati (-69.41°S, 76.19°E) with 30-minute caching and robust Antarctic fallbacks.
- **Operations AI Chatbot**: Context-injected assistant providing real-time diagnosis of microgrid balance, water freeze safety protocols, and ATS Madrid Protocol guidelines.
- **Role-Based Views**: Instant switching between `Admin`, `Commander`, `User`, and `Scientist`.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **3D Graphics**: Three.js WebGL2 Engine (custom terrain displacement, PBR materials, custom particle systems)
- **Local Storage**: IndexedDB via Dexie.js
- **Messaging**: HiveMQ MQTT WebSocket Client
- **Cryptography**: Web Crypto API (SHA-256 Hash Chaining)
- **APIs**: Open-Meteo Weather API, Groq / Gemini AI Operations Endpoint

---

## Judge Demonstration Flow

1. **Station 3D Twins**:
   - Begin on the *Digital Twin 3D View*.
   - Toggle between **Maitri** (Lake Priyadarshini, cyan heated trace pipeline, 4 generators) and **Bharati** (aerodynamic 134-container structure, Thala Fjord, 3 CHP units).
   - Click on 3D components to inspect SCADA sensor telemetry and failure vulnerabilities.
   - Cycle through camera presets: *Maitri Focus*, *Bharati Focus*, *Aerial*, and *Component Zoom*.

2. **Antarctic High-Visibility Mode**:
   - Click the **snowflake icon** in the top navigation or press `Ctrl+Shift+A`.
   - Observe the instant transformation to pure black `#000000`, 18pt/28pt high-contrast typography, 64x64px touch targets, and the prominent **200x200px pulsing red SOS button**.
   - Test the voice command simulator and review the critical generator/water panels.

3. **AI Blackout Predictor**:
   - Click **"Simulate Satellite Blackout"** in the left sidebar or on the dedicated *AI Continuity Engine* page.
   - Watch the top navigation and 3D viewport update to *BLACKOUT ACTIVE*, triggering a 60-second countdown with red pulsing warning borders.
   - Observe the telemetry chart: live cyan line transitions to the dotted orange AI-predicted continuity line over the red blackout window.
   - Review the *Post-Blackout Cryptographic Reconciliation Report* comparing predicted vs. actual values (target 95% accuracy).

4. **Offline Synchronization & Bandwidth Savings**:
   - Examine the left sidebar footer showing live connection to `broker.hivemq.com` and the 99.5% delta compression savings (250 KB → 1.2 KB).
   - Review the prioritized IndexedDB sync queue (SOS=1, Critical=2, Checkin=3, Routine=4).

5. **Operational Screens & Madrid Protocol**:
   - Open *Alert Triage* to acknowledge anomalies and review step-by-step SOP execution.
   - Open *Microgrid Command* to adjust bus balancing and glycol pump speeds.
   - Open *NPDC Compliance Center* to review the FAIR checklist and click *Export NPDC Metadata JSON*.
   - Open *Audit Trail* and click *Verify Chain* to validate the SHA-256 cryptographic chain of custody.
