/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic UI Home Screen (Large 180x180px Glove Touch Targets)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React from 'react';
import { 
  ClipboardList, 
  AlertTriangle, 
  UserCheck, 
  Truck, 
  CloudSun, 
  ShieldAlert 
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: 'tasks' | 'report' | 'checkin' | 'vehicles' | 'weather' | 'sos') => void;
  pendingTasksCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, pendingTasksCount }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 max-w-4xl mx-auto">
      {/* 2x2 Grid of 180x180px Heavy Duty Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        
        {/* BUTTON 1: MY TASKS */}
        <button
          onClick={() => onNavigate('tasks')}
          className="antarctic-button h-[180px] w-full flex flex-col items-center justify-center gap-3 relative"
        >
          <ClipboardList className="w-16 h-16 text-[#00FFFF]" />
          <span className="antarctic-text-heading text-center">MY TASKS</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-4 right-4 bg-[#FF0000] text-[#FFFFFF] px-3 py-1 text-[16pt] font-black border-2 border-[#FFFFFF]">
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* BUTTON 2: REPORT ISSUE */}
        <button
          onClick={() => onNavigate('report')}
          className="antarctic-button h-[180px] w-full flex flex-col items-center justify-center gap-3"
        >
          <AlertTriangle className="w-16 h-16 text-[#FFD700]" />
          <span className="antarctic-text-heading text-center">REPORT ISSUE</span>
        </button>

        {/* BUTTON 3: CHECK IN */}
        <button
          onClick={() => onNavigate('checkin')}
          className="antarctic-button h-[180px] w-full flex flex-col items-center justify-center gap-3"
        >
          <UserCheck className="w-16 h-16 text-[#00FF00]" />
          <span className="antarctic-text-heading text-center">CHECK IN</span>
        </button>

        {/* BUTTON 4: VEHICLE LOG */}
        <button
          onClick={() => onNavigate('vehicles')}
          className="antarctic-button h-[180px] w-full flex flex-col items-center justify-center gap-3"
        >
          <Truck className="w-16 h-16 text-[#00FFFF]" />
          <span className="antarctic-text-heading text-center">VEHICLE LOG</span>
        </button>
      </div>

      {/* LOWER ACTIONS: WEATHER & SOS EMERGENCY */}
      <div className="w-full max-w-2xl space-y-4">
        <button
          onClick={() => onNavigate('weather')}
          className="antarctic-button w-full h-[80px] flex items-center justify-center gap-4 border-[#00FFFF] text-[#00FFFF]"
        >
          <CloudSun className="w-10 h-10" />
          <span className="antarctic-text-heading">FIELD WEATHER & KATABATIC RADAR</span>
        </button>

        {/* 2X WIDTH PULSING SOS EMERGENCY BUTTON */}
        <button
          onClick={() => onNavigate('sos')}
          className="antarctic-button antarctic-button-danger w-full h-[100px] flex items-center justify-center gap-6"
        >
          <ShieldAlert className="w-14 h-14" />
          <span className="antarctic-text-giant text-[#FFFFFF] tracking-widest">
            SOS EMERGENCY
          </span>
        </button>
      </div>
    </div>
  );
};
