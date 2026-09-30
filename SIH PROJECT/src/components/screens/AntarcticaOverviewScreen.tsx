/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 6: Antarctica Overview (All Four Indian Research Stations)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { Compass, Globe, Radio, Shield, Signal, Wind, Zap } from 'lucide-react';

interface AntarcticaOverviewScreenProps {
  onStationSelect: (station: StationId) => void;
}

export const AntarcticaOverviewScreen: React.FC<AntarcticaOverviewScreenProps> = ({ onStationSelect }) => {
  const stationList = Object.values(STATIONS_DATA);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Antarctica Continental Overview · Indian Polar Research Axis
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Comprehensive footprint across Central Dronning Maud Land (Maitri & Dakshin Gangotri) and Larsemann Hills (Bharati & Maitri-II).
        </p>
      </div>

      {/* 4 STATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stationList.map(st => {
          const isOperational = st.status === 'Operational';
          const isHistorical = st.status === 'Historical';
          const isPlanned = st.status === 'Planned';

          return (
            <div
              key={st.id}
              onClick={() => onStationSelect(st.id)}
              className="p-5 bg-[#0A121E] rounded-xl border border-[#1A2533] hover:border-[#00E0C6] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                    isOperational ? 'bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/40' :
                    isHistorical ? 'bg-[#6B7A8F]/20 text-[#6B7A8F] border border-[#6B7A8F]/40' :
                    'bg-[#4A9EFF]/20 text-[#4A9EFF] border border-[#4A9EFF]/40'
                  }`}>
                    {st.status}
                  </span>
                  <span className="text-xs font-mono text-[#6B7A8F]">Est. {st.builtYear}</span>
                </div>

                <h3 className="text-base font-bold text-[#E8EEF4] mt-3">
                  {st.name}
                </h3>
                <div className="text-xs font-mono text-[#00E0C6] mt-0.5">
                  {st.latitude.toFixed(4)}°S, {st.longitude.toFixed(4)}°E
                </div>

                <p className="text-xs text-[#6B7A8F] mt-2">
                  {st.location}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1A2533] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#6B7A8F]">
                  <span>Capacity:</span>
                  <span className="font-mono text-[#E8EEF4] font-bold">{st.capacity} Berths</span>
                </div>
                <div className="flex justify-between text-[#6B7A8F]">
                  <span>Power Bus:</span>
                  <span className="font-mono text-[#E8EEF4] truncate max-w-[140px]">{st.powerConfig.split('(')[0]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* POLAR STEREOGRAPHIC MAP & RIGHT ATMOSPHERIC SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Polar Stereographic Map (8 cols) */}
        <div className="lg:col-span-8 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2533] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                Polar Stereographic Spatial Axis
              </h3>
              <p className="text-xs text-[#6B7A8F]">
                3,098 km inter-station baseline linking Maitri (Dronning Maud Land) to Bharati (Prydz Bay)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E0C6]">
              <Globe className="w-4 h-4" />
              <span>Datum: WGS84 South Polar (EPSG:3031)</span>
            </div>
          </div>

          {/* Interactive Continent Map Canvas */}
          <div className="relative w-full h-84 bg-[#060B14] rounded-lg mt-4 overflow-hidden border border-[#1A2533] flex items-center justify-center">
            {/* Concentric Polar Latitude Rings */}
            <div className="absolute w-72 h-72 rounded-full border border-dashed border-[#1A2533]" />
            <div className="absolute w-52 h-52 rounded-full border border-dashed border-[#1A2533]" />
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-[#1A2533]" />
            
            {/* South Pole Center */}
            <div className="absolute w-2 h-2 rounded-full bg-[#6B7A8F]" />
            <span className="absolute text-[9px] font-mono text-[#6B7A8F] mt-5">South Pole 90°S</span>

            {/* Maitri Node (NW sector) */}
            <div 
              onClick={() => onStationSelect('maitri')}
              className="absolute top-16 left-32 group cursor-pointer flex flex-col items-center"
            >
              <div className="w-4 h-4 rounded-full bg-[#00E0C6] shadow-[0_0_12px_#00E0C6] group-hover:scale-125 transition-transform" />
              <div className="bg-[#0A121E]/90 border border-[#00E0C6] text-[#00E0C6] font-mono text-[10px] font-bold px-2 py-0.5 rounded mt-1 shadow-lg">
                MAITRI (70°S, 11°E)
              </div>
            </div>

            {/* Bharati Node (E sector) */}
            <div 
              onClick={() => onStationSelect('bharati')}
              className="absolute top-28 right-28 group cursor-pointer flex flex-col items-center"
            >
              <div className="w-4 h-4 rounded-full bg-[#3EE07F] shadow-[0_0_12px_#3EE07F] group-hover:scale-125 transition-transform" />
              <div className="bg-[#0A121E]/90 border border-[#3EE07F] text-[#3EE07F] font-mono text-[10px] font-bold px-2 py-0.5 rounded mt-1 shadow-lg">
                BHARATI (69°S, 76°E)
              </div>
            </div>

            {/* Baseline Distance Line */}
            <div className="absolute top-28 left-44 right-40 h-[1px] bg-gradient-to-r from-[#00E0C6] to-[#3EE07F] border-b border-dashed border-white/30 rotate-12 flex items-center justify-center">
              <span className="bg-[#060B14] px-2 py-0.5 text-[10px] font-mono text-[#E8EEF4] border border-[#1A2533] rounded">
                Baseline: 3,098 km
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Atmospheric Dynamics & Link Budget (4 cols) */}
        <div className="lg:col-span-4 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 space-y-4">
          <div className="border-b border-[#1A2533] pb-3">
            <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
              Atmospheric & Carrier Link Budget
            </h3>
            <span className="text-xs text-[#6B7A8F]">
              Inter-station telemetry relay & geostationary look angles
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533]">
              <div className="text-[11px] font-bold text-[#E8EEF4] uppercase flex items-center justify-between">
                <span>VSAT Primary Satellite Link</span>
                <span className="text-[#3EE07F] font-mono">LOCK (8.8 dB)</span>
              </div>
              <p className="text-[11px] text-[#6B7A8F] mt-1">
                Ku-band carrier to GSAT-30 / NSS-12. Katabatic outage threshold at wind &gt; 150 km/h.
              </p>
            </div>

            <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533]">
              <div className="text-[11px] font-bold text-[#E8EEF4] uppercase flex items-center justify-between">
                <span>Iridium SBD Constellation</span>
                <span className="text-[#00E0C6] font-mono">STANDBY (100%)</span>
              </div>
              <p className="text-[11px] text-[#6B7A8F] mt-1">
                Short Burst Data packet payload (340 bytes MO, 270 bytes MT).
              </p>
            </div>

            <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533]">
              <div className="text-[11px] font-bold text-[#E8EEF4] uppercase flex items-center justify-between">
                <span>Ionospheric Scintillation</span>
                <span className="text-[#FFB020] font-mono">MODERATE (S4: 0.32)</span>
              </div>
              <p className="text-[11px] text-[#6B7A8F] mt-1">
                Solar flux F10.7 index: 148 sfu. GPS L1 carrier phase jitter within tolerance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
