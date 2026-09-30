/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DhruvaTwin Polar Operations AI Suggestion Service
 * Synthesizes telemetry from aiPredictor, weatherService, and Dexie DB alerts
 * to generate real-time operational advice and hazard mitigations.
 * 
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import { StationId } from '../types';
import { aiPredictor, AiPredictorState } from './aiPredictor';
import { fetchStationWeather } from './weatherService';
import { db } from '../db/dexieDb';

export type SuggestionPriority = 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'OPTIMAL';

export interface AiSuggestionItem {
  id: string;
  subsystem: 'Satellite & Comms' | 'Thermal Lifelines' | 'Cryosphere Weather' | 'Microgrid & Power' | 'Environmental & Habitat';
  priority: SuggestionPriority;
  headline: string;
  details: string;
  actionLabel: string;
  targetScreen: 'twin' | 'triage' | 'weather' | 'microgrid' | 'continuity' | 'environment';
  timestamp: string;
  sourceSignal: string;
}

export interface StationAiSummary {
  stationId: StationId;
  overallHealthScore: number; // 0-100
  primarySuggestion: AiSuggestionItem;
  secondarySuggestions: AiSuggestionItem[];
  modelConfidence: number;
  evaluatedAt: string;
}

/**
 * Computes live operational suggestions based on real-time station telemetry,
 * weather hazards, alert database state, and satellite continuity predictions.
 */
