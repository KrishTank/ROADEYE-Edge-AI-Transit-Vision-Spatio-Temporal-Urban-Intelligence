/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dexie.js Offline Database & Priority Synchronization Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import Dexie, { Table } from 'dexie';
import { 
  UserProfile, 
  StationInfo, 
  TelemetryPoint, 
  AlertRecord, 
  PersonnelRecord, 
  MicrogridTelemetry, 
  WeatherTelemetry, 
  SatellitePass, 
  AuditLogEntry, 
  NcporDocument, 
  IseaExpedition, 
  SyncQueueItem 
} from '../types';
import { STATIONS_DATA, EXPEDITIONS_LIST } from '../data/stationConstants';

export interface AlertQueueItem {
  id: string;
  priority: 1 | 2 | 3 | 4; // 1=SOS, 2=Critical, 3=Checkin, 4=Routine
  stationId: string;
  severity: string;
  message: string;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

export class DhruvaTwinDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  stations!: Table<StationInfo, string>;
  telemetry!: Table<TelemetryPoint, string>;
  alerts!: Table<AlertRecord, string>;
  personnel!: Table<PersonnelRecord, string>;
  microgrid_readings!: Table<MicrogridTelemetry, string>;
  weather_readings!: Table<WeatherTelemetry, string>;
  satellite_passes!: Table<SatellitePass, string>;
  command_logs!: Table<AuditLogEntry, string>;
  documents!: Table<NcporDocument, string>;
  expeditions!: Table<IseaExpedition, string>;
  telemetry_queue!: Table<SyncQueueItem, string>;
  alert_queue!: Table<AlertQueueItem, string>;

  constructor() {
    super('DhruvaTwinDB');
    this.version(1).stores({
      users: 'id, email, role, stationId',
      stations: 'id, name, status',
      telemetry: 'id, stationId, subsystem, equipmentId, sensorId, timestamp',
      alerts: 'id, stationId, incidentId, severity, acknowledged, resolved, createdAt',
      personnel: 'id, badgeId, stationId, role, sector, dutyShift',
      microgrid_readings: 'id, stationId, source, timestamp',
      weather_readings: 'stationId, timestamp',
      satellite_passes: 'id, satelliteName, scheduledAt',
      command_logs: 'id, node, timestamp, hash',
      documents: 'id, category, title',
      expeditions: 'id, number, year, stationBase',
      telemetry_queue: 'id, priority, stationId, sensorId, timestamp, synced',
      alert_queue: 'id, priority, stationId, severity, timestamp, synced'
    });
  }
}

export const db = new DhruvaTwinDatabase();

/**
 * Initializes and seeds initial database records for DhruvaTwin
 */
