/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Arctic Fuel Station & Bulk Diesel Farm Diagnostics Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { 
  Fuel, 
  Flame, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Activity, 
  Zap, 
  ArrowRight, 
  RefreshCw, 
  Sliders 
} from 'lucide-react';

interface FuelModalProps {
  station: StationId;
  onClose: () => void;
}

export const FuelModal: React.FC<FuelModalProps> = ({ station, onClose }) => {
  const isMaitri = station === 'maitri';
  const [isPreHeaterActive, setIsPreHeaterActive] = useState(true);
  const [activePump, setActivePump] = useState<1 | 2>(1);
  const [transferRateLpm, setTransferRateLpm] = useState(45);
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState(false);

  const totalCapacityL = isMaitri ? 200000 : 160000;
  const currentVolumeL = isMaitri ? 148500 : 124200;
  const fillPercentage = Math.round((currentVolumeL / totalCapacityL) * 100);
  const burnRateLph = isMaitri ? 28.4 : 32.1;
  const reserveDays = Math.round((currentVolumeL / (burnRateLph * 24)));

  const handleSimulateTransfer = () => {
    setIsSimulatingTransfer(true);
    setTimeout(() => {
      setIsSimulatingTransfer(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A121E] border border-[#1A2533] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB020]/15 border border-[#FFB020]/40 flex items-center justify-center text-[#FFB020]">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#FFFFFF]">
                  {isMaitri ? 'Maitri Bulk Fuel Farm (D-208 Tank Depot)' : 'Bharati Containerized Bunkering Depot'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/30">
                  ONLINE
                </span>
              </div>
              <div className="text-xs text-[#6B7A8F] mt-0.5">
                Arctic-grade low-pour-point diesel (Pour point: -52°C) · Madrid Protocol Bunded Containment
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1A2533] text-[#6B7A8F] hover:text-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Main Gauges Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533]">
              <div className="text-[#6B7A8F] uppercase text-[10px] font-bold">Total Bulk Storage</div>
              <div className="text-2xl font-black font-mono text-[#FFD700] mt-1">
                {currentVolumeL.toLocaleString()} <span className="text-xs text-[#6B7A8F]">L</span>
              </div>
              <div className="text-[11px] text-[#6B7A8F] mt-1">
                Capacity: {totalCapacityL.toLocaleString()} L ({fillPercentage}%)
              </div>
            </div>

            <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533]">
              <div className="text-[#6B7A8F] uppercase text-[10px] font-bold">Core Fuel Temp</div>
              <div className="text-2xl font-black font-mono text-[#00E0C6] mt-1">
                +14.8°C
              </div>
              <div className="text-[11px] text-[#3EE07F] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Gel Heaters Active
              </div>
            </div>

            <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533]">
              <div className="text-[#6B7A8F] uppercase text-[10px] font-bold">Autonomy Reserve</div>
              <div className="text-2xl font-black font-mono text-[#3EE07F] mt-1">
                {reserveDays} <span className="text-xs text-[#6B7A8F]">Days</span>
              </div>
              <div className="text-[11px] text-[#6B7A8F] mt-1">
                Burn rate: {burnRateLph} L/h (~{Math.round(burnRateLph * 24)} L/day)
              </div>
            </div>
          </div>

          {/* Visual Tank Bar */}
          <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#E8EEF4] uppercase tracking-wider">
                Storage Tank Farm Balance (4 Tanks)
              </span>
              <span className="font-mono text-[#FFD700] font-bold">{fillPercentage}% Filled</span>
            </div>
            
            <div className="h-4 bg-[#1A2533] rounded-full overflow-hidden p-0.5 border border-[#1A2533]">
              <div 
                className="h-full bg-gradient-to-r from-[#FFB020] via-[#FFD700] to-[#00E0C6] rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] text-center">
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <div className="text-[#6B7A8F]">TANK-01 (CHP)</div>
                <div className="font-mono font-bold text-[#FFFFFF]">38,400 L (77%)</div>
                <div className="text-[#3EE07F]">Nominal</div>
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <div className="text-[#6B7A8F]">TANK-02 (CHP)</div>
                <div className="font-mono font-bold text-[#FFFFFF]">36,800 L (74%)</div>
                <div className="text-[#3EE07F]">Nominal</div>
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <div className="text-[#6B7A8F]">TANK-03 (Traverse)</div>
                <div className="font-mono font-bold text-[#FFFFFF]">37,100 L (74%)</div>
                <div className="text-[#3EE07F]">Nominal</div>
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <div className="text-[#6B7A8F]">TANK-04 (Reserve)</div>
                <div className="font-mono font-bold text-[#FFFFFF]">36,200 L (72%)</div>
                <div className="text-[#3EE07F]">Nominal</div>
              </div>
            </div>
          </div>

          {/* Trace Heating & Transfer Pump Controls */}
          <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
              <span className="font-bold text-[#E8EEF4] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF6B2B]" />
                Heated Trace Pipeline & Transfer Manifold
              </span>
              <span className="text-[11px] font-mono text-[#00E0C6]">
                Length: 85m Overhead Gantry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7A8F]">Anti-Gel Pre-Heater:</span>
                  <button
                    onClick={() => setIsPreHeaterActive(!isPreHeaterActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                      isPreHeaterActive 
                        ? 'bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/40'
                        : 'bg-[#FF3B47]/20 text-[#FF3B47] border border-[#FF3B47]/40'
                    }`}
                  >
                    {isPreHeaterActive ? 'ENGAGED (+14°C)' : 'STANDBY'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7A8F]">Active Transfer Pump:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePump(1)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activePump === 1 ? 'bg-[#00E0C6] text-[#060B14]' : 'bg-[#1A2533] text-[#6B7A8F]'
                      }`}
                    >
                      PUMP-1
                    </button>
                    <button
                      onClick={() => setActivePump(2)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activePump === 2 ? 'bg-[#00E0C6] text-[#060B14]' : 'bg-[#1A2533] text-[#6B7A8F]'
                      }`}
                    >
                      PUMP-2
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7A8F]">Flow Rate:</span>
                  <span className="font-mono text-[#FFFFFF] font-bold">{transferRateLpm} L/min</span>
                </div>
              </div>

              <div className="space-y-2 border-l border-[#1A2533] pl-4">
                <div className="text-[#6B7A8F]">Madrid Protocol Containment:</div>
                <div className="p-2 bg-[#3EE07F]/10 border border-[#3EE07F]/30 rounded text-[#3EE07F] text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>110% Capacity Retention Berm · Zero leak detected</span>
                </div>
                <button
                  onClick={handleSimulateTransfer}
                  disabled={isSimulatingTransfer}
                  className="w-full py-2 bg-[#00E0C6]/15 hover:bg-[#00E0C6]/25 text-[#00E0C6] border border-[#00E0C6]/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingTransfer ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingTransfer ? 'Circulating Fuel...' : 'Run Fuel Transfer Diagnostic'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1A2533] bg-[#060B14] flex items-center justify-between">
          <div className="text-[11px] text-[#6B7A8F]">
            Automatic shutdown if pipeline temperature drops below +2°C.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00E0C6] hover:bg-[#00E0C6]/80 text-[#060B14] font-black rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
