/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Water Source & Iceberg Tracking Modal Component
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { WaterBodyData } from './types';
import { TRACKED_ICEBERGS } from './WaterData';
import { 
  Droplet, 
  Thermometer, 
  Layers, 
  Waves, 
  Eye, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Activity,
  Play,
  RotateCcw
} from 'lucide-react';

interface WaterModalProps {
  waterBody: WaterBodyData;
  onClose: () => void;
  onEnterUnderwaterView: () => void;
}

export const WaterModal: React.FC<WaterModalProps> = ({
  waterBody,
  onClose,
  onEnterUnderwaterView
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'icebergs' | 'timelapse'>('telemetry');
  const [timelapseMonth, setTimelapseMonth] = useState<number>(3); // 1 to 12
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Ice thickness seasonal curve
  const currentIceThickness = Math.round(
    waterBody.iceThicknessCm * (0.4 + 0.6 * Math.sin(((timelapseMonth + 2) / 12) * Math.PI))
  );

  const handlePlayTimelapse = () => {
    setIsPlayingTimelapse(true);
    let m = 1;
    const interval = setInterval(() => {
      setTimelapseMonth(m);
      m++;
      if (m > 12) {
        clearInterval(interval);
        setIsPlayingTimelapse(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A121E] border-2 border-[#00FFFF]/50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FFFF]/15 border border-[#00FFFF]/40 flex items-center justify-center text-[#00FFFF]">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  {waterBody.name}
                </h3>
                <span className="px-2 py-0.5 bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 text-[10px] font-mono rounded font-bold uppercase">
                  {waterBody.type}
                </span>
              </div>
              <p className="text-xs text-[#6B7A8F] mt-0.5 font-mono">
                Coordinates: {waterBody.coordinates}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-[#6B7A8F] hover:text-[#FFFFFF] hover:bg-[#1A2533] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center px-6 pt-3 bg-[#060B14] border-b border-[#1A2533] gap-2">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'telemetry' 
                ? 'bg-[#0A121E] text-[#00FFFF] border-t-2 border-x-2 border-[#00FFFF]/50' 
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Hydro-Acoustic Telemetry
          </button>

          {waterBody.station === 'bharati' && (
            <button
              onClick={() => setActiveTab('icebergs')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === 'icebergs' 
                  ? 'bg-[#0A121E] text-[#00FFFF] border-t-2 border-x-2 border-[#00FFFF]/50' 
                  : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              Iceberg Tracking Matrix (4 Tracked)
            </button>
          )}

          <button
            onClick={() => setActiveTab('timelapse')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'timelapse' 
                ? 'bg-[#0A121E] text-[#00FFFF] border-t-2 border-x-2 border-[#00FFFF]/50' 
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Seasonal Freeze Time-Lapse
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#E8EEF4]">
          
          {activeTab === 'telemetry' && (
            <>
              {/* PRIMARY 4-CARD METRIC STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Water Temperature</span>
                  <div className="text-xl font-mono font-bold text-[#00FFFF] mt-1">{waterBody.surfaceTemp}°C</div>
                  <span className="text-[10px] text-[#3EE07F]">Sub-Surface Sensor</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Ice Thickness</span>
                  <div className="text-xl font-mono font-bold text-[#FFD700] mt-1">{waterBody.iceThicknessCm} cm</div>
                  <span className="text-[10px] text-[#FFB020]">Shore: 45cm | Center: 82cm</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Water Purity</span>
                  <div className="text-xl font-mono font-bold text-[#3EE07F] mt-1">{waterBody.waterPurityPct}%</div>
                  <span className="text-[10px] text-[#3EE07F]">pH {waterBody.pH} (Potable Grade)</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Supply Flow Rate</span>
                  <div className="text-xl font-mono font-bold text-[#4A9EFF] mt-1">{waterBody.flowRateLpm} L/min</div>
                  <span className="text-[10px] text-[#00FFFF]">Heated Trace Line: ACTIVE</span>
                </div>
              </div>

              {/* TECHNICAL DESCRIPTION & DEPTH METRICS */}
              <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
                  <span className="font-bold uppercase tracking-wider text-[#E8EEF4] text-xs">
                    Reservoir Morphometry & Hydro-Acoustic State
                  </span>
                  <span className="text-[11px] font-mono text-[#00FFFF]">
                    Volume: {waterBody.volumeM3.toLocaleString()} m³
                  </span>
                </div>

                <p className="text-xs text-[#8BA1B7] leading-relaxed">
                  {waterBody.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono">
                  <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                    <span className="text-[#6B7A8F] block">Bathymetric Depth (Center):</span>
                    <strong className="text-[#00FFFF] text-sm">{waterBody.depthCenterM} meters</strong>
                  </div>

                  <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                    <span className="text-[#6B7A8F] block">Freeze Horizon Window:</span>
                    <strong className="text-[#FFD700] text-sm">{waterBody.daysUntilFreezeEstimate} Days (Predicted)</strong>
                  </div>

                  <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                    <span className="text-[#6B7A8F] block">Surface Ice Fraction:</span>
                    <strong className="text-[#3EE07F] text-sm">{waterBody.iceCoveragePct}% Coverage</strong>
                  </div>
                </div>
              </div>

              {/* UNDERWATER FEATURES PREVIEW */}
              <div>
                <span className="text-[11px] font-bold text-[#6B7A8F] uppercase tracking-wider block mb-2">
                  Submerged Cryo-Features & Sensor Targets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {waterBody.underwaterHighlights.map((highlight, idx) => (
                    <div key={idx} className="p-2.5 bg-[#060B14] rounded-lg border border-[#1A2533] flex items-center gap-2.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-[#00FFFF]" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'icebergs' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase text-[#E8EEF4]">
                    Thala Fjord Calved Iceberg Radar Array
                  </h4>
                  <p className="text-[11px] text-[#6B7A8F]">
                    Acoustic Doppler & Coastal X-Band Radar tracking four tabular and pinnacle bergs
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#3EE07F]/20 text-[#3EE07F] font-mono text-xs font-bold rounded">
                  4 Active Trackers
                </span>
              </div>

              <div className="space-y-3">
                {TRACKED_ICEBERGS.map(berg => (
                  <div key={berg.id} className="p-3.5 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#00FFFF]">{berg.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          berg.hazardLevel.includes('Critical') 
                            ? 'bg-[#FF3B47]/20 text-[#FF3B47] border border-[#FF3B47]/40 animate-pulse'
                            : 'bg-[#3EE07F]/20 text-[#3EE07F]'
                        }`}>
                          {berg.hazardLevel}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#FFD700]">
                        Dist: {berg.distanceFromFjordM}m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300">
                      <div>Mass: <strong className="text-[#E8EEF4]">{berg.massTonnes.toLocaleString()} t</strong></div>
                      <div>Drift: <strong className="text-[#00FFFF]">{berg.driftSpeedKnots} kts</strong></div>
                      <div>Bearing: <strong className="text-[#FFD700]">{berg.driftDirectionDeg}° WNW</strong></div>
                      <div>Echo: <strong className="text-[#6B7A8F]">{berg.radarEchoSignature}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timelapse' && (
            <div className="space-y-5 p-4 bg-[#060B14] rounded-xl border border-[#1A2533]">
              <div className="flex items-center justify-between border-b border-[#1A2533] pb-3">
                <div>
                  <h4 className="font-bold text-xs uppercase text-[#E8EEF4]">
                    Annual Ice Accretion & Melt Time-Lapse Simulation
                  </h4>
                  <p className="text-[11px] text-[#6B7A8F]">
                    Thermodynamic congelation ice modeling driven by Stefan heat conduction law
                  </p>
                </div>
                <button
                  onClick={handlePlayTimelapse}
                  disabled={isPlayingTimelapse}
                  className="px-3 py-1.5 bg-[#00FFFF] hover:bg-[#00FFFF]/90 disabled:opacity-50 text-[#060B14] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 uppercase cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingTimelapse ? 'Playing 12-Month Cycle...' : 'Play Time-Lapse'}</span>
                </button>
              </div>

              {/* Slider Controller */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#6B7A8F]">Selected Month: <strong className="text-[#00FFFF]">{months[timelapseMonth - 1]}</strong></span>
                  <span className="text-[#FFD700]">Calculated Ice Cap: <strong>{currentIceThickness} cm</strong></span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={timelapseMonth}
                  onChange={(e) => setTimelapseMonth(parseInt(e.target.value))}
                  className="w-full h-2 accent-[#00FFFF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6B7A8F] font-mono">
                  {months.map((m, idx) => (
                    <span key={m} className={idx + 1 === timelapseMonth ? 'text-[#00FFFF] font-bold' : ''}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual Depth Cutaway Bar */}
              <div className="h-16 w-full rounded-lg bg-[#001830] border border-[#00FFFF]/30 relative overflow-hidden flex items-end">
                {/* Ice layer */}
                <div 
                  className="w-full bg-gradient-to-b from-[#E0F4FF] to-[#A0D8EF] transition-all duration-300 border-b-2 border-white/80 flex items-center justify-center font-mono text-[10px] font-bold text-slate-800"
                  style={{ height: `${Math.min(100, (currentIceThickness / 120) * 100)}%` }}
                >
                  SOLID ICE CAP ({currentIceThickness} CM)
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-[#1A2533] bg-[#060B14] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-[#6B7A8F] font-mono">
            National Polar Data Center (NPDC) Real-Time Hydro Stream
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0A121E] hover:bg-slate-800 text-[#E8EEF4] text-xs font-semibold rounded-lg border border-[#1A2533] cursor-pointer"
            >
              Close
            </button>

            {/* EXPERIENCE 3: UNDERWATER CAMERA VIEW BUTTON */}
            <button
              onClick={() => {
                onClose();
                onEnterUnderwaterView();
              }}
              className="px-5 py-2 bg-gradient-to-r from-[#00FFFF] to-[#4A9EFF] hover:from-[#00FFFF]/90 hover:to-[#4A9EFF]/90 text-[#060B14] text-xs font-bold rounded-lg transition-all shadow-md shadow-[#00FFFF]/20 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Submerge to Underwater View</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
