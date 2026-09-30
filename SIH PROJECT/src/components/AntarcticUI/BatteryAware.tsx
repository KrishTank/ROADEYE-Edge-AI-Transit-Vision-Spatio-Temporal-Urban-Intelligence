/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Battery-Aware Power Throttling Engine for Extreme Polar Field Devices
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React from 'react';
import { Battery, BatteryCharging, BatteryWarning, Zap } from 'lucide-react';
import { useAntarcticMode } from './AntarcticModeProvider';

export const BatteryAware: React.FC = () => {
  const { batteryLevel, isBatteryLow } = useAntarcticMode();

  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-2 ${
      isBatteryLow ? 'border-[#FF0000] text-[#FF0000] bg-[#FF0000]/10' : 'border-[#FFFFFF] text-[#FFFFFF]'
    }`}>
      {isBatteryLow ? (
        <BatteryWarning className="w-8 h-8 text-[#FF0000] animate-pulse" />
      ) : (
        <Battery className="w-8 h-8 text-[#00FF00]" />
      )}
      <div className="flex flex-col">
        <span className="font-mono text-[20pt] font-black leading-none">
          {batteryLevel}%
        </span>
        <span className="text-[12pt] font-bold uppercase tracking-wider text-[#FFD700]">
          {isBatteryLow ? 'THROTTLED (30s)' : 'NORMAL (3s)'}
        </span>
      </div>
    </div>
  );
};
