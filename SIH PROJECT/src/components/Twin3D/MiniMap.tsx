/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Radar Mini-Map Navigation Component
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React from 'react';
import { StationId } from '../../types';
import { Compass, Navigation, X } from 'lucide-react';

interface MiniMapProps {
  activeStation: StationId;
  playerPos: [number, number, number];
  playerRotY: number;
  onTeleportTo: (coords: [number, number, number]) => void;
  onClose?: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  activeStation,
  playerPos,
  playerRotY,
  onTeleportTo,
  onClose
}) => {
  // Convert 3D world coords to 0-100% minimap coordinates
  // Station bounds roughly -100 to +100
  const toMapPercent = (coord: number) => {
    return Math.max(8, Math.min(92, 50 + (coord / 140) * 45));
  };

  const markers = activeStation === 'maitri' ? [
    { label: 'Main Station', coords: [0, 8, 0] as [number, number, number], color: '#00E0C6' },
    { label: 'Lake Priyadarshini', coords: [45, 2, -20] as [number, number, number], color: '#00FFFF' },
    { label: 'Fuel Farm', coords: [-35, 4, -22] as [number, number, number], color: '#FFB020' },
    { label: 'Helipad', coords: [55, 3, -25] as [number, number, number], color: '#FFD700' },
    { label: 'PistenBully PB-01', coords: [18, 2, 25] as [number, number, number], color: '#FF3B47' }
  ] : [
    { label: 'Bharati Complex', coords: [0, 9, 0] as [number, number, number], color: '#00E0C6' },
    { label: 'Thala Fjord', coords: [-80, 2, 0] as [number, number, number], color: '#00FFFF' },
    { label: 'Quilty Bay', coords: [-45, 1, 35] as [number, number, number], color: '#4A9EFF' },
    { label: 'CHP Cogeneration', coords: [32, 4, -18] as [number, number, number], color: '#FFB020' },
    { label: 'Seawater Pump House', coords: [-55, 3, 24] as [number, number, number], color: '#3EE07F' },
    { label: 'Helipad', coords: [65, 3, -35] as [number, number, number], color: '#FFD700' }
  ];

  return (
    <div className="absolute top-4 right-4 z-20 w-48 h-48 rounded-2xl bg-[#060B14]/90 backdrop-blur-md border border-[#00E0C6]/50 shadow-2xl p-2.5 flex flex-col justify-between overflow-hidden animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6B7A8F] px-1 border-b border-[#1A2533] pb-1.5">
        <span className="text-[#00E0C6] uppercase tracking-wider">{activeStation} RADAR</span>
        <div className="flex items-center gap-2">
          <span>N ▲</span>
          {onClose && (
            <button
              onClick={onClose}
              title="Close Radar Mini-Map"
              className="p-0.5 text-[#6B7A8F] hover:text-[#FF3B47] hover:bg-[#1A2533] rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RADAR CANVAS GRID */}
      <div className="relative flex-1 m-1 rounded-xl bg-[#03060A] border border-[#1A2533] overflow-hidden">
        {/* Radar concentric sweep rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-[#00E0C6]" />
          <div className="w-28 h-28 rounded-full border border-[#00E0C6]" />
          <div className="w-full h-full rounded-full border border-[#00E0C6]" />
        </div>

        {/* POI Markers */}
        {markers.map((m, idx) => (
          <button
            key={idx}
            onClick={() => onTeleportTo(m.coords)}
            title={`Teleport to ${m.label}`}
            className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 cursor-pointer shadow-sm"
            style={{
              left: `${toMapPercent(m.coords[0])}%`,
              top: `${toMapPercent(m.coords[2])}%`,
              backgroundColor: m.color
            }}
          />
        ))}

        {/* PLAYER DOT & CONE */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100"
          style={{
            left: `${toMapPercent(playerPos[0])}%`,
            top: `${toMapPercent(playerPos[2])}%`,
            transform: `translate(-50%, -50%) rotate(${(playerRotY * 180) / Math.PI}deg)`
          }}
        >
          {/* Field of View Cone */}
          <div 
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-[#00FFFF]/40 mb-[-2px] mx-auto"
          />
          {/* Central dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF] border border-[#00FFFF] shadow-[0_0_8px_#00FFFF] mx-auto" />
        </div>
      </div>

      <div className="text-[9px] text-[#6B7A8F] font-mono text-center truncate">
        {playerPos[0].toFixed(0)}m, {playerPos[2].toFixed(0)}m · Click Dot to Fly
      </div>
    </div>
  );
};
