/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive 3D Digital Twin Type Definitions
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import { StationId } from '../../types';

export type CameraExperienceMode = 'orbit' | 'walk' | 'underwater' | 'free';

export type SeasonMode = 'summer' | 'winter' | 'shoulder';

export interface RoomDefinition {
  id: string;
  name: string;
  station: StationId;
  floor: 1 | 2;
  bounds: {
    x: number; // center x
    y: number; // floor y
    z: number; // center z
    width: number;
    height: number;
    depth: number;
  };
  doors: Array<{
    id: string;
    targetRoomId?: string;
    position: [number, number, number];
    rotationY: number;
    isOpen?: boolean;
    label: string;
  }>;
  lightSwitch: {
    isOn: boolean;
    lightColor: number;
    intensity: number;
    position: [number, number, number];
  };
  temperature: number;
  humidity: number;
  powerKw: number;
  occupancyCount: number;
  status: 'Nominal' | 'Warning' | 'Critical';
  vulnerabilityNote?: string;
  equipment: Array<{
    id: string;
    name: string;
    type: string;
    status: 'Nominal' | 'Warning' | 'Critical' | 'Offline';
    metrics: Record<string, string>;
    position: [number, number, number];
  }>;
  description: string;
}

export interface OccupantPerson {
  id: string;
  name: string;
  role: 'Station Commander' | 'Cryosphere Scientist' | 'Power Engineer' | 'Physician / Medical Officer' | 'Traverse Pilot' | 'Atmospheric Physicist';
  roleColor: number;
  shift: 'Alpha (06:00-14:00)' | 'Bravo (14:00-22:00)' | 'Charlie (22:00-06:00)';
  healthStatus: 'Fit for Duty' | 'Cold Acclimatizing' | 'Medical Bay Monitor';
  currentRoom: string;
  vitals: {
    heartRate: number;
    oxygenSat: number;
    coreTemp: number;
  };
  pathPoints: Array<[number, number, number]>;
  position: [number, number, number];
  isSitting?: boolean;
}

export interface WaterBodyData {
  id: string;
  name: string;
  station: StationId;
  type: 'Freshwater Lake' | 'Fjord' | 'Oceanic Bay' | 'Glacial Tarn';
  surfaceTemp: number;
  depthCenterM: number;
  depthShoreM: number;
  iceThicknessCm: number;
  waterPurityPct: number;
  pH: number;
  volumeM3: number;
  flowRateLpm: number;
  salinityPsu?: number;
  traceHeatingActive: boolean;
  daysUntilFreezeEstimate: number;
  iceCoveragePct: number;
  icebergCount?: number;
  description: string;
  coordinates: string;
  underwaterHighlights: string[];
}

export interface TrackedIceberg {
  id: string;
  name: string;
  massTonnes: number;
  driftSpeedKnots: number;
  driftDirectionDeg: number;
  distanceFromFjordM: number;
  radarEchoSignature: string;
  hazardLevel: 'Low' | 'Medium' | 'Critical Collision Course';
  position: [number, number, number];
}

export interface VehicleDefinition {
  id: string;
  name: string;
  model: string;
  station: StationId;
  category: 'Heavy Traverse Machinery' | 'Snowmobile' | 'Amphibious Tracked Carrier' | 'Aviation Support' | 'Marine Coastal';
  status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE' | 'IN TRANSIT';
  fuelLevelPct: number;
  engineHours: number;
  lastServiceDaysAgo: number;
  nextServiceHours: number;
  driverName: string;
  bladeCondition?: string;
  trackConditionPct: number;
  cargoManifest?: string[];
  position: [number, number, number];
  rotationY: number;
  isEngineRunning?: boolean;
}

export interface TeleportTarget {
  id: string;
  label: string;
  station: StationId;
  category: 'Overview' | 'Interior' | 'Water Source' | 'Fleet Hangar';
  camPos: [number, number, number];
  lookAt: [number, number, number];
  mode: CameraExperienceMode;
}
