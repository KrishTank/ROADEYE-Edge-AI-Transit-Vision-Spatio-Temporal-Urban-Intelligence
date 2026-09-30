/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic UI Mode Provider & Trigger Controller
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StationId } from '../../types';
import { fieldDb } from '../../db/fieldDb';

interface AntarcticModeContextType {
  isAntarcticMode: boolean;
  toggleAntarcticMode: () => void;
  setAntarcticMode: (enabled: boolean) => void;
  triggerReason: string | null;
  pendingSyncCount: number;
  batteryLevel: number;
  isBatteryLow: boolean;
}

const AntarcticModeContext = createContext<AntarcticModeContextType>({
  isAntarcticMode: false,
  toggleAntarcticMode: () => {},
  setAntarcticMode: () => {},
  triggerReason: null,
  pendingSyncCount: 0,
  batteryLevel: 100,
  isBatteryLow: false
});

interface AntarcticModeProviderProps {
  children: ReactNode;
  temperature: number;
  windSpeed: number;
  userRole?: string;
  activeStation?: StationId;
}

export const AntarcticModeProvider: React.FC<AntarcticModeProviderProps> = ({
  children,
  temperature,
  windSpeed,
  userRole,
  activeStation = 'maitri'
}) => {
  const [isAntarcticMode, setIsAntarcticModeState] = useState(false);
  const [triggerReason, setTriggerReason] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isBatteryLow, setIsBatteryLow] = useState(false);

  const [dismissedAuto, setDismissedAuto] = useState(false);

  const setAntarcticMode = useCallback((enabled: boolean, reason?: string) => {
    setIsAntarcticModeState(enabled);
    if (enabled && reason) {
      setTriggerReason(reason);
    } else if (!enabled) {
      setTriggerReason(null);
      setDismissedAuto(true);
    }
  }, []);

  const toggleAntarcticMode = useCallback(() => {
    setIsAntarcticModeState(prev => {
      const next = !prev;
      setTriggerReason(next ? 'Manual Operator Toggle' : null);
      if (!next) {
        setDismissedAuto(true);
      }
      return next;
    });
  }, []);

  // 1. Automatic weather triggers:
  // Auto-activate when temp < -20°C or wind speed > 80 km/h (unless manually exited)
  useEffect(() => {
    if (dismissedAuto) return;
    if (temperature < -20 && !isAntarcticMode) {
      setAntarcticMode(true, `Extreme Subzero Ambient (${temperature}°C < -20°C threshold)`);
    } else if (windSpeed > 80 && !isAntarcticMode) {
      setAntarcticMode(true, `Severe Katabatic Wind Surge (${windSpeed} km/h > 80 km/h)`);
    }
  }, [temperature, windSpeed, isAntarcticMode, dismissedAuto, setAntarcticMode]);

  // 2. Role auto-activation:
  useEffect(() => {
    if (userRole === 'Field Staff' && !isAntarcticMode) {
      setAntarcticMode(true, 'Field Ground Staff Role Assigned');
    }
  }, [userRole, isAntarcticMode, setAntarcticMode]);

  // 3. Keyboard shortcut: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        toggleAntarcticMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAntarcticMode]);

  // 4. Battery Status API if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          setBatteryLevel(level);
          setIsBatteryLow(level <= 20);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      }).catch(() => {
        // Fallback simulated battery
      });
    }
  }, []);

  // 5. IndexedDB pending sync count monitor
  useEffect(() => {
    const checkPendingQueue = async () => {
      try {
        const unsyncedReports = await fieldDb.field_reports.filter(r => !r.synced).count();
        const unsyncedLogs = await fieldDb.vehicle_logs.filter(v => !v.synced).count();
        setPendingSyncCount(unsyncedReports + unsyncedLogs);
      } catch (e) {
        // Ignored in non-indexedDB mock tests
      }
    };
    checkPendingQueue();
    const interval = setInterval(checkPendingQueue, 5000);
    return () => clearInterval(interval);
  }, [activeStation]);

  return (
    <AntarcticModeContext.Provider
      value={{
        isAntarcticMode,
        toggleAntarcticMode,
        setAntarcticMode,
        triggerReason,
        pendingSyncCount,
        batteryLevel,
        isBatteryLow
      }}
    >
      {children}
    </AntarcticModeContext.Provider>
  );
};

export const useAntarcticMode = () => useContext(AntarcticModeContext);
