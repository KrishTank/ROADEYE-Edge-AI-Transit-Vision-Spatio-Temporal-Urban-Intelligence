/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 4: Microgrid & CHP Command Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { BatteryCharging, Cpu, Flame, Gauge, Layers, Power, Sun, Wind, Zap } from 'lucide-react';
import { appendAuditLog } from '../../services/auditService';

interface MicrogridCommandScreenProps {
  activeStation: StationId;
  userRole: string;
}

export const MicrogridCommandScreen: React.FC<MicrogridCommandScreenProps> = ({ activeStation, userRole }) => {
  const [bessSoc, setBessSoc] = useState(82);
  const [activeGenBus, setActiveGenBus] = useState<'A' | 'B' | 'PARALLEL'>('PARALLEL');
  const [glycolPumpSpeed, setGlycolPumpSpeed] = useState(75);

  const isBharati = activeStation === 'bharati';

  const handleBusTransfer = async (bus: 'A' | 'B' | 'PARALLEL') => {
    setActiveGenBus(bus);
    await appendAuditLog(
      activeStation.toUpperCase(),
      `Engineer (${userRole})`,
      'BUS_LOAD_TRANSFER',
      `Synchronous bus selector shifted to mode: ${bus}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Microgrid & Combined Heat/Power (CHP) Command
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          {isBharati
            ? '3 × CHP Units (100 kVA electrical + 150 kW thermal each) with closed-loop glycol heat exchangers.'
            : '4 × 62.5 kVA Synchronous Diesel Generator banks with lake trace heating dispatch.'}
        </p>
      </div>

      {/* 6 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Active Generation Output */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">Electrical Output</div>
          <div className="text-xl font-mono font-bold text-[#00E0C6] mt-1">112.4 kW</div>
          <div className="text-[10px] text-[#3EE07F] mt-0.5 font-mono">50.02 Hz · 415 V</div>
        </div>

        {/* KPI 2: Thermal Cogen */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">Thermal Reject Recov</div>
          <div className="text-xl font-mono font-bold text-[#FFB020] mt-1">188 kWth</div>
          <div className="text-[10px] text-[#FFB020] mt-0.5">Glycol Loop +84°C</div>
        </div>

        {/* KPI 3: BESS Storage SoC */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">BESS Battery Bank</div>
          <div className="text-xl font-mono font-bold text-[#3EE07F] mt-1">{bessSoc} %</div>
          <div className="text-[10px] text-[#6B7A8F] mt-0.5">120 kWh LiFePO4</div>
        </div>

        {/* KPI 4: Wind Mast Generation */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">Wind Turbine Hub</div>
          <div className="text-xl font-mono font-bold text-[#4A9EFF] mt-1">14.8 kW</div>
          <div className="text-[10px] text-[#6B7A8F] mt-0.5">Arctic Savonius Mast</div>
        </div>

        {/* KPI 5: Solar PV Bifacial Array */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">Bifacial Solar PV</div>
          <div className="text-xl font-mono font-bold text-[#FFD700] mt-1">6.2 kW</div>
          <div className="text-[10px] text-[#6B7A8F] mt-0.5">Albedo Snow Return</div>
        </div>

        {/* KPI 6: Fuel Burn Rate */}
        <div className="p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-[10px] uppercase font-semibold text-[#6B7A8F] tracking-wider">Fuel Consumption</div>
          <div className="text-xl font-mono font-bold text-[#E8EEF4] mt-1">26.4 L/h</div>
          <div className="text-[10px] text-[#3EE07F] mt-0.5 font-semibold">Eff: 3.8 kWh/L</div>
        </div>
      </div>

      {/* ENERGY FLOW TOPOLOGY DIAGRAM */}
      <div className="bg-[#0A121E] rounded-xl border border-[#1A2533] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2533] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
              Microgrid Dynamic Power Flow Topology
            </h3>
            <span className="text-xs text-[#6B7A8F]">
              Synchronous AC bus routing, battery energy storage system (BESS), and co-gen heat exchanger loop
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7A8F] uppercase font-semibold">Bus Mode:</span>
            <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-lg border border-[#1A2533]">
              {(['A', 'B', 'PARALLEL'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleBusTransfer(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    activeGenBus === mode
                      ? 'bg-[#00E0C6] text-[#060B14]'
                      : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
                  }`}
                >
                  Bus {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          {/* Node 1: Primary Generation */}
          <div className="p-4 bg-[#060B14] rounded-lg border border-[#1A2533] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8EEF4] uppercase">
                  {isBharati ? 'CHP Units 1 & 2' : 'Diesel Gen 1 & 2'}
                </span>
                <Zap className="w-4 h-4 text-[#00E0C6]" />
              </div>
              <div className="text-lg font-mono font-bold text-[#00E0C6] mt-2">
                112.4 kW <span className="text-xs font-normal text-[#6B7A8F]">(68% Load)</span>
              </div>
              <p className="text-xs text-[#6B7A8F] mt-2">
                Parallel synchronous generators supplying the central main switchboard (MSB).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1A2533] text-[11px] font-mono text-[#3EE07F]">
              ● Phase Synch Angle: +0.4°
            </div>
          </div>

          {/* Node 2: Renewables Injection */}
          <div className="p-4 bg-[#060B14] rounded-lg border border-[#1A2533] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8EEF4] uppercase">Renewable Injection</span>
                <Wind className="w-4 h-4 text-[#4A9EFF]" />
              </div>
              <div className="text-lg font-mono font-bold text-[#4A9EFF] mt-2">
                21.0 kW Total
              </div>
              <p className="text-xs text-[#6B7A8F] mt-2">
                Combined Wind Savonius Mast (14.8 kW) + Bifacial Vertical Solar (6.2 kW).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1A2533] text-[11px] font-mono text-[#4A9EFF]">
              ● MPPT Inverter: Locked
            </div>
          </div>

          {/* Node 3: BESS Storage */}
          <div className="p-4 bg-[#060B14] rounded-lg border border-[#1A2533] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8EEF4] uppercase">BESS Battery Storage</span>
                <BatteryCharging className="w-4 h-4 text-[#3EE07F]" />
              </div>
              <div className="text-lg font-mono font-bold text-[#3EE07F] mt-2">
                {bessSoc}% SoC (Floating)
              </div>
              <p className="text-xs text-[#6B7A8F] mt-2">
                120 kWh lithium iron phosphate bank absorbs renewable fluctuations and provides UPS black-start.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1A2533] text-[11px] font-mono text-[#3EE07F]">
              ● Cell Temp: +19.4°C (Heated)
            </div>
          </div>

          {/* Node 4: Critical Habitat & Pipeline Load */}
          <div className="p-4 bg-[#060B14] rounded-lg border border-[#1A2533] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8EEF4] uppercase">Life-Support Loads</span>
                <Flame className="w-4 h-4 text-[#FFB020]" />
              </div>
              <div className="text-lg font-mono font-bold text-[#FFB020] mt-2">
                98.6 kW Active
              </div>
              <p className="text-xs text-[#6B7A8F] mt-2">
                Water trace heating (18 kW), Habitat HVAC (42 kW), Laboratory clean power (18 kW), Galley & lighting (20.6 kW).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1A2533] text-[11px] font-mono text-[#00E0C6]">
              ● Trace Loop 1: +1.8°C Nominal
            </div>
          </div>
        </div>
      </div>

      {/* CO-GENERATION GLYCOL HEAT RECOVERY CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            Glycol Cogeneration Thermal Loop
          </h3>
          <p className="text-xs text-[#6B7A8F] mb-4">
            Captures 188 kWth of exhaust and engine jacket thermal energy to circulate hot glycol to air-handling units and water tanks.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7A8F]">Primary Exchanger Feed Temp:</span>
              <span className="font-mono text-[#FFB020] font-bold">+84.2 °C</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7A8F]">Return Header Temp:</span>
              <span className="font-mono text-[#00E0C6] font-bold">+68.5 °C</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7A8F]">Circulation Flow Rate:</span>
              <span className="font-mono text-[#E8EEF4] font-bold">140 LPM</span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs text-[#6B7A8F] mb-1">
                <span>Glycol Recirculation Pump Speed:</span>
                <span className="font-mono text-[#00E0C6] font-bold">{glycolPumpSpeed}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={glycolPumpSpeed}
                onChange={(e) => setGlycolPumpSpeed(Number(e.target.value))}
                className="w-full accent-[#00E0C6]"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
            Trace Heating & Snow-Melt Priority Dispatch
          </h3>
          <p className="text-xs text-[#6B7A8F] mb-4">
            Automated load shedding matrix protecting vital water systems under extreme sub-zero conditions.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#E8EEF4]">Priority 1: Water Line Trace Heating</span>
                <div className="text-[10px] text-[#6B7A8F]">Non-sheddable life support</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#3EE07F]/20 text-[#3EE07F] rounded">
                LOCKED ONLINE
              </span>
            </div>

            <div className="p-2.5 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#E8EEF4]">Priority 2: Main Habitat Air Handlers</span>
                <div className="text-[10px] text-[#6B7A8F]">Thermal comfort envelope</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#3EE07F]/20 text-[#3EE07F] rounded">
                ONLINE
              </span>
            </div>

            <div className="p-2.5 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#E8EEF4]">Priority 3: Snow Melting Cistern</span>
                <div className="text-[10px] text-[#6B7A8F]">Thermal dump buffer</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00E0C6]/20 text-[#00E0C6] rounded">
                AUTO-CYCLING
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
