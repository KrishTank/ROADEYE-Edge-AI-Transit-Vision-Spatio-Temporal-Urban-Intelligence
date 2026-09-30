/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Mode Top Nav Toggle Button (Snowflake Icon + Ctrl+Shift+A)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React from 'react';
import { Snowflake } from 'lucide-react';
import { useAntarcticMode } from './AntarcticModeProvider';

export const AntarcticModeToggle: React.FC = () => {
  const { isAntarcticMode, toggleAntarcticMode } = useAntarcticMode();

  return (
    <button
      onClick={toggleAntarcticMode}
      title="Toggle Antarctic High-Visibility Extreme Climate Mode (Ctrl+Shift+A)"
      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
        isAntarcticMode
          ? 'bg-[#FFD700] text-[#000000] border-[#FFD700] shadow-[0_0_15px_#FFD700]'
          : 'bg-[#060B14] text-[#00E0C6] border-[#1A2533] hover:border-[#00E0C6]'
      }`}
    >
      <Snowflake className="w-4 h-4 animate-spin-slow" />
      <span className="text-[11px] font-bold uppercase hidden md:inline">
        {isAntarcticMode ? 'ANTARCTIC ACTIVE' : 'ANTARCTIC MODE'}
      </span>
    </button>
  );
};
