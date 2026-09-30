/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AI Continuity & Satellite Blackout Predictor Command Center
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { StationId } from '../../types';
import { aiPredictor, AiPredictorState } from '../../services/aiPredictor';
import { Activity, AlertOctagon, BrainCircuit, CheckCircle2, Clock, Play, Radio, RefreshCw, Satellite, ShieldAlert, Zap } from 'lucide-react';

interface AiContinuityScreenProps {
  activeStation: StationId;
  aiState: AiPredictorState;
}

export const AiContinuityScreen: React.FC<AiContinuityScreenProps> = ({ activeStation, aiState }) => {
  const isBlackout = aiState.status === 'BLACKOUT';

  const handleSimulateBlackout = () => {
    aiPredictor.simulateSatelliteBlackout();
  };

  const handleManualEnd = () => {
    aiPredictor.endSimulation();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
            AI Continuity Engine & Satellite Blackout Predictor
          </h2>
          <p className="text-xs text-[#6B7A8F] mt-0.5">
            Real-time orbital geometry, ionospheric scintillation analysis, and ResNet-LSTM synthetic telemetry imputation.
          </p>
        </div>

        {/* Action Button: Simulate Satellite Blackout */}
        <div className="flex items-center gap-3">
          {isBlackout ? (
            <button
              onClick={handleManualEnd}
              className="py-2 px-4 bg-[#FF3B47] hover:bg-[#FF3B47]/90 text-white font-bold text-xs rounded transition-colors uppercase tracking-wider flex items-center gap-2 animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Abort Simulation ({aiState.blackoutRemainingSec}s)</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateBlackout}
              className="py-2.5 px-5 bg-[#FFB020] hover:bg-[#FFB020]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#FFB020]/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate Satellite Blackout (60s)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 STATUS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status 1: Link Status */}
        <div className={`p-4 rounded-xl border transition-all ${
          isBlackout 
            ? 'bg-[#FF3B47]/20 border-[#FF3B47]' 
            : 'bg-[#0A121E] border-[#1A2533]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">VSAT Satellite Link</span>
            <Satellite className={`w-5 h-5 ${isBlackout ? 'text-[#FF3B47]' : 'text-[#3EE07F]'}`} />
          </div>
          <div className={`text-2xl font-mono font-bold mt-2 ${
            isBlackout ? 'text-[#FF3B47] animate-pulse' : 'text-[#3EE07F]'
          }`}>
            {isBlackout ? 'BLACKOUT ACTIVE' : 'LINK STABLE'}
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            {isBlackout ? 'Synthetic Imputation Online' : 'Carrier SNR: 9.2 dB'}
          </div>
        </div>

        {/* Status 2: Drop Prediction */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Predicted Window</span>
            <Clock className="w-5 h-5 text-[#FFB020]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#FFB020] mt-2">
            {isBlackout ? '0 min' : `In ${aiState.minutesUntilDrop} min`}
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Duration forecast: 12-18 min
          </div>
        </div>

        {/* Status 3: Confidence Score */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Model Confidence</span>
            <BrainCircuit className="w-5 h-5 text-[#00E0C6]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#00E0C6] mt-2">
            {aiState.confidencePct}%
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Target 95% accuracy benchmark
          </div>
        </div>

        {/* Status 4: Historical Accuracy */}
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Historical Accuracy</span>
            <CheckCircle2 className="w-5 h-5 text-[#3EE07F]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#3EE07F] mt-2">
            {aiState.historicalAccuracy}
          </div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">
            Evaluated across 42 blackout events
          </div>
        </div>
      </div>

      {/* TELEMETRY CHART: LIVE DATA (SOLID CYAN) VS AI-PREDICTED DATA (DOTTED ORANGE) */}
      <div className="p-5 bg-[#0A121E] rounded-xl border border-[#1A2533] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2533] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider flex items-center gap-2">
              <span>Telemetry Imputation Stream: Lake Priyadarshini Water Pipeline Core Temp</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#00E0C6]/20 text-[#00E0C6]">
                AI-PREDICTED (target 95% accuracy)
              </span>
            </h3>
            <span className="text-xs text-[#6B7A8F]">
              Solid cyan line denotes live sensor telemetry; dotted orange line denotes neural network predicted continuity stream.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#00E0C6] rounded" />
              <span className="text-[#E8EEF4]">Live Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 border-t-2 border-dashed border-[#FFB020]" />
              <span className="text-[#FFB020]">AI-Predicted Continuity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#FF3B47]/30 border border-[#FF3B47] rounded" />
              <span className="text-[#FF3B47]">Blackout Window</span>
            </div>
          </div>
        </div>

        {/* SVG Telemetry Chart */}
        <div className="relative w-full h-64 bg-[#060B14] rounded-lg border border-[#1A2533] p-4 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#1A2533" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#1A2533" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="#1A2533" strokeDasharray="4 4" />

            {/* Red Vertical Band Marking Blackout Window (x: 480 to 660) */}
            <rect x="480" y="0" width="180" height="200" fill="rgba(255, 59, 71, 0.12)" />
            <line x1="480" y1="0" x2="480" y2="200" stroke="#FF3B47" strokeDasharray="2 2" strokeWidth="1.5" />
            <line x1="660" y1="0" x2="660" y2="200" stroke="#FF3B47" strokeDasharray="2 2" strokeWidth="1.5" />

            {/* Live Data Line (Solid Cyan: 0 to 480) */}
            <path
              d="M 0 110 Q 80 95, 160 115 T 320 100 T 480 120"
              fill="none"
              stroke="#00E0C6"
              strokeWidth="3"
            />

            {/* AI-Predicted Data Line (Dotted Orange: 480 to 660) */}
            <path
              d="M 480 120 Q 520 135, 570 125 T 660 110"
              fill="none"
              stroke="#FFB020"
              strokeWidth="3"
              strokeDasharray="6 4"
            />

            {/* Reacquired Live Data Line (Solid Cyan: 660 to 800) */}
            <path
              d="M 660 110 Q 720 105, 800 115"
              fill="none"
              stroke="#00E0C6"
              strokeWidth="3"
            />

            {/* Pulsing Dot at current position */}
            {isBlackout ? (
              <circle cx="560" cy="128" r="6" fill="#FF3B47" className="animate-ping" />
            ) : (
              <circle cx="480" cy="120" r="5" fill="#00E0C6" />
            )}
          </svg>

          {/* Overlay Text inside chart */}
          <div className="absolute top-4 left-6 text-xs text-[#6B7A8F]">
            Threshold Alert: +0.5°C Freezing Limit
          </div>
          <div className="absolute bottom-4 right-6 text-xs font-mono text-[#E8EEF4]">
            Time: -60m to Present (+15m Lookahead)
          </div>
          <div className="absolute top-4 right-64 text-xs font-mono font-bold text-[#FF3B47]">
            BLACKOUT WINDOW
          </div>
        </div>
      </div>

      {/* RECONCILIATION PANEL (Appears after simulation or when previous report exists) */}
      {aiState.lastReconciliation && (
        <div className="p-5 bg-[#0A121E] rounded-xl border border-[#3EE07F]/40 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2533] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3EE07F]" />
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  Post-Blackout Cryptographic Reconciliation Report
                </h3>
              </div>
              <p className="text-xs text-[#6B7A8F] mt-0.5">
                Completed at {aiState.lastReconciliation.timestamp} · Duration: {aiState.lastReconciliation.durationSec}s · Modeled Points: {aiState.lastReconciliation.totalPredictedPoints}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#3EE07F]/10 border border-[#3EE07F]/30 text-[#3EE07F] font-mono text-xs font-bold rounded">
                Achieved Accuracy: {aiState.lastReconciliation.achievedAccuracy}
              </span>
              <span className="text-xs text-[#6B7A8F]">
                MAE: <strong className="text-[#E8EEF4]">{aiState.lastReconciliation.meanAbsoluteError}%</strong>
              </span>
            </div>
          </div>

          {/* Subsystems Reconciliation Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A2533] text-[#6B7A8F] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Subsystem Telemetry Vector</th>
                  <th className="py-2.5 px-3">AI-Predicted Value</th>
                  <th className="py-2.5 px-3">Actual Reacquired Value</th>
                  <th className="py-2.5 px-3">Error Delta %</th>
                  <th className="py-2.5 px-3">State Model Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2533]/50">
                {aiState.lastReconciliation.reconciledSubsystems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#060B14]">
                    <td className="py-2.5 px-3 font-semibold text-[#E8EEF4]">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#FFB020]">{item.predictedValue}</td>
                    <td className="py-2.5 px-3 font-mono text-[#00E0C6]">{item.actualValue}</td>
                    <td className="py-2.5 px-3 font-mono text-[#3EE07F]">{item.errorPct}%</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3EE07F]/20 text-[#3EE07F]">
                        CONVERGED & UPDATED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
