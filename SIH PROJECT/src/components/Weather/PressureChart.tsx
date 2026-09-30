/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 7-Day Barometric Pressure Trend Chart (Katabatic Precursor Drop Analysis)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface PressureChartProps {
  currentPressure?: number;
}

export const PressureChart: React.FC<PressureChartProps> = ({ currentPressure = 986.4 }) => {
  const [hoveredDay, setHoveredDay] = useState<{ day: string; hpa: number; dropRate: number } | null>(null);

  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  // Synthetic 7-day pressure profile demonstrating typical pre-katabatic depression
  const data = [
    { day: 'D-6', hpa: 998.2, dropRate: 0.2 },
    { day: 'D-5', hpa: 996.8, dropRate: 0.4 },
    { day: 'D-4', hpa: 995.1, dropRate: 0.5 },
    { day: 'D-3', hpa: 992.4, dropRate: 0.9 },
    { day: 'D-2', hpa: 989.6, dropRate: 1.4 },
    { day: 'D-1', hpa: 987.8, dropRate: 1.8 },
    { day: 'Today', hpa: currentPressure, dropRate: 2.2 }
  ];

  const minHpa = 960;
  const maxHpa = 1010;
  const range = maxHpa - minHpa;

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getY = (val: number) => {
    const clamped = Math.max(minHpa, Math.min(maxHpa, val));
    return padding.top + graphHeight - ((clamped - minHpa) / range) * graphHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.hpa)}`).join(' ');
  const areaPoints = `${points} ${getX(data.length - 1)},${height - padding.bottom} ${padding.left},${height - padding.bottom}`;

  return (
    <div className="bg-[#060B14] border border-[#1A2533] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-2">
        <div>
          <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Barometric Pressure Trend (7 Days)
          </span>
          <p className="text-[10px] text-[#6B7A8F]">Delta-P drop rate predicts katabatic wind frontal onset</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#A78BFA] font-bold">{currentPressure} hPa</span>
          <span className="px-1.5 py-0.5 bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 text-[10px] rounded font-bold">
            -2.2 hPa/3h DROP
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Fill Gradient Area */}
          <defs>
            <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#pressureGradient)" />

          {/* Main Pressure Line (Purple) */}
          <polyline
            points={points}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y Axis Grid & Labels */}
          {[960, 975, 990, 1005].map(val => (
            <g key={val}>
              <text x={padding.left - 8} y={getY(val) + 3} textAnchor="end" fill="#6B7A8F" fontSize="9" fontFamily="monospace">
                {val}
              </text>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="#1A2533"
                strokeWidth="0.5"
              />
            </g>
          ))}

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.hpa)}
                r="4.5"
                fill="#A78BFA"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.hpa)}
                r="8"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            </g>
          ))}
        </svg>

        {hoveredDay && (
          <div className="absolute top-2 right-2 bg-[#0A121E] border border-[#A78BFA] px-2.5 py-1 rounded text-[11px] font-mono text-[#A78BFA]">
            {hoveredDay.day}: <strong>{hoveredDay.hpa} hPa</strong> (Drop rate: -{hoveredDay.dropRate} hPa/3h)
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#6B7A8F] pt-2 border-t border-[#1A2533] font-mono">
        {data.map(d => (
          <span key={d.day} className={d.day === 'Today' ? 'text-[#A78BFA] font-bold' : ''}>
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};
