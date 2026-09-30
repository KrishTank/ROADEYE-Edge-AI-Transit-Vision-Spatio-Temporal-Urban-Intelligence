/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Ground Staff Mobile-Optimized Tasks and Issue Reporting Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import Dexie, { Table } from 'dexie';
import { StationId } from '../types';

export interface FieldTask {
  id: string;
  stationId: StationId;
  title: string;
  location: string;
  dueTime: string;
  completed: boolean;
  completedAt?: string;
  priority: 'Routine' | 'Urgent' | 'Life-Critical';
  notes?: string;
  voiceNote?: string;
  photoUrl?: string;
}

export interface FieldReport {
  id: string;
  stationId: StationId;
  category: 'Equipment' | 'Weather' | 'Safety' | 'Infrastructure' | 'Other';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  priorityNumber?: number;
  latitude?: number;
  longitude?: number;
  gpsLocation?: string;
  photoAttached?: boolean;
  timestamp: string;
  synced: boolean;
}

export interface VehicleLogEntry {
  id: string;
  stationId?: StationId;
  vehicleType: 'PistenBully' | 'Snow Scooter' | 'ATV Quad' | 'Hägglunds Carrier' | 'Snow Blower';
  vehicleName?: string;
  driverName?: string;
  hoursUsed?: number;
  engineHours?: number;
  fuelLevel?: number;
  fuelLevelPct?: number;
  inspectionPassed?: boolean;
  checklistPassed?: boolean;
  notes: string;
  timestamp: string;
  synced?: boolean;
}

export class FieldStaffDatabase extends Dexie {
  field_tasks!: Table<FieldTask, string>;
  field_reports!: Table<FieldReport, string>;
  vehicle_logs!: Table<VehicleLogEntry, string>;

  constructor() {
    super('DhruvaTwinFieldDB');
    this.version(2).stores({
      field_tasks: 'id, stationId, completed, priority',
      field_reports: 'id, stationId, category, priority, synced',
      vehicle_logs: 'id, stationId, vehicleType, timestamp'
    });
  }
}

export const fieldDb = new FieldStaffDatabase();

export async function seedFieldStaffDb() {
  const count = await fieldDb.field_tasks.count();
  if (count === 0) {
    await fieldDb.field_tasks.bulkAdd([
      {
        id: 'ft-01',
        stationId: 'maitri',
        title: 'Trace Heating Sentry Line 3 Inspection',
        location: 'Lake Priyadarshini Pipeline Corridor',
        dueTime: '11:30 UTC',
        completed: false,
        priority: 'Life-Critical',
      },
      {
        id: 'ft-02',
        stationId: 'maitri',
        title: 'DG Engine Bay #2 Fuel Water-Separator Drain',
        location: 'Generator Bay 2',
        dueTime: '13:00 UTC',
        completed: false,
        priority: 'Urgent',
      },
      {
        id: 'ft-03',
        stationId: 'maitri',
        title: 'Novo Blue Ice Runway Corridor Stake Flagging',
        location: '5.5 km NE Airfield Axis',
        dueTime: '15:30 UTC',
        completed: false,
        priority: 'Routine',
      },
      {
        id: 'ft-04',
        stationId: 'bharati',
        title: 'Thala Fjord Seawater Intake Screen Inspection',
        location: 'Seawater Pump House & Shore Jetty',
        dueTime: '11:00 UTC',
        completed: false,
        priority: 'Life-Critical',
      },
      {
        id: 'ft-05',
        stationId: 'bharati',
        title: 'CHP Cogeneration Glycol Header Bleed',
        location: 'Power Plant Unit 1',
        dueTime: '14:00 UTC',
        completed: true,
        priority: 'Urgent',
      }
    ]);
  }
}
