/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Emperor Penguin Sanctuary & Antarctic Wildlife Bio-Telemetry Modal
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { 
  Heart, 
  Shield, 
  Volume2, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  X, 
  Activity, 
  Eye, 
  Sparkles,
  Info
} from 'lucide-react';

interface PenguinModalProps {
  station: StationId;
  onClose: () => void;
}

export const PenguinModal: React.FC<PenguinModalProps> = ({ station, onClose }) => {
  const isMaitri = station === 'maitri';
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Synthesize realistic penguin call sound with Web Audio API
  const playPenguinVocalization = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      // Dual-frequency penguin trumpeting syrinx modulation
      osc.type = 'sawtooth';
      const now = audioCtx.currentTime;
      
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.55);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.85);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.85);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 900);
    } catch {
      // Audio context fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A121E] border border-[#1A2533] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E0C6]/15 border border-[#00E0C6]/40 flex items-center justify-center text-2xl">
              🐧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#FFFFFF]">
                  {isMaitri ? 'Schirmacher Emperor Penguin Colony' : 'Larsemann Coastal Adélie Penguin Colony'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3EE07F]/20 text-[#3EE07F] border border-[#3EE07F]/30">
                  PROTECTED
                </span>
              </div>
              <div className="text-xs text-[#6B7A8F] mt-0.5">
                Aptenodytes forsteri / Pygoscelis adeliae · Madrid Protocol Annex II Protected Fauna
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1A2533] text-[#6B7A8F] hover:text-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Bio Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
              <span className="text-[#6B7A8F] uppercase text-[10px] font-bold">Colony Count</span>
              <div className="text-xl font-black font-mono text-[#00E0C6] mt-1">42 Adults</div>
              <span className="text-[10px] text-[#3EE07F]">+18 Chicks</span>
            </div>

            <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
              <span className="text-[#6B7A8F] uppercase text-[10px] font-bold">Station Buffer</span>
              <div className="text-xl font-black font-mono text-[#FFD700] mt-1">320m</div>
              <span className="text-[10px] text-[#3EE07F]">Safe (&gt;100m Min)</span>
            </div>

            <div className="p-3 bg-[#060B14] rounded-xl border border-[#1A2533] text-center">
              <span className="text-[#6B7A8F] uppercase text-[10px] font-bold">Colony Activity</span>
              <div className="text-xl font-black font-mono text-[#E8EEF4] mt-1">Huddling</div>
              <span className="text-[10px] text-[#6B7A8F]">Wind Shielding</span>
            </div>
          </div>

          {/* Madrid Protocol Notice */}
          <div className="p-4 bg-[#3EE07F]/10 border border-[#3EE07F]/30 rounded-xl space-y-2 text-[#3EE07F]">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Madrid Protocol Annex II Strict Protection</span>
            </div>
            <p className="text-[11px] text-[#E8EEF4] leading-relaxed">
              No human approach within 100 meters without specialized scientific permit from NCPOR MoES.
              Aircraft overflight prohibited below 2,000 feet AGL. Tracked vehicles must maintain a minimum 200m perimeter.
            </p>
          </div>

          {/* Interactive Penguin Vocalization Synthesizer */}
          <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-bold text-[#E8EEF4]">Acoustic Bio-Monitor</div>
              <div className="text-[#6B7A8F] text-[11px]">
                Listen to dual-syrinx individual identification contact vocalization.
              </div>
            </div>

            <button
              onClick={playPenguinVocalization}
              disabled={isPlayingAudio}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-[#00E0C6] text-[#060B14] shadow-[0_0_20px_#00E0C6]' 
                  : 'bg-[#00E0C6]/15 hover:bg-[#00E0C6]/25 text-[#00E0C6] border border-[#00E0C6]/40'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'Playing Call...' : 'Play Penguin Call'}</span>
            </button>
          </div>

          {/* Behavioral Observations */}
          <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-2">
            <div className="font-bold text-[#E8EEF4] uppercase text-[11px] tracking-wider">
              Observed Micro-Behaviors in 3D Scene
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B7A8F]">
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <strong className="text-[#E8EEF4]">Waddling Traverse:</strong> Realistic side-to-side body sway conserving energy on snow ridges.
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <strong className="text-[#E8EEF4]">Tobogganing:</strong> Belly sliding across smooth glazed lake ice to navigate down slopes.
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <strong className="text-[#E8EEF4]">Thermal Huddling:</strong> Dense formation rotating positions to endure -25°C katabatic winds.
              </div>
              <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                <strong className="text-[#E8EEF4]">Wing Flapping:</strong> Spreading flippers to balance and signal family members.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1A2533] bg-[#060B14] flex items-center justify-between">
          <span className="text-[11px] text-[#6B7A8F]">
            Indian Antarctic Research Expedition Wildlife Survey · 46th ISEA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00E0C6] hover:bg-[#00E0C6]/80 text-[#060B14] font-black rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