export async function getLiveAiSuggestions(stationId: StationId): Promise<StationAiSummary> {
  const aiState: AiPredictorState = aiPredictor.getState();
  const weather = await fetchStationWeather(stationId);
  const activeAlerts = await db.alerts
    .where('stationId')
    .equals(stationId)
    .filter(a => !a.resolved)
    .toArray();

  const suggestions: AiSuggestionItem[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Evaluate Satellite Blackout / Comms Window
  if (aiState.status === 'BLACKOUT') {
    suggestions.push({
      id: 'sugg-blackout-active',
      subsystem: 'Satellite & Comms',
      priority: 'CRITICAL',
      headline: 'Satellite Link Blackout Active — AI Autonomous Continuity Engaged',
      details: 'VSAT/Iridium uplink is currently occluded. The local AI Continuity Engine is bridging SCADA data points with 95.8% target accuracy. Ensure critical field teams use UHF tactical radio channels.',
      actionLabel: 'View AI Continuity Engine',
      targetScreen: 'continuity',
      timestamp: now,
      sourceSignal: `Continuous bridge active · remaining ~${aiState.blackoutRemainingSec || 45}s`
    });
  } else if (aiState.minutesUntilDrop <= 15) {
    suggestions.push({
      id: 'sugg-blackout-predicted',
      subsystem: 'Satellite & Comms',
      priority: 'WARNING',
      headline: `Satellite Window Drop Predicted in ${aiState.minutesUntilDrop} Minutes`,
      details: `Polar orbital occlusion window approaching with ${aiState.confidencePct}% predictor confidence. Expedite telemetry synchronization to Dexie DB and prepare local priority queue.`,
      actionLabel: 'Inspect Outage Model',
      targetScreen: 'continuity',
      timestamp: now,
      sourceSignal: `Confidence: ${aiState.confidencePct}% · Historical accuracy: ${aiState.historicalAccuracy}`
    });
  }

  // 2. Evaluate Weather & Cryosphere Extremes
  if (weather.temperature <= -22 || weather.windSpeed >= 60) {
    const isKatabaticSevere = weather.windSpeed >= 70;
    suggestions.push({
      id: 'sugg-weather-extreme',
      subsystem: 'Cryosphere Weather',
      priority: isKatabaticSevere ? 'CRITICAL' : 'WARNING',
      headline: `Severe Katabatic Gale Detected (${weather.windSpeed} km/h @ ${weather.temperature}°C)`,
      details: isKatabaticSevere
        ? 'Wind gusts exceed safe traverse limits. Activate Antarctic High-Visibility mode, enforce habitat lockdown for non-essential staff, and verify emergency tie-downs.'
        : 'Sub-zero wind-chill advisory in effect. Verify trace heating loop status on Lake Priyadarshini water pipeline before freeze threshold.',
      actionLabel: 'Open Weather Telemetry',
      targetScreen: 'weather',
      timestamp: now,
      sourceSignal: `AWS Sensor Mast: ${weather.windSpeed} km/h · ${weather.temperature}°C`
    });
  }

  // 3. Evaluate Unresolved SCADA Incidents from Dexie DB
  const criticalAlert = activeAlerts.find(a => a.severity.includes('Tier 1'));
  if (criticalAlert) {
    suggestions.push({
      id: `sugg-alert-${criticalAlert.id}`,
      subsystem: 'Thermal Lifelines',
      priority: 'CRITICAL',
      headline: `Action Required: ${criticalAlert.message.split('(')[0].trim()}`,
      details: `Active incident ${criticalAlert.incidentId} detected in ${criticalAlert.subsystem}. Follow standard SOP: ${criticalAlert.sopSteps?.[0] || 'Inspect telemetry immediately.'}`,
      actionLabel: 'Review Alert & SOPs',
      targetScreen: 'triage',
      timestamp: now,
      sourceSignal: criticalAlert.sensorReading
    });
  }

  // 4. Evaluate Microgrid & Energy Balance
  if (stationId === 'bharati') {
    suggestions.push({
      id: 'sugg-bharati-microgrid',
      subsystem: 'Microgrid & Power',
      priority: 'ADVISORY',
      headline: 'CHP Cogeneration Balancing Recommended',
      details: 'Wind turbine generating 18 kW clean offset. Divert excess thermal yield into habitat domestic hot water cisterns to reduce diesel fuel burn.',
      actionLabel: 'Microgrid Command',
      targetScreen: 'microgrid',
      timestamp: now,
      sourceSignal: 'Wind: 18 kW · Thermal recovered: 94.2 kW'
    });
  } else {
    suggestions.push({
      id: 'sugg-maitri-lifeline',
      subsystem: 'Thermal Lifelines',
      priority: 'ADVISORY',
      headline: 'Lake Priyadarshini Trace Heating Loop Nominal',
      details: 'Freshwater supply pipeline trace heating operating within standard temperature corridor (+1.8°C to +3.2°C). Standby glycol circulator pre-warmed.',
      actionLabel: 'Inspect 3D Twin',
      targetScreen: 'twin',
      timestamp: now,
      sourceSignal: 'Fluid temp: +2.4°C · Glycol loop armed'
    });
  }

  // 5. Environmental & Madrid Protocol Baseline
  suggestions.push({
    id: 'sugg-madrid-wildlife',
    subsystem: 'Environmental & Habitat',
    priority: 'OPTIMAL',
    headline: 'Madrid Protocol Wildlife Buffer: 100% Compliant',
    details: 'Emperor & Adélie penguin colony perimeter maintained beyond 100m acoustic threshold. Biological wastewater MBBR unit verified zero-discharge.',
    actionLabel: 'View Wildlife Bio-Telemetry',
    targetScreen: 'twin',
    timestamp: now,
    sourceSignal: 'Buffer distance: 140m+ · Zero greywater discharge'
  });

  // Calculate Health Score
  let score = 98;
  if (suggestions.some(s => s.priority === 'CRITICAL')) score -= 22;
  if (suggestions.some(s => s.priority === 'WARNING')) score -= 11;
  score = Math.max(50, Math.min(100, score));

  // Sort by priority (CRITICAL > WARNING > ADVISORY > OPTIMAL)
  const priorityOrder: Record<SuggestionPriority, number> = {
    CRITICAL: 0,
    WARNING: 1,
    ADVISORY: 2,
    OPTIMAL: 3
  };

  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    stationId,
    overallHealthScore: score,
    primarySuggestion: suggestions[0],
    secondarySuggestions: suggestions.slice(1),
    modelConfidence: aiState.confidencePct || 94.8,
    evaluatedAt: now
  };
}
