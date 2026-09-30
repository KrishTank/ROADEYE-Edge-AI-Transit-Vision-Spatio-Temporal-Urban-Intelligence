/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Polar Water Sources & Iceberg Tracking Dataset
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import { WaterBodyData, TrackedIceberg } from './types';

export const POLAR_WATER_BODIES: Record<string, WaterBodyData> = {
  'lake-priyadarshini': {
    id: 'lake-priyadarshini',
    name: 'Lake Priyadarshini — Maitri Freshwater Reservoir',
    station: 'maitri',
    type: 'Freshwater Lake',
    surfaceTemp: 1.2,
    depthCenterM: 4.2,
    depthShoreM: 0.8,
    iceThicknessCm: 68,
    waterPurityPct: 98.4,
    pH: 7.4,
    volumeM3: 178000,
    flowRateLpm: 12.0,
    traceHeatingActive: true,
    daysUntilFreezeEstimate: 24,
    iceCoveragePct: 74,
    coordinates: '70°45\'58"S, 11°44\'20"E',
    description: 'Subglacial fed freshwater tarn in Schirmacher Oasis serving as the sole potable water reservoir for Maitri Station via a 450m heated trace line.',
    underwaterHighlights: [
      'Submerged trace heating intake filter cage (-3.2m)',
      'Periglacial benthic sediment core sampling station',
      'Freshwater psychrophilic cyanobacterial mats',
      'Subsurface anchor mooring blocks'
    ]
  },
  'thala-fjord': {
    id: 'thala-fjord',
    name: 'Thala Fjord — Bharati Deep Coastal Water Body',
    station: 'bharati',
    type: 'Fjord',
    surfaceTemp: -1.8,
    depthCenterM: 120.0,
    depthShoreM: 14.0,
    iceThicknessCm: 45,
    waterPurityPct: 99.1,
    pH: 8.1,
    volumeM3: 42000000,
    flowRateLpm: 45.0,
    salinityPsu: 34.2,
    traceHeatingActive: true,
    daysUntilFreezeEstimate: 14,
    iceCoveragePct: 22,
    icebergCount: 4,
    coordinates: '69°24\'20"S, 76°10\'45"E',
    description: 'Glacially carved deepwater marine fjord flanking Bharati Station. Provides seawater for desalination and oceanographic tide gauge monitoring.',
    underwaterHighlights: [
      'Seawater reverse-osmosis intake head with rotating mesh (-12m)',
      'Submerged CTD oceanographic probe anchor',
      'Continental shelf moraine drop-off (-85m)',
      'Subsurface acoustic Doppler current profiler (ADCP)'
    ]
  },
  'quilty-bay': {
    id: 'quilty-bay',
    name: 'Quilty Bay — Marine Transit & Shoreline Haven',
    station: 'bharati',
    type: 'Oceanic Bay',
    surfaceTemp: -1.5,
    depthCenterM: 30.0,
    depthShoreM: 2.5,
    iceThicknessCm: 32,
    waterPurityPct: 98.8,
    pH: 8.0,
    volumeM3: 8500000,
    flowRateLpm: 0,
    salinityPsu: 34.0,
    traceHeatingActive: false,
    daysUntilFreezeEstimate: 35,
    iceCoveragePct: 12,
    coordinates: '69°24\'55"S, 76°11\'30"E',
    description: 'Protected marine cove used for Zodiac boat launches, coastal seabed sampling, and sea-ice fast mooring during resupply vessel calls.',
    underwaterHighlights: [
      'Tide gauge pressure sensor installation',
      'Gravel shoreline drop with kelp bed remnants',
      'Submerged anchor chain for expedition tender'
    ]
  },
  'small-lakes-larsemann': {
    id: 'small-lakes-larsemann',
    name: 'Larsemann Hills Glacial Tarns (40+ Small Lakes)',
    station: 'bharati',
    type: 'Glacial Tarn',
    surfaceTemp: -0.6,
    depthCenterM: 1.8,
    depthShoreM: 0.4,
    iceThicknessCm: 82,
    waterPurityPct: 99.6,
    pH: 7.2,
    volumeM3: 45000,
    flowRateLpm: 0,
    traceHeatingActive: false,
    daysUntilFreezeEstimate: 5,
    iceCoveragePct: 90,
    coordinates: '69°24\'30"S, 76°12\'10"E',
    description: 'Over 40 ultra-oligotrophic ice-scoured freshwater lakes across the Larsemann Hills oasis harboring endemic tardigrade and diatom niches.',
    underwaterHighlights: [
      'Frozen vertical ice crystal dendrites',
      'Sediment biological core sampling tubes',
      'Bedrock scours from Last Glacial Maximum'
    ]
  }
};

export const TRACKED_ICEBERGS: TrackedIceberg[] = [
  {
    id: 'iceberg-bhr-01',
    name: 'Tabular Berg B-46A',
    massTonnes: 145000,
    driftSpeedKnots: 0.8,
    driftDirectionDeg: 285,
    distanceFromFjordM: 1450,
    radarEchoSignature: 'High Reflectivity RCS 48 dBsm',
    hazardLevel: 'Medium',
    position: [-160, 0, -80]
  },
  {
    id: 'iceberg-bhr-02',
    name: 'Pinnacle Berg P-12',
    massTonnes: 62000,
    driftSpeedKnots: 1.2,
    driftDirectionDeg: 310,
    distanceFromFjordM: 2800,
    radarEchoSignature: 'Steep Wall Echo RCS 42 dBsm',
    hazardLevel: 'Low',
    position: [-220, 0, 110]
  },
  {
    id: 'iceberg-bhr-03',
    name: 'Drydock Floe D-04',
    massTonnes: 38000,
    driftSpeedKnots: 0.5,
    driftDirectionDeg: 260,
    distanceFromFjordM: 850,
    radarEchoSignature: 'Calving Flank RCS 35 dBsm',
    hazardLevel: 'Critical Collision Course',
    position: [-110, 0, 45]
  },
  {
    id: 'iceberg-bhr-04',
    name: 'Bergy Bit BB-08',
    massTonnes: 9400,
    driftSpeedKnots: 1.6,
    driftDirectionDeg: 340,
    distanceFromFjordM: 3200,
    radarEchoSignature: 'Low Freeboard RCS 28 dBsm',
    hazardLevel: 'Low',
    position: [-250, 0, -140]
  }
];
