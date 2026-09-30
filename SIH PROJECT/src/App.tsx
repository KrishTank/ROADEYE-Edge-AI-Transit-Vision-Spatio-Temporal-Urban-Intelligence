/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DhruvaTwin Main Application Entry Point
 * National Centre for Polar and Ocean Research (NCPOR) / Ministry of Earth Sciences (MoES)
 * Smart India Hackathon 2026 - Problem Statement ID: 26060
 * Team: HackFinity007
 */

import React, { useState, useEffect } from 'react';
import { StationId, UserRole } from './types';
import { STATIONS_DATA } from './data/stationConstants';
import { seedInitialDatabase } from './db/dexieDb';
import { mqttClient, MqttConnectionStatus, DeltaCompressionStats } from './services/mqttService';
import { aiPredictor, AiPredictorState } from './services/aiPredictor';
import { fetchStationWeather } from './services/weatherService';

// Screens
import { AlertTriageScreen } from './components/screens/AlertTriageScreen';
import { StationDashboardScreen } from './components/screens/StationDashboardScreen';
import { LocalEnvironmentScreen } from './components/screens/LocalEnvironmentScreen';
import { MicrogridCommandScreen } from './components/screens/MicrogridCommandScreen';
import { DigitalTwinScreen } from './components/screens/DigitalTwinScreen';
import { AntarcticaOverviewScreen } from './components/screens/AntarcticaOverviewScreen';
import { NcporLibraryScreen } from './components/screens/NcporLibraryScreen';
import { NpdcComplianceScreen } from './components/screens/NpdcComplianceScreen';
import { ExpeditionLogsScreen } from './components/screens/ExpeditionLogsScreen';
import { AuditTrailScreen } from './components/screens/AuditTrailScreen';
import { AiContinuityScreen } from './components/screens/AiContinuityScreen';
import { WeatherPage } from './pages/WeatherPage';
import { LoginPage } from './pages/LoginPage';
import { IndexPage } from './pages/IndexPage';

// Overlays & Drawers
import { AntarcticLayout } from './components/AntarcticUI/AntarcticLayout';
import { AntarcticModeProvider } from './components/AntarcticUI/AntarcticModeProvider';
import { ChatbotDrawer } from './components/ChatbotDrawer';

// Icons
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Bot,
  BrainCircuit,
  CloudSun,
  Compass,
  Database,
  FileCheck2,
  Globe2,
  History,
  Layers,
  Lock,
  LogOut,
  Play,
  Radio,
  RefreshCw,
  Satellite,
  Shield,
  ShieldAlert,
  Snowflake,
  Sun,
  Thermometer,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  Wind,
  Zap
} from 'lucide-react';

export type ScreenId = 
  | 'twin'
  | 'triage'
  | 'station'
  | 'environment'
  | 'weather'
  | 'microgrid'
  | 'overview'
  | 'continuity'
  | 'library'
  | 'compliance'
  | 'expeditions'
  | 'audit';

