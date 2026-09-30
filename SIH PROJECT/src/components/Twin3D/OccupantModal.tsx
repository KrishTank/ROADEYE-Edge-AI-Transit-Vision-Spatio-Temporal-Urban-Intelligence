/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Personnel Roster & Biometric Profile Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { OccupantPerson } from './types';
import { User, Heart, Activity, Thermometer, Radio, CheckCircle2, X } from 'lucide-react';

interface OccupantModalProps {
  person: OccupantPerson;
  onClose: () => void;
}

export const OccupantModal: React.FC<OccupantModalProps> = ({ person, onClose }) => {
  return (
    <div className="absolute bottom-20 left-6 z-40 w-80 bg-[#0A121E]/95 backdrop-blur-md border border-[#00FFFF]/50 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in duration-200 text-xs text-[#E8EEF4]">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00FFFF]/20 border border-[#00FFFF]/40 flex items-center justify-center text-[#00FFFF]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#E8EEF4]">{person.name}</h4>
            <span className="text-[10px] text-[#00FFFF] font-semibold">{person.role}</span>
          </div>
        </div>

        <button onClick={onClose} className="text-[#6B7A8F] hover:text-[#FFFFFF] cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#6B7A8F]">Duty Shift:</span>
          <span className="text-[#FFD700]">{person.shift}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7A8F]">Medical Clearance:</span>
          <span className="text-[#3EE07F] font-bold">{person.healthStatus}</span>
        </div>
      </div>

      {/* BIOMETRIC SENSORS (WEARABLE POLAR TELEMETRY) */}
      <div className="p-2.5 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-1.5 font-mono text-[10px]">
        <span className="text-[9px] uppercase font-bold text-[#6B7A8F] block">Live Bio-Telemetry:</span>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1 bg-[#0A121E] rounded">
            <span className="text-[#6B7A8F] block">Pulse</span>
            <strong className="text-[#00FFFF]">{person.vitals.heartRate} bpm</strong>
          </div>
          <div className="p-1 bg-[#0A121E] rounded">
            <span className="text-[#6B7A8F] block">SpO2</span>
            <strong className="text-[#3EE07F]">{person.vitals.oxygenSat}%</strong>
          </div>
          <div className="p-1 bg-[#0A121E] rounded">
            <span className="text-[#6B7A8F] block">Core Temp</span>
            <strong className="text-[#FFD700]">{person.vitals.coreTemp}°C</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
