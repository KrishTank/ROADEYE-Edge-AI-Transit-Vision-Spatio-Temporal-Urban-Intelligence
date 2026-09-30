/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Arctic Vehicle Telemetry & Dispatch Control Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { VehicleDefinition } from './types';
import { 
  Truck, 
  Fuel, 
  Gauge, 
  Wrench, 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Package, 
  X,
  Sliders
} from 'lucide-react';

interface VehicleModalProps {
  vehicle: VehicleDefinition;
  onClose: () => void;
  onToggleEngine: (vehicleId: string, isRunning: boolean) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  onToggleEngine
}) => {
  const [isRunning, setIsRunning] = useState(vehicle.isEngineRunning || false);
  const [bladeRaised, setBladeRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'manifest' | 'maintenance'>('status');
  const [engineNotification, setEngineNotification] = useState<string | null>(null);

  const handleToggleEngine = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    onToggleEngine(vehicle.id, nextState);
    setEngineNotification(nextState ? 'Diesel Warmup Pre-Heat Initiated · Exhaust Active' : 'Engine Shutdown Protocol Complete');
    setTimeout(() => setEngineNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A121E] border-2 border-[#FFD700]/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  {vehicle.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  vehicle.status === 'OPERATIONAL' 
                    ? 'bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/40' 
                    : vehicle.status === 'IN TRANSIT'
                    ? 'bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/40'
                    : 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <p className="text-xs text-[#6B7A8F] mt-0.5 font-mono">
                Model: {vehicle.model}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#6B7A8F] hover:text-[#FFFFFF] hover:bg-[#1A2533] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center px-6 pt-3 bg-[#060B14] border-b border-[#1A2533] gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'status' 
                ? 'bg-[#0A121E] text-[#FFD700] border-t-2 border-x-2 border-[#FFD700]/50' 
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Engine & Telemetry
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'manifest' 
                ? 'bg-[#0A121E] text-[#FFD700] border-t-2 border-x-2 border-[#FFD700]/50' 
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Cargo Manifest ({vehicle.cargoManifest?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'maintenance' 
                ? 'bg-[#0A121E] text-[#FFD700] border-t-2 border-x-2 border-[#FFD700]/50' 
                : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
            }`}
          >
            Mechanical Maintenance Log
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#E8EEF4]">
          
          {engineNotification && (
            <div className="p-3 bg-[#FFD700]/15 border border-[#FFD700]/40 rounded-xl text-xs font-mono text-[#FFD700] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
              <span>{engineNotification}</span>
            </div>
          )}

          {activeTab === 'status' && (
            <>
              {/* PRIMARY 4 KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Fuel Reserve</span>
                  <div className="text-xl font-mono font-bold text-[#FFD700] mt-1">{vehicle.fuelLevelPct}%</div>
                  <span className="text-[10px] text-[#3EE07F]">Jet A-1 Low-Temp</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Engine Hours</span>
                  <div className="text-xl font-mono font-bold text-[#00FFFF] mt-1">{vehicle.engineHours} h</div>
                  <span className="text-[10px] text-[#6B7A8F]">Lifetime Meter</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Track / Tread Life</span>
                  <div className="text-xl font-mono font-bold text-[#3EE07F] mt-1">{vehicle.trackConditionPct}%</div>
                  <span className="text-[10px] text-[#3EE07F]">Tension: Nominal</span>
                </div>

                <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
                  <span className="text-[10px] text-[#6B7A8F] uppercase font-bold block">Next Service</span>
                  <div className="text-xl font-mono font-bold text-[#FFB020] mt-1">{vehicle.nextServiceHours} h</div>
                  <span className="text-[10px] text-[#6B7A8F]">Scheduled 500h Lube</span>
                </div>
              </div>

              {/* DRIVER & LOCATION SPEC */}
              <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
                  <span className="text-[#6B7A8F]">Assigned Pilot / Driver:</span>
                  <strong className="text-[#E8EEF4] text-xs">{vehicle.driverName}</strong>
                </div>

                {vehicle.bladeCondition && (
                  <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
                    <span className="text-[#6B7A8F]">Front Hydraulic Blade:</span>
                    <strong className="text-[#00FFFF]">{vehicle.bladeCondition}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#6B7A8F]">Powertrain Status:</span>
                  <strong className={isRunning ? 'text-[#00FF00]' : 'text-[#AAAAAA]'}>
                    {isRunning ? 'ENGINE ACTIVE (IDLING 800 RPM)' : 'ENGINE COLD SHUTDOWN'}
                  </strong>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleToggleEngine}
                  className={`py-3 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-md ${
                    isRunning 
                      ? 'bg-[#FF3B47] hover:bg-[#FF3B47]/90 text-white' 
                      : 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#060B14]'
                  }`}
                >
                  {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isRunning ? 'Stop Diesel Engine' : 'Start Engine (Warmup)'}</span>
                </button>

                {vehicle.name.includes('PistenBully') && (
                  <button
                    onClick={() => setBladeRaised(!bladeRaised)}
                    className="py-3 px-4 bg-[#060B14] hover:bg-slate-800 border border-[#1A2533] text-[#00FFFF] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{bladeRaised ? 'Lower Snow Blade' : 'Raise Snow Blade'}</span>
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <span className="text-[#6B7A8F] text-[11px] block">
                Manifested Survival Equipment & Scientific Cargo Payload:
              </span>
              <div className="space-y-2">
                {vehicle.cargoManifest?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] flex items-center gap-3 text-slate-200">
                    <Package className="w-4 h-4 text-[#FFD700] shrink-0" />
                    <span className="font-mono text-xs">{item}</span>
                    <span className="ml-auto text-[10px] text-[#3EE07F] font-semibold">VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-1">
                <div className="flex items-center justify-between text-[#FFD700]">
                  <span>18 Days Ago · 1,200h Inspection</span>
                  <span>PASSED</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Flushed hydraulic loop with aviation-grade MIL-PRF-5606 fluid. Replaced dual fuel filter cartridges.
                </p>
              </div>

              <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-1">
                <div className="flex items-center justify-between text-[#00FFFF]">
                  <span>34 Days Ago · Cold Battery Replace</span>
                  <span>COMPLETED</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Installed dual 110Ah AGM spiral-cell batteries with heating blankets.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#1A2533] bg-[#060B14] flex items-center justify-between">
          <div className="text-[11px] text-[#6B7A8F] font-mono">
            Antarctic Logistics & Fleet Dispatch Cell · PS 26060
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0A121E] hover:bg-slate-800 text-[#E8EEF4] text-xs font-semibold rounded-lg border border-[#1A2533] cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
