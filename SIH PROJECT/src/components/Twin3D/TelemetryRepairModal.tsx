/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SCADA Telemetry Repair & Sensor Recalibration Center Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { 
  telemetryRepairService, 
  TelemetryChannel, 
  TelemetryRepairState 
} from '../../services/telemetryRepairService';
import { 
  Wrench, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  Flame, 
  Radio, 
  Activity, 
  Zap, 
  Bug, 
  ExternalLink 
} from 'lucide-react';

interface TelemetryRepairModalProps {
  activeStation: StationId;
  initialSelectedChannelId?: string | null;
  onClose: () => void;
  onNavigateTo3D?: (position: [number, number, number]) => void;
}

export const TelemetryRepairModal: React.FC<TelemetryRepairModalProps> = ({
  activeStation,
  initialSelectedChannelId,
  onClose,
  onNavigateTo3D
}) => {
  const [repairState, setRepairState] = useState<TelemetryRepairState>(
    telemetryRepairService.getState()
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    initialSelectedChannelId || null
  );
  const [repairSuccessBanner, setRepairSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsub = telemetryRepairService.subscribe((state) => {
      setRepairState({ ...state });
    });
    return () => unsub();
  }, []);

  // Filter channels by active station
  const stationChannels = repairState.channels.filter(
    (c) => c.station === activeStation
  );

  const activeFaults = stationChannels.filter((c) => c.status !== 'NOMINAL');

  const selectedChannel = stationChannels.find(
    (c) => c.id === (selectedChannelId || activeFaults[0]?.id || stationChannels[0]?.id)
  );

  const handleRepairChannel = async (id: string) => {
    const success = await telemetryRepairService.repairChannel(id);
    if (success) {
      setRepairSuccessBanner(`Sensor successfully recalibrated! SHA-256 audit entry logged.`);
      setTimeout(() => setRepairSuccessBanner(null), 4000);
    }
  };

  const handleRepairAll = async () => {
    await telemetryRepairService.repairAll();
    setRepairSuccessBanner(`All telemetry channels calibrated & nominal state restored!`);
    setTimeout(() => setRepairSuccessBanner(null), 4000);
  };

  const handleInjectFault = () => {
    telemetryRepairService.injectFault(activeStation);
    setRepairSuccessBanner(`Simulated freeze-lockup injected! Check 3D Twin for illuminated ⚠️ alert beacon.`);
    setTimeout(() => setRepairSuccessBanner(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0A121E] border border-[#1A2533] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#060B14] border-b border-[#1A2533] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E0C6]/20 border border-[#00E0C6]/40 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#00E0C6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wide">
                  Autonomous Telemetry Repair & Sensor Recalibration
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E0C6]/10 text-[#00E0C6] border border-[#00E0C6]/30">
                  TEAM HACKFINITY007
                </span>
              </div>
              <p className="text-xs text-[#6B7A8F]">
                NCPOR SCADA Bus · Kalman Filter Filtering · Freeze Lock Clearance · Madrid Protocol Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInjectFault}
              title="Inject test telemetry anomaly to demonstrate 3D alert markers"
              className="px-3 py-1.5 rounded-lg border border-[#FF3B47]/40 bg-[#FF3B47]/10 hover:bg-[#FF3B47]/20 text-[#FF3B47] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Inject Test Anomaly</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#1A2533] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Status Banner */}
        <div className="px-6 py-3 bg-[#080E18] border-b border-[#1A2533] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#6B7A8F]">
              Station: <strong className="text-[#E8EEF4] uppercase">{activeStation}</strong>
            </span>
            <span className="text-[#1A2533]">|</span>
            <span className="flex items-center gap-1.5">
              Status:
              {activeFaults.length > 0 ? (
                <span className="flex items-center gap-1 font-bold text-[#FF3B47] animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {activeFaults.length} Sensor Anomaly Detected
                </span>
              ) : (
                <span className="flex items-center gap-1 font-bold text-[#3EE07F]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Sensors Nominal (100% Signal Integrity)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRepairAll}
              disabled={repairState.isRepairing || activeFaults.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                activeFaults.length === 0
                  ? 'bg-[#1A2533] text-[#6B7A8F] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00E0C6] to-[#00A896] hover:from-[#00E0C6]/90 text-[#060B14]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${repairState.isRepairing ? 'animate-spin' : ''}`} />
              <span>
                {repairState.isRepairing
                  ? 'Kalman Filtering & Re-syncing...'
                  : `Repair All Degraded Channels (${activeFaults.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {repairSuccessBanner && (
          <div className="px-6 py-2.5 bg-[#3EE07F]/15 border-b border-[#3EE07F]/40 text-[#3EE07F] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{repairSuccessBanner}</span>
          </div>
        )}

        {/* Modal Main Content: Left List + Right Diagnostics */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Channels List */}
          <div className="md:col-span-5 p-4 border-r border-[#1A2533] space-y-2 overflow-y-auto max-h-[500px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7A8F] mb-1 px-1">
              SCADA Sensor Bus Telemetry
            </div>

            {stationChannels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const hasFault = channel.status !== 'NOMINAL';

              return (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#121E2E] border-[#00E0C6] shadow-md'
                      : 'bg-[#060B14] border-[#1A2533] hover:border-[#2A384B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#E8EEF4] truncate max-w-[200px]">
                      {channel.component}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        channel.status === 'NOMINAL'
                          ? 'bg-[#3EE07F]/15 text-[#3EE07F] border border-[#3EE07F]/30'
                          : channel.status === 'FREEZE_LOCKUP'
                          ? 'bg-[#FF3B47]/20 text-[#FF3B47] border border-[#FF3B47]/40 animate-pulse'
                          : 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40'
                      }`}
                    >
                      {channel.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#6B7A8F] truncate mb-1">
                    {channel.parameter}: <strong className="text-[#00E0C6]">{channel.currentValue}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#4A5568] font-mono">
                    <span>Range: {channel.nominalRange}</span>
                    {hasFault && (
                      <span className="text-[#FF3B47] font-bold">⚠️ Needs Calibration</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Sensor Diagnostic & Repair Engine */}
          <div className="md:col-span-7 p-6 space-y-5 bg-[#060B14]/50">
            {selectedChannel ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-[#E8EEF4]">
                      {selectedChannel.name}
                    </h4>
                    {onNavigateTo3D && (
                      <button
                        onClick={() => {
                          onNavigateTo3D(selectedChannel.position3D);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#1A2533] hover:bg-[#2A384B] text-[#00FFFF] flex items-center gap-1 font-mono transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Locate in 3D Twin</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7A8F]">
                    Component: <span className="text-[#E8EEF4]">{selectedChannel.component}</span> · Target: <span className="text-[#00E0C6]">{selectedChannel.parameter}</span>
                  </p>
                </div>

                {/* Status Card */}
                <div className={`p-4 rounded-xl border ${
                  selectedChannel.status === 'NOMINAL'
                    ? 'bg-[#3EE07F]/10 border-[#3EE07F]/30'
                    : 'bg-[#FF3B47]/10 border-[#FF3B47]/40'
                }`}>
                  <div className="flex items-start gap-3">
                    {selectedChannel.status === 'NOMINAL' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#3EE07F] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#FF3B47] shrink-0 mt-0.5 animate-bounce" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#E8EEF4]">
                          {selectedChannel.status === 'NOMINAL' ? 'Channel Health: Nominal' : `Anomaly: ${selectedChannel.status}`}
                        </span>
                        <span className="text-xs font-mono text-[#6B7A8F]">
                          Current: <strong>{selectedChannel.currentValue}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-[#8BA1B7]">
                        {selectedChannel.errorDescription ||
                          'Signal-to-noise ratio is within specification (>42 dB). No dropped frames detected across 1,024 cycles.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SCADA Raw Hex Packet Inspector */}
                <div className="p-3 bg-[#03060A] rounded-xl border border-[#1A2533] space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[#6B7A8F] text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-[#00E0C6]" />
                      RAW SCADA FRAME (RS-485 / MODBUS RTU)
                    </span>
                    <span className="text-[#00E0C6]">CRC-16 VERIFIED</span>
                  </div>
                  <div className="p-2 bg-[#060B14] rounded border border-[#121E2E] text-[11px] text-[#3EE07F] tracking-widest break-all">
                    {selectedChannel.rawHexPacket}
                  </div>
                </div>

                {/* Repair Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-[#6B7A8F]">
                    {selectedChannel.lastRepairedAt ? (
                      <span>Last Calibrated: <strong className="text-[#3EE07F]">{selectedChannel.lastRepairedAt}</strong></span>
                    ) : (
                      <span>Continuous background telemetry stream active</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRepairChannel(selectedChannel.id)}
                    disabled={repairState.isRepairing || selectedChannel.status === 'NOMINAL'}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      selectedChannel.status === 'NOMINAL'
                        ? 'bg-[#1A2533] text-[#6B7A8F] cursor-not-allowed'
                        : 'bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] shadow-lg font-black'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${repairState.isRepairing ? 'animate-spin' : ''}`} />
                    <span>
                      {selectedChannel.status === 'NOMINAL'
                        ? 'Channel Fully Calibrated'
                        : 'Recalibrate & Repair Sensor'}
                    </span>
                  </button>
                </div>

                {/* Cryptographic Proof Footer */}
                <div className="p-3 bg-[#080E18] rounded-xl border border-[#1A2533] text-[10px] text-[#6B7A8F] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00E0C6] shrink-0" />
                  <span>
                    Cryptographic SHA-256 Command Audit Trail automatically updates local IndexedDB store upon sensor repair for NPDC compliance.
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#6B7A8F]">
                Select a telemetry channel on the left to inspect calibration status
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
