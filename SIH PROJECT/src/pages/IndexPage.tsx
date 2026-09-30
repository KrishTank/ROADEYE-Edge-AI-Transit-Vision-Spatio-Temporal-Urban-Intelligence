/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DhruvaTwin Index / Home Page — Penguin-Inspired Welcome Portal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  CloudSnow,
  Globe2,
  Layers,
  RefreshCw,
  Shield,
  ShieldAlert,
  Snowflake,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { StationId, UserRole } from '../types';
import { STATIONS_DATA } from '../data/stationConstants';
import { aiPredictor, AiPredictorState } from '../services/aiPredictor';
import { getLiveAiSuggestions, StationAiSummary, SuggestionPriority } from '../services/aiSuggestionService';
import { PenguinMascot } from '../components/PenguinMascot';
import type { ScreenId } from '../App';

interface IndexPageProps {
  activeStation: StationId;
  userRole: UserRole;
  stationTemp: number;
  stationWind: number;
  onEnterDashboard: (screen?: ScreenId) => void;
}

const PRIORITY_STYLES: Record<SuggestionPriority, {
  bg: string; border: string; badge: string; icon: typeof AlertTriangle;
}> = {
  CRITICAL: {
    bg: 'bg-[#FF3B47]/10',
    border: 'border-[#FF3B47]/50',
    badge: 'bg-[#FF3B47]/20 text-[#FF3B47] border-[#FF3B47]/40',
    icon: AlertTriangle,
  },
  WARNING: {
    bg: 'bg-[#FFB020]/10',
    border: 'border-[#FFB020]/50',
    badge: 'bg-[#FFB020]/20 text-[#FFB020] border-[#FFB020]/40',
    icon: AlertTriangle,
  },
  ADVISORY: {
    bg: 'bg-[#4A9EFF]/10',
    border: 'border-[#4A9EFF]/40',
    badge: 'bg-[#4A9EFF]/20 text-[#4A9EFF] border-[#4A9EFF]/40',
    icon: Activity,
  },
  OPTIMAL: {
    bg: 'bg-[#3EE07F]/8',
    border: 'border-[#3EE07F]/30',
    badge: 'bg-[#3EE07F]/20 text-[#3EE07F] border-[#3EE07F]/40',
    icon: Shield,
  },
};

const PRIORITY_BADGES: Record<SuggestionPriority, string> = {
  CRITICAL: '⚡ CRITICAL',
  WARNING: '⚠ WARNING',
  ADVISORY: '🛈 ADVISORY',
  OPTIMAL: '✓ OPTIMAL',
};

