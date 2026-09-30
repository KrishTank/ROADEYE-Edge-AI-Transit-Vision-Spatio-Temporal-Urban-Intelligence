/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Layout Component (Persistent 32pt Telemetry, Glove UI)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { useAntarcticMode } from './AntarcticModeProvider';
import { HomeScreen } from './HomeScreen';
import { TasksScreen } from './TasksScreen';
import { ReportIssueScreen } from './ReportIssueScreen';
import { CheckInScreen } from './CheckInScreen';
import { VehicleLogScreen } from './VehicleLogScreen';
import { WeatherScreen } from './WeatherScreen';
import { SOSScreen } from './SOSScreen';
import { BatteryAware } from './BatteryAware';
import { 
  ShieldAlert, 
  Wind, 
  Thermometer, 
  Clock, 
  Wifi, 
  WifiOff, 
  X, 
  Database,
  Radio
} from 'lucide-react';
import './antarcticMode.css';

interface AntarcticLayoutProps {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  onExit: () => void;
  onTriggerSos?: () => void;
}

export type AntarcticActiveScreen = 'home' | 'tasks' | 'report' | 'checkin' | 'vehicles' | 'weather' | 'sos';

export const AntarcticLayout: React.FC<AntarcticLayoutProps> = ({
  activeStation,
  temperature,
  windSpeed,
  onExit,
  onTriggerSos
}) => {
  const [currentScreen, setCurrentScreen] = useState<AntarcticActiveScreen>('home');
  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { pendingSyncCount, triggerReason } = useAntarcticMode();
  const station = STATIONS_DATA[activeStation];

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#FFFFFF] antarctic-root flex flex-col justify-between overflow-x-hidden overflow-y-auto">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* PERSISTENT TOP TELEMETRY BAR                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="border-b-4 border-[#FFFFFF] bg-[#000000] p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        
        {/* TOP-LEFT: TEMPERATURE AT 32PT */}
        <div className="flex items-center gap-3">
          <Thermometer className="w-10 h-10 text-[#00FFFF]" />
          <div>
            <div className="text-[12pt] font-black text-[#AAAAAA] uppercase">AMBIENT</div>
            <div className="text-[32pt] font-black font-mono leading-none text-[#00FFFF]">
              {temperature}°C
            </div>
          </div>
        </div>

        {/* TOP-CENTER: TIME & STATION AT 24PT */}
        <div className="flex flex-col items-center">
          <div className="text-[24pt] font-black font-mono text-[#FFD700] tracking-wider leading-none">
            {currentTime}
          </div>
          <div className="text-[14pt] font-bold text-[#FFFFFF] uppercase mt-1">
            {station.name} · DHRUVATWIN
          </div>
          {triggerReason && (
            <span className="text-[10pt] font-bold text-[#FF0000] bg-[#FF0000]/10 px-2 py-0.5 mt-1 border border-[#FF0000]">
              {triggerReason}
            </span>
          )}
        </div>

        {/* TOP-RIGHT: WIND SPEED AT 32PT & BATTERY AT 24PT */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Wind className="w-10 h-10 text-[#FFD700]" />
            <div>
              <div className="text-[12pt] font-black text-[#AAAAAA] uppercase">WIND</div>
              <div className="text-[32pt] font-black font-mono leading-none text-[#FFD700]">
                {windSpeed} <span className="text-[18pt]">KM/H</span>
              </div>
            </div>
          </div>

          <BatteryAware />

          {/* ONLINE / OFFLINE CHIP & PENDING SYNC COUNT */}
          <div className="flex items-center gap-3 border-2 border-[#FFFFFF] px-3 py-1">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-[#00FF00]" />
            ) : (
              <WifiOff className="w-6 h-6 text-[#FF0000]" />
            )}
            <div className="flex flex-col">
              <span className={`text-[12pt] font-black ${isOnline ? 'text-[#00FF00]' : 'text-[#FF0000]'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
              <span className="text-[10pt] font-mono text-[#00FFFF]">
                {pendingSyncCount} PENDING
              </span>
            </div>
          </div>

          {/* EXIT / NORMAL DESKTOP VIEW BUTTON */}
          <button
            onClick={onExit}
            className="antarctic-button h-[64px] px-4 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#000000]"
            title="Exit Antarctic Mode"
          >
            <X className="w-8 h-8 mr-2" />
            <span className="text-[14pt]">EXIT</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SCREEN ROUTING                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 py-6">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            pendingTasksCount={4}
          />
        )}

        {currentScreen === 'tasks' && (
          <TasksScreen
            activeStation={activeStation}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'report' && (
          <ReportIssueScreen
            activeStation={activeStation}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'checkin' && (
          <CheckInScreen
            activeStation={activeStation}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'vehicles' && (
          <VehicleLogScreen
            activeStation={activeStation}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'weather' && (
          <WeatherScreen
            activeStation={activeStation}
            temperature={temperature}
            windSpeed={windSpeed}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'sos' && (
          <SOSScreen
            activeStation={activeStation}
            onCancel={() => setCurrentScreen('home')}
          />
        )}
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* FLOATING 200x200px PULSING SOS BUTTON (WHEN ON HOME/SUBPAGES) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {currentScreen !== 'sos' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              setCurrentScreen('sos');
              if (onTriggerSos) onTriggerSos();
            }}
            className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] bg-[#FF0000] text-[#FFFFFF] border-4 border-[#FFFFFF] flex flex-col items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_#FF0000] hover:scale-105 active:scale-95 transition-transform"
            style={{
              animation: 'antarctic-pulse-red 1.2s infinite ease-in-out'
            }}
          >
            <ShieldAlert className="w-20 h-20" />
            <span className="text-[24pt] font-black tracking-widest text-[#FFFFFF]">
              SOS
            </span>
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PERSISTENT FOOTER STRIP                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t-4 border-[#FFFFFF] bg-[#000000] p-4 flex items-center justify-between text-[14pt] font-bold text-[#AAAAAA]">
        <div>
          NCPOR 46th ISEA · TEAM HACKFINITY · PS 26060 · DHRUVATWIN
        </div>
        <div className="text-[#00FFFF] font-mono">
          OFFLINE CACHE: INDEXEDDB PERSISTENT LEDGER
        </div>
      </footer>
    </div>
  );
};
