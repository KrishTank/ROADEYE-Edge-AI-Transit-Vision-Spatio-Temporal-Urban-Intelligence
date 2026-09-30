/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 24-Hour Temperature Trend Chart with Polar Safety Thresholds
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';

interface TemperatureChartProps {
  currentTemp: number;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ currentTemp }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ hour: number; temp: number } | null>(null);

  // Generate 24 hours of realistic polar temperature data ending with currentTemp
  const data = Array.from({ length: 24 }, (_, i) => {
    const hour = i - 23; // -23h to 0h
    // Diurnal variation + katabatic fluctuation
    const variation = Math.sin((i / 24) * Math.PI * 2) * 3.5 + (Math.sin(i * 1.5) * 1.2);
    const temp = Math.round((currentTemp + variation) * 10) / 10;
    return { hour, label: `${Math.abs(hour)}h ago`, temp };
  });

  // Ensure last point is exactly currentTemp
  data[23].temp = currentTemp;

  const minTemp = -50;
  const maxTemp = -10;
  const range = maxTemp - minTemp;

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getY = (temp: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    return padding.top + graphHeight - ((clamped - minTemp) / range) * graphHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * graphWidth;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.temp)}`).join(' ');
  const areaPoints = `${points} ${getX(data.length - 1)},${height - padding.bottom} ${padding.left},${height - padding.bottom}`;

  // Threshold Y coordinates
  const yWarn = getY(-30);
  const yCrit = getY(-40);

  return (
    <div className="bg-[#060B14] border border-[#1A2533] rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2 mb-2">
        <div>
          <span className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
            Temperature Trend (24 Hours)
          </span>
          <p className="text-[10px] text-[#6B7A8F]">Subzero cryosphere ambient with threshold limits</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#00FFFF] font-bold">{currentTemp}°C</span>
          <span className="w-2 h-2 rounded-full bg-[#00FFFF] animate-ping" />
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Threshold Lines */}
          {/* -30°C Warning line */}
          <line
            x1={padding.left}
            y1={yWarn}
            x2={width - padding.right}
            y2={yWarn}
            stroke="#FFB020"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={padding.left + 5} y={yWarn - 4} fill="#FFB020" fontSize="9" fontFamily="monospace">
            -30°C (Amber Warning)
          </text>

          {/* -40°C Critical line */}
          <line
            x1={padding.left}
            y1={yCrit}
            x2={width - padding.right}
            y2={yCrit}
            stroke="#FF3B47"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={padding.left + 5} y={yCrit - 4} fill="#FF3B47" fontSize="9" fontFamily="monospace">
            -40°C (Critical Frostbite Limit)
          </text>

          {/* Fill Gradient Area */}
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#tempGradient)" />

          {/* Main Temperature Line (Cyan) */}
          <polyline
            points={points}
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Y Axis Grid & Labels */}
          {[-20, -30, -40, -50].map(val => (
            <g key={val}>
              <text x={padding.left - 8} y={getY(val) + 3} textAnchor="end" fill="#6B7A8F" fontSize="9" fontFamily="monospace">
                {val}°C
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
            cy={getY(currentTemp)}
            r="5"
            fill="#00FFFF"
            className="animate-pulse"
          />
          <circle
            cx={getX(data.length - 1)}
            cy={getY(currentTemp)}
            r="8"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Interactive Hover Points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.temp)}
              r="7"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint({ hour: d.hour, temp: d.temp })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-[#0A121E] border border-[#00FFFF] px-2.5 py-1 rounded text-[11px] font-mono text-[#00FFFF]">
            T{hoveredPoint.hour}h: <strong>{hoveredPoint.temp}°C</strong>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#6B7A8F] pt-2 border-t border-[#1A2533] font-mono">
        <span>24h ago</span>
        <span>18h ago</span>
        <span>12h ago</span>
        <span>6h ago</span>
        <span className="text-[#00FFFF] font-bold">Now</span>
      </div>
    </div>
  );
};
