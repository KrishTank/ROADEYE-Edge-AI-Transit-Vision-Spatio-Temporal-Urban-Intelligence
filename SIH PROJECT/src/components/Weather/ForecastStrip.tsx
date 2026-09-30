/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 7-Day Polar Forecast Strip with Severity Border Coding
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { CloudSnow, Sun, Wind, CloudFog, CloudLightning } from 'lucide-react';

interface ForecastItem {
  day: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  windSpeed: number;
}

interface ForecastStripProps {
  forecast?: ForecastItem[];
}

export const ForecastStrip: React.FC<ForecastStripProps> = ({ forecast = [] }) => {
  const defaultForecast: ForecastItem[] = [
    { day: 'Today', tempMin: -28, tempMax: -22, condition: 'Clear polar sky', windSpeed: 42 },
    { day: 'Tomorrow', tempMin: -31, tempMax: -24, condition: 'High katabatic surge', windSpeed: 78 },
    { day: 'Day +2', tempMin: -35, tempMax: -27, condition: 'Drifting snow blizzard', windSpeed: 95 },
    { day: 'Day +3', tempMin: -29, tempMax: -21, condition: 'Subzero haze', windSpeed: 38 },
    { day: 'Day +4', tempMin: -26, tempMax: -19, condition: 'Clear / Solar max', windSpeed: 30 },
    { day: 'Day +5', tempMin: -25, tempMax: -18, condition: 'Moderate bluster', windSpeed: 45 },
    { day: 'Day +6', tempMin: -32, tempMax: -23, condition: 'Low pressure front', windSpeed: 70 }
  ];

  const items = forecast.length > 0 ? forecast : defaultForecast;

  const getBorderColor = (wind: number, tempMin: number) => {
    if (wind > 85 || tempMin < -33) return 'border-[#FF3B47] text-[#FF3B47]';
    if (wind > 60 || tempMin < -29) return 'border-[#FFB020] text-[#FFB020]';
    return 'border-[#3EE07F] text-[#3EE07F]';
  };

  const getIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('blizzard') || lower.includes('drifting')) return <CloudSnow className="w-6 h-6 text-[#00FFFF]" />;
    if (lower.includes('surge') || lower.includes('wind')) return <Wind className="w-6 h-6 text-[#FFB020]" />;
    if (lower.includes('fog')) return <CloudFog className="w-6 h-6 text-[#A78BFA]" />;
    return <Sun className="w-6 h-6 text-[#FFD700]" />;
  };

  return (
    <div className="bg-[#0A121E] border border-[#1A2533] rounded-xl p-4">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-3">
        <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
          7-Day Cryosphere Synoptic Forecast Strip
        </span>
        <span className="text-[11px] text-[#6B7A8F] font-mono">
          Color Code: <span className="text-[#3EE07F]">Normal</span> · <span className="text-[#FFB020]">Surge</span> · <span className="text-[#FF3B47]">Blizzard</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {items.map((item, idx) => {
          const borderClass = getBorderColor(item.windSpeed, item.tempMin);
          return (
            <div
              key={idx}
              className={`p-3 bg-[#060B14] rounded-lg border-2 ${borderClass.split(' ')[0]} flex flex-col items-center justify-between text-center transition-transform hover:-translate-y-1`}
            >
              <span className="text-xs font-bold text-[#E8EEF4] uppercase">{item.day}</span>
              <div className="my-2">{getIcon(item.condition)}</div>
              <div className="font-mono text-xs font-bold text-[#E8EEF4]">
                <span className="text-[#00FFFF]">{item.tempMax}°</span> / <span className="text-[#6B7A8F]">{item.tempMin}°</span>
              </div>
              <div className="text-[10px] text-[#FFB020] font-mono font-semibold mt-1">
                {item.windSpeed} km/h
              </div>
              <span className="text-[9px] text-[#6B7A8F] line-clamp-1 mt-1">
                {item.condition}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
