/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Vehicle Log Screen (Heavy Machinery Pre-Trip Checklist)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { fieldDb } from '../../db/fieldDb';
import { ArrowLeft, Check, CheckCircle2, Truck, Camera, Fuel, Gauge, AlertTriangle } from 'lucide-react';

interface VehicleLogScreenProps {
  activeStation: StationId;
  onBack: () => void;
}

type VehicleType = 'PistenBully' | 'Snow Scooter' | 'ATV Quad' | 'Hägglunds Carrier' | 'Snow Blower';

export const VehicleLogScreen: React.FC<VehicleLogScreenProps> = ({ activeStation, onBack }) => {
  const [vehicle, setVehicle] = useState<VehicleType>('PistenBully');
  const [fuelPct, setFuelPct] = useState(85);
  const [hoursUsed, setHoursUsed] = useState('2.5');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [checklist, setChecklist] = useState({
    tracksInspected: true,
    engineFluidChecked: true,
    radioCommOperational: true,
    emergencyRationsLoaded: true
  });

  const vehicles: VehicleType[] = [
    'PistenBully',
    'Snow Scooter',
    'ATV Quad',
    'Hägglunds Carrier',
    'Snow Blower'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fieldDb.vehicle_logs.add({
      id: `veh-${Date.now()}`,
      stationId: activeStation,
      vehicleType: vehicle,
      driverName: 'Lead Traverse Pilot',
      fuelLevel: fuelPct,
      engineHours: parseFloat(hoursUsed) || 0,
      inspectionPassed: checklist.tracksInspected && checklist.engineFluidChecked && checklist.radioCommOperational,
      notes: `Pre-trip check complete. Rations: ${checklist.emergencyRationsLoaded ? 'VERIFIED' : 'PENDING'}`,
      timestamp: new Date().toISOString(),
      synced: false
    });

    setSubmitted(true);
    setTimeout(() => onBack(), 2000);
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
        <h2 className="antarctic-text-heading text-[#FFFFFF]">VEHICLE DISPATCH LOG</h2>
      </div>

      {submitted ? (
        <div className="antarctic-card border-[#00FF00] p-12 text-center space-y-6">
          <CheckCircle2 className="w-24 h-24 text-[#00FF00] mx-auto" />
          <h3 className="antarctic-text-giant text-[#00FF00]">VEHICLE DISPATCH LOGGED</h3>
          <p className="antarctic-text-body text-[#AAAAAA]">
            Pre-trip safety clearance confirmed for {vehicle}. Stored in IndexedDB vehicle roster.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* VEHICLE SELECTOR WITH LARGE ICONS */}
          <div>
            <label className="antarctic-text-body text-[#FFD700] block mb-3">
              SELECT POLAR FLEET UNIT:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {vehicles.map(v => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVehicle(v)}
                  className={`antarctic-button h-[90px] flex flex-col items-center justify-center p-2 text-center ${
                    vehicle === v ? 'antarctic-button-active' : ''
                  }`}
                >
                  <Truck className="w-8 h-8 mb-1" />
                  <span className="text-[14pt] leading-tight font-bold">{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PRE-TRIP INSPECTION CHECKLIST WITH 64x64px CHECKBOXES */}
          <div className="antarctic-card space-y-4">
            <h3 className="antarctic-text-heading text-[#00FFFF] border-b-2 border-[#333333] pb-2">
              PRE-TRIP MECHANICAL SAFETY CHECKLIST
            </h3>

            {[
              { key: 'tracksInspected' as const, label: 'RUBBER / METAL TRACK TENSION & TREAD CLEANED' },
              { key: 'engineFluidChecked' as const, label: 'SUBZERO SYNTHETIC OIL & GLYCOL COOLANT VERIFIED' },
              { key: 'radioCommOperational' as const, label: 'UHF TACTICAL CH-05 TRAVERSE RADIO TESTED' },
              { key: 'emergencyRationsLoaded' as const, label: '72-HOUR SURVIVAL RATIONS & TENT LOADED' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`antarctic-checkbox shrink-0 ${checklist[item.key] ? 'checked' : ''}`}
                >
                  {checklist[item.key] && <Check className="w-12 h-12 stroke-[4]" />}
                </button>
                <span className="antarctic-text-body text-[#FFFFFF]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* FUEL LEVEL & HOURS USED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="antarctic-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="antarctic-text-body text-[#AAAAAA] flex items-center gap-2">
                  <Fuel className="w-6 h-6 text-[#FFD700]" />
                  <span>JET A-1 / DIESEL FUEL:</span>
                </span>
                <span className="antarctic-text-mono text-[#FFD700] text-[24pt]">{fuelPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fuelPct}
                onChange={(e) => setFuelPct(parseInt(e.target.value))}
                className="w-full h-8 accent-[#FFD700] cursor-pointer"
              />
            </div>

            <div className="antarctic-card space-y-2">
              <label className="antarctic-text-body text-[#AAAAAA] flex items-center gap-2">
                <Gauge className="w-6 h-6 text-[#00FFFF]" />
                <span>PLANNED TRAVERSE DURATION (HOURS):</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={hoursUsed}
                onChange={(e) => setHoursUsed(e.target.value)}
                className="antarctic-input text-[24pt]"
              />
            </div>
          </div>

          {/* PHOTO ATTACHMENT */}
          <button
            type="button"
            onClick={() => setPhotoTaken(!photoTaken)}
            className={`antarctic-button w-full h-[70px] ${photoTaken ? 'antarctic-button-active' : ''}`}
          >
            <Camera className="w-8 h-8 mr-4" />
            <span>{photoTaken ? 'VEHICLE CONDITION PHOTO ATTACHED' : 'ATTACH VEHICLE CONDITION PHOTO'}</span>
          </button>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="antarctic-button w-full h-[90px] bg-[#00FF00] text-[#000000] border-[#00FF00] hover:bg-[#FFFFFF]"
          >
            <span className="antarctic-text-heading">SUBMIT TRAVERSE CLEARANCE</span>
          </button>
        </form>
      )}
    </div>
  );
};
