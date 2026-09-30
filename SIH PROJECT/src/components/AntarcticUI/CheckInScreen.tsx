/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Check-In Screen (400x200px "I AM SAFE" Touch Target)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { ArrowLeft, CheckCircle2, ShieldCheck, Heart, MapPin, Clock } from 'lucide-react';
import { fieldDb } from '../../db/fieldDb';

interface CheckInScreenProps {
  activeStation: StationId;
  onBack: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ activeStation, onBack }) => {
  const station = STATIONS_DATA[activeStation];
  const [healthStatus, setHealthStatus] = useState<'Good' | 'Tired' | 'Unwell'>('Good');
  const [locationNote, setLocationNote] = useState('Priyadarshini Pipeline Corridor');
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null);

  const handleCheckIn = async () => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC';
    setCheckedInTime(timeStr);

    // Save check-in to IndexedDB
    await fieldDb.field_reports.add({
      id: `chk-${Date.now()}`,
      stationId: activeStation,
      category: 'Safety',
      priority: 'Low',
      priorityNumber: 3, // Checkin = Priority 3
      description: `CHECK-IN: Field operative confirmed SAFE. Health: ${healthStatus}. Location: ${locationNote}`,
      gpsLocation: `${station.latitude.toFixed(4)}°S, ${station.longitude.toFixed(4)}°E`,
      timestamp: new Date().toISOString(),
      photoAttached: false,
      synced: false
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
        <button
          onClick={onBack}
          className="antarctic-button h-[64px] px-6 flex items-center gap-3"
        >
          <ArrowLeft className="w-8 h-8 text-[#FFD700]" />
          <span>BACK</span>
        </button>
        <h2 className="antarctic-text-heading text-[#FFFFFF]">PERSONNEL SAFETY CHECK-IN</h2>
      </div>

      {checkedInTime ? (
        <div className="antarctic-card border-[#00FF00] p-12 text-center space-y-6">
          <CheckCircle2 className="w-24 h-24 text-[#00FF00] mx-auto" />
          <h3 className="antarctic-text-giant text-[#00FF00]">CHECK-IN BROADCAST CONFIRMED</h3>
          <div className="antarctic-text-mono text-[#FFFFFF]">
            RECORDED AT: {checkedInTime}
          </div>
          <p className="antarctic-text-body text-[#AAAAAA]">
            Your location has been verified by the Command Tactical Net. Next scheduled welfare check-in required in 120 minutes.
          </p>
          <button
            onClick={onBack}
            className="antarctic-button w-full h-[70px] mt-6"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          {/* GIANT 400x200px "I AM SAFE" BUTTON */}
          <button
            type="button"
            onClick={handleCheckIn}
            className="w-[400px] max-w-full h-[200px] bg-[#00FF00] text-[#000000] border-4 border-[#FFFFFF] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#FFFFFF] hover:text-[#000000] transition-transform active:scale-95"
          >
            <ShieldCheck className="w-20 h-20" />
            <span className="antarctic-text-giant text-[#000000] tracking-wider">
              I AM SAFE
            </span>
          </button>

          {/* TELEMETRY READOUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="antarctic-card flex items-center gap-4">
              <MapPin className="w-10 h-10 text-[#00FFFF] shrink-0" />
              <div>
                <div className="antarctic-text-body text-[#AAAAAA]">GPS SATELLITE FIX:</div>
                <div className="antarctic-text-mono text-[#00FFFF] text-[20pt]">
                  {station.latitude.toFixed(4)}°S, {station.longitude.toFixed(4)}°E
                </div>
              </div>
            </div>

            <div className="antarctic-card flex items-center gap-4">
              <Clock className="w-10 h-10 text-[#FFD700] shrink-0" />
              <div>
                <div className="antarctic-text-body text-[#AAAAAA]">TIMESTAMP:</div>
                <div className="antarctic-text-mono text-[#FFD700] text-[20pt]">
                  {new Date().toLocaleTimeString('en-GB', { hour12: false })} UTC
                </div>
              </div>
            </div>
          </div>

          {/* HEALTH STATUS SELECTOR */}
          <div className="w-full">
            <label className="antarctic-text-body text-[#FFD700] block mb-3">
              FITNESS & PHYSIOLOGICAL STATUS:
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['Good', 'Tired', 'Unwell'] as const).map(status => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setHealthStatus(status)}
                  className={`antarctic-button h-[70px] ${
                    healthStatus === status ? 'antarctic-button-active' : ''
                  }`}
                >
                  <Heart className={`w-6 h-6 mr-2 ${status === 'Unwell' ? 'text-[#FF0000]' : 'text-[#00FF00]'}`} />
                  <span>{status.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION NOTE */}
          <div className="w-full">
            <label className="antarctic-text-body text-[#FFD700] block mb-2">
              FIELD SECTOR / HABITAT NOTE:
            </label>
            <input
              type="text"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              className="antarctic-input"
            />
          </div>
        </div>
      )}
    </div>
  );
};
