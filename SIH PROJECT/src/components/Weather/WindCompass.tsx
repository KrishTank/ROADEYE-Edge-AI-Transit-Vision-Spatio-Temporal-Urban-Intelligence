/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Polar Wind Compass & Aerodynamic Wind Chill Vector Gauge
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { Compass, Wind, Radio, ShieldAlert } from 'lucide-react';

interface WindCompassProps {
  windDirection: number; // degrees 0-360
  windSpeed: number; // km/h
  temperature: number; // °C
}

export const WindCompass: React.FC<WindCompassProps> = ({
  windDirection = 140,
  windSpeed = 42,
  temperature = -24
}) => {
  // Wind chill formula
  const windChill = Math.round(
    13.12 + 0.6215 * temperature - 11.37 * Math.pow(Math.max(windSpeed, 5), 0.16) + 0.3965 * temperature * Math.pow(Math.max(windSpeed, 5), 0.16)
  );

  const getCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="bg-[#0A121E] border border-[#1A2533] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-3">
        <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#00FFFF]" />
          <span>Katabatic Vector & Wind Chill</span>
        </span>
        <span className="font-mono text-xs font-bold text-[#FFD700]">
          {getCardinal(windDirection)} ({windDirection}°)
        </span>
      </div>

      <div className="flex items-center justify-around gap-4 py-2">
        {/* COMPASS DIAL SVG */}
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer ring */}
            <circle cx="50" cy="50" r="46" fill="#060B14" stroke="#1A2533" strokeWidth="3" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#1A2533" strokeDasharray="2 3" strokeWidth="1" />

            {/* Cardinal marks */}
            <text x="50" y="14" textAnchor="middle" fill="#FF3B47" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
            <text x="88" y="53" textAnchor="middle" fill="#6B7A8F" fontSize="8" fontWeight="bold" fontFamily="monospace">E</text>
            <text x="50" y="93" textAnchor="middle" fill="#6B7A8F" fontSize="8" fontWeight="bold" fontFamily="monospace">S</text>
            <text x="12" y="53" textAnchor="middle" fill="#6B7A8F" fontSize="8" fontWeight="bold" fontFamily="monospace">W</text>

            {/* Rotating Arrow Needle */}
            <g transform={`rotate(${windDirection} 50 50)`}>
              {/* Pointer to source */}
              <polygon points="50,18 45,50 55,50" fill="#00FFFF" />
              {/* Counterweight */}
              <polygon points="50,75 46,50 54,50" fill="#6B7A8F" opacity="0.6" />
              <circle cx="50" cy="50" r="4" fill="#FFD700" />
            </g>
          </svg>
        </div>

        {/* METRIC NUMBERS */}
        <div className="space-y-2 flex-1">
          <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
            <span className="text-[11px] text-[#6B7A8F]">Calculated Wind Chill:</span>
            <span className={`font-mono text-sm font-bold ${windChill < -35 ? 'text-[#FF3B47]' : 'text-[#FFB020]'}`}>
              {windChill}°C
            </span>
          </div>

          <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
            <span className="text-[11px] text-[#6B7A8F]">Kinetic Surface Gust:</span>
            <span className="font-mono text-sm font-bold text-[#FFD700]">
              {Math.round(windSpeed * 1.35)} km/h
            </span>
          </div>

          <div className="p-2 bg-[#060B14] rounded border border-[#1A2533] flex items-center justify-between">
            <span className="text-[11px] text-[#6B7A8F]">Next NOAA-20 Pass:</span>
            <span className="font-mono text-sm font-bold text-[#3EE07F]">
              24 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
