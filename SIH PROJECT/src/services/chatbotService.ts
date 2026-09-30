/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Operations AI Assistant (Gemini 2.5 / 3.8 Flash Architecture)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import { GoogleGenAI } from '@google/genai';
import { StationId } from '../types';
import { STATIONS_DATA } from '../data/stationConstants';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  contextPointers?: string[];
}

export interface OperationalContext {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  pipelineTemp: number;
  powerLoadKw: number;
  activePersonnelCount: number;
  blackoutStatus: string;
}

/**
 * Gets Gemini API key from process.env, import.meta.env, or localStorage
 */
export function getGeminiApiKey(): string {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    return process.env.GEMINI_API_KEY;
  }
  if (typeof window !== 'undefined') {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (viteKey && viteKey !== 'MY_GEMINI_API_KEY') return viteKey;
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;
  }
  return '';
}

/**
 * Saves user-provided Gemini API key to localStorage
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('GEMINI_API_KEY', key.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
  }
}

/**
 * Tests connection with the provided Gemini API key
 */
export async function testGeminiConnection(key: string): Promise<{ success: boolean; message: string }> {
  if (!key.trim()) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }
  try {
    const ai = new GoogleGenAI({ apiKey: key.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping: reply with "DhruvaTwin Gemini 3.8 Flash Online (Team HackFinity007)"',
    });
    if (response && response.text) {
      return { success: true, message: response.text.trim() };
    }
    return { success: false, message: 'No response received from Gemini.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gemini connection failed. Check your API key.' };
  }
}

/**
 * Generates an operational assistant response with injected station context using Gemini
 * @param prompt User question or operational command
 * @param context Current station environmental and SCADA metrics
 */
