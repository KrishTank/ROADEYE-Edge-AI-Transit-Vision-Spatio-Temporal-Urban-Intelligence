/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 3: Local Environment & Ice Velocity Radar
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState, useEffect, useRef } from 'react';
import { StationId, WeatherTelemetry, SatellitePass } from '../../types';
import { fetchStationWeather } from '../../services/weatherService';
import { 
  Compass, 
  Eye, 
  Navigation, 
  Radio, 
  Satellite, 
  ShieldCheck, 
  Sun, 
  Thermometer, 
  Wind, 
  Maximize2, 
  Minimize2, 
  X, 
  Timer, 
  Volume2, 
  Play, 
  AlertTriangle 
} from 'lucide-react';

interface LocalEnvironmentScreenProps {
  activeStation: StationId;
}

export const LocalEnvironmentScreen: React.FC<LocalEnvironmentScreenProps> = ({ activeStation }) => {
  const [weather, setWeather] = useState<WeatherTelemetry | null>(null);
  const [activeLayer, setActiveLayer] = useState<'velocity' | 'crevasse' | 'elevation'>('velocity');

  // Auto-closing Radar State
  const [isRadarOpen, setIsRadarOpen] = useState(true);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number | null>(12); // Auto closes in 12s
  const [isAutoClosePaused, setIsAutoClosePaused] = useState(false);
  const [isTacticalModalOpen, setIsTacticalModalOpen] = useState(false);
  const [tacticalCountdown, setTacticalCountdown] = useState(10);
  const [radarSweepProgress, setRadarSweepProgress] = useState(0);

  useEffect(() => {
    fetchStationWeather(activeStation).then(setWeather);
  }, [activeStation]);

  // Main Radar Auto-Close Timer
  useEffect(() => {
    if (!isRadarOpen || autoCloseSeconds === null || isAutoClosePaused) return;

    if (autoCloseSeconds <= 0) {
      setIsRadarOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setAutoCloseSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRadarOpen, autoCloseSeconds, isAutoClosePaused]);

  // Tactical Fullscreen Modal Auto-Close Timer
  useEffect(() => {
    if (!isTacticalModalOpen) return;

    setTacticalCountdown(10);
    const interval = setInterval(() => {
      setTacticalCountdown(prev => {
        if (prev <= 1) {
          setIsTacticalModalOpen(false); // Closes on its own!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTacticalModalOpen]);

  // Play audio ping for radar
  const playRadarPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  const satellitePasses: SatellitePass[] = [
    {
      id: 'sat-01',
      satelliteName: 'NOAA-20 (Polar Orbiting MetSat)',
      azimuth: 142,
      elevation: 68,
      scheduledAt: '14 min',
      durationMin: 12,
      linkQuality: 'EXCELLENT',
      uplinkBand: 'Ku-Band (VSAT)'
    },
    {
      id: 'sat-02',
      satelliteName: 'Iridium NEXT-128',
      azimuth: 210,
      elevation: 44,
      scheduledAt: '38 min',
      durationMin: 8,
      linkQuality: 'EXCELLENT',
      uplinkBand: 'Iridium SBD'
    },
    {
      id: 'sat-03',
      satelliteName: 'Sentinel-1A (C-band SAR)',
      azimuth: 325,
      elevation: 79,
      scheduledAt: '2h 15m',
      durationMin: 14,
      linkQuality: 'MARGINAL',
      uplinkBand: 'Ku-Band (VSAT)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Local Cryosphere & Environment Telemetry
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Synthetic Aperture Radar (SAR) ice shelf velocity vectors, Automated Weather Station (AWS), and orbital overpasses.
        </p>
      </div>

      {/* 4 METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Surface Air Temp</span>
            <Thermometer className="w-5 h-5 text-[#FFB020]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#E8EEF4] mt-2">
            {weather?.temperature ?? -24.8} °C
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Dew Point: <span className="font-mono text-[#E8EEF4]">{weather?.dewPoint ?? -29.2} °C</span>
          </div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Katabatic Velocity</span>
            <Wind className="w-5 h-5 text-[#00E0C6]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#00E0C6] mt-2">
            {weather?.windSpeed ?? 42} km/h
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Vector: <span className="font-mono text-[#E8EEF4]">{weather?.windDirection ?? 140}° SSE</span>
          </div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Atmospheric Pressure</span>
            <Compass className="w-5 h-5 text-[#4A9EFF]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#E8EEF4] mt-2">
            {weather?.pressure ?? 986} hPa
          </div>
          <div className="text-[11px] text-[#3EE07F] mt-1 font-semibold">
            Barometric Trend: Stable High
          </div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Aurora Oval Activity</span>
            <Sun className="w-5 h-5 text-[#3EE07F]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#3EE07F] mt-2">
            Kp {weather?.auroraActivityKp ?? 4.8} <span className="text-xs font-normal text-[#6B7A8F]">/ 9.0</span>
          </div>
          <div className="text-[11px] text-[#FFB020] mt-1">
            Moderate Geomagnetic Aurora
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN: ICE VELOCITY RADAR MAP + SATELLITE PASS COUNTDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ice Velocity Map (8 cols) */}
        <div className="lg:col-span-8 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2533] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  Synthetic Aperture Radar (SAR) Ice Flow Field
                </h3>
                {isRadarOpen && autoCloseSeconds !== null && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40 flex items-center gap-1">
                    <Timer className="w-3 h-3 animate-spin-slow" />
                    Auto-closes in {autoCloseSeconds}s
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7A8F]">
                {activeStation === 'maitri'
                  ? 'Schirmacher Oasis to Continental Ice Sheet boundary (70°45\'S)'
                  : 'Larsemann Hills to Dålk Glacier calving margin (69°24\'S)'}
              </p>
            </div>

            {/* Layer & Radar Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-lg border border-[#1A2533]">
                {(['velocity', 'crevasse', 'elevation'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLayer(l)}
                    className={`px-3 py-1 text-xs font-semibold rounded capitalize transition-colors ${
                      activeLayer === l
                        ? 'bg-[#00E0C6] text-[#060B14]'
                        : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
                    }`}
                  >
                    {l === 'velocity' ? 'Velocity Vectors' : l === 'crevasse' ? 'Crevasse Risk' : 'Ice Elevation'}
                  </button>
                ))}
              </div>

              {/* Tactical Fullscreen Trigger */}
              <button
                onClick={() => {
                  setIsTacticalModalOpen(true);
                  playRadarPing();
                }}
                className="px-2.5 py-1.5 bg-[#00E0C6]/15 hover:bg-[#00E0C6]/25 text-[#00E0C6] border border-[#00E0C6]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open Tactical Radar Scanner (Auto-closes in 10s)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tactical Scan</span>
              </button>

              {/* Close / Minimize Radar Button */}
              {isRadarOpen ? (
                <button
                  onClick={() => setIsRadarOpen(false)}
                  className="px-2.5 py-1.5 bg-[#1A2533] hover:bg-[#253347] text-[#E8EEF4] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Close radar now"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Sleep</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsRadarOpen(true);
                    setAutoCloseSeconds(15);
                    playRadarPing();
                  }}
                  className="px-3 py-1.5 bg-[#00E0C6] text-[#060B14] rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#00E0C6]/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Wake Radar (15s)</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Radar View */}
          {isRadarOpen ? (
            <>
              {/* Interactive Radar Visualization Canvas */}
              <div className="relative w-full h-80 bg-[#060B14] rounded-lg mt-4 overflow-hidden border border-[#1A2533] flex items-center justify-center">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#1A2533_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
                
                {/* Rotating Radar Sweep Line */}
                <div className="absolute w-72 h-72 rounded-full border border-[#00E0C6]/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-dashed border-[#00E0C6]/20" />
                  <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent to-[#00E0C6] origin-left animate-radar-sweep left-1/2" />
                </div>

                {/* Concentric Range Rings */}
                <div className="absolute w-44 h-44 rounded-full border border-[#00E0C6]/15 pointer-events-none" />
                <div className="absolute w-20 h-20 rounded-full border border-[#00E0C6]/20 pointer-events-none" />

                {/* Station Center Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-[#00E0C6] shadow-[0_0_15px_#00E0C6] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-[#00E0C6] mt-1 uppercase">
                    {activeStation === 'maitri' ? 'Maitri Station (Datum 0,0)' : 'Bharati Complex (Datum 0,0)'}
                  </span>
                </div>

                {/* Ice Flow Vectors (Simulated based on layer) */}
                <div className="absolute top-8 left-12 p-2 bg-[#0A121E]/90 border border-[#1A2533] rounded text-[11px] text-[#6B7A8F]">
                  <div className="text-[#3EE07F] font-mono font-bold">Vector: 18.4 m/year NW</div>
                  <div>Grounding Line: 4.8 km</div>
                </div>

                <div className="absolute bottom-8 right-12 p-2 bg-[#0A121E]/90 border border-[#1A2533] rounded text-[11px] text-[#6B7A8F]">
                  <div className="text-[#FFB020] font-mono font-bold">Fast Ice Shear: 0.08 strain/day</div>
                  <div>Crevasse Alert Zone: 8.2 km SE</div>
                </div>

                {/* Auto-close pause / resume pill */}
                <div className="absolute bottom-3 left-3 z-10">
                  <button
                    onClick={() => setIsAutoClosePaused(!isAutoClosePaused)}
                    className="px-2.5 py-1 bg-[#0A121E]/90 hover:bg-[#1A2533] border border-[#1A2533] rounded text-[10px] text-[#6B7A8F] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Timer className="w-3 h-3 text-[#FFB020]" />
                    <span>{isAutoClosePaused ? 'Resume Auto-Close' : 'Pause Auto-Close (Keep Open)'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B7A8F] mt-3">
                <span>Sentinel-1 SAR interferometry updated every 6 days</span>
                <span className="font-mono text-[#E8EEF4]">Resolution: 10m x 10m grid</span>
              </div>
            </>
          ) : (
            /* Minimized Sleeping State */
            <div className="p-8 my-4 bg-[#060B14] rounded-lg border border-[#1A2533] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1A2533] flex items-center justify-center text-[#6B7A8F]">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E8EEF4]">SAR Cryosphere Radar in Sleep Mode</h4>
                <p className="text-xs text-[#6B7A8F] max-w-md mt-0.5">
                  Radar closed on schedule to conserve microgrid battery reserves during subzero operations. Click below to initiate an active 15-second sweep.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsRadarOpen(true);
                    setAutoCloseSeconds(15);
                    playRadarPing();
                  }}
                  className="px-4 py-2 bg-[#00E0C6] hover:bg-[#00E0C6]/80 text-[#060B14] font-black rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Wake Radar & Run 15s Sweep
                </button>
                <button
                  onClick={() => {
                    setIsTacticalModalOpen(true);
                    playRadarPing();
                  }}
                  className="px-4 py-2 bg-[#0A121E] hover:bg-[#1A2533] text-[#00E0C6] border border-[#00E0C6]/40 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Open Tactical Scanner
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Satellite Pass Countdown (4 cols) */}
        <div className="lg:col-span-4 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1A2533] pb-3">
              <Satellite className="w-5 h-5 text-[#00E0C6]" />
              <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                Orbital Overpasses
              </h3>
            </div>

            <div className="space-y-3 mt-4">
              {satellitePasses.map(sat => (
                <div key={sat.id} className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E8EEF4]">{sat.satelliteName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#00E0C6] bg-[#00E0C6]/10 rounded">
                      In {sat.scheduledAt}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7A8F] mt-2">
                    <div>Elevation: <span className="font-mono text-[#E8EEF4]">{sat.elevation}°</span></div>
                    <div>Azimuth: <span className="font-mono text-[#E8EEF4]">{sat.azimuth}°</span></div>
                    <div>Band: <span className="font-mono text-[#4A9EFF]">{sat.uplinkBand}</span></div>
                    <div>Link: <span className="font-mono text-[#3EE07F]">{sat.linkQuality}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#00E0C6]/10 rounded-lg border border-[#00E0C6]/30 text-xs text-[#00E0C6] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Telemetry pre-caching scheduled for next NOAA-20 window</span>
          </div>
        </div>
      </div>

      {/* 4 BOTTOM ENVIRONMENT CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: 7-Day Temp Trend */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            7-Day Temperature Range
          </div>
          <div className="space-y-1.5">
            {(weather?.forecast || []).slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-[#6B7A8F]">
                <span>{f.day}</span>
                <span className="font-mono text-[#E8EEF4] font-bold">
                  {f.tempMin}° / {f.tempMax}°C
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Katabatic Wind Spectrum */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            Katabatic Gust Distribution
          </div>
          <div className="space-y-1.5 text-xs text-[#6B7A8F]">
            <div className="flex justify-between">
              <span>0-40 km/h (Calm)</span>
              <span className="font-mono text-[#3EE07F]">45%</span>
            </div>
            <div className="flex justify-between">
              <span>40-80 km/h (Moderate)</span>
              <span className="font-mono text-[#FFB020]">38%</span>
            </div>
            <div className="flex justify-between">
              <span>80+ km/h (Katabatic Gale)</span>
              <span className="font-mono text-[#FF3B47]">17%</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Ice Cap Subsurface Temp Profile */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            Subsurface Cryo-Thermistor
          </div>
          <div className="space-y-1.5 text-xs text-[#6B7A8F]">
            <div className="flex justify-between">
              <span>Depth -1.0 m:</span>
              <span className="font-mono text-[#E8EEF4]">-18.4 °C</span>
            </div>
            <div className="flex justify-between">
              <span>Depth -5.0 m:</span>
              <span className="font-mono text-[#E8EEF4]">-14.2 °C</span>
            </div>
            <div className="flex justify-between">
              <span>Depth -15.0 m:</span>
              <span className="font-mono text-[#E8EEF4]">-11.0 °C</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Solar Irradiance & Day/Night */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            Direct Solar Radiation
          </div>
          <div className="text-2xl font-mono font-bold text-[#FFD700] mt-1">
            {weather?.solarRadiation ?? 140} W/m²
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Seasonal Sun Elevation: <span className="font-mono text-[#E8EEF4]">18.4° above horizon</span>
          </div>
        </div>
      </div>

      {/* TACTICAL FULLSCREEN RADAR MODAL (AUTONOMOUSLY CLOSES ON ITS OWN) */}
      {isTacticalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A121E] border-2 border-[#00E0C6]/50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(0,224,198,0.2)] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#060B14] border-b border-[#1A2533] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00E0C6]/15 border border-[#00E0C6]/40 flex items-center justify-center text-[#00E0C6]">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#FFFFFF] uppercase tracking-wider">
                      Tactical Cryosphere Radar & Crevasse Scanner
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E0C6]/20 text-[#00E0C6] border border-[#00E0C6]/40">
                      LIVE SWEEP
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7A8F]">
                    X-Band Marine & SAR Surface Penetration Radar (50km Range) · Real-time Ice Rift Detection
                  </div>
                </div>
              </div>

              {/* Auto-Close Countdown Pill */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-[#FFB020]/15 border border-[#FFB020]/40 rounded-lg flex items-center gap-2 text-xs font-mono text-[#FFB020] font-bold">
                  <Timer className="w-4 h-4 animate-spin-slow" />
                  <span>Closing in {tacticalCountdown}s</span>
                </div>

                <button
                  onClick={() => setIsTacticalModalOpen(false)}
                  className="p-1.5 hover:bg-[#1A2533] text-[#6B7A8F] hover:text-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
                  title="Close now"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="h-1 bg-[#1A2533] w-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00E0C6] to-[#FFB020] transition-all duration-1000 ease-linear"
                style={{ width: `${(tacticalCountdown / 10) * 100}%` }}
              />
            </div>

            {/* Main Radar Screen View */}
            <div className="p-6 bg-[#040810] flex flex-col md:flex-row items-center gap-6">
              
              {/* Radar Circle */}
              <div className="relative w-72 h-72 rounded-full border-2 border-[#00E0C6]/50 bg-[#02050A] flex items-center justify-center shrink-0 shadow-[inset_0_0_30px_rgba(0,224,198,0.2)]">
                {/* Polar Coordinates Radial Grids */}
                <div className="absolute inset-0 rounded-full border border-dashed border-[#00E0C6]/20" />
                <div className="absolute w-52 h-52 rounded-full border border-[#00E0C6]/25" />
                <div className="absolute w-32 h-32 rounded-full border border-[#00E0C6]/30" />
                <div className="absolute w-12 h-12 rounded-full border border-[#00E0C6]/40" />

                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-[#00E0C6]/25" />
                <div className="absolute h-full w-[1px] bg-[#00E0C6]/25" />

                {/* Rotating Sweep Beam */}
                <div className="absolute w-1/2 h-[3px] bg-gradient-to-r from-transparent to-[#00E0C6] origin-left animate-radar-sweep left-1/2 shadow-[0_0_15px_#00E0C6]" />

                {/* Blip 1: Station Datum */}
                <div className="absolute z-10 w-3 h-3 rounded-full bg-[#00E0C6] shadow-[0_0_10px_#00E0C6] animate-ping" />
                <div className="absolute z-10 w-2.5 h-2.5 rounded-full bg-[#00E0C6]" />

                {/* Blip 2: Iceberg / Crevasse */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-[#FF3B47] shadow-[0_0_8px_#FF3B47] animate-pulse"
                  style={{ top: '35%', left: '72%' }}
                />
                {/* Blip 3: Traverse Machinery */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-[#3EE07F] shadow-[0_0_8px_#3EE07F]"
                  style={{ bottom: '28%', left: '30%' }}
                />
                {/* Blip 4: Calving Edge */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-[#FFB020] shadow-[0_0_8px_#FFB020]"
                  style={{ top: '22%', left: '26%' }}
                />
              </div>

              {/* Live Target Readout List */}
              <div className="flex-1 space-y-3 w-full">
                <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider flex items-center justify-between">
                  <span>Detected Cryosphere Radar Contacts (3)</span>
                  <span className="text-[10px] text-[#00E0C6] font-mono">Range: 50km Max</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#0A121E] border border-[#FF3B47]/30 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#FF3B47] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Crevasse Fracture F-09</span>
                      </div>
                      <div className="text-[10px] text-[#6B7A8F]">Shear strain 0.12/day · Rapid propagation</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[#FFFFFF] font-bold">8.6 km SE</div>
                      <div className="text-[10px] text-[#6B7A8F]">Az: 142°</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0A121E] border border-[#FFB020]/30 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#FFB020]">Tabular Berg B-46A (Calved)</div>
                      <div className="text-[10px] text-[#6B7A8F]">Dimensions: 420m x 180m · Drift: 0.8 kt NW</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[#FFFFFF] font-bold">14.2 km WNW</div>
                      <div className="text-[10px] text-[#6B7A8F]">Az: 295°</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0A121E] border border-[#3EE07F]/30 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#3EE07F]">PistenBully PB-300 Traverse-01</div>
                      <div className="text-[10px] text-[#6B7A8F]">Surface supply run · Transponder: ACTIVE</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[#FFFFFF] font-bold">3.4 km NW</div>
                      <div className="text-[10px] text-[#6B7A8F]">Az: 310°</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Autonomous Action Notice */}
            <div className="p-4 bg-[#060B14] border-t border-[#1A2533] flex items-center justify-between text-xs">
              <span className="text-[#6B7A8F] flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-[#00E0C6]" />
                This radar scanner automatically closes on its own once sweep cycle finishes ({tacticalCountdown}s remaining).
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTacticalModalOpen(false)}
                  className="px-4 py-2 bg-[#1A2533] hover:bg-[#253347] text-[#FFFFFF] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close Immediately
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
