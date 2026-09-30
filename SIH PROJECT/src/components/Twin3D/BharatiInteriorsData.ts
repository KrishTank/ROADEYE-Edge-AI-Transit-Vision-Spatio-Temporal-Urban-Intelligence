/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bharati Station Interior Architecture Data (22 Walkable Rooms across 2 Levels)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import { RoomDefinition, OccupantPerson } from './types';

export const BHARATI_ROOMS: RoomDefinition[] = [
  // ── LEVEL 1: OPERATIONS & ADVANCED RESEARCH ──
  {
    id: 'bhr-atrium',
    name: 'Room 1 — Main Skylight Atrium (15m × 15m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 0, y: 1.0, z: 0, width: 15, height: 8.5, depth: 15 },
    doors: [
      { id: 'door-atrium-ext', position: [0, 1.0, 7.5], rotationY: 0, label: 'Aerodynamic Thermal Main Entrance' },
      { id: 'door-atrium-cmd', targetRoomId: 'bhr-command', position: [-7.5, 1.0, 2], rotationY: Math.PI / 2, label: 'Command Complex' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.8, position: [7.2, 2.2, 7.2] },
    temperature: 21.0,
    humidity: 42,
    powerKw: 6.8,
    occupancyCount: 3,
    status: 'Nominal',
    equipment: [
      { id: 'eq-flag-plaque', name: 'Indian National Emblem & 46th ISEA Mission Plaque', type: 'Sovereign Heritage', status: 'Nominal', metrics: { 'Agency': 'NCPOR / MoES', 'Latitude': '69°24\'41"S' }, position: [0, 4.5, -7.2] },
      { id: 'eq-spiral-stairs', name: 'Central Stainless & Glass Helical Staircase', type: 'Architectural Vertical Spine', status: 'Nominal', metrics: { 'Tread Material': 'Textured Tempered Glass', 'Handrail LED': 'Active 0x00E0C6' }, position: [0, 2.0, 0] }
    ],
    description: '3-story open atrium featuring triple-glazed panoramic skylight looking up into the Antarctic aurora borealis.'
  },
  {
    id: 'bhr-command',
    name: 'Room 2 — Master Operations Command (14m × 12m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: -14, y: 1.0, z: 2, width: 14, height: 4.2, depth: 12 },
    doors: [
      { id: 'door-cmd-atrium', targetRoomId: 'bhr-atrium', position: [-7.0, 1.0, 2], rotationY: Math.PI / 2, label: 'Atrium Double Doors' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00FFFF, intensity: 1.6, position: [-20.8, 2.2, 7.8] },
    temperature: 20.8,
    humidity: 40,
    powerKw: 18.5,
    occupancyCount: 4,
    status: 'Nominal',
    equipment: [
      { id: 'eq-video-wall', name: '16-Monitor Ultra-HD Matrix Video Wall (4×4)', type: 'Telemetry Master', status: 'Nominal', metrics: { 'Feeds': 'Thala Fjord Radar, Microgrid CHP, LEO Satellite Tracking', 'Blackout Status': 'NOMINAL' }, position: [-20.8, 2.5, 2.0] },
      { id: 'eq-holo-table', name: 'Larsemann Hills 3D Tactical Holographic Map Table', type: 'GIS Spatial Sandtable', status: 'Nominal', metrics: { 'LiDAR Terrain Mesh': '50cm Resolution', 'Active Traverse Markers': '2 PB Units' }, position: [-14, 1.4, 2.0] }
    ],
    description: 'U-shaped 8-station command console facing a 16-screen video wall with real-time ice velocity and SCADA overlays.'
  },
  {
    id: 'bhr-comms',
    name: 'Room 3 — High-Throughput Comms Center (8m × 6m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: -12, y: 1.0, z: -8, width: 8, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-comms-cmd', targetRoomId: 'bhr-command', position: [-12, 1.0, -4.8], rotationY: 0, label: 'Command Secured Portal' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x4A9EFF, intensity: 1.3, position: [-15.8, 2.2, -10.8] },
    temperature: 19.8,
    humidity: 38,
    powerKw: 7.2,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-rf-analyzers', name: 'Rohde & Schwarz Polar Spectrum Analyzer', type: 'RF Telemetry', status: 'Nominal', metrics: { 'Frequency Sweep': '10 MHz - 18 GHz', 'VSAT SNR': '12.8 dB' }, position: [-14, 2.0, -8] }
    ],
    description: 'Antenna servo controls, Ku/C-band VSAT uplink encoders, and HF tactical emergency transceiver stations.'
  },
  {
    id: 'bhr-datacenter',
    name: 'Room 4 — Polar Edge Data Center (6m × 6m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: -4, y: 1.0, z: -8, width: 6, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-data-atrium', targetRoomId: 'bhr-atrium', position: [-4, 1.0, -4.8], rotationY: 0, label: 'Data Center Gas-Tight Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.2, position: [-6.8, 2.2, -10.8] },
    temperature: 16.5,
    humidity: 34,
    powerKw: 12.4,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-bhr-servers', name: '6 Ruggedized 42U Server Racks', type: 'High Performance Compute', status: 'Nominal', metrics: { 'Local Storage': '2.4 PB NVMe', 'AI Continuity Model': 'Loaded in VRAM', 'Inergen Fire Gas': 'ARMED' }, position: [-4, 2.4, -8] }
    ],
    description: 'Raised antistatic tile floor, cold-aisle precision glycol chillers, and automated inert fire suppression.'
  },
  {
    id: 'bhr-power-room',
    name: 'Room 5 — Co-Gen Energy Room (10m × 8m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 12, y: 1.0, z: -6, width: 10, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-pwr-atrium', targetRoomId: 'bhr-atrium', position: [6.8, 1.0, -6], rotationY: Math.PI / 2, label: 'Switchgear Airlock' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFB020, intensity: 1.5, position: [16.8, 2.2, -9.8] },
    temperature: 29.2,
    humidity: 32,
    powerKw: 88.0,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-chp-switch', name: 'Schneider Electric 415V Synchronization Switchboard', type: 'Synchronous Bus', status: 'Nominal', metrics: { 'Bus Voltage': '415.2 V', 'Frequency': '50.02 Hz', 'Load Sharing': 'CHP-01: 52%, CHP-02: 48%' }, position: [12, 2.2, -6] }
    ],
    description: 'Electrical switchgear managing power export from 3 exterior Combined Heat & Power gensets and LiFePO4 battery banks.'
  },
  {
    id: 'bhr-ro-plant',
    name: 'Room 6 — Seawater RO Desalination Plant (8m × 6m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 12, y: 1.0, z: 2, width: 8, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-ro-atrium', targetRoomId: 'bhr-atrium', position: [7.8, 1.0, 2], rotationY: Math.PI / 2, label: 'Desalination Bay' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00FFFF, intensity: 1.3, position: [15.8, 2.2, 4.8] },
    temperature: 17.2,
    humidity: 64,
    powerKw: 14.8,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-swro-skid', name: '4-Stage Seawater Reverse Osmosis Filtration Skid', type: 'Seawater Desalination', status: 'Nominal', metrics: { 'Inflow Salinity': '34.2 PSU', 'Potable Output': '4,500 L/day', 'High-Pressure Pump': '58 bar' }, position: [12, 2.0, 2] }
    ],
    description: 'High-pressure seawater desalination system connected via trace-heated 450m intake line to Thala Fjord.'
  },
  {
    id: 'bhr-waste-treatment',
    name: 'Room 7 — Biological Wastewater Treatment (6m × 5m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 12, y: 1.0, z: 8, width: 6, height: 4.2, depth: 5 },
    doors: [
      { id: 'door-waste-ext', position: [12, 1.0, 10.5], rotationY: 0, label: 'External Service Hatch' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x3EE07F, intensity: 1.2, position: [14.8, 2.2, 10.2] },
    temperature: 20.4,
    humidity: 70,
    powerKw: 8.5,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-mbbr-reactor', name: 'Moving Bed Biofilm Reactor (MBBR) & UV Chamber', type: 'Environmental Protection', status: 'Nominal', metrics: { 'Microorganism Vigor': '98.5%', 'Effluent Purity': 'Madrid Protocol Level 1 PASS' }, position: [12, 2.2, 8] }
    ],
    description: 'Compliant with Antarctic Treaty System Annex III; treats station blackwater and greywater to drinking-safe standards.'
  },
  {
    id: 'bhr-medical-bay',
    name: 'Room 8 — Advanced Surgical Infirmary (12m × 8m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: -14, y: 1.0, z: 12, width: 12, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-med-atrium', targetRoomId: 'bhr-atrium', position: [-7.8, 1.0, 12], rotationY: Math.PI / 2, label: 'Hospital Double Doors' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.8, position: [-19.8, 2.2, 15.8] },
    temperature: 22.2,
    humidity: 44,
    powerKw: 6.4,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-surgery-table', name: 'Hydraulic Surgical Table with Shadowless Halogen Lights', type: 'Critical Surgical Bay', status: 'Nominal', metrics: { 'Sterility': 'ISO Class 5', 'Anesthesia Rig': 'Full O2/N2O' }, position: [-14, 1.8, 12] },
      { id: 'eq-xray-ultrasound', name: 'Digital Radiography & Doppler Ultrasound Cart', type: 'Diagnostic Imaging', status: 'Nominal', metrics: { 'Image Resolution': 'High DQE', 'Tele-Radiology': 'Connected' }, position: [-18, 1.8, 14] }
    ],
    description: 'Equipped with operating theatre, 4 intensive care beds, anesthesia, and digital x-ray for severe traverse injuries.'
  },
  {
    id: 'bhr-laboratory',
    name: 'Room 9 — Multidisciplinary Cryo Science Lab (14m × 8m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 0, y: 1.0, z: 14, width: 14, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-lab-atrium', targetRoomId: 'bhr-atrium', position: [0, 1.0, 9.8], rotationY: 0, label: 'Cleanroom Airlock' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00FFFF, intensity: 1.6, position: [6.8, 2.2, 17.8] },
    temperature: 19.5,
    humidity: 42,
    powerKw: 15.2,
    occupancyCount: 3,
    status: 'Nominal',
    equipment: [
      { id: 'eq-fume-hoods', name: '6 Class II Type A2 Biosafety Cabinets & Fume Hoods', type: 'Analytical Containment', status: 'Nominal', metrics: { 'Exhaust Face Velocity': '0.52 m/s', 'HEPA Filter': '99.997%' }, position: [0, 2.4, 16] },
      { id: 'eq-cryo-freezer', name: '-80°C Ultra-Low Temperature Glaciology Freezers', type: 'Core Specimen Preservation', status: 'Nominal', metrics: { 'Core Temp': '-81.4°C', 'Ice Core Archive': '142 Samples' }, position: [5.5, 2.0, 14] }
    ],
    description: 'High-purity laboratory with mass spectrometers, clean workbenches, microscopes, and cold ice core sample freezers.'
  },
  {
    id: 'bhr-storage',
    name: 'Room 10 — Pallet Storage & Forklift Bay (12m × 8m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: 12, y: 1.0, z: 14, width: 12, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-store-ext', position: [12, 1.0, 17.8], rotationY: 0, label: 'Roll-Up Cargo Bay Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xCCCCCC, intensity: 1.1, position: [17.8, 2.2, 17.8] },
    temperature: 6.8,
    humidity: 32,
    powerKw: 2.4,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-forklift-park', name: 'Toyota 2.5-Tonne Electric Forklift Charging Bay', type: 'Material Handling', status: 'Nominal', metrics: { 'Battery Charge': '94 %', 'Hydraulic Fluid': 'Synthetic Low-Temp' }, position: [12, 1.8, 14] }
    ],
    description: 'Heavy logistics depot with high-cube container racking, electric forklift parking, and emergency ration pallets.'
  },
  {
    id: 'bhr-workshop',
    name: 'Room 11 — Precision Mechanical Workshop (10m × 8m)',
    station: 'bharati',
    floor: 1,
    bounds: { x: -14, y: 1.0, z: -14, width: 10, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-shop-cmd', targetRoomId: 'bhr-comms', position: [-14, 1.0, -9.8], rotationY: 0, label: 'Maintenance Access' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFD700, intensity: 1.5, position: [-18.8, 2.2, -17.8] },
    temperature: 18.0,
    humidity: 35,
    powerKw: 11.2,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-cnc-lathe', name: 'Haas Toolroom CNC Lathe & Milling Machine', type: 'Subtractive Fabrication', status: 'Nominal', metrics: { 'Spindle RPM': '3,500', 'Accuracy': '±0.005 mm' }, position: [-14, 2.0, -14] },
      { id: 'eq-tig-welder', name: 'Miller TIG Welding Inverter & Smoke Extractor', type: 'Alloy Fabrication', status: 'Nominal', metrics: { 'Argon Gas': '180 bar', 'Shielding Curtain': 'UV Fire-Resistant' }, position: [-17, 1.8, -15.5] }
    ],
    description: 'Fabrication workshop for rapidly turning spare titanium, aluminum, and steel parts for tracked vehicles and pumps.'
  },

  // ── LEVEL 2: RESIDENTIAL, DINING, AND FJORD VISTAS ──
  {
    id: 'bhr-living-suites',
    name: 'Room 12 — Executive & Science Living Suites (12 Rooms)',
    station: 'bharati',
    floor: 2,
    bounds: { x: -14, y: 5.5, z: 2, width: 14, height: 4.2, depth: 12 },
    doors: [
      { id: 'door-res-atrium', targetRoomId: 'bhr-atrium-l2', position: [-7.0, 5.5, 2], rotationY: Math.PI / 2, label: 'Residential Corridor Wing' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFE0BD, intensity: 1.4, position: [-20.8, 6.8, 7.8] },
    temperature: 21.0,
    humidity: 46,
    powerKw: 7.2,
    occupancyCount: 6,
    status: 'Nominal',
    equipment: [
      { id: 'eq-suites', name: '12 Containerized Individual Ensuite Modules', type: 'Private Quarters', status: 'Nominal', metrics: { 'Sound Attenuation': '48 dB Rw', 'Heated Floor': '+22.0°C' }, position: [-14, 6.0, 2] }
    ],
    description: 'Ensuite private rooms built inside modified containers with custom oak desks, heated tile restrooms, and fjord view ports.'
  },
  {
    id: 'bhr-shared-dorms',
    name: 'Room 13 — Summer Scientist Dormitories (2 Rooms)',
    station: 'bharati',
    floor: 2,
    bounds: { x: -12, y: 5.5, z: -8, width: 8, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-dorm-atrium', targetRoomId: 'bhr-atrium-l2', position: [-12, 5.5, -4.8], rotationY: 0, label: 'Dorm Wing Entrance' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFE4C4, intensity: 1.3, position: [-15.8, 6.8, -10.8] },
    temperature: 20.6,
    humidity: 45,
    powerKw: 4.0,
    occupancyCount: 4,
    status: 'Nominal',
    equipment: [
      { id: 'eq-dorm-beds', name: '12 Arctic Bunk Berths with Integrated Storage', type: 'Surge Capacity', status: 'Nominal', metrics: { 'Thermal Quilts': 'Down 800-Fill', 'Personal Lockers': 'RFID Protected' }, position: [-12, 6.0, -8] }
    ],
    description: '6 beds per room designed for summer expedition scientists with study alcoves and high-speed local LAN drops.'
  },
  {
    id: 'bhr-galley',
    name: 'Room 14 — Commercial Catering Galley (12m × 8m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 12, y: 5.5, z: -6, width: 12, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-galley-mess', targetRoomId: 'bhr-dining-mess', position: [12, 5.5, -1.8], rotationY: 0, label: 'Galley Serving Counter' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.8, position: [17.8, 6.8, -9.8] },
    temperature: 24.2,
    humidity: 58,
    powerKw: 24.5,
    occupancyCount: 3,
    status: 'Nominal',
    equipment: [
      { id: 'eq-induction-ranges', name: 'Rational iCombi Pro Ovens & 8-Burner Induction', type: 'Commercial Kitchen', status: 'Nominal', metrics: { 'Active Cooktop Load': '16.8 kW', 'Fire Suppression': 'Ansul R-102 Armed' }, position: [12, 6.2, -6] }
    ],
    description: 'Stainless steel commercial kitchen with blast chillers, walk-in pantry, induction ranges, and grease extraction hood.'
  },
  {
    id: 'bhr-dining-mess',
    name: 'Room 15 — Panoramic Dining Hall (16m × 12m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 12, y: 5.5, z: 4, width: 16, height: 4.2, depth: 12 },
    doors: [
      { id: 'door-mess-atrium', targetRoomId: 'bhr-atrium-l2', position: [3.8, 5.5, 4], rotationY: Math.PI / 2, label: 'Mess Entrance' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFF8DC, intensity: 1.6, position: [19.8, 6.8, 9.8] },
    temperature: 21.8,
    humidity: 48,
    powerKw: 7.8,
    occupancyCount: 14,
    status: 'Nominal',
    equipment: [
      { id: 'eq-dining-tables', name: '8 Banquet Tables & 48 Contoured Chairs', type: 'Communal Hall', status: 'Nominal', metrics: { 'Capacity': '48 Seated Personnel', 'Window View': 'Thala Fjord Icebergs' }, position: [12, 6.0, 4] },
      { id: 'eq-projector', name: 'Laser Conference Projector & 150" Drop Screen', type: 'Mission Presentation', status: 'Nominal', metrics: { 'Source': 'Command Video Matrix', 'Brightness': '6,000 Lumens' }, position: [12, 7.8, 9.5] }
    ],
    description: 'Expansive dining hall offering panoramic views of Thala Fjord, serving 72 personnel during peak summer expeditions.'
  },
  {
    id: 'bhr-recreation',
    name: 'Room 16 — Fjord Panorama Lounge (10m × 8m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: -14, y: 5.5, z: 12, width: 10, height: 4.2, depth: 8 },
    doors: [
      { id: 'door-rec-atrium', targetRoomId: 'bhr-atrium-l2', position: [-8.8, 5.5, 12], rotationY: Math.PI / 2, label: 'Lounge Double Doors' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFD8A8, intensity: 1.3, position: [-18.8, 6.8, 15.8] },
    temperature: 21.4,
    humidity: 44,
    powerKw: 3.8,
    occupancyCount: 5,
    status: 'Nominal',
    equipment: [
      { id: 'eq-billiards', name: 'Regulation Slate Billiards Table & Recliner Cinema', type: 'Recreation', status: 'Nominal', metrics: { 'Sound System': '7.1 Dolby Surround', 'Table Levelling': 'Laser Zero' }, position: [-14, 6.0, 12] }
    ],
    description: 'Comfortable living lounge with regulation billiards table, gaming consoles, polar library, and plush recliners.'
  },
  {
    id: 'bhr-gym',
    name: 'Room 17 — Polar Fitness Center (8m × 6m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 0, y: 5.5, z: 14, width: 8, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-gym-atrium', targetRoomId: 'bhr-atrium-l2', position: [0, 5.5, 10.8], rotationY: 0, label: 'Fitness Center Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xE8F4FF, intensity: 1.5, position: [3.8, 6.8, 16.8] },
    temperature: 18.8,
    humidity: 52,
    powerKw: 4.2,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-cross-trainers', name: '2 LifeFitness Commercial Treadmills & Power Rack', type: 'Cardio & Resistance', status: 'Nominal', metrics: { 'Resistance Stack': '320 kg', 'Incline': '0 - 15%' }, position: [0, 6.0, 14] }
    ],
    description: 'Cardio and heavy strength training equipment with rubberized vibration-absorbing flooring.'
  },
  {
    id: 'bhr-bathrooms',
    name: 'Room 18 — Deluxe Shower Suites (4 Units)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 6, y: 5.5, z: 14, width: 4, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-bath-atrium', targetRoomId: 'bhr-atrium-l2', position: [6, 5.5, 10.8], rotationY: 0, label: 'Ablution Suite Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.4, position: [7.8, 6.8, 16.8] },
    temperature: 22.8,
    humidity: 72,
    powerKw: 6.8,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-showers-bhr', name: '8 High-Efficiency Thermostatic Showers', type: 'Recycled Greywater System', status: 'Nominal', metrics: { 'Greywater Heat Recapture': '82%', 'Water Temp': '+42°C' }, position: [6, 6.0, 14] }
    ],
    description: 'Four multi-stall restrooms featuring pressurized thermostatic showers, heated mirrors, and drying lockers.'
  },
  {
    id: 'bhr-laundry',
    name: 'Room 19 — Commercial Laundry Center (6m × 4m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 12, y: 5.5, z: 12, width: 6, height: 4.2, depth: 4 },
    doors: [
      { id: 'door-laund-atrium', targetRoomId: 'bhr-atrium-l2', position: [8.8, 5.5, 12], rotationY: Math.PI / 2, label: 'Laundry Center Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.3, position: [14.8, 6.8, 13.8] },
    temperature: 21.5,
    humidity: 60,
    powerKw: 7.2,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-washers-bhr', name: '3 Miele Heavy-Duty Polar Washing Machines & 2 Dryers', type: 'Automated Laundromat', status: 'Nominal', metrics: { 'Cycle Time': '38 min', 'Load Factor': '3x 18 kg' }, position: [12, 6.2, 12] }
    ],
    description: 'High-capacity laundry module with automated detergent dosing and heat recovery coils.'
  },
  {
    id: 'bhr-sauna',
    name: 'Room 20 — Finnish Cedar Wood Sauna (4m × 3m)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 16, y: 5.5, z: 12, width: 4, height: 4.2, depth: 3 },
    doors: [
      { id: 'door-sauna-bath', targetRoomId: 'bhr-bathrooms', position: [13.8, 5.5, 12], rotationY: Math.PI / 2, label: 'Tempered Glass Sauna Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFF8800, intensity: 0.8, position: [17.8, 6.8, 13.2] },
    temperature: 78.4,
    humidity: 22,
    powerKw: 9.0,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-sauna-stove', name: 'Harvia 9kW Peridotite Electric Sauna Stove', type: 'Thermal Hyperthermia Therapy', status: 'Nominal', metrics: { 'Stone Temp': '184°C', 'Air Temp': '+78.4°C' }, position: [16, 6.2, 12] }
    ],
    description: 'Two-tier Western Red Cedar wood sauna offering physiological circulation relief from severe subzero frost exposure.'
  },
  {
    id: 'bhr-observation',
    name: 'Room 21 — Aurora Observation Lounge (Glass-Walled)',
    station: 'bharati',
    floor: 2,
    bounds: { x: 0, y: 5.5, z: -10, width: 12, height: 4.2, depth: 6 },
    doors: [
      { id: 'door-obs-atrium', targetRoomId: 'bhr-atrium-l2', position: [0, 5.5, -6.8], rotationY: 0, label: 'Acoustic Glass Sliding Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x051025, intensity: 0.4, position: [5.8, 6.8, -12.8] },
    temperature: 20.2,
    humidity: 40,
    powerKw: 1.5,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-telescopes', name: 'Celestron Schmidt-Cassegrain Polar Tracking Telescopes', type: 'Optical & Aurora Physics', status: 'Nominal', metrics: { 'Aperture': '11-inch (280mm)', 'Aurora Emission': '557.7 nm Oxygen Green' }, position: [0, 6.4, -10] }
    ],
    description: 'Panoramic glass observation deck jutting outward over Quilty Bay for monitoring the Southern Lights and icebergs.'
  },
  {
    id: 'bhr-atrium-l2',
    name: 'Room 22 — Level 2 Atrium Mezzanine Walkway',
    station: 'bharati',
    floor: 2,
    bounds: { x: 0, y: 5.5, z: 0, width: 15, height: 4.2, depth: 15 },
    doors: [
      { id: 'door-mezz-stairs', targetRoomId: 'bhr-atrium', position: [0, 5.5, 0], rotationY: 0, label: 'Stair Landing' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.4, position: [7.2, 6.8, 7.2] },
    temperature: 21.2,
    humidity: 42,
    powerKw: 1.8,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-glass-rail', name: 'Tempered Glass Balustrades & Stainless Handrails', type: 'Architectural Barrier', status: 'Nominal', metrics: { 'Impact Rating': '1.5 kN/m', 'Accent LED': '0x00E0C6' }, position: [0, 6.2, 0] }
    ],
    description: 'Mezzanine walkway wrapping around the central skylight atrium, linking residential wings with the dining hall.'
  }
];

export const BHARATI_OCCUPANTS: OccupantPerson[] = [
  {
    id: 'pers-cmd-meenakshi',
    name: 'Dr. Meenakshi Sundaram',
    role: 'Atmospheric Physicist',
    roleColor: 0x4A9EFF,
    shift: 'Alpha (06:00-14:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'bhr-command',
    vitals: { heartRate: 74, oxygenSat: 98, coreTemp: 36.7 },
    pathPoints: [[-14, 1.0, 2], [-10, 1.0, 0], [0, 1.0, 0], [0, 5.5, -10]],
    position: [-14, 1.0, 2]
  },
  {
    id: 'pers-eng-mukherjee',
    name: 'Arunav Mukherjee',
    role: 'Power Engineer',
    roleColor: 0xFF8800,
    shift: 'Charlie (22:00-06:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'bhr-power-room',
    vitals: { heartRate: 76, oxygenSat: 98, coreTemp: 36.8 },
    pathPoints: [[12, 1.0, -6], [8, 1.0, -6], [0, 1.0, 0], [12, 1.0, 2]],
    position: [12, 1.0, -6]
  },
  {
    id: 'pers-pilot-tenzing',
    name: 'Tenzing Norbu',
    role: 'Traverse Pilot',
    roleColor: 0xD62226,
    shift: 'Bravo (14:00-22:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'bhr-atrium',
    vitals: { heartRate: 78, oxygenSat: 97, coreTemp: 36.5 },
    pathPoints: [[0, 1.0, 4], [0, 1.0, -2], [12, 5.5, 4]],
    position: [0, 1.0, 4]
  }
];
