/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 2.5D Isometric Cutaway Digital Twin Component
 * Technical Blueprint & Room Architectural Telemetry Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { 
  Layers, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Zap, 
  Thermometer, 
  ShieldAlert,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';

interface Twin2_5DProps {
  activeStation: StationId;
  onRoomSelect?: (room: any) => void;
}

interface RoomCutaway {
  id: string;
  name: string;
  floor: 1 | 2;
  col: number;
  row: number;
  width: number;
  height: number;
  temp: number;
  powerKw: number;
  occupancy: number;
  status: 'Nominal' | 'Warning' | 'Critical';
  vulnerabilityNote?: string;
  equipment: string[];
}

export const Twin2_5D: React.FC<Twin2_5DProps> = ({ activeStation, onRoomSelect }) => {
  const [selectedFloor, setSelectedFloor] = useState<1 | 2>(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeRoom, setActiveRoom] = useState<RoomCutaway | null>(null);

  const station = STATIONS_DATA[activeStation];

  // 15+ Walkable Rooms for Maitri (Floor 1: Ops, Floor 2: Living)
  const maitriRoomsFloor1: RoomCutaway[] = [
    { id: 'mtr-vestibule', name: 'Entrance Airlock Vestibule', floor: 1, col: 0, row: 0, width: 2, height: 1.5, temp: 12.4, powerKw: 2.1, occupancy: 1, status: 'Nominal', equipment: ['Thermal Air Curtain', 'Snow Boot Drying Rack'] },
    { id: 'mtr-cmd', name: 'Central Command Center', floor: 1, col: 2, row: 0, width: 4, height: 3, temp: 20.8, powerKw: 14.5, occupancy: 4, status: 'Nominal', equipment: ['6 Operator Consoles', '12 Telemetry Displays', 'UHF Tactical Gateway'] },
    { id: 'mtr-comms', name: 'Satellite Comms Bay', floor: 1, col: 6, row: 0, width: 2.5, height: 2, temp: 19.5, powerKw: 6.2, occupancy: 1, status: 'Nominal', equipment: ['VSAT Modem Rack', 'Iridium SBD Transceiver', 'HF Radio Antenna Feed'] },
    { id: 'mtr-server', name: 'Server & AI Continuity Bay', floor: 1, col: 6, row: 2, width: 2.5, height: 2, temp: 17.2, powerKw: 8.8, occupancy: 0, status: 'Nominal', equipment: ['Edge Neural Server', 'UPS Battery Bank (15kVA)', 'Precision Glycol Cooler'] },
    { id: 'mtr-gen', name: 'Primary Genset Engine Room', floor: 1, col: 0, row: 1.5, width: 3.5, height: 3, temp: 28.5, powerKw: 42.0, occupancy: 1, status: 'Warning', vulnerabilityNote: 'Trace fuel pre-heater resistance fluctuation', equipment: ['2x Kirloskar 62.5 kVA Gensets', 'Coolant Heat Exchanger', 'Acoustic Baffle'] },
    { id: 'mtr-water', name: 'Lake Priyadarshini RO Treatment', floor: 1, col: 3.5, row: 3, width: 2.5, height: 2, temp: 16.8, powerKw: 7.4, occupancy: 0, status: 'Nominal', equipment: ['Reverse Osmosis Membranes', 'UV Sterilizer', 'Trace Heated Inflow Manifold'] },
    { id: 'mtr-med', name: 'Trauma & Medical Bay', floor: 1, col: 6, row: 4, width: 3, height: 2, temp: 22.0, powerKw: 3.5, occupancy: 1, status: 'Nominal', equipment: ['3 Intensive Care Cots', 'Hyperbaric Chamber', 'Defibrillator & ECG'] },
    { id: 'mtr-storage', name: 'Cold Logistics & Supply Depot', floor: 1, col: 0, row: 4.5, width: 3.5, height: 2.5, temp: 4.2, powerKw: 1.8, occupancy: 0, status: 'Nominal', equipment: ['Heavy Racks', 'Survival Rations Pallets', 'Traverse Spare Kits'] }
  ];

  const maitriRoomsFloor2: RoomCutaway[] = [
    { id: 'mtr-living-1', name: 'Commander Quarters 101', floor: 2, col: 0, row: 0, width: 2, height: 1.8, temp: 20.5, powerKw: 1.2, occupancy: 1, status: 'Nominal', equipment: ['Single Berth', 'Study Desk', 'Convector Radiator'] },
    { id: 'mtr-living-2', name: 'Science Lead Quarters 102', floor: 2, col: 2, row: 0, width: 2, height: 1.8, temp: 20.2, powerKw: 1.2, occupancy: 1, status: 'Nominal', equipment: ['Single Berth', 'Study Desk', 'Convector Radiator'] },
    { id: 'mtr-living-3', name: 'Power Eng Quarters 103', floor: 2, col: 4, row: 0, width: 2, height: 1.8, temp: 21.0, powerKw: 1.3, occupancy: 1, status: 'Nominal', equipment: ['Single Berth', 'Study Desk', 'Convector Radiator'] },
    { id: 'mtr-living-4', name: 'Traverse Pilot Quarters 104', floor: 2, col: 6, row: 0, width: 2, height: 1.8, temp: 19.8, powerKw: 1.1, occupancy: 1, status: 'Nominal', equipment: ['Single Berth', 'Study Desk', 'Convector Radiator'] },
    { id: 'mtr-galley', name: 'Commercial Galley / Kitchen', floor: 2, col: 0, row: 2, width: 3.5, height: 2.5, temp: 23.4, powerKw: 18.2, occupancy: 2, status: 'Nominal', equipment: ['Induction Cooktops', 'Steam Combi Oven', 'Cold Storage Cistern'] },
    { id: 'mtr-mess', name: 'Expedition Dining Mess', floor: 2, col: 3.5, row: 2, width: 4.5, height: 3, temp: 21.2, powerKw: 4.8, occupancy: 8, status: 'Nominal', equipment: ['4 Dining Benches (24 Seats)', 'Hot Beverage Station', 'Mission Briefing Screen'] },
    { id: 'mtr-rec', name: 'Polar Recreation Lounge', floor: 2, col: 0, row: 4.5, width: 4, height: 2.5, temp: 20.8, powerKw: 2.4, occupancy: 3, status: 'Nominal', equipment: ['Modular Couches', 'Satellite IPTV', 'Polar Research Library'] },
    { id: 'mtr-gym', name: 'Physical Conditioning Gym', floor: 2, col: 4, row: 5, width: 3, height: 2, temp: 18.6, powerKw: 3.1, occupancy: 1, status: 'Nominal', equipment: ['Treadmill', 'Rowing Ergometer', 'Free Weights Rack'] },
    { id: 'mtr-bath', name: 'Ablution & Laundry Module', floor: 2, col: 7, row: 4, width: 2, height: 3, temp: 22.5, powerKw: 9.5, occupancy: 1, status: 'Nominal', equipment: ['6 Low-Flow Shower Stalls', 'Greywater Heat Recycler', 'Industrial Washers'] }
  ];

  // 15+ Walkable Rooms for Bharati Container Complex
  const bharatiRoomsFloor1: RoomCutaway[] = [
    { id: 'bhr-atrium', name: 'Central Glazed Atrium', floor: 1, col: 2, row: 1.5, width: 4, height: 3, temp: 21.0, powerKw: 5.5, occupancy: 3, status: 'Nominal', equipment: ['Triple-Pane Skylight', 'Living Plant Bio-Wall', 'Inter-Container Walkway'] },
    { id: 'bhr-cmd', name: 'Operations & SCADA Command', floor: 1, col: 0, row: 0, width: 3.5, height: 2.5, temp: 20.4, powerKw: 16.8, occupancy: 5, status: 'Nominal', equipment: ['8 SCADA Consoles', 'Video Matrix Wall', 'VSAT Auto-Tracking Terminal'] },
    { id: 'bhr-chp', name: 'Co-Gen Power Room (3x CHP)', floor: 1, col: 6, row: 0, width: 3.5, height: 3, temp: 29.8, powerKw: 68.4, occupancy: 1, status: 'Warning', vulnerabilityNote: 'CHP Unit 1 thermal diverter damper oscillation', equipment: ['3x Combined Heat & Power Gensets', 'Plate Heat Exchanger', 'Glycol Loop Diverter'] },
    { id: 'bhr-lab', name: 'Multidisciplinary Science Lab', floor: 1, col: 0, row: 2.5, width: 4, height: 3, temp: 19.8, powerKw: 12.0, occupancy: 4, status: 'Nominal', equipment: ['6 Workbenches', 'Laminar Flow Hood', 'Mass Spectrometer', 'Cryo-Freezers (-80°C)'] },
    { id: 'bhr-datacenter', name: 'Micro Data Center', floor: 1, col: 4, row: 0, width: 2, height: 2, temp: 16.5, powerKw: 10.2, occupancy: 0, status: 'Nominal', equipment: ['2x 42U Server Cabinets', 'SAN Storage', 'Inergen Fire Suppression'] },
    { id: 'bhr-ro', name: 'Seawater RO Desalination', floor: 1, col: 6, row: 3, width: 3, height: 2.5, temp: 17.5, powerKw: 14.5, occupancy: 0, status: 'Nominal', equipment: ['High-Pressure RO Pumps', 'Seawater Pre-Filtration', 'Potable Water Buffers'] },
    { id: 'bhr-med', name: 'Advanced Surgical Infirmary', floor: 1, col: 0, row: 5.5, width: 3.5, height: 2, temp: 22.2, powerKw: 4.8, occupancy: 1, status: 'Nominal', equipment: ['Operating Table', 'Digital X-Ray', 'Sterilization Autoclave'] },
    { id: 'bhr-workshop', name: 'Mechanical & Fabrication Bay', floor: 1, col: 4, row: 4.5, width: 4, height: 3, temp: 18.0, powerKw: 9.6, occupancy: 2, status: 'Nominal', equipment: ['CNC Lathe', 'TIG Welder', 'Hydraulic Press', 'PistenBully Parts'] }
  ];

  const bharatiRoomsFloor2: RoomCutaway[] = [
    { id: 'bhr-living-1', name: 'Executive Suite 201', floor: 2, col: 0, row: 0, width: 2.5, height: 2, temp: 20.8, powerKw: 1.4, occupancy: 1, status: 'Nominal', equipment: ['Ensuite Module', 'Work Desk', 'Triple Glazed Window'] },
    { id: 'bhr-living-2', name: 'Senior Scientist Suite 202', floor: 2, col: 2.5, row: 0, width: 2.5, height: 2, temp: 20.6, powerKw: 1.4, occupancy: 1, status: 'Nominal', equipment: ['Ensuite Module', 'Work Desk', 'Triple Glazed Window'] },
    { id: 'bhr-living-3', name: 'Lead Engineer Suite 203', floor: 2, col: 5, row: 0, width: 2.5, height: 2, temp: 21.0, powerKw: 1.5, occupancy: 1, status: 'Nominal', equipment: ['Ensuite Module', 'Work Desk', 'Triple Glazed Window'] },
    { id: 'bhr-living-4', name: 'Visiting Researcher Suite 204', floor: 2, col: 7.5, row: 0, width: 2, height: 2, temp: 20.2, powerKw: 1.2, occupancy: 1, status: 'Nominal', equipment: ['Ensuite Module', 'Work Desk', 'Triple Glazed Window'] },
    { id: 'bhr-mess', name: 'Panoramic Dining Hall', floor: 2, col: 0, row: 2, width: 5.5, height: 3.5, temp: 21.5, powerKw: 6.2, occupancy: 14, status: 'Nominal', equipment: ['8 Dining Tables (48 seats)', 'Buffet Line', 'Thala Fjord Vista Windows'] },
    { id: 'bhr-kitchen', name: 'Commercial Catering Galley', floor: 2, col: 5.5, row: 2, width: 4, height: 3.5, temp: 24.2, powerKw: 22.4, occupancy: 3, status: 'Nominal', equipment: ['Combi Steamer', 'Bake Oven', 'Walk-In Deep Freezer'] },
    { id: 'bhr-rec', name: 'Fjord Panorama Lounge', floor: 2, col: 0, row: 5.5, width: 4.5, height: 2.5, temp: 21.0, powerKw: 3.2, occupancy: 5, status: 'Nominal', equipment: ['Panoramic Loungers', 'Audio-Visual Theatre', 'Polar Library'] },
    { id: 'bhr-gym', name: 'Polar Wellness Gym & Sauna', floor: 2, col: 4.5, row: 5.5, width: 3.5, height: 2.5, temp: 22.8, powerKw: 12.0, occupancy: 2, status: 'Nominal', equipment: ['Finnish Cedar Sauna', 'Cardio Treadmills', 'Shower Suites'] },
    { id: 'bhr-sauna', name: 'Cedar Wood Sauna Module', floor: 2, col: 8, row: 5.5, width: 1.5, height: 2.5, temp: 78.5, powerKw: 8.0, occupancy: 2, status: 'Nominal', equipment: ['Electric Stone Heater', 'Cedar Benches', 'Thermometer'] }
  ];

  const currentRooms = activeStation === 'maitri'
    ? (selectedFloor === 1 ? maitriRoomsFloor1 : maitriRoomsFloor2)
    : (selectedFloor === 1 ? bharatiRoomsFloor1 : bharatiRoomsFloor2);

  const handleExportPng = () => {
    alert(`Exporting 2.5D Isometric Cutaway Blueprint for ${station.name} (Floor ${selectedFloor}) as PNG...`);
  };

  return (
    <div className="bg-[#060B14] border border-[#1A2533] rounded-xl overflow-hidden flex flex-col justify-between">
      {/* 2.5D CONTROLS HEADER */}
      <div className="p-4 bg-[#0A121E] border-b border-[#1A2533] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#00E0C6]/20 border border-[#00E0C6]/40 flex items-center justify-center text-[#00E0C6]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E8EEF4] uppercase tracking-wider">
              2.5D Isometric Cutaway Twin · {station.name}
            </h3>
            <p className="text-[10px] text-[#6B7A8F]">
              Technical architectural cutaway showing internal rooms, live thermal loops, and power loads
            </p>
          </div>
        </div>

        {/* Floor Switcher & Layers Toggle */}
        <div className="flex items-center gap-3">
          {/* Floor 1 vs Floor 2 */}
          <div className="flex items-center bg-[#060B14] p-1 rounded-lg border border-[#1A2533]">
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                selectedFloor === 1 ? 'bg-[#00E0C6] text-[#060B14]' : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              LEVEL 1 (OPS)
            </button>
            <button
              onClick={() => setSelectedFloor(2)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                selectedFloor === 2 ? 'bg-[#00E0C6] text-[#060B14]' : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              LEVEL 2 (LIVING)
            </button>
          </div>

          {/* Toggle Room Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
              showLabels ? 'bg-[#00E0C6]/20 border-[#00E0C6] text-[#00E0C6]' : 'border-[#1A2533] text-[#6B7A8F]'
            }`}
          >
            Labels
          </button>

          {/* Toggle Telemetry */}
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
              showTelemetry ? 'bg-[#00E0C6]/20 border-[#00E0C6] text-[#00E0C6]' : 'border-[#1A2533] text-[#6B7A8F]'
            }`}
          >
            Telemetry
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded border border-[#1A2533]">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
              className="p-1 text-[#6B7A8F] hover:text-[#00E0C6]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="p-1 text-[#6B7A8F] hover:text-[#00E0C6]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-[#6B7A8F] hover:text-[#00E0C6]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportPng}
            className="px-2.5 py-1 bg-[#060B14] hover:bg-slate-800 text-xs text-[#00E0C6] border border-[#00E0C6]/40 rounded flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* ISOMETRIC BLUEPRINT VIEWPORT */}
      <div className="relative p-6 overflow-hidden min-h-[500px] flex items-center justify-center bg-[radial-gradient(#1A2533_1px,transparent_1px)] [background-size:24px_24px]">
        {/* ISOMETRIC TRANSFORM WRAPPER */}
        <div 
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) rotateX(45deg) rotateZ(-30deg)`,
            transformStyle: 'preserve-3d',
            width: '740px',
            height: '480px'
          }}
        >
          {/* Base Foundation Slab with 3D Extrusion */}
          <div 
            className="absolute inset-0 bg-[#0A121E]/90 border-2 border-[#00E0C6]/50 shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            style={{
              boxShadow: '10px 10px 0px #060B14, 20px 20px 0px #03060A'
            }}
          >
            {/* GRID OF ROOM CUTAWAYS */}
            {currentRooms.map(room => {
              const isSelected = activeRoom?.id === room.id;
              const statusColor = room.status === 'Warning' ? '#FFB020' : room.status === 'Critical' ? '#FF3B47' : '#00E0C6';

              // Map grid coordinates to percentages
              const left = (room.col / 10) * 100;
              const top = (room.row / 8) * 100;
              const widthPct = (room.width / 10) * 100;
              const heightPct = (room.height / 8) * 100;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setActiveRoom(room);
                    if (onRoomSelect) onRoomSelect(room);
                  }}
                  className={`absolute p-2.5 cursor-pointer transition-all border-2 rounded ${
                    isSelected ? 'ring-2 ring-white scale-[1.02] z-20' : 'hover:border-white z-10'
                  }`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    backgroundColor: isSelected ? 'rgba(0, 224, 198, 0.25)' : 'rgba(10, 18, 30, 0.85)',
                    borderColor: statusColor,
                    transform: isSelected ? 'translateZ(15px)' : 'translateZ(0px)'
                  }}
                >
                  {/* Floating room header */}
                  {showLabels && (
                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                      <span className="font-bold text-[10px] text-[#E8EEF4] truncate uppercase tracking-wider">
                        {room.name}
                      </span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        room.status === 'Warning' ? 'bg-[#FFB020] animate-pulse' : 'bg-[#3EE07F]'
                      }`} />
                    </div>
                  )}

                  {/* Telemetry metrics overlays */}
                  {showTelemetry && (
                    <div className="mt-2 space-y-1 font-mono text-[9px]">
                      <div className="flex items-center justify-between text-[#00FFFF]">
                        <span className="flex items-center gap-1 opacity-75">
                          <Thermometer className="w-2.5 h-2.5" />
                          <span>Temp</span>
                        </span>
                        <span className="font-bold">{room.temp}°C</span>
                      </div>

                      <div className="flex items-center justify-between text-[#FFD700]">
                        <span className="flex items-center gap-1 opacity-75">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Load</span>
                        </span>
                        <span className="font-bold">{room.powerKw} kW</span>
                      </div>

                      <div className="flex items-center justify-between text-[#3EE07F]">
                        <span className="flex items-center gap-1 opacity-75">
                          <Users className="w-2.5 h-2.5" />
                          <span>Crew</span>
                        </span>
                        <span className="font-bold">{room.occupancy}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Room Detail Drawer (In-viewport overlay) */}
        {activeRoom && (
          <div className="absolute bottom-4 right-4 z-30 max-w-sm bg-[#0A121E]/95 backdrop-blur-md border border-[#00E0C6]/50 rounded-xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  activeRoom.status === 'Warning' ? 'bg-[#FFB020] animate-ping' : 'bg-[#3EE07F]'
                }`} />
                <h4 className="text-xs font-bold text-[#E8EEF4] uppercase">
                  {activeRoom.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveRoom(null)}
                className="text-xs text-[#6B7A8F] hover:text-[#E8EEF4]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] text-center">
                <span className="text-[#6B7A8F] block">Temperature</span>
                <span className="text-[#00FFFF] font-bold">{activeRoom.temp}°C</span>
              </div>
              <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] text-center">
                <span className="text-[#6B7A8F] block">Power Load</span>
                <span className="text-[#FFD700] font-bold">{activeRoom.powerKw} kW</span>
              </div>
              <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] text-center">
                <span className="text-[#6B7A8F] block">Personnel</span>
                <span className="text-[#3EE07F] font-bold">{activeRoom.occupancy}</span>
              </div>
            </div>

            {activeRoom.vulnerabilityNote && (
              <div className="p-2 bg-[#FFB020]/15 border border-[#FFB020]/40 rounded text-[10px] text-[#FFB020]">
                ⚠️ <strong>Thermal Anomaly:</strong> {activeRoom.vulnerabilityNote}
              </div>
            )}

            <div>
              <span className="text-[10px] text-[#6B7A8F] uppercase font-semibold block mb-1">
                Monitored Subsystems & Equipment:
              </span>
              <div className="flex flex-wrap gap-1">
                {activeRoom.equipment.map((eq, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#060B14] border border-[#1A2533] text-[9px] rounded text-slate-300">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR WITH LEGEND */}
      <div className="p-3 bg-[#0A121E] border-t border-[#1A2533] flex items-center justify-between text-[11px] text-[#6B7A8F]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#00E0C6]" />
            <span>Nominal Operation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#FFB020]" />
            <span>Warning (Thermal/Load Anomaly)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#FF3B47]" />
            <span>Critical Incident</span>
          </span>
        </div>
        <span className="font-mono text-[#00E0C6]">
          Scale: 1:50 Architectural Metric CAD
        </span>
      </div>
    </div>
  );
};
