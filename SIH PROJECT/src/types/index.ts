/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DhruvaTwin Core Types and Schemas
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

export type UserRole = 'Admin' | 'Commander' | 'User' | 'Scientist' | 'Field Staff';

export type StationId = 'maitri' | 'bharati' | 'dakshin_gangotri' | 'maitri_ii';

export interface StationInfo {
  id: StationId;
  name: string;
  latitude: number;
  longitude: number;
  builtYear: number;
  capacity: number;
  status: 'Operational' | 'Historical' | 'Planned' | 'Wintering';
  location: string;
  waterSource: string;
  powerConfig: string;
  keyVulnerability: string;
  distanceFromShore?: string;
  distanceFromMaitri?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stationId: StationId;
  createdAt: string;
  avatar?: string;
}

export interface PersonnelRecord {
  id: string;
  badgeId: string;
  name: string;
  role: string;
  sector: string;
  rfidStatus: 'Inside Main Habitat' | 'Summer Camp' | 'Generator Bay' | 'Field Expedition (10km)' | 'Lab Module' | 'Pump House';
  uhfChannel: string;
  lastSync: string;
  medStatus: 'Fit for Duty' | 'Cold Acclimatizing' | 'Restricted' | 'Medical Bay';
  dutyShift: 'Alpha (06:00-14:00)' | 'Bravo (14:00-22:00)' | 'Charlie (22:00-06:00)';
  vitals: {
    heartRate: number;
    oxygenSat: number;
    coreTemp: number;
  };
}

export interface TelemetryPoint {
  id: string;
  stationId: StationId;
  subsystem: 'Power' | 'HVAC' | 'Water' | 'Fuel' | 'Environmental' | 'Comms';
  equipmentId: string;
  sensorId: string;
  parameter: string;
  value: number;
  unit: string;
  qualityFlag: 'GOOD' | 'WARN' | 'CRIT' | 'PREDICTED';
  timestamp: number;
  predictedValue?: number;
}

export interface AlertRecord {
  id: string;
  stationId: StationId;
  incidentId: string;
  subsystem: string;
  equipmentId: string;
  severity: 'Tier 1 - Critical' | 'Tier 2 - High' | 'Tier 3 - Medium' | 'Tier 4 - Routine';
  message: string;
  sensorReading: string;
  actuatorState: string;
  acknowledged: boolean;
  resolved: boolean;
  createdAt: string;
  sopSteps: string[];
}

export interface MicrogridTelemetry {
  id: string;
  stationId: StationId;
  source: string;
  outputKw: number;
  thermalKw: number;
  soc: number;
  timestamp: string;
  voltage: number;
  frequency: number;
  fuelRateLph: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE' | 'ALERT';
}

export interface WeatherTelemetry {
  stationId: StationId;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  humidity: number;
  dewPoint: number;
  visibilityKm: number;
  solarRadiation: number;
  auroraActivityKp: number;
  forecast: Array<{
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    windSpeed: number;
  }>;
}

export interface SatellitePass {
  id: string;
  satelliteName: string;
  azimuth: number;
  elevation: number;
  scheduledAt: string;
  durationMin: number;
  linkQuality: 'EXCELLENT' | 'DEGRADED' | 'MARGINAL' | 'OCCLUDED';
  uplinkBand: 'Ku-Band (VSAT)' | 'Iridium SBD' | 'Inmarsat BGAN';
}

export interface AuditLogEntry {
  id: string;
  node: string;
  timestamp: string;
  message: string;
  user: string;
  action: string;
  prevHash: string;
  hash: string;
  verified: boolean;
}

export interface NcporDocument {
  id: string;
  title: string;
  category: 'Engineering & HVAC' | 'Polar Biology' | 'Safety SOPs' | 'Glaciology & Ice Radar' | 'Treaty & NPDC Compliance';
  url: string;
  publishedAt: string;
  fileSize: string;
  author: string;
  doi: string;
}

export interface IseaExpedition {
  id: string;
  number: number;
  year: number;
  teamSize: number;
  focus: string;
  leader: string;
  summary: string;
  keyMilestone: string;
  stationBase: 'Dakshin Gangotri' | 'Maitri' | 'Bharati' | 'Combined';
}

export interface SyncQueueItem {
  id: string;
  priority: 1 | 2 | 3 | 4; // 1=SOS, 2=Critical, 3=Checkin, 4=Routine
  stationId: StationId;
  sensorId: string;
  value: number | string | Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}
