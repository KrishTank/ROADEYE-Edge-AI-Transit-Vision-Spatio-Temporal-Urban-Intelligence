/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DhruvaTwin Antarctic Emperor Penguin Mascot & Sentinel Component
 * Modern, clean, geometric polar vector design with telemetry IoT halo
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, ShieldCheck } from 'lucide-react';

interface PenguinMascotProps {
  size?: 'sm' | 'md' | 'lg';
  showSoundButton?: boolean;
  className?: string;
  stationName?: string;
}

export const PenguinMascot: React.FC<PenguinMascotProps> = ({
  size = 'md',
  showSoundButton = true,
  className = '',
  stationName = 'Maitri'
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Synthesize realistic Emperor Penguin dual-syrinx trumpet call using Web Audio API
  const playPenguinCall = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      const now = audioCtx.currentTime;

      // Natural polar Emperor penguin trumpet modulation
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.32);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.52);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.8);

      setIsPlayingSound(true);
      setTimeout(() => setIsPlayingSound(false), 850);
    } catch {
      // Audio context graceful fallback
    }
  };

  const dimensions = {
    sm: { w: 100, h: 120, viewBox: '0 0 200 240' },
    md: { w: 160, h: 190, viewBox: '0 0 200 240' },
    lg: { w: 220, h: 260, viewBox: '0 0 200 240' }
  }[size];

  return (
    <div 
      className={`relative inline-flex flex-col items-center group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Polar Aura Glow */}
      <div 
        className={`absolute -inset-3 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          isHovered || isPlayingSound
            ? 'bg-gradient-to-tr from-[#00E0C6]/30 via-[#3EE07F]/25 to-[#4A9EFF]/30 opacity-90 scale-110'
            : 'bg-[#00E0C6]/10 opacity-50 scale-95'
        }`}
      />

      {/* SVG Vector Mascot */}
      <div className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.03]">
        <svg
          width={dimensions.w}
          height={dimensions.h}
          viewBox={dimensions.viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Linear & Radial Gradients for Sleek Polar Aesthetic */}
            <linearGradient id="penguinBodyGrad" x1="100" y1="20" x2="100" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#121C2B" />
              <stop offset="50%" stopColor="#0B131E" />
              <stop offset="100%" stopColor="#060B14" />
            </linearGradient>

            <linearGradient id="penguinBellyGrad" x1="100" y1="80" x2="100" y2="215" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E6F2F7" />
              <stop offset="100%" stopColor="#B8D5E5" />
            </linearGradient>

            <linearGradient id="emperorGoldGrad" x1="60" y1="55" x2="140" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFB020" />
              <stop offset="45%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>

            <linearGradient id="techCollarGrad" x1="65" y1="105" x2="135" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E0C6" />
              <stop offset="50%" stopColor="#3EE07F" />
              <stop offset="100%" stopColor="#00E0C6" />
            </linearGradient>

            <linearGradient id="beakGrad" x1="100" y1="58" x2="100" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF9F1C" />
              <stop offset="60%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#D84315" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ice / Shadow Platform */}
          <ellipse cx="100" cy="226" rx="68" ry="10" fill="#00E0C6" fillOpacity="0.12" />
          <ellipse cx="100" cy="226" rx="48" ry="6" fill="#0A121E" fillOpacity="0.6" />

          {/* Webbed Feet (Modern geometric styling) */}
          <path d="M72 216 C68 218 64 225 68 228 C74 231 84 228 87 220 Z" fill="#FFB020" />
          <path d="M128 216 C132 218 136 225 132 228 C126 231 116 228 113 220 Z" fill="#FFB020" />

          {/* Wings / Flippers */}
          {/* Left Wing */}
          <path
            d="M58 96 C42 120 34 165 42 186 C46 195 54 185 58 170 C63 150 67 122 68 104 Z"
            fill="#0F1824"
            stroke="#1A283A"
            strokeWidth="1.5"
          />
          {/* Right Wing */}
          <path
            d="M142 96 C158 120 166 165 158 186 C154 195 146 185 142 170 C137 150 133 122 132 104 Z"
            fill="#0F1824"
            stroke="#1A283A"
            strokeWidth="1.5"
          />

          {/* Main Body Silhouette */}
          <path
            d="M100 24 C72 24 55 50 55 95 C55 145 60 216 75 220 C84 222 116 222 125 220 C140 216 145 145 145 95 C145 50 128 24 100 24 Z"
            fill="url(#penguinBodyGrad)"
            stroke="#1E2D3D"
            strokeWidth="2"
          />

          {/* Emperor Golden Neck Patches (Signature Emperor Penguin Feature) */}
          <path
            d="M62 68 C58 84 64 102 74 106 C80 96 78 78 72 70 Z"
            fill="url(#emperorGoldGrad)"
            opacity="0.95"
          />
          <path
            d="M138 68 C142 84 136 102 126 106 C120 96 122 78 128 70 Z"
            fill="url(#emperorGoldGrad)"
            opacity="0.95"
          />

          {/* White / Polar Chest & Belly */}
          <path
            d="M100 88 C80 88 70 115 70 156 C70 196 82 216 100 216 C118 216 130 196 130 156 C130 115 120 88 100 88 Z"
            fill="url(#penguinBellyGrad)"
          />

          {/* Soft Golden Upper-Breast Flush */}
          <path
            d="M100 92 C88 92 82 104 82 118 C90 126 110 126 118 118 C118 104 112 92 100 92 Z"
            fill="#FFD700"
            fillOpacity="0.28"
          />

          {/* Smart IoT Sensor Telemetry Collar (SIH Digital Twin Concept) */}
          <path
            d="M68 104 C88 114 112 114 132 104"
            stroke="url(#techCollarGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="110" r="4.5" fill="#00E0C6" filter="url(#neonGlow)" />
          <circle cx="100" cy="110" r="2" fill="#FFFFFF" />

          {/* Sleek Beak */}
          <path
            d="M100 58 L90 73 C96 76 104 76 110 73 Z"
            fill="url(#beakGrad)"
          />
          <line x1="90" y1="73" x2="110" y2="73" stroke="#9A2E0C" strokeWidth="1.2" />

          {/* Eyes (Friendly & Focused) */}
          {/* Left Eye */}
          <ellipse cx="86" cy="54" rx="4.5" ry="5.5" fill="#FFFFFF" />
          <circle cx="87" cy="54" r="2.8" fill="#060B14" />
          <circle cx="88.5" cy="52.5" r="1.1" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="114" cy="54" rx="4.5" ry="5.5" fill="#FFFFFF" />
          <circle cx="113" cy="54" r="2.8" fill="#060B14" />
          <circle cx="114.5" cy="52.5" r="1.1" fill="#FFFFFF" />

          {/* Cyber Eye Glint / Polar Explorer Tech Highlight */}
          <circle cx="89" cy="53" r="0.8" fill="#00E0C6" />
          <circle cx="115" cy="53" r="0.8" fill="#00E0C6" />

          {/* Active Audio Pulse Rings (shown when sound is playing) */}
          {isPlayingSound && (
            <>
              <circle cx="100" cy="74" r="18" stroke="#00E0C6" strokeWidth="1.5" strokeOpacity="0.8" fill="none" className="animate-ping" />
              <circle cx="100" cy="74" r="28" stroke="#3EE07F" strokeWidth="1" strokeOpacity="0.5" fill="none" className="animate-ping" style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </svg>
      </div>

      {/* Mascot Metadata & Sound Toggle */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] font-heading flex items-center gap-1.5">
          <span>Dhruva</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00E0C6]/15 text-[#00E0C6] border border-[#00E0C6]/30">
            Polar Sentinel
          </span>
        </span>

        {showSoundButton && (
          <button
            onClick={playPenguinCall}
            title="Play Emperor Penguin vocal call (Madrid Protocol Bio-Telemetry)"
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isPlayingSound
                ? 'bg-[#00E0C6] text-[#060B14] border-[#00E0C6] shadow-[0_0_12px_#00E0C6]'
                : 'bg-[#0A121E] hover:bg-[#1A2533] text-[#00E0C6] border-[#1A2533]'
            }`}
          >
            {isPlayingSound ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="text-[10px] text-[#6B7A8F] mt-0.5 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-[#3EE07F]" />
        <span>Madrid Protocol Annex II Protected</span>
      </div>
    </div>
  );
};
