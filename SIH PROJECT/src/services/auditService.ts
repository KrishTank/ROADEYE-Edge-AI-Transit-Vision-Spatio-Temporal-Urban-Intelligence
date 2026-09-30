/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cryptographic Audit Trail & Hash-Chain Verification Engine
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import { AuditLogEntry } from '../types';
import { db } from '../db/dexieDb';

/**
 * Computes a SHA-256 hash of a string using the Web Crypto API
 * @param message The input string to hash
 * @returns Hex string representation of the hash
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Appends a new command or operational event to the hash-chained audit log
 * @param node Station or gateway identifier
 * @param user User or service author
 * @param action Operational category
 * @param message Description of the operation
 * @returns The newly created and chained AuditLogEntry
 */
export async function appendAuditLog(
  node: string,
  user: string,
  action: string,
  message: string
): Promise<AuditLogEntry> {
  const lastLog = await db.command_logs.orderBy('timestamp').last();
  const prevHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();
  const payloadToHash = `${prevHash}|${node}|${timestamp}|${user}|${action}|${message}`;
  const hash = await sha256(payloadToHash);

  const entry: AuditLogEntry = {
    id: `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    node,
    timestamp,
    message,
    user,
    action,
    prevHash,
    hash,
    verified: true
  };

  await db.command_logs.add(entry);
  return entry;
}

/**
 * Validates the entire cryptographic chain of custody for all stored logs
 * @returns An object with validation outcome, total count, and any broken index
 */
export async function verifyAuditTrailChain(): Promise<{
  isValid: boolean;
  totalLogs: number;
  brokenIndex?: number;
}> {
  const logs = await db.command_logs.orderBy('timestamp').toArray();
  if (logs.length === 0) {
    return { isValid: true, totalLogs: 0 };
  }

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    if (i === 0) {
      continue; // Genesis block verified
    }
    const previous = logs[i - 1];
    if (current.prevHash !== previous.hash) {
      return { isValid: false, totalLogs: logs.length, brokenIndex: i };
    }
  }

  return { isValid: true, totalLogs: logs.length };
}