export const IndexPage: React.FC<IndexPageProps> = ({
  activeStation,
  userRole,
  stationTemp,
  stationWind,
  onEnterDashboard,
}) => {
  const [aiState, setAiState] = useState<AiPredictorState>(aiPredictor.getState());
  const [suggestions, setSuggestions] = useState<StationAiSummary | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const stationInfo = STATIONS_DATA[activeStation];

  useEffect(() => {
    const unsub = aiPredictor.subscribe(setAiState);
    return unsub;
  }, []);

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const result = await getLiveAiSuggestions(activeStation);
      setSuggestions(result);
      setLastRefreshed(new Date());
    } catch {
      setSuggestionError('Unable to compute suggestions — telemetry service unavailable.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
    const interval = setInterval(loadSuggestions, 120000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStation]);

  const healthScore = suggestions?.overallHealthScore ?? 100;
  const healthColor = healthScore >= 90 ? '#3EE07F' : healthScore >= 70 ? '#FFB020' : '#FF3B47';
  const healthLabel = healthScore >= 90 ? 'All Systems Nominal' : healthScore >= 70 ? 'Minor Advisories Active' : 'Critical Attention Required';

  const blackoutColor =
    aiState.status === 'BLACKOUT' ? '#FF3B47' :
    aiState.minutesUntilDrop <= 15 ? '#FFB020' : '#3EE07F';

  const quickActions: Array<{ label: string; icon: typeof Layers; screen: ScreenId; desc: string }> = [
    { label: '3D Digital Twin', icon: Layers, screen: 'twin', desc: 'Walkable station interior' },
    { label: 'Alert Triage', icon: ShieldAlert, screen: 'triage', desc: 'Incident review & SOPs' },
    { label: 'Live Weather', icon: CloudSnow, screen: 'weather', desc: 'Real-time cryosphere data' },
    { label: 'AI Continuity', icon: BrainCircuit, screen: 'continuity', desc: 'Blackout prediction engine' },
    { label: 'Microgrid', icon: Zap, screen: 'microgrid', desc: 'Power & energy command' },
    { label: 'Overview', icon: Globe2, screen: 'overview', desc: 'All 4 Antarctic stations' },
  ];

  return (
    <div className="min-h-screen bg-[#060B14] text-[#E8EEF4] overflow-x-hidden">

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[600px] h-[400px] rounded-full bg-[#00E0C6] opacity-[0.04] blur-3xl" />
        <div className="absolute top-0 right-0 w-[450px] h-[350px] rounded-full bg-[#4A9EFF] opacity-[0.04] blur-3xl" />
      </div>

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-10 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">

            {/* Left — Branding & CTA */}
            <div className="flex-1 text-center lg:text-left">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E0C6]/10 border border-[#00E0C6]/25 text-[#00E0C6] text-xs font-bold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E0C6] animate-pulse" />
                SIH 2026 · PS 26060 · Team HackFinity007
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight mb-2">
                Dhruva<span className="text-[#00E0C6]">Twin</span>
              </h1>
              <p className="text-base sm:text-lg text-[#8A9BB0] font-medium mb-2 max-w-lg mx-auto lg:mx-0">
                Antarctic Stations Digital Twin
              </p>
              <p className="text-sm text-[#6B7A8F] max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed">
                Offline-first polar operations platform for Indian Antarctic research stations{' '}
                <strong className="text-[#E8EEF4]">Maitri</strong> &amp;{' '}
                <strong className="text-[#E8EEF4]">Bharati</strong> — powered by real-time SCADA
                telemetry, AI continuity prediction, and Madrid Protocol compliance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  id="btn-explore-dashboard"
                  onClick={() => onEnterDashboard('twin')}
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-sm rounded-xl shadow-lg shadow-[#00E0C6]/20 transition-all hover:shadow-[#00E0C6]/35 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Layers className="w-4 h-4" />
                  Explore Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  id="btn-view-ai-continuity"
                  onClick={() => onEnterDashboard('continuity')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0A121E] hover:bg-[#1A2533] text-[#00E0C6] font-semibold text-sm rounded-xl border border-[#00E0C6]/30 hover:border-[#00E0C6]/60 transition-all"
                >
                  <BrainCircuit className="w-4 h-4" />
                  AI Continuity Engine
                </button>
              </div>

              {/* Live status pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs font-mono">
                  <Thermometer className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-[#FFD700] font-bold">{stationTemp}°C</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs font-mono">
                  <Wind className="w-3.5 h-3.5 text-[#00E0C6]" />
                  <span className="text-[#00E0C6] font-bold">{stationWind} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: blackoutColor }} />
                  <span className="font-semibold" style={{ color: blackoutColor }}>
                    {aiState.status === 'BLACKOUT' ? 'Blackout Active' : `Comms Drop: ${aiState.minutesUntilDrop} min`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs">
                  <span className="text-[#6B7A8F]">Role:</span>
                  <span className="font-bold text-[#E8EEF4]">{userRole}</span>
                </div>
              </div>
            </div>

            {/* Right — Penguin Mascot */}
            <div className="flex flex-col items-center gap-4">
              <PenguinMascot size="lg" showSoundButton stationName={stationInfo.name} />

              <div className="bg-[#0A121E]/90 border border-[#1A2533] rounded-xl p-3 w-full max-w-[220px]">
                <div className="text-[10px] uppercase font-bold text-[#6B7A8F] tracking-wider mb-1.5">Active Station</div>
                <div className="font-bold text-[#E8EEF4] text-sm">{stationInfo.name}</div>
                <div className="text-[11px] text-[#6B7A8F] mt-0.5">{stationInfo.location}</div>
                <div className="mt-2 pt-2 border-t border-[#1A2533] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: healthColor }} />
                  <span className="text-[11px] font-semibold" style={{ color: healthColor }}>{healthLabel}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-12 mb-8">
        <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-[#1A2533] to-transparent" />
      </div>

      {/* AI SUGGESTION SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 mb-10" aria-labelledby="ai-suggestion-heading">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00E0C6]/10 border border-[#00E0C6]/25">
                <BrainCircuit className="w-5 h-5 text-[#00E0C6]" />
              </div>
              <div>
                <h2 id="ai-suggestion-heading" className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider font-heading">
                  🤖 AI Suggestion
                </h2>
                <p className="text-[11px] text-[#6B7A8F]">
                  Live analysis · {stationInfo.name} · {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {suggestions && <> · <span className="text-[#00E0C6]">{suggestions.modelConfidence}% confidence</span></>}
                </p>
              </div>
            </div>
            <button
              id="btn-refresh-suggestions"
              onClick={loadSuggestions}
              disabled={isLoadingSuggestions}
              title="Refresh AI suggestions"
              className="p-2 rounded-lg bg-[#0A121E] hover:bg-[#1A2533] text-[#6B7A8F] hover:text-[#00E0C6] border border-[#1A2533] transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Loading */}
          {isLoadingSuggestions && (
            <div className="rounded-2xl border border-[#1A2533] bg-[#0A121E] p-6 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-[#00E0C6]/10 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6 text-[#00E0C6]/40" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1A2533] rounded w-2/3" />
                <div className="h-3 bg-[#1A2533] rounded w-full" />
                <div className="h-3 bg-[#1A2533] rounded w-1/2" />
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoadingSuggestions && suggestionError && (
            <div className="rounded-2xl border border-[#FFB020]/40 bg-[#FFB020]/8 p-5 flex items-center gap-3 text-[#FFB020] text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{suggestionError}</span>
            </div>
          )}

          {/* Primary suggestion */}
          {!isLoadingSuggestions && !suggestionError && suggestions && (() => {
            const s = suggestions.primarySuggestion;
            const style = PRIORITY_STYLES[s.priority];
            const Icon = style.icon;
            return (
              <div className={`rounded-2xl border ${style.border} ${style.bg} p-5 sm:p-6 mb-4`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style.badge} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}>
                        {PRIORITY_BADGES[s.priority]}
                      </span>
                      <span className="text-[11px] text-[#6B7A8F] font-mono">{s.subsystem}</span>
                      <span className="text-[11px] text-[#6B7A8F]">· {s.timestamp}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#E8EEF4] mb-1.5">{s.headline}</h3>
                    <p className="text-xs text-[#8A9BB0] leading-relaxed mb-3">{s.details}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => onEnterDashboard(s.targetScreen)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded-lg transition-all hover:scale-[1.02]"
                      >
                        {s.actionLabel}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      {s.sourceSignal && (
                        <span className="text-[11px] font-mono text-[#6B7A8F] bg-[#060B14]/60 px-2 py-1 rounded border border-[#1A2533]">
                          {s.sourceSignal}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Secondary suggestions */}
          {!isLoadingSuggestions && !suggestionError && suggestions && suggestions.secondarySuggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestions.secondarySuggestions.map(s => {
                const style = PRIORITY_STYLES[s.priority];
                const Icon = style.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => onEnterDashboard(s.targetScreen)}
                    className={`rounded-xl border ${style.border} ${style.bg} p-4 cursor-pointer transition-all hover:shadow-md text-left w-full`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${style.badge} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border self-start ${style.badge}`}>
                        {PRIORITY_BADGES[s.priority]}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#E8EEF4] leading-snug mb-1">{s.headline}</p>
                    <p className="text-[11px] text-[#6B7A8F] leading-relaxed line-clamp-2">{s.details}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#00E0C6]">
                      {s.actionLabel} <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* QUICK ACCESS GRID */}
      <section className="px-4 sm:px-6 lg:px-12 mb-10" aria-labelledby="quick-access-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#00E0C6]" />
            <h2 id="quick-access-heading" className="text-sm font-bold text-[#E8EEF4] uppercase tracking-wider font-heading">
              Dashboard Modules
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(({ label, icon: Icon, screen, desc }) => (
              <button
                key={screen}
                id={`btn-nav-${screen}`}
                onClick={() => onEnterDashboard(screen)}
                className="group flex flex-col items-center gap-2.5 p-4 bg-[#0A121E] hover:bg-[#0F1C2D] border border-[#1A2533] hover:border-[#00E0C6]/40 rounded-xl transition-all text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-[#060B14] border border-[#1A2533] group-hover:border-[#00E0C6]/40 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-[#00E0C6]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#E8EEF4] leading-tight">{label}</div>
                  <div className="text-[10px] text-[#6B7A8F] mt-0.5 leading-tight">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STATION STATUS CARDS */}
      <section className="px-4 sm:px-6 lg:px-12 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Station Health', value: `${healthScore}%`, sub: healthLabel, color: healthColor, icon: Activity },
              { label: 'Blackout Confidence', value: `${aiState.confidencePct}%`, sub: `Drop in ${aiState.minutesUntilDrop} min`, color: blackoutColor, icon: BrainCircuit },
              { label: 'Ambient Temperature', value: `${stationTemp}°C`, sub: stationTemp < -20 ? 'Extreme Cold' : 'Polar Climate', color: '#FFD700', icon: Thermometer },
              { label: 'Wind Speed', value: `${stationWind} km/h`, sub: stationWind > 70 ? 'Storm Warning' : stationWind > 40 ? 'High Katabatic' : 'Moderate', color: '#4A9EFF', icon: Wind },
            ].map(({ label, value, sub, color, icon: Icon }) => (
              <div key={label} className="bg-[#0A121E] border border-[#1A2533] rounded-xl p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7A8F]">{label}</span>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="text-xl font-mono font-bold" style={{ color }}>{value}</div>
                <div className="text-[11px] text-[#6B7A8F]">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 lg:px-12 pb-8">
        <div className="max-w-7xl mx-auto border-t border-[#1A2533] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6B7A8F]">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <Globe2 className="w-3.5 h-3.5 text-[#00E0C6]" />
            <span>DhruvaTwin · Team HackFinity007 · SIH 2026 · PS 26060</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <Snowflake className="w-3.5 h-3.5 text-[#00E0C6]" />
            <span>NCPOR · Ministry of Earth Sciences · Govt. of India · 46th ISEA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
