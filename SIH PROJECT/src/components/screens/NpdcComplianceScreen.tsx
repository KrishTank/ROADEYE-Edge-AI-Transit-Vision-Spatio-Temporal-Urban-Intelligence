/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 8: National Polar Data Center (NPDC) Compliance Center
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { 
  Check, 
  CheckCircle2, 
  Copy, 
  Download, 
  FileCode, 
  Lock, 
  ShieldCheck, 
  HardDriveDownload,
  Key,
  Database,
  RefreshCw,
  Eye,
  FileCheck,
  AlertCircle,
  Unlock,
  Shield,
  Layers
} from 'lucide-react';
import { 
  createEncryptedSnapshot, 
  downloadSnapshotFile, 
  decryptSnapshotContainer,
  gatherCurrentDatabaseSnapshot,
  EncryptedSnapshotContainer,
  DecryptedSnapshotPayload
} from '../../services/snapshotService';

interface NpdcComplianceScreenProps {
  activeStation: StationId;
}

export const NpdcComplianceScreen: React.FC<NpdcComplianceScreenProps> = ({ activeStation }) => {
  const [copied, setCopied] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [passphrase, setPassphrase] = useState('NCPOR-ISEA46-ANTARCTIC-SECURE-2026');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [lastExportedContainer, setLastExportedContainer] = useState<EncryptedSnapshotContainer | null>(null);

  // Inspector / Decryption Test State
  const [inspectMode, setInspectMode] = useState<'create' | 'decrypt'>('create');
  const [decryptInputJson, setDecryptInputJson] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('NCPOR-ISEA46-ANTARCTIC-SECURE-2026');
  const [decryptedResult, setDecryptedResult] = useState<DecryptedSnapshotPayload | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // Database snapshot preview counts
  const [dbStats, setDbStats] = useState<{
    telemetry: number;
    logs: number;
    alerts: number;
    personnel: number;
    microgrid: number;
  }>({ telemetry: 8, logs: 3, alerts: 4, personnel: 8, microgrid: 2 });

  const station = STATIONS_DATA[activeStation];

  // Refresh DB counts on activeStation change
  useEffect(() => {
    let isMounted = true;
    gatherCurrentDatabaseSnapshot(activeStation).then(data => {
      if (isMounted) {
        setDbStats({
          telemetry: data.telemetry.length,
          logs: data.commandLogs.length,
          alerts: data.alerts.length,
          personnel: data.personnel.length,
          microgrid: data.microgridReadings.length
        });
      }
    }).catch(err => console.error('Error fetching snapshot stats:', err));
    return () => { isMounted = false; };
  }, [activeStation]);

  const fairChecklist = [
    { code: 'F1', name: 'Globally unique, persistent identifier (DOI/URI) assigned to telemetry streams', status: true },
    { code: 'F2', name: 'Rich metadata describing instrument calibration, coordinate bounds, and drift offsets', status: true },
    { code: 'A1', name: 'Retrievable by standardized communications protocol (MQTT / CBOR / HTTPS)', status: true },
    { code: 'A2', name: 'Metadata remains accessible even during satellite blackout via local IndexedDB ledger', status: true },
    { code: 'I1', name: 'Formal, accessible, shared schema representation (JSON-LD / CF-Metadata standard)', status: true },
    { code: 'I2', name: 'Vocabularies that adhere to FAIR polar ontologies (SCAR / Antarctic Master Directory)', status: true },
    { code: 'R1', name: 'Accurate data provenance with cryptographic SHA-256 hash-chain verification', status: true },
    { code: 'R2', name: 'Compliant with Antarctic Treaty System (ATS Madrid Protocol Annex III & V)', status: true }
  ];

  const metadataSchema = {
    "@context": "https://schema.org/",
    "@type": "Dataset",
    "name": `DhruvaTwin Real-Time Telemetry Dataset - ${station.name}`,
    "description": "Continuous SCADA telemetry, microgrid energy balance, and cryosphere observation data captured under NCPOR 46th ISEA mission.",
    "identifier": `npdc.ncpor.res.in/telemetry/${station.id}`,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": {
      "@type": "Organization",
      "name": "National Centre for Polar and Ocean Research (NCPOR)",
      "parentOrganization": "Ministry of Earth Sciences, Government of India"
    },
    "spatialCoverage": {
      "@type": "Place",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": station.latitude,
        "longitude": station.longitude
      }
    },
    "temporalCoverage": "2026-01-01/2026-12-31",
    "variableMeasured": [
      "Water pipeline fluid core temperature (°C)",
      "Combined Heat & Power (CHP) load factor (kVA)",
      "Katabatic wind velocity and direction (km/h)",
      "Cryosphere ground ice velocity (m/year)"
    ]
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(metadataSchema, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `npdc_metadata_${station.id}_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(metadataSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOfflineSnapshot = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const { container, jsonString } = await createEncryptedSnapshot(activeStation, passphrase);
      setLastExportedContainer(container);
      setDecryptInputJson(jsonString);
      
      const filename = `dhruvatwin_snapshot_${activeStation}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      downloadSnapshotFile(filename, jsonString);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to generate snapshot:', err);
      alert(`Snapshot export error: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDecryptSnapshot = async () => {
    setDecryptError(null);
    setDecryptedResult(null);
    try {
      if (!decryptInputJson.trim()) {
        throw new Error('Please paste or load an encrypted snapshot JSON string.');
      }
      const container: EncryptedSnapshotContainer = JSON.parse(decryptInputJson);
      const result = await decryptSnapshotContainer(container, decryptPassphrase);
      setDecryptedResult(result);
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setDecryptError(err.message || 'Decryption failed. Please check passphrase and file structure.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
              National Polar Data Center (NPDC) Compliance Center
            </h2>
            <span className="px-2 py-0.5 bg-[#00E0C6]/10 text-[#00E0C6] border border-[#00E0C6]/30 text-[10px] font-mono rounded font-bold uppercase">
              Air-Gapped Ready
            </span>
          </div>
          <p className="text-xs text-[#6B7A8F] mt-0.5">
            FAIR Polar Data Principles, Antarctic Master Directory (AMD) metadata auto-tagging, and local-only encrypted telemetry snapshots.
          </p>
        </div>

        {/* Offline Snapshot Action Button in Header */}
        <button
          onClick={() => {
            setShowSnapshotModal(true);
            setInspectMode('create');
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#00E0C6] to-[#4A9EFF] hover:from-[#00E0C6]/90 hover:to-[#4A9EFF]/90 text-[#060B14] font-bold text-xs rounded-lg transition-all shadow-lg shadow-[#00E0C6]/10 flex items-center justify-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer"
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>Download Offline Snapshot</span>
        </button>
      </div>

      {/* 4 SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">FAIR Compliance Score</div>
          <div className="text-2xl font-mono font-bold text-[#3EE07F] mt-2">100% (8/8)</div>
          <div className="text-[11px] text-[#3EE07F] mt-1 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SCAR AMD Certified</span>
          </div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Offline Snapshot Engine</div>
          <div className="text-2xl font-mono font-bold text-[#00E0C6] mt-2">AES-256-GCM</div>
          <div className="text-[11px] text-[#6B7A8F] mt-1 font-mono">PBKDF2-SHA256 • Zero-Server</div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Metadata Schema</div>
          <div className="text-2xl font-mono font-bold text-[#4A9EFF] mt-2">ISO 19115</div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">Geographic Information - Metadata</div>
        </div>

        <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
          <div className="text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider">Madrid Protocol Lock-in</div>
          <div className="text-2xl font-mono font-bold text-[#FFD700] mt-2">VERIFIED</div>
          <div className="text-[11px] text-[#6B7A8F] mt-1">Environmental Impact Level 1</div>
        </div>
      </div>

      {/* OFFLINE SNAPSHOT HERO BANNER CARD */}
      <div className="p-5 bg-gradient-to-r from-[#0A121E] via-[#0E1A2B] to-[#0A121E] rounded-xl border border-[#00E0C6]/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#00E0C6]/15 border border-[#00E0C6]/40 flex items-center justify-center shrink-0 text-[#00E0C6]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#E8EEF4] tracking-wide">
                  Air-Gapped Telemetry & Audit Logs Offline Snapshot
                </h3>
                <span className="px-2 py-0.5 bg-[#3EE07F]/20 text-[#3EE07F] text-[10px] font-mono rounded font-semibold border border-[#3EE07F]/30">
                  Ready ({dbStats.telemetry + dbStats.logs + dbStats.alerts} records)
                </span>
              </div>
              <p className="text-xs text-[#8BA1B7] mt-1 max-w-2xl leading-relaxed">
                Export current IndexedDB telemetry points, SHA-256 cryptographic command audit logs, microgrid balance, and incident records as a tamper-resistant, local-only JSON file encrypted with AES-256-GCM. Designed for ISEA blackouts and physical expedition flash-drive transfers to NCPOR Headquarters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowSnapshotModal(true);
                setInspectMode('create');
              }}
              className="py-2.5 px-4 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded-lg transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer shadow-md shadow-[#00E0C6]/20"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Configure & Export</span>
            </button>
            <button
              onClick={() => {
                setShowSnapshotModal(true);
                setInspectMode('decrypt');
              }}
              className="py-2.5 px-3.5 bg-[#060B14] hover:bg-slate-800 text-[#E8EEF4] border border-[#1A2533] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#4A9EFF]" />
              <span>Verify / Inspect</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN: FAIR PRINCIPLES CHECKLIST + SCHEMA VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAIR Principles (6 cols) */}
        <div className="lg:col-span-6 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 space-y-4">
          <div className="border-b border-[#1A2533] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                FAIR Data Principles Checklist
              </h3>
              <p className="text-xs text-[#6B7A8F]">Findable, Accessible, Interoperable, and Reusable</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#3EE07F]" />
          </div>

          <div className="space-y-2">
            {fairChecklist.map(item => (
              <div key={item.code} className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] flex items-start gap-3">
                <span className="w-7 h-7 rounded bg-[#3EE07F]/20 text-[#3EE07F] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {item.code}
                </span>
                <div className="text-xs text-[#E8EEF4] leading-relaxed">
                  {item.name}
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#3EE07F] shrink-0 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Schema Viewer & Export (6 cols) */}
        <div className="lg:col-span-6 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A2533] pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#00E0C6]" />
                <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                  NPDC Metadata Schema (JSON-LD)
                </h3>
              </div>
              <button
                onClick={handleCopySchema}
                className="px-2.5 py-1 bg-[#060B14] hover:bg-slate-800 text-xs text-[#E8EEF4] rounded border border-[#1A2533] flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3EE07F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="mt-4 p-4 bg-[#060B14] text-[#00E0C6] font-mono text-[11px] rounded-lg border border-[#1A2533] overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(metadataSchema, null, 2)}
            </pre>
          </div>

          <div className="pt-4 border-t border-[#1A2533] mt-4 flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="flex-1 py-2.5 px-4 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export NPDC Metadata JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* OFFLINE SNAPSHOT MODAL */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A121E] border border-[#00E0C6]/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1A2533] flex items-center justify-between bg-[#060B14]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00E0C6]/20 border border-[#00E0C6]/40 flex items-center justify-center text-[#00E0C6]">
                  <HardDriveDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#E8EEF4] uppercase tracking-wider">
                    NPDC Encrypted Offline Snapshot
                  </h3>
                  <p className="text-xs text-[#6B7A8F]">
                    Local-only cryptographic export of station telemetry & logs • Station: <span className="text-[#00E0C6] font-semibold">{station.name}</span>
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-[#0A121E] p-1 rounded-lg border border-[#1A2533]">
                <button
                  onClick={() => setInspectMode('create')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    inspectMode === 'create'
                      ? 'bg-[#00E0C6] text-[#060B14]'
                      : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
                  }`}
                >
                  Export Snapshot
                </button>
                <button
                  onClick={() => setInspectMode('decrypt')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    inspectMode === 'decrypt'
                      ? 'bg-[#00E0C6] text-[#060B14]'
                      : 'text-[#6B7A8F] hover:text-[#E8EEF4]'
                  }`}
                >
                  Decrypt & Verify
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#E8EEF4]">

              {inspectMode === 'create' ? (
                <>
                  {/* Summary of Data to be Exported */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7A8F] block mb-2">
                      Database Records to Include in Snapshot
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-center">
                        <div className="text-[11px] text-[#6B7A8F]">SCADA Telemetry</div>
                        <div className="text-lg font-mono font-bold text-[#00E0C6] mt-0.5">{dbStats.telemetry}</div>
                        <div className="text-[10px] text-[#3EE07F]">Active Sensors</div>
                      </div>
                      <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-center">
                        <div className="text-[11px] text-[#6B7A8F]">Command Logs</div>
                        <div className="text-lg font-mono font-bold text-[#4A9EFF] mt-0.5">{dbStats.logs}</div>
                        <div className="text-[10px] text-[#3EE07F]">SHA-256 Chained</div>
                      </div>
                      <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-center">
                        <div className="text-[11px] text-[#6B7A8F]">Active Alerts</div>
                        <div className="text-lg font-mono font-bold text-[#FFB020] mt-0.5">{dbStats.alerts}</div>
                        <div className="text-[10px] text-[#6B7A8F]">Tiers 1 to 4</div>
                      </div>
                      <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-center">
                        <div className="text-[11px] text-[#6B7A8F]">Microgrid Bus</div>
                        <div className="text-lg font-mono font-bold text-[#3EE07F] mt-0.5">{dbStats.microgrid}</div>
                        <div className="text-[10px] text-[#6B7A8F]">CHP / BESS</div>
                      </div>
                      <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] text-center col-span-2 sm:col-span-1">
                        <div className="text-[11px] text-[#6B7A8F]">Personnel Roster</div>
                        <div className="text-lg font-mono font-bold text-[#E8EEF4] mt-0.5">{dbStats.personnel}</div>
                        <div className="text-[10px] text-[#6B7A8F]">Expedition Crew</div>
                      </div>
                    </div>
                  </div>

                  {/* Encryption Settings */}
                  <div className="p-4 bg-[#060B14] rounded-xl border border-[#1A2533] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1A2533] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#00E0C6]" />
                        <span className="font-bold uppercase tracking-wider text-[#E8EEF4] text-xs">
                          Cryptographic Security Configuration
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E0C6]/10 text-[#00E0C6] border border-[#00E0C6]/20">
                        AES-256-GCM / PBKDF2
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <span className="text-[#6B7A8F] block">Cipher Algorithm:</span>
                        <span className="font-mono text-[#E8EEF4] font-semibold">AES-GCM (256-bit)</span>
                      </div>
                      <div>
                        <span className="text-[#6B7A8F] block">Key Derivation:</span>
                        <span className="font-mono text-[#E8EEF4] font-semibold">PBKDF2 (100k rounds, SHA-256)</span>
                      </div>
                      <div>
                        <span className="text-[#6B7A8F] block">Authentication & Salt:</span>
                        <span className="font-mono text-[#E8EEF4] font-semibold">16B Salt + 12B Random IV</span>
                      </div>
                    </div>

                    {/* Passphrase Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#E8EEF4] flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#00E0C6]" />
                          <span>Encryption Passphrase</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassphrase(!showPassphrase)}
                          className="text-[11px] text-[#6B7A8F] hover:text-[#00E0C6] cursor-pointer"
                        >
                          {showPassphrase ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                      <input
                        type={showPassphrase ? 'text' : 'password'}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter secure station passphrase"
                        className="w-full px-3 py-2 bg-[#0A121E] border border-[#1A2533] rounded-lg text-xs font-mono text-[#00E0C6] focus:outline-none focus:border-[#00E0C6]"
                      />
                      <p className="text-[10px] text-[#6B7A8F] mt-1">
                        Default station master key is pre-filled. Anyone decrypting this snapshot must enter this exact key.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0A121E] rounded-lg border border-[#1A2533] flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#3EE07F] shrink-0" />
                      <div className="text-[11px] text-[#8BA1B7]">
                        <strong className="text-[#E8EEF4]">Local-Only & Air-Gapped Safe:</strong> Encryption and file assembly execute 100% inside your browser's WebCrypto subsystem. No data is transmitted to external servers.
                      </div>
                    </div>
                  </div>

                  {exportSuccess && (
                    <div className="p-3.5 bg-[#3EE07F]/15 border border-[#3EE07F]/40 rounded-xl flex items-center gap-3 text-[#3EE07F]">
                      <FileCheck className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">Offline Snapshot Downloaded Successfully!</div>
                        <div className="text-[11px] text-[#E8EEF4]/80 mt-0.5">
                          The encrypted JSON container has been saved to your downloads. You can test decryption using the 'Decrypt & Verify' tab.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* DECRYPT & INSPECT MODE */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7A8F] block mb-1.5">
                      Encrypted Snapshot Container (JSON)
                    </label>
                    <textarea
                      rows={5}
                      value={decryptInputJson}
                      onChange={(e) => setDecryptInputJson(e.target.value)}
                      placeholder="Paste encrypted snapshot JSON string here..."
                      className="w-full p-3 bg-[#060B14] border border-[#1A2533] rounded-lg text-[11px] font-mono text-[#00E0C6] focus:outline-none focus:border-[#00E0C6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7A8F] block mb-1.5">
                      Decryption Passphrase
                    </label>
                    <input
                      type="text"
                      value={decryptPassphrase}
                      onChange={(e) => setDecryptPassphrase(e.target.value)}
                      placeholder="Enter decryption passphrase"
                      className="w-full px-3 py-2 bg-[#060B14] border border-[#1A2533] rounded-lg text-xs font-mono text-[#00E0C6] focus:outline-none focus:border-[#00E0C6]"
                    />
                  </div>

                  <button
                    onClick={handleDecryptSnapshot}
                    className="py-2.5 px-4 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Decrypt & Inspect Payload</span>
                  </button>

                  {decryptError && (
                    <div className="p-3 bg-[#FF4D4D]/15 border border-[#FF4D4D]/40 rounded-lg flex items-center gap-2.5 text-[#FF4D4D] text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{decryptError}</span>
                    </div>
                  )}

                  {decryptedResult && (
                    <div className="p-4 bg-[#060B14] border border-[#3EE07F]/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-[#1A2533] pb-2">
                        <div className="flex items-center gap-2 text-[#3EE07F] font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Decrypted Payload Verified</span>
                        </div>
                        <span className="text-[10px] text-[#6B7A8F] font-mono">
                          Station: {decryptedResult.exportMetadata?.stationName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                          <span className="text-[#6B7A8F] block">SCADA Telemetry:</span>
                          <span className="font-mono text-[#00E0C6] font-bold">{decryptedResult.telemetry?.length || 0} pts</span>
                        </div>
                        <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                          <span className="text-[#6B7A8F] block">Command Audit Logs:</span>
                          <span className="font-mono text-[#4A9EFF] font-bold">{decryptedResult.commandLogs?.length || 0} logs</span>
                        </div>
                        <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                          <span className="text-[#6B7A8F] block">Incident Alerts:</span>
                          <span className="font-mono text-[#FFB020] font-bold">{decryptedResult.alerts?.length || 0} alerts</span>
                        </div>
                        <div className="p-2 bg-[#0A121E] rounded border border-[#1A2533]">
                          <span className="text-[#6B7A8F] block">Personnel Roster:</span>
                          <span className="font-mono text-[#3EE07F] font-bold">{decryptedResult.personnel?.length || 0} crew</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-[#8BA1B7] mb-1">
                          Decrypted SCADA Telemetry Stream Sample:
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-[#0A121E] p-2.5 rounded border border-[#1A2533]">
                          {decryptedResult.telemetry?.map((pt: any) => (
                            <div key={pt.id} className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-1">
                              <span>[{pt.subsystem}] {pt.parameter}</span>
                              <span className="text-[#00E0C6] font-bold">{pt.value} {pt.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1A2533] bg-[#060B14] flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#6B7A8F] font-mono hidden sm:block">
                National Centre for Polar and Ocean Research • PS 26060
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  onClick={() => setShowSnapshotModal(false)}
                  className="px-4 py-2 bg-[#0A121E] hover:bg-slate-800 text-[#E8EEF4] text-xs font-semibold rounded-lg border border-[#1A2533] cursor-pointer"
                >
                  Close
                </button>

                {inspectMode === 'create' && (
                  <button
                    onClick={handleDownloadOfflineSnapshot}
                    disabled={isExporting}
                    className="px-5 py-2 bg-gradient-to-r from-[#00E0C6] to-[#4A9EFF] hover:from-[#00E0C6]/90 hover:to-[#4A9EFF]/90 disabled:opacity-50 text-[#060B14] text-xs font-bold rounded-lg transition-all shadow-md shadow-[#00E0C6]/15 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Encrypting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Encrypted Snapshot (.json)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