export default function App() {
  // App-level view state: login → index → dashboard
  const [appView, setAppView] = useState<'login' | 'index' | 'dashboard'>('login');

  // Navigation & Station State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('twin');
  const [activeStation, setActiveStation] = useState<StationId>('maitri');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Critical Feature 1: Antarctic High-Visibility Mode
  const [isAntarcticMode, setIsAntarcticMode] = useState(false);
  const [hasDismissedAntarctic, setHasDismissedAntarctic] = useState(false);

  // Critical Feature 2: AI Blackout Predictor
  const [aiState, setAiState] = useState<AiPredictorState>(aiPredictor.getState());

  // MQTT & Offline Queue State
  const [mqttStatus, setMqttStatus] = useState<MqttConnectionStatus>(mqttClient.getStatus());
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [compressionStats, setCompressionStats] = useState<DeltaCompressionStats>(mqttClient.getStats());

  // Weather Telemetry
  const [stationTemp, setStationTemp] = useState<number>(-24.8);
  const [stationWind, setStationWind] = useState<number>(42.6);

  // Initialize DB & Listeners
  useEffect(() => {
    seedInitialDatabase();

    const unsubAi = aiPredictor.subscribe(setAiState);
    const unsubMqtt = mqttClient.onStatusChange(setMqttStatus);

    const updateWeather = () => {
      fetchStationWeather(activeStation).then(w => {
        setStationTemp(w.temperature);
        setStationWind(w.windSpeed);

        // Auto-activate Antarctic Mode if severe conditions (Temp < -20°C or Wind > 80 km/h) unless dismissed
        if (!hasDismissedAntarctic && (w.temperature < -20 || w.windSpeed > 80)) {
          setIsAntarcticMode(true);
        }
      });
    };
    updateWeather();
    const weatherInterval = setInterval(updateWeather, 60000);

    const queueInterval = setInterval(async () => {
      const count = await mqttClient.getPendingQueueCount();
      setPendingQueueCount(count);
      setCompressionStats(mqttClient.getStats());
    }, isAntarcticMode ? 30000 : 3000);

    // Keyboard shortcut: Ctrl + Shift + A toggles Antarctic Mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAntarcticMode(prev => {
          const next = !prev;
          if (!next) setHasDismissedAntarctic(true);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubAi();
      unsubMqtt();
      clearInterval(weatherInterval);
      clearInterval(queueInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStation, isAntarcticMode, hasDismissedAntarctic]);

  // Sync body class with Antarctic mode
  useEffect(() => {
    if (isAntarcticMode) {
      document.body.classList.add('antarctic-mode');
    } else {
      document.body.classList.remove('antarctic-mode');
    }
  }, [isAntarcticMode]);

  const stationInfo = STATIONS_DATA[activeStation];

  // ── LOGIN PAGE ──
  if (appView === 'login') {
    return (
      <LoginPage
        onLogin={(role) => {
          setUserRole(role);
          setAppView('index');
        }}
      />
    );
  }

  // ── INDEX / HOME PAGE ──
  if (appView === 'index') {
    return (
      <IndexPage
        activeStation={activeStation}
        userRole={userRole}
        stationTemp={stationTemp}
        stationWind={stationWind}
        onEnterDashboard={(screen) => {
          if (screen) setCurrentScreen(screen);
          setAppView('dashboard');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#060B14] text-[#E8EEF4] flex flex-col font-sans selection:bg-[#00E0C6]/30 ${
      aiState.status === 'BLACKOUT' ? 'animate-blackout-flash' : ''
    } ${isAntarcticMode ? 'antarctic-mode' : ''}`}>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP NAVIGATION BAR — ZERO-SLOP STRICT THREE-ZONE CONTRACT    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="h-16 px-6 bg-[#0A121E]/95 backdrop-blur-md border-b border-[#1A2533] flex items-center justify-between z-30 sticky top-0">
        
        {/* Zone 1: Brand & Mandatory SIH / NCPOR Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E0C6] to-[#0A121E] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#060B14] rounded-[7px] flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-[#00E0C6]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold uppercase tracking-wider font-heading text-[#FFFFFF]">
                  DhruvaTwin
                </span>
                <span className="text-[10px] font-mono text-[#00E0C6] bg-[#00E0C6]/10 px-1.5 py-0.5 rounded border border-[#00E0C6]/30">
                  PS ID: 26060
                </span>
              </div>
              <div className="text-[10px] text-[#6B7A8F] leading-none">
                NCPOR · MoES Govt. of India · Team HackFinity007 · SIH 2026
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Station Switcher & Central Metrics */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          {/* Station Selector */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-lg border border-[#1A2533]">
            <button
              onClick={() => setActiveStation('maitri')}
              className={`px-3 py-1.5 font-bold uppercase rounded transition-all ${
                activeStation === 'maitri'
                  ? 'bg-[#00E0C6] text-[#060B14] shadow'
                  : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              Maitri Station
            </button>
            <button
              onClick={() => setActiveStation('bharati')}
              className={`px-3 py-1.5 font-bold uppercase rounded transition-all ${
                activeStation === 'bharati'
                  ? 'bg-[#00E0C6] text-[#060B14] shadow'
                  : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              Bharati Station
            </button>
          </div>

          {/* Real-time Environmental Badge */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#060B14] rounded-lg border border-[#1A2533] text-[11px]">
            <span className="flex items-center gap-1 text-[#FFD700] font-mono font-bold">
              <Thermometer className="w-3.5 h-3.5" />
              {stationTemp}°C
            </span>
            <span className="text-[#1A2533]">|</span>
            <span className="flex items-center gap-1 text-[#00E0C6] font-mono font-bold">
              <Wind className="w-3.5 h-3.5" />
              {stationWind} km/h
            </span>
          </div>
        </div>

        {/* Zone 3: AI Blackout Predictor Widget + Antarctic Mode Toggle + User Role */}
        <div className="flex items-center gap-3">
          {/* MANDATORY AI BLACKOUT STATUS WIDGET IN TOP NAV */}
          <div 
            onClick={() => setCurrentScreen('continuity')}
            className={`cursor-pointer px-3 py-1 rounded-lg border flex flex-col items-end transition-all ${
              aiState.status === 'BLACKOUT'
                ? 'bg-[#FF3B47]/20 border-[#FF3B47] text-[#FF3B47]'
                : aiState.minutesUntilDrop <= 5
                ? 'bg-[#FFB020]/20 border-[#FFB020] text-[#FFB020]'
                : 'bg-[#3EE07F]/10 border-[#3EE07F]/40 text-[#3EE07F]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  aiState.status === 'BLACKOUT' ? 'bg-[#FF3B47]' : 'bg-[#3EE07F]'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  aiState.status === 'BLACKOUT' ? 'bg-[#FF3B47]' : 'bg-[#3EE07F]'
                }`} />
              </span>
              <span>
                {aiState.status === 'BLACKOUT'
                  ? 'Blackout Active'
                  : `Drop Predicted in ${aiState.minutesUntilDrop} min`}
              </span>
            </div>
            <span className="text-[10px] text-[#6B7A8F]">
              {aiState.confidencePct}% confidence · target 95% accuracy
            </span>
          </div>

          {/* MANDATORY ANTARCTIC MODE TOGGLE (SNOWFLAKE ICON) */}
          <button
            onClick={() => setIsAntarcticMode(prev => !prev)}
            title="Toggle Antarctic High-Visibility Extreme Climate Mode (Ctrl+Shift+A)"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isAntarcticMode
                ? 'bg-[#FFD700] text-[#000000] border-[#FFD700] shadow-[0_0_15px_#FFD700]'
                : 'bg-[#060B14] text-[#00E0C6] border-[#1A2533] hover:border-[#00E0C6]'
            }`}
          >
            <Snowflake className="w-4 h-4" />
          </button>

          {/* Operations AI Chatbot Toggle */}
          <button
            onClick={() => setIsChatbotOpen(true)}
            title="Open Antarctic Operations AI Assistant"
            className="p-2 bg-[#060B14] hover:bg-slate-800 text-[#00E0C6] rounded-lg border border-[#1A2533] transition-colors"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Role Badge & Auth Modal Opener */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#060B14] hover:bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00E0C6]" />
            <span className="font-semibold text-[#E8EEF4]">{userRole}</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN LAYOUT: LEFT SIDEBAR + WORKSPACE CONTENT + RIGHT SIDEBAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDEBAR: ALL 10 DASHBOARD SCREENS + BLACKOUT BUTTON */}
        <aside className="w-64 bg-[#0A121E] border-r border-[#1A2533] flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            
            {/* Primary Navigation Items */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider px-3 mb-1">
                Digital Twin & Operations
              </div>

              {[
                { id: 'twin' as ScreenId, name: 'Digital Twin 3D View', icon: Layers },
                { id: 'triage' as ScreenId, name: 'Alert Triage & Incidents', icon: ShieldAlert },
                { id: 'station' as ScreenId, name: 'Station & Personnel Roster', icon: Users },
                { id: 'weather' as ScreenId, name: 'Live Weather & Graphs', icon: CloudSun },
                { id: 'environment' as ScreenId, name: 'Local Cryosphere & Radar', icon: Wind },
                { id: 'microgrid' as ScreenId, name: 'Microgrid & CHP Command', icon: Zap },
                { id: 'overview' as ScreenId, name: 'Antarctica 4-Station Overview', icon: Globe2 },
              ].map(item => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#00E0C6] text-[#060B14] font-bold shadow-md'
                        : 'text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#060B14]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* MANDATORY ITEM IN LEFT SIDEBAR: AI CONTINUITY & BLACKOUT SIMULATION BUTTON */}
            <div className="pt-2 border-t border-[#1A2533] space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider px-3">
                Autonomous Continuity
              </div>

              <button
                onClick={() => setCurrentScreen('continuity')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                  currentScreen === 'continuity'
                    ? 'bg-[#00E0C6] text-[#060B14] font-bold'
                    : 'text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#060B14]'
                }`}
              >
                <BrainCircuit className="w-4 h-4 shrink-0 text-[#00E0C6]" />
                <span className="truncate">AI Continuity Engine</span>
              </button>

              {/* MANDATORY: "SIMULATE SATELLITE BLACKOUT" BUTTON IN LEFT SIDEBAR */}
              <button
                onClick={() => {
                  setCurrentScreen('continuity');
                  aiPredictor.simulateSatelliteBlackout();
                }}
                disabled={aiState.isSimulating}
                className="w-full py-2 px-3 bg-[#FFB020]/15 hover:bg-[#FFB020]/25 text-[#FFB020] border border-[#FFB020]/40 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Satellite Blackout</span>
              </button>
            </div>

            {/* Compliance & Science Archives */}
            <div className="pt-2 border-t border-[#1A2533] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider px-3 mb-1">
                Governance & Archives
              </div>

              {[
                { id: 'library' as ScreenId, name: 'NCPOR Technical Library', icon: BookOpen },
                { id: 'compliance' as ScreenId, name: 'NPDC Compliance Center', icon: FileCheck2 },
                { id: 'expeditions' as ScreenId, name: 'Expedition Logs (ISEA 1-46)', icon: History },
                { id: 'audit' as ScreenId, name: 'Audit Trail (Hash-Chain)', icon: Database },
              ].map(item => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#00E0C6] text-[#060B14] font-bold shadow-md'
                        : 'text-[#6B7A8F] hover:text-[#E8EEF4] hover:bg-[#060B14]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer: MQTT Status Indicator & Offline Queue Count */}
          <div className="p-4 border-t border-[#1A2533] bg-[#060B14]/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7A8F] text-[11px] font-semibold">MQTT HiveMQ:</span>
              <span className={`font-mono text-[11px] font-bold flex items-center gap-1.5 ${
                mqttStatus === 'CONNECTED' ? 'text-[#3EE07F]' : 'text-[#FFB020]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  mqttStatus === 'CONNECTED' ? 'bg-[#3EE07F]' : 'bg-[#FFB020] animate-pulse'
                }`} />
                {mqttStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B7A8F]">
              <span>Pending Queue:</span>
              <span className="font-mono text-[#E8EEF4] font-bold">{pendingQueueCount} items</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#6B7A8F]">
              <span>Delta Reduction:</span>
              <span className="font-mono text-[#00E0C6] font-bold">{compressionStats.reductionPercentage}% (250KB→1.2KB)</span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA: ACTIVE SCREEN */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#060B14]">
          {currentScreen === 'twin' && (
            <DigitalTwinScreen
              activeStation={activeStation}
              onStationSelect={setActiveStation}
              aiState={aiState}
              isAntarcticMode={isAntarcticMode}
            />
          )}

          {currentScreen === 'triage' && (
            <AlertTriageScreen
              activeStation={activeStation}
              userRole={userRole}
            />
          )}

          {currentScreen === 'station' && (
            <StationDashboardScreen
              activeStation={activeStation}
            />
          )}

          {currentScreen === 'weather' && (
            <WeatherPage
              activeStation={activeStation}
              temperature={stationTemp}
              windSpeed={stationWind}
            />
          )}

          {currentScreen === 'environment' && (
            <LocalEnvironmentScreen
              activeStation={activeStation}
            />
          )}

          {currentScreen === 'microgrid' && (
            <MicrogridCommandScreen
              activeStation={activeStation}
              userRole={userRole}
            />
          )}

          {currentScreen === 'overview' && (
            <AntarcticaOverviewScreen
              onStationSelect={(st) => {
                setActiveStation(st);
                setCurrentScreen('twin');
              }}
            />
          )}

          {currentScreen === 'continuity' && (
            <AiContinuityScreen
              activeStation={activeStation}
              aiState={aiState}
            />
          )}

          {currentScreen === 'library' && (
            <NcporLibraryScreen />
          )}

          {currentScreen === 'compliance' && (
            <NpdcComplianceScreen activeStation={activeStation} />
          )}

          {currentScreen === 'expeditions' && (
            <ExpeditionLogsScreen />
          )}

          {currentScreen === 'audit' && (
            <AuditTrailScreen />
          )}
        </main>

        {/* RIGHT SIDEBAR: MANDATORY "AI CONTINUITY ENGINE" CARD & STATION SPECS */}
        <aside className="w-72 bg-[#0A121E] border-l border-[#1A2533] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex">
          <div className="space-y-4">
            
            {/* MANDATORY LOCATION 4: RIGHT SIDEBAR CARD "AI Continuity Engine" */}
            <div className="p-4 bg-[#060B14] rounded-xl border border-[#00E0C6]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-[#00E0C6]" />
                  <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
                    AI Continuity Engine
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                  aiState.status === 'BLACKOUT' ? 'bg-[#FF3B47]/20 text-[#FF3B47]' : 'bg-[#00E0C6]/20 text-[#00E0C6]'
                }`}>
                  {aiState.status === 'BLACKOUT' ? 'ACTIVE (BLACKOUT)' : 'STANDBY'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#6B7A8F]">
                <div className="flex justify-between">
                  <span>Last Prediction:</span>
                  <span className="font-mono text-[#E8EEF4] font-medium">94.8% Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Outage Window:</span>
                  <span className="font-mono text-[#FFB020] font-bold">{aiState.minutesUntilDrop} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-mono text-[#00E0C6] font-bold">{aiState.confidencePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Historical Accuracy:</span>
                  <span className="font-mono text-[#3EE07F] font-bold">{aiState.historicalAccuracy}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentScreen('continuity')}
                className="w-full py-1.5 bg-[#00E0C6]/10 hover:bg-[#00E0C6]/20 text-[#00E0C6] text-xs font-bold rounded transition-colors uppercase tracking-wider"
              >
                View Prediction Model
              </button>
            </div>

            {/* Current Station Profile */}
            <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider">
                Active Station Specifications
              </span>
              <h4 className="text-sm font-bold text-[#E8EEF4]">{stationInfo.name}</h4>
              <div className="text-xs text-[#6B7A8F] space-y-1 pt-1">
                <div>Built: <strong className="text-[#E8EEF4]">{stationInfo.builtYear}</strong></div>
                <div>Location: <span className="text-[#E8EEF4]">{stationInfo.location}</span></div>
                <div>Vulnerability: <span className="text-[#FFB020]">{stationInfo.keyVulnerability}</span></div>
              </div>
            </div>

            {/* Madrid Protocol Environmental Status */}
            <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider">
                ATS Madrid Protocol
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#3EE07F]">
                <Shield className="w-4 h-4" />
                <span>Zero Liquid Contamination</span>
              </div>
              <p className="text-[11px] text-[#6B7A8F]">
                Biological MBBR treatment and incinerator ash containerization audited.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-[#6B7A8F] pt-4 border-t border-[#1A2533]">
            <span>NCPOR Polar Operations Center</span>
            <div className="mt-0.5">Govt. of India · MoES · 46th ISEA</div>
          </div>
        </aside>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* FOOTER BAR — MANDATORY AI ENGINE ACTIVE INDICATOR & COPYRIGHT */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="h-9 px-6 bg-[#0A121E] border-t border-[#1A2533] flex items-center justify-between text-xs text-[#6B7A8F] z-20">
        <div className="flex items-center gap-4">
          {/* MANDATORY LOCATION 6: FOOTER BAR AI ENGINE: ACTIVE (CYAN DOT) */}
          <div className="flex items-center gap-1.5 font-mono text-[#E8EEF4]">
            <span className="w-2 h-2 rounded-full bg-[#00E0C6] animate-pulse" />
            <span className="text-[#00E0C6] font-bold">AI Engine: ACTIVE</span>
            <span className="text-[#6B7A8F]">·</span>
            <span className="text-[11px] text-[#6B7A8F]">target 95% accuracy</span>
          </div>

          <span className="text-[#1A2533]">|</span>
          <span className="font-mono text-[11px]">MQTT Topic: dhruvatwin/telemetry/{activeStation}/#</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>DhruvaTwin · Team HackFinity007</span>
          <span>·</span>
          <span>NCPOR Ministry of Earth Sciences</span>
          <span>·</span>
          <span className="font-bold text-[#E8EEF4]">Smart India Hackathon 2026</span>
        </div>
      </footer>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* OVERLAYS & MODALS                                            */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. Full Antarctic Mode Ground Staff Interface (SECTION 3 MANDATORY) */}
      {isAntarcticMode && (
        <AntarcticModeProvider
          temperature={stationTemp}
          windSpeed={stationWind}
          userRole={userRole}
          activeStation={activeStation}
        >
          <AntarcticLayout
            activeStation={activeStation}
            temperature={stationTemp}
            windSpeed={stationWind}
            onExit={() => {
              setIsAntarcticMode(false);
              setHasDismissedAntarctic(true);
            }}
            onTriggerSos={() => {
              setIsAntarcticMode(false);
              setCurrentScreen('triage');
            }}
          />
        </AntarcticModeProvider>
      )}

      {/* 2. Operations AI Assistant Drawer */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeStation={activeStation}
        temperature={stationTemp}
        windSpeed={stationWind}
        blackoutStatus={aiState.status}
      />

      {/* 3. Authentication & Role Switcher Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121E] border border-[#1A2533] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A2533] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  Authentication & Station Role
                </h3>
                <span className="text-xs text-[#6B7A8F]">Freebuff OAuth / Built-in Role Control</span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-[#6B7A8F] hover:text-[#E8EEF4]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
                Select Active Operational Role
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['Admin', 'Commander', 'Field Staff', 'Scientist', 'User'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      if (role === 'Field Staff') {
                        setIsAntarcticMode(true);
                      }
                      setIsAuthModalOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all text-left ${
                      userRole === role
                        ? 'bg-[#00E0C6] text-[#060B14] border-[#00E0C6]'
                        : 'bg-[#060B14] text-[#E8EEF4] border-[#1A2533] hover:border-slate-600'
                    }`}
                  >
                    <div>{role}</div>
                    <div className={`text-[10px] font-normal ${userRole === role ? 'text-[#060B14]/80' : 'text-[#6B7A8F]'}`}>
                      {role === 'Admin' ? 'Full SCADA overrides' :
                       role === 'Commander' ? 'Mission overview' :
                       role === 'Field Staff' ? 'Auto-enables Antarctic Mode' :
                       role === 'Scientist' ? 'NPDC data exports' : 'Station personnel'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1A2533] space-y-2">
              <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
                Single Sign-On Integration
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="flex-1 py-2 bg-[#060B14] hover:bg-slate-800 text-xs font-semibold text-[#E8EEF4] rounded border border-[#1A2533]"
                >
                  Google OAuth
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="flex-1 py-2 bg-[#060B14] hover:bg-slate-800 text-xs font-semibold text-[#E8EEF4] rounded border border-[#1A2533]"
                >
                  GitHub OAuth
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="flex-1 py-2 bg-[#060B14] hover:bg-slate-800 text-xs font-semibold text-[#E8EEF4] rounded border border-[#1A2533]"
                >
                  Email Magic Link
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="w-full py-2.5 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider"
            >
              Confirm Role Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
