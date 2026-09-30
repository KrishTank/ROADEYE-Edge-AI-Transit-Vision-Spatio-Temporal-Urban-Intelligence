/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Report Issue Screen (200x200px Camera Button, Voice-to-Text)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity008
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { fieldDb } from '../../db/fieldDb';
import { ArrowLeft, Camera, CheckCircle2, Send, Mic, ShieldAlert } from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface ReportIssueScreenProps {
  activeStation: StationId;
  onBack: () => void;
}

type IssueCategory = 'Equipment' | 'Weather' | 'Safety' | 'Infrastructure' | 'Other';
type IssuePriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export const ReportIssueScreen: React.FC<ReportIssueScreenProps> = ({ activeStation, onBack }) => {
  const station = STATIONS_DATA[activeStation];
  const [category, setCategory] = useState<IssueCategory>('Equipment');
  const [priority, setPriority] = useState<IssuePriority>('High');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories: IssueCategory[] = ['Equipment', 'Weather', 'Safety', 'Infrastructure', 'Other'];
  const priorities: IssuePriority[] = ['Low', 'Medium', 'High', 'Emergency'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('PLEASE ENTER OR SPEAK AN ISSUE DESCRIPTION');
      return;
    }

    const priorityNumber = priority === 'Emergency' ? 1 : priority === 'High' ? 2 : priority === 'Medium' ? 3 : 4;

    await fieldDb.field_reports.add({
      id: `rep-${Date.now()}`,
      stationId: activeStation,
      category,
      priority,
      priorityNumber,
      description,
      gpsLocation: `${station.latitude.toFixed(4)}°S, ${station.longitude.toFixed(4)}°E`,
      timestamp: new Date().toISOString(),
      photoAttached: hasPhoto,
      synced: false
    });

    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header with Back */}
      <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
        <button
          onClick={onBack}
          className="antarctic-button h-[64px] px-6 flex items-center gap-3"
        >
          <ArrowLeft className="w-8 h-8 text-[#FFD700]" />
          <span>BACK</span>
        </button>
        <h2 className="antarctic-text-heading text-[#FFFFFF]">REPORT FIELD INCIDENT</h2>
      </div>

      {submitted ? (
        <div className="antarctic-card border-[#00FF00] p-12 text-center space-y-6">
          <CheckCircle2 className="w-24 h-24 text-[#00FF00] mx-auto" />
          <h3 className="antarctic-text-giant text-[#00FF00]">REPORT SAVED LOCALLY</h3>
          <p className="antarctic-text-body text-[#FFFFFF]">
            Saved to IndexedDB Priority Queue (Tier {priority === 'Emergency' ? 1 : 2}). Will auto-sync to Command Post upon RF/VSAT reconnect.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TOP 200x200px CAMERA BUTTON */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`w-[200px] h-[200px] border-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                hasPhoto 
                  ? 'bg-[#00FF00] border-[#00FF00] text-[#000000]' 
                  : 'bg-[#000000] border-[#FFFFFF] text-[#FFFFFF] hover:border-[#FFD700]'
              }`}
            >
              <Camera className="w-20 h-20" />
              <span className="font-bold text-[16pt] uppercase text-center px-2">
                {hasPhoto ? 'PHOTO ATTACHED' : 'TAP FOR CAMERA (200x200)'}
              </span>
            </button>
          </div>

          {/* 5 CATEGORY BUTTONS */}
          <div>
            <label className="antarctic-text-body text-[#FFD700] block mb-3">
              SELECT INCIDENT CATEGORY:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`antarctic-button h-[70px] text-[16pt] ${
                    category === cat ? 'antarctic-button-active' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRIORITY SELECTOR */}
          <div>
            <label className="antarctic-text-body text-[#FFD700] block mb-3">
              INCIDENT PRIORITY LEVEL:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {priorities.map(prio => (
                <button
                  type="button"
                  key={prio}
                  onClick={() => setPriority(prio)}
                  className={`antarctic-button h-[70px] text-[16pt] ${
                    priority === prio 
                      ? prio === 'Emergency' ? 'antarctic-button-danger' : 'antarctic-button-active'
                      : ''
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          {/* GPS LOCATION AUTO-FILLED */}
          <div className="antarctic-card flex items-center justify-between">
            <span className="antarctic-text-body text-[#AAAAAA]">GPS TELEMETRY:</span>
            <span className="antarctic-text-mono text-[#00FFFF]">
              {station.latitude.toFixed(4)}°S, {station.longitude.toFixed(4)}°E (ELEV +{station.latitude ? 128 : 34}m)
            </span>
          </div>

          {/* VOICE-TO-TEXT AND DESCRIPTION */}
          <div className="space-y-3">
            <label className="antarctic-text-body text-[#FFD700] block">
              DESCRIPTION (OR VOICE INPUT):
            </label>
            <VoiceInput
              label="SPEAK ISSUE DETAILS"
              onTranscript={(text) => setDescription(prev => prev ? `${prev} ${text}` : text)}
            />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ENTER OR SPEAK CRITICAL INCIDENT REPORT..."
              className="antarctic-input w-full"
            />
          </div>

          {/* LARGE SUBMIT BUTTON */}
          <button
            type="submit"
            className="antarctic-button w-full h-[90px] bg-[#00FF00] text-[#000000] border-[#00FF00] hover:bg-[#FFFFFF] hover:text-[#000000]"
          >
            <Send className="w-8 h-8 mr-4" />
            <span className="antarctic-text-heading">SUBMIT INCIDENT REPORT</span>
          </button>
        </form>
      )}
    </div>
  );
};
