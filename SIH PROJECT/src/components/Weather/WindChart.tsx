/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 24-Hour Wind Speed & Gust Velocity Chart with Katabatic Warning Lines
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';

interface WindChartProps {
  currentWind: number;
}

export const WindChart: React.FC<WindChartProps> = ({ currentWind }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ hour: number; wind: number } | null>(null);

  // Generate 24 hours of wind speed data ending with currentWind
  const data = Array.from({ length: 24 }, (_, i) => {
    const hour = i - 23;
    const gustFactor = Math.sin(i * 0.8) * 18 + Math.cos(i * 1.4) * 8;
    const wind = Math.max(12, Math.round(currentWind + gustFactor));
    return { hour, wind };
  });

  data[23].wind = currentWind;
  const currentGust = Math.round(currentWind * 1.35);

  const minWind = 0;
  const maxWind = 180;
  const range = maxWind - minWind;

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getY = (val: number) => {
    const clamped = Math.max(minWind, Math.min(maxWind, val));
    return padding.top + graphHeight - ((clamped - minWind) / range) * graphHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.wind)}`).join(' ');
  const areaPoints = `${points} ${getX(data.length - 1)},${height - padding.bottom} ${padding.left},${height - padding.bottom}`;

  const yWarn80 = getY(80);
  const yCrit150 = getY(150);

  return (
    <div className="bg-[#060B14] border border-[#1A2533] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-2">
        <div>
          <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Wind Velocity & Gusts (24 Hours)
          </span>
          <p className="text-[10px] text-[#6B7A8F]">Katabatic gravity flow vectors across ice plateau</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-[#FFB020] font-bold">Base: {currentWind} km/h</span>
          <span className="text-[#FF3B47] font-bold">Gust: {currentGust} km/h</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Warning line at 80 km/h */}
          <line
            x1={padding.left}
            y1={yWarn80}
            x2={width - padding.right}
            y2={yWarn80}
            stroke="#FFB020"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={padding.left + 5} y={yWarn80 - 4} fill="#FFB020" fontSize="9" fontFamily="monospace">
            80 km/h (High Katabatic Storm Limit)
          </text>

          {/* Critical line at 150 km/h */}
          <line
            x1={padding.left}
            y1={yCrit150}
            x2={width - padding.right}
            y2={yCrit150}
            stroke="#FF3B47"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={padding.left + 5} y={yCrit150 - 4} fill="#FF3B47" fontSize="9" fontFamily="monospace">
            150 km/h (Extreme Hurricane Tie-Down Threshold)
          </text>

          {/* Fill Gradient Area */}
          <defs>
            <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB020" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFB020" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#windGradient)" />

          {/* Main Wind Line (Orange) */}
          <polyline
            points={points}
            fill="none"
            stroke="#FFB020"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y Axis Grid & Labels */}
          {[0, 40, 80, 120, 160].map(val => (
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

          {/* Current Value Pulsing Dot */}
          <circle
            cx={getX(data.length - 1)}
            cy={getY(currentWind)}
            r="5"
            fill="#FFB020"
            className="animate-pulse"
          />

          {/* Interactive Hover Points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.wind)}
              r="7"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint({ hour: d.hour, wind: d.wind })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-[#0A121E] border border-[#FFB020] px-2.5 py-1 rounded text-[11px] font-mono text-[#FFB020]">
            T{hoveredPoint.hour}h: <strong>{hoveredPoint.wind} km/h</strong>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#6B7A8F] pt-2 border-t border-[#1A2533] font-mono">
        <span>24h ago</span>
        <span>18h ago</span>
        <span>12h ago</span>
        <span>6h ago</span>
        <span className="text-[#FFB020] font-bold">Now</span>
      </div>
    </div>
  );
};