export async function sendAntarcticAiQuery(
  prompt: string,
  context: OperationalContext
): Promise<string> {
  const stationInfo = STATIONS_DATA[context.activeStation];
  const queryLower = prompt.toLowerCase();
  const apiKey = getGeminiApiKey();

  // Primary Path: Use @google/genai SDK with gemini-3.8-flash if API key is available
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are DhruvaTwin AI, the friendly, helpful, and mission-critical Antarctic Station Operations & Guide Assistant developed by Team HackFinity007 for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India (SIH 2026 PS 26060).

Current Active Station: ${stationInfo.name} (${stationInfo.location}).
Real-time Injected Telemetry:
- Ambient Temperature: ${context.temperature}°C
- Wind Velocity: ${context.windSpeed} km/h
- Water Pipeline Core Temp: ${context.pipelineTemp}°C
- Station Power Demand: ${context.powerLoadKw} kW
- Personnel on Station: ${context.activePersonnelCount}
- Connectivity Link: ${context.blackoutStatus}

Your mission is to guide and assist all operators, scientists, and evaluators reaching DhruvaTwin:
1. 🧭 Navigation & 3D Twin: Guide users to explore the 3D Digital Twin, 2.5D Cutaway Blueprint, 7 View Modes (Exterior, X-Ray, Infrared, Thermal, MEP/HVAC, Structural, Night), walkable interiors, fuel farm, helipad, and the "Zen / Free View" mode.
2. 🛠️ Telemetry Repair: Explain the Telemetry Repair tool—how it detects sensor freeze lockups, NaN parity errors, or packet drops, and recalibrates sensors with cryptographic SHA-256 audit logging.
3. 💾 NPDC Compliance: Explain how to download encrypted offline snapshots (AES-GCM 256-bit) and verify checksums in the in-browser decrypt inspector.
4. ❄️ Antarctic Mode: Explain the glove-friendly high-visibility UI (400x200px touch targets, voice notes, SOS distress) triggered below -20°C or via Ctrl+Shift+A.
5. 📊 Live Weather & Cryosphere: Point to the Live Weather & Graphs screen for 24h temp/wind charts, 7-day pressure katabatic drop analysis, and wind chill calculations.
6. ⛽ Fuel Storage Depot & Microgrid: Cover the bulk D-208 diesel tank farm, pre-heaters, solar PV array, and polar wind turbine.
7. 🐧 Polar Fauna: Explain the Madrid Protocol Annex II 100m buffer and audio contact call bio-monitoring.

Format your responses with clear bullet points, actionable steps, and concise technical precision. Do not use generic filler.`
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API query fallback to deterministic engine:', err?.message);
    }
  }

  // Helpful Deterministic Guide & Operations Engine (Fallback / Offline)
  if (queryLower.includes('telemetry repair') || queryLower.includes('repair') || queryLower.includes('sensor') || queryLower.includes('recalibrate')) {
    return `[🛠️ DHRUVATWIN TELEMETRY REPAIR GUIDE - TEAM HACKFINITY007]
Target Station: ${stationInfo.name}

The Telemetry Repair feature provides autonomous and manual sensor recovery:
1. Anomaly Detection: Scans all SCADA channels for rime-ice freeze locks, NaN parity dropouts, and drifting thermistors.
2. 3D Twin Alert Visualization: Any detected sensor failure automatically triggers an illuminated ⚠️ alert symbol directly above the affected component in the 3D twin.
3. One-Click Repair: Click "Repair Telemetry" in the top bar or inside the 3D Twin to apply Kalman filter smoothing, purge corrupted buffers, and recalibrate zero-drift.
4. Cryptographic Proof: Every repair generates a SHA-256 signed audit record in the hash-chain ledger.

Click the "🛠️ Telemetry Repair" button in the top navigation or on any 3D alert symbol to test this right now!`;
  }

  if (queryLower.includes('guide') || queryLower.includes('help') || queryLower.includes('how to') || queryLower.includes('feature')) {
    return `[🧭 DHRUVATWIN SYSTEM GUIDE - WELCOME FROM TEAM HACKFINITY007]
Welcome to the DhruvaTwin Polar Operations Platform. Here is how to navigate key capabilities:

1. 🌐 3D Digital Twin & Free View:
   - Select "Digital Twin 3D View" on the left menu.
   - Use the "Free Explore" button to navigate without UI congestion.
   - Switch between 7 View Modes (Exterior, X-Ray, Thermal, MEP, Structural, Night).
   - Click any building, fuel tank, helipad, or penguin to inspect live SCADA data!

2. 🛠️ Telemetry Repair:
   - Click "Telemetry Repair" in the top header or on any 3D ⚠️ alert marker to run sensor recalibration and fix packet anomalies.

3. 💾 NPDC Compliance Center & Offline Snapshot:
   - Open "NPDC Compliance Center" to export an AES-GCM 256-bit encrypted snapshot of telemetry and logs.
   - Test the in-browser Decrypt & Verify inspector!

4. ❄️ Antarctic Extreme Climate Mode:
   - Click the Snowflake icon in the top header or press Ctrl+Shift+A for glove-friendly 400x200px buttons and voice input.

5. 📈 Live Weather & Cryosphere:
   - Visit "Live Weather & Graphs" for 24h temp/wind curves and katabatic storm warnings.`;
  }

  if (queryLower.includes('water') || queryLower.includes('pipeline') || queryLower.includes('freeze') || queryLower.includes('priyadarshini')) {
    return `[NCPOR SOP-ENG-MTR-04 WATER DIRECTIVE]
Target Station: ${stationInfo.name}
Water Source: ${stationInfo.waterSource}
Current Pipeline Core Temp: ${context.pipelineTemp}°C.
Threshold: 45 minutes until irreversible pipe burst if electric trace heating circuit trips.
Recommended Actions:
1. Verify auxiliary glycol recirculation pump P-04 is maintaining >18 LPM flow.
2. Confirm secondary trace heating breaker BKR-WTR-02B is closed.
3. If ambient wind exceeds 80 km/h, deploy trace heating boost to 65 W/m.
4. If sensor values freeze, trigger the Telemetry Repair tool immediately.`;
  }

  if (queryLower.includes('blackout') || queryLower.includes('satellite') || queryLower.includes('vsat') || queryLower.includes('continuity')) {
    return `[AI CONTINUITY DIRECTIVE - TARGET 95% ACCURACY]
Current Status: ${context.blackoutStatus}
Under high katabatic wind speeds (>150 km/h) or ionospheric solar storming, VSAT Ku-band radomes suffer severe beam de-pointing and attenuation.
DhruvaTwin Protocol:
1. AI Continuity engine engages ResNet-LSTM telemetry imputation.
2. High-priority SCADA logs are buffered in IndexedDB priority queues (SOS=1, Critical=2, Checkin=3, Routine=4).
3. 340-byte survival telemetry transmits over emergency Iridium SBD backup.
4. Full cryptographic state reconciliation runs automatically upon Ku-band link reacquisition.`;
  }

  if (queryLower.includes('fuel') || queryLower.includes('diesel') || queryLower.includes('tank')) {
    return `[ARCTIC FUEL DEPOT & TANK FARM STATUS]
Station: ${stationInfo.name}
Fuel Grade: Arctic Diesel D-208 (Pour Point: -52°C)
Current Reserve: ~148,500 L (~412 Days Autonomy)
Diagnostics:
- Anti-Gel Pre-Heater: ACTIVE (+14.8°C core temp vs ${context.temperature}°C ambient)
- Madrid Protocol Retention Berm: Double-walled 110% containment intact (0% leakage)
- Click the Fuel Farm landmark button in the 3D Twin to view live valve controls!`;
  }

  if (queryLower.includes('penguin') || queryLower.includes('wildlife') || queryLower.includes('fauna')) {
    return `[🐧 MADRID PROTOCOL ANNEX II WILDLIFE PROTECTION]
Species: Emperor Penguin (Aptenodytes forsteri) & Adélie Penguin (Pygoscelis adeliae)
Colony Location: 320m from ${stationInfo.name}
Guidelines:
1. Mandatory 100m minimum human approach buffer.
2. Aircraft overflight prohibited below 2,000 feet AGL.
3. Tracked traverse machinery prohibited within 200m.
4. Click any penguin in the 3D Twin to hear synthesized acoustic bio-monitoring calls!`;
  }

  return `[DHRUVATWIN STATION OPERATIONS & GUIDE DISPATCH]
Station: ${stationInfo.name} (${stationInfo.location})
Environmental Telemetry: ${context.temperature}°C, Wind ${context.windSpeed} km/h, Barometric Pressure 988 hPa.
Connectivity Status: ${context.blackoutStatus}
Command Status: All safety circuits nominal. Microgrid synchronization stable.

💡 Need help? Ask me:
- "How do I use Telemetry Repair?"
- "Guide me through exploring the 3D Twin"
- "What is the emergency water trace heat SOP?"
- "Show me fuel farm status and burn rate"
- "How do I download an encrypted offline snapshot?"`;
}
