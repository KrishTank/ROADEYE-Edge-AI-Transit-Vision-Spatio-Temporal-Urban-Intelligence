/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic SOS Emergency Screen (Full-Screen Red Pulsing, Distress Chat)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { mqttClient } from '../../services/mqttService';
import { ShieldAlert, X, Send, Radio, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import { fieldDb } from '../../db/fieldDb';

interface SOSScreenProps {
  activeStation: StationId;
  onCancel: () => void;
}

export const SOSScreen: React.FC<SOSScreenProps> = ({ activeStation, onCancel }) => {
  const station = STATIONS_DATA[activeStation];
  const [countdown, setCountdown] = useState(5);
  const [isSent, setIsSent] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'COMMAND', text: 'EMERGENCY BEACON DETECTED. SEARCH & RESCUE STANDBY ACTIVATED.', time: '00:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // 5-second countdown timer
  useEffect(() => {
    if (countdown > 0 && !isSent) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isSent) {
      triggerSosDispatch();
    }
  }, [countdown, isSent]);

  const triggerSosDispatch = async () => {
    setIsSent(true);

    // 1. MQTT Priority 1 SOS broadcast
    await mqttClient.publish(`dhruvatwin/alerts/${activeStation}/SOS_CRITICAL`, {
      type: 'PRIORITY_1_LIFE_SAFETY_DISTRESS',
      station: activeStation,
      gps: `${station.latitude.toFixed(4)}°S, ${station.longitude.toFixed(4)}°E`,
      timestamp: Date.now()
    }, 1);

    // 2. Save to local IndexedDB priority queue (Priority = 1)
    await fieldDb.field_reports.add({
      id: `sos-${Date.now()}`,
      stationId: activeStation,
      category: 'Safety',
      priority: 'Emergency',
      priorityNumber: 1, // SOS = Priority 1
      description: `PRIORITY 1 LIFE SAFETY SOS DISTRESS BEACON BROADCAST FROM FIELD OPERATIVE`,
      gpsLocation: `${station.latitude.toFixed(4)}°S, ${station.longitude.toFixed(4)}°E`,
      timestamp: new Date().toISOString(),
      photoAttached: false,
      synced: false
    });

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'COMMAND',
        text: 'NCPOR COMMAND: PistenBully SAR crew mobilized with trauma kit. ETA 18 minutes. Maintain position!',
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || chatInput;
    if (!msg.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'OPERATIVE',
        text: msg,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }
    ]);
    setChatInput('');

    // Simulate command response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'COMMAND',
          text: `COMMAND POST: Acknowledged "${msg}". Tactical UHF frequency locked on CH-03.`,
          time: new Date().toLocaleTimeString('en-GB', { hour12: false })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] p-6 flex flex-col justify-between overflow-y-auto antarctic-root border-8 border-[#FF0000] animate-pulse">
      {/* TOP HEADER */}
      <div className="border-b-4 border-[#FF0000] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-16 h-16 text-[#FF0000]" />
          <div>
            <h1 className="text-[36pt] font-black text-[#FF0000] leading-tight">
              EMERGENCY SOS
            </h1>
            <p className="antarctic-text-body text-[#FFFFFF]">
              DISTRESS BEACON · POLAR RESCUE PROTOCOL 01
            </p>
          </div>
        </div>

        {/* GPS COORDINATES MONOSPACE 24PT */}
        <div className="text-right">
          <span className="antarctic-text-body text-[#AAAAAA] block">GPS BEACON:</span>
          <span className="antarctic-text-mono text-[#00FFFF] text-[24pt]">
            {station.latitude.toFixed(4)}°S, {station.longitude.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* MAIN BODY: COUNTDOWN OR CONFIRMED CHAT */}
      <div className="my-auto py-6 max-w-4xl mx-auto w-full">
        {!isSent ? (
          <div className="text-center space-y-8">
            <div className="text-[72pt] font-mono font-black text-[#FF0000] animate-ping">
              {countdown}
            </div>
            <h2 className="text-[32pt] font-black text-[#FFFFFF]">
              DISTRESS SIGNAL TRANSMITTING IN {countdown} SECONDS
            </h2>
            <p className="antarctic-text-body text-[#AAAAAA] max-w-xl mx-auto">
              This will sound the Tier 1 distress siren at {station.name} Main Command Habitat and notify NCPOR Operations Desk.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="antarctic-button h-[100px] px-12 border-[#FFFFFF] text-[#FFFFFF] text-[24pt]"
              >
                <X className="w-12 h-12 mr-4" />
                <span>CANCEL SOS</span>
              </button>

              <button
                type="button"
                onClick={triggerSosDispatch}
                className="antarctic-button antarctic-button-danger h-[100px] px-12 text-[24pt]"
              >
                <span>TRANSMIT NOW</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="antarctic-card border-[#00FF00] bg-[#00FF00]/10 p-6 flex items-center gap-6">
              <CheckCircle2 className="w-16 h-16 text-[#00FF00] shrink-0" />
              <div>
                <h2 className="text-[28pt] font-black text-[#00FF00]">
                  SOS SENT — HELP IS ON THE WAY
                </h2>
                <p className="antarctic-text-body text-[#FFFFFF]">
                  UHF CH-03 & Iridium SBD packets verified. Command Center SAR dispatch active.
                </p>
              </div>
            </div>

            {/* QUICK PRE-SET DISTRESS RESPONSES */}
            <div>
              <label className="antarctic-text-body text-[#FFD700] block mb-2">
                RAPID SITUATION CODES (TAP TO TRANSMIT):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'CREVASSE ACCIDENT',
                  'MEDICAL HYPOTHERMIA',
                  'VEHICLE BREAKDOWN',
                  'BLIZZARD DISORIENTATION'
                ].map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSendMessage(`SITREP: ${code}`)}
                    className="antarctic-button h-[70px] text-[15pt]"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE TACTICAL CHAT */}
            <div className="antarctic-card space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#333333] pb-2">
                <Radio className="w-8 h-8 text-[#00FFFF]" />
                <span className="antarctic-text-heading text-[#00FFFF]">
                  TACTICAL RESCUE FREQUENCY LIVE LINK
                </span>
              </div>

              <div className="h-[220px] overflow-y-auto space-y-3 p-3 bg-[#0A0A0A] border-2 border-[#222222]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 border-2 ${
                      msg.sender === 'COMMAND'
                        ? 'border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/5'
                        : 'border-[#00FF00] text-[#00FF00] bg-[#00FF00]/5 ml-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12pt] font-bold">
                      <span>[{msg.sender}]</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="text-[16pt] font-bold mt-1 text-[#FFFFFF]">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="TYPE TACTICAL RESCUE MESSAGE..."
                  className="antarctic-input text-[18pt] flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="antarctic-button px-8 h-[70px] bg-[#00FF00] text-[#000000]"
                >
                  <Send className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="border-t-4 border-[#FF0000] pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="antarctic-button h-[64px] px-8 text-[#FFFFFF]"
        >
          <X className="w-8 h-8 mr-2" />
          <span>EXIT DISTRESS SCREEN</span>
        </button>
        <span className="antarctic-text-mono text-[#FFD700] text-[18pt]">
          NCPOR 46th ISEA LIFE SAFETY PROTOCOL
        </span>
      </div>
    </div>
  );
};
