/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 1: Alert Triage & Incident Matrix
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { StationId, AlertRecord } from '../../types';
import { db } from '../../db/dexieDb';
import { AlertCircle, AlertOctagon, CheckCircle2, ChevronRight, Clock, Filter, Flame, Info, ShieldAlert } from 'lucide-react';
import { appendAuditLog } from '../../services/auditService';

interface AlertTriageScreenProps {
  activeStation: StationId;
  userRole: string;
}

export const AlertTriageScreen: React.FC<AlertTriageScreenProps> = ({ activeStation, userRole }) => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterSubsystem, setFilterSubsystem] = useState<string>('ALL');

  const loadAlerts = async () => {
    const list = await db.alerts.toArray();
    setAlerts(list);
    if (list.length > 0 && !selectedAlert) {
      setSelectedAlert(list[0]);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    await db.alerts.update(alertId, { acknowledged: true });
    await appendAuditLog(
      activeStation.toUpperCase(),
      `User (${userRole})`,
      'ALERT_ACKNOWLEDGE',
      `Acknowledged alert ${alertId}`
    );
    loadAlerts();
  };

  const handleResolve = async (alertId: string) => {
    await db.alerts.update(alertId, { resolved: true, acknowledged: true });
    await appendAuditLog(
      activeStation.toUpperCase(),
      `User (${userRole})`,
      'ALERT_RESOLVE',
      `Resolved alert ${alertId} according to SOP`
    );
    loadAlerts();
  };

  // Tier counts
  const tier1Count = alerts.filter(a => a.severity.includes('Tier 1') && !a.resolved).length;
  const tier2Count = alerts.filter(a => a.severity.includes('Tier 2') && !a.resolved).length;
  const tier3Count = alerts.filter(a => a.severity.includes('Tier 3') && !a.resolved).length;
  const tier4Count = alerts.filter(a => a.severity.includes('Tier 4') && !a.resolved).length;

  const filtered = alerts.filter(a => {
    const matchTier = filterTier === 'ALL' || a.severity.includes(filterTier);
    const matchSub = filterSubsystem === 'ALL' || a.subsystem.toLowerCase().includes(filterSubsystem.toLowerCase());
    return matchTier && matchSub;
  });

  const subsystems = ['ALL', 'Water', 'Microgrid', 'Comms', 'Environmental'];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Alert Triage & Incident Matrix
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Real-time SCADA anomaly arbitration, Madrid Protocol fail-safes, and Standard Operating Procedures (SOPs).
        </p>
      </div>

      {/* 4 TIER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1 */}
        <div 
          onClick={() => setFilterTier(filterTier === 'Tier 1' ? 'ALL' : 'Tier 1')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterTier === 'Tier 1'
              ? 'bg-[#FF3B47]/20 border-[#FF3B47]'
              : 'bg-[#0A121E] border-[#1A2533] hover:border-[#FF3B47]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#FF3B47] uppercase tracking-wider">Tier 1 · Life Safety & Freeze</span>
            <AlertOctagon className="w-5 h-5 text-[#FF3B47]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#FF3B47] mt-2">
            {tier1Count} <span className="text-xs font-normal text-[#6B7A8F]">Active</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            45-min freeze risk & habitat breaches
          </div>
        </div>

        {/* Tier 2 */}
        <div 
          onClick={() => setFilterTier(filterTier === 'Tier 2' ? 'ALL' : 'Tier 2')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterTier === 'Tier 2'
              ? 'bg-[#FFB020]/20 border-[#FFB020]'
              : 'bg-[#0A121E] border-[#1A2533] hover:border-[#FFB020]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#FFB020] uppercase tracking-wider">Tier 2 · Mission Critical</span>
            <Flame className="w-5 h-5 text-[#FFB020]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#FFB020] mt-2">
            {tier2Count} <span className="text-xs font-normal text-[#6B7A8F]">Active</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            CHP / DG deviation & primary power bus
          </div>
        </div>

        {/* Tier 3 */}
        <div 
          onClick={() => setFilterTier(filterTier === 'Tier 3' ? 'ALL' : 'Tier 3')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterTier === 'Tier 3'
              ? 'bg-[#4A9EFF]/20 border-[#4A9EFF]'
              : 'bg-[#0A121E] border-[#1A2533] hover:border-[#4A9EFF]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4A9EFF] uppercase tracking-wider">Tier 3 · Degraded Ops</span>
            <AlertCircle className="w-5 h-5 text-[#4A9EFF]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#4A9EFF] mt-2">
            {tier3Count} <span className="text-xs font-normal text-[#6B7A8F]">Active</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            VSAT SNR drop, trace cycle anomalies
          </div>
        </div>

        {/* Tier 4 */}
        <div 
          onClick={() => setFilterTier(filterTier === 'Tier 4' ? 'ALL' : 'Tier 4')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterTier === 'Tier 4'
              ? 'bg-[#3EE07F]/20 border-[#3EE07F]'
              : 'bg-[#0A121E] border-[#1A2533] hover:border-[#3EE07F]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3EE07F] uppercase tracking-wider">Tier 4 · Routine & Advisory</span>
            <Info className="w-5 h-5 text-[#3EE07F]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#3EE07F] mt-2">
            {tier4Count} <span className="text-xs font-normal text-[#6B7A8F]">Active</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Katabatic wind advisories, routine maintenance
          </div>
        </div>
      </div>

      {/* FILTER TABS & SUBSYSTEM CHIPS */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00E0C6]" />
          <span className="text-xs text-[#6B7A8F] uppercase font-semibold">Subsystem Filter:</span>
          <div className="flex flex-wrap items-center gap-1">
            {subsystems.map(sub => (
              <button
                key={sub}
                onClick={() => setFilterSubsystem(sub)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  filterSubsystem === sub
                    ? 'bg-[#00E0C6] text-[#060B14]'
                    : 'text-[#6B7A8F] hover:text-[#E8EEF4] bg-[#060B14]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#6B7A8F]">
          Showing <span className="font-mono text-[#E8EEF4] font-bold">{filtered.length}</span> recorded incidents
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: INCIDENT QUEUE (LEFT) + SOP DISPATCH (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Incident Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.map(alert => {
            const isSelected = selectedAlert?.id === alert.id;
            const isCrit = alert.severity.includes('Tier 1');
            const isHigh = alert.severity.includes('Tier 2');

            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0E1B2D] border-[#00E0C6]'
                    : 'bg-[#0A121E] border-[#1A2533] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        isCrit ? 'bg-[#FF3B47]/20 text-[#FF3B47] border border-[#FF3B47]/40' :
                        isHigh ? 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40' :
                        'bg-[#4A9EFF]/20 text-[#4A9EFF] border border-[#4A9EFF]/40'
                      }`}>
                        {alert.severity.split(' - ')[0]}
                      </span>
                      <span className="text-xs font-mono text-[#6B7A8F]">{alert.incidentId}</span>
                      <span className="text-xs text-[#6B7A8F]">· {alert.subsystem}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#E8EEF4] mt-2">
                      {alert.message}
                    </h4>

                    <div className="text-xs font-mono text-[#00E0C6] mt-2 bg-[#060B14] p-2 rounded border border-[#1A2533]">
                      {alert.sensorReading}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[11px] text-[#6B7A8F] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {alert.resolved ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#3EE07F]/20 text-[#3EE07F] rounded">
                        RESOLVED
                      </span>
                    ) : alert.acknowledged ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFB020]/20 text-[#FFB020] rounded">
                        ACKNOWLEDGED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF3B47]/20 text-[#FF3B47] rounded animate-pulse">
                        UNRESOLVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right SOP Execution Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 flex flex-col justify-between">
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="border-b border-[#1A2533] pb-3">
                <div className="text-xs font-mono text-[#00E0C6] uppercase tracking-wider">
                  NCPOR Standard Operating Procedure
                </div>
                <h3 className="text-base font-bold text-[#E8EEF4] mt-1">
                  Incident Action Protocol: {selectedAlert.incidentId}
                </h3>
                <div className="text-xs text-[#6B7A8F] mt-0.5">
                  Assigned Station: <span className="uppercase text-[#E8EEF4] font-semibold">{selectedAlert.stationId}</span> · Equipment: <span className="font-mono text-[#E8EEF4]">{selectedAlert.equipmentId}</span>
                </div>
              </div>

              {/* Actuator State */}
              <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533]">
                <div className="text-[11px] text-[#6B7A8F] uppercase tracking-wider font-semibold">
                  Actuator / Fail-Safe State
                </div>
                <div className="text-xs font-mono text-[#FFD700] mt-1">
                  {selectedAlert.actuatorState}
                </div>
              </div>

              {/* Step-by-Step SOP Steps */}
              <div>
                <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider mb-2">
                  Mandatory Execution Steps (ATS Madrid Protocol)
                </div>
                <ol className="space-y-2">
                  {selectedAlert.sopSteps.map((step, idx) => (
                    <li 
                      key={idx}
                      className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-xs text-[#E8EEF4] flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded bg-[#00E0C6]/20 text-[#00E0C6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#1A2533] flex items-center gap-3">
                {!selectedAlert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="flex-1 py-2 px-3 bg-[#FFB020] hover:bg-[#FFB020]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider"
                  >
                    Acknowledge Anomaly
                  </button>
                )}
                {!selectedAlert.resolved ? (
                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="flex-1 py-2 px-3 bg-[#3EE07F] hover:bg-[#3EE07F]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete SOP & Resolve</span>
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 bg-[#3EE07F]/10 border border-[#3EE07F]/30 text-[#3EE07F] text-xs font-semibold text-center rounded">
                    Incident SOP Verified & Closed into Audit Ledger
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-[#6B7A8F]">
              Select an incident from the queue to view procedural SOP steps
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
