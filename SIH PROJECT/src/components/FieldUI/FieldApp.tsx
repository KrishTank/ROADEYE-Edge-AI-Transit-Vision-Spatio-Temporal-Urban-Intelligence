/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Staff Antarctic Dedicated UI Mode Component
 * High-Contrast Extreme-Cold Task & Vehicle Dispatch App
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { fieldDb, FieldTask, FieldReport, VehicleLogEntry, seedFieldStaffDb } from '../../db/fieldDb';
import { mqttClient } from '../../services/mqttService';
import {
  AlertTriangle,
  Battery,
  Camera,
  CheckCircle2,
  CheckSquare,
  Clock,
  CloudSun,
  Flame,
  Mic,
  Radio,
  Send,
  ShieldAlert,
  Thermometer,
  Truck,
  UserCheck,
  Wind,
  X
} from 'lucide-react';

interface FieldAppProps {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  onExit: () => void;
  onTriggerSos: () => void;
}

type FieldScreenType = 'home' | 'tasks' | 'report' | 'checkin' | 'vehicles' | 'weather' | 'sos';

export const FieldApp: React.FC<FieldAppProps> = ({
  activeStation,
  temperature,
  windSpeed,
  onExit,
  onTriggerSos
}) => {
  const [currentScreen, setCurrentScreen] = useState<FieldScreenType>('home');
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [batteryPct] = useState(94);
  const [currentTime, setCurrentTime] = useState('');
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Report Issue state
  const [reportCategory, setReportCategory] = useState<'Equipment' | 'Weather' | 'Safety' | 'Infrastructure' | 'Other'>('Equipment');
  const [reportPriority, setReportPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('High');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Check In state
  const [checkedInStatus, setCheckedInStatus] = useState<string | null>(null);

  // Vehicle Log state
  const [selectedVehicle, setSelectedVehicle] = useState<'PistenBully' | 'Snow Scooter' | 'ATV Quad' | 'Hägglunds Carrier' | 'Snow Blower'>('PistenBully');
  const [checklist, setChecklist] = useState({
    tracksInspected: true,
    engineFluidChecked: true,
    radioCommOperational: true,
    emergencyRationsLoaded: true
  });
  const [vehicleLogSubmitted, setVehicleLogSubmitted] = useState(false);

  // SOS Countdown state
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosSent, setSosSent] = useState(false);

  const station = STATIONS_DATA[activeStation];

  useEffect(() => {
    seedFieldStaffDb().then(loadTasks);
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC');
    }, 1000);
    return () => clearInterval(timeTimer);
  }, [activeStation]);

  const loadTasks = async () => {
    const list = await fieldDb.field_tasks.where('stationId').equals(activeStation).toArray();
    setTasks(list);
  };

  const toggleTask = async (taskId: string, current: boolean) => {
    await fieldDb.field_tasks.update(taskId, { completed: !current });
    loadTasks();
  };

  const handleVoiceToggle = (targetField: 'report' | 'general' = 'general') => {
    if (!isListening) {
      setIsListening(true);
      setVoiceTranscript('Listening... Speak now into microphone');
      setTimeout(() => {
        const simulated = targetField === 'report' 
          ? 'Rime ice accumulation observed on North antenna guy wire' 
          : 'Priyadarshini water pump house temperature nominal at plus two degrees';
        setVoiceTranscript(simulated);
        if (targetField === 'report') {
          setReportText(prev => (prev ? `${prev} ${simulated}` : simulated));
        }
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;
    const entry: FieldReport = {
      id: `rep-${Date.now()}`,
      stationId: activeStation as 'maitri' | 'bharati',
      category: reportCategory,
      description: reportText,
      priority: reportPriority,
      latitude: station.latitude,
      longitude: station.longitude,
      timestamp: new Date().toISOString(),
      synced: false
    };
    await fieldDb.field_reports.add(entry);
    await mqttClient.publish(`dhruvatwin/alerts/${activeStation}/${reportPriority}`, entry, reportPriority === 'Emergency' ? 1 : 2);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportText('');
      setCurrentScreen('home');
    }, 2000);
  };

  const handleCheckIn = async (healthStatus: 'Good' | 'Tired' | 'Unwell') => {
    setCheckedInStatus(healthStatus);
    await mqttClient.publish(`dhruvatwin/telemetry/${activeStation}/crew_checkin`, {
      status: 'SAFE',
      health: healthStatus,
      coords: [station.latitude, station.longitude],
      timestamp: Date.now()
    }, 3);
    setTimeout(() => {
      setCheckedInStatus(null);
      setCurrentScreen('home');
    }, 2200);
  };

  // SOS Countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentScreen === 'sos' && !sosSent && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(prev => prev - 1);
      }, 1000);
    } else if (currentScreen === 'sos' && sosCountdown === 0 && !sosSent) {
      setSosSent(true);
      onTriggerSos();
      mqttClient.publish(`dhruvatwin/alerts/${activeStation}/SOS`, {
        alert: 'MAYDAY_GROUND_STAFF_DISTRESS',
        station: activeStation,
        coords: [station.latitude, station.longitude],
        time: Date.now()
      }, 1);
    }
    return () => clearTimeout(timer);
  }, [currentScreen, sosCountdown, sosSent]);

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#FFFFFF] flex flex-col font-sans select-none antarctic-mode overflow-y-auto">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP BAR (72px, PURE BLACK, HIGH CONTRAST)                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-[72px] px-6 bg-[#000000] border-b-4 border-[#FFFFFF] flex items-center justify-between shrink-0">
        {/* Left: Temp (32pt) */}
        <div className="flex items-center gap-3">
          <Thermometer className="w-8 h-8 text-[#FFD700]" />
          <span className="text-[28pt] font-mono font-extrabold text-[#FFD700] leading-none">
            {temperature}°C
          </span>
          <span className="text-[16pt] text-[#FFFFFF] uppercase font-bold ml-2">
            {station.name.split(' ')[0]}
          </span>
        </div>

        {/* Center: Time (24pt) */}
        <div className="hidden sm:flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#FFFFFF]" />
          <span className="text-[22pt] font-mono font-bold text-[#FFFFFF] tracking-wider">
            {currentTime}
          </span>
        </div>

        {/* Right: Battery, Wind & SOS / Exit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[20pt] font-mono font-bold text-[#00FF00]">
            <Battery className="w-7 h-7 text-[#00FF00]" />
            <span>{batteryPct}%</span>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('sos');
              setSosCountdown(5);
              setSosSent(false);
            }}
            className="px-4 py-2 bg-[#FF0000] text-[#FFFFFF] border-4 border-[#FFFFFF] font-black text-[16pt] uppercase rounded hover:bg-[#CC0000] transition-colors"
          >
            SOS
          </button>

          <button
            onClick={onExit}
            className="px-4 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] font-bold text-[16pt] uppercase rounded hover:bg-[#FFFFFF] hover:text-[#000000] transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA: ONE TASK AT A TIME                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col justify-center">

        {/* SCREEN 1: HOME SCREEN (4 Large 180x180px buttons in 2x2 grid) */}
        {currentScreen === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <h1 className="text-[26pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Antarctic Field Staff Ops Hub
              </h1>
              <p className="text-[18pt] text-[#FFD700] mt-1 font-bold">
                Task-Focused High-Visibility Terminal (Zero Clutter)
              </p>
            </div>

            {/* 2x2 Grid of 180x180px Touch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
              {/* Button 1: Tasks */}
              <button
                onClick={() => setCurrentScreen('tasks')}
                className="w-full max-w-[340px] h-[180px] p-6 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] hover:border-[#FFD700] rounded-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
              >
                <CheckSquare className="w-16 h-16 text-[#FFD700]" />
                <span className="text-[22pt] font-black uppercase tracking-wider">My Tasks</span>
                <span className="text-[16pt] text-[#00FF00] font-bold font-mono">
                  {tasks.filter(t => !t.completed).length} Pending
                </span>
              </button>

              {/* Button 2: Report Issue */}
              <button
                onClick={() => setCurrentScreen('report')}
                className="w-full max-w-[340px] h-[180px] p-6 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] hover:border-[#FFD700] rounded-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-16 h-16 text-[#FFB020]" />
                <span className="text-[22pt] font-black uppercase tracking-wider">Report Issue</span>
                <span className="text-[16pt] text-[#FFFFFF] font-bold">Hazard / Defect</span>
              </button>

              {/* Button 3: Check In */}
              <button
                onClick={() => setCurrentScreen('checkin')}
                className="w-full max-w-[340px] h-[180px] p-6 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] hover:border-[#FFD700] rounded-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-16 h-16 text-[#00FF00]" />
                <span className="text-[22pt] font-black uppercase tracking-wider">Check In</span>
                <span className="text-[16pt] text-[#00FF00] font-bold">I Am Safe</span>
              </button>

              {/* Button 4: Vehicle Log */}
              <button
                onClick={() => setCurrentScreen('vehicles')}
                className="w-full max-w-[340px] h-[180px] p-6 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] hover:border-[#FFD700] rounded-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
              >
                <Truck className="w-16 h-16 text-[#00E0C6]" />
                <span className="text-[22pt] font-black uppercase tracking-wider">Vehicle Log</span>
                <span className="text-[16pt] text-[#FFFFFF] font-bold">Fleet Checkout</span>
              </button>
            </div>

            {/* Bottom 2 Large Buttons: Weather & SOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center pt-2">
              <button
                onClick={() => setCurrentScreen('weather')}
                className="w-full max-w-[340px] h-[90px] p-4 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] hover:border-[#00FF00] rounded-xl flex items-center justify-center gap-4 transition-transform active:scale-95 cursor-pointer"
              >
                <CloudSun className="w-10 h-10 text-[#00E0C6]" />
                <span className="text-[20pt] font-black uppercase">Met & Winds</span>
              </button>

              <button
                onClick={() => {
                  setCurrentScreen('sos');
                  setSosCountdown(5);
                  setSosSent(false);
                }}
                className="w-full max-w-[340px] h-[90px] p-4 bg-[#FF0000] text-[#FFFFFF] border-4 border-[#FFFFFF] rounded-xl flex items-center justify-center gap-4 animate-emergency-pulse active:scale-95 cursor-pointer"
              >
                <ShieldAlert className="w-12 h-12 text-[#FFFFFF]" />
                <span className="text-[22pt] font-black uppercase tracking-widest">SOS EMERGENCY</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: TASKS SCREEN */}
        {currentScreen === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
              <h2 className="text-[24pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Assigned Operational Tasks
              </h2>
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-6 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold rounded"
              >
                Back
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`p-6 bg-[#000000] border-4 rounded-xl flex items-start gap-6 cursor-pointer transition-colors ${
                    task.completed ? 'border-[#00FF00] opacity-80' : 'border-[#FFFFFF] hover:border-[#FFD700]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="w-12 h-12 mt-1 accent-[#00FF00] shrink-0 pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-[22pt] font-extrabold leading-tight ${task.completed ? 'line-through text-[#6B7A8F]' : 'text-[#FFFFFF]'}`}>
                        {task.title}
                      </span>
                      <span className={`px-3 py-1 text-[16pt] font-black uppercase rounded ${
                        task.priority === 'Life-Critical' ? 'bg-[#FF0000] text-[#FFFFFF]' :
                        task.priority === 'Urgent' ? 'bg-[#FFD700] text-[#000000]' :
                        'bg-[#FFFFFF] text-[#000000]'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="text-[18pt] text-[#FFD700] mt-2 font-bold">
                      Location: {task.location} · Due: {task.dueTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Note Button for Tasks */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => handleVoiceToggle('general')}
                className="px-8 py-4 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[20pt] font-bold rounded-xl flex items-center gap-3 hover:bg-[#FFFFFF] hover:text-[#000000] transition-colors"
              >
                <Mic className="w-8 h-8 text-[#FFD700]" />
                <span>{isListening ? 'Recording Note...' : 'Record Voice Note'}</span>
              </button>
            </div>
            {voiceTranscript && (
              <div className="p-4 bg-[#000000] border-2 border-[#FFD700] text-[#FFD700] text-[18pt] font-mono">
                Transcribed: "{voiceTranscript}"
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: REPORT ISSUE SCREEN */}
        {currentScreen === 'report' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
              <h2 className="text-[24pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Report Field Hazard / Defect
              </h2>
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-6 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold rounded"
              >
                Back
              </button>
            </div>

            {/* Photo Button */}
            <div className="flex justify-center">
              <button 
                onClick={() => setReportText(prev => prev ? `${prev} [Photo attached]` : '[Photo attached]')}
                className="w-48 h-48 bg-[#000000] border-4 border-[#FFFFFF] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#FFD700] transition-colors"
              >
                <Camera className="w-16 h-16 text-[#FFD700]" />
                <span className="text-[18pt] font-black uppercase">Snap Photo</span>
              </button>
            </div>

            {/* Category Selector (5 large buttons) */}
            <div>
              <div className="text-[18pt] font-bold uppercase mb-2">Category:</div>
              <div className="flex flex-wrap gap-3">
                {(['Equipment', 'Weather', 'Safety', 'Infrastructure', 'Other'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setReportCategory(cat)}
                    className={`px-6 py-3 rounded text-[18pt] font-black border-4 ${
                      reportCategory === cat ? 'bg-[#FFD700] text-[#000000] border-[#FFD700]' : 'bg-[#000000] text-[#FFFFFF] border-[#FFFFFF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <div className="text-[18pt] font-bold uppercase mb-2">Severity:</div>
              <div className="flex flex-wrap gap-3">
                {(['Low', 'Medium', 'High', 'Emergency'] as const).map(prio => (
                  <button
                    key={prio}
                    onClick={() => setReportPriority(prio)}
                    className={`px-6 py-3 rounded text-[18pt] font-black border-4 ${
                      reportPriority === prio
                        ? prio === 'Emergency' ? 'bg-[#FF0000] text-[#FFFFFF] border-[#FF0000]' : 'bg-[#FFD700] text-[#000000] border-[#FFD700]'
                        : 'bg-[#000000] text-[#FFFFFF] border-[#FFFFFF]'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Text description with Voice-to-Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[18pt] font-bold uppercase">Description:</span>
                <button
                  onClick={() => handleVoiceToggle('report')}
                  className="px-4 py-2 bg-[#000000] border-2 border-[#FFD700] text-[#FFD700] text-[16pt] font-bold rounded flex items-center gap-2"
                >
                  <Mic className="w-6 h-6" />
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe issue (e.g., fuel leak, ice bridge fracture, cable snap)..."
                className="w-full bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] p-4 text-[18pt] font-medium rounded-xl focus:border-[#FFD700] focus:outline-none"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmitReport}
                disabled={!reportText.trim() || reportSubmitted}
                className="w-full py-5 bg-[#00FF00] text-[#000000] border-4 border-[#FFFFFF] text-[22pt] font-black uppercase rounded-xl hover:bg-[#00DD00] transition-colors disabled:opacity-50"
              >
                {reportSubmitted ? 'LOGGED TO OFFLINE QUEUE' : 'SUBMIT FIELD REPORT'}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: CHECK IN SCREEN */}
        {currentScreen === 'checkin' && (
          <div className="space-y-8 text-center">
            <div className="border-b-4 border-[#FFFFFF] pb-4 flex items-center justify-between">
              <h2 className="text-[24pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Safety Check-In & Beacon Ping
              </h2>
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-6 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold rounded"
              >
                Back
              </button>
            </div>

            {/* Large 400x200px "I AM SAFE" Button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleCheckIn('Good')}
                className="w-full max-w-[440px] h-[200px] bg-[#00FF00] text-[#000000] border-8 border-[#FFFFFF] rounded-2xl flex flex-col items-center justify-center p-6 shadow-2xl transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-20 h-20 text-[#000000]" />
                <span className="text-[32pt] font-black tracking-widest mt-2">I AM SAFE</span>
                <span className="text-[16pt] font-bold uppercase mt-1">Broadcast Position OK</span>
              </button>
            </div>

            {checkedInStatus && (
              <div className="p-4 bg-[#000000] border-4 border-[#00FF00] text-[#00FF00] text-[22pt] font-black uppercase">
                CHECK-IN ACKNOWLEDGED BY {station.name.toUpperCase()} COMMAND
              </div>
            )}

            {/* Secondary Status Options */}
            <div className="space-y-4">
              <div className="text-[18pt] font-bold uppercase text-[#FFFFFF]">Alternate Crew Status:</div>
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => handleCheckIn('Tired')}
                  className="px-8 py-4 bg-[#000000] text-[#FFD700] border-4 border-[#FFD700] text-[18pt] font-bold rounded-xl"
                >
                  Fatigued / Returning
                </button>
                <button
                  onClick={() => handleCheckIn('Unwell')}
                  className="px-8 py-4 bg-[#000000] text-[#FF0000] border-4 border-[#FF0000] text-[18pt] font-bold rounded-xl"
                >
                  Unwell / Need Pickup
                </button>
              </div>
            </div>

            <div className="text-[16pt] font-mono text-[#6B7A8F]">
              GPS Datum: {station.latitude.toFixed(4)}°S, {station.longitude.toFixed(4)}°E (± 2.5m)
            </div>
          </div>
        )}

        {/* SCREEN 5: VEHICLE LOG SCREEN */}
        {currentScreen === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
              <h2 className="text-[24pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Arctic Vehicle Checkout & Log
              </h2>
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-6 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold rounded"
              >
                Back
              </button>
            </div>

            {/* Vehicle Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(['PistenBully', 'Snow Scooter', 'ATV Quad', 'Hägglunds Carrier', 'Snow Blower'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-4 rounded-xl border-4 text-[18pt] font-black text-center ${
                    selectedVehicle === v ? 'bg-[#FFD700] text-[#000000] border-[#FFD700]' : 'bg-[#000000] text-[#FFFFFF] border-[#FFFFFF]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Checklist */}
            <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded-xl space-y-4">
              <div className="text-[20pt] font-black uppercase text-[#FFD700]">
                Pre-Trip Safety Inspection:
              </div>

              {[
                { k: 'tracksInspected', label: '1. Tracks / Skis cleared of packed ice' },
                { k: 'engineFluidChecked', label: '2. Arctic fuel and low-temp oil verified' },
                { k: 'radioCommOperational', label: '3. Tactical UHF radio CH-01 verified' },
                { k: 'emergencyRationsLoaded', label: '4. Survival sled rations and tent loaded' }
              ].map(item => (
                <label key={item.k} className="flex items-center gap-4 text-[18pt] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[item.k as keyof typeof checklist]}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [item.k]: e.target.checked }))}
                    className="w-8 h-8 accent-[#00FF00]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setVehicleLogSubmitted(true);
                setTimeout(() => {
                  setVehicleLogSubmitted(false);
                  setCurrentScreen('home');
                }, 2000);
              }}
              className="w-full py-5 bg-[#00E0C6] text-[#000000] border-4 border-[#FFFFFF] text-[22pt] font-black uppercase rounded-xl hover:bg-[#00C0AA] transition-colors"
            >
              {vehicleLogSubmitted ? 'CHECKOUT APPROVED & RECORDED' : `APPROVE ${selectedVehicle.toUpperCase()} DISPATCH`}
            </button>
          </div>
        )}

        {/* SCREEN 6: WEATHER SCREEN */}
        {currentScreen === 'weather' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
              <h2 className="text-[24pt] font-black uppercase tracking-wider text-[#FFFFFF]">
                Met & Katabatic Gale Monitor
              </h2>
              <button
                onClick={() => setCurrentScreen('home')}
                className="px-6 py-2 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[18pt] font-bold rounded"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded-xl text-center">
                <div className="text-[18pt] uppercase font-bold text-[#FFFFFF]">Katabatic Wind Speed</div>
                <div className="text-[38pt] font-mono font-black text-[#FFD700] mt-2">
                  {windSpeed} km/h
                </div>
                <div className="text-[16pt] text-[#00FF00] font-bold mt-2">
                  {windSpeed > 80 ? 'GALE WARNING: TRAVERSE RESTRICTED' : 'WIND SPEEDS OPERATIONAL'}
                </div>
              </div>

              <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded-xl text-center">
                <div className="text-[18pt] uppercase font-bold text-[#FFFFFF]">Wind Chill Equivalent</div>
                <div className="text-[38pt] font-mono font-black text-[#FF0000] mt-2">
                  {(temperature - (windSpeed * 0.25)).toFixed(1)}°C
                </div>
                <div className="text-[16pt] text-[#FFFFFF] font-bold mt-2">
                  Frostbite risk on exposed skin &lt; 15 min
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#000000] border-4 border-[#FFFFFF] rounded-xl text-[18pt] space-y-2">
              <div className="text-[#FFD700] font-bold uppercase">Station Sentry Alert:</div>
              <div>Primary Water Pipeline Trace: <strong className="text-[#00FF00]">+1.8°C Nominal</strong></div>
              <div>Next NOAA-20 Orbital Overpass: <strong className="text-[#FFFFFF]">In 14 minutes</strong></div>
            </div>

            <button
              onClick={() => {
                mqttClient.publish(`dhruvatwin/alerts/${activeStation}/WEATHER_GALE_WARN`, {
                  type: 'GROUND_ALERT_GALE',
                  wind: windSpeed,
                  time: Date.now()
                }, 2);
                alert('Command Center Notified of Extreme Ground Wind Conditions');
              }}
              className="w-full py-5 bg-[#FF0000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[20pt] font-black uppercase rounded-xl"
            >
              ALERT COMMAND OF BLIZZARD CONDITIONS
            </button>
          </div>
        )}

        {/* SCREEN 7: SOS SCREEN (RED PULSING, MAYDAY) */}
        {currentScreen === 'sos' && (
          <div className="fixed inset-0 z-60 bg-[#FF0000] text-[#FFFFFF] p-8 flex flex-col justify-between items-center text-center animate-emergency-pulse">
            <div className="space-y-4">
              <ShieldAlert className="w-28 h-28 mx-auto text-[#FFFFFF]" />
              <h1 className="text-[38pt] font-black tracking-widest uppercase">
                EMERGENCY MAYDAY SOS
              </h1>
              <div className="text-[24pt] font-mono font-bold bg-[#000000] px-6 py-2 rounded-xl border-4 border-[#FFFFFF]">
                GPS: {station.latitude.toFixed(4)}°S, {station.longitude.toFixed(4)}°E
              </div>
            </div>

            {!sosSent ? (
              <div className="space-y-6">
                <div className="text-[32pt] font-black">
                  BROADCASTING IN <span className="font-mono text-[#FFD700] text-[48pt]">{sosCountdown}</span> SECONDS
                </div>
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="px-12 py-6 bg-[#000000] text-[#FFFFFF] border-8 border-[#FFFFFF] text-[28pt] font-black uppercase rounded-2xl hover:bg-slate-900 transition-colors"
                >
                  CANCEL DISTRESS CALL
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-[32pt] font-black uppercase bg-[#000000] text-[#00FF00] p-6 rounded-2xl border-4 border-[#FFFFFF]">
                  SOS SENT — COMMAND DISPATCH RESCUE INITIATED
                </div>
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="px-10 py-5 bg-[#000000] text-[#FFFFFF] border-4 border-[#FFFFFF] text-[20pt] font-bold rounded-xl"
                >
                  Return to Home
                </button>
              </div>
            )}

            <div className="text-[18pt] font-bold uppercase tracking-wider text-[#FFFFFF]">
              UHF Tactical Channel: CH-03 EMERGENCY TACTICAL · Iridium Beacon ACTIVE
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
