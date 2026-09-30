/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 10: Cryptographic Audit Trail (SHA-256 Hash-Chain)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { db } from '../../db/dexieDb';
import { verifyAuditTrailChain, appendAuditLog } from '../../services/auditService';
import { CheckCircle2, Copy, Filter, Hash, Key, Lock, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

export const AuditTrailScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; totalLogs: number } | null>(null);
  const [filterNode, setFilterNode] = useState<string>('ALL');
  const [isVerifying, setIsVerifying] = useState(false);

  const loadLogs = async () => {
    const list = await db.command_logs.orderBy('timestamp').reverse().toArray();
    setLogs(list);
    const res = await verifyAuditTrailChain();
    setVerificationResult(res);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const res = await verifyAuditTrailChain();
      setVerificationResult(res);
      setIsVerifying(false);
    }, 600);
  };

  const handleCreateTestLog = async () => {
    await appendAuditLog(
      'GATEWAY-OPERATOR-CONSOLE',
      'Duty Engineer (Admin)',
      'MANUAL_AUDIT_CHECKPOINT',
      'Routine cryptographic ledger validation ping executed.'
    );
    loadLogs();
  };

  const filtered = logs.filter(l => {
    if (filterNode === 'ALL') return true;
    return l.node.toLowerCase().includes(filterNode.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Cryptographic Command Audit Trail & Hash-Chain
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          SHA-256 tamper-evident operational ledger recording all SCADA setpoint modifications, SOP executions, and manual overrides.
        </p>
      </div>

      {/* VERIFICATION BANNER */}
      <div className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {verificationResult?.isValid ? (
            <ShieldCheck className="w-8 h-8 text-[#3EE07F]" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-[#FF3B47]" />
          )}
          <div>
            <div className="text-sm font-bold text-[#E8EEF4] flex items-center gap-2">
              <span>Cryptographic Chain Integrity:</span>
              <span className={`px-2 py-0.5 text-xs rounded font-mono font-bold ${
                verificationResult?.isValid ? 'bg-[#3EE07F]/20 text-[#3EE07F]' : 'bg-[#FF3B47]/20 text-[#FF3B47]'
              }`}>
                {verificationResult?.isValid ? '100% VERIFIED' : 'CHAIN COMPROMISED'}
              </span>
            </div>
            <div className="text-xs text-[#6B7A8F] mt-0.5">
              Verified <span className="font-mono text-[#E8EEF4] font-bold">{verificationResult?.totalLogs ?? 0}</span> chained blocks using WebCrypto SHA-256
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-3 py-1.5 bg-[#060B14] hover:bg-slate-800 text-xs font-semibold text-[#E8EEF4] rounded border border-[#1A2533] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00E0C6] ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Verify Chain</span>
          </button>

          <button
            onClick={handleCreateTestLog}
            className="px-3 py-1.5 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-xs font-bold text-[#060B14] rounded transition-colors uppercase tracking-wider"
          >
            Log Checkpoint
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center justify-between gap-4 p-3 bg-[#0A121E] rounded-xl border border-[#1A2533]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00E0C6]" />
          <span className="text-xs text-[#6B7A8F] uppercase font-semibold">Node Filter:</span>
          <div className="flex items-center gap-1">
            {['ALL', 'NCPOR-HQ', 'MAITRI', 'BHARATI'].map(node => (
              <button
                key={node}
                onClick={() => setFilterNode(node)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  filterNode === node
                    ? 'bg-[#00E0C6] text-[#060B14]'
                    : 'bg-[#060B14] text-[#6B7A8F] hover:text-[#E8EEF4]'
                }`}
              >
                {node}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#6B7A8F]">
          Showing <span className="font-mono text-[#E8EEF4] font-bold">{filtered.length}</span> blocks
        </div>
      </div>

      {/* AUDIT LOG ENTRIES LIST */}
      <div className="space-y-3">
        {filtered.map((log, index) => (
          <div
            key={log.id}
            className="p-4 bg-[#0A121E] rounded-xl border border-[#1A2533] hover:border-slate-700 transition-colors space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2533] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#00E0C6]">#{log.id}</span>
                <span className="text-[#6B7A8F]">·</span>
                <span className="px-2 py-0.5 rounded bg-[#4A9EFF]/10 text-[#4A9EFF] font-semibold text-[10px]">
                  {log.node}
                </span>
                <span className="text-[#6B7A8F]">·</span>
                <span className="font-semibold text-[#E8EEF4]">{log.action}</span>
              </div>

              <div className="flex items-center gap-2 text-[#6B7A8F]">
                <span>By: <strong className="text-[#E8EEF4]">{log.user}</strong></span>
                <span>·</span>
                <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-[#E8EEF4] font-medium leading-relaxed">
              {log.message}
            </p>

            {/* Cryptographic Hash Pair */}
            <div className="p-2.5 bg-[#060B14] rounded-lg border border-[#1A2533] font-mono text-[10px] space-y-1">
              <div className="flex items-center gap-2 text-[#6B7A8F] truncate">
                <span className="text-[#6B7A8F] w-20 shrink-0 font-bold uppercase">Prev Hash:</span>
                <span className="truncate">{log.prevHash}</span>
              </div>
              <div className="flex items-center gap-2 text-[#00E0C6] truncate font-bold">
                <span className="text-[#6B7A8F] w-20 shrink-0 font-bold uppercase">Block Hash:</span>
                <span className="truncate">{log.hash}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3EE07F] shrink-0 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
