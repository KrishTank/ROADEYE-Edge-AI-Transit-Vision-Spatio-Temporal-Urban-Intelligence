/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 5: Digital Twin Multi-Perspective Viewport (3D + 2.5D Isometric)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { ThreeTwinView, HotspotData } from '../ThreeTwinView';
import { Twin2_5D } from '../Twin3D/Twin2_5D';
import { AiPredictorState } from '../../services/aiPredictor';
import { STATIONS_DATA } from '../../data/stationConstants';
import { Box, Eye, Layers, ShieldAlert, Sparkles, Wind, Zap, Grid, Cuboid } from 'lucide-react';

interface DigitalTwinScreenProps {
  activeStation: StationId;
  onStationSelect: (station: StationId) => void;
  aiState: AiPredictorState;
  isAntarcticMode: boolean;
}

export const DigitalTwinScreen: React.FC<DigitalTwinScreenProps> = ({
  activeStation,
  onStationSelect,
  aiState,
  isAntarcticMode
}) => {
  const [twinPerspective, setTwinPerspective] = useState<'3D' | '2.5D'>('3D');
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);
  const station = STATIONS_DATA[activeStation];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
              {station.name} · Digital Twin Multi-Perspective Engine
            </h2>
            <span className="px-2 py-0.5 bg-[#00E0C6]/15 text-[#00E0C6] border border-[#00E0C6]/40 text-[10px] font-mono rounded font-bold uppercase">
              7 View Modes & 2.5D Cutaway
            </span>
          </div>
          <p className="text-xs text-[#6B7A8F] mt-0.5">
            100+ individually modeled structural, energy, vehicle, and atmospheric components with real-time SCADA bindings.
          </p>
        </div>

        {/* 3D vs 2.5D Mode Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#060B14] p-1 rounded-xl border border-[#1A2533]">
            <button
              onClick={() => setTwinPerspective('3D')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                twinPerspective === '3D'
                  ? 'bg-[#00E0C6] text-[#060B14] shadow-md shadow-[#00E0C6]/20 font-black'
                  : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              <Cuboid className="w-3.5 h-3.5" />
              <span>3D Spatial View</span>
            </button>

            <button
              onClick={() => setTwinPerspective('2.5D')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                twinPerspective === '2.5D'
                  ? 'bg-[#00E0C6] text-[#060B14] shadow-md shadow-[#00E0C6]/20 font-black'
                  : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2.5D Cutaway Blueprint</span>
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono font-bold text-[#00E0C6]">
              {activeStation === 'maitri' ? "70°45'52\"S, 11°44'03\"E" : "69°24'41\"S, 76°11'15\"E"}
            </div>
            <div className="text-[11px] text-[#6B7A8F]">
              Built {station.builtYear} · {station.location}
            </div>
          </div>
        </div>
      </div>

      {/* RENDER VIEWPORT: 3D or 2.5D */}
      {twinPerspective === '3D' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
          {/* Full 3D Viewport (9 cols) */}
          <div className="lg:col-span-9 h-[620px]">
            <ThreeTwinView
              activeStation={activeStation}
              onStationSelect={onStationSelect}
              aiState={aiState}
              isAntarcticMode={isAntarcticMode}
              onHotspotSelect={setActiveHotspot}
            />
          </div>

          {/* Right Sidebar: Active Component Diagnostics & Vulnerabilities (3 cols) */}
          <div className="lg:col-span-3 bg-[#0A121E] rounded-xl border border-[#1A2533] p-4 flex flex-col justify-between overflow-y-auto max-h-[620px]">
            <div className="space-y-4">
              <div className="border-b border-[#1A2533] pb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00E0C6] uppercase tracking-wider">
                  <Box className="w-4 h-4" />
                  <span>Station Twin Diagnostics</span>
                </div>
                <h3 className="text-sm font-bold text-[#E8EEF4] mt-1">
                  {activeStation === 'maitri' ? 'Maitri Infrastructure' : 'Bharati Container Complex'}
                </h3>
              </div>

              {/* Selected Hotspot Detail or Station Summary */}
              {activeHotspot ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#6B7A8F] uppercase font-semibold">Active Component</span>
                    <h4 className="text-sm font-bold text-[#E8EEF4]">{activeHotspot.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      activeHotspot.status === 'Warning' ? 'bg-[#FFB020]/20 text-[#FFB020]' : 'bg-[#3EE07F]/20 text-[#3EE07F]'
                    }`}>
                      {activeHotspot.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7A8F] leading-relaxed">
                    {activeHotspot.description}
                  </p>

                  {activeHotspot.vulnerabilityNote && (
                    <div className="p-2.5 bg-[#FF3B47]/10 border border-[#FF3B47]/30 rounded text-xs text-[#FF3B47]">
                      <strong>Vulnerability:</strong> {activeHotspot.vulnerabilityNote}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-[#1A2533]">
                    <div className="text-[11px] font-bold text-[#E8EEF4] uppercase">Live Telemetry</div>
                    {Object.entries(activeHotspot.telemetry).map(([k, v]) => (
                      <div key={k} className="p-2 bg-[#060B14] rounded border border-[#1A2533] flex justify-between text-xs">
                        <span className="text-[#6B7A8F]">{k}:</span>
                        <span className="font-mono text-[#00E0C6] font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-[#6B7A8F]">
                  <p>
                    Click on any 3D asset in the viewport (gensets, water pipeline, vehicles, rooms) to inspect real-time physics and telemetry.
                  </p>

                  <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-2">
                    <div className="text-[11px] font-bold text-[#E8EEF4] uppercase">Key Station Vulnerability</div>
                    <p className="text-[#FFB020] text-xs leading-relaxed">
                      {station.keyVulnerability}
                    </p>
                  </div>

                  <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-2">
                    <div className="text-[11px] font-bold text-[#E8EEF4] uppercase">Water Infrastructure</div>
                    <p className="text-xs text-[#E8EEF4]">
                      {station.waterSource}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1A2533] text-[11px] text-[#6B7A8F]">
              <div>Physics Mesh: Standard PBR + Shaders</div>
              <div>Three.js WebGL2: 60 FPS nominal</div>
            </div>
          </div>
        </div>
      ) : (
        /* 2.5D Isometric Cutaway Mode */
        <Twin2_5D activeStation={activeStation} />
      )}
    </div>
  );
};
