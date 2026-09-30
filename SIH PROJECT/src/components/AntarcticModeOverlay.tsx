/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic High-Visibility Extreme Climate Mode Component
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../types';
import { STATIONS_DATA } from '../data/stationConstants';
import { AlertTriangle, BatteryCharging, Mic, Power, Radio, ShieldAlert, Thermometer, Wind, X } from 'lucide-react';
import { mqttClient } from '../services/mqttService';

interface AntarcticModeOverlayProps {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  onExit: () => void;
  onTriggerSos: () => void;
}

export const AntarcticModeOverlay: React.FC<AntarcticModeOverlayProps> = ({
  activeStation,
  temperature,
  windSpeed,
  onExit,
  onTriggerSos
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [sosActive, setSosActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [confirmExit, setConfirmExit] = useState(false);

  const station = STATIONS_DATA[activeStation];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSosClick = async () => {
    setSosActive(true);
    // Transmit emergency priority 1 SOS over MQTT / IndexedDB
    await mqttClient.publish(`dhruvatwin/alerts/${activeStation}/SOS`, {
      type: 'LIFE_SAFETY_SOS',
      station: activeStation,
      timestamp: Date.now(),
      vitals: 'DISTRESS BEACON BROADCAST'
    }, 1);
    onTriggerSos();
  };

  const handleVoiceToggle = () => {
    if (!voiceListening) {
      setVoiceListening(true);
      setVoiceTranscript('Listening... say "Report Status" or "Check Water Pipeline"');
      setTimeout(() => {
        setVoiceTranscript('Voice Command Recognized: "CHECK WATER PIPELINE TRACE" -> Reading Nominal +1.8°C');
        setVoiceListening(false);
      }, 3000);
    } else {
      setVoiceListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#FFFFFF] flex flex-col p-6 select-none overflow-y-auto antarctic-mode">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP EMERGENCY STRIP: Temp (left), Time (center), Wind (right) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b-4 border-[#FFFFFF]">
        {/* Top-Left: Temperature (32pt) */}
        <div className="flex items-center gap-4">
          <Thermometer className="w-12 h-12 text-[#FFD700]" />
          <div>
            <div className="text-[18pt] uppercase font-bold text-[#FFFFFF]">Station Temp</div>
            <div className="text-[32pt] font-mono font-extrabold text-[#FFD700] leading-none">
              {temperature} °C
            </div>
          </div>
        </div>

        {/* Top-Center: Current Time (24pt) */}
        <div className="text-center">
          <div className="text-[18pt] font-bold text-[#FFFFFF] uppercase tracking-wider">
            {station.name}
          </div>
          <div className="text-[28pt] font-mono font-black text-[#FFFFFF] tracking-widest mt-1">
            {currentTime} UTC
          </div>
          <div className="text-[18pt] text-[#00FF00] font-bold mt-1">
            ANTARCTIC HIGH-VISIBILITY MODE: ACTIVE
          </div>
        </div>

        {/* Top-Right: Wind Speed (32pt) & Battery (24pt) */}
        <div className="flex items-center gap-8 text-right">
          <div>
            <div className="text-[18pt] uppercase font-bold text-[#FFFFFF]">Katabatic Wind</div>
            <div className="text-[32pt] font-mono font-extrabold text-[#FFD700] leading-none">
              {windSpeed} km/h
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-[24pt] font-mono font-bold text-[#00FF00]">
              <BatteryCharging className="w-8 h-8 text-[#00FF00]" />
              <span>98%</span>
            </div>
            <span className="text-[14pt] uppercase text-[#FFFFFF]">UPS Reserves</span>
          </div>

          <button
            onClick={() => setConfirmExit(true)}
            className="px-6 py-3 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] rounded text-[18pt] font-bold hover:bg-[#FFFFFF] hover:text-[#000000] transition-colors"
          >
            Exit High-Vis
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4 CORE ESSENTIAL PANELS: Generators, Fuel, Water Flow, Alerts */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        {/* 1. Generator / Power Status */}
        <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded flex flex-col justify-between">
          <div>
            <div className="text-[18pt] font-bold uppercase tracking-wider text-[#FFFFFF]">1. Generator Status</div>
            <div className="text-[28pt] font-mono font-black text-[#00FF00] mt-3">
              {activeStation === 'bharati' ? 'CHP-01 & CHP-02 ONLINE' : 'DG-01 & DG-02 ONLINE'}
            </div>
            <p className="text-[18pt] text-[#FFFFFF] mt-4 leading-relaxed">
              Load: <span className="font-mono text-[24pt] text-[#FFD700] font-bold">102 kW</span> (Nominal 68%)
            </p>
          </div>
          <div className="mt-4 p-4 border-2 border-[#00FF00] text-[18pt] font-bold text-[#00FF00] uppercase">
            Microgrid Synch Bus: LOCKED
          </div>
        </div>

        {/* 2. Fuel Level */}
        <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded flex flex-col justify-between">
          <div>
            <div className="text-[18pt] font-bold uppercase tracking-wider text-[#FFFFFF]">2. Fuel Level</div>
            <div className="text-[28pt] font-mono font-black text-[#FFD700] mt-3">
              {activeStation === 'bharati' ? '264,000 L (88%)' : '142,500 L (79%)'}
            </div>
            <p className="text-[18pt] text-[#FFFFFF] mt-4 leading-relaxed">
              Reserves: <span className="font-mono text-[24pt] text-[#FFFFFF] font-bold">14.2 Months</span> Autonomy
            </p>
          </div>
          <div className="mt-4 p-4 border-2 border-[#FFFFFF] text-[18pt] font-bold text-[#FFFFFF] uppercase">
            Day Feed Tank: FULL
          </div>
        </div>

        {/* 3. Water Flow & Freeze Safety */}
        <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded flex flex-col justify-between">
          <div>
            <div className="text-[18pt] font-bold uppercase tracking-wider text-[#FFFFFF]">3. Water Flow / Freeze</div>
            <div className="text-[28pt] font-mono font-black text-[#00FF00] mt-3">
              +1.8 °C (SAFE)
            </div>
            <p className="text-[18pt] text-[#FFFFFF] mt-4 leading-relaxed">
              {activeStation === 'maitri' 
                ? 'Lake Priyadarshini Trace Heating: Active' 
                : 'Thala Fjord Seawater Intake: Heated'}
            </p>
          </div>
          <div className="mt-4 p-4 border-2 border-[#FFD700] text-[18pt] font-bold text-[#FFD700] uppercase">
            Flow: 22 LPM Continuous
          </div>
        </div>

        {/* 4. Active Alert Summary */}
        <div className="p-6 bg-[#000000] border-4 border-[#FF0000] rounded flex flex-col justify-between">
          <div>
            <div className="text-[18pt] font-bold uppercase tracking-wider text-[#FF0000] flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-[#FF0000]" />
              <span>4. Tactical Incident</span>
            </div>
            <div className="text-[22pt] font-black text-[#FF0000] mt-3 leading-snug">
              {activeStation === 'maitri'
                ? 'Trace Loop 2 Amp Deviation (+14 min)'
                : 'Katabatic Surge Warning: Gusts > 80 km/h'}
            </div>
          </div>
          <div className="mt-4 p-4 bg-[#FF0000] text-[#000000] text-[18pt] font-black uppercase text-center">
            SOP PROTOCOL PRIMED
          </div>
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BOTTOM ACTION BAR: Voice Input & 200x200px SOS BUTTON */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="pt-6 border-t-4 border-[#FFFFFF] flex flex-wrap items-center justify-between gap-6">
        {/* Voice Input Button */}
        <div className="flex-1 max-w-xl">
          <button
            onClick={handleVoiceToggle}
            className={`w-full py-5 px-8 flex items-center justify-center gap-4 text-[20pt] font-black uppercase rounded border-4 transition-all ${
              voiceListening
                ? 'bg-[#FFD700] text-[#000000] border-[#FFD700] animate-pulse'
                : 'bg-[#000000] text-[#FFFFFF] border-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]'
            }`}
          >
            <Mic className="w-10 h-10" />
            <span>{voiceListening ? 'Listening for Command...' : 'Voice Command (Hands-Free)'}</span>
          </button>
          {voiceTranscript && (
            <div className="mt-3 p-3 bg-[#000000] border-2 border-[#FFD700] text-[#FFD700] text-[16pt] font-mono font-bold">
              {voiceTranscript}
            </div>
          )}
        </div>

        {/* UHF Tactical Channel Quick Switch */}
        <div className="flex items-center gap-4">
          <Radio className="w-10 h-10 text-[#FFD700]" />
          <div>
            <div className="text-[16pt] uppercase font-bold text-[#FFFFFF]">Tactical Radio</div>
            <div className="text-[22pt] font-mono font-black text-[#FFD700]">CH-01 COMMAND</div>
          </div>
        </div>

        {/* CRITICAL FEATURE: 200x200px SOS BUTTON WITH RED PULSING GLOW */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSosClick}
            aria-label="Distress SOS Emergency Beacon"
            className={`w-[200px] h-[200px] rounded-full bg-[#FF0000] text-[#FFFFFF] border-8 border-[#FFFFFF] flex flex-col items-center justify-center p-4 transition-all animate-emergency-pulse active:scale-95 cursor-pointer shadow-2xl ${
              sosActive ? 'bg-[#990000] border-[#FFD700]' : ''
            }`}
          >
            <ShieldAlert className="w-20 h-20 text-[#FFFFFF]" />
            <span className="text-[28pt] font-black tracking-widest leading-none mt-2">
              SOS
            </span>
            <span className="text-[14pt] font-bold uppercase tracking-wider mt-1 text-[#FFFFFF]">
              {sosActive ? 'BROADCASTING' : 'MAYDAY'}
            </span>
          </button>
        </div>
      </footer>

      {/* Confirmation Dialog on Exit */}
      {confirmExit && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-6">
          <div className="p-8 bg-[#000000] border-4 border-[#FFFFFF] max-w-lg w-full text-center">
            <h3 className="text-[26pt] font-black text-[#FFFFFF] uppercase">
              Exit Antarctic Mode?
            </h3>
            <p className="text-[18pt] text-[#FFFFFF] mt-4 leading-relaxed">
              Standard low-contrast UI and standard font sizes will be restored.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={() => setConfirmExit(false)}
                className="px-8 py-4 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold"
              >
                Stay in High-Vis
              </button>
              <button
                onClick={() => {
                  setConfirmExit(false);
                  onExit();
                }}
                className="px-8 py-4 bg-[#FFFFFF] text-[#000000] border-4 border-[#FFFFFF] text-[18pt] font-black"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
