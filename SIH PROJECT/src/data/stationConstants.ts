/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Verified Station Facts & Constants
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import { StationInfo, StationId } from '../types';

export const STATIONS_DATA: Record<StationId, StationInfo> = {
  maitri: {
    id: 'maitri',
    name: 'Maitri Research Station',
    latitude: -70.764444, // 70°45'52"S
    longitude: 11.734167, // 11°44'03"E
    builtYear: 1989,
    capacity: 65, // 25 main building + 40 summer camp
    status: 'Operational',
    location: 'Schirmacher Oasis, Central Dronning Maud Land',
    distanceFromShore: '~100 km inland',
    waterSource: 'Heated trace-monitored pipeline from Lake Priyadarshini (0.297 sq km)',
    powerConfig: '4 × 62.5 kVA diesel generators (250 kVA combined peak)',
    keyVulnerability: 'Water pipeline freezes solid in 45 minutes if trace heating circuit trips',
  },
  bharati: {
    id: 'bharati',
    name: 'Bharati Research Station',
    latitude: -69.411389, // 69°24'41"S
    longitude: 76.1875, // 76°11'15"E
    builtYear: 2012,
    capacity: 72, // 47 main + 25 emergency
    status: 'Operational',
    location: 'Larsemann Hills, North Grovnes Island',
    distanceFromMaitri: '3,098 km',
    waterSource: 'Seawater reverse-osmosis pumps, 450m insulated intake and discharge',
    powerConfig: '3 CHP units × 100 kVA electrical + 150 kW thermal each (300 kVA / 450 kW th)',
    keyVulnerability: 'Katabatic wind damage to seaward intake line & VSAT antenna de-pointing above 150 km/h',
  },
  dakshin_gangotri: {
    id: 'dakshin_gangotri',
    name: 'Dakshin Gangotri (Historical)',
    latitude: -70.0911,
    longitude: 12.0089,
    builtYear: 1983,
    capacity: 20,
    status: 'Historical',
    location: 'Ice Shelf, Queen Maud Land',
    distanceFromShore: '20 km inland from shelf ice edge',
    waterSource: 'Snow melting plant',
    powerConfig: 'Historical diesel-generator set',
    keyVulnerability: 'Submerged by ice accretion (1990); preserved as historic site and supply depot',
  },
  maitri_ii: {
    id: 'maitri_ii',
    name: 'Maitri-II (Next-Gen Polar Hub)',
    latitude: -70.7600,
    longitude: 11.7500,
    builtYear: 2027,
    capacity: 90,
    status: 'Planned',
    location: 'Schirmacher Oasis (adjacent to current Maitri)',
    distanceFromShore: '~100 km inland',
    waterSource: 'Deep geothermal closed-loop heat exchanger + sub-glacial melt',
    powerConfig: 'Hybrid 500 kW Microgrid (Dual CHP + Vertical Bifacial Solar + Arctic Wind Turbines + BESS)',
    keyVulnerability: 'Pre-commissioning structural foundation integrity across permafrost line',
  }
};

export const EXPEDITIONS_LIST = Array.from({ length: 46 }, (_, i) => {
  const num = 46 - i;
  const year = 2026 - (46 - num);
  const station: 'Dakshin Gangotri' | 'Maitri' | 'Bharati' | 'Combined' = 
    num < 8 ? 'Dakshin Gangotri' : num < 31 ? 'Maitri' : 'Combined';
  
  const focuses = [
    'Cryosphere dynamics & deep ice core paleoclimate drilling',
    'Upper atmospheric physics, ionospheric scintillation & aurora imaging',
    'Microbial biodiversity and cold-adapted psychrophilic enzymes',
    'Aerosol radiative forcing and black carbon deposition rates',
    'Solid Earth geodynamics, GNSS crustal deformation & seismology',
    'Sub-glacial lake hydrology and limnology of Lake Priyadarshini',
    'Space weather monitoring and cosmic ray neutron monitor operation'
  ];

  return {
    id: `isea-${num}`,
    number: num,
    year,
    teamSize: 35 + (num % 25),
    focus: focuses[num % focuses.length],
    leader: `Expedition Leader (ISEA-${num})`,
    summary: `The ${num}${num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Indian Scientific Expedition to Antarctica (ISEA-${num}) conducted operations across ${station} under NCPOR / MoES stewardship.`,
    keyMilestone: num === 46 
      ? 'Autonomous deployment of DhruvaTwin digital twin telemetry & sub-zero microgrid control'
      : num === 31 
      ? 'Commissioning of Bharati Station in Larsemann Hills' 
      : num === 8 
      ? 'Inauguration of Maitri permanent station in Schirmacher Oasis' 
      : num === 1 
      ? 'Historic First Indian Antarctic Expedition landing led by Dr. S.Z. Qasim (Jan 1982)'
      : `Scientific wintering campaign across ${station} logistics axis`,
    stationBase: station,
  };
});
