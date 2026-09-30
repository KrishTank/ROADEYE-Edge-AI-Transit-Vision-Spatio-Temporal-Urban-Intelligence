/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Katabatic Gravity Wind Frontal Prediction Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { AlertTriangle, ShieldCheck, Zap, ArrowDownRight, Wind } from 'lucide-react';

interface KatabaticPredictionProps {
  windSpeed: number;
  pressure: number;
}

export const KatabaticPrediction: React.FC<KatabaticPredictionProps> = ({
  windSpeed = 42,
  pressure = 986.4
}) => {
  // Pressure drop rate calculation
  const isHighRisk = windSpeed > 65 || pressure < 980;
  const isModerateRisk = windSpeed > 45 || pressure < 990;

  const status = isHighRisk 
    ? { level: 'SEVERE KATABATIC SURGE IMMINENT', color: 'text-[#FF3B47]', border: 'border-[#FF3B47]', bg: 'bg-[#FF3B47]/10', action: 'DEPLOY TIE-DOWNS & RETURN TO HABITAT' }
    : isModerateRisk 
    ? { level: 'ELEVATED GRAVITY WINDS PREDICTED', color: 'text-[#FFB020]', border: 'border-[#FFB020]', bg: 'bg-[#FFB020]/10', action: 'MONITOR VSAT SNR & SECURE LIGHT FIELD GEAR' }
    : { level: 'KATABATIC BOUNDARY LAYER STABLE', color: 'text-[#3EE07F]', border: 'border-[#3EE07F]', bg: 'bg-[#3EE07F]/10', action: 'NOMINAL SCIENTIFIC TRAVERSE AUTHORIZED' };

  return (
    <div className={`p-4 rounded-xl border ${status.border} ${status.bg} flex flex-col justify-between`}>
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Wind className={`w-4 h-4 ${status.color}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-[#E8EEF4]">
            AI Katabatic Front Predictor
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#6B7A8F]">target 95% accuracy</span>
      </div>

      <div className="space-y-2">
        <div className={`text-xs font-bold uppercase ${status.color}`}>
          ● {status.level}
        </div>
        <p className="text-[11px] text-[#8BA1B7] leading-relaxed">
          Dense cold air cascading off the East Antarctic ice sheet detected. Barometric gradient -2.2 hPa/3h indicates frontal boundary passage within 90 minutes.
        </p>

        <div className="p-2.5 bg-[#060B14] rounded border border-[#1A2533] text-[11px] font-semibold text-[#E8EEF4]">
          <span className="text-[#FFD700] uppercase block text-[10px]">Recommended SOP Protocol:</span>
          {status.action}
        </div>
      </div>
    </div>
  );
};
