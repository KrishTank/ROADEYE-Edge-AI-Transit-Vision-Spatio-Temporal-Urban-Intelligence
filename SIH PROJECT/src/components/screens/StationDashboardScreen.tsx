/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 2: Station Dashboard (Personnel, Habitat & Vitals)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { StationId, PersonnelRecord } from '../../types';
import { db } from '../../db/dexieDb';
import { STATIONS_DATA } from '../../data/stationConstants';
import { Activity, Heart, Moon, Radio, Shield, Thermometer, Users, Wind } from 'lucide-react';

interface StationDashboardScreenProps {
  activeStation: StationId;
}

export const StationDashboardScreen: React.FC<StationDashboardScreenProps> = ({ activeStation }) => {
  const [personnel, setPersonnel] = useState<PersonnelRecord[]>([]);
  const [filterShift, setFilterShift] = useState<string>('ALL');

  const station = STATIONS_DATA[activeStation];

  useEffect(() => {
    const loadPersonnel = async () => {
      const list = await db.personnel.toArray();
      setPersonnel(list);
    };
    loadPersonnel();
  }, [activeStation]);

  const filtered = personnel.filter(p => {
    if (filterShift === 'ALL') return true;
    return p.dutyShift.toLowerCase().includes(filterShift.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          {station.name} · Personnel & Habitat Telemetry
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Real-time crew biometric tracking, circadian light phase management, and RFID muster zone monitoring.
        </p>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Roster */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Crew On Station</span>
            <Users className="w-5 h-5 text-[#00E0C6]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#E8EEF4] mt-2">
            {personnel.length} <span className="text-xs font-normal text-[#6B7A8F]">/ {station.capacity} Berths</span>
          </div>
          <div className="text-[11px] text-[#3EE07F] mt-1 flex items-center gap-1 font-semibold">
            <span>● 100% RFID Beacons Synchronized</span>
          </div>
        </div>

        {/* KPI 2: Circadian Stability */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Circadian Index</span>
            <Moon className="w-5 h-5 text-[#4A9EFF]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#4A9EFF] mt-2">
            92.4% <span className="text-xs font-normal text-[#6B7A8F]">Stability</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Dynamic 450nm blue spectrum LED cycle active
          </div>
        </div>

        {/* KPI 3: Habitat Environment */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Habitat Climate</span>
            <Thermometer className="w-5 h-5 text-[#FFB020]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#E8EEF4] mt-2">
            +21.2 °C <span className="text-xs font-normal text-[#6B7A8F]">· 48% RH</span>
          </div>
          <div className="text-[11px] text-[#3EE07F] mt-1 font-semibold">
            CO2 Nominal: 520 ppm
          </div>
        </div>

        {/* KPI 4: Medical Reserves */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Emergency Medical Bay</span>
            <Heart className="w-5 h-5 text-[#FF3B47]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#3EE07F] mt-2">
            100% <span className="text-xs font-normal text-[#6B7A8F]">Readiness</span>
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Hyperbaric chamber primed · O2 4,800L
          </div>
        </div>
      </div>

      {/* PERSONNEL ROSTER TABLE */}
      <div className="bg-[#0A121E] rounded-xl border border-[#1A2533] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2533] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
              Wintering Crew Roster & Biometric Telemetry
            </h3>
            <span className="text-xs text-[#6B7A8F]">
              RFID zone localization with heart rate and pulse oximeter uplinks
            </span>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-lg border border-[#1A2533]">
            {['ALL', 'Alpha', 'Bravo', 'Charlie'].map(shift => (
              <button
                key={shift}
                onClick={() => setFilterShift(shift)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  filterShift === shift
                    ? 'bg-[#00E0C6] text-[#060B14]'
                    : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
                }`}
              >
                {shift === 'ALL' ? 'All Shifts' : `${shift} Shift`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2533] text-[#6B7A8F] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Personnel / Badge</th>
                <th className="py-3 px-3">Operational Role</th>
                <th className="py-3 px-3">Current RFID Sector</th>
                <th className="py-3 px-3">Tactical UHF</th>
                <th className="py-3 px-3">Duty Shift</th>
                <th className="py-3 px-3">Vitals (HR / SpO2 / Temp)</th>
                <th className="py-3 px-3">Medical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2533]/50">
              {filtered.map(person => (
                <tr key={person.id} className="hover:bg-[#0E1B2D] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#E8EEF4]">{person.name}</div>
                    <div className="font-mono text-[10px] text-[#6B7A8F]">{person.badgeId}</div>
                  </td>
                  <td className="py-3 px-3 text-[#E8EEF4]">
                    {person.role}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      person.rfidStatus.includes('Field Expedition')
                        ? 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40'
                        : 'bg-[#00E0C6]/10 text-[#00E0C6] border border-[#00E0C6]/30'
                    }`}>
                      {person.rfidStatus}
                    </span>
                    <div className="text-[10px] text-[#6B7A8F] mt-0.5">{person.lastSync}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#4A9EFF]">
                    {person.uhfChannel}
                  </td>
                  <td className="py-3 px-3 text-[#6B7A8F]">
                    {person.dutyShift}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-[#3EE07F] font-bold">{person.vitals.heartRate} bpm</span> ·{' '}
                    <span className="text-[#00E0C6]">{person.vitals.oxygenSat}% O2</span> ·{' '}
                    <span className="text-[#E8EEF4]">{person.vitals.coreTemp}°C</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      person.medStatus === 'Fit for Duty'
                        ? 'bg-[#3EE07F]/20 text-[#3EE07F]'
                        : 'bg-[#FFB020]/20 text-[#FFB020]'
                    }`}>
                      {person.medStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HABITAT MUSTER & EVACUATION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Primary Muster Point
          </div>
          <div className="text-sm font-semibold text-[#00E0C6] mt-1">
            Central Dining Hall & Galley (Airlock A-1)
          </div>
          <p className="text-xs text-[#6B7A8F] mt-1">
            Structural fire-wall rating 120 minutes. Equipped with satellite emergency beacon and direct trace pipeline access.
          </p>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Secondary Evacuation Shelter
          </div>
          <div className="text-sm font-semibold text-[#FFB020] mt-1">
            {activeStation === 'maitri' ? 'Summer Camp Module Cluster B' : 'Emergency Survival Container Bay 4'}
          </div>
          <p className="text-xs text-[#6B7A8F] mt-1">
            Autonomous battery bank with independent diesel-fired air heater and 14 days of freeze-dried rations.
          </p>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Traverse Safety Envelope
          </div>
          <div className="text-sm font-semibold text-[#3EE07F] mt-1">
            Corridor Clear to Novo Airfield (5.5 km)
          </div>
          <p className="text-xs text-[#6B7A8F] mt-1">
            Crevasse radar surveys updated weekly. Surface boundary flags inspected at 200m intervals.
          </p>
        </div>
      </div>
    </div>
  );
};
