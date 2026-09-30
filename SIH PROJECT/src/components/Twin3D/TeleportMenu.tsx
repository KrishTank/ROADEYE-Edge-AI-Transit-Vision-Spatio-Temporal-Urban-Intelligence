/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Instant Teleportation HUD Navigator (Hotkey 'T')
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { TeleportTarget } from './types';
import { StationId } from '../../types';
import { Navigation, Layers, Waves, Truck, X, Sparkles, Compass } from 'lucide-react';

interface TeleportMenuProps {
  activeStation: StationId;
  onClose: () => void;
  onSelectTarget: (target: TeleportTarget) => void;
}

export const TELEPORT_TARGETS: TeleportTarget[] = [
  {
    id: 'tp-maitri-aerial',
    label: 'Maitri Aerial Overview (God View)',
    station: 'maitri',
    category: 'Overview',
    camPos: [35, 30, 50],
    lookAt: [0, 8, 0],
    mode: 'orbit'
  },
  {
    id: 'tp-maitri-interior',
    label: 'Maitri Walkable Command Center & Galley',
    station: 'maitri',
    category: 'Interior',
    camPos: [-6, 2.5, 5],
    lookAt: [-6, 2.5, 0],
    mode: 'walk'
  },
  {
    id: 'tp-lake-priyadarshini',
    label: 'Lake Priyadarshini Freshwater Shoreline',
    station: 'maitri',
    category: 'Water Source',
    camPos: [45, 6, -5],
    lookAt: [45, -1.8, -20],
    mode: 'orbit'
  },
  {
    id: 'tp-maitri-hangar',
    label: 'Maitri PistenBully & Snowmobile Depot',
    station: 'maitri',
    category: 'Fleet Hangar',
    camPos: [20, 5, 35],
    lookAt: [18, 1.8, 25],
    mode: 'orbit'
  },
  {
    id: 'tp-bharati-aerial',
    label: 'Bharati Complex Aerial Overview',
    station: 'bharati',
    category: 'Overview',
    camPos: [40, 32, 55],
    lookAt: [0, 9, 0],
    mode: 'orbit'
  },
  {
    id: 'tp-bharati-interior',
    label: 'Bharati Skylight Atrium & SCADA Room',
    station: 'bharati',
    category: 'Interior',
    camPos: [0, 2.5, 6],
    lookAt: [0, 2.5, 0],
    mode: 'walk'
  },
  {
    id: 'tp-thala-fjord',
    label: 'Thala Fjord Marine Water & Iceberg Ridge',
    station: 'bharati',
    category: 'Water Source',
    camPos: [-75, 12, 10],
    lookAt: [-120, 0, 0],
    mode: 'orbit'
  },
  {
    id: 'tp-quilty-bay',
    label: 'Quilty Bay Marine Haven & Zodiac Dock',
    station: 'bharati',
    category: 'Water Source',
    camPos: [-35, 6, 45],
    lookAt: [-45, 0.5, 35],
    mode: 'orbit'
  }
];

export const TeleportMenu: React.FC<TeleportMenuProps> = ({
  activeStation,
  onClose,
  onSelectTarget
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A121E] border-2 border-[#00E0C6]/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-[#00E0C6]" />
            <h3 className="text-sm font-bold text-[#E8EEF4] uppercase tracking-wider">
              Instant Teleportation Matrix (Hot-Key: 'T')
            </h3>
          </div>
          <button onClick={onClose} className="text-[#6B7A8F] hover:text-[#FFFFFF] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LIST */}
        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {TELEPORT_TARGETS.map(target => (
            <button
              key={target.id}
              onClick={() => {
                onSelectTarget(target);
                onClose();
              }}
              className="w-full p-3.5 bg-[#060B14] hover:bg-[#1A2533] border border-[#1A2533] hover:border-[#00E0C6] rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E0C6] group-hover:animate-ping" />
                <div>
                  <div className="font-bold text-xs text-[#E8EEF4] group-hover:text-[#00E0C6]">
                    {target.label}
                  </div>
                  <span className="text-[10px] text-[#6B7A8F] font-mono">
                    Station: {target.station.toUpperCase()} · Mode: {target.mode.toUpperCase()}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-[#00E0C6]/10 text-[#00E0C6] border border-[#00E0C6]/30 text-[10px] rounded font-bold uppercase font-mono">
                {target.category}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-[#1A2533] bg-[#060B14] text-[10px] font-mono text-[#6B7A8F] text-center">
          Press 'T' anytime in 3D viewport to summon instant waypoint teleport
        </div>

      </div>
    </div>
  );
};