export async function seedInitialDatabase(): Promise<void> {
  try {
    const stationCount = await db.stations.count();
    if (stationCount === 0) {
      await db.stations.bulkAdd(Object.values(STATIONS_DATA));
    }

    const expeditionCount = await db.expeditions.count();
    if (expeditionCount === 0) {
      await db.expeditions.bulkAdd(EXPEDITIONS_LIST);
    }

    const personnelCount = await db.personnel.count();
    if (personnelCount === 0) {
      const initialPersonnel: PersonnelRecord[] = [
        {
          id: 'pers-01',
          badgeId: 'IND-MTR-001',
          name: 'Col. K. R. Sharma (Retd.)',
          role: 'Station Commander & Logistics Lead',
          sector: 'Central Command Habitat',
          rfidStatus: 'Inside Main Habitat',
          uhfChannel: 'CH-01 (Command Tactical)',
          lastSync: '12 seconds ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Alpha (06:00-14:00)',
          vitals: { heartRate: 72, oxygenSat: 98, coreTemp: 36.8 }
        },
        {
          id: 'pers-02',
          badgeId: 'IND-MTR-002',
          name: 'Dr. Ananya Sen',
          role: 'Chief Cryosphere Scientist',
          sector: 'Glaciology Analysis Lab',
          rfidStatus: 'Inside Main Habitat',
          uhfChannel: 'CH-04 (Science Payload)',
          lastSync: '45 seconds ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Alpha (06:00-14:00)',
          vitals: { heartRate: 68, oxygenSat: 99, coreTemp: 36.9 }
        },
        {
          id: 'pers-03',
          badgeId: 'IND-MTR-003',
          name: 'Rajesh V. Nambiar',
          role: 'Lead Power & Microgrid Engineer',
          sector: 'DG Engine Bay #2',
          rfidStatus: 'Generator Bay',
          uhfChannel: 'CH-02 (Engineering / Utilities)',
          lastSync: '5 seconds ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Charlie (22:00-06:00)',
          vitals: { heartRate: 80, oxygenSat: 97, coreTemp: 37.0 }
        },
        {
          id: 'pers-04',
          badgeId: 'IND-MTR-004',
          name: 'Vikram Singh Rawat',
          role: 'Water Pipeline & HVAC Specialist',
          sector: 'Lake Priyadarshini Trace Pump House',
          rfidStatus: 'Pump House',
          uhfChannel: 'CH-02 (Engineering / Utilities)',
          lastSync: '18 seconds ago',
          medStatus: 'Cold Acclimatizing',
          dutyShift: 'Bravo (14:00-22:00)',
          vitals: { heartRate: 84, oxygenSat: 96, coreTemp: 36.6 }
        },
        {
          id: 'pers-05',
          badgeId: 'IND-BHR-005',
          name: 'Dr. Meenakshi Sundaram',
          role: 'Atmospheric Radar Physicist',
          sector: 'Upper Atmosphere Antenna Array',
          rfidStatus: 'Lab Module',
          uhfChannel: 'CH-04 (Science Payload)',
          lastSync: '2 minutes ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Bravo (14:00-22:00)',
          vitals: { heartRate: 74, oxygenSat: 98, coreTemp: 36.7 }
        },
        {
          id: 'pers-06',
          badgeId: 'IND-BHR-006',
          name: 'Sgt. D. Pradhan',
          role: 'Emergency Response & Medic Lead',
          sector: 'Infirmary / Triage Bay',
          rfidStatus: 'Inside Main Habitat',
          uhfChannel: 'CH-03 (Emergency Tactical)',
          lastSync: 'Just now',
          medStatus: 'Fit for Duty',
          dutyShift: 'Alpha (06:00-14:00)',
          vitals: { heartRate: 70, oxygenSat: 99, coreTemp: 36.8 }
        },
        {
          id: 'pers-07',
          badgeId: 'IND-MTR-007',
          name: 'Tenzing Norbu',
          role: 'PistenBully Traverse Pilot',
          sector: 'Novo Blue Ice Runway Corridor',
          rfidStatus: 'Field Expedition (10km)',
          uhfChannel: 'CH-05 (Traverse Long Range)',
          lastSync: '8 minutes ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Bravo (14:00-22:00)',
          vitals: { heartRate: 78, oxygenSat: 97, coreTemp: 36.5 }
        },
        {
          id: 'pers-08',
          badgeId: 'IND-BHR-008',
          name: 'Arunav Mukherjee',
          role: 'CHP Cogeneration Specialist',
          sector: 'CHP Plant Room Unit #2',
          rfidStatus: 'Inside Main Habitat',
          uhfChannel: 'CH-02 (Engineering / Utilities)',
          lastSync: '30 seconds ago',
          medStatus: 'Fit for Duty',
          dutyShift: 'Charlie (22:00-06:00)',
          vitals: { heartRate: 76, oxygenSat: 98, coreTemp: 36.8 }
        }
      ];
      await db.personnel.bulkAdd(initialPersonnel);
    }

    const docCount = await db.documents.count();
    if (docCount === 0) {
      const initialDocs: NcporDocument[] = [
        {
          id: 'doc-001',
          title: 'SOP-ENG-MTR-04: Emergency Anti-Freeze Procedure for Lake Priyadarshini Water Pipeline',
          category: 'Safety SOPs',
          url: '/docs/SOP_Maitri_Water_Pipeline_Emergency.pdf',
          publishedAt: '2025-11-12',
          fileSize: '2.4 MB',
          author: 'NCPOR Engineering Division, Vasco da Gama',
          doi: '10.5281/zenodo.npcor.eng.04'
        },
        {
          id: 'doc-002',
          title: 'CHP Cogeneration & Glycol Loop Balancing Protocol for Bharati Complex',
          category: 'Engineering & HVAC',
          url: '/docs/Bharati_CHP_Glycol_Loop_Manual.pdf',
          publishedAt: '2025-08-19',
          fileSize: '4.8 MB',
          author: 'Larsemann Operations Cell / NCPOR',
          doi: '10.5281/zenodo.npcor.chp.12'
        },
        {
          id: 'doc-003',
          title: 'High-Resolution Synthetic Aperture Radar Ice Velocity Mapping over Schirmacher Oasis',
          category: 'Glaciology & Ice Radar',
          url: '/docs/SAR_Ice_Velocity_Schirmacher_2026.pdf',
          publishedAt: '2026-02-04',
          fileSize: '8.1 MB',
          author: 'Dr. A. Sen, National Centre for Polar and Ocean Research',
          doi: '10.1016/j.polar.2026.01.004'
        },
        {
          id: 'doc-004',
          title: 'Antarctic Treaty System Protocol on Environmental Protection (Madrid Protocol) Audit 2026',
          category: 'Treaty & NPDC Compliance',
          url: '/docs/ATS_Madrid_Protocol_India_Compliance.pdf',
          publishedAt: '2026-01-15',
          fileSize: '3.6 MB',
          author: 'Ministry of Earth Sciences / NCPOR Legal Mission',
          doi: '10.5281/zenodo.npdc.audit.2026'
        },
        {
          id: 'doc-005',
          title: 'Psychrophilic Bacterial Isolates in Freshwater Cryo-Niches of Lake Priyadarshini',
          category: 'Polar Biology',
          url: '/docs/Polar_Biology_Priyadarshini_2025.pdf',
          publishedAt: '2025-12-01',
          fileSize: '5.2 MB',
          author: 'ISEA-45 Biological Science Division',
          doi: '10.1007/s00300-025-03211-x'
        }
      ];
      await db.documents.bulkAdd(initialDocs);
    }

    const alertCount = await db.alerts.count();
    if (alertCount === 0) {
      const initialAlerts: AlertRecord[] = [
        {
          id: 'alt-01',
          stationId: 'maitri',
          incidentId: 'INC-2026-MTR-0089',
          subsystem: 'Water / Trace Heating',
          equipmentId: 'PIPE-HTR-CIRC-02',
          severity: 'Tier 1 - Critical',
          message: 'Priyadarshini Trace Heating Loop 2 Amp Draw dropped below 0.4A (Potential freeze risk within 42 min)',
          sensorReading: 'Loop 2 Current: 0.12A | Flow Temp: +0.8°C (Critical threshold: +0.5°C)',
          actuatorState: 'Auxiliary Glycol Heat Exchanger: STANDBY AUTO-TRIGGER ARMED',
          acknowledged: false,
          resolved: false,
          createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          sopSteps: [
            'Engage secondary backup electrical trace heater breaker BKR-WTR-02B',
            'Verify Glycol recirculation pump P-04 is running at minimum 18 LPM',
            'Despatch 2-person inspection crew with thermal imager to Pipeline Sentry Station 3',
            'If freeze risk persists at T-30min, open bypass valve V-09 into holding cistern'
          ]
        },
        {
          id: 'alt-02',
          stationId: 'bharati',
          incidentId: 'INC-2026-BHR-0034',
          subsystem: 'Microgrid / CHP',
          equipmentId: 'CHP-UNIT-01',
          severity: 'Tier 2 - High',
          message: 'CHP Unit 1 exhaust manifold temp deviation +18°C above baseline thermal balance',
          sensorReading: 'Exhaust: 448°C (Max allowable 455°C) | Output: 94.2 kW',
          actuatorState: 'Thermal diverter damper 40% open to cooling radiator',
          acknowledged: true,
          resolved: false,
          createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
          sopSteps: [
            'Transfer 35 kW load onto CHP Unit 2 synchronous generator',
            'Inspect air filter intake on seaward duct for rime ice build-up',
            'Check coolant delta-T between engine block and heat plate exchanger'
          ]
        },
        {
          id: 'alt-03',
          stationId: 'maitri',
          incidentId: 'INC-2026-MTR-0072',
          subsystem: 'Comms / VSAT',
          equipmentId: 'SAT-TRK-RADOME',
          severity: 'Tier 3 - Medium',
          message: 'VSAT Ku-band radome internal heater sensor cycling interval prolonged',
          sensorReading: 'Radome Temp: -4.2°C | VSAT SNR: 9.8 dB (Acceptable > 7.0 dB)',
          actuatorState: 'Radome De-icer: CYCLING (70% Duty)',
          acknowledged: true,
          resolved: true,
          createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          sopSteps: [
            'Confirm blower fan operation via acoustic telemetry monitor',
            'Clear riming ice buildup with heated air lance if SNR drops below 8.0 dB'
          ]
        },
        {
          id: 'alt-04',
          stationId: 'bharati',
          incidentId: 'INC-2026-BHR-0021',
          subsystem: 'Environmental / Katabatic',
          equipmentId: 'AWS-MAST-LARSEMANN',
          severity: 'Tier 4 - Routine',
          message: 'Sustained katabatic wind surge: 68 km/h with gusts exceeding 84 km/h',
          sensorReading: 'Wind Speed: 71.4 km/h | Dir: 142° SSE | Air Temp: -18.4°C',
          actuatorState: 'External Doors: Interlock Locked | Traverse Warning: YELLOW',
          acknowledged: true,
          resolved: false,
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          sopSteps: [
            'Initiate automatic storm tie-down verification protocol',
            'All personnel outside habitat to return to main container block within 20 minutes',
            'Stand by for automatic Antarctic High-Visibility Mode activation if wind > 80 km/h'
          ]
        }
      ];
      await db.alerts.bulkAdd(initialAlerts);
    }

    const commandLogsCount = await db.command_logs.count();
    if (commandLogsCount === 0) {
      const initialLogs: AuditLogEntry[] = [
        {
          id: 'cmd-001',
          node: 'NCPOR-HQ-VASCO-PRIMARY',
          timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          message: 'GENESIS_BLOCK: DhruvaTwin cryptographic state ledger initialized for 46th ISEA',
          user: 'SYSTEM_AUTHORITY',
          action: 'LEDGER_INIT',
          prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
          hash: '4a6b2c89f01e7d8c4b2a9e3f1c8a5b2d7e9f3c1a8b2d4e6f8a0b2c4e6f8a0b2c',
          verified: true
        },
        {
          id: 'cmd-002',
          node: 'MAITRI-SCADA-GATEWAY',
          timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
          message: 'Trace heater secondary circuit auto-switch test passed. Trace resistance 4.8 ohms/m.',
          user: 'Rajesh V. Nambiar (Lead Power Eng)',
          action: 'ACTUATOR_SELF_TEST',
          prevHash: '4a6b2c89f01e7d8c4b2a9e3f1c8a5b2d7e9f3c1a8b2d4e6f8a0b2c4e6f8a0b2c',
          hash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
          verified: true
        },
        {
          id: 'cmd-003',
          node: 'BHARATI-CONTAINER-CTRL-01',
          timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
          message: 'Microgrid synch bus transferred 50 kVA from CHP-01 to CHP-02 without voltage dip.',
          user: 'Arunav Mukherjee (CHP Specialist)',
          action: 'BUS_LOAD_BALANCING',
          prevHash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
          hash: '9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
          verified: true
        }
      ];
      await db.command_logs.bulkAdd(initialLogs);
    }
  } catch (err) {
    console.error('Error seeding DhruvaTwin offline database:', err);
  }
}
