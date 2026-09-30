/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Walk-In Room Diagnostic & Environmental Control Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { RoomDefinition } from './types';
import { 
  Box, 
  Lightbulb, 
  Thermometer, 
  Zap, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface RoomModalProps {
  room: RoomDefinition;
  onClose: () => void;
  onToggleLights: (roomId: string) => void;
  onReportIssue?: (roomName: string) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  room,
  onClose,
  onToggleLights,
  onReportIssue
}) => {
  const [lightsOn, setLightsOn] = useState(room.lightSwitch.isOn);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);

  const handleToggleLight = () => {
    setLightsOn(!lightsOn);
    onToggleLights(room.id);
  };

  return (
    <div className="absolute top-20 right-6 z-40 w-96 bg-[#0A121E]/95 backdrop-blur-md border border-[#00E0C6]/50 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in duration-200 text-xs text-[#E8EEF4]">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-[#1A2533] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              room.status === 'Warning' ? 'bg-[#FFB020] animate-ping' : 'bg-[#3EE07F]'
            }`} />
            <span className="text-[10px] text-[#6B7A8F] font-mono uppercase font-bold">
              Level {room.floor} · {room.station.toUpperCase()}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#E8EEF4] uppercase mt-0.5">
            {room.name}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-[#6B7A8F] hover:text-[#FFFFFF] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 4 TELEMETRY TILES */}
      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div className="p-2 bg-[#060B14] rounded-lg border border-[#1A2533]">
          <span className="text-[10px] text-[#6B7A8F] block">Temperature</span>
          <span className="text-sm font-bold text-[#00FFFF]">{room.temperature}°C</span>
        </div>
        <div className="p-2 bg-[#060B14] rounded-lg border border-[#1A2533]">
          <span className="text-[10px] text-[#6B7A8F] block">Power Load</span>
          <span className="text-sm font-bold text-[#FFD700]">{room.powerKw} kW</span>
        </div>
        <div className="p-2 bg-[#060B14] rounded-lg border border-[#1A2533]">
          <span className="text-[10px] text-[#6B7A8F] block">Occupants</span>
          <span className="text-sm font-bold text-[#3EE07F]">{room.occupancyCount}</span>
        </div>
      </div>

      <p className="text-xs text-[#8BA1B7] leading-relaxed">
        {room.description}
      </p>

      {room.vulnerabilityNote && (
        <div className="p-2.5 bg-[#FFB020]/15 border border-[#FFB020]/40 rounded-lg text-[11px] text-[#FFB020] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{room.vulnerabilityNote}</span>
        </div>
      )}

      {/* MONITORED EQUIPMENT LIST */}
      <div>
        <span className="text-[10px] font-bold uppercase text-[#6B7A8F] block mb-1.5 tracking-wider">
          Monitored Subsystems & Equipment ({room.equipment.length}):
        </span>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {room.equipment.map(eq => (
            <div 
              key={eq.id}
              onClick={() => setSelectedEqId(selectedEqId === eq.id ? null : eq.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedEqId === eq.id 
                  ? 'bg-[#00E0C6]/15 border-[#00E0C6] text-white' 
                  : 'bg-[#060B14] border-[#1A2533] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-[11px]">
                <span>{eq.name}</span>
                <span className={`text-[10px] font-mono ${
                  eq.status === 'Warning' ? 'text-[#FFB020]' : 'text-[#3EE07F]'
                }`}>{eq.status}</span>
              </div>

              {selectedEqId === eq.id && (
                <div className="mt-2 pt-2 border-t border-[#1A2533] grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  {Object.entries(eq.metrics).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#6B7A8F]">{k}:</span>
                      <span className="text-[#00E0C6] font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1A2533]">
        <button
          onClick={handleToggleLight}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            lightsOn 
              ? 'bg-[#FFD700] text-[#060B14]' 
              : 'bg-[#060B14] text-[#6B7A8F] border border-[#1A2533]'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{lightsOn ? 'Lights: ON' : 'Lights: OFF'}</span>
        </button>

        <button
          onClick={() => {
            if (onReportIssue) onReportIssue(room.name);
            onClose();
          }}
          className="py-2 px-3 bg-[#060B14] hover:bg-slate-800 border border-[#1A2533] text-[#00E0C6] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>
      </div>
    </div>
  );
};
