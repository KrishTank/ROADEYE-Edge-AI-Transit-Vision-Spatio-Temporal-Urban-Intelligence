/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Maitri Station Interior Architecture Data (18 Walkable Rooms across 2 Floors)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import { RoomDefinition, OccupantPerson } from './types';

export const MAITRI_ROOMS: RoomDefinition[] = [
  // ── FLOOR 1: OPERATIONS & LIFE SUPPORT ──
  {
    id: 'mtr-vestibule',
    name: 'Room 1 — Entrance Vestibule & Airlock',
    station: 'maitri',
    floor: 1,
    bounds: { x: -16, y: 1.0, z: 8, width: 6, height: 3.8, depth: 4 },
    doors: [
      { id: 'door-vest-ext', position: [-16, 1.0, 10], rotationY: 0, label: 'Main Exterior Double Door' },
      { id: 'door-vest-corr', targetRoomId: 'mtr-corridor-1', position: [-16, 1.0, 6], rotationY: 0, label: 'Corridor Airlock' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFE0BD, intensity: 1.2, position: [-13.2, 2.2, 7.8] },
    temperature: 12.5,
    humidity: 38,
    powerKw: 2.4,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-air-curtain', name: 'Dual Centrifugal Air Curtain', type: 'HVAC Thermal Seal', status: 'Nominal', metrics: { 'Air Velocity': '14.2 m/s', 'Supply Temp': '+34.0°C' }, position: [-16, 3.6, 9.8] },
      { id: 'eq-boot-dryer', name: 'Heated Sorel Boot Dryer Rack', type: 'Thermal Sanitation', status: 'Nominal', metrics: { 'Drying Capacity': '16 Pairs', 'Loop Resistance': '12.4 Ω' }, position: [-18, 1.5, 7.5] }
    ],
    description: 'Decompression and thermal transition airlock with boot scraper, drying racks, and 12 heavy expedition parkas.'
  },
  {
    id: 'mtr-command-center',
    name: 'Room 2 — Main Command Center (12m × 10m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: -6, y: 1.0, z: 2, width: 12, height: 3.8, depth: 10 },
    doors: [
      { id: 'door-cmd-corr', targetRoomId: 'mtr-corridor-1', position: [-6, 1.0, 7], rotationY: 0, label: 'Command Center Entrance' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.5, position: [-0.2, 2.2, 6.8] },
    temperature: 21.2,
    humidity: 45,
    powerKw: 14.8,
    occupancyCount: 3,
    status: 'Nominal',
    equipment: [
      { id: 'eq-scada-consoles', name: '6 Operator Consoles (12 Dual Monitors)', type: 'SCADA Telemetry', status: 'Nominal', metrics: { 'Active Feeds': '42 Sensors', 'Refresh Rate': '3.0s (HiveMQ)', 'Alert State': 'GREEN' }, position: [-6, 1.8, 1.0] },
      { id: 'eq-wall-display', name: 'Central Cryosphere Video Wall (3m × 2m)', type: 'Mission Tactical Display', status: 'Nominal', metrics: { 'Resolution': '4K Polar Stereographic', 'SAR Overlay': 'RADARSAT-2 Active' }, position: [-6, 2.8, -2.8] },
      { id: 'eq-whiteboard', name: 'Operations Mission Board', type: 'SOP Visual', status: 'Nominal', metrics: { 'Traverse Status': 'Cleared to Novo Runway', 'Next Shift': 'Bravo at 14:00' }, position: [-11.8, 2.5, 2.0] }
    ],
    description: 'Central nerve center with 6 operator desks, dual displays, 3m×2m polar stereographic wall screen, and tactical radios.'
  },
  {
    id: 'mtr-comms-room',
    name: 'Room 3 — Satellite Communication Room (6m × 5m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: 5, y: 1.0, z: 4, width: 6, height: 3.8, depth: 5 },
    doors: [
      { id: 'door-comms-corr', targetRoomId: 'mtr-corridor-1', position: [2.2, 1.0, 4], rotationY: Math.PI / 2, label: 'Comms Room Access' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x4A9EFF, intensity: 1.3, position: [7.8, 2.2, 1.8] },
    temperature: 19.4,
    humidity: 42,
    powerKw: 6.5,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-vsat-modem', name: 'iDirect Evolution VSAT Modem Rack', type: 'Satellite Gateway', status: 'Nominal', metrics: { 'Carrier SNR': '11.4 dB', 'Uplink Power': '16.2 W', 'Latency': '620 ms' }, position: [5, 2.2, 6.2] },
      { id: 'eq-iridium-sbd', name: 'Iridium Extreme SBD Transceiver', type: 'LEO Constellation Backup', status: 'Nominal', metrics: { 'Signal Bars': '5 / 5', 'Queue Pending': '0 Packets' }, position: [7.2, 1.8, 4.0] }
    ],
    description: 'Ku-band satellite ground terminal, Iridium Short Burst Data modems, HF radio console, and Antarctic frequency boards.'
  },
  {
    id: 'mtr-server-room',
    name: 'Room 4 — Server & AI Continuity Room (4m × 4m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: 5, y: 1.0, z: -2, width: 4, height: 3.8, depth: 4 },
    doors: [
      { id: 'door-server-corr', targetRoomId: 'mtr-corridor-1', position: [3.2, 1.0, -2], rotationY: Math.PI / 2, label: 'Secure Server Vault' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00D4FF, intensity: 1.0, position: [6.8, 2.2, -3.8] },
    temperature: 17.8,
    humidity: 35,
    powerKw: 9.2,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-edge-servers', name: '4x 42U Ruggedized Edge Neural Racks', type: 'Local Edge Inference', status: 'Nominal', metrics: { 'Model': 'DhruvaTwin Continuity Predictor', 'Inference Latency': '18 ms', 'Fan RPM': '4,800' }, position: [5, 2.2, -2] },
      { id: 'eq-ups-bank', name: 'Eaton 9PX 15kVA UPS Battery Bank', type: 'Redundant Power', status: 'Nominal', metrics: { 'Battery SOC': '100 %', 'Autonomy Runtime': '48 Minutes' }, position: [6.5, 1.5, -3.2] }
    ],
    description: 'Cold-aisle contained edge compute facility hosting DhruvaTwin offline IndexedDB sync and AI blackout predictor.'
  },
  {
    id: 'mtr-generator-room',
    name: 'Room 5 — Primary Generator Room (8m × 6m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: 13, y: 1.0, z: -1, width: 8, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-gen-corr', targetRoomId: 'mtr-corridor-1', position: [9.2, 1.0, -1], rotationY: Math.PI / 2, label: 'Acoustic Soundproof Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFB020, intensity: 1.4, position: [16.8, 2.2, -3.8] },
    temperature: 28.6,
    humidity: 30,
    powerKw: 62.5,
    occupancyCount: 1,
    status: 'Warning',
    vulnerabilityNote: 'DG-02 exhaust manifold thermal balance +12°C delta',
    equipment: [
      { id: 'eq-genset-1', name: 'Kirloskar 62.5 kVA Diesel Generator #1', type: 'Primary AC Prime Power', status: 'Nominal', metrics: { 'Active Power': '48.2 kW', 'Frequency': '50.04 Hz', 'Oil Pressure': '4.2 bar', 'RPM': '1,500' }, position: [11.5, 1.8, -2] },
      { id: 'eq-genset-2', name: 'Kirloskar 62.5 kVA Diesel Generator #2', type: 'Secondary AC Prime Power', status: 'Warning', metrics: { 'Active Power': '38.6 kW', 'Exhaust Temp': '442°C', 'Fuel Flow': '24.2 L/h' }, position: [14.5, 1.8, -2] }
    ],
    description: 'Two internal sound-attenuated diesel generators connected to heat recovery exchangers and overhead fuel feed manifolds.'
  },
  {
    id: 'mtr-water-treatment',
    name: 'Room 6 — Water Treatment & RO Plant (5m × 4m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: 13, y: 1.0, z: 5, width: 5, height: 3.8, depth: 4 },
    doors: [
      { id: 'door-wtr-corr', targetRoomId: 'mtr-corridor-1', position: [10.7, 1.0, 5], rotationY: Math.PI / 2, label: 'Water Filtration Airlock' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00FFFF, intensity: 1.2, position: [15.2, 2.2, 6.8] },
    temperature: 16.4,
    humidity: 62,
    powerKw: 7.2,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-ro-plant', name: 'Priyadarshini 4-Stage RO Desalination', type: 'Freshwater Clarifier', status: 'Nominal', metrics: { 'Production Rate': '2,400 L/day', 'TDS Output': '28 ppm', 'Inlet Pressure': '3.8 bar' }, position: [13, 2.0, 5] },
      { id: 'eq-uv-sterilizer', name: 'Aquafine Dual UV Disinfection Reactor', type: 'Pathogen Neutralizer', status: 'Nominal', metrics: { 'UV Dose': '40 mJ/cm²', 'Lamp Status': '100% OPERATIONAL' }, position: [14.8, 2.4, 6.2] }
    ],
    description: 'Reverse osmosis purification unit drawing water from Lake Priyadarshini heated pipeline with 3× 200L potable buffer tanks.'
  },
  {
    id: 'mtr-medical-bay',
    name: 'Room 7 — Trauma & Medical Bay (8m × 6m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: -14, y: 1.0, z: -3, width: 8, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-med-corr', targetRoomId: 'mtr-corridor-1', position: [-10.2, 1.0, -3], rotationY: Math.PI / 2, label: 'Infirmary Double Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.6, position: [-17.8, 2.2, -5.8] },
    temperature: 22.0,
    humidity: 44,
    powerKw: 3.8,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-med-cots', name: '3 Intensive Care Hospital Cots', type: 'Trauma Triage', status: 'Nominal', metrics: { 'Bed 1 Occupancy': 'Vacant', 'Bed 2': 'Acclimatization Rest', 'Defibrillator': 'ARMED' }, position: [-14, 1.4, -3] },
      { id: 'eq-hyperbaric', name: 'Portable Hyperbaric Oxygen Chamber', type: 'Altitude / Hypothermia Sentry', status: 'Nominal', metrics: { 'Pressure Target': '1.3 ATA', 'Oxygen Flow': '15 LPM' }, position: [-16.5, 1.8, -4.5] }
    ],
    description: 'Emergency polar infirmary with 3 surgical beds, oxygen manifold, telemedicine link to AIIMS New Delhi, and pharmacy vault.'
  },
  {
    id: 'mtr-storage-room',
    name: 'Room 8 — Logistics Storage & Spares (10m × 6m)',
    station: 'maitri',
    floor: 1,
    bounds: { x: -5, y: 1.0, z: -6, width: 10, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-store-corr', targetRoomId: 'mtr-corridor-1', position: [-5, 1.0, -3.2], rotationY: 0, label: 'Heavy Supply Bulkhead' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xDDDDDD, intensity: 1.1, position: [-0.2, 2.2, -8.8] },
    temperature: 8.2,
    humidity: 32,
    powerKw: 1.8,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-spare-racks', name: 'Pallet Heavy-Duty Industrial Racks', type: 'Traverse Spares', status: 'Nominal', metrics: { 'PistenBully Belts': '8 in Stock', 'Trace Heating Wire': '450m Spool', 'Filters': '100% Stocked' }, position: [-5, 2.2, -6] }
    ],
    description: 'Shelving units along 3 walls holding survival rations, hydraulic spares, antifreeze chemicals, and emergency tents.'
  },
  {
    id: 'mtr-corridor-1',
    name: 'Room 9 — Floor 1 Central Spine Corridor (2m Wide)',
    station: 'maitri',
    floor: 1,
    bounds: { x: 0, y: 1.0, z: 0, width: 36, height: 3.8, depth: 2.2 },
    doors: [
      { id: 'door-stair-up', targetRoomId: 'mtr-stairway', position: [0, 1.0, 1.0], rotationY: 0, label: 'Stairs to Level 2' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.3, position: [0, 2.2, -0.9] },
    temperature: 18.5,
    humidity: 40,
    powerKw: 2.1,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-emerg-lights', name: 'Continuous LED Strip & Directional Exit Markers', type: 'Safety Life Path', status: 'Nominal', metrics: { 'Battery Backup': 'Armed', 'Photoluminescent Glow': 'PASS' }, position: [0, 3.6, 0] }
    ],
    description: '2m-wide central connecting spine with non-skid floor, safety handrails, wall temperature gauges, and stairway access.'
  },

  // ── FLOOR 2: RESIDENTIAL & HABITAT ──
  {
    id: 'mtr-living-quarters',
    name: 'Room 10 — Private Living Quarters (10 Rooms)',
    station: 'maitri',
    floor: 2,
    bounds: { x: -10, y: 4.8, z: 4, width: 14, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-lq-corr', targetRoomId: 'mtr-corridor-2', position: [-10, 4.8, 1.2], rotationY: 0, label: 'Residential Corridor Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFE4C4, intensity: 1.3, position: [-3.2, 6.0, 6.8] },
    temperature: 20.8,
    humidity: 46,
    powerKw: 5.4,
    occupancyCount: 5,
    status: 'Nominal',
    equipment: [
      { id: 'eq-bunks', name: '10 Private Berths with Thermostats', type: 'Residential Living', status: 'Nominal', metrics: { 'Thermal Radiators': 'Active (+21°C)', 'Circadian LED': 'Dim Warm (Evening)' }, position: [-10, 5.5, 4] }
    ],
    description: '10 private 3m×3m rooms with wooden bunk beds, ergonomic study desks, reading lamps, storage lockers, and double-glazed windows.'
  },
  {
    id: 'mtr-shared-dorm',
    name: 'Room 11 — Shared Expedition Dormitory (2 Rooms)',
    station: 'maitri',
    floor: 2,
    bounds: { x: 6, y: 4.8, z: 4, width: 12, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-dorm-corr', targetRoomId: 'mtr-corridor-2', position: [6, 4.8, 1.2], rotationY: 0, label: 'Dormitory Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFE0BD, intensity: 1.2, position: [11.8, 6.0, 6.8] },
    temperature: 20.4,
    humidity: 45,
    powerKw: 3.2,
    occupancyCount: 4,
    status: 'Nominal',
    equipment: [
      { id: 'eq-shared-beds', name: '8 Heavy Arctic Spring Cots', type: 'Surge Capacity Dorm', status: 'Nominal', metrics: { 'Occupied Beds': '4 / 8', 'Reading Lamps': 'Active' }, position: [6, 5.5, 4] }
    ],
    description: 'Shared summer scientist dormitories with 4 beds each, individual reading fixtures, privacy lockers, and snowscape views.'
  },
  {
    id: 'mtr-galley',
    name: 'Room 12 — Commercial Galley & Kitchen (8m × 6m)',
    station: 'maitri',
    floor: 2,
    bounds: { x: -12, y: 4.8, z: -4, width: 8, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-galley-mess', targetRoomId: 'mtr-dining-mess', position: [-8.2, 4.8, -4], rotationY: Math.PI / 2, label: 'Kitchen Pass-Through' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.6, position: [-15.8, 6.0, -6.8] },
    temperature: 23.4,
    humidity: 55,
    powerKw: 18.6,
    occupancyCount: 2,
    status: 'Nominal',
    equipment: [
      { id: 'eq-stove', name: 'Industrial 6-Burner Range & Combi Steamer', type: 'Commercial Cooking', status: 'Nominal', metrics: { 'Power Consumption': '12.4 kW', 'Exhaust Hood': 'Running (920 m³/h)' }, position: [-13, 5.5, -5.5] },
      { id: 'eq-fridge-freezer', name: 'Dual Reach-In Refrigerators & Chest Deep Freezer', type: 'Cold Storage', status: 'Nominal', metrics: { 'Fridge Core': '+3.2°C', 'Freezer Core': '-22.4°C' }, position: [-14.5, 5.5, -2.5] }
    ],
    description: 'Heavy stainless-steel kitchen with induction ranges, deep freeze storage, prep counters, and steam dishwashing.'
  },
  {
    id: 'mtr-dining-mess',
    name: 'Room 13 — Expedition Dining Mess (10m × 8m)',
    station: 'maitri',
    floor: 2,
    bounds: { x: -2, y: 4.8, z: -4, width: 10, height: 3.8, depth: 8 },
    doors: [
      { id: 'door-mess-corr', targetRoomId: 'mtr-corridor-2', position: [-2, 4.8, -0.2], rotationY: 0, label: 'Dining Hall Double Doors' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFF5E6, intensity: 1.5, position: [2.8, 6.0, -7.8] },
    temperature: 21.6,
    humidity: 48,
    powerKw: 4.8,
    occupancyCount: 8,
    status: 'Nominal',
    equipment: [
      { id: 'eq-mess-tables', name: '4 Long Dining Benches (24 Seats)', type: 'Communal Mess', status: 'Nominal', metrics: { 'Seating Capacity': '24 Personnel', 'Hot Beverage Urn': '+88°C Hot Water' }, position: [-2, 5.2, -4] },
      { id: 'eq-pa-speaker', name: 'Station All-Call PA Audio Transducer', type: 'Tactical Audio', status: 'Nominal', metrics: { 'PA Link': 'ONLINE', 'Volume': '72 dB' }, position: [-2, 7.2, -7.5] }
    ],
    description: 'Communal dining room with 4 banquet tables, buffet warming counter, daily whiteboard menu, wall clock, and PA speaker.'
  },
  {
    id: 'mtr-recreation',
    name: 'Room 14 — Polar Recreation Lounge (8m × 6m)',
    station: 'maitri',
    floor: 2,
    bounds: { x: 8, y: 4.8, z: -4, width: 8, height: 3.8, depth: 6 },
    doors: [
      { id: 'door-rec-corr', targetRoomId: 'mtr-corridor-2', position: [8, 4.8, -1.2], rotationY: 0, label: 'Lounge Glass Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFD8A8, intensity: 1.2, position: [11.8, 6.0, -6.8] },
    temperature: 21.0,
    humidity: 44,
    powerKw: 2.8,
    occupancyCount: 3,
    status: 'Nominal',
    equipment: [
      { id: 'eq-tv-media', name: '55" Ultra-HD Display & Satellite IPTV', type: 'Entertainment Media', status: 'Nominal', metrics: { 'Signal': 'Doordarshan Polar Feed', 'Audio': 'Active' }, position: [8, 6.2, -6.8] },
      { id: 'eq-library', name: 'Antarctic Scientific Literature Bookshelf', type: 'Physical Library', status: 'Nominal', metrics: { 'Volumes': '450 Expeditions Books' }, position: [11.5, 6.0, -4] }
    ],
    description: 'Sectional sofa lounge with satellite television, card tables, polar book collection, and board games.'
  },
  {
    id: 'mtr-gym',
    name: 'Room 15 — Physical Conditioning Gym (6m × 5m)',
    station: 'maitri',
    floor: 2,
    bounds: { x: 15, y: 4.8, z: -4, width: 6, height: 3.8, depth: 5 },
    doors: [
      { id: 'door-gym-corr', targetRoomId: 'mtr-corridor-2', position: [12.2, 4.8, -4], rotationY: Math.PI / 2, label: 'Gymnasium Entrance' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xE8F4FF, intensity: 1.4, position: [17.8, 6.0, -6.2] },
    temperature: 18.2,
    humidity: 50,
    powerKw: 3.4,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-treadmill', name: 'Heavy-Duty Polar Treadmill & Ergometer Bike', type: 'Cardio Station', status: 'Nominal', metrics: { 'Speed': '8.5 km/h', 'Heart Monitor': 'Connected' }, position: [15, 5.5, -4] },
      { id: 'eq-weights', name: 'Olympic Weight Bench & Dumbbell Rack', type: 'Strength Station', status: 'Nominal', metrics: { 'Total Weights': '220 kg Stack' }, position: [16.5, 5.5, -5.5] }
    ],
    description: 'Aerobic and resistance training equipment vital for preventing muscular atrophy and maintaining crew bone density in winter.'
  },
  {
    id: 'mtr-bathrooms',
    name: 'Room 16 — Sanitization & Bathrooms (3 Units)',
    station: 'maitri',
    floor: 2,
    bounds: { x: 14, y: 4.8, z: 2, width: 6, height: 3.8, depth: 4 },
    doors: [
      { id: 'door-bath-corr', targetRoomId: 'mtr-corridor-2', position: [11.2, 4.8, 2], rotationY: Math.PI / 2, label: 'Washroom Module' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.4, position: [16.8, 6.0, 3.8] },
    temperature: 22.4,
    humidity: 68,
    powerKw: 6.2,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-showers', name: '6 Low-Flow Water Recirculating Showers', type: 'Hydraulic Hygiene', status: 'Nominal', metrics: { 'Flow Limit': '4.5 L/min', 'Hot Water Loop': '+48.0°C' }, position: [14, 5.5, 2] }
    ],
    description: 'Male, female, and unisex restrooms featuring water-saving vacuum toilets, sensor sinks, and ceramic tile flooring.'
  },
  {
    id: 'mtr-laundry',
    name: 'Room 17 — Polar Laundry Module (4m × 3m)',
    station: 'maitri',
    floor: 2,
    bounds: { x: 14, y: 4.8, z: 6, width: 4, height: 3.8, depth: 3 },
    doors: [
      { id: 'door-laundry-corr', targetRoomId: 'mtr-corridor-2', position: [12.2, 4.8, 6], rotationY: Math.PI / 2, label: 'Laundry Door' }
    ],
    lightSwitch: { isOn: true, lightColor: 0xFFFFFF, intensity: 1.2, position: [15.8, 6.0, 7.2] },
    temperature: 21.0,
    humidity: 58,
    powerKw: 5.8,
    occupancyCount: 0,
    status: 'Nominal',
    equipment: [
      { id: 'eq-washers', name: '2 Front-Load Commercial Washers & Heat Dryer', type: 'Sanitary Appliances', status: 'Nominal', metrics: { 'Spin RPM': '1,200', 'Eco-Wash Cycle': 'Active (42 min)' }, position: [14, 5.5, 6] }
    ],
    description: 'Industrial laundry facility with thermal energy recapture from greywater drains.'
  },
  {
    id: 'mtr-stairway',
    name: 'Room 18 — Central Inter-Floor Steel Stairway',
    station: 'maitri',
    floor: 1,
    bounds: { x: 0, y: 1.0, z: 2, width: 4, height: 7.6, depth: 3 },
    doors: [
      { id: 'door-stair-f1', targetRoomId: 'mtr-corridor-1', position: [0, 1.0, 0.6], rotationY: 0, label: 'Floor 1 Portal' },
      { id: 'door-stair-f2', targetRoomId: 'mtr-corridor-2', position: [0, 4.8, 0.6], rotationY: 0, label: 'Floor 2 Portal' }
    ],
    lightSwitch: { isOn: true, lightColor: 0x00E0C6, intensity: 1.4, position: [1.8, 3.2, 2.8] },
    temperature: 19.2,
    humidity: 42,
    powerKw: 0.6,
    occupancyCount: 1,
    status: 'Nominal',
    equipment: [
      { id: 'eq-tread-lights', name: 'Diamond-Plate Steps with Low-Voltage LED Risers', type: 'Architectural Circulation', status: 'Nominal', metrics: { 'Step Count': '18 Steps', 'Tread Condition': 'Anti-Skid OK' }, position: [0, 3.0, 2] }
    ],
    description: 'Heavy structural steel staircase connecting Floor 1 Operations with Floor 2 Residential quarters.'
  }
];

export const MAITRI_OCCUPANTS: OccupantPerson[] = [
  {
    id: 'pers-cmd-sharma',
    name: 'Col. K. R. Sharma (Retd.)',
    role: 'Station Commander',
    roleColor: 0xFFD700,
    shift: 'Alpha (06:00-14:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'mtr-command-center',
    vitals: { heartRate: 72, oxygenSat: 98, coreTemp: 36.8 },
    pathPoints: [[-6, 1.0, 2], [-4, 1.0, 0], [0, 1.0, 1], [-2, 4.8, -4]],
    position: [-6, 1.0, 2]
  },
  {
    id: 'pers-sci-ananya',
    name: 'Dr. Ananya Sen',
    role: 'Cryosphere Scientist',
    roleColor: 0x00E0C6,
    shift: 'Alpha (06:00-14:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'mtr-command-center',
    vitals: { heartRate: 68, oxygenSat: 99, coreTemp: 36.9 },
    pathPoints: [[-4, 1.0, 1.5], [-8, 1.0, 2], [-6, 1.0, 4]],
    position: [-4, 1.0, 1.5]
  },
  {
    id: 'pers-eng-rajesh',
    name: 'Rajesh V. Nambiar',
    role: 'Power Engineer',
    roleColor: 0xFF8800,
    shift: 'Charlie (22:00-06:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'mtr-generator-room',
    vitals: { heartRate: 80, oxygenSat: 97, coreTemp: 37.0 },
    pathPoints: [[12, 1.0, -1], [14, 1.0, -3], [10, 1.0, -2]],
    position: [12, 1.0, -1]
  },
  {
    id: 'pers-doc-pradhan',
    name: 'Dr. D. Pradhan',
    role: 'Physician / Medical Officer',
    roleColor: 0x00FF66,
    shift: 'Alpha (06:00-14:00)',
    healthStatus: 'Fit for Duty',
    currentRoom: 'mtr-medical-bay',
    vitals: { heartRate: 70, oxygenSat: 99, coreTemp: 36.8 },
    pathPoints: [[-14, 1.0, -3], [-16, 1.0, -4], [-12, 1.0, -2]],
    position: [-14, 1.0, -3]
  }
];
